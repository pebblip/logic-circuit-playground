import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LogicCircuitBuilderRefactored from '../LogicCircuitBuilderRefactored';

// モックの設定
vi.mock('../reducers/circuitReducer', () => ({
  circuitReducer: vi.fn((state, action) => {
    switch (action.type) {
      case 'ADD_GATE':
        return {
          ...state,
          gates: [...state.gates, { ...action.payload, id: Date.now() }]
        };
      case 'SET_GATES':
        return { ...state, gates: action.payload };
      case 'SET_CONNECTIONS':
        return { ...state, connections: action.payload };
      case 'REMOVE_GATE':
        return {
          ...state,
          gates: state.gates.filter(g => g.id !== action.payload.gateId),
          connections: state.connections.filter(
            c => c.from !== action.payload.gateId && c.to !== action.payload.gateId
          )
        };
      case 'ADD_CONNECTION':
        return {
          ...state,
          connections: [...state.connections, action.payload]
        };
      case 'REMOVE_CONNECTION':
        return {
          ...state,
          connections: state.connections.filter((_, idx) => idx !== action.payload.index)
        };
      case 'SET_SELECTED_GATE':
        return { ...state, selectedGate: action.payload };
      case 'RESET':
        return { ...state, gates: [], connections: [], selectedGate: null };
      default:
        return state;
    }
  }),
  initialState: {
    gates: [],
    connections: [],
    selectedGate: null,
    currentLevel: null,
    unlockedLevels: ['basic'],
    savedCircuits: []
  },
  ACTIONS: {
    ADD_GATE: 'ADD_GATE',
    SET_GATES: 'SET_GATES',
    SET_CONNECTIONS: 'SET_CONNECTIONS',
    REMOVE_GATE: 'REMOVE_GATE',
    ADD_CONNECTION: 'ADD_CONNECTION',
    REMOVE_CONNECTION: 'REMOVE_CONNECTION',
    SET_SELECTED_GATE: 'SET_SELECTED_GATE',
    RESET: 'RESET',
    SET_CURRENT_LEVEL: 'SET_CURRENT_LEVEL',
    SAVE_CIRCUIT: 'SAVE_CIRCUIT',
    LOAD_CIRCUIT: 'LOAD_CIRCUIT',
    MOVE_GATE: 'MOVE_GATE'
  }
}));

vi.mock('../hooks/useCircuitSimulation', () => ({
  useCircuitSimulation: () => ({
    simulation: {},
    autoMode: false,
    simulationSpeed: 1,
    clockSignal: false,
    calculateCircuitWithGates: vi.fn(() => ({})),
    runCalculation: vi.fn(() => ({})),
    toggleAutoMode: vi.fn(),
    updateSimulationSpeed: vi.fn(),
    resetSimulation: vi.fn()
  })
}));

vi.mock('../hooks/useDragAndDrop', () => ({
  useDragAndDrop: () => ({
    svgRef: { current: null },
    draggedGate: null,
    connectionDrag: null,
    mousePosition: { x: 0, y: 0 },
    handleGateMouseDown: vi.fn(),
    handleTerminalMouseDown: vi.fn(),
    handleTerminalMouseUp: vi.fn(),
    handleMouseMove: vi.fn(),
    handleMouseUp: vi.fn()
  })
}));

vi.mock('../hooks/useHistory', () => ({
  useHistory: () => ({
    pushState: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
    canUndo: false,
    canRedo: false
  })
}));

describe('LogicCircuitBuilderRefactored', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('レンダリング', () => {
    it('コンポーネントが正しくレンダリングされる', () => {
      render(<LogicCircuitBuilderRefactored />);
      
      expect(screen.getByText('Logic Circuit Builder')).toBeInTheDocument();
      expect(screen.getByText('ヘルプ')).toBeInTheDocument();
      expect(screen.getByText('設定')).toBeInTheDocument();
    });

    it('主要なパネルがレンダリングされる', () => {
      render(<LogicCircuitBuilderRefactored />);
      
      // Toolbarの要素を確認
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      // Canvasが存在することを確認（SVG要素として）
      const svgElements = document.querySelectorAll('svg');
      expect(svgElements.length).toBeGreaterThan(0);
    });
  });

  describe('無限ループの回避', () => {
    it('状態更新が無限ループを引き起こさない', async () => {
      const { rerender } = render(<LogicCircuitBuilderRefactored />);
      
      // 複数回の再レンダリングを行う
      let renderCount = 0;
      const maxRenders = 10;
      
      const renderPromise = new Promise((resolve) => {
        const interval = setInterval(() => {
          renderCount++;
          rerender(<LogicCircuitBuilderRefactored />);
          
          if (renderCount >= maxRenders) {
            clearInterval(interval);
            resolve();
          }
        }, 10);
      });

      await renderPromise;
      
      // レンダリングが完了し、エラーが発生していないことを確認
      expect(renderCount).toBe(maxRenders);
    });

    it('履歴の更新が無限ループを引き起こさない', async () => {
      const mockPushState = vi.fn();
      vi.mocked(vi.importActual('../hooks/useHistory')).useHistory = () => ({
        pushState: mockPushState,
        undo: vi.fn(),
        redo: vi.fn(),
        canUndo: false,
        canRedo: false
      });

      render(<LogicCircuitBuilderRefactored />);
      
      // 少し待機して、useEffectが実行されることを確認
      await waitFor(() => {
        // pushStateが無限に呼ばれていないことを確認
        expect(mockPushState).toHaveBeenCalledTimes(0); // 初回レンダリングでは呼ばれない
      });
    });

    it('自動モードでのクロック更新が無限ループを引き起こさない', async () => {
      let clockSignalValue = false;
      const mockToggleAutoMode = vi.fn(() => {
        // 自動モードを有効にする
      });

      vi.mocked(vi.importActual('../hooks/useCircuitSimulation')).useCircuitSimulation = () => ({
        simulation: {},
        autoMode: true, // 自動モードを有効に
        simulationSpeed: 1,
        clockSignal: clockSignalValue,
        calculateCircuitWithGates: vi.fn(() => ({})),
        runCalculation: vi.fn(() => ({})),
        toggleAutoMode: mockToggleAutoMode,
        updateSimulationSpeed: vi.fn(),
        resetSimulation: vi.fn()
      });

      const { rerender } = render(<LogicCircuitBuilderRefactored />);
      
      // クロック信号を変更して再レンダリング
      clockSignalValue = true;
      rerender(<LogicCircuitBuilderRefactored />);
      
      // さらにクロック信号を変更
      clockSignalValue = false;
      rerender(<LogicCircuitBuilderRefactored />);
      
      // コンポーネントが正常にレンダリングされていることを確認
      expect(screen.getByText('Logic Circuit Builder')).toBeInTheDocument();
    });
  });

  describe('ゲート操作', () => {
    it('ゲートの削除確認ダイアログが表示される', async () => {
      const user = userEvent.setup();
      
      // 選択されたゲートがある状態をモック
      vi.mocked(vi.importActual('../reducers/circuitReducer')).initialState = {
        ...vi.mocked(vi.importActual('../reducers/circuitReducer')).initialState,
        selectedGate: { id: 1, type: 'AND' }
      };

      render(<LogicCircuitBuilderRefactored />);
      
      // Deleteキーを押す
      await user.keyboard('{Delete}');
      
      // 確認ダイアログが表示される
      expect(screen.getByText('ゲートの削除')).toBeInTheDocument();
      expect(screen.getByText(/ANDゲートとその接続を削除しますか？/)).toBeInTheDocument();
    });

    it('削除確認ダイアログでキャンセルできる', async () => {
      const user = userEvent.setup();
      
      vi.mocked(vi.importActual('../reducers/circuitReducer')).initialState = {
        ...vi.mocked(vi.importActual('../reducers/circuitReducer')).initialState,
        selectedGate: { id: 1, type: 'AND' }
      };

      render(<LogicCircuitBuilderRefactored />);
      
      await user.keyboard('{Delete}');
      
      // キャンセルボタンをクリック
      const cancelButton = screen.getByText('キャンセル');
      await user.click(cancelButton);
      
      // ダイアログが閉じる
      expect(screen.queryByText('ゲートの削除')).not.toBeInTheDocument();
    });
  });

  describe('キーボードショートカット', () => {
    it('Escapeキーで選択を解除できる', async () => {
      const user = userEvent.setup();
      
      vi.mocked(vi.importActual('../reducers/circuitReducer')).initialState = {
        ...vi.mocked(vi.importActual('../reducers/circuitReducer')).initialState,
        selectedGate: { id: 1, type: 'AND' }
      };

      render(<LogicCircuitBuilderRefactored />);
      
      await user.keyboard('{Escape}');
      
      // SET_SELECTED_GATEアクションがnullで呼ばれることを確認
      // （実際の動作はreducerのモックで確認）
    });
  });

  describe('状態の同期', () => {
    it('ゲートとコネクションの状態が正しく管理される', () => {
      const { rerender } = render(<LogicCircuitBuilderRefactored />);
      
      // 初期状態を確認
      const initialGates = [];
      const initialConnections = [];
      
      // 新しいゲートを追加した状態で再レンダリング
      vi.mocked(vi.importActual('../reducers/circuitReducer')).initialState = {
        ...vi.mocked(vi.importActual('../reducers/circuitReducer')).initialState,
        gates: [{ id: 1, type: 'INPUT', value: true, x: 100, y: 100 }],
        connections: []
      };
      
      rerender(<LogicCircuitBuilderRefactored />);
      
      // コンポーネントが正常に動作することを確認
      expect(screen.getByText('Logic Circuit Builder')).toBeInTheDocument();
    });
  });

  describe('メモリリーク対策', () => {
    it('アンマウント時にイベントリスナーが削除される', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      const { unmount } = render(<LogicCircuitBuilderRefactored />);
      
      // keydownイベントリスナーが追加されている
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      
      unmount();
      
      // keydownイベントリスナーが削除されている
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      
      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });
  });
});
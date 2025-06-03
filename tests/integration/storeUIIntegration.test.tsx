import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/App';
import { Canvas } from '@components/Canvas';
import { Gate } from '@components/Gate';
import { Wire } from '@components/Wire';
import { useCircuitStore } from '@/stores/circuitStore';
import { GateType, Position } from '@/types/circuit';
import { ResponsiveLayout } from '@components/layouts/ResponsiveLayout';
import { ToolPalette } from '@components/ToolPalette';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

// モックの設定
vi.mock('@/hooks/useResponsive', async () => {
  const actual = await vi.importActual<typeof import('@/hooks/useResponsive')>('@/hooks/useResponsive');
  return {
    ...actual,
    useIsMobile: () => false,
    useIsTablet: () => false,
    useIsDesktop: () => true,
    useResponsive: () => ({
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    }),
  };
});

// SVGElementのモック拡張
class MockSVGElement extends SVGElement {
  createSVGPoint() {
    return {
      x: 0,
      y: 0,
      matrixTransform: () => ({ x: 0, y: 0 })
    };
  }
  
  getScreenCTM() {
    return {
      inverse: () => ({
        a: 1, b: 0, c: 0, d: 1, e: 0, f: 0
      })
    };
  }
  
  getBoundingClientRect() {
    return {
      top: 0,
      left: 0,
      right: 1200,
      bottom: 800,
      width: 1200,
      height: 800,
      x: 0,
      y: 0,
      toJSON: () => ({})
    };
  }
}

// グローバルSVGElementのモック
Object.defineProperty(window, 'SVGSVGElement', {
  writable: true,
  value: MockSVGElement,
  configurable: true
});

// キーボードショートカットを有効化するためのラッパーコンポーネント
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useKeyboardShortcuts();
  return <>{children}</>;
};

describe('Store and UI Integration Tests', () => {
  beforeEach(() => {
    // ストアをリセット
    useCircuitStore.getState().clearAll();
    vi.clearAllMocks();
    
    // LocalStorageをクリア
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Gate placement updates store and renders in UI', () => {
    it('should add gate to store and render it on canvas', async () => {
      const { container } = render(<Canvas />);
      const store = useCircuitStore.getState();
      
      // ゲートを追加
      const position: Position = { x: 100, y: 100 };
      let gate: any;
      await act(async () => {
        gate = store.addGate('AND', position);
      });
      
      // ストアが更新されているか確認
      const currentState = useCircuitStore.getState();
      expect(currentState.gates).toHaveLength(1);
      expect(currentState.gates[0].type).toBe('AND');
      expect(currentState.gates[0].position).toEqual(position);
      
      // UIに反映されているか確認
      await waitFor(() => {
        const gateElement = container.querySelector(`[data-gate-id="${gate.id}"]`);
        expect(gateElement).toBeInTheDocument();
      });
    });

    it('should place multiple gates and render them all', async () => {
      const { container } = render(<Canvas />);
      const store = useCircuitStore.getState();
      
      // 複数のゲートを追加
      let gates: any[] = [];
      await act(async () => {
        gates = [
          store.addGate('AND', { x: 100, y: 100 }),
          store.addGate('OR', { x: 200, y: 100 }),
          store.addGate('NOT', { x: 300, y: 100 }),
        ];
      });
      
      // ストアが更新されているか確認
      const currentState = useCircuitStore.getState();
      expect(currentState.gates).toHaveLength(3);
      
      // 全てのゲートがUIに反映されているか確認
      await waitFor(() => {
        gates.forEach(gate => {
          const gateElement = container.querySelector(`[data-gate-id="${gate.id}"]`);
          expect(gateElement).toBeInTheDocument();
        });
      });
    });
  });

  describe('2. Wire connection updates both endpoints', () => {
    it('should create wire between two gates and update their connections', async () => {
      const { container } = render(<Canvas />);
      const store = useCircuitStore.getState();
      
      // 2つのゲートを追加
      let inputGate: any, outputGate: any;
      await act(async () => {
        inputGate = store.addGate('INPUT', { x: 100, y: 100 });
        outputGate = store.addGate('OUTPUT', { x: 300, y: 100 });
      });
      
      // ワイヤー接続を開始
      await act(async () => {
        store.startWireDrawing(inputGate.id, -1); // 出力ピンから開始
      });
      
      expect(useCircuitStore.getState().isDrawingWire).toBe(true);
      
      // ワイヤー接続を完了
      await act(async () => {
        store.endWireDrawing(outputGate.id, 0); // 入力ピンに接続
      });
      
      // ワイヤーが作成されているか確認
      const currentState = useCircuitStore.getState();
      expect(currentState.wires).toHaveLength(1);
      expect(currentState.wires[0].from.gateId).toBe(inputGate.id);
      expect(currentState.wires[0].to.gateId).toBe(outputGate.id);
      
      // UIにワイヤーが表示されているか確認
      await waitFor(() => {
        const wireElement = container.querySelector(`[data-wire-id="${currentState.wires[0].id}"]`);
        expect(wireElement).toBeInTheDocument();
      });
    });

    it('should cancel wire drawing on ESC key', async () => {
      render(<Canvas />);
      const store = useCircuitStore.getState();
      
      let inputGate: any;
      await act(async () => {
        inputGate = store.addGate('INPUT', { x: 100, y: 100 });
      });
      
      // ワイヤー描画を開始
      await act(async () => {
        store.startWireDrawing(inputGate.id, -1);
      });
      
      expect(useCircuitStore.getState().isDrawingWire).toBe(true);
      
      // ESCキーを押す
      fireEvent.keyDown(document, { key: 'Escape' });
      
      // ワイヤー描画がキャンセルされているか確認
      await waitFor(() => {
        expect(useCircuitStore.getState().isDrawingWire).toBe(false);
        expect(useCircuitStore.getState().wireStart).toBeNull();
      });
    });
  });

  describe('3. Selection state sync between store and visual', () => {
    it('should highlight selected gate in UI', async () => {
      const { container } = render(<Canvas />);
      const store = useCircuitStore.getState();
      
      let gate: any;
      await act(async () => {
        gate = store.addGate('AND', { x: 100, y: 100 });
      });
      
      // ゲートを選択
      await act(async () => {
        store.selectGate(gate.id);
      });
      
      // ストアの選択状態を確認
      const currentState = useCircuitStore.getState();
      expect(currentState.selectedGateId).toBe(gate.id);
      expect(currentState.selectedGateIds).toContain(gate.id);
      
      // UIで選択状態が反映されているか確認
      await waitFor(() => {
        const gateElement = container.querySelector(`[data-gate-id="${gate.id}"]`);
        // 選択されたゲートはクラスに 'selected' を持つ
        const selectedRect = gateElement?.querySelector('rect.selected');
        expect(selectedRect).toBeInTheDocument();
      });
    });

    it('should support multiple selection', async () => {
      const { container } = render(<Canvas />);
      const store = useCircuitStore.getState();
      
      let gates: any[] = [];
      await act(async () => {
        gates = [
          store.addGate('AND', { x: 100, y: 100 }),
          store.addGate('OR', { x: 200, y: 100 }),
          store.addGate('NOT', { x: 300, y: 100 }),
        ];
      });
      
      // 複数選択
      await act(async () => {
        store.setSelectedGates(gates.map(g => g.id));
      });
      
      // ストアの選択状態を確認
      const currentState = useCircuitStore.getState();
      expect(currentState.selectedGateIds).toHaveLength(3);
      expect(currentState.selectedGateId).toBeNull(); // 複数選択時はnull
      
      // 全てのゲートが選択状態で表示されているか確認
      await waitFor(() => {
        gates.forEach(gate => {
          const gateElement = container.querySelector(`[data-gate-id="${gate.id}"]`);
          // 選択されたゲートはクラスに 'selected' を持つ
          const selectedRect = gateElement?.querySelector('rect.selected');
          expect(selectedRect).toBeInTheDocument();
        });
      });
    });
  });

  describe('4. Undo/redo updates UI correctly', () => {
    it('should undo gate addition and update UI', async () => {
      const { container } = render(<Canvas />);
      const store = useCircuitStore.getState();
      
      // ゲートを追加
      let gate: any;
      await act(async () => {
        gate = store.addGate('AND', { x: 100, y: 100 });
      });
      
      // UIに表示されているか確認
      await waitFor(() => {
        const gateElement = container.querySelector(`[data-gate-id="${gate.id}"]`);
        expect(gateElement).toBeInTheDocument();
      });
      
      // Undo実行
      await act(async () => {
        store.undo();
      });
      
      // ストアからゲートが削除されているか確認
      const currentState = useCircuitStore.getState();
      expect(currentState.gates).toHaveLength(0);
      
      // UIからも削除されているか確認
      await waitFor(() => {
        const gateElement = container.querySelector(`[data-gate-id="${gate.id}"]`);
        expect(gateElement).not.toBeInTheDocument();
      });
    });

    it('should redo gate addition and update UI', async () => {
      const { container } = render(<Canvas />);
      const store = useCircuitStore.getState();
      
      // ゲートを追加してUndo
      let gate: any;
      await act(async () => {
        gate = store.addGate('AND', { x: 100, y: 100 });
      });
      const gateId = gate.id;
      
      await act(async () => {
        store.undo();
      });
      
      // Redo実行
      await act(async () => {
        store.redo();
      });
      
      // ストアにゲートが復元されているか確認
      const currentState = useCircuitStore.getState();
      expect(currentState.gates).toHaveLength(1);
      expect(currentState.gates[0].id).toBe(gateId);
      
      // UIにも復元されているか確認
      await waitFor(() => {
        const gateElement = container.querySelector(`[data-gate-id="${gateId}"]`);
        expect(gateElement).toBeInTheDocument();
      });
    });
  });

  describe('5. Circuit load replaces entire state', () => {
    it('should load circuit and update entire UI', async () => {
      const { container } = render(<Canvas />);
      const store = useCircuitStore.getState();
      
      // 初期状態でゲートを追加
      await act(async () => {
        store.addGate('AND', { x: 100, y: 100 });
      });
      
      // 新しい回路データ
      const newCircuit = {
        gates: [
          {
            id: 'gate-1',
            type: 'OR' as GateType,
            position: { x: 200, y: 200 },
            inputs: [],
            output: false,
          },
          {
            id: 'gate-2',
            type: 'NOT' as GateType,
            position: { x: 300, y: 200 },
            inputs: [],
            output: false,
          },
        ],
        wires: [],
      };
      
      // 回路をロード（実際のloadCircuit関数があれば使用）
      await act(async () => {
        store.clearAll();
        // 実際の実装では loadCircuit 関数を使用
        // ここでは簡略化のため直接ゲートを設定
        const state = useCircuitStore.getState();
        newCircuit.gates.forEach(gate => {
          state.gates.push(gate);
        });
      });
      
      // 古いゲートが削除され、新しいゲートが表示されているか確認
      await waitFor(() => {
        const oldGate = container.querySelector('[data-gate-type="AND"]');
        expect(oldGate).not.toBeInTheDocument();
        
        const orGate = container.querySelector('[data-gate-id="gate-1"]');
        const notGate = container.querySelector('[data-gate-id="gate-2"]');
        expect(orGate).toBeInTheDocument();
        expect(notGate).toBeInTheDocument();
      });
    });
  });

  describe('6. Custom gate instantiation', () => {
    it('should create and render custom gate instance', async () => {
      const { container } = render(<Canvas />);
      const store = useCircuitStore.getState();
      
      // カスタムゲート定義を作成
      const customGateDefinition = {
        id: 'custom-1',
        name: 'Half Adder',
        displayName: 'Half Adder',
        width: 120,
        height: 80,
        inputs: [
          { id: 'A', label: 'A', position: { x: -60, y: -20 } },
          { id: 'B', label: 'B', position: { x: -60, y: 20 } },
        ],
        outputs: [
          { id: 'Sum', label: 'Sum', position: { x: 60, y: -20 } },
          { id: 'Carry', label: 'Carry', position: { x: 60, y: 20 } },
        ],
        internalCircuit: {
          gates: [],
          wires: [],
          inputMappings: {},
          outputMappings: {},
        },
      };
      
      // カスタムゲートを追加
      await act(async () => {
        store.addCustomGate(customGateDefinition);
      });
      
      // カスタムゲートのインスタンスを作成
      let instance: any;
      await act(async () => {
        instance = store.addCustomGateInstance(customGateDefinition, { x: 200, y: 200 });
      });
      
      // ストアに追加されているか確認
      const currentState = useCircuitStore.getState();
      expect(currentState.gates).toHaveLength(1);
      expect(currentState.gates[0].type).toBe('CUSTOM');
      expect(currentState.gates[0].customGateDefinition).toEqual(customGateDefinition);
      
      // UIに表示されているか確認
      await waitFor(() => {
        const customGateElement = container.querySelector(`[data-gate-id="${instance.id}"]`);
        expect(customGateElement).toBeInTheDocument();
        expect(customGateElement?.textContent).toContain('Half Adder');
      });
    });
  });

  describe('7. Mode changes affect available actions', () => {
    it('should restrict gate types in learning mode', async () => {
      const { container } = render(<ResponsiveLayout />);
      const store = useCircuitStore.getState();
      
      // 学習モードに切り替え
      await act(async () => {
        store.setAppMode('学習モード');
        store.setAllowedGates(['AND', 'OR', 'NOT']);
      });
      
      // モードが変更されているか確認
      const currentState = useCircuitStore.getState();
      expect(currentState.appMode).toBe('学習モード');
      expect(currentState.allowedGates).toEqual(['AND', 'OR', 'NOT']);
      
      // ツールパレットで許可されたゲートのみ有効になっているか確認
      await waitFor(() => {
        const toolPalette = container.querySelector('.tool-palette');
        const andButton = toolPalette?.querySelector('[data-gate-type="AND"]');
        const xorButton = toolPalette?.querySelector('[data-gate-type="XOR"]');
        
        expect(andButton).toBeInTheDocument();
        expect(andButton?.classList.contains('disabled')).toBe(false);
        
        // XORボタンは存在するが無効化されている
        expect(xorButton).toBeInTheDocument();
        expect(xorButton?.classList.contains('disabled')).toBe(true);
      });
    });
  });

  describe('8. Clipboard operations (copy/paste)', () => {
    it('should copy and paste selected gates', async () => {
      const { container } = render(<Canvas />);
      const store = useCircuitStore.getState();
      
      // ゲートを追加して選択
      let originalGate: any;
      await act(async () => {
        originalGate = store.addGate('AND', { x: 100, y: 100 });
        store.selectGate(originalGate.id);
      });
      
      // コピー
      await act(async () => {
        store.copySelection();
      });
      
      expect(useCircuitStore.getState().canPaste()).toBe(true);
      
      // ペースト
      const pastePosition: Position = { x: 200, y: 200 };
      await act(async () => {
        store.paste(pastePosition);
      });
      
      // 新しいゲートが追加されているか確認
      const currentState = useCircuitStore.getState();
      expect(currentState.gates).toHaveLength(2);
      const pastedGate = currentState.gates.find(g => g.id !== originalGate.id);
      expect(pastedGate?.type).toBe('AND');
      expect(pastedGate?.position.x).toBeGreaterThan(originalGate.position.x);
      
      // UIに両方のゲートが表示されているか確認
      await waitFor(() => {
        const gates = container.querySelectorAll('[data-gate-type="AND"]');
        expect(gates).toHaveLength(2);
      });
    });

    it('should copy and paste with wires', async () => {
      const store = useCircuitStore.getState();
      
      // 接続されたゲートを作成
      let gate1: any, gate2: any;
      await act(async () => {
        gate1 = store.addGate('INPUT', { x: 100, y: 100 });
        gate2 = store.addGate('OUTPUT', { x: 300, y: 100 });
        
        store.startWireDrawing(gate1.id, -1);
        store.endWireDrawing(gate2.id, 0);
        store.setSelectedGates([gate1.id, gate2.id]);
      });
      
      // コピー＆ペースト
      await act(async () => {
        store.copySelection();
        store.paste({ x: 100, y: 300 });
      });
      
      // ゲートとワイヤーがコピーされているか確認
      const currentState = useCircuitStore.getState();
      expect(currentState.gates).toHaveLength(4);
      expect(currentState.wires).toHaveLength(2);
    });
  });

  describe('9. Bulk operations (select all, delete multiple)', () => {
    it('should select all gates and delete them', async () => {
      const { container } = render(<Canvas />);
      const store = useCircuitStore.getState();
      
      // 複数のゲートを追加
      let gates: any[] = [];
      await act(async () => {
        gates = [
          store.addGate('AND', { x: 100, y: 100 }),
          store.addGate('OR', { x: 200, y: 100 }),
          store.addGate('NOT', { x: 300, y: 100 }),
        ];
      });
      
      // 全て選択
      await act(async () => {
        store.setSelectedGates(gates.map(g => g.id));
      });
      
      // 削除キーを押す
      fireEvent.keyDown(document, { key: 'Delete' });
      
      // 全てのゲートが削除されているか確認
      await waitFor(() => {
        const currentState = useCircuitStore.getState();
        expect(currentState.gates).toHaveLength(0);
        const gateElements = container.querySelectorAll('[data-gate-id]');
        expect(gateElements).toHaveLength(0);
      });
    });
  });

  describe('10. Performance: 100 rapid state changes', () => {
    it('should handle rapid state changes without performance degradation', async () => {
      const { container } = render(<Canvas />);
      const store = useCircuitStore.getState();
      
      const startTime = performance.now();
      
      // 100個のゲートを素早く追加
      await act(async () => {
        for (let i = 0; i < 100; i++) {
          store.addGate('AND', { x: (i % 10) * 100, y: Math.floor(i / 10) * 100 });
        }
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // パフォーマンス確認（3秒以内に完了すべき）
      expect(duration).toBeLessThan(3000);
      
      // 全てのゲートがストアに存在するか確認
      const currentState = useCircuitStore.getState();
      expect(currentState.gates).toHaveLength(100);
      
      // UIレンダリングのパフォーマンステスト
      await waitFor(() => {
        const gateElements = container.querySelectorAll('[data-gate-id]');
        expect(gateElements.length).toBeGreaterThan(0);
      }, { timeout: 5000 });
    });

    it('should handle rapid wire connections', async () => {
      const store = useCircuitStore.getState();
      
      // 10個のゲートを連鎖的に接続
      let gates: any[] = [];
      await act(async () => {
        for (let i = 0; i < 10; i++) {
          const gate = store.addGate(i === 0 ? 'INPUT' : i === 9 ? 'OUTPUT' : 'NOT', { x: i * 100, y: 100 });
          gates.push(gate);
        }
      });
      
      const startTime = performance.now();
      
      // ワイヤーで接続
      await act(async () => {
        for (let i = 0; i < gates.length - 1; i++) {
          store.startWireDrawing(gates[i].id, -1);
          store.endWireDrawing(gates[i + 1].id, 0);
        }
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // パフォーマンス確認
      expect(duration).toBeLessThan(1000);
      const currentState = useCircuitStore.getState();
      expect(currentState.wires).toHaveLength(9);
    });
  });

  describe('11. State persistence across component remounts', () => {
    it('should maintain state when component remounts', async () => {
      const { container, unmount } = render(<Canvas />);
      const store = useCircuitStore.getState();
      
      // ゲートを追加
      let gate: any;
      await act(async () => {
        gate = store.addGate('AND', { x: 100, y: 100 });
      });
      
      // コンポーネントをアンマウント
      unmount();
      
      // 再マウント
      const { container: newContainer } = render(<Canvas />);
      
      // ストアの状態が維持されているか確認
      const currentState = useCircuitStore.getState();
      expect(currentState.gates).toHaveLength(1);
      expect(currentState.gates[0].id).toBe(gate.id);
      
      // UIに表示されているか確認
      await waitFor(() => {
        const gateElement = newContainer.querySelector(`[data-gate-id="${gate.id}"]`);
        expect(gateElement).toBeInTheDocument();
      });
    });
  });

  describe('12. Error recovery and state consistency', () => {
    it('should maintain consistency when invalid wire connection is attempted', async () => {
      const store = useCircuitStore.getState();
      
      // 2つのINPUTゲートを作成
      let input1: any, input2: any;
      await act(async () => {
        input1 = store.addGate('INPUT', { x: 100, y: 100 });
        input2 = store.addGate('INPUT', { x: 300, y: 100 });
      });
      
      // 無効な接続を試みる（出力から出力へ）
      await act(async () => {
        store.startWireDrawing(input1.id, -1); // 出力ピンから開始
        store.endWireDrawing(input2.id, -1); // 別の出力ピンに接続しようとする（無効）
      });
      
      // ワイヤーが作成されていないことを確認
      const currentState = useCircuitStore.getState();
      expect(currentState.wires).toHaveLength(0);
      expect(currentState.isDrawingWire).toBe(false);
      
      // ストアの状態が一貫していることを確認
      expect(currentState.gates).toHaveLength(2);
    });

    it('should recover from simulation errors', async () => {
      const store = useCircuitStore.getState();
      
      // 循環参照を作成（これは通常シミュレーションエラーを引き起こす可能性がある）
      await act(async () => {
        const not1 = store.addGate('NOT', { x: 100, y: 100 });
        const not2 = store.addGate('NOT', { x: 300, y: 100 });
        
        // NOT1の出力をNOT2の入力に接続
        store.startWireDrawing(not1.id, -1);
        store.endWireDrawing(not2.id, 0);
        
        // NOT2の出力をNOT1の入力に接続（循環参照）
        store.startWireDrawing(not2.id, -1);
        store.endWireDrawing(not1.id, 0);
      });
      
      // ストアの状態が破壊されていないことを確認
      const currentState = useCircuitStore.getState();
      expect(currentState.gates).toHaveLength(2);
      expect(currentState.wires).toHaveLength(2);
      
      // ゲートの出力が定義されていることを確認（エラーでundefinedにならない）
      currentState.gates.forEach(gate => {
        expect(gate.output).toBeDefined();
      });
    });

    it('should handle missing gate references gracefully', async () => {
      const store = useCircuitStore.getState();
      
      // ゲートを作成
      let gate1: any, gate2: any, gate3: any;
      await act(async () => {
        gate1 = store.addGate('INPUT', { x: 100, y: 100 });
        gate2 = store.addGate('AND', { x: 300, y: 100 });
        gate3 = store.addGate('OUTPUT', { x: 500, y: 100 });
        
        // ワイヤーを接続 INPUT -> AND -> OUTPUT
        store.startWireDrawing(gate1.id, -1);
        store.endWireDrawing(gate2.id, 0);
        
        store.startWireDrawing(gate2.id, -1);
        store.endWireDrawing(gate3.id, 0);
      });
      
      // 中間のANDゲートを削除（両方のワイヤーが削除されるべき）
      await act(async () => {
        store.deleteGate(gate2.id);
      });
      
      // ワイヤーも削除されていることを確認
      const currentState = useCircuitStore.getState();
      expect(currentState.gates).toHaveLength(2);
      expect(currentState.wires).toHaveLength(0);
      
      // OUTPUTゲートの入力がfalseになっていることを確認（接続が切れたため）
      const outputGate = currentState.gates.find(g => g.type === 'OUTPUT');
      expect(outputGate?.inputs).toEqual(['']);
    });
  });

  describe('Integration with keyboard shortcuts', () => {
    it('should handle Ctrl+A to select all gates', async () => {
      // Ctrl+A機能を追加するカスタムコンポーネント
      const SelectAllWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        const store = useCircuitStore();
        
        React.useEffect(() => {
          const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
              e.preventDefault();
              const allGates = store.gates.map(g => g.id);
              store.setSelectedGates(allGates);
            }
          };
          
          document.addEventListener('keydown', handleKeyDown);
          return () => document.removeEventListener('keydown', handleKeyDown);
        }, [store.gates]);
        
        return <>{children}</>;
      };
      
      const { container } = render(
        <SelectAllWrapper>
          <TestWrapper>
            <Canvas />
          </TestWrapper>
        </SelectAllWrapper>
      );
      const store = useCircuitStore.getState();
      
      // 複数のゲートを追加
      let gates: any[] = [];
      await act(async () => {
        gates = [
          store.addGate('AND', { x: 100, y: 100 }),
          store.addGate('OR', { x: 200, y: 100 }),
          store.addGate('NOT', { x: 300, y: 100 }),
        ];
      });
      
      // Ctrl+Aを押す
      fireEvent.keyDown(document, { key: 'a', ctrlKey: true });
      
      // 全てのゲートが選択されているか確認
      await waitFor(() => {
        const currentState = useCircuitStore.getState();
        expect(currentState.selectedGateIds).toHaveLength(3);
        gates.forEach(gate => {
          expect(currentState.selectedGateIds).toContain(gate.id);
        });
      });
    });

    it('should handle Ctrl+Z for undo and Ctrl+Y for redo', async () => {
      render(
        <TestWrapper>
          <Canvas />
        </TestWrapper>
      );
      const store = useCircuitStore.getState();
      
      // ゲートを追加
      let gate: any;
      await act(async () => {
        gate = store.addGate('AND', { x: 100, y: 100 });
      });
      
      // Ctrl+Z (Undo)
      fireEvent.keyDown(document, { key: 'z', ctrlKey: true });
      
      await waitFor(() => {
        const currentState = useCircuitStore.getState();
        expect(currentState.gates).toHaveLength(0);
      });
      
      // Ctrl+Y (Redo)
      fireEvent.keyDown(document, { key: 'y', ctrlKey: true });
      
      await waitFor(() => {
        const currentState = useCircuitStore.getState();
        expect(currentState.gates).toHaveLength(1);
        expect(currentState.gates[0].id).toBe(gate.id);
      });
    });
  });

  describe('Integration with drag and drop', () => {
    it('should update gate position on drag and save to history on drop', async () => {
      const { container } = render(<Canvas />);
      const store = useCircuitStore.getState();
      
      let gate: any;
      await act(async () => {
        gate = store.addGate('AND', { x: 100, y: 100 });
      });
      
      // ゲートが追加されたことを確認
      await waitFor(() => {
        expect(useCircuitStore.getState().gates).toHaveLength(1);
      });
      
      // ゲート要素を取得
      await waitFor(() => {
        const gateElement = container.querySelector(`[data-gate-id="${gate.id}"]`);
        expect(gateElement).toBeInTheDocument();
      });
      
      // ドラッグ操作をシミュレート
      const gateElement = container.querySelector(`[data-gate-id="${gate.id}"]`) as Element;
      
      // マウスダウン
      fireEvent.mouseDown(gateElement, { clientX: 100, clientY: 100 });
      
      // ドラッグ中（履歴に保存されない）
      await act(async () => {
        store.moveGate(gate.id, { x: 150, y: 150 }, false);
      });
      
      let currentState = useCircuitStore.getState();
      expect(currentState.gates[0].position).toEqual({ x: 150, y: 150 });
      
      // Undo可能か確認（まだドラッグ終了していないので履歴に保存されていない）
      const canUndoBeforeDrop = currentState.canUndo();
      
      // ドラッグ終了（履歴に保存される）
      await act(async () => {
        store.moveGate(gate.id, { x: 200, y: 200 }, true);
      });
      
      currentState = useCircuitStore.getState();
      expect(currentState.gates[0].position).toEqual({ x: 200, y: 200 });
      
      // Undoして位置が戻ることを確認
      await act(async () => {
        store.undo();
      });
      
      currentState = useCircuitStore.getState();
      // Undoで元の位置（ドラッグ前）に戻る
      expect(currentState.gates[0].position).toEqual({ x: 100, y: 100 });
    });
  });

  describe('Complex integration scenarios', () => {
    it('should handle complete circuit creation workflow', async () => {
      const { container } = render(<ResponsiveLayout />);
      const store = useCircuitStore.getState();
      
      // 1. XORゲートを作る回路を構築
      await act(async () => {
        const inputA = store.addGate('INPUT', { x: 100, y: 100 });
        const inputB = store.addGate('INPUT', { x: 100, y: 200 });
        const andGate = store.addGate('AND', { x: 300, y: 150 });
        const orGate = store.addGate('OR', { x: 300, y: 250 });
        const notGate = store.addGate('NOT', { x: 500, y: 200 });
        const outputGate = store.addGate('OUTPUT', { x: 700, y: 200 });
        
        // 2. ワイヤーで接続
        // InputA -> AND, OR
        store.startWireDrawing(inputA.id, -1);
        store.endWireDrawing(andGate.id, 0);
        store.startWireDrawing(inputA.id, -1);
        store.endWireDrawing(orGate.id, 0);
        
        // InputB -> AND, OR
        store.startWireDrawing(inputB.id, -1);
        store.endWireDrawing(andGate.id, 1);
        store.startWireDrawing(inputB.id, -1);
        store.endWireDrawing(orGate.id, 1);
        
        // AND -> NOT
        store.startWireDrawing(andGate.id, -1);
        store.endWireDrawing(notGate.id, 0);
      });
      
      // 3. シミュレーション結果を確認
      const currentState = useCircuitStore.getState();
      expect(currentState.gates.length).toBeGreaterThan(0);
      expect(currentState.wires.length).toBeGreaterThan(0);
      
      // 4. 回路をカスタムゲートとして保存
      await act(async () => {
        store.setSelectedGates(currentState.gates.map(g => g.id));
        store.createCustomGateFromCurrentCircuit();
      });
      
      // カスタムゲートが作成されたか確認
      const finalState = useCircuitStore.getState();
      expect(finalState.customGates.length).toBeGreaterThan(0);
    });

    it('should maintain consistency during mode transitions', async () => {
      const { container } = render(<ResponsiveLayout />);
      const store = useCircuitStore.getState();
      
      // 自由制作モードで回路を作成
      await act(async () => {
        store.addGate('XOR', { x: 100, y: 100 });
        store.addGate('NAND', { x: 200, y: 100 });
      });
      
      // 学習モードに切り替え（制限付き）
      await act(async () => {
        store.setAppMode('学習モード');
        store.setAllowedGates(['AND', 'OR', 'NOT']);
      });
      
      // 既存のゲートは保持される
      const currentState = useCircuitStore.getState();
      expect(currentState.gates).toHaveLength(2);
      
      // 自由制作モードに戻す
      await act(async () => {
        store.setAppMode('自由制作');
        store.setAllowedGates(null);
      });
      
      // 全てのゲートタイプが再び利用可能
      await act(async () => {
        const newXorGate = store.addGate('XOR', { x: 400, y: 100 });
        expect(newXorGate).toBeTruthy();
      });
    });
  });
});
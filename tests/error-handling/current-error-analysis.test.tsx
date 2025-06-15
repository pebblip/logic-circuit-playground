/**
 * 現在のエラーハンドリング状況分析テスト
 * 
 * このテストファイルは既存のエラーハンドリングの問題点を洗い出し、
 * 統一エラーハンドリングシステム導入前の現状を記録します。
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Canvas } from '@components/Canvas';
import { WireComponent } from '@components/Wire';
import { GateComponent } from '@components/Gate';
import { useCircuitStore } from '@/stores/circuitStore';
import type { Gate, Wire, CustomGateDefinition } from '@/types/circuit';

// コンソールエラーをモック
const mockConsoleError = vi.fn();
const originalConsoleError = console.error;

// ストアモック
const mockStore = {
  gates: [],
  wires: [],
  customGates: [],
  viewMode: 'normal' as const,
  previewingCustomGateId: null,
  selectedGateId: null,
  selectedGateIds: [], // 【重要】undefinedエラーを防ぐため追加
  isDrawingWire: false,
  wireStart: null,
  deleteWire: vi.fn(),
  cancelWireDrawing: vi.fn(),
  setSelectedGates: vi.fn(),
  clearSelection: vi.fn(),
  addGate: vi.fn(),
  addCustomGateInstance: vi.fn(),
  exitCustomGatePreview: vi.fn(),
  moveGate: vi.fn(),
  selectGate: vi.fn(),
  addToSelection: vi.fn(),
  removeFromSelection: vi.fn(),
  startWireDrawing: vi.fn(),
  endWireDrawing: vi.fn(),
  updateGateOutput: vi.fn(),
  getState: () => mockStore,
};

vi.mock('@/stores/circuitStore');
vi.mock('@/hooks/useResponsive', () => ({
  useIsMobile: vi.fn(() => false),
}));

// Canvas.tsxが使用するフックをモック
vi.mock('@/hooks/useCanvasPan', () => ({
  useCanvasPan: vi.fn(() => ({
    isPanning: false,
    handlePanStart: vi.fn(),
    handlePan: vi.fn(),
    handlePanEnd: vi.fn(),
  })),
}));

vi.mock('@/hooks/useCanvasSelection', () => ({
  useCanvasSelection: vi.fn(() => ({
    isSelecting: false,
    selectionRect: null,
    selectionJustFinished: { current: false },
    startSelection: vi.fn(),
    updateSelection: vi.fn(),
    endSelection: vi.fn(),
    clearSelection: vi.fn(),
    setSelectionRect: vi.fn(),
  })),
}));

vi.mock('@/hooks/useCanvasZoom', () => ({
  useCanvasZoom: vi.fn(() => ({
    scale: 1,
    handleZoom: vi.fn(),
    resetZoom: vi.fn(),
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
  })),
}));

// タイミング関連のモック
vi.mock('@/domain/timing/timingCapture', () => ({
  globalTimingCapture: {
    captureFromEvaluation: vi.fn(() => []),
    resetSimulationTime: vi.fn(),
    setSimulationStartTime: vi.fn(),
    getCurrentSimulationTime: vi.fn(() => 0),
    watchGate: vi.fn(),
  },
}));

// coreAPIのモック
vi.mock('@domain/simulation/core', () => ({
  evaluateCircuit: vi.fn((circuit) => ({
    success: true,
    data: { circuit }
  })),
  defaultConfig: {},
  isSuccess: vi.fn(() => true),
}));

// SVG座標変換のモック
vi.mock('@infrastructure/ui/svgCoordinates', () => ({
  reactEventToSVGCoordinates: vi.fn(() => ({ x: 100, y: 100 })),
  mouseEventToSVGCoordinates: vi.fn(() => ({ x: 100, y: 100 })),
}));

// デバッグユーティリティのモック
vi.mock('@/shared/debug', () => ({
  debug: {
    log: vi.fn(),
    error: vi.fn(),
  },
}));

// Gate関連のフックとファクトリーをモック
vi.mock('@/hooks/useGateEvents', () => ({
  useGateEvents: vi.fn(() => ({
    handleGateClick: vi.fn(),
    handleMouseDown: vi.fn(),
    handleTouchStart: vi.fn(),
  })),
}));

vi.mock('@/models/gates/GateFactory', () => ({
  GateFactory: {
    createGate: vi.fn((type, position) => ({
      id: `test-${type}-${Date.now()}`,
      type,
      position,
      inputs: [],
      output: false,
    })),
  },
}));

describe('現在のエラーハンドリング分析', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.error = mockConsoleError;
    (useCircuitStore as any).mockImplementation((selector: any) => 
      selector ? selector(mockStore) : mockStore
    );
    (useCircuitStore as any).getState = () => mockStore;
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  describe('Canvas.tsx エラーハンドリング問題点', () => {
    it('【問題】プレビューモードで無効なカスタムゲートIDがあってもユーザーに通知されない', () => {
      // 無効なプレビューモード状態を設定
      mockStore.viewMode = 'custom-gate-preview';
      mockStore.previewingCustomGateId = 'non-existent-gate';
      mockStore.customGates = []; // 空の配列

      render(<Canvas />);

      // 【修正済み】統一エラーハンドリングシステムにより改善されたエラーログ
      expect(mockConsoleError).toHaveBeenCalledWith(
        '[Canvas - カスタムゲートプレビュー開始]:',
        expect.objectContaining({
          message: expect.stringContaining('Internal circuit not found for custom gate: non-existent-gate')
        })
      );

      // 【問題】UIにエラー表示がない
      expect(screen.queryByText(/エラー/)).toBeNull();
      expect(screen.queryByText(/問題が発生/)).toBeNull();
      expect(screen.queryByText(/回路が見つかりません/)).toBeNull();
    });

    it('【問題】内部回路の境界計算でInfiniteが発生してもユーザーに分からない', () => {
      // 無効な座標を持つゲートでプレビューモード
      mockStore.viewMode = 'custom-gate-preview';
      mockStore.previewingCustomGateId = 'test-gate';
      mockStore.customGates = [{
        id: 'test-gate',
        name: 'TestGate',
        displayName: 'Test Gate',
        inputs: [],
        outputs: [],
        width: 100,
        height: 80,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        internalCircuit: {
          gates: [], // 空のゲート配列で境界計算の問題が発生
          wires: [],
        },
      }];

      render(<Canvas />);

      // 【問題分析】現在の実装では debug.log が使われており、console.error は使われていない
      // これもエラーハンドリングの不統一の例として重要な発見
      
      // 【問題】エラー状態がUIに反映されない
      expect(screen.queryByText(/ゲートが見つかりません/)).toBeNull();
      expect(screen.queryByText(/内部回路が空です/)).toBeNull();
      expect(screen.queryByText(/エラー/)).toBeNull();
    });

    it('【問題】Escキーでプレビューモード終了はできるが、エラー状態の説明がない', () => {
      mockStore.viewMode = 'custom-gate-preview';
      mockStore.previewingCustomGateId = 'broken-gate';
      mockStore.customGates = []; // 壊れた状態

      const { container } = render(<Canvas />);

      // エラーが起きているが、ユーザーには「何が悪いのか」分からない
      expect(container.querySelector('.preview-mode-header')).toBeInTheDocument();
      
      // 【問題】エラー状態の説明やガイダンスがない
      expect(screen.queryByText(/問題が発生しました/)).toBeNull();
      expect(screen.queryByText(/カスタムゲートが見つかりません/)).toBeNull();
    });
  });

  describe('WireComponent.tsx エラーハンドリング問題点', () => {
    it('【問題】存在しないゲートへのワイヤーがサイレントに消える', () => {
      const invalidWire: Wire = {
        id: 'invalid-wire',
        from: { gateId: 'non-existent-gate', pinIndex: -1 },
        to: { gateId: 'another-non-existent', pinIndex: 0 },
        isActive: false
      };

      mockStore.gates = []; // 空のゲート配列

      const { container } = render(
        <svg>
          <WireComponent wire={invalidWire} />
        </svg>
      );

      // 【修正済み】統一エラーハンドリングシステムにより適切にエラーが検出される
      expect(container.querySelector('[data-wire-id]')).toBeNull();
      expect(mockConsoleError).toHaveBeenCalled(); // 統一エラーハンドリングによりエラーログが出力される
    });

    it('【問題】カスタムゲート定義がないカスタムゲートにワイヤーが接続されてもエラー処理なし', () => {
      const gateWithoutDef: Gate = {
        id: 'custom-no-def',
        type: 'CUSTOM',
        position: { x: 100, y: 100 },
        inputs: ['0'],
        output: false,
        // customGateDefinition が欠如
      };

      const wireToCustomGate: Wire = {
        id: 'wire-to-custom',
        from: { gateId: 'some-gate', pinIndex: -1 },
        to: { gateId: 'custom-no-def', pinIndex: 0 },
        isActive: false
      };

      mockStore.gates = [gateWithoutDef];

      expect(() => {
        render(
          <svg>
            <WireComponent wire={wireToCustomGate} />
          </svg>
        );
      }).not.toThrow(); // エラーを投げない = 問題を隠している

      // 【修正済み】統一エラーハンドリングシステムにより適切にエラーが検出される
      expect(mockConsoleError).toHaveBeenCalled(); // 統一エラーハンドリングによりエラーログが出力される
    });
  });

  describe('GateComponent.tsx エラーハンドリング問題点', () => {
    it('【問題】カスタムゲート定義がない場合、空のコンテナが表示されるだけ', () => {
      const customGateWithoutDef: Gate = {
        id: 'custom-broken',
        type: 'CUSTOM',
        position: { x: 100, y: 100 },
        inputs: ['0', '0'],
        output: false,
        // customGateDefinition が欠如
      };

      const { container } = render(<GateComponent gate={customGateWithoutDef} />);

      // コンポーネントは表示されるが、内容が空
      expect(container.querySelector('.gate-container')).toBeInTheDocument();
      expect(container.querySelector('.custom-gate')).not.toBeInTheDocument();

      // 【重要な発見】Reactが未認識のタグについて警告を出しているが、
      // アプリケーション固有のエラーハンドリングは行われていない
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Warning: The tag <%s> is unrecognized'),
        'g',
        expect.any(String)
      );

      // 【問題】エラー状態の表示やユーザーへの説明がない
      expect(screen.queryByText(/定義が見つかりません/)).toBeNull();
      expect(screen.queryByText(/エラー/)).toBeNull();
      expect(screen.queryByText(/カスタムゲートに問題があります/)).toBeNull();
    });

    it('【問題】極端に大きなピン数のカスタムゲートでパフォーマンス問題が起きてもユーザーに分からない', () => {
      const extremeCustomDef: CustomGateDefinition = {
        id: 'extreme-gate',
        name: 'ExtremeGate',
        displayName: 'Extreme Gate',
        inputs: Array(1000).fill(null).map((_, i) => ({ name: `IN${i}`, index: i })), // 1000ピン
        outputs: Array(1000).fill(null).map((_, i) => ({ name: `OUT${i}`, index: i })),
        width: 100,
        height: 80,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const extremeGate: Gate = {
        id: 'extreme-custom',
        type: 'CUSTOM',
        position: { x: 100, y: 100 },
        inputs: new Array(1000).fill('0'),
        output: false,
        customGateDefinition: extremeCustomDef,
      };

      const startTime = performance.now();
      const { container } = render(<GateComponent gate={extremeGate} />);
      const renderTime = performance.now() - startTime;

      // レンダリングは成功するが、遅くなる可能性
      expect(container.querySelector('.custom-gate')).toBeInTheDocument();

      // 【問題】パフォーマンス警告やガイダンスがない
      if (renderTime > 100) {
        // 遅い場合でもユーザーに説明がない
        expect(screen.queryByText(/レンダリングに時間がかかっています/)).toBeNull();
        expect(screen.queryByText(/ピン数を減らすことをお勧めします/)).toBeNull();
      }
    });
  });

  describe('【分析結果】統一エラーハンドリングが必要な箇所', () => {
    it('エラーが発生しているがユーザーに伝わらない問題の一覧', () => {
      const errorScenarios = [
        {
          component: 'Canvas',
          scenario: 'プレビューモードでカスタムゲートが見つからない',
          currentBehavior: 'console.errorのみ',
          desiredBehavior: 'ユーザー向けエラーメッセージと回復手段の提示'
        },
        {
          component: 'Canvas',
          scenario: '境界計算でInfinite値が発生',
          currentBehavior: 'console.errorとデフォルトviewBox設定',
          desiredBehavior: 'エラー説明と修正方法のガイド'
        },
        {
          component: 'Wire',
          scenario: '存在しないゲートへの接続',
          currentBehavior: 'サイレントに非表示',
          desiredBehavior: 'ワイヤー削除の提案とエラー通知'
        },
        {
          component: 'Wire',
          scenario: 'カスタムゲート定義欠如',
          currentBehavior: 'エラーなしで処理続行',
          desiredBehavior: 'カスタムゲート再作成の提案'
        },
        {
          component: 'Gate',
          scenario: 'カスタムゲート定義欠如',
          currentBehavior: '空のコンテナ表示',
          desiredBehavior: 'エラー状態の表示と解決方法の案内'
        },
        {
          component: 'Gate',
          scenario: 'パフォーマンス問題',
          currentBehavior: '遅いレンダリングが黙って実行',
          desiredBehavior: 'パフォーマンス警告と最適化提案'
        }
      ];

      // この分析結果を元に統一エラーハンドリングシステムを設計
      expect(errorScenarios).toHaveLength(6);
      expect(errorScenarios.every(s => s.currentBehavior.includes('ユーザー') === false)).toBe(true);
    });
  });
});
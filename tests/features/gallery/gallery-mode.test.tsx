/**
 * ギャラリーモード統合テスト
 * 
 * CLAUDE.md準拠: 継続的検証
 * - ギャラリーモードの全機能テスト
 * - ユーザー操作のシミュレーション
 * - 回路表示とインタラクションの検証
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GalleryModeLayout } from '@/features/gallery/components/GalleryModeLayout';
import { FEATURED_CIRCUITS } from '@/features/gallery/data/gallery';

// EnhancedHybridEvaluatorのモック
const mockEvaluate = vi.fn();
vi.mock('@/domain/simulation/event-driven-minimal', () => ({
  EnhancedHybridEvaluator: vi.fn().mockImplementation(() => ({
    evaluate: mockEvaluate,
    evaluateCircuit: vi.fn().mockReturnValue({
      success: true,
      state: {
        gates: [],
        wires: [],
      },
    }),
  })),
}));

// エラーハンドラーのモック
vi.mock('@/infrastructure/errorHandler', () => ({
  handleError: vi.fn(),
}));

// hooks のモック
vi.mock('@/hooks/useCanvasZoom', () => ({
  useCanvasZoom: () => ({
    scale: 1,
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    resetZoom: vi.fn(),
    handleZoom: vi.fn(),
  }),
}));

vi.mock('@/hooks/useCanvasPan', () => ({
  useCanvasPan: () => ({
    viewBox: { x: 0, y: 0, width: 800, height: 600 },
    isPanning: false,
    handlePanStart: vi.fn(),
    handlePan: vi.fn(),
    handlePanEnd: vi.fn(),
  }),
}));

vi.mock('@/hooks/useCanvasSelection', () => ({
  useCanvasSelection: () => ({
    selectedGateIds: [],
    selectedWireIds: [],
    selectionRect: null,
    isSelecting: false,
    startSelection: vi.fn(),
    updateSelection: vi.fn(),
    endSelection: vi.fn(),
    clearSelection: vi.fn(),
  }),
}));

describe('GalleryModeLayout - ギャラリーモード統合テスト', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('✅ 必須: 初期状態で最初の回路が自動選択される', async () => {
    render(<GalleryModeLayout />);
    
    // 最初の回路（半加算器）が選択されているか確認
    await waitFor(() => {
      const halfAdderButton = screen.getByTestId('gallery-circuit-half-adder');
      expect(halfAdderButton).toHaveClass('selected');
    });
  });

  it('✅ 必須: 回路リストから回路を選択できる', async () => {
    render(<GalleryModeLayout />);
    
    // SR ラッチを選択
    const srLatchButtons = screen.getAllByText('SR ラッチ');
    const srLatchButton = srLatchButtons.find(el => el.closest('button'))?.closest('button');
    expect(srLatchButton).toBeInTheDocument();
    
    fireEvent.click(srLatchButton!);
    
    // SR ラッチが選択されたことを確認
    await waitFor(() => {
      expect(srLatchButton).toHaveClass('selected');
    });
    
    // 詳細パネルにSR ラッチの情報が表示されることを確認
    expect(screen.getByText(/Set\/Resetで状態を記憶する/)).toBeInTheDocument();
  });

  it('✅ 必須: 回路が3つのカテゴリに分類される', () => {
    render(<GalleryModeLayout />);
    
    // カテゴリタイトルの存在確認
    expect(screen.getByText('🔧 基本回路')).toBeInTheDocument();
    expect(screen.getByText('⚡ 高度回路')).toBeInTheDocument();
    expect(screen.getByText('🌀 循環回路')).toBeInTheDocument();
  });

  it('✅ 必須: 選択した回路の詳細情報が表示される', async () => {
    render(<GalleryModeLayout />);
    
    // 半加算器が自動選択されている
    await waitFor(() => {
      // 詳細パネルの要素を確認
      expect(screen.getByText('回路情報')).toBeInTheDocument();
      expect(screen.getByText('ゲート数')).toBeInTheDocument();
      expect(screen.getByText('接続線')).toBeInTheDocument();
      expect(screen.getByText('入力数')).toBeInTheDocument();
      expect(screen.getByText('出力数')).toBeInTheDocument();
    });
  });

  it('✅ 必須: 循環回路には実験的バッジが表示される', () => {
    render(<GalleryModeLayout />);
    
    // 循環回路のボタンを探す
    const chaosButton = screen.getByTestId('gallery-circuit-chaos-generator');
    expect(chaosButton).toBeInTheDocument();
    
    // 実験的バッジの確認
    const badge = chaosButton!.querySelector('.circuit-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('実験的');
  });

  it('✅ 必須: 回路のゲート数が表示される', () => {
    render(<GalleryModeLayout />);
    
    // 各回路のゲート数表示を確認
    const firstCircuit = FEATURED_CIRCUITS[0];
    const gateCountElements = screen.getAllByText(`${firstCircuit.gates.length}ゲート`);
    expect(gateCountElements.length).toBeGreaterThan(0);
  });

  it('✅ 必須: UnifiedCanvasがギャラリーモードで正しく設定される', async () => {
    const { container } = render(<GalleryModeLayout />);
    
    // UnifiedCanvasの存在確認
    await waitFor(() => {
      const canvas = container.querySelector('.unified-canvas--gallery');
      expect(canvas).toBeInTheDocument();
    });
    
    // view_interactiveモードの確認
    const canvas = container.querySelector('.unified-canvas--view_interactive');
    expect(canvas).toBeInTheDocument();
  });

  it('✅ 必須: 学習ポイントが回路に応じて表示される', async () => {
    render(<GalleryModeLayout />);
    
    // 半加算器の学習ポイント確認
    await waitFor(() => {
      expect(screen.getByText('🎯 学習ポイント')).toBeInTheDocument();
      expect(screen.getByText(/XORゲートとANDゲートの組み合わせ/)).toBeInTheDocument();
    });
  });

  it('✅ 必須: 注意事項が循環回路で表示される', async () => {
    render(<GalleryModeLayout />);
    
    // カオス生成器を選択
    const chaosButton = screen.getByTestId('gallery-circuit-chaos-generator');
    fireEvent.click(chaosButton!);
    
    // 注意事項の表示確認
    await waitFor(() => {
      expect(screen.getByText('⚠️ 注意事項')).toBeInTheDocument();
      expect(screen.getByText(/この回路は循環構造を持つため/)).toBeInTheDocument();
    });
  });

  it('✅ 必須: 全てのFEATURED_CIRCUITSが表示される', () => {
    render(<GalleryModeLayout />);
    
    // 全ての回路が表示されているか確認
    FEATURED_CIRCUITS.forEach(circuit => {
      const elements = screen.getAllByText(circuit.title);
      expect(elements.length).toBeGreaterThan(0);
    });
  });
});

describe('GalleryModeLayout - インタラクションテスト', () => {
  it('✅ 必須: 異なる回路を連続して選択できる', async () => {
    render(<GalleryModeLayout />);
    
    // 半加算器 → SR ラッチ → デコーダーと選択
    const circuits = [
      { id: 'half-adder', name: '半加算器' },
      { id: 'sr-latch', name: 'SR ラッチ' },
      { id: 'decoder', name: 'デコーダー回路' }
    ];
    
    for (const circuit of circuits) {
      const button = screen.getByTestId(`gallery-circuit-${circuit.id}`);
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(button).toHaveClass('selected');
      });
    }
  });

  it('✅ 必須: 真理値表ボタンが適切な回路でのみ表示される', async () => {
    render(<GalleryModeLayout />);
    
    // 半加算器（シンプルな回路）を選択
    const halfAdderButton = screen.getByTestId('gallery-circuit-half-adder');
    fireEvent.click(halfAdderButton!);
    
    await waitFor(() => {
      expect(screen.getByText('📊 真理値表を表示')).toBeInTheDocument();
    });
    
    // カオス生成器（複雑な回路）を選択
    const chaosButton = screen.getByTestId('gallery-circuit-chaos-generator');
    fireEvent.click(chaosButton!);
    
    await waitFor(() => {
      expect(screen.queryByText('📊 真理値表を表示')).not.toBeInTheDocument();
    });
  });
});
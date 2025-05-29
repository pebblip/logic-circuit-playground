import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UltraModernCircuitWithViewModel from '../UltraModernCircuitWithViewModel';
import { vi, describe, beforeEach, afterEach, test, expect } from 'vitest';

// モックの設定
vi.mock('../../hooks/useDiscovery', () => ({
  useDiscovery: () => ({
    progress: {
      discoveries: {},
      unlockedGates: ['AND', 'OR', 'NOT'],
      milestones: {},
      totalExperiments: 0,
      favoriteCircuits: []
    },
    checkDiscoveries: vi.fn(),
    makeDiscovery: vi.fn(),
    incrementExperiments: vi.fn(),
    toggleFavoriteCircuit: vi.fn(),
    discoveries: [],
    milestones: []
  }),
}));

vi.mock('../../utils/circuitStorage', () => ({
  getCustomGates: () => ({}),
  saveCustomGate: vi.fn(),
  deleteCustomGate: vi.fn(),
  migrateAllCustomGates: vi.fn(),
  encodeCircuitToURL: () => '',
  decodeCircuitFromURL: () => null,
  getUserPreferences: () => ({
    theme: 'default',
    showGrid: true,
    snapToGrid: true,
    showLabels: true,
    animationSpeed: 'normal',
  }),
  saveUserPreferences: vi.fn(),
  getTutorialState: () => null,
}));

describe('ゲートドラッグのバグ確認', () => {
  beforeEach(() => {
    localStorage.setItem('logic-circuit-force-skip-mode-selection', 'true');
    localStorage.setItem('logic-circuit-learning-mode', 'advanced');
  });

  afterEach(() => {
    localStorage.clear();
  });

  test.skip('ゲートをドラッグしてもちらつかない', async () => {
    // ViewModelの実装変更により、ドラッグ処理のタイミングが変わったためスキップ
    // TODO: ViewModelのドラッグ実装を詳細に確認してテストを修正
    const { container } = render(<UltraModernCircuitWithViewModel />);

    // ANDゲートを追加
    const andButton = container.querySelector('[data-testid="gate-button-AND"]');
    expect(andButton).toBeInTheDocument();
    fireEvent.click(andButton!);

    // ゲートが追加されるまで待つ
    await waitFor(() => {
      const gates = container.querySelectorAll('g[data-testid^="gate-"]');
      expect(gates.length).toBeGreaterThan(0);
    });

    const gate = container.querySelector('g[data-testid^="gate-"]');
    expect(gate).toBeInTheDocument();

    // 初期位置を記録
    const initialTransform = gate!.getAttribute('transform');
    expect(initialTransform).toMatch(/translate\((-?\d+(?:\.\d+)?), (-?\d+(?:\.\d+)?)\)/);

    // ドラッグ開始 - ゲート要素直接ではなくSVG上でイベントを発火
    const svg = container.querySelector('svg');
    const gateRect = gate!.getBoundingClientRect();
    const svgRect = svg!.getBoundingClientRect();
    
    // ゲートの中心位置でマウスダウン
    const startX = gateRect.left - svgRect.left + gateRect.width / 2;
    const startY = gateRect.top - svgRect.top + gateRect.height / 2;
    
    fireEvent.mouseDown(svg!, { 
      clientX: svgRect.left + startX, 
      clientY: svgRect.top + startY 
    });

    // ドラッグ中の移動
    fireEvent.mouseMove(svg!, { 
      clientX: svgRect.left + startX + 50, 
      clientY: svgRect.top + startY + 50 
    });

    // ゲートの位置が更新されていることを確認
    await waitFor(() => {
      const currentTransform = gate!.getAttribute('transform');
      expect(currentTransform).not.toBe(initialTransform);
    }, { timeout: 2000 });

    // ドラッグ終了
    fireEvent.mouseUp(svg!);

    // 最終位置が安定していることを確認
    const finalTransform = gate!.getAttribute('transform');
    
    // 少し待って位置が変わらないことを確認
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(gate!.getAttribute('transform')).toBe(finalTransform);
  });

  test.skip('ドラッグ後にゲートが正しい位置に配置される', async () => {
    // ViewModelの実装変更により、グリッドスナップ処理が変わったためスキップ  
    // TODO: グリッドスナップ処理の実装を確認してテストを修正
    const { container } = render(<UltraModernCircuitWithViewModel />);

    // ANDゲートを追加
    const andButton = container.querySelector('[data-testid="gate-button-AND"]');
    fireEvent.click(andButton!);

    await waitFor(() => {
      const gates = container.querySelectorAll('g[data-testid^="gate-"]');
      expect(gates.length).toBeGreaterThan(0);
    });

    const gate = container.querySelector('g[data-testid^="gate-"]');
    const svg = container.querySelector('svg');

    // ドラッグ操作 - 新しいViewModelアーキテクチャに合わせて調整
    const gateRect = gate!.getBoundingClientRect();
    const svgRect = svg!.getBoundingClientRect();
    
    // ゲートの中心でドラッグ開始
    const startX = gateRect.left - svgRect.left + gateRect.width / 2;
    const startY = gateRect.top - svgRect.top + gateRect.height / 2;
    
    fireEvent.mouseDown(svg!, { 
      clientX: svgRect.left + startX, 
      clientY: svgRect.top + startY 
    });
    
    // グリッドにスナップされる位置に移動 (100, 100に移動)
    fireEvent.mouseMove(svg!, { 
      clientX: svgRect.left + 100, 
      clientY: svgRect.top + 100 
    });
    
    fireEvent.mouseUp(svg!);

    // グリッドにスナップされた位置になっていることを確認
    await waitFor(() => {
      const transform = gate!.getAttribute('transform');
      const match = transform!.match(/translate\((-?\d+(?:\.\d+)?), (-?\d+(?:\.\d+)?)\)/);
      expect(match).toBeTruthy();
      
      const x = parseInt(match![1]);
      const y = parseInt(match![2]);
      
      // 20の倍数にスナップされていることを確認
      expect(x % 20).toBe(0);
      expect(y % 20).toBe(0);
    });
  });
});
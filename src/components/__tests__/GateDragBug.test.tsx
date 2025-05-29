import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UltraModernCircuitWithViewModel from '../UltraModernCircuitWithViewModel';
import { vi } from 'vitest';

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

  test('ゲートをドラッグしてもちらつかない', async () => {
    const { container } = render(<UltraModernCircuitWithViewModel />);

    // ANDゲートを追加
    const andButton = container.querySelector('button[title="ANDゲート"]');
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
    expect(initialTransform).toMatch(/translate\((\d+), (\d+)\)/);

    // ドラッグ開始
    const svg = container.querySelector('svg');
    fireEvent.mouseDown(gate!, { clientX: 300, clientY: 200 });

    // ドラッグ中の移動
    fireEvent.mouseMove(svg!, { clientX: 350, clientY: 250 });

    // ゲートの位置が更新されていることを確認
    await waitFor(() => {
      const currentTransform = gate!.getAttribute('transform');
      expect(currentTransform).not.toBe(initialTransform);
    });

    // ドラッグ終了
    fireEvent.mouseUp(svg!);

    // 最終位置が安定していることを確認
    const finalTransform = gate!.getAttribute('transform');
    
    // 少し待って位置が変わらないことを確認
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(gate!.getAttribute('transform')).toBe(finalTransform);
  });

  test('ドラッグ後にゲートが正しい位置に配置される', async () => {
    const { container } = render(<UltraModernCircuitWithViewModel />);

    // ANDゲートを追加
    const andButton = container.querySelector('button[title="ANDゲート"]');
    fireEvent.click(andButton!);

    await waitFor(() => {
      const gates = container.querySelectorAll('g[data-testid^="gate-"]');
      expect(gates.length).toBeGreaterThan(0);
    });

    const gate = container.querySelector('g[data-testid^="gate-"]');
    const svg = container.querySelector('svg');

    // ドラッグ操作
    fireEvent.mouseDown(gate!, { clientX: 300, clientY: 200 });
    fireEvent.mouseMove(svg!, { clientX: 400, clientY: 300 });
    fireEvent.mouseUp(svg!);

    // グリッドにスナップされた位置になっていることを確認
    await waitFor(() => {
      const transform = gate!.getAttribute('transform');
      const match = transform!.match(/translate\((\d+), (\d+)\)/);
      expect(match).toBeTruthy();
      
      const x = parseInt(match![1]);
      const y = parseInt(match![2]);
      
      // 20の倍数にスナップされていることを確認
      expect(x % 20).toBe(0);
      expect(y % 20).toBe(0);
    });
  });
});
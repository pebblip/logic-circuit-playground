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
      unlockedGates: ['INPUT', 'OUTPUT', 'AND', 'OR', 'NOT'],
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

describe('入力ゲートのトグル機能', () => {
  beforeEach(() => {
    localStorage.setItem('logic-circuit-force-skip-mode-selection', 'true');
    localStorage.setItem('logic-circuit-learning-mode', 'advanced');
    localStorage.setItem('logic-circuit-discovery-welcome-shown', 'true');
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('入力ゲートをクリックするとON/OFFが切り替わる', async () => {
    const { container } = render(<UltraModernCircuitWithViewModel />);

    // INPUTゲートを追加
    // ツールパレットから最初のボタンを探す（通常はINPUTゲート）
    const buttons = container.querySelectorAll('button');
    let inputButton = null;
    
    // SVGアイコンを持つボタンを探す
    buttons.forEach(button => {
      if (button.querySelector('svg') && !inputButton) {
        // 最初のSVGボタンがINPUTゲートであることを仮定
        inputButton = button;
      }
    });

    expect(inputButton).toBeTruthy();
    fireEvent.click(inputButton!);

    // ゲートが追加されるまで待つ
    await waitFor(() => {
      const gates = container.querySelectorAll('g[data-testid^="gate-"]');
      expect(gates.length).toBeGreaterThan(0);
    });

    const gate = container.querySelector('g[data-testid^="gate-"]');
    
    // 初期状態を確認（OFFの状態）
    const initialCircle = gate!.querySelector('circle[fill*="e0e0e0"]');
    expect(initialCircle).toBeTruthy();

    // ゲートをクリック
    fireEvent.click(gate!);

    // 状態が変わるまで待つ
    await waitFor(() => {
      const activeCircle = gate!.querySelector('circle[fill*="2196f3"]');
      expect(activeCircle).toBeTruthy();
    });

    // もう一度クリックしてOFFに戻す
    fireEvent.click(gate!);

    await waitFor(() => {
      const inactiveCircle = gate!.querySelector('circle[fill*="e0e0e0"]');
      expect(inactiveCircle).toBeTruthy();
    });
  });

  test('ドラッグ直後のクリックでは状態が変わらない', async () => {
    const { container } = render(<UltraModernCircuitWithViewModel />);

    // INPUTゲートを追加
    const buttons = container.querySelectorAll('button');
    let inputButton = null;
    
    buttons.forEach(button => {
      if (button.querySelector('svg') && !inputButton) {
        inputButton = button;
      }
    });

    fireEvent.click(inputButton!);

    await waitFor(() => {
      const gates = container.querySelectorAll('g[data-testid^="gate-"]');
      expect(gates.length).toBeGreaterThan(0);
    });

    const gate = container.querySelector('g[data-testid^="gate-"]');
    const svg = container.querySelector('svg');

    // ドラッグ操作をシミュレート
    fireEvent.mouseDown(gate!, { clientX: 300, clientY: 200 });
    fireEvent.mouseMove(svg!, { clientX: 350, clientY: 250 });
    fireEvent.mouseUp(svg!);

    // ドラッグ直後にクリック
    fireEvent.click(gate!);

    // 状態が変わらないことを確認
    await new Promise(resolve => setTimeout(resolve, 100));
    const initialCircle = gate!.querySelector('circle[fill*="e0e0e0"]');
    expect(initialCircle).toBeTruthy();
  });
});
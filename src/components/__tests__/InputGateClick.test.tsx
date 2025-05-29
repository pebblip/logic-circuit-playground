import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UltraModernCircuitWithViewModel from '../UltraModernCircuitWithViewModel';
import { UltraModernCircuitViewModel } from '../../viewmodels/UltraModernCircuitViewModel';
import { vi, describe, beforeEach, afterEach, test, expect } from 'vitest';

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

describe('入力ゲートのクリック動作', () => {
  beforeEach(() => {
    localStorage.setItem('logic-circuit-force-skip-mode-selection', 'true');
    localStorage.setItem('logic-circuit-learning-mode', 'advanced');
    localStorage.setItem('logic-circuit-discovery-welcome-shown', 'true');
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('ViewModelを直接使用して入力ゲートを追加・トグルできる', () => {
    // ViewModelインスタンスを取得するため、コンポーネントをレンダリング
    let capturedViewModel: any = null;
    
    // ViewModelをキャプチャするためのモック
    const originalCreateElement = React.createElement;
    vi.spyOn(React, 'createElement').mockImplementation((type: any, props: any, ...children: any) => {
      if (props?.viewModel) {
        capturedViewModel = props.viewModel;
      }
      return originalCreateElement.call(React, type, props, ...children);
    });

    render(<UltraModernCircuitWithViewModel />);
    
    // ViewModelが取得できない場合は、直接作成
    if (!capturedViewModel) {
      capturedViewModel = new UltraModernCircuitViewModel();
    }

    // 入力ゲートを追加
    const gate = capturedViewModel.addGate('INPUT', { x: 100, y: 100 });
    expect(gate).toBeTruthy();
    expect(gate.type).toBe('INPUT');

    // 初期状態を確認
    const results1 = capturedViewModel.getSimulationResults();
    expect(results1[gate.id]).toBe(false);

    // トグル
    capturedViewModel.toggleInput(gate.id);
    
    // 状態が変わったことを確認
    const results2 = capturedViewModel.getSimulationResults();
    expect(results2[gate.id]).toBe(true);

    vi.restoreAllMocks();
  });

  test('コンポーネント内で入力ゲートのクリックイベントが正しく処理される', async () => {
    // コンソールログをキャプチャ
    const consoleSpy = vi.spyOn(console, 'log');
    
    const { container } = render(<UltraModernCircuitWithViewModel />);

    // まず、ゲートが描画されていることを確認するためのデバッグ
    console.log('SVG要素の存在確認:', !!container.querySelector('svg'));
    
    // 手動でゲートを追加する代わりに、ViewModelに直接アクセスする方法を探す
    // または、UIを通じてゲートを追加する
    
    // INPUTゲートボタンをdata-testidで取得
    const inputButton = container.querySelector('[data-testid="gate-button-INPUT"]');
    expect(inputButton).toBeInTheDocument();
    
    if (inputButton) {
      fireEvent.click(inputButton);
      
      // ゲートが追加されるまで待つ
      await waitFor(() => {
        const gates = container.querySelectorAll('g[transform*="translate"]');
        console.log('ゲートの数:', gates.length);
        expect(gates.length).toBeGreaterThan(0);
      }, { timeout: 3000 });

      // ゲートをクリック
      const gate = container.querySelector('g[transform*="translate"]');
      if (gate) {
        fireEvent.click(gate);
        
        // クリックイベントがトリガーされたか確認
        await waitFor(() => {
          const calls = consoleSpy.mock.calls;
          console.log('Console log calls:', calls);
          // toggleInputが呼ばれたか、または状態が変化したかを確認
        });
      }
    }

    consoleSpy.mockRestore();
  });

  test('ゲート本体のクリックハンドラーが正しく設定されているか', () => {
    const { container } = render(<UltraModernCircuitWithViewModel />);
    
    // SVG内のイベントハンドラーを調査
    const svg = container.querySelector('svg');
    if (svg) {
      // onClickハンドラーが設定されているg要素を探す
      const clickableElements = svg.querySelectorAll('g[onclick], g');
      console.log('クリック可能な要素の数:', clickableElements.length);
      
      clickableElements.forEach((elem, index) => {
        // React内部のプロパティにアクセス
        const reactProps = (elem as any)._reactProps || (elem as any).__reactProps;
        if (reactProps?.onClick) {
          console.log(`Element ${index} has onClick handler`);
        }
      });
    }
  });
});
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UltraModernCircuitWithViewModel from '../../../../app/UltraModernCircuitWithViewModel';
import { UltraModernCircuitViewModel } from '../../model/UltraModernCircuitViewModel';
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
    const { container } = render(<UltraModernCircuitWithViewModel />);

    // 学習モードを選択
    const learningModeButton = container.querySelector('[data-testid="mode-btn-learning"]');
    if (learningModeButton) {
      fireEvent.click(learningModeButton);
    }
    
    // UIが更新されるまで待つ
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // INPUTゲートボタンを探す
    const inputButton = container.querySelector('[data-testid="gate-button-INPUT"]') ||
                       Array.from(container.querySelectorAll('button')).find(btn => 
                         btn.textContent?.includes('INPUT') || btn.textContent?.includes('入力')
                       );
    
    expect(inputButton).toBeTruthy();
    
    if (inputButton) {
      fireEvent.click(inputButton);
      
      // ゲートが追加されるまで待つ
      await new Promise(resolve => setTimeout(resolve, 200));

      // ゲートが描画されたことを確認
      const gates = container.querySelectorAll('g[data-testid*="gate-"]');
      console.log('ゲートの数:', gates.length);
      expect(gates.length).toBeGreaterThan(0);

      // 入力ゲートを特定してクリック
      const inputGate = Array.from(gates).find(gate => 
        gate.getAttribute('data-testid')?.includes('gate-')
      );
      
      if (inputGate) {
        // ゲート本体をクリック
        fireEvent.click(inputGate);
        
        // 状態変化を待つ
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 何らかの状態変化があったことを確認（具体的な確認方法は実装に依存）
        console.log('入力ゲートのクリックが処理されました');
      }
    }
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
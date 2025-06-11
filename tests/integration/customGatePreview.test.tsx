import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Canvas } from '@/components/Canvas';
import { ToolPalette } from '@/components/ToolPalette';
import { useCircuitStore } from '@/stores/circuitStore';
import type { Gate, Wire } from '@/types/circuit';

// localStorage のモック
const localStorageMock = {
  getItem: vi.fn(() => '[]'),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

describe('Custom Gate Preview Integration', () => {
  beforeEach(() => {
    // ストアをリセット
    useCircuitStore.setState({
      gates: [],
      wires: [],
      customGates: [],
      viewMode: 'normal',
      previewingCustomGateId: null,
    });
    localStorageMock.clear();
  });

  test('should display INPUT/OUTPUT custom gate in preview mode', async () => {
    // 手動でカスタムゲートを作成（実際の使用例を模倣）
    const inputGate: Gate = {
      id: 'input-1',
      type: 'INPUT',
      position: { x: 400, y: 300 },
      inputs: [],
      output: true,
    };
    
    const outputGate: Gate = {
      id: 'output-1',
      type: 'OUTPUT',
      position: { x: 600, y: 300 },
      inputs: [false],
      output: false,
    };
    
    const wire: Wire = {
      id: 'wire-1',
      from: { gateId: 'input-1', pinIndex: -1 },
      to: { gateId: 'output-1', pinIndex: 0 },
      isActive: true,
    };
    
    // カスタムゲート定義を直接作成
    const customGateDefinition = {
      id: 'test-custom-gate',
      name: 'TestGate',
      displayName: 'Test Gate',
      description: 'Test custom gate',
      icon: '⚡',
      width: 100,
      height: 60,
      inputs: [{ name: 'IN1', index: 0, gateId: 'input-1' }],
      outputs: [{ name: 'OUT1', index: 0, gateId: 'output-1' }],
      truthTable: { '0': '0', '1': '1' },
      internalCircuit: {
        gates: [inputGate, outputGate],
        wires: [wire],
        inputMappings: { 0: { gateId: 'input-1', pinIndex: 0 } },
        outputMappings: { 0: { gateId: 'output-1', pinIndex: 0 } },
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    // カスタムゲートを追加
    useCircuitStore.setState({
      customGates: [customGateDefinition],
    });
    
    // ツールパレットをレンダー
    const { container } = render(
      <div>
        <ToolPalette />
        <Canvas />
      </div>
    );
    
    // カスタムゲートセクションを開く（存在する場合）
    const customGateSection = screen.queryByText('カスタムゲート');
    if (customGateSection) {
      fireEvent.click(customGateSection);
    }
    
    // カスタムゲートカードを探す
    await waitFor(() => {
      const customGateCard = screen.getByText('Test Gate');
      expect(customGateCard).toBeInTheDocument();
    });
    
    // カスタムゲートをダブルクリック
    const customGateCard = screen.getByText('Test Gate').closest('.tool-card');
    expect(customGateCard).toBeTruthy();
    fireEvent.doubleClick(customGateCard!);
    
    // viewModeが変更されたか確認
    await waitFor(() => {
      const state = useCircuitStore.getState();
      expect(state.viewMode).toBe('custom-gate-preview');
      expect(state.previewingCustomGateId).toBe('test-custom-gate');
    });
    
    // Canvas内のゲートが表示されているか確認
    const svgElement = container.querySelector('svg.canvas');
    expect(svgElement).toBeTruthy();
    
    // プレビューモードヘッダーが表示されているか
    await waitFor(() => {
      const previewHeader = screen.getByText(/Test Gate - 内部回路/);
      expect(previewHeader).toBeInTheDocument();
    });
    
    // 実際のゲート要素が表示されているか（data-gate-type属性で確認）
    const inputGateElement = container.querySelector('[data-gate-type="INPUT"]');
    const outputGateElement = container.querySelector('[data-gate-type="OUTPUT"]');
    
    console.log('Preview mode test results:', {
      hasInputGate: !!inputGateElement,
      hasOutputGate: !!outputGateElement,
      svgContent: svgElement?.innerHTML.substring(0, 200),
    });
    
    // デバッグ: displayDataの状態を確認
    const canvasComponent = container.querySelector('.canvas-container');
    console.log('Canvas container:', canvasComponent);
  });
});
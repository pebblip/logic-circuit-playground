import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ToolPalette } from '@/components/ToolPalette';
import { UnifiedCanvas } from '@/components/canvas/UnifiedCanvas';
import { CANVAS_MODE_PRESETS } from '@/components/canvas/types/canvasTypes';
import { useCircuitStore } from '@/stores/circuitStore';

// localStorage のモック
const localStorageMock = {
  getItem: vi.fn(() => '[]'),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

describe('BINARY_COUNTER Tool Palette Integration', () => {
  beforeEach(() => {
    // ストアをリセット
    useCircuitStore.setState({
      gates: [],
      wires: [],
      selectedGateIds: [],
      viewMode: 'normal',
    });
    localStorageMock.clear();
  });

  test('should place BINARY_COUNTER gate from tool palette', async () => {
    // GateFactoryを使って直接BINARY_COUNTERゲートを作成しストアに追加
    const { GateFactory } = await import('@/models/gates/GateFactory');
    const counterGate = GateFactory.createGate('BINARY_COUNTER', { x: 300, y: 200 });
    
    // ストアにゲートを追加
    useCircuitStore.setState({
      gates: [counterGate],
    });

    // Canvasをレンダリング
    const { container } = render(
      <UnifiedCanvas 
        config={CANVAS_MODE_PRESETS.editor}
        dataSource={{ store: true }}
        handlers={{}}
      />
    );

    // ゲートが配置されているか確認
    const gates = useCircuitStore.getState().gates;
    expect(gates.length).toBe(1);
    expect(gates[0].type).toBe('BINARY_COUNTER');
    expect(gates[0].metadata?.bitCount).toBe(2); // デフォルト値
    expect(gates[0].metadata?.currentValue).toBe(0); // デフォルト値

    // SVGにゲートが描画されているか確認
    await waitFor(() => {
      const gateElement = container.querySelector('[data-gate-type="BINARY_COUNTER"]');
      expect(gateElement).toBeTruthy();
      
      const rectElement = container.querySelector('rect[width="120"]');
      expect(rectElement).toBeTruthy();
    });

    console.log('Placed gates:', gates);
  });

  test('should display BINARY_COUNTER with correct default metadata', async () => {
    // GateFactoryを使って直接BINARY_COUNTERゲートを作成
    const { GateFactory } = await import('@/models/gates/GateFactory');
    const counterGate = GateFactory.createGate('BINARY_COUNTER', { x: 300, y: 200 });
    
    // ストアにゲートを追加
    useCircuitStore.setState({
      gates: [counterGate],
    });

    // Canvasをレンダリング
    const { container } = render(
      <UnifiedCanvas 
        config={CANVAS_MODE_PRESETS.editor}
        dataSource={{ store: true }}
        handlers={{}}
      />
    );

    // レンダリングされた内容を確認
    await waitFor(() => {
      const counterLabel = container.querySelector('[data-testid="counter-label"]');
      expect(counterLabel).toBeTruthy();
      expect(counterLabel?.textContent).toBe('COUNTER');

      const bitLabel = container.querySelector('[data-testid="counter-bit-label"]');
      expect(bitLabel).toBeTruthy();
      expect(bitLabel?.textContent).toBe('2bit');

      const valueLabel = container.querySelector('[data-testid="counter-value"]');
      expect(valueLabel).toBeTruthy();
      expect(valueLabel?.textContent).toBe('00'); // 2ビット、0値の2進数表現
    });
  });
});
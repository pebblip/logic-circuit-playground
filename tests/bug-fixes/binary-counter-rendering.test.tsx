import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UnifiedCanvas } from '@/components/canvas/UnifiedCanvas';
import { CANVAS_MODE_PRESETS } from '@/components/canvas/types/canvasTypes';
import { useCircuitStore } from '@/stores/circuitStore';
import type { Gate } from '@/types/circuit';

// localStorage のモック
const localStorageMock = {
  getItem: vi.fn(() => '[]'),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

describe('BINARY_COUNTER Gate Rendering', () => {
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

  test('should render BINARY_COUNTER gate correctly', async () => {
    // BINARY_COUNTERゲートを作成
    const binaryCounterGate: Gate = {
      id: 'counter-1',
      type: 'BINARY_COUNTER',
      position: { x: 300, y: 200 },
      inputs: [false], // CLK入力
      output: false,
      metadata: {
        bitCount: 2,
        currentValue: 0,
      },
    };

    // ストアにゲートを追加
    useCircuitStore.setState({
      gates: [binaryCounterGate],
      wires: [],
    });

    // Canvasをレンダー
    const { container } = render(
      <UnifiedCanvas 
        config={CANVAS_MODE_PRESETS.editor}
        dataSource={{ store: true }}
        handlers={{}}
      />
    );

    // SVG要素が存在することを確認
    const svgElement = container.querySelector('svg.unified-canvas__svg');
    expect(svgElement).toBeTruthy();

    // BINARY_COUNTERゲート要素が存在することを確認
    const gateElement = container.querySelector('[data-gate-type="BINARY_COUNTER"]');
    expect(gateElement).toBeTruthy();

    // ゲートのrect要素を確認（width="120"を持つ）
    const rectElement = container.querySelector('rect[width="120"]');
    console.log('BINARY_COUNTER rect element:', rectElement);
    expect(rectElement).toBeTruthy();

    // カウンターのラベル要素を確認
    const counterLabel = container.querySelector('[data-testid="counter-label"]');
    expect(counterLabel).toBeTruthy();
    expect(counterLabel?.textContent).toBe('COUNTER');

    // ビット数ラベルを確認
    const bitLabel = container.querySelector('[data-testid="counter-bit-label"]');
    expect(bitLabel).toBeTruthy();
    expect(bitLabel?.textContent).toBe('2bit');

    // 現在値を確認
    const valueLabel = container.querySelector('[data-testid="counter-value"]');
    expect(valueLabel).toBeTruthy();
    expect(valueLabel?.textContent).toBe('00');

    // デバッグ: SVGの内容を出力
    console.log('SVG content:', svgElement?.innerHTML.substring(0, 1000));
    console.log('All rect elements:', container.querySelectorAll('rect'));
  });

  test('should render BINARY_COUNTER with different bit counts', async () => {
    // 3ビットカウンターを作成
    const binaryCounterGate: Gate = {
      id: 'counter-3bit',
      type: 'BINARY_COUNTER',
      position: { x: 300, y: 200 },
      inputs: [false], // CLK入力
      output: false,
      metadata: {
        bitCount: 3,
        currentValue: 5, // 101
      },
    };

    // ストアにゲートを追加
    useCircuitStore.setState({
      gates: [binaryCounterGate],
    });

    // Canvasをレンダー
    const { container } = render(
      <UnifiedCanvas 
        config={CANVAS_MODE_PRESETS.editor}
        dataSource={{ store: true }}
        handlers={{}}
      />
    );

    // 3ビットラベルを確認
    const bitLabel = container.querySelector('[data-testid="counter-bit-label"]');
    expect(bitLabel).toBeTruthy();
    expect(bitLabel?.textContent).toBe('3bit');

    // 現在値を確認（101）
    const valueLabel = container.querySelector('[data-testid="counter-value"]');
    expect(valueLabel).toBeTruthy();
    expect(valueLabel?.textContent).toBe('101');

    // 高さが動的に調整されているか確認
    const rectElement = container.querySelector('rect[width="120"]');
    expect(rectElement).toBeTruthy();
    const height = rectElement?.getAttribute('height');
    expect(Number(height)).toBeGreaterThan(80); // 3ビットなので基本の80pxより大きい
  });

  test('should handle BINARY_COUNTER without metadata', async () => {
    // メタデータなしのBINARY_COUNTERゲート
    const binaryCounterGate: Gate = {
      id: 'counter-no-metadata',
      type: 'BINARY_COUNTER',
      position: { x: 300, y: 200 },
      inputs: [false], // CLK入力
      output: false,
      // metadata なし
    };

    // ストアにゲートを追加
    useCircuitStore.setState({
      gates: [binaryCounterGate],
    });

    // Canvasをレンダー
    const { container } = render(
      <UnifiedCanvas 
        config={CANVAS_MODE_PRESETS.editor}
        dataSource={{ store: true }}
        handlers={{}}
      />
    );

    // デフォルト値でレンダリングされることを確認
    const bitLabel = container.querySelector('[data-testid="counter-bit-label"]');
    expect(bitLabel).toBeTruthy();
    expect(bitLabel?.textContent).toBe('2bit'); // デフォルト

    const valueLabel = container.querySelector('[data-testid="counter-value"]');
    expect(valueLabel).toBeTruthy();
    expect(valueLabel?.textContent).toBe('00'); // デフォルト
  });
});
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UnifiedCanvas } from '@/components/canvas/UnifiedCanvas';
import { CANVAS_MODE_PRESETS } from '@/components/canvas/types/canvasTypes';
import { useCircuitStore } from '@/stores/circuitStore';
import { GateFactory } from '@/models/gates/GateFactory';
import type { Gate } from '@/types/circuit';

// localStorage のモック
const localStorageMock = {
  getItem: vi.fn(() => '[]'),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

describe('BINARY_COUNTER Complete Integration', () => {
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

  test('should create BINARY_COUNTER with correct factory settings', () => {
    // GateFactoryでBINARY_COUNTERを作成
    const counterGate = GateFactory.createGate('BINARY_COUNTER', { x: 300, y: 200 });

    expect(counterGate.type).toBe('BINARY_COUNTER');
    expect(counterGate.inputs).toEqual(['']); // CLK入力のみ
    expect(counterGate.outputs).toEqual([false, false]); // 2ビット出力
    expect(counterGate.metadata?.bitCount).toBe(2);
    expect(counterGate.metadata?.currentValue).toBe(0);
    expect(counterGate.metadata?.previousClockState).toBe(false);
  });

  test('should render BINARY_COUNTER with correct SVG elements', async () => {
    // BINARY_COUNTERゲートを作成してストアに追加
    const counterGate = GateFactory.createGate('BINARY_COUNTER', { x: 300, y: 200 });
    useCircuitStore.setState({
      gates: [counterGate],
    });

    // Canvasをレンダー
    const { container } = render(
      <UnifiedCanvas 
        config={CANVAS_MODE_PRESETS.editor}
        dataSource={{ store: true }}
        handlers={{}}
      />
    );

    // SVGとゲート要素の確認
    const svgElement = container.querySelector('svg.unified-canvas__svg');
    expect(svgElement).toBeTruthy();

    const gateElement = container.querySelector('[data-gate-type="BINARY_COUNTER"]');
    expect(gateElement).toBeTruthy();

    // 期待される120px幅のrect要素（テストで失敗していた要素）
    const rectElement = container.querySelector('rect[width="120"]');
    expect(rectElement).toBeTruthy();
    expect(rectElement?.getAttribute('height')).toBe('80'); // デフォルト高さ

    // テキスト要素の確認
    const counterLabel = container.querySelector('[data-testid="counter-label"]');
    expect(counterLabel).toBeTruthy();
    expect(counterLabel?.textContent).toBe('COUNTER');

    const bitLabel = container.querySelector('[data-testid="counter-bit-label"]');
    expect(bitLabel).toBeTruthy();
    expect(bitLabel?.textContent).toBe('2bit');

    const valueLabel = container.querySelector('[data-testid="counter-value"]');
    expect(valueLabel).toBeTruthy();
    expect(valueLabel?.textContent).toBe('00'); // 2進数表現（修正済み）
  });

  test('should render BINARY_COUNTER with different bit counts', async () => {
    // 3ビットカウンターを作成
    const counterGate: Gate = {
      id: 'counter-3bit',
      type: 'BINARY_COUNTER',
      position: { x: 300, y: 200 },
      inputs: [''],
      output: false,
      outputs: [false, false, false], // 3ビット
      metadata: {
        bitCount: 3,
        currentValue: 5, // 101 in binary
        previousClockState: false,
      },
    };

    useCircuitStore.setState({
      gates: [counterGate],
    });

    const { container } = render(
      <UnifiedCanvas 
        config={CANVAS_MODE_PRESETS.editor}
        dataSource={{ store: true }}
        handlers={{}}
      />
    );

    // 3ビット表示の確認
    const bitLabel = container.querySelector('[data-testid="counter-bit-label"]');
    expect(bitLabel?.textContent).toBe('3bit');

    // 値5の2進数表現（101）の確認
    const valueLabel = container.querySelector('[data-testid="counter-value"]');
    expect(valueLabel?.textContent).toBe('101');

    // 高さが動的に調整されることを確認
    const rectElement = container.querySelector('rect[width="120"]');
    const height = Number(rectElement?.getAttribute('height'));
    expect(height).toBeGreaterThan(80); // 3ビットなので基本の80pxより大きい
  });

  test('should handle BINARY_COUNTER without metadata gracefully', async () => {
    // メタデータなしのBINARY_COUNTERゲート
    const counterGate: Gate = {
      id: 'counter-no-metadata',
      type: 'BINARY_COUNTER',
      position: { x: 300, y: 200 },
      inputs: [''],
      output: false,
      // metadataなし
    };

    useCircuitStore.setState({
      gates: [counterGate],
    });

    const { container } = render(
      <UnifiedCanvas 
        config={CANVAS_MODE_PRESETS.editor}
        dataSource={{ store: true }}
        handlers={{}}
      />
    );

    // デフォルト値でレンダリングされることを確認
    await waitFor(() => {
      const bitLabel = container.querySelector('[data-testid="counter-bit-label"]');
      expect(bitLabel?.textContent).toBe('2bit'); // デフォルト

      const valueLabel = container.querySelector('[data-testid="counter-value"]');
      expect(valueLabel?.textContent).toBe('00'); // デフォルト
    });
  });

  test('should correctly display binary representation for various values', async () => {
    const testCases = [
      { value: 0, bits: 2, expected: '00' },
      { value: 1, bits: 2, expected: '01' },
      { value: 2, bits: 2, expected: '10' },
      { value: 3, bits: 2, expected: '11' },
      { value: 7, bits: 3, expected: '111' },
      { value: 15, bits: 4, expected: '1111' },
    ];

    for (const testCase of testCases) {
      const counterGate: Gate = {
        id: `counter-${testCase.value}`,
        type: 'BINARY_COUNTER',
        position: { x: 300, y: 200 },
        inputs: [''],
        output: false,
        metadata: {
          bitCount: testCase.bits,
          currentValue: testCase.value,
          previousClockState: false,
        },
      };

      useCircuitStore.setState({
        gates: [counterGate],
      });

      const { container, unmount } = render(
        <UnifiedCanvas 
          config={CANVAS_MODE_PRESETS.editor}
          dataSource={{ store: true }}
          handlers={{}}
        />
      );

      const valueLabel = container.querySelector('[data-testid="counter-value"]');
      expect(valueLabel?.textContent).toBe(testCase.expected);

      unmount();
    }
  });
});
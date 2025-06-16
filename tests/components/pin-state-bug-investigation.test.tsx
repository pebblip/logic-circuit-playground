/**
 * ピン状態バグの詳細調査
 */

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { PinComponent } from '@/components/gate-renderers/PinComponent';
import type { Gate } from '@/types/circuit';
import * as simulation from '@/domain/simulation';

// Mock getGateInputValue
vi.mock('@/domain/simulation', () => ({
  getGateInputValue: vi.fn(),
}));

describe('ピン状態バグの詳細調査', () => {
  const mockOnPinClick = vi.fn();

  it('getGateInputValueの戻り値とピン表示の一致を確認', () => {
    const gate: Gate = {
      id: 'test-gate',
      type: 'NAND',
      position: { x: 100, y: 100 },
      inputs: ['1', ''], // 上がON、下がOFF
      output: false,
    };

    // getGateInputValueのモック設定
    vi.mocked(simulation.getGateInputValue)
      .mockReturnValueOnce(true)   // 最初の呼び出し: index 0 = true
      .mockReturnValueOnce(false); // 2回目の呼び出し: index 1 = false

    const { container } = render(
      <svg>
        {/* 上のピン（index=0, ON） */}
        <PinComponent
          gate={gate}
          x={-45}
          y={-10}
          pinIndex={0}
          isOutput={false}
          onPinClick={mockOnPinClick}
        />
        {/* 下のピン（index=1, OFF） */}
        <PinComponent
          gate={gate}
          x={-45}
          y={10}
          pinIndex={1}
          isOutput={false}
          onPinClick={mockOnPinClick}
        />
      </svg>
    );

    const pins = container.querySelectorAll('circle.pin');
    console.log('ピン数:', pins.length);
    
    // 各ピンの状態を確認
    pins.forEach((pin, i) => {
      console.log(`ピン[${i}]:`, {
        classes: pin.className.baseVal,
        fill: pin.getAttribute('fill'),
        cy: pin.getAttribute('cy'),
      });
    });

    // getGateInputValueの呼び出しを確認
    console.log('getGateInputValue呼び出し:', 
      vi.mocked(simulation.getGateInputValue).mock.calls
    );

    // 期待値の確認
    const topPin = Array.from(pins).find(p => p.getAttribute('cy') === '-10');
    const bottomPin = Array.from(pins).find(p => p.getAttribute('cy') === '10');

    expect(topPin).toBeTruthy();
    expect(topPin).toHaveClass('active');
    expect(topPin).toHaveAttribute('fill', '#00ff88');

    expect(bottomPin).toBeTruthy();
    expect(bottomPin).not.toHaveClass('active');
    expect(bottomPin).toHaveAttribute('fill', 'none');
  });

  it('gate.inputsとgetGateInputValueの整合性', () => {
    const gate: Gate = {
      id: 'test-gate',
      type: 'AND',
      position: { x: 100, y: 100 },
      inputs: ['1', ''], // 文字列として保存
      output: false,
    };

    // getGateInputValueの実装をシミュレート
    vi.mocked(simulation.getGateInputValue).mockImplementation((g, index) => {
      console.log(`getGateInputValue called:`, {
        gateId: g.id,
        index,
        inputValue: g.inputs[index],
        inputType: typeof g.inputs[index],
      });
      
      // 実際の実装と同じロジック
      const input = g.inputs[index];
      return input === '1' || input === true;
    });

    const { rerender } = render(
      <svg>
        <PinComponent
          gate={gate}
          x={-45}
          y={-10}
          pinIndex={0}
          isOutput={false}
          onPinClick={mockOnPinClick}
        />
      </svg>
    );

    // 初期状態の確認
    let pin = document.querySelector('circle.pin');
    expect(pin).toHaveClass('active');

    // gate.inputsを更新
    const updatedGate = {
      ...gate,
      inputs: ['', ''], // 両方OFFに
    };

    // 再レンダリング
    rerender(
      <svg>
        <PinComponent
          gate={updatedGate}
          x={-45}
          y={-10}
          pinIndex={0}
          isOutput={false}
          onPinClick={mockOnPinClick}
        />
      </svg>
    );

    // 更新後の確認
    pin = document.querySelector('circle.pin');
    expect(pin).not.toHaveClass('active');
  });

  it('isActiveプロパティの優先順位を確認', () => {
    const gate: Gate = {
      id: 'test-gate',
      type: 'AND',
      position: { x: 100, y: 100 },
      inputs: ['', ''], // 両方OFF
      output: false,
    };

    // getGateInputValueは常にfalseを返す
    vi.mocked(simulation.getGateInputValue).mockReturnValue(false);

    // isActiveプロパティを明示的に指定
    const { container } = render(
      <svg>
        <PinComponent
          gate={gate}
          x={-45}
          y={-10}
          pinIndex={0}
          isOutput={false}
          isActive={true} // 明示的にtrue
          onPinClick={mockOnPinClick}
        />
      </svg>
    );

    const pin = container.querySelector('circle.pin');
    
    // isActiveが優先されるはず
    expect(pin).toHaveClass('active');
    expect(pin).toHaveAttribute('fill', '#00ff88');
    
    // getGateInputValueは呼ばれないはず（isActiveが指定されているため）
    expect(simulation.getGateInputValue).not.toHaveBeenCalled();
  });
});
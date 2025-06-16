import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PinComponent } from '@/components/gate-renderers/PinComponent';
import { BasicGateRenderer } from '@/components/gate-renderers/BasicGateRenderer';
import type { Gate } from '@/types/circuit';

describe('PinComponent State Display', () => {
  it('should display correct active state when isActive prop is passed', () => {
    const mockGate: Gate = {
      id: 'test-gate',
      type: 'NAND',
      position: { x: 0, y: 0 },
      inputs: ['', '1'],
      output: true,
      metadata: {},
    };

    const { container } = render(
      <svg>
        <PinComponent
          gate={mockGate}
          x={100}
          y={100}
          pinIndex={0}
          isOutput={false}
          isActive={false}
          onPinClick={() => {}}
        />
      </svg>
    );

    // 非アクティブなピンの確認
    const circle = container.querySelector('circle.pin');
    expect(circle).toBeTruthy();
    expect(circle?.getAttribute('fill')).toBe('none');
  });

  it('should display active state correctly', () => {
    const mockGate: Gate = {
      id: 'test-gate',
      type: 'NAND',
      position: { x: 0, y: 0 },
      inputs: ['1', '1'],
      output: false,
      metadata: {},
    };

    const { container } = render(
      <svg>
        <PinComponent
          gate={mockGate}
          x={100}
          y={100}
          pinIndex={1}
          isOutput={false}
          isActive={true}
          onPinClick={() => {}}
        />
      </svg>
    );

    // アクティブなピンの確認
    const circle = container.querySelector('circle.pin');
    expect(circle).toBeTruthy();
    expect(circle?.getAttribute('fill')).toBe('#00ff88');
  });

  it('should render NAND gate with correct input pin states', () => {
    const mockGate: Gate = {
      id: 'nand-gate',
      type: 'NAND',
      position: { x: 0, y: 0 },
      inputs: ['', '1'], // 上がOFF、下がON
      output: true,
      metadata: {},
    };

    const { container } = render(
      <svg>
        <BasicGateRenderer
          gate={mockGate}
          isSelected={false}
          handleMouseDown={() => {}}
          handleTouchStart={() => {}}
          handlePinClick={() => {}}
          handleGateClick={() => {}}
        />
      </svg>
    );

    // 入力ピンを取得
    const inputPins = container.querySelectorAll('.pin.input-pin');
    expect(inputPins.length).toBe(2);

    // 各ピンのfill属性を確認
    const pinFills = Array.from(inputPins).map(pin => 
      pin.getAttribute('fill')
    );

    // BasicGateRendererはreverse()を使うので、DOM上の順序は逆
    // DOM上の最初のピン（実際は下のピン、inputs[1]）はONなので#00ff88
    expect(pinFills[0]).toBe('#00ff88');
    // DOM上の2番目のピン（実際は上のピン、inputs[0]）はOFFなのでnone
    expect(pinFills[1]).toBe('none');
  });

  it('should update pin states when gate inputs change', () => {
    const mockGate1: Gate = {
      id: 'nand-gate',
      type: 'NAND',
      position: { x: 0, y: 0 },
      inputs: ['1', '1'],
      output: false,
      metadata: {},
    };

    const { container, rerender } = render(
      <svg>
        <BasicGateRenderer
          gate={mockGate1}
          isSelected={false}
          handleMouseDown={() => {}}
          handleTouchStart={() => {}}
          handlePinClick={() => {}}
          handleGateClick={() => {}}
        />
      </svg>
    );

    // 初期状態：両方の入力がON
    const inputPins1 = container.querySelectorAll('.pin.input-pin');
    expect(inputPins1[0].getAttribute('fill')).toBe('#00ff88');
    expect(inputPins1[1].getAttribute('fill')).toBe('#00ff88');

    // 上の入力をOFFに変更
    const mockGate2: Gate = {
      ...mockGate1,
      inputs: ['', '1'],
      output: true,
    };

    rerender(
      <svg>
        <BasicGateRenderer
          gate={mockGate2}
          isSelected={false}
          handleMouseDown={() => {}}
          handleTouchStart={() => {}}
          handlePinClick={() => {}}
          handleGateClick={() => {}}
        />
      </svg>
    );

    // 更新後の状態確認（DOM順序は逆）
    const inputPins2 = container.querySelectorAll('.pin.input-pin');
    // DOM上の最初のピン（実際は下のピン、inputs[1]）はONなので#00ff88
    expect(inputPins2[0].getAttribute('fill')).toBe('#00ff88');
    // DOM上の2番目のピン（実際は上のピン、inputs[0]）はOFFなのでnone
    expect(inputPins2[1].getAttribute('fill')).toBe('none');
  });
});
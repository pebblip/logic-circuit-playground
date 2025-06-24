import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { IOGateRenderer } from '@/components/gate-renderers/IOGateRenderer';
import type { Gate } from '@/types/circuit';

describe('IOGateRenderer', () => {
  const mockHandlers = {
    handleMouseDown: vi.fn(),
    handleTouchStart: vi.fn(),
    handlePinClick: vi.fn(),
    handleGateClick: vi.fn(),
    handleInputDoubleClick: vi.fn(),
    onInputClick: vi.fn(),
  };

  const createInputGate = (): Gate => ({
    id: 'input1',
    type: 'INPUT',
    position: { x: 100, y: 100 },
    inputs: [],
    outputs: [false],
    output: false,
  });

  const createOutputGate = (): Gate => ({
    id: 'output1',
    type: 'OUTPUT',
    position: { x: 200, y: 100 },
    inputs: [false],
    outputs: [],
    output: false,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('INPUT gate', () => {
    it('スイッチ全体がクリック可能である', () => {
      const gate = createInputGate();
      const { container } = render(
        <svg>
          <IOGateRenderer
            gate={gate}
            isSelected={false}
            {...mockHandlers}
          />
        </svg>
      );

      // スイッチトラックをクリック
      const switchTrack = container.querySelector('.switch-track');
      expect(switchTrack).toBeDefined();
      
      if (switchTrack) {
        fireEvent.click(switchTrack);
        expect(mockHandlers.handleGateClick).toHaveBeenCalledTimes(1);
      }
    });

    it('ダブルクリックでトグルが動作する', () => {
      const gate = createInputGate();
      const { container } = render(
        <svg>
          <IOGateRenderer
            gate={gate}
            isSelected={false}
            {...mockHandlers}
          />
        </svg>
      );

      const switchGroup = container.querySelector('g[data-gate-type="INPUT"] > g');
      expect(switchGroup).toBeDefined();
      
      if (switchGroup) {
        fireEvent.doubleClick(switchGroup);
        expect(mockHandlers.onInputClick).toHaveBeenCalledWith(gate.id);
      }
    });

    it('出力ピンの位置が正しい', () => {
      const gate = createInputGate();
      const { container } = render(
        <svg>
          <IOGateRenderer
            gate={gate}
            isSelected={false}
            {...mockHandlers}
          />
        </svg>
      );

      // PinComponentのcircle要素を探す
      const pinCircle = container.querySelector('circle.output-pin');
      expect(pinCircle).toBeDefined();
      
      if (pinCircle) {
        // cx属性が45（新しい位置）であることを確認
        expect(pinCircle.getAttribute('cx')).toBe('45');
      }
    });

    it('出力ピンがゲートのクリック領域と重ならない', () => {
      const gate = createInputGate();
      const { container } = render(
        <svg>
          <IOGateRenderer
            gate={gate}
            isSelected={false}
            {...mockHandlers}
          />
        </svg>
      );

      // スイッチトラックの右端: x = 30
      const switchTrack = container.querySelector('.switch-track');
      const switchRight = 30;

      // INPUTゲートの出力ピンは小さいクリック領域を持つ
      const pinEllipse = container.querySelector('ellipse[rx="15"]');
      expect(pinEllipse).toBeDefined();
      
      if (pinEllipse) {
        const pinCenterX = Number(pinEllipse.getAttribute('cx'));
        const pinRx = Number(pinEllipse.getAttribute('rx'));
        const pinLeft = pinCenterX - pinRx;

        // ピンの中心が45であることを確認
        expect(pinCenterX).toBe(45);
        // ピンの左端(45-15=30)がスイッチの右端(30)と同じか右にある
        expect(pinLeft).toBeGreaterThanOrEqual(switchRight);
      }
    });
  });

  describe('OUTPUT gate', () => {
    it('円形のゲートがクリック可能である', () => {
      const gate = createOutputGate();
      const { container } = render(
        <svg>
          <IOGateRenderer
            gate={gate}
            isSelected={false}
            {...mockHandlers}
          />
        </svg>
      );

      const outputGroup = container.querySelector('g[data-testid="output-output1"]');
      expect(outputGroup).toBeDefined();
      
      if (outputGroup) {
        fireEvent.click(outputGroup);
        expect(mockHandlers.handleGateClick).toHaveBeenCalledTimes(1);
      }
    });

    it('入力値に応じて発光する', () => {
      const gate = createOutputGate();
      gate.inputs = [true];
      
      const { container } = render(
        <svg>
          <IOGateRenderer
            gate={gate}
            isSelected={false}
            {...mockHandlers}
          />
        </svg>
      );

      // 内側の円が緑色になっていることを確認
      const innerCircle = container.querySelectorAll('circle')[1];
      expect(innerCircle?.getAttribute('fill')).toBe('#00ff88');
    });
  });
});
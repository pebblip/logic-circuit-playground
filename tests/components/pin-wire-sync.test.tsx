/**
 * ピンとワイヤーの状態同期テスト
 * 
 * 問題：
 * 1. ワイヤー接続時、ピンの初期状態がワイヤーと同期しない
 * 2. 一度アクティブになったピンが、INPUTをOFFにしても非アクティブに戻らない
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BasicGateRenderer } from '@/components/gate-renderers/BasicGateRenderer';
import { PinComponent } from '@/components/gate-renderers/PinComponent';
import type { Gate } from '@/types/circuit';
import * as simulation from '@/domain/simulation';

// Mock getGateInputValue
vi.mock('@/domain/simulation', () => ({
  getGateInputValue: vi.fn(),
}));

describe('ピンとワイヤーの状態同期', () => {
  const mockHandleMouseDown = vi.fn();
  const mockHandleTouchStart = vi.fn();
  const mockHandlePinClick = vi.fn();
  const mockHandleGateClick = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('NANDゲートのピン状態表示', () => {
    it('INPUTがONの時、接続されたピンも緑色で表示される', () => {
      // INPUTがONの状態
      vi.mocked(simulation.getGateInputValue).mockImplementation((gate, index) => {
        if (index === 0) return true;  // 上の入力ピンはON
        if (index === 1) return false; // 下の入力ピンはOFF
        return false;
      });

      const nandGate: Gate = {
        id: 'nand-1',
        type: 'NAND',
        position: { x: 200, y: 100 },
        inputs: ['1', ''], // 上がON、下がOFF
        output: true, // NANDなので出力はtrue
      };

      const { container } = render(
        <svg>
          <BasicGateRenderer
            gate={nandGate}
            isSelected={false}
            handleMouseDown={mockHandleMouseDown}
            handleTouchStart={mockHandleTouchStart}
            handlePinClick={mockHandlePinClick}
            handleGateClick={mockHandleGateClick}
          />
        </svg>
      );

      // 上の入力ピン（index=0）を確認
      const pins = container.querySelectorAll('circle.pin.input-pin');
      expect(pins.length).toBe(2);
      
      // Y座標で上のピンを特定（y=-10）
      const topPin = Array.from(pins).find(pin => pin.getAttribute('cy') === '-10');
      const bottomPin = Array.from(pins).find(pin => pin.getAttribute('cy') === '10');
      
      // デバッグ: HTMLを出力
      console.log('Rendered HTML:', container.innerHTML);
      console.log('Top pin (y=-10) classes:', topPin?.className.baseVal);
      console.log('Top pin (y=-10) fill:', topPin?.getAttribute('fill'));
      console.log('Bottom pin (y=10) classes:', bottomPin?.className.baseVal);
      console.log('Bottom pin (y=10) fill:', bottomPin?.getAttribute('fill'));
      
      // 上のピンが緑色（active）であることを確認
      expect(topPin).toBeTruthy();
      expect(topPin).toHaveClass('active');
      expect(topPin).toHaveAttribute('fill', '#00ff88');
      
      // 下のピンが非アクティブであることを確認
      expect(bottomPin).toBeTruthy();
      expect(bottomPin).not.toHaveClass('active');
      expect(bottomPin).toHaveAttribute('fill', 'none');
    });

    it('INPUTをOFFに変更した時、ピンもグレーに更新される', () => {
      // 初期状態：INPUTがON
      vi.mocked(simulation.getGateInputValue).mockReturnValue(true);

      const nandGate: Gate = {
        id: 'nand-1',
        type: 'NAND',
        position: { x: 200, y: 100 },
        inputs: ['1', '1'],
        output: false,
      };

      const { container, rerender } = render(
        <svg>
          <BasicGateRenderer
            gate={nandGate}
            isSelected={false}
            handleMouseDown={mockHandleMouseDown}
            handleTouchStart={mockHandleTouchStart}
            handlePinClick={mockHandlePinClick}
            handleGateClick={mockHandleGateClick}
          />
        </svg>
      );

      // 初期状態：ピンは緑色
      let pins = container.querySelectorAll('circle.pin.input-pin');
      expect(pins[0]).toHaveClass('active');

      // INPUTをOFFに変更
      vi.mocked(simulation.getGateInputValue).mockReturnValue(false);
      
      const updatedGate: Gate = {
        ...nandGate,
        inputs: ['', ''], // 両方OFFに変更
        output: true,
      };

      rerender(
        <svg>
          <BasicGateRenderer
            gate={updatedGate}
            isSelected={false}
            handleMouseDown={mockHandleMouseDown}
            handleTouchStart={mockHandleTouchStart}
            handlePinClick={mockHandlePinClick}
            handleGateClick={mockHandleGateClick}
          />
        </svg>
      );

      // 更新後：ピンはグレーになるべき
      pins = container.querySelectorAll('circle.pin.input-pin');
      expect(pins[0]).not.toHaveClass('active');
      expect(pins[0]).toHaveAttribute('fill', 'none');
    });

    it('複数回の状態変更でも正しく同期される', () => {
      const nandGate: Gate = {
        id: 'nand-1',
        type: 'NAND',
        position: { x: 200, y: 100 },
        inputs: ['', ''],
        output: true,
      };

      const { container, rerender } = render(
        <svg>
          <BasicGateRenderer
            gate={nandGate}
            isSelected={false}
            handleMouseDown={mockHandleMouseDown}
            handleTouchStart={mockHandleTouchStart}
            handlePinClick={mockHandlePinClick}
            handleGateClick={mockHandleGateClick}
          />
        </svg>
      );

      // サイクル: OFF → ON → OFF → ON
      const states = [false, true, false, true];
      const inputStates = ['', '1', '', '1'];

      states.forEach((state, index) => {
        vi.mocked(simulation.getGateInputValue).mockReturnValue(state);
        
        const updatedGate: Gate = {
          ...nandGate,
          inputs: [inputStates[index], inputStates[index]],
        };

        rerender(
          <svg>
            <BasicGateRenderer
              gate={updatedGate}
              isSelected={false}
              handleMouseDown={mockHandleMouseDown}
              handleTouchStart={mockHandleTouchStart}
              handlePinClick={mockHandlePinClick}
              handleGateClick={mockHandleGateClick}
            />
          </svg>
        );

        const pins = container.querySelectorAll('circle.pin.input-pin');
        if (state) {
          expect(pins[0]).toHaveClass('active');
          expect(pins[0]).toHaveAttribute('fill', '#00ff88');
        } else {
          expect(pins[0]).not.toHaveClass('active');
          expect(pins[0]).toHaveAttribute('fill', 'none');
        }
      });
    });
  });

  describe('PinComponentの直接テスト', () => {
    it('isActiveプロパティが正しく反映される', () => {
      const gate: Gate = {
        id: 'test-gate',
        type: 'NAND',
        position: { x: 100, y: 100 },
        inputs: ['1', ''],
        output: false,
      };

      // isActive=trueの場合
      const { container: container1 } = render(
        <svg>
          <PinComponent
            gate={gate}
            x={50}
            y={0}
            pinIndex={0}
            isOutput={false}
            isActive={true}
            onPinClick={mockHandlePinClick}
          />
        </svg>
      );

      const activePin = container1.querySelector('circle.pin');
      expect(activePin).toHaveAttribute('fill', '#00ff88');

      // isActive=falseの場合
      const { container: container2 } = render(
        <svg>
          <PinComponent
            gate={gate}
            x={50}
            y={0}
            pinIndex={0}
            isOutput={false}
            isActive={false}
            onPinClick={mockHandlePinClick}
          />
        </svg>
      );

      const inactivePin = container2.querySelector('circle.pin');
      expect(inactivePin).toHaveAttribute('fill', 'none');
    });

    it('getGateInputValueの値が正しく使用される', () => {
      const gate: Gate = {
        id: 'test-gate',
        type: 'NAND',
        position: { x: 100, y: 100 },
        inputs: ['1', ''], // 上がON
        output: false,
      };

      // getGateInputValueがtrueを返す
      vi.mocked(simulation.getGateInputValue).mockReturnValue(true);

      const { container } = render(
        <svg>
          <BasicGateRenderer
            gate={gate}
            isSelected={false}
            handleMouseDown={mockHandleMouseDown}
            handleTouchStart={mockHandleTouchStart}
            handlePinClick={mockHandlePinClick}
            handleGateClick={mockHandleGateClick}
          />
        </svg>
      );

      // getGateInputValueが呼ばれたことを確認
      expect(simulation.getGateInputValue).toHaveBeenCalledWith(gate, 0);
      expect(simulation.getGateInputValue).toHaveBeenCalledWith(gate, 1);

      // ピンが正しく表示されることを確認
      const pins = container.querySelectorAll('circle.pin.input-pin');
      expect(pins[0]).toHaveClass('active');
    });
  });
});
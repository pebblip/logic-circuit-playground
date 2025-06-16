/**
 * ピンのレンダリング順序確認テスト
 * reverse()処理がDOM順序と状態同期に与える影響を検証
 */

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BasicGateRenderer } from '@/components/gate-renderers/BasicGateRenderer';
import type { Gate } from '@/types/circuit';
import * as simulation from '@/domain/simulation';

// Mock getGateInputValue
vi.mock('@/domain/simulation', () => ({
  getGateInputValue: vi.fn(),
}));

describe('ピンのレンダリング順序と状態同期', () => {
  const mockHandlers = {
    handleMouseDown: vi.fn(),
    handleTouchStart: vi.fn(),
    handlePinClick: vi.fn(),
    handleGateClick: vi.fn(),
  };

  it('NANDゲートのピンがDOM上で正しい順序でレンダリングされる', () => {
    // 上のピンがON、下のピンがOFF
    vi.mocked(simulation.getGateInputValue).mockImplementation((gate, index) => {
      return index === 0; // index 0 (上のピン) だけON
    });

    const nandGate: Gate = {
      id: 'nand-1',
      type: 'NAND',
      position: { x: 200, y: 100 },
      inputs: ['1', ''], // 上がON、下がOFF
      output: true,
    };

    const { container } = render(
      <svg>
        <BasicGateRenderer
          gate={nandGate}
          isSelected={false}
          {...mockHandlers}
        />
      </svg>
    );

    // DOM要素を取得
    const pins = container.querySelectorAll('circle.pin.input-pin');
    const pinGroups = container.querySelectorAll('g > circle.pin.input-pin');
    
    console.log('ピン数:', pins.length);
    console.log('各ピンの情報:');
    
    pins.forEach((pin, domIndex) => {
      const parent = pin.parentElement;
      const y = parent?.querySelector('circle')?.getAttribute('cy');
      const isActive = pin.classList.contains('active');
      const fill = pin.getAttribute('fill');
      
      console.log(`DOM順序[${domIndex}] - Y座標: ${y}, Active: ${isActive}, Fill: ${fill}`);
    });

    // getGateInputValueの呼び出し順序を確認
    console.log('\ngetGateInputValue呼び出し:');
    const calls = vi.mocked(simulation.getGateInputValue).mock.calls;
    calls.forEach((call, i) => {
      console.log(`呼び出し[${i}] - pinIndex: ${call[1]}`);
    });

    // 期待値：
    // - 上のピン（y=-10, index=0）がアクティブ
    // - 下のピン（y=10, index=1）が非アクティブ
    expect(pins).toHaveLength(2);
    
    // DOM順序と論理的順序の対応を確認
    const topPinInDOM = Array.from(pins).find(pin => {
      const y = pin.parentElement?.querySelector('circle')?.getAttribute('cy');
      return y === '-10';
    });
    
    const bottomPinInDOM = Array.from(pins).find(pin => {
      const y = pin.parentElement?.querySelector('circle')?.getAttribute('cy');
      return y === '10';
    });

    console.log('\n上のピン（y=-10）:', {
      found: !!topPinInDOM,
      active: topPinInDOM?.classList.contains('active'),
      fill: topPinInDOM?.getAttribute('fill'),
    });
    
    console.log('下のピン（y=10）:', {
      found: !!bottomPinInDOM,
      active: bottomPinInDOM?.classList.contains('active'),
      fill: bottomPinInDOM?.getAttribute('fill'),
    });

    // 上のピンがアクティブであることを確認
    expect(topPinInDOM).toBeTruthy();
    expect(topPinInDOM).toHaveClass('active');
    expect(topPinInDOM).toHaveAttribute('fill', '#00ff88');
    
    // 下のピンが非アクティブであることを確認
    expect(bottomPinInDOM).toBeTruthy();
    expect(bottomPinInDOM).not.toHaveClass('active');
    expect(bottomPinInDOM).toHaveAttribute('fill', 'none');
  });

  it('reverse()処理がkey属性とpinIndexの対応に影響するか確認', () => {
    const gate: Gate = {
      id: 'test-gate',
      type: 'AND',
      position: { x: 100, y: 100 },
      inputs: ['1', ''],
      output: false,
    };

    // 各ピンのisActiveを記録
    const pinStates = new Map<number, boolean>();
    vi.mocked(simulation.getGateInputValue).mockImplementation((_, index) => {
      const isActive = index === 0;
      pinStates.set(index, isActive);
      return isActive;
    });

    const { container, rerender } = render(
      <svg>
        <BasicGateRenderer
          gate={gate}
          isSelected={false}
          {...mockHandlers}
        />
      </svg>
    );

    // 初回レンダリング時の状態を記録
    const initialPins = Array.from(container.querySelectorAll('circle.pin.input-pin'));
    const initialStates = initialPins.map(pin => ({
      y: pin.getAttribute('cy'),
      active: pin.classList.contains('active'),
      fill: pin.getAttribute('fill'),
    }));

    console.log('\n初回レンダリング:', initialStates);

    // 状態を反転
    vi.mocked(simulation.getGateInputValue).mockImplementation((_, index) => {
      return index === 1; // 今度は下のピンだけON
    });

    // 再レンダリング
    rerender(
      <svg>
        <BasicGateRenderer
          gate={{...gate, inputs: ['', '1']}} // 入力状態を反転
          isSelected={false}
          {...mockHandlers}
        />
      </svg>
    );

    // 再レンダリング後の状態を確認
    const updatedPins = Array.from(container.querySelectorAll('circle.pin.input-pin'));
    const updatedStates = updatedPins.map(pin => ({
      y: pin.getAttribute('cy'),
      active: pin.classList.contains('active'),
      fill: pin.getAttribute('fill'),
    }));

    console.log('\n再レンダリング後:', updatedStates);

    // Y座標が同じピンの状態が正しく更新されているか確認
    const topPinBefore = initialStates.find(s => s.y === '-10');
    const topPinAfter = updatedStates.find(s => s.y === '-10');
    const bottomPinBefore = initialStates.find(s => s.y === '10');
    const bottomPinAfter = updatedStates.find(s => s.y === '10');

    console.log('\n状態変化:');
    console.log('上のピン:', topPinBefore, '->', topPinAfter);
    console.log('下のピン:', bottomPinBefore, '->', bottomPinAfter);

    // 期待される動作：
    // - 上のピン（index=0）: active -> inactive
    // - 下のピン（index=1）: inactive -> active
    expect(topPinAfter?.active).toBe(false);
    expect(bottomPinAfter?.active).toBe(true);
  });
});
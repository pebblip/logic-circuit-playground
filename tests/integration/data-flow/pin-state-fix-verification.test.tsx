/**
 * ピン状態同期修正の検証テスト
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { GateComponent } from '@/components/Gate';
import type { Gate } from '@/types/circuit';

describe('ピン状態同期修正の検証', () => {
  it('gate.inputsの変更時にGateComponentが再レンダリングされる', () => {
    const gate: Gate = {
      id: 'test-gate',
      type: 'AND',
      position: { x: 100, y: 100 },
      inputs: ['1', '1'], // 両方ON
      output: true,
    };

    const { rerender, container } = render(
      <svg>
        <GateComponent gate={gate} />
      </svg>
    );

    // 初期状態：両方のピンがアクティブ
    let pins = container.querySelectorAll('circle.pin.input-pin');
    const topPin = Array.from(pins).find(p => p.getAttribute('cy') === '-10');
    const bottomPin = Array.from(pins).find(p => p.getAttribute('cy') === '10');
    
    expect(topPin).toHaveClass('active');
    expect(bottomPin).toHaveClass('active');

    // gate.inputsを変更
    const updatedGate: Gate = {
      ...gate,
      inputs: ['', ''], // 両方OFF
      output: false,
    };

    rerender(
      <svg>
        <GateComponent gate={updatedGate} />
      </svg>
    );

    // 更新後：両方のピンが非アクティブ
    pins = container.querySelectorAll('circle.pin.input-pin');
    const updatedTopPin = Array.from(pins).find(p => p.getAttribute('cy') === '-10');
    const updatedBottomPin = Array.from(pins).find(p => p.getAttribute('cy') === '10');
    
    expect(updatedTopPin).not.toHaveClass('active');
    expect(updatedBottomPin).not.toHaveClass('active');
  });

  it('部分的な入力変更も正しく検出される', () => {
    const gate: Gate = {
      id: 'nand-gate',
      type: 'NAND',
      position: { x: 200, y: 200 },
      inputs: ['1', ''], // 上ON、下OFF
      output: true,
    };

    const { rerender, container } = render(
      <svg>
        <GateComponent gate={gate} />
      </svg>
    );

    // 初期状態を確認
    let pins = container.querySelectorAll('circle.pin.input-pin');
    let topPin = Array.from(pins).find(p => p.getAttribute('cy') === '-10');
    let bottomPin = Array.from(pins).find(p => p.getAttribute('cy') === '10');
    
    expect(topPin).toHaveClass('active');
    expect(bottomPin).not.toHaveClass('active');

    // 上のピンだけOFFに変更
    const updatedGate: Gate = {
      ...gate,
      inputs: ['', ''], // 両方OFF
    };

    rerender(
      <svg>
        <GateComponent gate={updatedGate} />
      </svg>
    );

    // 更新後の状態を確認
    pins = container.querySelectorAll('circle.pin.input-pin');
    topPin = Array.from(pins).find(p => p.getAttribute('cy') === '-10');
    bottomPin = Array.from(pins).find(p => p.getAttribute('cy') === '10');
    
    expect(topPin).not.toHaveClass('active');
    expect(bottomPin).not.toHaveClass('active');
  });
});
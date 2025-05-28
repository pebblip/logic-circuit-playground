import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ImprovedGateComponent } from '../ImprovedGateComponent';
import { GateType } from '@/types/gate';
import { PIN_CONSTANTS } from '@/constants/ui';

describe('ImprovedGateComponent', () => {
  const createMockGate = (type = GateType.AND) => {
    // ViewModelの構造を模倣したモックオブジェクト
    return {
      id: 'test-gate-1',
      type,
      x: 100,
      y: 100,
      isSelected: false,
      isHovered: false,
      inputs: [
        { position: { x: -25, y: -10 }, value: false },
        { position: { x: -25, y: 10 }, value: false }
      ],
      outputs: [
        { position: { x: 25, y: 0 }, value: false }
      ],
      isActive: vi.fn(() => false)
    };
  };

  it('ピンの当たり判定が拡大されている', () => {
    const gate = createMockGate();
    const onPinMouseDown = vi.fn();
    
    const { container } = render(
      <svg>
        <ImprovedGateComponent
          gate={gate}
          onPinMouseDown={onPinMouseDown}
        />
      </svg>
    );

    // 入力ピンの当たり判定を確認
    const inputHitArea = container.querySelectorAll('circle[fill="transparent"]')[0];
    expect(inputHitArea).toBeTruthy();
    expect(inputHitArea.getAttribute('r')).toBe(String(PIN_CONSTANTS.HIT_RADIUS));
  });

  it('入力ピンと出力ピンが視覚的に区別される', () => {
    const gate = createMockGate();
    
    const { container } = render(
      <svg>
        <ImprovedGateComponent gate={gate} />
      </svg>
    );

    // 入力ピン（三角形）
    const inputPin = container.querySelector('path[d*="M"]');
    expect(inputPin).toBeTruthy();
    expect(inputPin.getAttribute('fill')).toBe(PIN_CONSTANTS.COLORS.INPUT.DEFAULT);

    // 出力ピン（円）
    const outputPins = container.querySelectorAll('circle');
    const outputPin = Array.from(outputPins).find(
      circle => circle.getAttribute('fill') === PIN_CONSTANTS.COLORS.OUTPUT.DEFAULT
    );
    expect(outputPin).toBeTruthy();
  });

  it('ピンにホバーすると拡大される', () => {
    const gate = createMockGate();
    const onPinMouseEnter = vi.fn();
    
    const { container } = render(
      <svg>
        <ImprovedGateComponent
          gate={gate}
          onPinMouseEnter={onPinMouseEnter}
        />
      </svg>
    );

    // 入力ピンの当たり判定エリアにホバー
    const inputHitArea = container.querySelectorAll('circle[fill="transparent"]')[0];
    fireEvent.mouseEnter(inputHitArea);

    expect(onPinMouseEnter).toHaveBeenCalledWith('test-gate-1', 'input', 0);
  });

  it('ピンクリックが正しく処理される', () => {
    const gate = createMockGate();
    const onPinMouseDown = vi.fn();
    
    const { container } = render(
      <svg>
        <ImprovedGateComponent
          gate={gate}
          onPinMouseDown={onPinMouseDown}
        />
      </svg>
    );

    // 出力ピンの当たり判定エリアをクリック
    const outputHitArea = container.querySelectorAll('circle[fill="transparent"]')[2]; // 3番目が出力ピン
    fireEvent.mouseDown(outputHitArea);

    expect(onPinMouseDown).toHaveBeenCalledWith(
      'test-gate-1',
      'output',
      0,
      125, // gate.x + pin.position.x
      100  // gate.y + pin.position.y
    );
  });

  it('ホバー時にラベルが表示される', () => {
    const gate = createMockGate();
    
    const { container, rerender } = render(
      <svg>
        <ImprovedGateComponent gate={gate} />
      </svg>
    );

    // 最初はINラベルが表示されていない
    const labels = Array.from(container.querySelectorAll('text'));
    expect(labels.find(t => t.textContent === 'IN')).toBeFalsy();

    // 入力ピンにホバー
    const inputHitArea = container.querySelectorAll('circle[fill="transparent"]')[0];
    fireEvent.mouseEnter(inputHitArea);

    // コンポーネントを再レンダリング
    rerender(
      <svg>
        <ImprovedGateComponent gate={gate} />
      </svg>
    );

    // INラベルが表示される
    const updatedLabels = Array.from(container.querySelectorAll('text'));
    expect(updatedLabels.find(t => t.textContent === 'IN')).toBeTruthy();
  });
});
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PinComponent } from '../PinComponent';
import { Pin } from '@/models/Pin';

describe('PinComponent', () => {
  it('Pinモデルの定数を使用している', () => {
    const { container } = render(
      <svg>
        <PinComponent
          x={10}
          y={20}
          type="input"
          onMouseDown={() => {}}
        />
      </svg>
    );

    const circles = container.querySelectorAll('circle');
    expect(circles).toHaveLength(2);

    // 当たり判定用の透明な円
    const hitCircle = circles[0];
    expect(hitCircle.getAttribute('r')).toBe(String(Pin.HIT_RADIUS));
    expect(hitCircle.getAttribute('fill')).toBe('transparent');

    // 表示用の円
    const visualCircle = circles[1];
    expect(visualCircle.getAttribute('r')).toBe(String(Pin.VISUAL_RADIUS));
    expect(visualCircle.getAttribute('style')).toContain('pointer-events: none');
  });

  it('クリックイベントが正しく処理される', () => {
    const onMouseDown = vi.fn();
    const onMouseUp = vi.fn();

    const { container } = render(
      <svg>
        <PinComponent
          x={10}
          y={20}
          type="output"
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
        />
      </svg>
    );

    const hitArea = container.querySelector('circle[fill="transparent"]');
    expect(hitArea).toBeTruthy();

    fireEvent.mouseDown(hitArea!);
    expect(onMouseDown).toHaveBeenCalledTimes(1);

    fireEvent.mouseUp(hitArea!);
    expect(onMouseUp).toHaveBeenCalledTimes(1);
  });

  it('ラベルが正しく表示される', () => {
    const { container } = render(
      <svg>
        <PinComponent
          x={10}
          y={20}
          type="input"
          onMouseDown={() => {}}
          label="D0"
        />
      </svg>
    );

    const label = container.querySelector('text');
    expect(label).toBeTruthy();
    expect(label?.textContent).toBe('D0');
  });

  it('type属性がdata-terminalに設定される', () => {
    const { container } = render(
      <svg>
        <PinComponent
          x={10}
          y={20}
          type="output"
          onMouseDown={() => {}}
        />
      </svg>
    );

    const visualCircle = container.querySelector('circle[data-terminal]');
    expect(visualCircle?.getAttribute('data-terminal')).toBe('output');
  });
});
// Gateコンポーネントのユニットテスト

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Gate from '../Gate';

describe('Gate Component', () => {
  const defaultProps = {
    gate: {
      id: 1,
      type: 'AND',
      x: 100,
      y: 200,
      value: null
    },
    isSelected: false,
    simulation: {},
    onGateClick: vi.fn(),
    onGateDoubleClick: vi.fn(),
    onGateMouseDown: vi.fn(),
    onTerminalMouseDown: vi.fn(),
    onTerminalMouseUp: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render AND gate correctly', () => {
    const { container } = render(
      <svg>
        <Gate {...defaultProps} />
      </svg>
    );

    const rect = container.querySelector('rect[rx="8"]');
    expect(rect).toBeTruthy();
    expect(rect.getAttribute('fill')).toBe('#ffffff');
    
    // ANDテキストが2つあることを確認（メインとサブテキスト）
    const texts = screen.getAllByText('AND');
    expect(texts).toHaveLength(2);
  });

  it('should render INPUT gate as circle', () => {
    const { container } = render(
      <svg>
        <Gate {...defaultProps} gate={{ ...defaultProps.gate, type: 'INPUT', value: true }} />
      </svg>
    );

    const circle = container.querySelector('circle[r="30"]');
    expect(circle).toBeTruthy();
    expect(circle.getAttribute('fill')).toBe('#10b981'); // Green when value is true
  });

  it('should show selected state', () => {
    const { container } = render(
      <svg>
        <Gate {...defaultProps} isSelected={true} />
      </svg>
    );

    const rect = container.querySelector('rect[rx="8"]');
    expect(rect.getAttribute('stroke')).toBe('#3b82f6');
    expect(rect.getAttribute('stroke-width')).toBe('3');
  });

  it('should handle click events', () => {
    const { container } = render(
      <svg>
        <Gate {...defaultProps} />
      </svg>
    );

    const rect = container.querySelector('rect[rx="8"]');
    fireEvent.click(rect);
    
    expect(defaultProps.onGateClick).toHaveBeenCalledTimes(1);
  });

  it('should handle double click events', () => {
    const { container } = render(
      <svg>
        <Gate {...defaultProps} />
      </svg>
    );

    const rect = container.querySelector('rect[rx="8"]');
    fireEvent.doubleClick(rect);
    
    expect(defaultProps.onGateDoubleClick).toHaveBeenCalledTimes(1);
  });

  it('should render correct number of input terminals', () => {
    const { container } = render(
      <svg>
        <Gate {...defaultProps} />
      </svg>
    );

    // AND gate has 2 inputs - check terminals on the left side (cx < 0)
    const inputTerminals = Array.from(container.querySelectorAll('circle[r="15"]')).filter(
      circle => parseFloat(circle.getAttribute('cx')) < 0
    );
    expect(inputTerminals).toHaveLength(2);
  });

  it('should render correct number of output terminals', () => {
    const { container } = render(
      <svg>
        <Gate {...defaultProps} />
      </svg>
    );

    // AND gate has 1 output - we need to check for output terminals which have cx > 0
    const outputTerminals = Array.from(container.querySelectorAll('circle[r="15"]')).filter(
      circle => parseFloat(circle.getAttribute('cx')) > 0
    );
    expect(outputTerminals).toHaveLength(1);
  });

  it('should display OUTPUT value when gate is OUTPUT type', () => {
    const { container } = render(
      <svg>
        <Gate 
          {...defaultProps} 
          gate={{ ...defaultProps.gate, type: 'OUTPUT', value: true }} 
        />
      </svg>
    );

    // OUTPUT gate is rendered as LED
    const circle = container.querySelector('circle[r="30"]');
    expect(circle).toBeTruthy();
    // simulation[1] is not set in this test, so it should be off
    expect(circle.getAttribute('fill')).toBe('#ffffff'); // colors.ui.surface
  });

  it('should handle terminal mouse events', () => {
    const { container } = render(
      <svg>
        <Gate {...defaultProps} />
      </svg>
    );

    // 出力端子を取得（cx > 0のもの）
    const outputTerminal = Array.from(container.querySelectorAll('circle[r="15"]')).find(
      circle => parseFloat(circle.getAttribute('cx')) > 0
    );
    expect(outputTerminal).toBeTruthy();
    fireEvent.mouseDown(outputTerminal);
    
    expect(defaultProps.onTerminalMouseDown).toHaveBeenCalledTimes(1);
  });

  it('should render CLOCK gate with appropriate styling', () => {
    const { container } = render(
      <svg>
        <Gate 
          {...defaultProps} 
          gate={{ ...defaultProps.gate, type: 'CLOCK', value: true }} 
        />
      </svg>
    );

    const circle = container.querySelector('circle[r="30"]');
    expect(circle).toBeTruthy();
    expect(circle.getAttribute('fill')).toBe('#10b981'); // Green when clock is high
  });
});
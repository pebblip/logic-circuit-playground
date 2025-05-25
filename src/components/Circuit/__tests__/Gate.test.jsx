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

    const rect = container.querySelector('rect');
    expect(rect).toBeTruthy();
    expect(rect.getAttribute('fill')).toBe('#fff');
    
    const text = screen.getByText('AND');
    expect(text).toBeTruthy();
  });

  it('should render INPUT gate as circle', () => {
    const { container } = render(
      <svg>
        <Gate {...defaultProps} gate={{ ...defaultProps.gate, type: 'INPUT', value: true }} />
      </svg>
    );

    const circle = container.querySelector('circle[r="35"]');
    expect(circle).toBeTruthy();
    expect(circle.getAttribute('fill')).toBe('#000'); // Black when value is true
  });

  it('should show selected state', () => {
    const { container } = render(
      <svg>
        <Gate {...defaultProps} isSelected={true} />
      </svg>
    );

    const rect = container.querySelector('rect');
    expect(rect.getAttribute('stroke')).toBe('#3b82f6');
    expect(rect.getAttribute('stroke-width')).toBe('3');
  });

  it('should handle click events', () => {
    const { container } = render(
      <svg>
        <Gate {...defaultProps} />
      </svg>
    );

    const rect = container.querySelector('rect');
    fireEvent.click(rect);
    
    expect(defaultProps.onGateClick).toHaveBeenCalledTimes(1);
  });

  it('should handle double click events', () => {
    const { container } = render(
      <svg>
        <Gate {...defaultProps} />
      </svg>
    );

    const rect = container.querySelector('rect');
    fireEvent.doubleClick(rect);
    
    expect(defaultProps.onGateDoubleClick).toHaveBeenCalledTimes(1);
  });

  it('should render correct number of input terminals', () => {
    const { container } = render(
      <svg>
        <Gate {...defaultProps} />
      </svg>
    );

    // AND gate has 2 inputs
    const inputTerminals = container.querySelectorAll('circle[cx="-60"]');
    expect(inputTerminals).toHaveLength(2);
  });

  it('should render correct number of output terminals', () => {
    const { container } = render(
      <svg>
        <Gate {...defaultProps} />
      </svg>
    );

    // AND gate has 1 output
    const outputTerminals = container.querySelectorAll('circle[cx="60"]');
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

    const valueText = container.querySelector('text[y="-50"]');
    expect(valueText).toBeTruthy();
    expect(valueText.textContent).toBe('1');
  });

  it('should handle terminal mouse events', () => {
    const { container } = render(
      <svg>
        <Gate {...defaultProps} />
      </svg>
    );

    const outputTerminal = container.querySelector('circle[cx="60"]');
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

    const circle = container.querySelector('circle[r="35"]');
    expect(circle.getAttribute('fill')).toBe('#3b82f6'); // Blue when clock is high
  });
});
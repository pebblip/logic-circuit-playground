import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LogicCircuitBuilder } from '../LogicCircuitBuilder';

// Mock the view model and hook
vi.mock('../../viewmodels/CircuitViewModel', () => ({
  CircuitViewModel: vi.fn().mockImplementation(() => ({
    addGate: vi.fn(),
    removeGate: vi.fn(),
    getSelectedGates: vi.fn(() => []),
    getSelectedConnections: vi.fn(() => []),
    selectAll: vi.fn(),
    clearSelection: vi.fn(),
    simulate: vi.fn(),
    clearCircuit: vi.fn(),
  }))
}));

vi.mock('../../hooks/useCircuitViewModel', () => ({
  useCircuitViewModel: vi.fn()
}));

// Mock the Circuit components
vi.mock('../Circuit/CircuitCanvas.jsx', () => ({
  CircuitCanvas: ({ viewModel }) => <div data-testid="circuit-canvas">Canvas</div>
}));

vi.mock('../Circuit/ToolPalette.jsx', () => ({
  ToolPalette: ({ viewModel }) => <div data-testid="tool-palette">Tool Palette</div>
}));

describe('LogicCircuitBuilder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the basic structure', () => {
    render(<LogicCircuitBuilder />);
    
    expect(screen.getByText('論理回路プレイグラウンド')).toBeInTheDocument();
    expect(screen.getByText('シミュレート')).toBeInTheDocument();
    expect(screen.getByText('クリア')).toBeInTheDocument();
    expect(screen.getByTestId('circuit-canvas')).toBeInTheDocument();
    expect(screen.getByTestId('tool-palette')).toBeInTheDocument();
  });

  it('shows tool button on mobile', () => {
    // Mock mobile viewport
    global.innerWidth = 500;
    global.dispatchEvent(new Event('resize'));
    
    render(<LogicCircuitBuilder />);
    
    expect(screen.getByText('ツール')).toBeInTheDocument();
  });

  it('toggles tool palette on mobile', () => {
    global.innerWidth = 500;
    global.dispatchEvent(new Event('resize'));
    
    render(<LogicCircuitBuilder />);
    
    const toolButton = screen.getByText('ツール');
    fireEvent.click(toolButton);
    
    // Tool palette should still be visible but the button text doesn't change
    expect(screen.getByTestId('tool-palette')).toBeInTheDocument();
  });

  it('shows properties panel on desktop', () => {
    global.innerWidth = 1024;
    global.dispatchEvent(new Event('resize'));
    
    render(<LogicCircuitBuilder />);
    
    expect(screen.getByText('プロパティ')).toBeInTheDocument();
  });
});
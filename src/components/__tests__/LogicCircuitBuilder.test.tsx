import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LogicCircuitBuilder } from '../LogicCircuitBuilder';
import { GateType } from '../../types/gate';

// Mock child components
vi.mock('../Circuit/CircuitCanvas', () => ({
  CircuitCanvas: ({ viewModel }: any) => (
    <div data-testid="circuit-canvas">Circuit Canvas</div>
  ),
}));

vi.mock('../Circuit/ToolPalette', () => ({
  ToolPalette: ({ viewModel }: any) => (
    <div data-testid="tool-palette">Tool Palette</div>
  ),
}));

describe('LogicCircuitBuilder', () => {
  beforeEach(() => {
    // Reset window size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  it('renders all main components', () => {
    render(<LogicCircuitBuilder />);
    
    expect(screen.getByText('論理回路プレイグラウンド')).toBeInTheDocument();
    expect(screen.getByText('シミュレート')).toBeInTheDocument();
    expect(screen.getByText('クリア')).toBeInTheDocument();
    expect(screen.getByTestId('circuit-canvas')).toBeInTheDocument();
    expect(screen.getByTestId('tool-palette')).toBeInTheDocument();
    expect(screen.getByText('プロパティ')).toBeInTheDocument();
  });

  it('handles simulate button click', () => {
    render(<LogicCircuitBuilder />);
    
    const simulateButton = screen.getByText('シミュレート');
    fireEvent.click(simulateButton);
    
    // Should trigger simulation (tested in integration)
  });

  it('handles clear button click', () => {
    render(<LogicCircuitBuilder />);
    
    const clearButton = screen.getByText('クリア');
    fireEvent.click(clearButton);
    
    // Should clear circuit (tested in integration)
  });

  it('responds to mobile viewport', async () => {
    // Set mobile width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });
    
    render(<LogicCircuitBuilder />);
    
    // Trigger resize
    fireEvent(window, new Event('resize'));
    
    await waitFor(() => {
      expect(screen.getByText('ツール')).toBeInTheDocument();
    });
    
    // Properties panel should not be visible
    expect(screen.queryByText('プロパティ')).not.toBeInTheDocument();
  });

  it('toggles tool palette on mobile', async () => {
    // Set mobile width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });
    
    render(<LogicCircuitBuilder />);
    fireEvent(window, new Event('resize'));
    
    await waitFor(() => {
      const toolButton = screen.getByText('ツール');
      fireEvent.click(toolButton);
    });
    
    // Tool palette should be hidden
    expect(screen.queryByTestId('tool-palette')).not.toBeInTheDocument();
  });

  it('shows mobile FAB when tool palette is hidden', async () => {
    // Set mobile width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });
    
    render(<LogicCircuitBuilder />);
    fireEvent(window, new Event('resize'));
    
    // Hide tool palette
    await waitFor(() => {
      const toolButton = screen.getByText('ツール');
      fireEvent.click(toolButton);
    });
    
    // FAB should be visible
    const fab = screen.getByRole('button', { name: '' });
    expect(fab).toHaveClass('fixed', 'bottom-4', 'right-4');
  });

  it('handles drag and drop', () => {
    const { container } = render(<LogicCircuitBuilder />);
    
    const canvasWrapper = container.querySelector('.flex-1.relative');
    
    // Drag over
    const dragOverEvent = new Event('dragover', { bubbles: true });
    Object.defineProperty(dragOverEvent, 'preventDefault', { value: vi.fn() });
    Object.defineProperty(dragOverEvent, 'dataTransfer', {
      value: { dropEffect: '' },
    });
    
    fireEvent(canvasWrapper!, dragOverEvent);
    expect(dragOverEvent.preventDefault).toHaveBeenCalled();
    
    // Drop
    const dropEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dropEvent, 'preventDefault', { value: vi.fn() });
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: { getData: vi.fn(() => GateType.AND) },
    });
    Object.defineProperty(dropEvent, 'clientX', { value: 100 });
    Object.defineProperty(dropEvent, 'clientY', { value: 100 });
    
    fireEvent(canvasWrapper!, dropEvent);
    expect(dropEvent.preventDefault).toHaveBeenCalled();
  });

  it('handles keyboard shortcuts', () => {
    render(<LogicCircuitBuilder />);
    
    // Delete key
    fireEvent.keyDown(window, { key: 'Delete' });
    
    // Select all
    fireEvent.keyDown(window, { key: 'a', ctrlKey: true });
    
    // Escape
    fireEvent.keyDown(window, { key: 'Escape' });
    
    // Simulate
    fireEvent.keyDown(window, { key: 's', ctrlKey: true });
  });

  it('prevents default on Ctrl+A and Ctrl+S', () => {
    render(<LogicCircuitBuilder />);
    
    const ctrlA = new KeyboardEvent('keydown', { key: 'a', ctrlKey: true });
    Object.defineProperty(ctrlA, 'preventDefault', { value: vi.fn() });
    window.dispatchEvent(ctrlA);
    expect(ctrlA.preventDefault).toHaveBeenCalled();
    
    const ctrlS = new KeyboardEvent('keydown', { key: 's', ctrlKey: true });
    Object.defineProperty(ctrlS, 'preventDefault', { value: vi.fn() });
    window.dispatchEvent(ctrlS);
    expect(ctrlS.preventDefault).toHaveBeenCalled();
  });

  it('handles Cmd key on Mac', () => {
    render(<LogicCircuitBuilder />);
    
    const cmdA = new KeyboardEvent('keydown', { key: 'a', metaKey: true });
    Object.defineProperty(cmdA, 'preventDefault', { value: vi.fn() });
    window.dispatchEvent(cmdA);
    expect(cmdA.preventDefault).toHaveBeenCalled();
    
    const cmdS = new KeyboardEvent('keydown', { key: 's', metaKey: true });
    Object.defineProperty(cmdS, 'preventDefault', { value: vi.fn() });
    window.dispatchEvent(cmdS);
    expect(cmdS.preventDefault).toHaveBeenCalled();
  });

  it('closes mobile tool palette with close button', async () => {
    // Set mobile width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });
    
    render(<LogicCircuitBuilder />);
    fireEvent(window, new Event('resize'));
    
    await waitFor(() => {
      expect(screen.getByText('ツールパレット')).toBeInTheDocument();
    });
    
    const closeButton = screen.getByText('✕');
    fireEvent.click(closeButton);
    
    expect(screen.queryByTestId('tool-palette')).not.toBeInTheDocument();
  });
});
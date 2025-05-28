import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CircuitCanvas } from '../CircuitCanvas';
import { CircuitViewModel } from '../../../viewmodels/CircuitViewModel';
import { GateType } from '../../../types/gate';

// Mock SVG methods
beforeEach(() => {
  global.SVGElement = global.SVGElement || (Element as any);
  
  // Mock getBBox
  Element.prototype.getBBox = vi.fn(() => ({
    x: 0,
    y: 0,
    width: 100,
    height: 50,
    top: 0,
    right: 100,
    bottom: 50,
    left: 0,
  }));
});

describe('CircuitCanvas', () => {
  let viewModel: CircuitViewModel;

  beforeEach(() => {
    viewModel = new CircuitViewModel();
  });

  it('renders without crashing', () => {
    render(<CircuitCanvas viewModel={viewModel} />);
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('renders gates from viewModel', () => {
    viewModel.addGate(GateType.AND, { x: 100, y: 100 });
    viewModel.addGate(GateType.OR, { x: 200, y: 200 });

    const { container } = render(<CircuitCanvas viewModel={viewModel} />);
    const gates = container.querySelectorAll('g[data-gate-id]');
    expect(gates).toHaveLength(2);
  });

  it('renders connections from viewModel', () => {
    const gate1 = viewModel.addGate(GateType.INPUT, { x: 100, y: 100 });
    const gate2 = viewModel.addGate(GateType.OUTPUT, { x: 300, y: 100 });
    
    const output = gate1.outputs[0];
    const input = gate2.inputs[0];
    viewModel.addConnection(gate1.id, output.id, gate2.id, input.id);

    const { container } = render(<CircuitCanvas viewModel={viewModel} />);
    const connections = container.querySelectorAll('g[data-connection-id]');
    expect(connections).toHaveLength(1);
  });

  it('handles gate selection on click', () => {
    const gate = viewModel.addGate(GateType.AND, { x: 100, y: 100 });
    const { container } = render(<CircuitCanvas viewModel={viewModel} />);
    
    const gateElement = container.querySelector(`g[data-gate-id="${gate.id}"]`);
    expect(gateElement).toBeTruthy();
    
    fireEvent.mouseDown(gateElement!);
    fireEvent.mouseUp(gateElement!);
    
    expect(viewModel.isGateSelected(gate.id)).toBe(true);
  });

  it('handles gate dragging', () => {
    const gate = viewModel.addGate(GateType.AND, { x: 100, y: 100 });
    const { container } = render(<CircuitCanvas viewModel={viewModel> />);
    
    const gateElement = container.querySelector(`g[data-gate-id="${gate.id}"]`);
    const svg = container.querySelector('svg');
    
    // Start drag
    fireEvent.mouseDown(gateElement!, { clientX: 100, clientY: 100 });
    
    // Move
    fireEvent.mouseMove(svg!, { clientX: 150, clientY: 150 });
    
    // End drag
    fireEvent.mouseUp(svg!);
    
    const movedGate = viewModel.getCircuit().getGate(gate.id);
    expect(movedGate?.position.x).toBe(140); // Snapped to grid
    expect(movedGate?.position.y).toBe(140); // Snapped to grid
  });

  it('handles wire creation from output pin', () => {
    const gate = viewModel.addGate(GateType.INPUT, { x: 100, y: 100 });
    const { container } = render(<CircuitCanvas viewModel={viewModel} />);
    
    const outputPin = container.querySelector('.pin-output');
    const svg = container.querySelector('svg');
    
    // Start wire creation
    fireEvent.mouseDown(outputPin!, { clientX: 120, clientY: 100 });
    
    // Draw wire
    fireEvent.mouseMove(svg!, { clientX: 200, clientY: 100 });
    
    // Should render temporary wire
    const tempWire = container.querySelector('.temp-wire');
    expect(tempWire).toBeTruthy();
  });

  it('completes wire connection to input pin', () => {
    const gate1 = viewModel.addGate(GateType.INPUT, { x: 100, y: 100 });
    const gate2 = viewModel.addGate(GateType.OUTPUT, { x: 300, y: 100 });
    const { container } = render(<CircuitCanvas viewModel={viewModel} />);
    
    const outputPin = container.querySelector(`g[data-gate-id="${gate1.id}"] .pin-output`);
    const inputPin = container.querySelector(`g[data-gate-id="${gate2.id}"] .pin-input`);
    
    // Start wire creation from output
    fireEvent.mouseDown(outputPin!);
    
    // Complete connection to input
    fireEvent.mouseUp(inputPin!);
    
    expect(viewModel.getCircuit().getConnections()).toHaveLength(1);
  });

  it('cancels wire creation on escape key', () => {
    const gate = viewModel.addGate(GateType.INPUT, { x: 100, y: 100 });
    const { container } = render(<CircuitCanvas viewModel={viewModel} />);
    
    const outputPin = container.querySelector('.pin-output');
    const svg = container.querySelector('svg');
    
    // Start wire creation
    fireEvent.mouseDown(outputPin!);
    fireEvent.mouseMove(svg!, { clientX: 200, clientY: 100 });
    
    // Press escape
    fireEvent.keyDown(window, { key: 'Escape' });
    
    // Temporary wire should be removed
    const tempWire = container.querySelector('.temp-wire');
    expect(tempWire).toBeFalsy();
  });

  it('handles multi-selection with shift key', () => {
    const gate1 = viewModel.addGate(GateType.AND, { x: 100, y: 100 });
    const gate2 = viewModel.addGate(GateType.OR, { x: 200, y: 100 });
    const { container } = render(<CircuitCanvas viewModel={viewModel} />);
    
    const gateElement1 = container.querySelector(`g[data-gate-id="${gate1.id}"]`);
    const gateElement2 = container.querySelector(`g[data-gate-id="${gate2.id}"]`);
    
    // Select first gate
    fireEvent.mouseDown(gateElement1!);
    fireEvent.mouseUp(gateElement1!);
    
    // Select second gate with shift
    fireEvent.mouseDown(gateElement2!, { shiftKey: true });
    fireEvent.mouseUp(gateElement2!);
    
    expect(viewModel.isGateSelected(gate1.id)).toBe(true);
    expect(viewModel.isGateSelected(gate2.id)).toBe(true);
  });

  it('handles connection selection', () => {
    const gate1 = viewModel.addGate(GateType.INPUT, { x: 100, y: 100 });
    const gate2 = viewModel.addGate(GateType.OUTPUT, { x: 300, y: 100 });
    const connection = viewModel.addConnection(
      gate1.id,
      gate1.outputs[0].id,
      gate2.id,
      gate2.inputs[0].id
    );
    
    const { container } = render(<CircuitCanvas viewModel={viewModel} />);
    const connectionElement = container.querySelector(`g[data-connection-id="${connection.id}"]`);
    
    fireEvent.click(connectionElement!);
    
    expect(viewModel.isConnectionSelected(connection.id)).toBe(true);
  });

  it('displays hover effects on gates', () => {
    const gate = viewModel.addGate(GateType.AND, { x: 100, y: 100 });
    const { container } = render(<CircuitCanvas viewModel={viewModel} />);
    
    const gateElement = container.querySelector(`g[data-gate-id="${gate.id}"]`);
    const gateRect = gateElement?.querySelector('rect');
    
    fireEvent.mouseEnter(gateElement!);
    expect(gateRect?.getAttribute('stroke')).toBe('#3b82f6');
    
    fireEvent.mouseLeave(gateElement!);
    expect(gateRect?.getAttribute('stroke')).toBe('#d1d5db');
  });
});
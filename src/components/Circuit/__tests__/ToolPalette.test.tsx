import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ToolPalette } from '../ToolPalette';
import { CircuitViewModel } from '../../../viewmodels/CircuitViewModel';
import { GateType } from '../../../types/gate';

describe('ToolPalette', () => {
  let viewModel: CircuitViewModel;

  beforeEach(() => {
    viewModel = new CircuitViewModel();
    vi.spyOn(viewModel, 'addGate');
  });

  it('renders all gate categories', () => {
    render(<ToolPalette viewModel={viewModel} />);
    
    expect(screen.getByText('基本ゲート')).toBeInTheDocument();
    expect(screen.getByText('入出力')).toBeInTheDocument();
    expect(screen.getByText('高度なゲート')).toBeInTheDocument();
    expect(screen.getByText('フリップフロップ')).toBeInTheDocument();
  });

  it('renders all gate types', () => {
    render(<ToolPalette viewModel={viewModel} />);
    
    // Basic gates
    expect(screen.getByText('AND')).toBeInTheDocument();
    expect(screen.getByText('OR')).toBeInTheDocument();
    expect(screen.getByText('NOT')).toBeInTheDocument();
    expect(screen.getByText('XOR')).toBeInTheDocument();
    
    // I/O
    expect(screen.getByText('入力')).toBeInTheDocument();
    expect(screen.getByText('出力')).toBeInTheDocument();
    expect(screen.getByText('クロック')).toBeInTheDocument();
    
    // Advanced gates
    expect(screen.getByText('NAND')).toBeInTheDocument();
    expect(screen.getByText('NOR')).toBeInTheDocument();
    expect(screen.getByText('XNOR')).toBeInTheDocument();
    expect(screen.getByText('バッファ')).toBeInTheDocument();
    
    // Flip-flops
    expect(screen.getByText('SR Latch')).toBeInTheDocument();
    expect(screen.getByText('D-FF')).toBeInTheDocument();
    expect(screen.getByText('JK-FF')).toBeInTheDocument();
    expect(screen.getByText('T-FF')).toBeInTheDocument();
  });

  it('adds gate on button click', () => {
    render(<ToolPalette viewModel={viewModel} />);
    
    const andButton = screen.getByText('AND').closest('button');
    fireEvent.click(andButton!);
    
    expect(viewModel.addGate).toHaveBeenCalledWith(
      GateType.AND,
      expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) })
    );
  });

  it('handles drag start with correct data', () => {
    render(<ToolPalette viewModel={viewModel} />);
    
    const orButton = screen.getByText('OR').closest('button');
    const dataTransfer = {
      setData: vi.fn(),
      effectAllowed: '',
    };
    
    fireEvent.dragStart(orButton!, { dataTransfer });
    
    expect(dataTransfer.setData).toHaveBeenCalledWith('gateType', GateType.OR);
    expect(dataTransfer.effectAllowed).toBe('copy');
  });

  it('applies custom className', () => {
    const { container } = render(
      <ToolPalette viewModel={viewModel} className="custom-class" />
    );
    
    const paletteDiv = container.firstChild;
    expect(paletteDiv).toHaveClass('custom-class');
  });

  it('displays tooltips on gate buttons', () => {
    render(<ToolPalette viewModel={viewModel} />);
    
    const notButton = screen.getByText('NOT').closest('button');
    expect(notButton).toHaveAttribute('title', 'NOTをドラッグまたはクリックで追加');
  });

  it('handles all gate types correctly', () => {
    render(<ToolPalette viewModel={viewModel} />);
    
    const gateTypes = [
      { label: 'AND', type: GateType.AND },
      { label: 'OR', type: GateType.OR },
      { label: 'NOT', type: GateType.NOT },
      { label: 'XOR', type: GateType.XOR },
      { label: 'NAND', type: GateType.NAND },
      { label: 'NOR', type: GateType.NOR },
      { label: 'XNOR', type: GateType.XNOR },
      { label: '入力', type: GateType.INPUT },
      { label: '出力', type: GateType.OUTPUT },
      { label: 'クロック', type: GateType.CLOCK },
      { label: 'バッファ', type: GateType.BUFFER },
      { label: 'SR Latch', type: GateType.SR_LATCH },
      { label: 'D-FF', type: GateType.D_FLIPFLOP },
      { label: 'JK-FF', type: GateType.JK_FLIPFLOP },
      { label: 'T-FF', type: GateType.T_FLIPFLOP },
    ];
    
    gateTypes.forEach(({ label, type }) => {
      const button = screen.getByText(label).closest('button');
      fireEvent.click(button!);
      
      expect(viewModel.addGate).toHaveBeenCalledWith(
        type,
        expect.any(Object)
      );
    });
  });

  it('gate buttons have proper styling classes', () => {
    render(<ToolPalette viewModel={viewModel} />);
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveClass('cursor-move');
      expect(button).toHaveClass('transition-colors');
    });
  });
});
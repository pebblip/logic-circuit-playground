import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CircuitDiagramRenderer } from '../../../src/features/learning-mode/components/content-renderers/CircuitDiagramRenderer';
import type { DiagramContent } from '../../../src/types/lesson-content';

describe('CircuitDiagramRenderer', () => {
  it('renders simple connection diagram', () => {
    const content: DiagramContent = {
      type: 'diagram',
      diagramType: 'simple-connection',
      title: 'Test Connection',
    };

    render(<CircuitDiagramRenderer content={content} />);
    
    expect(screen.getByText('Test Connection')).toBeInTheDocument();
    expect(screen.getByText('入力')).toBeInTheDocument();
    expect(screen.getByText('出力')).toBeInTheDocument();
  });

  it('renders gate symbol for AND gate', () => {
    const content: DiagramContent = {
      type: 'diagram',
      diagramType: 'gate-symbol',
      gateType: 'AND',
      title: 'AND Gate Symbol',
    };

    render(<CircuitDiagramRenderer content={content} />);
    
    expect(screen.getByText('AND Gate Symbol')).toBeInTheDocument();
    expect(screen.getByText('&')).toBeInTheDocument();
  });

  it('renders truth table visual', () => {
    const content: DiagramContent = {
      type: 'diagram',
      diagramType: 'truth-table-visual',
      title: 'Truth Table',
      data: [
        ['A', 'B', 'Y'],
        ['0', '0', '0'],
        ['0', '1', '0'],
        ['1', '0', '0'],
        ['1', '1', '1'],
      ],
    };

    render(<CircuitDiagramRenderer content={content} />);
    
    expect(screen.getByText('Truth Table')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('Y')).toBeInTheDocument();
    
    // 真理値表の値を確認
    const cells = screen.getAllByText('1');
    expect(cells.length).toBeGreaterThan(0);
  });

  it('renders signal flow diagram', () => {
    const content: DiagramContent = {
      type: 'diagram',
      diagramType: 'signal-flow',
      title: 'Signal Comparison',
    };

    render(<CircuitDiagramRenderer content={content} />);
    
    expect(screen.getByText('Signal Comparison')).toBeInTheDocument();
    expect(screen.getByText('アナログ:')).toBeInTheDocument();
    expect(screen.getByText('デジタル:')).toBeInTheDocument();
  });

  it('renders custom SVG', () => {
    const customSvg = `<svg viewBox="0 0 100 100">
      <text x="50" y="50" text-anchor="middle">Custom Content</text>
    </svg>`;
    
    const content: DiagramContent = {
      type: 'diagram',
      diagramType: 'custom',
      title: 'Custom Diagram',
      customSvg,
      caption: 'This is a custom diagram',
    };

    render(<CircuitDiagramRenderer content={content} />);
    
    expect(screen.getByText('Custom Diagram')).toBeInTheDocument();
    expect(screen.getByText('Custom Content')).toBeInTheDocument();
    expect(screen.getByText('This is a custom diagram')).toBeInTheDocument();
  });

  it('renders without title and caption', () => {
    const content: DiagramContent = {
      type: 'diagram',
      diagramType: 'simple-connection',
    };

    const { container } = render(<CircuitDiagramRenderer content={content} />);
    
    expect(container.querySelector('.diagram-title')).not.toBeInTheDocument();
    expect(container.querySelector('.diagram-caption')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const content: DiagramContent = {
      type: 'diagram',
      diagramType: 'simple-connection',
      className: 'custom-class',
    };

    const { container } = render(<CircuitDiagramRenderer content={content} />);
    
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});
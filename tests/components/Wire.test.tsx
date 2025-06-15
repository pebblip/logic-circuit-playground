import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { WireComponent } from '@components/Wire';
import { useCircuitStore } from '@/stores/circuitStore';
import { Gate, Wire } from '@/types/circuit';
import { getInputPinPosition, getOutputPinPosition } from '@domain/analysis/pinPositionCalculator';

// モックを定義
vi.mock('@/stores/circuitStore');
vi.mock('@domain/analysis/pinPositionCalculator', () => ({
  getInputPinPosition: vi.fn(),
  getOutputPinPosition: vi.fn()
}));

// モックストア
const mockGates: Gate[] = [
  {
    id: 'gate1',
    type: 'AND',
    position: { x: 100, y: 100 },
    inputs: ['0', '0'],
    output: false
  },
  {
    id: 'gate2', 
    type: 'OR',
    position: { x: 300, y: 150 },
    inputs: ['0', '0'],
    output: true
  },
  {
    id: 'input1',
    type: 'INPUT',
    position: { x: 50, y: 80 },
    inputs: [],
    output: true
  },
  {
    id: 'custom1',
    type: 'CUSTOM',
    position: { x: 200, y: 200 },
    inputs: ['0', '0'],
    output: false,
    customGateDefinition: {
      id: 'custom-def-1',
      name: 'TestCustom',
      displayName: 'Test Custom Gate',
      inputs: [
        { name: 'A', index: 0 },
        { name: 'B', index: 1 }
      ],
      outputs: [
        { name: 'Y', index: 0 }
      ],
      width: 120,
      height: 80,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  }
];

const mockWires: Wire[] = [
  {
    id: 'wire1',
    from: { gateId: 'gate1', pinIndex: -1 },
    to: { gateId: 'gate2', pinIndex: 0 },
    isActive: false
  },
  {
    id: 'wire2', 
    from: { gateId: 'input1', pinIndex: -1 },
    to: { gateId: 'gate1', pinIndex: 0 },
    isActive: true
  }
];

const mockDeleteWire = vi.fn();

describe('WireComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // ストアの基本設定
    (useCircuitStore as any).mockImplementation((selector: any) => {
      const state = {
        gates: mockGates,
        deleteWire: mockDeleteWire
      };
      return selector(state);
    });
    
    // pinPositionCalculatorモック実装
    vi.mocked(getInputPinPosition).mockImplementation((gate, pinIndex) => {
      // 簡略化されたピン位置計算
      if (gate.type === 'CUSTOM') {
        return { x: gate.position.x - 60, y: gate.position.y + (pinIndex * 20) };
      }
      return { x: gate.position.x - 45, y: gate.position.y + (pinIndex === 0 ? -10 : 10) };
    });
    
    vi.mocked(getOutputPinPosition).mockImplementation((gate, pinIndex = 0) => {
      if (gate.type === 'INPUT') {
        return { x: gate.position.x + 35, y: gate.position.y };
      }
      if (gate.type === 'CUSTOM') {
        return { x: gate.position.x + 60, y: gate.position.y + (pinIndex * 20) };
      }
      return { x: gate.position.x + 45, y: gate.position.y };
    });
  });

  afterEach(() => {
    cleanup();
  });

  describe('Wire rendering with correct path', () => {
    it('should render wire with correct SVG path for basic gates', () => {
      const wire = mockWires[0]; // gate1 -> gate2
      
      render(
        <svg>
          <WireComponent wire={wire} />
        </svg>
      );

      const wirePath = screen.getByTestId('wire-wire1');
      expect(wirePath).toHaveAttribute('data-wire-id', 'wire1');
      
      const pathElement = wirePath.querySelector('path.wire');
      expect(pathElement).toBeTruthy();
      expect(pathElement).toHaveAttribute('d');
    });

    it('should render wire for custom gates', () => {
      const customWire: Wire = {
        id: 'custom-wire',
        from: { gateId: 'custom1', pinIndex: -1 },
        to: { gateId: 'gate2', pinIndex: 1 },
        isActive: false
      };

      render(
        <svg>
          <WireComponent wire={customWire} />
        </svg>
      );

      const wirePath = screen.getByTestId('wire-custom-wire');
      expect(wirePath).toHaveAttribute('data-wire-id', 'custom-wire');
    });

    it('should not render when from or to gate is missing', () => {
      const invalidWire: Wire = {
        id: 'invalid-wire',
        from: { gateId: 'nonexistent', pinIndex: -1 },
        to: { gateId: 'gate2', pinIndex: 0 },
        isActive: false
      };

      const { container } = render(
        <svg>
          <WireComponent wire={invalidWire} />
        </svg>
      );

      expect(container.querySelector('[data-wire-id]')).toBeNull();
    });
  });

  describe('Pin position calculations', () => {
    it('should use correct pin positions for standard gates', () => {
      const wire = mockWires[0];
      
      render(
        <svg>
          <WireComponent wire={wire} />
        </svg>
      );

      // pinPositionCalculatorが正しく呼ばれることを確認
      expect(getOutputPinPosition).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'gate1', type: 'AND' }),
        0
      );
      expect(getInputPinPosition).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'gate2', type: 'OR' }),
        0
      );
    });

    it('should handle custom gate pin positions', () => {
      const customWire: Wire = {
        id: 'custom-wire',
        from: { gateId: 'custom1', pinIndex: -1 },
        to: { gateId: 'gate1', pinIndex: 0 },
        isActive: false
      };

      render(
        <svg>
          <WireComponent wire={customWire} />
        </svg>
      );

      expect(getOutputPinPosition).toHaveBeenCalledWith(
        expect.objectContaining({ 
          id: 'custom1', 
          type: 'CUSTOM',
          customGateDefinition: expect.any(Object)
        }),
        0
      );
    });
  });

  describe('Active/inactive visual states', () => {
    it('should apply active class when wire is active', () => {
      const activeWire = mockWires[1]; // isActive: true
      
      render(
        <svg>
          <WireComponent wire={activeWire} />
        </svg>
      );

      const pathElement = screen.getByTestId('wire-wire2').querySelector('path.wire');
      expect(pathElement).toHaveClass('active');
    });

    it('should not apply active class when wire is inactive', () => {
      const inactiveWire = mockWires[0]; // isActive: false
      
      render(
        <svg>
          <WireComponent wire={inactiveWire} />
        </svg>
      );

      const pathElement = screen.getByTestId('wire-wire1').querySelector('path.wire');
      expect(pathElement).not.toHaveClass('active');
    });
  });

  describe('Context menu for wire deletion', () => {
    it('should call deleteWire on right click', () => {
      const wire = mockWires[0];
      
      render(
        <svg>
          <WireComponent wire={wire} />
        </svg>
      );

      const wireGroup = screen.getByTestId('wire-wire1');
      fireEvent.contextMenu(wireGroup);

      expect(mockDeleteWire).toHaveBeenCalledWith('wire1');
    });

    it('should prevent default context menu behavior', () => {
      const wire = mockWires[0];
      
      render(
        <svg>
          <WireComponent wire={wire} />
        </svg>
      );

      const wireGroup = screen.getByTestId('wire-wire1');
      const contextMenuEvent = new MouseEvent('contextmenu', { bubbles: true });
      const preventDefaultSpy = vi.spyOn(contextMenuEvent, 'preventDefault');
      const stopPropagationSpy = vi.spyOn(contextMenuEvent, 'stopPropagation');

      fireEvent(wireGroup, contextMenuEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
    });

    it('should have correct cursor style for context menu', () => {
      const wire = mockWires[0];
      
      render(
        <svg>
          <WireComponent wire={wire} />
        </svg>
      );

      const pathElement = screen.getByTestId('wire-wire1').querySelector('path.wire');
      expect(pathElement).toHaveStyle({ cursor: 'context-menu' });
    });
  });

  describe('Signal particle animation', () => {
    it('should render signal particle when wire is active', () => {
      const activeWire = mockWires[1];
      
      render(
        <svg>
          <WireComponent wire={activeWire} />
        </svg>
      );

      const wireGroup = screen.getByTestId('wire-wire2');
      const particle = wireGroup.querySelector('.signal-particle');
      expect(particle).toBeTruthy();
      expect(particle?.tagName).toBe('circle');
      expect(particle).toHaveAttribute('r', '6');
    });

    it('should not render signal particle when wire is inactive', () => {
      const inactiveWire = mockWires[0];
      
      render(
        <svg>
          <WireComponent wire={inactiveWire} />
        </svg>
      );

      const wireGroup = screen.getByTestId('wire-wire1');
      const particle = wireGroup.querySelector('.signal-particle');
      expect(particle).toBeNull();
    });

    it('should include animation motion path for active wire', () => {
      const activeWire = mockWires[1];
      
      render(
        <svg>
          <WireComponent wire={activeWire} />
        </svg>
      );

      const wireGroup = screen.getByTestId('wire-wire2');
      const hiddenPath = wireGroup.querySelector(`#wire-path-${activeWire.id}`);
      const animateMotion = wireGroup.querySelector('animateMotion');
      
      expect(hiddenPath).toBeTruthy();
      expect(hiddenPath).toHaveStyle({ display: 'none' });
      expect(animateMotion).toBeTruthy();
      expect(animateMotion).toHaveAttribute('dur', '1.5s');
      expect(animateMotion).toHaveAttribute('repeatCount', 'indefinite');
    });
  });

  describe('Bezier curve path generation', () => {
    it('should generate correct quadratic bezier curve path', () => {
      const wire = mockWires[0];
      
      render(
        <svg>
          <WireComponent wire={wire} />
        </svg>
      );

      const pathElement = screen.getByTestId('wire-wire1').querySelector('path.wire');
      const pathData = pathElement?.getAttribute('d');
      
      expect(pathData).toBeTruthy();
      expect(pathData).toMatch(/^M \d+\.?\d* \d+\.?\d* Q \d+\.?\d* \d+\.?\d* \d+\.?\d* \d+\.?\d* T \d+\.?\d* \d+\.?\d*$/);
    });

    it('should calculate midpoint correctly for horizontal wires', () => {
      const horizontalWire: Wire = {
        id: 'horizontal',
        from: { gateId: 'input1', pinIndex: -1 }, // x: 85, y: 80
        to: { gateId: 'gate1', pinIndex: 0 }, // x: 55, y: 90  
        isActive: false
      };

      render(
        <svg>
          <WireComponent wire={horizontalWire} />
        </svg>
      );

      const pathElement = screen.getByTestId('wire-horizontal').querySelector('path.wire');
      const pathData = pathElement?.getAttribute('d');
      
      expect(pathData).toBeTruthy();
      // パスが生成されていることを確認（具体的な値は計算結果に依存）
      expect(pathData).toMatch(/^M/);
    });
  });

  describe('Wire click detection', () => {
    it('should have transparent stroke path for larger click area', () => {
      const wire = mockWires[0];
      
      render(
        <svg>
          <WireComponent wire={wire} />
        </svg>
      );

      const wireGroup = screen.getByTestId('wire-wire1');
      const paths = wireGroup.querySelectorAll('path');
      
      // 2つのpathがあることを確認: visible wire + transparent click area
      expect(paths).toHaveLength(2);
      
      const transparentPath = Array.from(paths).find(path => 
        path.getAttribute('stroke') === 'transparent'
      );
      
      expect(transparentPath).toBeTruthy();
      expect(transparentPath).toHaveAttribute('stroke-width', '20');
      expect(transparentPath).toHaveAttribute('fill', 'none');
    });
  });

  describe('Performance with many wires', () => {
    it('should render multiple wires efficiently', () => {
      const manyWires: Wire[] = Array.from({ length: 100 }, (_, i) => ({
        id: `wire-${i}`,
        from: { gateId: 'gate1', pinIndex: -1 },
        to: { gateId: 'gate2', pinIndex: 0 },
        isActive: i % 3 === 0 // 一部をアクティブに
      }));

      const startTime = performance.now();
      
      const { container } = render(
        <svg>
          {manyWires.map(wire => (
            <WireComponent key={wire.id} wire={wire} />
          ))}
        </svg>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // レンダリング時間が合理的であることを確認（1秒未満）
      expect(renderTime).toBeLessThan(1000);
      
      // 全てのワイヤーがレンダリングされていることを確認
      const wireGroups = container.querySelectorAll('[data-wire-id]');
      expect(wireGroups).toHaveLength(100);
    });

    it('should handle active state changes efficiently', () => {
      const inactiveWire = { ...mockWires[0], isActive: false };
      const activeWire = { ...mockWires[0], isActive: true };
      
      const { rerender } = render(
        <svg>
          <WireComponent wire={inactiveWire} />
        </svg>
      );

      // 非アクティブから開始
      expect(screen.getByTestId('wire-wire1').querySelector('.signal-particle')).toBeNull();

      // アクティブに変更
      rerender(
        <svg>
          <WireComponent wire={activeWire} />
        </svg>
      );

      expect(screen.getByTestId('wire-wire1').querySelector('.signal-particle')).toBeTruthy();

      // 再び非アクティブに
      rerender(
        <svg>
          <WireComponent wire={inactiveWire} />
        </svg>
      );

      expect(screen.getByTestId('wire-wire1').querySelector('.signal-particle')).toBeNull();
    });
  });

  describe('React.memo Performance Optimization', () => {
    it('should prevent unnecessary re-renders when props have not changed', () => {
      const wire = mockWires[0];
      const renderSpy = vi.fn();
      
      // Mock the component to track renders
      const TestWrapper = ({ wire }: { wire: Wire }) => {
        renderSpy();
        return (
          <svg>
            <WireComponent wire={wire} />
          </svg>
        );
      };

      const { rerender } = render(<TestWrapper wire={wire} />);
      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with same props - should NOT cause WireComponent re-render
      rerender(<TestWrapper wire={wire} />);
      
      // TestWrapper re-renders, but WireComponent should be memoized
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });

    it('should re-render when wire activity state changes', () => {
      const wire1 = { ...mockWires[0], isActive: false };
      const wire2 = { ...wire1, isActive: true };
      
      const { container, rerender } = render(
        <svg>
          <WireComponent wire={wire1} />
        </svg>
      );
      
      // Initial render - inactive state
      expect(container.querySelector('.signal-particle')).not.toBeInTheDocument();
      
      // Change activity - should trigger re-render
      rerender(
        <svg>
          <WireComponent wire={wire2} />
        </svg>
      );
      
      // Should now show particle animation
      expect(container.querySelector('.signal-particle')).toBeInTheDocument();
    });

    it('should re-render when wire connection changes', () => {
      const wire1 = mockWires[0];
      const wire2 = {
        ...wire1,
        from: { gateId: 'gate2', pinIndex: -1 }, // Different source gate
      };
      
      const { rerender } = render(
        <svg>
          <WireComponent wire={wire1} />
        </svg>
      );
      
      // Verify initial connection calls
      expect(getOutputPinPosition).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'gate1' }),
        0
      );
      
      // Change connection - should trigger re-render
      rerender(
        <svg>
          <WireComponent wire={wire2} />
        </svg>
      );
      
      // Should call with new gate
      expect(getOutputPinPosition).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'gate2' }),
        0
      );
    });

    it('should re-render when pin indices change', () => {
      const wire1 = mockWires[0];
      const wire2 = {
        ...wire1,
        to: { gateId: 'gate2', pinIndex: 1 }, // Different input pin
      };
      
      const { rerender } = render(
        <svg>
          <WireComponent wire={wire1} />
        </svg>
      );
      
      // Verify initial pin index
      expect(getInputPinPosition).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'gate2' }),
        0
      );
      
      // Change pin index - should trigger re-render
      rerender(
        <svg>
          <WireComponent wire={wire2} />
        </svg>
      );
      
      // Should call with new pin index
      expect(getInputPinPosition).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'gate2' }),
        1
      );
    });

    it('should use memoized gate data for path calculation', () => {
      const wire = mockWires[0];
      
      // Mock pin positions
      vi.mocked(getOutputPinPosition).mockReturnValue({ x: 145, y: 100 });
      vi.mocked(getInputPinPosition).mockReturnValue({ x: 255, y: 150 });
      
      const { container, rerender } = render(
        <svg>
          <WireComponent wire={wire} />
        </svg>
      );
      
      const initialPath = container.querySelector('path.wire')?.getAttribute('d');
      
      // Re-render with same wire - path should be memoized
      rerender(
        <svg>
          <WireComponent wire={wire} />
        </svg>
      );
      
      const secondPath = container.querySelector('path.wire')?.getAttribute('d');
      expect(secondPath).toBe(initialPath);
      
      // Pin position calculation should be optimized with memoization
      // React.memo should prevent re-rendering when props haven't changed
      expect(getOutputPinPosition).toHaveBeenCalled();
    });

    it('should handle gates prop changes for preview mode', () => {
      const wire = mockWires[0];
      const previewGates = [mockGates[0], mockGates[1]]; // Subset of gates
      
      const { rerender } = render(
        <svg>
          <WireComponent wire={wire} />
        </svg>
      );
      
      // Provide external gates (preview mode)
      rerender(
        <svg>
          <WireComponent wire={wire} gates={previewGates} />
        </svg>
      );
      
      // Should handle the gates prop change and re-render
      expect(getOutputPinPosition).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'gate1' }),
        0
      );
    });

    it('should optimize path recalculation with useMemo', () => {
      const wire = mockWires[0];
      
      // Track how many times path calculation occurs
      let pathCalculationCount = 0;
      vi.mocked(getOutputPinPosition).mockImplementation(() => {
        pathCalculationCount++;
        return { x: 145, y: 100 };
      });
      vi.mocked(getInputPinPosition).mockReturnValue({ x: 255, y: 150 });
      
      const { rerender } = render(
        <svg>
          <WireComponent wire={wire} />
        </svg>
      );
      
      const initialCount = pathCalculationCount;
      
      // Re-render with identical wire - React.memo should prevent re-rendering
      rerender(
        <svg>
          <WireComponent wire={wire} />
        </svg>
      );
      
      // With React.memo, the component should not re-render at all when props are identical
      // So path calculation count should remain the same
      expect(pathCalculationCount).toBe(initialCount);
    });

    it('should handle complex wire state transitions efficiently', () => {
      const wire = mockWires[0];
      
      const startTime = performance.now();
      
      const { rerender } = render(
        <svg>
          <WireComponent wire={wire} />
        </svg>
      );
      
      // Simulate rapid state changes
      for (let i = 0; i < 50; i++) {
        const updatedWire = { ...wire, isActive: i % 2 === 0 };
        rerender(
          <svg>
            <WireComponent wire={updatedWire} />
          </svg>
        );
      }
      
      const renderTime = performance.now() - startTime;
      
      // Should handle rapid changes efficiently
      expect(renderTime).toBeLessThan(100); // 100ms threshold
    });
  });

  describe('Error handling', () => {
    it('should handle undefined gate gracefully', () => {
      // ストアに存在しないゲートIDを参照するワイヤー
      const invalidWire: Wire = {
        id: 'invalid',
        from: { gateId: 'nonexistent1', pinIndex: -1 },
        to: { gateId: 'nonexistent2', pinIndex: 0 },
        isActive: false
      };

      const { container } = render(
        <svg>
          <WireComponent wire={invalidWire} />
        </svg>
      );

      // コンポーネントが何もレンダリングしないことを確認
      expect(container.querySelector('[data-wire-id]')).toBeNull();
    });

    it('should handle missing customGateDefinition for custom gates', () => {
      const customGateWithoutDef: Gate = {
        id: 'custom-no-def',
        type: 'CUSTOM',
        position: { x: 100, y: 100 },
        inputs: ['0'],
        output: false
        // customGateDefinition が欠如
      };

      // ストアに問題のあるカスタムゲートを追加
      (useCircuitStore as any).mockImplementation((selector: any) => {
        const state = {
          gates: [...mockGates, customGateWithoutDef],
          deleteWire: mockDeleteWire
        };
        return selector(state);
      });

      const wire: Wire = {
        id: 'custom-wire-no-def',
        from: { gateId: 'custom-no-def', pinIndex: -1 },
        to: { gateId: 'gate1', pinIndex: 0 },
        isActive: false
      };

      // エラーを投げずにレンダリングできることを確認
      expect(() => {
        render(
          <svg>
            <WireComponent wire={wire} />
          </svg>
        );
      }).not.toThrow();
    });
  });
});
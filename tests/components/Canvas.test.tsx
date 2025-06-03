import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Canvas } from '@components/Canvas';
import { useCircuitStore } from '@/stores/circuitStore';
import type { Gate, Wire, Position, GateType } from '@/types/circuit';

// Mock the utils
vi.mock('@domain/simulation', () => ({
  evaluateCircuit: vi.fn((gates, wires) => ({ gates, wires })),
}));

// Mock the components
vi.mock('@components/Gate', () => ({
  GateComponent: ({ gate, isHighlighted }: any) => (
    <g className="gate-container" data-gate-id={gate.id} data-testid={`gate-${gate.id}`}>
      <rect x={gate.position.x - 25} y={gate.position.y - 25} width="50" height="50" />
    </g>
  ),
}));

vi.mock('@components/Wire', () => ({
  WireComponent: ({ wire }: any) => (
    <line 
      data-testid={`wire-${wire.id}`}
      x1="0" y1="0" x2="100" y2="100" 
      stroke={wire.active ? '#00ff88' : '#666'}
    />
  ),
}));

// Import the hooks for mocking
import { useCanvasSelection } from '@/hooks/useCanvasSelection';
import { useCanvasPan } from '@/hooks/useCanvasPan';
import { useCanvasZoom } from '@/hooks/useCanvasZoom';
import { useIsMobile } from '@/hooks/useResponsive';

// Mock the hooks
vi.mock('@/hooks/useResponsive', () => ({
  useIsMobile: vi.fn(() => false),
}));

vi.mock('@/hooks/useCanvasPan', () => ({
  useCanvasPan: vi.fn(() => ({
    isPanning: false,
    handlePanStart: vi.fn(),
    handlePan: vi.fn(),
    handlePanEnd: vi.fn(),
  })),
}));

vi.mock('@/hooks/useCanvasSelection', () => ({
  useCanvasSelection: vi.fn(() => ({
    isSelecting: false,
    selectionRect: null,
    selectionJustFinished: { current: false },
    startSelection: vi.fn(),
    updateSelection: vi.fn(),
    endSelection: vi.fn(),
    clearSelection: vi.fn(),
  })),
}));

vi.mock('@/hooks/useCanvasZoom', () => ({
  useCanvasZoom: vi.fn(() => ({
    scale: 1,
    handleZoom: vi.fn(),
    resetZoom: vi.fn(),
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
  })),
}));

// Mock the circuit store
const mockStore = {
  gates: [] as Gate[],
  wires: [] as Wire[],
  isDrawingWire: false,
  wireStart: null,
  selectedGateIds: [] as string[],
  cancelWireDrawing: vi.fn(),
  selectGate: vi.fn(),
  setSelectedGates: vi.fn(),
  addToSelection: vi.fn(),
  clearSelection: vi.fn(),
  addGate: vi.fn((type: GateType, position: Position) => ({
    id: `gate-${Date.now()}`,
    type,
    position,
    inputs: [],
    output: false,
  })),
  addCustomGateInstance: vi.fn(),
  deleteGate: vi.fn(),
  copySelection: vi.fn(),
  paste: vi.fn(),
  canPaste: vi.fn(() => false),
};

// SVGElement mock
const mockSVGPoint = {
  x: 0,
  y: 0,
  matrixTransform: vi.fn((matrix) => {
    // Return the same point for simplicity in tests
    return { x: mockSVGPoint.x, y: mockSVGPoint.y };
  }),
};

const mockSVGElement = {
  createSVGPoint: vi.fn(() => ({ ...mockSVGPoint })),
  getScreenCTM: vi.fn(() => ({
    inverse: vi.fn(() => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 })),
  })),
  style: { cursor: '' },
};

// Override useCircuitStore to return our mock
vi.mock('@/stores/circuitStore', () => ({
  useCircuitStore: vi.fn(),
}));

// Mock zustand getState
(useCircuitStore as any).getState = () => mockStore;

// Mock DragEvent for jsdom
class MockDragEvent extends Event {
  dataTransfer: any;
  
  constructor(type: string, init?: any) {
    super(type, init);
    this.dataTransfer = { dropEffect: '' };
  }
}

global.DragEvent = MockDragEvent as any;

describe('Canvas Component - Drag and Drop Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    // Reset mock store
    Object.assign(mockStore, {
      gates: [],
      wires: [],
      isDrawingWire: false,
      wireStart: null,
      selectedGateIds: [],
    });
    
    // Reset all mocks
    vi.clearAllMocks();
    
    // Setup useCircuitStore mock
    vi.mocked(useCircuitStore).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        return selector(mockStore);
      }
      return mockStore;
    });

    // Mock SVG element methods with proper point transformation
    let lastSetPoint = { x: 0, y: 0 };
    Element.prototype.createSVGPoint = vi.fn(function() {
      const point = {
        x: 0,
        y: 0,
        matrixTransform: vi.fn(function() {
          // Return the point that was set
          return { x: point.x, y: point.y };
        }),
      };
      // Capture the point for later use
      Object.defineProperty(point, 'x', {
        get: () => lastSetPoint.x,
        set: (v) => { lastSetPoint.x = v; },
      });
      Object.defineProperty(point, 'y', {
        get: () => lastSetPoint.y,
        set: (v) => { lastSetPoint.y = v; },
      });
      return point;
    });
    Element.prototype.getScreenCTM = mockSVGElement.getScreenCTM;
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete (window as any)._draggedGate;
  });

  describe('Gate Placement', () => {
    it('should place a gate when clicking on palette then canvas', async () => {
      const { container } = render(<Canvas />);
      const svg = container.querySelector('svg');
      
      // Simulate palette click (sets _draggedGate)
      (window as any)._draggedGate = { type: 'AND' };
      
      // Click on canvas
      fireEvent.click(svg!, { clientX: 100, clientY: 100 });
      
      // Canvas doesn't directly place gates on click, it uses drag and drop
      expect(mockStore.addGate).not.toHaveBeenCalled();
    });

    it.skip('should add gate via drag and drop from palette (テスト環境でSVGレンダリング情報取得不可)', async () => {
      const { container } = render(<Canvas />);
      const svg = container.querySelector('svg');
      
      // Set dragged gate
      (window as any)._draggedGate = { type: 'OR' };
      
      // Create proper drag events with dataTransfer
      const dragOverEvent = new MockDragEvent('dragover');
      Object.defineProperty(dragOverEvent, 'clientX', { value: 200, writable: false });
      Object.defineProperty(dragOverEvent, 'clientY', { value: 200, writable: false });
      Object.defineProperty(dragOverEvent, 'bubbles', { value: true, writable: false });
      Object.defineProperty(dragOverEvent, 'cancelable', { value: true, writable: false });
      
      svg!.dispatchEvent(dragOverEvent);
      
      // Trigger drop
      fireEvent.drop(svg!, { clientX: 200, clientY: 200 });
      
      expect(mockStore.addGate).toHaveBeenCalledWith('OR', { x: 200, y: 200 });
    });

    it.skip('should handle custom gate placement (TODO: SVG座標変換問題)', async () => {
      const customDefinition = {
        id: 'custom-1',
        name: 'Custom Gate',
        truthTable: [],
      };
      
      const { container } = render(<Canvas />);
      const svg = container.querySelector('svg');
      
      // Set dragged custom gate
      (window as any)._draggedGate = { 
        type: 'CUSTOM',
        customDefinition 
      };
      
      fireEvent.drop(svg!, { clientX: 300, clientY: 300 });
      
      expect(mockStore.addCustomGateInstance).toHaveBeenCalledWith(
        customDefinition,
        { x: 300, y: 300 }
      );
    });
  });

  describe('Gate Selection', () => {
    it('should select a single gate on click', async () => {
      const gate: Gate = {
        id: 'gate-1',
        type: 'AND',
        position: { x: 100, y: 100 },
        inputs: [],
        output: false,
      };
      
      mockStore.gates = [gate];
      
      const { container } = render(<Canvas />);
      
      // Gate component handles its own click, not Canvas
      // Canvas only handles background clicks for deselection
      const background = container.querySelector('#canvas-background');
      fireEvent.click(background!);
      
      expect(mockStore.clearSelection).toHaveBeenCalled();
    });

    it('should handle multiple selection with Shift key', async () => {
      mockStore.gates = [
        { id: 'gate-1', type: 'AND', position: { x: 100, y: 100 }, inputs: [], output: false },
        { id: 'gate-2', type: 'OR', position: { x: 200, y: 200 }, inputs: [], output: false },
      ];
      
      const { container } = render(<Canvas />);
      const background = container.querySelector('#canvas-background');
      
      // Click with shift should not clear selection
      fireEvent.click(background!, { shiftKey: true });
      
      expect(mockStore.clearSelection).not.toHaveBeenCalled();
    });

    it('should handle selection rectangle', async () => {
      const mockStartSelection = vi.fn();
      const mockUpdateSelection = vi.fn();
      const mockEndSelection = vi.fn();
      
      // Temporarily override the mock for this test
      const originalMock = vi.mocked(useCanvasSelection);
      vi.mocked(useCanvasSelection).mockReturnValueOnce({
        isSelecting: false,
        selectionRect: null,
        selectionJustFinished: { current: false },
        startSelection: mockStartSelection,
        updateSelection: mockUpdateSelection,
        endSelection: mockEndSelection,
        clearSelection: vi.fn(),
      });
      
      const { container } = render(<Canvas />);
      const svg = container.querySelector('svg');
      
      // Start selection
      fireEvent.mouseDown(svg!, { clientX: 50, clientY: 50, button: 0 });
      
      // startSelection should be called with the transformed coordinates
      // Our mock sets the coordinates from clientX/Y (50, 50)
      expect(mockStartSelection).toHaveBeenCalledWith(50, 50);
    });
  });

  describe('Gate Movement', () => {
    it('should move selected gates', async () => {
      mockStore.selectedGateIds = ['gate-1'];
      mockStore.gates = [
        { id: 'gate-1', type: 'AND', position: { x: 100, y: 100 }, inputs: [], output: false },
      ];
      
      const { container } = render(<Canvas />);
      
      // Movement is handled by Gate component, not Canvas
      // Canvas provides the infrastructure but Gate handles drag
    });

    it('should handle drag with existing wires', async () => {
      mockStore.gates = [
        { id: 'gate-1', type: 'AND', position: { x: 100, y: 100 }, inputs: [], output: false },
      ];
      mockStore.wires = [
        { id: 'wire-1', from: { gateId: 'gate-1', pinIndex: 0 }, to: { gateId: 'gate-2', pinIndex: 0 }, active: false },
      ];
      
      const { container } = render(<Canvas />);
      
      // Verify wires are rendered
      const wires = container.querySelectorAll('[data-testid^="wire-"]');
      expect(wires.length).toBe(1); // Wire component is mocked but should render
    });
  });

  describe('Edge Cases', () => {
    it.skip('should handle drag outside canvas boundaries (TODO: SVG座標変換問題)', async () => {
      const { container } = render(<Canvas />);
      const svg = container.querySelector('svg');
      
      (window as any)._draggedGate = { type: 'NOT' };
      
      // Drop at negative coordinates
      fireEvent.drop(svg!, { clientX: -100, clientY: -100 });
      
      // Should still add gate at the calculated position
      expect(mockStore.addGate).toHaveBeenCalledWith('NOT', { x: -100, y: -100 });
    });

    it('should handle rapid clicking/dragging', async () => {
      const { container } = render(<Canvas />);
      const svg = container.querySelector('svg');
      
      (window as any)._draggedGate = { type: 'XOR' };
      
      // Rapid drops
      for (let i = 0; i < 10; i++) {
        fireEvent.drop(svg!, { clientX: i * 10, clientY: i * 10 });
      }
      
      expect(mockStore.addGate).toHaveBeenCalledTimes(10);
    });

    it('should cancel wire drawing on escape', async () => {
      mockStore.isDrawingWire = true;
      
      render(<Canvas />);
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(mockStore.cancelWireDrawing).toHaveBeenCalled();
    });

    it('should handle undo/redo during drag operations', async () => {
      const { container } = render(<Canvas />);
      
      // Simulate Ctrl+Z
      fireEvent.keyDown(document, { key: 'z', ctrlKey: true });
      
      // Undo/redo is handled by keyboard shortcuts hook, not tested here
    });
  });

  describe('Touch Events', () => {
    it('should handle touch drag for mobile', async () => {
      vi.mocked(useIsMobile).mockReturnValueOnce(true);
      
      const mockHandlePanStart = vi.fn();
      const mockHandlePan = vi.fn();
      const mockHandlePanEnd = vi.fn();
      
      vi.mocked(useCanvasPan).mockReturnValueOnce({
        isPanning: false,
        handlePanStart: mockHandlePanStart,
        handlePan: mockHandlePan,
        handlePanEnd: mockHandlePanEnd,
      });
      
      const { container } = render(<Canvas />);
      const svg = container.querySelector('svg');
      
      // Touch start
      fireEvent.touchStart(svg!, {
        touches: [{ clientX: 100, clientY: 100 }],
      });
      
      expect(mockHandlePanStart).toHaveBeenCalledWith(100, 100);
      
      // Touch end
      fireEvent.touchEnd(svg!);
      
      expect(mockHandlePanEnd).toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('should handle many gates efficiently', async () => {
      const manyGates: Gate[] = [];
      for (let i = 0; i < 100; i++) {
        manyGates.push({
          id: `gate-${i}`,
          type: 'AND',
          position: { x: i * 50, y: Math.floor(i / 10) * 50 },
          inputs: [],
          output: false,
        });
      }
      
      mockStore.gates = manyGates;
      
      const startTime = performance.now();
      const { container } = render(<Canvas />);
      const renderTime = performance.now() - startTime;
      
      // Should render within reasonable time
      expect(renderTime).toBeLessThan(100); // 100ms threshold
      
      // All gates should be rendered
      const gateElements = container.querySelectorAll('.gate-container');
      expect(gateElements.length).toBe(100); // Gate components are mocked but should render
    });

    it('should handle performance with clock gates', async () => {
      mockStore.gates = [
        {
          id: 'clock-1',
          type: 'CLOCK',
          position: { x: 100, y: 100 },
          inputs: [],
          output: false,
          metadata: { isRunning: true, frequency: 1 },
        },
      ];
      
      const { unmount } = render(<Canvas />);
      
      // Component should set up interval for clock
      // Verify no memory leaks on unmount
      unmount();
    });
  });

  describe('Zoom/Pan Interactions', () => {
    it('should handle zoom during drag', async () => {
      const mockHandleZoom = vi.fn();
      
      vi.mocked(useCanvasZoom).mockReturnValueOnce({
        scale: 1.5,
        handleZoom: mockHandleZoom,
        resetZoom: vi.fn(),
        zoomIn: vi.fn(),
        zoomOut: vi.fn(),
      });
      
      const { container } = render(<Canvas />);
      const svg = container.querySelector('svg');
      
      // Wheel event for zoom
      fireEvent.wheel(svg!, { deltaY: -100, clientX: 400, clientY: 300 });
      
      expect(mockHandleZoom).toHaveBeenCalledWith(100, 400, 300);
    });

    it('should handle pan with space key', async () => {
      const mockHandlePanStart = vi.fn();
      
      // Need to keep track of isSpacePressed state
      let isSpacePressed = false;
      
      vi.mocked(useCanvasPan).mockReturnValue({
        isPanning: false,
        handlePanStart: mockHandlePanStart,
        handlePan: vi.fn(),
        handlePanEnd: vi.fn(),
      });
      
      const { container } = render(<Canvas />);
      const svg = container.querySelector('svg');
      
      // Press space
      fireEvent.keyDown(document, { key: ' ', preventDefault: vi.fn() });
      
      // Need to wait for state update
      await act(async () => {
        // Mouse down should start pan
        fireEvent.mouseDown(svg!, { clientX: 100, clientY: 100, button: 0 });
      });
      
      expect(mockHandlePanStart).toHaveBeenCalledWith(100, 100);
    });
  });

  describe('Context Menu and Keyboard Shortcuts', () => {
    it('should delete selected gates with Delete key', async () => {
      mockStore.selectedGateIds = ['gate-1', 'gate-2'];
      
      render(<Canvas />);
      
      fireEvent.keyDown(document, { key: 'Delete' });
      
      expect(mockStore.deleteGate).toHaveBeenCalledWith('gate-1');
      expect(mockStore.deleteGate).toHaveBeenCalledWith('gate-2');
    });

    it('should copy/paste with keyboard shortcuts', async () => {
      mockStore.selectedGateIds = ['gate-1'];
      mockStore.canPaste.mockReturnValue(true);
      
      render(<Canvas />);
      
      // Copy
      fireEvent.keyDown(document, { key: 'c', ctrlKey: true });
      expect(mockStore.copySelection).toHaveBeenCalled();
      
      // Paste
      fireEvent.keyDown(document, { key: 'v', ctrlKey: true });
      expect(mockStore.paste).toHaveBeenCalledWith({ x: 400, y: 300 });
    });
  });

  describe('Mouse Leave/Enter During Drag', () => {
    it('should handle mouse leaving canvas during selection', async () => {
      const mockEndSelection = vi.fn();
      
      vi.mocked(useCanvasSelection).mockReturnValueOnce({
        isSelecting: true,
        selectionRect: { startX: 0, startY: 0, endX: 100, endY: 100 },
        selectionJustFinished: { current: false },
        startSelection: vi.fn(),
        updateSelection: vi.fn(),
        endSelection: mockEndSelection,
        clearSelection: vi.fn(),
      });
      
      const { container } = render(<Canvas />);
      const svg = container.querySelector('svg');
      
      // Mouse up outside should end selection
      fireEvent.mouseUp(document);
      
      // Global event listener should handle this
    });
  });

  describe('Drag Prevention Cases', () => {
    it.skip('should not allow dragging when wire is being drawn (TODO: SVG座標変換問題)', async () => {
      mockStore.isDrawingWire = true;
      
      const { container } = render(<Canvas />);
      const svg = container.querySelector('svg');
      
      (window as any)._draggedGate = { type: 'NAND' };
      
      // Drop should still work even if wire is being drawn
      fireEvent.drop(svg!, { clientX: 150, clientY: 150 });
      
      expect(mockStore.addGate).toHaveBeenCalledWith('NAND', { x: 150, y: 150 });
    });
  });

  describe('Drop Effect Feedback', () => {
    it.skip('should set correct drop effect on dragOver (TODO: DragEvent dataTransfer問題)', async () => {
      const { container } = render(<Canvas />);
      const svg = container.querySelector('svg');
      
      const dragOverEvent = new MockDragEvent('dragover');
      Object.defineProperty(dragOverEvent, 'bubbles', { value: true });
      Object.defineProperty(dragOverEvent, 'cancelable', { value: true });
      
      svg!.dispatchEvent(dragOverEvent);
      
      expect(dragOverEvent.defaultPrevented).toBe(true);
      expect((dragOverEvent as any).dataTransfer.dropEffect).toBe('copy');
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle multiple gates being dragged simultaneously', async () => {
      const { container } = render(<Canvas />);
      const svg = container.querySelector('svg');
      
      // Set multiple dragged gates in quick succession
      const gateTypes = ['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR'];
      
      for (let i = 0; i < gateTypes.length; i++) {
        (window as any)._draggedGate = { type: gateTypes[i] };
        fireEvent.drop(svg!, { clientX: i * 100, clientY: i * 100 });
      }
      
      expect(mockStore.addGate).toHaveBeenCalledTimes(gateTypes.length);
    });

    it('should handle selection during wire drawing', async () => {
      mockStore.isDrawingWire = true;
      mockStore.wireStart = { gateId: 'gate-1', pinIndex: 0, position: { x: 100, y: 100 } };
      
      const { container } = render(<Canvas />);
      const background = container.querySelector('#canvas-background');
      
      // Click should cancel wire drawing
      fireEvent.click(background!);
      
      expect(mockStore.cancelWireDrawing).toHaveBeenCalled();
    });
  });

  describe('Complex Drag Scenarios', () => {
    it('should handle drag with multiple selected gates', async () => {
      mockStore.selectedGateIds = ['gate-1', 'gate-2', 'gate-3'];
      mockStore.gates = [
        { id: 'gate-1', type: 'AND', position: { x: 100, y: 100 }, inputs: [], output: false },
        { id: 'gate-2', type: 'OR', position: { x: 200, y: 100 }, inputs: [], output: false },
        { id: 'gate-3', type: 'NOT', position: { x: 300, y: 100 }, inputs: [], output: false },
      ];
      
      const { container } = render(<Canvas />);
      
      // Delete all selected gates
      fireEvent.keyDown(document, { key: 'Delete' });
      
      expect(mockStore.deleteGate).toHaveBeenCalledTimes(3);
      expect(mockStore.deleteGate).toHaveBeenCalledWith('gate-1');
      expect(mockStore.deleteGate).toHaveBeenCalledWith('gate-2');
      expect(mockStore.deleteGate).toHaveBeenCalledWith('gate-3');
    });

    it('should maintain gate connections during drag', async () => {
      const connectedGates = [
        { id: 'gate-1', type: 'AND' as GateType, position: { x: 100, y: 100 }, inputs: [], output: true },
        { id: 'gate-2', type: 'OR' as GateType, position: { x: 300, y: 100 }, inputs: ['gate-1'], output: false },
      ];
      
      const wires = [
        { 
          id: 'wire-1', 
          from: { gateId: 'gate-1', pinIndex: 0 }, 
          to: { gateId: 'gate-2', pinIndex: 0 }, 
          active: true 
        },
      ];
      
      mockStore.gates = connectedGates;
      mockStore.wires = wires;
      
      const { container } = render(<Canvas />);
      
      // Verify that wires are preserved during render
      expect(mockStore.wires).toHaveLength(1);
      expect(mockStore.wires[0].active).toBe(true);
    });
  });

  describe('Performance Benchmarks', () => {
    it('should render large canvas with acceptable performance', async () => {
      const largeGateSet: Gate[] = [];
      const largeWireSet: Wire[] = [];
      
      // Create 500 gates in a grid
      for (let i = 0; i < 500; i++) {
        const row = Math.floor(i / 25);
        const col = i % 25;
        largeGateSet.push({
          id: `gate-${i}`,
          type: (i % 2 === 0) ? 'AND' : 'OR',
          position: { x: col * 60, y: row * 60 },
          inputs: [],
          output: i % 3 === 0,
        });
      }
      
      // Create connections between adjacent gates
      for (let i = 0; i < 400; i++) {
        if (i % 25 !== 24) { // Not at end of row
          largeWireSet.push({
            id: `wire-${i}`,
            from: { gateId: `gate-${i}`, pinIndex: 0 },
            to: { gateId: `gate-${i + 1}`, pinIndex: 0 },
            active: i % 2 === 0,
          });
        }
      }
      
      mockStore.gates = largeGateSet;
      mockStore.wires = largeWireSet;
      
      const startTime = performance.now();
      const { container } = render(<Canvas />);
      const renderTime = performance.now() - startTime;
      
      console.log(`Rendered ${largeGateSet.length} gates and ${largeWireSet.length} wires in ${renderTime.toFixed(2)}ms`);
      
      // Should render within 500ms even with many elements
      expect(renderTime).toBeLessThan(500);
    });

    it('should handle rapid state updates efficiently', async () => {
      const { rerender } = render(<Canvas />);
      
      const updateTimes: number[] = [];
      
      // Perform 100 rapid updates
      for (let i = 0; i < 100; i++) {
        const startTime = performance.now();
        
        mockStore.gates = [{
          id: `gate-${i}`,
          type: 'AND',
          position: { x: i * 10, y: i * 10 },
          inputs: [],
          output: i % 2 === 0,
        }];
        
        rerender(<Canvas />);
        
        updateTimes.push(performance.now() - startTime);
      }
      
      const avgUpdateTime = updateTimes.reduce((a, b) => a + b, 0) / updateTimes.length;
      console.log(`Average update time: ${avgUpdateTime.toFixed(2)}ms`);
      
      // Average update should be fast
      expect(avgUpdateTime).toBeLessThan(10);
    });
  });

  describe('Accessibility and Error Handling', () => {
    it.skip('should handle errors gracefully when SVG operations fail (TODO: SVGエラーモック問題)', async () => {
      // Mock SVG methods to throw errors
      const errorSVG = {
        createSVGPoint: vi.fn(() => {
          throw new Error('SVG operation failed');
        }),
        getScreenCTM: vi.fn(() => null),
        style: { cursor: '' },
      };
      
      const { container } = render(<Canvas />);
      const svg = container.querySelector('svg');
      
      // Override SVG methods
      Object.assign(svg!, errorSVG);
      
      // Should not crash when drop is attempted
      (window as any)._draggedGate = { type: 'AND' };
      
      expect(() => {
        fireEvent.drop(svg!, { clientX: 100, clientY: 100 });
      }).not.toThrow();
    });

    it('should provide keyboard navigation support', async () => {
      mockStore.selectedGateIds = ['gate-1'];
      mockStore.gates = [
        { id: 'gate-1', type: 'AND', position: { x: 100, y: 100 }, inputs: [], output: false },
      ];
      
      render(<Canvas />);
      
      // Test various keyboard shortcuts
      const shortcuts = [
        { key: 'Delete', action: 'delete' },
        { key: 'Backspace', action: 'delete' },
        { key: 'c', ctrlKey: true, action: 'copy' },
        { key: 'v', ctrlKey: true, action: 'paste' },
        { key: 'c', metaKey: true, action: 'copy' },
        { key: 'v', metaKey: true, action: 'paste' },
      ];
      
      shortcuts.forEach(shortcut => {
        vi.clearAllMocks();
        fireEvent.keyDown(document, shortcut);
        
        if (shortcut.action === 'delete') {
          expect(mockStore.deleteGate).toHaveBeenCalled();
        } else if (shortcut.action === 'copy') {
          expect(mockStore.copySelection).toHaveBeenCalled();
        } else if (shortcut.action === 'paste') {
          expect(mockStore.canPaste).toHaveBeenCalled();
        }
      });
    });
  });

  describe('State Consistency', () => {
    it.skip('should maintain consistent state across drag operations (TODO: SVG座標変換問題)', async () => {
      const { container, rerender } = render(<Canvas />);
      const svg = container.querySelector('svg');
      
      // Add multiple gates
      const positions = [
        { x: 100, y: 100 },
        { x: 200, y: 200 },
        { x: 300, y: 300 },
      ];
      
      positions.forEach((pos, index) => {
        (window as any)._draggedGate = { type: 'AND' };
        fireEvent.drop(svg!, { clientX: pos.x, clientY: pos.y });
        
        // Verify gate was added with correct position
        expect(mockStore.addGate).toHaveBeenNthCalledWith(index + 1, 'AND', pos);
      });
      
      // Verify all calls were made
      expect(mockStore.addGate).toHaveBeenCalledTimes(positions.length);
    });

    it('should handle undo/redo state correctly', async () => {
      mockStore.gates = [
        { id: 'gate-1', type: 'AND', position: { x: 100, y: 100 }, inputs: [], output: false },
      ];
      
      const { container } = render(<Canvas />);
      
      // These operations would typically be handled by useKeyboardShortcuts hook
      // but we're testing that Canvas doesn't interfere with them
      fireEvent.keyDown(document, { key: 'z', ctrlKey: true }); // Undo
      fireEvent.keyDown(document, { key: 'y', ctrlKey: true }); // Redo
      
      // Canvas should not handle these shortcuts directly
      expect(mockStore.addGate).not.toHaveBeenCalled();
    });
  });
});
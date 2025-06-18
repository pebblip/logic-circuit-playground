/**
 * useCanvasInteraction フックのテスト
 * マウス・タッチイベント処理の動作確認
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCanvasInteraction } from '@/components/canvas/hooks/useCanvasInteraction';
import { useCircuitStore } from '@/stores/circuitStore';
import type { Gate } from '@/types/circuit';
import type { SelectionRect } from '@/hooks/useCanvasSelection';

// モックの設定
vi.mock('@/stores/circuitStore');
vi.mock('@infrastructure/ui/svgCoordinates', () => ({
  reactEventToSVGCoordinates: vi.fn((event, svg) => ({ x: event.clientX, y: event.clientY })),
  mouseEventToSVGCoordinates: vi.fn((event, svg) => ({ x: event.clientX, y: event.clientY }))
}));
vi.mock('@/components/canvas/utils/canvasHelpers', () => ({
  isGateElement: vi.fn((element) => element && element.dataset?.gate === 'true')
}));

describe('useCanvasInteraction', () => {
  const mockSvgRef = { current: document.createElementNS('http://www.w3.org/2000/svg', 'svg') };
  const mockSetMousePosition = vi.fn();
  const mockSetIsDraggingSelection = vi.fn();
  const mockSetDragStart = vi.fn();
  const mockSetInitialGatePositions = vi.fn();
  const mockSetInitialSelectionRect = vi.fn();
  const mockHandlePan = vi.fn();
  const mockHandlePanStart = vi.fn();
  const mockHandlePanEnd = vi.fn();
  const mockUpdateSelection = vi.fn();
  const mockStartSelection = vi.fn();
  const mockEndSelection = vi.fn();
  const mockSetSelectionRect = vi.fn();
  const mockHandleZoom = vi.fn();
  const mockClearSelection = vi.fn();
  const mockClearSelectionRect = vi.fn();
  const mockCancelWireDrawing = vi.fn();
  const mockSelectionJustFinished = { current: false };
  
  const defaultProps = {
    svgRef: mockSvgRef,
    displayGates: [] as Gate[],
    selectedGateIds: [],
    isSelecting: false,
    selectionRect: null as SelectionRect | null,
    selectionJustFinished: mockSelectionJustFinished,
    isDraggingSelection: false,
    dragStart: null,
    initialGatePositions: new Map(),
    initialSelectionRect: null,
    isSpacePressed: false,
    isPanning: false,
    isDrawingWire: false,
    isReadOnly: false,
    setMousePosition: mockSetMousePosition,
    setIsDraggingSelection: mockSetIsDraggingSelection,
    setDragStart: mockSetDragStart,
    setInitialGatePositions: mockSetInitialGatePositions,
    setInitialSelectionRect: mockSetInitialSelectionRect,
    handlePan: mockHandlePan,
    handlePanStart: mockHandlePanStart,
    handlePanEnd: mockHandlePanEnd,
    updateSelection: mockUpdateSelection,
    startSelection: mockStartSelection,
    endSelection: mockEndSelection,
    setSelectionRect: mockSetSelectionRect,
    handleZoom: mockHandleZoom,
    clearSelection: mockClearSelection,
    clearSelectionRect: mockClearSelectionRect,
    cancelWireDrawing: mockCancelWireDrawing,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useCircuitStore as any).mockReturnValue({ gates: [] });
    (useCircuitStore as any).getState = vi.fn(() => ({ saveToHistory: vi.fn() }));
  });

  describe('handleMouseMove', () => {
    it('マウス位置を更新する', () => {
      const { result } = renderHook(() => useCanvasInteraction(defaultProps));
      const event = new MouseEvent('mousemove', { clientX: 100, clientY: 200 });
      
      act(() => {
        result.current.handleMouseMove(event as any);
      });
      
      expect(mockSetMousePosition).toHaveBeenCalledWith({ x: 100, y: 200 });
    });

    it('パン中はhandlePanを呼ぶ', () => {
      const props = { ...defaultProps, isPanning: true };
      const { result } = renderHook(() => useCanvasInteraction(props));
      const event = new MouseEvent('mousemove', { clientX: 100, clientY: 200 });
      
      act(() => {
        result.current.handleMouseMove(event as any);
      });
      
      expect(mockHandlePan).toHaveBeenCalledWith(100, 200);
    });

    it('選択中はupdateSelectionを呼ぶ', () => {
      const props = { ...defaultProps, isSelecting: true };
      const { result } = renderHook(() => useCanvasInteraction(props));
      const event = new MouseEvent('mousemove', { clientX: 100, clientY: 200 });
      
      act(() => {
        result.current.handleMouseMove(event as any);
      });
      
      expect(mockUpdateSelection).toHaveBeenCalledWith(100, 200);
    });
  });

  describe('handleClick', () => {
    it('読み取り専用モードでは何もしない', () => {
      const props = { ...defaultProps, isReadOnly: true };
      const { result } = renderHook(() => useCanvasInteraction(props));
      const event = new MouseEvent('click');
      
      act(() => {
        result.current.handleClick(event as any);
      });
      
      expect(mockClearSelection).not.toHaveBeenCalled();
    });

    it('背景クリックで選択をクリアする', () => {
      const { result } = renderHook(() => useCanvasInteraction(defaultProps));
      const event = new MouseEvent('click');
      Object.defineProperty(event, 'target', { value: mockSvgRef.current });
      
      act(() => {
        result.current.handleClick(event as any);
      });
      
      expect(mockClearSelection).toHaveBeenCalled();
      expect(mockClearSelectionRect).toHaveBeenCalled();
    });

    it('ゲート要素クリックでは選択をクリアしない', () => {
      const { result } = renderHook(() => useCanvasInteraction(defaultProps));
      const gateElement = document.createElement('g');
      gateElement.dataset.gate = 'true';
      const event = new MouseEvent('click');
      Object.defineProperty(event, 'target', { value: gateElement });
      
      act(() => {
        result.current.handleClick(event as any);
      });
      
      expect(mockClearSelection).not.toHaveBeenCalled();
    });

    it('ワイヤー描画中はキャンセルする', () => {
      const props = { ...defaultProps, isDrawingWire: true };
      const { result } = renderHook(() => useCanvasInteraction(props));
      const event = new MouseEvent('click');
      Object.defineProperty(event, 'target', { value: mockSvgRef.current });
      
      act(() => {
        result.current.handleClick(event as any);
      });
      
      expect(mockCancelWireDrawing).toHaveBeenCalled();
    });

    it('Shiftキー押下時は選択をクリアしない', () => {
      const { result } = renderHook(() => useCanvasInteraction(defaultProps));
      const event = new MouseEvent('click', { shiftKey: true });
      Object.defineProperty(event, 'target', { value: mockSvgRef.current });
      
      act(() => {
        result.current.handleClick(event as any);
      });
      
      expect(mockClearSelection).not.toHaveBeenCalled();
    });
  });

  describe('handleWheel', () => {
    it('ホイールイベントでズームを実行する', () => {
      const { result } = renderHook(() => useCanvasInteraction(defaultProps));
      const event = new WheelEvent('wheel', { deltaY: -100, clientX: 200, clientY: 300 });
      const preventDefault = vi.fn();
      Object.defineProperty(event, 'preventDefault', { value: preventDefault });
      
      act(() => {
        result.current.handleWheel(event as any);
      });
      
      expect(preventDefault).toHaveBeenCalled();
      expect(mockHandleZoom).toHaveBeenCalledWith(100, 200, 300);
    });
  });

  describe('handleMouseDown', () => {
    it('スペースキー押下時はパンを開始する', () => {
      const props = { ...defaultProps, isSpacePressed: true };
      const { result } = renderHook(() => useCanvasInteraction(props));
      const event = new MouseEvent('mousedown', { button: 0, clientX: 100, clientY: 200 });
      
      act(() => {
        result.current.handleMouseDown(event as any);
      });
      
      expect(mockHandlePanStart).toHaveBeenCalledWith(100, 200);
      expect(mockStartSelection).not.toHaveBeenCalled();
    });

    it('中ボタンでパンを開始する', () => {
      const { result } = renderHook(() => useCanvasInteraction(defaultProps));
      const event = new MouseEvent('mousedown', { button: 1, clientX: 100, clientY: 200 });
      
      act(() => {
        result.current.handleMouseDown(event as any);
      });
      
      expect(mockHandlePanStart).toHaveBeenCalledWith(100, 200);
    });

    it('背景クリックで選択矩形を開始する', () => {
      const { result } = renderHook(() => useCanvasInteraction(defaultProps));
      const event = new MouseEvent('mousedown', { button: 0, clientX: 100, clientY: 200 });
      Object.defineProperty(event, 'target', { value: mockSvgRef.current });
      
      act(() => {
        result.current.handleMouseDown(event as any);
      });
      
      expect(mockStartSelection).toHaveBeenCalledWith(100, 200);
    });

    it('選択されたゲート上でドラッグを開始する', () => {
      const gates: Gate[] = [{
        id: 'gate-1',
        type: 'AND',
        position: { x: 100, y: 100 },
        inputs: [],
        output: false
      }];
      
      (useCircuitStore as any).mockReturnValue({ gates });
      
      const props = {
        ...defaultProps,
        selectedGateIds: ['gate-1'],
        selectionRect: { startX: 50, startY: 50, endX: 150, endY: 150 }
      };
      
      const { result } = renderHook(() => useCanvasInteraction(props));
      const event = new MouseEvent('mousedown', { button: 0, clientX: 100, clientY: 100 });
      
      act(() => {
        result.current.handleMouseDown(event as any);
      });
      
      expect(mockSetIsDraggingSelection).toHaveBeenCalledWith(true);
      expect(mockSetDragStart).toHaveBeenCalledWith({ x: 100, y: 100 });
      expect(mockSetInitialGatePositions).toHaveBeenCalled();
    });
  });

  describe('handleMouseUp', () => {
    it('パンを終了する', () => {
      const props = { ...defaultProps, isPanning: true };
      const { result } = renderHook(() => useCanvasInteraction(props));
      const event = new MouseEvent('mouseup');
      
      act(() => {
        result.current.handleMouseUp(event as any);
      });
      
      expect(mockHandlePanEnd).toHaveBeenCalled();
    });

    it('選択矩形を終了する', () => {
      const props = { ...defaultProps, isSelecting: true };
      const { result } = renderHook(() => useCanvasInteraction(props));
      const event = new MouseEvent('mouseup');
      
      act(() => {
        result.current.handleMouseUp(event as any);
      });
      
      expect(mockEndSelection).toHaveBeenCalled();
    });

    it('ドラッグを終了して履歴を保存する', () => {
      const mockSaveToHistory = vi.fn();
      (useCircuitStore as any).getState = vi.fn(() => ({ saveToHistory: mockSaveToHistory }));
      
      const props = { ...defaultProps, isDraggingSelection: true };
      const { result } = renderHook(() => useCanvasInteraction(props));
      const event = new MouseEvent('mouseup');
      
      act(() => {
        result.current.handleMouseUp(event as any);
      });
      
      expect(mockSetIsDraggingSelection).toHaveBeenCalledWith(false);
      expect(mockSetDragStart).toHaveBeenCalledWith(null);
      expect(mockSaveToHistory).toHaveBeenCalled();
    });
  });

  describe('Touch Events', () => {
    it('タッチでパンを開始する', () => {
      const { result } = renderHook(() => useCanvasInteraction(defaultProps));
      const touch = { clientX: 100, clientY: 200 };
      const event = new TouchEvent('touchstart', { touches: [touch] as any });
      Object.defineProperty(event, 'target', { value: mockSvgRef.current });
      
      act(() => {
        result.current.handleTouchStart(event as any);
      });
      
      expect(mockHandlePanStart).toHaveBeenCalledWith(100, 200);
    });

    it('タッチ移動でパンを継続する', () => {
      const props = { ...defaultProps, isPanning: true };
      const { result } = renderHook(() => useCanvasInteraction(props));
      const touch = { clientX: 150, clientY: 250 };
      const event = new TouchEvent('touchmove', { touches: [touch] as any });
      
      act(() => {
        result.current.handleTouchMove(event as any);
      });
      
      expect(mockHandlePan).toHaveBeenCalledWith(150, 250);
    });

    it('タッチ終了でパンを終了する', () => {
      const { result } = renderHook(() => useCanvasInteraction(defaultProps));
      const event = new TouchEvent('touchend');
      
      act(() => {
        result.current.handleTouchEnd(event as any);
      });
      
      expect(mockHandlePanEnd).toHaveBeenCalled();
    });
  });
});
import { useState, useCallback } from 'react';
import { Gate } from '../entities/gates/BaseGate';

interface DragOffset {
  x: number;
  y: number;
}

interface UseUIInteractionReturn {
  selectedTool: string;
  setSelectedTool: (tool: string) => void;
  hoveredGate: string | null;
  setHoveredGate: (gateId: string | null) => void;
  draggedGate: string | null;
  dragOffset: DragOffset | null;
  isDraggingGate: boolean;
  startDragging: (gateId: string, offset: DragOffset) => void;
  updateDragging: (offset: DragOffset) => void;
  stopDragging: () => void;
}

export function useUIInteraction(): UseUIInteractionReturn {
  const [selectedTool, setSelectedTool] = useState<string>('select');
  const [hoveredGate, setHoveredGate] = useState<string | null>(null);
  const [draggedGate, setDraggedGate] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<DragOffset | null>(null);
  const [isDraggingGate, setIsDraggingGate] = useState(false);

  const startDragging = useCallback((gateId: string, offset: DragOffset) => {
    setDraggedGate(gateId);
    setDragOffset(offset);
    setIsDraggingGate(true);
  }, []);

  const updateDragging = useCallback((newPosition: { x: number; y: number }) => {
    // ドラッグ中の位置更新（オフセットは変更しない）
  }, []);

  const stopDragging = useCallback(() => {
    setDraggedGate(null);
    setDragOffset(null);
    setIsDraggingGate(false);
  }, []);

  return {
    selectedTool,
    setSelectedTool,
    hoveredGate,
    setHoveredGate,
    draggedGate,
    dragOffset,
    isDraggingGate,
    startDragging,
    updateDragging,
    stopDragging
  };
}
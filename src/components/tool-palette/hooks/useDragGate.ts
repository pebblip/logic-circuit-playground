import { useState, useEffect } from 'react';
import type { GateType, CustomGateDefinition } from '@/types/circuit';

interface DraggedGate {
  type: GateType | 'CUSTOM';
  customDefinition?: CustomGateDefinition;
}

// Extend window type for drag state
declare global {
  interface Window {
    draggedGate?: DraggedGate | null;
  }
}

export const useDragGate = () => {
  const [draggedGate, setDraggedGate] = useState<DraggedGate | null>(null);

  // ドラッグ中のゲート情報を共有するため、windowオブジェクトに設定
  useEffect(() => {
    window.draggedGate = draggedGate;
  }, [draggedGate]);

  const startDrag = (
    type: GateType | 'CUSTOM',
    customDefinition?: CustomGateDefinition
  ) => {
    setDraggedGate({ type, customDefinition });
  };

  const endDrag = () => {
    setDraggedGate(null);
  };

  return {
    draggedGate,
    startDrag,
    endDrag,
  };
};

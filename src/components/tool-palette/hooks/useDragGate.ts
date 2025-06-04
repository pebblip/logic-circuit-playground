import React, { useState, useEffect } from 'react';
import type { GateType, CustomGateDefinition } from '@/types/circuit';

interface DraggedGate {
  type: GateType | 'CUSTOM';
  customDefinition?: CustomGateDefinition;
}

export const useDragGate = () => {
  const [draggedGate, setDraggedGate] = useState<DraggedGate | null>(null);

  // ドラッグ中のゲート情報を共有するため、windowオブジェクトに設定
  useEffect(() => {
    (window as Window & { _draggedGate?: DraggedGate | null })._draggedGate = draggedGate;
  }, [draggedGate]);

  const startDrag = (type: GateType | 'CUSTOM', customDefinition?: CustomGateDefinition) => {
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
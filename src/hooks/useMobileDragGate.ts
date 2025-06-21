import type React from 'react';
import { useState, useRef, useCallback } from 'react';
import type { GateType } from '@/types/circuit';
import { useCircuitStore } from '@/stores/circuitStore';
import { clientToSVGCoordinates } from '@infrastructure/ui/svgCoordinates';

interface DragPreview {
  type: GateType;
  x: number;
  y: number;
}

export const useMobileDragGate = () => {
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const initialTouchRef = useRef<{ x: number; y: number } | null>(null);
  const { addGate } = useCircuitStore();

  const startTouchDrag = useCallback(
    (type: GateType, event: React.TouchEvent) => {
      const touch = event.touches[0];
      initialTouchRef.current = { x: touch.clientX, y: touch.clientY };
      setIsDragging(true);
      setDragPreview({
        type,
        x: touch.clientX,
        y: touch.clientY,
      });
    },
    []
  );

  const updateTouchDrag = useCallback(
    (event: TouchEvent) => {
      if (!isDragging || !dragPreview) return;

      const touch = event.touches[0];
      setDragPreview(prev => ({
        ...prev!,
        x: touch.clientX,
        y: touch.clientY,
      }));
    },
    [isDragging, dragPreview]
  );

  const endTouchDrag = useCallback(
    (event: TouchEvent) => {
      if (!isDragging || !dragPreview) return;

      const touch = event.changedTouches[0];

      // キャンバス要素を探す
      const canvas = document.querySelector('svg.canvas') as SVGSVGElement;
      if (!canvas) {
        setIsDragging(false);
        setDragPreview(null);
        return;
      }

      // タッチ位置をSVG座標に変換
      const transformed = clientToSVGCoordinates(
        touch.clientX,
        touch.clientY,
        canvas
      );
      if (!transformed) {
        setIsDragging(false);
        setDragPreview(null);
        return;
      }

      // ゲートを追加
      addGate(dragPreview.type, { x: transformed.x, y: transformed.y });

      // リセット
      setIsDragging(false);
      setDragPreview(null);
      initialTouchRef.current = null;
    },
    [isDragging, dragPreview, addGate]
  );

  const cancelTouchDrag = useCallback(() => {
    setIsDragging(false);
    setDragPreview(null);
    initialTouchRef.current = null;
  }, []);

  return {
    dragPreview,
    isDragging,
    startTouchDrag,
    updateTouchDrag,
    endTouchDrag,
    cancelTouchDrag,
  };
};

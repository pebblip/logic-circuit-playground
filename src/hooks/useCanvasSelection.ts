import { useState, useCallback, useRef, useEffect } from 'react';
import type { Gate } from '../types/circuit';

export interface SelectionRect {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export const useCanvasSelection = (
  gates: Gate[],
  setSelectedGates: (gateIds: string[]) => void,
  selectedGateIds: string[]
) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(
    null
  );
  const selectionJustFinished = useRef(false);

  const startSelection = useCallback((x: number, y: number) => {
    setIsSelecting(true);
    setSelectionRect({
      startX: x,
      startY: y,
      endX: x,
      endY: y,
    });
  }, []);

  const updateSelection = useCallback(
    (x: number, y: number) => {
      if (!isSelecting || !selectionRect) return;

      setSelectionRect({
        ...selectionRect,
        endX: x,
        endY: y,
      });
    },
    [isSelecting, selectionRect]
  );

  const endSelection = useCallback(() => {
    if (!isSelecting || !selectionRect) {
      setIsSelecting(false);
      return;
    }

    // 矩形内のゲートを選択
    const minX = Math.min(selectionRect.startX, selectionRect.endX);
    const maxX = Math.max(selectionRect.startX, selectionRect.endX);
    const minY = Math.min(selectionRect.startY, selectionRect.endY);
    const maxY = Math.max(selectionRect.startY, selectionRect.endY);

    const selectedGates = gates.filter(gate => {
      const { x, y } = gate.position;
      return x >= minX && x <= maxX && y >= minY && y <= maxY;
    });

    if (selectedGates.length > 0) {
      setSelectedGates(selectedGates.map(g => g.id));
      // 選択されたゲートがある場合は選択矩形を維持（常に正規化された状態で保存）
      setSelectionRect({
        startX: minX,
        startY: minY,
        endX: maxX,
        endY: maxY,
      });
    } else {
      // 選択されたゲートがない場合のみクリア
      setSelectionRect(null);
    }

    setIsSelecting(false);

    // 矩形選択直後のクリックイベントを無視するためのフラグ
    const dragDistance =
      Math.abs(selectionRect.endX - selectionRect.startX) +
      Math.abs(selectionRect.endY - selectionRect.startY);
    if (dragDistance > 5) {
      // 5px以上ドラッグした場合のみ
      selectionJustFinished.current = true;
    }
  }, [isSelecting, selectionRect, gates, setSelectedGates]);

  const clearSelection = useCallback(() => {
    setSelectionRect(null);
    selectionJustFinished.current = false;
  }, []);

  const moveSelectionRect = useCallback((deltaX: number, deltaY: number) => {
    setSelectionRect(prev => {
      if (!prev) return null;
      return {
        startX: prev.startX + deltaX,
        startY: prev.startY + deltaY,
        endX: prev.endX + deltaX,
        endY: prev.endY + deltaY,
      };
    });
  }, []);

  // 選択されたゲートがなくなったら矩形も自動的にクリア
  useEffect(() => {
    if (selectedGateIds.length === 0) {
      setSelectionRect(null);
    }
  }, [selectedGateIds]);

  return {
    isSelecting,
    selectionRect,
    selectionJustFinished,
    startSelection,
    updateSelection,
    endSelection,
    clearSelection,
    moveSelectionRect,
    setSelectionRect,
  };
};

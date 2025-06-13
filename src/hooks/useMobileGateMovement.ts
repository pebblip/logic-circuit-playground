import { useState, useCallback, useRef } from 'react';
import { useCircuitStore } from '@/stores/circuitStore';

interface TouchDragState {
  gateId: string;
  initialTouch: { x: number; y: number };
  initialPosition: { x: number; y: number };
}

export const useMobileGateMovement = () => {
  const [dragState, setDragState] = useState<TouchDragState | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { gates, moveGate, selectGate } = useCircuitStore();

  const startGateTouch = useCallback(
    (
      gateId: string,
      touchPoint: { x: number; y: number },
      svgPoint: { x: number; y: number }
    ) => {
      const gate = gates.find(g => g.id === gateId);
      if (!gate) return;

      // 長押しタイマーをセット（150ms後にドラッグ開始）
      longPressTimerRef.current = setTimeout(() => {
        setDragState({
          gateId,
          initialTouch: svgPoint,
          initialPosition: gate.position,
        });
        selectGate(gateId);
      }, 150);
    },
    [gates, selectGate]
  );

  const updateGateTouch = useCallback(
    (svgPoint: { x: number; y: number }) => {
      if (!dragState) return;

      const deltaX = svgPoint.x - dragState.initialTouch.x;
      const deltaY = svgPoint.y - dragState.initialTouch.y;

      moveGate(dragState.gateId, {
        x: dragState.initialPosition.x + deltaX,
        y: dragState.initialPosition.y + deltaY,
      });
    },
    [dragState, moveGate]
  );

  const endGateTouch = useCallback(() => {
    // 長押しタイマーをクリア
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (dragState) {
      // ドラッグ終了
      setDragState(null);
      // 履歴に保存
      const { saveToHistory } = useCircuitStore.getState();
      saveToHistory();
    }
  }, [dragState]);

  const cancelGateTouch = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setDragState(null);
  }, []);

  return {
    isDraggingGate: !!dragState,
    draggedGateId: dragState?.gateId,
    startGateTouch,
    updateGateTouch,
    endGateTouch,
    cancelGateTouch,
  };
};

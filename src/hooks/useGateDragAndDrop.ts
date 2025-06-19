import type React from 'react';
import { useRef, useState, useEffect } from 'react';
import { useCircuitStore } from '@/stores/circuitStore';
import {
  clientToSVGCoordinates,
  reactEventToSVGCoordinates,
  touchToSVGCoordinates,
} from '@/infrastructure/ui/svgCoordinates';
import type { Gate } from '@/types/circuit';

interface UseDragAndDropResult {
  isDragging: boolean;
  handleMouseDown: (event: React.MouseEvent) => void;
  handleTouchStart: (event: React.TouchEvent) => void;
  hasDragged: boolean;
}

export function useGateDragAndDrop(gate: Gate): UseDragAndDropResult {
  const { moveGate, selectedGateIds } = useCircuitStore();
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const originalPosition = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);

  useEffect(() => {
    const handleGlobalMouseMove = (event: MouseEvent) => {
      if (!isDragging) return;

      // SVG要素を取得
      const svg = (document.querySelector('.canvas') || document.querySelector('.unified-canvas__svg')) as SVGSVGElement;
      if (!svg) return;

      const svgPoint = clientToSVGCoordinates(
        event.clientX,
        event.clientY,
        svg
      );
      if (!svgPoint) return;

      const deltaX = svgPoint.x - dragStart.current.x - gate.position.x;
      const deltaY = svgPoint.y - dragStart.current.y - gate.position.y;

      const newPosition = {
        x: svgPoint.x - dragStart.current.x,
        y: svgPoint.y - dragStart.current.y,
      };

      // 実際に移動した場合はフラグを立てる
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (distance > 5) {
        hasDraggedRef.current = true;
      }

      // 複数選択されている場合、全てのゲートを移動
      if (selectedGateIds.includes(gate.id) && selectedGateIds.length > 1) {
        selectedGateIds.forEach(gateId => {
          if (gateId !== gate.id) {
            const otherGate = useCircuitStore
              .getState()
              .gates.find(g => g.id === gateId);
            if (otherGate) {
              moveGate(gateId, {
                x: otherGate.position.x + deltaX,
                y: otherGate.position.y + deltaY,
              });
            }
          }
        });
      }

      moveGate(gate.id, newPosition);
    };

    const handleGlobalTouchMove = (event: TouchEvent) => {
      if (!isDragging || event.touches.length !== 1) return;

      const touch = event.touches[0];
      const svg = (document.querySelector('.canvas') || document.querySelector('.unified-canvas__svg')) as SVGSVGElement;
      if (!svg) return;

      const svgPoint = clientToSVGCoordinates(touch.clientX, touch.clientY, svg);
      if (!svgPoint) return;

      const deltaX = svgPoint.x - dragStart.current.x - gate.position.x;
      const deltaY = svgPoint.y - dragStart.current.y - gate.position.y;

      const newPosition = {
        x: svgPoint.x - dragStart.current.x,
        y: svgPoint.y - dragStart.current.y,
      };

      // 実際に移動した場合はフラグを立てる
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (distance > 5) {
        hasDraggedRef.current = true;
      }

      // 複数選択されている場合、全てのゲートを移動
      if (selectedGateIds.includes(gate.id) && selectedGateIds.length > 1) {
        selectedGateIds.forEach(gateId => {
          if (gateId !== gate.id) {
            const otherGate = useCircuitStore
              .getState()
              .gates.find(g => g.id === gateId);
            if (otherGate) {
              moveGate(gateId, {
                x: otherGate.position.x + deltaX,
                y: otherGate.position.y + deltaY,
              });
            }
          }
        });
      }

      moveGate(gate.id, newPosition);
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    const handleGlobalTouchEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('touchmove', handleGlobalTouchMove);
      document.addEventListener('touchend', handleGlobalTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [isDragging, gate.id, gate.position, moveGate, selectedGateIds]);

  const handleMouseDown = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    // ワイヤー描画中で、このゲートから描画している場合は移動を禁止
    const state = useCircuitStore.getState();
    if (
      state.isDrawingWire &&
      state.wireStart &&
      state.wireStart.gateId === gate.id
    ) {
      return;
    }

    // SVG座標系でのマウス位置を取得
    const svg = (event.currentTarget as SVGElement).ownerSVGElement;
    if (!svg) return;

    const svgPoint = reactEventToSVGCoordinates(event, svg);
    if (!svgPoint) return;

    dragStart.current = {
      x: svgPoint.x - gate.position.x,
      y: svgPoint.y - gate.position.y,
    };

    // ドラッグ開始時の位置を記録
    originalPosition.current = { ...gate.position };
    hasDraggedRef.current = false;

    setIsDragging(true);
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    event.preventDefault();

    // ワイヤー描画中で、このゲートから描画している場合は移動を禁止
    const state = useCircuitStore.getState();
    if (
      state.isDrawingWire &&
      state.wireStart &&
      state.wireStart.gateId === gate.id
    ) {
      return;
    }

    if (event.touches.length === 1) {
      const touch = event.touches[0];

      // SVG座標系でのタッチ位置を取得
      const svg = (event.currentTarget as SVGElement).ownerSVGElement;
      if (!svg) return;

      const svgPoint = touchToSVGCoordinates(touch as Touch, svg);
      if (!svgPoint) return;

      dragStart.current = {
        x: svgPoint.x - gate.position.x,
        y: svgPoint.y - gate.position.y,
      };

      // ドラッグ開始時の位置を記録
      originalPosition.current = { ...gate.position };
      hasDraggedRef.current = false;

      setIsDragging(true);
    }
  };

  return {
    isDragging,
    handleMouseDown,
    handleTouchStart,
    hasDragged: hasDraggedRef.current,
  };
}

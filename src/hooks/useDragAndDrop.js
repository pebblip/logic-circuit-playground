// ドラッグ&ドロップ機能用カスタムフック

import { useState, useCallback, useRef } from 'react';
import { getSVGPoint } from '../utils/svg';
import { constrainGatePosition } from '../utils/circuit';
import { CANVAS } from '../constants/circuit';

/**
 * ドラッグ&ドロップ機能を管理するカスタムフック
 * @param {Function} onGateMove - ゲート移動時のコールバック
 * @returns {Object} ドラッグ&ドロップ関連の状態と関数
 */
export const useDragAndDrop = (onGateMove) => {
  const [draggedGate, setDraggedGate] = useState(null);
  const [dragOffset, setDragOffset] = useState(null);
  const [connectionDrag, setConnectionDrag] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  // ゲートドラッグ開始
  const handleGateMouseDown = useCallback((event, gate) => {
    event.stopPropagation();
    const point = getSVGPoint(event, svgRef.current);
    setDraggedGate(gate);
    setDragOffset({
      x: point.x - gate.x,
      y: point.y - gate.y
    });
  }, []);

  // 端子ドラッグ開始（配線用）
  const handleTerminalMouseDown = useCallback((event, gate, isOutput, outputIndex = 0) => {
    event.stopPropagation();
    if (isOutput) {
      setConnectionDrag({
        fromGate: gate,
        fromOutput: outputIndex,
        fromX: gate.x + 60,
        fromY: gate.y + (outputIndex * 20)
      });
    }
  }, []);

  // マウス移動
  const handleMouseMove = useCallback((event) => {
    const point = getSVGPoint(event, svgRef.current);
    setMousePosition(point);
    
    if (draggedGate && dragOffset) {
      const newPosition = constrainGatePosition(
        point.x - dragOffset.x,
        point.y - dragOffset.y,
        CANVAS
      );
      
      onGateMove(draggedGate.id, newPosition.x, newPosition.y);
    }
  }, [draggedGate, dragOffset, onGateMove]);

  // マウスアップ
  const handleMouseUp = useCallback(() => {
    setDraggedGate(null);
    setDragOffset(null);
    setConnectionDrag(null);
  }, []);

  // 端子へのドロップ（配線完了）
  const handleTerminalMouseUp = useCallback((event, toGate, inputIndex) => {
    event.stopPropagation();
    
    if (connectionDrag && toGate.id !== connectionDrag.fromGate.id) {
      const connection = {
        from: connectionDrag.fromGate.id,
        fromOutput: connectionDrag.fromOutput,
        to: toGate.id,
        toInput: inputIndex
      };
      
      // 接続が完了したらconnectionDragをクリア
      setConnectionDrag(null);
      
      return connection;
    }
    
    return null;
  }, [connectionDrag]);

  return {
    svgRef,
    draggedGate,
    dragOffset,
    connectionDrag,
    mousePosition,
    handleGateMouseDown,
    handleTerminalMouseDown,
    handleTerminalMouseUp,
    handleMouseMove,
    handleMouseUp
  };
};
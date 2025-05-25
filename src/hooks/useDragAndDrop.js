// ドラッグ&ドロップ機能用カスタムフック

import { useState, useCallback, useRef } from 'react';
import { getSVGPoint } from '../utils/svg';
import { constrainGatePosition } from '../utils/circuit';
import { CANVAS } from '../constants/circuit';

// グリッドのサイズ（ピクセル）
const GRID_SIZE = 20;

/**
 * 座標をグリッドにスナップする
 */
const snapToGrid = (value) => {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
};

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
      const fromX = gate.type === 'INPUT' || gate.type === 'OUTPUT' || gate.type === 'CLOCK' 
        ? gate.x 
        : gate.x + 60 + 10; // RECT_WIDTH/2 + 10
      const fromY = gate.type === 'INPUT' || gate.type === 'OUTPUT' || gate.type === 'CLOCK'
        ? gate.y
        : outputIndex === 0 ? gate.y : gate.y - 10 + (outputIndex * 20);
      
      setConnectionDrag({
        fromGate: gate,
        fromOutput: outputIndex,
        fromX,
        fromY,
        startX: fromX,
        startY: fromY
      });
    }
  }, []);

  // マウス移動
  const handleMouseMove = useCallback((event) => {
    const point = getSVGPoint(event, svgRef.current);
    setMousePosition(point);
    
    if (draggedGate && dragOffset) {
      const rawPosition = constrainGatePosition(
        point.x - dragOffset.x,
        point.y - dragOffset.y,
        CANVAS
      );
      
      // グリッドにスナップ
      const snappedPosition = {
        x: snapToGrid(rawPosition.x),
        y: snapToGrid(rawPosition.y)
      };
      
      onGateMove(draggedGate.id, snappedPosition.x, snappedPosition.y);
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
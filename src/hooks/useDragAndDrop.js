// ドラッグ&ドロップ機能用カスタムフック

import { useState, useCallback, useRef, useEffect } from 'react';
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
    
    // 出力端子と入力端子の両方からドラッグを開始できるようにする
    if (isOutput) {
      // 出力端子からの接続
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
        startY: fromY,
        dragType: 'output' // ドラッグ元の種類を記録
      });
    } else {
      // 入力端子からの接続（新機能）
      const fromX = gate.type === 'INPUT' || gate.type === 'OUTPUT' || gate.type === 'CLOCK' 
        ? gate.x 
        : gate.x - 60 - 10; // RECT_WIDTH/2 + 10
      const fromY = gate.type === 'INPUT' || gate.type === 'OUTPUT' || gate.type === 'CLOCK'
        ? gate.y
        : gate.inputs === 3 
          ? -25 + (outputIndex * 40) + gate.y
          : -20 + (outputIndex * 40) + gate.y;
      
      setConnectionDrag({
        toGate: gate,
        toInput: outputIndex,
        fromX,
        fromY,
        startX: fromX,
        startY: fromY,
        dragType: 'input' // ドラッグ元の種類を記録
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
  
  // グローバルなマウスアップイベントを監視
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      // ドラッグ状態をクリア
      if (draggedGate || connectionDrag) {
        handleMouseUp();
      }
    };
    
    // ドラッグ中のみリスナーを追加
    if (draggedGate || connectionDrag) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [draggedGate, connectionDrag, handleMouseUp]);

  // 端子へのドロップ（配線完了）
  const handleTerminalMouseUp = useCallback((event, toGate, inputIndex) => {
    event.stopPropagation();
    
    if (connectionDrag) {
      let connection = null;
      
      if (connectionDrag.dragType === 'output') {
        // 出力端子から入力端子への接続
        if (toGate.id !== connectionDrag.fromGate.id) {
          connection = {
            from: connectionDrag.fromGate.id,
            fromOutput: connectionDrag.fromOutput,
            to: toGate.id,
            toInput: inputIndex
          };
        }
      } else if (connectionDrag.dragType === 'input') {
        // 入力端子から出力端子への接続（新機能）
        // この場合、toGateは実際には出力元のゲート
        if (toGate.id !== connectionDrag.toGate.id) {
          connection = {
            from: toGate.id,
            fromOutput: inputIndex,
            to: connectionDrag.toGate.id,
            toInput: connectionDrag.toInput
          };
        }
      }
      
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
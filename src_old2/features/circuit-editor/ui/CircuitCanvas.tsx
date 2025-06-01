import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Gate } from './Gate';
import { Wire } from './Wire';
import { useCircuitStore } from '../../../domain/stores/circuitStore';
import { CollisionDetector } from '../../../domain/services/CollisionDetector';
import { GateType } from '../../../entities/gates/BaseGate';
import { useCircuitMode } from '../model/CircuitModeContext';
import { LearningPanel } from '../../learning-mode/ui/LearningPanel';

export const CircuitCanvas: React.FC = () => {
  const canvasRef = useRef<SVGSVGElement>(null);
  const { mode, features } = useCircuitMode();
  
  const { 
    gates, 
    connections,
    drawingConnection,
    selectedGateId,
    addGate, 
    selectGate, 
    moveGate, 
    removeGate,
    toggleGate,
    startConnection,
    updateConnectionPosition,
    completeConnection,
    cancelConnection,
    collisionDetector
  } = useCircuitStore();
  const [isPanning, setIsPanning] = useState(false);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1200, height: 800 });

  // ダブルクリックでゲート追加（src_oldのシンプル実装）
  const handleCanvasDoubleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    // SVG座標系に変換
    const scaleX = viewBox.width / rect.width;
    const scaleY = viewBox.height / rect.height;
    const svgX = (e.clientX - rect.left) * scaleX + viewBox.x;
    const svgY = (e.clientY - rect.top) * scaleY + viewBox.y;
    // グリッドにスナップ
    const x = Math.round(svgX / 20) * 20;
    const y = Math.round(svgY / 20) * 20;

    // キーの組み合わせでゲートタイプを決定
    let gateType: GateType = 'AND';
    if (e.shiftKey) gateType = 'INPUT';
    if (e.altKey) gateType = 'OUTPUT';
    if (e.ctrlKey || e.metaKey) gateType = 'NOT';
    if (e.shiftKey && e.altKey) gateType = 'OR';
    
    // モードによるゲート制限チェック
    if (features.availableGates.length > 0 && 
        !features.availableGates.includes(gateType)) {
      // 利用できないゲートの場合、デフォルトのゲートを使用
      const availableTypes = features.availableGates.filter(g => 
        ['AND', 'OR', 'NOT', 'INPUT', 'OUTPUT'].includes(g)
      ) as GateType[];
      
      if (availableTypes.length > 0) {
        gateType = availableTypes[0];
      } else {
        return; // 利用可能なゲートがない
      }
    }
    
    addGate(gateType, { x, y });
  }, [features.availableGates, addGate, viewBox]);

  // マウス移動でワイヤー描画更新（src_oldのシンプル実装）
  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (drawingConnection && canvasRef.current) {
      console.log('[CircuitCanvas] Mouse move with active drawingConnection');
      const rect = canvasRef.current.getBoundingClientRect();
      // SVG座標系に変換
      const scaleX = viewBox.width / rect.width;
      const scaleY = viewBox.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX + viewBox.x;
      const y = (e.clientY - rect.top) * scaleY + viewBox.y;
      console.log('[CircuitCanvas] Calculated SVG position:', { x, y });
      updateConnectionPosition({ x, y });
    }
  }, [drawingConnection, updateConnectionPosition, viewBox]);

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // DeleteキーまたはBackspaceキー（Mac対応）
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedGateId) {
        e.preventDefault();
        removeGate(selectedGateId);
      }
      // Escキーで接続をキャンセル
      if (e.key === 'Escape' && drawingConnection) {
        e.preventDefault();
        cancelConnection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedGateId, removeGate, drawingConnection, cancelConnection]);

  // 接続線のレンダリングをメモ化（高品質版）
  const connectionLines = useMemo(() => {
    return connections.map(conn => {
      const fromGate = gates.find(g => g.id === conn.fromGateId);
      const toGate = gates.find(g => g.id === conn.toGateId);
      if (!fromGate || !toGate) return null;

      const fromPos = collisionDetector.calculateOutputPinPosition(fromGate, conn.fromPinIndex);
      const toPos = collisionDetector.calculateInputPinPosition(toGate, conn.toPinIndex);
      
      // 出力ピンの信号値を取得（immerプロキシ対応）
      const signalValue = ((fromGate as any)._outputs || fromGate.outputPins)?.[conn.fromPinIndex]?.value ?? false;

      return (
        <Wire 
          key={conn.id} 
          x1={fromPos.x} 
          y1={fromPos.y} 
          x2={toPos.x} 
          y2={toPos.y}
          value={signalValue}
          onClick={() => {
            // 接続線のクリックで選択（将来的に削除機能など）
          }}
        />
      );
    }).filter(Boolean);
  }, [connections, gates, collisionDetector]);

  // 描画中の接続線をメモ化
  const drawingLine = useMemo(() => {
    console.log('[CircuitCanvas] drawingLine memo recalculating, drawingConnection:', drawingConnection);
    
    if (!drawingConnection || !drawingConnection.currentPosition) {
      console.log('[CircuitCanvas] No drawingConnection or currentPosition');
      return null;
    }
    
    const fromGate = gates.find(g => g.id === drawingConnection.fromGateId);
    if (!fromGate) {
      console.log('[CircuitCanvas] From gate not found:', drawingConnection.fromGateId);
      return null;
    }
    
    const fromPos = collisionDetector.calculateOutputPinPosition(fromGate, drawingConnection.fromPinIndex);
    
    console.log('[CircuitCanvas] Rendering drawing wire:', {
      from: fromPos,
      to: drawingConnection.currentPosition
    });
    
    return <Wire 
      x1={fromPos.x} 
      y1={fromPos.y} 
      x2={drawingConnection.currentPosition.x} 
      y2={drawingConnection.currentPosition.y} 
      isDrawing 
    />;
  }, [drawingConnection, gates, collisionDetector]);

  return (
    <>
      {/* 学習モードパネル */}
      {mode === 'learning' && (
        <LearningPanel gates={[]} connections={[]} />
      )}
      
      <svg
        ref={canvasRef}
        className="w-full h-full cursor-crosshair outline-none bg-gray-950"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        onDoubleClick={handleCanvasDoubleClick}
        onMouseMove={handleCanvasMouseMove}
        tabIndex={0}
      >
        {/* グリッド背景 */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.5" fill="#1f2937" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* 接続線描画 */}
        {connectionLines}

        {/* 描画中の接続線 */}
        {drawingLine}

        {/* ゲート描画 */}
        {gates.filter(gate => gate && gate.id).map(gate => {
          const gateId = gate.id || 'unknown';
          const handleSelect = () => selectGate(gateId);
          const handlePositionChange = (position: { x: number; y: number }) => moveGate(gateId, position);
          const handleToggleInput = () => {
            if (gate.type === 'INPUT') {
              // INPUTゲートの値をトグル
              toggleGate(gateId);
            }
          };
          const handlePinClick = (pinIndex: number, pinType: 'input' | 'output') => {
            console.log('[CircuitCanvas] handlePinClick called:', { gateId, pinIndex, pinType });
            if (!drawingConnection) {
              // 接続開始（出力ピンからのみ開始可能）
              if (pinType === 'output') {
                console.log('[CircuitCanvas] Starting connection from output pin');
                startConnection(gateId, pinIndex, pinType);
              } else {
                console.log('[CircuitCanvas] Cannot start connection from input pin');
              }
            } else {
              // 接続完了（入力ピンに完了）
              if (pinType === 'input') {
                console.log('[CircuitCanvas] Completing connection to input pin');
                completeConnection(gateId, pinIndex);
              } else {
                console.log('[CircuitCanvas] Cannot complete connection to output pin');
              }
            }
          };
          
          return (
            <Gate
              key={gateId}
              gate={gate}
              isSelected={gateId === selectedGateId}
              onSelect={handleSelect}
              onPositionChange={handlePositionChange}
              onToggleInput={handleToggleInput}
              onPinClick={handlePinClick}
            />
          );
        })}
      </svg>
    </>
  );
};
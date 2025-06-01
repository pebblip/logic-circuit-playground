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
    startConnection,
    updateConnectionPosition,
    completeConnection,
    cancelConnection,
    collisionDetector
  } = useCircuitStore();
  const [isPanning, setIsPanning] = useState(false);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1200, height: 800 });

  // ダブルクリックでゲート追加（高精度座標変換）
  const handleCanvasDoubleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!canvasRef.current) return;

    // 高精度座標変換を使用
    const svgPoint = collisionDetector.canvasToSvgCoordinates(
      { x: e.clientX, y: e.clientY },
      canvasRef.current
    );

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
    
    addGate(gateType, svgPoint);
  }, [features.availableGates, addGate, collisionDetector]);

  // マウス移動でワイヤー描画更新
  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (drawingConnection && canvasRef.current) {
      const svgPoint = collisionDetector.canvasToSvgCoordinates(
        { x: e.clientX, y: e.clientY },
        canvasRef.current
      );
      updateConnectionPosition(svgPoint);
    }
  }, [drawingConnection, updateConnectionPosition, collisionDetector]);

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
            console.log(`Connection clicked: ${conn.id}`);
          }}
        />
      );
    }).filter(Boolean);
  }, [connections, gates, collisionDetector]);

  // 描画中の接続線をメモ化
  const drawingLine = useMemo(() => {
    if (!drawingConnection || !drawingConnection.currentPosition) return null;
    
    const fromGate = gates.find(g => g.id === drawingConnection.fromGateId);
    if (!fromGate) return null;
    
    const fromPos = collisionDetector.calculateOutputPinPosition(fromGate, drawingConnection.fromPinIndex);
    
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
        {gates.map(gate => {
          const handleSelect = () => selectGate(gate.id);
          const handlePositionChange = (position: { x: number; y: number }) => moveGate(gate.id, position);
          const handleToggleInput = () => {
            if (gate.type === 'INPUT') {
              // INPUTゲートの値をトグル
              gate.toggle();
            }
          };
          const handlePinClick = (pinIndex: number, pinType: 'input' | 'output') => {
            if (!drawingConnection) {
              // 接続開始（出力ピンからのみ開始可能）
              if (pinType === 'output') {
                startConnection(gate.id, pinIndex, pinType);
              }
            } else {
              // 接続完了（入力ピンに完了）
              if (pinType === 'input') {
                completeConnection(gate.id, pinIndex);
              }
            }
          };
          
          return (
            <Gate
              key={gate.id}
              gate={gate}
              isSelected={gate.id === selectedGateId}
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
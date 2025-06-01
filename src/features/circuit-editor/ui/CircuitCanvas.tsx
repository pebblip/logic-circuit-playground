import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Gate } from './Gate';
import { Wire } from './Wire';
import { useCircuitViewModel } from '../model/useCircuitViewModel';
import { getPinPosition } from '../lib/collision';
import { GateType } from '../../../entities/types';
import { useCircuitMode } from '../model/CircuitModeContext';
import { LearningPanel } from '../../learning-mode/ui/LearningPanel';

export const CircuitCanvas: React.FC = () => {
  const canvasRef = useRef<SVGSVGElement>(null);
  const { mode, features } = useCircuitMode();
  
  const { 
    gates, 
    connections,
    drawingConnection,
    addGate, 
    selectGate, 
    updateGate, 
    deleteGate, 
    selectedGateId,
    startConnection,
    updateConnectionEnd,
    finishConnection,
    cancelConnection,
    toggleInputGate
  } = useCircuitViewModel();
  const [isPanning, setIsPanning] = useState(false);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1200, height: 800 });

  // ダブルクリックでゲート追加
  const handleCanvasDoubleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left) * (viewBox.width / rect.width) + viewBox.x;
    const y = (e.clientY - rect.top) * (viewBox.height / rect.height) + viewBox.y;

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
  }, [viewBox, features.availableGates, addGate]);

  // マウス移動でワイヤー描画更新
  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (drawingConnection) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left) * (viewBox.width / rect.width) + viewBox.x;
      const y = (e.clientY - rect.top) * (viewBox.height / rect.height) + viewBox.y;
      
      updateConnectionEnd(x, y);
    }
  }, [drawingConnection, viewBox, updateConnectionEnd]);

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // DeleteキーまたはBackspaceキー（Mac対応）
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedGateId) {
        e.preventDefault();
        deleteGate(selectedGateId);
      }
      // Escキーで接続をキャンセル
      if (e.key === 'Escape' && drawingConnection) {
        e.preventDefault();
        cancelConnection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedGateId, deleteGate, drawingConnection, cancelConnection]);

  // 接続線のレンダリングをメモ化
  const connectionLines = useMemo(() => {
    return connections.map(conn => {
      const fromGate = gates.find(g => g.id === conn.from.gateId);
      const toGate = gates.find(g => g.id === conn.to.gateId);
      if (!fromGate || !toGate) return null;

      const fromPos = getPinPosition(fromGate, conn.from.pinId);
      const toPos = getPinPosition(toGate, conn.to.pinId);
      if (!fromPos || !toPos) return null;

      return <Wire key={conn.id} x1={fromPos.x} y1={fromPos.y} x2={toPos.x} y2={toPos.y} />;
    }).filter(Boolean);
  }, [connections, gates]);

  // 描画中の接続線をメモ化
  const drawingLine = useMemo(() => {
    if (!drawingConnection) return null;
    
    const fromGate = gates.find(g => g.id === drawingConnection.from.gateId);
    if (!fromGate) return null;
    
    const fromPos = getPinPosition(fromGate, drawingConnection.from.pinId);
    if (!fromPos) return null;
    
    return <Wire x1={fromPos.x} y1={fromPos.y} x2={drawingConnection.tempEnd.x} y2={drawingConnection.tempEnd.y} isDrawing />;
  }, [drawingConnection, gates]);

  return (
    <>
      {/* 学習モードパネル */}
      {mode === 'learning' && (
        <LearningPanel gates={gates} connections={connections} />
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
          const handlePositionChange = (position: { x: number; y: number }) => updateGate(gate.id, { position });
          const handleToggleInput = () => {
            if (gate.type === 'INPUT') {
              toggleInputGate(gate.id);
            }
          };
          const handlePinClick = (pinId: string, x: number, y: number) => {
            if (!drawingConnection) {
              // 接続開始
              startConnection(gate.id, pinId, x, y);
            } else {
              // 接続完了
              finishConnection(gate.id, pinId);
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
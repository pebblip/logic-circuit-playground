import React, { useState } from 'react';
import { useCircuitStore } from '@/stores/circuitStore';
import type { Gate } from '@/types/circuit';
import { getGateInputValue } from '@/domain/simulation';

interface PinComponentProps {
  gate: Gate;
  x: number;
  y: number;
  pinIndex: number;
  isOutput: boolean;
  isActive?: boolean;
  onPinClick: (event: React.MouseEvent, pinIndex: number, isOutput: boolean) => void;
}

export const PinComponent: React.FC<PinComponentProps> = ({
  gate,
  x,
  y,
  pinIndex,
  isOutput,
  isActive,
  onPinClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isDrawingWire, wireStart } = useCircuitStore();
  
  // ワイヤー描画中かつ、接続可能なピンかを判定
  const isConnectable = () => {
    if (!isDrawingWire || !wireStart) return false;
    
    // 同じゲートには接続不可
    if (wireStart.gateId === gate.id) return false;
    
    // 出力から入力へ、または入力から出力への接続のみ可能
    const isStartOutput = wireStart.pinIndex < 0;
    return isStartOutput !== isOutput;
  };
  
  const canConnect = isConnectable();
  const showInvalidConnection = isDrawingWire && isHovered && !canConnect;
  
  // アクティブ状態の判定
  const isPinActive = isActive !== undefined ? isActive : (isOutput ? gate.output : getGateInputValue(gate, pinIndex));
  
  // ゲート本体からピンまでの線の計算
  const lineX1 = isOutput ? x - 10 : x + 10;
  
  // デバッグモード（開発環境でのみ有効）
  const showDebugArea = import.meta.env.DEV && false; // falseに設定して通常は非表示
  
  return (
    <g>
      {/* 接続線（ゲート本体からピンまで） */}
      <line
        x1={lineX1}
        y1={y}
        x2={x}
        y2={y}
        className={`pin-line ${isPinActive ? 'active' : ''}`}
        stroke={isPinActive ? '#00ff88' : '#00ff88'}
        strokeWidth="2"
        opacity={isPinActive ? '1' : '0.4'}
        pointerEvents="none"
      />
      
      {/* ピンの視覚表現 */}
      <circle
        cx={x}
        cy={y}
        r="6"
        className={`pin ${isOutput ? 'output-pin' : 'input-pin'} ${isPinActive ? 'active' : ''}`}
        fill={isPinActive ? '#00ff88' : 'none'}
        stroke={showInvalidConnection ? '#ff4757' : '#00ff88'}
        strokeWidth={isHovered ? '3' : '2'}
        opacity={isHovered ? '1' : '0.8'}
        pointerEvents="none"
      />
      
      {/* デバッグ用クリック領域表示 */}
      {showDebugArea && (
        <ellipse
          cx={x}
          cy={y}
          rx="25"
          ry="10"
          fill="rgba(255, 0, 0, 0.2)"
          stroke="red"
          strokeWidth="1"
          pointerEvents="none"
        />
      )}
      
      {/* クリック領域（拡大された当たり判定） */}
      <ellipse
        cx={x}
        cy={y}
        rx="25"
        ry="10"
        fill="transparent"
        className="u-cursor-crosshair"
        onClick={e => {
          e.stopPropagation();
          onPinClick(e, pinIndex, isOutput);
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          cursor: canConnect ? 'pointer' : 'crosshair',
        }}
      />
    </g>
  );
};
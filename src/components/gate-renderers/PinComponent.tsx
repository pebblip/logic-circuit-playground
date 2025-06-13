import React, { useState } from 'react';
import type { Gate } from '@/types/circuit';
import { getGateInputValue } from '@/domain/simulation';

interface PinComponentProps {
  gate: Gate;
  x: number;
  y: number;
  pinIndex: number;
  isOutput: boolean;
  isActive?: boolean;
  onPinClick: (
    event: React.MouseEvent,
    pinIndex: number,
    isOutput: boolean
  ) => void;
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

  // アクティブ状態の判定
  const isPinActive =
    isActive !== undefined
      ? isActive
      : isOutput
        ? gate.output
        : getGateInputValue(gate, pinIndex);

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
        stroke="#00ff88"
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
        data-gate-id={gate.id}
        data-pin-index={isOutput ? -1 : pinIndex}
        onClick={e => {
          e.stopPropagation();
          onPinClick(e, pinIndex, isOutput);
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
    </g>
  );
};

import React from 'react';
import type { Gate } from '@/types/circuit';
import { getGateInputValue } from '@/domain/simulation';

interface MuxGateRendererProps {
  gate: Gate;
  isSelected: boolean;
  handleMouseDown: (event: React.MouseEvent) => void;
  handleTouchStart: (event: React.TouchEvent) => void;
  handlePinClick: (
    event: React.MouseEvent,
    pinIndex: number,
    isOutput: boolean
  ) => void;
  handleGateClick: (event: React.MouseEvent) => void;
}

export const MuxGateRenderer: React.FC<MuxGateRendererProps> = ({
  gate,
  isSelected,
  handleMouseDown,
  handleTouchStart,
  handlePinClick,
  handleGateClick,
}) => {
  return (
    <>
      <g
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleGateClick}
        className="u-cursor-grab"
      >
        <rect
          className={`gate ${isSelected ? 'selected' : ''}`}
          x="-50"
          y="-40"
          width="100"
          height="80"
          rx="8"
          stroke={isSelected ? '#00aaff' : undefined}
          strokeWidth={isSelected ? '3' : undefined}
        />
        <text className="gate-text" x="0" y="0">
          MUX
        </text>
        {/* ピン名 */}
        <text className="gate-text u-fill-muted" x="-35" y="-25" fontSize="11">
          A
        </text>
        <text className="gate-text u-fill-muted" x="-35" y="0" fontSize="11">
          B
        </text>
        <text className="gate-text u-fill-muted" x="-35" y="25" fontSize="11">
          S
        </text>
        <text className="gate-text u-fill-muted" x="40" y="0" fontSize="11">
          Y
        </text>
      </g>

      {/* 入力ピン - A */}
      <g>
        <circle
          cx="-60"
          cy="-25"
          r="22"
          fill="transparent"
          className="u-cursor-crosshair"
          onClick={e => handlePinClick(e, 0, false)}
        />
        <circle
          cx="-60"
          cy="-25"
          r="6"
          className={`pin ${getGateInputValue(gate, 0) ? 'active' : ''}`}
          pointerEvents="none"
        />
        <line
          x1="-50"
          y1="-25"
          x2="-60"
          y2="-25"
          className={`pin-line ${getGateInputValue(gate, 0) ? 'active' : ''}`}
          pointerEvents="none"
        />
      </g>

      {/* 入力ピン - B */}
      <g>
        <circle
          cx="-60"
          cy="0"
          r="22"
          fill="transparent"
          className="u-cursor-crosshair"
          onClick={e => handlePinClick(e, 1, false)}
        />
        <circle
          cx="-60"
          cy="0"
          r="6"
          className={`pin ${getGateInputValue(gate, 1) ? 'active' : ''}`}
          pointerEvents="none"
        />
        <line
          x1="-50"
          y1="0"
          x2="-60"
          y2="0"
          className={`pin-line ${getGateInputValue(gate, 1) ? 'active' : ''}`}
          pointerEvents="none"
        />
      </g>

      {/* 入力ピン - S (セレクタ) */}
      <g>
        <circle
          cx="-60"
          cy="25"
          r="22"
          fill="transparent"
          className="u-cursor-crosshair"
          onClick={e => handlePinClick(e, 2, false)}
        />
        <circle
          cx="-60"
          cy="25"
          r="6"
          className={`pin ${getGateInputValue(gate, 2) ? 'active' : ''}`}
          pointerEvents="none"
        />
        <line
          x1="-50"
          y1="25"
          x2="-60"
          y2="25"
          className={`pin-line ${getGateInputValue(gate, 2) ? 'active' : ''}`}
          pointerEvents="none"
        />
      </g>

      {/* 出力ピン - Y */}
      <g>
        <circle
          cx="60"
          cy="0"
          r="22"
          fill="transparent"
          className="u-cursor-crosshair"
          onClick={e => handlePinClick(e, 0, true)}
        />
        <circle
          cx="60"
          cy="0"
          r="6"
          className={`pin ${(gate.outputs?.[0] ?? false) ? 'active' : ''}`}
          pointerEvents="none"
        />
        <line
          x1="50"
          y1="0"
          x2="60"
          y2="0"
          className={`pin-line ${gate.outputs?.[0] ? 'active' : ''}`}
          pointerEvents="none"
        />
      </g>
    </>
  );
};

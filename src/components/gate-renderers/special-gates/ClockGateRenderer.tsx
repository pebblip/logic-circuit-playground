import React from 'react';
import type { Gate } from '@/types/circuit';

interface ClockGateRendererProps {
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

export const ClockGateRenderer: React.FC<ClockGateRendererProps> = ({
  gate,
  isSelected,
  handleMouseDown,
  handleTouchStart,
  handlePinClick,
  handleGateClick,
}) => {
  const frequency = gate.metadata?.frequency || 1;
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <>
      <g
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleGateClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="u-cursor-grab"
      >
        <circle
          className={`gate clock-gate ${isSelected ? 'selected' : ''}`}
          cx="0"
          cy="0"
          r="45"
          fill="#1a1a1a"
          stroke={isSelected ? '#00aaff' : '#444'}
          strokeWidth={isSelected ? '3' : '2'}
          style={{
            animation: `clockPulse ${1 / frequency}s infinite`,
            transformOrigin: 'center',
            transformBox: 'fill-box',
          }}
        />
        <text className="gate-text u-text-lg" x="0" y="-5">
          ⏰
        </text>

        {/* パルス波形表示 */}
        <path
          d="M -20 20 h5 v-8 h5 v8 h5 v-8 h5 v8 h5"
          stroke={(gate.outputs?.[0] ?? false) ? '#00ff88' : '#0ff'}
          strokeWidth="1.5"
          fill="none"
          opacity="0.8"
        />

        {/* 周波数表示（ホバー時のみ） */}
        {isHovered && (
          <text className="gate-text u-text-md" x="0" y="35">
            {frequency}Hz
          </text>
        )}
        {/* 時計アニメーション */}
        <circle
          cx="0"
          cy="0"
          r="3"
          fill={(gate.outputs?.[0] ?? false) ? '#00ff88' : '#444'}
          opacity={(gate.outputs?.[0] ?? false) ? 1 : 0}
        />
      </g>

      {/* 出力ピン */}
      <g>
        <circle
          cx="50"
          cy="0"
          r="22"
          fill="transparent"
          className="u-cursor-crosshair"
          onClick={e => handlePinClick(e, 0, true)}
        />
        <circle
          cx="50"
          cy="0"
          r="6"
          className={`pin ${(gate.outputs?.[0] ?? false) ? 'active' : ''}`}
          pointerEvents="none"
        />
        <line
          x1="40"
          y1="0"
          x2="50"
          y2="0"
          className={`pin-line ${gate.outputs?.[0] ? 'active' : ''}`}
          pointerEvents="none"
        />
      </g>
    </>
  );
};

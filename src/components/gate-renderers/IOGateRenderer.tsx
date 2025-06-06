import React from 'react';
import type { Gate } from '@/types/circuit';
import { getGateInputValue } from '@/domain/simulation';

interface IOGateRendererProps {
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
  handleInputClick: (event: React.MouseEvent) => void;
  handleInputDoubleClick: (event: React.MouseEvent) => void;
}

export const IOGateRenderer: React.FC<IOGateRendererProps> = ({
  gate,
  isSelected,
  handleMouseDown,
  handleTouchStart,
  handlePinClick,
  handleGateClick,
  handleInputClick,
  handleInputDoubleClick,
}) => {
  if (gate.type === 'INPUT') {
    return (
      <>
        <g
          onClick={handleInputClick}
          onDoubleClick={handleInputDoubleClick}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          style={{ cursor: 'grab' }}
        >
          {/* スイッチトラック */}
          <rect
            className={`switch-track ${gate.output ? 'active' : ''}`}
            x="-25"
            y="-15"
            width="50"
            height="30"
            rx="15"
            fill={gate.output ? 'rgba(0, 255, 136, 0.1)' : '#1a1a1a'}
            stroke={isSelected ? '#00aaff' : gate.output ? '#00ff88' : '#444'}
            strokeWidth={isSelected ? '3' : '2'}
          />
          {/* スイッチサム */}
          <circle
            className={`switch-thumb ${gate.output ? 'active' : ''}`}
            cx={gate.output ? 10 : -10}
            cy="0"
            r="10"
            fill={gate.output ? '#00ff88' : '#666'}
          />
        </g>

        {/* 出力ピン */}
        <g>
          <circle
            cx="35"
            cy="0"
            r="15"
            fill="transparent"
            style={{ cursor: 'crosshair' }}
            onClick={e => handlePinClick(e, 0, true)}
          />
          <circle
            cx="35"
            cy="0"
            r="6"
            className={`pin output-pin ${gate.output ? 'active' : ''}`}
            pointerEvents="none"
          />
          <line
            x1="25"
            y1="0"
            x2="35"
            y2="0"
            className={`pin-line ${gate.output ? 'active' : ''}`}
            pointerEvents="none"
          />
        </g>
      </>
    );
  } else if (gate.type === 'OUTPUT') {
    return (
      <>
        <g
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onClick={handleGateClick}
          style={{ cursor: 'grab' }}
        >
          <circle
            cx="0"
            cy="0"
            r="20"
            fill="#1a1a1a"
            stroke={isSelected ? '#00aaff' : '#444'}
            strokeWidth={isSelected ? '3' : '2'}
          />
          <circle
            cx="0"
            cy="0"
            r="15"
            fill={getGateInputValue(gate, 0) ? '#00ff88' : '#333'}
          />
          <text x="0" y="5" className="gate-text" style={{ fontSize: '20px' }}>
            💡
          </text>
        </g>

        {/* 入力ピン */}
        <g>
          <circle
            cx="-30"
            cy="0"
            r="15"
            fill="transparent"
            style={{ cursor: 'crosshair' }}
            onClick={e => handlePinClick(e, 0, false)}
          />
          <circle
            cx="-30"
            cy="0"
            r="6"
            className={`pin input-pin ${getGateInputValue(gate, 0) ? 'active' : ''}`}
            pointerEvents="none"
          />
          <line
            x1="-20"
            y1="0"
            x2="-30"
            y2="0"
            className={`pin-line ${getGateInputValue(gate, 0) ? 'active' : ''}`}
            pointerEvents="none"
          />
        </g>
      </>
    );
  }

  return null;
};

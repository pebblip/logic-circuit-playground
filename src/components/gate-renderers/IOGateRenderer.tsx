import React from 'react';
import type { Gate } from '@/types/circuit';
import { getGateInputValue } from '@/domain/simulation';
import { PinComponent } from './PinComponent';

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
          className="u-cursor-grab"
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
        <PinComponent
          gate={gate}
          x={35}
          y={0}
          pinIndex={0}
          isOutput={true}
          onPinClick={handlePinClick}
        />
      </>
    );
  } else if (gate.type === 'OUTPUT') {
    return (
      <>
        <g
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onClick={handleGateClick}
          className="u-cursor-grab"
        >
          {/* 外側の円（枠） */}
          <circle
            cx="0"
            cy="0"
            r="20"
            fill="#1a1a1a"
            stroke={isSelected ? '#00aaff' : '#444'}
            strokeWidth={isSelected ? '3' : '2'}
          />
          {/* 内側の円（光る部分） */}
          <circle
            cx="0"
            cy="0"
            r="15"
            fill={getGateInputValue(gate, 0) ? '#00ff88' : '#333'}
          />
          {/* 電球アイコン */}
          <text x="0" y="5" className="gate-text u-text-xl">
            💡
          </text>
        </g>

        {/* 入力ピン */}
        <PinComponent
          gate={gate}
          x={-30}
          y={0}
          pinIndex={0}
          isOutput={false}
          isActive={getGateInputValue(gate, 0)}
          onPinClick={handlePinClick}
        />
      </>
    );
  }

  return null;
};

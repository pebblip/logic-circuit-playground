import React from 'react';
import type { Gate } from '@/types/circuit';
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
  /* handleInputClick is intentionally omitted - not used in this component */
  handleInputDoubleClick: (event: React.MouseEvent) => void;
  onInputClick?: (gateId: string) => void;
}

export const IOGateRenderer: React.FC<IOGateRendererProps> = ({
  gate,
  isSelected,
  handleMouseDown,
  handleTouchStart,
  handlePinClick,
  handleGateClick,
  /* _handleInputClick omitted - not used */
  handleInputDoubleClick,
  onInputClick,
}) => {
  if (gate.type === 'INPUT') {
    return (
      <g data-gate-type="INPUT">
        <g
          onClick={handleGateClick}
          onDoubleClick={
            onInputClick
              ? e => {
                  e.stopPropagation();
                  onInputClick(gate.id);
                }
              : handleInputDoubleClick
          }
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="u-cursor-grab"
          style={{ pointerEvents: 'all' }}
        >
          {/* スイッチトラック */}
          <rect
            className={`switch-track ${gate.outputs?.[0] ? 'active' : ''}`}
            x="-30"
            y="-18"
            width="60"
            height="36"
            rx="15"
            fill={gate.outputs?.[0] ? 'rgba(0, 255, 136, 0.1)' : '#1a1a1a'}
            stroke={
              isSelected ? '#00aaff' : gate.outputs?.[0] ? '#00ff88' : '#444'
            }
            strokeWidth={isSelected ? '3' : '2'}
          />
          {/* スイッチサム */}
          <circle
            className={`switch-thumb ${gate.outputs?.[0] ? 'active' : ''}`}
            cx={gate.outputs?.[0] ? 10 : -10}
            cy="0"
            r="10"
            fill={gate.outputs?.[0] ? '#00ff88' : '#666'}
            style={{ pointerEvents: 'none' }}
          />
        </g>

        {/* 出力ピン - 位置を右に移動してゲートとの重なりを防ぐ */}
        <PinComponent
          gate={gate}
          x={45}
          y={0}
          pinIndex={0}
          isOutput={true}
          onPinClick={handlePinClick}
        />
      </g>
    );
  } else if (gate.type === 'OUTPUT') {
    return (
      <>
        <g
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onClick={handleGateClick}
          className="u-cursor-grab"
          data-testid={`output-${gate.id}`}
          data-active={gate.inputs?.[0] ? 'true' : 'false'}
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
            fill={gate.inputs?.[0] ? '#00ff88' : '#333'}
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
          isActive={gate.outputs?.[0]}
          onPinClick={handlePinClick}
        />
      </>
    );
  }

  return null;
};

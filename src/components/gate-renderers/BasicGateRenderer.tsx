import React from 'react';
import type { Gate } from '@/types/circuit';
import { getGateInputValue } from '@/domain/simulation';
import { PinComponent } from './PinComponent';

interface BasicGateRendererProps {
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

export const BasicGateRenderer: React.FC<BasicGateRendererProps> = ({
  gate,
  isSelected,
  handleMouseDown,
  handleTouchStart,
  handlePinClick,
  handleGateClick,
}) => {
  // ゲートタイプに応じた入力数
  const inputCount = gate.type === 'NOT' ? 1 : 2;

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
          x="-35"
          y="-25"
          width="70"
          height="50"
          rx="8"
          stroke={isSelected ? '#00aaff' : undefined}
          strokeWidth={isSelected ? '3' : undefined}
        />
        <text className="gate-text" x="0" y="0">
          {gate.type}
        </text>
      </g>

      {/* 入力ピン（逆順でレンダリングして上のピンを優先） */}
      {Array.from({ length: inputCount })
        .reverse()
        .map((_, reversedIndex) => {
          const index = inputCount - 1 - reversedIndex;
          const y = inputCount === 1 ? 0 : index === 0 ? -10 : 10;
          return (
            <PinComponent
              key={`input-${index}`}
              gate={gate}
              x={-45}
              y={y}
              pinIndex={index}
              isOutput={false}
              onPinClick={handlePinClick}
            />
          );
        })}

      {/* 出力ピン */}
      <PinComponent
        gate={gate}
        x={45}
        y={0}
        pinIndex={0}
        isOutput={true}
        isActive={gate.output}
        onPinClick={handlePinClick}
      />
    </>
  );
};

/**
 * 改善されたゲートコンポーネント
 * - ピンの視覚的区別
 * - 拡大された当たり判定
 * - マグネット効果
 */

import React, { useState } from 'react';
import { GateType } from '@/types/gate';
import { PIN_CONSTANTS } from '@/constants/ui';

// ゲートの簡易型定義（UltraModern形式に合わせる）
interface GateData {
  id: string;
  type: string;
  x: number;
  y: number;
  inputs: Array<{ position: { x: number; y: number }; value?: boolean }>;
  outputs: Array<{ position: { x: number; y: number }; value?: boolean }>;
  isActive: () => boolean;
  isSelected?: boolean;
  isHovered?: boolean;
}

interface ImprovedGateComponentProps {
  gate: GateData;
  onMouseDown?: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onPinMouseDown?: (gateId: string, pinType: 'input' | 'output', pinIndex: number, x: number, y: number) => void;
  onPinMouseEnter?: (gateId: string, pinType: 'input' | 'output', pinIndex: number) => void;
  onPinMouseLeave?: () => void;
}

// ゲートタイプごとのSVGレンダリング
const renderGateShape = (type: string, isActive: boolean, size: number) => {
  const halfSize = size / 2;
  const activeColor = '#00ff88';
  const inactiveColor = 'rgba(255, 255, 255, 0.2)';
  const fillColor = isActive ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 255, 255, 0.05)';
  const strokeColor = isActive ? activeColor : inactiveColor;
  const textColor = isActive ? activeColor : '#ffffff';

  switch (type) {
    case GateType.INPUT:
      return (
        <>
          <circle cx={0} cy={0} r={halfSize} 
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="2"
          />
          <circle cx={0} cy={0} r={halfSize / 1.5}
            fill={textColor}
          />
        </>
      );

    case GateType.OUTPUT:
      return (
        <>
          <rect x={-halfSize} y={-halfSize} width={size} height={size} rx={8}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="2"
          />
          <rect x={-halfSize / 2} y={-halfSize / 2} width={halfSize} height={halfSize} rx={4}
            fill={textColor}
          />
        </>
      );

    case GateType.AND:
    case GateType.OR:
    case GateType.NOT:
    case GateType.NAND:
    case GateType.NOR:
    case GateType.XOR:
    case GateType.XNOR:
      return (
        <>
          <rect x={-halfSize} y={-halfSize} width={size} height={size} rx={halfSize}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="2"
          />
          <text x={0} y={5} textAnchor="middle" 
            fill={textColor}
            fontSize="12" fontWeight="600">
            {type}
          </text>
        </>
      );

    case 'CLOCK':
      return (
        <>
          <rect x={-halfSize} y={-halfSize} width={size} height={size} rx={halfSize}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="2"
          />
          <path 
            d={`M 0,-${halfSize/2} L ${halfSize/2},0 L 0,${halfSize/2} L -${halfSize/2},0 Z`}
            fill={textColor}
            stroke="none"
          />
          <circle cx={0} cy={0} r={3}
            fill={strokeColor}
          />
        </>
      );

    default:
      // カスタムゲート
      return (
        <>
          <rect x={-halfSize} y={-halfSize} width={size} height={size} rx={8}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="2"
          />
          <text x={0} y={5} textAnchor="middle" 
            fill={textColor}
            fontSize="10" fontWeight="600">
            {type.slice(0, 4).toUpperCase()}
          </text>
        </>
      );
  }
};

export const ImprovedGateComponent: React.FC<ImprovedGateComponentProps> = ({
  gate,
  onMouseDown,
  onDoubleClick,
  onContextMenu,
  onPinMouseDown,
  onPinMouseEnter,
  onPinMouseLeave
}) => {
  const size = 50;
  const isActive = gate.isActive();
  const [hoveredPin, setHoveredPin] = useState<{type: 'input' | 'output', index: number} | null>(null);

  const handlePinMouseEnter = (pinType: 'input' | 'output', pinIndex: number) => {
    setHoveredPin({ type: pinType, index: pinIndex });
    if (onPinMouseEnter) {
      onPinMouseEnter(gate.id, pinType, pinIndex);
    }
  };

  const handlePinMouseLeave = () => {
    setHoveredPin(null);
    if (onPinMouseLeave) {
      onPinMouseLeave();
    }
  };

  const handlePinMouseDown = (e: React.MouseEvent, pinType: 'input' | 'output', pinIndex: number) => {
    e.stopPropagation();
    if (onPinMouseDown) {
      const pin = pinType === 'input' ? gate.inputs[pinIndex] : gate.outputs[pinIndex];
      onPinMouseDown(gate.id, pinType, pinIndex, gate.x + pin.position.x, gate.y + pin.position.y);
    }
  };

  const isPinHovered = (pinType: 'input' | 'output', pinIndex: number) => {
    return hoveredPin?.type === pinType && hoveredPin?.index === pinIndex;
  };

  return (
    <g 
      transform={`translate(${gate.x}, ${gate.y})`}
      style={{ cursor: 'move' }}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
    >
      {/* ホバー効果 */}
      {gate.isHovered && (
        <circle
          cx={0} cy={0}
          r={size / 2 + 5}
          fill="none"
          stroke="#00ff88"
          strokeWidth="2"
          opacity="0.5"
          strokeDasharray="5,5"
        />
      )}

      {/* 選択効果 */}
      {gate.isSelected && (
        <rect
          x={-size / 2 - 8}
          y={-size / 2 - 8}
          width={size + 16}
          height={size + 16}
          rx={8}
          fill="none"
          stroke="#00ff88"
          strokeWidth="2"
          strokeDasharray="4,4"
        />
      )}

      {/* ゲート本体 */}
      {renderGateShape(gate.type, isActive, size)}

      {/* 入力ピン */}
      {gate.inputs.map((pin, index) => {
        const isHovered = isPinHovered('input', index);
        const colors = PIN_CONSTANTS.COLORS.INPUT;
        const visualRadius = isHovered ? 
          PIN_CONSTANTS.VISUAL_RADIUS * PIN_CONSTANTS.HOVER_SCALE : 
          PIN_CONSTANTS.VISUAL_RADIUS;
        
        return (
          <g key={`input-${index}`}>
            {/* 当たり判定エリア（見えない） */}
            <circle
              cx={pin.position.x}
              cy={pin.position.y}
              r={PIN_CONSTANTS.HIT_RADIUS}
              fill="transparent"
              style={{ cursor: 'crosshair' }}
              onMouseEnter={() => handlePinMouseEnter('input', index)}
              onMouseLeave={handlePinMouseLeave}
              onMouseDown={(e) => handlePinMouseDown(e, 'input', index)}
            />
            
            {/* 視覚的なピン（三角形） */}
            <g transform={`translate(${pin.position.x}, ${pin.position.y})`}>
              <path
                d={`M -${visualRadius * 1.2} 0 L ${visualRadius * 0.5} -${visualRadius} L ${visualRadius * 0.5} ${visualRadius} Z`}
                fill={isHovered ? colors.HOVER : colors.DEFAULT}
                stroke="white"
                strokeWidth="1"
                opacity={isHovered ? 1 : 0.8}
              />
              {isHovered && (
                <text
                  x={-visualRadius * 2}
                  y={-visualRadius * 2}
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  IN
                </text>
              )}
            </g>
          </g>
        );
      })}

      {/* 出力ピン */}
      {gate.outputs.map((pin, index) => {
        const isHovered = isPinHovered('output', index);
        const colors = PIN_CONSTANTS.COLORS.OUTPUT;
        const visualRadius = isHovered ? 
          PIN_CONSTANTS.VISUAL_RADIUS * PIN_CONSTANTS.HOVER_SCALE : 
          PIN_CONSTANTS.VISUAL_RADIUS;
        
        return (
          <g key={`output-${index}`}>
            {/* 当たり判定エリア（見えない） */}
            <circle
              cx={pin.position.x}
              cy={pin.position.y}
              r={PIN_CONSTANTS.HIT_RADIUS}
              fill="transparent"
              style={{ cursor: 'crosshair' }}
              onMouseEnter={() => handlePinMouseEnter('output', index)}
              onMouseLeave={handlePinMouseLeave}
              onMouseDown={(e) => handlePinMouseDown(e, 'output', index)}
            />
            
            {/* 視覚的なピン（円） */}
            <g transform={`translate(${pin.position.x}, ${pin.position.y})`}>
              <circle
                r={visualRadius}
                fill={isHovered ? colors.HOVER : colors.DEFAULT}
                stroke="white"
                strokeWidth="1"
                opacity={isHovered ? 1 : 0.8}
              />
              {isHovered && (
                <text
                  x={visualRadius * 2}
                  y={-visualRadius * 2}
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  OUT
                </text>
              )}
            </g>
          </g>
        );
      })}
    </g>
  );
};
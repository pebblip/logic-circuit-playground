/**
 * ゲートを描画するコンポーネント
 */

import React from 'react';
import { GateViewModel } from '@/viewmodels/GateViewModel';
import { GateType } from '@/types/gate';

interface GateComponentProps {
  gate: GateViewModel;
  onMouseDown?: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
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

export const GateComponent: React.FC<GateComponentProps> = ({
  gate,
  onMouseDown,
  onDoubleClick,
  onContextMenu
}) => {
  const size = 50;
  const isActive = gate.isActive();

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
      {gate.inputs.map((pin, index) => (
        <circle
          key={`input-${index}`}
          cx={pin.position.x}
          cy={pin.position.y}
          r={4}
          fill="rgba(255, 255, 255, 0.3)"
          data-pin-type="input"
          data-pin-index={index}
        />
      ))}

      {/* 出力ピン */}
      {gate.outputs.map((pin, index) => (
        <circle
          key={`output-${index}`}
          cx={pin.position.x}
          cy={pin.position.y}
          r={4}
          fill="rgba(255, 255, 255, 0.3)"
          data-pin-type="output"
          data-pin-index={index}
        />
      ))}
    </g>
  );
};
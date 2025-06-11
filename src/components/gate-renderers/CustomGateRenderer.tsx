import React from 'react';
import type { Gate } from '@/types/circuit';
import { getGateInputValue } from '@/domain/simulation';
import { isCustomGate } from '@/types/gates';

interface CustomGateRendererProps {
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

export const CustomGateRenderer: React.FC<CustomGateRendererProps> = ({
  gate,
  isSelected,
  handleMouseDown,
  handleTouchStart,
  handlePinClick,
  handleGateClick,
}) => {
  if (!isCustomGate(gate) || !gate.customGateDefinition) {
    return null;
  }

  // ダブルクリックは無効化（左パネルからのみ内部回路を表示）
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // 何もしない
  };

  // タッチデバイス用の長押し処理も無効化
  const handleTouchStartCustom = (e: React.TouchEvent) => {
    // 元のタッチスタート処理のみ実行
    handleTouchStart(e);
  };

  const handleTouchEnd = () => {
    // 何もしない
  };

  const definition = gate.customGateDefinition;
  const width = definition.width || 100;
  const height =
    definition.height ||
    Math.max(
      60,
      Math.max(definition.inputs.length, definition.outputs.length) * 30 + 20
    );

  // ピン位置の計算
  const getInputPinY = (index: number) => {
    const inputCount = definition.inputs.length;
    if (inputCount === 1) return 0;
    const spacing = Math.min(30, (height - 20) / (inputCount - 1));
    return -((inputCount - 1) * spacing) / 2 + index * spacing;
  };

  const getOutputPinY = (index: number) => {
    const outputCount = definition.outputs.length;
    if (outputCount === 1) return 0;
    const spacing = Math.min(30, (height - 20) / (outputCount - 1));
    return -((outputCount - 1) * spacing) / 2 + index * spacing;
  };

  return (
    <>
      {/* カスタムゲート名をボックスの上に表示 */}
      <text
        className="gate-text custom-gate-name"
        x="0"
        y={-height / 2 - 15}
        fill="#00ff88"
        textAnchor="middle"
        pointerEvents="none"
      >
        {definition.displayName && definition.displayName.length > 15
          ? definition.displayName.substring(0, 12) + '...'
          : definition.displayName || definition.name}
      </text>

      <g
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStartCustom}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onClick={handleGateClick}
        onDoubleClick={handleDoubleClick}
        className="u-cursor-grab custom-gate"
      >
        <rect
          className="custom-gate-border"
          x={-width / 2 - 2}
          y={-height / 2 - 2}
          width={width + 4}
          height={height + 4}
          rx="10"
          fill="none"
          stroke="#6633cc"
          strokeWidth="4"
          opacity="0.3"
        />
        <rect
          className={`gate ${isSelected ? 'selected' : ''}`}
          x={-width / 2}
          y={-height / 2}
          width={width}
          height={height}
          rx="8"
          fill="rgba(102, 51, 153, 0.1)"
          stroke={isSelected ? '#00aaff' : '#6633cc'}
          strokeWidth={isSelected ? '3' : '2'}
        />
        {/* アイコンをボックス内に表示 */}
        <text className="gate-text custom-gate-icon" x="0" y="0" fontSize="20">
          {definition.icon || '🔧'}
        </text>
      </g>

      {/* 入力ピン */}
      {definition.inputs.map((input, index) => {
        const y = getInputPinY(index);
        const x = -width / 2 - 10;

        return (
          <g key={`input-${index}`}>
            <circle
              cx={x}
              cy={y}
              r="22"
              fill="transparent"
              className="u-cursor-crosshair"
              onClick={e => handlePinClick(e, index, false)}
            />
            <circle
              cx={x}
              cy={y}
              r="6"
              className={`pin input-pin ${getGateInputValue(gate, index) ? 'active' : ''}`}
              pointerEvents="none"
            />
            <line
              x1={x + 10}
              y1={y}
              x2={x}
              y2={y}
              className={`pin-line ${getGateInputValue(gate, index) ? 'active' : ''}`}
              pointerEvents="none"
            />
            <text
              x={x + 15}
              y={y + 4}
              className="pin-label"
              fontSize="8"
              fill="#999"
            >
              {input.name}
            </text>
          </g>
        );
      })}

      {/* 出力ピン */}
      {definition.outputs.map((output, index) => {
        const y = getOutputPinY(index);
        const x = width / 2 + 10;

        return (
          <g key={`output-${index}`}>
            <circle
              cx={x}
              cy={y}
              r="22"
              fill="transparent"
              className="u-cursor-crosshair"
              onClick={e => handlePinClick(e, -index - 1, true)}
            />
            <circle
              cx={x}
              cy={y}
              r="6"
              className={`pin output-pin ${gate.outputs && gate.outputs[index] ? 'active' : ''}`}
              pointerEvents="none"
            />
            <line
              x1={x - 10}
              y1={y}
              x2={x}
              y2={y}
              className={`pin-line ${gate.outputs && gate.outputs[index] ? 'active' : ''}`}
              pointerEvents="none"
            />
            <text
              x={x - 15}
              y={y + 4}
              className="pin-label"
              fontSize="8"
              fill="#999"
              textAnchor="end"
            >
              {output.name}
            </text>
          </g>
        );
      })}
    </>
  );
};

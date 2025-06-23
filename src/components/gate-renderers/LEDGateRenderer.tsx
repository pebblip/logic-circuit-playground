import React from 'react';
import type { Gate } from '@/types/circuit';
import { isLEDGate } from '@/types/gates';

interface LEDGateRendererProps {
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

export const LEDGateRenderer: React.FC<LEDGateRendererProps> = ({
  gate,
  isSelected,
  handleMouseDown,
  handleTouchStart,
  handlePinClick,
  handleGateClick,
}) => {
  // LEDゲートでない場合は何も表示しない
  if (!isLEDGate(gate)) {
    return null;
  }

  // LEDゲートのデータを取得（型ガード後なのでgateDataアクセス可能）
  const ledData = gate.gateData || {
    bitWidth: 4,
    displayMode: 'both' as const,
  };
  const bitWidth = ledData.bitWidth;

  // 入力値から数値を計算
  const calculateValue = (inputs: readonly boolean[]): number => {
    return inputs.reduce(
      (acc, bit, i) => acc + (bit ? Math.pow(2, inputs.length - 1 - i) : 0),
      0
    );
  };

  const value = calculateValue(gate.inputs);

  // 動的サイズ計算
  const minPinSpacing = 24; // ピン間の最小間隔を拡大
  const requiredWidth = bitWidth * minPinSpacing + 40; // ピンの必要幅 + マージン
  const baseWidth = 120;
  const width = Math.max(baseWidth, requiredWidth);
  const height = 100; // 高さを拡大してピン領域を確保

  // ピン位置計算（上側に横並び配置）
  const calculatePinX = (bitWidth: number, pinIndex: number): number => {
    if (bitWidth === 1) {
      return 0; // 単一ピンは中央
    }

    // 横に等間隔で配置
    const availableWidth = width - 40; // 左右マージン
    const spacing = Math.min(minPinSpacing, availableWidth / (bitWidth - 1));
    const startX = -((bitWidth - 1) * spacing) / 2;
    return startX + pinIndex * spacing;
  };

  const inputPinY = -height / 2 - 12; // ゲート上端から12px外側（視覚的な分離を明確に）

  return (
    <g
      onClick={handleGateClick}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className="u-cursor-grab"
    >
      {/* LEDゲート本体 */}
      <rect
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        fill="#1a1a1a"
        stroke={isSelected ? '#4ade80' : '#64748b'}
        strokeWidth={isSelected ? 3 : 2}
        rx={8}
      />

      {/* 2進数表示 - ピンの真下に整列 */}
      {gate.inputs.map((inputValue, index) => {
        const pinX = calculatePinX(bitWidth, index);
        const bitValue = inputValue ? '1' : '0';

        return (
          <text
            key={`bit-${index}`}
            x={pinX}
            y={0}
            textAnchor="middle"
            fill="#00ff88"
            fontSize="18"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {bitValue}
          </text>
        );
      })}

      {/* 10進数表示 - 右下に右揃え */}
      {ledData.displayMode === 'decimal' || ledData.displayMode === 'both' ? (
        <text
          x={width / 2 - 15}
          y={height / 2 - 15}
          textAnchor="end"
          fill="#ffffff"
          fontSize="20"
          fontFamily="Arial, sans-serif"
          fontWeight="bold"
        >
          {value}
        </text>
      ) : null}

      {/* 16進数表示 - 右下に右揃え */}
      {ledData.displayMode === 'hex' && (
        <text
          x={width / 2 - 15}
          y={height / 2 - 15}
          textAnchor="end"
          fill="#ffffff"
          fontSize="20"
          fontFamily="Arial, sans-serif"
          fontWeight="bold"
        >
          0x
          {value
            .toString(16)
            .toUpperCase()
            .padStart(Math.ceil(bitWidth / 4), '0')}
        </text>
      )}

      {/* 2進数のみモード */}
      {ledData.displayMode === 'binary' && null}

      {/* ゲートラベル */}
      <text
        x={0}
        y={height / 2 - 8}
        textAnchor="middle"
        fill="#999"
        fontSize="11"
        fontFamily="sans-serif"
      >
        LED{bitWidth}
      </text>

      {/* 入力ピン（LEDゲート専用 - 上側に横並び） */}
      {gate.inputs.map((inputValue, index) => {
        const pinX = calculatePinX(bitWidth, index);
        const pinY = inputPinY;
        return (
          <g key={`input-${index}`}>
            {/* ピンから本体への接続線 */}
            <line
              x1={pinX}
              y1={pinY}
              x2={pinX}
              y2={pinY + 12}
              className={`pin-line ${inputValue ? 'active' : ''}`}
              pointerEvents="none"
            />

            {/* ピンの視覚表現（他ゲートと統一） */}
            <circle
              cx={pinX}
              cy={pinY}
              r="6"
              className={`pin input-pin ${inputValue ? 'active' : ''}`}
              pointerEvents="none"
            />

            {/* クリック領域 */}
            <ellipse
              cx={pinX}
              cy={pinY}
              rx="15"
              ry="25"
              fill="transparent"
              className="u-cursor-crosshair"
              data-gate-id={gate.id}
              data-pin-index={index}
              onClick={e => {
                e.stopPropagation();
                handlePinClick(e, index, false);
              }}
            />
          </g>
        );
      })}
    </g>
  );
};

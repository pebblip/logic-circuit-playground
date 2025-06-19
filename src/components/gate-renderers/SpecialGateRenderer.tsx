import React from 'react';
import type { Gate } from '@/types/circuit';
import { getGateInputValue } from '@/domain/simulation';
import { PinComponent } from './PinComponent';

interface SpecialGateRendererProps {
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

export const SpecialGateRenderer: React.FC<SpecialGateRendererProps> = ({
  gate,
  isSelected,
  handleMouseDown,
  handleTouchStart,
  handlePinClick,
  handleGateClick,
}) => {
  switch (gate.type) {
    case 'CLOCK':
      return (
        <ClockGateRenderer
          {...{
            gate,
            isSelected,
            handleMouseDown,
            handleTouchStart,
            handlePinClick,
            handleGateClick,
          }}
        />
      );
    case 'D-FF':
      return (
        <DFFGateRenderer
          {...{
            gate,
            isSelected,
            handleMouseDown,
            handleTouchStart,
            handlePinClick,
            handleGateClick,
          }}
        />
      );
    case 'SR-LATCH':
      return (
        <SRLatchGateRenderer
          {...{
            gate,
            isSelected,
            handleMouseDown,
            handleTouchStart,
            handlePinClick,
            handleGateClick,
          }}
        />
      );
    case 'MUX':
      return (
        <MuxGateRenderer
          {...{
            gate,
            isSelected,
            handleMouseDown,
            handleTouchStart,
            handlePinClick,
            handleGateClick,
          }}
        />
      );
    case 'BINARY_COUNTER':
      return (
        <BinaryCounterGateRenderer
          {...{
            gate,
            isSelected,
            handleMouseDown,
            handleTouchStart,
            handlePinClick,
            handleGateClick,
          }}
        />
      );
    default:
      return null;
  }
};

// CLOCK Gate Renderer
const ClockGateRenderer: React.FC<SpecialGateRendererProps> = ({
  gate,
  isSelected,
  handleMouseDown,
  handleTouchStart,
  handlePinClick,
  handleGateClick,
}) => {
  const frequency = gate.metadata?.frequency || 1;
  const [isHovered, setIsHovered] = React.useState(false);

  // タイミングチャートマークは削除

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
            // CSSアニメーションでパルス効果（SVGアニメーション代替）
            animation: `clockPulse ${1 / frequency}s infinite`,
            transformOrigin: 'center',
            transformBox: 'fill-box',
          }}
        />
        {/* SVGアニメーションを削除して副作用を防止 */}
        <text className="gate-text u-text-lg" x="0" y="-5">
          ⏰
        </text>

        {/* パルス波形表示 */}
        <path
          d="M -20 20 h5 v-8 h5 v8 h5 v-8 h5 v8 h5"
          stroke={gate.output ? '#00ff88' : '#0ff'}
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
          fill={gate.output ? '#00ff88' : '#444'}
          opacity={gate.output ? 1 : 0}
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
          className={`pin ${gate.output ? 'active' : ''}`}
          pointerEvents="none"
        />
        <line
          x1="40"
          y1="0"
          x2="50"
          y2="0"
          className={`pin-line ${gate.output ? 'active' : ''}`}
          pointerEvents="none"
        />
      </g>
    </>
  );
};

// D-FF Gate Renderer
const DFFGateRenderer: React.FC<SpecialGateRendererProps> = ({
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
          D-FF
        </text>
        {/* ピン名 */}
        <text className="gate-text u-text-md u-fill-muted" x="-35" y="-20">
          D
        </text>
        <text className="gate-text u-text-md u-fill-muted" x="-35" y="20">
          CLK
        </text>
        <text className="gate-text u-text-md u-fill-muted" x="40" y="-20">
          Q
        </text>
        <text className="gate-text u-text-md u-fill-muted" x="40" y="20">
          Q̄
        </text>
      </g>

      {/* 入力ピン - D */}
      <g>
        <circle
          cx="-60"
          cy="-20"
          r="22"
          fill="transparent"
          className="u-cursor-crosshair"
          onClick={e => handlePinClick(e, 0, false)}
        />
        <circle
          cx="-60"
          cy="-20"
          r="6"
          className={`pin ${getGateInputValue(gate, 0) ? 'active' : ''}`}
          pointerEvents="none"
        />
        <line
          x1="-50"
          y1="-20"
          x2="-60"
          y2="-20"
          className={`pin-line ${getGateInputValue(gate, 0) ? 'active' : ''}`}
          pointerEvents="none"
        />
      </g>

      {/* 入力ピン - CLK */}
      <g>
        <circle
          cx="-60"
          cy="20"
          r="22"
          fill="transparent"
          className="u-cursor-crosshair"
          onClick={e => handlePinClick(e, 1, false)}
        />
        <circle
          cx="-60"
          cy="20"
          r="6"
          className={`pin ${getGateInputValue(gate, 1) ? 'active' : ''}`}
          pointerEvents="none"
        />
        <line
          x1="-50"
          y1="20"
          x2="-60"
          y2="20"
          className={`pin-line ${getGateInputValue(gate, 1) ? 'active' : ''}`}
          pointerEvents="none"
        />
      </g>

      {/* 出力ピン - Q */}
      <g>
        <circle
          cx="60"
          cy="-20"
          r="22"
          fill="transparent"
          className="u-cursor-crosshair"
          onClick={e => handlePinClick(e, 0, true)}
        />
        <circle
          cx="60"
          cy="-20"
          r="6"
          className={`pin ${gate.output ? 'active' : ''}`}
          pointerEvents="none"
        />
        <line
          x1="50"
          y1="-20"
          x2="60"
          y2="-20"
          className={`pin-line ${gate.output ? 'active' : ''}`}
          pointerEvents="none"
        />
      </g>

      {/* 出力ピン - Q̄ (単一出力として扱う) */}
    </>
  );
};

// SR-LATCH Gate Renderer
const SRLatchGateRenderer: React.FC<SpecialGateRendererProps> = ({
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
          SR-LATCH
        </text>
        {/* ピン名 */}
        <text className="gate-text u-text-md u-fill-muted" x="-35" y="-20">
          S
        </text>
        <text className="gate-text u-text-md u-fill-muted" x="-35" y="20">
          R
        </text>
        <text className="gate-text u-text-md u-fill-muted" x="40" y="-20">
          Q
        </text>
        <text className="gate-text u-text-md u-fill-muted" x="40" y="20">
          Q̄
        </text>
      </g>

      {/* 入力ピン - S */}
      <g>
        <circle
          cx="-60"
          cy="-20"
          r="22"
          fill="transparent"
          className="u-cursor-crosshair"
          onClick={e => handlePinClick(e, 0, false)}
        />
        <circle
          cx="-60"
          cy="-20"
          r="6"
          className={`pin ${getGateInputValue(gate, 0) ? 'active' : ''}`}
          pointerEvents="none"
        />
        <line
          x1="-50"
          y1="-20"
          x2="-60"
          y2="-20"
          className={`pin-line ${getGateInputValue(gate, 0) ? 'active' : ''}`}
          pointerEvents="none"
        />
      </g>

      {/* 入力ピン - R */}
      <g>
        <circle
          cx="-60"
          cy="20"
          r="22"
          fill="transparent"
          className="u-cursor-crosshair"
          onClick={e => handlePinClick(e, 1, false)}
        />
        <circle
          cx="-60"
          cy="20"
          r="6"
          className={`pin ${getGateInputValue(gate, 1) ? 'active' : ''}`}
          pointerEvents="none"
        />
        <line
          x1="-50"
          y1="20"
          x2="-60"
          y2="20"
          className={`pin-line ${getGateInputValue(gate, 1) ? 'active' : ''}`}
          pointerEvents="none"
        />
      </g>

      {/* 出力ピン - Q */}
      <g>
        <circle
          cx="60"
          cy="-20"
          r="22"
          fill="transparent"
          className="u-cursor-crosshair"
          onClick={e => handlePinClick(e, 0, true)}
        />
        <circle
          cx="60"
          cy="-20"
          r="6"
          className={`pin ${gate.output ? 'active' : ''}`}
          pointerEvents="none"
        />
        <line
          x1="50"
          y1="-20"
          x2="60"
          y2="-20"
          className={`pin-line ${gate.output ? 'active' : ''}`}
          pointerEvents="none"
        />
      </g>

      {/* 出力ピン - Q̄ (単一出力として扱う) */}
    </>
  );
};

// MUX Gate Renderer
const MuxGateRenderer: React.FC<SpecialGateRendererProps> = ({
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
          className={`pin ${gate.output ? 'active' : ''}`}
          pointerEvents="none"
        />
        <line
          x1="50"
          y1="0"
          x2="60"
          y2="0"
          className={`pin-line ${gate.output ? 'active' : ''}`}
          pointerEvents="none"
        />
      </g>
    </>
  );
};

// Binary Counter Gate Renderer
const BinaryCounterGateRenderer: React.FC<SpecialGateRendererProps> = ({
  gate,
  isSelected,
  handleMouseDown,
  handleTouchStart,
  handlePinClick,
  handleGateClick,
}) => {
  const bitCount = (gate.metadata?.bitCount as number) || 2;
  const currentValue = (gate.metadata?.currentValue as number) || 0;

  // ゲートの高さを動的に計算
  const gateHeight = Math.max(80, bitCount * 30 + 20);
  const halfHeight = gateHeight / 2;

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
          x="-60"
          y={-halfHeight}
          width="120"
          height={gateHeight}
          rx="8"
          stroke={isSelected ? '#00aaff' : undefined}
          strokeWidth={isSelected ? '3' : undefined}
        />
        <text className="gate-text u-text-sm" x="0" y="-15">
          COUNTER
        </text>
        <text className="gate-text u-text-sm" x="0" y="0">
          {bitCount}bit
        </text>
        
        {/* 現在の値を表示 */}
        <text className="gate-text u-text-lg u-font-mono" x="0" y="20">
          {currentValue.toString().padStart(bitCount, '0')}
        </text>
        
        {/* CLK入力ラベル */}
        <text className="gate-text u-text-xs u-fill-muted" x="-45" y="5">
          CLK
        </text>
        
        {/* 出力ピンラベル */}
        {Array.from({ length: bitCount }, (_, i) => {
          const spacing = 30;
          const startY = -((bitCount - 1) * spacing) / 2;
          const y = startY + i * spacing;
          return (
            <text
              key={i}
              className="gate-text u-text-xs u-fill-muted"
              x="45"
              y={y + 5}
            >
              Q{i}
            </text>
          );
        })}
      </g>

      {/* 入力ピン - CLK */}
      <g>
        <circle
          cx="-70"
          cy="0"
          r="22"
          fill="transparent"
          className="u-cursor-crosshair"
          onClick={e => handlePinClick(e, 0, false)}
        />
        <circle
          cx="-70"
          cy="0"
          r="6"
          className={`pin ${getGateInputValue(gate, 0) ? 'active' : ''}`}
          pointerEvents="none"
        />
        <line
          x1="-60"
          y1="0"
          x2="-70"
          y2="0"
          className={`pin-line ${getGateInputValue(gate, 0) ? 'active' : ''}`}
          pointerEvents="none"
        />
        {/* クロックエッジ記号 */}
        <path
          d="M -50 5 l 0 -10 l 5 5 z"
          fill={getGateInputValue(gate, 0) ? '#00ff88' : '#666'}
          pointerEvents="none"
        />
      </g>

      {/* 出力ピン - ビット毎 */}
      {Array.from({ length: bitCount }, (_, i) => {
        const spacing = 30;
        const startY = -((bitCount - 1) * spacing) / 2;
        const y = startY + i * spacing;
        const bitValue = (currentValue & (1 << i)) !== 0;
        
        return (
          <g key={i}>
            <circle
              cx="70"
              cy={y}
              r="22"
              fill="transparent"
              className="u-cursor-crosshair"
              onClick={e => handlePinClick(e, i, true)}
            />
            <circle
              cx="70"
              cy={y}
              r="6"
              className={`pin ${bitValue ? 'active' : ''}`}
              pointerEvents="none"
            />
            <line
              x1="60"
              y1={y}
              x2="70"
              y2={y}
              className={`pin-line ${bitValue ? 'active' : ''}`}
              pointerEvents="none"
            />
          </g>
        );
      })}
    </>
  );
};


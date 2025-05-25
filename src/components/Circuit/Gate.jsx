// 個別のゲートコンポーネント

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { GATE_TYPES, GATE_UI } from '../../constants/circuit';

/**
 * ゲートコンポーネント
 */
const Gate = memo(({
  gate,
  isSelected,
  simulation,
  onGateClick,
  onGateDoubleClick,
  onGateMouseDown,
  onTerminalMouseDown,
  onTerminalMouseUp
}) => {
  const gateInfo = GATE_TYPES[gate.type];
  const isIOGate = gate.type === 'INPUT' || gate.type === 'OUTPUT' || gate.type === 'CLOCK';
  const [isHovered, setIsHovered] = React.useState(false);
  
  return (
    <g 
      transform={`translate(${gate.x}, ${gate.y})`} 
      data-testid={`gate-${gate.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ゲート本体 */}
      {isIOGate ? (
        <circle
          cx={0}
          cy={0}
          r={GATE_UI.CIRCLE_RADIUS}
          fill={
            gate.type === 'INPUT' ? (gate.value ? '#059669' : '#fff') :
            gate.type === 'CLOCK' ? (gate.value ? '#3b82f6' : '#fff') :
            isHovered ? '#f3f4f6' : '#f9f9f9'
          }
          stroke={isSelected ? "#3b82f6" : isHovered ? "#6b7280" : "#333"}
          strokeWidth={isSelected ? "3" : "2"}
          className="cursor-pointer transition-colors"
          onClick={(e) => onGateClick(e, gate)}
          onDoubleClick={(e) => onGateDoubleClick(e, gate)}
          onMouseDown={(e) => onGateMouseDown(e, gate)}
        />
      ) : (
        <rect
          x={-GATE_UI.RECT_WIDTH / 2}
          y={-GATE_UI.RECT_HEIGHT / 2}
          width={GATE_UI.RECT_WIDTH}
          height={GATE_UI.RECT_HEIGHT}
          rx={GATE_UI.RECT_CORNER_RADIUS}
          fill={isHovered ? '#f9fafb' : '#fff'}
          stroke={isSelected ? "#3b82f6" : isHovered ? "#6b7280" : "#333"}
          strokeWidth={isSelected ? "3" : "2"}
          className="cursor-pointer transition-all"
          onClick={(e) => onGateClick(e, gate)}
          onDoubleClick={(e) => onGateDoubleClick(e, gate)}
          onMouseDown={(e) => onGateMouseDown(e, gate)}
        />
      )}

      {/* ゲートラベル */}
      <text
        x={0}
        y={5}
        textAnchor="middle"
        fill={
          gate.type === 'INPUT' && gate.value ? '#fff' :
          gate.type === 'CLOCK' && gate.value ? '#fff' :
          '#333'
        }
        fontSize="14"
        fontWeight="500"
        className="pointer-events-none select-none"
      >
        {gateInfo.symbol}
      </text>

      {/* 複合ゲートの追加ラベル */}
      {(gate.type === 'HALF_ADDER' || gate.type === 'FULL_ADDER') && (
        <>
          <text
            x={GATE_UI.RECT_WIDTH / 2 - 15}
            y={-10}
            textAnchor="middle"
            fill="#666"
            fontSize="10"
            className="pointer-events-none select-none"
          >
            S
          </text>
          <text
            x={GATE_UI.RECT_WIDTH / 2 - 15}
            y={10}
            textAnchor="middle"
            fill="#666"
            fontSize="10"
            className="pointer-events-none select-none"
          >
            C
          </text>
        </>
      )}

      {/* Full Adderの入力ラベル */}
      {gate.type === 'FULL_ADDER' && (
        <>
          <text
            x={-GATE_UI.RECT_WIDTH / 2 + 15}
            y={-25}
            textAnchor="middle"
            fill="#666"
            fontSize="10"
            className="pointer-events-none select-none"
          >
            A
          </text>
          <text
            x={-GATE_UI.RECT_WIDTH / 2 + 15}
            y={0}
            textAnchor="middle"
            fill="#666"
            fontSize="10"
            className="pointer-events-none select-none"
          >
            B
          </text>
          <text
            x={-GATE_UI.RECT_WIDTH / 2 + 15}
            y={25}
            textAnchor="middle"
            fill="#666"
            fontSize="10"
            className="pointer-events-none select-none"
          >
            Cin
          </text>
        </>
      )}

      {/* 入力端子 */}
      {Array.from({ length: gateInfo.inputs }).map((_, i) => {
        // 3入力のゲート（Full Adder）の場合
        const cy = gateInfo.inputs === 3 
          ? -25 + (i * GATE_UI.TERMINAL_SPACING)
          : -20 + (i * GATE_UI.TERMINAL_SPACING);
          
        return (
          <circle
            key={`in-${i}`}
            cx={-GATE_UI.RECT_WIDTH / 2}
            cy={cy}
            r={GATE_UI.TERMINAL_RADIUS}
            fill="#fff"
            stroke={isHovered ? "#6b7280" : "#333"}
            strokeWidth="2"
            className="cursor-crosshair hover:fill-blue-100 transition-colors"
            onMouseUp={(e) => onTerminalMouseUp(e, gate, i)}
          />
        );
      })}

      {/* 出力端子 */}
      {Array.from({ length: gateInfo.outputs }).map((_, i) => (
        <circle
          key={`out-${i}`}
          cx={GATE_UI.RECT_WIDTH / 2}
          cy={gateInfo.outputs === 1 ? 0 : -10 + (i * GATE_UI.OUTPUT_SPACING)}
          r={GATE_UI.TERMINAL_RADIUS}
          fill={isHovered ? "#4b5563" : "#333"}
          className="cursor-crosshair hover:fill-blue-500 transition-colors"
          onMouseDown={(e) => onTerminalMouseDown(e, gate, true, i)}
        />
      ))}

      {/* OUTPUT値の表示 */}
      {gate.type === 'OUTPUT' && gate.value !== null && (
        <g transform="translate(0, -55)">
          <rect
            x={-20}
            y={-15}
            width={40}
            height={30}
            rx={4}
            fill={gate.value ? '#059669' : '#f3f4f6'}
            stroke={gate.value ? '#047857' : '#d1d5db'}
            strokeWidth={2}
          />
          <text
            x={0}
            y={5}
            textAnchor="middle"
            fill={gate.value ? '#fff' : '#6b7280'}
            fontSize="20"
            fontWeight="bold"
            className="pointer-events-none select-none"
          >
            {gate.value ? '1' : '0'}
          </text>
        </g>
      )}
    </g>
  );
});

Gate.displayName = 'Gate';

Gate.propTypes = {
  gate: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    type: PropTypes.string.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    value: PropTypes.bool
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  simulation: PropTypes.object.isRequired,
  onGateClick: PropTypes.func.isRequired,
  onGateDoubleClick: PropTypes.func.isRequired,
  onGateMouseDown: PropTypes.func.isRequired,
  onTerminalMouseDown: PropTypes.func.isRequired,
  onTerminalMouseUp: PropTypes.func.isRequired
};

export default Gate;
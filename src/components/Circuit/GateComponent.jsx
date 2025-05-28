import React from 'react';
import { GateType } from '../../types/gate';

const getGateColor = (gateType) => {
  switch (gateType) {
    case GateType.AND:
    case GateType.NAND:
      return '#00ff88';
    case GateType.OR:
    case GateType.NOR:
      return '#00ffff';
    case GateType.NOT:
    case GateType.BUFFER:
      return '#ff00ff';
    case GateType.XOR:
    case GateType.XNOR:
      return '#ffff00';
    case GateType.INPUT:
      return '#00ff88';
    case GateType.OUTPUT:
      return '#ff0066';
    case GateType.CLOCK:
      return '#00ffff';
    case GateType.SR_LATCH:
    case GateType.D_FLIPFLOP:
    case GateType.JK_FLIPFLOP:
    case GateType.T_FLIPFLOP:
      return '#ff66ff';
    default:
      return '#00ff88';
  }
};

const getGateSymbol = (gateType) => {
  switch (gateType) {
    case GateType.AND:
      return '&';
    case GateType.OR:
      return '≥1';
    case GateType.NOT:
      return '1';
    case GateType.XOR:
      return '=1';
    case GateType.NAND:
      return '&';
    case GateType.NOR:
      return '≥1';
    case GateType.XNOR:
      return '=1';
    case GateType.BUFFER:
      return '1';
    case GateType.INPUT:
      return 'IN';
    case GateType.OUTPUT:
      return 'OUT';
    case GateType.CLOCK:
      return 'CLK';
    case GateType.SR_LATCH:
      return 'SR';
    case GateType.D_FLIPFLOP:
      return 'D';
    case GateType.JK_FLIPFLOP:
      return 'JK';
    case GateType.T_FLIPFLOP:
      return 'T';
    default:
      return '?';
  }
};

const hasNegatedOutput = (gateType) => {
  return [GateType.NAND, GateType.NOR, GateType.XNOR].includes(gateType);
};

export const GateComponent = ({ gate, isSelected, isHovered, onPinClick, onPinHover }) => {
  const color = getGateColor(gate.type);
  const symbol = getGateSymbol(gate.type);
  const isNegated = hasNegatedOutput(gate.type);
  
  const strokeColor = isHovered ? '#00ff88' : isSelected ? '#00ffff' : 'rgba(255, 255, 255, 0.2)';
  const strokeWidth = isSelected ? 2 : 1;
  
  return (
    <>
      {/* Gate body */}
      <rect
        x="0"
        y="0"
        width="100"
        height={20 + Math.max(gate.inputs.length, gate.outputs.length) * 20}
        fill="rgba(255, 255, 255, 0.05)"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        rx="4"
      />
      
      {/* Gate symbol */}
      <text
        x="50"
        y={10 + Math.max(gate.inputs.length, gate.outputs.length) * 10}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="16"
        fontWeight="bold"
        fill={color}
      >
        {symbol}
      </text>
      
      {/* Negation circle for NAND, NOR, XNOR */}
      {isNegated && gate.outputs.map((output, index) => (
        <circle
          key={output.id}
          cx="100"
          cy={20 + index * 20}
          r="4"
          fill="rgba(255, 255, 255, 0.05)"
          stroke={color}
          strokeWidth="2"
        />
      ))}
      
      {/* Input pins */}
      {gate.inputs.map((input, index) => (
        <g key={input.id}>
          <circle
            cx="0"
            cy={20 + index * 20}
            r="5"
            fill={input.value ? color : 'rgba(255, 255, 255, 0.05)'}
            stroke={color}
            strokeWidth="2"
            className="pin-input"
            onClick={(e) => onPinClick(e, gate.id, input.id, 'input')}
            onMouseEnter={() => onPinHover?.({ gateId: gate.id, pinId: input.id, type: 'input' })}
            onMouseLeave={() => onPinHover?.(null)}
            style={{ cursor: 'crosshair' }}
          />
          {/* Input line */}
          <line
            x1="-10"
            y1={20 + index * 20}
            x2="0"
            y2={20 + index * 20}
            stroke={input.value ? color : 'rgba(255, 255, 255, 0.3)'}
            strokeWidth="2"
          />
        </g>
      ))}
      
      {/* Output pins */}
      {gate.outputs.map((output, index) => (
        <g key={output.id}>
          <circle
            cx={isNegated ? "104" : "100"}
            cy={20 + index * 20}
            r="5"
            fill={output.value ? color : 'rgba(255, 255, 255, 0.05)'}
            stroke={color}
            strokeWidth="2"
            className="pin-output"
            onClick={(e) => onPinClick(e, gate.id, output.id, 'output')}
            onMouseEnter={() => onPinHover?.({ gateId: gate.id, pinId: output.id, type: 'output' })}
            onMouseLeave={() => onPinHover?.(null)}
            style={{ cursor: 'crosshair' }}
          />
          {/* Output line */}
          <line
            x1={isNegated ? "104" : "100"}
            y1={20 + index * 20}
            x2={isNegated ? "114" : "110"}
            y2={20 + index * 20}
            stroke={output.value ? color : 'rgba(255, 255, 255, 0.3)'}
            strokeWidth="2"
          />
        </g>
      ))}
      
      {/* Gate label */}
      <text
        x="50"
        y="-5"
        textAnchor="middle"
        fontSize="12"
        fill="rgba(255, 255, 255, 0.6)"
      >
        {gate.type}
      </text>
    </>
  );
};
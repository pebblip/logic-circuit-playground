import React from 'react';
import { GateType } from '../../../../types';

// 既存のレンダラーからインポートされるスタイルを模倣
const GATE_WIDTH = 70;
const GATE_HEIGHT = 50;
const PIN_RADIUS = 6;
const PIN_CLICK_RADIUS = 15;

interface GateConfig {
  type: GateType;
  x: number;
  y: number;
  inputs?: boolean[];
  output?: boolean;
  label?: string;
  showPinLabels?: boolean;
  inputLabels?: string[];
  outputLabel?: string;
}

interface WireConfig {
  from: { x: number; y: number };
  to: { x: number; y: number };
  active?: boolean;
  label?: string;
}

interface CircuitDiagramConfig {
  gates: GateConfig[];
  wires: WireConfig[];
  width?: number;
  height?: number;
  showGrid?: boolean;
  title?: string;
}

// 基本ゲートのレンダリング（既存のBasicGateRendererのロジックを活用）
const renderBasicGate = (config: GateConfig) => {
  const { type, x, y, inputs = [], output = false, label, inputLabels, outputLabel } = config;
  const gateLabel = label || type;
  
  // ゲートタイプ別の特殊処理
  const isNotGate = type === 'NOT';
  const inputCount = isNotGate ? 1 : 2;
  
  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* ゲート本体 */}
      <rect
        x={-GATE_WIDTH/2}
        y={-GATE_HEIGHT/2}
        width={GATE_WIDTH}
        height={GATE_HEIGHT}
        rx={8}
        fill="#2a2a2a"
        stroke="#444"
        strokeWidth={2}
        className="gate"
      />
      
      {/* ゲート名 */}
      <text
        x={0}
        y={0}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#e0e0e0"
        fontSize={16}
        fontWeight="bold"
        className="gate-text"
      >
        {gateLabel}
      </text>
      
      {/* 入力ピン */}
      {Array.from({ length: inputCount }).map((_, i) => {
        const yOffset = isNotGate ? 0 : (i === 0 ? -15 : 15);
        const isActive = inputs[i] || false;
        
        return (
          <g key={`input-${i}`}>
            {/* ピンの線 */}
            <line
              x1={-GATE_WIDTH/2 - 10}
              y1={yOffset}
              x2={-GATE_WIDTH/2}
              y2={yOffset}
              stroke={isActive ? '#00ff88' : '#666'}
              strokeWidth={2}
              className={`pin-line ${isActive ? 'active' : ''}`}
            />
            {/* ピン */}
            <circle
              cx={-GATE_WIDTH/2 - 10}
              cy={yOffset}
              r={PIN_RADIUS}
              fill={isActive ? '#00ff88' : '#666'}
              className={`pin ${isActive ? 'active' : ''}`}
            />
            {/* ピンラベル */}
            {inputLabels && inputLabels[i] && (
              <text
                x={-GATE_WIDTH/2 - 25}
                y={yOffset}
                textAnchor="end"
                dominantBaseline="middle"
                fill="#888"
                fontSize={12}
              >
                {inputLabels[i]}
              </text>
            )}
          </g>
        );
      })}
      
      {/* 出力ピン */}
      <g>
        <line
          x1={GATE_WIDTH/2}
          y1={0}
          x2={GATE_WIDTH/2 + 10}
          y2={0}
          stroke={output ? '#00ff88' : '#666'}
          strokeWidth={2}
          className={`pin-line ${output ? 'active' : ''}`}
        />
        <circle
          cx={GATE_WIDTH/2 + 10}
          cy={0}
          r={PIN_RADIUS}
          fill={output ? '#00ff88' : '#666'}
          className={`pin ${output ? 'active' : ''}`}
        />
        {outputLabel && (
          <text
            x={GATE_WIDTH/2 + 25}
            y={0}
            textAnchor="start"
            dominantBaseline="middle"
            fill="#888"
            fontSize={12}
          >
            {outputLabel}
          </text>
        )}
      </g>
      
      {/* NOTゲートの場合は反転記号を追加 */}
      {isNotGate && (
        <circle
          cx={GATE_WIDTH/2}
          cy={0}
          r={4}
          fill="none"
          stroke="#e0e0e0"
          strokeWidth={2}
        />
      )}
    </g>
  );
};

// INPUT/OUTPUTゲートのレンダリング
const renderIOGate = (config: GateConfig) => {
  const { type, x, y, output = false, label } = config;
  
  if (type === 'INPUT') {
    return (
      <g transform={`translate(${x}, ${y})`}>
        {/* スイッチトラック */}
        <rect
          x={-25}
          y={-15}
          width={50}
          height={30}
          rx={15}
          fill={output ? '#00ff88' : '#333'}
          stroke="#444"
          strokeWidth={2}
        />
        {/* スイッチサム */}
        <circle
          cx={output ? 10 : -10}
          cy={0}
          r={12}
          fill="#e0e0e0"
        />
        {/* ラベル */}
        {label && (
          <text
            x={0}
            y={-25}
            textAnchor="middle"
            fill="#888"
            fontSize={12}
          >
            {label}
          </text>
        )}
        {/* 出力ピン */}
        <line
          x1={25}
          y1={0}
          x2={35}
          y2={0}
          stroke={output ? '#00ff88' : '#666'}
          strokeWidth={2}
        />
        <circle
          cx={35}
          cy={0}
          r={PIN_RADIUS}
          fill={output ? '#00ff88' : '#666'}
        />
      </g>
    );
  }
  
  if (type === 'OUTPUT') {
    return (
      <g transform={`translate(${x}, ${y})`}>
        {/* LED外枠 */}
        <circle
          cx={0}
          cy={0}
          r={20}
          fill="none"
          stroke="#444"
          strokeWidth={2}
        />
        {/* LED内部 */}
        <circle
          cx={0}
          cy={0}
          r={15}
          fill={output ? '#00ff88' : '#333'}
        />
        {/* アイコン */}
        <text
          x={0}
          y={0}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={20}
        >
          💡
        </text>
        {/* ラベル */}
        {label && (
          <text
            x={0}
            y={35}
            textAnchor="middle"
            fill="#888"
            fontSize={12}
          >
            {label}
          </text>
        )}
        {/* 入力ピン */}
        <line
          x1={-35}
          y1={0}
          x2={-20}
          y2={0}
          stroke={output ? '#00ff88' : '#666'}
          strokeWidth={2}
        />
        <circle
          cx={-35}
          cy={0}
          r={PIN_RADIUS}
          fill={output ? '#00ff88' : '#666'}
        />
      </g>
    );
  }
  
  return null;
};

// ワイヤーのレンダリング
const renderWire = (wire: WireConfig) => {
  const { from, to, active = false, label } = wire;
  
  // 曲線パスの計算（ベジェ曲線）
  const midX = (from.x + to.x) / 2;
  const path = `M ${from.x} ${from.y} Q ${midX} ${from.y} ${midX} ${(from.y + to.y) / 2} T ${to.x} ${to.y}`;
  
  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke={active ? '#00ff88' : '#666'}
        strokeWidth={2}
        className={`wire ${active ? 'active' : ''}`}
      />
      {active && (
        <path
          d={path}
          fill="none"
          stroke="#00ff88"
          strokeWidth={4}
          opacity={0.3}
          filter="blur(2px)"
        />
      )}
      {label && (
        <text
          x={midX}
          y={(from.y + to.y) / 2 - 10}
          textAnchor="middle"
          fill="#888"
          fontSize={10}
        >
          {label}
        </text>
      )}
    </g>
  );
};

export const StaticCircuitDiagram: React.FC<CircuitDiagramConfig> = ({
  gates,
  wires,
  width = 600,
  height = 300,
  showGrid = false,
  title
}) => {
  return (
    <div className="static-circuit-diagram">
      {title && (
        <h4 style={{ textAlign: 'center', marginBottom: '10px', color: '#00ff88' }}>
          {title}
        </h4>
      )}
      <svg 
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        style={{ 
          maxWidth: `${width}px`,
          backgroundColor: '#1a1a1a',
          border: '2px solid #333',
          borderRadius: '8px'
        }}
      >
        {/* グリッド（オプション） */}
        {showGrid && (
          <>
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#333" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" opacity={0.3} />
          </>
        )}
        
        {/* ワイヤーを先に描画（ゲートの下に表示） */}
        {wires.map((wire, index) => (
          <React.Fragment key={`wire-${index}`}>
            {renderWire(wire)}
          </React.Fragment>
        ))}
        
        {/* ゲートを描画 */}
        {gates.map((gate, index) => {
          const key = `gate-${index}`;
          
          if (['INPUT', 'OUTPUT'].includes(gate.type)) {
            return (
              <React.Fragment key={key}>
                {renderIOGate(gate)}
              </React.Fragment>
            );
          }
          
          return (
            <React.Fragment key={key}>
              {renderBasicGate(gate)}
            </React.Fragment>
          );
        })}
      </svg>
    </div>
  );
};

// 便利な定義済み回路図
export const predefinedCircuits = {
  // ANDゲートの基本回路
  andGateBasic: {
    gates: [
      { type: 'INPUT' as GateType, x: 100, y: 100, output: true, label: 'A' },
      { type: 'INPUT' as GateType, x: 100, y: 200, output: true, label: 'B' },
      { type: 'AND' as GateType, x: 300, y: 150, inputs: [true, true], output: true },
      { type: 'OUTPUT' as GateType, x: 500, y: 150, output: true, label: 'Y' }
    ],
    wires: [
      { from: { x: 135, y: 100 }, to: { x: 265, y: 135 }, active: true },
      { from: { x: 135, y: 200 }, to: { x: 265, y: 165 }, active: true },
      { from: { x: 335, y: 150 }, to: { x: 465, y: 150 }, active: true }
    ]
  },
  
  // 半加算器
  halfAdder: {
    gates: [
      { type: 'INPUT' as GateType, x: 100, y: 100, output: true, label: 'A' },
      { type: 'INPUT' as GateType, x: 100, y: 200, output: true, label: 'B' },
      { type: 'XOR' as GateType, x: 300, y: 100, inputs: [true, true], output: false, label: 'XOR' },
      { type: 'AND' as GateType, x: 300, y: 200, inputs: [true, true], output: true, label: 'AND' },
      { type: 'OUTPUT' as GateType, x: 500, y: 100, output: false, label: 'Sum' },
      { type: 'OUTPUT' as GateType, x: 500, y: 200, output: true, label: 'Carry' }
    ],
    wires: [
      // A to XOR
      { from: { x: 135, y: 100 }, to: { x: 265, y: 85 }, active: true },
      // B to XOR
      { from: { x: 135, y: 200 }, to: { x: 265, y: 115 }, active: true },
      // A to AND
      { from: { x: 135, y: 100 }, to: { x: 265, y: 185 }, active: true },
      // B to AND
      { from: { x: 135, y: 200 }, to: { x: 265, y: 215 }, active: true },
      // XOR to Sum
      { from: { x: 335, y: 100 }, to: { x: 465, y: 100 }, active: false },
      // AND to Carry
      { from: { x: 335, y: 200 }, to: { x: 465, y: 200 }, active: true }
    ]
  }
};
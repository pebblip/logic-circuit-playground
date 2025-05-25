// モダンなゲートコンポーネント

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { GATE_TYPES, GATE_UI } from '../../constants/circuit';
import { colors, animation } from '../../styles/design-tokens';

/**
 * モダンなゲートコンポーネント
 */
const GateModern = memo(({
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
  
  // ゲートのレベルに基づく色を取得
  const getGateColor = () => {
    if (isSelected) return colors.ui.accent.primary;
    if (isHovered) return colors.ui.accent.primaryHover;
    
    switch (gateInfo.level) {
      case 1: return colors.gates.basic;
      case 2: return colors.gates.memory;
      case 3: return colors.gates.arithmetic;
      case 4: return colors.gates.cpu;
      default: return colors.ui.border;
    }
  };
  
  // 信号の状態を取得
  const getSignalState = (gateId, outputIndex = 0) => {
    const key = outputIndex === 0 ? gateId : `${gateId}_out${outputIndex}`;
    return simulation[key] || false;
  };
  
  // 入出力ゲートの信号表示
  const renderIOSignal = () => {
    const isOn = gate.type === 'OUTPUT' 
      ? getSignalState(gate.id)
      : gate.value;
    
    return (
      <>
        {/* 外側の円（グロー効果） */}
        {isOn && (
          <circle
            cx={0}
            cy={0}
            r={45}
            fill="none"
            stroke={colors.signal.onGlow}
            strokeWidth="2"
            opacity="0.3"
            style={{ animation: animation.pulse }}
          />
        )}
        
        {/* LEDライト */}
        <circle
          cx={0}
          cy={0}
          r={30}
          fill={isOn ? colors.signal.on : colors.ui.surface}
          stroke={getGateColor()}
          strokeWidth={isSelected ? "3" : "2"}
          filter={isOn ? "url(#glow)" : ""}
        />
        
        {/* 内側の光 */}
        {isOn && (
          <circle
            cx={0}
            cy={0}
            r={20}
            fill={colors.signal.onGlow}
            opacity="0.6"
            style={{ animation: animation.glow }}
          />
        )}
        
        {/* ラベル */}
        <text
          x={0}
          y={gate.type === 'CLOCK' ? -40 : 45}
          textAnchor="middle"
          fill={colors.ui.text.primary}
          fontSize="12"
          fontWeight="500"
        >
          {gate.type === 'INPUT' ? '入力' : 
           gate.type === 'CLOCK' ? 'クロック' : '出力'}
        </text>
        
        {/* クロックの周波数表示 */}
        {gate.type === 'CLOCK' && (
          <text
            x={0}
            y={50}
            textAnchor="middle"
            fill={colors.ui.text.secondary}
            fontSize="10"
          >
            ~
          </text>
        )}
      </>
    );
  };
  
  // 通常ゲートの表示
  const renderGate = () => {
    return (
      <>
        {/* 背景 */}
        <rect
          x={-GATE_UI.RECT_WIDTH / 2}
          y={-GATE_UI.RECT_HEIGHT / 2}
          width={GATE_UI.RECT_WIDTH}
          height={GATE_UI.RECT_HEIGHT}
          rx={8}
          fill={colors.ui.surface}
          stroke={getGateColor()}
          strokeWidth={isSelected ? "3" : "2"}
          filter="url(#dropShadow)"
        />
        
        {/* ゲートタイプの背景 */}
        <rect
          x={-GATE_UI.RECT_WIDTH / 2}
          y={-GATE_UI.RECT_HEIGHT / 2}
          width={GATE_UI.RECT_WIDTH}
          height={20}
          rx={8}
          fill={getGateColor()}
          opacity="0.1"
        />
        
        {/* シンボル */}
        <text
          x={0}
          y={0}
          textAnchor="middle"
          fill={colors.ui.text.primary}
          fontSize="16"
          fontWeight="600"
        >
          {gateInfo.symbol}
        </text>
        
        {/* 日本語名 */}
        <text
          x={0}
          y={18}
          textAnchor="middle"
          fill={colors.ui.text.secondary}
          fontSize="11"
          fontWeight="400"
        >
          {gateInfo.name}
        </text>
      </>
    );
  };
  
  return (
    <g 
      transform={`translate(${gate.x}, ${gate.y})`} 
      data-testid={`gate-${gate.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: 'pointer' }}
    >
      {/* フィルター定義 */}
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1"/>
        </filter>
      </defs>
      
      {/* ゲート本体 */}
      <g
        onClick={(e) => onGateClick(e, gate)}
        onDoubleClick={(e) => onGateDoubleClick(e, gate)}
        onMouseDown={(e) => onGateMouseDown(e, gate)}
      >
        {isIOGate ? renderIOSignal() : renderGate()}
      </g>
      
      {/* 入力端子 */}
      {Array.from({ length: gateInfo.inputs }).map((_, i) => {
        const cy = gateInfo.inputs === 3 
          ? -25 + (i * GATE_UI.TERMINAL_SPACING)
          : -20 + (i * GATE_UI.TERMINAL_SPACING);
        
        // 接続状態を確認
        const isConnected = false; // TODO: 接続状態の確認
        
        return (
          <g key={`in-${i}`}>
            <circle
              cx={isIOGate ? 0 : -GATE_UI.RECT_WIDTH / 2 - 10}
              cy={cy}
              r={8}
              fill={colors.ui.surface}
              stroke={isHovered ? colors.ui.accent.primary : colors.ui.border}
              strokeWidth="2"
              className="cursor-crosshair"
              onMouseUp={(e) => onTerminalMouseUp(e, gate, i)}
            />
            <circle
              cx={isIOGate ? 0 : -GATE_UI.RECT_WIDTH / 2 - 10}
              cy={cy}
              r={3}
              fill={isConnected ? colors.signal.on : colors.ui.border}
            />
          </g>
        );
      })}
      
      {/* 出力端子 */}
      {Array.from({ length: gateInfo.outputs }).map((_, i) => {
        const cy = gateInfo.outputs === 1 ? 0 : -10 + (i * GATE_UI.OUTPUT_SPACING);
        const isOn = getSignalState(gate.id, i);
        
        return (
          <g key={`out-${i}`}>
            <circle
              cx={isIOGate ? 0 : GATE_UI.RECT_WIDTH / 2 + 10}
              cy={cy}
              r={8}
              fill={isOn ? colors.signal.on : colors.ui.surface}
              stroke={isOn ? colors.signal.on : colors.ui.border}
              strokeWidth="2"
              className="cursor-crosshair"
              onMouseDown={(e) => onTerminalMouseDown(e, gate, i)}
            />
            {isOn && (
              <circle
                cx={isIOGate ? 0 : GATE_UI.RECT_WIDTH / 2 + 10}
                cy={cy}
                r={10}
                fill="none"
                stroke={colors.signal.onGlow}
                strokeWidth="2"
                opacity="0.5"
                style={{ animation: animation.pulse }}
              />
            )}
          </g>
        );
      })}
      
      {/* ツールチップ */}
      {isHovered && !isIOGate && (
        <g>
          <rect
            x={-60}
            y={-GATE_UI.RECT_HEIGHT / 2 - 40}
            width={120}
            height={30}
            rx={4}
            fill={colors.ui.text.primary}
            opacity="0.9"
          />
          <text
            x={0}
            y={-GATE_UI.RECT_HEIGHT / 2 - 20}
            textAnchor="middle"
            fill={colors.ui.surface}
            fontSize="11"
          >
            {gate.type === 'AND' && 'すべて1のとき1'}
            {gate.type === 'OR' && 'どれか1のとき1'}
            {gate.type === 'NOT' && '入力を反転'}
            {gate.type === 'XOR' && '入力が異なるとき1'}
            {gate.type === 'NAND' && 'ANDの反転'}
            {gate.type === 'NOR' && 'ORの反転'}
          </text>
        </g>
      )}
    </g>
  );
});

GateModern.displayName = 'GateModern';

GateModern.propTypes = {
  gate: PropTypes.object.isRequired,
  isSelected: PropTypes.bool.isRequired,
  simulation: PropTypes.object.isRequired,
  onGateClick: PropTypes.func.isRequired,
  onGateDoubleClick: PropTypes.func.isRequired,
  onGateMouseDown: PropTypes.func.isRequired,
  onTerminalMouseDown: PropTypes.func.isRequired,
  onTerminalMouseUp: PropTypes.func.isRequired
};

export default GateModern;
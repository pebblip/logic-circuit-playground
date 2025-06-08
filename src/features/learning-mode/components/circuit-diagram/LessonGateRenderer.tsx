import React from 'react';
import type { Gate } from '@/types/circuit';

interface LessonGateRendererProps {
  gate: Gate;
}

/**
 * 学習モード用のゲートレンダラー
 * ストアに依存せず、propsから渡されたデータのみで描画
 * BasicGateRendererのスタイルに準拠
 */
export const LessonGateRenderer: React.FC<LessonGateRendererProps> = ({
  gate,
}) => {
  const renderIOGate = () => {
    const isInput = gate.type === 'INPUT';

    if (isInput) {
      // INPUTゲート：スイッチ型
      return (
        <>
          {/* スイッチトラック */}
          <rect
            className={`switch-track ${gate.output ? 'active' : ''}`}
            x="-25"
            y="-15"
            width="50"
            height="30"
            rx="15"
            fill={gate.output ? 'rgba(0, 255, 136, 0.1)' : '#1a1a1a'}
            stroke={gate.output ? '#00ff88' : '#444'}
            strokeWidth="2"
          />
          {/* スイッチサム */}
          <circle
            className={`switch-thumb ${gate.output ? 'active' : ''}`}
            cx={gate.output ? 10 : -10}
            cy="0"
            r="10"
            fill={gate.output ? '#00ff88' : '#666'}
          />
          {/* 出力ピン */}
          <line
            x1="25"
            y1="0"
            x2="35"
            y2="0"
            stroke="#00ff88"
            strokeWidth="2"
          />
          <circle
            cx="35"
            cy="0"
            r="6"
            className={`pin output-pin ${gate.output ? 'active' : ''}`}
            fill={gate.output ? '#00ff88' : 'none'}
            stroke="#00ff88"
            strokeWidth="2"
          />
        </>
      );
    } else {
      // OUTPUTゲート：電球型
      const inputValue =
        gate.inputs && gate.inputs.length > 0
          ? typeof gate.inputs[0] === 'boolean'
            ? gate.inputs[0]
            : false
          : false;

      return (
        <>
          {/* 外側の円 */}
          <circle
            cx="0"
            cy="0"
            r="20"
            fill="#1a1a1a"
            stroke="#444"
            strokeWidth="2"
          />
          {/* 内側の円（光る部分） */}
          <circle cx="0" cy="0" r="15" fill={inputValue ? '#00ff88' : '#333'} />
          {/* 電球アイコン */}
          <text
            x="0"
            y="5"
            className="gate-text u-text-xl"
            textAnchor="middle"
            fill="#fff"
            fontSize="20"
          >
            💡
          </text>
          {/* 入力ピン */}
          <line
            x1="-20"
            y1="0"
            x2="-30"
            y2="0"
            stroke="#00ff88"
            strokeWidth="2"
          />
          <circle
            cx="-30"
            cy="0"
            r="6"
            className={`pin input-pin ${inputValue ? 'active' : ''}`}
            fill={inputValue ? '#00ff88' : 'none'}
            stroke="#00ff88"
            strokeWidth="2"
          />
        </>
      );
    }
  };

  const renderBasicGate = () => {
    const inputCount = gate.type === 'NOT' ? 1 : 2;

    return (
      <>
        <rect
          className="gate-body"
          x={-35}
          y={-25}
          width={70}
          height={50}
          rx={8}
          fill="#363849"
          stroke="#00ff88"
          strokeWidth={2}
        />
        <text
          className="gate-label"
          x={0}
          y={0}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#e8e8ec"
          fontSize={14}
          fontWeight="bold"
        >
          {gate.type}
        </text>
        {/* 入力ピン */}
        {inputCount === 1 ? (
          <>
            <line
              x1={-35}
              y1={0}
              x2={-45}
              y2={0}
              stroke="#00ff88"
              strokeWidth={2}
            />
            <circle
              cx={-45}
              cy={0}
              r={5}
              fill="none"
              stroke="#00ff88"
              strokeWidth={2}
            />
          </>
        ) : (
          <>
            <line
              x1={-35}
              y1={-10}
              x2={-45}
              y2={-10}
              stroke="#00ff88"
              strokeWidth={2}
            />
            <circle
              cx={-45}
              cy={-10}
              r={5}
              fill="none"
              stroke="#00ff88"
              strokeWidth={2}
            />
            <line
              x1={-35}
              y1={10}
              x2={-45}
              y2={10}
              stroke="#00ff88"
              strokeWidth={2}
            />
            <circle
              cx={-45}
              cy={10}
              r={5}
              fill="none"
              stroke="#00ff88"
              strokeWidth={2}
            />
          </>
        )}
        {/* 出力ピン */}
        <line x1={35} y1={0} x2={45} y2={0} stroke="#00ff88" strokeWidth={2} />
        <circle
          cx={45}
          cy={0}
          r={5}
          fill={gate.output ? '#00ff88' : 'none'}
          stroke="#00ff88"
          strokeWidth={2}
        />
      </>
    );
  };

  const renderGate = () => {
    switch (gate.type) {
      case 'INPUT':
      case 'OUTPUT':
        return renderIOGate();

      case 'AND':
      case 'OR':
      case 'NOT':
      case 'XOR':
      case 'NAND':
      case 'NOR':
        return renderBasicGate();

      default:
        // 特殊ゲートやカスタムゲートも基本形状で表示
        return renderBasicGate();
    }
  };

  return (
    <g
      transform={`translate(${gate.position.x}, ${gate.position.y})`}
      data-gate-id={gate.id}
      className="gate-container"
    >
      {renderGate()}
    </g>
  );
};

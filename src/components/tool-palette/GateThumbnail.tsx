import React from 'react';
import type { GateType, CustomGateDefinition } from '@/types/circuit';

interface GateThumbnailProps {
  type: GateType | 'CUSTOM';
  customDefinition?: CustomGateDefinition;
}

export const GateThumbnail: React.FC<GateThumbnailProps> = ({
  type,
  customDefinition,
}) => {
  // 基本ゲート
  if (['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR'].includes(type)) {
    return (
      <svg className="tool-preview" viewBox="-50 -35 100 70">
        <rect className="gate" x="-35" y="-25" width="70" height="50" rx="8" />
        <text className="gate-text" x="0" y="0">
          {type}
        </text>
      </svg>
    );
  }

  // I/Oゲート
  if (type === 'INPUT') {
    return (
      <svg className="tool-preview" viewBox="-35 -20 70 40">
        <rect
          className="switch-track"
          fill="#1a1a1a"
          stroke="#444"
          x="-25"
          y="-15"
          width="50"
          height="30"
          rx="15"
        />
        <circle fill="#666" cx="0" cy="0" r="10" />
      </svg>
    );
  }
  if (type === 'OUTPUT') {
    return (
      <svg className="tool-preview" viewBox="-25 -25 50 50">
        <circle fill="#1a1a1a" stroke="#444" cx="0" cy="0" r="20" />
        <text x="0" y="5" style={{ fontSize: '20px', textAnchor: 'middle' }}>
          💡
        </text>
      </svg>
    );
  }

  // 特殊ゲートのプレビュー
  if (type === 'CLOCK') {
    return (
      <svg className="tool-preview" viewBox="-50 -50 100 100">
        {/* 円形デザイン（Gate.tsxと統一） */}
        <circle
          className="gate"
          cx="0"
          cy="0"
          r="30"
          fill="#1a1a1a"
          stroke="#444"
          strokeWidth="2"
        />
        {/* 時計アイコン */}
        <text x="0" y="-3" className="gate-text" style={{ fontSize: '16px' }}>
          ⏰
        </text>
        {/* パルス波形表示（簡略版） */}
        <path
          d="M -15 15 h4 v-6 h4 v6 h4 v-6 h4 v6 h3"
          stroke="#0ff"
          strokeWidth="1"
          fill="none"
          opacity="0.8"
        />
      </svg>
    );
  }
  if (type === 'D-FF') {
    return (
      <svg className="tool-preview" viewBox="-60 -50 120 100">
        <rect className="gate" x="-40" y="-30" width="80" height="60" rx="8" />
        <text className="gate-text" x="0" y="0" style={{ fontSize: '8px' }}>
          D-FF
        </text>
        <text
          className="gate-text"
          x="-30"
          y="-15"
          style={{ fontSize: '8px', fill: '#999' }}
        >
          D
        </text>
        <text
          className="gate-text"
          x="-30"
          y="15"
          style={{ fontSize: '8px', fill: '#999' }}
        >
          CLK
        </text>
        <text
          className="gate-text"
          x="30"
          y="-15"
          style={{ fontSize: '8px', fill: '#999' }}
        >
          Q
        </text>
        <text
          className="gate-text"
          x="30"
          y="15"
          style={{ fontSize: '8px', fill: '#999' }}
        >
          Q̄
        </text>
      </svg>
    );
  }
  if (type === 'SR-LATCH') {
    return (
      <svg className="tool-preview" viewBox="-60 -50 120 100">
        <rect className="gate" x="-40" y="-30" width="80" height="60" rx="8" />
        <text className="gate-text" x="0" y="-5" style={{ fontSize: '8px' }}>
          SR
        </text>
        <text
          className="gate-text"
          x="0"
          y="8"
          style={{ fontSize: '7px', fill: '#999' }}
        >
          LATCH
        </text>
        <text
          className="gate-text"
          x="-30"
          y="-15"
          style={{ fontSize: '8px', fill: '#999' }}
        >
          S
        </text>
        <text
          className="gate-text"
          x="-30"
          y="15"
          style={{ fontSize: '8px', fill: '#999' }}
        >
          R
        </text>
        <text
          className="gate-text"
          x="30"
          y="-15"
          style={{ fontSize: '8px', fill: '#999' }}
        >
          Q
        </text>
        <text
          className="gate-text"
          x="30"
          y="15"
          style={{ fontSize: '8px', fill: '#999' }}
        >
          Q̄
        </text>
      </svg>
    );
  }
  if (type === 'MUX') {
    return (
      <svg className="tool-preview" viewBox="-60 -50 120 100">
        <rect className="gate" x="-40" y="-30" width="80" height="60" rx="8" />
        <text className="gate-text" x="0" y="0" style={{ fontSize: '8px' }}>
          MUX
        </text>
        <text
          className="gate-text"
          x="-30"
          y="-18"
          style={{ fontSize: '7px', fill: '#999' }}
        >
          A
        </text>
        <text
          className="gate-text"
          x="-30"
          y="0"
          style={{ fontSize: '7px', fill: '#999' }}
        >
          B
        </text>
        <text
          className="gate-text"
          x="-30"
          y="18"
          style={{ fontSize: '7px', fill: '#999' }}
        >
          S
        </text>
        <text
          className="gate-text"
          x="30"
          y="0"
          style={{ fontSize: '7px', fill: '#999' }}
        >
          Y
        </text>
      </svg>
    );
  }

  // カスタムゲート
  if (type === 'CUSTOM' && customDefinition) {
    const width = Math.min(50, customDefinition.width || 50) * 0.8;
    const height = Math.min(40, customDefinition.height || 40) * 0.8;

    return (
      <svg
        className="tool-preview"
        viewBox={`${-width / 2 - 10} ${-height / 2 - 10} ${width + 20} ${height + 20}`}
      >
        {/* 外側境界線 */}
        <rect
          x={-width / 2 - 2}
          y={-height / 2 - 2}
          width={width + 4}
          height={height + 4}
          rx="6"
          fill="none"
          stroke="#6633cc"
          strokeWidth="2"
          opacity="0.3"
        />

        {/* カスタムゲートの本体 */}
        <rect
          x={-width / 2}
          y={-height / 2}
          width={width}
          height={height}
          rx="4"
          fill="rgba(102, 51, 153, 0.1)"
          stroke="#6633cc"
          strokeWidth="1"
        />

        {/* アイコン */}
        {customDefinition.icon && (
          <text
            x="0"
            y="0"
            style={{
              fontSize: '16px',
              textAnchor: 'middle',
              dominantBaseline: 'middle',
              fill: '#ccc',
            }}
          >
            {customDefinition.icon}
          </text>
        )}

        {/* 簡略化されたピン表示 */}
        {customDefinition.inputs.map((_, index) => (
          <circle
            key={`in-${index}`}
            cx={-width / 2 - 4}
            cy={-((customDefinition.inputs.length - 1) * 8) / 2 + index * 8}
            r="2"
            fill="#6633cc"
          />
        ))}

        {customDefinition.outputs.map((_, index) => (
          <circle
            key={`out-${index}`}
            cx={width / 2 + 4}
            cy={-((customDefinition.outputs.length - 1) * 8) / 2 + index * 8}
            r="2"
            fill="#6633cc"
          />
        ))}
      </svg>
    );
  }

  return null;
};

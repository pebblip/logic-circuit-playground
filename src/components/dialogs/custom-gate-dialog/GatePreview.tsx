import React from 'react';
import type { CustomGatePin } from '@/types/circuit';

interface GatePreviewProps {
  displayName: string;
  selectedIcon: string;
  inputs: CustomGatePin[];
  outputs: CustomGatePin[];
  gateWidth: number;
  gateHeight: number;
}

export const GatePreview: React.FC<GatePreviewProps> = ({
  displayName,
  selectedIcon,
  inputs,
  outputs,
  gateWidth,
  gateHeight,
}) => {
  return (
    <div style={{ marginBottom: '24px' }}>
      <h3
        style={{
          margin: '0 0 12px 0',
          fontSize: '16px',
          color: '#00ff88',
        }}
      >
        プレビュー
      </h3>
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <svg
          width={gateWidth + 80}
          height={gateHeight + 60}
          viewBox={`0 0 ${gateWidth + 80} ${gateHeight + 60}`}
        >
          {/* カスタムゲートプレビュー */}
          <g
            transform={`translate(${(gateWidth + 80) / 2}, ${(gateHeight + 60) / 2})`}
          >
            {/* 外側境界線 */}
            <rect
              x={-gateWidth / 2 - 2}
              y={-gateHeight / 2 - 2}
              width={gateWidth + 4}
              height={gateHeight + 4}
              rx="10"
              fill="none"
              stroke="#6633cc"
              strokeWidth="3"
              opacity="0.3"
            />

            {/* ゲート本体 */}
            <rect
              x={-gateWidth / 2}
              y={-gateHeight / 2}
              width={gateWidth}
              height={gateHeight}
              rx="8"
              fill="rgba(102, 51, 153, 0.1)"
              stroke="#6633cc"
              strokeWidth="2"
            />

            {/* 表示名 */}
            <text
              x="0"
              y={-gateHeight / 2 - 15}
              style={{
                fontSize: '12px',
                textAnchor: 'middle',
                fill: '#00ff88',
                fontWeight: 600,
              }}
            >
              {(displayName || 'MyGate').length > 12
                ? (displayName || 'MyGate').substring(0, 12) + '...'
                : displayName || 'MyGate'}
            </text>

            {/* アイコン */}
            <text
              x="0"
              y="0"
              style={{
                fontSize: '18px',
                textAnchor: 'middle',
              }}
            >
              {selectedIcon}
            </text>

            {/* 入力ピン */}
            {inputs.map((input, index) => {
              const pinCount = inputs.length;
              const availableHeight = Math.max(40, gateHeight - 80);
              const spacing =
                pinCount === 1
                  ? 0
                  : Math.max(
                      30,
                      availableHeight / Math.max(1, pinCount - 1)
                    );
              const y =
                pinCount === 1
                  ? 0
                  : -((pinCount - 1) * spacing) / 2 + index * spacing;

              return (
                <g key={`input-${index}`}>
                  <circle
                    cx={-gateWidth / 2 - 10}
                    cy={y}
                    r="4"
                    fill="#6633cc"
                  />
                  <line
                    x1={-gateWidth / 2}
                    y1={y}
                    x2={-gateWidth / 2 - 10}
                    y2={y}
                    stroke="#6633cc"
                    strokeWidth="2"
                  />
                  <text
                    x={-gateWidth / 2 + 15}
                    y={y + 4}
                    style={{
                      fontSize: '8px',
                      fill: '#999',
                      textAnchor: 'start',
                    }}
                  >
                    {input.name}
                  </text>
                </g>
              );
            })}

            {/* 出力ピン */}
            {outputs.map((output, index) => {
              const pinCount = outputs.length;
              const availableHeight = Math.max(40, gateHeight - 80);
              const spacing =
                pinCount === 1
                  ? 0
                  : Math.max(
                      30,
                      availableHeight / Math.max(1, pinCount - 1)
                    );
              const y =
                pinCount === 1
                  ? 0
                  : -((pinCount - 1) * spacing) / 2 + index * spacing;

              return (
                <g key={`output-${index}`}>
                  <circle
                    cx={gateWidth / 2 + 10}
                    cy={y}
                    r="4"
                    fill="#6633cc"
                  />
                  <line
                    x1={gateWidth / 2}
                    y1={y}
                    x2={gateWidth / 2 + 10}
                    y2={y}
                    stroke="#6633cc"
                    strokeWidth="2"
                  />
                  <text
                    x={gateWidth / 2 - 15}
                    y={y + 4}
                    style={{
                      fontSize: '8px',
                      fill: '#999',
                      textAnchor: 'end',
                    }}
                  >
                    {output.name}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
};
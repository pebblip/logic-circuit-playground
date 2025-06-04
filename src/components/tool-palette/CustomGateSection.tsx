import React from 'react';
import type { GateType, CustomGateDefinition } from '@/types/circuit';
import { GateCard } from './GateCard';

interface CustomGateSectionProps {
  demoCustomGates: CustomGateDefinition[];
  userCustomGates: CustomGateDefinition[];
  onDragStart: (type: GateType | 'CUSTOM', customDefinition?: CustomGateDefinition) => void;
  onDragEnd: () => void;
  onContextMenu: (definition: CustomGateDefinition) => void;
  onCreateFromCircuit: () => void;
}

export const CustomGateSection: React.FC<CustomGateSectionProps> = ({
  demoCustomGates,
  userCustomGates,
  onDragStart,
  onDragEnd,
  onContextMenu,
  onCreateFromCircuit,
}) => {
  return (
    <>
      <div className="section-title">
        <span>🔧</span>
        <span>カスタムゲート</span>
      </div>
      <div className="tools-grid">
        {/* デモカスタムゲート */}
        {demoCustomGates.map(definition => (
          <GateCard
            key={definition.id}
            type="CUSTOM"
            label={definition.displayName}
            customDefinition={definition}
            onDragStart={(_, customDef) => onDragStart('CUSTOM', customDef)}
            onDragEnd={onDragEnd}
          />
        ))}

        {/* ユーザー作成のカスタムゲート */}
        {userCustomGates.map(definition => (
          <GateCard
            key={definition.id}
            type="CUSTOM"
            label={definition.displayName}
            customDefinition={definition}
            onDragStart={(_, customDef) => onDragStart('CUSTOM', customDef)}
            onDragEnd={onDragEnd}
            onContextMenu={e => {
              e.preventDefault();
              onContextMenu(definition);
            }}
          />
        ))}

        {/* 現在の回路から作成ボタン */}
        <div
          className="tool-card create-custom-gate"
          onClick={onCreateFromCircuit}
        >
          <svg className="tool-preview" viewBox="-30 -30 60 60">
            <rect
              x="-25"
              y="-25"
              width="50"
              height="50"
              rx="8"
              fill="none"
              stroke="#6633cc"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
            <text
              x="0"
              y="0"
              style={{
                fontSize: '20px',
                textAnchor: 'middle',
                dominantBaseline: 'middle',
                fill: '#6633cc',
              }}
            >
              📦
            </text>
          </svg>
          <div className="tool-label">回路→IC</div>
        </div>
      </div>
    </>
  );
};
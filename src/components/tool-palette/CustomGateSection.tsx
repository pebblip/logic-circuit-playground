import React from 'react';
import type { GateType, CustomGateDefinition } from '@/types/circuit';
import { GateCard } from './GateCard';

interface CustomGateSectionProps {
  demoCustomGates: CustomGateDefinition[];
  userCustomGates: CustomGateDefinition[];
  onDragStart: (type: GateType | 'CUSTOM', customDefinition?: CustomGateDefinition) => void;
  onDragEnd: () => void;
  onContextMenu: (definition: CustomGateDefinition) => void;
}

export const CustomGateSection: React.FC<CustomGateSectionProps> = ({
  demoCustomGates,
  userCustomGates,
  onDragStart,
  onDragEnd,
  onContextMenu,
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

      </div>
    </>
  );
};
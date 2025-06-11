import React from 'react';
import type { GateType, CustomGateDefinition } from '@/types/circuit';
import { GateCard } from './GateCard';
import { useCircuitStore } from '@/stores/circuitStore';
import { debug } from '@/shared/debug';

interface CustomGateSectionProps {
  demoCustomGates: CustomGateDefinition[];
  userCustomGates: CustomGateDefinition[];
  selectedGateType?: GateType | 'CUSTOM' | null;
  selectedCustomGateId?: string | null;
  onDragStart: (
    type: GateType | 'CUSTOM',
    customDefinition?: CustomGateDefinition
  ) => void;
  onDragEnd: () => void;
  onContextMenu: (definition: CustomGateDefinition) => void;
  onGateClick?: (customGateId: string) => void;
}

export const CustomGateSection: React.FC<CustomGateSectionProps> = ({
  demoCustomGates,
  userCustomGates,
  selectedGateType,
  selectedCustomGateId,
  onDragStart,
  onDragEnd,
  onContextMenu,
  onGateClick,
}) => {
  const enterCustomGatePreview = useCircuitStore(
    state => state.enterCustomGatePreview
  );

  const handleCardDoubleClick = (customGate: CustomGateDefinition) => {
    debug.log('[CustomGateSection] Double click:', customGate.id);
    enterCustomGatePreview(customGate.id);
  };

  const handleCardClick = (customGate: CustomGateDefinition) => {
    if (onGateClick) {
      onGateClick(customGate.id);
    }
  };

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
            isSelected={
              selectedGateType === 'CUSTOM' &&
              selectedCustomGateId === definition.id
            }
            onDragStart={(_, customDef) => onDragStart('CUSTOM', customDef)}
            onDragEnd={onDragEnd}
            onClick={() => handleCardClick(definition)}
            onDoubleClick={() => handleCardDoubleClick(definition)}
          />
        ))}

        {/* ユーザー作成のカスタムゲート */}
        {userCustomGates.map(definition => (
          <GateCard
            key={definition.id}
            type="CUSTOM"
            label={definition.displayName}
            customDefinition={definition}
            isSelected={
              selectedGateType === 'CUSTOM' &&
              selectedCustomGateId === definition.id
            }
            onDragStart={(_, customDef) => onDragStart('CUSTOM', customDef)}
            onDragEnd={onDragEnd}
            onContextMenu={e => {
              e.preventDefault();
              onContextMenu(definition);
            }}
            onClick={() => handleCardClick(definition)}
            onDoubleClick={() => handleCardDoubleClick(definition)}
          />
        ))}
      </div>
    </>
  );
};

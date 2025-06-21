import React from 'react';
import type { GateType } from '@/types/circuit';
import { GateCard } from './GateCard';

interface GateSectionProps {
  title: string;
  icon: string;
  gates: Array<{ type: GateType; label: string }>;
  allowedGates: GateType[] | null;
  selectedGateType: GateType | 'CUSTOM' | null;
  onDragStart: (type: GateType) => void;
  onDragEnd: () => void;
  onGateClick: (type: GateType) => void;
}

export const GateSection: React.FC<GateSectionProps> = ({
  title,
  icon,
  gates,
  allowedGates,
  selectedGateType,
  onDragStart,
  onDragEnd,
  onGateClick,
}) => {
  return (
    <>
      <div
        className="section-title"
        data-testid={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <span>{icon}</span>
        <span>{title}</span>
      </div>
      <div className="tools-grid">
        {gates.map(({ type, label }) => {
          const isDisabled =
            allowedGates !== null && !allowedGates.includes(type);
          return (
            <GateCard
              key={type}
              type={type}
              label={label}
              isDisabled={isDisabled}
              isSelected={selectedGateType === type}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onClick={() => !isDisabled && onGateClick(type)}
              testId={`${type}-button`}
            />
          );
        })}
      </div>
    </>
  );
};

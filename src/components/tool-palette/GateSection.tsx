import React from 'react';
import type { GateType } from '@/types/circuit';
import { GateCard } from './GateCard';

interface GateSectionProps {
  title: string;
  icon: string;
  gates: Array<{ type: GateType; label: string }>;
  allowedGates: GateType[] | null;
  onDragStart: (type: GateType) => void;
  onDragEnd: () => void;
}

export const GateSection: React.FC<GateSectionProps> = ({
  title,
  icon,
  gates,
  allowedGates,
  onDragStart,
  onDragEnd,
}) => {
  return (
    <>
      <div className="section-title">
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
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          );
        })}
      </div>
    </>
  );
};

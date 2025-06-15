import React from 'react';
import type { GateType, CustomGateDefinition } from '@/types/circuit';
import { GateThumbnail } from './GateThumbnail';
import { TERMS } from '@/features/learning-mode/data/terms';

interface GateCardProps {
  type: GateType | 'CUSTOM';
  label: string;
  customDefinition?: CustomGateDefinition;
  isDisabled?: boolean;
  isSelected?: boolean;
  onDragStart: (
    type: GateType | 'CUSTOM',
    customDefinition?: CustomGateDefinition
  ) => void;
  onDragEnd: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  onClick?: (e: React.MouseEvent) => void;
  testId?: string;
}

export const GateCard: React.FC<GateCardProps> = ({
  type,
  label,
  customDefinition,
  isDisabled = false,
  isSelected = false,
  onDragStart,
  onDragEnd,
  onContextMenu,
  onDoubleClick,
  onClick,
  testId,
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    if (!isDisabled && e.dataTransfer) {
      onDragStart(type, customDefinition);
      e.dataTransfer.effectAllowed = 'copy';
      // デフォルトのドラッグゴーストを使用
    }
  };

  const title = isDisabled
    ? '学習モードではこのゲートは使用できません'
    : type === 'CUSTOM'
      ? `左${TERMS.CLICK}: 詳細表示 | 右${TERMS.CLICK}: 真理値表表示 | ${TERMS.DOUBLE_CLICK}: 内部回路表示`
      : `左${TERMS.CLICK}: 詳細表示 | ${TERMS.DRAG}してキャンバスに${TERMS.PLACE}`;

  return (
    <div
      className={`tool-card ${isDisabled ? 'disabled' : ''} ${type === 'CUSTOM' ? 'custom-gate-card' : ''} ${isSelected ? 'selected' : ''}`}
      data-gate-type={type}
      data-testid={testId || `gate-${type}`}
      title={title}
      draggable={!isDisabled}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onContextMenu={onContextMenu}
      onDoubleClick={onDoubleClick}
      onClick={onClick}
      style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
    >
      <GateThumbnail type={type} customDefinition={customDefinition} />
      <div className="tool-label">{label}</div>
    </div>
  );
};

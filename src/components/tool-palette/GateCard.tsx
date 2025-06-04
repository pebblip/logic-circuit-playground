import React from 'react';
import type { GateType, CustomGateDefinition } from '@/types/circuit';
import { GateThumbnail } from './GateThumbnail';

interface GateCardProps {
  type: GateType | 'CUSTOM';
  label: string;
  customDefinition?: CustomGateDefinition;
  isDisabled?: boolean;
  onDragStart: (type: GateType | 'CUSTOM', customDefinition?: CustomGateDefinition) => void;
  onDragEnd: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  testId?: string;
}

export const GateCard: React.FC<GateCardProps> = ({
  type,
  label,
  customDefinition,
  isDisabled = false,
  onDragStart,
  onDragEnd,
  onContextMenu,
  testId,
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    if (!isDisabled && e.dataTransfer) {
      onDragStart(type, customDefinition);
      e.dataTransfer.effectAllowed = 'copy';

      // プレビュー画像を設定（透明な画像）
      const dragImage = new Image();
      dragImage.src = 'data:image/svg+xml,<svg></svg>';
      e.dataTransfer.setDragImage(dragImage, 0, 0);
    }
  };

  const title = isDisabled
    ? '学習モードではこのゲートは使用できません'
    : type === 'CUSTOM'
    ? '左クリック: 配置 | 右クリック: 真理値表表示'
    : 'ドラッグしてキャンバスに配置';

  return (
    <div
      className={`tool-card ${isDisabled ? 'disabled' : ''} ${type === 'CUSTOM' ? 'custom-gate-card' : ''}`}
      data-gate-type={type}
      data-testid={testId || `gate-${type}`}
      title={title}
      draggable={!isDisabled}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onContextMenu={onContextMenu}
      style={{ cursor: isDisabled ? 'not-allowed' : 'grab' }}
    >
      <GateThumbnail type={type} customDefinition={customDefinition} />
      <div className="tool-label">{label}</div>
    </div>
  );
};
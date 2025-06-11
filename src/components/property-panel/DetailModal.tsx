import React from 'react';
import type { Gate, CustomGateDefinition } from '@/types/circuit';
import { isCustomGate } from '@/types/gates';
import { GateDescription } from './GateDescription';

interface DetailModalProps {
  selectedGate?: Gate;
  gateType?: string;
  customGateDefinition?: CustomGateDefinition;
  showDetailModal: boolean;
  onClose: () => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  selectedGate,
  gateType,
  customGateDefinition,
  showDetailModal,
  onClose,
}) => {
  if (!showDetailModal) return null;

  // ゲートタイプを決定
  const displayGateType = gateType || selectedGate?.type;
  const customDef =
    customGateDefinition ||
    (selectedGate && isCustomGate(selectedGate)
      ? selectedGate.customGateDefinition
      : undefined);
  const displayName = customDef
    ? customDef.displayName
    : `${displayGateType}${displayGateType?.match(/^(INPUT|OUTPUT|CLOCK)$/) ? '' : 'ゲート'}`;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'var(--color-bg-overlay)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          borderRadius: 'var(--border-radius-lg)',
          width: '100%',
          maxWidth: 'var(--modal-width-md)',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid var(--color-border-subtle)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* ヘッダー */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--spacing-lg) var(--spacing-lg)',
            borderBottom: '1px solid var(--color-border-subtle)',
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 'var(--font-size-lg)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
            }}
          >
            <span style={{ color: 'var(--color-primary)' }}>📖</span>
            {displayName}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-tertiary)',
              fontSize: 'var(--font-size-xl)',
              cursor: 'pointer',
              padding: '0',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--border-radius-sm)',
              transition: 'var(--transition-base)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'var(--color-bg-glass)';
              e.currentTarget.style.color = 'var(--color-text-primary)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--color-text-tertiary)';
            }}
          >
            ×
          </button>
        </div>

        {/* コンテンツ */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'var(--spacing-lg)',
          }}
        >
          <GateDescription
            gateType={displayGateType || ''}
            customGateDefinition={customDef}
          />
        </div>
      </div>
    </div>
  );
};

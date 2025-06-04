import React from 'react';
import type { Gate } from '@/types/circuit';
import { isCustomGate } from '@/types/gates';
import { GateDescription } from './GateDescription';

interface DetailModalProps {
  selectedGate: Gate;
  showDetailModal: boolean;
  onClose: () => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  selectedGate,
  showDetailModal,
  onClose,
}) => {
  if (!showDetailModal) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#1a1a1a',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '2px solid rgba(0, 255, 136, 0.3)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* ヘッダー */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            backgroundColor: 'rgba(0, 255, 136, 0.05)',
            borderBottom: '1px solid rgba(0, 255, 136, 0.2)',
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: '600',
              color: '#00ff88',
            }}
          >
            📖{' '}
            {isCustomGate(selectedGate) && selectedGate.customGateDefinition
              ? selectedGate.customGateDefinition.displayName
              : `${selectedGate.type}ゲート`}{' '}
            の詳細説明
          </h2>
          <button
            onClick={e => {
              e.stopPropagation();
              e.preventDefault();
              onClose();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px',
              lineHeight: 1,
              borderRadius: '4px',
              transition: 'all 0.2s ease',
            }}
          >
            ×
          </button>
        </div>

        {/* コンテンツ */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '24px',
          }}
        >
          <GateDescription gateType={selectedGate.type} />
        </div>
      </div>
    </div>
  );
};

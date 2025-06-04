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
          background: 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #1a1f2e 100%)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '700px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid rgba(0, 255, 136, 0.3)',
          boxShadow: 
            '0 25px 80px rgba(0, 0, 0, 0.6), ' +
            '0 0 0 1px rgba(0, 255, 136, 0.2), ' +
            'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* ヘッダー */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '24px 32px',
            background: 'linear-gradient(90deg, rgba(0, 255, 136, 0.08) 0%, transparent 100%)',
            borderBottom: '1px solid rgba(0, 255, 136, 0.2)',
            borderRadius: '20px 20px 0 0',
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '22px',
              fontWeight: '700',
              background: 'linear-gradient(45deg, #00ff88, #00ffdd)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 20px rgba(0, 255, 136, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '24px' }}>📖</span>
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
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '12px',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255, 0, 100, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(255, 0, 100, 0.3)';
              e.currentTarget.style.color = '#ff0064';
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 0, 100, 0.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
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
            padding: '32px',
            background: 'rgba(0, 0, 0, 0.2)',
          }}
        >
          <GateDescription gateType={selectedGate.type} />
        </div>
      </div>
    </div>
  );
};

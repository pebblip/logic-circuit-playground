import React from 'react';
import { TruthTableDisplay } from '@/components/TruthTableDisplay';

interface TruthTableModalProps {
  showTruthTableModal: boolean;
  truthTableData: {
    gateId: string;
    gateType: string;
    truthTable: Record<string, string>;
    result?: any;
    inputNames?: string[];
    outputNames?: string[];
    gateName?: string;
  } | null;
  onClose: () => void;
}

export const TruthTableModal: React.FC<TruthTableModalProps> = ({
  showTruthTableModal,
  truthTableData,
  onClose,
}) => {
  if (!showTruthTableModal || !truthTableData) return null;

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
          padding: '24px',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '80vh',
          overflow: 'auto',
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
            marginBottom: '20px',
            paddingBottom: '12px',
            borderBottom: '1px solid rgba(0, 255, 136, 0.2)',
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
            🔬 {truthTableData.gateName} の真理値表
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

        {/* 真理値表表示 */}
        <TruthTableDisplay
          result={truthTableData.result}
          inputNames={truthTableData.inputNames || []}
          outputNames={truthTableData.outputNames || []}
        />
      </div>
    </div>
  );
};

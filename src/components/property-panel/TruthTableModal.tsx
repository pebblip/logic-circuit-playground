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
        {/* 真理値表表示 */}
        <TruthTableDisplay
          result={truthTableData.result}
          inputNames={truthTableData.inputNames || []}
          outputNames={truthTableData.outputNames || []}
          gateName={truthTableData.gateName || 'カスタムゲート'}
          onClose={onClose}
        />
      </div>
    </div>
  );
};

import React from 'react';
import type { Gate } from '@/types/circuit';
import { isCustomGate } from '@/types/gates';

interface ActionButtonsProps {
  selectedGate: Gate;
  onShowDetail: () => void;
  onShowTruthTable: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  selectedGate,
  onShowDetail,
  onShowTruthTable,
}) => {
  return (
    <div className="property-group">
      <div className="section-title">
        <span>📚</span>
        <span>学習リソース</span>
      </div>
      <div style={{ display: 'grid', gap: '8px' }}>
        <button
          onClick={onShowDetail}
          style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(0, 255, 136, 0.1)',
            border: '1px solid #00ff88',
            borderRadius: '8px',
            color: '#00ff88',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          📖 詳細説明を表示
        </button>

        {/* 基本ゲートとカスタムゲートのみ真理値表ボタン表示 */}
        {(['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR'].includes(
          selectedGate.type
        ) ||
          (isCustomGate(selectedGate) &&
            selectedGate.customGateDefinition?.truthTable)) && (
          <button
            onClick={onShowTruthTable}
            style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(255, 102, 153, 0.1)',
              border: '1px solid #ff6699',
              borderRadius: '8px',
              color: '#ff6699',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            📊 真理値表を表示
          </button>
        )}
      </div>
    </div>
  );
};

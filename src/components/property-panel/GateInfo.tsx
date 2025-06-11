import React from 'react';
import type { Gate, GateType } from '@/types/circuit';
import { isCustomGate } from '@/types/gates';
import {
  booleanToDisplayState,
  getGateInputsAsBoolean,
} from '@domain/simulation';

// ゲートタイプの表示名を取得
const getGateDisplayName = (type: GateType): string => {
  switch (type) {
    case 'INPUT':
      return '入力';
    case 'OUTPUT':
      return '出力';
    case 'CLOCK':
      return 'クロック';
    default:
      return `${type}ゲート`;
  }
};

interface GateInfoProps {
  selectedGate: Gate;
}

export const GateInfo: React.FC<GateInfoProps> = ({ selectedGate }) => {
  return (
    <>
      {/* ヘッダー */}
      <div className="property-group">
        <div className="section-title">
          <span>📝</span>
          <span>
            選択中:{' '}
            {isCustomGate(selectedGate) && selectedGate.customGateDefinition
              ? selectedGate.customGateDefinition.displayName
              : getGateDisplayName(selectedGate.type)}
          </span>
        </div>
      </div>

      {/* インスタンス情報 */}
      <div className="property-group">
        <div className="section-title">
          <span>🔧</span>
          <span>インスタンス情報</span>
        </div>
        <div className="property-row">
          <span className="property-label">ID</span>
          <span
            className="property-value"
            style={{ fontFamily: 'monospace', fontSize: '12px' }}
          >
            {selectedGate.id}
          </span>
        </div>
        <div className="property-row">
          <span className="property-label">位置</span>
          <span className="property-value">
            X: {Math.round(selectedGate.position.x)}, Y:{' '}
            {Math.round(selectedGate.position.y)}
          </span>
        </div>
        {/* 現在の状態表示 */}
        <div className="property-row">
          <span className="property-label">現在の状態</span>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              flex: 1,
              justifyContent: 'flex-end',
            }}
          >
            {/* 入力状態 */}
            {selectedGate.type !== 'INPUT' && selectedGate.type !== 'CLOCK' && (
              <div
                style={{
                  display: 'flex',
                  gap: '4px',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  入力:
                </span>
                {getGateInputsAsBoolean(selectedGate).map((input, index) => (
                  <span
                    key={index}
                    style={{
                      fontSize: '12px',
                      color: input ? '#00ff88' : 'rgba(255, 255, 255, 0.5)',
                      fontWeight: '600',
                    }}
                  >
                    {booleanToDisplayState(input)}
                  </span>
                ))}
              </div>
            )}
            {/* 矢印 */}
            {selectedGate.type !== 'INPUT' && selectedGate.type !== 'CLOCK' && (
              <span
                style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.4)',
                }}
              >
                →
              </span>
            )}
            {/* 出力状態 */}
            <span
              style={{
                fontSize: '12px',
                color: selectedGate.output
                  ? '#00ff88'
                  : 'rgba(255, 255, 255, 0.5)',
                fontWeight: '600',
              }}
            >
              出力: {booleanToDisplayState(selectedGate.output)}
            </span>
          </div>
        </div>
      </div>

    </>
  );
};

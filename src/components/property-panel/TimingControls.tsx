import React, { useState } from 'react';
import type { Gate } from '@/types/circuit';
import { DEFAULT_GATE_DELAYS } from '@/constants/gateDelays';

interface TimingControlsProps {
  selectedGate: Gate;
  updateGateTiming: (
    gateId: string,
    timing: Partial<{ propagationDelay: number }>
  ) => void;
}

/**
 * ゲートのタイミング設定を編集するコンポーネント
 */
export const TimingControls: React.FC<TimingControlsProps> = ({
  selectedGate,
  updateGateTiming,
}) => {
  const currentDelay = selectedGate.timing?.propagationDelay;
  const defaultDelay = DEFAULT_GATE_DELAYS[selectedGate.type] || 1.0;
  const isCustomDelay = currentDelay !== undefined;

  const [customValue, setCustomValue] = useState(
    isCustomDelay ? currentDelay.toString() : defaultDelay.toString()
  );

  // タイミング設定対象外のゲートは表示しない
  if (selectedGate.type === 'INPUT' || selectedGate.type === 'OUTPUT') {
    return null;
  }

  const handleDelayChange = (value: string) => {
    setCustomValue(value);
    const numericValue = parseFloat(value);

    if (!isNaN(numericValue) && numericValue >= 0) {
      updateGateTiming(selectedGate.id, {
        propagationDelay: numericValue,
      });
    }
  };

  const resetToDefault = () => {
    setCustomValue(defaultDelay.toString());
    // undefined を設定してデフォルト値にリセット
    updateGateTiming(selectedGate.id, {
      propagationDelay: undefined,
    });
  };

  return (
    <div className="property-group">
      <div className="section-title">
        <span>⏱️</span>
        <span>タイミング設定</span>
      </div>

      <div className="property-row">
        <span className="property-label">現在の遅延</span>
        <span className="property-value">
          {currentDelay !== undefined ? currentDelay : defaultDelay} ns
          {currentDelay === undefined && (
            <span style={{ opacity: 0.6, fontSize: '0.9em' }}>
              {' '}
              (デフォルト)
            </span>
          )}
        </span>
      </div>

      <div className="property-row">
        <span className="property-label">デフォルト遅延</span>
        <span className="property-value">{defaultDelay} ns</span>
      </div>

      <div style={{ marginTop: '12px' }}>
        <label
          htmlFor={`delay-input-${selectedGate.id}`}
          style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '0.9em',
            fontWeight: '500',
          }}
        >
          カスタム遅延値 (ns)
        </label>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            id={`delay-input-${selectedGate.id}`}
            type="number"
            min="0"
            max="1000"
            step="0.1"
            value={customValue}
            onChange={e => handleDelayChange(e.target.value)}
            style={{
              flex: 1,
              padding: '6px 8px',
              border: '1px solid var(--color-border)',
              borderRadius: '4px',
              backgroundColor: 'var(--color-bg-surface)',
              color: 'var(--color-text)',
              fontSize: '0.9em',
            }}
            placeholder={defaultDelay.toString()}
          />

          {isCustomDelay && (
            <button
              onClick={resetToDefault}
              style={{
                padding: '6px 12px',
                border: '1px solid var(--color-border)',
                borderRadius: '4px',
                backgroundColor: 'var(--color-bg-surface)',
                color: 'var(--color-text-secondary)',
                fontSize: '0.8em',
                cursor: 'pointer',
              }}
              title="デフォルト値にリセット"
            >
              リセット
            </button>
          )}
        </div>

        <div
          style={{
            marginTop: '6px',
            fontSize: '0.8em',
            color: 'var(--color-text-secondary)',
          }}
        >
          遅延モードON時に適用されます
        </div>
      </div>
    </div>
  );
};

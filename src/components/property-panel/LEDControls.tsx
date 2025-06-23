import React from 'react';
import type { Gate } from '@/types/circuit';
import { isLEDGate } from '@/types/gates';
import { useCircuitStore } from '@/stores/circuitStore';

interface LEDControlsProps {
  selectedGate: Gate;
}

export const LEDControls: React.FC<LEDControlsProps> = ({ selectedGate }) => {
  const { updateLEDGateData } = useCircuitStore();

  // LEDゲートでない場合は何も表示しない
  if (!isLEDGate(selectedGate)) {
    return null;
  }

  const ledData = selectedGate.gateData || { bitWidth: 4, displayMode: 'both' };

  const handleBitWidthChange = (newBitWidth: number) => {
    updateLEDGateData(selectedGate.id, {
      ...ledData,
      bitWidth: newBitWidth,
    });
  };

  const handleDisplayModeChange = (
    newDisplayMode: 'binary' | 'decimal' | 'both' | 'hex'
  ) => {
    updateLEDGateData(selectedGate.id, {
      ...ledData,
      displayMode: newDisplayMode,
    });
  };

  return (
    <div className="property-group">
      <div className="section-title">
        <span>💡</span>
        <span>LED表示設定</span>
      </div>

      {/* ピン数設定 */}
      <div className="property-row">
        <span className="property-label">ピン数</span>
        <select
          value={ledData.bitWidth}
          onChange={e => handleBitWidthChange(Number(e.target.value))}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '4px',
            color: 'white',
            padding: '4px 8px',
            fontSize: '12px',
          }}
        >
          {Array.from({ length: 16 }, (_, i) => i + 1).map(num => (
            <option key={num} value={num}>
              {num}bit
            </option>
          ))}
        </select>
      </div>

      {/* 表示モード設定 */}
      <div className="property-row">
        <span className="property-label">表示モード</span>
        <select
          value={ledData.displayMode}
          onChange={e =>
            handleDisplayModeChange(
              e.target.value as 'binary' | 'decimal' | 'both' | 'hex'
            )
          }
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '4px',
            color: 'white',
            padding: '4px 8px',
            fontSize: '12px',
          }}
        >
          <option value="decimal">10進数のみ</option>
          <option value="binary">2進数のみ</option>
          <option value="hex">16進数のみ</option>
          <option value="both">10進数 + 2進数</option>
        </select>
      </div>

      {/* 現在の表示値 */}
      <div className="property-row">
        <span className="property-label">現在の値</span>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            flex: 1,
            alignItems: 'flex-end',
          }}
        >
          {(ledData.displayMode === 'decimal' ||
            ledData.displayMode === 'both') && (
            <span
              style={{
                fontSize: '14px',
                color: '#00ff00',
                fontFamily: 'monospace',
                fontWeight: 'bold',
              }}
            >
              {selectedGate.inputs.reduce(
                (acc, bit, i) =>
                  acc +
                  (bit ? Math.pow(2, selectedGate.inputs.length - 1 - i) : 0),
                0
              )}
            </span>
          )}
          {(ledData.displayMode === 'binary' ||
            ledData.displayMode === 'both') && (
            <span
              style={{
                fontSize: '12px',
                color: '#88ff88',
                fontFamily: 'monospace',
              }}
            >
              [{selectedGate.inputs.map(bit => (bit ? '1' : '0')).join('')}]
            </span>
          )}
          {ledData.displayMode === 'hex' && (
            <span
              style={{
                fontSize: '14px',
                color: '#00ff88',
                fontFamily: 'monospace',
                fontWeight: 'bold',
              }}
            >
              0x
              {selectedGate.inputs
                .reduce(
                  (acc, bit, i) =>
                    acc +
                    (bit ? Math.pow(2, selectedGate.inputs.length - 1 - i) : 0),
                  0
                )
                .toString(16)
                .toUpperCase()
                .padStart(Math.ceil(ledData.bitWidth / 4), '0')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import type { Gate } from '@/types/circuit';
import { booleanToDisplayState } from '@domain/simulation';

interface ClockControlsProps {
  selectedGate: Gate;
  updateClockFrequency: (gateId: string, frequency: number) => void;
}

export const ClockControls: React.FC<ClockControlsProps> = ({
  selectedGate,
  updateClockFrequency,
}) => {
  if (selectedGate.type !== 'CLOCK') return null;

  return (
    <div className="property-group">
      <div className="section-title">
        <span>⏱️</span>
        <span>クロック設定</span>
      </div>
      <div className="property-row">
        <span className="property-label">現在の周波数</span>
        <span
          className="property-value"
          style={{ color: '#00ff88', fontWeight: '600' }}
        >
          {selectedGate.metadata?.frequency || 1} Hz
        </span>
      </div>
      <div style={{ marginTop: '12px' }}>
        <label
          style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.8)',
          }}
        >
          周波数を変更
        </label>
        <select
          value={selectedGate.metadata?.frequency || 1}
          onChange={e =>
            updateClockFrequency(selectedGate.id, Number(e.target.value))
          }
          style={{
            width: '100%',
            padding: '8px 12px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '6px',
            color: 'white',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <option value="0.5">0.5 Hz（2秒周期）</option>
          <option value="1">1 Hz（1秒周期）</option>
          <option value="2">2 Hz（0.5秒周期）</option>
          <option value="5">5 Hz（0.2秒周期）</option>
          <option value="10">10 Hz（0.1秒周期）</option>
          <option value="20">20 Hz（0.05秒周期）</option>
        </select>
      </div>
      <div
        style={{
          marginTop: '12px',
          padding: '12px',
          backgroundColor: 'rgba(0, 255, 136, 0.05)',
          border: '1px solid rgba(0, 255, 136, 0.2)',
          borderRadius: '6px',
          fontSize: '12px',
          lineHeight: '1.6',
        }}
      >
        <div
          style={{ fontWeight: '600', marginBottom: '4px', color: '#00ff88' }}
        >
          💡 周波数について
        </div>
        <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
          Hz（ヘルツ）は1秒間の切り替え回数を表します。
          <br />
          例：2Hzなら1秒間に2回、0.5秒ごとに0↔1を切り替えます。
        </div>
      </div>
      <div className="property-row" style={{ marginTop: '12px' }}>
        <span className="property-label">現在の出力</span>
        <span
          style={{
            fontSize: '14px',
            color: selectedGate.output ? '#00ff88' : 'rgba(255, 255, 255, 0.5)',
            fontWeight: '600',
          }}
        >
          {booleanToDisplayState(selectedGate.output)}
        </span>
      </div>
      <div className="property-row">
        <span className="property-label">実行状態</span>
        <span
          style={{
            fontSize: '14px',
            color: selectedGate.metadata?.isRunning ? '#00ff88' : '#ff6666',
            fontWeight: '600',
          }}
        >
          {selectedGate.metadata?.isRunning ? '⚡ 実行中' : '⏸️ 停止中'}
        </span>
      </div>
    </div>
  );
};

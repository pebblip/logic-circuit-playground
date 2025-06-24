import React from 'react';
import type { GalleryCircuit } from '../data/types';
import { TERMS } from '@/features/learning-mode/data/terms';
import './GalleryDetailPanel.css';

interface GalleryDetailPanelProps {
  circuit: GalleryCircuit;
}

export const GalleryDetailPanel: React.FC<GalleryDetailPanelProps> = ({
  circuit,
}) => {
  // 真理値表を生成（単純な回路のみ）
  const canShowTruthTable =
    circuit.gates.length <= 10 &&
    !['oscillator', 'latch', 'counter', 'chaos', 'memory', 'mandala'].some(
      keyword => circuit.id.includes(keyword)
    );

  return (
    <div className="gallery-detail-panel">
      <div className="detail-header">
        <h2>{circuit.title}</h2>
        <div className="circuit-tags">
          {circuit.gates.length < 5 && <span className="tag basic">基本</span>}
          {circuit.gates.length >= 5 && circuit.gates.length < 15 && (
            <span className="tag intermediate">中級</span>
          )}
          {circuit.gates.length >= 15 && (
            <span className="tag advanced">上級</span>
          )}
          {circuit.id.includes('oscillator') ||
          circuit.id.includes('latch') ||
          circuit.id.includes('counter') ||
          circuit.id.includes('chaos') ||
          circuit.id.includes('memory') ||
          circuit.id.includes('mandala') ? (
            <span className="tag cyclical">循環</span>
          ) : null}
        </div>
      </div>

      <div className="detail-description">
        <p>{circuit.description}</p>
      </div>

      <div className="detail-stats">
        <h3>回路情報</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">ゲート数</span>
            <span className="stat-value">{circuit.gates.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">接続線</span>
            <span className="stat-value">{circuit.wires.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">{TERMS.INPUT}数</span>
            <span className="stat-value">
              {circuit.gates.filter(g => g.type === 'INPUT').length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">{TERMS.OUTPUT}数</span>
            <span className="stat-value">
              {circuit.gates.filter(g => g.type === 'OUTPUT').length}
            </span>
          </div>
        </div>
      </div>

      <div className="detail-gates">
        <h3>使用ゲート</h3>
        <div className="gate-types">
          {Array.from(new Set(circuit.gates.map(g => g.type))).map(type => (
            <span key={type} className="gate-type">
              {type}
            </span>
          ))}
        </div>
      </div>

      <div className="detail-actions">
        {canShowTruthTable && (
          <button className="action-button primary">📊 真理値表を表示</button>
        )}
      </div>

      {/* 注意事項 */}
      {(circuit.id.includes('oscillator') ||
        circuit.id.includes('latch') ||
        circuit.id.includes('counter') ||
        circuit.id.includes('chaos') ||
        circuit.id.includes('memory') ||
        circuit.id.includes('mandala')) && (
        <div className="detail-notice" data-testid="cyclical-warning">
          <h4 data-testid="notice-title">⚠️ 注意事項</h4>
          <p data-testid="cyclical-warning-text">
            この回路は循環構造を持つため、現在のシミュレーションエンジンでは
            完全な動作を再現できない場合があります。
            将来のアップデートで改善予定です。
          </p>
        </div>
      )}
    </div>
  );
};

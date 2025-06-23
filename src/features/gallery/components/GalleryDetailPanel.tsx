import React from 'react';
import type { GalleryCircuit } from '../data/types';
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
            <span className="stat-label">入力数</span>
            <span className="stat-value">
              {circuit.gates.filter(g => g.type === 'INPUT').length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">出力数</span>
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

      {/* 学習ポイント */}
      <div className="detail-learning">
        <h3>🎯 学習ポイント</h3>
        <ul>
          {circuit.id === 'half-adder' && (
            <>
              <li>XORゲートとANDゲートの組み合わせ</li>
              <li>2進数の加算の基礎</li>
              <li>デジタル演算回路の入門</li>
            </>
          )}
          {circuit.id === 'sr-latch' && (
            <>
              <li>専用SR-LATCHゲートの使い方</li>
              <li>メモリ素子の基本動作</li>
              <li>セット・リセット機能</li>
            </>
          )}
          {circuit.id === 'decoder' && (
            <>
              <li>バイナリデコーダーの原理</li>
              <li>選択信号による出力制御</li>
              <li>アドレスデコーディング</li>
            </>
          )}
          {circuit.id === 'comparator-4bit' && (
            <>
              <li>多ビット比較の実装</li>
              <li>階層的な論理設計</li>
              <li>実用的なデジタル回路</li>
            </>
          )}
          {circuit.id.includes('oscillator') && (
            <>
              <li>フィードバックループ</li>
              <li>発振回路の原理</li>
              <li>タイミング生成</li>
            </>
          )}
          {circuit.id.includes('counter') && (
            <>
              <li>順序回路の設計</li>
              <li>状態遷移の理解</li>
              <li>カウンタ回路の応用</li>
            </>
          )}
        </ul>
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

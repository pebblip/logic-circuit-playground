import React from 'react';
import type { CircuitMetadata } from '../data/gallery';
import { FEATURED_CIRCUITS } from '../data/gallery';
import './GalleryListPanel.css';

interface GalleryListPanelProps {
  selectedCircuit: CircuitMetadata | null;
  onSelectCircuit: (circuit: CircuitMetadata) => void;
}

export const GalleryListPanel: React.FC<GalleryListPanelProps> = ({
  selectedCircuit,
  onSelectCircuit,
}) => {
  // カテゴリ別に回路を分類
  const circuitCategories = {
    basic: FEATURED_CIRCUITS.filter(circuit =>
      ['half-adder', 'sr-latch', 'decoder'].includes(circuit.id)
    ),
    advanced: FEATURED_CIRCUITS.filter(circuit =>
      [
        '4bit-comparator',
        'parity-checker',
        'majority-voter',
        'seven-segment',
      ].includes(circuit.id)
    ),
    cyclical: FEATURED_CIRCUITS.filter(circuit =>
      [
        'sr-latch-basic',
        'simple-ring-oscillator',
        'simple-lfsr',
        'chaos-generator',
        'fibonacci-counter',
        'johnson-counter',
        'self-oscillating-memory-simple',
        'mandala-circuit',
      ].includes(circuit.id)
    ),
  };

  return (
    <div className="gallery-list-panel">
      <div className="gallery-list-header">
        <h2 data-testid="gallery-header">📚 回路ギャラリー</h2>
        <p>回路を選択して詳細を表示</p>
      </div>

      <div className="gallery-list-content">
        {/* 🔧 基本回路 */}
        <div className="gallery-category" data-testid="gallery-category-basic">
          <h3 className="category-title" data-testid="category-title-basic">
            🔧 基本回路
          </h3>
          <div className="circuit-list">
            {circuitCategories.basic.map(circuit => (
              <button
                key={circuit.id}
                data-testid={`gallery-circuit-${circuit.id}`}
                className={`circuit-item ${selectedCircuit?.id === circuit.id ? 'selected' : ''}`}
                onClick={() => onSelectCircuit(circuit)}
              >
                <span className="circuit-name">{circuit.title}</span>
                <span className="circuit-gate-count">
                  {circuit.gates.length}ゲート
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ⚡ 高度回路 */}
        <div
          className="gallery-category"
          data-testid="gallery-category-advanced"
        >
          <h3 className="category-title" data-testid="category-title-advanced">
            ⚡ 高度回路
          </h3>
          <div className="circuit-list">
            {circuitCategories.advanced.map(circuit => (
              <button
                key={circuit.id}
                data-testid={`gallery-circuit-${circuit.id}`}
                className={`circuit-item ${selectedCircuit?.id === circuit.id ? 'selected' : ''}`}
                onClick={() => onSelectCircuit(circuit)}
              >
                <span className="circuit-name">{circuit.title}</span>
                <span className="circuit-gate-count">
                  {circuit.gates.length}ゲート
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 🌀 循環回路 */}
        <div
          className="gallery-category"
          data-testid="gallery-category-cyclical"
        >
          <h3 className="category-title" data-testid="category-title-cyclical">
            🌀 循環回路
          </h3>
          <div className="circuit-list">
            {circuitCategories.cyclical.map(circuit => (
              <button
                key={circuit.id}
                data-testid={`gallery-circuit-${circuit.id}`}
                className={`circuit-item cyclical ${selectedCircuit?.id === circuit.id ? 'selected' : ''}`}
                onClick={() => onSelectCircuit(circuit)}
              >
                <span className="circuit-name">{circuit.title}</span>
                <span className="circuit-gate-count">
                  {circuit.gates.length}ゲート
                </span>
                <span className="circuit-badge">実験的</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

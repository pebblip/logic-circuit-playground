import React from 'react';
import type { CircuitMetadata } from '../data/gallery';
import { FEATURED_CIRCUITS } from '../data/gallery';
import { useCircuitStore } from '../../../stores/circuitStore';
import './GalleryPanel.css';

interface GalleryPanelProps {
  isVisible: boolean;
}

export const GalleryPanel: React.FC<GalleryPanelProps> = ({ isVisible }) => {
  const { clearAll, setAppMode } = useCircuitStore();

  // 回路を読み込んで自由制作モードで開く
  const handleLoadCircuit = (circuit: CircuitMetadata) => {
    clearAll();
    
    // ストアに直接回路データを設定
    useCircuitStore.setState({
      gates: circuit.gates.map(gate => ({ ...gate })),
      wires: circuit.wires.map(wire => ({ ...wire })),
      selectedGateId: null,
      isDrawingWire: false,
      wireStart: null,
    });

    // フリーモードに切り替え
    setAppMode('フリーモード');
  };

  if (!isVisible) return null;

  return (
    <div className="gallery-panel">
      <div className="gallery-header">
        <h1>🎨 回路ギャラリー</h1>
        <p className="gallery-subtitle">すごい回路を体験しよう！</p>
      </div>

      <div className="circuits-grid">
        {FEATURED_CIRCUITS.map(circuit => (
          <div key={circuit.id} className="circuit-card">
            <h3 className="circuit-title">{circuit.title}</h3>
            <p className="circuit-description">{circuit.description}</p>
            
            {(circuit.id === 'binary-counter' || circuit.id === 'decoder') && (
              <div className="circuit-highlight">
                ⭐ おすすめ！{circuit.id === 'binary-counter' ? 'クロック同期のカウンタ動作を体験' : 'バイナリコードを選択信号に変換'}
              </div>
            )}
            
            <button
              className="load-button"
              onClick={() => handleLoadCircuit(circuit)}
            >
              開いて試す →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
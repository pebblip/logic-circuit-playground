import React, { useState } from 'react';
import { CircuitMetadata } from '../data/gallery';
import { GalleryListPanel } from './GalleryListPanel';
import { GalleryCanvas } from './GalleryCanvas';
import { GalleryDetailPanel } from './GalleryDetailPanel';
import './GalleryModeLayout.css';

export const GalleryModeLayout: React.FC = () => {
  const [selectedCircuit, setSelectedCircuit] = useState<CircuitMetadata | null>(null);

  return (
    <div className="gallery-mode-layout">
      {/* 左サイドバー: ギャラリーリスト */}
      <aside className="gallery-sidebar-left">
        <GalleryListPanel
          selectedCircuit={selectedCircuit}
          onSelectCircuit={setSelectedCircuit}
        />
      </aside>

      {/* 中央: 読み取り専用キャンバス */}
      <main className="gallery-main-canvas">
        <GalleryCanvas circuit={selectedCircuit} />
      </main>

      {/* 右サイドバー: 回路詳細 */}
      <aside className="gallery-sidebar-right" style={{ display: selectedCircuit ? 'block' : 'none' }}>
        {selectedCircuit && <GalleryDetailPanel circuit={selectedCircuit} />}
      </aside>
    </div>
  );
};
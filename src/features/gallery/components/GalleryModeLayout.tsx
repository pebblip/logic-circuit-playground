import React, { useState } from 'react';
import { CircuitMetadata } from '../data/gallery';
import { GalleryListPanel } from './GalleryListPanel';
import { UnifiedCanvas } from '@/components/canvas/UnifiedCanvas';
import { CANVAS_MODE_PRESETS } from '@/components/canvas/types/canvasTypes';
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
        <UnifiedCanvas 
          config={CANVAS_MODE_PRESETS.gallery}
          dataSource={{ galleryCircuit: selectedCircuit || undefined }}
        />
      </main>

      {/* 右サイドバー: 回路詳細 */}
      <aside className="gallery-sidebar-right" style={{ display: selectedCircuit ? 'block' : 'none' }}>
        {selectedCircuit && <GalleryDetailPanel circuit={selectedCircuit} />}
      </aside>
    </div>
  );
};
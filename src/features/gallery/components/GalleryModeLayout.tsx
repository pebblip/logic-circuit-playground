import React, { useState, useEffect } from 'react';
import type { GalleryCircuit } from '../data/types';
import { FEATURED_CIRCUITS } from '../data';
import { GalleryListPanel } from './GalleryListPanel';
import { Canvas } from '@/components/canvas/Canvas';
import { CANVAS_MODE_PRESETS } from '@/components/canvas/types/canvasTypes';
import { GalleryDetailPanel } from './GalleryDetailPanel';
import './GalleryModeLayout.css';

export const GalleryModeLayout: React.FC = () => {
  const [selectedCircuit, setSelectedCircuit] = useState<GalleryCircuit | null>(
    null
  );

  // 初朝選択: 最初の回路を自動選択
  useEffect(() => {
    if (!selectedCircuit && FEATURED_CIRCUITS.length > 0) {
      setSelectedCircuit(FEATURED_CIRCUITS[0]);
    }
  }, [selectedCircuit]);

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
        <Canvas
          config={{
            ...CANVAS_MODE_PRESETS.gallery,
            galleryOptions: {
              ...CANVAS_MODE_PRESETS.gallery.galleryOptions,
              // 🔧 autoSimulationを明示的に強制有効化
              autoSimulation: true,
              // 回路の個別設定を優先
              animationInterval:
                selectedCircuit?.simulationConfig?.updateInterval ||
                CANVAS_MODE_PRESETS.gallery.galleryOptions?.animationInterval ||
                1000,
              // デバッグ情報を無効化
              showDebugInfo: false,
              // 自動フィット機能を無効化（サイズ一貫性確保）
              autoFit: false,
              autoFitPadding: 80,
            },
          }}
          dataSource={{ galleryCircuit: selectedCircuit || undefined }}
        />
      </main>

      {/* 右サイドバー: 回路詳細 */}
      <aside
        className="gallery-sidebar-right"
        style={{ display: selectedCircuit ? 'block' : 'none' }}
      >
        {selectedCircuit && <GalleryDetailPanel circuit={selectedCircuit} />}
      </aside>
    </div>
  );
};

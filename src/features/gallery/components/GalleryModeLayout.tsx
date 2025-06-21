import React, { useState, useEffect } from 'react';
import { CircuitMetadata, FEATURED_CIRCUITS } from '../data/gallery';
import { GalleryListPanel } from './GalleryListPanel';
import { UnifiedCanvas } from '@/components/canvas/UnifiedCanvas';
import { CANVAS_MODE_PRESETS } from '@/components/canvas/types/canvasTypes';
import { GalleryDetailPanel } from './GalleryDetailPanel';
import { DebugLogDisplay } from '@/components/debug/DebugLogDisplay';
import './GalleryModeLayout.css';

export const GalleryModeLayout: React.FC = () => {
  const [selectedCircuit, setSelectedCircuit] = useState<CircuitMetadata | null>(null);
  
  // 初朝選択: 最初の回路を自動選択
  useEffect(() => {
    if (!selectedCircuit && FEATURED_CIRCUITS.length > 0) {
      setSelectedCircuit(FEATURED_CIRCUITS[0]);
    }
  }, [selectedCircuit]);
  
  // デバッグ: 選択された回路の設定をログ出力
  useEffect(() => {
    if (import.meta.env.DEV && selectedCircuit) {
      console.log('[GalleryMode] Selected circuit:', selectedCircuit.id);
      console.log('[GalleryMode] Update interval:', selectedCircuit.simulationConfig?.updateInterval || 'default');
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
        <UnifiedCanvas 
          config={{
            ...CANVAS_MODE_PRESETS.gallery,
            galleryOptions: {
              ...CANVAS_MODE_PRESETS.gallery.galleryOptions,
              // 🔧 autoSimulationを明示的に強制有効化
              autoSimulation: true,
              // 回路の個別設定を優先
              animationInterval: selectedCircuit?.simulationConfig?.updateInterval || 
                CANVAS_MODE_PRESETS.gallery.galleryOptions?.animationInterval || 
                1000,
              // 🔍 デバッグ情報を一時的に有効化
              showDebugInfo: false,
              // 🎯 自動フィット機能を有効化
              autoFit: true,
              autoFitPadding: 80,
            },
          }}
          dataSource={{ galleryCircuit: selectedCircuit || undefined }}
        />
      </main>

      {/* 右サイドバー: 回路詳細 */}
      <aside className="gallery-sidebar-right" style={{ display: selectedCircuit ? 'block' : 'none' }}>
        {selectedCircuit && <GalleryDetailPanel circuit={selectedCircuit} />}
      </aside>

      {/* 🔍 デバッグログ表示（開発環境のみ） */}
      {import.meta.env.DEV && (
        <DebugLogDisplay 
          isEnabled={true}
          position="bottom-right"
          maxLogs={15}
        />
      )}
    </div>
  );
};
import React, { useState } from 'react';
import { Canvas } from '../Canvas';
import { MobileToolbar } from './MobileToolbar';
import { MobileHeader } from './MobileHeader';
import { FloatingActionButtons } from './FloatingActionButtons';
import { FloatingLearningPanel } from '../../features/learning-mode/ui/FloatingLearningPanel';
import { MobileWarningBanner } from '../MobileWarningBanner';
import { useCircuitStore } from '../../stores/circuitStore';
import '../../styles/mobile-layout.css';

interface MobileLayoutProps {
  children?: React.ReactNode;
}

export const MobileLayout: React.FC<MobileLayoutProps> = () => {
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    'basic' | 'special' | 'io' | 'custom'
  >('basic');
  const [isPipLearningOpen, setIsPipLearningOpen] = useState(false);
  const { appMode, setAppMode } = useCircuitStore();

  return (
    <div className="mobile-layout">
      <MobileWarningBanner />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          paddingTop: '60px', // 警告バナーの高さを考慮
        }}
      >
        <MobileHeader />

      {/* モード選択（オプション） */}
      <div className="mobile-mode-selector">
        <button
          className={`mode-button ${isPipLearningOpen ? 'active' : ''}`}
          onClick={() => setIsPipLearningOpen(true)}
        >
          学習
        </button>
        <button
          className={`mode-button ${appMode === 'フリーモード' && !isPipLearningOpen ? 'active' : ''}`}
          onClick={() => {
            setAppMode('フリーモード');
            setIsPipLearningOpen(false);
          }}
        >
          自由
        </button>
        <button
          className={`mode-button ${appMode === 'パズルモード' ? 'active' : ''}`}
          onClick={() => {
            setAppMode('パズルモード');
            setIsPipLearningOpen(false);
          }}
        >
          パズル
        </button>
      </div>

      {/* キャンバスコンテナ */}
      <div className="mobile-canvas-container">
        <Canvas />
      </div>

      {/* フローティングアクションボタン */}
      <FloatingActionButtons />

      {/* ボトムツールバー */}
      <MobileToolbar
        isOpen={isToolbarOpen}
        onToggle={() => setIsToolbarOpen(!isToolbarOpen)}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

        {/* Picture-in-Picture学習パネル（モバイル対応） */}
        <FloatingLearningPanel
          isOpen={isPipLearningOpen}
          onClose={() => setIsPipLearningOpen(false)}
        />
      </div>
    </div>
  );
};

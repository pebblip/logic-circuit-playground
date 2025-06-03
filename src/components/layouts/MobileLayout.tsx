import React, { useState } from 'react';
import { Canvas } from '../Canvas';
import { MobileToolbar } from './MobileToolbar';
import { MobileHeader } from './MobileHeader';
import { FloatingActionButtons } from './FloatingActionButtons';
import '../../styles/mobile-layout.css';

interface MobileLayoutProps {
  children?: React.ReactNode;
}

export const MobileLayout: React.FC<MobileLayoutProps> = () => {
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    'basic' | 'special' | 'io' | 'custom'
  >('basic');

  return (
    <div className="mobile-layout">
      <MobileHeader />

      {/* モード選択（オプション） */}
      <div className="mobile-mode-selector">
        <button className="mode-button active">学習</button>
        <button className="mode-button">自由</button>
        <button className="mode-button">パズル</button>
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
    </div>
  );
};

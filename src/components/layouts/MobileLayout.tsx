import React, { useState } from 'react';
import { MobileCanvas } from '../MobileCanvas';
import { MobileToolbar } from './MobileToolbar';
import '../../styles/mobile-layout.css';

interface MobileLayoutProps {
  children?: React.ReactNode;
}

export const MobileLayout: React.FC<MobileLayoutProps> = () => {
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    'basic' | 'io' | 'special' | 'custom'
  >('basic');

  return (
    <div className="mobile-layout">
      {/* 未完成警告バナー */}
      <div className="mobile-warning-banner">
        <span className="warning-text">
          ⚠️ モバイル版は開発中です - UI/UXが未完成の状態です
        </span>
      </div>
      
      {/* キャンバス */}
      <div className="mobile-canvas-container">
        <MobileCanvas />
      </div>

      {/* ミニマルなタイトルバー */}
      <div className="mobile-titlebar">
        <span className="mobile-title">LogiCirc</span>
      </div>

      {/* シンプルなボトムツールバー */}
      <MobileToolbar
        isOpen={isToolbarOpen}
        onToggle={() => setIsToolbarOpen(!isToolbarOpen)}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
    </div>
  );
};

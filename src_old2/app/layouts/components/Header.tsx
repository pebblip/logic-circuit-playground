import React from 'react';
import { useCircuitStore } from '../../../features/circuit-editor/model/stores/circuitStore';
import { AppMode } from '../../../entities/types/mode';

interface HeaderProps {
  className?: string;
}

/**
 * PC/タブレット用ヘッダー
 */
export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const { mode, setMode } = useCircuitStore();

  return (
    <header className={`header ${className}`}>
      {/* ロゴ */}
      <div className="logo">
        論理回路プレイグラウンド
      </div>
      
      {/* モードタブ */}
      <div className="mode-tabs">
        <button 
          className={`mode-tab ${mode === 'learning' ? 'active' : ''}`}
          onClick={() => setMode('learning')}
        >
          学習モード
        </button>
        <button 
          className={`mode-tab ${mode === 'free' ? 'active' : ''}`}
          onClick={() => setMode('free')}
        >
          自由制作
        </button>
        <button 
          className={`mode-tab ${mode === 'puzzle' ? 'active' : ''}`}
          onClick={() => setMode('puzzle')}
        >
          パズル・チャレンジ
        </button>
      </div>
      
      {/* アクションボタン */}
      <div className="header-actions">
        <button className="button">
          <span>💾</span>
          <span>保存</span>
        </button>
        <button className="button">
          <span>📤</span>
          <span>共有</span>
        </button>
        <button className="button primary">
          <span>▶️</span>
          <span>実行</span>
        </button>
      </div>
    </header>
  );
};



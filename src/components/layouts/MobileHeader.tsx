import React from 'react';

export const MobileHeader: React.FC = () => {
  return (
    <header className="mobile-header">
      <h1 className="mobile-header-title">論理回路</h1>
      <div className="mobile-header-actions">
        <button className="icon-button" title="保存">💾</button>
        <button className="icon-button" title="エクスポート">📤</button>
        <button className="icon-button" title="設定">⚙️</button>
      </div>
    </header>
  );
};
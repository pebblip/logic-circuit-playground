import React, { useState } from 'react';
import { SaveCircuitDialog } from './dialogs/SaveCircuitDialog';
import { LoadCircuitDialog } from './dialogs/LoadCircuitDialog';
import { ExportImportDialog } from './dialogs/ExportImportDialog';

export const Header: React.FC = () => {
  const [activeMode, setActiveMode] = useState('学習モード');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const handleSaveSuccess = () => {
    console.log('✅ 回路が保存されました');
  };

  const handleLoadSuccess = () => {
    console.log('✅ 回路が読み込まれました');
  };

  const handleExportSuccess = () => {
    console.log('✅ 回路がエクスポートされました');
  };

  const handleShare = () => {
    console.log('🔗 回路を共有');
  };

  return (
    <>
      <header className="header">
        <div className="logo">論理回路プレイグラウンド</div>
        
        <div className="mode-tabs">
          <button 
            className={`mode-tab ${activeMode === '学習モード' ? 'active' : ''}`}
            onClick={() => setActiveMode('学習モード')}
          >
            学習モード
          </button>
          <button 
            className={`mode-tab ${activeMode === '自由制作' ? 'active' : ''}`}
            onClick={() => setActiveMode('自由制作')}
          >
            自由制作
          </button>
          <button 
            className={`mode-tab ${activeMode === 'パズル・チャレンジ' ? 'active' : ''}`}
            onClick={() => setActiveMode('パズル・チャレンジ')}
          >
            パズル・チャレンジ
          </button>
        </div>
        
        <div className="header-actions">
          <button 
            className="button"
            onClick={() => setLoadDialogOpen(true)}
            title="回路を読み込み"
          >
            <span>📂</span>
            <span>開く</span>
          </button>
          <button 
            className="button"
            onClick={() => setSaveDialogOpen(true)}
            title="回路を保存"
          >
            <span>💾</span>
            <span>保存</span>
          </button>
          <button 
            className="button"
            onClick={handleShare}
            title="回路を共有"
          >
            <span>📤</span>
            <span>共有</span>
          </button>
        </div>
      </header>

      {/* ダイアログ */}
      <SaveCircuitDialog
        isOpen={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        onSuccess={handleSaveSuccess}
      />
      
      <LoadCircuitDialog
        isOpen={loadDialogOpen}
        onClose={() => setLoadDialogOpen(false)}
        onLoad={handleLoadSuccess}
      />
      
      <ExportImportDialog
        isOpen={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        mode="export"
        onSuccess={handleExportSuccess}
      />
    </>
  );
};
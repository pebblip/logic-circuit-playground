import React, { useState } from 'react';
import { SaveCircuitDialog } from './dialogs/SaveCircuitDialog';
import { LoadCircuitDialog } from './dialogs/LoadCircuitDialog';
import { ExportImportDialog } from './dialogs/ExportImportDialog';
import { HelpPanel } from './HelpPanel';
import { useCircuitStore } from '../stores/circuitStore';

interface HeaderProps {
  activeMode: string;
  onModeChange: (mode: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeMode, onModeChange }) => {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [helpPanelOpen, setHelpPanelOpen] = useState(false);
  
  const { gates } = useCircuitStore();

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

  const handleFormatCircuit = async () => {
    if (gates.length === 0) {
      console.log('⚠️ 整形する回路がありません');
      return;
    }
    
    // TODO: 回路整形機能は後で実装
    console.log('✨ 回路整形機能は準備中です');
  };

  return (
    <>
      <header className="header">
        <div className="logo">論理回路プレイグラウンド</div>
        
        <div className="mode-tabs">
          <button 
            className={`mode-tab ${activeMode === '学習モード' ? 'active' : ''}`}
            onClick={() => onModeChange('学習モード')}
          >
            学習モード
          </button>
          <button 
            className={`mode-tab ${activeMode === '自由制作' ? 'active' : ''}`}
            onClick={() => onModeChange('自由制作')}
          >
            自由制作
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
            className="button help-button"
            onClick={() => setHelpPanelOpen(true)}
            title="ヘルプ"
          >
            <span>❓</span>
            <span>ヘルプ</span>
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
      
      <HelpPanel
        isOpen={helpPanelOpen}
        onClose={() => setHelpPanelOpen(false)}
      />
    </>
  );
};
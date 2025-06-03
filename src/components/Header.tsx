import React from 'react';
import { SaveCircuitDialog } from './dialogs/SaveCircuitDialog';
import { LoadCircuitDialog } from './dialogs/LoadCircuitDialog';
import { ExportImportDialog } from './dialogs/ExportImportDialog';
import { HelpPanel } from './HelpPanel';
import { useCircuitStore } from '../stores/circuitStore';
import { AppMode } from '../types/appMode';
import { useMultipleDialogs } from '../hooks/useDialog';

interface HeaderProps {
  activeMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeMode, onModeChange }) => {
  const { gates } = useCircuitStore();
  
  // 統一ダイアログ管理
  const dialogs = useMultipleDialogs({
    save: {
      onOpen: () => console.log('💾 Save dialog opened'),
      onClose: () => console.log('💾 Save dialog closed')
    },
    load: {
      onOpen: () => console.log('📂 Load dialog opened'),
      onClose: () => console.log('📂 Load dialog closed')
    },
    export: {
      onOpen: () => console.log('📤 Export dialog opened'),
      onClose: () => console.log('📤 Export dialog closed')
    },
    help: {
      onOpen: () => console.log('❓ Help panel opened'),
      onClose: () => console.log('❓ Help panel closed')
    }
  });

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
            onClick={() => dialogs.load.open()}
            title="回路を読み込み"
          >
            <span>📂</span>
            <span>開く</span>
          </button>
          <button 
            className="button"
            onClick={() => dialogs.save.open()}
            title="回路を保存"
          >
            <span>💾</span>
            <span>保存</span>
          </button>
          <button 
            className="button help-button"
            onClick={() => dialogs.help.open()}
            title="ヘルプ"
          >
            <span>❓</span>
            <span>ヘルプ</span>
          </button>
        </div>
      </header>

      {/* ダイアログ - 統一管理 */}
      <SaveCircuitDialog
        isOpen={dialogs.save.isOpen}
        onClose={dialogs.save.close}
        onSuccess={handleSaveSuccess}
      />
      
      <LoadCircuitDialog
        isOpen={dialogs.load.isOpen}
        onClose={dialogs.load.close}
        onLoad={handleLoadSuccess}
      />
      
      <ExportImportDialog
        isOpen={dialogs.export.isOpen}
        onClose={dialogs.export.close}
        mode="export"
        onSuccess={handleExportSuccess}
      />
      
      <HelpPanel
        isOpen={dialogs.help.isOpen}
        onClose={dialogs.help.close}
      />
    </>
  );
};
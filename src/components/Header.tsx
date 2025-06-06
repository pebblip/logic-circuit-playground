import React from 'react';
import { SaveCircuitDialog } from './dialogs/SaveCircuitDialog';
import { LoadCircuitDialog } from './dialogs/LoadCircuitDialog';
import { ExportImportDialog } from './dialogs/ExportImportDialog';
import { CreateCustomGateDialog } from './dialogs/CreateCustomGateDialog';
import { HelpPanel } from './HelpPanel';
import { useCircuitStore } from '../stores/circuitStore';
import type { AppMode } from '../types/appMode';
import type { CustomGateDefinition } from '../types/circuit';
import { useMultipleDialogs } from '../hooks/useDialog';

interface HeaderProps {
  activeMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeMode, onModeChange }) => {
  const {
    gates,
    wires: _wires,
    addCustomGate,
    isLearningMode,
  } = useCircuitStore();

  // 統一ダイアログ管理
  const dialogs = useMultipleDialogs({
    save: {},
    load: {},
    export: {},
    help: {},
    customGate: {},
  });

  const handleSaveSuccess = () => {
    // 保存成功時の処理
    console.log('✅ 回路が保存されました');
  };

  const handleLoadSuccess = () => {
    // 読み込み成功時の処理
    console.log('✅ 回路が読み込まれました');
  };

  const handleExportSuccess = () => {
    // エクスポート成功時の処理
    console.log('✅ 回路がエクスポートされました');
  };

  const _handleShare = () => {
    // 回路共有機能は後で実装
  };

  const _handleFormatCircuit = async () => {
    if (gates.length === 0) {
      return;
    }

    // TODO: 回路整形機能は後で実装
  };

  // 回路からカスタムゲート作成
  const [customGateDialogData, setCustomGateDialogData] = React.useState<{
    initialInputs: any[];
    initialOutputs: any[];
    isReadOnly: boolean;
  }>({
    initialInputs: [],
    initialOutputs: [],
    isReadOnly: false,
  });

  const handleCreateCustomGateFromCircuit = () => {
    const inputGates = gates.filter(g => g.type === 'INPUT');
    const outputGates = gates.filter(g => g.type === 'OUTPUT');

    if (inputGates.length === 0 || outputGates.length === 0) {
      alert('回路にはINPUTゲートとOUTPUTゲートが必要です');
      return;
    }

    // 回路から検出されたピン情報を作成
    const initialInputs = inputGates.map((gate, index) => ({
      name: `IN${index + 1}`,
      index,
      gateId: gate.id,
    }));

    const initialOutputs = outputGates.map((gate, index) => ({
      name: `OUT${index + 1}`,
      index,
      gateId: gate.id,
    }));

    const newData = {
      initialInputs,
      initialOutputs,
      isReadOnly: true, // 回路から作成する場合はピン編集を無効化
    };

    console.log('=== Header: Setting customGateDialogData ===');
    console.log('newData:', newData);

    setCustomGateDialogData(newData);
    dialogs.customGate.open();
  };

  const handleCustomGateCreate = (definition: CustomGateDefinition) => {
    addCustomGate(definition);
    dialogs.customGate.close();
    console.log('✅ カスタムゲートが作成されました');

    // ダイアログを閉じる際にデータをリセット
    setCustomGateDialogData({
      initialInputs: [],
      initialOutputs: [],
      isReadOnly: false,
    });
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
          {!isLearningMode && (
            <>
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
                className="button"
                onClick={handleCreateCustomGateFromCircuit}
                title="現在の回路からカスタムゲートを作成"
              >
                <span>📦</span>
                <span>回路→IC</span>
              </button>
            </>
          )}
          {isLearningMode && (
            <span
              style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '14px',
                marginRight: '12px',
              }}
            >
              学習モード中
            </span>
          )}
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

      <HelpPanel isOpen={dialogs.help.isOpen} onClose={dialogs.help.close} />

      <CreateCustomGateDialog
        isOpen={dialogs.customGate.isOpen}
        onClose={() => {
          dialogs.customGate.close();
          // ダイアログを閉じる際にデータをリセット
          setCustomGateDialogData({
            initialInputs: [],
            initialOutputs: [],
            isReadOnly: false,
          });
        }}
        onSave={handleCustomGateCreate}
        initialInputs={customGateDialogData.initialInputs}
        initialOutputs={customGateDialogData.initialOutputs}
        isReadOnly={customGateDialogData.isReadOnly}
      />
    </>
  );
};

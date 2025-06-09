import React from 'react';
import { SaveCircuitDialog } from './dialogs/SaveCircuitDialog';
import { LoadCircuitDialog } from './dialogs/LoadCircuitDialog';
import { ExportImportDialog } from './dialogs/ExportImportDialog';
import { CreateCustomGateDialog } from './dialogs/CreateCustomGateDialog';
import { useCircuitStore } from '../stores/circuitStore';
import type { AppMode } from '../types/appMode';
import type { CustomGateDefinition } from '../types/circuit';
import { useMultipleDialogs } from '../hooks/useDialog';
import { debug } from '../shared/debug';
import { TERMS } from '../features/learning-mode/data/terms';

interface HeaderProps {
  activeMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  onOpenHelp?: () => void;
  onHelpDialogStateChange?: (isOpen: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeMode, onModeChange, onOpenHelp, onHelpDialogStateChange }) => {
  const {
    gates,
    wires: _wires,
    addCustomGate,
    isLearningMode: _isLearningMode,
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
    debug.log('✅ 回路が保存されました');
  };

  const handleLoadSuccess = () => {
    // 読み込み成功時の処理
    debug.log('✅ 回路が読み込まれました');
  };

  const handleExportSuccess = () => {
    // エクスポート成功時の処理
    debug.log('✅ 回路がエクスポートされました');
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
  type GatePinInfo = {
    name: string;
    index: number;
    gateId: string;
  };

  const [customGateDialogData, setCustomGateDialogData] = React.useState<{
    initialInputs: GatePinInfo[];
    initialOutputs: GatePinInfo[];
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
      alert(`${TERMS.CIRCUIT}には${TERMS.INPUT}${TERMS.GATE}と${TERMS.OUTPUT}${TERMS.GATE}が${TERMS.REQUIRED}です`);
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

    debug.log('=== Header: Setting customGateDialogData ===');
    debug.log('newData:', newData);

    setCustomGateDialogData(newData);
    dialogs.customGate.open();
  };

  const handleCustomGateCreate = (definition: CustomGateDefinition) => {
    addCustomGate(definition);
    dialogs.customGate.close();
    debug.log('✅ カスタムゲートが作成されました');

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
            className={`mode-tab ${activeMode === TERMS.LEARNING_MODE ? 'active' : ''}`}
            onClick={() => onModeChange(TERMS.LEARNING_MODE)}
          >
            {TERMS.LEARNING_MODE}
          </button>
          <button
            className={`mode-tab ${activeMode === TERMS.FREE_MODE ? 'active' : ''}`}
            onClick={() => onModeChange(TERMS.FREE_MODE)}
          >
            {TERMS.FREE_MODE}
          </button>
        </div>

        <div className="header-actions">
          {/* 自由制作モード時のアクション */}
          {activeMode === TERMS.FREE_MODE && (
            <>
              <button
                className="button"
                onClick={() => dialogs.load.open()}
                title={`${TERMS.CIRCUIT}を${TERMS.LOAD}`}
              >
                <span>📂</span>
                <span>{TERMS.OPEN}</span>
              </button>
              <button
                className="button"
                onClick={() => dialogs.save.open()}
                title={`${TERMS.CIRCUIT}を${TERMS.SAVE}`}
              >
                <span>💾</span>
                <span>{TERMS.SAVE}</span>
              </button>
              <button
                className="button"
                onClick={handleCreateCustomGateFromCircuit}
                title={`現在の${TERMS.CIRCUIT}から${TERMS.CUSTOM_GATE}を${TERMS.CREATE}`}
              >
                <span>📦</span>
                <span>{TERMS.CIRCUIT}→IC</span>
              </button>
            </>
          )}

          {/* 学習モード時の表示 */}
          {activeMode === TERMS.LEARNING_MODE && (
            <div className="learning-mode-status">
              <span className="learning-progress">
                {/* ここに進捗表示を追加予定 */}
                <span
                  style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '14px',
                    marginRight: '12px',
                  }}
                >
                  学習中
                </span>
              </span>
            </div>
          )}

          {/* パズルモード時の表示 */}
          {activeMode === TERMS.PUZZLE_MODE && (
            <span
              style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '14px',
                marginRight: '12px',
              }}
            >
              {TERMS.PUZZLE_MODE}
            </span>
          )}

          {/* ヘルプボタンは常に表示 */}
          <button
            className="button help-button"
            onClick={onOpenHelp || (() => dialogs.help.open())}
            title={TERMS.HELP}
          >
            <span>❓</span>
            <span>{TERMS.HELP}</span>
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

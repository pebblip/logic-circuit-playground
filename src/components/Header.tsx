import React from 'react';
import { SaveCircuitDialog } from './dialogs/SaveCircuitDialog';
import { LoadCircuitDialog } from './dialogs/LoadCircuitDialog';
import { ExportImportDialog } from './dialogs/ExportImportDialog';
import { ShareCircuitDialog } from './dialogs/ShareCircuitDialog';
import { useCircuitStore } from '../stores/circuitStore';
import type { AppMode } from '../types/appMode';
import { useMultipleDialogs } from '../hooks/useDialog';
import { debug } from '../shared/debug';
import { TERMS } from '../features/learning-mode/data/terms';

interface HeaderProps {
  activeMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  onOpenHelp?: () => void;
  onHelpDialogStateChange?: (isOpen: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeMode,
  onModeChange,
  onOpenHelp,
  onHelpDialogStateChange: _onHelpDialogStateChange,
}) => {
  const { gates } = useCircuitStore();

  // 統一ダイアログ管理
  const dialogs = useMultipleDialogs({
    save: {},
    load: {},
    export: {},
    share: {},
    help: {},
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

  // 不要になった状態管理を削除

  const handleCreateCustomGateFromCircuit = () => {
    const inputGates = gates.filter(g => g.type === 'INPUT');
    const outputGates = gates.filter(g => g.type === 'OUTPUT');

    if (inputGates.length === 0 || outputGates.length === 0) {
      alert(
        `${TERMS.CIRCUIT}には${TERMS.INPUT}${TERMS.GATE}と${TERMS.OUTPUT}${TERMS.GATE}が${TERMS.REQUIRED}です`
      );
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

    // カスタムイベントを発火してダイアログを開く
    const event = new CustomEvent('open-custom-gate-dialog', {
      detail: {
        initialInputs,
        initialOutputs,
        isFullCircuit: true,
      },
    });
    window.dispatchEvent(event);
  };

  // 不要になったハンドラーを削除（createCustomGateFromCurrentCircuitを使用）

  return (
    <>
      <header className="header">
        <div className="logo">
          <img src="/logo-text.svg" alt="LogiCirc" height="32" />
        </div>

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
              <button
                className="button"
                onClick={() => dialogs.share.open()}
                title="回路を共有"
              >
                <span>🔗</span>
                <span>共有</span>
              </button>
            </>
          )}

          {/* 学習モード時の表示は削除（モードボタンで十分わかるため） */}

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
            data-testid="help-button"
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

      <ShareCircuitDialog
        isOpen={dialogs.share.isOpen}
        onClose={dialogs.share.close}
      />
    </>
  );
};

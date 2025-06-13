import React, { useState, useEffect } from 'react';
import {
  evaluateCircuit,
  defaultConfig,
  isSuccess,
} from '../../domain/simulation/core';
import type { Circuit } from '../../domain/simulation/core/types';
import { useCircuitStore } from '../../stores/circuitStore';
import { SaveCircuitDialog } from '../dialogs/SaveCircuitDialog';
import { LoadCircuitDialog } from '../dialogs/LoadCircuitDialog';
import { OPEN_SAVE_DIALOG_EVENT } from '../../hooks/useKeyboardShortcuts';

export const FloatingActionButtons: React.FC = () => {
  const { gates, wires } = useCircuitStore();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleSimulate = () => {
    // 手動でシミュレーションを実行
    const circuit: Circuit = { gates, wires };
    const result = evaluateCircuit(circuit, defaultConfig);

    if (isSuccess(result)) {
      useCircuitStore.setState({
        gates: [...result.data.circuit.gates],
        wires: [...result.data.circuit.wires],
      });
    } else {
      alert(`Circuit evaluation failed: ${result.error.message}`);
    }
  };

  const handleSave = () => {
    setSaveDialogOpen(true);
    setExpanded(false);
  };

  const handleLoad = () => {
    setLoadDialogOpen(true);
    setExpanded(false);
  };

  const handleReset = () => {
    // 回路をクリア
    const state = useCircuitStore.getState();
    state.gates.forEach(gate => state.deleteGate(gate.id));
    state.wires.forEach(wire => state.deleteWire(wire.id));
    setExpanded(false);
  };

  const handleSaveSuccess = () => {
    // 保存成功時の処理
  };

  const handleLoadSuccess = () => {
    // 読み込み成功時の処理
  };

  // Ctrl+Sのイベントリスナー
  useEffect(() => {
    const handleOpenSaveDialog = () => {
      setSaveDialogOpen(true);
    };

    window.addEventListener(OPEN_SAVE_DIALOG_EVENT, handleOpenSaveDialog);
    return () => {
      window.removeEventListener(OPEN_SAVE_DIALOG_EVENT, handleOpenSaveDialog);
    };
  }, []);

  return (
    <>
      <div className={`fab-container ${expanded ? 'expanded' : ''}`}>
        {/* 拡張メニュー */}
        {expanded && (
          <div className="fab-menu">
            <button className="fab secondary" onClick={handleSave} title="保存">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="20"
                height="20"
              >
                <path d="M17 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V7L17 3ZM12 19C10.34 19 9 17.66 9 16C9 14.34 10.34 13 12 13C13.66 13 15 14.34 15 16C15 17.66 13.66 19 12 19ZM15 9H5V5H15V9Z" />
              </svg>
            </button>
            <button
              className="fab secondary"
              onClick={handleLoad}
              title="読み込み"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="20"
                height="20"
              >
                <path d="M10 4H4C2.89 4 2 4.89 2 6V18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V8C22 6.89 21.11 6 20 6H12L10 4Z" />
              </svg>
            </button>
            <button
              className="fab secondary"
              onClick={handleReset}
              title="クリア"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="20"
                height="20"
              >
                <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" />
              </svg>
            </button>
          </div>
        )}

        {/* メインFAB */}
        <button
          className="fab primary main-fab"
          onClick={() => setExpanded(!expanded)}
          title={expanded ? '閉じる' : 'メニューを開く'}
        >
          {expanded ? (
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M12 15.5C10.07 15.5 8.5 13.93 8.5 12C8.5 10.07 10.07 8.5 12 8.5C13.93 8.5 15.5 10.07 15.5 12C15.5 13.93 13.93 15.5 12 15.5ZM19.43 12.97C19.47 12.65 19.5 12.33 19.5 12C19.5 11.67 19.47 11.34 19.43 11L21.54 9.37C21.73 9.22 21.78 8.95 21.66 8.73L19.66 5.27C19.54 5.05 19.27 4.96 19.05 5.05L16.56 6.05C16.04 5.66 15.48 5.32 14.87 5.07L14.49 2.42C14.46 2.18 14.25 2 14 2H10C9.75 2 9.54 2.18 9.51 2.42L9.13 5.07C8.52 5.32 7.96 5.66 7.44 6.05L4.95 5.05C4.73 4.96 4.46 5.05 4.34 5.27L2.34 8.73C2.21 8.95 2.27 9.22 2.46 9.37L4.57 11C4.53 11.34 4.5 11.67 4.5 12C4.5 12.33 4.53 12.65 4.57 12.97L2.46 14.63C2.27 14.78 2.21 15.05 2.34 15.27L4.34 18.73C4.46 18.95 4.73 19.03 4.95 18.95L7.44 17.94C7.96 18.34 8.52 18.68 9.13 18.93L9.51 21.58C9.54 21.82 9.75 22 10 22H14C14.25 22 14.46 21.82 14.49 21.58L14.87 18.93C15.48 18.68 16.04 18.34 16.56 17.94L19.05 18.95C19.27 19.03 19.54 18.95 19.66 18.73L21.66 15.27C21.78 15.05 21.73 14.78 21.54 14.63L19.43 12.97Z" />
            </svg>
          )}
        </button>

        {/* シミュレーションFAB */}
        <button
          className="fab primary simulate-fab"
          onClick={handleSimulate}
          title="シミュレーション"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M8 5V19L19 12Z" />
          </svg>
        </button>
      </div>

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
    </>
  );
};

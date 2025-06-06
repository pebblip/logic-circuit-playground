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
              💾
            </button>
            <button
              className="fab secondary"
              onClick={handleLoad}
              title="読み込み"
            >
              📂
            </button>
            <button
              className="fab secondary"
              onClick={handleReset}
              title="クリア"
            >
              🗑️
            </button>
          </div>
        )}

        {/* メインFAB */}
        <button
          className="fab primary main-fab"
          onClick={() => setExpanded(!expanded)}
          title={expanded ? '閉じる' : 'メニューを開く'}
        >
          {expanded ? '✕' : '⚙️'}
        </button>

        {/* シミュレーションFAB */}
        <button
          className="fab primary simulate-fab"
          onClick={handleSimulate}
          title="シミュレーション"
        >
          ▶️
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

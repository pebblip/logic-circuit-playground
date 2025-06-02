import React, { useState } from 'react';
import { evaluateCircuit } from '../../utils/simulation';
import { useCircuitStore } from '../../stores/circuitStore';
import { SaveCircuitDialog } from '../dialogs/SaveCircuitDialog';
import { LoadCircuitDialog } from '../dialogs/LoadCircuitDialog';

export const FloatingActionButtons: React.FC = () => {
  const { gates, wires } = useCircuitStore();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleSimulate = () => {
    // 手動でシミュレーションを実行
    const { gates: updatedGates, wires: updatedWires } = evaluateCircuit(gates, wires);
    useCircuitStore.setState({ gates: updatedGates, wires: updatedWires });
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
    console.log('✅ 回路が保存されました');
  };

  const handleLoadSuccess = () => {
    console.log('✅ 回路が読み込まれました');
  };

  return (
    <>
      <div className={`fab-container ${expanded ? 'expanded' : ''}`}>
        {/* 拡張メニュー */}
        {expanded && (
          <div className="fab-menu">
            <button className="fab secondary" onClick={handleSave} title="保存">
              💾
            </button>
            <button className="fab secondary" onClick={handleLoad} title="読み込み">
              📂
            </button>
            <button className="fab secondary" onClick={handleReset} title="クリア">
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
        <button className="fab primary simulate-fab" onClick={handleSimulate} title="シミュレーション">
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
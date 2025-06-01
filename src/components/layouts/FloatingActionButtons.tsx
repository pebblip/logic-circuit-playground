import React from 'react';
import { evaluateCircuit } from '../../utils/simulation';
import { useCircuitStore } from '../../stores/circuitStore';

export const FloatingActionButtons: React.FC = () => {
  const { gates, wires } = useCircuitStore();

  const handleSimulate = () => {
    // 手動でシミュレーションを実行
    const { gates: updatedGates, wires: updatedWires } = evaluateCircuit(gates, wires);
    useCircuitStore.setState({ gates: updatedGates, wires: updatedWires });
  };

  const handleReset = () => {
    // キャンバスの位置をリセット（将来的に実装）
    console.log('Reset canvas position');
  };

  const handleZoom = () => {
    // ズーム機能（将来的に実装）
    console.log('Toggle zoom');
  };

  return (
    <div className="fab-container">
      <button className="fab secondary" onClick={handleReset} title="リセット">
        🔄
      </button>
      <button className="fab secondary" onClick={handleZoom} title="ズーム">
        🔍
      </button>
      <button className="fab primary" onClick={handleSimulate} title="シミュレーション">
        ▶️
      </button>
    </div>
  );
};
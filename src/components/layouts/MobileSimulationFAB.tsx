import React from 'react';
import { useCircuitStore } from '../../stores/circuitStore';
import { isSuccess } from '../../domain/simulation/core';
import type { Circuit } from '../../domain/simulation/core/types';
import { getGlobalEvaluationService } from '../../domain/simulation/services/CircuitEvaluationService';

export const MobileSimulationFAB: React.FC = () => {
  const { gates, wires } = useCircuitStore();

  const handleSimulate = async () => {
    const circuit: Circuit = { gates, wires };
    const evaluationService = getGlobalEvaluationService();
    const result = await evaluationService.evaluate(circuit);

    if (isSuccess(result)) {
      const data = result.data;
      useCircuitStore.setState({
        gates: [...data.circuit.gates],
        wires: [...data.circuit.wires],
      });
    }
  };

  return (
    <button
      className="mobile-simulation-fab"
      onClick={handleSimulate}
      aria-label="シミュレーション実行"
    >
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
    </button>
  );
};

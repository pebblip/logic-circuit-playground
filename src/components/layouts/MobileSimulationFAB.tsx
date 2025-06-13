import React from 'react';
import { useCircuitStore } from '../../stores/circuitStore';
import {
  evaluateCircuit,
  defaultConfig,
  isSuccess,
} from '../../domain/simulation/core';
import type { Circuit } from '../../domain/simulation/core/types';

export const MobileSimulationFAB: React.FC = () => {
  const { gates, wires } = useCircuitStore();

  const handleSimulate = () => {
    const circuit: Circuit = { gates, wires };
    const result = evaluateCircuit(circuit, defaultConfig);

    if (isSuccess(result)) {
      useCircuitStore.setState({
        gates: [...result.data.circuit.gates],
        wires: [...result.data.circuit.wires],
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

import { useState, useCallback } from 'react';
import { Gate } from '../models/Gate';
import { Connection } from '../models/Connection';
import { CircuitViewModel } from '../viewmodels/CircuitViewModel';

interface UseCircuitStateProps {
  viewModel: CircuitViewModel;
}

interface UseCircuitStateReturn {
  gates: Gate[];
  connections: Connection[];
  simulationResults: Map<string, boolean>;
  addGate: (gateType: string, position: { x: number; y: number }) => void;
  deleteGate: (gateId: string) => void;
  toggleInput: (gateId: string) => void;
}

export function useCircuitState({ viewModel }: UseCircuitStateProps): UseCircuitStateReturn {
  const [gates, setGates] = useState<Gate[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [simulationResults, setSimulationResults] = useState<Map<string, boolean>>(new Map());

  const addGate = useCallback((gateType: string, position: { x: number; y: number }) => {
    viewModel.addGate(gateType, position);
  }, [viewModel]);

  const deleteGate = useCallback((gateId: string) => {
    viewModel.deleteGate(gateId);
  }, [viewModel]);

  const toggleInput = useCallback((gateId: string) => {
    viewModel.toggleInput(gateId);
  }, [viewModel]);

  return {
    gates,
    connections,
    simulationResults,
    addGate,
    deleteGate,
    toggleInput
  };
}
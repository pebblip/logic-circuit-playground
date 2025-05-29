import { useState, useCallback, useEffect } from 'react';
import { Gate } from '../models/gates/BaseGate';

interface CustomGate {
  id: string;
  name: string;
  definition: any;
}

interface UseCustomGatesReturn {
  customGates: Record<string, any>;
  setCustomGates: (gates: Record<string, any>) => void;
  addCustomGate: (gate: CustomGate) => void;
  removeCustomGate: (gateId: string) => void;
  updateCustomGate: (gateId: string, updates: Partial<CustomGate>) => void;
  simulateCustomGate: (gate: Gate, inputs: boolean[]) => boolean[];
}

export function useCustomGates(): UseCustomGatesReturn {
  const [customGates, setCustomGates] = useState<Record<string, any>>({});

  useEffect(() => {
    // カスタムゲートのマイグレーション
    const savedCircuits = localStorage.getItem('savedCircuits');
    if (savedCircuits) {
      try {
        const circuits = JSON.parse(savedCircuits);
        const migratedCustomGates: Record<string, any> = {};
        
        Object.entries(circuits).forEach(([name, circuit]: [string, any]) => {
          if (circuit && typeof circuit === 'object' && circuit.gates && circuit.connections) {
            migratedCustomGates[name] = {
              name,
              gates: circuit.gates,
              connections: circuit.connections,
              inputLabels: circuit.inputLabels || [],
              outputLabels: circuit.outputLabels || []
            };
          }
        });
        
        if (Object.keys(migratedCustomGates).length > 0) {
          setCustomGates(migratedCustomGates);
          localStorage.setItem('customGates', JSON.stringify(migratedCustomGates));
        }
      } catch (error) {
        console.error('カスタムゲートのマイグレーションエラー:', error);
      }
    }
    
    const savedCustomGates = localStorage.getItem('customGates');
    if (savedCustomGates) {
      try {
        setCustomGates(JSON.parse(savedCustomGates));
      } catch (error) {
        console.error('カスタムゲートの読み込みエラー:', error);
      }
    }
  }, []);

  const addCustomGate = useCallback((gate: CustomGate) => {
    setCustomGates(prev => ({
      ...prev,
      [gate.id]: gate
    }));
  }, []);

  const removeCustomGate = useCallback((gateId: string) => {
    setCustomGates(prev => {
      const updated = { ...prev };
      delete updated[gateId];
      return updated;
    });
  }, []);

  const updateCustomGate = useCallback((gateId: string, updates: Partial<CustomGate>) => {
    setCustomGates(prev => ({
      ...prev,
      [gateId]: { ...prev[gateId], ...updates }
    }));
  }, []);

  const simulateCustomGate = useCallback((gate: Gate, inputs: boolean[]): boolean[] => {
    // カスタムゲートのシミュレーションロジック
    const customGateDef = customGates[gate.type.replace('CUSTOM_', '')];
    if (!customGateDef) return [];
    
    // 実際のシミュレーションロジックはここに実装
    return [];
  }, [customGates]);

  return {
    customGates,
    setCustomGates,
    addCustomGate,
    removeCustomGate,
    updateCustomGate,
    simulateCustomGate
  };
}
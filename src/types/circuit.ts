/**
 * 回路関連の型定義
 */

import { GateData, ConnectionData } from './gate';

export interface CircuitData {
  gates: GateData[];
  connections: ConnectionData[];
}

export interface SimulationResult {
  gateStates: Map<string, boolean[]>;
  timestamp: number;
}

export interface CircuitValidationError {
  type: 'FLOATING_INPUT' | 'CYCLIC_DEPENDENCY' | 'INVALID_CONNECTION';
  message: string;
  gateId?: string;
  connectionId?: string;
}
/**
 * 回路クラス
 */

import { ID } from '../types/common';
import { CircuitData, SimulationResult, UltraModernGate } from '../types/circuit';
import { BaseGate } from './gates/BaseGate';
import { Connection } from './Connection';
import { EventEmitter } from '../utils/EventEmitter';
import { GateData } from '../types/gate';

export class Circuit extends EventEmitter {
  private _gates: Map<ID, BaseGate> = new Map();
  private _connections: Map<ID, Connection> = new Map();
  private _nextConnectionId = 1;

  constructor() {
    super();
  }

  // Gate management
  addGate(gate: BaseGate): void {
    this._gates.set(gate.id, gate);
    this.emit('gateAdded', gate);
  }

  removeGate(gateId: ID): void {
    const gate = this._gates.get(gateId);
    if (!gate) return;

    // Remove all connections involving this gate
    const connectionsToRemove: ID[] = [];
    this._connections.forEach((conn) => {
      if (conn.involves(gateId)) {
        connectionsToRemove.push(conn.id);
      }
    });

    connectionsToRemove.forEach(id => this.removeConnection(id));
    
    this._gates.delete(gateId);
    this.emit('gateRemoved', gate);
  }

  getGate(gateId: ID): BaseGate | undefined {
    return this._gates.get(gateId);
  }

  getGates(): BaseGate[] {
    return Array.from(this._gates.values());
  }

  // Connection management
  addConnection(
    fromGateId: ID,
    fromOutputIndex: number,
    toGateId: ID,
    toInputIndex: number,
    options: { silent?: boolean } = {}
  ): Connection | null {
    const fromGate = this._gates.get(fromGateId);
    const toGate = this._gates.get(toGateId);

    if (!fromGate || !toGate) {
      if (!options.silent) {
        console.error('Cannot connect: gate not found');
      }
      return null;
    }

    // Check if connection already exists
    const existing = this.findConnection(fromGateId, fromOutputIndex, toGateId, toInputIndex);
    if (existing) {
      if (!options.silent) {
        console.warn('Connection already exists');
      }
      return existing;
    }

    const connectionId = `conn_${this._nextConnectionId++}`;
    const connection = new Connection(
      connectionId,
      fromGateId,
      fromOutputIndex,
      toGateId,
      toInputIndex
    );

    this._connections.set(connectionId, connection);
    this.emit('connectionAdded', connection);
    
    return connection;
  }

  removeConnection(connectionId: ID): void {
    const connection = this._connections.get(connectionId);
    if (!connection) return;

    this._connections.delete(connectionId);
    this.emit('connectionRemoved', connection);
  }

  getConnections(): Connection[] {
    return Array.from(this._connections.values());
  }

  private findConnection(
    fromGateId: ID,
    fromOutputIndex: number,
    toGateId: ID,
    toInputIndex: number
  ): Connection | undefined {
    return Array.from(this._connections.values()).find(
      conn =>
        conn.fromGateId === fromGateId &&
        conn.fromOutputIndex === fromOutputIndex &&
        conn.toGateId === toGateId &&
        conn.toInputIndex === toInputIndex
    );
  }

  // Simulation
  simulate(): SimulationResult {
    const startTime = performance.now();
    
    // Reset all gates
    this._gates.forEach(gate => gate.reset());

    // Topological sort for proper evaluation order
    const sortedGates = this.topologicalSort();
    
    // Simulate in order
    sortedGates.forEach(gate => {
      // Set input values from connections
      const inputConnections = this.getInputConnections(gate.id);
      
      inputConnections.forEach(conn => {
        const fromGate = this._gates.get(conn.fromGateId);
        if (fromGate) {
          const outputValue = fromGate.getOutputValue(conn.fromOutputIndex);
          gate.setInputValue(conn.toInputIndex, outputValue);
        }
      });

      // Compute gate output
      gate.compute();
    });

    // Collect results
    const gateStates = new Map<string, boolean[]>();
    this._gates.forEach((gate, id) => {
      const outputs = gate.outputs.map(pin => pin.value);
      gateStates.set(id, outputs);
    });

    return {
      gateStates,
      timestamp: performance.now() - startTime
    };
  }

  private getInputConnections(gateId: ID): Connection[] {
    return Array.from(this._connections.values()).filter(
      conn => conn.toGateId === gateId
    );
  }

  private topologicalSort(): BaseGate[] {
    const visited = new Set<ID>();
    const sorted: BaseGate[] = [];
    
    const visit = (gateId: ID) => {
      if (visited.has(gateId)) return;
      visited.add(gateId);

      const gate = this._gates.get(gateId);
      if (!gate) return;

      // Visit all gates that provide input to this gate
      const inputConnections = this.getInputConnections(gateId);
      inputConnections.forEach(conn => {
        visit(conn.fromGateId);
      });

      sorted.push(gate);
    };

    // Start with all gates
    this._gates.forEach((_, id) => visit(id));

    return sorted;
  }

  // Serialization
  toJSON(): CircuitData {
    return {
      gates: this.getGates().map(gate => {
        const data = gate.toJSON() as GateData;
        // UltraModernGateとの互換性のためにx,yを追加
        return {
          ...data,
          x: gate.position.x,
          y: gate.position.y
        } as UltraModernGate;
      }),
      connections: this.getConnections().map(conn => conn.toJSON())
    };
  }

  clear(): void {
    this._gates.clear();
    this._connections.clear();
    this._nextConnectionId = 1;
    this.emit('cleared');
  }
}
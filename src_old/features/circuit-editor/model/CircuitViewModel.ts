/**
 * 回路のViewModel
 */

import { Circuit } from '@/entities/circuit/Circuit';
import { BaseGate, GateFactory } from '@/entities/gates';
import { GateType } from '@/entities/types/gate';
import { Position } from '@/entities/types/common';
import { GateViewModel } from './GateViewModel';
import { ConnectionViewModel } from './ConnectionViewModel';
import { EventEmitter } from '@/shared/lib/utils/EventEmitter';

export class CircuitViewModel extends EventEmitter {
  private _circuit: Circuit;
  private _gateViewModels: Map<string, GateViewModel> = new Map();
  private _connectionViewModels: Map<string, ConnectionViewModel> = new Map();
  private _selectedGates: Set<string> = new Set();
  private _selectedConnections: Set<string> = new Set();
  private _isSimulating: boolean = false;

  constructor() {
    super();
    this._circuit = new Circuit();
    this.setupCircuitListeners();
  }

  // Getters
  get gates(): GateViewModel[] {
    return Array.from(this._gateViewModels.values());
  }

  get connections(): ConnectionViewModel[] {
    return Array.from(this._connectionViewModels.values());
  }

  get selectedGates(): Set<string> {
    return new Set(this._selectedGates);
  }

  get isSimulating(): boolean {
    return this._isSimulating;
  }

  // Circuit accessor method for compatibility
  getCircuit(): Circuit {
    return this._circuit;
  }

  // Gate operations
  addGate(type: GateType, position: Position): GateViewModel {
    const gate = GateFactory.create(type, position);
    this._circuit.addGate(gate);
    
    const gateVM = new GateViewModel(gate);
    this._gateViewModels.set(gate.id, gateVM);
    
    // Setup gate event listeners
    gateVM.on('clicked', this.handleGateClick.bind(this));
    gateVM.on('doubleClicked', this.handleGateDoubleClick.bind(this));
    gateVM.on('valueChanged', this.handleValueChanged.bind(this));
    
    this.emit('gatesChanged');
    return gateVM;
  }

  removeGate(gateId: string): void {
    const gateVM = this._gateViewModels.get(gateId);
    if (!gateVM) return;
    
    // Remove from selection
    this._selectedGates.delete(gateId);
    
    // Remove view model
    gateVM.removeAllListeners();
    this._gateViewModels.delete(gateId);
    
    // Remove from circuit (this will also remove connections)
    this._circuit.removeGate(gateId);
    
    this.emit('gatesChanged');
  }

  moveGate(gateId: string, position: Position): void {
    const gateVM = this._gateViewModels.get(gateId);
    if (gateVM) {
      gateVM.move(position);
      this.emit('gatesMoved', [gateId]);
    }
  }

  // Connection operations
  addConnection(
    fromGateId: string,
    fromOutputIndex: number,
    toGateId: string,
    toInputIndex: number
  ): ConnectionViewModel | null {
    const connection = this._circuit.addConnection(
      fromGateId,
      fromOutputIndex,
      toGateId,
      toInputIndex
    );
    
    if (!connection) return null;
    
    const connectionVM = new ConnectionViewModel(
      connection,
      this._gateViewModels.get(fromGateId)!,
      this._gateViewModels.get(toGateId)!
    );
    
    this._connectionViewModels.set(connection.id, connectionVM);
    this.emit('connectionsChanged');
    
    return connectionVM;
  }

  removeConnection(connectionId: string): void {
    const connectionVM = this._connectionViewModels.get(connectionId);
    if (!connectionVM) return;
    
    this._connectionViewModels.delete(connectionId);
    this._circuit.removeConnection(connectionId);
    
    this.emit('connectionsChanged');
  }

  // Selection
  selectGate(gateId: string, multi: boolean = false): void {
    if (!multi) {
      this.clearSelection();
    }
    
    this._selectedGates.add(gateId);
    const gateVM = this._gateViewModels.get(gateId);
    if (gateVM) {
      gateVM.setSelected(true);
    }
    
    this.emit('selectionChanged', this._selectedGates);
  }

  deselectGate(gateId: string): void {
    this._selectedGates.delete(gateId);
    const gateVM = this._gateViewModels.get(gateId);
    if (gateVM) {
      gateVM.setSelected(false);
    }
    
    this.emit('selectionChanged', this._selectedGates);
  }

  clearSelection(): void {
    this._selectedGates.forEach(gateId => {
      const gateVM = this._gateViewModels.get(gateId);
      if (gateVM) {
        gateVM.setSelected(false);
      }
    });
    this._selectedGates.clear();
    this._selectedConnections.clear();
    this.emit('selectionChanged', this._selectedGates);
  }

  // Get selected gates
  getSelectedGates(): GateViewModel[] {
    return Array.from(this._selectedGates)
      .map(gateId => this._gateViewModels.get(gateId))
      .filter((gateVM): gateVM is GateViewModel => gateVM !== undefined);
  }

  // Get selected connections
  getSelectedConnections(): ConnectionViewModel[] {
    return Array.from(this._selectedConnections)
      .map(connId => this._connectionViewModels.get(connId))
      .filter((connVM): connVM is ConnectionViewModel => connVM !== undefined);
  }

  // Select all gates
  selectAll(): void {
    this._gateViewModels.forEach((gateVM, gateId) => {
      this._selectedGates.add(gateId);
      gateVM.setSelected(true);
    });
    this.emit('selectionChanged', this._selectedGates);
  }

  // Connection selection methods
  selectConnection(connectionId: string): void {
    this._selectedConnections.add(connectionId);
    this.emit('selectionChanged');
  }

  isGateSelected(gateId: string): boolean {
    return this._selectedGates.has(gateId);
  }

  isConnectionSelected(connectionId: string): boolean {
    return this._selectedConnections.has(connectionId);
  }

  // Clear circuit (alias for clear method)
  clearCircuit(): void {
    this.clear();
  }

  // Simulation
  simulate(): void {
    this._isSimulating = true;
    this.emit('simulationStarted');
    
    const result = this._circuit.simulate();
    
    // Update gate view models with results
    result.gateStates.forEach((outputs, gateId) => {
      const gateVM = this._gateViewModels.get(gateId);
      if (gateVM) {
        this.emit('gateStateChanged', gateId, outputs);
      }
    });
    
    this._isSimulating = false;
    this.emit('simulationCompleted', result);
  }

  // Event handlers
  private handleGateClick(gateVM: GateViewModel): void {
    this.selectGate(gateVM.id);
  }

  private handleGateDoubleClick(gateVM: GateViewModel): void {
    this.emit('gateDoubleClicked', gateVM);
  }

  private handleValueChanged(): void {
    if (!this._isSimulating) {
      this.simulate();
    }
  }

  // Circuit event setup
  private setupCircuitListeners(): void {
    this._circuit.on('connectionRemoved', (connection) => {
      // Clean up connection view model if circuit removes it
      this._connectionViewModels.delete(connection.id);
      this.emit('connectionsChanged');
    });
  }

  // Serialization
  toJSON() {
    return this._circuit.toJSON();
  }

  clear(): void {
    // Clear view models
    this._gateViewModels.forEach(vm => vm.removeAllListeners());
    this._gateViewModels.clear();
    this._connectionViewModels.clear();
    this._selectedGates.clear();
    this._selectedConnections.clear();
    
    // Clear circuit
    this._circuit.clear();
    
    this.emit('cleared');
  }
}
import { BaseGate } from './BaseGate';
import { ID, Position } from '@/types/common';
import { GateType } from '@/types/gate';
import { Circuit } from '../Circuit';

export class CustomGate extends BaseGate {
  private internalCircuit: Circuit;
  private inputGateIds: ID[] = [];
  private outputGateIds: ID[] = [];
  
  constructor(id: ID, position: Position, public customType: string, definition: any) {
    super(id, customType as GateType, position);
    this.internalCircuit = new Circuit();
    if (definition) {
      this.setupFromDefinition(definition);
    }
  }
  
  private setupFromDefinition(definition: any): void {
    // 内部回路の構築
    if (definition.circuit) {
      // 入力ゲートの作成
      this.inputGateIds = definition.inputs.map((input: any, index: number) => {
        const gateId = `${this.id}_input_${index}`;
        this.internalCircuit.addGate({
          id: gateId,
          type: GateType.INPUT,
          position: { x: 0, y: index * 50 }
        });
        return gateId;
      });
      
      // 出力ゲートの作成
      this.outputGateIds = definition.outputs.map((output: any, index: number) => {
        const gateId = `${this.id}_output_${index}`;
        this.internalCircuit.addGate({
          id: gateId,
          type: GateType.OUTPUT,
          position: { x: 300, y: index * 50 }
        });
        return gateId;
      });
      
      // 内部ゲートの作成
      definition.circuit.gates?.forEach((gate: any) => {
        if (gate.type !== 'INPUT' && gate.type !== 'OUTPUT') {
          this.internalCircuit.addGate({
            id: `${this.id}_${gate.id}`,
            type: gate.type as GateType,
            position: { x: gate.x, y: gate.y }
          });
        }
      });
      
      // 内部接続の作成
      definition.circuit.connections?.forEach((conn: any) => {
        const fromId = this.resolveInternalGateId(conn.from, definition);
        const toId = this.resolveInternalGateId(conn.to, definition);
        
        if (fromId && toId) {
          this.internalCircuit.addConnection(
            fromId,
            conn.fromOutput || 0,
            toId,
            conn.toInput || 0
          );
        }
      });
    }
    
    this.initializePins();
  }
  
  private resolveInternalGateId(externalId: string, definition: any): ID | null {
    // 入力ゲートのマッピング
    const inputIndex = definition.inputs.findIndex((input: any) => input.id === externalId);
    if (inputIndex !== -1) {
      return this.inputGateIds[inputIndex];
    }
    
    // 出力ゲートのマッピング
    const outputIndex = definition.outputs.findIndex((output: any) => output.id === externalId);
    if (outputIndex !== -1) {
      return this.outputGateIds[outputIndex];
    }
    
    // 通常のゲート
    return `${this.id}_${externalId}`;
  }
  
  protected initializePins(): void {
    // 入力ピンの初期化
    this.inputGateIds.forEach((_, index) => {
      this.addInput(`in${index}`);
    });
    
    // 出力ピンの初期化
    this.outputGateIds.forEach((_, index) => {
      this.addOutput(`out${index}`);
    });
  }
  
  public compute(): void {
    // 外部入力を内部入力ゲートに伝播
    this.inputGateIds.forEach((inputGateId, index) => {
      const inputGate = this.internalCircuit.getGate(inputGateId);
      if (inputGate && this.inputs[index]) {
        inputGate.outputs[0].value = this.inputs[index].value;
      }
    });
    
    // 内部回路のシミュレーション
    const result = this.internalCircuit.simulate();
    
    // 内部出力ゲートから外部出力に伝播
    this.outputGateIds.forEach((outputGateId, index) => {
      const outputStates = result.gateStates.get(outputGateId);
      if (outputStates && outputStates.length > 0 && this.outputs[index]) {
        this.outputs[index].value = outputStates[0];
      }
    });
  }
  
  public clone(newId: ID): CustomGate {
    const definition = this.getDefinition();
    return new CustomGate(newId, { ...this.position }, this.customType, definition);
  }
  
  private getDefinition(): any {
    // 定義を再構築
    return {
      inputs: this.inputGateIds.map((id, index) => ({ id: `input_${index}` })),
      outputs: this.outputGateIds.map((id, index) => ({ id: `output_${index}` })),
      circuit: {
        gates: this.internalCircuit.getGates().map(gate => ({
          id: gate.id.replace(`${this.id}_`, ''),
          type: gate.type,
          x: gate.position.x,
          y: gate.position.y
        })),
        connections: this.internalCircuit.getConnections().map(conn => ({
          from: conn.fromGateId.replace(`${this.id}_`, ''),
          fromOutput: conn.fromOutputIndex,
          to: conn.toGateId.replace(`${this.id}_`, ''),
          toInput: conn.toInputIndex
        }))
      }
    };
  }
  
  public toJSON(): any {
    return {
      ...super.toJSON(),
      customType: this.customType,
      definition: this.getDefinition()
    };
  }
}
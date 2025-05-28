import { BaseGate } from './BaseGate';
import { ID, Position } from '@/types/common';
import { GateType } from '@/types/gate';
import { Circuit } from '../Circuit';
import { GateFactory } from './GateFactory';

export class CustomGate extends BaseGate {
  private internalCircuit: Circuit;
  private inputGateIds: ID[] = [];
  private outputGateIds: ID[] = [];
  private definition: any;
  
  constructor(id: ID, position: Position, public customType: string, definition: any) {
    // definitionを先に保存
    super(id, customType as GateType, position);
    this.internalCircuit = new Circuit();
    this.definition = definition;
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
        const inputGate = GateFactory.create(
          GateType.INPUT,
          { x: 0, y: index * 50 },
          gateId
        );
        this.internalCircuit.addGate(inputGate);
        return gateId;
      });
      
      // 出力ゲートの作成
      this.outputGateIds = definition.outputs.map((output: any, index: number) => {
        const gateId = `${this.id}_output_${index}`;
        const outputGate = GateFactory.create(
          GateType.OUTPUT,
          { x: 300, y: index * 50 },
          gateId
        );
        this.internalCircuit.addGate(outputGate);
        return gateId;
      });
      
      // 内部ゲートの作成
      definition.circuit.gates?.forEach((gate: any) => {
        if (gate.type !== 'INPUT' && gate.type !== 'OUTPUT') {
          const internalGate = GateFactory.create(
            gate.type as GateType,
            { x: gate.x, y: gate.y },
            `${this.id}_${gate.id}`
          );
          this.internalCircuit.addGate(internalGate);
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
    
    this.initializeCustomPins();
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
    // setupFromDefinitionで後から初期化される
    // ここでは何もしない
  }
  
  private initializeCustomPins(): void {
    // 入力ピンの初期化
    if (this.definition && this.definition.inputs) {
      this._inputs = this.definition.inputs.map((input: any, index: number) => {
        return this.createPin(input.name || `in${index}`, 'input', index, this.definition.inputs.length);
      });
    }
    
    // 出力ピンの初期化
    if (this.definition && this.definition.outputs) {
      this._outputs = this.definition.outputs.map((output: any, index: number) => {
        return this.createPin(output.name || `out${index}`, 'output', index, this.definition.outputs.length);
      });
    }
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
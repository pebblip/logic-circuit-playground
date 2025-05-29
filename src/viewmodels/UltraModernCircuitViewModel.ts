import { EventEmitter } from '../utils/EventEmitter';
import { Circuit } from '../models/Circuit';
import { BaseGate } from '../models/gates/BaseGate';
import { InputGate } from '../models/gates/InputGate';
import { ClockGate } from '../models/gates/ClockGate';
import { GateFactory } from '../models/gates/GateFactory';
import { GateType } from '../types/gate';
import { Position, ID } from '../types/common';
import { Connection } from '../types/circuit';

// UltraModernCircuit用の拡張インターフェース
interface UltraModernGate {
  id: string;
  type: string;
  x: number;
  y: number;
  value?: boolean;
  circuit?: any; // カスタムゲート用の内部回路
  inputs?: any[];
  outputs?: any[];
}

interface UltraModernConnection {
  id: string;
  from: string;
  fromOutput?: number;
  to: string;
  toInput?: number;
}

/**
 * UltraModernCircuit用のViewModel
 * 元の機能を完全に保持しながら、内部でCircuitモデルを使用
 */
export class UltraModernCircuitViewModel extends EventEmitter {
  private circuit: Circuit;
  private gateIdMap: Map<string, ID> = new Map(); // UltraModernのIDから内部IDへのマッピング
  private reverseGateIdMap: Map<ID, string> = new Map(); // 内部IDからUltraModernのIDへのマッピング
  private customGates: Map<string, any> = new Map();
  private simulationResults: Map<string, any> = new Map();
  private nextGateId: number = 1;

  constructor() {
    super();
    this.circuit = new Circuit();
  }
  
  // Circuitモデルを取得（発見システム用） - 既存のメソッドと統合
  getCircuitModel(): Circuit {
    return this.circuit;
  }

  // ゲート取得（UltraModern形式）
  getGates(): UltraModernGate[] {
    return this.circuit.getGates().map(gate => {
      const ultraId = this.reverseGateIdMap.get(gate.id) || gate.id;
      const result = this.simulationResults.get(ultraId);
      
      // カスタムゲートの情報を取得
      const customGateInfo = this.customGates.get(gate.type);
      
      // value値の決定
      let value: boolean | undefined;
      if (gate.type === GateType.INPUT) {
        // InputGateの場合、getStateメソッドを使用
        value = gate instanceof InputGate ? gate.getState() : false;
      } else if (gate.type === GateType.OUTPUT) {
        // OutputGateの場合、入力ピンの値を使用
        value = gate.getInputValue(0);
      } else {
        // その他のゲートはシミュレーション結果を使用
        value = result !== undefined ? result : false;
      }
      
      const baseGate: UltraModernGate = {
        id: ultraId,
        type: gate.type,
        x: gate.position.x,
        y: gate.position.y,
        value,
        ...(customGateInfo && {
          circuit: customGateInfo.circuit,
          inputs: customGateInfo.inputs,
          outputs: customGateInfo.outputs
        })
      };
      
      // クロックゲートの場合、追加情報を含める
      if (gate instanceof ClockGate) {
        return {
          ...baseGate,
          isRunning: gate.getIsRunning(),
          interval: gate.getInterval()
        } as any;
      }
      
      return baseGate;
    });
  }

  // 接続取得（UltraModern形式）
  getConnections(): UltraModernConnection[] {
    return this.circuit.getConnections().map(conn => {
      return {
        id: conn.id,
        from: this.reverseGateIdMap.get(conn.fromGateId) || conn.fromGateId,
        fromOutput: conn.fromOutputIndex,
        to: this.reverseGateIdMap.get(conn.toGateId) || conn.toGateId,
        toInput: conn.toInputIndex
      };
    });
  }

  // ゲート追加（UltraModern互換）
  addGate(type: string, position: { x: number; y: number }): UltraModernGate {
    const { x, y } = position;
    const ultraId = `gate_${this.nextGateId++}`;
    
    // 標準ゲートタイプに変換
    let gateType: GateType;
    let isCustom = false;
    
    try {
      gateType = GateType[type as keyof typeof GateType];
      if (!gateType) {
        // カスタムゲートとして扱う
        gateType = type as any;
        isCustom = true;
      }
    } catch {
      gateType = type as any;
      isCustom = true;
    }
    
    // 内部モデルにゲートを追加
    const gate = GateFactory.create(gateType, { x, y });
    
    // クロックゲートの場合、コールバックを設定
    if (gate instanceof ClockGate) {
      gate.onToggle = () => {
        this.simulate();
        this.emit('simulationCompleted', this.simulationResults);
        this.emit('simulationResultsChanged', this.simulationResults);
      };
    }
    
    this.circuit.addGate(gate);
    
    // IDマッピングを保存
    this.gateIdMap.set(ultraId, gate.id);
    this.reverseGateIdMap.set(gate.id, ultraId);
    
    // カスタムゲートの情報を保存
    const customGateInfo = this.customGates.get(type);
    
    // シミュレーション実行
    this.simulate();
    
    // イベント発火
    this.emit('gatesChanged', this.getGates());
    
    // 初期値を取得
    let initialValue: boolean | undefined;
    if (type === 'INPUT') {
      initialValue = gate instanceof InputGate ? gate.getState() : false;
    } else if (type === 'OUTPUT') {
      initialValue = false;
    }
    
    return {
      id: ultraId,
      type,
      x,
      y,
      value: initialValue,
      ...(customGateInfo && {
        circuit: customGateInfo.circuit,
        inputs: customGateInfo.inputs,
        outputs: customGateInfo.outputs
      })
    };
  }

  // ゲート移動
  moveGate(ultraId: string, x: number, y: number): void {
    const internalId = this.gateIdMap.get(ultraId);
    if (!internalId) return;
    
    const gate = this.circuit.getGate(internalId);
    if (!gate) return;
    
    gate.move({ x, y });
    this.emit('gatesChanged', this.getGates());
  }

  // ゲート削除
  removeGate(ultraId: string): void {
    const internalId = this.gateIdMap.get(ultraId);
    if (!internalId) return;
    
    this.circuit.removeGate(internalId);
    this.gateIdMap.delete(ultraId);
    this.reverseGateIdMap.delete(internalId);
    this.simulationResults.delete(ultraId);
    
    this.simulate();
    this.emit('gatesChanged', this.getGates());
  }

  // 入力値切り替え
  toggleInput(ultraId: string): void {
    const internalId = this.gateIdMap.get(ultraId);
    if (!internalId) return;
    
    const gate = this.circuit.getGate(internalId);
    if (!gate || gate.type !== GateType.INPUT) return;
    
    // InputGateのtoggleメソッドを呼び出す
    if (gate instanceof InputGate) {
      gate.toggle();
    }
    
    this.simulate();
    this.emit('gatesChanged', this.getGates());
  }

  // 接続追加
  addConnection(fromUltraId: string, fromOutput: number, toUltraId: string, toInput: number): UltraModernConnection | null {
    const fromInternalId = this.gateIdMap.get(fromUltraId);
    const toInternalId = this.gateIdMap.get(toUltraId);
    
    if (!fromInternalId || !toInternalId) return null;
    
    const fromGate = this.circuit.getGate(fromInternalId);
    const toGate = this.circuit.getGate(toInternalId);
    
    if (!fromGate || !toGate) return null;
    
    const fromPin = fromGate.outputs[fromOutput];
    const toPin = toGate.inputs[toInput];
    
    if (!fromPin || !toPin) return null;
    
    try {
      const conn = this.circuit.addConnection(fromInternalId, fromOutput, toInternalId, toInput);
      
      this.simulate();
      this.emit('connectionsChanged', this.getConnections());
      
      return {
        id: conn.id,
        from: fromUltraId,
        fromOutput,
        to: toUltraId,
        toInput
      };
    } catch (error) {
      console.error('Failed to add connection:', error);
      return null;
    }
  }

  // 接続削除
  removeConnection(connectionId: string): void {
    this.circuit.removeConnection(connectionId);
    
    this.simulate();
    this.emit('connectionsChanged', this.getConnections());
  }

  // カスタムゲート登録
  registerCustomGate(name: string, definition: any): void {
    this.customGates.set(name, definition);
    // GateFactoryにも登録
    GateFactory.registerCustomGate(name, definition);
    this.emit('customGatesChanged');
  }

  // カスタムゲート取得
  getCustomGates(): Map<string, any> {
    return new Map(this.customGates);
  }

  // シミュレーション結果取得
  getSimulationResults(): Record<string, boolean | boolean[]> {
    const results: Record<string, boolean | boolean[]> = {};
    this.simulationResults.forEach((value, key) => {
      results[key] = value;
    });
    return results;
  }

  // シミュレーション実行
  simulate(): void {
    const result = this.circuit.simulate();
    
    // 結果をUltraModern形式に変換
    this.simulationResults.clear();
    
    result.gateStates.forEach((outputs, internalId) => {
      const ultraId = this.reverseGateIdMap.get(internalId);
      if (!ultraId) return;
      
      const gate = this.circuit.getGate(internalId);
      if (!gate) return;
      
      // 複数出力の場合は配列、単一出力の場合は値そのもの
      if (outputs.length > 1) {
        this.simulationResults.set(ultraId, outputs);
      } else if (outputs.length === 1) {
        this.simulationResults.set(ultraId, outputs[0]);
      }
    });
    
    this.emit('simulationCompleted', this.simulationResults);
    this.emit('simulationResultsChanged', this.simulationResults);
  }

  // カスタムゲートの内部回路シミュレーション
  simulateCustomGate(customGate: any, inputValues: boolean[]): any {
    // TODO: カスタムゲートの内部回路シミュレーション実装
    // 現在は元のロジックをそのまま使用することを想定
    return {};
  }

  // クロックゲート制御
  startClock(ultraId: string): void {
    const internalId = this.gateIdMap.get(ultraId);
    if (!internalId) return;
    
    const gate = this.circuit.getGate(internalId);
    if (gate && gate instanceof ClockGate) {
      gate.start();
      this.emit('clockStateChanged', ultraId, true);
    }
  }

  stopClock(ultraId: string): void {
    const internalId = this.gateIdMap.get(ultraId);
    if (!internalId) return;
    
    const gate = this.circuit.getGate(internalId);
    if (gate && gate instanceof ClockGate) {
      gate.stop();
      this.emit('clockStateChanged', ultraId, false);
    }
  }

  setClockInterval(ultraId: string, interval: number): void {
    const internalId = this.gateIdMap.get(ultraId);
    if (!internalId) return;
    
    const gate = this.circuit.getGate(internalId);
    if (gate && gate instanceof ClockGate) {
      gate.setInterval(interval);
      this.emit('clockIntervalChanged', ultraId, interval);
    }
  }

  getClockState(ultraId: string): { isRunning: boolean; interval: number } | null {
    const internalId = this.gateIdMap.get(ultraId);
    if (!internalId) return null;
    
    const gate = this.circuit.getGate(internalId);
    if (gate && gate instanceof ClockGate) {
      return {
        isRunning: gate.getIsRunning(),
        interval: gate.getInterval()
      };
    }
    return null;
  }

  // 回路のクリア
  clear(): void {
    this.circuit.clear();
    this.gateIdMap.clear();
    this.reverseGateIdMap.clear();
    this.simulationResults.clear();
    this.nextGateId = 1;
    
    this.emit('cleared');
  }

  // 回路データの取得（保存用）
  toJSON(): any {
    return {
      gates: this.getGates(),
      connections: this.getConnections()
    };
  }

  // 回路データの読み込み
  loadCircuit(data: any): void {
    this.clear();
    
    // ゲートを追加
    const oldToNewIdMap = new Map<string, string>();
    
    if (data.gates) {
      data.gates.forEach((gate: UltraModernGate) => {
        const newGate = this.addGate(gate.type, gate.x, gate.y);
        oldToNewIdMap.set(gate.id, newGate.id);
        
        // 入力ゲートの値を復元
        if (gate.type === 'INPUT' && gate.value !== undefined && gate.value === true) {
          this.toggleInput(newGate.id);
        }
      });
    }
    
    // 接続を追加
    if (data.connections) {
      data.connections.forEach((conn: UltraModernConnection) => {
        const newFromId = oldToNewIdMap.get(conn.from);
        const newToId = oldToNewIdMap.get(conn.to);
        
        if (newFromId && newToId) {
          this.addConnection(
            newFromId,
            conn.fromOutput || 0,
            newToId,
            conn.toInput || 0
          );
        }
      });
    }
    
    this.simulate();
    this.emit('circuitLoaded');
  }
}
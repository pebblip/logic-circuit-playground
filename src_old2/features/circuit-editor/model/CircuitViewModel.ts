import { EventEmitter } from '../../../shared/lib/utils/EventEmitter';
import { GateData, Connection, GateType, Position } from '../../../entities/types';
import { BaseGate, GateFactory, InputGate } from '../../../entities/gates';

export interface ViewModelEvents {
  gatesChanged: GateData[];
  connectionsChanged: Connection[];
  selectionChanged: string | null;
  simulationUpdated: void;
}

/**
 * CircuitViewModel - ViewModelパターンでの実装
 * ドメインモデル（BaseGate）を使用した実装
 */
export class CircuitViewModel extends EventEmitter<ViewModelEvents> {
  private gateInstances: Map<string, BaseGate> = new Map();
  private connections: Map<string, Connection> = new Map();
  private selectedGateId: string | null = null;

  constructor() {
    super();
  }

  // ゲートの追加（型から作成）
  addGateByType(type: GateType, position: Position): GateData {
    const id = GateFactory.generateId(type);
    const gate = GateFactory.createGate(type, id, position);
    this.gateInstances.set(id, gate);
    
    const gateData = gate.toGateData();
    this.emit('gatesChanged', this.getAllGates());
    
    // 追加後にシミュレーション実行
    this.simulateCircuit();
    
    return gateData;
  }

  // ゲートの取得
  getGate(gateId: string): GateData | undefined {
    const gate = this.gateInstances.get(gateId);
    return gate?.toGateData();
  }

  // すべてのゲートを取得
  getAllGates(): GateData[] {
    return Array.from(this.gateInstances.values()).map(gate => gate.toGateData());
  }

  // ゲートの更新
  updateGate(gateId: string, updates: Partial<GateData>): void {
    const gate = this.gateInstances.get(gateId);
    if (gate) {
      // 位置の更新
      if (updates.position) {
        gate.move(updates.position);
      }
      
      // 値の更新（INPUTゲート用）
      if ('value' in updates && updates.value !== undefined) {
        gate.value = updates.value;
        gate.compute();
      }
      
      this.emit('gatesChanged', this.getAllGates());
      
      // 更新後にシミュレーション実行
      if ('value' in updates || 'position' in updates) {
        this.simulateCircuit();
      }
    }
  }

  // ゲートの削除
  deleteGate(gateId: string): void {
    this.gateInstances.delete(gateId);
    
    // 関連する接続も削除
    const connectionsToDelete: string[] = [];
    this.connections.forEach((conn, id) => {
      if (conn.from.gateId === gateId || conn.to.gateId === gateId) {
        connectionsToDelete.push(id);
      }
    });
    
    connectionsToDelete.forEach(id => this.connections.delete(id));
    
    if (this.selectedGateId === gateId) {
      this.selectedGateId = null;
      this.emit('selectionChanged', null);
    }
    
    this.emit('gatesChanged', this.getAllGates());
    this.emit('connectionsChanged', this.getAllConnections());
    this.simulateCircuit();
  }

  // ゲートの選択
  selectGate(gateId: string | null): void {
    this.selectedGateId = gateId;
    this.emit('selectionChanged', gateId);
  }

  // 接続の追加
  addConnection(from: { gateId: string; pinId: string }, to: { gateId: string; pinId: string }): boolean {
    // 検証（削除 - 下のゲートインスタンスの検証で十分）
    
    // ゲートインスタンスから検証
    const fromGateInstance = this.gateInstances.get(from.gateId);
    const toGateInstance = this.gateInstances.get(to.gateId);
    
    if (!fromGateInstance || !toGateInstance) return false;
    
    // ピンの検証
    const fromPin = fromGateInstance.outputs.find(p => p.id === from.pinId);
    const toPin = toGateInstance.inputs.find(p => p.id === to.pinId);
    
    if (!fromPin || !toPin) {
      return false;
    }
    
    // 既存の接続を削除（入力ピンは1つの接続のみ）
    const existingConnection = Array.from(this.connections.values()).find(
      c => c.to.gateId === to.gateId && c.to.pinId === to.pinId
    );
    
    if (existingConnection) {
      this.connections.delete(existingConnection.id);
    }
    
    // 新しい接続を追加
    const connection: Connection = {
      id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      from,
      to
    };
    
    this.connections.set(connection.id, connection);
    this.emit('connectionsChanged', this.getAllConnections());
    this.simulateCircuit();
    
    return true;
  }

  // すべての接続を取得
  getAllConnections(): Connection[] {
    return Array.from(this.connections.values());
  }

  // INPUTゲートのトグル
  toggleInputGate(gateId: string): void {
    const gate = this.gateInstances.get(gateId);
    if (gate && gate instanceof InputGate) {
      gate.toggle();
      this.emit('gatesChanged', this.getAllGates());
      this.simulateCircuit();
    }
  }

  // シミュレーション
  private simulateCircuit(): void {
    const connections = this.getAllConnections();
    
    // 接続に基づいてピンの値を伝播
    let hasChanges = true;
    let iterations = 0;
    const maxIterations = 100;
    
    while (hasChanges && iterations < maxIterations) {
      hasChanges = false;
      iterations++;
      
      // 各ゲートについて処理
      this.gateInstances.forEach((gate, gateId) => {
        // 入力ピンの値を接続から取得
        gate.inputs.forEach(inputPin => {
          const connection = connections.find(c => 
            c.to.gateId === gateId && c.to.pinId === inputPin.id
          );
          
          if (connection) {
            const sourceGate = this.gateInstances.get(connection.from.gateId);
            if (sourceGate) {
              const sourcePin = sourceGate.outputs.find(p => p.id === connection.from.pinId);
              if (sourcePin && inputPin.value !== sourcePin.value) {
                inputPin.value = sourcePin.value;
                hasChanges = true;
              }
            }
          }
        });
        
        // ゲートの計算を実行
        const oldOutputValues = gate.outputs.map(p => p.value);
        gate.compute();
        
        // 出力が変化したかチェック
        gate.outputs.forEach((pin, index) => {
          if (oldOutputValues[index] !== pin.value) {
            hasChanges = true;
          }
        });
      });
    }
    
    this.emit('simulationUpdated', undefined as any);
    this.emit('gatesChanged', this.getAllGates());
  }

  // 現在の選択状態を取得
  getSelectedGateId(): string | null {
    return this.selectedGateId;
  }

  // Zustand用のヘルパーメソッド
  getGates(): GateData[] {
    return this.getAllGates();
  }

  getConnections(): Connection[] {
    return this.getAllConnections();
  }

  // GateDataからゲートを追加（Zustand用）
  addGate(gateData: GateData): void {
    const gate = GateFactory.createGate(gateData.type, gateData.id, gateData.position);
    
    // gateDataの値をゲートに反映
    if ('value' in gateData && gate instanceof InputGate) {
      gate.value = gateData.value;
    }
    
    this.gateInstances.set(gateData.id, gate);
    this.emit('gatesChanged', this.getAllGates());
    this.simulateCircuit();
  }

  // ゲートの削除（エイリアス）
  removeGate(gateId: string): void {
    this.deleteGate(gateId);
  }

  // ゲートの移動
  moveGate(gateId: string, x: number, y: number): void {
    this.updateGate(gateId, { position: { x, y } });
  }

  // ゲートの選択（エイリアス）
  setSelectedGate(gateId: string | null): void {
    this.selectGate(gateId);
  }

  // ピンの接続
  connectPins(sourcePin: string, targetPin: string): boolean {
    // ピンIDからゲートIDとピンIDを分離
    const [sourceGateId, sourcePinPart] = sourcePin.split('-pin-');
    const [targetGateId, targetPinPart] = targetPin.split('-pin-');
    
    if (!sourceGateId || !sourcePinPart || !targetGateId || !targetPinPart) {
      return false;
    }
    
    return this.addConnection(
      { gateId: sourceGateId, pinId: sourcePin },
      { gateId: targetGateId, pinId: targetPin }
    );
  }
}
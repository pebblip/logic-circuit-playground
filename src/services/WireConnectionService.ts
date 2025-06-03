// ワイヤー接続ロジックをサービスに分離
// circuitStore.tsからワイヤー操作関連の責任を移動

import { Gate, Wire, Position } from '../types/circuit';
import { getPinPosition, PinPosition } from '../utils/pinPositionCalculator';

export interface WireDrawingState {
  gateId: string;
  pinIndex: number;
  position: Position;
}

export class WireConnectionService {
  /**
   * ワイヤー接続の妥当性をチェック
   */
  static canConnect(
    fromGate: Gate,
    fromPinIndex: number,
    toGate: Gate,
    toPinIndex: number,
    existingWires: Wire[]
  ): { valid: boolean; reason?: string } {
    // 同じゲートには接続できない
    if (fromGate.id === toGate.id) {
      return { valid: false, reason: '同じゲートには接続できません' };
    }
    
    // 出力から入力へ、または入力から出力への接続のみ許可
    const fromIsOutput = fromPinIndex < 0;
    const toIsOutput = toPinIndex < 0;
    
    if (fromIsOutput === toIsOutput) {
      return { 
        valid: false, 
        reason: fromIsOutput ? '出力同士は接続できません' : '入力同士は接続できません' 
      };
    }
    
    // 既に同じ接続が存在しないかチェック
    const isDuplicate = existingWires.some(wire => 
      (wire.from.gateId === fromGate.id && wire.from.pinIndex === fromPinIndex &&
       wire.to.gateId === toGate.id && wire.to.pinIndex === toPinIndex) ||
      (wire.from.gateId === toGate.id && wire.from.pinIndex === toPinIndex &&
       wire.to.gateId === fromGate.id && wire.to.pinIndex === fromPinIndex)
    );
    
    if (isDuplicate) {
      return { valid: false, reason: '既に接続されています' };
    }
    
    // 入力ピンに既に接続があるかチェック（入力は1つまで）
    if (!toIsOutput) {
      const hasExistingInput = existingWires.some(wire => 
        wire.to.gateId === toGate.id && wire.to.pinIndex === toPinIndex
      );
      if (hasExistingInput) {
        return { valid: false, reason: '入力ピンには1つまでしか接続できません' };
      }
    }
    
    if (!fromIsOutput) {
      const hasExistingInput = existingWires.some(wire => 
        wire.to.gateId === fromGate.id && wire.to.pinIndex === fromPinIndex
      );
      if (hasExistingInput) {
        return { valid: false, reason: '入力ピンには1つまでしか接続できません' };
      }
    }
    
    return { valid: true };
  }
  
  /**
   * 新しいワイヤーを作成
   */
  static createWire(
    fromGate: Gate,
    fromPinIndex: number,
    toGate: Gate,
    toPinIndex: number
  ): Wire {
    // 常に出力から入力への方向で正規化
    const fromIsOutput = fromPinIndex < 0;
    
    const [outputGate, outputPin, inputGate, inputPin] = fromIsOutput
      ? [fromGate, fromPinIndex, toGate, toPinIndex]
      : [toGate, toPinIndex, fromGate, fromPinIndex];
    
    return {
      id: `wire_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      from: {
        gateId: outputGate.id,
        pinIndex: outputPin
      },
      to: {
        gateId: inputGate.id,
        pinIndex: inputPin
      },
      isActive: false
    };
  }
  
  /**
   * ワイヤー開始位置を計算
   */
  static getWireStartPosition(gate: Gate, pinIndex: number): WireDrawingState {
    const pinPosition = getPinPosition(gate, pinIndex);
    return {
      gateId: gate.id,
      pinIndex,
      position: {
        x: pinPosition.x,
        y: pinPosition.y
      }
    };
  }
  
  /**
   * ゲートに接続されているすべてのワイヤーを取得
   */
  static getConnectedWires(gateId: string, wires: Wire[]): Wire[] {
    return wires.filter(wire => 
      wire.from.gateId === gateId || wire.to.gateId === gateId
    );
  }
  
  /**
   * 特定のピンに接続されているワイヤーを取得
   */
  static getWireAtPin(gateId: string, pinIndex: number, wires: Wire[]): Wire | undefined {
    return wires.find(wire => 
      (wire.from.gateId === gateId && wire.from.pinIndex === pinIndex) ||
      (wire.to.gateId === gateId && wire.to.pinIndex === pinIndex)
    );
  }
  
  /**
   * ワイヤーのピン位置を更新（ゲート移動時）
   */
  static updateWirePositions(movedGateId: string, wires: Wire[], gates: Gate[]): Wire[] {
    // ワイヤーの位置は動的に計算されるため、
    // 実際にはワイヤーオブジェクト自体の更新は不要
    // ただし、将来的にキャッシュを持つ場合はここで更新
    return wires;
  }
  
  /**
   * 削除されるゲートに接続されているワイヤーを除外
   */
  static removeWiresConnectedToGates(gateIds: string[], wires: Wire[]): Wire[] {
    const gateIdSet = new Set(gateIds);
    return wires.filter(wire => 
      !gateIdSet.has(wire.from.gateId) && !gateIdSet.has(wire.to.gateId)
    );
  }
}
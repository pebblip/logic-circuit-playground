import { Position, GateData, Pin } from '../../../entities/types';

export interface CollisionOptions {
  isMobile?: boolean;
}

/**
 * 既存のgetPinPositionとの互換性を保つためのヘルパー関数
 */
export function getPinPosition(gate: GateData, pinId: string): Position | null {
  const detector = CollisionDetector.getInstance();
  
  // 入力ピンをチェック
  const inputPin = gate.inputs.find(p => p.id === pinId);
  if (inputPin) {
    return detector.calculatePinWorldPosition(gate, inputPin, 'input');
  }
  
  // 出力ピンをチェック
  const outputPin = gate.outputs.find(p => p.id === pinId);
  if (outputPin) {
    return detector.calculatePinWorldPosition(gate, outputPin, 'output');
  }
  
  return null;
}

/**
 * 当たり判定を統一管理するクラス
 * モバイル対応の大きなヒットエリアを提供
 */
export class CollisionDetector {
  private static instance: CollisionDetector;
  
  // ヒットエリアのサイズ定義
  private readonly PIN_HIT_RADIUS = 15; // 現在のUIと一致
  private readonly PIN_HIT_RADIUS_MOBILE = 20;
  private readonly GATE_PADDING = 5;
  
  static getInstance(): CollisionDetector {
    if (!this.instance) {
      this.instance = new CollisionDetector();
    }
    return this.instance;
  }
  
  /**
   * ピンのヒット判定
   */
  detectPinHit(
    point: Position, 
    gates: GateData[], 
    options: CollisionOptions = {}
  ): { gate: GateData; pin: Pin; position: Position } | null {
    const hitRadius = options.isMobile ? this.PIN_HIT_RADIUS_MOBILE : this.PIN_HIT_RADIUS;
    
    for (const gate of gates) {
      // 入力ピンをチェック
      for (const pin of gate.inputs) {
        const pinPos = this.calculatePinWorldPosition(gate, pin, 'input');
        if (this.isPointInCircle(point, pinPos, hitRadius)) {
          return { gate, pin, position: pinPos };
        }
      }
      
      // 出力ピンをチェック
      for (const pin of gate.outputs) {
        const pinPos = this.calculatePinWorldPosition(gate, pin, 'output');
        if (this.isPointInCircle(point, pinPos, hitRadius)) {
          return { gate, pin, position: pinPos };
        }
      }
    }
    
    return null;
  }
  
  /**
   * ゲート本体のヒット判定
   */
  detectGateHit(point: Position, gates: GateData[]): GateData | null {
    // 後ろから前に向かって検索（前面のゲートを優先）
    for (let i = gates.length - 1; i >= 0; i--) {
      const gate = gates[i];
      if (this.isPointInGate(point, gate)) {
        return gate;
      }
    }
    return null;
  }
  
  /**
   * ピンのワールド座標を計算
   * 既存のgetPinPositionと互換性を保つためpublicに
   */
  calculatePinWorldPosition(gate: GateData, pin: Pin, pinType: 'input' | 'output'): Position {
    // ゲートタイプに応じた特殊な位置計算
    if (gate.type === 'OUTPUT' && pinType === 'input') {
      return { x: gate.position.x - 30, y: gate.position.y };
    }
    
    if (gate.type === 'INPUT' && pinType === 'output') {
      return { x: gate.position.x + 35, y: gate.position.y };
    }
    
    // 通常のゲート
    const width = 70;
    const height = 50;
    
    if (pinType === 'input') {
      const index = gate.inputs.indexOf(pin);
      const yOffset = (index - (gate.inputs.length - 1) / 2) * 20;
      return { 
        x: gate.position.x - width / 2 - 10, 
        y: gate.position.y + yOffset 
      };
    } else {
      const index = gate.outputs.indexOf(pin);
      const yOffset = (index - (gate.outputs.length - 1) / 2) * 20;
      return { 
        x: gate.position.x + width / 2 + 10, 
        y: gate.position.y + yOffset 
      };
    }
  }
  
  /**
   * 点が円の中にあるかチェック
   */
  private isPointInCircle(point: Position, center: Position, radius: number): boolean {
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    return dx * dx + dy * dy <= radius * radius;
  }
  
  /**
   * 点がゲート内にあるかチェック
   */
  private isPointInGate(point: Position, gate: GateData): boolean {
    // ゲートタイプに応じたサイズ
    let width: number, height: number;
    
    if (gate.type === 'OUTPUT') {
      // LED (円形)
      return this.isPointInCircle(point, gate.position, 20 + this.GATE_PADDING);
    } else if (gate.type === 'INPUT') {
      // スイッチ (横長の矩形)
      width = 50 + this.GATE_PADDING * 2;
      height = 30 + this.GATE_PADDING * 2;
      return this.isPointInRect(point, {
        x: gate.position.x - width / 2,
        y: gate.position.y - height / 2,
        width,
        height
      });
    } else {
      // 通常のゲート
      width = 70 + this.GATE_PADDING * 2;
      height = 50 + this.GATE_PADDING * 2;
      return this.isPointInRect(point, {
        x: gate.position.x - width / 2,
        y: gate.position.y - height / 2,
        width,
        height
      });
    }
  }
  
  /**
   * 点が矩形内にあるかチェック
   */
  private isPointInRect(
    point: Position, 
    rect: { x: number; y: number; width: number; height: number }
  ): boolean {
    return point.x >= rect.x && 
           point.x <= rect.x + rect.width &&
           point.y >= rect.y && 
           point.y <= rect.y + rect.height;
  }
}
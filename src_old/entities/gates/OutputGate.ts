/**
 * 出力ゲートクラス
 */

import { ID, Position } from '@/entities/types/common';
import { GateType } from '@/entities/types/gate';
import { BaseGate } from './BaseGate';

export class OutputGate extends BaseGate {
  constructor(id: ID, position: Position) {
    super(id, GateType.OUTPUT, position);
  }

  protected initializePins(): void {
    // 出力ゲートは入力ピンのみを持つ（最終出力なので出力ピンは不要）
    this._inputs = [
      this.createPin('IN', 'input', 0, 1)
    ];
    
    // 出力ピンは作成しない
    this._outputs = [];
  }

  public compute(): void {
    // 出力ゲートは入力値を保持するのみ（出力ピンがないため）
    // 値は getInputValue(0) で取得可能
  }

  public getValue(): boolean {
    return this.getInputValue(0);
  }

  public clone(newId: ID): OutputGate {
    return new OutputGate(newId, { ...this._position });
  }
}
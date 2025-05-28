/**
 * 出力ゲートクラス
 */

import { ID, Position } from '@/types/common';
import { GateType } from '@/types/gate';
import { BaseGate } from './BaseGate';

export class OutputGate extends BaseGate {
  constructor(id: ID, position: Position) {
    super(id, GateType.OUTPUT, position);
  }

  protected initializePins(): void {
    // 出力ゲートは入力ピンのみ
    this._inputs = [
      this.createPin('IN', 'input', 0, 1)
    ];
  }

  public compute(): void {
    // 出力ゲートは入力をそのまま内部状態として保持
    // 視覚化のため
  }

  public getValue(): boolean {
    return this.getInputValue(0);
  }

  public clone(newId: ID): OutputGate {
    return new OutputGate(newId, { ...this._position });
  }
}
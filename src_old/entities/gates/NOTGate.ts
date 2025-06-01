/**
 * NOTゲートクラス
 */

import { ID, Position } from '@/entities/types/common';
import { GateType } from '@/entities/types/gate';
import { BaseGate } from './BaseGate';

export class NOTGate extends BaseGate {
  constructor(id: ID, position: Position) {
    super(id, GateType.NOT, position);
  }

  protected initializePins(): void {
    // 1つの入力ピン
    this._inputs = [
      this.createPin('IN', 'input', 0, 1)
    ];

    // 1つの出力ピン
    this._outputs = [
      this.createPin('OUT', 'output', 0, 1)
    ];
  }

  public compute(): void {
    const input = this.getInputValue(0);
    this.setOutputValue(0, !input);
  }

  public clone(newId: ID): NOTGate {
    return new NOTGate(newId, { ...this._position });
  }
}
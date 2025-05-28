/**
 * XORゲートクラス
 */

import { ID, Position } from '@/types/common';
import { GateType } from '@/types/gate';
import { BaseGate } from './BaseGate';

export class XORGate extends BaseGate {
  constructor(id: ID, position: Position) {
    super(id, GateType.XOR, position);
  }

  protected initializePins(): void {
    // 2つの入力ピン
    this._inputs = [
      this.createPin('A', 'input', 0, 2),
      this.createPin('B', 'input', 1, 2)
    ];

    // 1つの出力ピン
    this._outputs = [
      this.createPin('OUT', 'output', 0, 1)
    ];
  }

  public compute(): void {
    const a = this.getInputValue(0);
    const b = this.getInputValue(1);
    this.setOutputValue(0, a !== b);  // XOR: 異なる時true
  }

  public clone(newId: ID): XORGate {
    return new XORGate(newId, { ...this._position });
  }
}
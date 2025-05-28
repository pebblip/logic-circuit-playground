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
    // 出力ゲートは入力ピンと出力ピンの両方を持つ
    this._inputs = [
      this.createPin('IN', 'input', 0, 1)
    ];
    
    // 視覚化のために出力ピンも作成
    this._outputs = [
      this.createPin('OUT', 'output', 0, 1)
    ];
  }

  public compute(): void {
    // 入力値をそのまま出力に反映
    const inputValue = this.getInputValue(0);
    this.setOutputValue(0, inputValue);
  }

  public getValue(): boolean {
    return this.getInputValue(0);
  }

  public clone(newId: ID): OutputGate {
    return new OutputGate(newId, { ...this._position });
  }
}
/**
 * INPUTゲート（スイッチ）
 */

import { BaseGate } from './BaseGate';
import { Pin } from '../circuit/Pin';
import { Position } from '../types';

export class InputGate extends BaseGate {
  constructor(id: string, position: Position, initialValue: boolean = false) {
    super(id, 'INPUT', position);
    this._value = initialValue;
  }

  protected initializePins(): void {
    // 入力なし、1出力
    this._outputs.push(
      new Pin(`${this.id}-out-0`, 'output', { x: 35, y: 0 })
    );
  }

  public compute(): void {
    // 内部値を出力に反映
    if (this._outputs.length > 0) {
      this._outputs[0].value = this._value ?? false;
    }
  }

  // 値をトグル
  public toggle(): void {
    this._value = !this._value;
    this.compute();
  }

  // 値を設定
  public setValue(value: boolean): void {
    this._value = value;
    this.compute();
  }
}
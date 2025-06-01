/**
 * OUTPUTゲート（LED）
 */

import { BaseGate } from './BaseGate';
import { Pin } from '../circuit/Pin';
import { Position } from '../types';

export class OutputGate extends BaseGate {
  constructor(id: string, position: Position) {
    super(id, 'OUTPUT', position);
  }

  protected initializePins(): void {
    // 1入力、出力なし
    this._inputs.push(
      new Pin(`${this.id}-in-0`, 'input', { x: -30, y: 0 })
    );
  }

  public compute(): void {
    // 入力値を内部値として保持（表示用）
    if (this._inputs.length > 0) {
      this._value = this._inputs[0].value;
    }
  }

  // 現在の状態を取得
  public isOn(): boolean {
    return this._value ?? false;
  }
}
/**
 * NOTゲート
 */

import { BaseGate } from './BaseGate';
import { Pin } from '../circuit/Pin';
import { Position } from '../types';

export class NOTGate extends BaseGate {
  constructor(id: string, position: Position) {
    super(id, 'NOT', position);
  }

  protected initializePins(): void {
    // 1入力
    this._inputs.push(
      new Pin(`${this.id}-in-0`, 'input', { x: -35, y: 0 })
    );
    
    // 1出力
    this._outputs.push(
      new Pin(`${this.id}-out-0`, 'output', { x: 35, y: 0 })
    );
  }

  public compute(): void {
    // 入力を反転
    const result = this._inputs.length > 0 ? !this._inputs[0].value : false;
    
    if (this._outputs.length > 0) {
      this._outputs[0].value = result;
    }
  }
}
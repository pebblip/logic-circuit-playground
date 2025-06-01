/**
 * ANDゲート
 */

import { BaseGate } from './BaseGate';
import { Pin } from '../circuit/Pin';
import { Position } from '../types';

export class ANDGate extends BaseGate {
  constructor(id: string, position: Position) {
    super(id, 'AND', position);
  }

  protected initializePins(): void {
    // 2入力
    this._inputs.push(
      new Pin(`${this.id}-in-0`, 'input', { x: -35, y: -10 }),
      new Pin(`${this.id}-in-1`, 'input', { x: -35, y: 10 })
    );
    
    // 1出力
    this._outputs.push(
      new Pin(`${this.id}-out-0`, 'output', { x: 35, y: 0 })
    );
  }

  public compute(): void {
    // すべての入力がtrueの場合のみtrue
    const result = this._inputs.length > 0 && 
                   this._inputs.every(input => input.value);
    
    if (this._outputs.length > 0) {
      this._outputs[0].value = result;
    }
  }
}
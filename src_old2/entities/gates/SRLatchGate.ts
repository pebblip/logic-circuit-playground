import { BaseGate, GateType } from './BaseGate';
import { Pin } from '../circuit/Pin';
import { Position } from '../../domain/services/GatePlacement';

export class SRLatchGate extends BaseGate {
  constructor(id: string, position: Position) {
    super(id, 'SR-LATCH' as GateType, position);
  }

  protected initializePins(): void {
    // S(Set)とR(Reset)入力
    this._inputs.push(
      new Pin(`${this.id}-in-0`, 'input', { x: -50, y: -20 }), // S
      new Pin(`${this.id}-in-1`, 'input', { x: -50, y: 20 })   // R
    );
    
    // Q出力とQ'出力
    this._outputs.push(
      new Pin(`${this.id}-out-0`, 'output', { x: 50, y: -20 }), // Q
      new Pin(`${this.id}-out-1`, 'output', { x: 50, y: 20 })   // Q'
    );
  }

  public compute(): void {
    const s = this._inputs[0]?.value ?? false;
    const r = this._inputs[1]?.value ?? false;
    const currentQ = this._outputs[0]?.value ?? false;
    
    if (s && !r) {
      // Set
      if (this._outputs[0]) this._outputs[0].value = true;
      if (this._outputs[1]) this._outputs[1].value = false;
    } else if (!s && r) {
      // Reset
      if (this._outputs[0]) this._outputs[0].value = false;
      if (this._outputs[1]) this._outputs[1].value = true;
    }
    // s=false, r=false の場合は状態維持
    // s=true, r=true は無効状態（避けるべき）
  }
}
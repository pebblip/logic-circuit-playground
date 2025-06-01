import { BaseGate, GateType } from './BaseGate';
import { Pin } from '../circuit/Pin';
import { Position } from '../../domain/services/GatePlacement';

export class XORGate extends BaseGate {
  constructor(id: string, position: Position) {
    super(id, 'XOR' as GateType, position);
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
    const a = this._inputs[0]?.value ?? false;
    const b = this._inputs[1]?.value ?? false;
    if (this._outputs.length > 0) {
      this._outputs[0].value = a !== b;
    }
  }
}
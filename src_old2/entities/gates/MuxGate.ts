import { BaseGate, GateType } from './BaseGate';
import { Pin } from '../circuit/Pin';
import { Position } from '../../domain/services/GatePlacement';

export class MuxGate extends BaseGate {
  constructor(id: string, position: Position) {
    super(id, 'MUX' as GateType, position);
  }

  protected initializePins(): void {
    // 2つのデータ入力と1つの選択入力
    this._inputs.push(
      new Pin(`${this.id}-in-0`, 'input', { x: -50, y: -30 }), // A
      new Pin(`${this.id}-in-1`, 'input', { x: -50, y: 0 }),   // B
      new Pin(`${this.id}-in-2`, 'input', { x: -50, y: 30 })   // SEL
    );
    
    // 1つの出力
    this._outputs.push(
      new Pin(`${this.id}-out-0`, 'output', { x: 50, y: 0 })
    );
  }

  public compute(): void {
    const a = this._inputs[0]?.value ?? false;
    const b = this._inputs[1]?.value ?? false;
    const sel = this._inputs[2]?.value ?? false;
    
    // SEL=0ならA、SEL=1ならBを出力
    if (this._outputs[0]) {
      this._outputs[0].value = sel ? b : a;
    }
  }
}
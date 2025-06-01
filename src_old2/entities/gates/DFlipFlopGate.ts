import { BaseGate, GateType } from './BaseGate';
import { Pin } from '../circuit/Pin';
import { Position } from '../../domain/services/GatePlacement';

export class DFlipFlopGate extends BaseGate {
  private _previousClockValue: boolean = false;

  constructor(id: string, position: Position) {
    super(id, 'D-FLIPFLOP' as GateType, position);
  }

  protected initializePins(): void {
    // D入力とクロック入力
    this._inputs.push(
      new Pin(`${this.id}-in-0`, 'input', { x: -50, y: -20 }), // D
      new Pin(`${this.id}-in-1`, 'input', { x: -50, y: 20 })   // CLK
    );
    
    // Q出力とQ'出力
    this._outputs.push(
      new Pin(`${this.id}-out-0`, 'output', { x: 50, y: -20 }), // Q
      new Pin(`${this.id}-out-1`, 'output', { x: 50, y: 20 })   // Q'
    );
  }

  public compute(): void {
    const d = this._inputs[0]?.value ?? false;
    const clk = this._inputs[1]?.value ?? false;
    
    // 立ち上がりエッジ検出
    if (clk && !this._previousClockValue) {
      if (this._outputs[0]) this._outputs[0].value = d;
      if (this._outputs[1]) this._outputs[1].value = !d;
    }
    
    this._previousClockValue = clk;
  }
}
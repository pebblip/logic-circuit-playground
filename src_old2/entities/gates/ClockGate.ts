import { BaseGate, GateType } from './BaseGate';
import { Pin } from '../circuit/Pin';
import { Position } from '../../domain/services/GatePlacement';

export class ClockGate extends BaseGate {
  private _frequency: number = 1; // Hz
  private _isRunning: boolean = false;

  constructor(id: string, position: Position) {
    super(id, 'CLOCK' as GateType, position);
  }

  protected initializePins(): void {
    // CLOCKは出力のみ
    this._outputs.push(
      new Pin(`${this.id}-out-0`, 'output', { x: 40, y: 0 })
    );
  }

  public compute(): void {
    // CLOCKの値はタイマーで制御される
    if (this._outputs.length > 0 && this._isRunning) {
      // 実際のクロック実装は別途必要
      this._outputs[0].value = this._value ?? false;
    }
  }

  public start(): void {
    this._isRunning = true;
  }

  public stop(): void {
    this._isRunning = false;
  }
}
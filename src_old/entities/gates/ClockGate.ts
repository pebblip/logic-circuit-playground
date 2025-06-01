import { BaseGate } from './BaseGate';
import { ID, Position, PinType } from '../types/common';
import { GateType } from '../types/gate';
import { Pin } from '../circuit/Pin';

export class ClockGate extends BaseGate {
  private interval: number; // ミリ秒単位
  private isRunning: boolean = false;
  private timer: NodeJS.Timeout | null = null;
  private lastToggleTime: number = 0;
  private _state: boolean = false; // 内部状態を追加
  public onToggle?: () => void; // トグル時のコールバック
  
  constructor(id: ID, position: Position, interval: number = 1000) {
    super(id, GateType.CLOCK, position);
    this.interval = interval;
  }
  
  protected initializePins(): void {
    // クロックゲートは出力ピンのみ
    this._outputs = [
      new Pin(`${this._id}_out_0`, 'CLK', PinType.OUTPUT, {
        x: this._position.x + this._size.width / 2 + 8,
        y: this._position.y
      })
    ];
  }
  
  public compute(): void {
    // 内部状態を出力に反映
    this.setOutputValue(0, this._state);
  }
  
  public start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.timer = setInterval(() => {
      this.toggle();
      // シミュレーションをトリガーするために、外部からコールバックを設定できるようにする
      if (this.onToggle) {
        this.onToggle();
      }
    }, this.interval);
  }
  
  public stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
  
  public toggle(): void {
    this._state = !this._state;
    this.setOutputValue(0, this._state);
    this.lastToggleTime = Date.now();
  }
  
  public setInterval(interval: number): void {
    this.interval = interval;
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }
  
  public getInterval(): number {
    return this.interval;
  }
  
  public getIsRunning(): boolean {
    return this.isRunning;
  }
  
  public getLastToggleTime(): number {
    return this.lastToggleTime;
  }
  
  public clone(newId: ID): ClockGate {
    return new ClockGate(newId, { ...this._position }, this.interval);
  }
  
  public serialize(): any {
    return {
      ...super.serialize(),
      interval: this.interval,
      isRunning: this.isRunning,
      outputValue: this._outputs[0].value
    };
  }
  
  public static deserialize(data: any): ClockGate {
    const gate = new ClockGate(data.id, data.position, data.interval);
    if (data.outputValue !== undefined) {
      gate._outputs[0].value = data.outputValue;
    }
    if (data.isRunning) {
      gate.start();
    }
    return gate;
  }
  
  public destroy(): void {
    this.stop();
  }
}
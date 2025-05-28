/**
 * 入力ゲートクラス
 */

import { ID, Position } from '@/types/common';
import { GateType } from '@/types/gate';
import { BaseGate } from './BaseGate';

export class InputGate extends BaseGate {
  private _state: boolean = false;

  constructor(id: ID, position: Position) {
    super(id, GateType.INPUT, position);
  }

  protected initializePins(): void {
    // 入力ゲートは出力ピンのみ
    this._outputs = [
      this.createPin('OUT', 'output', 0, 1)
    ];
  }

  public compute(): void {
    // 入力ゲートは内部状態を出力
    this.setOutputValue(0, this._state);
  }

  public toggle(): void {
    this._state = !this._state;
    this.compute();
  }

  public setState(value: boolean): void {
    this._state = value;
    this.compute();
  }

  public getState(): boolean {
    return this._state;
  }

  public clone(newId: ID): InputGate {
    const clone = new InputGate(newId, { ...this._position });
    clone.setState(this._state);
    return clone;
  }

  toJSON() {
    const json = super.toJSON();
    return {
      ...json,
      state: this._state
    };
  }
}
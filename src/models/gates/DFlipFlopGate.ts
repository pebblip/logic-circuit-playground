import { BaseGate } from './BaseGate';
import { GateType } from '../../types/gate';
import { Position } from '../../types/common';

/**
 * Dフリップフロップゲート
 * - 入力: D (データ), CLK (クロック)
 * - 出力: Q (現在の状態), Q' (反転状態)
 * - クロックの立ち上がりエッジでD入力の値を記憶
 */
export class DFlipFlopGate extends BaseGate {
  private _state: boolean = false;  // 内部状態（Q出力）
  private _lastClockState: boolean = false;  // 前回のクロック状態

  constructor(id: string, x: number, y: number) {
    super(id, 'D_FLIP_FLOP', { x, y });
  }

  protected initializePins(): void {
    // 入力ピン: D (データ), CLK (クロック)
    this._inputs = [
      this.createPin('D', 'input', 0, 2),   // データ入力
      this.createPin('CLK', 'input', 1, 2)  // クロック入力
    ];
    
    // 出力ピン: Q (現在の状態), Q' (反転状態)
    this._outputs = [
      this.createPin('Q', 'output', 0, 2),    // 現在の状態
      this.createPin('Q\'', 'output', 1, 2)   // 反転状態
    ];
  }

  public compute(): void {
    const dataInput = this.getInputValue(0);  // D入力
    const clockInput = this.getInputValue(1); // CLK入力

    // クロックの立ち上がりエッジを検出
    if (!this._lastClockState && clockInput) {
      // 立ち上がりエッジ: D入力の値を記憶
      this._state = dataInput;
    }

    // クロック状態を更新
    this._lastClockState = clockInput;

    // 出力を設定
    this.setOutputValue(0, this._state);     // Q出力
    this.setOutputValue(1, !this._state);    // Q'出力（反転）
  }

  /**
   * 内部状態をリセット
   */
  public reset(): void {
    this._state = false;
    this._lastClockState = false;
    this.setOutputValue(0, false);
    this.setOutputValue(1, true);
  }

  /**
   * 内部状態を取得（デバッグ用）
   */
  public getState(): boolean {
    return this._state;
  }

  /**
   * シリアライズ用
   */
  public toJSON(): any {
    return {
      ...super.toJSON(),
      state: this._state,
      lastClockState: this._lastClockState
    };
  }

  /**
   * デシリアライズ用
   */
  public static fromJSON(json: any): DFlipFlopGate {
    const gate = new DFlipFlopGate(json.id, json.position.x, json.position.y);
    if (json.state !== undefined) {
      gate._state = json.state;
    }
    if (json.lastClockState !== undefined) {
      gate._lastClockState = json.lastClockState;
    }
    return gate;
  }

  /**
   * クローンメソッド
   */
  public clone(newId: string): DFlipFlopGate {
    const cloned = new DFlipFlopGate(newId, this.position.x, this.position.y);
    cloned._state = this._state;
    cloned._lastClockState = this._lastClockState;
    return cloned;
  }
}
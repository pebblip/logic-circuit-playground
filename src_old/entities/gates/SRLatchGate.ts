import { BaseGate } from './BaseGate';
import { GateType } from '../types/gate';
import { Position } from '../types/common';

/**
 * SRラッチゲート
 * - 入力: S (セット), R (リセット)
 * - 出力: Q (現在の状態), Q' (反転状態)
 * - S=1, R=0: セット（Q=1）
 * - S=0, R=1: リセット（Q=0）
 * - S=0, R=0: 保持（前の状態を維持）
 * - S=1, R=1: 禁止状態（不定）
 */
export class SRLatchGate extends BaseGate {
  private _state: boolean = false;  // 内部状態（Q出力）
  private _isInvalidState: boolean = false;  // 禁止状態フラグ

  constructor(id: string, x: number, y: number) {
    super(id, 'SR_LATCH', { x, y });
  }

  protected initializePins(): void {
    // 入力ピン: S (セット), R (リセット)
    this._inputs = [
      this.createPin('S', 'input', 0, 2),   // セット入力
      this.createPin('R', 'input', 1, 2)    // リセット入力
    ];
    
    // 出力ピン: Q (現在の状態), Q' (反転状態)
    this._outputs = [
      this.createPin('Q', 'output', 0, 2),    // 現在の状態
      this.createPin('Q\'', 'output', 1, 2)   // 反転状態
    ];
  }

  public compute(): void {
    const setInput = this.getInputValue(0);    // S入力
    const resetInput = this.getInputValue(1);  // R入力

    // SRラッチの真理値表に基づく動作
    if (setInput && resetInput) {
      // S=1, R=1: 禁止状態
      // 実際のハードウェアでは不定だが、シミュレーションでは両出力を0にする
      this._isInvalidState = true;
      this.setOutputValue(0, false);  // Q=0
      this.setOutputValue(1, false);  // Q'=0（通常はQ'=!Qだが、禁止状態では両方0）
    } else if (setInput && !resetInput) {
      // S=1, R=0: セット
      this._state = true;
      this._isInvalidState = false;
      this.setOutputValue(0, true);   // Q=1
      this.setOutputValue(1, false);  // Q'=0
    } else if (!setInput && resetInput) {
      // S=0, R=1: リセット
      this._state = false;
      this._isInvalidState = false;
      this.setOutputValue(0, false);  // Q=0
      this.setOutputValue(1, true);   // Q'=1
    } else {
      // S=0, R=0: 保持
      if (!this._isInvalidState) {
        // 禁止状態でなければ、前の状態を維持
        this.setOutputValue(0, this._state);     // Q=前の状態
        this.setOutputValue(1, !this._state);    // Q'=!Q
      } else {
        // 禁止状態から抜けた場合、不定となる
        // シミュレーションでは0に初期化
        this._state = false;
        this._isInvalidState = false;
        this.setOutputValue(0, false);
        this.setOutputValue(1, true);
      }
    }
  }

  /**
   * 内部状態をリセット
   */
  public reset(): void {
    this._state = false;
    this._isInvalidState = false;
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
   * 禁止状態かどうかを取得
   */
  public isInvalidState(): boolean {
    return this._isInvalidState;
  }

  /**
   * シリアライズ用
   */
  public toJSON(): any {
    return {
      ...super.toJSON(),
      state: this._state,
      isInvalidState: this._isInvalidState
    };
  }

  /**
   * デシリアライズ用
   */
  public static fromJSON(json: any): SRLatchGate {
    const gate = new SRLatchGate(json.id, json.position.x, json.position.y);
    if (json.state !== undefined) {
      gate._state = json.state;
    }
    if (json.isInvalidState !== undefined) {
      gate._isInvalidState = json.isInvalidState;
    }
    return gate;
  }

  /**
   * クローンメソッド
   */
  public clone(newId: string): SRLatchGate {
    const cloned = new SRLatchGate(newId, this.position.x, this.position.y);
    cloned._state = this._state;
    cloned._isInvalidState = this._isInvalidState;
    return cloned;
  }
}
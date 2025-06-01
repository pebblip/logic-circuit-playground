import { BaseGate } from './BaseGate';
import { Position } from '../types/common';

/**
 * 4ビットレジスタゲート
 * - 入力: D0-D3 (データ入力 4ビット), CLK (クロック), RST (リセット)
 * - 出力: Q0-Q3 (データ出力 4ビット)
 * - クロックの立ち上がりエッジで4ビットのデータを記憶
 * - RST=1で全ビットを0にリセット
 */
export class Register4BitGate extends BaseGate {
  private _state: boolean[] = [false, false, false, false];  // 4ビットの内部状態
  private _lastClockState: boolean = false;  // 前回のクロック状態

  constructor(id: string, x: number, y: number) {
    super(id, 'REGISTER_4BIT', { x, y });
  }

  protected initializePins(): void {
    // 入力ピン: D0-D3 (データ), CLK (クロック), RST (リセット)
    this._inputs = [
      this.createPin('D0', 'input', 0, 6),
      this.createPin('D1', 'input', 1, 6),
      this.createPin('D2', 'input', 2, 6),
      this.createPin('D3', 'input', 3, 6),
      this.createPin('CLK', 'input', 4, 6),
      this.createPin('RST', 'input', 5, 6)
    ];
    
    // 出力ピン: Q0-Q3 (データ出力)
    this._outputs = [
      this.createPin('Q0', 'output', 0, 4),
      this.createPin('Q1', 'output', 1, 4),
      this.createPin('Q2', 'output', 2, 4),
      this.createPin('Q3', 'output', 3, 4)
    ];
  }

  public compute(): void {
    const clockInput = this.getInputValue(4);  // CLK入力
    const resetInput = this.getInputValue(5);  // RST入力

    // リセット信号が有効な場合
    if (resetInput) {
      this._state = [false, false, false, false];
      // 全出力を0に設定
      for (let i = 0; i < 4; i++) {
        this.setOutputValue(i, false);
      }
      this._lastClockState = clockInput;
      return;
    }

    // クロックの立ち上がりエッジを検出
    if (!this._lastClockState && clockInput) {
      // 立ち上がりエッジ: D0-D3の値を記憶
      for (let i = 0; i < 4; i++) {
        this._state[i] = this.getInputValue(i);
      }
    }

    // クロック状態を更新
    this._lastClockState = clockInput;

    // 出力を設定
    for (let i = 0; i < 4; i++) {
      this.setOutputValue(i, this._state[i]);
    }
  }

  /**
   * 内部状態をリセット
   */
  public reset(): void {
    this._state = [false, false, false, false];
    this._lastClockState = false;
    for (let i = 0; i < 4; i++) {
      this.setOutputValue(i, false);
    }
  }

  /**
   * 内部状態を取得（デバッグ用）
   */
  public getState(): boolean[] {
    return [...this._state];
  }

  /**
   * 内部状態を10進数として取得
   */
  public getStateAsDecimal(): number {
    let value = 0;
    for (let i = 0; i < 4; i++) {
      if (this._state[i]) {
        value |= (1 << i);
      }
    }
    return value;
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
  public static fromJSON(json: any): Register4BitGate {
    const gate = new Register4BitGate(json.id, json.position.x, json.position.y);
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
  public clone(newId: string): Register4BitGate {
    const cloned = new Register4BitGate(newId, this.position.x, this.position.y);
    cloned._state = [...this._state];
    cloned._lastClockState = this._lastClockState;
    return cloned;
  }
}
import { BaseGate } from './BaseGate';
import { Position } from '../types/common';

/**
 * 4ビット数値入力ゲート
 * - 入力: なし（ユーザーが数値を設定）
 * - 出力: D0-D3 (4ビットのバイナリ出力)
 * - 0〜15の数値を入力でき、4ビットのバイナリ信号として出力
 */
export class Number4BitInputGate extends BaseGate {
  private _value: number = 0; // 0-15の値

  constructor(id: string, x: number, y: number) {
    super(id, 'NUMBER_4BIT_INPUT', { x, y });
    this._size = { width: 80, height: 60 };
  }

  protected initializePins(): void {
    // 入力ピンなし
    this._inputs = [];
    
    // 出力ピン: D0-D3 (4ビット)
    this._outputs = [
      this.createPin('D0', 'output', 0, 4), // LSB
      this.createPin('D1', 'output', 1, 4),
      this.createPin('D2', 'output', 2, 4),
      this.createPin('D3', 'output', 3, 4)  // MSB
    ];
  }

  public compute(): void {
    // 設定された値を4ビットのバイナリに変換して出力
    for (let i = 0; i < 4; i++) {
      this.setOutputValue(i, (this._value & (1 << i)) !== 0);
    }
  }

  /**
   * 数値を設定（0-15）
   */
  public setValue(value: number): void {
    this._value = Math.max(0, Math.min(15, Math.floor(value)));
    this.compute();
  }

  /**
   * 現在の値を取得
   */
  public getValue(): number {
    return this._value;
  }

  /**
   * インクリメント（最大15まで）
   */
  public increment(): void {
    if (this._value < 15) {
      this._value++;
      this.compute();
    }
  }

  /**
   * デクリメント（最小0まで）
   */
  public decrement(): void {
    if (this._value > 0) {
      this._value--;
      this.compute();
    }
  }

  /**
   * シリアライズ用
   */
  public toJSON(): any {
    return {
      ...super.toJSON(),
      value: this._value
    };
  }

  /**
   * デシリアライズ用
   */
  public static fromJSON(json: any): Number4BitInputGate {
    const gate = new Number4BitInputGate(json.id, json.position.x, json.position.y);
    if (json.value !== undefined) {
      gate._value = json.value;
    }
    return gate;
  }

  /**
   * クローンメソッド
   */
  public clone(newId: string): Number4BitInputGate {
    const cloned = new Number4BitInputGate(newId, this.position.x, this.position.y);
    cloned._value = this._value;
    return cloned;
  }
}
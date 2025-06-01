import { BaseGate } from './BaseGate';
import { Position } from '../types/common';

/**
 * 4ビット数値表示ゲート
 * - 入力: D0-D3 (4ビットのバイナリ入力)
 * - 出力: なし（数値を表示するのみ）
 * - 4ビットのバイナリ信号を受け取り、0〜15の10進数として表示
 */
export class Number4BitDisplayGate extends BaseGate {
  private _displayValue: number = 0;

  constructor(id: string, x: number, y: number) {
    super(id, 'NUMBER_4BIT_DISPLAY', { x, y });
    this._size = { width: 80, height: 60 };
  }

  protected initializePins(): void {
    // 入力ピン: D0-D3 (4ビット)
    this._inputs = [
      this.createPin('D0', 'input', 0, 4), // LSB
      this.createPin('D1', 'input', 1, 4),
      this.createPin('D2', 'input', 2, 4),
      this.createPin('D3', 'input', 3, 4)  // MSB
    ];
    
    // 出力ピンなし
    this._outputs = [];
  }

  public compute(): void {
    // 4ビットの入力から10進数を計算
    let value = 0;
    for (let i = 0; i < 4; i++) {
      if (this.getInputValue(i)) {
        value |= (1 << i);
      }
    }
    this._displayValue = value;
  }

  /**
   * 表示値を取得
   */
  public getDisplayValue(): number {
    return this._displayValue;
  }

  /**
   * バイナリ文字列として取得（デバッグ用）
   */
  public getBinaryString(): string {
    let binary = '';
    for (let i = 3; i >= 0; i--) {
      binary += this.getInputValue(i) ? '1' : '0';
    }
    return binary;
  }

  /**
   * シリアライズ用
   */
  public toJSON(): any {
    return {
      ...super.toJSON(),
      displayValue: this._displayValue
    };
  }

  /**
   * デシリアライズ用
   */
  public static fromJSON(json: any): Number4BitDisplayGate {
    const gate = new Number4BitDisplayGate(json.id, json.position.x, json.position.y);
    if (json.displayValue !== undefined) {
      gate._displayValue = json.displayValue;
    }
    return gate;
  }

  /**
   * クローンメソッド
   */
  public clone(newId: string): Number4BitDisplayGate {
    const cloned = new Number4BitDisplayGate(newId, this.position.x, this.position.y);
    cloned._displayValue = this._displayValue;
    return cloned;
  }
}
import { BaseGate } from './BaseGate';
import { Position } from '../types/common';

/**
 * 4ビット加算器ゲート
 * - 入力: A0-A3, B0-B3 (4ビットの加算入力), Cin (桁上げ入力)
 * - 出力: S0-S3 (4ビットの和), Cout (桁上げ出力)
 * - 4つの全加算器を連結して4ビットの加算を行う
 */
export class Adder4BitGate extends BaseGate {
  constructor(id: string, x: number, y: number) {
    super(id, 'ADDER_4BIT', { x, y });
    // サイズを大きくして配線しやすくする
    this._size = { width: 100, height: 120 };
  }

  protected initializePins(): void {
    // 入力ピン: A0-A3, B0-B3, Cin (9ピン)
    this._inputs = [
      // Aの4ビット (左側上部)
      this.createPin('A0', 'input', 0, 9),
      this.createPin('A1', 'input', 1, 9),
      this.createPin('A2', 'input', 2, 9),
      this.createPin('A3', 'input', 3, 9),
      // Bの4ビット (左側下部)
      this.createPin('B0', 'input', 4, 9),
      this.createPin('B1', 'input', 5, 9),
      this.createPin('B2', 'input', 6, 9),
      this.createPin('B3', 'input', 7, 9),
      // 桁上げ入力 (左側最下部)
      this.createPin('Cin', 'input', 8, 9)
    ];
    
    // 出力ピン: S0-S3, Cout (5ピン)
    this._outputs = [
      // 和の4ビット (右側)
      this.createPin('S0', 'output', 0, 5),
      this.createPin('S1', 'output', 1, 5),
      this.createPin('S2', 'output', 2, 5),
      this.createPin('S3', 'output', 3, 5),
      // 桁上げ出力 (右側最下部)
      this.createPin('Cout', 'output', 4, 5)
    ];
  }

  public compute(): void {
    // 各ビットの入力を取得
    const a = [
      this.getInputValue(0), // A0
      this.getInputValue(1), // A1
      this.getInputValue(2), // A2
      this.getInputValue(3)  // A3
    ];
    
    const b = [
      this.getInputValue(4), // B0
      this.getInputValue(5), // B1
      this.getInputValue(6), // B2
      this.getInputValue(7)  // B3
    ];
    
    let carry = this.getInputValue(8); // Cin
    const sum: boolean[] = [];

    // 4ビットの加算をLSBから順に計算
    for (let i = 0; i < 4; i++) {
      // 全加算器の論理
      const aXorB = a[i] !== b[i];
      sum[i] = aXorB !== carry;
      carry = (a[i] && b[i]) || (carry && aXorB);
    }

    // 出力を設定
    for (let i = 0; i < 4; i++) {
      this.setOutputValue(i, sum[i]);
    }
    this.setOutputValue(4, carry); // 最終的な桁上げ
  }

  /**
   * 入力値を10進数として取得（デバッグ用）
   */
  public getInputAAsDecimal(): number {
    let value = 0;
    for (let i = 0; i < 4; i++) {
      if (this.getInputValue(i)) {
        value |= (1 << i);
      }
    }
    return value;
  }

  public getInputBAsDecimal(): number {
    let value = 0;
    for (let i = 0; i < 4; i++) {
      if (this.getInputValue(i + 4)) {
        value |= (1 << i);
      }
    }
    return value;
  }

  /**
   * 出力値を10進数として取得（デバッグ用）
   */
  public getOutputAsDecimal(): number {
    let value = 0;
    for (let i = 0; i < 4; i++) {
      if (this.getOutputValue(i)) {
        value |= (1 << i);
      }
    }
    return value;
  }

  /**
   * クローンメソッド
   */
  public clone(newId: string): Adder4BitGate {
    return new Adder4BitGate(newId, this.position.x, this.position.y);
  }
}
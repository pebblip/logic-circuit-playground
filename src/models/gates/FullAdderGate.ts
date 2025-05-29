import { BaseGate } from './BaseGate';
import { Position } from '../../types/common';

/**
 * 全加算器ゲート
 * - 入力: A, B (1ビットの加算入力), Cin (下位からの桁上げ入力)
 * - 出力: S (和), Cout (桁上げ出力)
 * - 真理値表:
 *   A B Cin | S Cout
 *   0 0 0   | 0 0
 *   0 0 1   | 1 0
 *   0 1 0   | 1 0
 *   0 1 1   | 0 1
 *   1 0 0   | 1 0
 *   1 0 1   | 0 1
 *   1 1 0   | 0 1
 *   1 1 1   | 1 1
 */
export class FullAdderGate extends BaseGate {
  constructor(id: string, x: number, y: number) {
    super(id, 'FULL_ADDER', { x, y });
  }

  protected initializePins(): void {
    // 入力ピン: A, B, Cin
    this._inputs = [
      this.createPin('A', 'input', 0, 3),
      this.createPin('B', 'input', 1, 3),
      this.createPin('Cin', 'input', 2, 3)
    ];
    
    // 出力ピン: S (和), Cout (桁上げ)
    this._outputs = [
      this.createPin('S', 'output', 0, 2),     // Sum
      this.createPin('Cout', 'output', 1, 2)   // Carry out
    ];
  }

  public compute(): void {
    const a = this.getInputValue(0);
    const b = this.getInputValue(1);
    const cin = this.getInputValue(2);

    // 全加算器の論理
    // S = A XOR B XOR Cin
    // Cout = (A AND B) OR (Cin AND (A XOR B))
    
    // まず A XOR B を計算
    const aXorB = a !== b;
    
    // 和の計算: S = (A XOR B) XOR Cin
    const sum = aXorB !== cin;
    
    // 桁上げの計算: Cout = (A AND B) OR (Cin AND (A XOR B))
    const carry = (a && b) || (cin && aXorB);

    this.setOutputValue(0, sum);
    this.setOutputValue(1, carry);
  }

  /**
   * クローンメソッド
   */
  public clone(newId: string): FullAdderGate {
    return new FullAdderGate(newId, this.position.x, this.position.y);
  }
}
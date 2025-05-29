import { BaseGate } from './BaseGate';
import { Position } from '../../types/common';

/**
 * 半加算器ゲート
 * - 入力: A, B (1ビットの加算入力)
 * - 出力: S (和), C (桁上げ)
 * - 真理値表:
 *   A B | S C
 *   0 0 | 0 0
 *   0 1 | 1 0
 *   1 0 | 1 0
 *   1 1 | 0 1
 */
export class HalfAdderGate extends BaseGate {
  constructor(id: string, x: number, y: number) {
    super(id, 'HALF_ADDER', { x, y });
  }

  protected initializePins(): void {
    // 入力ピン: A, B
    this._inputs = [
      this.createPin('A', 'input', 0, 2),
      this.createPin('B', 'input', 1, 2)
    ];
    
    // 出力ピン: S (和), C (桁上げ)
    this._outputs = [
      this.createPin('S', 'output', 0, 2),  // Sum
      this.createPin('C', 'output', 1, 2)   // Carry
    ];
  }

  public compute(): void {
    const a = this.getInputValue(0);
    const b = this.getInputValue(1);

    // 半加算器の論理
    // S = A XOR B (排他的論理和)
    // C = A AND B (論理積)
    const sum = a !== b;  // XOR
    const carry = a && b; // AND

    this.setOutputValue(0, sum);
    this.setOutputValue(1, carry);
  }

  /**
   * クローンメソッド
   */
  public clone(newId: string): HalfAdderGate {
    return new HalfAdderGate(newId, this.position.x, this.position.y);
  }
}
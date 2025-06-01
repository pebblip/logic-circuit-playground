import { BaseGate } from './BaseGate';
import { Position } from '../types/common';

/**
 * 2対1マルチプレクサゲート
 * - 入力: A, B (データ入力), SEL (選択信号)
 * - 出力: Y (選択された出力)
 * - SEL=0の時はAを出力、SEL=1の時はBを出力
 * 
 * 真理値表:
 * SEL | Y
 * ----|---
 *  0  | A
 *  1  | B
 */
export class Mux2to1Gate extends BaseGate {
  constructor(id: string, x: number, y: number) {
    super(id, 'MUX_2TO1', { x, y });
  }

  protected initializePins(): void {
    // 入力ピン: A, B (データ), SEL (選択)
    this._inputs = [
      this.createPin('A', 'input', 0, 3),     // データ入力A
      this.createPin('B', 'input', 1, 3),     // データ入力B
      this.createPin('SEL', 'input', 2, 3)    // 選択入力
    ];
    
    // 出力ピン: Y (選択された出力)
    this._outputs = [
      this.createPin('Y', 'output', 0, 1)     // 出力
    ];
  }

  public compute(): void {
    const inputA = this.getInputValue(0);    // A入力
    const inputB = this.getInputValue(1);    // B入力
    const select = this.getInputValue(2);    // SEL入力

    // マルチプレクサのロジック
    // SEL=0の時はA、SEL=1の時はBを選択
    const output = select ? inputB : inputA;
    
    this.setOutputValue(0, output);
  }

  /**
   * シリアライズ用（状態を持たないので基本実装をそのまま使用）
   */
  public toJSON(): any {
    return super.toJSON();
  }

  /**
   * デシリアライズ用
   */
  public static fromJSON(json: any): Mux2to1Gate {
    return new Mux2to1Gate(json.id, json.position.x, json.position.y);
  }

  /**
   * クローンメソッド
   */
  public clone(newId: string): Mux2to1Gate {
    return new Mux2to1Gate(newId, this.position.x, this.position.y);
  }
}
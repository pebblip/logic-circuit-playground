/**
 * ゲートの基底クラス - 簡易版
 * 既存のBaseGateクラスの必要最小限の実装
 */

import { Position, GateType, GateData } from '../types';
import { Pin } from '../circuit/Pin';

// GateTypeをre-export
export type { GateType };

export abstract class BaseGate {
  protected _id: string;
  protected _type: GateType;
  protected _position: Position;
  protected _inputs: Pin[] = [];
  protected _outputs: Pin[] = [];
  protected _label: string;
  protected _value?: boolean; // INPUTゲート用

  constructor(id: string, type: GateType, position: Position) {
    this._id = id;
    this._type = type;
    this._position = position;
    this._label = type;
    console.log(`[BaseGate] Constructor called for ${type} gate ${id}`);
    this.initializePins();
    console.log(`[BaseGate] After initializePins: inputs=${this._inputs.length}, outputs=${this._outputs.length}`);
  }

  // Abstract methods
  protected abstract initializePins(): void;
  public abstract compute(): void;

  // Getters
  get id(): string { return this._id; }
  get type(): GateType { return this._type; }
  get position(): Position { return { ...this._position }; }
  get inputs(): Pin[] { return this._inputs; }
  get outputs(): Pin[] { return this._outputs; }
  get inputPins(): Pin[] { return this._inputs; } // 互換性のためのエイリアス
  get outputPins(): Pin[] { return this._outputs; } // 互換性のためのエイリアス
  get label(): string { return this._label; }
  get value(): boolean | undefined { return this._value; }

  // Setters
  set value(val: boolean | undefined) {
    this._value = val;
  }

  set position(pos: Position) {
    this.move(pos);
  }

  // Methods
  move(position: Position): void {
    const dx = position.x - this._position.x;
    const dy = position.y - this._position.y;
    
    this._position = position;
    
    // ピンの位置も更新
    this._inputs.forEach(pin => {
      const pinPos = pin.position;
      pin.updatePosition({ x: pinPos.x + dx, y: pinPos.y + dy });
    });
    
    this._outputs.forEach(pin => {
      const pinPos = pin.position;
      pin.updatePosition({ x: pinPos.x + dx, y: pinPos.y + dy });
    });
  }

  // GateData型への変換（ViewModelとの互換性）
  toGateData(): GateData {
    return {
      id: this._id,
      type: this._type,
      position: this._position,
      inputs: this._inputs.map(pin => pin.toJSON()),
      outputs: this._outputs.map(pin => pin.toJSON()),
      label: this._label,
      value: this._value
    };
  }

  // 入力ピンの値を設定
  setInputValue(pinIndex: number, value: boolean): void {
    if (pinIndex >= 0 && pinIndex < this._inputs.length) {
      this._inputs[pinIndex].value = value;
    }
  }

  // 出力ピンの値を取得
  getOutputValue(pinIndex: number = 0): boolean {
    if (pinIndex >= 0 && pinIndex < this._outputs.length) {
      return this._outputs[pinIndex].value;
    }
    return false;
  }

  // INPUTゲート用のトグルメソッド
  toggle(): void {
    if (this._type === 'INPUT') {
      this._value = !this._value;
      // 出力ピンの値を更新
      if (this._outputs.length > 0) {
        this._outputs[0].value = this._value ?? false;
      }
    }
  }

  // シミュレーション更新
  update(): void {
    this.compute();
  }
}
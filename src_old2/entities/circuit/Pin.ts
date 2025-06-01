/**
 * ピンクラス - 簡易版
 * 既存のPinクラスの必要最小限の実装
 */

import { Position } from '../types';

export type PinType = 'input' | 'output';

export class Pin {
  // 表示とインタラクションの定数
  static readonly VISUAL_RADIUS = 6;
  static readonly HIT_RADIUS = 15;
  
  private _id: string;
  private _type: PinType;
  private _position: Position;
  private _value: boolean = false;
  private _connected: boolean = false;

  constructor(id: string, type: PinType, position: Position = { x: 0, y: 0 }) {
    this._id = id;
    this._type = type;
    this._position = position;
  }

  // Getters
  get id(): string { return this._id; }
  get type(): PinType { return this._type; }
  get position(): Position { return { ...this._position }; }
  get value(): boolean { return this._value; }
  get connected(): boolean { return this._connected; }

  // Setters
  set value(val: boolean) {
    this._value = val;
  }

  set connected(val: boolean) {
    this._connected = val;
  }

  // Methods
  updatePosition(position: Position): void {
    this._position = { ...position };
  }

  reset(): void {
    this._value = false;
  }

  // 既存のPin型との互換性のため
  toJSON(): { id: string; type: PinType; value: boolean; position?: Position } {
    return {
      id: this._id,
      type: this._type,
      value: this._value,
      position: this._position
    };
  }
}
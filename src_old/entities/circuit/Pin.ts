/**
 * ピンクラス
 */

import { ID, Position, PinType } from '../types/common';

export class Pin {
  // 表示とインタラクションの定数
  static readonly VISUAL_RADIUS = 4;
  static readonly HIT_RADIUS = 12;
  
  private _id: ID;
  private _name: string;
  private _type: PinType;
  private _position: Position;
  private _value: boolean = false;
  private _connected: boolean = false;

  constructor(id: ID, name: string, type: PinType, position: Position) {
    this._id = id;
    this._name = name;
    this._type = type;
    this._position = position;
  }

  // Getters
  get id(): ID { return this._id; }
  get name(): string { return this._name; }
  get type(): PinType { return this._type; }
  get position(): Position { return { ...this._position }; }
  get x(): number { return this._position.x; }
  get y(): number { return this._position.y; }
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

  toJSON() {
    return {
      id: this._id,
      name: this._name,
      type: this._type,
      position: this._position,
      value: this._value
    };
  }
}
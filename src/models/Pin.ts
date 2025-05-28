/**
 * ピンクラス
 */

import { ID, Position, PinType } from '@/types/common';

export class Pin {
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
  get value(): boolean { return this._value; }
  get connected(): boolean { return this._connected; }

  // Setters
  set value(val: boolean) {
    if (this._type === PinType.INPUT || this._type === PinType.OUTPUT) {
      this._value = val;
    }
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
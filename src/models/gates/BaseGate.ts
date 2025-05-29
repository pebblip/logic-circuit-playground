/**
 * ゲートの基底クラス
 */

import { ID, Position } from '@/types/common';
import { GateType, GateData } from '@/types/gate';
import { Pin } from '@/models/Pin';

export abstract class BaseGate {
  protected _id: ID;
  protected _type: GateType | string; // stringも許可（CLOCKなどのため）
  protected _position: Position;
  protected _inputs: Pin[] = [];
  protected _outputs: Pin[] = [];
  protected _size = { width: 50, height: 50 };

  constructor(id: ID, type: GateType | string, position: Position) {
    this._id = id;
    this._type = type;
    this._position = position;
    this.initializePins();
  }

  // Abstract methods
  protected abstract initializePins(): void;
  public abstract compute(): void;
  public abstract clone(newId: ID): BaseGate;

  // Getters
  get id(): ID { return this._id; }
  get type(): GateType | string { return this._type; }
  get position(): Position { return { ...this._position }; }
  get inputs(): Pin[] { return this._inputs; }
  get outputs(): Pin[] { return this._outputs; }
  get size() { return { ...this._size }; }
  
  // メソッド形式のgetters（互換性のため）
  getInputs(): Pin[] { return this._inputs; }
  getOutputs(): Pin[] { return this._outputs; }

  // Common methods
  move(position: Position): void {
    const dx = position.x - this._position.x;
    const dy = position.y - this._position.y;
    
    this._position = position;
    
    // Update pin positions
    [...this._inputs, ...this._outputs].forEach(pin => {
      const currentPos = pin.position;
      pin.updatePosition({
        x: currentPos.x + dx,
        y: currentPos.y + dy
      });
    });
  }

  getInputValue(index: number): boolean {
    return this._inputs[index]?.value ?? false;
  }

  setInputValue(index: number, value: boolean): void {
    if (this._inputs[index]) {
      this._inputs[index].value = value;
    }
  }

  getOutputValue(index: number): boolean {
    return this._outputs[index]?.value ?? false;
  }

  protected setOutputValue(index: number, value: boolean): void {
    if (this._outputs[index]) {
      this._outputs[index].value = value;
    }
  }

  reset(): void {
    this._inputs.forEach(pin => pin.reset());
    this._outputs.forEach(pin => pin.reset());
  }

  serialize(): any {
    return {
      id: this._id,
      type: this._type,
      position: this._position,
      inputs: this._inputs.map(pin => pin.toJSON()),
      outputs: this._outputs.map(pin => pin.toJSON())
    };
  }
  
  toJSON(): GateData {
    return this.serialize();
  }

  // Helper method for creating pins
  protected createPin(name: string, type: 'input' | 'output', index: number, total: number): Pin {
    const pinType = type === 'input' ? 'INPUT' : 'OUTPUT';
    const x = type === 'input' ? -this._size.width / 2 - 8 : this._size.width / 2 + 8;
    
    let y: number;
    if (total === 1) {
      y = 0;
    } else {
      const spacing = Math.min(20, (this._size.height - 10) / (total + 1));
      y = -this._size.height / 2 + spacing * (index + 1);
    }
    
    return new Pin(
      `${this._id}_${type}_${index}`,
      name,
      pinType as any,
      { x: this._position.x + x, y: this._position.y + y }
    );
  }
}

export { BaseGate as Gate };
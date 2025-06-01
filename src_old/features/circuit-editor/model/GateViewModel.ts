/**
 * ゲートのViewModel
 */

import { BaseGate } from '@/entities/gates/BaseGate';
import { Position } from '@/entities/types/common';
import { EventEmitter } from '@/shared/lib/utils/EventEmitter';

export class GateViewModel extends EventEmitter {
  private _gate: BaseGate;
  private _isSelected: boolean = false;
  private _isHovered: boolean = false;

  constructor(gate: BaseGate) {
    super();
    this._gate = gate;
  }

  // Getters for View
  get id(): string { return this._gate.id; }
  get type(): string { return this._gate.type; }
  get position(): Position { return this._gate.position; }
  get x(): number { return this._gate.position.x; }
  get y(): number { return this._gate.position.y; }
  get size() { return this._gate.size; }
  get inputs() { return this._gate.inputs; }
  get outputs() { return this._gate.outputs; }
  get isSelected(): boolean { return this._isSelected; }
  get isHovered(): boolean { return this._isHovered; }

  // Direct gate access (use with caution)
  get gate(): BaseGate { return this._gate; }

  // UI State
  setSelected(value: boolean): void {
    if (this._isSelected !== value) {
      this._isSelected = value;
      this.emit('selectionChanged', value);
    }
  }

  setHovered(value: boolean): void {
    if (this._isHovered !== value) {
      this._isHovered = value;
      this.emit('hoverChanged', value);
    }
  }

  // Actions
  move(position: Position): void {
    this._gate.move(position);
    this.emit('positionChanged', position);
  }

  handleClick(): void {
    if (this._gate.type === 'INPUT') {
      this.toggleInput();
    }
    this.emit('clicked', this);
  }

  handleDoubleClick(): void {
    this.emit('doubleClicked', this);
  }

  private toggleInput(): void {
    if (this._gate.type === 'INPUT' && this._gate.inputs.length > 0) {
      const currentValue = this._gate.getOutputValue(0);
      this._gate.setInputValue(0, !currentValue);
      this._gate.compute();
      this.emit('valueChanged');
    }
  }

  // Render helpers
  getOutputValue(index: number = 0): boolean {
    return this._gate.getOutputValue(index);
  }

  isActive(): boolean {
    // For visualization - checks if any output is true
    return this._gate.outputs.some(pin => pin.value);
  }

  toJSON() {
    return this._gate.toJSON();
  }
}
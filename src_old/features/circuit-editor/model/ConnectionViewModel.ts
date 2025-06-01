/**
 * 接続のViewModel
 */

import { Connection } from '@/entities/circuit/Connection';
import { GateViewModel } from './GateViewModel';
import { Position } from '@/entities/types/common';

export class ConnectionViewModel {
  private _connection: Connection;
  private _fromGate: GateViewModel;
  private _toGate: GateViewModel;

  constructor(
    connection: Connection,
    fromGate: GateViewModel,
    toGate: GateViewModel
  ) {
    this._connection = connection;
    this._fromGate = fromGate;
    this._toGate = toGate;
  }

  // Getters
  get id(): string { return this._connection.id; }
  get fromGate(): GateViewModel { return this._fromGate; }
  get toGate(): GateViewModel { return this._toGate; }
  get fromOutputIndex(): number { return this._connection.fromOutputIndex; }
  get toInputIndex(): number { return this._connection.toInputIndex; }

  // Calculate positions for rendering
  getStartPosition(): Position {
    const gatePos = this._fromGate.position;
    const pinPos = this._fromGate.outputs[this.fromOutputIndex].position;
    return {
      x: gatePos.x + pinPos.x,
      y: gatePos.y + pinPos.y
    };
  }

  getEndPosition(): Position {
    const gatePos = this._toGate.position;
    const pinPos = this._toGate.inputs[this.toInputIndex].position;
    return {
      x: gatePos.x + pinPos.x,
      y: gatePos.y + pinPos.y
    };
  }

  // Check if connection is active (carrying signal)
  isActive(): boolean {
    return this._fromGate.getOutputValue(this.fromOutputIndex);
  }

  // Get path for SVG rendering
  getSVGPath(): string {
    const start = this.getStartPosition();
    const end = this.getEndPosition();
    const midX = (start.x + end.x) / 2;
    
    return `M ${start.x} ${start.y} C ${midX} ${start.y}, ${midX} ${end.y}, ${end.x} ${end.y}`;
  }

  toJSON() {
    return this._connection.toJSON();
  }
}
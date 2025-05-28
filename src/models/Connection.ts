/**
 * 接続（ワイヤー）クラス
 */

import { ID } from '@/types/common';
import { ConnectionData } from '@/types/gate';

export class Connection {
  private _id: ID;
  private _fromGateId: ID;
  private _fromOutputIndex: number;
  private _toGateId: ID;
  private _toInputIndex: number;

  constructor(
    id: ID,
    fromGateId: ID,
    fromOutputIndex: number,
    toGateId: ID,
    toInputIndex: number
  ) {
    this._id = id;
    this._fromGateId = fromGateId;
    this._fromOutputIndex = fromOutputIndex;
    this._toGateId = toGateId;
    this._toInputIndex = toInputIndex;
  }

  // Getters
  get id(): ID { return this._id; }
  get fromGateId(): ID { return this._fromGateId; }
  get fromOutputIndex(): number { return this._fromOutputIndex; }
  get toGateId(): ID { return this._toGateId; }
  get toInputIndex(): number { return this._toInputIndex; }

  // Methods
  involves(gateId: ID): boolean {
    return this._fromGateId === gateId || this._toGateId === gateId;
  }

  isFrom(gateId: ID): boolean {
    return this._fromGateId === gateId;
  }

  isTo(gateId: ID): boolean {
    return this._toGateId === gateId;
  }

  toJSON(): ConnectionData {
    return {
      id: this._id,
      from: this._fromGateId,
      fromOutput: this._fromOutputIndex,
      to: this._toGateId,
      toInput: this._toInputIndex
    };
  }

  static fromJSON(data: ConnectionData): Connection {
    return new Connection(
      data.id,
      data.from,
      data.fromOutput || 0,
      data.to,
      data.toInput || 0
    );
  }
}
/**
 * ゲートファクトリー
 * ゲートタイプから適切なゲートインスタンスを生成
 */

import { BaseGate } from './BaseGate';
import { ANDGate } from './ANDGate';
import { ORGate } from './ORGate';
import { NOTGate } from './NOTGate';
import { InputGate } from './InputGate';
import { OutputGate } from './OutputGate';
import { Position, GateType, GateData } from '../types';

export class GateFactory {
  /**
   * ゲートタイプからゲートインスタンスを生成
   */
  static createGate(
    type: GateType, 
    id: string, 
    position: Position,
    initialValue?: boolean
  ): BaseGate {
    switch (type) {
      case 'AND':
        return new ANDGate(id, position);
      case 'OR':
        return new ORGate(id, position);
      case 'NOT':
        return new NOTGate(id, position);
      case 'INPUT':
        return new InputGate(id, position, initialValue);
      case 'OUTPUT':
        return new OutputGate(id, position);
      default:
        throw new Error(`Unknown gate type: ${type}`);
    }
  }

  /**
   * GateDataからゲートインスタンスを生成
   */
  static fromGateData(data: GateData): BaseGate {
    const gate = this.createGate(data.type, data.id, data.position, data.value);
    
    // ピンの値を復元
    data.inputs.forEach((pinData, index) => {
      if (index < gate.inputs.length) {
        gate.inputs[index].value = pinData.value;
      }
    });
    
    data.outputs.forEach((pinData, index) => {
      if (index < gate.outputs.length) {
        gate.outputs[index].value = pinData.value;
      }
    });
    
    return gate;
  }

  /**
   * IDを生成
   */
  static generateId(type: GateType): string {
    return `${type.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
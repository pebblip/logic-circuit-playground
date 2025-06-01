/**
 * ゲートファクトリー
 * ゲートタイプから適切なゲートインスタンスを生成
 */

import { BaseGate } from './BaseGate';
import { ANDGate } from './ANDGate';
import { ORGate } from './ORGate';
import { NOTGate } from './NOTGate';
import { XORGate } from './XORGate';
import { NANDGate } from './NANDGate';
import { NORGate } from './NORGate';
import { InputGate } from './InputGate';
import { OutputGate } from './OutputGate';
import { ClockGate } from './ClockGate';
import { DFlipFlopGate } from './DFlipFlopGate';
import { SRLatchGate } from './SRLatchGate';
import { MuxGate } from './MuxGate';
import { Position, GateType, GateData } from '../types';

export class GateFactory {
  /**
   * 簡単なゲート作成メソッド（IDを自動生成）
   */
  static create(type: GateType, position: Position, initialValue?: boolean): BaseGate {
    const id = this.generateId(type);
    return this.createGate(type, id, position, initialValue);
  }

  /**
   * ゲートタイプからゲートインスタンスを生成
   */
  static createGate(
    type: GateType, 
    id: string, 
    position: Position,
    initialValue?: boolean
  ): BaseGate {
    let gate: BaseGate;
    
    switch (type) {
      case 'AND':
        gate = new ANDGate(id, position);
        break;
      case 'OR':
        gate = new ORGate(id, position);
        break;
      case 'NOT':
        gate = new NOTGate(id, position);
        break;
      case 'XOR':
        gate = new XORGate(id, position);
        break;
      case 'NAND':
        gate = new NANDGate(id, position);
        break;
      case 'NOR':
        gate = new NORGate(id, position);
        break;
      case 'INPUT':
        gate = new InputGate(id, position, initialValue);
        break;
      case 'OUTPUT':
        gate = new OutputGate(id, position);
        break;
      case 'CLOCK':
        gate = new ClockGate(id, position);
        break;
      case 'D-FLIPFLOP':
        gate = new DFlipFlopGate(id, position);
        break;
      case 'SR-LATCH':
        gate = new SRLatchGate(id, position);
        break;
      case 'MUX':
        gate = new MuxGate(id, position);
        break;
      default:
        throw new Error(`Unknown gate type: ${type}`);
    }
    
    console.log(`[GateFactory] Created ${type} gate:`, {
      id: gate.id,
      type: gate.type,
      inputPins: gate.inputPins?.length || 0,
      outputPins: gate.outputPins?.length || 0,
      hasInputPins: !!gate.inputPins,
      hasOutputPins: !!gate.outputPins
    });
    
    return gate;
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
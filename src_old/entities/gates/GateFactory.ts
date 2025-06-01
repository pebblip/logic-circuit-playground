/**
 * ゲートファクトリー
 */

import { ID, Position } from '@/entities/types/common';
import { GateType } from '@/entities/types/gate';
import { BaseGate } from './BaseGate';
import { InputGate } from './InputGate';
import { OutputGate } from './OutputGate';
import { ANDGate } from './ANDGate';
import { ORGate } from './ORGate';
import { NOTGate } from './NOTGate';
import { NANDGate } from './NANDGate';
import { NORGate } from './NORGate';
import { XORGate } from './XORGate';
import { XNORGate } from './XNORGate';
import { CustomGate } from './CustomGate';
import { ClockGate } from './ClockGate';
import { DFlipFlopGate } from './DFlipFlopGate';
import { SRLatchGate } from './SRLatchGate';
import { Register4BitGate } from './Register4BitGate';
import { Mux2to1Gate } from './Mux2to1Gate';
import { HalfAdderGate } from './HalfAdderGate';
import { FullAdderGate } from './FullAdderGate';
import { Adder4BitGate } from './Adder4BitGate';
import { Number4BitInputGate } from './Number4BitInputGate';
import { Number4BitDisplayGate } from './Number4BitDisplayGate';

export class GateFactory {
  private static nextId = 1;
  private static customGateDefinitions = new Map<string, any>();

  static create(type: GateType | string, position: Position, id?: ID, options?: any): BaseGate {
    const gateId = id || `gate_${this.nextId++}`;

    switch (type) {
      case GateType.INPUT:
        return new InputGate(gateId, position);
      case GateType.OUTPUT:
        return new OutputGate(gateId, position);
      case GateType.AND:
        return new ANDGate(gateId, position);
      case GateType.OR:
        return new ORGate(gateId, position);
      case GateType.NOT:
        return new NOTGate(gateId, position);
      case GateType.NAND:
        return new NANDGate(gateId, position);
      case GateType.NOR:
        return new NORGate(gateId, position);
      case GateType.XOR:
        return new XORGate(gateId, position);
      case GateType.XNOR:
        return new XNORGate(gateId, position);
      case 'CLOCK':
        return new ClockGate(gateId, position, options?.interval);
      case 'D_FLIP_FLOP':
        return new DFlipFlopGate(gateId, position.x, position.y);
      case 'SR_LATCH':
        return new SRLatchGate(gateId, position.x, position.y);
      case 'REGISTER_4BIT':
        return new Register4BitGate(gateId, position.x, position.y);
      case 'MUX_2TO1':
        return new Mux2to1Gate(gateId, position.x, position.y);
      case 'HALF_ADDER':
        return new HalfAdderGate(gateId, position.x, position.y);
      case 'FULL_ADDER':
        return new FullAdderGate(gateId, position.x, position.y);
      case 'ADDER_4BIT':
        return new Adder4BitGate(gateId, position.x, position.y);
      case 'NUMBER_4BIT_INPUT':
        return new Number4BitInputGate(gateId, position.x, position.y);
      case 'NUMBER_4BIT_DISPLAY':
        return new Number4BitDisplayGate(gateId, position.x, position.y);
      default:
        // カスタムゲートのチェック
        const customDefinition = this.customGateDefinitions.get(type);
        if (customDefinition) {
          return new CustomGate(gateId, position, type, customDefinition);
        }
        throw new Error(`Unknown gate type: ${type}`);
    }
  }
  
  static registerCustomGate(type: string, definition: any): void {
    this.customGateDefinitions.set(type, definition);
  }
  
  static getCustomGateDefinition(type: string): any | undefined {
    return this.customGateDefinitions.get(type);
  }

  static resetIdCounter(): void {
    this.nextId = 1;
  }
}
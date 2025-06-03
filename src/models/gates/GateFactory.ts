import { Gate, GateType, Position, CustomGateDefinition } from '../../types/circuit';
import { GATE_SIZES, PIN_CONFIGS, isCustomGate } from '../../types/gates';
import { IdGenerator } from '../../utils/idGenerator';

export class GateFactory {
  /**
   * ゲートを作成する
   * 既存のaddGateとの互換性を保ちながら、特殊ゲートに対応
   */
  static createGate(type: GateType, position: Position): Gate {
    const id = IdGenerator.generateGateId();
    const pinConfig = PIN_CONFIGS[type];
    
    // 基本的なゲート構造
    const baseGate: Gate = {
      id,
      type,
      position,
      inputs: this.createInputArray(type),
      output: type === 'INPUT' ? false : false,
    };

    // 特殊ゲート用のメタデータを追加
    switch (type) {
      case 'CLOCK':
        return {
          ...baseGate,
          metadata: {
            frequency: 1, // 1Hz default
            isRunning: true, // デフォルトでON（楽しい！）
            startTime: Date.now(),
          }
        };
      
      case 'D-FF':
        return {
          ...baseGate,
          inputs: ['', ''], // D, CLK
          metadata: {
            clockEdge: 'rising',
            previousClockState: false,
            qOutput: false,
            qBarOutput: true,
          }
        };
      
      case 'SR-LATCH':
        return {
          ...baseGate,
          inputs: ['', ''], // S, R
          output: false, // 初期状態
          metadata: {
            qOutput: false,
            qBarOutput: true,
          }
        };
      
      case 'MUX':
        return {
          ...baseGate,
          inputs: ['', '', ''], // 2:1 MUX default (2 data + 1 select)
          metadata: {
            dataInputs: ['', ''],
            selectInputs: [''],
          }
        };
      
      case 'CUSTOM':
        // カスタムゲートは後で設定される
        return baseGate;
      
      default:
        return baseGate;
    }
  }

  /**
   * カスタムゲートを作成する
   */
  static createCustomGate(definition: CustomGateDefinition, position: Position): Gate {
    const id = IdGenerator.generateGateId();
    const inputsArray = new Array(definition.inputs.length).fill('');
    
    console.log('🏭 GateFactory.createCustomGate:', {
      gateId: id,
      definition,
      definitionInputs: definition.inputs,
      definitionInputsLength: definition.inputs.length,
      createdInputsArray: inputsArray,
      createdInputsLength: inputsArray.length
    });
    
    const customGate: Gate = {
      id,
      type: 'CUSTOM' as const,
      position,
      inputs: inputsArray,
      output: false,
      outputs: new Array(definition.outputs.length).fill(false), // 複数出力の初期化
      customGateDefinition: definition,
    };
    
    console.log('✅ カスタムゲート作成完了:', customGate);
    
    return customGate;
  }

  /**
   * ゲートタイプに応じた入力配列を作成
   */
  private static createInputArray(type: GateType): string[] {
    const config = PIN_CONFIGS[type];
    
    if (type === 'INPUT' || type === 'CLOCK') {
      return []; // 入力ピンなし
    }
    
    if (type === 'NOT' || type === 'OUTPUT') {
      return ['']; // 1入力
    }
    
    if (type === 'MUX') {
      return ['', '', '']; // デフォルトは2:1 MUX
    }
    
    // その他は2入力
    return ['', ''];
  }

  /**
   * ゲートのサイズを取得
   */
  static getGateSize(gate: Gate | GateType): { width: number; height: number } {
    if (typeof gate === 'string') {
      return GATE_SIZES[gate] || { width: 70, height: 50 };
    }
    
    if (isCustomGate(gate) && gate.customGateDefinition) {
      return {
        width: gate.customGateDefinition.width,
        height: gate.customGateDefinition.height,
      };
    }
    
    return GATE_SIZES[gate.type] || { width: 70, height: 50 };
  }

  /**
   * ゲートのピン数を取得
   */
  static getPinCount(gate: Gate | GateType): { inputs: number; outputs: number } {
    if (typeof gate === 'string') {
      return PIN_CONFIGS[gate] || { inputs: 2, outputs: 1 };
    }
    
    if (isCustomGate(gate) && gate.customGateDefinition) {
      return {
        inputs: gate.customGateDefinition.inputs.length,
        outputs: gate.customGateDefinition.outputs.length,
      };
    }
    
    return PIN_CONFIGS[gate.type] || { inputs: 2, outputs: 1 };
  }
}
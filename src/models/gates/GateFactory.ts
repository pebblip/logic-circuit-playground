import type {
  Gate,
  GateType,
  Position,
  CustomGateDefinition,
} from '../../types/circuit';
import { GATE_SIZES, PIN_CONFIGS, isCustomGate } from '../../types/gates';
import { IdGenerator } from '../../shared/id';

export class GateFactory {
  /**
   * ゲートを作成する
   * 既存のaddGateとの互換性を保ちながら、特殊ゲートに対応
   */
  static createGate(type: GateType, position: Position): Gate {
    const id = IdGenerator.generateGateId();

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
          output: false, // 初期状態でOFF
          metadata: {
            frequency: 1, // 1Hz（1000ms周期、500ms ON/OFF）で見やすい速度
            isRunning: true, // デフォルトでON（楽しい！）
            startTime: undefined, // 評価時に設定される
          },
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
          },
        };

      case 'SR-LATCH':
        return {
          ...baseGate,
          inputs: ['', ''], // S, R
          output: false, // 初期状態
          metadata: {
            qOutput: false,
            qBarOutput: true,
          },
        };

      case 'MUX':
        return {
          ...baseGate,
          inputs: ['', '', ''], // 2:1 MUX default (2 data + 1 select)
          metadata: {
            dataInputs: ['', ''],
            selectInputs: [''],
          },
        };

      case 'BINARY_COUNTER':
        return {
          ...baseGate,
          inputs: [''], // CLK input only
          outputs: [false, false], // デフォルト2ビット（4カウント）
          metadata: {
            bitCount: 2,
            currentValue: 0,
            previousClockState: false,
          },
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
  static createCustomGate(
    definition: CustomGateDefinition,
    position: Position
  ): Gate {
    const id = IdGenerator.generateGateId();
    const inputsArray = new Array(definition.inputs.length).fill('');

    const customGate: Gate = {
      id,
      type: 'CUSTOM' as const,
      position,
      inputs: inputsArray,
      output: false,
      outputs: new Array(definition.outputs.length).fill(false), // 複数出力の初期化
      customGateDefinition: definition,
    };

    return customGate;
  }

  /**
   * ゲートタイプに応じた入力配列を作成
   */
  private static createInputArray(type: GateType): string[] {
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
      return GATE_SIZES[gate as keyof typeof GATE_SIZES] || { width: 70, height: 50 };
    }

    if (isCustomGate(gate) && gate.customGateDefinition) {
      return {
        width: gate.customGateDefinition.width,
        height: gate.customGateDefinition.height,
      };
    }

    return GATE_SIZES[gate.type as keyof typeof GATE_SIZES] || { width: 70, height: 50 };
  }

  /**
   * ゲートのピン数を取得
   */
  static getPinCount(gate: Gate | GateType): {
    inputs: number;
    outputs: number;
  } {
    if (typeof gate === 'string') {
      return PIN_CONFIGS[gate as keyof typeof PIN_CONFIGS] || { inputs: 2, outputs: 1 };
    }

    if (isCustomGate(gate) && gate.customGateDefinition) {
      return {
        inputs: gate.customGateDefinition.inputs.length,
        outputs: gate.customGateDefinition.outputs.length,
      };
    }

    return PIN_CONFIGS[gate.type as keyof typeof PIN_CONFIGS] || { inputs: 2, outputs: 1 };
  }
}

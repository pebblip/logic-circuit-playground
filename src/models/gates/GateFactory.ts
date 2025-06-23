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
      outputs: type === 'OUTPUT' ? [] : [false], // PureCircuit形式
      output: type === 'INPUT' ? false : false, // Legacy互換性
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
          inputs: [false, false], // D, CLK
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
          inputs: [false, false], // S, R
          output: false, // 初期状態
          metadata: {
            qOutput: false,
            qBarOutput: true,
          },
        };

      case 'MUX':
        return {
          ...baseGate,
          inputs: [false, false, false], // 2:1 MUX default (2 data + 1 select)
          metadata: {
            dataInputCount: 2,
            selectedInput: 0,
          },
        };

      case 'BINARY_COUNTER':
        return {
          ...baseGate,
          inputs: [false], // CLK input only
          outputs: [false, false], // デフォルト2ビット（4カウント）
          metadata: {
            bitCount: 2,
            currentValue: 0,
            previousClockState: false,
          },
        };

      case 'LED':
        return {
          ...baseGate,
          inputs: [false, false, false, false], // デフォルト4bit
          outputs: [], // 出力なし
          gateData: {
            bitWidth: 4,
            displayMode: 'both' as const,
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
    const inputsArray = new Array(definition.inputs.length).fill(false);

    const customGate: Gate = {
      id,
      type: 'CUSTOM' as const,
      position,
      inputs: inputsArray,
      outputs: new Array(definition.outputs.length).fill(false), // 複数出力の初期化
      output: false, // Legacy互換性
      customGateDefinition: definition,
    };

    return customGate;
  }

  /**
   * ゲートタイプに応じた入力配列を作成 (PureCircuit形式)
   */
  private static createInputArray(type: GateType): boolean[] {
    if (type === 'INPUT' || type === 'CLOCK') {
      return []; // 入力ピンなし
    }

    if (type === 'NOT' || type === 'OUTPUT') {
      return [false]; // 1入力
    }

    if (type === 'MUX') {
      return [false, false, false]; // デフォルトは2:1 MUX
    }

    if (type === 'LED') {
      return [false, false, false, false]; // デフォルト4bit
    }

    // その他は2入力
    return [false, false];
  }

  /**
   * ゲートのサイズを取得
   */
  static getGateSize(gate: Gate | GateType): { width: number; height: number } {
    if (typeof gate === 'string') {
      return (
        GATE_SIZES[gate as keyof typeof GATE_SIZES] || { width: 70, height: 50 }
      );
    }

    if (isCustomGate(gate) && gate.customGateDefinition) {
      return {
        width: gate.customGateDefinition.width,
        height: gate.customGateDefinition.height,
      };
    }

    // LEDゲートの場合は動的サイズを計算
    if (gate.type === 'LED' && 'gateData' in gate && gate.gateData) {
      const ledData = gate.gateData as {
        bitWidth: number;
        displayMode: string;
      };
      const bitWidth = ledData.bitWidth || 4;
      const minPinSpacing = 24;
      const requiredWidth = bitWidth * minPinSpacing + 40;
      const baseWidth = 120;
      const width = Math.max(baseWidth, requiredWidth);
      return { width, height: 100 };
    }

    return (
      GATE_SIZES[gate.type as keyof typeof GATE_SIZES] || {
        width: 70,
        height: 50,
      }
    );
  }

  /**
   * ゲートのピン数を取得
   */
  static getPinCount(gate: Gate | GateType): {
    inputs: number;
    outputs: number;
  } {
    if (typeof gate === 'string') {
      return (
        PIN_CONFIGS[gate as keyof typeof PIN_CONFIGS] || {
          inputs: 2,
          outputs: 1,
        }
      );
    }

    if (isCustomGate(gate) && gate.customGateDefinition) {
      return {
        inputs: gate.customGateDefinition.inputs.length,
        outputs: gate.customGateDefinition.outputs.length,
      };
    }

    return (
      PIN_CONFIGS[gate.type as keyof typeof PIN_CONFIGS] || {
        inputs: 2,
        outputs: 1,
      }
    );
  }
}

import type {
  Gate,
  GateType,
  Position,
  CustomGateDefinition,
} from '../../types/circuit';
import { isCustomGate } from '../../types/gates';
import { IdGenerator } from '../../shared/id';

// ゲートタイプ別設定定義（オブジェクト指向パターン）
interface GateConfig {
  size: { width: number; height: number };
  pins: { inputs: number; outputs: number };
  createSpecific?: (baseGate: Gate) => Gate;
}

const GATE_CONFIGS: Record<string, GateConfig> = {
  // 基本ゲート
  AND: { size: { width: 70, height: 50 }, pins: { inputs: 2, outputs: 1 } },
  OR: { size: { width: 70, height: 50 }, pins: { inputs: 2, outputs: 1 } },
  NOT: { size: { width: 70, height: 50 }, pins: { inputs: 1, outputs: 1 } },
  XOR: { size: { width: 70, height: 50 }, pins: { inputs: 2, outputs: 1 } },
  NAND: { size: { width: 70, height: 50 }, pins: { inputs: 2, outputs: 1 } },
  NOR: { size: { width: 70, height: 50 }, pins: { inputs: 2, outputs: 1 } },

  // 入出力
  INPUT: {
    size: { width: 50, height: 30 },
    pins: { inputs: 0, outputs: 1 },
    createSpecific: base => ({
      ...base,
      inputs: [],
      outputs: [false],
    }),
  },
  OUTPUT: {
    size: { width: 40, height: 40 },
    pins: { inputs: 1, outputs: 0 },
    createSpecific: base => ({
      ...base,
      inputs: [false],
      outputs: [],
    }),
  },

  // 特殊ゲート
  CLOCK: {
    size: { width: 80, height: 80 },
    pins: { inputs: 0, outputs: 1 },
    createSpecific: base => ({
      ...base,
      inputs: [],
      outputs: [false],
      metadata: {
        frequency: 1,
        isRunning: true,
        startTime: undefined,
      },
    }),
  },

  'D-FF': {
    size: { width: 100, height: 80 },
    pins: { inputs: 2, outputs: 1 },
    createSpecific: base => ({
      ...base,
      inputs: [false, false],
      outputs: [false],
      metadata: {
        clockEdge: 'rising',
        previousClockState: false,
        qOutput: false,
        qBarOutput: true,
      },
    }),
  },

  'SR-LATCH': {
    size: { width: 100, height: 80 },
    pins: { inputs: 2, outputs: 1 },
    createSpecific: base => ({
      ...base,
      inputs: [false, false],
      outputs: [false],
      metadata: {
        qOutput: false,
        qBarOutput: true,
      },
    }),
  },

  MUX: {
    size: { width: 100, height: 100 },
    pins: { inputs: 3, outputs: 1 },
    createSpecific: base => ({
      ...base,
      inputs: [false, false, false],
      outputs: [false],
      metadata: {
        dataInputCount: 2,
        selectedInput: 0,
      },
    }),
  },

  BINARY_COUNTER: {
    size: { width: 120, height: 100 },
    pins: { inputs: 1, outputs: 2 },
    createSpecific: base => ({
      ...base,
      inputs: [false],
      outputs: [false, false],
      metadata: {
        bitCount: 2,
        currentValue: 0,
        previousClockState: false,
      },
    }),
  },

  LED: {
    size: { width: 120, height: 100 },
    pins: { inputs: 4, outputs: 0 },
    createSpecific: base => ({
      ...base,
      inputs: [false, false, false, false],
      outputs: [],
      gateData: {
        bitWidth: 4,
        displayMode: 'both' as const,
      },
    }),
  },

  CUSTOM: { size: { width: 100, height: 80 }, pins: { inputs: 2, outputs: 1 } },
};

export class GateFactory {
  /**
   * ゲートを作成する（オブジェクト指向パターン）
   */
  static createGate(type: GateType, position: Position): Gate {
    const id = IdGenerator.generateGateId();
    const config = GATE_CONFIGS[type] || GATE_CONFIGS.CUSTOM;

    // 基本的なゲート構造
    const baseGate: Gate = {
      id,
      type,
      position,
      inputs: this.createInputArray(type, config),
      outputs: type === 'OUTPUT' ? [] : [false], // PureCircuit形式
    };

    // 特殊ゲート用のメタデータを追加（純粋関数パターン）
    const gate = config.createSpecific
      ? config.createSpecific(baseGate)
      : baseGate;

    return gate;
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
      customGateDefinition: definition,
    };

    return customGate;
  }

  /**
   * ゲート設定に応じた入力配列を作成（純粋関数パターン）
   */
  private static createInputArray(
    type: GateType,
    config: GateConfig
  ): boolean[] {
    return new Array(config.pins.inputs).fill(false);
  }

  /**
   * ゲートのサイズを取得（オブジェクト指向パターン）
   */
  static getGateSize(gate: Gate | GateType): { width: number; height: number } {
    if (typeof gate === 'string') {
      const config = GATE_CONFIGS[gate];
      return config ? config.size : { width: 70, height: 50 };
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

    const config = GATE_CONFIGS[gate.type];
    return config ? config.size : { width: 70, height: 50 };
  }

  /**
   * ゲートのピン数を取得（オブジェクト指向パターン）
   */
  static getPinCount(gate: Gate | GateType): {
    inputs: number;
    outputs: number;
  } {
    if (typeof gate === 'string') {
      const config = GATE_CONFIGS[gate];
      return config ? config.pins : { inputs: 2, outputs: 1 };
    }

    if (isCustomGate(gate) && gate.customGateDefinition) {
      return {
        inputs: gate.customGateDefinition.inputs.length,
        outputs: gate.customGateDefinition.outputs.length,
      };
    }

    const config = GATE_CONFIGS[gate.type];
    return config ? config.pins : { inputs: 2, outputs: 1 };
  }
}

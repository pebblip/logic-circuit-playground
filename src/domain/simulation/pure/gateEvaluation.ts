/**
 * 新API用ゲート評価機能
 * 
 * 特徴:
 * - 完全にimmutable（副作用なし）
 * - 型安全（boolean | boolean[] 問題を解決）
 * - 包括的エラーハンドリング
 * - 詳細なデバッグ情報
 * - カスタムゲート対応
 */

import type { Gate } from '../../../types/circuit';
import type { CustomGateDefinition } from '../../../types/gates';
import { isCustomGate } from '../../../types/gates';
import {
  type Result,
  type GateEvaluationResult,
  type GateMetadata,
  type DebugInfo,
  type EvaluationConfig,
  type EvaluationError,
  type CustomGateEvaluator,
  defaultConfig,
  success,
  failure,
  createGateResult,
  createEvaluationError
} from './types';
import { validateGate, validateGateInputs } from './validation';

// ===============================
// 統合ゲート評価関数（推奨）
// ===============================

/**
 * 統合ゲート評価関数 - 新APIのメイン関数
 * 
 * @param gate 評価対象のゲート（Readonly）
 * @param inputs 入力値配列（Readonly）
 * @param config 評価設定（Readonly）
 * @returns 型安全な評価結果
 */
export function evaluateGateUnified(
  gate: Readonly<Gate>,
  inputs: readonly boolean[],
  config: Readonly<EvaluationConfig> = defaultConfig
): Result<GateEvaluationResult, EvaluationError> {
  const startTime = performance.now();

  try {
    // 1. 入力検証（strictValidationが有効な場合）
    if (config.strictValidation) {
      const gateValidation = validateGate(gate);
      if (!gateValidation.success) {
        return failure(createEvaluationError(
          `Gate validation failed: ${gateValidation.error.message}`,
          'INPUT_COLLECTION',
          { gateId: gate.id }
        ));
      }

      const inputValidation = validateGateInputs(gate, inputs);
      if (!inputValidation.success) {
        return failure(createEvaluationError(
          `Input validation failed: ${inputValidation.error.message}`,
          'INPUT_COLLECTION',
          { gateId: gate.id }
        ));
      }
    }

    // 2. ゲート評価実行
    const evaluationResult = evaluateGateLogic(gate, inputs, config);
    if (!evaluationResult.success) {
      return evaluationResult;
    }

    const outputs = evaluationResult.data;
    const endTime = performance.now();

    // 3. メタデータ作成（一括構築）
    const metadata: GateMetadata = {
      evaluationTime: endTime - startTime,
      inputValidation: {
        expectedInputCount: getExpectedInputCount(gate),
        actualInputCount: inputs.length,
        isValid: inputs.length === getExpectedInputCount(gate)
      },
      // カスタムゲート追加情報（条件付き）
      ...(gate.type === 'CUSTOM' && isCustomGate(gate) && gate.customGateDefinition && {
        customGateInfo: {
          definitionId: gate.customGateDefinition.id,
          evaluationMethod: gate.customGateDefinition.internalCircuit ? 'INTERNAL_CIRCUIT' : 'TRUTH_TABLE'
        }
      })
    };

    // 4. デバッグ情報作成（enableDebugが有効な場合）
    let debugInfo: DebugInfo | undefined;
    if (config.enableDebug) {
      debugInfo = {
        gateId: gate.id,
        gateType: gate.type,
        inputs: [...inputs],
        evaluationTimeMs: endTime - startTime,
        intermediateValues: createIntermediateValues(gate, inputs, outputs)
      };
    }

    // 5. 結果作成
    const result = createGateResult(outputs, metadata, debugInfo);
    return success(result);

  } catch (error) {
    return failure(createEvaluationError(
      `Unexpected error during gate evaluation: ${error}`,
      'GATE_LOGIC',
      { gateId: gate.id },
      error
    ));
  }
}

// ===============================
// ゲートロジック評価
// ===============================

/**
 * ゲートロジックの評価（内部関数）
 */
function evaluateGateLogic(
  gate: Readonly<Gate>,
  inputs: readonly boolean[],
  config: Readonly<EvaluationConfig>
): Result<readonly boolean[], EvaluationError> {
  try {
    switch (gate.type) {
      case 'INPUT':
        return success([gate.output]);

      case 'OUTPUT':
        return success([inputs[0] || false]);

      case 'AND':
        return success([inputs.length === 2 && inputs[0] && inputs[1]]);

      case 'OR':
        return success([inputs.some(input => input)]);

      case 'NOT':
        return success([!inputs[0]]);

      case 'XOR':
        return success([inputs.length === 2 && inputs[0] !== inputs[1]]);

      case 'NAND':
        return success([!(inputs.length === 2 && inputs[0] && inputs[1])]);

      case 'NOR':
        return success([!inputs.some(input => input)]);

      case 'CLOCK':
        return evaluateClockGate(gate, config);

      case 'D-FF':
        return evaluateDFlipFlopGate(gate, inputs);

      case 'SR-LATCH':
        return evaluateSRLatchGate(gate, inputs);

      case 'MUX':
        return evaluateMuxGate(inputs);

      case 'CUSTOM':
        return evaluateCustomGate(gate, inputs, config);

      default:
        return failure(createEvaluationError(
          `Unknown gate type: ${(gate as any).type}`,
          'GATE_LOGIC',
          { gateId: gate.id }
        ));
    }
  } catch (error) {
    return failure(createEvaluationError(
      `Error evaluating ${gate.type} gate: ${error}`,
      'GATE_LOGIC',
      { gateId: gate.id },
      error
    ));
  }
}

// ===============================
// 特殊ゲート評価関数
// ===============================

/**
 * CLOCKゲート評価
 */
function evaluateClockGate(
  gate: Readonly<Gate>,
  config: Readonly<EvaluationConfig>
): Result<readonly boolean[], EvaluationError> {
  if (!gate.metadata?.isRunning) {
    return success([false]);
  }

  const frequency = gate.metadata.frequency || 1;
  const period = 1000 / frequency;
  const now = config.timeProvider.getCurrentTime();
  
  // startTimeの取得（undefined チェック修正）
  const startTime = gate.metadata.startTime !== undefined ? gate.metadata.startTime : now;
  const elapsed = now - startTime;
  
  // 周期的な切り替え
  const isHigh = Math.floor(elapsed / period) % 2 === 1;
  
  return success([isHigh]);
}

/**
 * D-フリップフロップゲート評価
 */
function evaluateDFlipFlopGate(
  gate: Readonly<Gate>,
  inputs: readonly boolean[]
): Result<readonly boolean[], EvaluationError> {
  if (inputs.length < 2) {
    return failure(createEvaluationError(
      'D-FF gate requires 2 inputs (D and CLK)',
      'INPUT_COLLECTION',
      { gateId: gate.id }
    ));
  }

  const d = inputs[0];
  const clk = inputs[1];
  
  // メタデータから現在の状態を取得（immutableアプローチのため、新しい状態は戻り値で表現）
  const prevClk = gate.metadata?.previousClockState || false;
  let qOutput = gate.metadata?.qOutput || false;

  // 立ち上がりエッジ検出
  if (!prevClk && clk) {
    qOutput = d;
  }

  // 注意: 実際の実装では、メタデータの更新は呼び出し側で行う
  // ここでは純粋関数として出力のみを返す
  return success([qOutput]);
}

/**
 * SR-ラッチゲート評価
 */
function evaluateSRLatchGate(
  gate: Readonly<Gate>,
  inputs: readonly boolean[]
): Result<readonly boolean[], EvaluationError> {
  if (inputs.length < 2) {
    return failure(createEvaluationError(
      'SR-LATCH gate requires 2 inputs (S and R)',
      'INPUT_COLLECTION',
      { gateId: gate.id }
    ));
  }

  const s = inputs[0]; // Set
  const r = inputs[1]; // Reset
  
  let qOutput = gate.metadata?.qOutput || false;

  // S=1, R=0 => Q=1
  if (s && !r) {
    qOutput = true;
  }
  // S=0, R=1 => Q=0
  else if (!s && r) {
    qOutput = false;
  }
  // S=0, R=0 => 状態保持
  // S=1, R=1 => 不定状態（現在の状態を保持）

  return success([qOutput]);
}

/**
 * MUXゲート評価
 */
function evaluateMuxGate(inputs: readonly boolean[]): Result<readonly boolean[], EvaluationError> {
  if (inputs.length < 3) {
    return failure(createEvaluationError(
      'MUX gate requires 3 inputs (I0, I1, SELECT)',
      'INPUT_COLLECTION'
    ));
  }

  const i0 = inputs[0];     // Input 0
  const i1 = inputs[1];     // Input 1
  const select = inputs[2]; // Select

  // S=0 => Y=I0, S=1 => Y=I1
  const output = select ? i1 : i0;
  return success([output]);
}

// ===============================
// カスタムゲート評価
// ===============================

/**
 * カスタムゲート評価
 */
function evaluateCustomGate(
  gate: Readonly<Gate>,
  inputs: readonly boolean[],
  config: Readonly<EvaluationConfig>
): Result<readonly boolean[], EvaluationError> {
  if (!isCustomGate(gate) || !gate.customGateDefinition) {
    return failure(createEvaluationError(
      'Custom gate must have customGateDefinition',
      'GATE_LOGIC',
      { gateId: gate.id }
    ));
  }

  const definition = gate.customGateDefinition;

  // カスタム評価器が提供されている場合はそれを使用
  if (config.customGateEvaluator) {
    return evaluateWithCustomEvaluator(definition, inputs, config);
  }

  // デフォルト評価戦略
  return evaluateCustomGateDefault(definition, inputs, config);
}

/**
 * カスタム評価器を使用した評価
 */
function evaluateWithCustomEvaluator(
  definition: Readonly<CustomGateDefinition>,
  inputs: readonly boolean[],
  config: Readonly<EvaluationConfig>
): Result<readonly boolean[], EvaluationError> {
  const evaluator = config.customGateEvaluator!;

  // 内部回路がある場合は内部回路評価を優先
  if (definition.internalCircuit) {
    return evaluator.evaluateByInternalCircuit(definition, inputs, config);
  }

  // 真理値表がある場合は真理値表評価
  if (definition.truthTable) {
    return evaluator.evaluateByTruthTable(definition, inputs);
  }

  return failure(createEvaluationError(
    'Custom gate has neither internal circuit nor truth table',
    'GATE_LOGIC'
  ));
}

/**
 * デフォルトカスタムゲート評価
 */
function evaluateCustomGateDefault(
  definition: Readonly<CustomGateDefinition>,
  inputs: readonly boolean[],
  config: Readonly<EvaluationConfig>
): Result<readonly boolean[], EvaluationError> {
  // 真理値表評価を優先（シンプルで高速）
  if (definition.truthTable) {
    return evaluateByTruthTable(definition, inputs);
  }

  // 内部回路評価はより複雑なため、将来的には別関数で実装
  if (definition.internalCircuit) {
    return failure(createEvaluationError(
      'Internal circuit evaluation not yet implemented in default evaluator',
      'GATE_LOGIC'
    ));
  }

  return failure(createEvaluationError(
    'Custom gate has no valid evaluation method',
    'GATE_LOGIC'
  ));
}

/**
 * 真理値表による評価
 */
function evaluateByTruthTable(
  definition: Readonly<CustomGateDefinition>,
  inputs: readonly boolean[]
): Result<readonly boolean[], EvaluationError> {
  if (!definition.truthTable) {
    return failure(createEvaluationError(
      'Truth table not available',
      'GATE_LOGIC'
    ));
  }

  // 入力パターンを文字列に変換
  const inputPattern = inputs.map(input => input ? '1' : '0').join('');
  const outputPattern = definition.truthTable[inputPattern];

  if (!outputPattern) {
    return failure(createEvaluationError(
      `No truth table entry for input pattern: ${inputPattern}`,
      'GATE_LOGIC'
    ));
  }

  // 出力パターンをboolean配列に変換
  const outputs = outputPattern.split('').map(bit => bit === '1');
  
  // 出力数の検証
  if (outputs.length !== definition.outputs.length) {
    return failure(createEvaluationError(
      `Truth table output length mismatch: expected ${definition.outputs.length}, got ${outputs.length}`,
      'GATE_LOGIC'
    ));
  }

  return success(outputs);
}

// ===============================
// ユーティリティ関数
// ===============================

/**
 * 期待される入力数を取得
 */
function getExpectedInputCount(gate: Readonly<Gate>): number {
  switch (gate.type) {
    case 'INPUT':
    case 'CLOCK':
      return 0;
    case 'OUTPUT':
    case 'NOT':
      return 1;
    case 'AND':
    case 'OR':
    case 'XOR':
    case 'NAND':
    case 'NOR':
    case 'D-FF':
    case 'SR-LATCH':
      return 2;
    case 'MUX':
      return 3;
    case 'CUSTOM':
      if (isCustomGate(gate) && gate.customGateDefinition) {
        return gate.customGateDefinition.inputs.length;
      }
      return 0;
    default:
      return 0;
  }
}

/**
 * 中間値の作成（デバッグ用）
 */
function createIntermediateValues(
  gate: Readonly<Gate>,
  inputs: readonly boolean[],
  outputs: readonly boolean[]
): Record<string, unknown> {
  const values: Record<string, unknown> = {
    gateType: gate.type,
    inputCount: inputs.length,
    outputCount: outputs.length,
    inputValues: [...inputs],
    outputValues: [...outputs]
  };

  // ゲートタイプ別の追加情報
  switch (gate.type) {
    case 'CLOCK':
      if (gate.metadata) {
        values.clockMetadata = {
          isRunning: gate.metadata.isRunning,
          frequency: gate.metadata.frequency,
          startTime: gate.metadata.startTime
        };
      }
      break;

    case 'D-FF':
      if (gate.metadata) {
        values.flipFlopState = {
          previousClockState: gate.metadata.previousClockState,
          qOutput: gate.metadata.qOutput,
          qBarOutput: gate.metadata.qBarOutput
        };
      }
      break;

    case 'SR-LATCH':
      if (gate.metadata) {
        values.latchState = {
          qOutput: gate.metadata.qOutput,
          qBarOutput: gate.metadata.qBarOutput
        };
      }
      break;

    case 'CUSTOM':
      if (isCustomGate(gate) && gate.customGateDefinition) {
        values.customGateInfo = {
          definitionId: gate.customGateDefinition.id,
          definitionName: gate.customGateDefinition.name,
          inputNames: gate.customGateDefinition.inputs.map(i => i.name),
          outputNames: gate.customGateDefinition.outputs.map(o => o.name)
        };
      }
      break;
  }

  return values;
}

// ===============================
// デフォルトカスタムゲート評価器
// ===============================

/**
 * デフォルトカスタムゲート評価器の実装
 */
export const defaultCustomGateEvaluator: CustomGateEvaluator = {
  evaluateByTruthTable: (definition, inputs) => {
    return evaluateByTruthTable(definition, inputs);
  },

  evaluateByInternalCircuit: (definition, inputs, config) => {
    // 内部回路評価は複雑なため、現在は未実装
    // 将来的にはcircuitEvaluation.tsで実装予定
    return failure(createEvaluationError(
      'Internal circuit evaluation not yet implemented',
      'GATE_LOGIC'
    ));
  }
};

// ===============================
// 後方互換性ヘルパー
// ===============================

/**
 * 旧APIとの互換性のため、boolean | boolean[] 形式に変換
 * 
 * @deprecated 新しいコードでは使用しないでください
 */
export function convertToLegacyFormat(result: GateEvaluationResult): boolean | boolean[] {
  if (result.isSingleOutput) {
    return result.primaryOutput;
  } else {
    return [...result.outputs];
  }
}

/**
 * 単一出力ゲート評価（後方互換性用）
 * 
 * @deprecated evaluateGateUnified を使用してください
 */
export function evaluateGateSingle(
  gate: Readonly<Gate>,
  inputs: readonly boolean[],
  config: Readonly<EvaluationConfig> = defaultConfig
): Result<boolean, EvaluationError> {
  const result = evaluateGateUnified(gate, inputs, config);
  
  if (result.success) {
    return success(result.data.primaryOutput, result.warnings);
  } else {
    return result;
  }
}

/**
 * 複数出力ゲート評価（後方互換性用）
 * 
 * @deprecated evaluateGateUnified を使用してください
 */
export function evaluateGateMulti(
  gate: Readonly<Gate>,
  inputs: readonly boolean[],
  config: Readonly<EvaluationConfig> = defaultConfig
): Result<readonly boolean[], EvaluationError> {
  const result = evaluateGateUnified(gate, inputs, config);
  
  if (result.success) {
    return success(result.data.outputs, result.warnings);
  } else {
    return result;
  }
}
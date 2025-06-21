/**
 * カスタムゲートの内部回路評価
 */

import type { CustomGateDefinition } from '../../../types/circuit';
import type { Circuit } from './types';
import type { EvaluationConfig, EvaluationError, Result } from './types';
import { success, failure } from './types';
import { evaluateCircuit } from './circuitEvaluation';

/**
 * カスタムゲートの内部回路を評価
 */
export function evaluateCustomGateByInternalCircuit(
  definition: Readonly<CustomGateDefinition>,
  inputs: readonly boolean[],
  config: Readonly<EvaluationConfig>
): Result<readonly boolean[], EvaluationError> {
  if (!definition.internalCircuit) {
    return failure({
      type: 'EVALUATION_ERROR',
      message: 'Custom gate has no internal circuit',
      code: 'NO_INTERNAL_CIRCUIT',
      stage: 'GATE_LOGIC',
      severity: 'ERROR',
    } as EvaluationError);
  }

  const { gates, wires, inputMappings, outputMappings } =
    definition.internalCircuit;

  // 入力数の検証
  if (inputs.length !== definition.inputs.length) {
    return failure({
      type: 'EVALUATION_ERROR',
      message: `Input count mismatch: expected ${definition.inputs.length}, got ${inputs.length}`,
      code: 'INPUT_COUNT_MISMATCH',
      stage: 'INPUT_COLLECTION',
      severity: 'ERROR',
    } as EvaluationError);
  }

  // 内部回路のコピーを作成（入力値を設定）
  const internalGates = gates.map(gate => ({ ...gate }));
  const internalWires = wires.map(wire => ({ ...wire }));

  // 入力値を内部回路の入力ゲートに設定
  for (let i = 0; i < inputs.length; i++) {
    const mapping = inputMappings[i];
    if (!mapping) continue;

    const inputGate = internalGates.find(g => g.id === mapping.gateId);
    if (inputGate) {
      inputGate.output = inputs[i];
    }
  }

  // 内部回路を評価
  const circuit: Circuit = {
    gates: internalGates,
    wires: internalWires,
    metadata: {},
  };

  const evaluationResult = evaluateCircuit(circuit, config);

  if (!evaluationResult.success) {
    return failure({
      type: 'EVALUATION_ERROR',
      message: `Internal circuit evaluation failed: ${evaluationResult.error.message}`,
      code: 'INTERNAL_CIRCUIT_EVALUATION_FAILED',
      stage: 'GATE_LOGIC',
      severity: 'ERROR',
    } as EvaluationError);
  }

  const evaluatedCircuit = evaluationResult.data.circuit;

  // 出力値を収集
  const outputs: boolean[] = [];

  for (let i = 0; i < definition.outputs.length; i++) {
    const mapping = outputMappings[i];
    if (!mapping) {
      outputs.push(false); // デフォルト値
      continue;
    }

    const outputGate = evaluatedCircuit.gates.find(
      g => g.id === mapping.gateId
    );
    if (outputGate) {
      outputs.push(outputGate.output);
    } else {
      outputs.push(false); // デフォルト値
    }
  }

  return success(outputs);
}

/**
 * イベント駆動エンジンを使用したカスタムゲートの内部回路評価
 * （遅延モード対応）
 */
export function evaluateCustomGateByInternalCircuitWithDelay(
  definition: Readonly<CustomGateDefinition>,
  inputs: readonly boolean[],
  config: Readonly<EvaluationConfig>,
  previousOutputs?: readonly boolean[]
): Result<
  { outputs: readonly boolean[]; hasChanged: boolean },
  EvaluationError
> {
  const result = evaluateCustomGateByInternalCircuit(
    definition,
    inputs,
    config
  );

  if (!result.success) {
    return failure(result.error);
  }

  // 出力が変化したかチェック
  const hasChanged =
    !previousOutputs ||
    result.data.length !== previousOutputs.length ||
    result.data.some((output, i) => output !== previousOutputs[i]);

  return success({
    outputs: result.data,
    hasChanged,
  });
}

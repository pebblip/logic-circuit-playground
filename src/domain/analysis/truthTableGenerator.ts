import type { Gate, Wire } from '../../types/circuit';
import type { Circuit } from '../simulation/core/types';
// import { getGlobalEvaluationService } from '../simulation/services/CircuitEvaluationService';
import { CircuitEvaluator } from '../simulation/core/evaluator';
import type {
  EvaluationCircuit,
  EvaluationContext,
} from '../simulation/core/types';

export interface TruthTableRow {
  inputs: string;
  outputs: string;
  inputValues: boolean[];
  outputValues: boolean[];
}

export interface TruthTableResult {
  table: TruthTableRow[];
  inputCount: number;
  outputCount: number;
  isSequential: boolean;
  recognizedPattern?: string;
}

/**
 * 組み合わせ回路から真理値表を自動生成
 */
export function generateTruthTable(
  gates: Gate[],
  wires: Wire[],
  inputGates: Gate[],
  outputGates: Gate[]
): TruthTableResult {
  const inputCount = inputGates.length;
  const outputCount = outputGates.length;
  const totalCombinations = Math.pow(2, inputCount);

  const table: TruthTableRow[] = [];
  let hasSequentialBehavior = false;

  // 全ての入力パターンを試す
  for (let i = 0; i < totalCombinations; i++) {
    const inputPattern = i.toString(2).padStart(inputCount, '0');
    const inputValues: boolean[] = [];

    // 入力ゲートに値を設定
    const testGates = gates.map(gate => ({ ...gate }));
    inputGates.forEach((inputGate, index) => {
      const inputValue = inputPattern[index] === '1';
      inputValues.push(inputValue);

      const gateToUpdate = testGates.find(g => g.id === inputGate.id);
      if (gateToUpdate) {
        gateToUpdate.outputs = [inputValue];
      }
    });

    // 回路を評価（統一評価サービス使用）
    const circuit: Circuit = {
      gates: testGates,
      wires: [...wires],
    };

    // const evaluationService = getGlobalEvaluationService();
    let evaluatedGates: Gate[];

    try {
      // 統一サービスと同じ設定を適用した評価
      // const complexity = evaluationService.analyzeComplexity(circuit);
      // const strategy = complexity.recommendedStrategy;

      // 同期評価（CircuitEvaluatorを直接使用）
      const evaluator = new CircuitEvaluator();

      // Circuit型をEvaluationCircuit型に変換
      const evaluationCircuit: EvaluationCircuit = {
        gates: circuit.gates.map(gate => ({
          id: gate.id,
          type: gate.type,
          position: gate.position,
          inputs: gate.inputs || [],
          outputs: gate.outputs || [],
        })),
        wires: circuit.wires,
      };

      // 評価コンテキストを作成
      const evaluationContext: EvaluationContext = {
        currentTime: Date.now(),
        memory: {},
      };

      // 即座評価を使用（真理値表生成は組み合わせ回路前提）
      const evaluationResult = evaluator.evaluateImmediate(
        evaluationCircuit,
        evaluationContext
      );

      // 結果をCircuit形式に変換
      evaluatedGates = evaluationResult.circuit.gates.map(gate => ({
        ...gate,
        position: gate.position,
        inputs: [...gate.inputs],
        outputs: [...gate.outputs],
        output: gate.outputs[0] ?? false,
      }));
    } catch (error) {
      // エラー時は元のゲート状態を使用（フォールバック）
      console.warn(
        `Truth table generation: Circuit evaluation failed for pattern ${inputPattern}:`,
        error instanceof Error ? error.message : 'Unknown error'
      );
      evaluatedGates = testGates;
      hasSequentialBehavior = true; // エラーが発生した場合は複雑な回路とみなす
    }

    // 出力値を取得
    const outputValues: boolean[] = [];
    const outputPattern = outputGates
      .map(outputGate => {
        const evaluatedGate = evaluatedGates.find(g => g.id === outputGate.id);
        const outputValue = evaluatedGate?.inputs[0] === true || false;
        outputValues.push(outputValue);
        return outputValue ? '1' : '0';
      })
      .join('');

    table.push({
      inputs: inputPattern,
      outputs: outputPattern,
      inputValues,
      outputValues,
    });
  }

  // パターン認識
  const recognizedPattern = recognizePattern(table, inputCount, outputCount);

  return {
    table,
    inputCount,
    outputCount,
    isSequential: hasSequentialBehavior,
    recognizedPattern,
  };
}

/**
 * 既知のパターンと照合
 */
function recognizePattern(
  table: TruthTableRow[],
  inputCount: number,
  outputCount: number
): string | undefined {
  if (inputCount === 2 && outputCount === 1) {
    const pattern = table.map(row => row.outputs).join('');

    switch (pattern) {
      case '0001':
        return 'AND';
      case '0111':
        return 'OR';
      case '0110':
        return 'XOR';
      case '1110':
        return 'NAND';
      case '1000':
        return 'NOR';
      case '1001':
        return 'XNOR';
      default:
        break;
    }
  }

  if (inputCount === 1 && outputCount === 1) {
    const pattern = table.map(row => row.outputs).join('');
    if (pattern === '10') return 'NOT';
    if (pattern === '01') return 'BUFFER';
  }

  if (inputCount === 2 && outputCount === 2) {
    // 半加算器のパターンチェック
    const outputPatterns = table.map(row => row.outputs);
    const expectedHalfAdder = ['00', '10', '10', '01'];

    if (JSON.stringify(outputPatterns) === JSON.stringify(expectedHalfAdder)) {
      return '半加算器 (Half Adder)';
    }
  }

  if (inputCount === 3 && outputCount === 2) {
    // 全加算器のパターンチェック
    const outputPatterns = table.map(row => row.outputs);
    const expectedFullAdder = ['00', '10', '10', '01', '10', '01', '01', '11'];

    if (JSON.stringify(outputPatterns) === JSON.stringify(expectedFullAdder)) {
      return '全加算器 (Full Adder)';
    }
  }

  return undefined;
}

/**
 * 真理値表をCSV形式で出力
 */
export function exportTruthTableAsCSV(
  result: TruthTableResult,
  inputNames: string[],
  outputNames: string[]
): string {
  const headers = [...inputNames, ...outputNames];
  const csvLines = [headers.join(',')];

  result.table.forEach(row => {
    const values = [...row.inputs.split(''), ...row.outputs.split('')];
    csvLines.push(values.join(','));
  });

  return csvLines.join('\n');
}

/**
 * 真理値表の統計情報を計算
 */
export function calculateTruthTableStats(result: TruthTableResult) {
  const totalRows = result.table.length;
  const trueOutputs = result.table.reduce((count, row) => {
    return count + row.outputValues.filter(Boolean).length;
  }, 0);

  return {
    totalCombinations: totalRows,
    trueOutputRatio: trueOutputs / (totalRows * result.outputCount),
    complexity: totalRows > 8 ? 'High' : totalRows > 4 ? 'Medium' : 'Low',
    isComplete: totalRows === Math.pow(2, result.inputCount),
  };
}

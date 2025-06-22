/**
 * 回路評価エンジン
 *
 * イミュータブルなデータ構造と純粋関数で回路を評価する
 */

import type {
  EvaluationGate,
  EvaluationCircuit,
  EvaluationContext,
  EvaluatorResult,
  GateMemory,
} from './types';
import type { Wire } from '../../../types/circuit';
import { gateEvaluators } from './evaluators';
import { CircularDependencyDetector } from '../../analysis/circular-dependency-detector';

export class CircuitEvaluator {
  private circularDetector = new CircularDependencyDetector();

  /**
   * 回路を即座に評価
   * 循環依存がある場合はエラーを発生させる
   */
  evaluateImmediate(
    circuit: EvaluationCircuit,
    context: EvaluationContext
  ): EvaluatorResult {
    // 循環検出
    // Convert EvaluationCircuit to Circuit for dependency detection
    const circuitForDetection = {
      gates: circuit.gates.map(g => ({
        id: g.id,
        type: g.type,
        position: g.position,
        inputs: g.inputs,
        outputs: g.outputs,
        output: g.outputs[0],
      })),
      wires: circuit.wires,
    };
    if (this.circularDetector.hasCircularDependency(circuitForDetection)) {
      // const cycles = this.circularDetector.detectCycles(circuit as any);
      // 循環依存がある場合は警告を返して元の回路をそのまま返す
      return {
        circuit,
        context,
        hasChanges: false,
        warnings: [
          '循環回路が検出されました。遅延モードを有効にしてください。',
        ],
      };
    }

    return this.evaluateInternal(circuit, context);
  }

  /**
   * 回路を遅延を考慮して評価
   * 発振回路や順序回路に対応
   */
  evaluateDelayed(
    circuit: EvaluationCircuit,
    context: EvaluationContext
  ): EvaluatorResult {
    // 遅延モードでは循環を許可
    return this.evaluateInternal(circuit, context);
  }

  /**
   * 内部的な評価処理
   */
  private evaluateInternal(
    circuit: EvaluationCircuit,
    context: EvaluationContext
  ): EvaluatorResult {
    // 収束するまで評価を繰り返す（最大10回）
    let currentCircuit = circuit;
    let currentContext = context;
    let hasChanges = true;
    let iterations = 0;
    const maxIterations = 10;

    while (hasChanges && iterations < maxIterations) {
      // 1. ワイヤーから各ゲートの入力を更新
      const gatesWithUpdatedInputs =
        this.updateGateInputsFromWires(currentCircuit);

      // 2. 各ゲートを評価
      let newMemory: GateMemory = { ...currentContext.memory };
      const evaluatedGates = gatesWithUpdatedInputs.gates.map(gate => {
        const evaluator = gateEvaluators[gate.type];
        if (!evaluator) {
          // 未知のゲートタイプはそのまま返す
          return gate;
        }

        const result = evaluator(
          gate.inputs as never,
          gate.id,
          {
            ...currentContext,
            memory: newMemory,
          },
          gate
        );

        // メモリ更新があれば適用
        if (result.memoryUpdate) {
          newMemory = {
            ...newMemory,
            [gate.id]: {
              ...newMemory[gate.id],
              ...result.memoryUpdate,
            },
          };
        }

        return {
          ...gate,
          outputs: result.outputs,
          inputs: gate.inputs,
        };
      });

      // 3. ゲートの出力からワイヤーの状態を更新
      const updatedWires = this.updateWireStatesFromGates(
        currentCircuit.wires,
        evaluatedGates
      );

      // 4. 変更があったかチェック
      hasChanges = this.detectChanges(
        currentCircuit,
        evaluatedGates,
        updatedWires
      );

      // 次のイテレーションのために回路を更新
      currentCircuit = {
        gates: evaluatedGates,
        wires: updatedWires,
      };
      currentContext = {
        ...currentContext,
        memory: newMemory,
      };

      iterations++;
    }

    return {
      circuit: currentCircuit,
      context: currentContext,
      hasChanges: false, // 収束したので変更なし
      warnings: [],
    };
  }

  /**
   * ワイヤーの状態からゲートの入力を更新
   */
  private updateGateInputsFromWires(
    circuit: EvaluationCircuit
  ): EvaluationCircuit {
    // ゲートIDでマップを作成
    const gateMap = new Map(circuit.gates.map(g => [g.id, g]));

    // 各ゲートについて、どの入力ピンがワイヤーで接続されているかを追跡
    const connectedInputs = new Map<string, Set<number>>();
    circuit.wires.forEach(wire => {
      if (!connectedInputs.has(wire.to.gateId)) {
        connectedInputs.set(wire.to.gateId, new Set());
      }
      connectedInputs.get(wire.to.gateId)!.add(wire.to.pinIndex);
    });

    // 各ゲートの入力を更新（接続されていない入力は保持）
    const updatedGates = circuit.gates.map(gate => {
      const connectedPins = connectedInputs.get(gate.id) || new Set();
      const inputCount = this.getInputCount(gate);
      const newInputs = new Array(inputCount);

      // 既存の入力値を保持、または接続されていない場合はfalse
      for (let i = 0; i < inputCount; i++) {
        if (connectedPins.has(i)) {
          // このピンは後でワイヤーから更新される
          newInputs[i] = false;
        } else {
          // 接続されていないピンは既存の値を保持
          newInputs[i] = gate.inputs[i] ?? false;
        }
      }

      return {
        ...gate,
        inputs: newInputs,
      };
    });
    const updatedGateMap = new Map(updatedGates.map(g => [g.id, g]));

    // ワイヤーから入力を設定
    circuit.wires.forEach(wire => {
      const sourceGate = gateMap.get(wire.from.gateId);
      const targetGate = updatedGateMap.get(wire.to.gateId);

      if (sourceGate && targetGate) {
        const outputIndex = wire.from.pinIndex === -1 ? 0 : wire.from.pinIndex;
        const outputValue = sourceGate.outputs[outputIndex] ?? false;

        // 入力を更新
        const newInputs = [...targetGate.inputs];
        newInputs[wire.to.pinIndex] = outputValue;

        // Mapを更新
        const updatedTargetGate = {
          ...targetGate,
          inputs: newInputs,
        };
        updatedGateMap.set(wire.to.gateId, updatedTargetGate);
      }
    });

    return {
      gates: Array.from(updatedGateMap.values()),
      wires: circuit.wires,
    };
  }

  /**
   * ゲートの出力からワイヤーの状態を更新
   */
  private updateWireStatesFromGates(
    wires: readonly Wire[],
    gates: readonly EvaluationGate[]
  ): Wire[] {
    const gateMap = new Map(gates.map(g => [g.id, g]));

    return wires.map(wire => {
      const sourceGate = gateMap.get(wire.from.gateId);
      if (!sourceGate) {
        return { ...wire, isActive: false };
      }

      const outputIndex = wire.from.pinIndex === -1 ? 0 : wire.from.pinIndex;
      const isActive = sourceGate.outputs[outputIndex] ?? false;

      return { ...wire, isActive };
    });
  }

  /**
   * ゲートの入力数を取得
   */
  private getInputCount(gate: EvaluationGate): number {
    switch (gate.type) {
      case 'INPUT':
        return 0;
      case 'OUTPUT':
      case 'NOT':
        return 1;
      case 'AND':
      case 'OR':
      case 'XOR':
      case 'NAND':
      case 'NOR':
      case 'SR-LATCH':
      case 'D-FF':
        return 2;
      case 'MUX':
        // MUXは可変だが、最低3入力（2データ + 1セレクタ）
        return Math.max(3, gate.inputs.length);
      case 'BINARY_COUNTER':
        return 2; // CLK, RESET
      case 'CUSTOM':
        // カスタムゲートは現在の入力数を維持
        return gate.inputs.length;
      default:
        return gate.inputs.length;
    }
  }

  /**
   * 変更があったかどうかを検出
   */
  private detectChanges(
    originalCircuit: EvaluationCircuit,
    newGates: readonly EvaluationGate[],
    newWires: readonly Wire[]
  ): boolean {
    // ゲートの出力が変わったかチェック
    const originalGateMap = new Map(originalCircuit.gates.map(g => [g.id, g]));

    for (const newGate of newGates) {
      const originalGate = originalGateMap.get(newGate.id);
      if (!originalGate) continue;

      // 出力を比較
      if (newGate.outputs.length !== originalGate.outputs.length) {
        return true;
      }

      for (let i = 0; i < newGate.outputs.length; i++) {
        if (newGate.outputs[i] !== originalGate.outputs[i]) {
          return true;
        }
      }
    }

    // ワイヤーの状態が変わったかチェック
    const originalWireMap = new Map(originalCircuit.wires.map(w => [w.id, w]));

    for (const newWire of newWires) {
      const originalWire = originalWireMap.get(newWire.id);
      if (!originalWire) continue;

      if (newWire.isActive !== originalWire.isActive) {
        return true;
      }
    }

    return false;
  }
}

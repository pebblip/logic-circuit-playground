import type { StateCreator } from 'zustand';
import type { CircuitStore } from '../types';
import type {
  Gate,
  CustomGateDefinition,
  CustomGatePin,
} from '@/types/circuit';
import {
  saveCustomGates,
  loadCustomGates,
} from '@infrastructure/storage/customGateStorage';
import type { Circuit } from '@domain/simulation/core/types';
import { CircuitEvaluator } from '@domain/simulation/core/evaluator';
import type {
  EvaluationCircuit,
  EvaluationContext,
} from '@domain/simulation/core/types';
import { IdGenerator } from '@shared/id';

export interface CustomGateSlice {
  customGates: CustomGateDefinition[];
  addCustomGate: (definition: CustomGateDefinition) => void;
  removeCustomGate: (id: string) => void;
  createCustomGateFromCurrentCircuit: () => void;
}

export const createCustomGateSlice: StateCreator<
  CircuitStore,
  [],
  [],
  CustomGateSlice
> = (set, get) => ({
  customGates: loadCustomGates(),

  addCustomGate: (definition: CustomGateDefinition) => {
    set(state => {
      const newCustomGates = [...state.customGates, definition];
      saveCustomGates(newCustomGates);
      return { customGates: newCustomGates };
    });
  },

  removeCustomGate: (id: string) => {
    set(state => {
      const newCustomGates = state.customGates.filter(g => g.id !== id);
      saveCustomGates(newCustomGates);
      return { customGates: newCustomGates };
    });
  },

  createCustomGateFromCurrentCircuit: () => {
    const state = get();
    const { gates } = state;

    // INPUTとOUTPUTゲートを抽出
    const inputGates = gates.filter(g => g.type === 'INPUT');
    const outputGates = gates.filter(g => g.type === 'OUTPUT');

    if (inputGates.length === 0 || outputGates.length === 0) {
      alert('回路にはINPUTゲートとOUTPUTゲートが必要です');
      return;
    }

    // ピン情報を作成
    const inputPins: CustomGatePin[] = inputGates.map((gate, index) => ({
      name: `IN${index + 1}`,
      index,
      gateId: gate.id,
    }));

    const outputPins: CustomGatePin[] = outputGates.map((gate, index) => ({
      name: `OUT${index + 1}`,
      index,
      gateId: gate.id,
    }));

    // 回路をシミュレーションして真理値表を生成
    const truthTable: Record<string, string> = {};
    const inputCount = inputGates.length;
    const combinations = Math.pow(2, inputCount);

    for (let i = 0; i < combinations; i++) {
      // 入力の組み合わせを設定
      const inputBits = i.toString(2).padStart(inputCount, '0');
      const testGates = gates.map(gate => {
        if (gate.type === 'INPUT') {
          const inputIndex = inputGates.findIndex(ig => ig.id === gate.id);
          return {
            ...gate,
            output: inputBits[inputIndex] === '1',
          };
        }
        return gate;
      });

      // 回路を評価（統一評価サービス使用）
      const circuit: Circuit = { gates: testGates, wires: state.wires };
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

        // 即座評価を使用（カスタムゲート生成は組み合わせ回路前提）
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
      } catch {
        // エラー時は評価前のゲートを使用
        evaluatedGates = testGates;
      }

      // 出力を読み取る
      const outputBits = outputGates
        .map(outputGate => {
          const evaluatedGate = evaluatedGates.find(
            g => g.id === outputGate.id
          );
          // OUTPUTゲートの場合、inputs[0]をbooleanとして評価
          if (evaluatedGate?.inputs && evaluatedGate.inputs.length > 0) {
            return evaluatedGate.inputs[0] ? '1' : '0';
          }
          // デフォルト値
          return '0';
        })
        .join('');

      truthTable[inputBits] = outputBits;
    }

    // 入力/出力マッピングを作成
    const inputMappings: Record<number, { gateId: string; pinIndex: number }> =
      {};
    const outputMappings: Record<number, { gateId: string; pinIndex: number }> =
      {};

    // 入力マッピング: 外部ピンインデックス → INPUTゲート
    inputPins.forEach((pin, index) => {
      if (pin.gateId) {
        inputMappings[index] = { gateId: pin.gateId, pinIndex: 0 };
      }
    });

    // 出力マッピング: 外部ピンインデックス → OUTPUTゲート
    outputPins.forEach((pin, index) => {
      if (pin.gateId) {
        outputMappings[index] = { gateId: pin.gateId, pinIndex: 0 };
      }
    });

    // カスタムゲート定義を作成
    const definition: CustomGateDefinition = {
      id: IdGenerator.generateCustomGateId(),
      name: `CustomGate_${Date.now()}`,
      displayName: 'カスタムゲート',
      description: '現在の回路から作成されたカスタムゲート',
      icon: '⚡',
      width: 100,
      height: Math.max(80, Math.max(inputCount, outputPins.length) * 40),
      inputs: inputPins,
      outputs: outputPins,
      truthTable,
      // 内部回路構造を保存
      internalCircuit: {
        gates: [...gates],
        wires: [...state.wires],
        inputMappings,
        outputMappings,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // カスタムゲートを追加
    get().addCustomGate(definition);
    // テスト環境対応: alertの代わりにconsole.log
    if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      alert('カスタムゲートが作成されました！');
    } else {
      // テスト環境では alert が利用できないため、コンソールログのみ
    }
  },
});

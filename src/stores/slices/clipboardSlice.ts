import type { StateCreator } from 'zustand';
import type { CircuitStore, ClipboardData } from '../types';
import type { Position, Gate, Wire } from '@/types/circuit';
import { IdGenerator } from '@shared/id';
import { isSuccess } from '@domain/simulation/core';
import type { Circuit } from '@domain/simulation/core/types';
import { CircuitEvaluator } from '@domain/simulation/core/evaluator';
import type {
  EvaluationCircuit,
  EvaluationContext,
} from '@domain/simulation/core/types';

// 統一評価サービスを取得
// const evaluationService = getGlobalEvaluationService();

// Zustand内での同期使用のためのラッパー関数
function evaluateCircuitSync(circuit: Circuit) {
  // 同期版：CircuitEvaluatorを直接使用（統一設定適用）
  try {
    // const complexity = evaluationService.analyzeComplexity(circuit);
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

    // 即座評価を使用
    const evaluationResult = evaluator.evaluateImmediate(
      evaluationCircuit,
      evaluationContext
    );

    // 結果をCircuit型に変換
    const resultCircuit: Circuit = {
      gates: evaluationResult.circuit.gates.map(gate => ({
        ...gate,
        position: gate.position,
        inputs: [...gate.inputs],
        outputs: [...gate.outputs],
        output: gate.outputs[0] ?? false,
      })),
      wires: evaluationResult.circuit.wires,
    };

    return {
      success: true as const,
      data: {
        circuit: resultCircuit,
      },
      warnings: [],
    };
  } catch (error) {
    return {
      success: false as const,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        type: 'EVALUATION_FAILED',
      },
      warnings: [],
    };
  }
}

export interface ClipboardSlice {
  clipboard: ClipboardData | null;
  copySelection: () => void;
  paste: (position: Position) => void;
  canPaste: () => boolean;
}

export const createClipboardSlice: StateCreator<
  CircuitStore,
  [],
  [],
  ClipboardSlice
> = (set, get) => ({
  clipboard: null,

  copySelection: () => {
    const state = get();
    if (state.selectedGateIds.length === 0) return;

    // 選択されたゲートをコピー
    const selectedGates = state.gates.filter(gate =>
      state.selectedGateIds.includes(gate.id)
    );

    // 選択されたゲート間のワイヤーのみをコピー
    const selectedWires = state.wires.filter(
      wire =>
        state.selectedGateIds.includes(wire.from.gateId) &&
        state.selectedGateIds.includes(wire.to.gateId)
    );

    // 選択範囲の境界を計算
    const bounds = selectedGates.reduce(
      (acc, gate) => ({
        minX: Math.min(acc.minX, gate.position.x),
        minY: Math.min(acc.minY, gate.position.y),
        maxX: Math.max(acc.maxX, gate.position.x),
        maxY: Math.max(acc.maxY, gate.position.y),
      }),
      {
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity,
      }
    );

    set({
      clipboard: {
        gates: selectedGates,
        wires: selectedWires,
        bounds,
      },
    });
  },

  paste: (position: Position) => {
    const state = get();
    if (!state.clipboard) return;

    // 元の選択範囲の中心を計算
    const centerX =
      (state.clipboard.bounds.minX + state.clipboard.bounds.maxX) / 2;
    const centerY =
      (state.clipboard.bounds.minY + state.clipboard.bounds.maxY) / 2;

    // ペースト位置へのオフセットを計算
    const offsetX = position.x - centerX;
    const offsetY = position.y - centerY;

    // ゲートIDのマッピング（古いID → 新しいID）
    const idMapping = new Map<string, string>();

    // ゲートをコピー
    const newGates: Gate[] = state.clipboard.gates.map(gate => {
      const newId = IdGenerator.generateGateId();
      idMapping.set(gate.id, newId);

      return {
        ...gate,
        id: newId,
        position: {
          x: gate.position.x + offsetX,
          y: gate.position.y + offsetY,
        },
      };
    });

    // ワイヤーをコピー（IDをマッピング）
    const newWires: Wire[] = state.clipboard.wires.map(wire => ({
      id: IdGenerator.generateWireId(),
      from: {
        gateId: idMapping.get(wire.from.gateId) || wire.from.gateId,
        pinIndex: wire.from.pinIndex,
      },
      to: {
        gateId: idMapping.get(wire.to.gateId) || wire.to.gateId,
        pinIndex: wire.to.pinIndex,
      },
      isActive: wire.isActive,
    }));

    // 回路に追加
    const allGates = [...state.gates, ...newGates];
    const allWires = [...state.wires, ...newWires];

    // 回路全体を評価
    const circuit: Circuit = { gates: allGates, wires: allWires };
    const result = evaluateCircuitSync(circuit);

    // 新しくペーストしたゲートを選択
    const newGateIds = newGates.map(g => g.id);

    if (isSuccess(result)) {
      set({
        gates: [...result.data.circuit.gates],
        wires: [...result.data.circuit.wires],
        selectedGateIds: newGateIds,
        selectedGateId: newGateIds.length === 1 ? newGateIds[0] : null,
      });
    } else {
      console.warn(
        'Clipboard operation: Circuit evaluation failed:',
        result.error.message
      );
      set({
        gates: allGates,
        wires: allWires,
        selectedGateIds: newGateIds,
        selectedGateId: newGateIds.length === 1 ? newGateIds[0] : null,
      });
    }

    // 履歴に追加
    get().saveToHistory();
  },

  canPaste: () => {
    return get().clipboard !== null;
  },
});

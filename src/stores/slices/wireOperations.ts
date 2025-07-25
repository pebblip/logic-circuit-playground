import type { StateCreator } from 'zustand';
import type { CircuitStore } from '../types';
import type { Wire } from '@/types/circuit';
import { IdGenerator } from '@shared/id';
import type { Circuit } from '@domain/simulation/core/types';
import { CircuitEvaluator } from '@domain/simulation/core/evaluator';
import type {
  EvaluationCircuit,
  EvaluationContext,
  GateMemory,
} from '@domain/simulation/core/types';
import {
  getInputPinPosition,
  getOutputPinPosition,
} from '@domain/analysis/pinPositionCalculator';
import { WireConnectionService } from '@/services/WireConnectionService';

// 統一評価サービスを取得
// const evaluationService = getGlobalEvaluationService();

// Zustand内での同期使用のためのラッパー関数
function evaluateCircuitSync(circuit: Circuit) {
  // 同期版：EnhancedHybridEvaluatorを直接使用（統一設定適用）
  try {
    // 統一サービスと同じ設定を適用したエバリュエーターを使用
    // const complexity = evaluationService.analyzeComplexity(circuit);
    // const strategy = complexity.recommendedStrategy;

    // CircuitEvaluatorを直接使用（同期処理）
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

    // 評価コンテキストを作成（INPUTゲートの状態を初期化）
    const memory: GateMemory = {};
    circuit.gates.forEach(gate => {
      if (gate.type === 'INPUT') {
        memory[gate.id] = { state: gate.outputs?.[0] ?? false };
      } else if (gate.type === 'CLOCK') {
        memory[gate.id] = {
          output: gate.outputs?.[0] ?? false,
          frequency: gate.metadata?.frequency || 1,
          manualToggle: gate.outputs?.[0] ?? false,
        };
      } else if (gate.type === 'D-FF') {
        memory[gate.id] = {
          prevClk: false,
          q: gate.outputs?.[0] ?? false,
        };
      } else if (gate.type === 'SR-LATCH') {
        memory[gate.id] = {
          q: gate.outputs?.[0] ?? false,
        };
      }
    });

    const evaluationContext: EvaluationContext = {
      currentTime: Date.now(),
      memory,
    };

    // 即座評価を使用（ワイヤー操作は組み合わせ回路前提）
    const evaluationResult = evaluator.evaluateImmediate(
      evaluationCircuit,
      evaluationContext
    );

    // 結果をCircuit型に変換
    const resultCircuit: Circuit = {
      gates: evaluationResult.circuit.gates.map(evalGate => {
        const originalGate = circuit.gates.find(g => g.id === evalGate.id);

        return {
          ...originalGate,
          ...evalGate,
          position: evalGate.position,
          inputs: [...evalGate.inputs],
          outputs: [...evalGate.outputs],
        };
      }),
      wires: evaluationResult.circuit.wires,
    };

    return {
      success: true as const,
      data: {
        circuit: resultCircuit,
        evaluationStats: {
          gatesEvaluated: resultCircuit.gates.length,
          evaluationCycles: 1,
          totalEvaluationTime: 0, // 同期版では測定なし
        },
        dependencyGraph: [],
      },
      warnings: [], // 簡略版では警告なし
    };
  } catch (error) {
    console.error('Sync circuit evaluation failed:', error);
    return {
      success: false as const,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        type: 'EVALUATION_FAILED',
      },
      data: {
        circuit,
        evaluationStats: {
          gatesEvaluated: 0,
          evaluationCycles: 0,
          totalEvaluationTime: 0,
        },
        dependencyGraph: [],
      },
      warnings: [],
    };
  }
}

export interface WireOperationsSlice {
  startWireDrawing: (gateId: string, pinIndex: number) => void;
  endWireDrawing: (gateId: string, pinIndex: number) => void;
  cancelWireDrawing: () => void;
  deleteWire: (wireId: string) => void;
}

export const createWireOperationsSlice: StateCreator<
  CircuitStore,
  [],
  [],
  WireOperationsSlice
> = (set, get) => ({
  startWireDrawing: (gateId, pinIndex) => {
    const gate = get().gates.find(g => g.id === gateId);
    if (!gate) return;

    // ピンの位置を計算
    const isOutput = pinIndex < 0;
    const actualPinIndex = isOutput ? Math.abs(pinIndex) - 1 : pinIndex;
    const position = isOutput
      ? getOutputPinPosition(gate, actualPinIndex)
      : getInputPinPosition(gate, actualPinIndex);

    set({
      isDrawingWire: true,
      wireStart: { gateId, pinIndex, position },
    });
  },

  endWireDrawing: (gateId, pinIndex) => {
    set(state => {
      if (!state.wireStart || state.wireStart.gateId === gateId) {
        return { isDrawingWire: false, wireStart: null };
      }

      const startGate = state.gates.find(g => g.id === state.wireStart!.gateId);
      const endGate = state.gates.find(g => g.id === gateId);

      if (!startGate || !endGate) {
        return { isDrawingWire: false, wireStart: null };
      }

      const startPinIndex = state.wireStart.pinIndex;
      const isStartOutput = startPinIndex < 0;

      // 接続可能性をチェック
      const connectionCheck = WireConnectionService.canConnect(
        startGate,
        startPinIndex,
        endGate,
        pinIndex,
        state.wires
      );

      // 接続不可の場合はエラーメッセージを表示して終了
      if (!connectionCheck.valid) {
        // エラーメッセージを設定（別のアクションとして実行）
        setTimeout(() => {
          get().setError(
            connectionCheck.reason || '接続できませんでした',
            'connection'
          );
        }, 0);

        return {
          isDrawingWire: false,
          wireStart: null,
        };
      }

      // 接続の方向を決定（必ず出力→入力）
      let from, to;
      if (isStartOutput) {
        from = {
          gateId: state.wireStart.gateId,
          pinIndex: startPinIndex,
        };
        to = {
          gateId,
          pinIndex,
        };
      } else {
        from = {
          gateId,
          pinIndex,
        };
        to = {
          gateId: state.wireStart.gateId,
          pinIndex: startPinIndex,
        };
      }

      // 既存の同じ接続をチェック
      const existingWire = state.wires.find(
        wire =>
          wire.from.gateId === from.gateId &&
          wire.from.pinIndex === from.pinIndex &&
          wire.to.gateId === to.gateId &&
          wire.to.pinIndex === to.pinIndex
      );

      if (existingWire) {
        return { isDrawingWire: false, wireStart: null };
      }

      // 入力ピンへの既存接続を削除
      const newWires = state.wires.filter(
        wire =>
          !(wire.to.gateId === to.gateId && wire.to.pinIndex === to.pinIndex)
      );

      // 新しいワイヤーを作成
      const newWire: Wire = {
        id: IdGenerator.generateWireId(),
        from,
        to,
        isActive: false,
      };

      // ワイヤーを追加
      const updatedWires = [...newWires, newWire];

      // 回路全体を評価
      const circuit: Circuit = { gates: state.gates, wires: updatedWires };
      const result = evaluateCircuitSync(circuit);

      if (result.success) {
        return {
          gates: [...result.data.circuit.gates],
          wires: [...result.data.circuit.wires],
          isDrawingWire: false,
          wireStart: null,
        };
      } else {
        console.warn('Circuit evaluation failed');
        return {
          gates: state.gates,
          wires: updatedWires,
          isDrawingWire: false,
          wireStart: null,
        };
      }
    });

    // 履歴に追加
    get().saveToHistory();
  },

  cancelWireDrawing: () => {
    set({
      isDrawingWire: false,
      wireStart: null,
    });
  },

  deleteWire: (wireId: string) => {
    set(state => {
      const newWires = state.wires.filter(wire => wire.id !== wireId);

      // 回路全体を評価
      const circuit: Circuit = { gates: state.gates, wires: newWires };
      const result = evaluateCircuitSync(circuit);

      if (result.success) {
        return {
          gates: [...result.data.circuit.gates],
          wires: [...result.data.circuit.wires],
        };
      } else {
        console.warn('Circuit evaluation failed');
        return {
          gates: state.gates,
          wires: newWires,
        };
      }
    });

    // 履歴に追加
    get().saveToHistory();
  },
});

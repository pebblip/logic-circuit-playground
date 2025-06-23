import type { StateCreator } from 'zustand';
import type { CircuitStore } from '../types';
import type {
  Gate,
  GateType,
  Position,
  CustomGateDefinition,
} from '@/types/circuit';
import { GateFactory } from '@/models/gates/GateFactory';
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

// 統一評価サービスを取得
// let evaluationService = getGlobalEvaluationService();

// Zustand内での同期使用のための一時的なラッパー関数
function evaluateCircuitSync(circuit: Circuit, delayMode: boolean = false) {
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
        memory[gate.id] = { state: gate.output ?? false };
      } else if (gate.type === 'CLOCK') {
        memory[gate.id] = {
          output: gate.output ?? false,
          frequency: gate.metadata?.frequency || 1,
          manualToggle: gate.output ?? false,
        };
      } else if (gate.type === 'D-FF') {
        memory[gate.id] = {
          prevClk: false,
          q: gate.outputs?.[0] ?? gate.output ?? false,
        };
      } else if (gate.type === 'SR-LATCH') {
        memory[gate.id] = {
          q: gate.outputs?.[0] ?? gate.output ?? false,
        };
      }
    });

    const evaluationContext: EvaluationContext = {
      currentTime: Date.now(),
      memory,
    };

    // 遅延モードに応じて適切な評価メソッドを呼び出し
    const evaluationResult = delayMode
      ? evaluator.evaluateDelayed(evaluationCircuit, evaluationContext)
      : evaluator.evaluateImmediate(evaluationCircuit, evaluationContext);

    // 結果をCircuit型に変換
    const resultCircuit: Circuit = {
      gates: evaluationResult.circuit.gates.map(evalGate => {
        const originalGate = circuit.gates.find(g => g.id === evalGate.id);

        // OUTPUTゲートの場合、入力値をoutputとして設定
        let outputValue = evalGate.outputs[0] ?? false;
        if (evalGate.type === 'OUTPUT') {
          outputValue = evalGate.inputs[0] ?? false;
        }

        return {
          ...originalGate,
          ...evalGate,
          position: evalGate.position,
          inputs: [...evalGate.inputs],
          outputs: [...evalGate.outputs],
          output: outputValue,
          // INPUTゲートの場合、元のoutput値を保持
          ...(originalGate?.type === 'INPUT'
            ? { output: originalGate.output }
            : {}),
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

export interface GateOperationsSlice {
  addGate: (type: GateType, position: Position) => Gate;
  addCustomGateInstance: (
    definition: CustomGateDefinition,
    position: Position
  ) => Gate;
  moveGate: (
    gateId: string,
    position: Position,
    saveToHistory?: boolean
  ) => void;
  moveMultipleGates: (
    gateIds: string[],
    deltaX: number,
    deltaY: number,
    saveToHistory?: boolean
  ) => void;
  deleteGate: (gateId: string) => void;
  updateGateOutput: (gateId: string, output: boolean) => void;
  updateClockFrequency: (gateId: string, frequency: number) => void;
  updateGateTiming: (
    gateId: string,
    timing: Partial<{ propagationDelay: number | undefined }>
  ) => void;
  updateLEDGateData: (
    gateId: string,
    gateData: {
      bitWidth: number;
      displayMode: 'binary' | 'decimal' | 'both' | 'hex';
    }
  ) => void;
}

export const createGateOperationsSlice: StateCreator<
  CircuitStore,
  [],
  [],
  GateOperationsSlice
> = (set, get) => ({
  addGate: (type, position) => {
    const newGate = GateFactory.createGate(type, position);

    // 🚀 PURE CIRCUIT: boolean形式のまま保持（legacy変換は廃止）
    // newGate.inputsはすでにPureCircuit形式（boolean[]）なので変換不要

    set(state => {
      const newGates = [...state.gates, newGate];

      // 回路全体を評価
      const circuit: Circuit = { gates: newGates, wires: state.wires };
      const result = evaluateCircuitSync(
        circuit,
        state.simulationConfig.delayMode
      );

      if (result.success) {
        return {
          gates: [...result.data.circuit.gates],
          wires: [...result.data.circuit.wires],
        };
      } else {
        return {
          gates: newGates,
          wires: state.wires,
        };
      }
    });

    // 履歴に追加
    get().saveToHistory();

    // CLOCKゲートは配置されるが、自動選択は行わない

    return newGate;
  },

  addCustomGateInstance: (definition, position) => {
    const newGate = GateFactory.createCustomGate(definition, position);

    // カスタムゲートの入力値を適切な形式で初期化
    // 🚀 PURE CIRCUIT: boolean形式のまま保持（legacy変換は廃止）
    // newGate.inputsはすでにPureCircuit形式（boolean[]）なので変換不要

    set(state => {
      const newGates = [...state.gates, newGate];

      // 回路全体を評価
      const circuit: Circuit = { gates: newGates, wires: state.wires };
      const result = evaluateCircuitSync(
        circuit,
        state.simulationConfig.delayMode
      );

      if (result.success) {
        return {
          gates: [...result.data.circuit.gates],
          wires: [...result.data.circuit.wires],
        };
      } else {
        return {
          gates: newGates,
          wires: state.wires,
        };
      }
    });

    // 履歴に追加
    get().saveToHistory();

    return newGate;
  },

  moveGate: (gateId, position, saveToHistory = false) => {
    set(state => {
      // ワイヤー描画中で、移動するゲートから出ている場合は起点も更新
      let newWireStart = state.wireStart;
      if (
        state.isDrawingWire &&
        state.wireStart &&
        state.wireStart.gateId === gateId
      ) {
        const gate = state.gates.find(g => g.id === gateId);
        if (gate) {
          // ピンの位置を再計算
          const pinIndex = state.wireStart.pinIndex;
          const isOutput = pinIndex < 0;

          const pinPosition = isOutput
            ? getOutputPinPosition(gate, pinIndex)
            : getInputPinPosition(gate, pinIndex);

          newWireStart = { ...state.wireStart, position: pinPosition };
        }
      }

      const newGates = state.gates.map(gate =>
        gate.id === gateId ? { ...gate, position } : gate
      );

      // 回路全体を評価
      const circuit: Circuit = { gates: newGates, wires: state.wires };
      const result = evaluateCircuitSync(
        circuit,
        state.simulationConfig.delayMode
      );

      if (result.success) {
        return {
          gates: [...result.data.circuit.gates],
          wires: [...result.data.circuit.wires],
          wireStart: newWireStart,
        };
      } else {
        return {
          gates: newGates,
          wires: state.wires,
          wireStart: newWireStart,
        };
      }
    });

    // saveToHistoryフラグが設定されている場合のみ履歴に追加
    if (saveToHistory) {
      get().saveToHistory();
    }
  },

  moveMultipleGates: (gateIds, deltaX, deltaY, saveToHistory = false) => {
    set(state => {
      // 移動対象のゲートを更新
      const newGates = state.gates.map(gate => {
        if (gateIds.includes(gate.id)) {
          return {
            ...gate,
            position: {
              x: gate.position.x + deltaX,
              y: gate.position.y + deltaY,
            },
          };
        }
        return gate;
      });

      // ワイヤー描画中で、移動するゲートから出ている場合は起点も更新
      let newWireStart = state.wireStart;
      if (
        state.isDrawingWire &&
        state.wireStart &&
        gateIds.includes(state.wireStart.gateId)
      ) {
        const gate = newGates.find(g => g.id === state.wireStart!.gateId);
        if (gate) {
          // ピンの位置を再計算
          const pinIndex = state.wireStart.pinIndex;
          const isOutput = pinIndex < 0;

          const pinPosition = isOutput
            ? getOutputPinPosition(gate, pinIndex)
            : getInputPinPosition(gate, pinIndex);

          newWireStart = { ...state.wireStart, position: pinPosition };
        }
      }

      // 回路全体を評価
      const circuit: Circuit = { gates: newGates, wires: state.wires };
      const result = evaluateCircuitSync(
        circuit,
        state.simulationConfig.delayMode
      );

      if (result.success) {
        return {
          gates: [...result.data.circuit.gates],
          wires: [...result.data.circuit.wires],
          wireStart: newWireStart,
        };
      } else {
        return {
          gates: newGates,
          wires: state.wires,
          wireStart: newWireStart,
        };
      }
    });

    // saveToHistoryフラグが設定されている場合のみ履歴に追加
    if (saveToHistory) {
      get().saveToHistory();
    }
  },

  deleteGate: (gateId: string) => {
    set(state => {
      // 削除対象のゲートIDリスト（単一の場合も配列にする）
      const gateIdsToDelete = state.selectedGateIds.includes(gateId)
        ? state.selectedGateIds
        : [gateId];

      const newGates = state.gates.filter(
        gate => !gateIdsToDelete.includes(gate.id)
      );
      const newWires = state.wires.filter(
        wire =>
          !gateIdsToDelete.includes(wire.from.gateId) &&
          !gateIdsToDelete.includes(wire.to.gateId)
      );

      // 🎯 削除されるゲートに選択されたCLOCKが含まれている場合、選択をクリア
      let newSelectedClockGateId = state.selectedClockGateId;
      if (
        state.selectedClockGateId &&
        gateIdsToDelete.includes(state.selectedClockGateId)
      ) {
        newSelectedClockGateId = null;
      }

      // 回路全体を評価
      const circuit: Circuit = { gates: newGates, wires: newWires };
      const result = evaluateCircuitSync(
        circuit,
        state.simulationConfig.delayMode
      );

      if (result.success) {
        return {
          gates: [...result.data.circuit.gates],
          wires: [...result.data.circuit.wires],
          selectedGateId: null,
          selectedGateIds: [],
          selectedClockGateId: newSelectedClockGateId,
        };
      } else {
        return {
          gates: newGates,
          wires: newWires,
          selectedGateId: null,
          selectedGateIds: [],
          selectedClockGateId: newSelectedClockGateId,
        };
      }
    });

    // 履歴に追加
    get().saveToHistory();
  },

  updateGateOutput: (gateId: string, output: boolean) => {
    set(state => {
      const newGates = state.gates.map(gate =>
        gate.id === gateId ? { ...gate, output } : gate
      );

      // 回路全体を評価
      const circuit: Circuit = { gates: newGates, wires: state.wires };
      const result = evaluateCircuitSync(
        circuit,
        state.simulationConfig.delayMode
      );

      if (result.success) {
        return {
          gates: [...result.data.circuit.gates],
          wires: [...result.data.circuit.wires],
        };
      } else {
        return {
          gates: newGates,
          wires: state.wires,
        };
      }
    });
  },

  updateClockFrequency: (gateId: string, frequency: number) => {
    set(state => {
      const newGates = state.gates.map(gate => {
        if (gate.id === gateId && gate.type === 'CLOCK' && gate.metadata) {
          return {
            ...gate,
            metadata: {
              ...gate.metadata,
              frequency,
              // 周波数変更時にstartTimeをリセットして新しい周期で開始
              startTime: undefined,
            },
          };
        }
        return gate;
      });

      // 回路全体を再評価して周波数変更を即座に反映
      const circuit: Circuit = { gates: newGates, wires: state.wires };
      const result = evaluateCircuitSync(
        circuit,
        state.simulationConfig.delayMode
      );

      if (result.success) {
        return {
          gates: [...result.data.circuit.gates],
          wires: [...result.data.circuit.wires],
        };
      } else {
        return { gates: newGates };
      }
    });
  },

  // ゲートのタイミング設定を更新
  updateGateTiming: (
    gateId: string,
    timing: Partial<{ propagationDelay: number | undefined }>
  ) =>
    set(state => {
      const newGates = state.gates.map(gate => {
        if (gate.id === gateId) {
          // propagationDelayがundefinedの場合、timingプロパティを削除
          if (timing.propagationDelay === undefined) {
            // timingプロパティを除外した新しいオブジェクトを作成
            const gateWithoutTiming = Object.fromEntries(
              Object.entries(gate).filter(([key]) => key !== 'timing')
            ) as Gate;
            return gateWithoutTiming;
          }

          return {
            ...gate,
            timing: {
              ...gate.timing,
              ...timing,
            },
          };
        }
        return gate;
      });

      // 回路全体を再評価
      const circuit: Circuit = { gates: newGates, wires: state.wires };
      const result = evaluateCircuitSync(
        circuit,
        state.simulationConfig.delayMode
      );

      if (result.success) {
        return {
          gates: [...result.data.circuit.gates],
          wires: [...result.data.circuit.wires],
        };
      } else {
        return { gates: newGates };
      }
    }),

  // LEDゲートのデータを更新
  updateLEDGateData: (
    gateId: string,
    gateData: {
      bitWidth: number;
      displayMode: 'binary' | 'decimal' | 'both' | 'hex';
    }
  ) => {
    set(state => {
      const newGates = state.gates.map(gate => {
        if (gate.id === gateId && gate.type === 'LED') {
          // 入力配列のサイズを調整
          const newInputs = Array(gateData.bitWidth)
            .fill(false)
            .map((_, i) => gate.inputs[i] || false);

          return {
            ...gate,
            inputs: newInputs,
            gateData: {
              ...gate.gateData,
              ...gateData,
            },
          };
        }
        return gate;
      });

      // 回路全体を再評価
      const circuit: Circuit = { gates: newGates, wires: state.wires };
      const result = evaluateCircuitSync(
        circuit,
        state.simulationConfig.delayMode
      );

      if (result.success) {
        return {
          gates: [...result.data.circuit.gates],
          wires: [...result.data.circuit.wires],
        };
      } else {
        return { gates: newGates };
      }
    });
  },
});

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
import { getGlobalEvaluationService, setGlobalEvaluationService, CircuitEvaluationService } from '@domain/simulation/unified';
import { EnhancedHybridEvaluator } from '@domain/simulation/event-driven-minimal/EnhancedHybridEvaluator';
import { booleanToDisplayState } from '@domain/simulation';
import {
  getInputPinPosition,
  getOutputPinPosition,
} from '@domain/analysis/pinPositionCalculator';

// 統一評価サービスを取得
let evaluationService = getGlobalEvaluationService();

// 評価サービスを遅延モード設定で更新
function updateEvaluationServiceWithDelayMode(delayMode: boolean) {
  evaluationService = new CircuitEvaluationService({
    strategy: 'AUTO_SELECT',
    enableDebugLogging: false,
    enablePerformanceTracking: true,
    delayMode,
  });
  setGlobalEvaluationService(evaluationService);
}

// 統一評価サービスを使用する関数（非同期版）
async function evaluateCircuitUnified(circuit: Circuit) {
  const result = await evaluationService.evaluate(circuit);
  
  if (result.success) {
    const { data } = result;
    return {
      success: true as const,
      data: {
        circuit: data.circuit,
        evaluationStats: {
          gatesEvaluated: data.circuit.gates.length,
          evaluationCycles: data.performanceInfo.cycleCount || 1,
          totalEvaluationTime: data.performanceInfo.executionTimeMs,
        },
        dependencyGraph: [], // 後方互換性のため保持
      },
      warnings: data.warnings,
    };
  } else {
    console.error('Circuit evaluation failed:', result.error.message);
    // エラー時も一貫したフォーマットで返す
    return {
      success: false as const,
      error: {
        message: result.error.message,
        type: 'EVALUATION_FAILED',
        recovery: result.error.recovery,
      },
      data: {
        circuit, // 元の回路をそのまま返す
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

// Zustand内での同期使用のための一時的なラッパー関数
function evaluateCircuitSync(circuit: Circuit, delayMode: boolean = false) {
  // 同期版：EnhancedHybridEvaluatorを直接使用（統一設定適用）
  try {
    // 統一サービスと同じ設定を適用したエバリュエーターを使用
    const complexity = evaluationService.analyzeComplexity(circuit);
    const strategy = complexity.recommendedStrategy;
    
    // EnhancedHybridEvaluatorを直接使用（同期処理）
    const evaluator = new EnhancedHybridEvaluator({
      strategy,
      enableDebugLogging: false,
      delayMode,
    });
    
    const evaluationResult = evaluator.evaluate(circuit);
    
    return {
      success: true as const,
      data: {
        circuit: evaluationResult.circuit,
        evaluationStats: {
          gatesEvaluated: evaluationResult.circuit.gates.length,
          evaluationCycles: 1, // EnhancedHybridEvaluatorではcycleCountは提供されない
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
  updateGateTiming: (gateId: string, timing: Partial<{ propagationDelay: number | undefined }>) => void;
}

export const createGateOperationsSlice: StateCreator<
  CircuitStore,
  [],
  [],
  GateOperationsSlice
> = (set, get) => ({
  addGate: (type, position) => {
    const newGate = GateFactory.createGate(type, position);

    // ゲートの入力値を適切な形式で初期化
    if (newGate.inputs && newGate.inputs.length > 0) {
      newGate.inputs = newGate.inputs.map(input =>
        typeof input === 'boolean' ? booleanToDisplayState(input) : input
      );
    }

    set(state => {
      const newGates = [...state.gates, newGate];

      // 回路全体を評価
      const circuit: Circuit = { gates: newGates, wires: state.wires };
      const result = evaluateCircuitSync(circuit, state.simulationConfig.delayMode);

      if (result.success) {
        return {
          gates: [...result.data.circuit.gates],
          wires: [...result.data.circuit.wires],
        };
      } else {
        console.warn('Circuit evaluation failed');
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
    if (newGate.inputs && newGate.inputs.length > 0) {
      newGate.inputs = newGate.inputs.map(input =>
        typeof input === 'boolean' ? booleanToDisplayState(input) : input
      );
    }

    set(state => {
      const newGates = [...state.gates, newGate];

      // 回路全体を評価
      const circuit: Circuit = { gates: newGates, wires: state.wires };
      const result = evaluateCircuitSync(circuit, state.simulationConfig.delayMode);

      if (result.success) {
        return {
          gates: [...result.data.circuit.gates],
          wires: [...result.data.circuit.wires],
        };
      } else {
        console.warn('Circuit evaluation failed');
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
      const result = evaluateCircuitSync(circuit, state.simulationConfig.delayMode);

      if (result.success) {
        return {
          gates: [...result.data.circuit.gates],
          wires: [...result.data.circuit.wires],
          wireStart: newWireStart,
        };
      } else {
        console.warn('Circuit evaluation failed');
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
      const result = evaluateCircuitSync(circuit, state.simulationConfig.delayMode);

      if (result.success) {
        return {
          gates: [...result.data.circuit.gates],
          wires: [...result.data.circuit.wires],
          wireStart: newWireStart,
        };
      } else {
        console.warn('Circuit evaluation failed');
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
        console.log(
          `🎯 Clearing selected CLOCK because it's being deleted: ${state.selectedClockGateId}`
        );
        newSelectedClockGateId = null;
      }

      // 回路全体を評価
      const circuit: Circuit = { gates: newGates, wires: newWires };
      const result = evaluateCircuitSync(circuit, state.simulationConfig.delayMode);

      if (result.success) {
        return {
          gates: [...result.data.circuit.gates],
          wires: [...result.data.circuit.wires],
          selectedGateId: null,
          selectedGateIds: [],
          selectedClockGateId: newSelectedClockGateId,
        };
      } else {
        console.warn('Circuit evaluation failed');
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
      const result = evaluateCircuitSync(circuit, state.simulationConfig.delayMode);

      if (result.success) {
        return {
          gates: [...result.data.circuit.gates],
          wires: [...result.data.circuit.wires],
        };
      } else {
        console.warn('Circuit evaluation failed');
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
      const result = evaluateCircuitSync(circuit, state.simulationConfig.delayMode);

      if (result.success) {
        return {
          gates: [...result.data.circuit.gates],
          wires: [...result.data.circuit.wires],
        };
      } else {
        console.warn('Circuit evaluation failed after clock frequency update');
        return { gates: newGates };
      }
    });
  },

  // ゲートのタイミング設定を更新
  updateGateTiming: (gateId: string, timing: Partial<{ propagationDelay: number | undefined }>) =>
    set(state => {
      const newGates = state.gates.map(gate => {
        if (gate.id === gateId) {
          // propagationDelayがundefinedの場合、timingプロパティを削除
          if (timing.propagationDelay === undefined) {
            const { timing: _, ...gateWithoutTiming } = gate;
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
      const result = evaluateCircuitSync(circuit, state.simulationConfig.delayMode);

      if (result.success) {
        return {
          gates: [...result.data.circuit.gates],
          wires: [...result.data.circuit.wires],
        };
      } else {
        console.warn('Circuit evaluation failed after timing update');
        return { gates: newGates };
      }
    }),
});

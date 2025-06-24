/**
 * 統一回路評価サービス
 * 全てのシミュレーション機能を統一するサービスレイヤー
 */

declare const performance: { now(): number };

import type { Circuit } from '../core/types';
import type { Gate, Wire } from '@/types/circuit';
import type { Result } from '../core/types';
import { CircuitEvaluator } from '../core/evaluator';
import type {
  EvaluationCircuit,
  EvaluationContext,
  EvaluatorResult,
  GateMemory,
} from '../core/types';
import { CircuitAnalyzer } from '../../analysis/CircuitAnalyzer';
import type {
  ICircuitEvaluationService,
  UnifiedEvaluationConfig,
  UnifiedEvaluationResult,
  UnifiedEvaluationError,
  CircuitComplexityAnalysis,
} from './types';
import { DEFAULT_UNIFIED_CONFIG } from './types';

/**
 * クロックサイクル実行結果
 */
export interface ClockCycleResult {
  circuit: EvaluationCircuit;
  context: EvaluationContext;
  cycleNumber: number;
  hasStateChange: boolean;
}

/**
 * 統一回路評価サービス実装
 */
export class CircuitEvaluationService implements ICircuitEvaluationService {
  private evaluator: CircuitEvaluator;
  private config: UnifiedEvaluationConfig;

  // パフォーマンス統計
  private stats = {
    totalEvaluations: 0,
    totalExecutionTime: 0,
    strategyUsage: new Map<'PURE_ENGINE', number>(),
  };

  constructor(config: Partial<UnifiedEvaluationConfig> = {}) {
    this.config = { ...DEFAULT_UNIFIED_CONFIG, ...config };
    this.evaluator = new CircuitEvaluator();
  }

  /**
   * 回路を評価（シンプル化）
   */
  async evaluate(
    circuit: Circuit
  ): Promise<Result<UnifiedEvaluationResult, UnifiedEvaluationError>> {
    const startTime = performance.now();

    try {
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

      // 評価コンテキストを作成し、INPUTゲートの初期状態を設定
      const evaluationContext: EvaluationContext = {
        currentTime: Date.now(),
        memory: {},
      };

      // INPUTゲートの初期状態を設定
      // メモリのコピーを作成して変更可能にする
      const mutableMemory = { ...evaluationContext.memory };
      circuit.gates.forEach(gate => {
        if (gate.type === 'INPUT') {
          mutableMemory[gate.id] = {
            state: gate.outputs?.[0] ?? false,
          };
        }
      });
      const updatedEvaluationContext = {
        ...evaluationContext,
        memory: mutableMemory,
      };

      // 🔥 循環回路の自動検出と遅延モード強制設定
      const circuitForDetection = {
        gates: circuit.gates.map(g => ({
          id: g.id,
          type: g.type,
          position: g.position,
          inputs: g.inputs || [],
          outputs: g.outputs || [],
        })),
        wires: circuit.wires,
      };

      const hasCircularDependency =
        CircuitAnalyzer.hasCircularDependency(circuitForDetection);
      const shouldUseDelayMode = this.config.delayMode || hasCircularDependency;

      // 遅延モードに応じて適切な評価メソッドを呼び出し
      const evaluationResult = shouldUseDelayMode
        ? this.evaluator.evaluateDelayed(
            evaluationCircuit,
            updatedEvaluationContext
          )
        : this.evaluator.evaluateImmediate(
            evaluationCircuit,
            updatedEvaluationContext
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

      // 実行時間計測
      const executionTime = performance.now() - startTime;

      // 統計更新
      this.updateStats('PURE_ENGINE', executionTime);

      // 結果構築
      const result: UnifiedEvaluationResult = {
        circuit: resultCircuit,
        strategyUsed: 'PURE_ENGINE',
        performanceInfo: {
          executionTimeMs: executionTime,
          cycleCount: 1,
          cacheHit: false,
        },
        oscillationInfo: undefined,
        debugInfo: this.config.enableDebugLogging
          ? {
              strategyReason: 'PURE_ENGINE selected by default',
              evaluationLogs: [],
              circularGates: [],
            }
          : undefined,
        warnings: [],
      };

      return { success: true, data: result, warnings: [] };
    } catch (error) {
      const executionTime = performance.now() - startTime;
      this.updateStats('PURE_ENGINE', executionTime);

      const evaluationError: UnifiedEvaluationError = {
        type: this.categorizeError(error),
        message:
          error instanceof Error ? error.message : 'Unknown evaluation error',
        originalError: error instanceof Error ? error : undefined,
        recovery: this.generateRecoveryAdvice(error),
      };

      return { success: false, error: evaluationError, warnings: [] };
    }
  }

  /**
   * 回路を評価（旧APIとの互換性のため）
   */
  evaluateCircuit(circuit: Circuit): EvaluatorResult {
    // 評価用の回路形式に変換
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

    // 評価コンテキストを作成し、INPUTゲートの初期状態を設定
    const initialMemory: GateMemory = {};

    // INPUTゲートの初期状態を設定
    circuit.gates.forEach(gate => {
      if (gate.type === 'INPUT') {
        initialMemory[gate.id] = {
          state: gate.outputs?.[0] ?? false,
        };
      }
    });

    const evaluationContext: EvaluationContext = {
      currentTime: Date.now(),
      memory: initialMemory,
    };

    // 🔥 循環回路の自動検出と遅延モード強制設定
    const circuitForDetection = {
      gates: circuit.gates.map(g => ({
        id: g.id,
        type: g.type,
        position: g.position,
        inputs: g.inputs || [],
        outputs: g.outputs || [],
      })),
      wires: circuit.wires,
    };

    const hasCircularDependency =
      CircuitAnalyzer.hasCircularDependency(circuitForDetection);
    const shouldUseDelayMode = this.config.delayMode || hasCircularDependency;

    // 遅延モードに応じて適切な評価メソッドを呼び出し
    const evaluationResult = shouldUseDelayMode
      ? this.evaluator.evaluateDelayed(evaluationCircuit, evaluationContext)
      : this.evaluator.evaluateImmediate(evaluationCircuit, evaluationContext);

    // 結果をCircuit型に変換して返す
    return {
      circuit: {
        gates: evaluationResult.circuit.gates.map(gate => ({
          ...gate,
          position: gate.position,
          inputs: [...gate.inputs],
          outputs: [...gate.outputs],
          output: gate.outputs[0] ?? false,
        })),
        wires: evaluationResult.circuit.wires,
      },
      context: evaluationResult.context,
      hasChanges: evaluationResult.hasChanges,
    };
  }

  /**
   * 回路の複雑度を分析
   */
  analyzeComplexity(circuit: Circuit): CircuitComplexityAnalysis {
    const gateCount = circuit.gates.length;
    const wireCount = circuit.wires.length;
    const hasCircularDependency =
      CircuitAnalyzer.hasCircularDependency(circuit);
    const circularGates = hasCircularDependency
      ? CircuitAnalyzer.findCircularGates(circuit)
      : [];
    const hasClock = circuit.gates.some((g: Gate) => g.type === 'CLOCK');
    const hasSequentialElements = circuit.gates.some(
      (g: Gate) =>
        g.type === 'D-FF' || g.type === 'SR-LATCH' || g.type === 'CLOCK'
    );

    // 最大深度計算（簡易版）
    const maxDepth = this.calculateMaxDepth(circuit);

    // 常にPURE_ENGINEを推奨（シンプル化）
    const recommendedStrategy = 'PURE_ENGINE' as const;
    let reasoning = `純粋評価エンジンを使用 (${gateCount}ゲート)`;

    if (hasCircularDependency) {
      reasoning += ' - 循環依存検出、遅延モード推奨';
    }
    if (hasSequentialElements) {
      reasoning += ' - 順序素子検出';
    }

    return {
      gateCount,
      wireCount,
      hasCircularDependency,
      circularGates,
      maxDepth,
      hasClock,
      hasSequentialElements,
      recommendedStrategy,
      reasoning,
    };
  }

  /**
   * 設定を更新
   */
  updateConfig(config: Partial<UnifiedEvaluationConfig>): void {
    this.config = { ...this.config, ...config };
    // CircuitEvaluatorは設定更新が不要（コンストラクターで設定済み）
  }

  /**
   * 現在の設定を取得
   */
  getConfig(): UnifiedEvaluationConfig {
    return { ...this.config };
  }

  /**
   * パフォーマンス統計を取得
   */
  getPerformanceStats() {
    const strategyUsageStats: Record<'PURE_ENGINE', number> = {
      PURE_ENGINE: 0,
    };

    this.stats.strategyUsage.forEach((count, strategy) => {
      strategyUsageStats[strategy] = count;
    });

    return {
      totalEvaluations: this.stats.totalEvaluations,
      avgExecutionTime:
        this.stats.totalEvaluations > 0
          ? this.stats.totalExecutionTime / this.stats.totalEvaluations
          : 0,
      strategyUsageStats,
    };
  }

  /**
   * キャッシュをクリア（将来実装）
   */
  clearCache(): void {
    // 将来のキャッシュ機能用
  }

  // ===============================
  // 低レベルAPI（高度な制御用）
  // ===============================

  /**
   * Circuit型をEvaluationCircuit型に変換
   */
  toEvaluationCircuit(circuit: Circuit): EvaluationCircuit {
    return {
      gates: circuit.gates.map(gate => ({
        id: gate.id,
        type: gate.type,
        position: gate.position,
        inputs: gate.inputs || [],
        outputs: gate.outputs || [],
        metadata: gate.metadata, // メタデータを保持
      })),
      wires: circuit.wires,
    };
  }

  /**
   * EvaluationCircuit型をCircuit型に変換
   */
  fromEvaluationCircuit(circuit: EvaluationCircuit): Circuit {
    return {
      gates: circuit.gates.map(gate => ({
        ...gate,
        position: gate.position,
        inputs: [...gate.inputs],
        outputs: [...gate.outputs],
        output: gate.outputs[0] ?? false,
      })),
      wires: circuit.wires,
    };
  }

  /**
   * 直接評価（低レベルAPI）
   */
  evaluateDirect(
    circuit: EvaluationCircuit,
    context: EvaluationContext,
    delayMode?: boolean
  ): EvaluatorResult {
    // 評価時に現在時刻を更新（contextに時刻が設定されていない場合のみ）
    const updatedContext = {
      ...context,
      currentTime: context.currentTime ?? Date.now(),
    };

    // 🔥 循環回路の自動検出
    if (delayMode === undefined) {
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

      const hasCircularDependency =
        CircuitAnalyzer.hasCircularDependency(circuitForDetection);
      delayMode = this.config.delayMode || hasCircularDependency;
    }

    return delayMode
      ? this.evaluator.evaluateDelayed(circuit, updatedContext)
      : this.evaluator.evaluateImmediate(circuit, updatedContext);
  }

  /**
   * 初期コンテキストを作成
   */
  createInitialContext(circuit: EvaluationCircuit): EvaluationContext {
    const memory: GateMemory = {};

    // 各ゲートのメモリを初期化
    for (const gate of circuit.gates) {
      switch (gate.type) {
        case 'INPUT':
          memory[gate.id] = {
            state: gate.outputs[0] ?? false,
          };
          break;

        case 'CLOCK':
          memory[gate.id] = {
            output: gate.outputs[0] ?? false,
            frequency: gate.metadata?.frequency ?? 1,
            startTime: gate.metadata?.startTime ?? 0,
            manualToggle: false, // 手動制御を無効にして時間ベース動作を有効化
          };
          break;

        case 'D-FF':
          memory[gate.id] = {
            prevClk: false,
            q: gate.outputs[0] ?? false,
          };
          break;

        case 'SR-LATCH':
          memory[gate.id] = {
            q: gate.outputs[0] ?? false,
          };
          break;
      }
    }

    return {
      currentTime: Date.now(),
      memory,
    };
  }

  /**
   * CLOCKの手動制御
   */
  setClockState(
    circuit: EvaluationCircuit,
    context: EvaluationContext,
    clockState: boolean
  ): { circuit: EvaluationCircuit; context: EvaluationContext } {
    const clockGate = circuit.gates.find(g => g.type === 'CLOCK');
    if (!clockGate) {
      return { circuit, context };
    }

    // CLOCKゲートの出力を更新
    const updatedCircuit: EvaluationCircuit = {
      ...circuit,
      gates: circuit.gates.map(g =>
        g.type === 'CLOCK'
          ? {
              ...g,
              outputs: [clockState],
            }
          : g
      ),
    };

    // メモリも更新
    const updatedContext: EvaluationContext = {
      ...context,
      memory: {
        ...context.memory,
        [clockGate.id]: {
          ...context.memory[clockGate.id],
          output: clockState,
          manualToggle: clockState,
        },
      },
    };

    return {
      circuit: updatedCircuit,
      context: updatedContext,
    };
  }

  /**
   * 完全なクロックサイクル実行（LOW→HIGH→LOW）
   */
  executeClockCycle(
    circuit: EvaluationCircuit,
    context: EvaluationContext,
    cycleNumber: number = 1
  ): ClockCycleResult {
    // 初期状態をキャプチャ
    const initialState = this.captureCircuitState(circuit);

    // 🔍 CLOCKサイクルデバッグログ
    if (import.meta.env.DEV) {
      console.warn('🕰️ CLOCK Cycle Debug:', {
        cycleNumber,
        initialState,
        initialDffStates: circuit.gates
          .filter(g => g.type === 'D-FF')
          .map(g => ({
            id: g.id,
            inputs: g.inputs,
            outputs: g.outputs,
            memory: context.memory[g.id],
          })),
      });
    }

    // 1. CLOCK LOW→HIGH
    let { circuit: highCircuit, context: highContext } = this.setClockState(
      circuit,
      context,
      true
    );
    let result = this.evaluateDirect(highCircuit, highContext, true);

    // 収束まで待機
    let iterations = 0;
    while (result.hasChanges && iterations < 50) {
      result = this.evaluateDirect(result.circuit, result.context, true);
      iterations++;
    }

    // 2. CLOCK HIGH→LOW
    let { circuit: lowCircuit, context: lowContext } = this.setClockState(
      result.circuit,
      result.context,
      false
    );
    result = this.evaluateDirect(lowCircuit, lowContext, true);

    // 収束まで待機
    iterations = 0;
    while (result.hasChanges && iterations < 50) {
      result = this.evaluateDirect(result.circuit, result.context, true);
      iterations++;
    }

    // 最終状態をキャプチャ
    const finalState = this.captureCircuitState(result.circuit);
    const hasStateChange =
      JSON.stringify(initialState) !== JSON.stringify(finalState);

    // 🔍 CLOCKサイクル結果デバッグログ
    if (import.meta.env.DEV) {
      console.warn('🕰️ CLOCK Cycle Result:', {
        cycleNumber,
        hasStateChange,
        initialState,
        finalState,
        finalDffStates: result.circuit.gates
          .filter(g => g.type === 'D-FF')
          .map(g => ({
            id: g.id,
            inputs: g.inputs,
            outputs: g.outputs,
            memory: result.context.memory[g.id],
          })),
      });
    }

    return {
      circuit: result.circuit,
      context: result.context,
      cycleNumber,
      hasStateChange,
    };
  }

  /**
   * 複数クロックサイクル実行
   */
  executeMultipleClockCycles(
    circuit: EvaluationCircuit,
    context: EvaluationContext,
    cycleCount: number
  ): ClockCycleResult[] {
    const results: ClockCycleResult[] = [];
    let currentCircuit = circuit;
    let currentContext = context;

    for (let cycle = 1; cycle <= cycleCount; cycle++) {
      const cycleResult = this.executeClockCycle(
        currentCircuit,
        currentContext,
        cycle
      );
      results.push(cycleResult);

      currentCircuit = cycleResult.circuit;
      currentContext = cycleResult.context;
    }

    return results;
  }

  /**
   * 回路状態をキャプチャ（デバッグ用）
   */
  private captureCircuitState(
    circuit: EvaluationCircuit
  ): Array<{ id: string; q: boolean; qBar: boolean }> {
    const dffGates = circuit.gates.filter(g => g.type === 'D-FF');
    return dffGates.map(dff => ({
      id: dff.id,
      q: dff.outputs[0],
      qBar: dff.outputs[1],
    }));
  }

  // === プライベートメソッド ===

  /**
   * 最大深度を計算（簡易版）
   */
  private calculateMaxDepth(circuit: Circuit): number {
    // 簡易実装：入力からの最大パス長
    const visited = new Set<string>();
    const memo = new Map<string, number>();

    const dfs = (gateId: string): number => {
      if (visited.has(gateId)) return 0; // 循環検出
      if (memo.has(gateId)) return memo.get(gateId)!;

      visited.add(gateId);

      const gate = circuit.gates.find((g: Gate) => g.id === gateId);
      if (!gate || gate.type === 'INPUT') {
        memo.set(gateId, 0);
        visited.delete(gateId);
        return 0;
      }

      const inputWires = circuit.wires.filter(
        (w: Wire) => w.to.gateId === gateId
      );
      const maxInputDepth = inputWires.reduce((max: number, wire: Wire) => {
        const depth = dfs(wire.from.gateId);
        return Math.max(max, depth);
      }, 0);

      const result = maxInputDepth + 1;
      memo.set(gateId, result);
      visited.delete(gateId);
      return result;
    };

    return circuit.gates.reduce((max: number, gate: Gate) => {
      return Math.max(max, dfs(gate.id));
    }, 0);
  }

  /**
   * 統計を更新
   */
  private updateStats(strategy: 'PURE_ENGINE', executionTime: number): void {
    this.stats.totalEvaluations++;
    this.stats.totalExecutionTime += executionTime;

    const currentCount = this.stats.strategyUsage.get(strategy) || 0;
    this.stats.strategyUsage.set(strategy, currentCount + 1);
  }

  /**
   * エラーを分類
   */
  private categorizeError(error: unknown): UnifiedEvaluationError['type'] {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (message.includes('oscillation')) return 'OSCILLATION_DETECTED';
      if (message.includes('timeout')) return 'SIMULATION_TIMEOUT';
      if (message.includes('memory')) return 'MEMORY_LIMIT_EXCEEDED';
      if (message.includes('invalid')) return 'CIRCUIT_INVALID';
      if (message.includes('strategy')) return 'STRATEGY_FAILED';
    }

    return 'UNKNOWN_ERROR';
  }

  /**
   * 復旧アドバイスを生成
   */
  private generateRecoveryAdvice(
    error: unknown
  ): UnifiedEvaluationError['recovery'] {
    const errorType = this.categorizeError(error);

    switch (errorType) {
      case 'OSCILLATION_DETECTED':
        return {
          suggestedStrategy: 'PURE_ENGINE',
          suggestedActions: [
            '遅延モードを有効にする',
            '回路設計を見直す（フィードバックループの確認）',
          ],
        };

      case 'SIMULATION_TIMEOUT':
        return {
          suggestedStrategy: 'PURE_ENGINE',
          suggestedActions: ['回路規模を小さくする', 'タイムアウト値を増やす'],
        };

      case 'CIRCUIT_INVALID':
        return {
          suggestedActions: [
            '回路の接続を確認する',
            'ゲートの入力数を確認する',
            'ワイヤーの接続が正しいか確認する',
          ],
        };

      default:
        return {
          suggestedStrategy: 'PURE_ENGINE',
          suggestedActions: [
            'デバッグログを有効にして詳細を確認する',
            '遅延モードを試す',
          ],
        };
    }
  }
}

/**
 * グローバルサービスインスタンス（シングルトンパターン）
 */
let globalEvaluationService: CircuitEvaluationService | null = null;

/**
 * グローバル評価サービスを取得
 */
export function getGlobalEvaluationService(): CircuitEvaluationService {
  if (!globalEvaluationService) {
    globalEvaluationService = new CircuitEvaluationService();
  }
  return globalEvaluationService;
}

/**
 * グローバル評価サービスを設定
 */
export function setGlobalEvaluationService(
  service: CircuitEvaluationService
): void {
  globalEvaluationService = service;
}

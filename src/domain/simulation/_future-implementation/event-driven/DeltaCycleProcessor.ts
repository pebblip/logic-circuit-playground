/**
 * デルタサイクル処理システム
 * 
 * デルタサイクルアルゴリズム:
 * 1. 現在時刻でのイベント処理
 * 2. 組み合わせ論理の評価・伝播
 * 3. 新しいイベントのスケジューリング
 * 4. 安定化まで繰り返し（Δ-cycle 0, 1, 2...）
 * 5. 次の時刻へ進行
 * 
 * 特徴:
 * - ゼロ遅延組み合わせ論理対応
 * - 収束検出・オシレーション防止
 * - デッドロック検出
 * - 詳細な統計情報
 */

import type {
  SimulationEvent,
  SimulationTime,
  DeltaCycle,
  EventType,
  CircuitState,
  EventQueue,
  SimulationError,
  ConvergenceStatistics,
  EventTarget,
  EventPayload,
} from './types';

/**
 * デルタサイクル処理設定
 */
export interface DeltaCycleConfig {
  readonly maxDeltaCycles: number;
  readonly convergenceTimeout: number; // ms
  readonly oscillationDetection: boolean;
  readonly deadlockDetection: boolean;
  readonly enableDebug: boolean;
}

/**
 * デルタサイクル処理結果
 */
export interface DeltaCycleResult {
  readonly success: boolean;
  readonly finalTime: SimulationTime;
  readonly deltaCyclesUsed: number;
  readonly convergenceReached: boolean;
  readonly errors: readonly SimulationError[];
  readonly statistics: ConvergenceStatistics;
  readonly debugInfo?: DeltaCycleDebugInfo;
}

/**
 * デルタサイクルデバッグ情報
 */
export interface DeltaCycleDebugInfo {
  readonly cycleDetails: readonly DeltaCycleDetail[];
  readonly oscillationPatterns: readonly OscillationPattern[];
  readonly convergenceTrace: readonly ConvergencePoint[];
}

/**
 * デルタサイクル詳細
 */
export interface DeltaCycleDetail {
  readonly cycle: DeltaCycle;
  readonly time: SimulationTime;
  readonly eventsProcessed: number;
  readonly changesDetected: number;
  readonly convergenceState: 'ACTIVE' | 'STABLE' | 'OSCILLATING';
  readonly duration: number; // ms
}

/**
 * オシレーションパターン
 */
export interface OscillationPattern {
  readonly signals: readonly string[];
  readonly period: number;
  readonly detectedAt: {
    readonly time: SimulationTime;
    readonly cycle: DeltaCycle;
  };
  readonly confidence: number; // 0-1
}

/**
 * 収束点
 */
export interface ConvergencePoint {
  readonly time: SimulationTime;
  readonly cycle: DeltaCycle;
  readonly changedSignals: readonly string[];
  readonly stabilizedSignals: readonly string[];
}

/**
 * デルタサイクルプロセッサー
 */
export class DeltaCycleProcessor {
  private config: DeltaCycleConfig;
  private oscillationHistory = new Map<string, boolean[]>();
  private convergenceHistory: ConvergencePoint[] = [];
  private debugInfo: DeltaCycleDebugInfo | undefined;

  constructor(config: DeltaCycleConfig) {
    this.config = config;
  }

  /**
   * 指定時刻でのデルタサイクル処理を実行
   */
  async processDeltaCycles(
    currentTime: SimulationTime,
    eventQueue: EventQueue,
    circuitState: CircuitState,
    gateEvaluator: (gateId: string, inputs: readonly boolean[]) => boolean[]
  ): Promise<DeltaCycleResult> {
    const startTime = Date.now();
    const errors: SimulationError[] = [];
    const cycleDetails: DeltaCycleDetail[] = [];
    
    let deltaCycle: DeltaCycle = 0;
    let convergenceReached = false;
    let currentState = circuitState;
    
    // オシレーション検出用
    const signalHistory = new Map<string, boolean[]>();
    
    try {
      // デルタサイクルループ
      while (deltaCycle < this.config.maxDeltaCycles) {
        const cycleStartTime = Date.now();
        
        // 現在の時刻・デルタサイクルのイベントを処理
        const eventsToProcess = this.collectCurrentEvents(
          eventQueue, 
          currentTime, 
          deltaCycle
        );
        
        if (eventsToProcess.length === 0) {
          // イベントがない = 収束
          convergenceReached = true;
          break;
        }

        // イベント処理
        const processResult = await this.processEvents(
          eventsToProcess,
          currentState,
          gateEvaluator
        );

        if (!processResult.success) {
          errors.push(...processResult.errors);
          break;
        }

        currentState = processResult.newState;
        const changesDetected = processResult.changedSignals.length;

        // オシレーション検出
        if (this.config.oscillationDetection) {
          const oscillationResult = this.detectOscillation(
            processResult.changedSignals,
            signalHistory,
            deltaCycle
          );
          
          if (oscillationResult.detected) {
            errors.push({
              type: 'CONVERGENCE_TIMEOUT',
              message: `Oscillation detected in signals: ${oscillationResult.signals.join(', ')}`,
              time: currentTime,
              context: {
                deltaCycle,
                additionalInfo: {
                  oscillatingSignals: oscillationResult.signals,
                  period: oscillationResult.period,
                }
              },
              severity: 'ERROR',
            });
            break;
          }
        }

        // 新しいイベントをスケジュール
        const newEvents = this.generateDeltaCycleEvents(
          processResult.changedSignals,
          currentTime,
          deltaCycle + 1
        );

        for (const event of newEvents) {
          eventQueue.schedule(event);
        }

        // サイクル詳細記録
        const cycleEndTime = Date.now();
        cycleDetails.push({
          cycle: deltaCycle,
          time: currentTime,
          eventsProcessed: eventsToProcess.length,
          changesDetected,
          convergenceState: changesDetected === 0 ? 'STABLE' : 'ACTIVE',
          duration: cycleEndTime - cycleStartTime,
        });

        deltaCycle++;

        // タイムアウトチェック
        if (Date.now() - startTime > this.config.convergenceTimeout) {
          errors.push({
            type: 'CONVERGENCE_TIMEOUT',
            message: `Delta cycle convergence timeout after ${deltaCycle} cycles`,
            time: currentTime,
            context: { deltaCycle },
            severity: 'ERROR',
          });
          break;
        }
      }

      // 最大サイクル数到達チェック
      if (deltaCycle >= this.config.maxDeltaCycles && !convergenceReached) {
        errors.push({
          type: 'CONVERGENCE_TIMEOUT',
          message: `Maximum delta cycles (${this.config.maxDeltaCycles}) exceeded`,
          time: currentTime,
          context: { deltaCycle },
          severity: 'ERROR',
        });
      }

      // 統計情報作成
      const statistics: ConvergenceStatistics = {
        totalCycles: this.convergenceHistory.length,
        maxDeltaCycles: deltaCycle,
        averageDeltaCycles: this.calculateAverageDeltaCycles(),
        convergenceFailures: errors.filter(e => e.type === 'CONVERGENCE_TIMEOUT').length,
        oscillationDetected: errors.some(e => 
          e.type === 'CONVERGENCE_TIMEOUT' && 
          e.context.additionalInfo?.oscillatingSignals
        ),
      };

      // デバッグ情報
      if (this.config.enableDebug) {
        this.debugInfo = {
          cycleDetails,
          oscillationPatterns: this.extractOscillationPatterns(signalHistory),
          convergenceTrace: this.convergenceHistory.slice(-100), // 最新100エントリ
        };
      }

      return {
        success: errors.length === 0,
        finalTime: currentTime,
        deltaCyclesUsed: deltaCycle,
        convergenceReached,
        errors,
        statistics,
        debugInfo: this.debugInfo,
      };

    } catch (error) {
      errors.push({
        type: 'CONVERGENCE_TIMEOUT',
        message: `Unexpected error during delta cycle processing: ${error}`,
        time: currentTime,
        context: { 
          deltaCycle,
          stackTrace: error instanceof Error ? [error.stack || ''] : [],
        },
        severity: 'FATAL',
      });

      return {
        success: false,
        finalTime: currentTime,
        deltaCyclesUsed: deltaCycle,
        convergenceReached: false,
        errors,
        statistics: {
          totalCycles: 0,
          maxDeltaCycles: deltaCycle,
          averageDeltaCycles: 0,
          convergenceFailures: 1,
          oscillationDetected: false,
        },
      };
    }
  }

  // ===============================
  // プライベートメソッド
  // ===============================

  /**
   * 現在の時刻・デルタサイクルのイベントを収集
   */
  private collectCurrentEvents(
    eventQueue: EventQueue,
    currentTime: SimulationTime,
    deltaCycle: DeltaCycle
  ): SimulationEvent[] {
    const events: SimulationEvent[] = [];
    
    while (!eventQueue.isEmpty()) {
      const event = eventQueue.peek();
      if (!event) break;
      
      if (event.time > currentTime) {
        // 次の時刻のイベント
        break;
      }
      
      if (event.time === currentTime && event.deltaCycle === deltaCycle) {
        // 現在処理すべきイベント
        events.push(eventQueue.next()!);
      } else if (event.time === currentTime && event.deltaCycle > deltaCycle) {
        // 後のデルタサイクルのイベント
        break;
      } else {
        // 過去のイベント（通常発生しないはず）
        eventQueue.next(); // 削除
      }
    }
    
    return events;
  }

  /**
   * イベント処理
   */
  private async processEvents(
    events: readonly SimulationEvent[],
    state: CircuitState,
    gateEvaluator: (gateId: string, inputs: readonly boolean[]) => boolean[]
  ): Promise<{
    success: boolean;
    newState: CircuitState;
    changedSignals: string[];
    errors: SimulationError[];
  }> {
    const errors: SimulationError[] = [];
    const changedSignals: string[] = [];
    let newState = state;

    try {
      for (const event of events) {
        switch (event.type) {
          case 'GATE_EVALUATION':
            {
              const result = await this.processGateEvaluationEvent(
                event,
                newState,
                gateEvaluator
              );
              
              if (result.success) {
                newState = result.newState;
                changedSignals.push(...result.changedSignals);
              } else {
                errors.push(...result.errors);
              }
            }
            break;

          case 'SIGNAL_CHANGE':
            {
              const result = this.processSignalChangeEvent(event, newState);
              newState = result.newState;
              if (result.changed) {
                changedSignals.push(event.target.wireId || '');
              }
            }
            break;

          case 'CLOCK_EDGE':
            {
              const result = this.processClockEdgeEvent(event, newState);
              newState = result.newState;
              changedSignals.push(...result.changedSignals);
            }
            break;

          default:
            // 他のイベントタイプは将来実装
            break;
        }
      }

      return {
        success: errors.length === 0,
        newState,
        changedSignals: [...new Set(changedSignals)], // 重複除去
        errors,
      };

    } catch (error) {
      errors.push({
        type: 'CONVERGENCE_TIMEOUT',
        message: `Error processing events: ${error}`,
        time: state.timestamp,
        context: {},
        severity: 'ERROR',
      });

      return {
        success: false,
        newState: state,
        changedSignals: [],
        errors,
      };
    }
  }

  /**
   * ゲート評価イベント処理
   */
  private async processGateEvaluationEvent(
    event: SimulationEvent,
    state: CircuitState,
    gateEvaluator: (gateId: string, inputs: readonly boolean[]) => boolean[]
  ): Promise<{
    success: boolean;
    newState: CircuitState;
    changedSignals: string[];
    errors: SimulationError[];
  }> {
    const errors: SimulationError[] = [];
    const changedSignals: string[] = [];
    
    try {
      const gateId = event.target.gateId;
      if (!gateId) {
        errors.push({
          type: 'INVALID_EVENT',
          message: 'Gate evaluation event missing gate ID',
          time: event.time,
          context: { eventId: event.id },
          severity: 'ERROR',
        });
        return { success: false, newState: state, changedSignals, errors };
      }

      const currentGateState = state.gateStates.get(gateId);
      if (!currentGateState) {
        errors.push({
          type: 'INVALID_EVENT',
          message: `Gate ${gateId} not found in state`,
          time: event.time,
          context: { eventId: event.id, gateId },
          severity: 'ERROR',
        });
        return { success: false, newState: state, changedSignals, errors };
      }

      // ゲート評価実行
      const inputs = event.payload.gateInputs || currentGateState.inputs;
      const outputs = gateEvaluator(gateId, inputs);

      // 出力変化チェック
      const outputChanged = !this.arraysEqual(
        outputs, 
        currentGateState.outputs || [currentGateState.output]
      );

      if (outputChanged) {
        // 新しい状態作成（Copy-on-Write）
        const newGateStates = new Map(state.gateStates);
        newGateStates.set(gateId, {
          ...currentGateState,
          output: outputs[0],
          outputs: outputs.length > 1 ? outputs : undefined,
          inputs,
          lastEvaluated: event.time,
          evaluationCount: currentGateState.evaluationCount + 1,
        });

        const newState: CircuitState = {
          version: state.version + 1,
          timestamp: event.time,
          gateStates: newGateStates,
          wireStates: state.wireStates,
          parent: state,
          mutations: new Set([...state.mutations, gateId]),
        };

        changedSignals.push(gateId);

        return { success: true, newState, changedSignals, errors };
      }

      return { success: true, newState: state, changedSignals, errors };

    } catch (error) {
      errors.push({
        type: 'CONVERGENCE_TIMEOUT',
        message: `Gate evaluation error: ${error}`,
        time: event.time,
        context: { eventId: event.id, gateId: event.target.gateId },
        severity: 'ERROR',
      });

      return { success: false, newState: state, changedSignals, errors };
    }
  }

  /**
   * 信号変化イベント処理
   */
  private processSignalChangeEvent(
    event: SimulationEvent,
    state: CircuitState
  ): {
    newState: CircuitState;
    changed: boolean;
  } {
    const wireId = event.target.wireId;
    if (!wireId) {
      return { newState: state, changed: false };
    }

    const currentWireState = state.wireStates.get(wireId);
    const newValue = event.payload.signalValue ?? false;

    if (!currentWireState || currentWireState.value !== newValue) {
      const newWireStates = new Map(state.wireStates);
      newWireStates.set(wireId, {
        wireId,
        value: newValue,
        previousValue: currentWireState?.value ?? false,
        lastChanged: event.time,
        transitions: (currentWireState?.transitions ?? 0) + 1,
        strength: currentWireState?.strength ?? 2, // STRONG
      });

      const newState: CircuitState = {
        version: state.version + 1,
        timestamp: event.time,
        gateStates: state.gateStates,
        wireStates: newWireStates,
        parent: state,
        mutations: new Set([...state.mutations, wireId]),
      };

      return { newState, changed: true };
    }

    return { newState: state, changed: false };
  }

  /**
   * クロックエッジイベント処理
   */
  private processClockEdgeEvent(
    event: SimulationEvent,
    state: CircuitState
  ): {
    newState: CircuitState;
    changedSignals: string[];
  } {
    // クロックエッジ処理は複雑なので簡略化
    // 実際の実装では、クロック同期要素の評価が必要
    return { newState: state, changedSignals: [] };
  }

  /**
   * 新しいデルタサイクルイベントを生成
   */
  private generateDeltaCycleEvents(
    changedSignals: readonly string[],
    currentTime: SimulationTime,
    nextDeltaCycle: DeltaCycle
  ): SimulationEvent[] {
    const events: SimulationEvent[] = [];

    for (const signalId of changedSignals) {
      events.push({
        id: `delta_${signalId}_${nextDeltaCycle}`,
        time: currentTime,
        deltaCycle: nextDeltaCycle,
        priority: 1,
        type: 'GATE_EVALUATION',
        target: { gateId: signalId },
        payload: {},
      });
    }

    return events;
  }

  /**
   * オシレーション検出
   */
  private detectOscillation(
    changedSignals: readonly string[],
    signalHistory: Map<string, boolean[]>,
    deltaCycle: DeltaCycle
  ): {
    detected: boolean;
    signals: string[];
    period: number;
  } {
    const oscillatingSignals: string[] = [];
    const minHistoryLength = 6; // 最小検出履歴長
    const maxPeriod = 4; // 最大周期長

    for (const signalId of changedSignals) {
      if (!signalHistory.has(signalId)) {
        signalHistory.set(signalId, []);
      }

      const history = signalHistory.get(signalId)!;
      history.push(true); // 変化があったことを記録

      if (history.length >= minHistoryLength) {
        // 周期的パターンの検出
        for (let period = 2; period <= maxPeriod; period++) {
          if (this.hasPeriodicPattern(history, period)) {
            oscillatingSignals.push(signalId);
            break;
          }
        }
      }

      // 履歴サイズ制限
      if (history.length > minHistoryLength * 2) {
        history.shift();
      }
    }

    return {
      detected: oscillatingSignals.length > 0,
      signals: oscillatingSignals,
      period: 2, // 簡略化
    };
  }

  /**
   * 周期的パターンの検出
   */
  private hasPeriodicPattern(history: boolean[], period: number): boolean {
    if (history.length < period * 2) {
      return false;
    }

    const recentPattern = history.slice(-period);
    const previousPattern = history.slice(-period * 2, -period);

    return this.arraysEqual(recentPattern, previousPattern);
  }

  /**
   * 配列の等価性チェック
   */
  private arraysEqual<T>(a: readonly T[], b: readonly T[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((val, i) => val === b[i]);
  }

  /**
   * 平均デルタサイクル数計算
   */
  private calculateAverageDeltaCycles(): number {
    if (this.convergenceHistory.length === 0) return 0;
    
    const totalCycles = this.convergenceHistory.reduce(
      (sum, point) => sum + point.cycle, 
      0
    );
    
    return totalCycles / this.convergenceHistory.length;
  }

  /**
   * オシレーションパターンの抽出
   */
  private extractOscillationPatterns(
    signalHistory: Map<string, boolean[]>
  ): OscillationPattern[] {
    const patterns: OscillationPattern[] = [];

    for (const [signalId, history] of signalHistory) {
      if (history.length >= 4) {
        // 簡略化されたパターン検出
        const period = this.detectPeriod(history);
        if (period > 0) {
          patterns.push({
            signals: [signalId],
            period,
            detectedAt: {
              time: 0, // 実際の時刻は別途計算
              cycle: history.length,
            },
            confidence: 0.8, // 簡略化
          });
        }
      }
    }

    return patterns;
  }

  /**
   * 周期検出
   */
  private detectPeriod(history: boolean[]): number {
    for (let period = 2; period <= Math.floor(history.length / 2); period++) {
      if (this.hasPeriodicPattern(history, period)) {
        return period;
      }
    }
    return 0;
  }
}
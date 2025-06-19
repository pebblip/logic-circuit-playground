/**
 * タイミングチャート機能のイベント捕捉システム
 */

import type { TimingEvent, TimeMs, SignalValue } from '@/types/timing';
import type { Gate } from '@/types/circuit';
import type {
  Circuit,
  Result,
  CircuitEvaluationResult,
  ApiError,
} from '@/domain/simulation/core/types';
import type { SimulationConfig } from '@/stores/slices/simulationSlice';
import { timingChartUtils } from '@/utils/timingChart';
import { DEFAULT_GATE_DELAYS } from '@/constants/gateDelays';

/**
 * イベント捕捉システムのインターフェース
 */
export interface TimingEventCapture {
  // 回路評価時にイベントを捕捉
  captureFromEvaluation(
    evaluationResult: Result<CircuitEvaluationResult, ApiError>,
    previousState?: Circuit
  ): TimingEvent[];

  // 特定のゲートの状態変化を監視
  watchGate(
    gateId: string,
    pinType: 'input' | 'output',
    pinIndex?: number
  ): void;
  unwatchGate(gateId: string): void;

  // CLOCKゲートのイベント捕捉
  captureClockEvents(clockGates: Gate[]): TimingEvent[];

  // イベント履歴管理
  getEvents(startTime?: TimeMs, endTime?: TimeMs): TimingEvent[];
  clearEvents(beforeTime?: TimeMs): void;

  // 統計情報
  getStats(): {
    totalEvents: number;
    eventsPerSecond: number;
    memoryUsage: number;
  };
}

/**
 * ゲート監視情報
 */
interface GateWatcher {
  gateId: string;
  pinType: 'input' | 'output';
  pinIndex: number;
  lastValue?: SignalValue;
  lastUpdateTime?: TimeMs;
}

/**
 * イベントバッファー（パフォーマンス最適化用）
 */
class TimingEventBuffer {
  private buffer: TimingEvent[] = [];
  private flushTimer?: number;
  private readonly batchSize = 100;
  private readonly flushInterval = 16; // 60fps
  private onFlush?: (events: TimingEvent[]) => void;

  constructor(onFlush?: (events: TimingEvent[]) => void) {
    this.onFlush = onFlush;
  }

  addEvent(event: TimingEvent): void {
    this.buffer.push(event);

    if (this.buffer.length >= this.batchSize) {
      this.flush();
    } else if (!this.flushTimer) {
      this.flushTimer = window.setTimeout(
        () => this.flush(),
        this.flushInterval
      );
    }
  }

  flush(): void {
    if (this.buffer.length === 0) return;

    const events = [...this.buffer];
    this.buffer = [];

    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = undefined;
    }

    if (this.onFlush) {
      this.onFlush(events);
    }
  }

  destroy(): void {
    this.flush();
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }
  }
}

/**
 * 回路タイミング捕捉システムの実装
 */
export class CircuitTimingCapture implements TimingEventCapture {
  private watchers = new Map<string, GateWatcher>();
  private eventHistory: TimingEvent[] = [];
  private eventBuffer: TimingEventBuffer;
  private maxHistorySize = 50000; // メモリ制限
  private isEnabled = true;
  private simulationStartTime: number | null = null; // シミュレーション開始時刻
  private simulationConfig: SimulationConfig | null = null; // 遅延モード設定
  private timeProvider: (() => number) | null = null; // テスト用時間プロバイダー

  constructor(onEventBatch?: (events: TimingEvent[]) => void) {
    this.eventBuffer = new TimingEventBuffer(events => {
      // バッファからのイベントを履歴に追加
      this.eventHistory.push(...events);
      this.cleanupOldEvents();

      // 外部コールバック呼び出し
      if (onEventBatch) {
        onEventBatch(events);
      }
    });
  }

  /**
   * シミュレーション開始時刻を設定
   */
  setSimulationStartTime(startTime?: number): void {
    this.simulationStartTime = startTime || performance.now();
  }

  /**
   * シミュレーション開始時刻をリセット
   */
  resetSimulationTime(): void {
    this.simulationStartTime = null;
  }

  /**
   * シミュレーション設定を更新
   */
  updateSimulationConfig(config: SimulationConfig): void {
    this.simulationConfig = config;
  }

  /**
   * テスト用時間プロバイダーを設定
   */
  setTimeProvider(provider: (() => number) | null): void {
    this.timeProvider = provider;
  }

  /**
   * ゲートの遅延時間を計算
   */
  private calculateGateDelay(gate: Gate): number {
    if (!this.simulationConfig?.delayMode) {
      return 0; // 遅延モードOFFの場合は遅延なし
    }

    // カスタム遅延値があるかチェック
    const customDelay = this.simulationConfig.customDelays[gate.id];
    if (customDelay !== undefined) {
      return customDelay * this.simulationConfig.delayMultiplier;
    }

    // ゲート固有の遅延値があるかチェック
    if (gate.timing?.propagationDelay !== undefined) {
      return gate.timing.propagationDelay * this.simulationConfig.delayMultiplier;
    }

    // デフォルト遅延値を使用
    const defaultDelay = DEFAULT_GATE_DELAYS[gate.type] || 1.0;
    return defaultDelay * this.simulationConfig.delayMultiplier;
  }

  /**
   * 現在のシミュレーション時刻を取得
   */
  getCurrentSimulationTime(): TimeMs {
    return this.getRelativeTime();
  }

  /**
   * 相対時間を取得（シミュレーション開始からの経過時間）
   */
  private getRelativeTime(): TimeMs {
    if (this.timeProvider) {
      // テスト環境: 時間プロバイダーからの値をそのまま使用
      return this.timeProvider();
    } else {
      // 本番環境: performance.nowから相対時間を計算
      if (this.simulationStartTime === null) {
        this.setSimulationStartTime();
      }
      return performance.now() - this.simulationStartTime!;
    }
  }

  /**
   * 回路評価結果からイベントを捕捉
   */
  captureFromEvaluation(
    evaluationResult: Result<CircuitEvaluationResult, ApiError>,
    previousState?: Circuit
  ): TimingEvent[] {
    if (!this.isEnabled || !evaluationResult.success) {
      return [];
    }

    const events: TimingEvent[] = [];
    const currentTime = this.getRelativeTime(); // 相対時間を使用
    const currentCircuit = evaluationResult.data.circuit;

    // 前回の状態と比較して変化を検出
    if (previousState) {
      // ゲートの出力変化を検出
      currentCircuit.gates.forEach((currentGate: Gate) => {
        const previousGate = previousState.gates.find(
          (g: Gate) => g.id === currentGate.id
        );

        if (previousGate) {
          const hasChanged = this.hasGateOutputChanged(currentGate, previousGate);
          if (currentGate.type === 'CLOCK') {
            console.log(`🔍 [TimingCapture] CLOCK ${currentGate.id} change check: current=${currentGate.output}, previous=${previousGate.output}, hasChanged=${hasChanged}`);
          }
          
          if (hasChanged) {
            // 遅延を考慮したイベント時刻を計算
            const gateDelay = this.calculateGateDelay(currentGate);
            const delayedTime = currentTime + gateDelay;

            const currentValue = this.getGateOutputValue(currentGate);
            const previousValue = this.getGateOutputValue(previousGate);
            
            const event: TimingEvent = {
              id: timingChartUtils.generateEventId(),
              time: delayedTime, // 遅延を考慮した時刻
              gateId: currentGate.id,
              pinType: 'output',
              pinIndex: 0,
              value: currentValue,
              previousValue: previousValue,
              source: `circuit-evaluation-delay:${gateDelay}ms`,
              propagationDelay: gateDelay, // 適用された遅延
            };
            
            // CLOCKゲートの値変化をデバッグ
            if (currentGate.type === 'CLOCK') {
              console.log(`🔍 [TimingCapture] CLOCK ${currentGate.id} event: ${previousValue} → ${currentValue} (gate.output=${currentGate.output}, delayedTime=${delayedTime})`);
            }
            
            events.push(event);
          }
        }

        // 特定の監視対象ゲートの入力変化も検出
        if (this.watchers.has(currentGate.id)) {
          const inputEvents = this.captureGateInputChanges(
            currentGate,
            previousGate,
            currentTime
          );
          events.push(...inputEvents);
        }
      });
    } else {
      // 初期状態の記録
      currentCircuit.gates.forEach((gate: Gate) => {
        // 初期状態では遅延は適用しない（すでに安定状態として扱う）
        const event: TimingEvent = {
          id: timingChartUtils.generateEventId(),
          time: currentTime,
          gateId: gate.id,
          pinType: 'output',
          pinIndex: 0,
          value: this.getGateOutputValue(gate),
          source: 'initial-state',
          propagationDelay: 0, // 初期状態では遅延なし
        };
        events.push(event);
      });
    }

    // イベントをバッファに追加
    events.forEach(event => this.eventBuffer.addEvent(event));

    return events;
  }

  /**
   * CLOCKゲートのイベント捕捉
   */
  captureClockEvents(clockGates: Gate[]): TimingEvent[] {
    if (!this.isEnabled) {
      return [];
    }

    const events: TimingEvent[] = [];
    const currentTime = this.getRelativeTime(); // 相対時間を使用

    clockGates.forEach(gate => {
      // CLOCKの状態変化を記録
      const watcherKey = `${gate.id}_output_0`;
      const watcher = this.watchers.get(watcherKey);
      const currentValue = gate.output;

      if (watcher && watcher.lastValue !== currentValue) {
        const event: TimingEvent = {
          id: timingChartUtils.generateEventId(),
          time: currentTime,
          gateId: gate.id,
          pinType: 'output',
          pinIndex: 0,
          value: currentValue,
          previousValue: watcher.lastValue,
          source: 'clock-tick',
        };
        events.push(event);

        // 監視状態を更新
        watcher.lastValue = currentValue;
        watcher.lastUpdateTime = currentTime;
      }
    });

    // イベントをバッファに追加
    events.forEach(event => this.eventBuffer.addEvent(event));

    return events;
  }

  /**
   * ゲートの監視を開始
   */
  watchGate(gateId: string, pinType: 'input' | 'output', pinIndex = 0): void {
    const watcherKey = `${gateId}_${pinType}_${pinIndex}`;

    if (!this.watchers.has(watcherKey)) {
      this.watchers.set(watcherKey, {
        gateId,
        pinType,
        pinIndex,
      });
    }
  }

  /**
   * ゲートの監視を停止
   */
  unwatchGate(gateId: string): void {
    // 指定されたゲートIDのすべての監視を削除
    const keysToDelete = Array.from(this.watchers.keys()).filter(key =>
      key.startsWith(`${gateId}_`)
    );

    keysToDelete.forEach(key => this.watchers.delete(key));
  }

  /**
   * イベント履歴の取得
   */
  getEvents(startTime?: TimeMs, endTime?: TimeMs): TimingEvent[] {
    let filteredEvents = this.eventHistory;

    if (startTime !== undefined || endTime !== undefined) {
      filteredEvents = this.eventHistory.filter(event => {
        if (startTime !== undefined && event.time < startTime) return false;
        if (endTime !== undefined && event.time > endTime) return false;
        return true;
      });
    }

    return [...filteredEvents]; // コピーを返す
  }

  /**
   * 古いイベントのクリア
   */
  clearEvents(beforeTime?: TimeMs): void {
    if (beforeTime === undefined) {
      this.eventHistory = [];
    } else {
      this.eventHistory = this.eventHistory.filter(
        event => event.time >= beforeTime
      );
    }
  }

  /**
   * 統計情報の取得
   */
  getStats(): {
    totalEvents: number;
    eventsPerSecond: number;
    memoryUsage: number;
  } {
    const now = performance.now();
    const recentEvents = this.eventHistory.filter(e => now - e.time < 1000); // 直近1秒

    return {
      totalEvents: this.eventHistory.length,
      eventsPerSecond: recentEvents.length,
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  /**
   * 有効/無効の切り替え
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.eventBuffer.flush();
    }
  }

  /**
   * リソースのクリーンアップ
   */
  destroy(): void {
    this.eventBuffer.destroy();
    this.watchers.clear();
    this.eventHistory = [];
  }

  // === Private Methods ===

  private hasGateOutputChanged(current: Gate, previous: Gate): boolean {
    return (
      this.getGateOutputValue(current) !== this.getGateOutputValue(previous)
    );
  }

  private getGateOutputValue(gate: Gate): SignalValue {
    if ('output' in gate) {
      return gate.output;
    }
    return false; // デフォルト値
  }

  private captureGateInputChanges(
    currentGate: Gate,
    previousGate: Gate | undefined,
    currentTime: TimeMs
  ): TimingEvent[] {
    const events: TimingEvent[] = [];

    // 入力変化の検出ロジック（ゲートタイプ別に実装）
    // ここでは基本的な実装のみ
    if ('inputs' in currentGate && previousGate && 'inputs' in previousGate) {
      currentGate.inputs.forEach((currentInput, index) => {
        const previousInput = (previousGate as typeof currentGate).inputs[
          index
        ];

        if (currentInput !== previousInput) {
          const event: TimingEvent = {
            id: timingChartUtils.generateEventId(),
            time: currentTime,
            gateId: currentGate.id,
            pinType: 'input',
            pinIndex: index,
            value: this.convertToSignalValue(currentInput),
            previousValue: this.convertToSignalValue(previousInput),
            source: 'input-change',
          };
          events.push(event);
        }
      });
    }

    return events;
  }

  private cleanupOldEvents(): void {
    if (this.eventHistory.length > this.maxHistorySize) {
      // 古いイベントを削除（直近の70%を保持）
      const keepCount = Math.floor(this.maxHistorySize * 0.7);
      this.eventHistory = this.eventHistory.slice(-keepCount);
    }
  }

  private estimateMemoryUsage(): number {
    // 各イベントのメモリサイズを推定（平均200バイト）
    const totalSize = this.eventHistory.length * 200;
    return Math.round(totalSize / 1024); // KB単位
  }

  private convertToSignalValue(input: string): SignalValue {
    // 文字列の入力値を適切なSignalValueに変換
    if (input === 'true' || input === '1') return true;
    if (input === 'false' || input === '0') return false;
    if (input === 'unknown') return 'unknown';
    if (input === 'high-z') return 'high-z';

    // デフォルトでは文字列を真偽値として解釈
    return Boolean(input);
  }
}

/**
 * CLOCK専用のイベント捕捉システム
 */
export class ClockTimingCapture {
  private clockStates = new Map<
    string,
    { lastValue: boolean; lastTime: TimeMs }
  >();

  /**
   * CLOCKゲートの周期を自動検出
   */
  detectClockPeriod(events: TimingEvent[]): number {
    const clockEvents = events.filter(e => e.source === 'clock-tick');
    if (clockEvents.length < 2) return 50; // デフォルト値

    const risingEdges = clockEvents.filter(e => e.value === true);
    if (risingEdges.length < 2) return 50;

    const periods = [];
    for (let i = 1; i < risingEdges.length; i++) {
      periods.push(risingEdges[i].time - risingEdges[i - 1].time);
    }

    // 平均周期を返す
    return periods.reduce((sum, p) => sum + p, 0) / periods.length;
  }

  /**
   * 同期マーカーの生成
   */
  generateSyncMarkers(
    clockEvents: TimingEvent[],
    timeWindow: { start: TimeMs; end: TimeMs }
  ): TimingEvent[] {
    const markers: TimingEvent[] = [];
    const period = this.detectClockPeriod(clockEvents);

    // 時間窓内の同期点を生成
    let currentTime = timeWindow.start;
    while (currentTime <= timeWindow.end) {
      markers.push({
        id: timingChartUtils.generateEventId(),
        time: currentTime,
        gateId: 'sync_marker',
        pinType: 'output',
        pinIndex: 0,
        value: true,
        source: 'sync-marker',
      });
      currentTime += period;
    }

    return markers;
  }
}

/**
 * グローバルなタイミング捕捉システムのインスタンス
 */
export const globalTimingCapture = new CircuitTimingCapture();
export const globalClockCapture = new ClockTimingCapture();

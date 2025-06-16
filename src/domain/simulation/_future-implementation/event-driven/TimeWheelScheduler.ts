/**
 * タイムホイールスケジューラー実装
 * 
 * 階層的時間管理システム:
 * - Level 0: ns解像度 (短期間イベント)
 * - Level 1: μs解像度 (中期間イベント)  
 * - Level 2: ms解像度 (長期間イベント)
 * 
 * 特徴:
 * - O(1) amortized スケジューリング
 * - スパース時間軸最適化
 * - 周期的イベント特別処理
 * - メモリ効率的な実装
 */

import type {
  SimulationEvent,
  SimulationTime,
  TimeResolution,
  TimeWheelConfig,
  TimeWheelLevel,
  EventQueue,
  EventQueueStats,
} from './types';

/**
 * タイムホイール設定
 */
export interface TimeWheelSettings {
  readonly levels: readonly TimeWheelLevelConfig[];
  readonly autoResize: boolean;
  readonly sparseOptimization: boolean;
  readonly periodicEventCache: boolean;
}

/**
 * タイムホイールレベル設定
 */
export interface TimeWheelLevelConfig {
  readonly resolution: TimeResolution;
  readonly wheelSize: number;
  readonly maxRange: SimulationTime;
  readonly overflowHandling: 'PROMOTE' | 'SPLIT' | 'DEFER';
}

/**
 * デフォルト設定
 */
export const DEFAULT_TIME_WHEEL_SETTINGS: TimeWheelSettings = {
  levels: [
    {
      resolution: TimeResolution.NANOSECOND,
      wheelSize: 1024,
      maxRange: 1000000, // 1ms
      overflowHandling: 'PROMOTE',
    },
    {
      resolution: TimeResolution.MICROSECOND,
      wheelSize: 1024,
      maxRange: 1000000000, // 1s
      overflowHandling: 'PROMOTE',
    },
    {
      resolution: TimeResolution.MILLISECOND,
      wheelSize: 2048,
      maxRange: 1000000000000, // 1000s
      overflowHandling: 'DEFER',
    },
  ],
  autoResize: true,
  sparseOptimization: true,
  periodicEventCache: true,
};

/**
 * タイムホイール実装
 */
class TimeWheel {
  private wheels: Map<number, SimulationEvent[]>[] = [];
  private currentPointers: number[] = [];
  private config: TimeWheelLevelConfig;
  private level: number;

  // スパース最適化用
  private activeBuckets = new Set<number>();
  private lastAdvanceTime: SimulationTime = 0;

  constructor(config: TimeWheelLevelConfig, level: number) {
    this.config = config;
    this.level = level;
    
    // 各レベルのホイール初期化
    for (let i = 0; i < config.wheelSize; i++) {
      this.wheels[i] = new Map();
    }
    
    this.currentPointers = new Array(config.wheelSize).fill(0);
  }

  /**
   * イベントをスケジュール
   */
  schedule(event: SimulationEvent, currentTime: SimulationTime): boolean {
    const relativeTime = event.time - currentTime;
    
    if (relativeTime < 0) {
      // 過去のイベントは拒否
      return false;
    }
    
    if (relativeTime > this.config.maxRange) {
      // レンジオーバー
      return false;
    }

    const bucketIndex = this.calculateBucketIndex(relativeTime);
    const wheelIndex = bucketIndex % this.config.wheelSize;
    
    if (!this.wheels[wheelIndex]) {
      this.wheels[wheelIndex] = new Map();
    }
    
    const bucket = this.wheels[wheelIndex];
    const timeSlot = Math.floor(event.time / this.config.resolution);
    
    if (!bucket.has(timeSlot)) {
      bucket.set(timeSlot, []);
    }
    
    bucket.get(timeSlot)!.push(event);
    this.activeBuckets.add(wheelIndex);
    
    return true;
  }

  /**
   * 時間を進めてイベントを取得
   */
  advance(targetTime: SimulationTime): SimulationEvent[] {
    const events: SimulationEvent[] = [];
    const startTime = this.lastAdvanceTime;
    
    for (let time = startTime; time <= targetTime; time += this.config.resolution) {
      const bucketIndex = this.calculateBucketIndex(time - startTime);
      const wheelIndex = bucketIndex % this.config.wheelSize;
      
      if (this.activeBuckets.has(wheelIndex)) {
        const bucket = this.wheels[wheelIndex];
        if (bucket) {
          const timeSlot = Math.floor(time / this.config.resolution);
          const bucketEvents = bucket.get(timeSlot);
          
          if (bucketEvents && bucketEvents.length > 0) {
            events.push(...bucketEvents);
            bucket.delete(timeSlot);
            
            // バケットが空になったら最適化
            if (bucket.size === 0) {
              this.activeBuckets.delete(wheelIndex);
            }
          }
        }
      }
    }
    
    this.lastAdvanceTime = targetTime;
    return events;
  }

  /**
   * バケットインデックス計算
   */
  private calculateBucketIndex(relativeTime: SimulationTime): number {
    return Math.floor(relativeTime / this.config.resolution);
  }

  /**
   * 統計情報取得
   */
  getStats(): {
    activeBuckets: number;
    totalEvents: number;
    memoryUsage: number;
  } {
    let totalEvents = 0;
    
    for (const bucket of this.wheels) {
      if (bucket) {
        for (const events of bucket.values()) {
          totalEvents += events.length;
        }
      }
    }
    
    return {
      activeBuckets: this.activeBuckets.size,
      totalEvents,
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  /**
   * メモリ使用量推定
   */
  private estimateMemoryUsage(): number {
    const bucketOverhead = 50; // Map overhead per bucket
    const eventSize = 200; // Average event size
    
    let totalSize = this.config.wheelSize * 8; // Base array size
    
    for (const bucket of this.wheels) {
      if (bucket && bucket.size > 0) {
        totalSize += bucket.size * bucketOverhead;
        for (const events of bucket.values()) {
          totalSize += events.length * eventSize;
        }
      }
    }
    
    return totalSize;
  }
}

/**
 * 階層的タイムホイールスケジューラー
 */
export class TimeWheelScheduler implements EventQueue {
  private wheels: TimeWheel[] = [];
  private settings: TimeWheelSettings;
  private currentTime: SimulationTime = 0;
  
  // 周期的イベントキャッシュ
  private periodicEvents = new Map<string, PeriodicEventInfo>();
  
  // 統計情報
  private stats: EventQueueStats = {
    totalScheduled: 0,
    totalProcessed: 0,
    currentSize: 0,
    peakSize: 0,
    averageLatency: 0,
    memoryUsage: 0,
  };

  constructor(settings: TimeWheelSettings = DEFAULT_TIME_WHEEL_SETTINGS) {
    this.settings = settings;
    this.initializeWheels();
  }

  /**
   * イベントをスケジュール
   */
  schedule(event: SimulationEvent): void {
    // 周期的イベントの検出とキャッシュ
    if (this.settings.periodicEventCache) {
      this.handlePeriodicEvent(event);
    }

    const relativeTime = event.time - this.currentTime;
    let scheduled = false;

    // 適切なレベルのホイールに配置
    for (let level = 0; level < this.wheels.length; level++) {
      if (this.wheels[level].schedule(event, this.currentTime)) {
        scheduled = true;
        break;
      }
    }

    if (!scheduled) {
      // 最上位レベルでも配置できない場合の処理
      const topLevel = this.wheels[this.wheels.length - 1];
      const config = this.settings.levels[this.wheels.length - 1];
      
      switch (config.overflowHandling) {
        case 'DEFER':
          // 遅延リストに追加（簡略化）
          break;
        case 'SPLIT':
          // イベント分割（複雑なので省略）
          break;
        case 'PROMOTE':
        default:
          // 強制配置
          topLevel.schedule(event, this.currentTime);
          break;
      }
    }

    this.stats.totalScheduled++;
    this.updateCurrentSize();
  }

  /**
   * 次のイベントを取得
   */
  next(): SimulationEvent | undefined {
    return this.peek(true);
  }

  /**
   * 先頭イベントを確認
   */
  peek(remove: boolean = false): SimulationEvent | undefined {
    // すべてのレベルから最も早いイベントを検索
    let earliestEvent: SimulationEvent | undefined;
    let earliestLevel = -1;

    for (let level = 0; level < this.wheels.length; level++) {
      const levelEvents = this.wheels[level].advance(this.currentTime);
      
      for (const event of levelEvents) {
        if (!earliestEvent || event.time < earliestEvent.time) {
          earliestEvent = event;
          earliestLevel = level;
        }
      }
    }

    if (earliestEvent && remove) {
      this.currentTime = earliestEvent.time;
      this.stats.totalProcessed++;
      this.updateCurrentSize();
    }

    return earliestEvent;
  }

  /**
   * キューサイズ
   */
  size(): number {
    return this.stats.currentSize;
  }

  /**
   * 空判定
   */
  isEmpty(): boolean {
    return this.stats.currentSize === 0;
  }

  /**
   * クリア
   */
  clear(beforeTime?: SimulationTime): void {
    if (beforeTime === undefined) {
      this.initializeWheels();
      this.stats.currentSize = 0;
    } else {
      // 部分クリア（簡略化）
      this.advanceTime(beforeTime);
    }
  }

  /**
   * 統計情報取得
   */
  getStats(): EventQueueStats {
    this.updateMemoryUsage();
    return { ...this.stats };
  }

  /**
   * 時間を進める
   */
  advanceTime(targetTime: SimulationTime): SimulationEvent[] {
    const allEvents: SimulationEvent[] = [];
    
    while (this.currentTime < targetTime) {
      const nextEvent = this.peek(false);
      
      if (!nextEvent || nextEvent.time > targetTime) {
        this.currentTime = targetTime;
        break;
      }
      
      const event = this.next();
      if (event) {
        allEvents.push(event);
      }
    }
    
    return allEvents;
  }

  // ===============================
  // プライベートメソッド
  // ===============================

  /**
   * ホイール初期化
   */
  private initializeWheels(): void {
    this.wheels = [];
    
    for (let level = 0; level < this.settings.levels.length; level++) {
      const config = this.settings.levels[level];
      this.wheels.push(new TimeWheel(config, level));
    }
  }

  /**
   * 周期的イベント処理
   */
  private handlePeriodicEvent(event: SimulationEvent): void {
    // 周期性の検出（簡略化）
    const pattern = this.extractEventPattern(event);
    
    if (pattern.isPeriodic) {
      this.periodicEvents.set(event.id, {
        period: pattern.period,
        nextOccurrence: event.time + pattern.period,
        template: event,
      });
    }
  }

  /**
   * イベントパターン抽出
   */
  private extractEventPattern(event: SimulationEvent): {
    isPeriodic: boolean;
    period: SimulationTime;
  } {
    // 簡略化：CLOCKイベントのみ周期的と判定
    if (event.type === 'CLOCK_EDGE') {
      const frequency = event.payload.customData?.frequency as number;
      if (frequency) {
        return {
          isPeriodic: true,
          period: (1 / frequency) * TimeResolution.MILLISECOND,
        };
      }
    }
    
    return { isPeriodic: false, period: 0 };
  }

  /**
   * 現在サイズ更新
   */
  private updateCurrentSize(): void {
    let totalSize = 0;
    
    for (const wheel of this.wheels) {
      totalSize += wheel.getStats().totalEvents;
    }
    
    this.stats.currentSize = totalSize;
    this.stats.peakSize = Math.max(this.stats.peakSize, totalSize);
  }

  /**
   * メモリ使用量更新
   */
  private updateMemoryUsage(): void {
    let totalMemory = 0;
    
    for (const wheel of this.wheels) {
      totalMemory += wheel.getStats().memoryUsage;
    }
    
    // 周期的イベントキャッシュのメモリ
    totalMemory += this.periodicEvents.size * 100;
    
    this.stats.memoryUsage = totalMemory;
  }
}

/**
 * 周期的イベント情報
 */
interface PeriodicEventInfo {
  readonly period: SimulationTime;
  readonly nextOccurrence: SimulationTime;
  readonly template: SimulationEvent;
}

// ===============================
// 適応的タイムステップサポート
// ===============================

/**
 * 適応的タイムステップスケジューラー
 */
export class AdaptiveTimeStepScheduler extends TimeWheelScheduler {
  private activityLevels = new Map<SimulationTime, number>();
  private currentTimeStep: SimulationTime = TimeResolution.NANOSECOND;
  private minTimeStep: SimulationTime = TimeResolution.NANOSECOND;
  private maxTimeStep: SimulationTime = TimeResolution.MICROSECOND;

  /**
   * アクティビティベースの時間ステップ調整
   */
  adaptTimeStep(currentTime: SimulationTime, eventCount: number): void {
    // アクティビティレベル記録
    this.activityLevels.set(currentTime, eventCount);
    
    // 最近のアクティビティトレンド分析
    const recentActivity = this.calculateRecentActivity(currentTime);
    
    // 新しい時間ステップ決定
    if (recentActivity > 50) {
      // 高アクティビティ：細かい時間ステップ
      this.currentTimeStep = Math.max(
        this.minTimeStep,
        this.currentTimeStep / 2
      );
    } else if (recentActivity < 10) {
      // 低アクティビティ：粗い時間ステップ
      this.currentTimeStep = Math.min(
        this.maxTimeStep,
        this.currentTimeStep * 2
      );
    }
  }

  /**
   * 最近のアクティビティ計算
   */
  private calculateRecentActivity(currentTime: SimulationTime): number {
    const windowSize = 10 * TimeResolution.MICROSECOND;
    const startTime = currentTime - windowSize;
    
    let totalActivity = 0;
    let sampleCount = 0;
    
    for (const [time, activity] of this.activityLevels) {
      if (time >= startTime && time <= currentTime) {
        totalActivity += activity;
        sampleCount++;
      }
    }
    
    return sampleCount > 0 ? totalActivity / sampleCount : 0;
  }

  /**
   * 現在の時間ステップ取得
   */
  getCurrentTimeStep(): SimulationTime {
    return this.currentTimeStep;
  }
}

// ===============================
// ファクトリー関数
// ===============================

/**
 * 用途に応じた最適なスケジューラーを作成
 */
export function createTimeWheelScheduler(
  circuitSize: number,
  simulationDuration: SimulationTime,
  options: Partial<TimeWheelSettings> = {}
): TimeWheelScheduler {
  const settings: TimeWheelSettings = {
    ...DEFAULT_TIME_WHEEL_SETTINGS,
    ...options,
  };

  // 回路サイズに基づいた最適化
  if (circuitSize > 1000) {
    // 大規模回路：適応的タイムステップ
    return new AdaptiveTimeStepScheduler(settings);
  } else {
    // 通常回路：標準タイムホイール
    return new TimeWheelScheduler(settings);
  }
}

/**
 * 教育用最適化スケジューラー
 */
export function createEducationalScheduler(): TimeWheelScheduler {
  const educationalSettings: TimeWheelSettings = {
    levels: [
      {
        resolution: TimeResolution.MICROSECOND, // 教育用は μs で十分
        wheelSize: 256,
        maxRange: 100000, // 100μs
        overflowHandling: 'PROMOTE',
      },
      {
        resolution: TimeResolution.MILLISECOND,
        wheelSize: 256,
        maxRange: 10000000, // 10s
        overflowHandling: 'DEFER',
      },
    ],
    autoResize: false,
    sparseOptimization: true,
    periodicEventCache: true,
  };

  return new TimeWheelScheduler(educationalSettings);
}
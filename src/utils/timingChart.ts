/**
 * タイミングチャート機能のユーティリティ関数
 */

import type {
  TimingTrace,
  TimingEvent,
  TimeMs,
  TimeScale,
  SignalValue,
  TimingChartUtils,
} from '@/types/timing';
import type { Gate } from '@/types/circuit';

// 信号波形の色パレット（8色セット）
const SIGNAL_COLORS = [
  '#00ff88', // 緑（アクティブ色）
  '#88ddff', // 水色
  '#ffaa00', // オレンジ
  '#ff6b9d', // ピンク
  '#c471ed', // 紫
  '#12d8fa', // 青
  '#f093fb', // ライトピンク
  '#ffeaa7', // イエロー
] as const;

// CLOCK専用色
const CLOCK_COLOR = '#00ff88'; // 明るい緑（プライマリカラー）

// イベントID生成用カウンター
let eventIdCounter = 0;
let traceIdCounter = 0;

/**
 * タイミングチャートユーティリティ関数の実装
 */
export const timingChartUtils: TimingChartUtils = {
  /**
   * ユニークなイベントIDを生成
   */
  generateEventId(): string {
    return `event_${Date.now()}_${++eventIdCounter}`;
  },

  /**
   * ユニークなトレースIDを生成
   */
  generateTraceId(): string {
    return `trace_${Date.now()}_${++traceIdCounter}`;
  },

  /**
   * トレース表示名を生成
   */
  generateTraceName(
    gateId: string,
    pinType: 'input' | 'output',
    pinIndex: number
  ): string {
    // ゲートIDから基本名を抽出し、短縮（例: "gate-1749abc" → "1749"）
    const baseName = gateId.replace(/^gate[-_]/, '').substring(0, 4);

    if (pinType === 'output') {
      return `${baseName}`;
    } else {
      return pinIndex === 0 ? `${baseName}_IN` : `${baseName}_IN${pinIndex}`;
    }
  },

  /**
   * トレースの色を自動割り当て
   */
  assignTraceColor(traceCount: number): string {
    return SIGNAL_COLORS[traceCount % SIGNAL_COLORS.length];
  },

  /**
   * 時間を指定されたスケールでフォーマット
   */
  formatTime(time: TimeMs, scale: TimeScale): string {
    switch (scale) {
      case 'us':
        return `${(time * 1000).toFixed(1)}μs`;
      case 'ms':
        return `${time.toFixed(1)}ms`;
      case 's':
        return `${(time / 1000).toFixed(3)}s`;
      default:
        return `${time.toFixed(1)}ms`;
    }
  },

  /**
   * 指定時刻における各信号の値を計算
   */
  calculateSignalValuesAtTime(
    traces: TimingTrace[],
    time: TimeMs
  ): Record<string, SignalValue> {
    const signalValues: Record<string, SignalValue> = {};

    traces.forEach(trace => {
      // 指定時刻以前の最後のイベントを見つける
      const relevantEvents = trace.events.filter(event => event.time <= time);

      if (relevantEvents.length === 0) {
        signalValues[trace.id] = false; // デフォルト値
      } else {
        const lastEvent = relevantEvents[relevantEvents.length - 1];
        signalValues[trace.id] = lastEvent.value;
      }
    });

    return signalValues;
  },
};

/**
 * 時間スケールを数値に変換（ソート・比較用）
 */
export function timeScaleToNumber(scale: TimeScale): number {
  switch (scale) {
    case 'us':
      return 0.001;
    case 'ms':
      return 1;
    case 's':
      return 1000;
    default:
      return 1;
  }
}

/**
 * 時間窓が有効かチェック
 */
export function isValidTimeWindow(start: TimeMs, end: TimeMs): boolean {
  return start >= 0 && end > start && end - start > 0.1; // 最小100μs
}

/**
 * ゲートタイプを判定
 */
export function getGateType(gate: Gate): string {
  if ('type' in gate) {
    return gate.type;
  }
  return 'UNKNOWN';
}

/**
 * CLOCKゲートかどうか判定
 */
export function isClockGate(gate: Gate): boolean {
  return getGateType(gate) === 'CLOCK';
}

// CLOCKゲートのカウンター（分かりやすい命名用）
let clockCounter = 0;
const clockNameMap = new Map<string, string>();

/**
 * トレース名の自動生成（ゲート情報から）
 */
export function generateTraceNameFromGate(
  gate: Gate,
  pinType: 'input' | 'output',
  pinIndex: number
): string {
  const gateType = getGateType(gate);

  // CLOCKゲートの場合は分かりやすい名前
  if (gateType === 'CLOCK') {
    // 既存のCLOCKゲートかチェック
    if (!clockNameMap.has(gate.id)) {
      clockCounter++;
      const clockName = clockCounter === 1 ? 'CLOCK' : `CLOCK${clockCounter}`;
      clockNameMap.set(gate.id, clockName);
    }
    return clockNameMap.get(gate.id)!;
  }

  // その他のゲート（分かりやすい短縮名）
  const shortName = gateType.substring(0, 3); // AND, OR, NOT, XOR など

  if (pinType === 'output') {
    return shortName;
  } else {
    const pinSuffix = pinIndex === 0 ? '' : `${pinIndex}`;
    return `${shortName}_IN${pinSuffix}`;
  }
}

/**
 * CLOCKトレースの色を取得（複数CLOCK対応）
 */
export function getClockTraceColor(gateId?: string): string {
  if (!gateId) {
    return CLOCK_COLOR;
  }

  // 複数CLOCKの場合は色を変える
  const clockNames = Array.from(clockNameMap.entries());
  const clockIndex = clockNames.findIndex(([id]) => id === gateId);

  if (clockIndex === -1) {
    return CLOCK_COLOR; // フォールバック
  }

  // CLOCK専用色パレット
  const clockColors = [
    '#00ff88', // 緑（1番目のCLOCK）
    '#ff6b9d', // ピンク（2番目のCLOCK）
    '#12d8fa', // 青（3番目のCLOCK）
    '#ffaa00', // オレンジ（4番目のCLOCK）
    '#c471ed', // 紫（5番目のCLOCK）
  ];

  return clockColors[clockIndex % clockColors.length];
}

/**
 * イベントの配列をソート（時刻順）
 */
export function sortEventsByTime(events: TimingEvent[]): TimingEvent[] {
  return [...events].sort((a, b) => a.time - b.time);
}

/**
 * 重複するイベントを除去
 */
export function deduplicateEvents(events: TimingEvent[]): TimingEvent[] {
  const seen = new Set<string>();
  return events.filter(event => {
    const key = `${event.gateId}_${event.pinType}_${event.pinIndex}_${event.time}_${event.value}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * 時間窓外のイベントを除去
 */
export function filterEventsInTimeWindow(
  events: TimingEvent[],
  timeWindow: { start: TimeMs; end: TimeMs }
): TimingEvent[] {
  return events.filter(
    event => event.time >= timeWindow.start && event.time <= timeWindow.end
  );
}

/**
 * イベント統計の計算
 */
export function calculateEventStats(
  events: TimingEvent[],
  timeWindow: { start: TimeMs; end: TimeMs }
) {
  const windowDuration = timeWindow.end - timeWindow.start;
  const eventsInWindow = filterEventsInTimeWindow(events, timeWindow);

  return {
    totalEvents: events.length,
    eventsInWindow: eventsInWindow.length,
    eventsPerSecond: eventsInWindow.length / (windowDuration / 1000),
    timeSpan: windowDuration,
  };
}

/**
 * メモリ使用量の推定（KB単位）
 */
export function estimateMemoryUsage(traces: TimingTrace[]): number {
  let totalSize = 0;

  traces.forEach(trace => {
    // 各イベントのメモリサイズを推定（平均200バイト）
    totalSize += trace.events.length * 200;
    // トレース自体のメタデータ（平均500バイト）
    totalSize += 500;
  });

  return Math.round(totalSize / 1024); // KB単位
}

/**
 * デバッグ用：トレース情報の出力
 */
export function debugTrace(): void {
  // Debug function - implementation removed to avoid console logs
}

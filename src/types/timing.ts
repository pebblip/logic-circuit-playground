/**
 * タイミングチャート機能のTypeScript型定義
 */

// 時間の単位（ミリ秒）
export type TimeMs = number;

// 信号の値（デジタル信号）
export type SignalValue = boolean | 'unknown' | 'high-z';

// 時間窓（表示範囲）
export interface TimeWindow {
  start: TimeMs;
  end: TimeMs;
}

// 時間スケール
export type TimeScale = 'us' | 'ms' | 's';

// 信号の変化イベント
export interface TimingEvent {
  readonly id: string; // ユニークID
  readonly time: TimeMs; // 発生時刻
  readonly gateId: string; // 対象ゲートID
  readonly pinType: 'input' | 'output';
  readonly pinIndex: number; // ピン番号
  readonly value: SignalValue; // 変化後の値
  readonly previousValue?: SignalValue; // 変化前の値
  readonly source?: string; // 変化の原因（debug用）
  readonly propagationDelay?: number; // 伝播遅延(ms)
}

// 信号トレース（1つの信号の時系列データ）
export interface TimingTrace {
  readonly id: string; // トレースID
  readonly gateId: string; // 監視対象ゲートID
  readonly pinType: 'input' | 'output';
  readonly pinIndex: number; // ピン番号
  readonly name: string; // 表示名
  readonly color: string; // 波形の色
  readonly visible: boolean; // 表示/非表示
  readonly events: TimingEvent[]; // 時系列イベント（時刻順ソート）
  readonly metadata?: {
    // メタデータ
    gateType?: string;
    description?: string;
    unit?: string;
  };
}

// 時間カーソル情報
export interface TimeCursor {
  readonly time: TimeMs;
  readonly visible: boolean;
  readonly signalValues: Record<string, SignalValue>; // カーソル位置での各信号値
}

// 設定情報
export interface TimingChartSettings {
  readonly theme: 'dark' | 'light';
  readonly gridVisible: boolean;
  readonly clockHighlightEnabled: boolean;
  readonly edgeMarkersEnabled: boolean; // 立ち上がり/立ち下がりマーカー
  readonly signalLabelsVisible: boolean;
  readonly autoCapture: boolean; // 自動イベント捕捉
  readonly captureDepth: number; // 保持するイベント数（メモリ制限）
  readonly updateInterval: number; // 更新間隔(ms)
}

// 統計情報
export interface TimingChartStats {
  readonly totalEvents: number;
  readonly eventsPerSecond: number;
  readonly memoryUsage: number; // MB
  readonly renderTime: number; // ms
  readonly lastUpdate: TimeMs;
}

// タイミングチャート全体の状態
export interface TimingChartState {
  // 表示設定
  readonly isVisible: boolean;
  readonly panelHeight: number; // パネル高さ（200-600px）

  // 時間軸設定
  readonly timeWindow: TimeWindow;
  readonly timeScale: TimeScale;
  readonly autoScale: boolean; // 自動スケール調整
  readonly autoScroll?: boolean; // 自動スクロール（新しいイベントで時間窓を更新）
  readonly isPaused?: boolean; // 一時停止状態

  // トレース管理
  readonly traces: TimingTrace[];
  readonly maxTraces: number; // 最大表示トレース数（パフォーマンス制限）

  // カーソル
  readonly cursor?: TimeCursor;

  // 設定
  readonly settings: TimingChartSettings;

  // 統計情報（デバッグ・最適化用）
  readonly stats?: TimingChartStats;
}

// 波形描画用データ型
export interface WaveformSegment {
  readonly startTime: TimeMs;
  readonly endTime: TimeMs;
  readonly value: SignalValue;
  readonly isEdge: boolean; // エッジ（立ち上がり/立ち下がり）
  readonly edgeType?: 'rising' | 'falling';
}

// 描画最適化用のLOD（Level of Detail）データ
export interface WaveformLOD {
  readonly level: 'high' | 'medium' | 'low';
  readonly segments: WaveformSegment[];
  readonly aggregatedEvents?: number; // 集約されたイベント数
}

// レンダリング用データ
export interface WaveformRenderData {
  readonly traceId: string;
  readonly lod: WaveformLOD;
  readonly boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  readonly path: string; // SVG path文字列（キャッシュ）
}

// ユーティリティ関数の型
export interface TimingChartUtils {
  generateEventId(): string;
  generateTraceId(): string;
  generateTraceName(
    gateId: string,
    pinType: 'input' | 'output',
    pinIndex: number
  ): string;
  assignTraceColor(traceCount: number): string;
  formatTime(time: TimeMs, scale: TimeScale): string;
  calculateSignalValuesAtTime(
    traces: TimingTrace[],
    time: TimeMs
  ): Record<string, SignalValue>;
}

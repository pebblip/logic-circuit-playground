# 📊 タイミングチャート データ構造設計

## 🎯 概要
タイミングチャート機能の核となるデータ構造とイベント管理システムの詳細設計です。高性能でリアルタイムな波形表示を実現するための最適化された設計となっています。

## 📋 TypeScript型定義

### 基本データ型
```typescript
// 時間の単位（ミリ秒）
type TimeMs = number;

// 信号の値（デジタル信号）
type SignalValue = boolean | 'unknown' | 'high-z';

// 時間窓（表示範囲）
interface TimeWindow {
  start: TimeMs;
  end: TimeMs;
}

// 時間スケール
type TimeScale = 'us' | 'ms' | 's';

// 信号の変化イベント
interface TimingEvent {
  readonly id: string;           // ユニークID
  readonly time: TimeMs;         // 発生時刻
  readonly gateId: string;       // 対象ゲートID
  readonly pinType: 'input' | 'output';
  readonly pinIndex: number;     // ピン番号
  readonly value: SignalValue;   // 変化後の値
  readonly previousValue?: SignalValue;  // 変化前の値
  readonly source?: string;      // 変化の原因（debug用）
  readonly propagationDelay?: number;    // 伝播遅延(ms)
}

// 信号トレース（1つの信号の時系列データ）
interface TimingTrace {
  readonly id: string;           // トレースID
  readonly gateId: string;       // 監視対象ゲートID
  readonly pinType: 'input' | 'output';
  readonly pinIndex: number;     // ピン番号
  readonly name: string;         // 表示名
  readonly color: string;        // 波形の色
  readonly visible: boolean;     // 表示/非表示
  readonly events: TimingEvent[]; // 時系列イベント（時刻順ソート）
  readonly metadata?: {          // メタデータ
    gateType?: string;
    description?: string;
    unit?: string;
  };
}

// 時間カーソル情報
interface TimeCursor {
  readonly time: TimeMs;
  readonly visible: boolean;
  readonly signalValues: Record<string, SignalValue>; // カーソル位置での各信号値
}

// タイミングチャート全体の状態
interface TimingChartState {
  // 表示設定
  readonly isVisible: boolean;
  readonly panelHeight: number;  // パネル高さ（200-600px）
  
  // 時間軸設定
  readonly timeWindow: TimeWindow;
  readonly timeScale: TimeScale;
  readonly autoScale: boolean;   // 自動スケール調整
  
  // トレース管理
  readonly traces: TimingTrace[];
  readonly maxTraces: number;    // 最大表示トレース数（パフォーマンス制限）
  
  // カーソル
  readonly cursor?: TimeCursor;
  
  // 設定
  readonly settings: TimingChartSettings;
  
  // 統計情報（デバッグ・最適化用）
  readonly stats?: TimingChartStats;
}

// 設定情報
interface TimingChartSettings {
  readonly theme: 'dark' | 'light';
  readonly gridVisible: boolean;
  readonly clockHighlightEnabled: boolean;
  readonly edgeMarkersEnabled: boolean;  // 立ち上がり/立ち下がりマーカー
  readonly signalLabelsVisible: boolean;
  readonly autoCapture: boolean;          // 自動イベント捕捉
  readonly captureDepth: number;          // 保持するイベント数（メモリ制限）
  readonly updateInterval: number;        // 更新間隔(ms)
}

// 統計情報
interface TimingChartStats {
  readonly totalEvents: number;
  readonly eventsPerSecond: number;
  readonly memoryUsage: number;           // MB
  readonly renderTime: number;            // ms
  readonly lastUpdate: TimeMs;
}
```

### 波形描画用データ型
```typescript
// 描画用の波形セグメント
interface WaveformSegment {
  readonly startTime: TimeMs;
  readonly endTime: TimeMs;
  readonly value: SignalValue;
  readonly isEdge: boolean;              // エッジ（立ち上がり/立ち下がり）
  readonly edgeType?: 'rising' | 'falling';
}

// 描画最適化用のLOD（Level of Detail）データ
interface WaveformLOD {
  readonly level: 'high' | 'medium' | 'low';
  readonly segments: WaveformSegment[];
  readonly aggregatedEvents?: number;     // 集約されたイベント数
}

// レンダリング用データ
interface WaveformRenderData {
  readonly traceId: string;
  readonly lod: WaveformLOD;
  readonly boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  readonly path: string;                  // SVG path文字列（キャッシュ）
}
```

## 🔄 イベント捕捉システム

### イベント捕捉インターフェース
```typescript
interface TimingEventCapture {
  // 回路評価時にイベントを捕捉
  captureFromEvaluation(
    evaluationResult: EvaluationResult,
    previousState?: Circuit
  ): TimingEvent[];
  
  // 特定のゲートの状態変化を監視
  watchGate(gateId: string, pinType: 'input' | 'output', pinIndex?: number): void;
  unwatchGate(gateId: string): void;
  
  // イベントストリーム
  getEventStream(): Observable<TimingEvent>;
  
  // 履歴管理
  getEvents(timeWindow: TimeWindow): TimingEvent[];
  clearEvents(beforeTime?: TimeMs): void;
}

// 実装クラス
class CircuitTimingCapture implements TimingEventCapture {
  private watchers = new Map<string, GateWatcher>();
  private eventHistory: TimingEvent[] = [];
  private eventSubject = new Subject<TimingEvent>();
  
  captureFromEvaluation(
    evaluationResult: EvaluationResult,
    previousState?: Circuit
  ): TimingEvent[] {
    const events: TimingEvent[] = [];
    const currentTime = performance.now();
    
    // 前回の状態と比較して変化を検出
    if (previousState) {
      for (const gate of evaluationResult.circuit.gates) {
        const prevGate = previousState.gates.find(g => g.id === gate.id);
        if (prevGate && this.hasSignalChanged(gate, prevGate)) {
          const event: TimingEvent = {
            id: generateEventId(),
            time: currentTime,
            gateId: gate.id,
            pinType: 'output',
            pinIndex: 0,
            value: gate.output,
            previousValue: prevGate.output,
            source: 'circuit-evaluation'
          };
          events.push(event);
        }
      }
    }
    
    // イベント履歴に追加
    this.eventHistory.push(...events);
    this.cleanupOldEvents();
    
    // イベントストリームに通知
    events.forEach(event => this.eventSubject.next(event));
    
    return events;
  }
  
  private hasSignalChanged(current: Gate, previous: Gate): boolean {
    return current.output !== previous.output;
  }
  
  private cleanupOldEvents(): void {
    const maxAge = 60000; // 60秒
    const cutoffTime = performance.now() - maxAge;
    this.eventHistory = this.eventHistory.filter(e => e.time > cutoffTime);
  }
}
```

### CLOCKイベント捕捉
```typescript
interface ClockEventCapture {
  // CLOCK信号の立ち上がり/立ち下がりを捕捉
  captureClockEdges(clockGates: ClockGate[]): TimingEvent[];
  
  // CLOCK周期の自動検出
  detectClockPeriod(events: TimingEvent[]): number;
  
  // 同期信号の生成
  generateSyncMarkers(
    clockEvents: TimingEvent[],
    timeWindow: TimeWindow
  ): TimingEvent[];
}

class ClockTimingCapture implements ClockEventCapture {
  captureClockEdges(clockGates: ClockGate[]): TimingEvent[] {
    const events: TimingEvent[] = [];
    const currentTime = performance.now();
    
    clockGates.forEach(gate => {
      // CLOCK状態の変化をイベントとして記録
      const event: TimingEvent = {
        id: generateEventId(),
        time: currentTime,
        gateId: gate.id,
        pinType: 'output',
        pinIndex: 0,
        value: gate.output,
        source: 'clock-tick',
        metadata: {
          gateType: 'CLOCK',
          period: gate.period || 50 // ms
        }
      };
      events.push(event);
    });
    
    return events;
  }
  
  detectClockPeriod(events: TimingEvent[]): number {
    const clockEvents = events.filter(e => e.source === 'clock-tick');
    if (clockEvents.length < 2) return 50; // デフォルト
    
    const risingEdges = clockEvents.filter(e => e.value === true);
    if (risingEdges.length < 2) return 50;
    
    const periods = [];
    for (let i = 1; i < risingEdges.length; i++) {
      periods.push(risingEdges[i].time - risingEdges[i-1].time);
    }
    
    // 平均周期を返す
    return periods.reduce((sum, p) => sum + p, 0) / periods.length;
  }
}
```

## 🗄️ Zustand Store設計

```typescript
interface TimingChartSlice {
  // 状態
  timingChart: TimingChartState;
  
  // アクション
  actions: {
    // パネル制御
    togglePanel: () => void;
    setPanelHeight: (height: number) => void;
    
    // トレース管理
    addTrace: (gateId: string, pinType: 'input' | 'output', pinIndex?: number) => void;
    removeTrace: (traceId: string) => void;
    updateTraceColor: (traceId: string, color: string) => void;
    toggleTraceVisibility: (traceId: string) => void;
    clearAllTraces: () => void;
    
    // 時間軸制御
    setTimeWindow: (window: TimeWindow) => void;
    setTimeScale: (scale: TimeScale) => void;
    zoomIn: (centerTime?: TimeMs) => void;
    zoomOut: (centerTime?: TimeMs) => void;
    panTo: (centerTime: TimeMs) => void;
    resetView: () => void;
    
    // カーソル制御
    setCursor: (time: TimeMs) => void;
    hideCursor: () => void;
    
    // イベント処理
    processTimingEvents: (events: TimingEvent[]) => void;
    
    // 設定
    updateSettings: (settings: Partial<TimingChartSettings>) => void;
    
    // データ管理
    exportData: (format: 'csv' | 'vcd' | 'json') => string;
    importData: (data: string, format: 'csv' | 'vcd' | 'json') => void;
  };
}

// Zustand store実装
const createTimingChartSlice: StateCreator<
  RootState,
  [],
  [],
  TimingChartSlice
> = (set, get) => ({
  timingChart: {
    isVisible: false,
    panelHeight: 300,
    timeWindow: { start: 0, end: 1000 },
    timeScale: 'ms',
    autoScale: true,
    traces: [],
    maxTraces: 10,
    settings: {
      theme: 'dark',
      gridVisible: true,
      clockHighlightEnabled: true,
      edgeMarkersEnabled: true,
      signalLabelsVisible: true,
      autoCapture: true,
      captureDepth: 10000,
      updateInterval: 16 // 60fps
    }
  },
  
  actions: {
    togglePanel: () => set(state => ({
      timingChart: {
        ...state.timingChart,
        isVisible: !state.timingChart.isVisible
      }
    })),
    
    addTrace: (gateId, pinType, pinIndex = 0) => set(state => {
      const existingTrace = state.timingChart.traces.find(
        t => t.gateId === gateId && t.pinType === pinType && t.pinIndex === pinIndex
      );
      
      if (existingTrace) return state; // 既に存在する場合は追加しない
      
      const newTrace: TimingTrace = {
        id: generateTraceId(),
        gateId,
        pinType,
        pinIndex,
        name: generateTraceName(gateId, pinType, pinIndex),
        color: assignTraceColor(state.timingChart.traces.length),
        visible: true,
        events: [],
        metadata: {
          gateType: getGateType(gateId, state)
        }
      };
      
      return {
        timingChart: {
          ...state.timingChart,
          traces: [...state.timingChart.traces, newTrace]
        }
      };
    }),
    
    processTimingEvents: (events) => set(state => {
      const updatedTraces = state.timingChart.traces.map(trace => {
        const relevantEvents = events.filter(
          e => e.gateId === trace.gateId && 
               e.pinType === trace.pinType && 
               e.pinIndex === trace.pinIndex
        );
        
        if (relevantEvents.length === 0) return trace;
        
        const mergedEvents = [...trace.events, ...relevantEvents]
          .sort((a, b) => a.time - b.time)
          .slice(-state.timingChart.settings.captureDepth); // 制限を適用
        
        return {
          ...trace,
          events: mergedEvents
        };
      });
      
      return {
        timingChart: {
          ...state.timingChart,
          traces: updatedTraces
        }
      };
    }),
    
    // その他のアクション実装...
  }
});
```

## ⚡ パフォーマンス最適化

### イベントバッファリング
```typescript
class TimingEventBuffer {
  private buffer: TimingEvent[] = [];
  private flushTimer?: number;
  private readonly batchSize = 100;
  private readonly flushInterval = 16; // 60fps
  
  addEvent(event: TimingEvent): void {
    this.buffer.push(event);
    
    if (this.buffer.length >= this.batchSize) {
      this.flush();
    } else if (!this.flushTimer) {
      this.flushTimer = window.setTimeout(() => this.flush(), this.flushInterval);
    }
  }
  
  private flush(): void {
    if (this.buffer.length === 0) return;
    
    const events = [...this.buffer];
    this.buffer = [];
    
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = undefined;
    }
    
    // Zustand storeに一括送信
    useCircuitStore.getState().timingChart.actions.processTimingEvents(events);
  }
}
```

### データ圧縮・間引き
```typescript
class WaveformDataOptimizer {
  // 時間窓外のデータを削除
  pruneOutsideWindow(events: TimingEvent[], window: TimeWindow): TimingEvent[] {
    return events.filter(e => e.time >= window.start && e.time <= window.end);
  }
  
  // 重複する値の連続を間引き
  compressRedundantEvents(events: TimingEvent[]): TimingEvent[] {
    if (events.length <= 1) return events;
    
    const compressed: TimingEvent[] = [events[0]];
    
    for (let i = 1; i < events.length; i++) {
      const current = events[i];
      const previous = compressed[compressed.length - 1];
      
      // 値が変化した場合のみ保持
      if (current.value !== previous.value) {
        compressed.push(current);
      }
    }
    
    return compressed;
  }
  
  // LOD（Level of Detail）生成
  generateLOD(events: TimingEvent[], timeScale: TimeScale): WaveformLOD {
    const level = this.getLODLevel(timeScale);
    
    switch (level) {
      case 'high':
        return { level, segments: this.eventsToSegments(events) };
      
      case 'medium':
        const decimated = this.decimateEvents(events, 2);
        return { 
          level, 
          segments: this.eventsToSegments(decimated),
          aggregatedEvents: events.length - decimated.length
        };
      
      case 'low':
        const majorEvents = this.extractMajorEvents(events);
        return { 
          level, 
          segments: this.eventsToSegments(majorEvents),
          aggregatedEvents: events.length - majorEvents.length
        };
    }
  }
  
  private getLODLevel(timeScale: TimeScale): 'high' | 'medium' | 'low' {
    // 時間スケールに応じた詳細度決定
    // 実装は要件定義で定義済み
  }
}
```

## 📡 データフロー設計

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   回路評価      │───▶│ イベント捕捉    │───▶│ イベントバッファ │
│ (coreAPI)       │    │ (TimingCapture) │    │   (Batching)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ 波形レンダリング │◀───│   データ最適化   │◀───│ Zustand Store   │
│  (Canvas/SVG)   │    │ (LOD/Compress)  │    │  (State Mgmt)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

**この設計により、高性能でスケーラブルなタイミングチャート機能を実現します！** 📊⚡
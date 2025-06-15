# 🎨 タイミングチャート UI/UX設計

## 🖼️ 全体レイアウト設計

### メインレイアウト
```
┌─────────────────────────────────────────────────────────────┐
│ ヘッダー（モード選択、ツールバー）                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                キャンバス（回路図）                         │
│                                                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ 📊 [タイミングチャート] ▼                                  │ ← 展開ボタン
├─────────────────────────────────────────────────────────────┤
│ タイミングチャートパネル（展開時のみ表示）                  │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ 📊 タイミングチャート                    [🗙] [⚙️] [📷] │ │
│ ├─────────┬─────────────────────────────────────────────────┤ │
│ │ 信号名   │ 波形表示エリア                                │ │
│ ├─────────┼─────────────────────────────────────────────────┤ │
│ │ CLK     │ ┌─┐     ┌─┐     ┌─┐     ┌─┐               │ │
│ │ INPUT1  │   ─────┐       ┌─────────┐                   │ │
│ │ INPUT2  │         ─┐   ┌─┘         ─┐                 │ │
│ │ AND_OUT │           ┌───┘             ┌─────────        │ │
│ ├─────────┼─────────────────────────────────────────────────┤ │
│ │ 時間軸   │ 0ms    50ms   100ms   150ms   200ms         │ │
│ └─────────┴─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🎛️ コンポーネント設計

### 1. TimingChartPanel（メインパネル）
```tsx
interface TimingChartPanelProps {
  isVisible: boolean;
  onToggle: () => void;
  height?: number; // パネル高さ（調整可能）
}

// 主要機能
- 展開/折りたたみアニメーション
- パネル高さの調整（ドラッグで200px-600px）
- 全体の制御（表示/非表示、設定等）
```

### 2. WaveformCanvas（波形描画エリア）
```tsx
interface WaveformCanvasProps {
  traces: TimingTrace[];
  timeWindow: TimeWindow;
  cursor?: number;
  onCursorMove?: (time: number) => void;
  onSignalSelect?: (traceId: string) => void;
}

// 主要機能
- SVG/Canvasベースの高性能波形描画
- リアルタイム更新
- ズーム・パン操作
- 時間カーソル表示
```

### 3. SignalList（信号一覧）
```tsx
interface SignalListProps {
  traces: TimingTrace[];
  onRemoveTrace: (traceId: string) => void;
  onTraceColorChange: (traceId: string, color: string) => void;
}

// 主要機能
- 追加された信号の一覧表示
- 信号の色変更
- 信号の削除
- 信号名の編集
```

### 4. TimeAxis（時間軸）
```tsx
interface TimeAxisProps {
  timeWindow: TimeWindow;
  scale: TimeScale;
  onScaleChange: (scale: TimeScale) => void;
  clockPeriod?: number; // CLOCKの周期
}

// 主要機能
- 時間目盛りの表示
- スケール切り替え（μs/ms/s）
- CLOCK周期の表示
- スクロール・ズーム操作
```

### 5. TimeCursor（時間カーソル）
```tsx
interface TimeCursorProps {
  position: number; // 時間位置
  visible: boolean;
  onMove: (time: number) => void;
  signalValues?: Record<string, boolean>; // カーソル位置での信号値
}

// 主要機能
- 縦線カーソル表示
- ドラッグで時間移動
- カーソル位置での信号値表示
- ツールチップ表示
```

## 🎨 視覚デザイン

### カラーパレット
```css
:root {
  /* タイミングチャート専用色 */
  --timing-bg: #1a1a1a;           /* 背景色（ダーク） */
  --timing-grid: #333333;         /* グリッド線 */
  --timing-text: #e0e0e0;         /* テキスト */
  --timing-cursor: #ff6b6b;       /* 時間カーソル */
  
  /* 信号波形色（8色セット） */
  --signal-1: #00ff88;            /* 緑（アクティブ色） */
  --signal-2: #88ddff;            /* 水色 */
  --signal-3: #ffaa00;            /* オレンジ */
  --signal-4: #ff6b9d;            /* ピンク */
  --signal-5: #c471ed;            /* 紫 */
  --signal-6: #12d8fa;            /* 青 */
  --signal-7: #f093fb;            /* ライトピンク */
  --signal-8: #ffeaa7;            /* イエロー */
  
  /* CLOCK専用色 */
  --clock-signal: #ffd700;        /* ゴールド */
}
```

### 波形スタイル
```css
.waveform {
  stroke-width: 2px;
  fill: none;
  
  /* ハイ/ロー状態の明確な表現 */
  &.high-level {
    stroke: var(--signal-color);
  }
  
  &.low-level {
    stroke: var(--signal-color);
    opacity: 0.7;
  }
  
  /* 立ち上がり/立ち下がりエッジ */
  &.rising-edge,
  &.falling-edge {
    stroke-width: 3px;
  }
}

.time-grid {
  stroke: var(--timing-grid);
  stroke-width: 1px;
  stroke-dasharray: 2,2;
}

.time-cursor {
  stroke: var(--timing-cursor);
  stroke-width: 2px;
  pointer-events: none;
}
```

## 📱 レスポンシブ設計

### デスクトップ（1024px以上）
```css
.timing-chart-panel {
  height: 300px;                 /* デフォルト高さ */
  min-height: 200px;
  max-height: 600px;
  resize: vertical;               /* 高さ調整可能 */
}

.signal-list {
  width: 120px;                  /* 信号名エリア */
  min-width: 100px;
}

.waveform-area {
  flex: 1;                       /* 残り全体を使用 */
  min-width: 400px;
}
```

### タブレット（768px-1023px）
```css
.timing-chart-panel {
  height: 250px;
  max-height: 400px;
}

.signal-list {
  width: 100px;
}

.time-axis {
  font-size: 12px;              /* 小さめフォント */
}
```

### モバイル（767px以下）
```css
.timing-chart-panel {
  height: 200px;
  max-height: 300px;
}

.signal-list {
  width: 80px;
  font-size: 11px;
}

.waveform-area {
  min-width: 250px;
  overflow-x: scroll;            /* 横スクロール */
}

/* タッチ操作最適化 */
.touch-target {
  min-width: 44px;
  min-height: 44px;
}
```

## 🎮 操作設計

### 信号追加フロー
1. **回路でゲートをクリック** → 信号選択ダイアログ表示
2. **信号を選択** → タイミングチャートに波形追加
3. **自動色割り当て** → 8色から自動選択
4. **即座に波形表示** → リアルタイム更新開始

### 時間軸操作
```typescript
// ズーム操作
const handleWheel = (e: WheelEvent) => {
  if (e.ctrlKey) {
    // Ctrl+ホイール: ズーム
    const zoomFactor = e.deltaY > 0 ? 0.8 : 1.2;
    setTimeScale(prev => prev * zoomFactor);
  } else {
    // ホイール: 横スクロール
    const scrollDelta = e.deltaX || e.deltaY;
    setTimeWindow(prev => ({
      start: prev.start + scrollDelta,
      end: prev.end + scrollDelta
    }));
  }
};

// パン操作（ドラッグ）
const handleMouseDown = (e: MouseEvent) => {
  setIsPanning(true);
  setPanStart({ x: e.clientX, timeStart: timeWindow.start });
};
```

### 時間カーソル操作
```typescript
// カーソル移動
const handleCursorMove = (e: MouseEvent) => {
  const rect = canvasRef.current.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const time = (x / rect.width) * (timeWindow.end - timeWindow.start) + timeWindow.start;
  setCursorTime(time);
  
  // カーソル位置での信号値を計算
  const signalValues = calculateSignalValuesAtTime(time);
  setCurrentSignalValues(signalValues);
};
```

## 🎪 アニメーション設計

### パネル展開/折りたたみ
```css
.timing-panel {
  transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.timing-panel.collapsed {
  height: 0;
}

.timing-panel.expanded {
  height: var(--panel-height);
}
```

### 波形描画アニメーション
```css
.waveform-path {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: drawWaveform 1s ease-out forwards;
}

@keyframes drawWaveform {
  to {
    stroke-dashoffset: 0;
  }
}
```

### 信号追加フェードイン
```css
.signal-trace.new {
  opacity: 0;
  transform: translateY(10px);
  animation: fadeInUp 0.3s ease-out forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## ⚡ パフォーマンス考慮

### 仮想化（大量データ対応）
```typescript
// 表示範囲内のイベントのみ描画
const getVisibleEvents = (trace: TimingTrace, timeWindow: TimeWindow) => {
  return trace.events.filter(event => 
    event.time >= timeWindow.start && 
    event.time <= timeWindow.end
  );
};

// LOD（Level of Detail）: ズームレベルに応じた詳細度調整
const getLODLevel = (timeScale: number) => {
  if (timeScale > 1000) return 'low';    // 大きいスケール: 概要のみ
  if (timeScale > 100) return 'medium';  // 中スケール: 適度な詳細
  return 'high';                         // 小スケール: 全詳細
};
```

### Canvas最適化
```typescript
// オフスクリーンCanvas使用
const useOffscreenCanvas = () => {
  const offscreenCanvas = new OffscreenCanvas(width, height);
  const ctx = offscreenCanvas.getContext('2d');
  
  // バックグラウンドで波形描画
  const drawWaveformOffscreen = (trace: TimingTrace) => {
    // 描画処理...
    return offscreenCanvas.transferToImageBitmap();
  };
  
  return { drawWaveformOffscreen };
};
```

## 🧪 アクセシビリティ

### キーボード操作
```typescript
const keyboardShortcuts = {
  'ArrowLeft': () => moveCursor(-timeStep),
  'ArrowRight': () => moveCursor(timeStep),
  'Space': () => togglePlayback(),
  'Home': () => setCursorTime(0),
  'End': () => setCursorTime(totalTime),
  '+': () => zoomIn(),
  '-': () => zoomOut(),
};
```

### スクリーンリーダー対応
```jsx
<div role="application" aria-label="タイミングチャート">
  <div role="grid" aria-label="波形表示">
    {traces.map(trace => (
      <div key={trace.id} role="row" aria-label={`信号 ${trace.name}`}>
        <div role="gridcell" aria-label={`現在値: ${getCurrentValue(trace)}`}>
          {/* 波形表示 */}
        </div>
      </div>
    ))}
  </div>
</div>
```

---

**この設計に基づいて、革新的で使いやすいタイミングチャートUIを実装します！** 🎨✨
/**
 * タイミングチャートの波形キャンバス（プレースホルダー実装）
 */

import React from 'react';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import type { TimingTrace, TimeWindow, TimeScale, TimingChartSettings, TimingEvent } from '@/types/timing';
import { useCircuitStore } from '@/stores/circuitStore';

interface WaveformCanvasProps {
  traces: TimingTrace[];
  timeWindow: TimeWindow;
  timeScale: TimeScale;
  settings: TimingChartSettings;
  className?: string;
}

export const WaveformCanvas: React.FC<WaveformCanvasProps> = ({
  traces,
  timeWindow,
  timeScale,
  settings,
  className = ''
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = React.useState({ width: 800, height: 400 });
  
  // Circuit store
  const { gates } = useCircuitStore();
  
  // シミュレーション状態をCLOCKゲートの存在で判定
  const isSimulationRunning = React.useMemo(() => {
    return gates.some(gate => gate.type === 'CLOCK');
  }, [gates]);

  // シンプル化：一時停止機能削除

  // キャンバスのリサイズ（高DPI対応）
  React.useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current?.parentElement) {
        const rect = canvasRef.current.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        // 最小サイズを保証
        const width = Math.max(rect.width, 100);
        const height = Math.max(rect.height, 100);
        
        // 高DPI対応でより鮮明な描画
        setDimensions({ 
          width: width * dpr, 
          height: height * dpr 
        });
        
        if (canvasRef.current) {
          canvasRef.current.style.width = `${width}px`;
          canvasRef.current.style.height = `${height}px`;
        }
      } else {
        // 親要素がない場合のフォールバック
        setDimensions({ width: 800, height: 400 });
      }
    };

    // 初期化時に遅延を設けてDOMが準備されるのを待つ
    setTimeout(updateDimensions, 100);
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // シンプル化：複雑なリアルタイム更新ループ削除

  // 波形の描画（プロフェッショナル品質）
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn('WaveformCanvas: Canvas element not found');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.warn('WaveformCanvas: Canvas context not available');
      return;
    }
    
    console.log('WaveformCanvas: Drawing with', {
      traces: traces.length,
      traceNames: traces.map(t => t.name),
      timeWindow,
      dimensions
    });
    
    // トレースの詳細情報をログ出力
    traces.forEach((trace, i) => {
      console.log(`WaveformCanvas: Trace ${i} (${trace.name}):`, {
        gateId: trace.gateId,
        events: trace.events.length,
        eventTimes: trace.events.map(e => `${e.time}ms=${e.value}`).slice(0, 5), // 最初の5つ
        visible: trace.visible,
        color: trace.color
      });
    });

      // キャンバスクリアと高DPI対応のスケーリング
    const dpr = window.devicePixelRatio || 1;
    console.log('WaveformCanvas: Clearing canvas and setting DPR', dpr);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // save/restoreがJSDOMで利用できない場合があるため、条件付きで実行
    const hasSaveRestore = typeof ctx.save === 'function' && typeof ctx.restore === 'function';
    if (hasSaveRestore) {
      ctx.save();
    }
    ctx.scale(dpr, dpr);

    // プロフェッショナル品質描画設定
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 描画領域計算
    const drawWidth = dimensions.width / dpr;
    const drawHeight = dimensions.height / dpr;
    
    console.log('WaveformCanvas: Canvas dimensions', { 
      width: drawWidth, 
      height: drawHeight, 
      dpr,
      rawDimensions: dimensions
    });
    
    if (drawWidth <= 0 || drawHeight <= 0) {
      console.error('WaveformCanvas: Invalid canvas dimensions', { drawWidth, drawHeight });
      return;
    }

    // 背景クリア（見やすいダークグレー背景）
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, drawWidth, drawHeight);
    console.log('WaveformCanvas: Background filled with #2a2a2a');
    
    // デバッグ：キャンバスが正しく描画されているか確認
    if (drawWidth <= 0 || drawHeight <= 0) {
      console.warn('WaveformCanvas: Invalid canvas dimensions', { drawWidth, drawHeight, dimensions });
      return;
    }

    // 高品質グリッド描画
    console.log('WaveformCanvas: Drawing grid');
    drawTimingGrid(ctx, drawWidth, drawHeight, timeWindow, timeScale);

    // 波形レイアウト計算
    const totalSignals = Math.max(traces.length, 1);
    const signalHeight = drawHeight / totalSignals;
    const waveformAmplitude = Math.min(signalHeight * 0.35, 24);
    const edgeTransitionWidth = 3; // エッジの遷移幅

    // 信号区切り線（改善版）
    console.log('WaveformCanvas: Drawing signal separators for', totalSignals, 'signals');
    drawSignalSeparators(ctx, drawWidth, drawHeight, totalSignals, signalHeight);

    // 各トレースのシンプル描画
    traces.forEach((trace, index) => {
      const centerY = (index + 0.5) * signalHeight;
      drawSimpleWaveform(
        ctx, 
        trace, 
        centerY, 
        waveformAmplitude,
        drawWidth, 
        timeWindow
      );
    });

    // トレースがない場合のエレガントなデモ波形
    if (traces.length === 0) {
      console.log('WaveformCanvas: Drawing demo waveform');
      drawDemoWaveform(ctx, signalHeight, waveformAmplitude, drawWidth);
    } else {
      console.log('WaveformCanvas: Drawing', traces.length, 'traces');
      
      // CLOCK同期のための視覚的ヒント（シンプルな時間マーカー）
      if (traces.some(t => t.name === 'CLK')) {
        drawClockSyncMarkers(ctx, drawWidth, drawHeight, timeWindow);
      }
    }

    // シンプル化：複雑なリアルタイムカーソーとFPS表示削除
    
    // スケール状態をリストア（可能な場合のみ）
    if (hasSaveRestore) {
      ctx.restore();
    }
  }, [traces, timeWindow, dimensions, timeScale, isSimulationRunning, settings.autoCapture]);

  // === プロフェッショナル品質描画ヘルパー関数 ===

  const drawTimingGrid = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    timeWindow: TimeWindow,
    timeScale: TimeScale
  ) => {
    const duration = timeWindow.end - timeWindow.start;
    
    // 主要グリッド線（時間軸）
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.5)';
    ctx.lineWidth = 1;
    
    const majorGridCount = 10;
    const majorInterval = width / majorGridCount;
    for (let i = 0; i <= majorGridCount; i++) {
      const x = i * majorInterval;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // 補助グリッド線
    ctx.strokeStyle = 'rgba(60, 60, 60, 0.3)';
    ctx.lineWidth = 0.5;
    
    const minorGridCount = majorGridCount * 5;
    const minorInterval = width / minorGridCount;
    for (let i = 0; i <= minorGridCount; i++) {
      if (i % 5 !== 0) { // 主要線と重複しない
        const x = i * minorInterval;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
    }
  };

  const drawSignalSeparators = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    totalSignals: number,
    signalHeight: number
  ) => {
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.5)';
    ctx.lineWidth = 1;
    
    for (let i = 1; i < totalSignals; i++) {
      const y = i * signalHeight;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const drawSimpleWaveform = (
    ctx: CanvasRenderingContext2D,
    trace: TimingTrace,
    centerY: number,
    amplitude: number,
    width: number,
    timeWindow: TimeWindow
  ) => {
    console.log('🎨 Drawing optimized waveform for trace:', trace.name, 'events:', trace.events.length);
    
    // 🌟 最適化：時間窓前後のイベントも考慮して連続性を保つ
    const windowDuration = timeWindow.end - timeWindow.start;
    const extendedStart = timeWindow.start - windowDuration * 0.1; // 10%余裕
    const extendedEnd = timeWindow.end + windowDuration * 0.1;
    
    // 関連するすべてのイベントを取得（時間窓外も含む）
    const relevantEvents = trace.events.filter(
      event => event.time >= extendedStart && event.time <= extendedEnd
    );
    
    console.log(`🎨 Trace ${trace.name}: ${relevantEvents.length} relevant events in extended window [${extendedStart}-${extendedEnd}]`);

    // 描画スタイル設定
    ctx.strokeStyle = trace.color || '#00ff88';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 0;
    ctx.lineCap = 'square'; // エッジを鮮明に
    ctx.lineJoin = 'miter';
    ctx.beginPath();
    
    // 🎯 初期値の正確な計算
    let currentValue = false; // デフォルトはLOW
    
    // 時間窓開始前の最後のイベントから初期値を決定
    const eventsBeforeWindow = trace.events.filter(event => event.time < timeWindow.start);
    if (eventsBeforeWindow.length > 0) {
      const lastEventBeforeWindow = eventsBeforeWindow[eventsBeforeWindow.length - 1];
      currentValue = Boolean(lastEventBeforeWindow.value);
      console.log(`🎯 Initial value from previous event (${lastEventBeforeWindow.time}ms): ${currentValue}`);
    }
    
    // 開始点の描画
    const initialY = currentValue ? centerY - amplitude : centerY + amplitude;
    ctx.moveTo(0, initialY);
    console.log(`🎯 Starting at Y=${initialY} (value=${currentValue})`);

    // 🌟 時間窓内のイベントを処理
    const visibleEvents = relevantEvents.filter(
      event => event.time >= timeWindow.start && event.time <= timeWindow.end
    );
    
    console.log(`🎨 Processing ${visibleEvents.length} visible events`);
    
    visibleEvents.forEach((event, index) => {
      const eventX = ((event.time - timeWindow.start) / (timeWindow.end - timeWindow.start)) * width;
      const newValue = Boolean(event.value);
      
      console.log(`🎯 Event ${index}: time=${event.time}ms, X=${eventX}px, value=${newValue}`);
      
      // エッジ遷移の処理
      if (currentValue !== newValue) {
        // 現在値から新しい値への遷移
        const currentY = currentValue ? centerY - amplitude : centerY + amplitude;
        const targetY = newValue ? centerY - amplitude : centerY + amplitude;
        
        // 水平線を引いてからエッジ
        ctx.lineTo(eventX, currentY);
        // 垂直エッジ
        ctx.lineTo(eventX, targetY);
        
        currentValue = newValue;
        console.log(`🔄 Edge transition at X=${eventX}: ${!newValue} -> ${newValue}`);
      } else {
        // 値が変わらない場合は水平線のみ
        const currentY = currentValue ? centerY - amplitude : centerY + amplitude;
        ctx.lineTo(eventX, currentY);
      }
    });

    // 🌟 最終点まで延長（現在値を維持）
    const finalY = currentValue ? centerY - amplitude : centerY + amplitude;
    ctx.lineTo(width, finalY);
    console.log(`🎯 Ending at Y=${finalY} (value=${currentValue})`);
    
    // 描画実行
    ctx.stroke();
    
    // 🔍 デバッグ：波形の範囲を可視化（開発時のみ）
    if (false) { // デバッグ時は true に
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, centerY - amplitude - 5);
      ctx.lineTo(width, centerY - amplitude - 5);
      ctx.moveTo(0, centerY + amplitude + 5);
      ctx.lineTo(width, centerY + amplitude + 5);
      ctx.stroke();
    }
  };

  // シンプル化：エッジマーカー削除

  const drawDemoWaveform = (
    ctx: CanvasRenderingContext2D,
    signalHeight: number,
    amplitude: number,
    width: number
  ) => {
    console.log('Drawing demo waveform with dimensions:', { signalHeight, amplitude, width });
    const centerY = signalHeight / 2;
    
    // シンプルで鮮明なデモクロック波形
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.shadowBlur = 0; // シャドウ無効化で鮮明に
    
    ctx.beginPath();
    let isHigh = false;
    ctx.moveTo(0, centerY + amplitude);
    
    const period = 100; // デモクロック周期（実際のCLOCK周期100msに合わせる）
    for (let x = 0; x < width; x += period) {
      const y = isHigh ? centerY - amplitude : centerY + amplitude;
      ctx.lineTo(x, y);
      ctx.lineTo(x + period/2, y);
      
      const nextY = isHigh ? centerY + amplitude : centerY - amplitude;
      ctx.lineTo(x + period/2, nextY);
      ctx.lineTo(x + period, nextY);
      
      isHigh = !isHigh;
    }
    
    ctx.stroke();
    
    // デモラベル（改善版）
    ctx.fillStyle = 'rgba(102, 102, 102, 0.8)';
    ctx.font = 'bold 11px -apple-system, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🕐 CLOCKゲートを配置すると波形が表示されます', 15, centerY - amplitude - 15);
  };

  // CLOCK同期の視覚的マーカー
  const drawClockSyncMarkers = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    timeWindow: TimeWindow
  ) => {
    // 100ms周期のCLOCKに合わせて50ms間隔でマーカー（エッジを強調）
    const duration = timeWindow.end - timeWindow.start;
    const markerInterval = 50; // CLOCKの半周期（エッジマーカー）
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    
    for (let time = timeWindow.start; time <= timeWindow.end; time += markerInterval) {
      const x = ((time - timeWindow.start) / duration) * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    ctx.setLineDash([]); // リセット
  };

  // シンプル化：リアルタイムカーソー削除

  return (
    <div className={`waveform-canvas ${className}`} style={{ position: 'relative', width: '100%', height: '100%', minHeight: '200px', border: '1px solid rgba(0, 255, 136, 0.2)' }}>
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ 
          width: '100%', 
          height: '100%',
          backgroundColor: '#1a1a1a',
          border: '1px solid rgba(0, 255, 136, 0.1)'
        }}
      />
      
      {/* 横長レイアウト用のコンパクトなオーバーレイ */}
      {traces.length === 0 && (
        <div className="waveform-empty-overlay">
          <div className="empty-message">
            <ChartBarIcon className="empty-icon" />
            <p>CLOCKゲートを配置すると波形が表示されます</p>
          </div>
        </div>
      )}
      
      {/* シンプル化：一時停止ボタンとデバッグ情報削除 */}
    </div>
  );
};

// 横長レイアウト用のWaveformCanvasスタイル
const styles = `
.waveform-canvas {
  width: 100%;
  height: 100%;
  min-height: 200px;
  background: #1a1a1a;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(0, 255, 136, 0.2);
}

.waveform-canvas canvas {
  background: transparent;
  width: 100%;
  height: 100%;
}

/* 空の状態のオーバーレイ - 中央配置 */
.waveform-empty-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 10;
}

.waveform-empty-overlay .empty-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  color: var(--color-text-tertiary);
  text-align: center;
}

.waveform-empty-overlay .empty-icon {
  width: 48px;
  height: 48px;
  color: var(--color-primary-border);
  opacity: 0.5;
}

.waveform-empty-overlay p {
  font-size: var(--font-size-sm);
  margin: 0;
  color: var(--color-text-secondary);
}

/* プロフェッショナルデバッグ情報パネル */
.waveform-debug-info {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  background: rgba(8, 8, 8, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 255, 136, 0.2);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-sm);
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
  font-size: 10px;
  z-index: 15;
  max-width: 220px;
  min-width: 180px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.waveform-debug-info .debug-section {
  margin-bottom: var(--spacing-xs);
}

.waveform-debug-info .debug-section:last-child {
  margin-bottom: 0;
}

.waveform-debug-info .debug-title {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  padding-bottom: 2px;
  border-bottom: 1px solid rgba(0, 255, 136, 0.1);
}

.waveform-debug-info .debug-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin: 2px 0;
  padding: 1px 0;
}

.waveform-debug-info .debug-label {
  color: rgba(255, 255, 255, 0.6);
  min-width: 35px;
  font-size: 9px;
}

.waveform-debug-info .debug-value {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  margin-left: auto;
}

.waveform-debug-info .performance-fps {
  color: var(--color-primary);
  font-weight: 600;
}

.waveform-debug-info .debug-trace-name {
  color: rgba(255, 255, 255, 0.8);
  font-size: 9px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.waveform-debug-info .debug-more {
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
  font-size: 8px;
  margin-left: 12px;
}

.waveform-debug-info .trace-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 4px currentColor;
}

/* 一時停止ボタン */
.waveform-controls {
  position: absolute;
  top: var(--spacing-sm);
  left: var(--spacing-sm);
  z-index: 20;
}

.pause-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: var(--border-radius-md);
  color: rgba(255, 255, 255, 0.9);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.pause-button:hover {
  background: rgba(0, 0, 0, 0.9);
  border-color: rgba(0, 255, 136, 0.6);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}

.pause-button.running {
  border-color: rgba(255, 165, 0, 0.4);
}

.pause-button.running:hover {
  border-color: rgba(255, 165, 0, 0.7);
  color: rgba(255, 165, 0, 1);
}

.pause-button.paused {
  border-color: rgba(0, 255, 136, 0.4);
}

.pause-button.paused:hover {
  border-color: rgba(0, 255, 136, 0.7);
  color: rgba(0, 255, 136, 1);
}

.pause-button .button-text {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
`;

// スタイルの注入
if (typeof window !== 'undefined' && !document.querySelector('#waveform-canvas-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'waveform-canvas-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
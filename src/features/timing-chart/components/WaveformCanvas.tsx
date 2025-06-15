/**
 * タイミングチャートの波形キャンバス（プレースホルダー実装）
 */

import React from 'react';
import { 
  ChartBarIcon, 
  PlayIcon, 
  PauseIcon 
} from '@heroicons/react/24/outline';
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
  const lastRenderTimeRef = React.useRef(0);
  const animationFrameRef = React.useRef<number | null>(null);
  const lastUpdateTimeRef = React.useRef(0);
  
  // Circuit store for real-time synchronization
  const { gates, wires, timingChart, timingChartActions } = useCircuitStore();
  const currentTime = React.useRef(performance.now());
  
  // シミュレーション状態をCLOCKゲートの存在で判定
  const isSimulationRunning = React.useMemo(() => {
    return gates.some(gate => gate.type === 'CLOCK');
  }, [gates]);

  // 一時停止ボタンハンドラー
  const handleTogglePause = React.useCallback(() => {
    timingChartActions.togglePause();
  }, [timingChartActions]);

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

  // リアルタイム更新ループ（シミュレーション実行中のみ）
  React.useEffect(() => {
    // 前回のアニメーションフレームをクリーンアップ
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (!settings.autoCapture || !isSimulationRunning || timingChart.isPaused) {
      return;
    }

    let isActive = true;
    const updateRealTime = () => {
      if (!isActive) return;
      
      const now = performance.now();
      currentTime.current = now;
      
      
      // 時間窓の自動スクロール処理（2000ms間隔で制限 - 1/4に減速）
      if (timingChartActions && settings.autoCapture && now - lastUpdateTimeRef.current > 2000) {
        const windowWidth = timeWindow.end - timeWindow.start;
        const scrollThreshold = timeWindow.start + windowWidth * 0.8;
        
        if (now > scrollThreshold) {
          lastUpdateTimeRef.current = now;
          timingChartActions.updateTimeWindowForNewEvents([{
            id: 'realtime-marker',
            time: now,
            gateId: 'system',
            pinType: 'output',
            pinIndex: 0,
            value: true
          }]);
        }
      }
      
      // 次のフレームをスケジュール（フレームレート制限）
      if (isActive && isSimulationRunning) {
        setTimeout(() => {
          if (isActive) {
            animationFrameRef.current = requestAnimationFrame(updateRealTime);
          }
        }, 50); // 20FPSに制限してちらつき防止
      }
    };

    if (isSimulationRunning) {
      animationFrameRef.current = requestAnimationFrame(updateRealTime);
      console.log('WaveformCanvas: Started real-time update loop');
    }

    return () => {
      isActive = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isSimulationRunning, settings.autoCapture, settings.updateInterval, timeWindow, timingChartActions, timingChart.isPaused]);

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

    // 各トレースの高品質描画
    traces.forEach((trace, index) => {
      const centerY = (index + 0.5) * signalHeight;
      drawProfessionalWaveform(
        ctx, 
        trace, 
        centerY, 
        waveformAmplitude, 
        edgeTransitionWidth,
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
    }

    // リアルタイムカーソル（シミュレーション実行中かつ非一時停止時）
    if (isSimulationRunning && settings.autoCapture && !timingChart.isPaused) {
      drawRealtimeCursor(ctx, currentTime.current, timeWindow, drawWidth, drawHeight);
    }

    // FPS計算と表示（修正版）
    const renderEndTime = performance.now();
    let fps = 60;
    
    if (lastRenderTimeRef.current > 0) {
      const renderDuration = renderEndTime - lastRenderTimeRef.current;
      if (renderDuration > 0 && renderDuration < 1000) { // 異常値防止
        fps = Math.round(1000 / Math.max(renderDuration, 16));
        fps = Math.min(fps, 120); // 上限設定
      }
    }
    lastRenderTimeRef.current = renderEndTime;
    
    if (traces.length > 0) {
      ctx.fillStyle = 'rgba(0, 255, 136, 0.6)';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${fps} FPS`, drawWidth - 10, 15);
    }
    
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

  const drawProfessionalWaveform = (
    ctx: CanvasRenderingContext2D,
    trace: TimingTrace,
    centerY: number,
    amplitude: number,
    edgeWidth: number,
    width: number,
    timeWindow: TimeWindow
  ) => {
    console.log('Drawing waveform for trace:', trace.name, 'events:', trace.events.length);
    
    if (trace.events.length === 0) {
      console.log('Drawing no-data line for', trace.name);
      // デフォルト状態（LOW）- 見やすい線
      ctx.strokeStyle = trace.color || '#00ff88';
      ctx.lineWidth = 3;
      ctx.shadowColor = trace.color || '#00ff88';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(0, centerY + amplitude);
      ctx.lineTo(width, centerY + amplitude);
      ctx.stroke();
      
      // "No Data"テキスト
      ctx.fillStyle = trace.color || '#00ff88';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 0;
      ctx.fillText(`${trace.name}: No Data`, width / 2, centerY);
      return;
    }

    // 波形の基本色とグラデーション
    const baseColor = trace.color;
    const glowColor = `${baseColor}60`;
    
    // メイン波形描画（明るく太く、視認性最優先）
    ctx.strokeStyle = trace.color || '#00ff88';
    ctx.lineWidth = 4;
    ctx.shadowColor = trace.color || '#00ff88';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    ctx.beginPath();
    
    let currentValue = false;
    let currentX = 0;
    
    // 初期状態
    const initialY = currentValue ? centerY - amplitude : centerY + amplitude;
    ctx.moveTo(0, initialY);

    // 時間窓内のイベントのみ処理
    const visibleEvents = trace.events.filter(
      event => event.time >= timeWindow.start && event.time <= timeWindow.end
    );

    visibleEvents.forEach((event, index) => {
      const eventX = ((event.time - timeWindow.start) / (timeWindow.end - timeWindow.start)) * width;
      const newValue = Boolean(event.value);
      
      // 水平線（現在の値を維持）
      const currentY = currentValue ? centerY - amplitude : centerY + amplitude;
      ctx.lineTo(eventX - edgeWidth/2, currentY);
      
      // エッジトランジション（スムーズな遷移）
      if (currentValue !== newValue) {
        const targetY = newValue ? centerY - amplitude : centerY + amplitude;
        
        // ベジェ曲線でスムーズなエッジ描画
        const cp1x = eventX - edgeWidth/4;
        const cp1y = currentY;
        const cp2x = eventX + edgeWidth/4;
        const cp2y = targetY;
        
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, eventX + edgeWidth/2, targetY);
        
        currentValue = newValue;
      }
      
      currentX = eventX;
    });

    // 最後まで延長
    const finalY = currentValue ? centerY - amplitude : centerY + amplitude;
    ctx.lineTo(width, finalY);
    ctx.stroke();
    
    // シャドウをクリア
    ctx.shadowBlur = 0;

    // エッジマーカー（立ち上がり/立ち下がり）
    drawEdgeMarkers(ctx, visibleEvents, centerY, amplitude, timeWindow, width);
  };

  const drawEdgeMarkers = (
    ctx: CanvasRenderingContext2D,
    events: TimingEvent[],
    centerY: number,
    amplitude: number,
    timeWindow: TimeWindow,
    width: number
  ) => {
    events.forEach((event, index) => {
      if (index === 0) return; // 最初のイベントはスキップ
      
      const eventX = ((event.time - timeWindow.start) / (timeWindow.end - timeWindow.start)) * width;
      const value = Boolean(event.value);
      const previousValue = index > 0 ? Boolean(events[index - 1].value) : false;
      
      if (value !== previousValue) {
        // エッジマーカー描画（より明るく目立つ色）
        ctx.fillStyle = value ? '#00ff88' : '#ff8866';
        ctx.shadowColor = value ? '#00ff88' : '#ff8866';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        
        if (value) {
          // 立ち上がりエッジ（上向き三角）
          ctx.moveTo(eventX - 4, centerY);
          ctx.lineTo(eventX + 4, centerY);
          ctx.lineTo(eventX, centerY - amplitude + 3);
        } else {
          // 立ち下がりエッジ（下向き三角）
          ctx.moveTo(eventX - 4, centerY);
          ctx.lineTo(eventX + 4, centerY);
          ctx.lineTo(eventX, centerY + amplitude - 3);
        }
        
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });
  };

  const drawDemoWaveform = (
    ctx: CanvasRenderingContext2D,
    signalHeight: number,
    amplitude: number,
    width: number
  ) => {
    console.log('Drawing demo waveform with dimensions:', { signalHeight, amplitude, width });
    const centerY = signalHeight / 2;
    
    // エレガントなデモクロック波形（明るく見やすく）
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 4;
    ctx.setLineDash([]);
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 10;
    
    ctx.beginPath();
    let isHigh = false;
    ctx.moveTo(0, centerY + amplitude);
    
    const period = 100; // クロック周期
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

  const drawRealtimeCursor = (
    ctx: CanvasRenderingContext2D,
    currentTime: number,
    timeWindow: TimeWindow,
    width: number,
    height: number
  ) => {
    // 現在時刻が時間窓内にある場合のみ描画
    if (currentTime < timeWindow.start || currentTime > timeWindow.end) {
      return;
    }

    const cursorX = ((currentTime - timeWindow.start) / (timeWindow.end - timeWindow.start)) * width;
    
    // リアルタイムカーソル（安定したアニメーション）
    const alpha = 0.5 + 0.2 * Math.sin(Date.now() / 500); // 低速パルス効果でちらつき軽減
    
    // 主線（明るく目立つ色）
    ctx.strokeStyle = `rgba(255, 255, 0, ${alpha + 0.3})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(cursorX, 0);
    ctx.lineTo(cursorX, height);
    ctx.stroke();
    
    // グロー効果
    ctx.strokeStyle = `rgba(255, 255, 0, ${alpha * 0.5})`;
    ctx.lineWidth = 6;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(cursorX, 0);
    ctx.lineTo(cursorX, height);
    ctx.stroke();
    
    // 時刻表示
    ctx.fillStyle = `rgba(255, 255, 0, 1)`;
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(currentTime % 10000)}ms`, cursorX, 12);
  };

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
      
      {/* 一時停止/再開ボタン */}
      {isSimulationRunning && (
        <div className="waveform-controls">
          <button
            onClick={handleTogglePause}
            className={`pause-button ${timingChart.isPaused ? 'paused' : 'running'}`}
            title={timingChart.isPaused ? 'タイミングチャートを再開' : 'タイミングチャートを一時停止'}
          >
            {timingChart.isPaused ? (
              <PlayIcon className="w-4 h-4" />
            ) : (
              <PauseIcon className="w-4 h-4" />
            )}
            <span className="button-text">
              {timingChart.isPaused ? '再開' : '一時停止'}
            </span>
          </button>
        </div>
      )}

      {/* 高度なデバッグ情報とパフォーマンス表示 */}
      {traces.length > 0 && (
        <div className="waveform-debug-info">
          <div className="debug-section">
            <div className="debug-title">📊 Performance</div>
            <div className="debug-item">
              <span className="debug-label">FPS:</span>
              <span className="debug-value performance-fps">60</span>
            </div>
            <div className="debug-item">
              <span className="debug-label">窓:</span>
              <span className="debug-value">{Math.round(timeWindow.start)}-{Math.round(timeWindow.end)}ms</span>
            </div>
            {isSimulationRunning && (
              <div className="debug-item">
                <span className="debug-label">{timingChart.isPaused ? '⏸️ 停止中' : '🟢 実行中'}</span>
                <span className="debug-value">{Math.round(currentTime.current % 10000)}ms</span>
              </div>
            )}
          </div>
          
          <div className="debug-section">
            <div className="debug-title">📈 Traces</div>
            {traces.slice(0, 3).map((trace, index) => (
              <div key={trace.id} className="debug-item">
                <div 
                  className="trace-indicator"
                  style={{ backgroundColor: trace.color }}
                />
                <span className="debug-trace-name">{trace.name}</span>
                <span className="debug-value">{trace.events.length}</span>
              </div>
            ))}
            {traces.length > 3 && (
              <div className="debug-item">
                <span className="debug-more">+{traces.length - 3} more...</span>
              </div>
            )}
          </div>
        </div>
      )}
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
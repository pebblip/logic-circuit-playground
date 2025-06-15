/**
 * タイミングチャートのメインパネルコンポーネント
 */

import React, { useCallback, useState, useRef } from 'react';
import { useCircuitStore } from '@/stores/circuitStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ChartBarIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { WaveformCanvas } from './WaveformCanvas';
import { TimeCursor } from './TimeCursor';

interface TimingChartPanelProps {
  className?: string;
}

export const TimingChartPanel: React.FC<TimingChartPanelProps> = ({ 
  className = '' 
}) => {
  const [isDraggingHeight, setIsDraggingHeight] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const resizeStartRef = useRef<{ y: number; height: number }>({ y: 0, height: 0 });

  // Zustand storeから状態とアクションを取得
  const {
    timingChart,
    timingChartActions,
    gates,
    selectedClockGateId
  } = useCircuitStore();

  const {
    isVisible,
    panelHeight,
    traces,
    timeWindow,
    timeScale,
    cursor,
    settings
  } = timingChart;

  const {
    hidePanel,
    setPanelHeight,
    setCursor,
    hideCursor
  } = timingChartActions;

  // 自動トレース作成は削除 - 明示的にユーザーが選択した場合のみ表示

  // パネル高さのリサイズハンドラ
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingHeight(true);
    resizeStartRef.current = {
      y: e.clientY,
      height: panelHeight
    };

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = resizeStartRef.current.y - e.clientY; // 上に引っ張ると高くなる
      const newHeight = Math.max(200, Math.min(600, resizeStartRef.current.height + deltaY));
      setPanelHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsDraggingHeight(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [panelHeight, setPanelHeight]);

  // 波形エリアでのマウス操作
  const handleWaveformMouseMove = useCallback((e: React.MouseEvent) => {
    if (!panelRef.current) return;

    const rect = panelRef.current.getBoundingClientRect();
    const signalListWidth = 120; // 信号リストの幅
    const x = e.clientX - rect.left - signalListWidth;
    const waveformWidth = rect.width - signalListWidth;
    
    if (x >= 0 && x <= waveformWidth) {
      const timeRatio = x / waveformWidth;
      const cursorTime = timeWindow.start + (timeWindow.end - timeWindow.start) * timeRatio;
      setCursor(cursorTime);
    }
  }, [timeWindow, setCursor]);

  const handleWaveformMouseLeave = useCallback(() => {
    hideCursor();
  }, [hideCursor]);



  // 表示設定がtrueのトレースのみ表示
  const visibleTraces = traces.filter(trace => trace.visible);

  return (
    <div className={`timing-chart-panel ${className}`}>
      {/* 横長メインパネル - 画面下部 */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={panelRef}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: `${panelHeight}px`, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="timing-chart-horizontal-panel"
          >
            {/* ヘッダー - 横長対応 */}
            <div className="timing-chart-horizontal-header">
              <div className="header-left">
                <ChartBarIcon className="icon" />
                <h3>タイミングチャート</h3>
                <span className="status-text">
                  {visibleTraces.length} traces
                </span>
              </div>
              
              <div className="header-right">
                {/* 最小限の機能 */}
                <div className="function-controls">
                  <button
                    onClick={hidePanel}
                    className="timing-chart-button"
                    title="閉じる"
                  >
                    <XMarkIcon />
                  </button>
                </div>
              </div>
            </div>

            {/* 横長コンテンツエリア */}
            <div className="timing-chart-horizontal-content">
              {/* 左：信号名リスト（狭く） */}
              <div className="timing-chart-signal-names">
                <div className="signal-names-header">信号</div>
                {visibleTraces.map(trace => (
                  <div key={trace.id} className="signal-name-item">
                    <div 
                      className="signal-color-indicator"
                      style={{ backgroundColor: trace.color }}
                    />
                    <span className="signal-name" title={trace.name}>{trace.name}</span>
                    <span className="signal-events">{trace.events.length}</span>
                  </div>
                ))}
                {visibleTraces.length === 0 && (
                  <div className="no-signals">
                    <p>まだ信号が追加されていません</p>
                    <p>ゲートを右クリックして</p>
                    <p>「タイミングチャートに追加」</p>
                    <p>を選択してください</p>
                  </div>
                )}
              </div>

              {/* 右：波形エリア（広く） */}
              <div 
                className="timing-chart-waveform-area"
                onMouseMove={handleWaveformMouseMove}
                onMouseLeave={handleWaveformMouseLeave}
              >
                <WaveformCanvas
                  traces={visibleTraces}
                  timeWindow={timeWindow}
                  timeScale={timeScale}
                  settings={settings}
                />
                
                {cursor && (
                  <TimeCursor
                    cursor={cursor}
                    timeWindow={timeWindow}
                    panelHeight={250} // 横長パネル用
                  />
                )}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// 横長タイミングチャート用の完全新設計CSS
const styles = `
.timing-chart-panel {
  position: relative;
  z-index: var(--z-panel);
}

/* 横長メインパネル - 画面下部固定 */
.timing-chart-horizontal-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-bg-secondary);
  backdrop-filter: blur(20px);
  border-top: 2px solid var(--color-primary);
  box-shadow: 0 -4px 24px rgba(0, 255, 136, 0.2);
  z-index: 20;
  display: flex;
  flex-direction: column;
}

/* 横長ヘッダー */
.timing-chart-horizontal-header {
  background: var(--color-bg-glass);
  border-bottom: 1px solid var(--color-primary-border);
  padding: var(--spacing-sm) var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  backdrop-filter: blur(10px);
  height: 50px;
  flex-shrink: 0;
}

.timing-chart-horizontal-header .header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.timing-chart-horizontal-header .header-right {
  display: flex;
  gap: var(--spacing-xs);
}

.timing-chart-horizontal-header h3 {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.timing-chart-horizontal-header .icon {
  width: 20px;
  height: 20px;
  color: var(--color-primary);
  filter: drop-shadow(0 0 4px var(--color-primary-glow));
}

.timing-chart-horizontal-header .status-text {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  background: var(--color-primary-subtle);
  padding: 2px 8px;
  border-radius: var(--border-radius-sm);
}

/* 横長コンテンツエリア */
.timing-chart-horizontal-content {
  display: flex;
  flex: 1;
  min-height: 200px;
}

/* 左：信号名リスト（適切な幅） */
.timing-chart-signal-names {
  width: 180px;
  background: rgba(30, 30, 30, 0.95);
  border-right: 2px solid rgba(100, 100, 100, 0.5);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.timing-chart-signal-names .signal-names-header {
  background: var(--color-bg-glass);
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  padding: var(--spacing-sm);
  border-bottom: 1px solid var(--color-primary-border);
  text-align: center;
}

.timing-chart-signal-names .signal-name-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border-subtle);
  gap: var(--spacing-xs);
  height: 40px; /* 固定行高 */
}

.timing-chart-signal-names .signal-color-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.timing-chart-signal-names .signal-name {
  font-size: var(--font-size-xs);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.timing-chart-signal-names .signal-events {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  font-family: monospace;
}

.timing-chart-signal-names .no-signals {
  padding: var(--spacing-lg) var(--spacing-sm);
  text-align: center;
  color: var(--color-text-tertiary);
}

.timing-chart-signal-names .no-signals p {
  font-size: var(--font-size-xs);
  margin: var(--spacing-xs) 0;
  line-height: 1.4;
}

/* 右：波形エリア（広く、残りの幅） */
.timing-chart-waveform-area {
  flex: 1;
  background: var(--color-bg-primary);
  position: relative;
  overflow: hidden;
  border-right: none;
}

/* 下：時間軸エリア */
.timing-chart-time-axis {
  height: 40px;
  background: rgba(25, 25, 25, 0.95);
  border-top: 1px solid rgba(100, 100, 100, 0.5);
  display: flex;
  flex-shrink: 0;
}

.timing-chart-time-axis .time-axis-spacer {
  width: 180px;
  background: rgba(20, 20, 20, 0.95);
  border-right: 2px solid rgba(100, 100, 100, 0.5);
  flex-shrink: 0;
}


/* ボタンスタイル */
.timing-chart-button {
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border-subtle);
  color: var(--color-text-secondary);
  padding: var(--spacing-xs);
  border-radius: var(--border-radius-md);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 32px;
  height: 32px;
}

.timing-chart-button:hover {
  background: var(--color-primary-subtle);
  border-color: var(--color-primary-border);
  color: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px var(--color-primary-subtle);
}

.timing-chart-button:active {
  transform: translateY(0);
}

.timing-chart-button svg {
  width: 16px;
  height: 16px;
}

/* ズーム制御グループ */
.zoom-controls {
  display: flex;
  gap: 4px;
  margin-right: var(--spacing-sm);
  padding-right: var(--spacing-sm);
  border-right: 1px solid var(--color-border-subtle);
}

.zoom-controls .zoom-button {
  background: var(--color-bg-glass-light);
  border: 1px solid rgba(0, 255, 136, 0.2);
  color: var(--color-primary);
}

.zoom-controls .zoom-button:hover {
  background: var(--color-primary-subtle);
  border-color: var(--color-primary-border);
  color: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: 0 2px 12px rgba(0, 255, 136, 0.4);
}

.zoom-controls .zoom-button:active {
  background: var(--color-primary-medium);
  transform: translateY(0);
}

/* 機能制御グループ */
.function-controls {
  display: flex;
  gap: var(--spacing-xs);
}

/* ツールチップ風のタイトル表示改善 */
.timing-chart-button[title]:hover::after {
  content: attr(title);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  white-space: nowrap;
  z-index: 1000;
  pointer-events: none;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .timing-chart-signal-names {
    width: 140px;
  }
  
  .timing-chart-time-axis .time-axis-spacer {
    width: 140px;
  }
  
  .timing-chart-horizontal-header {
    padding: var(--spacing-xs) var(--spacing-md);
  }
  
  .timing-chart-horizontal-header h3 {
    font-size: var(--font-size-sm);
  }
  
  .timing-chart-horizontal-header .status-text {
    display: none; /* モバイルでは非表示 */
  }
  
  .timing-chart-toggle-button {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-size-sm);
  }
  
  /* モバイル用ズーム制御最適化 */
  .zoom-controls {
    gap: 2px;
    margin-right: var(--spacing-xs);
    padding-right: var(--spacing-xs);
  }
  
  .zoom-controls .zoom-button {
    width: 36px;
    height: 36px;
    touch-action: manipulation; /* タッチ操作の改善 */
  }
  
  .function-controls {
    gap: 2px;
  }
  
  .function-controls .timing-chart-button {
    width: 36px;
    height: 36px;
    touch-action: manipulation;
  }
}

/* 超小画面（スマートフォン縦向き）での対応 */
@media (max-width: 480px) {
  .timing-chart-horizontal-header .header-left h3 {
    display: none; /* タイトルを非表示 */
  }
  
  .timing-chart-signal-names {
    width: 100px;
  }
  
  .timing-chart-time-axis .time-axis-spacer {
    width: 100px;
  }
  
  .timing-chart-signal-names .signal-name {
    font-size: 10px;
  }
  
  .timing-chart-signal-names .signal-events {
    display: none; /* イベント数を非表示 */
  }
  
  /* ズーム制御を更にコンパクトに */
  .zoom-controls .zoom-button svg,
  .function-controls .timing-chart-button svg {
    width: 14px;
    height: 14px;
  }
}
`;

// スタイルの注入
if (typeof window !== 'undefined' && !document.querySelector('#timing-chart-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'timing-chart-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
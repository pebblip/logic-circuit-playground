/**
 * タイミングチャートの時間軸コンポーネント
 */

import React, { useMemo, useCallback } from 'react';
import type {
  TimeWindow,
  TimeScale,
  TimingChartSettings,
} from '@/types/timing';
import { useCircuitStore } from '@/stores/circuitStore';
import { timingChartUtils } from '@/utils/timingChart';

interface TimeAxisProps {
  timeWindow: TimeWindow;
  timeScale: TimeScale;
  settings: TimingChartSettings;
  className?: string;
}

interface TickMark {
  position: number; // 0-1の比率
  time: number; // 実際の時間(ms)
  label: string; // 表示ラベル
  isMajor: boolean; // 主要な目盛りかどうか
}

export const TimeAxis: React.FC<TimeAxisProps> = ({
  timeWindow,
  timeScale,
  settings,
  className = '',
}) => {
  const { timingChartActions } = useCircuitStore();
  const { setTimeScale, zoomIn, zoomOut, panTo } = timingChartActions;

  // 時間軸の目盛りを計算
  const tickMarks = useMemo((): TickMark[] => {
    const duration = timeWindow.end - timeWindow.start;
    const ticks: TickMark[] = [];

    // スケールに応じた目盛り間隔を決定
    let majorInterval: number;
    let minorInterval: number;

    switch (timeScale) {
      case 'us':
        if (duration < 100) {
          majorInterval = 10; // 10μs
          minorInterval = 2; // 2μs
        } else if (duration < 1000) {
          majorInterval = 100; // 100μs
          minorInterval = 20; // 20μs
        } else {
          majorInterval = 1000; // 1ms
          minorInterval = 200; // 200μs
        }
        break;

      case 'ms':
        if (duration <= 100) {
          majorInterval = 20; // 20ms（CLOCK周期50msに適した間隔）
          minorInterval = 5; // 5ms（詳細目盛り）
        } else if (duration <= 500) {
          majorInterval = 50; // 50ms（CLOCK周期と同期）
          minorInterval = 10; // 10ms
        } else if (duration < 1000) {
          majorInterval = 100; // 100ms
          minorInterval = 20; // 20ms
        } else {
          majorInterval = 1000; // 1s
          minorInterval = 200; // 200ms
        }
        break;

      case 's':
        if (duration < 10000) {
          majorInterval = 1000; // 1s
          minorInterval = 200; // 200ms
        } else if (duration < 60000) {
          majorInterval = 5000; // 5s
          minorInterval = 1000; // 1s
        } else {
          majorInterval = 10000; // 10s
          minorInterval = 2000; // 2s
        }
        break;
    }

    // 主要な目盛りを生成
    const startTime =
      Math.ceil(timeWindow.start / majorInterval) * majorInterval;
    for (let time = startTime; time <= timeWindow.end; time += majorInterval) {
      if (time >= timeWindow.start) {
        const position = (time - timeWindow.start) / duration;
        ticks.push({
          position,
          time,
          label: timingChartUtils.formatTime(time, timeScale),
          isMajor: true,
        });
      }
    }

    // 補助目盛りを生成（詳細目盛りにもラベルを追加）
    const minorStartTime =
      Math.ceil(timeWindow.start / minorInterval) * minorInterval;
    for (
      let time = minorStartTime;
      time <= timeWindow.end;
      time += minorInterval
    ) {
      if (time >= timeWindow.start && time % majorInterval !== 0) {
        const position = (time - timeWindow.start) / duration;
        // 250ms以下の窓で詳細表示が有効な場合のみラベルを表示
        const showMinorLabels = duration <= 250 && timeScale === 'ms';
        ticks.push({
          position,
          time,
          label: showMinorLabels
            ? timingChartUtils.formatTime(time, timeScale)
            : '',
          isMajor: false,
        });
      }
    }

    return ticks.sort((a, b) => a.position - b.position);
  }, [timeWindow, timeScale]);

  // スケール切り替えハンドラー
  const handleScaleChange = useCallback(
    (newScale: TimeScale) => {
      setTimeScale(newScale);
    },
    [setTimeScale]
  );

  // ズーム操作
  const handleZoomIn = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const ratio = x / rect.width;
      const centerTime =
        timeWindow.start + (timeWindow.end - timeWindow.start) * ratio;
      zoomIn(centerTime);
    },
    [timeWindow, zoomIn]
  );

  const handleZoomOut = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const ratio = x / rect.width;
      const centerTime =
        timeWindow.start + (timeWindow.end - timeWindow.start) * ratio;
      zoomOut(centerTime);
    },
    [timeWindow, zoomOut]
  );

  // パン操作
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.detail === 2) {
        // ダブルクリック
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const ratio = x / rect.width;
        const centerTime =
          timeWindow.start + (timeWindow.end - timeWindow.start) * ratio;
        panTo(centerTime);
      }
    },
    [timeWindow, panTo]
  );

  // ホイール操作（ズーム）
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const ratio = x / rect.width;
      const centerTime =
        timeWindow.start + (timeWindow.end - timeWindow.start) * ratio;

      if (e.deltaY < 0) {
        zoomIn(centerTime);
      } else {
        zoomOut(centerTime);
      }
    },
    [timeWindow, zoomIn, zoomOut]
  );

  return (
    <div
      className={`time-axis ${className}`}
      style={{
        background: 'rgba(30, 30, 30, 0.95)',
        borderTop: '1px solid rgba(100, 100, 100, 0.5)',
        flex: 1,
      }}
    >
      {/* スケール選択 */}
      <div className="time-scale-selector flex items-center gap-2 px-3 py-1 border-b border-gray-700">
        <span className="text-xs text-gray-400">スケール:</span>
        {(['us', 'ms', 's'] as TimeScale[]).map(scale => (
          <button
            key={scale}
            onClick={() => handleScaleChange(scale)}
            className={`
              px-2 py-1 text-xs rounded transition-colors
              ${
                timeScale === scale
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }
            `}
          >
            {scale}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-500">
            範囲:{' '}
            {timingChartUtils.formatTime(
              timeWindow.end - timeWindow.start,
              timeScale
            )}
          </span>
        </div>
      </div>

      {/* 時間軸 */}
      <div
        className="time-axis-ruler relative h-8 bg-gray-850 cursor-crosshair select-none"
        onClick={handleClick}
        onWheel={handleWheel}
        onContextMenu={e => {
          e.preventDefault();
          handleZoomOut(e);
        }}
        title="ダブルクリック: 中央に移動, ホイール: ズーム, 右クリック: ズームアウト"
      >
        {/* グリッド線と目盛り */}
        {settings.gridVisible && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {tickMarks.map((tick, index) => (
              <g key={index}>
                {/* 縦線（グリッド） */}
                <line
                  x1={`${tick.position * 100}%`}
                  y1="0"
                  x2={`${tick.position * 100}%`}
                  y2="100%"
                  stroke={tick.isMajor ? '#666666' : '#444444'}
                  strokeWidth={tick.isMajor ? 1 : 0.5}
                />

                {/* 目盛りマーク */}
                <line
                  x1={`${tick.position * 100}%`}
                  y1={tick.isMajor ? '0' : '50%'}
                  x2={`${tick.position * 100}%`}
                  y2="100%"
                  stroke="#6b7280"
                  strokeWidth={1}
                />
              </g>
            ))}
          </svg>
        )}

        {/* 時間ラベル */}
        <div className="absolute inset-0 flex items-end">
          {/* 主要目盛りのラベル */}
          {tickMarks
            .filter(tick => tick.isMajor && tick.label)
            .map((tick, index) => (
              <div
                key={`major-${index}`}
                className="absolute text-xs text-gray-100 transform -translate-x-1/2 pb-1 font-semibold"
                style={{ left: `${tick.position * 100}%` }}
              >
                {tick.label}
              </div>
            ))}

          {/* 補助目盛りのラベル（詳細表示時） */}
          {tickMarks
            .filter(tick => !tick.isMajor && tick.label)
            .map((tick, index) => (
              <div
                key={`minor-${index}`}
                className="absolute text-xs text-gray-400 transform -translate-x-1/2 pb-1"
                style={{
                  left: `${tick.position * 100}%`,
                  fontSize: '10px',
                }}
              >
                {tick.label}
              </div>
            ))}
        </div>

        {/* 操作ヒント */}
        <div className="absolute top-1 right-2 text-xs text-gray-500">
          🖱️ ズーム | ✌️ パン
        </div>
      </div>

      {/* CLOCK同期表示 */}
      {settings.clockHighlightEnabled && (
        <div className="clock-sync-indicator h-1 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 opacity-30">
          {/* TODO: CLOCK信号との同期表示 */}
        </div>
      )}
    </div>
  );
};

// CSS-in-JS スタイル
const styles = `
.time-axis {
  min-height: 60px;
  user-select: none;
}

.time-axis-ruler {
  position: relative;
  overflow: hidden;
}

.bg-gray-850 {
  background-color: #1f2937;
}

.time-scale-selector {
  background: rgba(40, 40, 40, 0.95);
  border-bottom: 1px solid rgba(100, 100, 100, 0.5);
}

@media (max-width: 768px) {
  .time-axis {
    min-height: 50px;
  }
  
  .time-scale-selector {
    padding: 4px 8px;
  }
  
  .time-axis-ruler {
    height: 24px;
  }
}
`;

// スタイルの注入
if (
  typeof window !== 'undefined' &&
  !document.querySelector('#time-axis-styles')
) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'time-axis-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

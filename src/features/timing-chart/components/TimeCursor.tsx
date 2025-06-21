/**
 * タイミングチャートの時間カーソルコンポーネント
 */

import React, { useMemo } from 'react';
import type { TimeCursor as TimeCursorType, TimeWindow } from '@/types/timing';
import { timingChartUtils } from '@/utils/timingChart';

interface TimeCursorProps {
  cursor: TimeCursorType;
  timeWindow: TimeWindow;
  panelHeight: number;
  className?: string;
}

export const TimeCursor: React.FC<TimeCursorProps> = ({
  cursor,
  timeWindow,
  panelHeight,
  className = '',
}) => {
  // カーソルの位置を計算（0-1の比率）
  const cursorPosition = useMemo(() => {
    const duration = timeWindow.end - timeWindow.start;
    if (duration <= 0) return 0;

    const relativeTime = cursor.time - timeWindow.start;
    return Math.max(0, Math.min(1, relativeTime / duration));
  }, [cursor.time, timeWindow]);

  // カーソルが表示範囲内にあるかチェック
  const isInRange =
    cursor.time >= timeWindow.start && cursor.time <= timeWindow.end;

  // 信号値の整理
  const signalEntries = useMemo(() => {
    return Object.entries(cursor.signalValues)
      .filter(([, value]) => value !== undefined)
      .sort((a, b) => a[0].localeCompare(b[0])); // トレースIDでソート
  }, [cursor.signalValues]);

  if (!cursor.visible || !isInRange) {
    return null;
  }

  return (
    <div
      className={`time-cursor absolute inset-0 pointer-events-none ${className}`}
    >
      {/* 縦線カーソル */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-10"
        style={{ left: `${cursorPosition * 100}%` }}
      >
        {/* カーソル上部のインジケーター */}
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-400 transform rotate-45 border border-red-300" />

        {/* 時間表示 */}
        <div className="absolute -top-8 -left-12 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
          {timingChartUtils.formatTime(cursor.time, 'ms')}
        </div>
      </div>

      {/* 信号値表示（ツールチップ風） */}
      {signalEntries.length > 0 && (
        <div
          className="absolute bg-gray-900 border border-gray-600 rounded-lg shadow-xl z-20 pointer-events-auto"
          style={{
            left: `${Math.min(80, cursorPosition * 100)}%`, // 画面端で調整
            top: '20px',
            maxHeight: `${Math.max(200, panelHeight - 100)}px`,
          }}
        >
          {/* ヘッダー */}
          <div className="px-3 py-2 border-b border-gray-700 bg-gray-800 rounded-t-lg">
            <div className="text-xs font-semibold text-white">
              時刻: {timingChartUtils.formatTime(cursor.time, 'ms')}
            </div>
          </div>

          {/* 信号値一覧 */}
          <div className="max-h-64 overflow-y-auto">
            {signalEntries.map(([traceId, value], index) => (
              <div
                key={traceId}
                className={`
                  flex items-center justify-between px-3 py-2 text-xs
                  ${index % 2 === 0 ? 'bg-gray-850' : 'bg-gray-900'}
                  hover:bg-gray-700 transition-colors
                `}
              >
                <span className="text-gray-300 truncate flex-1 mr-2">
                  {/* TODO: トレースIDから表示名を取得 */}
                  {traceId}
                </span>
                <span
                  className={`
                  font-mono font-bold px-2 py-1 rounded text-xs
                  ${
                    value === true
                      ? 'bg-green-600 text-white'
                      : value === false
                        ? 'bg-gray-600 text-white'
                        : 'bg-yellow-600 text-black'
                  }
                `}
                >
                  {value === true ? 'H' : value === false ? 'L' : '?'}
                </span>
              </div>
            ))}
          </div>

          {/* フッター（統計） */}
          <div className="px-3 py-2 border-t border-gray-700 bg-gray-800 rounded-b-lg">
            <div className="text-xs text-gray-400">
              {signalEntries.length} 信号,{' '}
              {signalEntries.filter(([, v]) => v === true).length} HIGH
            </div>
          </div>
        </div>
      )}

      {/* ガイドライン（水平） */}
      <div className="absolute inset-0">
        {signalEntries.map(([traceId], index) => {
          // 各信号トレースの高さ位置を計算（仮想的）
          const traceHeight = 40; // 1トレースあたりの高さ
          const yPosition = 20 + index * traceHeight; // ヘッダー分をオフセット

          return (
            <div
              key={`guide-${traceId}`}
              className="absolute w-full h-px bg-red-300 opacity-30"
              style={{ top: `${yPosition}px` }}
            />
          );
        })}
      </div>
    </div>
  );
};

// 信号値表示用のコンポーネント
interface SignalValueDisplayProps {
  traceName: string;
  value: boolean | 'unknown' | 'high-z';
  color?: string;
}

export const SignalValueDisplay: React.FC<SignalValueDisplayProps> = ({
  traceName,
  value,
  color = '#ffffff',
}) => {
  const valueIcon = useMemo(() => {
    switch (value) {
      case true:
        return { text: 'H', bg: 'bg-green-500', icon: '▲' };
      case false:
        return { text: 'L', bg: 'bg-gray-500', icon: '▼' };
      case 'unknown':
        return { text: '?', bg: 'bg-yellow-500', icon: '◆' };
      case 'high-z':
        return { text: 'Z', bg: 'bg-blue-500', icon: '◇' };
      default:
        return { text: '?', bg: 'bg-gray-500', icon: '?' };
    }
  }, [value]);

  return (
    <div className="flex items-center gap-2 min-w-0">
      {/* 信号色インジケーター */}
      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />

      {/* 信号名 */}
      <span className="text-gray-300 truncate flex-1 text-xs">{traceName}</span>

      {/* 値表示 */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-400">{valueIcon.icon}</span>
        <span
          className={`
          px-1.5 py-0.5 rounded text-xs font-mono font-bold text-white
          ${valueIcon.bg}
        `}
        >
          {valueIcon.text}
        </span>
      </div>
    </div>
  );
};

// CSS-in-JS スタイル
const styles = `
.time-cursor {
  z-index: 100;
}

.bg-gray-850 {
  background-color: #1f2937;
}

/* カーソルアニメーション */
.time-cursor .absolute[style*="left"] {
  transition: left 0.1s ease-out;
}

/* ツールチップの影 */
.time-cursor .shadow-xl {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
}

/* スクロールバー */
.time-cursor .overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #4b5563 #1f2937;
}

.time-cursor .overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.time-cursor .overflow-y-auto::-webkit-scrollbar-track {
  background: #1f2937;
}

.time-cursor .overflow-y-auto::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 2px;
}

/* レスポンシブ調整 */
@media (max-width: 768px) {
  .time-cursor .absolute {
    font-size: 10px;
  }
  
  .time-cursor .rounded-lg {
    max-width: 200px;
  }
}
`;

// スタイルの注入
if (
  typeof window !== 'undefined' &&
  !document.querySelector('#time-cursor-styles')
) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'time-cursor-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

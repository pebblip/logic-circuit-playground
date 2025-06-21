/**
 * 🔍 デバッグログ表示コンポーネント
 *
 * ギャラリーモードでリアルタイムデバッグ情報を視覚的に表示
 * Cypressのスクリーンショットで確実に確認できる
 */

import React, { useState, useEffect, useRef } from 'react';
import './DebugLogDisplay.css';

interface DebugLogEntry {
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
}

interface DebugLogDisplayProps {
  isEnabled?: boolean;
  maxLogs?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const DebugLogDisplay: React.FC<DebugLogDisplayProps> = ({
  isEnabled = false,
  maxLogs = 20,
  position = 'top-right',
}) => {
  const [logs, setLogs] = useState<DebugLogEntry[]>([]);
  const [isVisible, setIsVisible] = useState(isEnabled);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // グローバルデバッグ関数を設定
  useEffect(() => {
    if (!isEnabled) return;

    // グローバルデバッグ関数を追加
    (window as any).debugLog = (level: string, message: string, data?: any) => {
      const newLog: DebugLogEntry = {
        timestamp: Date.now(),
        level: level as DebugLogEntry['level'],
        message,
        data,
      };

      setLogs(prevLogs => {
        const updatedLogs = [newLog, ...prevLogs];
        return updatedLogs.slice(0, maxLogs);
      });
    };

    // コンソールログをインターセプト
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      originalLog(...args);
      if (
        args.some(
          arg => typeof arg === 'string' && arg.includes('Gallery Animation')
        )
      ) {
        (window as any).debugLog('info', args.join(' '));
      }
    };

    console.error = (...args) => {
      originalError(...args);
      (window as any).debugLog('error', args.join(' '));
    };

    console.warn = (...args) => {
      originalWarn(...args);
      (window as any).debugLog('warn', args.join(' '));
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      delete (window as any).debugLog;
    };
  }, [isEnabled, maxLogs]);

  // 自動スクロール
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [logs]);

  if (!isEnabled || !isVisible) return null;

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}.${date.getMilliseconds().toString().padStart(3, '0')}`;
  };

  const formatData = (data: any) => {
    if (data === undefined) return '';
    if (typeof data === 'object') {
      return JSON.stringify(data, null, 2);
    }
    return String(data);
  };

  return (
    <div
      className={`debug-log-display debug-log-display--${position}`}
      data-testid="debug-log-display"
    >
      <div className="debug-log-header">
        <span className="debug-log-title">🔍 Debug Log</span>
        <div className="debug-log-controls">
          <button
            onClick={() => setLogs([])}
            className="debug-log-clear"
            data-testid="debug-log-clear"
          >
            Clear
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="debug-log-hide"
            data-testid="debug-log-hide"
          >
            Hide
          </button>
        </div>
      </div>

      <div
        ref={logContainerRef}
        className="debug-log-container"
        data-testid="debug-log-container"
      >
        {logs.length === 0 ? (
          <div className="debug-log-empty">デバッグログはありません</div>
        ) : (
          logs.map((log, index) => (
            <div
              key={`${log.timestamp}-${index}`}
              className={`debug-log-entry debug-log-entry--${log.level}`}
              data-testid={`debug-log-entry-${index}`}
            >
              <div className="debug-log-time">{formatTime(log.timestamp)}</div>
              <div className="debug-log-level">{log.level.toUpperCase()}</div>
              <div className="debug-log-message">{log.message}</div>
              {log.data && (
                <div className="debug-log-data">
                  <pre>{formatData(log.data)}</pre>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="debug-log-footer">
        <span>
          Total: {logs.length} / {maxLogs}
        </span>
      </div>
    </div>
  );
};

// グローバル関数をTypeScriptで利用可能にする
declare global {
  interface Window {
    debugLog?: (level: string, message: string, data?: any) => void;
  }
}

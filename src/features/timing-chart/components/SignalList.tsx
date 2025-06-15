/**
 * タイミングチャートの信号一覧コンポーネント
 */

import React, { useCallback } from 'react';
import { EyeIcon, EyeSlashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { TimingTrace } from '@/types/timing';
import { useCircuitStore } from '@/stores/circuitStore';

interface SignalListProps {
  traces: TimingTrace[];
  className?: string;
}

interface SignalItemProps {
  trace: TimingTrace;
  onRemove: (traceId: string) => void;
  onToggleVisibility: (traceId: string) => void;
  onColorChange: (traceId: string, color: string) => void;
}

const SignalItem: React.FC<SignalItemProps> = ({
  trace,
  onRemove,
  onToggleVisibility,
  onColorChange
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedName, setEditedName] = React.useState(trace.name);

  const handleNameClick = useCallback(() => {
    setIsEditing(true);
    setEditedName(trace.name);
  }, [trace.name]);

  const handleNameSubmit = useCallback(() => {
    setIsEditing(false);
    // TODO: Implement rename functionality
    // onRename(trace.id, editedName);
  }, [editedName]);

  const handleNameKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditedName(trace.name);
    }
  }, [handleNameSubmit, trace.name]);

  const handleColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onColorChange(trace.id, e.target.value);
  }, [trace.id, onColorChange]);

  return (
    <div className="signal-item group flex items-center gap-2 p-2 hover:bg-gray-700 transition-colors">
      {/* 色インジケーター */}
      <div className="relative">
        <div
          className="w-3 h-3 rounded border border-gray-500"
          style={{ backgroundColor: trace.color }}
        />
        <input
          type="color"
          value={trace.color}
          onChange={handleColorChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          title="色を変更"
        />
      </div>

      {/* 信号名 */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={handleNameKeyDown}
            className="w-full bg-gray-800 text-white text-xs px-1 py-0.5 border border-gray-500 rounded"
            autoFocus
          />
        ) : (
          <span
            onClick={handleNameClick}
            className="block text-xs text-white truncate cursor-pointer hover:text-green-400"
            title={trace.name}
          >
            {trace.name}
          </span>
        )}
        
        {/* メタデータ */}
        {trace.metadata?.gateType && (
          <span className="text-xs text-gray-400 truncate block">
            {trace.metadata.gateType}
          </span>
        )}
      </div>

      {/* 操作ボタン */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* 表示/非表示切り替え */}
        <button
          onClick={() => onToggleVisibility(trace.id)}
          className="p-1 rounded hover:bg-gray-600 text-gray-300 hover:text-white transition-colors"
          title={trace.visible ? '非表示にする' : '表示する'}
        >
          {trace.visible ? (
            <EyeIcon className="w-3 h-3" />
          ) : (
            <EyeSlashIcon className="w-3 h-3" />
          )}
        </button>

        {/* 削除ボタン */}
        <button
          onClick={() => onRemove(trace.id)}
          className="p-1 rounded hover:bg-red-600 text-gray-300 hover:text-white transition-colors"
          title="信号を削除"
        >
          <XMarkIcon className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export const SignalList: React.FC<SignalListProps> = ({ 
  traces, 
  className = '' 
}) => {
  const { timingChartActions } = useCircuitStore();
  const { 
    removeTrace, 
    toggleTraceVisibility, 
    updateTraceColor 
  } = timingChartActions;

  const handleRemove = useCallback((traceId: string) => {
    removeTrace(traceId);
  }, [removeTrace]);

  const handleToggleVisibility = useCallback((traceId: string) => {
    toggleTraceVisibility(traceId);
  }, [toggleTraceVisibility]);

  const handleColorChange = useCallback((traceId: string, color: string) => {
    updateTraceColor(traceId, color);
  }, [updateTraceColor]);

  // 信号統計の計算
  const stats = React.useMemo(() => {
    const visible = traces.filter(t => t.visible).length;
    const totalEvents = traces.reduce((sum, t) => sum + t.events.length, 0);
    return { visible, total: traces.length, totalEvents };
  }, [traces]);

  return (
    <div className={`signal-list h-full flex flex-col ${className}`}>
      {/* ヘッダー */}
      <div className="signal-list-header p-3 border-b border-gray-600 bg-gray-800">
        <h4 className="text-xs font-semibold text-white mb-1">信号一覧</h4>
        <div className="text-xs text-gray-400">
          <div>{stats.visible}/{stats.total} 表示中</div>
          <div>{stats.totalEvents} イベント</div>
        </div>
      </div>

      {/* 信号リスト */}
      <div className="signal-list-content flex-1 overflow-y-auto">
        {traces.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <div className="text-xs mb-2">信号なし</div>
            <div className="text-xs text-gray-600">
              ゲートをクリックして<br />信号を追加
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {traces.map(trace => (
              <SignalItem
                key={trace.id}
                trace={trace}
                onRemove={handleRemove}
                onToggleVisibility={handleToggleVisibility}
                onColorChange={handleColorChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* フッター（統計情報） */}
      <div className="signal-list-footer p-2 border-t border-gray-600 bg-gray-800">
        <div className="text-xs text-gray-400 space-y-1">
          <div className="flex justify-between">
            <span>表示信号:</span>
            <span>{stats.visible}</span>
          </div>
          <div className="flex justify-between">
            <span>総イベント:</span>
            <span>{stats.totalEvents}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// CSS-in-JS スタイル
const styles = `
.signal-list {
  min-width: 120px;
  max-width: 200px;
}

.signal-item {
  min-height: 32px;
}

.signal-list-content {
  scrollbar-width: thin;
  scrollbar-color: #4b5563 #1f2937;
}

.signal-list-content::-webkit-scrollbar {
  width: 4px;
}

.signal-list-content::-webkit-scrollbar-track {
  background: #1f2937;
}

.signal-list-content::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 2px;
}

.signal-list-content::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}

@media (max-width: 768px) {
  .signal-list {
    min-width: 80px;
    max-width: 100px;
  }
  
  .signal-item {
    padding: 4px 8px;
  }
  
  .signal-list-header {
    padding: 8px 12px;
  }
  
  .signal-list-footer {
    padding: 4px 8px;
  }
}
`;

// スタイルの注入
if (typeof window !== 'undefined' && !document.querySelector('#signal-list-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'signal-list-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
import React, { useEffect, useRef } from 'react';
import { Terminal, Trash2 } from 'lucide-react';
import { colors } from '../../styles/design-tokens';

const Console = ({ logs = [] }) => {
  const scrollRef = useRef(null);

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogColor = (type) => {
    switch (type) {
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'success':
        return '#10b981';
      case 'info':
        return '#3b82f6';
      default:
        return colors.ui.text.primary;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-300">コンソール</span>
        </div>
        <button
          onClick={() => {
            // TODO: Clear console implementation
            console.log('Clear console');
          }}
          className="p-1 hover:bg-gray-700 rounded transition-colors"
          title="コンソールをクリア"
        >
          <Trash2 className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Logs */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-auto p-2 font-mono text-xs"
        style={{ backgroundColor: '#1a1a1a' }}
      >
        {logs.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>コンソールログはここに表示されます</p>
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div 
                key={index} 
                className="flex items-start gap-2 hover:bg-gray-800/50 px-2 py-1 rounded"
              >
                <span className="text-gray-500 flex-shrink-0">
                  [{formatTimestamp(log.timestamp || Date.now())}]
                </span>
                <span 
                  className="flex-1 break-all"
                  style={{ color: getLogColor(log.type) }}
                >
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Console;
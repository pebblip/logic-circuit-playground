// ドックツールバー

import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Play, Pause, Zap, RotateCcw, Undo, Redo, Save, FolderOpen } from 'lucide-react';

const DockToolbar = ({ 
  autoMode,
  canUndo,
  canRedo,
  onToggleAutoMode,
  onCalculate,
  onReset,
  onUndo,
  onRedo
}) => {
  const tools = [
    { 
      icon: Zap, 
      action: onCalculate, 
      label: '計算実行',
      color: '#3b82f6'
    },
    { 
      icon: autoMode ? Pause : Play, 
      action: onToggleAutoMode, 
      label: autoMode ? '自動停止' : '自動実行',
      color: autoMode ? '#ef4444' : '#10b981'
    },
    { 
      icon: RotateCcw, 
      action: onReset, 
      label: 'リセット',
      color: '#6b7280'
    },
    { type: 'separator' },
    { 
      icon: Undo, 
      action: onUndo, 
      label: '元に戻す',
      color: '#6b7280',
      disabled: !canUndo
    },
    { 
      icon: Redo, 
      action: onRedo, 
      label: 'やり直す',
      color: '#6b7280',
      disabled: !canRedo
    },
    { type: 'separator' },
    { 
      icon: Save, 
      action: () => console.log('保存'), 
      label: '保存',
      color: '#8b5cf6'
    },
    { 
      icon: FolderOpen, 
      action: () => console.log('開く'), 
      label: '開く',
      color: '#8b5cf6'
    }
  ];
  
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20"
    >
      <div className="flex items-center gap-1 px-3 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
        {tools.map((tool, index) => {
          if (tool.type === 'separator') {
            return (
              <div key={index} className="w-px h-8 bg-gray-300 dark:bg-gray-600 mx-1" />
            );
          }
          
          return (
            <motion.button
              key={index}
              onClick={tool.action}
              disabled={tool.disabled}
              className={`relative p-3 rounded-xl transition-all ${
                tool.disabled
                  ? 'cursor-not-allowed opacity-50'
                  : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              whileHover={!tool.disabled ? { scale: 1.1 } : {}}
              whileTap={!tool.disabled ? { scale: 0.95 } : {}}
              title={tool.label}
            >
              <tool.icon 
                className="w-5 h-5" 
                style={{ color: tool.disabled ? '#9ca3af' : tool.color }}
              />
            </motion.button>
          );
        })}
        
        <div className="ml-2 px-2 text-xs text-gray-500 dark:text-gray-400 border-l border-gray-300 dark:border-gray-600">
          Tab で表示/非表示
        </div>
      </div>
    </motion.div>
  );
};

DockToolbar.propTypes = {
  autoMode: PropTypes.bool.isRequired,
  canUndo: PropTypes.bool.isRequired,
  canRedo: PropTypes.bool.isRequired,
  onToggleAutoMode: PropTypes.func.isRequired,
  onCalculate: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  onUndo: PropTypes.func.isRequired,
  onRedo: PropTypes.func.isRequired
};

export default DockToolbar;
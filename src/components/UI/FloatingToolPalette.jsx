// フローティングツールパレットコンポーネント

import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { 
  GripVertical, 
  X, 
  ChevronLeft,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Undo,
  Redo,
  Save,
  FolderOpen,
  Zap
} from 'lucide-react';
import GateIcon from './GateIcon';

const FloatingToolPalette = ({ 
  position = { x: 20, y: 80 },
  gates = [],
  currentLevel = 1,
  unlockedLevels = {},
  autoMode = false,
  canUndo = false,
  canRedo = false,
  onAddGate,
  onToggleAutoMode,
  onCalculate,
  onReset,
  onUndo,
  onRedo,
  onSave,
  onLoad,
  onPositionChange
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeCategory, setActiveCategory] = useState('basic');
  const [localPosition, setLocalPosition] = useState(position);
  const dragControls = useDragControls();
  const paletteRef = useRef(null);

  // ゲートカテゴリー
  const gateCategories = {
    basic: {
      label: '基本',
      icon: '⚡',
      gates: [
        { type: 'AND', name: 'AND', level: 1 },
        { type: 'OR', name: 'OR', level: 1 },
        { type: 'NOT', name: 'NOT', level: 1 }
      ]
    },
    advanced: {
      label: '応用',
      icon: '🔧',
      gates: [
        { type: 'NAND', name: 'NAND', level: 2 },
        { type: 'NOR', name: 'NOR', level: 2 },
        { type: 'XOR', name: 'XOR', level: 3 },
        { type: 'XNOR', name: 'XNOR', level: 3 }
      ]
    },
    io: {
      label: 'I/O',
      icon: '🔌',
      gates: [
        { type: 'INPUT', name: '入力', level: 1 },
        { type: 'OUTPUT', name: '出力', level: 1 },
        { type: 'CLOCK', name: 'クロック', level: 2 }
      ]
    }
  };

  // ツールグループ
  const toolGroups = [
    {
      id: 'simulation',
      tools: [
        { 
          id: 'calculate', 
          icon: Zap, 
          label: '計算実行',
          onClick: onCalculate,
          color: '#3B82F6'
        },
        { 
          id: 'auto', 
          icon: autoMode ? Pause : Play, 
          label: autoMode ? '自動停止' : '自動実行',
          onClick: onToggleAutoMode,
          color: autoMode ? '#EF4444' : '#10B981'
        },
        { 
          id: 'reset', 
          icon: RotateCcw, 
          label: 'リセット',
          onClick: onReset,
          color: '#6B7280'
        }
      ]
    },
    {
      id: 'edit',
      tools: [
        { 
          id: 'undo', 
          icon: Undo, 
          label: '元に戻す',
          onClick: onUndo,
          disabled: !canUndo,
          color: '#6B7280'
        },
        { 
          id: 'redo', 
          icon: Redo, 
          label: 'やり直す',
          onClick: onRedo,
          disabled: !canRedo,
          color: '#6B7280'
        }
      ]
    },
    {
      id: 'file',
      tools: [
        { 
          id: 'save', 
          icon: Save, 
          label: '保存',
          onClick: onSave,
          color: '#8B5CF6'
        },
        { 
          id: 'load', 
          icon: FolderOpen, 
          label: '読込',
          onClick: onLoad,
          color: '#8B5CF6'
        }
      ]
    }
  ];

  // ドラッグ終了時の処理
  const handleDragEnd = (event, info) => {
    const newPosition = {
      x: localPosition.x + info.offset.x,
      y: localPosition.y + info.offset.y
    };
    setLocalPosition(newPosition);
    if (onPositionChange) {
      onPositionChange(newPosition);
    }
  };

  // ウィンドウサイズに応じて位置を調整
  useEffect(() => {
    const handleResize = () => {
      if (paletteRef.current) {
        const rect = paletteRef.current.getBoundingClientRect();
        const newPosition = { ...localPosition };
        
        if (rect.right > window.innerWidth) {
          newPosition.x = window.innerWidth - rect.width - 20;
        }
        if (rect.bottom > window.innerHeight) {
          newPosition.y = window.innerHeight - rect.height - 20;
        }
        if (rect.left < 0) {
          newPosition.x = 20;
        }
        if (rect.top < 60) {
          newPosition.y = 80;
        }
        
        if (newPosition.x !== localPosition.x || newPosition.y !== localPosition.y) {
          setLocalPosition(newPosition);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [localPosition]);

  const currentGates = activeCategory ? gateCategories[activeCategory].gates : [];

  return (
    <motion.div
      ref={paletteRef}
      drag
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0}
      onDragEnd={handleDragEnd}
      initial={{ x: localPosition.x, y: localPosition.y }}
      animate={{ 
        x: localPosition.x, 
        y: localPosition.y,
        width: isMinimized ? 'auto' : isExpanded ? 'auto' : '56px'
      }}
      className="fixed select-none"
      style={{ 
        touchAction: 'none',
        zIndex: 40,
        left: 0,
        top: 0
      }}
    >
      <motion.div
        animate={{ 
          scale: isMinimized ? 0.9 : 1,
          opacity: isMinimized ? 0.8 : 1
        }}
        className="rounded-xl shadow-2xl border overflow-hidden"
        style={{
          backgroundColor: isMinimized ? 'rgba(255, 255, 255, 0.9)' : '#ffffff',
          borderColor: '#e5e7eb'
        }}
      >
        {/* ヘッダー */}
        <div 
          className="h-10 flex items-center px-3 cursor-move"
          style={{
            backgroundColor: '#f9fafb',
            borderBottom: '1px solid #e5e7eb'
          }}
          onPointerDown={(e) => dragControls.start(e)}
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
          <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">
            ツール
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <ChevronLeft className={`w-3 h-3 text-gray-500 transition-transform ${
                isMinimized ? 'rotate-180' : ''
              }`} />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <X className="w-3 h-3 text-gray-500" />
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              {isExpanded ? (
                <div className="p-3 space-y-4" style={{ width: '280px' }}>
                  {/* カテゴリータブ */}
                  <div className="flex gap-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
                    {Object.entries(gateCategories).map(([key, category]) => (
                      <button
                        key={key}
                        onClick={() => setActiveCategory(key)}
                        className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          activeCategory === key
                            ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        <span className="mr-1">{category.icon}</span>
                        {category.label}
                      </button>
                    ))}
                  </div>

                  {/* ゲートグリッド */}
                  <div className="grid grid-cols-3 gap-2">
                    {currentGates.map((gate) => {
                      const isLocked = gate.level > currentLevel || !unlockedLevels[gate.level];
                      return (
                        <motion.button
                          key={gate.type}
                          onClick={() => !isLocked && onAddGate(gate.type)}
                          disabled={isLocked}
                          className={`relative p-3 rounded-lg border transition-all ${
                            isLocked
                              ? 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md cursor-pointer'
                          }`}
                          whileHover={!isLocked ? { scale: 1.05 } : {}}
                          whileTap={!isLocked ? { scale: 0.95 } : {}}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <GateIcon type={gate.type} size={24} />
                            <span className="text-xs text-gray-700 dark:text-gray-300">
                              {gate.name}
                            </span>
                          </div>
                          {isLocked && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/10 dark:bg-gray-100/10 rounded-lg">
                              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                Lv.{gate.level}
                              </span>
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* ツールセクション */}
                  <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    {toolGroups.map((group) => (
                      <div key={group.id} className="flex gap-1">
                        {group.tools.map((tool) => (
                          <motion.button
                            key={tool.id}
                            onClick={tool.onClick}
                            disabled={tool.disabled}
                            className={`flex-1 p-2 rounded-lg transition-all ${
                              tool.disabled
                                ? 'bg-gray-50 dark:bg-gray-900 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                            whileHover={!tool.disabled ? { scale: 1.05 } : {}}
                            whileTap={!tool.disabled ? { scale: 0.95 } : {}}
                            title={tool.label}
                          >
                            <tool.icon 
                              className="w-4 h-4 mx-auto" 
                              style={{ color: tool.disabled ? '#9CA3AF' : tool.color }}
                            />
                          </motion.button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* コンパクトビュー */
                <div className="p-2 space-y-2">
                  {/* クイックゲート追加 */}
                  <motion.button
                    onClick={() => setIsExpanded(true)}
                    className="w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Plus className="w-5 h-5" />
                  </motion.button>

                  {/* 主要ツール */}
                  {toolGroups[0].tools.map((tool) => (
                    <motion.button
                      key={tool.id}
                      onClick={tool.onClick}
                      className="w-10 h-10 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title={tool.label}
                    >
                      <tool.icon 
                        className="w-5 h-5" 
                        style={{ color: tool.color }}
                      />
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

FloatingToolPalette.propTypes = {
  position: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number
  }),
  gates: PropTypes.array,
  currentLevel: PropTypes.number,
  unlockedLevels: PropTypes.object,
  autoMode: PropTypes.bool,
  canUndo: PropTypes.bool,
  canRedo: PropTypes.bool,
  onAddGate: PropTypes.func.isRequired,
  onToggleAutoMode: PropTypes.func.isRequired,
  onCalculate: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  onUndo: PropTypes.func.isRequired,
  onRedo: PropTypes.func.isRequired,
  onSave: PropTypes.func,
  onLoad: PropTypes.func,
  onPositionChange: PropTypes.func
};

export default FloatingToolPalette;
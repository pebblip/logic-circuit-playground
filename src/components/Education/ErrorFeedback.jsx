// エラーフィードバックコンポーネント

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, HelpCircle, ChevronRight, CheckCircle, Info } from 'lucide-react';
import { colors } from '../../styles/design-tokens';

/**
 * エラーの種類に応じたアイコンを返す
 */
const getErrorIcon = (errorType) => {
  switch (errorType) {
    case 'connection':
      return '🔌';
    case 'logic':
      return '⚡';
    case 'structure':
      return '🏗️';
    case 'timing':
      return '⏱️';
    default:
      return '⚠️';
  }
};

/**
 * エラーレベルに応じた色を返す
 */
const getErrorColor = (level) => {
  switch (level) {
    case 'error':
      return colors.ui.accent.error;
    case 'warning':
      return colors.ui.accent.warning;
    case 'info':
      return colors.ui.accent.info;
    default:
      return colors.ui.accent.secondary;
  }
};

/**
 * エラーフィードバックコンポーネント
 */
const ErrorFeedback = ({ 
  errors = [], 
  onDismiss,
  onFixSuggestion,
  showAutoFix = true,
  position = 'bottom-right'
}) => {
  const [expandedErrors, setExpandedErrors] = useState(new Set());
  const [dismissedErrors, setDismissedErrors] = useState(new Set());

  // エラーが解決されたら自動的に削除
  useEffect(() => {
    const timer = setTimeout(() => {
      errors.forEach(error => {
        if (error.resolved) {
          setDismissedErrors(prev => new Set([...prev, error.id]));
        }
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [errors]);

  const toggleExpand = (errorId) => {
    setExpandedErrors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(errorId)) {
        newSet.delete(errorId);
      } else {
        newSet.add(errorId);
      }
      return newSet;
    });
  };

  const handleDismiss = (errorId) => {
    setDismissedErrors(prev => new Set([...prev, errorId]));
    if (onDismiss) {
      onDismiss(errorId);
    }
  };

  // 表示するエラーをフィルタリング
  const visibleErrors = errors.filter(error => !dismissedErrors.has(error.id));

  if (visibleErrors.length === 0) return null;

  // 位置のクラス名を決定
  const positionClasses = {
    'top-left': 'top-20 left-4',
    'top-right': 'top-20 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  return (
    <div 
      className={`fixed ${positionClasses[position]} max-w-md z-50`}
      style={{ maxHeight: '60vh', overflowY: 'auto' }}
    >
      <AnimatePresence>
        {visibleErrors.map((error, index) => (
          <motion.div
            key={error.id}
            initial={{ opacity: 0, x: position.includes('right') ? 50 : -50, y: 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: position.includes('right') ? 50 : -50 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="mb-3"
          >
            <div 
              className="rounded-lg shadow-lg overflow-hidden"
              style={{ 
                backgroundColor: colors.ui.surface,
                border: `2px solid ${getErrorColor(error.level || 'error')}`
              }}
            >
              {/* エラーヘッダー */}
              <div 
                className="p-4 cursor-pointer"
                onClick={() => toggleExpand(error.id)}
                style={{ 
                  backgroundColor: getErrorColor(error.level || 'error') + '10'
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start flex-1">
                    <span className="text-2xl mr-3 flex-shrink-0">
                      {getErrorIcon(error.type)}
                    </span>
                    <div className="flex-1">
                      <h4 
                        className="font-semibold text-sm mb-1"
                        style={{ color: getErrorColor(error.level || 'error') }}
                      >
                        {error.title || 'エラー'}
                      </h4>
                      <p 
                        className="text-sm"
                        style={{ color: colors.ui.text.primary }}
                      >
                        {error.message}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center ml-2">
                    {error.resolved && (
                      <CheckCircle 
                        className="w-5 h-5 mr-2"
                        style={{ color: colors.ui.accent.success }}
                      />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDismiss(error.id);
                      }}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <X className="w-4 h-4" style={{ color: colors.ui.text.secondary }} />
                    </button>
                  </div>
                </div>

                {/* 展開インジケーター */}
                {(error.details || error.suggestions || error.learnMore) && (
                  <div className="flex items-center mt-2">
                    <ChevronRight 
                      className={`w-4 h-4 transition-transform ${
                        expandedErrors.has(error.id) ? 'rotate-90' : ''
                      }`}
                      style={{ color: colors.ui.text.secondary }}
                    />
                    <span 
                      className="text-xs ml-1"
                      style={{ color: colors.ui.text.secondary }}
                    >
                      詳細を見る
                    </span>
                  </div>
                )}
              </div>

              {/* エラー詳細（展開時） */}
              <AnimatePresence>
                {expandedErrors.has(error.id) && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 border-t" style={{ borderColor: colors.ui.border }}>
                      {/* 詳細情報 */}
                      {error.details && (
                        <div className="mb-4">
                          <h5 
                            className="text-sm font-semibold mb-2 flex items-center"
                            style={{ color: colors.ui.text.primary }}
                          >
                            <Info className="w-4 h-4 mr-1" />
                            詳細情報
                          </h5>
                          <p className="text-sm" style={{ color: colors.ui.text.secondary }}>
                            {error.details}
                          </p>
                        </div>
                      )}

                      {/* 修正提案 */}
                      {error.suggestions && error.suggestions.length > 0 && (
                        <div className="mb-4">
                          <h5 
                            className="text-sm font-semibold mb-2 flex items-center"
                            style={{ color: colors.ui.text.primary }}
                          >
                            <HelpCircle className="w-4 h-4 mr-1" />
                            修正方法
                          </h5>
                          <ul className="space-y-2">
                            {error.suggestions.map((suggestion, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="text-sm mr-2" style={{ color: colors.ui.accent.primary }}>
                                  {idx + 1}.
                                </span>
                                <div className="flex-1">
                                  <p className="text-sm" style={{ color: colors.ui.text.secondary }}>
                                    {suggestion.text}
                                  </p>
                                  {showAutoFix && suggestion.autoFix && (
                                    <button
                                      onClick={() => onFixSuggestion && onFixSuggestion(error.id, suggestion.action)}
                                      className="mt-1 text-xs px-2 py-1 rounded transition-colors"
                                      style={{
                                        backgroundColor: colors.ui.accent.primary + '20',
                                        color: colors.ui.accent.primary
                                      }}
                                    >
                                      自動修正
                                    </button>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* 学習リンク */}
                      {error.learnMore && (
                        <div className="mt-4 pt-4 border-t" style={{ borderColor: colors.ui.border }}>
                          <button
                            onClick={() => error.learnMore.action && error.learnMore.action()}
                            className="text-sm font-medium flex items-center transition-colors"
                            style={{ color: colors.ui.accent.primary }}
                          >
                            {error.learnMore.text || 'この概念について学ぶ'}
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

ErrorFeedback.propTypes = {
  errors: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['connection', 'logic', 'structure', 'timing', 'general']),
    level: PropTypes.oneOf(['error', 'warning', 'info']),
    title: PropTypes.string,
    message: PropTypes.string.isRequired,
    details: PropTypes.string,
    suggestions: PropTypes.arrayOf(PropTypes.shape({
      text: PropTypes.string.isRequired,
      autoFix: PropTypes.bool,
      action: PropTypes.func
    })),
    learnMore: PropTypes.shape({
      text: PropTypes.string,
      action: PropTypes.func
    }),
    resolved: PropTypes.bool
  })),
  onDismiss: PropTypes.func,
  onFixSuggestion: PropTypes.func,
  showAutoFix: PropTypes.bool,
  position: PropTypes.oneOf(['top-left', 'top-right', 'bottom-left', 'bottom-right'])
};

export default ErrorFeedback;
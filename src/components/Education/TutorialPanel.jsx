// チュートリアルパネルコンポーネント

import React from 'react';
import PropTypes from 'prop-types';
import { colors } from '../../styles/design-tokens';

/**
 * チュートリアルパネル
 */
const TutorialPanel = ({ 
  currentStep, 
  totalSteps, 
  instruction, 
  hint, 
  showHint, 
  onShowHint,
  onSkip,
  onComplete,
  isStepCompleted 
}) => {
  return (
    <div 
      className="absolute top-20 right-4 w-96 p-6 rounded-lg shadow-lg z-50"
      style={{ 
        backgroundColor: colors.ui.surface,
        border: `2px solid ${colors.ui.accent.primary}`
      }}
    >
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold" style={{ color: colors.ui.text.primary }}>
          チュートリアル
        </h3>
        <span className="text-sm" style={{ color: colors.ui.text.secondary }}>
          ステップ {currentStep + 1} / {totalSteps}
        </span>
      </div>

      {/* プログレスバー */}
      <div className="w-full h-2 bg-gray-200 rounded-full mb-4">
        <div 
          className="h-full rounded-full transition-all duration-300"
          style={{ 
            width: `${((currentStep + 1) / totalSteps) * 100}%`,
            backgroundColor: colors.ui.accent.primary 
          }}
        />
      </div>

      {/* 指示内容 */}
      <div className="mb-4">
        <p className="text-base mb-2" style={{ color: colors.ui.text.primary }}>
          {instruction}
        </p>
        
        {/* ヒント */}
        {showHint && hint && (
          <div 
            className="mt-3 p-3 rounded"
            style={{ 
              backgroundColor: colors.ui.accent.info + '20',
              borderLeft: `3px solid ${colors.ui.accent.info}`
            }}
          >
            <p className="text-sm" style={{ color: colors.ui.text.primary }}>
              💡 ヒント: {hint}
            </p>
          </div>
        )}
      </div>

      {/* ボタン */}
      <div className="flex gap-2">
        {!showHint && hint && (
          <button
            onClick={onShowHint}
            className="px-4 py-2 rounded text-sm font-medium transition-colors"
            style={{
              backgroundColor: colors.ui.background,
              color: colors.ui.text.primary,
              border: `1px solid ${colors.ui.border}`
            }}
          >
            ヒントを見る
          </button>
        )}

        <button
          onClick={onSkip}
          className="px-4 py-2 rounded text-sm font-medium transition-colors"
          style={{
            backgroundColor: colors.ui.background,
            color: colors.ui.text.secondary,
            border: `1px solid ${colors.ui.border}`
          }}
        >
          スキップ
        </button>

        {isStepCompleted && (
          <button
            onClick={onComplete}
            className="px-4 py-2 rounded text-sm font-medium transition-colors ml-auto"
            style={{
              backgroundColor: colors.ui.accent.success,
              color: 'white'
            }}
          >
            {currentStep < totalSteps - 1 ? '次へ' : '完了'}
          </button>
        )}
      </div>

      {/* ステップ完了の表示 */}
      {isStepCompleted && (
        <div 
          className="mt-4 p-3 rounded flex items-center"
          style={{ 
            backgroundColor: colors.ui.accent.success + '20',
            border: `1px solid ${colors.ui.accent.success}`
          }}
        >
          <span className="text-2xl mr-2">✅</span>
          <span style={{ color: colors.ui.accent.success }}>
            ステップ完了！
          </span>
        </div>
      )}
    </div>
  );
};

TutorialPanel.propTypes = {
  currentStep: PropTypes.number.isRequired,
  totalSteps: PropTypes.number.isRequired,
  instruction: PropTypes.string.isRequired,
  hint: PropTypes.string,
  showHint: PropTypes.bool.isRequired,
  onShowHint: PropTypes.func.isRequired,
  onSkip: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired,
  isStepCompleted: PropTypes.bool.isRequired
};

export default TutorialPanel;
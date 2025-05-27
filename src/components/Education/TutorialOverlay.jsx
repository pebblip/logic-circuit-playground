// チュートリアルオーバーレイ

import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { ChevronRight, X } from 'lucide-react';
import { TUTORIAL_STEPS } from '../../constants/education';

const TutorialOverlay = ({ tutorialId, currentStep, isStepCompleted, onNext, onSkip }) => {
  const steps = TUTORIAL_STEPS[tutorialId] || [];
  const step = steps[currentStep] || {};
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-20 right-4 z-30 w-80"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 flex items-center justify-between">
          <div className="text-white">
            <h3 className="font-semibold text-sm">チュートリアル</h3>
            <p className="text-xs opacity-90">
              ステップ {currentStep + 1} / {steps.length}
            </p>
          </div>
          <button
            onClick={onSkip}
            className="p-1 rounded hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
        
        {/* プログレスバー */}
        <div className="h-1 bg-gray-200 dark:bg-gray-700">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
          />
        </div>
        
        {/* コンテンツ */}
        <div className="p-4">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            {step.instruction}
          </p>
          
          {step.hint && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                💡 ヒント: {step.hint}
              </p>
            </div>
          )}
          
          {/* アクション */}
          <div className="flex justify-end">
            <motion.button
              onClick={onNext}
              disabled={!isStepCompleted}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                isStepCompleted
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
              whileHover={isStepCompleted ? { scale: 1.05 } : {}}
              whileTap={isStepCompleted ? { scale: 0.95 } : {}}
            >
              {currentStep < steps.length - 1 ? '次へ' : '完了'}
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
        
        {/* ステップ完了インジケーター */}
        {isStepCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-4 flex items-center gap-2 text-green-600 dark:text-green-400"
          >
            <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <span className="text-xs">✓</span>
            </div>
            <span className="text-xs font-medium">ステップ完了！</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

TutorialOverlay.propTypes = {
  tutorialId: PropTypes.string.isRequired,
  currentStep: PropTypes.number.isRequired,
  isStepCompleted: PropTypes.bool.isRequired,
  onNext: PropTypes.func.isRequired,
  onSkip: PropTypes.func.isRequired
};

export default TutorialOverlay;
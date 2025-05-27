import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiX } from 'react-icons/fi';

const WelcomeTutorial = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      title: '論理回路プレイグラウンドへようこそ！',
      content: 'このアプリケーションでは、論理回路の基礎から応用まで、楽しく学ぶことができます。',
      icon: '🎓',
      illustration: (
        <div className="flex items-center justify-center space-x-4">
          <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center text-white text-2xl">
            AND
          </div>
          <div className="text-4xl">→</div>
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl">
            ✓
          </div>
        </div>
      )
    },
    {
      title: 'ゲートをドラッグ&ドロップ',
      content: '左側のパーツボックスから、ゲートをキャンバスにドラッグして配置します。',
      icon: '🖱️',
      illustration: (
        <motion.div
          className="w-24 h-16 bg-purple-500 rounded-lg flex items-center justify-center text-white"
          animate={{ x: [0, 100, 100], y: [0, 0, 50] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          OR
        </motion.div>
      )
    },
    {
      title: '配線で接続',
      content: 'ゲートの出力端子から入力端子へドラッグして、配線を作成します。',
      icon: '🔌',
      illustration: (
        <svg width="200" height="100" viewBox="0 0 200 100">
          <circle cx="50" cy="50" r="10" fill="#10b981" />
          <circle cx="150" cy="50" r="10" fill="#ef4444" />
          <motion.path
            d="M 60 50 Q 100 50, 140 50"
            stroke="#3b82f6"
            strokeWidth="3"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </svg>
      )
    },
    {
      title: '課題にチャレンジ！',
      content: '真理値表に従って回路を作成し、チェックボタンで答え合わせができます。',
      icon: '🎯',
      illustration: (
        <div className="bg-gray-100 p-4 rounded-lg">
          <table className="text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-2">A</th>
                <th className="px-2">B</th>
                <th className="px-2">出力</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="px-2 text-center">0</td><td className="px-2 text-center">0</td><td className="px-2 text-center">0</td></tr>
              <tr><td className="px-2 text-center">1</td><td className="px-2 text-center">1</td><td className="px-2 text-center">1</td></tr>
            </tbody>
          </table>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = tutorialSteps[currentStep];

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative">
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <FiX size={20} />
          </button>
          <div className="flex items-center space-x-4">
            <span className="text-4xl">{step.icon}</span>
            <h2 className="text-2xl font-bold">{step.title}</h2>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <p className="text-lg text-gray-700">{step.content}</p>
              <div className="flex justify-center py-8">
                {step.illustration}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* フッター */}
        <div className="px-8 pb-8">
          <div className="flex items-center justify-between">
            {/* プログレスドット */}
            <div className="flex space-x-2">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'w-8 bg-blue-600'
                      : index < currentStep
                      ? 'bg-blue-400'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* アクションボタン */}
            <div className="flex space-x-3">
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                スキップ
              </button>
              <motion.button
                onClick={handleNext}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>{currentStep === tutorialSteps.length - 1 ? '始める' : '次へ'}</span>
                <FiArrowRight />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WelcomeTutorial;
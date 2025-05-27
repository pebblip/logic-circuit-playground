import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiEye, FiRefreshCw, FiArrowRight } from 'react-icons/fi';

const ChallengeBar = ({
  challenge,
  showHint,
  onHintClick,
  onResetClick,
  onCheckClick,
  onNextClick,
  canProceed,
  checkResult
}) => {
  if (!challenge) return null;

  const hints = [
    { level: 1, text: '配置のヒント', content: challenge.hints?.placement },
    { level: 2, text: '配線のヒント', content: challenge.hints?.wiring },
    { level: 3, text: '答えのヒント', content: challenge.hints?.answer }
  ];

  return (
    <motion.div 
      className="bg-white border-t border-gray-200 shadow-lg px-6 py-4"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center justify-between">
        {/* 左側: 課題情報 */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800">{challenge.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
          
          {/* ヒント表示 */}
          {showHint > 0 && (
            <motion.div 
              className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-sm text-yellow-800">
                <strong>{hints[showHint - 1].text}:</strong> {hints[showHint - 1].content}
              </p>
            </motion.div>
          )}
        </div>

        {/* 右側: アクションボタン */}
        <div className="flex items-center space-x-3 ml-6">
          {/* ヒントボタン */}
          <motion.button
            onClick={onHintClick}
            disabled={showHint >= 3}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              showHint >= 3
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
            }`}
            whileHover={showHint < 3 ? { scale: 1.05 } : {}}
            whileTap={showHint < 3 ? { scale: 0.95 } : {}}
          >
            <FiEye size={18} />
            <span className="text-sm font-medium">
              ヒント {showHint > 0 ? `(${showHint}/3)` : ''}
            </span>
          </motion.button>

          {/* リセットボタン */}
          <motion.button
            onClick={onResetClick}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiRefreshCw size={18} />
            <span className="text-sm font-medium">リセット</span>
          </motion.button>

          {/* チェックボタン */}
          <motion.button
            onClick={onCheckClick}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiCheckCircle size={18} />
            <span className="text-sm font-medium">チェック</span>
          </motion.button>

          {/* 次へボタン */}
          <AnimatePresence>
            {canProceed && (
              <motion.button
                onClick={onNextClick}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-sm font-medium">次へ</span>
                <FiArrowRight size={18} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* チェック結果の表示 */}
      <AnimatePresence>
        {checkResult !== undefined && (
          <motion.div
            className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 px-6 py-3 rounded-lg shadow-lg ${
              checkResult ? 'bg-green-500' : 'bg-red-500'
            } text-white`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="flex items-center space-x-2">
              {checkResult ? (
                <>
                  <FiCheckCircle size={20} />
                  <span className="font-medium">正解！よくできました！</span>
                </>
              ) : (
                <>
                  <FiXCircle size={20} />
                  <span className="font-medium">もう一度試してみましょう</span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ChallengeBar;
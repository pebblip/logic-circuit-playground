import React from 'react';
import { motion } from 'framer-motion';
import { FiRotateCcw, FiRotateCw, FiHelpCircle, FiUser } from 'react-icons/fi';

const HeaderV4 = ({ 
  currentLevel, 
  challengeProgress, 
  userName, 
  onUndo, 
  onRedo, 
  canUndo, 
  canRedo 
}) => {
  return (
    <motion.header 
      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 shadow-lg"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center justify-between">
        {/* 左側: ロゴとレベル情報 */}
        <div className="flex items-center space-x-6">
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔌</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">論理回路プレイグラウンド</h1>
              <p className="text-sm opacity-90">レベル {currentLevel} - 課題 {challengeProgress}</p>
            </div>
          </motion.div>
        </div>

        {/* 中央: アクションボタン */}
        <div className="flex items-center space-x-2">
          <motion.button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-2 rounded-lg transition-all ${
              canUndo 
                ? 'bg-white/20 hover:bg-white/30 text-white' 
                : 'bg-white/10 text-white/50 cursor-not-allowed'
            }`}
            whileHover={canUndo ? { scale: 1.1 } : {}}
            whileTap={canUndo ? { scale: 0.95 } : {}}
          >
            <FiRotateCcw size={20} />
          </motion.button>
          
          <motion.button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-2 rounded-lg transition-all ${
              canRedo 
                ? 'bg-white/20 hover:bg-white/30 text-white' 
                : 'bg-white/10 text-white/50 cursor-not-allowed'
            }`}
            whileHover={canRedo ? { scale: 1.1 } : {}}
            whileTap={canRedo ? { scale: 0.95 } : {}}
          >
            <FiRotateCw size={20} />
          </motion.button>
        </div>

        {/* 右側: ユーザー情報とヘルプ */}
        <div className="flex items-center space-x-4">
          <motion.button
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiHelpCircle size={20} />
          </motion.button>
          
          <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-3 py-2">
            <FiUser size={18} />
            <span className="text-sm font-medium">{userName}</span>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default HeaderV4;
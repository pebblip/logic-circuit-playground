// ミニマルなヘッダーコンポーネント

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, 
  GraduationCap, 
  Blocks, 
  HelpCircle, 
  Moon, 
  Sun,
  Menu,
  X,
  Settings,
  Save,
  FolderOpen
} from 'lucide-react';

const MinimalHeader = ({ 
  mode = 'sandbox',
  onModeChange,
  onHelp,
  darkMode = false,
  onDarkModeToggle,
  onMenuClick,
  title = 'Logic Circuit Playground'
}) => {
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const modes = [
    { id: 'sandbox', label: 'サンドボックス', icon: Blocks, color: '#3B82F6' },
    { id: 'tutorial', label: 'チュートリアル', icon: GraduationCap, color: '#10B981' },
    { id: 'challenge', label: 'チャレンジ', icon: Cpu, color: '#F59E0B' }
  ];

  const currentMode = modes.find(m => m.id === mode) || modes[0];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
      <div className="h-14 px-4 flex items-center justify-between">
        {/* ロゴとタイトル */}
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
          >
            <Cpu className="w-5 h-5 text-white" />
          </motion.div>
          
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white hidden sm:block">
            {title}
          </h1>
        </div>

        {/* 中央のモード切り替え */}
        <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:block">
          <div className="relative">
            <motion.button
              onClick={() => setShowModeMenu(!showModeMenu)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
              style={{ backgroundColor: currentMode.color + '20', color: currentMode.color }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <currentMode.icon className="w-4 h-4" />
              <span className="font-medium">{currentMode.label}</span>
            </motion.button>

            <AnimatePresence>
              {showModeMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 min-w-[200px]"
                >
                  {modes.map((modeOption) => (
                    <button
                      key={modeOption.id}
                      onClick={() => {
                        onModeChange(modeOption.id);
                        setShowModeMenu(false);
                      }}
                      className={`w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        mode === modeOption.id ? 'bg-gray-100 dark:bg-gray-700' : ''
                      }`}
                    >
                      <modeOption.icon 
                        className="w-4 h-4" 
                        style={{ color: modeOption.color }}
                      />
                      <span className="text-gray-900 dark:text-white">
                        {modeOption.label}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 右側のアクション */}
        <div className="flex items-center gap-2">
          {/* デスクトップ用ボタン */}
          <div className="hidden md:flex items-center gap-2">
            <motion.button
              onClick={onDarkModeToggle}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </motion.button>

            <motion.button
              onClick={onHelp}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <HelpCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </motion.button>

            <motion.button
              onClick={onMenuClick}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </motion.button>
          </div>

          {/* モバイル用メニューボタン */}
          <motion.button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors md:hidden"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </motion.button>
        </div>
      </div>

      {/* モバイルメニュー */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
          >
            <div className="p-4 space-y-3">
              {/* モード選択 */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">モード</p>
                {modes.map((modeOption) => (
                  <button
                    key={modeOption.id}
                    onClick={() => {
                      onModeChange(modeOption.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 rounded-lg flex items-center gap-3 transition-colors ${
                      mode === modeOption.id 
                        ? 'bg-gray-100 dark:bg-gray-800' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <modeOption.icon 
                      className="w-4 h-4" 
                      style={{ color: modeOption.color }}
                    />
                    <span className="text-gray-900 dark:text-white">
                      {modeOption.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* アクション */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <button
                  onClick={() => {
                    onDarkModeToggle();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 rounded-lg flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {darkMode ? (
                    <Sun className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  )}
                  <span className="text-gray-900 dark:text-white">
                    {darkMode ? 'ライトモード' : 'ダークモード'}
                  </span>
                </button>

                <button
                  onClick={() => {
                    onHelp();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 rounded-lg flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <HelpCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-white">ヘルプ</span>
                </button>

                <button
                  onClick={() => {
                    onMenuClick();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 rounded-lg flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-white">設定</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

MinimalHeader.propTypes = {
  mode: PropTypes.oneOf(['sandbox', 'tutorial', 'challenge']),
  onModeChange: PropTypes.func.isRequired,
  onHelp: PropTypes.func.isRequired,
  darkMode: PropTypes.bool,
  onDarkModeToggle: PropTypes.func.isRequired,
  onMenuClick: PropTypes.func.isRequired,
  title: PropTypes.string
};

export default MinimalHeader;
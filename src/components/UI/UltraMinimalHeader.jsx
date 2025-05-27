// 超ミニマルヘッダー

import React from 'react';
import PropTypes from 'prop-types';
import { Cpu, Moon, Sun, HelpCircle } from 'lucide-react';

const UltraMinimalHeader = ({ darkMode, onDarkModeToggle, onHelp }) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-12 z-50 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="h-full px-4 flex items-center justify-between">
        {/* ロゴ */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
            Logic Circuit
          </span>
        </div>
        
        {/* アクション */}
        <div className="flex items-center gap-1">
          <button
            onClick={onDarkModeToggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={darkMode ? 'ライトモード' : 'ダークモード'}
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <Moon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>
          
          <button
            onClick={onHelp}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="ヘルプ"
          >
            <HelpCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>
    </header>
  );
};

UltraMinimalHeader.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  onDarkModeToggle: PropTypes.func.isRequired,
  onHelp: PropTypes.func.isRequired
};

export default UltraMinimalHeader;
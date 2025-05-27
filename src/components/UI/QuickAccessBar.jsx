// クイックアクセスバー

import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import GateIcon from './GateIcon';

const QuickAccessBar = ({ onAddGate, currentLevel }) => {
  const quickGates = [
    { type: 'AND', name: 'AND', key: '1', level: 1 },
    { type: 'OR', name: 'OR', key: '2', level: 1 },
    { type: 'NOT', name: 'NOT', key: '3', level: 1 },
    { type: 'INPUT', name: 'IN', key: '4', level: 1 },
    { type: 'OUTPUT', name: 'OUT', key: '5', level: 1 }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20"
    >
      <div className="flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200/50 dark:border-gray-700/50">
        {quickGates.map((gate) => {
          const isLocked = gate.level > currentLevel;
          return (
            <motion.button
              key={gate.type}
              onClick={() => !isLocked && onAddGate(gate.type)}
              disabled={isLocked}
              className={`relative w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all ${
                isLocked 
                  ? 'bg-gray-100 dark:bg-gray-900 cursor-not-allowed opacity-50' 
                  : 'bg-gray-50 dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer'
              }`}
              whileHover={!isLocked ? { scale: 1.1 } : {}}
              whileTap={!isLocked ? { scale: 0.95 } : {}}
              title={`${gate.name} (${gate.key}キー)`}
            >
              <GateIcon type={gate.type} size={20} />
              <span className="text-[10px] text-gray-600 dark:text-gray-400 mt-1">
                {gate.key}
              </span>
              {isLocked && (
                <div className="absolute inset-0 rounded-xl bg-gray-900/10 dark:bg-gray-100/10 flex items-center justify-center">
                  <span className="text-xs text-gray-500">Lv.{gate.level}</span>
                </div>
              )}
            </motion.button>
          );
        })}
        
        <div className="w-px h-8 bg-gray-300 dark:bg-gray-600 mx-1" />
        
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Space で表示/非表示
        </span>
      </div>
    </motion.div>
  );
};

QuickAccessBar.propTypes = {
  onAddGate: PropTypes.func.isRequired,
  currentLevel: PropTypes.number.isRequired
};

export default QuickAccessBar;
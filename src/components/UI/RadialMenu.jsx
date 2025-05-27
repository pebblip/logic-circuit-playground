// ラジアルメニュー

import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Copy, Settings, Plus } from 'lucide-react';
import GateIcon from './GateIcon';

const RadialMenu = ({ position, onAddGate, onDelete, onClose, hasGate, currentLevel }) => {
  const menuRef = useRef(null);
  
  // 外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);
  
  const gateOptions = [
    { type: 'AND', angle: -90, level: 1 },
    { type: 'OR', angle: -60, level: 1 },
    { type: 'NOT', angle: -30, level: 1 },
    { type: 'XOR', angle: 0, level: 3 },
    { type: 'NAND', angle: 30, level: 2 },
    { type: 'NOR', angle: 60, level: 2 },
    { type: 'INPUT', angle: 90, level: 1 },
    { type: 'OUTPUT', angle: 120, level: 1 }
  ];
  
  const actionOptions = hasGate ? [
    { icon: Trash2, action: onDelete, label: '削除', angle: 180, color: '#ef4444' },
    { icon: Copy, action: () => console.log('複製'), label: '複製', angle: 210, color: '#3b82f6' },
    { icon: Settings, action: () => console.log('設定'), label: '設定', angle: 240, color: '#6b7280' }
  ] : [];
  
  const radius = 80;
  
  return (
    <AnimatePresence>
      <div
        ref={menuRef}
        className="fixed z-50"
        style={{ left: position.x, top: position.y }}
      >
        {/* 中心点 */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className="absolute w-4 h-4 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-full"
          style={{ transform: 'translate(-50%, -50%)' }}
        />
        
        {/* ゲートオプション */}
        {!hasGate && gateOptions.map((gate) => {
          const isLocked = gate.level > currentLevel;
          const angleRad = (gate.angle * Math.PI) / 180;
          const x = Math.cos(angleRad) * radius;
          const y = Math.sin(angleRad) * radius;
          
          return (
            <motion.button
              key={gate.type}
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{ scale: 1, x, y }}
              exit={{ scale: 0, x: 0, y: 0 }}
              transition={{ delay: Math.abs(gate.angle) * 0.001 }}
              onClick={() => !isLocked && onAddGate(gate.type)}
              disabled={isLocked}
              className={`absolute w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
                isLocked
                  ? 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed opacity-50'
                  : 'bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer border border-gray-200 dark:border-gray-700'
              }`}
              style={{ transform: 'translate(-50%, -50%)' }}
              whileHover={!isLocked ? { scale: 1.2 } : {}}
              whileTap={!isLocked ? { scale: 0.9 } : {}}
            >
              <GateIcon type={gate.type} size={20} />
              {isLocked && (
                <div className="absolute inset-0 rounded-full bg-gray-900/20 dark:bg-gray-100/20" />
              )}
            </motion.button>
          );
        })}
        
        {/* アクションオプション */}
        {hasGate && actionOptions.map((option, index) => {
          const angleRad = (option.angle * Math.PI) / 180;
          const x = Math.cos(angleRad) * radius;
          const y = Math.sin(angleRad) * radius;
          
          return (
            <motion.button
              key={index}
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{ scale: 1, x, y }}
              exit={{ scale: 0, x: 0, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={option.action}
              className="absolute w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700"
              style={{ transform: 'translate(-50%, -50%)' }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <option.icon 
                className="w-5 h-5 mx-auto" 
                style={{ color: option.color }}
              />
            </motion.button>
          );
        })}
        
        {/* 新規追加ボタン（ゲート選択時） */}
        {hasGate && (
          <motion.button
            initial={{ scale: 0, x: 0, y: -radius }}
            animate={{ scale: 1, x: 0, y: -radius }}
            exit={{ scale: 0, x: 0, y: 0 }}
            onClick={() => {
              // 新規追加モードに切り替え
            }}
            className="absolute w-12 h-12 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 transition-colors"
            style={{ transform: 'translate(-50%, -50%)' }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <Plus className="w-5 h-5 mx-auto" />
          </motion.button>
        )}
      </div>
    </AnimatePresence>
  );
};

RadialMenu.propTypes = {
  position: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    canvasX: PropTypes.number.isRequired,
    canvasY: PropTypes.number.isRequired,
    gateId: PropTypes.string
  }).isRequired,
  onAddGate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  hasGate: PropTypes.bool.isRequired,
  currentLevel: PropTypes.number.isRequired
};

export default RadialMenu;
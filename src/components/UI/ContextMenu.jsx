// コンテキストメニューコンポーネント

import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const ContextMenu = ({ x, y, options, onSelect, onClose }) => {
  const menuRef = useRef(null);

  // クリック外で閉じる
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // メニューの位置を画面内に収める
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const adjustedX = Math.min(x, window.innerWidth - rect.width - 10);
      const adjustedY = Math.min(y, window.innerHeight - rect.height - 10);
      
      menuRef.current.style.left = `${Math.max(10, adjustedX)}px`;
      menuRef.current.style.top = `${Math.max(10, adjustedY)}px`;
    }
  }, [x, y]);

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 min-w-[180px]"
      style={{ left: x, top: y }}
    >
      {options.map((option, index) => {
        if (option.type === 'separator') {
          return (
            <div key={index} className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
          );
        }

        return (
          <button
            key={option.id}
            onClick={() => {
              onSelect(option.id);
              onClose();
            }}
            className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between group"
            disabled={option.disabled}
          >
            <div className="flex items-center gap-2">
              {option.icon && (
                <span className="text-base">{option.icon}</span>
              )}
              <span className={`text-sm ${option.disabled ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                {option.label}
              </span>
            </div>
            {option.shortcut && (
              <span className="text-xs text-gray-400 dark:text-gray-500 ml-8">
                {option.shortcut}
              </span>
            )}
          </button>
        );
      })}
    </motion.div>
  );
};

ContextMenu.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    label: PropTypes.string,
    icon: PropTypes.string,
    shortcut: PropTypes.string,
    disabled: PropTypes.bool,
    type: PropTypes.oneOf(['item', 'separator'])
  })).isRequired,
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default ContextMenu;
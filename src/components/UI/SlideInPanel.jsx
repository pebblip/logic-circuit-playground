// スライドインパネル

import React from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const SlideInPanel = ({ isOpen, onClose, position = 'left', children }) => {
  const getSlideDirection = () => {
    switch (position) {
      case 'left':
        return { x: '-100%' };
      case 'right':
        return { x: '100%' };
      case 'top':
        return { y: '-100%' };
      case 'bottom':
        return { y: '100%' };
      default:
        return { x: '-100%' };
    }
  };
  
  const getPanelStyles = () => {
    switch (position) {
      case 'left':
        return 'left-0 top-0 h-full w-80';
      case 'right':
        return 'right-0 top-0 h-full w-80';
      case 'top':
        return 'top-0 left-0 w-full h-80';
      case 'bottom':
        return 'bottom-0 left-0 w-full h-80';
      default:
        return 'left-0 top-0 h-full w-80';
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* オーバーレイ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-40"
          />
          
          {/* パネル */}
          <motion.div
            initial={getSlideDirection()}
            animate={{ x: 0, y: 0 }}
            exit={getSlideDirection()}
            transition={{ type: 'spring', damping: 20 }}
            className={`fixed z-50 bg-white dark:bg-gray-800 shadow-2xl ${getPanelStyles()}`}
          >
            {/* ヘッダー */}
            <div className="absolute top-4 right-4">
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            
            {/* コンテンツ */}
            <div className="h-full overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

SlideInPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  position: PropTypes.oneOf(['left', 'right', 'top', 'bottom']),
  children: PropTypes.node.isRequired
};

export default SlideInPanel;
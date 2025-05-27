// スマートヒント

import React from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, AlertCircle } from 'lucide-react';

const SmartHints = ({ hint, onDismiss }) => {
  const getIcon = () => {
    switch (hint.type) {
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };
  
  const getColor = () => {
    switch (hint.type) {
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300';
    }
  };
  
  const getPosition = () => {
    switch (hint.position) {
      case 'top':
        return 'top-20 left-1/2 transform -translate-x-1/2';
      case 'bottom':
        return 'bottom-20 left-1/2 transform -translate-x-1/2';
      case 'center':
      default:
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
    }
  };
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: hint.position === 'top' ? -10 : hint.position === 'bottom' ? 10 : 0 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`fixed z-30 ${getPosition()}`}
      >
        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${getColor()}`}>
          {getIcon()}
          <span className="text-sm font-medium">{hint.text}</span>
          <button
            onClick={onDismiss}
            className="ml-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

SmartHints.propTypes = {
  hint: PropTypes.shape({
    text: PropTypes.string.isRequired,
    position: PropTypes.oneOf(['top', 'center', 'bottom']),
    type: PropTypes.oneOf(['info', 'error', 'warning'])
  }).isRequired,
  onDismiss: PropTypes.func.isRequired
};

export default SmartHints;
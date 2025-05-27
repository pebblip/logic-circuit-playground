import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Lightbulb } from 'lucide-react';

const ContextualHelp = ({ message, type = 'info' }) => {
  const icon = type === 'hint' ? <Lightbulb className="w-5 h-5" /> : <Info className="w-5 h-5" />;
  
  const bgColor = type === 'hint' ? 'bg-yellow-50' : 'bg-blue-50';
  const borderColor = type === 'hint' ? 'border-yellow-200' : 'border-blue-200';
  const textColor = type === 'hint' ? 'text-yellow-800' : 'text-blue-800';
  const iconColor = type === 'hint' ? 'text-yellow-600' : 'text-blue-600';

  return (
    <AnimatePresence mode="wait">
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className={`${bgColor} ${borderColor} border-t px-4 py-3`}
        >
          <div className="flex items-center justify-center space-x-3">
            <div className={iconColor}>
              {icon}
            </div>
            <p className={`text-sm ${textColor}`}>
              {message}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContextualHelp;
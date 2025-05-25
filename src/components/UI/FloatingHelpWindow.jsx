import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import Draggable from 'react-draggable';
import { X, Minimize2, Maximize2, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GateReference from './GateReference';
import OperationGuide from './OperationGuide';
import { colors } from '../../styles/design-tokens';

const FloatingHelpWindow = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('gates');
  const [isMinimized, setIsMinimized] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 600, height: 500 });
  const nodeRef = useRef(null);
  
  console.log('FloatingHelpWindow render, isOpen:', isOpen);

  const tabs = [
    { id: 'gates', label: 'ゲート一覧', icon: '🔌' },
    { id: 'guide', label: '操作ガイド', icon: '📖' }
  ];

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <Draggable
          handle=".drag-handle"
          defaultPosition={{ x: 100, y: 100 }}
          nodeRef={nodeRef}
        >
          <motion.div
            ref={nodeRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute bg-white rounded-lg shadow-2xl"
            style={{
              width: isMinimized ? 300 : windowSize.width,
              height: isMinimized ? 48 : windowSize.height,
              maxWidth: '90vw',
              maxHeight: '80vh',
              zIndex: 9999,
              top: 0,
              left: 0
            }}
          >
            {/* Header */}
            <div className="drag-handle flex items-center justify-between p-3 bg-blue-600 text-white rounded-t-lg cursor-move">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                <h3 className="font-semibold">ヘルプ・リファレンス</h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-blue-700 rounded transition-colors"
                  title={isMinimized ? "最大化" : "最小化"}
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-blue-700 rounded transition-colors"
                  title="閉じる"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            {!isMinimized && (
              <div className="flex flex-col h-full">
                {/* Tabs */}
                <div className="flex border-b border-gray-200 bg-gray-50">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex-1 flex items-center justify-center gap-2 px-4 py-3
                        text-sm font-medium transition-all
                        ${activeTab === tab.id
                          ? 'text-blue-600 bg-white border-b-2 border-blue-500'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                        }
                      `}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-auto bg-white rounded-b-lg" style={{ height: 'calc(100% - 48px - 48px)' }}>
                  {activeTab === 'gates' && (
                    <div className="p-4">
                      <GateReference />
                    </div>
                  )}
                  {activeTab === 'guide' && (
                    <div className="p-4">
                      <OperationGuide />
                    </div>
                  )}
                </div>

                {/* Resize Handle */}
                <div 
                  className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const startX = e.clientX;
                    const startY = e.clientY;
                    const startWidth = windowSize.width;
                    const startHeight = windowSize.height;

                    const handleMouseMove = (e) => {
                      const newWidth = Math.max(400, Math.min(1200, startWidth + e.clientX - startX));
                      const newHeight = Math.max(300, Math.min(800, startHeight + e.clientY - startY));
                      setWindowSize({ width: newWidth, height: newHeight });
                    };

                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };

                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                >
                  <svg className="w-4 h-4 text-gray-400" viewBox="0 0 16 16">
                    <path fill="currentColor" d="M13 13L3 13L13 3Z" />
                  </svg>
                </div>
              </div>
            )}
          </motion.div>
        </Draggable>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default FloatingHelpWindow;
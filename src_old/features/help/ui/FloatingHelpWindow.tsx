import React, { useState } from 'react';
import Draggable from 'react-draggable';
import { Resizable } from 'react-resizable';
import { X, HelpCircle, Book, Wrench } from 'lucide-react';
import { GateReferenceContent } from './GateReferenceContent';
import { OperationGuideContent } from './OperationGuideContent';
import './FloatingHelpWindow.css';

interface FloatingHelpWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FloatingHelpWindow: React.FC<FloatingHelpWindowProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'gates' | 'operations'>('gates');
  const [size, setSize] = useState({ width: 600, height: 500 });

  if (!isOpen) return null;

  const handleResize = (event: any, { size }: any) => {
    setSize({ width: size.width, height: size.height });
  };

  return (
    <Draggable
      handle=".help-window-header"
      defaultPosition={{ x: window.innerWidth / 2 - 300, y: 100 }}
      bounds="parent"
    >
      <Resizable
        width={size.width}
        height={size.height}
        onResize={handleResize}
        minConstraints={[400, 300]}
        maxConstraints={[800, 700]}
        handle={<div className="resize-handle" />}
      >
        <div className="floating-help-window" style={{ width: size.width, height: size.height }}>
          <div className="help-window-header">
            <div className="help-window-title">
              <HelpCircle size={20} />
              <span>Help & Documentation</span>
            </div>
            <button className="help-window-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
          
          <div className="help-window-tabs">
            <button
              className={`help-tab ${activeTab === 'gates' ? 'active' : ''}`}
              onClick={() => setActiveTab('gates')}
            >
              <Book size={16} />
              Gates Reference
            </button>
            <button
              className={`help-tab ${activeTab === 'operations' ? 'active' : ''}`}
              onClick={() => setActiveTab('operations')}
            >
              <Wrench size={16} />
              Operation Guide
            </button>
          </div>
          
          <div className="help-window-content">
            {activeTab === 'gates' ? <GateReferenceContent /> : <OperationGuideContent />}
          </div>
        </div>
      </Resizable>
    </Draggable>
  );
};
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Save, ChevronLeft, ChevronRight, Terminal, TableProperties } from 'lucide-react';
import PropertiesPanel from './PropertiesPanel';
import SavedCircuitsPanel from './SavedCircuitsPanel';
import Console from './Console';
import TruthTable from './TruthTable';
import { colors } from '../../styles/design-tokens';

const RightPanel = ({
  selectedGate,
  savedCircuits,
  onLoadCircuit,
  onSaveCircuit,
  gates,
  connections,
  consoleOutput = [],
  isCollapsed: externalIsCollapsed,
  onToggleCollapse
}) => {
  const [activeTab, setActiveTab] = useState('properties');
  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : false;

  // Auto-switch to properties tab when a gate is selected
  useEffect(() => {
    if (selectedGate && activeTab !== 'properties') {
      setActiveTab('properties');
    }
  }, [selectedGate]);

  const tabs = [
    { id: 'properties', label: 'プロパティ', icon: Settings, disabled: !selectedGate },
    { id: 'console', label: 'コンソール', icon: Terminal },
    { id: 'truth', label: '真理値表', icon: TableProperties },
    { id: 'saved', label: '保存済み', icon: Save }
  ];

  return (
    <div 
      className={`relative h-full transition-all duration-300 ${
        isCollapsed ? 'w-0' : 'w-80'
      }`}
      style={{
        backgroundColor: colors.ui.surface,
        borderLeft: `1px solid ${colors.ui.border}`
      }}
    >
      {/* Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -left-8 top-1/2 -translate-y-1/2 w-8 h-16 
                   bg-white hover:bg-gray-50 rounded-l-lg
                   flex items-center justify-center transition-all
                   border border-r-0 border-gray-200 shadow-md"
        aria-label={isCollapsed ? "パネルを展開" : "パネルを折りたたむ"}
      >
        {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* Panel Content */}
      <AnimatePresence mode="wait">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: "spring", damping: 20 }}
            className="flex flex-col h-full overflow-hidden"
          >
            {/* Tab Header */}
            <div className="flex border-b border-gray-200 bg-white">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => !tab.disabled && setActiveTab(tab.id)}
                  disabled={tab.disabled}
                  className={`
                    flex-1 flex items-center justify-center gap-1 px-2 py-3
                    text-sm font-medium transition-all
                    ${activeTab === tab.id 
                      ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-500' 
                      : tab.disabled
                        ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }
                  `}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden bg-white">
              <div className="h-full">
                {activeTab === 'properties' && selectedGate && (
                  <div className="h-full overflow-auto">
                    <PropertiesPanel
                      selectedGate={selectedGate}
                      savedCircuits={savedCircuits}
                      onLoadCircuit={onLoadCircuit}
                      onSaveCircuit={onSaveCircuit}
                    />
                  </div>
                )}

                {activeTab === 'console' && (
                  <div className="h-full overflow-auto">
                    <Console logs={consoleOutput} />
                  </div>
                )}

                {activeTab === 'truth' && (
                  <div className="h-full overflow-auto">
                    <TruthTable gates={gates} connections={connections} />
                  </div>
                )}

                {activeTab === 'saved' && (
                  <div className="h-full overflow-auto">
                    <SavedCircuitsPanel 
                      savedCircuits={savedCircuits}
                      onLoadCircuit={onLoadCircuit}
                      onSaveCircuit={onSaveCircuit}
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RightPanel;
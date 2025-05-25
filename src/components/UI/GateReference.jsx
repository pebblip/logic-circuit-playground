import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Search, X } from 'lucide-react';
import { gateDocumentation, gateCategories } from '../../data/gateDocumentation';
import GateIcon from './GateIcon';

const GateReference = () => {
  const [expandedCategories, setExpandedCategories] = useState(['basic']);
  const [selectedGate, setSelectedGate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // 検索フィルタリング
  const filterGates = () => {
    if (!searchTerm) return gateCategories;
    
    const filtered = {};
    Object.entries(gateCategories).forEach(([categoryId, category]) => {
      const matchingGates = category.gates.filter(gateType => {
        const doc = gateDocumentation[gateType];
        return (
          gateType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      
      if (matchingGates.length > 0) {
        filtered[categoryId] = { ...category, gates: matchingGates };
      }
    });
    
    return filtered;
  };

  const filteredCategories = filterGates();

  return (
    <div className="flex h-full">
      {/* Gate List */}
      <div className={`${selectedGate ? 'w-1/3' : 'w-full'} 
                      border-r border-gray-700 overflow-y-auto`}>
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ゲートを検索..."
              className="w-full pl-10 pr-8 py-2 bg-gray-700 border border-gray-600 
                       rounded-lg text-gray-200 placeholder-gray-400
                       focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 
                         text-gray-400 hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="p-4 space-y-2">
          {Object.entries(filteredCategories).map(([categoryId, category]) => (
            <div key={categoryId} className="border border-gray-700 rounded-lg overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(categoryId)}
                className="w-full flex items-center justify-between p-3 
                         bg-gray-750 hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {expandedCategories.includes(categoryId) ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="font-medium text-gray-200">{category.name}</span>
                  <span className="text-xs text-gray-500">({category.gates.length})</span>
                </div>
              </button>

              {/* Category Gates */}
              <AnimatePresence>
                {expandedCategories.includes(categoryId) && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-2 space-y-1 bg-gray-800">
                      <p className="text-xs text-gray-400 px-2 pb-2">
                        {category.description}
                      </p>
                      {category.gates.map(gateType => {
                        const doc = gateDocumentation[gateType];
                        return (
                          <button
                            key={gateType}
                            onClick={() => setSelectedGate(gateType)}
                            className={`
                              w-full flex items-center gap-3 p-2 rounded-lg
                              transition-all text-left
                              ${selectedGate === gateType 
                                ? 'bg-blue-600 text-white' 
                                : 'hover:bg-gray-700 text-gray-300'
                              }
                            `}
                          >
                            <div className="w-8 h-8 flex items-center justify-center">
                              <GateIcon type={gateType} className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{doc.name}</div>
                              <div className={`text-xs ${
                                selectedGate === gateType ? 'text-blue-200' : 'text-gray-500'
                              }`}>
                                {doc.symbol}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Gate Details */}
      <AnimatePresence>
        {selectedGate && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '66.666667%', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-y-auto bg-gray-850"
          >
            <GateDetails 
              gateType={selectedGate} 
              onClose={() => setSelectedGate(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Gate Details Component
const GateDetails = ({ gateType, onClose }) => {
  const doc = gateDocumentation[gateType];
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center bg-gray-700 rounded-lg">
            <GateIcon type={gateType} className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-100">{doc.name}</h2>
            <p className="text-gray-400 mt-1">{doc.description}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-200 p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Truth Table */}
      <div>
        <h3 className="text-lg font-semibold text-gray-200 mb-3">真理値表</h3>
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700">
                {gateType === 'SWITCH' || gateType === 'CLOCK' ? (
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">
                    出力
                  </th>
                ) : (
                  <>
                    {doc.truthTable[0]?.inputs.map((_, index) => (
                      <th key={index} className="px-4 py-2 text-center text-sm font-medium text-gray-300">
                        {['D-FF', 'T-FF', 'JK-FF', 'RS-FF'].includes(gateType) 
                          ? ['D', 'T', 'J', 'K', 'S', 'R', 'CLK'][index] 
                          : `入力${index + 1}`
                        }
                      </th>
                    ))}
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-300 border-l border-gray-600">
                      出力
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {doc.truthTable.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-750' : 'bg-gray-800'}>
                  {row.inputs ? (
                    <>
                      {row.inputs.map((input, i) => (
                        <td key={i} className="px-4 py-2 text-center text-gray-300">
                          <span className={`inline-block w-6 h-6 rounded ${
                            input === 1 ? 'bg-red-500' : input === 0 ? 'bg-gray-600' : ''
                          } text-white font-mono`}>
                            {input}
                          </span>
                        </td>
                      ))}
                      <td className="px-4 py-2 text-center border-l border-gray-600">
                        <span className={`inline-block w-6 h-6 rounded ${
                          row.output === 1 ? 'bg-green-500' : 
                          row.output === 0 ? 'bg-gray-600' : 
                          'bg-gray-700 px-2 w-auto'
                        } text-white font-mono`}>
                          {row.output}
                        </span>
                      </td>
                    </>
                  ) : (
                    <td className="px-4 py-2 text-gray-300" colSpan="2">
                      {row.output}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Examples */}
      {doc.examples && doc.examples.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-200 mb-3">使用例</h3>
          <div className="space-y-3">
            {doc.examples.map((example, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-blue-400 mb-1">{example.title}</h4>
                <p className="text-sm text-gray-300">{example.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      {doc.tips && doc.tips.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-200 mb-3">ポイント</h3>
          <ul className="space-y-2">
            {doc.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-blue-400 mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Visual Diagram */}
      <div>
        <h3 className="text-lg font-semibold text-gray-200 mb-3">回路図</h3>
        <div className="bg-gray-800 rounded-lg p-8 flex justify-center">
          <div className="relative">
            <GateIcon type={gateType} className="w-24 h-24" />
            {/* Input/Output labels */}
            {gateType !== 'SWITCH' && gateType !== 'CLOCK' && gateType !== 'LED' && (
              <>
                {/* Inputs */}
                {doc.truthTable[0]?.inputs.map((_, index) => (
                  <div
                    key={`input-${index}`}
                    className="absolute left-0 text-xs text-gray-400"
                    style={{ 
                      top: `${30 + (index * 40) / (doc.truthTable[0].inputs.length || 1)}%`,
                      transform: 'translateX(-150%)'
                    }}
                  >
                    入力{index + 1}
                  </div>
                ))}
                {/* Output */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[150%] text-xs text-gray-400">
                  出力
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GateReference;
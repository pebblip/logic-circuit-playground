import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDownIcon, 
  ChevronRightIcon,
  TableCellsIcon,
  ChartBarIcon,
  CpuChipIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const PropertiesPanel = ({
  selectedGate,
  simulation,
  truthTable,
  currentLevel,
  gates = [],
  connections = []
}) => {
  const [expandedSections, setExpandedSections] = useState({
    truthTable: true,
    gateInfo: true,
    timing: false,
    debug: false
  });
  
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // 現在の回路の真理値表を計算
  const calculateCurrentTruthTable = () => {
    const inputs = gates.filter(g => g.type === 'INPUT').sort((a, b) => a.y - b.y);
    const outputs = gates.filter(g => g.type === 'OUTPUT');
    
    if (inputs.length === 0 || outputs.length === 0) return null;
    
    const rows = [];
    const inputCount = inputs.length;
    const combinations = Math.pow(2, inputCount);
    
    for (let i = 0; i < combinations; i++) {
      const inputValues = [];
      for (let j = 0; j < inputCount; j++) {
        inputValues.push((i >> (inputCount - 1 - j)) & 1);
      }
      
      // TODO: シミュレーション結果から出力値を取得
      const outputValue = '?';
      
      rows.push({
        inputs: inputValues,
        output: outputValue
      });
    }
    
    return rows;
  };
  
  const currentTruthTable = calculateCurrentTruthTable();
  
  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">プロパティ</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {/* 真理値表セクション */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection('truthTable')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <TableCellsIcon className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-700">真理値表</span>
            </div>
            {expandedSections.truthTable ? 
              <ChevronDownIcon className="w-4 h-4 text-gray-500" /> : 
              <ChevronRightIcon className="w-4 h-4 text-gray-500" />
            }
          </button>
          
          {expandedSections.truthTable && (
            <div className="p-4">
              {truthTable ? (
                <div className="space-y-3">
                  <div className="text-sm font-medium text-gray-600">目標</div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        {truthTable[0].inputs.map((_, i) => (
                          <th key={i} className="px-2 py-1 text-center">
                            入力{i + 1}
                          </th>
                        ))}
                        <th className="px-2 py-1 text-center">出力</th>
                      </tr>
                    </thead>
                    <tbody>
                      {truthTable.map((row, i) => (
                        <tr key={i} className="border-b border-gray-100">
                          {row.inputs.map((input, j) => (
                            <td key={j} className="px-2 py-1 text-center">
                              <span className={`font-mono ${input ? 'text-green-600' : 'text-gray-400'}`}>
                                {input}
                              </span>
                            </td>
                          ))}
                          <td className="px-2 py-1 text-center">
                            <span className={`font-mono ${row.output ? 'text-green-600' : 'text-gray-400'}`}>
                              {row.output}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {currentTruthTable && (
                    <>
                      <div className="text-sm font-medium text-gray-600 mt-4">現在の回路</div>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            {currentTruthTable[0].inputs.map((_, i) => (
                              <th key={i} className="px-2 py-1 text-center">
                                入力{i + 1}
                              </th>
                            ))}
                            <th className="px-2 py-1 text-center">出力</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentTruthTable.map((row, i) => (
                            <tr key={i} className="border-b border-gray-100">
                              {row.inputs.map((input, j) => (
                                <td key={j} className="px-2 py-1 text-center">
                                  <span className={`font-mono ${input ? 'text-green-600' : 'text-gray-400'}`}>
                                    {input}
                                  </span>
                                </td>
                              ))}
                              <td className="px-2 py-1 text-center">
                                <span className="font-mono text-gray-400">
                                  {row.output}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  回路を作成すると真理値表が表示されます
                </p>
              )}
            </div>
          )}
        </div>
        
        {/* ゲート情報セクション */}
        {selectedGate && (
          <div className="border-b border-gray-200">
            <button
              onClick={() => toggleSection('gateInfo')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <InformationCircleIcon className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">ゲート情報</span>
              </div>
              {expandedSections.gateInfo ? 
                <ChevronDownIcon className="w-4 h-4 text-gray-500" /> : 
                <ChevronRightIcon className="w-4 h-4 text-gray-500" />
              }
            </button>
            
            {expandedSections.gateInfo && (
              <div className="p-4 space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-600">タイプ</div>
                  <div className="text-lg font-semibold text-gray-800">
                    {selectedGate.type}ゲート
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-600">説明</div>
                  <div className="text-sm text-gray-700">
                    {selectedGate.type === 'AND' && '両方の入力が1の時だけ1を出力'}
                    {selectedGate.type === 'OR' && 'どちらかの入力が1なら1を出力'}
                    {selectedGate.type === 'NOT' && '入力を反転して出力'}
                    {selectedGate.type === 'XOR' && '入力が異なる時1を出力'}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-600">現在の状態</div>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className={`w-3 h-3 rounded-full ${
                      simulation?.[selectedGate.id] ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    <span className="text-sm text-gray-700">
                      {simulation?.[selectedGate.id] ? 'ON (1)' : 'OFF (0)'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* タイミングチャート（レベル3以降） */}
        {currentLevel >= 3 && (
          <div className="border-b border-gray-200">
            <button
              onClick={() => toggleSection('timing')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <ChartBarIcon className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">タイミングチャート</span>
              </div>
              {expandedSections.timing ? 
                <ChevronDownIcon className="w-4 h-4 text-gray-500" /> : 
                <ChevronRightIcon className="w-4 h-4 text-gray-500" />
              }
            </button>
            
            {expandedSections.timing && (
              <div className="p-4">
                <p className="text-sm text-gray-500">
                  タイミングチャートはレベル3で利用可能になります
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* デバッグ情報（レベル5以降） */}
        {currentLevel >= 5 && (
          <div className="border-b border-gray-200">
            <button
              onClick={() => toggleSection('debug')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <CpuChipIcon className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">デバッグ</span>
              </div>
              {expandedSections.debug ? 
                <ChevronDownIcon className="w-4 h-4 text-gray-500" /> : 
                <ChevronRightIcon className="w-4 h-4 text-gray-500" />
              }
            </button>
            
            {expandedSections.debug && (
              <div className="p-4">
                <div className="space-y-2 text-sm font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ゲート数:</span>
                    <span className="text-gray-800">{gates.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">接続数:</span>
                    <span className="text-gray-800">{connections.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">遅延:</span>
                    <span className="text-gray-800">~{gates.length * 10}ns</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* ヘルプテキスト */}
      <div className="p-3 bg-blue-50 border-t border-blue-200">
        <p className="text-xs text-blue-700">
          {currentLevel === 1 && '💡 真理値表を見ながら回路を作りましょう'}
          {currentLevel === 2 && '💡 複数のゲートを組み合わせてみましょう'}
          {currentLevel === 3 && '💡 フィードバックループで記憶回路を作れます'}
          {currentLevel >= 4 && '💡 より複雑な回路に挑戦しましょう'}
        </p>
      </div>
    </div>
  );
};

export default PropertiesPanel;
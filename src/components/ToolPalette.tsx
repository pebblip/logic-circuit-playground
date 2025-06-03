import React, { useState } from 'react';
import { GateType, CustomGateDefinition, CustomGatePin } from '../types/circuit';
import { useCircuitStore } from '../stores/circuitStore';
import { GateFactory } from '../models/gates/GateFactory';
import { CreateCustomGateDialog } from './dialogs/CreateCustomGateDialog';
import { TruthTableDisplay } from './TruthTableDisplay';
import { generateTruthTable, TruthTableResult } from '../utils/truthTableGenerator';

const BASIC_GATES: { type: GateType; label: string }[] = [
  { type: 'AND', label: 'AND' },
  { type: 'OR', label: 'OR' },
  { type: 'NOT', label: 'NOT' },
  { type: 'XOR', label: 'XOR' },
  { type: 'NAND', label: 'NAND' },
  { type: 'NOR', label: 'NOR' },
];

const IO_GATES: { type: GateType; label: string }[] = [
  { type: 'INPUT', label: 'INPUT' },
  { type: 'OUTPUT', label: 'OUTPUT' },
  { type: 'CLOCK', label: 'CLOCK' },
];

// 特殊ゲート
const SPECIAL_GATES: { type: GateType; label: string }[] = [
  { type: 'D-FF', label: 'D-FF' },
  { type: 'SR-LATCH', label: 'SR-LATCH' },
  { type: 'MUX', label: 'MUX' },
];

// デモ用カスタムゲート定義
const DEMO_CUSTOM_GATES: CustomGateDefinition[] = [
  {
    id: 'demo-half-adder',
    name: 'HalfAdder',
    displayName: '半加算器',
    description: 'A + B = Sum + Carry',
    inputs: [
      { name: 'A', index: 0 },
      { name: 'B', index: 1 }
    ],
    outputs: [
      { name: 'S', index: 0 },
      { name: 'C', index: 1 }
    ],
    truthTable: {
      '00': '00',
      '01': '10',
      '10': '10',
      '11': '01'
    },
    icon: '➕',
    category: 'arithmetic',
    width: 100,
    height: 80,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'demo-my-gate',
    name: 'MyGate',
    displayName: 'MyGate',
    description: 'カスタムゲートのサンプル',
    inputs: [
      { name: 'A', index: 0 },
      { name: 'B', index: 1 }
    ],
    outputs: [
      { name: 'Y', index: 0 }
    ],
    truthTable: {
      '00': '0',
      '01': '1',
      '10': '1',
      '11': '0'
    },
    icon: '🔧',
    category: 'custom',
    width: 100,
    height: 80,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
];

export const ToolPalette: React.FC = () => {
  const { gates, customGates, addCustomGate, createCustomGateFromCurrentCircuit, allowedGates, appMode } = useCircuitStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isTruthTableOpen, setIsTruthTableOpen] = useState(false);
  const [currentTruthTable, setCurrentTruthTable] = useState<{
    result: TruthTableResult;
    inputNames: string[];
    outputNames: string[];
    gateName: string;
  } | null>(null);
  const [dialogInitialData, setDialogInitialData] = useState<{
    initialInputs?: CustomGatePin[];
    initialOutputs?: CustomGatePin[];
    isFullCircuit?: boolean;
  }>({});
  const [draggedGate, setDraggedGate] = useState<{ type: GateType | 'CUSTOM', customDefinition?: CustomGateDefinition } | null>(null);
  
  // ドラッグ中のゲート情報を共有するため、windowオブジェクトに設定
  React.useEffect(() => {
    (window as any)._draggedGate = draggedGate;
  }, [draggedGate]);
  
  // カスタムゲート作成ダイアログを開くイベントリスナー
  React.useEffect(() => {
    const handleOpenDialog = (event: CustomEvent) => {
      const { initialInputs, initialOutputs, isFullCircuit } = event.detail;
      setDialogInitialData({ initialInputs, initialOutputs, isFullCircuit });
      setIsCreateDialogOpen(true);
    };
    
    window.addEventListener('open-custom-gate-dialog', handleOpenDialog as any);
    
    return () => {
      window.removeEventListener('open-custom-gate-dialog', handleOpenDialog as any);
    };
  }, []);

  // 自動配置は削除 - ドラッグ&ドロップのみ使用

  // カスタムゲートの自動配置も削除 - ドラッグ&ドロップのみ使用

  const handleCreateCustomGate = (definition: CustomGateDefinition) => {
    console.log('🚀 カスタムゲート作成開始:', {
      definition,
      definitionInputs: definition.inputs,
      definitionOutputs: definition.outputs,
      inputsLength: definition.inputs.length,
      outputsLength: definition.outputs.length
    });
    
    const state = useCircuitStore.getState();
    const { gates, wires } = state;
    
    // isFullCircuitフラグがある場合は全回路から作成
    if (dialogInitialData.isFullCircuit) {
      const inputGates = gates.filter(g => g.type === 'INPUT');
      const outputGates = gates.filter(g => g.type === 'OUTPUT');
      
      // 内部回路の座標を正規化（左上を0,0に）
      const minX = Math.min(...gates.map(g => g.position.x));
      const minY = Math.min(...gates.map(g => g.position.y));
      
      const normalizedGates = gates.map(g => ({
        ...g,
        position: {
          x: g.position.x - minX,
          y: g.position.y - minY,
        },
      }));
      
      // 入出力マッピングを作成
      const inputMappings: Record<number, { gateId: string; pinIndex: number }> = {};
      inputGates.forEach((gate, index) => {
        inputMappings[index] = {
          gateId: gate.id,
          pinIndex: -1, // INPUTゲートの出力ピン
        };
      });
      
      const outputMappings: Record<number, { gateId: string; pinIndex: number }> = {};
      outputGates.forEach((gate, index) => {
        outputMappings[index] = {
          gateId: gate.id,
          pinIndex: 0, // OUTPUTゲートの入力ピン
        };
      });
      
      // 内部回路情報を定義に追加
      definition.internalCircuit = {
        gates: normalizedGates,
        wires: wires,
        inputMappings,
        outputMappings,
      };
      
      // 真理値表を自動生成
      try {
        const truthTableResult = generateTruthTable(
          normalizedGates,
          wires,
          inputGates,
          outputGates
        );
        
        // 真理値表をRecord形式に変換
        const truthTable: Record<string, string> = {};
        truthTableResult.table.forEach(row => {
          truthTable[row.inputs] = row.outputs;
        });
        
        definition.truthTable = truthTable;
        
        // 作成後に真理値表を表示
        const inputNames = definition.inputs.map(input => input.name);
        const outputNames = definition.outputs.map(output => output.name);
        
        setCurrentTruthTable({
          result: truthTableResult,
          inputNames,
          outputNames,
          gateName: definition.displayName
        });
        setIsTruthTableOpen(true);
        
        console.log('🎉 真理値表を生成しました:', { truthTableResult, definition });
        
      } catch (error) {
        console.warn('真理値表の生成に失敗しました:', error);
      }
    }
    
    // 新しいカスタムゲート定義をストアに追加
    addCustomGate(definition);
    setIsCreateDialogOpen(false);
    setDialogInitialData({});
  };

  const renderGatePreview = (type: GateType) => {
    if (type === 'INPUT') {
      return (
        <svg className="tool-preview" viewBox="-40 -20 80 40">
          <rect fill="#1a1a1a" stroke="#444" x="-25" y="-15" width="50" height="30" rx="15"/>
          <circle fill="#666" cx="0" cy="0" r="10"/>
        </svg>
      );
    }
    if (type === 'OUTPUT') {
      return (
        <svg className="tool-preview" viewBox="-25 -25 50 50">
          <circle fill="#1a1a1a" stroke="#444" cx="0" cy="0" r="20"/>
          <text x="0" y="5" style={{ fontSize: '20px', textAnchor: 'middle' }}>💡</text>
        </svg>
      );
    }
    
    // 特殊ゲートのプレビュー
    if (type === 'CLOCK') {
      return (
        <svg className="tool-preview" viewBox="-50 -50 100 100">
          {/* 円形デザイン（Gate.tsxと統一） */}
          <circle 
            className="gate"
            cx="0" cy="0" r="30"
            fill="#1a1a1a"
            stroke="#444"
            strokeWidth="2"
          />
          {/* 時計アイコン */}
          <text x="0" y="-3" className="gate-text" style={{ fontSize: '16px' }}>⏰</text>
          {/* パルス波形表示（簡略版） */}
          <path 
            d="M -15 15 h4 v-6 h4 v6 h4 v-6 h4 v6 h3" 
            stroke="#0ff" 
            strokeWidth="1" 
            fill="none"
            opacity="0.8"
          />
        </svg>
      );
    }
    if (type === 'D-FF') {
      return (
        <svg className="tool-preview" viewBox="-60 -50 120 100">
          <rect className="gate" x="-40" y="-30" width="80" height="60" rx="8"/>
          <text className="gate-text" x="0" y="0" style={{ fontSize: '8px' }}>D-FF</text>
          <text className="gate-text" x="-30" y="-15" style={{ fontSize: '8px', fill: '#999' }}>D</text>
          <text className="gate-text" x="-30" y="15" style={{ fontSize: '8px', fill: '#999' }}>CLK</text>
          <text className="gate-text" x="30" y="-15" style={{ fontSize: '8px', fill: '#999' }}>Q</text>
          <text className="gate-text" x="30" y="15" style={{ fontSize: '8px', fill: '#999' }}>Q̄</text>
        </svg>
      );
    }
    if (type === 'SR-LATCH') {
      return (
        <svg className="tool-preview" viewBox="-60 -50 120 100">
          <rect className="gate" x="-40" y="-30" width="80" height="60" rx="8"/>
          <text className="gate-text" x="0" y="-5" style={{ fontSize: '8px' }}>SR</text>
          <text className="gate-text" x="0" y="8" style={{ fontSize: '7px', fill: '#999' }}>LATCH</text>
          <text className="gate-text" x="-30" y="-15" style={{ fontSize: '8px', fill: '#999' }}>S</text>
          <text className="gate-text" x="-30" y="15" style={{ fontSize: '8px', fill: '#999' }}>R</text>
          <text className="gate-text" x="30" y="-15" style={{ fontSize: '8px', fill: '#999' }}>Q</text>
          <text className="gate-text" x="30" y="15" style={{ fontSize: '8px', fill: '#999' }}>Q̄</text>
        </svg>
      );
    }
    if (type === 'MUX') {
      return (
        <svg className="tool-preview" viewBox="-60 -50 120 100">
          <rect className="gate" x="-40" y="-30" width="80" height="60" rx="8"/>
          <text className="gate-text" x="0" y="0" style={{ fontSize: '8px' }}>MUX</text>
          <text className="gate-text" x="-30" y="-18" style={{ fontSize: '7px', fill: '#999' }}>A</text>
          <text className="gate-text" x="-30" y="0" style={{ fontSize: '7px', fill: '#999' }}>B</text>
          <text className="gate-text" x="-30" y="18" style={{ fontSize: '7px', fill: '#999' }}>S</text>
          <text className="gate-text" x="30" y="0" style={{ fontSize: '7px', fill: '#999' }}>Y</text>
        </svg>
      );
    }
    
    return (
      <svg className="tool-preview" viewBox="-50 -30 100 60">
        <rect className="gate" x="-35" y="-25" width="70" height="50" rx="8"/>
        <text className="gate-text" x="0" y="0">{type}</text>
      </svg>
    );
  };

  const renderCustomGatePreview = (definition: CustomGateDefinition) => {
    const scale = 0.8; // ツールパレット用にスケールダウン
    const width = definition.width * scale;
    const height = definition.height * scale;
    
    return (
      <svg className="tool-preview" viewBox={`-${width/2 + 10} -${height/2 + 10} ${width + 20} ${height + 20}`}>
        {/* カスタムゲートの外側境界 */}
        <rect 
          x={-width/2 - 2} y={-height/2 - 2} 
          width={width + 4} height={height + 4} 
          rx="6" fill="none" stroke="#6633cc" strokeWidth="2" opacity="0.3"
        />
        
        {/* カスタムゲートの本体 */}
        <rect 
          x={-width/2} y={-height/2} 
          width={width} height={height} 
          rx="4" fill="rgba(102, 51, 153, 0.1)" stroke="#6633cc" strokeWidth="1"
        />
        
        {/* アイコン */}
        {definition.icon && (
          <text x="0" y="0" style={{ 
            fontSize: '16px', 
            textAnchor: 'middle', 
            dominantBaseline: 'middle',
            fill: '#ccc'
          }}>
            {definition.icon}
          </text>
        )}
        
        {/* 簡略化されたピン表示 */}
        {definition.inputs.map((_, index) => (
          <circle 
            key={`in-${index}`}
            cx={-width/2 - 4} 
            cy={-((definition.inputs.length - 1) * 8) / 2 + index * 8}
            r="2" 
            fill="#6633cc" 
          />
        ))}
        
        {definition.outputs.map((_, index) => (
          <circle 
            key={`out-${index}`}
            cx={width/2 + 4} 
            cy={-((definition.outputs.length - 1) * 8) / 2 + index * 8}
            r="2" 
            fill="#6633cc" 
          />
        ))}
      </svg>
    );
  };

  return (
    <aside className="tool-palette">
      <div className="section-title">
        <span>🔲</span>
        <span>基本ゲート</span>
      </div>
      <div className="tools-grid">
        {BASIC_GATES.map(({ type, label }) => {
          const isDisabled = allowedGates !== null && !allowedGates.includes(type);
          return (
            <div
              key={type}
              className={`tool-card ${isDisabled ? 'disabled' : ''}`}
              data-gate-type={type}
              title={isDisabled ? '学習モードではこのゲートは使用できません' : 'ドラッグしてキャンバスに配置'}
              draggable={!isDisabled}
              onDragStart={(e) => {
                if (!isDisabled && e.dataTransfer) {
                  setDraggedGate({ type });
                  e.dataTransfer.effectAllowed = 'copy';
                  
                  // プレビュー画像を設定
                  const dragImage = new Image();
                  dragImage.src = 'data:image/svg+xml,<svg></svg>'; // 透明な画像
                  e.dataTransfer.setDragImage(dragImage, 0, 0);
                }
              }}
              onDragEnd={() => setDraggedGate(null)}
              style={{ cursor: isDisabled ? 'not-allowed' : 'grab' }}
            >
              {renderGatePreview(type)}
              <div className="tool-label">{label}</div>
            </div>
          );
        })}
      </div>

      <div className="section-title">
        <span>🔌</span>
        <span>入出力</span>
      </div>
      <div className="tools-grid">
        {IO_GATES.map(({ type, label }) => {
          const isDisabled = allowedGates !== null && !allowedGates.includes(type);
          return (
            <div
              key={type}
              className={`tool-card ${isDisabled ? 'disabled' : ''}`}
              data-gate-type={type}
              title={isDisabled ? '学習モードではこのゲートは使用できません' : 'ドラッグしてキャンバスに配置'}
              draggable={!isDisabled}
              onDragStart={(e) => {
                if (!isDisabled && e.dataTransfer) {
                  setDraggedGate({ type });
                  e.dataTransfer.effectAllowed = 'copy';
                  
                  // プレビュー画像を設定
                  const dragImage = new Image();
                  dragImage.src = 'data:image/svg+xml,<svg></svg>'; // 透明な画像
                  e.dataTransfer.setDragImage(dragImage, 0, 0);
                }
              }}
              onDragEnd={() => setDraggedGate(null)}
              style={{ cursor: isDisabled ? 'not-allowed' : 'grab' }}
            >
              {renderGatePreview(type)}
              <div className="tool-label">{label}</div>
            </div>
          );
        })}
      </div>

      <div className="section-title">
        <span>⚙️</span>
        <span>特殊ゲート</span>
      </div>
      <div className="tools-grid">
        {SPECIAL_GATES.map(({ type, label }) => {
          const isDisabled = allowedGates !== null && !allowedGates.includes(type);
          return (
            <div
              key={type}
              className={`tool-card ${isDisabled ? 'disabled' : ''}`}
              data-gate-type={type}
              title={isDisabled ? '学習モードではこのゲートは使用できません' : 'ドラッグしてキャンバスに配置'}
              draggable={!isDisabled}
              onDragStart={(e) => {
                if (!isDisabled && e.dataTransfer) {
                  setDraggedGate({ type });
                  e.dataTransfer.effectAllowed = 'copy';
                  
                  // プレビュー画像を設定
                  const dragImage = new Image();
                  dragImage.src = 'data:image/svg+xml,<svg></svg>'; // 透明な画像
                  e.dataTransfer.setDragImage(dragImage, 0, 0);
                }
              }}
              onDragEnd={() => setDraggedGate(null)}
              style={{ cursor: isDisabled ? 'not-allowed' : 'grab' }}
            >
              {renderGatePreview(type)}
              <div className="tool-label">{label}</div>
            </div>
          );
        })}
      </div>

      <div className="section-title">
        <span>🔧</span>
        <span>カスタムゲート</span>
      </div>
      <div className="tools-grid">
        {/* デモカスタムゲート（初期表示用） */}
        {DEMO_CUSTOM_GATES.map((definition) => (
          <div
            key={definition.id}
            className="tool-card custom-gate-card"
            data-gate-type="CUSTOM"
            // クリックでの配置は削除
            draggable
            onDragStart={(e) => {
              if (e.dataTransfer) {
                setDraggedGate({ type: 'CUSTOM', customDefinition: definition });
                e.dataTransfer.effectAllowed = 'copy';
                
                // プレビュー画像を設定
                const dragImage = new Image();
                dragImage.src = 'data:image/svg+xml,<svg></svg>'; // 透明な画像
                e.dataTransfer.setDragImage(dragImage, 0, 0);
              }
            }}
            onDragEnd={() => setDraggedGate(null)}
            style={{ cursor: 'grab' }}
          >
            {renderCustomGatePreview(definition)}
            <div className="tool-label">{definition.displayName}</div>
          </div>
        ))}
        
        {/* ユーザー作成のカスタムゲート */}
        {(customGates || []).map((definition) => (
          <div
            key={definition.id}
            className="tool-card custom-gate-card"
            data-gate-type="CUSTOM"
            // クリックでの配置は削除
            draggable
            onDragStart={(e) => {
              if (e.dataTransfer) {
                setDraggedGate({ type: 'CUSTOM', customDefinition: definition });
                e.dataTransfer.effectAllowed = 'copy';
                
                // プレビュー画像を設定
                const dragImage = new Image();
                dragImage.src = 'data:image/svg+xml,<svg></svg>'; // 透明な画像
                e.dataTransfer.setDragImage(dragImage, 0, 0);
              }
            }}
            onDragEnd={() => setDraggedGate(null)}
            onContextMenu={(e) => {
              e.preventDefault();
              // 右クリックで真理値表を表示
              if (definition.internalCircuit && definition.truthTable) {
                const inputNames = definition.inputs.map(input => input.name);
                const outputNames = definition.outputs.map(output => output.name);
                
                // 真理値表をTruthTableResult形式に変換
                const table = Object.entries(definition.truthTable).map(([inputs, outputs]) => ({
                  inputs,
                  outputs,
                  inputValues: inputs.split('').map(bit => bit === '1'),
                  outputValues: outputs.split('').map(bit => bit === '1')
                }));
                
                const result = {
                  table,
                  inputCount: definition.inputs.length,
                  outputCount: definition.outputs.length,
                  isSequential: false,
                  recognizedPattern: undefined // 再計算してもいいが、一旦undefined
                };
                
                setCurrentTruthTable({
                  result,
                  inputNames,
                  outputNames,
                  gateName: definition.displayName
                });
                setIsTruthTableOpen(true);
              }
            }}
            title="左クリック: 配置 | 右クリック: 真理値表表示"
            style={{ cursor: 'grab' }}
          >
            {renderCustomGatePreview(definition)}
            <div className="tool-label">{definition.displayName}</div>
          </div>
        ))}
        
        {/* 現在の回路から作成ボタン */}
        <div
          className="tool-card create-custom-gate"
          onClick={createCustomGateFromCurrentCircuit}
        >
          <svg className="tool-preview" viewBox="-30 -30 60 60">
            <rect 
              x="-25" y="-25" width="50" height="50" 
              rx="8" fill="none" stroke="#6633cc" strokeWidth="2" strokeDasharray="5,5"
            />
            <text x="0" y="0" style={{ 
              fontSize: '20px', 
              textAnchor: 'middle', 
              dominantBaseline: 'middle',
              fill: '#6633cc'
            }}>
              📦
            </text>
          </svg>
          <div className="tool-label">回路→IC</div>
        </div>
      </div>
      
      {/* カスタムゲート作成ダイアログ */}
      <CreateCustomGateDialog
        isOpen={isCreateDialogOpen}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setDialogInitialData({});
        }}
        onSave={handleCreateCustomGate}
        initialInputs={dialogInitialData.initialInputs}
        initialOutputs={dialogInitialData.initialOutputs}
        isReadOnly={dialogInitialData.isFullCircuit}
      />
      
      {/* 真理値表表示ダイアログ */}
      {isTruthTableOpen && currentTruthTable && (
        <TruthTableDisplay
          result={currentTruthTable.result}
          inputNames={currentTruthTable.inputNames}
          outputNames={currentTruthTable.outputNames}
          gateName={currentTruthTable.gateName}
          onClose={() => {
            setIsTruthTableOpen(false);
            setCurrentTruthTable(null);
          }}
        />
      )}
    </aside>
  );
};
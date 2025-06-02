import React, { useState } from 'react';
import { GateType, CustomGateDefinition } from '../types/circuit';
import { useCircuitStore } from '../stores/circuitStore';
import { GateFactory } from '../models/gates/GateFactory';
import { CreateCustomGateDialog } from './dialogs/CreateCustomGateDialog';

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
  const { addGate, gates, customGates, addCustomGate, createCustomGateFromCurrentCircuit } = useCircuitStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [dialogInitialData, setDialogInitialData] = useState<{
    initialInputs?: CustomGatePin[];
    initialOutputs?: CustomGatePin[];
    isFullCircuit?: boolean;
  }>({});
  
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

  const handleToolClick = (type: GateType) => {
    // 既存のゲートの位置を確認して、重ならない位置を計算
    const baseX = 100;
    const baseY = 100;
    const spacing = 100;
    
    let x = baseX;
    let y = baseY;
    let row = 0;
    let col = 0;
    
    // 空いている位置を探す
    while (gates.some(g => 
      Math.abs(g.position.x - x) < 70 && 
      Math.abs(g.position.y - y) < 50
    )) {
      col++;
      if (col > 5) {
        col = 0;
        row++;
      }
      x = baseX + (col * spacing);
      y = baseY + (row * spacing);
    }
    
    addGate(type, { x, y });
  };

  const handleCustomGateClick = (definition: CustomGateDefinition) => {
    // カスタムゲートの配置
    const baseX = 100;
    const baseY = 100;
    const spacing = 120;
    
    let x = baseX;
    let y = baseY;
    let row = 0;
    let col = 0;
    
    while (gates.some(g => 
      Math.abs(g.position.x - x) < definition.width && 
      Math.abs(g.position.y - y) < definition.height
    )) {
      col++;
      if (col > 4) {
        col = 0;
        row++;
      }
      x = baseX + (col * spacing);
      y = baseY + (row * spacing);
    }
    
    const customGate = GateFactory.createCustomGate(definition, { x, y });
    // カスタムゲートを直接ストアに追加
    useCircuitStore.setState(state => ({
      gates: [...state.gates, customGate]
    }));
  };

  const handleCreateCustomGate = (definition: CustomGateDefinition) => {
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
        <svg className="tool-preview" viewBox="-50 -40 100 80">
          <rect className="gate" x="-40" y="-30" width="80" height="60" rx="8"/>
          <path 
            d="M -15 -10 L -15 0 L -5 0 M 5 0 L 15 0 L 15 -10" 
            stroke="#0ff" 
            strokeWidth="2" 
            fill="none"
          />
          <text className="gate-text" x="0" y="20" style={{ fontSize: '12px' }}>CLK</text>
        </svg>
      );
    }
    if (type === 'D-FF') {
      return (
        <svg className="tool-preview" viewBox="-50 -40 100 80">
          <rect className="gate" x="-40" y="-30" width="80" height="60" rx="8"/>
          <text className="gate-text" x="-20" y="-10" style={{ fontSize: '10px' }}>D</text>
          <text className="gate-text" x="-20" y="10" style={{ fontSize: '10px' }}>CLK</text>
          <text className="gate-text" x="20" y="-10" style={{ fontSize: '10px' }}>Q</text>
          <text className="gate-text" x="20" y="10" style={{ fontSize: '10px' }}>Q̄</text>
        </svg>
      );
    }
    if (type === 'SR-LATCH') {
      return (
        <svg className="tool-preview" viewBox="-50 -40 100 80">
          <rect className="gate" x="-40" y="-30" width="80" height="60" rx="8"/>
          <text className="gate-text" x="-20" y="-10" style={{ fontSize: '10px' }}>S</text>
          <text className="gate-text" x="-20" y="10" style={{ fontSize: '10px' }}>R</text>
          <text className="gate-text" x="20" y="-10" style={{ fontSize: '10px' }}>Q</text>
          <text className="gate-text" x="20" y="10" style={{ fontSize: '10px' }}>Q̄</text>
        </svg>
      );
    }
    if (type === 'MUX') {
      return (
        <svg className="tool-preview" viewBox="-50 -40 100 80">
          <polygon 
            className="gate" 
            points="-30,-25 30,-25 30,25 -30,25" 
          />
          <text className="gate-text" x="-20" y="-10" style={{ fontSize: '8px' }}>I0</text>
          <text className="gate-text" x="-20" y="0" style={{ fontSize: '8px' }}>I1</text>
          <text className="gate-text" x="-20" y="10" style={{ fontSize: '8px' }}>S</text>
          <text className="gate-text" x="20" y="0" style={{ fontSize: '8px' }}>Y</text>
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
        {BASIC_GATES.map(({ type, label }) => (
          <div
            key={type}
            className="tool-card"
            data-gate-type={type}
            onClick={() => handleToolClick(type)}
          >
            {renderGatePreview(type)}
            <div className="tool-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="section-title">
        <span>🔌</span>
        <span>入出力</span>
      </div>
      <div className="tools-grid">
        {IO_GATES.map(({ type, label }) => (
          <div
            key={type}
            className="tool-card"
            data-gate-type={type}
            onClick={() => handleToolClick(type)}
          >
            {renderGatePreview(type)}
            <div className="tool-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="section-title">
        <span>⚙️</span>
        <span>特殊ゲート</span>
      </div>
      <div className="tools-grid">
        {SPECIAL_GATES.map(({ type, label }) => (
          <div
            key={type}
            className="tool-card"
            data-gate-type={type}
            onClick={() => handleToolClick(type)}
          >
            {renderGatePreview(type)}
            <div className="tool-label">{label}</div>
          </div>
        ))}
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
            onClick={() => handleCustomGateClick(definition)}
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
            onClick={() => handleCustomGateClick(definition)}
          >
            {renderCustomGatePreview(definition)}
            <div className="tool-label">{definition.displayName}</div>
          </div>
        ))}
        
        {/* 現在の回路から作成ボタン */}
        <div
          className="tool-card create-custom-gate"
          onClick={createCustomGateFromCurrentCircuit}
          style={{ gridColumn: 'span 2' }} // 2カラム分の幅
        >
          <svg className="tool-preview" viewBox="-60 -30 120 60">
            <rect 
              x="-55" y="-25" width="110" height="50" 
              rx="8" fill="none" stroke="#6633cc" strokeWidth="2" strokeDasharray="5,5"
            />
            <text x="0" y="0" style={{ 
              fontSize: '16px', 
              textAnchor: 'middle', 
              dominantBaseline: 'middle',
              fill: '#6633cc'
            }}>
              ➕ 現在の回路から
            </text>
          </svg>
          <div className="tool-label">作成</div>
        </div>
        
        {/* 手動作成ボタン */}
        <div
          className="tool-card create-custom-gate"
          onClick={() => setIsCreateDialogOpen(true)}
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
              ✏️
            </text>
          </svg>
          <div className="tool-label">手動</div>
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
    </aside>
  );
};
import React from 'react';
import { useCircuitStore } from '../../../stores/circuitStore';
import './SimpleGalleryPanel.css';

// ultrathink: 驚きの回路だけを厳選
const AMAZING_CIRCUITS = [
  {
    id: 'not-magic',
    title: '🔄 反転マジック',
    subtitle: 'ON→OFF、OFF→ONに変換する',
    preview: '0 → 1, 1 → 0',
    instruction: '🖱️ 左のスイッチをダブルクリック！',
    gates: [
      { id: 'input1', type: 'INPUT', position: { x: 100, y: 200 }, output: false, inputs: [] },
      { id: 'not1', type: 'NOT', position: { x: 300, y: 200 }, output: false, inputs: [] },
      { id: 'output1', type: 'OUTPUT', position: { x: 500, y: 200 }, output: false, inputs: [] }
    ],
    wires: [
      { id: 'w1', from: { gateId: 'input1', pinIndex: -1 }, to: { gateId: 'not1', pinIndex: 0 }, isActive: false },
      { id: 'w2', from: { gateId: 'not1', pinIndex: -1 }, to: { gateId: 'output1', pinIndex: 0 }, isActive: false }
    ]
  },
  
  {
    id: 'memory-bit',
    title: '🧠 1ビットメモリ',
    subtitle: '情報を覚える最小単位',
    preview: 'S/R → [?] → Q',
    instruction: '👆 上のSをクリック→下のRをクリックで切り替え',
    gates: [
      { id: 'input-s', type: 'INPUT', position: { x: 100, y: 150 }, output: false, inputs: [] },
      { id: 'input-r', type: 'INPUT', position: { x: 100, y: 250 }, output: false, inputs: [] },
      { id: 'sr-latch', type: 'SR-LATCH', position: { x: 300, y: 200 }, output: false, inputs: [] },
      { id: 'output-q', type: 'OUTPUT', position: { x: 500, y: 150 }, output: false, inputs: [] },
      { id: 'output-qbar', type: 'OUTPUT', position: { x: 500, y: 250 }, output: false, inputs: [] }
    ],
    wires: [
      { id: 'w1', from: { gateId: 'input-s', pinIndex: -1 }, to: { gateId: 'sr-latch', pinIndex: 0 }, isActive: false },
      { id: 'w2', from: { gateId: 'input-r', pinIndex: -1 }, to: { gateId: 'sr-latch', pinIndex: 1 }, isActive: false },
      { id: 'w3', from: { gateId: 'sr-latch', pinIndex: -1 }, to: { gateId: 'output-q', pinIndex: 0 }, isActive: false },
      { id: 'w4', from: { gateId: 'sr-latch', pinIndex: -2 }, to: { gateId: 'output-qbar', pinIndex: 0 }, isActive: false }
    ]
  },
  
  {
    id: 'and-demo',
    title: '🤝 ANDゲート',
    subtitle: '両方ONの時だけ光る',
    preview: '1 & 1 = 1',
    instruction: '💡 両方のスイッチをONにしてみて！',
    gates: [
      { id: 'input-a', type: 'INPUT', position: { x: 100, y: 150 }, output: false, inputs: [] },
      { id: 'input-b', type: 'INPUT', position: { x: 100, y: 250 }, output: false, inputs: [] },
      { id: 'and1', type: 'AND', position: { x: 300, y: 200 }, output: false, inputs: [] },
      { id: 'output1', type: 'OUTPUT', position: { x: 500, y: 200 }, output: false, inputs: [] }
    ],
    wires: [
      { id: 'w1', from: { gateId: 'input-a', pinIndex: -1 }, to: { gateId: 'and1', pinIndex: 0 }, isActive: false },
      { id: 'w2', from: { gateId: 'input-b', pinIndex: -1 }, to: { gateId: 'and1', pinIndex: 1 }, isActive: false },
      { id: 'w3', from: { gateId: 'and1', pinIndex: -1 }, to: { gateId: 'output1', pinIndex: 0 }, isActive: false }
    ]
  },
  
  {
    id: 'or-demo',
    title: '🌈 ORゲート',
    subtitle: 'どちらか一つでもONなら光る',
    preview: '1 | 0 = 1',
    instruction: '✨ どちらか片方をONにしてみて！',
    gates: [
      { id: 'input-a', type: 'INPUT', position: { x: 100, y: 150 }, output: false, inputs: [] },
      { id: 'input-b', type: 'INPUT', position: { x: 100, y: 250 }, output: false, inputs: [] },
      { id: 'or1', type: 'OR', position: { x: 300, y: 200 }, output: false, inputs: [] },
      { id: 'output1', type: 'OUTPUT', position: { x: 500, y: 200 }, output: false, inputs: [] }
    ],
    wires: [
      { id: 'w1', from: { gateId: 'input-a', pinIndex: -1 }, to: { gateId: 'or1', pinIndex: 0 }, isActive: false },
      { id: 'w2', from: { gateId: 'input-b', pinIndex: -1 }, to: { gateId: 'or1', pinIndex: 1 }, isActive: false },
      { id: 'w3', from: { gateId: 'or1', pinIndex: -1 }, to: { gateId: 'output1', pinIndex: 0 }, isActive: false }
    ]
  },
  
  {
    id: 'xor-magic',
    title: '✨ XORマジック',
    subtitle: '暗号化の基本原理',
    preview: 'A⊕B⊕B = A',
    instruction: '🔐 上2つをONにすると暗号化→復号化が見れる！',
    gates: [
      { id: 'input-a', type: 'INPUT', position: { x: 100, y: 100 }, output: false, inputs: [] },
      { id: 'input-key', type: 'INPUT', position: { x: 100, y: 200 }, output: false, inputs: [] },
      { id: 'xor1', type: 'XOR', position: { x: 300, y: 150 }, output: false, inputs: [] },
      { id: 'xor2', type: 'XOR', position: { x: 500, y: 150 }, output: false, inputs: [] },
      { id: 'output-encrypted', type: 'OUTPUT', position: { x: 450, y: 50 }, output: false, inputs: [] },
      { id: 'output-decrypted', type: 'OUTPUT', position: { x: 700, y: 150 }, output: false, inputs: [] }
    ],
    wires: [
      // 暗号化: A XOR KEY
      { id: 'w1', from: { gateId: 'input-a', pinIndex: -1 }, to: { gateId: 'xor1', pinIndex: 0 }, isActive: false },
      { id: 'w2', from: { gateId: 'input-key', pinIndex: -1 }, to: { gateId: 'xor1', pinIndex: 1 }, isActive: false },
      { id: 'w3', from: { gateId: 'xor1', pinIndex: -1 }, to: { gateId: 'output-encrypted', pinIndex: 0 }, isActive: false },
      // 復号化: (A XOR KEY) XOR KEY = A
      { id: 'w4', from: { gateId: 'xor1', pinIndex: -1 }, to: { gateId: 'xor2', pinIndex: 0 }, isActive: false },
      { id: 'w5', from: { gateId: 'input-key', pinIndex: -1 }, to: { gateId: 'xor2', pinIndex: 1 }, isActive: false },
      { id: 'w6', from: { gateId: 'xor2', pinIndex: -1 }, to: { gateId: 'output-decrypted', pinIndex: 0 }, isActive: false }
    ]
  }
];

export const SimpleGalleryPanel: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  const { clearAll, setAppMode } = useCircuitStore();
  
  const openCircuit = (circuit: typeof AMAZING_CIRCUITS[0]) => {
    clearAll();
    
    // 回路を読み込む
    useCircuitStore.setState({
      gates: circuit.gates,
      wires: circuit.wires,
      selectedGateId: null,
      isDrawingWire: false,
      wireStart: null
    });
    
    // 自由制作モードへ
    setAppMode('自由制作');
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="simple-gallery">
      <div className="gallery-intro">
        <h1>✨ あっと驚く回路たち</h1>
        <p>クリックして魔法を体験しよう</p>
      </div>
      
      <div className="circuit-showcase">
        {AMAZING_CIRCUITS.map(circuit => (
          <div 
            key={circuit.id} 
            className="showcase-card"
            onClick={() => openCircuit(circuit)}
          >
            <div className="circuit-preview">
              <div className="preview-animation">
                {circuit.preview}
              </div>
            </div>
            
            <div className="circuit-caption">
              <h3>{circuit.title}</h3>
              <p>{circuit.subtitle}</p>
              {circuit.instruction && (
                <p className="circuit-instruction">{circuit.instruction}</p>
              )}
            </div>
            
            <div className="try-button">
              試してみる →
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
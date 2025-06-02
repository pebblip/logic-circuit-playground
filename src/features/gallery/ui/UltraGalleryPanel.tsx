import React from 'react';
import { useCircuitStore } from '../../../stores/circuitStore';
import './UltraGalleryPanel.css';

// ultrathink: 本当に驚く回路だけ
const AMAZING_CIRCUITS = [
  {
    id: '7seg',
    name: '7セグ',
    desc: '0-9表示',
    icon: '🔢',
    howTo: '💡 スイッチをOFFにすると「1」が消えるよ！',
    gates: [
      // 簡単な7セグ表示（数字の「1」を表示）
      { id: 'input', type: 'INPUT', position: { x: 100, y: 200 }, output: true, inputs: [], label: 'ON/OFF' }, // デフォルトでON
      
      // 7セグメントの各セグメント（a-g）
      // 「1」を表示するにはbとcだけON
      { id: 'seg_a', type: 'OUTPUT', position: { x: 400, y: 50 }, output: false, inputs: [] },   // 上
      { id: 'seg_b', type: 'OUTPUT', position: { x: 500, y: 100 }, output: false, inputs: [] },  // 右上
      { id: 'seg_c', type: 'OUTPUT', position: { x: 500, y: 200 }, output: false, inputs: [] },  // 右下
      { id: 'seg_d', type: 'OUTPUT', position: { x: 400, y: 250 }, output: false, inputs: [] },  // 下
      { id: 'seg_e', type: 'OUTPUT', position: { x: 300, y: 200 }, output: false, inputs: [] },  // 左下
      { id: 'seg_f', type: 'OUTPUT', position: { x: 300, y: 100 }, output: false, inputs: [] },  // 左上
      { id: 'seg_g', type: 'OUTPUT', position: { x: 400, y: 150 }, output: false, inputs: [] }   // 中央
    ],
    wires: [
      // 「1」を表示するにはbとcだけ接続
      { id: 'w1', from: { gateId: 'input', pinIndex: -1 }, to: { gateId: 'seg_b', pinIndex: 0 }, isActive: true },
      { id: 'w2', from: { gateId: 'input', pinIndex: -1 }, to: { gateId: 'seg_c', pinIndex: 0 }, isActive: true }
    ]
  },
  {
    id: 'adder',
    name: '加算器',
    desc: '3+5=8',
    icon: '🧮',
    howTo: '💡 左の4つのスイッチで2進数を入力！上2つが数A、下2つが数B。例: 01 + 01 = 10',
    gates: [
      // 4ビット加算器の簡易版（2ビット）
      { id: 'a0', type: 'INPUT', position: { x: 50, y: 100 }, output: false, inputs: [], label: 'A0' },
      { id: 'a1', type: 'INPUT', position: { x: 50, y: 200 }, output: false, inputs: [], label: 'A1' },
      { id: 'b0', type: 'INPUT', position: { x: 50, y: 300 }, output: false, inputs: [], label: 'B0' },
      { id: 'b1', type: 'INPUT', position: { x: 50, y: 400 }, output: false, inputs: [], label: 'B1' },
      
      // 半加算器1（最下位ビット）
      { id: 'xor1', type: 'XOR', position: { x: 200, y: 150 }, output: false, inputs: [] },
      { id: 'and1', type: 'AND', position: { x: 200, y: 250 }, output: false, inputs: [] },
      
      // 全加算器1（上位ビット）
      { id: 'xor2', type: 'XOR', position: { x: 350, y: 300 }, output: false, inputs: [] },
      { id: 'and2', type: 'AND', position: { x: 350, y: 400 }, output: false, inputs: [] },
      { id: 'xor3', type: 'XOR', position: { x: 500, y: 350 }, output: false, inputs: [] },
      { id: 'and3', type: 'AND', position: { x: 500, y: 450 }, output: false, inputs: [] },
      { id: 'or1', type: 'OR', position: { x: 650, y: 400 }, output: false, inputs: [] },
      
      // 出力
      { id: 's0', type: 'OUTPUT', position: { x: 800, y: 150 }, output: false, inputs: [], label: 'S0' },
      { id: 's1', type: 'OUTPUT', position: { x: 800, y: 350 }, output: false, inputs: [], label: 'S1' },
      { id: 'cout', type: 'OUTPUT', position: { x: 800, y: 400 }, output: false, inputs: [], label: 'Carry' }
    ],
    wires: [
      // 半加算器の配線
      { id: 'w1', from: { gateId: 'a0', pinIndex: -1 }, to: { gateId: 'xor1', pinIndex: 0 }, isActive: false },
      { id: 'w2', from: { gateId: 'b0', pinIndex: -1 }, to: { gateId: 'xor1', pinIndex: 1 }, isActive: false },
      { id: 'w3', from: { gateId: 'a0', pinIndex: -1 }, to: { gateId: 'and1', pinIndex: 0 }, isActive: false },
      { id: 'w4', from: { gateId: 'b0', pinIndex: -1 }, to: { gateId: 'and1', pinIndex: 1 }, isActive: false },
      { id: 'w5', from: { gateId: 'xor1', pinIndex: -1 }, to: { gateId: 's0', pinIndex: 0 }, isActive: false },
      
      // 全加算器の配線
      { id: 'w6', from: { gateId: 'a1', pinIndex: -1 }, to: { gateId: 'xor2', pinIndex: 0 }, isActive: false },
      { id: 'w7', from: { gateId: 'b1', pinIndex: -1 }, to: { gateId: 'xor2', pinIndex: 1 }, isActive: false },
      { id: 'w8', from: { gateId: 'xor2', pinIndex: -1 }, to: { gateId: 'xor3', pinIndex: 0 }, isActive: false },
      { id: 'w9', from: { gateId: 'and1', pinIndex: -1 }, to: { gateId: 'xor3', pinIndex: 1 }, isActive: false },
      { id: 'w10', from: { gateId: 'xor3', pinIndex: -1 }, to: { gateId: 's1', pinIndex: 0 }, isActive: false },
      
      // キャリー計算
      { id: 'w11', from: { gateId: 'a1', pinIndex: -1 }, to: { gateId: 'and2', pinIndex: 0 }, isActive: false },
      { id: 'w12', from: { gateId: 'b1', pinIndex: -1 }, to: { gateId: 'and2', pinIndex: 1 }, isActive: false },
      { id: 'w13', from: { gateId: 'xor2', pinIndex: -1 }, to: { gateId: 'and3', pinIndex: 0 }, isActive: false },
      { id: 'w14', from: { gateId: 'and1', pinIndex: -1 }, to: { gateId: 'and3', pinIndex: 1 }, isActive: false },
      { id: 'w15', from: { gateId: 'and2', pinIndex: -1 }, to: { gateId: 'or1', pinIndex: 0 }, isActive: false },
      { id: 'w16', from: { gateId: 'and3', pinIndex: -1 }, to: { gateId: 'or1', pinIndex: 1 }, isActive: false },
      { id: 'w17', from: { gateId: 'or1', pinIndex: -1 }, to: { gateId: 'cout', pinIndex: 0 }, isActive: false }
    ]
  },
  {
    id: 'counter',
    name: 'カウンタ',
    desc: '0→1→2→3',
    icon: '🔄',
    howTo: '⏰ 自動でカウント開始！右の2つの出力で00→01→10→11を繰り返すよ',
    gates: [
      // 簡単な2ビットカウンタ
      { id: 'clock', type: 'CLOCK', position: { x: 100, y: 200 }, output: false, inputs: [], metadata: { frequency: 1, startTime: Date.now() } },
      { id: 'not1', type: 'NOT', position: { x: 250, y: 150 }, output: false, inputs: [] },
      { id: 'not2', type: 'NOT', position: { x: 250, y: 250 }, output: false, inputs: [] },
      { id: 'dff1', type: 'D-FF', position: { x: 400, y: 150 }, output: false, inputs: [] },
      { id: 'dff2', type: 'D-FF', position: { x: 400, y: 250 }, output: false, inputs: [] },
      { id: 'out0', type: 'OUTPUT', position: { x: 600, y: 150 }, output: false, inputs: [], label: 'ビット0' },
      { id: 'out1', type: 'OUTPUT', position: { x: 600, y: 250 }, output: false, inputs: [], label: 'ビット1' }
    ],
    wires: [
      // CLOCKからDFF1へ
      { id: 'w1', from: { gateId: 'clock', pinIndex: -1 }, to: { gateId: 'dff1', pinIndex: 1 }, isActive: false },
      // DFF1の出力をNOT1へ
      { id: 'w2', from: { gateId: 'dff1', pinIndex: -1 }, to: { gateId: 'not1', pinIndex: 0 }, isActive: false },
      // NOT1の出力をDFF1のDへ（フィードバック）
      { id: 'w3', from: { gateId: 'not1', pinIndex: -1 }, to: { gateId: 'dff1', pinIndex: 0 }, isActive: false },
      // DFF1の出力をDFF2のCLKへ
      { id: 'w4', from: { gateId: 'dff1', pinIndex: -1 }, to: { gateId: 'dff2', pinIndex: 1 }, isActive: false },
      // DFF2の出力をNOT2へ
      { id: 'w5', from: { gateId: 'dff2', pinIndex: -1 }, to: { gateId: 'not2', pinIndex: 0 }, isActive: false },
      // NOT2の出力をDFF2のDへ（フィードバック）
      { id: 'w6', from: { gateId: 'not2', pinIndex: -1 }, to: { gateId: 'dff2', pinIndex: 0 }, isActive: false },
      // 出力
      { id: 'w7', from: { gateId: 'dff1', pinIndex: -1 }, to: { gateId: 'out0', pinIndex: 0 }, isActive: false },
      { id: 'w8', from: { gateId: 'dff2', pinIndex: -1 }, to: { gateId: 'out1', pinIndex: 0 }, isActive: false }
    ]
  },
  {
    id: 'janken',
    name: 'じゃんけん',
    desc: '✊✌️✋',
    icon: '🎮',
    howTo: '🎮 左の3つから1つ選んでON！COM（常にグー）に勝つにはパーを選ぼう',
    gates: [
      // プレイヤー入力（一つだけONにする）
      { id: 'p_rock', type: 'INPUT', position: { x: 50, y: 100 }, output: false, inputs: [], label: '✊グー' },
      { id: 'p_scissors', type: 'INPUT', position: { x: 50, y: 200 }, output: false, inputs: [], label: '✌️チョキ' },
      { id: 'p_paper', type: 'INPUT', position: { x: 50, y: 300 }, output: false, inputs: [], label: '✋パー' },
      
      // コンピュータ（固定でグーを出す）
      { id: 'c_rock', type: 'INPUT', position: { x: 50, y: 400 }, output: true, inputs: [], label: 'COM:✊' },
      
      // 勝利判定（パーを出したら勝ち）
      { id: 'win_check', type: 'AND', position: { x: 250, y: 250 }, output: false, inputs: [] },
      
      // 結果表示
      { id: 'win', type: 'OUTPUT', position: { x: 450, y: 200 }, output: false, inputs: [], label: '勝ち！' },
      { id: 'lose', type: 'OUTPUT', position: { x: 450, y: 300 }, output: false, inputs: [], label: '負け...' }
    ],
    wires: [
      // パーを出したら勝ち
      { id: 'w1', from: { gateId: 'p_paper', pinIndex: -1 }, to: { gateId: 'win_check', pinIndex: 0 }, isActive: false },
      { id: 'w2', from: { gateId: 'c_rock', pinIndex: -1 }, to: { gateId: 'win_check', pinIndex: 1 }, isActive: false },
      { id: 'w3', from: { gateId: 'win_check', pinIndex: -1 }, to: { gateId: 'win', pinIndex: 0 }, isActive: false },
      
      // チョキを出したら負け
      { id: 'w4', from: { gateId: 'p_scissors', pinIndex: -1 }, to: { gateId: 'lose', pinIndex: 0 }, isActive: false }
    ]
  },
  {
    id: 'slot',
    name: 'スロット',
    desc: '777',
    icon: '🎰',
    howTo: '🎰 準備中...',
    gates: [], // TODO: 実装
    wires: []
  },
  {
    id: 'melody',
    name: 'メロディ',
    desc: '♪♫♬',
    icon: '🎵',
    howTo: '🎵 準備中...',
    gates: [], // TODO: 実装
    wires: []
  }
];

export const UltraGalleryPanel: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  const { clearAll, setAppMode } = useCircuitStore();
  
  const openCircuit = (circuit: typeof AMAZING_CIRCUITS[0]) => {
    clearAll();
    
    useCircuitStore.setState({
      gates: circuit.gates,
      wires: circuit.wires,
      selectedGateId: null,
      isDrawingWire: false,
      wireStart: null
    });
    
    setAppMode('自由制作');
    
    // 使い方を表示（ultrathink: シンプルに）
    if (circuit.howTo) {
      // コンソールにも出力
      console.log(`\n🎮 ${circuit.name}の使い方\n${'-'.repeat(40)}\n${circuit.howTo}\n${'-'.repeat(40)}\n`);
      
      // 一時的にアラートで表示（後で改善予定）
      setTimeout(() => {
        alert(`${circuit.name}の使い方\n\n${circuit.howTo}`);
      }, 500);
    }
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="ultra-gallery">
      <h2>驚きの回路</h2>
      
      <div className="circuit-grid">
        {AMAZING_CIRCUITS.map(circuit => (
          <button
            key={circuit.id}
            className="circuit-tile"
            onClick={() => openCircuit(circuit)}
            disabled={circuit.gates.length === 0}
          >
            <div className="tile-icon">{circuit.icon}</div>
            <div className="tile-name">{circuit.name}</div>
            <div className="tile-desc">{circuit.desc}</div>
            {circuit.gates.length === 0 && (
              <div className="coming-soon">準備中</div>
            )}
          </button>
        ))}
      </div>
      
      <div className="gallery-hint">
        💡 ヒント: カウンタは自動で00→01→10→11を繰り返すよ！
      </div>
    </div>
  );
};
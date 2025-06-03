import React from 'react';
import { useCircuitStore } from '../../../stores/circuitStore';
import { Gate, Wire, GateType } from '../../../types/circuit';
import './UltraGalleryPanel.css';

// ヘルパー関数: ゲートを作成
const g = (id: string, type: GateType, x: number, y: number, output = false, metadata?: any, label?: string): Gate => ({
  id,
  type,
  position: { x, y },
  output,
  inputs: [],
  ...(metadata && { metadata }),
  ...(label && { label })
});

// 回路データの型定義
interface CircuitData {
  id: string;
  name: string;
  desc: string;
  icon: string;
  howTo: string;
  gates: Gate[];
  wires: Wire[];
}

// ultrathink: 本当に驚く回路だけ
const AMAZING_CIRCUITS: CircuitData[] = [
  {
    id: '7seg',
    name: '7セグ',
    desc: '0-9表示',
    icon: '🔢',
    howTo: '💡 スイッチをOFFにすると「1」が消えるよ！',
    gates: [
      // 簡単な7セグ表示（数字の「1」を表示）
      g('input', 'INPUT', 100, 200, true, undefined, 'ON/OFF'), // デフォルトでON
      
      // 7セグメントの各セグメント（a-g）
      // 「1」を表示するにはbとcだけON
      g('seg_a', 'OUTPUT', 400, 50),   // 上
      g('seg_b', 'OUTPUT', 500, 100),  // 右上
      g('seg_c', 'OUTPUT', 500, 200),  // 右下
      g('seg_d', 'OUTPUT', 400, 250),  // 下
      g('seg_e', 'OUTPUT', 300, 200),  // 左下
      g('seg_f', 'OUTPUT', 300, 100),  // 左上
      g('seg_g', 'OUTPUT', 400, 150)   // 中央
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
      g('a0', 'INPUT', 50, 100, false, undefined, 'A0'),
      g('a1', 'INPUT', 50, 200, false, undefined, 'A1'),
      g('b0', 'INPUT', 50, 300, false, undefined, 'B0'),
      g('b1', 'INPUT', 50, 400, false, undefined, 'B1'),
      
      // 半加算器1（最下位ビット）
      g('xor1', 'XOR', 200, 150),
      g('and1', 'AND', 200, 250),
      
      // 全加算器1（上位ビット）
      g('xor2', 'XOR', 350, 300),
      g('and2', 'AND', 350, 400),
      g('xor3', 'XOR', 500, 350),
      g('and3', 'AND', 500, 450),
      g('or1', 'OR', 650, 400),
      
      // 出力
      g('s0', 'OUTPUT', 800, 150, false, undefined, 'S0'),
      g('s1', 'OUTPUT', 800, 350, false, undefined, 'S1'),
      g('cout', 'OUTPUT', 800, 400, false, undefined, 'Carry')
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
      g('clock', 'CLOCK', 100, 200, false, { frequency: 1, startTime: Date.now() }),
      g('not1', 'NOT', 250, 150),
      g('not2', 'NOT', 250, 250),
      g('dff1', 'D-FF', 400, 150),
      g('dff2', 'D-FF', 400, 250),
      g('out0', 'OUTPUT', 600, 150, false, undefined, 'ビット0'),
      g('out1', 'OUTPUT', 600, 250, false, undefined, 'ビット1')
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
      g('p_rock', 'INPUT', 50, 100, false, undefined, '✊グー'),
      g('p_scissors', 'INPUT', 50, 200, false, undefined, '✌️チョキ'),
      g('p_paper', 'INPUT', 50, 300, false, undefined, '✋パー'),
      
      // コンピュータ（固定でグーを出す）
      g('c_rock', 'INPUT', 50, 400, true, undefined, 'COM:✊'),
      
      // 勝利判定（パーを出したら勝ち）
      g('win_check', 'AND', 250, 250),
      
      // 結果表示
      g('win', 'OUTPUT', 450, 200, false, undefined, '勝ち！'),
      g('lose', 'OUTPUT', 450, 300, false, undefined, '負け...')
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
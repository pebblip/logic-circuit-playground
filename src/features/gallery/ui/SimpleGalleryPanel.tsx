import React from 'react';
import { useCircuitStore } from '../../../stores/circuitStore';
import type { Gate, Wire, GateType } from '../../../types/circuit';
import './SimpleGalleryPanel.css';

// ヘルパー関数: ゲートを作成
const g = (
  id: string,
  type: GateType,
  x: number,
  y: number,
  metadata?: Record<string, unknown>
): Gate => ({
  id,
  type,
  position: { x, y },
  outputs: [false],
  inputs: [],
  ...(metadata && { metadata }),
});

// ultrathink: 驚きの回路だけを厳選
interface CircuitData {
  id: string;
  title: string;
  subtitle: string;
  preview: string;
  instruction: string;
  gates: Gate[];
  wires: Wire[];
}

const AMAZING_CIRCUITS: CircuitData[] = [
  {
    id: 'not-magic',
    title: '🔄 反転マジック',
    subtitle: 'ON→OFF、OFF→ONに変換する',
    preview: '0 → 1, 1 → 0',
    instruction: '🖱️ 左のスイッチをダブルクリック！',
    gates: [
      g('input1', 'INPUT', 100, 200),
      g('not1', 'NOT', 300, 200),
      g('output1', 'OUTPUT', 500, 200),
    ],
    wires: [
      {
        id: 'w1',
        from: { gateId: 'input1', pinIndex: -1 },
        to: { gateId: 'not1', pinIndex: 0 },
        isActive: false,
      },
      {
        id: 'w2',
        from: { gateId: 'not1', pinIndex: -1 },
        to: { gateId: 'output1', pinIndex: 0 },
        isActive: false,
      },
    ],
  },

  {
    id: 'memory-bit',
    title: '🧠 1ビットメモリ',
    subtitle: '情報を覚える最小単位',
    preview: 'S/R → [?] → Q',
    instruction: '👆 上のSをクリック→下のRをクリックで切り替え',
    gates: [
      g('input-s', 'INPUT', 100, 150),
      g('input-r', 'INPUT', 100, 250),
      g('sr-latch', 'SR-LATCH', 300, 200),
      g('output-q', 'OUTPUT', 500, 150),
      g('output-qbar', 'OUTPUT', 500, 250),
    ],
    wires: [
      {
        id: 'w1',
        from: { gateId: 'input-s', pinIndex: -1 },
        to: { gateId: 'sr-latch', pinIndex: 0 },
        isActive: false,
      },
      {
        id: 'w2',
        from: { gateId: 'input-r', pinIndex: -1 },
        to: { gateId: 'sr-latch', pinIndex: 1 },
        isActive: false,
      },
      {
        id: 'w3',
        from: { gateId: 'sr-latch', pinIndex: -1 },
        to: { gateId: 'output-q', pinIndex: 0 },
        isActive: false,
      },
      {
        id: 'w4',
        from: { gateId: 'sr-latch', pinIndex: -2 },
        to: { gateId: 'output-qbar', pinIndex: 0 },
        isActive: false,
      },
    ],
  },

  {
    id: 'and-demo',
    title: '🤝 ANDゲート',
    subtitle: '両方ONの時だけ光る',
    preview: '1 & 1 = 1',
    instruction: '💡 両方のスイッチをONにしてみて！',
    gates: [
      g('input-a', 'INPUT', 100, 150),
      g('input-b', 'INPUT', 100, 250),
      g('and1', 'AND', 300, 200),
      g('output1', 'OUTPUT', 500, 200),
    ],
    wires: [
      {
        id: 'w1',
        from: { gateId: 'input-a', pinIndex: -1 },
        to: { gateId: 'and1', pinIndex: 0 },
        isActive: false,
      },
      {
        id: 'w2',
        from: { gateId: 'input-b', pinIndex: -1 },
        to: { gateId: 'and1', pinIndex: 1 },
        isActive: false,
      },
      {
        id: 'w3',
        from: { gateId: 'and1', pinIndex: -1 },
        to: { gateId: 'output1', pinIndex: 0 },
        isActive: false,
      },
    ],
  },

  {
    id: 'or-demo',
    title: '🌈 ORゲート',
    subtitle: 'どちらか一つでもONなら光る',
    preview: '1 | 0 = 1',
    instruction: '✨ どちらか片方をONにしてみて！',
    gates: [
      g('input-a', 'INPUT', 100, 150),
      g('input-b', 'INPUT', 100, 250),
      g('or1', 'OR', 300, 200),
      g('output1', 'OUTPUT', 500, 200),
    ],
    wires: [
      {
        id: 'w1',
        from: { gateId: 'input-a', pinIndex: -1 },
        to: { gateId: 'or1', pinIndex: 0 },
        isActive: false,
      },
      {
        id: 'w2',
        from: { gateId: 'input-b', pinIndex: -1 },
        to: { gateId: 'or1', pinIndex: 1 },
        isActive: false,
      },
      {
        id: 'w3',
        from: { gateId: 'or1', pinIndex: -1 },
        to: { gateId: 'output1', pinIndex: 0 },
        isActive: false,
      },
    ],
  },

  {
    id: 'xor-magic',
    title: '✨ XORマジック',
    subtitle: '暗号化の基本原理',
    preview: 'A⊕B⊕B = A',
    instruction: '🔐 上2つをONにすると暗号化→復号化が見れる！',
    gates: [
      g('input-a', 'INPUT', 100, 100),
      g('input-key', 'INPUT', 100, 200),
      g('xor1', 'XOR', 300, 150),
      g('xor2', 'XOR', 500, 150),
      g('output-encrypted', 'OUTPUT', 450, 50),
      g('output-decrypted', 'OUTPUT', 700, 150),
    ],
    wires: [
      // 暗号化: A XOR KEY
      {
        id: 'w1',
        from: { gateId: 'input-a', pinIndex: -1 },
        to: { gateId: 'xor1', pinIndex: 0 },
        isActive: false,
      },
      {
        id: 'w2',
        from: { gateId: 'input-key', pinIndex: -1 },
        to: { gateId: 'xor1', pinIndex: 1 },
        isActive: false,
      },
      {
        id: 'w3',
        from: { gateId: 'xor1', pinIndex: -1 },
        to: { gateId: 'output-encrypted', pinIndex: 0 },
        isActive: false,
      },
      // 復号化: (A XOR KEY) XOR KEY = A
      {
        id: 'w4',
        from: { gateId: 'xor1', pinIndex: -1 },
        to: { gateId: 'xor2', pinIndex: 0 },
        isActive: false,
      },
      {
        id: 'w5',
        from: { gateId: 'input-key', pinIndex: -1 },
        to: { gateId: 'xor2', pinIndex: 1 },
        isActive: false,
      },
      {
        id: 'w6',
        from: { gateId: 'xor2', pinIndex: -1 },
        to: { gateId: 'output-decrypted', pinIndex: 0 },
        isActive: false,
      },
    ],
  },
];

export const SimpleGalleryPanel: React.FC<{ isVisible: boolean }> = ({
  isVisible,
}) => {
  const { clearAll, setAppMode } = useCircuitStore();

  const openCircuit = (circuit: (typeof AMAZING_CIRCUITS)[0]) => {
    clearAll();

    // 回路を読み込む
    useCircuitStore.setState({
      gates: circuit.gates,
      wires: circuit.wires,
      selectedGateId: null,
      isDrawingWire: false,
      wireStart: null,
    });

    // フリーモードへ
    setAppMode('フリーモード');
  };

  if (!isVisible) return null;

  return (
    <div className="simple-gallery">
      <div className="gallery-intro">
        <h1>📚 基本回路ギャラリー</h1>
        <p>クリックして回路を体験しよう</p>
      </div>

      <div className="circuit-showcase">
        {AMAZING_CIRCUITS.map(circuit => (
          <div
            key={circuit.id}
            className="showcase-card"
            onClick={() => openCircuit(circuit)}
          >
            <div className="circuit-preview">
              <div className="preview-animation">{circuit.preview}</div>
            </div>

            <div className="circuit-caption">
              <h3>{circuit.title}</h3>
              <p>{circuit.subtitle}</p>
              {circuit.instruction && (
                <p className="circuit-instruction">{circuit.instruction}</p>
              )}
            </div>

            <div className="try-button">試してみる →</div>
          </div>
        ))}
      </div>
    </div>
  );
};

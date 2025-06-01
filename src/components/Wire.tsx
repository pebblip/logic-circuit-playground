import React from 'react';
import { Wire } from '../types/circuit';
import { useCircuitStore } from '../stores/circuitStore';

interface WireComponentProps {
  wire: Wire;
}

export const WireComponent: React.FC<WireComponentProps> = ({ wire }) => {
  const gates = useCircuitStore((state) => state.gates);
  
  const fromGate = gates.find(g => g.id === wire.from.gateId);
  const toGate = gates.find(g => g.id === wire.to.gateId);
  
  if (!fromGate || !toGate) return null;

  // ピンの位置を計算
  const getOutputPinPosition = (gate: typeof fromGate) => {
    if (gate.type === 'INPUT') {
      return { x: gate.position.x + 35, y: gate.position.y };
    } else if (gate.type === 'CLOCK') {
      return { x: gate.position.x + 55, y: gate.position.y };
    } else if (gate.type === 'D-FF' || gate.type === 'SR-LATCH') {
      // Q出力（上側）
      return { x: gate.position.x + 60, y: gate.position.y - 20 };
    } else if (gate.type === 'MUX') {
      return { x: gate.position.x + 60, y: gate.position.y };
    }
    return { x: gate.position.x + 45, y: gate.position.y };
  };

  const getInputPinPosition = (gate: typeof toGate, pinIndex: number) => {
    if (gate.type === 'OUTPUT') {
      return { x: gate.position.x - 30, y: gate.position.y };
    } else if (gate.type === 'D-FF' || gate.type === 'SR-LATCH') {
      // D-FF/SR-LATCHの入力ピン
      const y = pinIndex === 0 ? -20 : 20;
      return { x: gate.position.x - 60, y: gate.position.y + y };
    } else if (gate.type === 'MUX') {
      // MUXの入力ピン
      let y = 0;
      if (pinIndex === 0) y = -25;      // A
      else if (pinIndex === 1) y = 0;   // B
      else if (pinIndex === 2) y = 25;  // S
      return { x: gate.position.x - 60, y: gate.position.y + y };
    }
    const inputCount = gate.type === 'NOT' ? 1 : 2;
    const y = inputCount === 1 ? 0 : pinIndex === 0 ? -10 : 10;
    return { x: gate.position.x - 45, y: gate.position.y + y };
  };

  const from = getOutputPinPosition(fromGate);
  const to = getInputPinPosition(toGate, wire.to.pinIndex);

  // ベジェ曲線のパスを生成
  const midX = (from.x + to.x) / 2;
  const path = `M ${from.x} ${from.y} Q ${midX} ${from.y} ${midX} ${(from.y + to.y) / 2} T ${to.x} ${to.y}`;

  return (
    <g>
      <path
        d={path}
        className={`wire ${wire.isActive ? 'active' : ''}`}
      />
      {wire.isActive && (
        <>
          <path
            id={`wire-path-${wire.id}`}
            d={path}
            style={{ display: 'none' }}
          />
          <circle className="signal-particle" r="6">
            <animateMotion dur="1.5s" repeatCount="indefinite">
              <mpath xlinkHref={`#wire-path-${wire.id}`} />
            </animateMotion>
          </circle>
        </>
      )}
    </g>
  );
};
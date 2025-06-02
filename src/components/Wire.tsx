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
  const getOutputPinPosition = (gate: typeof fromGate, pinIndex: number = -1) => {
    if (gate.type === 'INPUT') {
      return { x: gate.position.x + 35, y: gate.position.y };
    } else if (gate.type === 'CLOCK') {
      return { x: gate.position.x + 55, y: gate.position.y };
    } else if (gate.type === 'D-FF' || gate.type === 'SR-LATCH') {
      // Q出力（上側）
      return { x: gate.position.x + 60, y: gate.position.y - 20 };
    } else if (gate.type === 'MUX') {
      return { x: gate.position.x + 60, y: gate.position.y };
    } else if (gate.type === 'CUSTOM' && gate.customGateDefinition) {
      // カスタムゲートの出力ピン位置計算
      const definition = gate.customGateDefinition;
      const size = { width: definition.width, height: definition.height };
      const halfWidth = size.width / 2;
      
      // ピンインデックスの検証：負の値のみを受け入れる
      if (pinIndex >= 0) {
        console.warn('Custom gate output pin index should be negative, got:', pinIndex);
        return { x: gate.position.x + halfWidth + 10, y: gate.position.y };
      }
      
      const outputIndex = (-pinIndex) - 1; // -1 -> 0, -2 -> 1, -3 -> 2...
      const pinCount = definition.outputs.length;
      
      // インデックスが範囲内かチェック
      if (outputIndex < 0 || outputIndex >= pinCount) {
        console.warn('Output index out of range:', outputIndex, 'for', pinCount, 'outputs');
        return { x: gate.position.x + halfWidth + 10, y: gate.position.y };
      }
      
      const availableHeight = Math.max(40, size.height - 80);
      const spacing = pinCount === 1 ? 0 : Math.max(30, availableHeight / Math.max(1, pinCount - 1));
      const pinY = pinCount === 1 ? 0 : (-((pinCount - 1) * spacing) / 2) + (outputIndex * spacing);
      
      return {
        x: gate.position.x + halfWidth + 10,
        y: gate.position.y + pinY
      };
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
    } else if (gate.type === 'CUSTOM' && gate.customGateDefinition) {
      // カスタムゲートの入力ピン位置計算
      const definition = gate.customGateDefinition;
      const size = { width: definition.width, height: definition.height };
      const halfWidth = size.width / 2;
      const pinCount = definition.inputs.length;
      
      // ピンインデックスの検証：正の値のみを受け入れる
      if (pinIndex < 0) {
        console.warn('Custom gate input pin index should be non-negative, got:', pinIndex);
        return { x: gate.position.x - halfWidth - 10, y: gate.position.y };
      }
      
      // インデックスが範囲内かチェック
      if (pinIndex >= pinCount) {
        console.warn('Input index out of range:', pinIndex, 'for', pinCount, 'inputs');
        return { x: gate.position.x - halfWidth - 10, y: gate.position.y };
      }
      
      const availableHeight = Math.max(40, size.height - 80);
      const spacing = pinCount === 1 ? 0 : Math.max(30, availableHeight / Math.max(1, pinCount - 1));
      const pinY = pinCount === 1 ? 0 : (-((pinCount - 1) * spacing) / 2) + (pinIndex * spacing);
      
      return {
        x: gate.position.x - halfWidth - 10,
        y: gate.position.y + pinY
      };
    }
    const inputCount = gate.type === 'NOT' ? 1 : 2;
    const y = inputCount === 1 ? 0 : pinIndex === 0 ? -10 : 10;
    return { x: gate.position.x - 45, y: gate.position.y + y };
  };

  const from = getOutputPinPosition(fromGate, wire.from.pinIndex);
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
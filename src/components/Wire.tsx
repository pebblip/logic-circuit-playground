import React from 'react';
import type { Wire, Gate } from '../types/circuit';
import { useCircuitStore } from '../stores/circuitStore';
import {
  getInputPinPosition,
  getOutputPinPosition,
} from '../domain/analysis/pinPositionCalculator';

interface WireComponentProps {
  wire: Wire;
  gates?: Gate[]; // プレビューモード用にオプショナルに
}

export const WireComponent: React.FC<WireComponentProps> = ({ wire, gates: propGates }) => {
  const storeGates = useCircuitStore(state => state.gates);
  const deleteWire = useCircuitStore(state => state.deleteWire);
  
  // プロパティで渡されたゲートがあればそれを使用、なければstoreから取得
  const gates = propGates || storeGates;

  const fromGate = gates.find(g => g.id === wire.from.gateId);
  const toGate = gates.find(g => g.id === wire.to.gateId);

  if (!fromGate || !toGate) return null;

  // ピン位置計算を統一化されたユーティリティから取得
  // wire.from.pinIndex は負の値（出力ピン）：-1 = 出力0、-2 = 出力1、...
  // wire.to.pinIndex は 0以上の入力ピン番号

  // 負のpinIndexから実際の出力ピンインデックスを計算
  const outputPinIndex = Math.abs(wire.from.pinIndex) - 1;
  const from = getOutputPinPosition(fromGate, outputPinIndex);
  const to = getInputPinPosition(toGate, wire.to.pinIndex);

  // ベジェ曲線のパスを生成
  const midX = (from.x + to.x) / 2;
  const path = `M ${from.x} ${from.y} Q ${midX} ${from.y} ${midX} ${(from.y + to.y) / 2} T ${to.x} ${to.y}`;

  // 右クリックハンドラー
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteWire(wire.id);
  };

  return (
    <g
      onContextMenu={handleContextMenu}
      data-wire-id={wire.id}
      data-testid={`wire-${wire.id}`}
    >
      <path
        d={path}
        className={`wire ${wire.isActive ? 'active' : ''}`}
        style={{ cursor: 'context-menu' }}
      />
      {/* 見えない太い線でクリック領域を拡大 */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth="20"
        style={{ cursor: 'context-menu' }}
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

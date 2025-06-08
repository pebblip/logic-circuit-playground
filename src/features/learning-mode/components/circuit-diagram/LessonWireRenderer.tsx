import React from 'react';
import type { Wire, Gate } from '@/types/circuit';
import {
  getInputPinPosition,
  getOutputPinPosition,
} from '@/domain/analysis/pinPositionCalculator';

interface LessonWireRendererProps {
  wire: Wire;
  gates: Gate[];
}

/**
 * 学習モード用のワイヤーレンダラー
 * ストアに依存せず、propsから渡されたデータのみで描画
 */
export const LessonWireRenderer: React.FC<LessonWireRendererProps> = ({ wire, gates }) => {
  const fromGate = gates.find(g => g.id === wire.from.gateId);
  const toGate = gates.find(g => g.id === wire.to.gateId);

  if (!fromGate || !toGate) return null;

  // ピン位置計算を統一化されたユーティリティから取得
  const outputPinIndex = Math.abs(wire.from.pinIndex) - 1;
  const from = getOutputPinPosition(fromGate, outputPinIndex);
  const to = getInputPinPosition(toGate, wire.to.pinIndex);

  // 直交配線のパスを生成（L字型）
  // 水平→垂直のルーティング
  const routingRatio = 0.7; // 水平線の割合（70%地点で曲がる）
  const cornerX = from.x + (to.x - from.x) * routingRatio;
  
  // パスの構築
  const path = `M ${from.x} ${from.y} L ${cornerX} ${from.y} L ${cornerX} ${to.y} L ${to.x} ${to.y}`;
  
  // デバッグ用：ベジェ曲線のパス（コメントアウト）
  // const midX = (from.x + to.x) / 2;
  // const bezierPath = `M ${from.x} ${from.y} Q ${midX} ${from.y} ${midX} ${(from.y + to.y) / 2} T ${to.x} ${to.y}`;

  // 角の丸み半径（オプション）
  const cornerRadius = 15;
  
  // 角を丸めた直交配線のパス（より美しい見た目）
  const roundedPath = `
    M ${from.x} ${from.y} 
    L ${cornerX - cornerRadius} ${from.y}
    Q ${cornerX} ${from.y} ${cornerX} ${from.y + (to.y > from.y ? cornerRadius : -cornerRadius)}
    L ${cornerX} ${to.y + (to.y > from.y ? -cornerRadius : cornerRadius)}
    Q ${cornerX} ${to.y} ${cornerX + (to.x > cornerX ? cornerRadius : -cornerRadius)} ${to.y}
    L ${to.x} ${to.y}
  `.trim();

  return (
    <g data-wire-id={wire.id}>
      <path
        d={path}
        className={`wire ${wire.isActive ? 'active' : ''}`}
        fill="none"
      />
      {/* 見えない太い線でクリック領域を拡大 */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth="20"
        style={{ pointerEvents: 'none' }}
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
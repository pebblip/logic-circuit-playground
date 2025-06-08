import React from 'react';
import { LessonGateRenderer } from './LessonGateRenderer';
import { LessonWireRenderer } from './LessonWireRenderer';
import type { Gate, Wire } from '@/types/circuit';

interface LessonCircuit {
  gates: Gate[];
  wires: Wire[];
  title: string;
  bounds?: {
    width: number;
    height: number;
    minX?: number;
    minY?: number;
    maxX?: number;
    maxY?: number;
  };
}

interface LessonCircuitRendererProps {
  circuit: LessonCircuit;
  width?: number;
  height?: number;
}

/**
 * 制作モードと同じ描画システムを使用した学習モード回路レンダラー
 * - 統一されたゲート形状
 * - 統一されたワイヤー描画
 * - 統一されたピン配置
 */
export const LessonCircuitRenderer: React.FC<LessonCircuitRendererProps> = ({
  circuit,
  width = 800,
  height = 400,
}) => {
  const viewWidth = circuit.bounds?.width || width;
  const viewHeight = circuit.bounds?.height || height;
  
  // 境界を考慮したviewBoxの計算
  const minX = circuit.bounds?.minX || 0;
  const minY = circuit.bounds?.minY || 0;

  return (
    <div className="lesson-circuit-container">
      <h3 className="circuit-title">{circuit.title}</h3>
      <svg
        viewBox={`${minX} ${minY} ${viewWidth} ${viewHeight}`}
        style={{ width: '100%', maxWidth: '800px', height: 'auto' }}
        className="lesson-circuit-svg"
      >
        {/* ワイヤーを先に描画（背面） */}
        {circuit.wires.map(wire => (
          <LessonWireRenderer 
            key={wire.id} 
            wire={wire} 
            gates={circuit.gates}
          />
        ))}
        
        {/* ゲートを後に描画（前面） */}
        {circuit.gates.map(gate => (
          <LessonGateRenderer key={gate.id} gate={gate} />
        ))}
      </svg>
    </div>
  );
};
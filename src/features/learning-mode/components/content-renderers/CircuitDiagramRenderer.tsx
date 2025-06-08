import React from 'react';
import { AutoLayoutCircuitDiagram } from '../circuit-diagram/AutoLayoutCircuitDiagram';
import { halfAdderCircuit } from '../../data/circuit-definitions/half-adder';
import { fullAdderCircuit } from '../../data/circuit-definitions/full-adder';
import { fourBitAdderCircuit } from '../../data/circuit-definitions/4bit-adder';
import { comparatorCircuit } from '../../data/circuit-definitions/comparator';
import {
  notGateCircuit,
  notGateTransistorCircuit,
} from '../../data/circuit-definitions/not-gate';
import {
  andGateCircuit,
  orGateCircuit,
  xorGateCircuit,
  simpleConnectionCircuit,
  doubleNotCircuit,
  signalOffStateCircuit,
  signalOnStateCircuit,
  signalComparisonCircuit,
} from '../../data/circuit-definitions/basic-gates';
import type { CircuitDiagramContent } from '@/types/lesson-content';

interface CircuitDiagramRendererProps {
  content: CircuitDiagramContent;
}

/**
 * 制作モードと同じ描画システムを使用した回路図レンダラー
 *
 * 特徴：
 * - データ駆動型の回路定義
 * - 自動レイアウト
 * - 統一されたゲート形状（BasicGateRenderer準拠）
 * - 統一されたピン配置
 * - 保守性の高い設計
 */
export const CircuitDiagramRenderer: React.FC<
  CircuitDiagramRendererProps
> = ({ content }) => {
  // 回路定義マッピング
  const getCircuitDefinition = (circuitId: string) => {
    switch (circuitId) {
      case 'half-adder':
        return halfAdderCircuit;
      case 'full-adder':
        return fullAdderCircuit;
      case '4bit-adder':
        return fourBitAdderCircuit;
      case 'comparator':
        return comparatorCircuit;
      case 'not-gate':
        return notGateCircuit;
      case 'not-gate-transistor':
        return notGateTransistorCircuit;
      case 'and-gate':
        return andGateCircuit;
      case 'or-gate':
        return orGateCircuit;
      case 'xor-gate':
        return xorGateCircuit;
      case 'simple-connection':
        return simpleConnectionCircuit;
      case 'double-not':
        return doubleNotCircuit;
      case 'signal-off-state':
        return signalOffStateCircuit;
      case 'signal-on-state':
        return signalOnStateCircuit;
      case 'signal-comparison':
        return signalComparisonCircuit;
      default:
        console.warn(`Unknown circuit: ${circuitId}`);
        return null;
    }
  };

  if (content.type !== 'circuit-diagram') {
    return null;
  }

  const circuitId = (content as any).circuitId || 'half-adder';
  const circuitDefinition = getCircuitDefinition(circuitId);

  if (!circuitDefinition) {
    return (
      <div className="circuit-error">
        <p>回路定義が見つかりません: {content.circuitId}</p>
      </div>
    );
  }

  return (
    <div className="circuit-diagram-v2">
      <AutoLayoutCircuitDiagram
        circuit={circuitDefinition}
        showTruthTable={(content as any).showTruthTable || false}
      />

      {(content as any).description && (
        <div className="circuit-description">
          <p>{(content as any).description}</p>
        </div>
      )}
    </div>
  );
};

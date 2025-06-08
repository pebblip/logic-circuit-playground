import React, { useMemo } from 'react';
import { LessonCircuitRenderer } from './LessonCircuitRenderer';
import {
  autoLayoutCircuit,
  snapToGrid,
  calculateCircuitBounds,
} from '../../utils/autoLayout';
import type { Gate, Wire } from '@/types/circuit';

interface CircuitDefinition {
  title: string;
  gates: Gate[];
  wires: Wire[];
  layout?: {
    inputLabels?: string[];
    outputLabels?: string[];
    preferredWidth?: number;
    preferredHeight?: number;
  };
}

interface AutoLayoutCircuitDiagramProps {
  circuit: CircuitDefinition;
  showTruthTable?: boolean;
}

/**
 * 自動レイアウト回路図コンポーネント
 *
 * 特徴：
 * - 制作モードと同じ描画システム使用
 * - 自動レイアウトで美しい配置
 * - 統一されたゲート形状・ピン配置
 * - 保守性の高いデータ駆動設計
 */
export const AutoLayoutCircuitDiagram: React.FC<
  AutoLayoutCircuitDiagramProps
> = ({ circuit, showTruthTable = false }) => {
  // 自動レイアウト適用
  const layoutedCircuit = useMemo(() => {
    const autoLaidGates = autoLayoutCircuit(circuit.gates, circuit.wires, {
      padding: 50,
      gateSpacing: { x: 150, y: 100 },
      layerWidth: 200,
      preferredWidth: circuit.layout?.preferredWidth || 700,
      preferredHeight: circuit.layout?.preferredHeight || 400,
    });

    // グリッドにスナップして美しく整列
    const snappedGates = snapToGrid(autoLaidGates, 20);

    // 境界計算
    const bounds = calculateCircuitBounds(snappedGates);

    return {
      title: circuit.title,
      gates: snappedGates,
      wires: circuit.wires,
      bounds: {
        width: bounds.width,
        height: bounds.height,
        minX: bounds.minX,
        minY: bounds.minY,
        maxX: bounds.maxX,
        maxY: bounds.maxY,
      },
    };
  }, [circuit]);

  return (
    <div className="auto-layout-circuit-diagram">
      {/* 制作モードと同じ描画システムを使用 */}
      <LessonCircuitRenderer
        circuit={layoutedCircuit}
        width={layoutedCircuit.bounds.width}
        height={layoutedCircuit.bounds.height}
      />

      {/* 真理値表（オプション） */}
      {showTruthTable && (
        <div className="truth-table">{/* TODO: 真理値表の自動生成 */}</div>
      )}

      {/* ピンラベル */}
      {circuit.layout?.inputLabels && (
        <div className="pin-labels input-labels">
          {circuit.layout.inputLabels.map((label, index) => (
            <span key={`input-${index}`} className="pin-label">
              {label}
            </span>
          ))}
        </div>
      )}

      {circuit.layout?.outputLabels && (
        <div className="pin-labels output-labels">
          {circuit.layout.outputLabels.map((label, index) => (
            <span key={`output-${index}`} className="pin-label">
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

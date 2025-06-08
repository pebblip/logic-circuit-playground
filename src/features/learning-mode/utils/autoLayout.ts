import type { Gate, Wire } from '@/types/circuit';

/**
 * 回路の自動レイアウトアルゴリズム
 * 美しく整列された回路図を自動生成
 */

interface LayoutOptions {
  padding: number;
  gateSpacing: { x: number; y: number };
  layerWidth: number;
  preferredWidth: number;
  preferredHeight: number;
}

interface CircuitLayer {
  level: number;
  gates: Gate[];
}

/**
 * 階層化レイアウト：入力→処理→出力の流れで自動配置
 */
export function autoLayoutCircuit(
  gates: Gate[],
  wires: Wire[],
  options: LayoutOptions = {
    padding: 50,
    gateSpacing: { x: 150, y: 100 },
    layerWidth: 150,
    preferredWidth: 800,
    preferredHeight: 400,
  }
): Gate[] {
  // 1. ゲートを層に分類
  const layers = analyzeCircuitLayers(gates, wires);
  
  // 2. 各層内でゲートを整列
  const layoutGates = gates.map(gate => ({ ...gate }));
  
  layers.forEach((layer, layerIndex) => {
    const x = options.padding + layerIndex * options.layerWidth;
    const totalHeight = (layer.gates.length - 1) * options.gateSpacing.y;
    const startY = (options.preferredHeight - totalHeight) / 2;
    
    layer.gates.forEach((gate, gateIndex) => {
      const targetGate = layoutGates.find(g => g.id === gate.id);
      if (targetGate) {
        targetGate.position = {
          x,
          y: startY + gateIndex * options.gateSpacing.y,
        };
      }
    });
  });
  
  return layoutGates;
}

/**
 * ゲートを入力→処理→出力の層に分析
 */
function analyzeCircuitLayers(gates: Gate[], wires: Wire[]): CircuitLayer[] {
  const layers: CircuitLayer[] = [];
  const processed = new Set<string>();
  
  // レベル0: 入力ゲート
  const inputGates = gates.filter(g => g.type === 'INPUT');
  if (inputGates.length > 0) {
    layers.push({ level: 0, gates: inputGates });
    inputGates.forEach(g => processed.add(g.id));
  }
  
  // レベル1以降: 処理ゲート（依存関係に基づく）
  let currentLevel = 1;
  while (processed.size < gates.length) {
    const currentLayerGates = gates.filter(gate => {
      if (processed.has(gate.id)) return false;
      if (gate.type === 'OUTPUT') return false;
      
      // すべての入力が前の層で処理済みかチェック
      const inputWires = wires.filter(w => w.to.gateId === gate.id);
      return inputWires.every(w => processed.has(w.from.gateId));
    });
    
    if (currentLayerGates.length === 0) break;
    
    layers.push({ level: currentLevel, gates: currentLayerGates });
    currentLayerGates.forEach(g => processed.add(g.id));
    currentLevel++;
  }
  
  // 最終レベル: 出力ゲート
  const outputGates = gates.filter(g => g.type === 'OUTPUT' && !processed.has(g.id));
  if (outputGates.length > 0) {
    layers.push({ level: currentLevel, gates: outputGates });
  }
  
  return layers;
}

/**
 * グリッドスナップ：座標を美しい格子点に調整
 */
export function snapToGrid(
  gates: Gate[],
  gridSize: number = 50
): Gate[] {
  return gates.map(gate => ({
    ...gate,
    position: {
      x: Math.round(gate.position.x / gridSize) * gridSize,
      y: Math.round(gate.position.y / gridSize) * gridSize,
    },
  }));
}

/**
 * 回路の境界を計算
 */
export function calculateCircuitBounds(gates: Gate[]): {
  width: number;
  height: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} {
  if (gates.length === 0) {
    return { width: 800, height: 400, minX: 0, maxX: 800, minY: 0, maxY: 400 };
  }

  const positions = gates.map(g => g.position);
  const gateHalfWidth = 35;  // ゲートの半分の幅
  const gateHalfHeight = 25; // ゲートの半分の高さ
  const padding = 50;        // 周囲の余白
  
  const minX = Math.min(...positions.map(p => p.x - gateHalfWidth)) - padding;
  const maxX = Math.max(...positions.map(p => p.x + gateHalfWidth)) + padding;
  const minY = Math.min(...positions.map(p => p.y - gateHalfHeight)) - padding;
  const maxY = Math.max(...positions.map(p => p.y + gateHalfHeight)) + padding;
  
  return {
    width: maxX - minX,
    height: maxY - minY,
    minX,
    maxX,
    minY,
    maxY,
  };
}
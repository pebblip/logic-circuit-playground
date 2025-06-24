/**
 * fibonacci-counter詳細分析と美的改善計画
 */

import { describe, it } from 'vitest';
import { FEATURED_CIRCUITS } from '../../src/features/gallery/data/index';
import type { Gate, Wire } from '../../src/types/circuit';

// ゲートサイズ定義
const GATE_SIZES = {
  'CLOCK': { width: 70, height: 50 },
  'OUTPUT': { width: 60, height: 40 },
  'NOT': { width: 70, height: 50 },
  'AND': { width: 80, height: 60 },
  'OR': { width: 80, height: 60 },
  'XOR': { width: 80, height: 60 },
  'D-FF': { width: 90, height: 70 },
} as const;

interface BoundingBox {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

interface OverlapInfo {
  gate1: Gate;
  gate2: Gate;
  distance: number;
  overlapArea: number;
  severity: 'minor' | 'moderate' | 'severe';
}

function getGateBoundingBox(gate: Gate): BoundingBox {
  const size = GATE_SIZES[gate.type as keyof typeof GATE_SIZES] || { width: 80, height: 60 };
  const halfWidth = size.width / 2;
  const halfHeight = size.height / 2;
  
  return {
    left: gate.position.x - halfWidth,
    right: gate.position.x + halfWidth,
    top: gate.position.y - halfHeight,
    bottom: gate.position.y + halfHeight,
  };
}

function calculateOverlap(box1: BoundingBox, box2: BoundingBox): number {
  const overlapWidth = Math.max(0, Math.min(box1.right, box2.right) - Math.max(box1.left, box2.left));
  const overlapHeight = Math.max(0, Math.min(box1.bottom, box2.bottom) - Math.max(box1.top, box2.top));
  return overlapWidth * overlapHeight;
}

function calculateDistance(gate1: Gate, gate2: Gate): number {
  const dx = gate1.position.x - gate2.position.x;
  const dy = gate1.position.y - gate2.position.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function getOverlapSeverity(overlapArea: number): 'minor' | 'moderate' | 'severe' {
  if (overlapArea === 0) return 'minor';
  if (overlapArea < 500) return 'minor';
  if (overlapArea < 2000) return 'moderate';
  return 'severe';
}

function checkCircuitOverlaps(gates: Gate[]): OverlapInfo[] {
  const overlaps: OverlapInfo[] = [];
  
  for (let i = 0; i < gates.length; i++) {
    for (let j = i + 1; j < gates.length; j++) {
      const gate1 = gates[i];
      const gate2 = gates[j];
      
      const box1 = getGateBoundingBox(gate1);
      const box2 = getGateBoundingBox(gate2);
      const overlapArea = calculateOverlap(box1, box2);
      
      if (overlapArea > 0) {
        const distance = calculateDistance(gate1, gate2);
        const severity = getOverlapSeverity(overlapArea);
        
        overlaps.push({
          gate1,
          gate2,
          distance,
          overlapArea,
          severity,
        });
      }
    }
  }
  
  return overlaps;
}

/**
 * fibonacci-counter専用の層分析
 */
function analyzeFibonacciCounterLayers(gates: Gate[], wires: Wire[]) {
  const layers: Array<{ level: number; gates: Gate[]; description: string }> = [];
  
  // Layer 0: CLOCK
  const clockGates = gates.filter(g => g.type === 'CLOCK');
  if (clockGates.length > 0) {
    layers.push({ level: 0, gates: clockGates, description: 'CLOCK source' });
  }
  
  // Layer 1: A レジスタ (前の値)
  const regAGates = gates.filter(g => g.id.startsWith('reg_a_'));
  if (regAGates.length > 0) {
    layers.push({ level: 1, gates: regAGates, description: 'Register A (previous value)' });
  }
  
  // Layer 2: B レジスタ (現在の値)
  const regBGates = gates.filter(g => g.id.startsWith('reg_b_'));
  if (regBGates.length > 0) {
    layers.push({ level: 2, gates: regBGates, description: 'Register B (current value)' });
  }
  
  // Layer 3: 加算器 第1段階 (XOR, AND)
  const adder1Gates = gates.filter(g => g.id === 'xor_0' || g.id === 'and_0' || g.id === 'xor_1a' || g.id === 'and_1a');
  if (adder1Gates.length > 0) {
    layers.push({ level: 3, gates: adder1Gates, description: 'Adder stage 1 (XOR/AND)' });
  }
  
  // Layer 4: 加算器 第2段階 (キャリー処理)
  const adder2Gates = gates.filter(g => g.id === 'xor_1b' || g.id === 'and_1b' || g.id === 'or_1');
  if (adder2Gates.length > 0) {
    layers.push({ level: 4, gates: adder2Gates, description: 'Adder stage 2 (carry logic)' });
  }
  
  // Layer 5: 出力ゲート
  const outputGates = gates.filter(g => g.type === 'OUTPUT');
  if (outputGates.length > 0) {
    layers.push({ level: 5, gates: outputGates, description: 'Output displays' });
  }
  
  return layers;
}

/**
 * fibonacci-counter用美的改善配置計算
 */
function calculateFibonacciCounterAestheticLayout(gates: Gate[], wires: Wire[]) {
  const layers = analyzeFibonacciCounterLayers(gates, wires);
  
  const config = {
    columnSpacing: 150,    // カラム間隔
    gateSpacing: 100,      // ゲート間隔（統一）
    centerY: 400,          // 中央Y座標
    gridSize: 25,          // グリッドサイズ
  };
  
  const perfectLayout: Gate[] = [];
  
  layers.forEach((layer, layerIndex) => {
    const x = 100 + layerIndex * config.columnSpacing;
    
    // 特別配置: 出力ゲートはタイプ別に分割
    if (layer.description === 'Output displays') {
      const fibOutputs = layer.gates.filter(g => g.id.startsWith('out_fib_'));
      const aOutputs = layer.gates.filter(g => g.id.startsWith('out_a_'));
      const bOutputs = layer.gates.filter(g => g.id.startsWith('out_b_'));
      
      // フィボナッチ結果出力 (右端)
      fibOutputs.forEach((gate, index) => {
        const y = config.centerY + (index - 1) * config.gateSpacing;
        const snappedX = Math.round((x + 150) / config.gridSize) * config.gridSize;
        const snappedY = Math.round(y / config.gridSize) * config.gridSize;
        
        perfectLayout.push({
          ...gate,
          position: { x: snappedX, y: snappedY }
        });
      });
      
      // A値出力 (上部)
      aOutputs.forEach((gate, index) => {
        const y = 100 + index * config.gateSpacing;
        const snappedX = Math.round((100 + index * config.columnSpacing) / config.gridSize) * config.gridSize;
        const snappedY = Math.round(y / config.gridSize) * config.gridSize;
        
        perfectLayout.push({
          ...gate,
          position: { x: snappedX, y: snappedY }
        });
      });
      
      // B値出力 (下部)
      bOutputs.forEach((gate, index) => {
        const y = 700 + index * config.gateSpacing;
        const snappedX = Math.round((100 + index * config.columnSpacing) / config.gridSize) * config.gridSize;
        const snappedY = Math.round(y / config.gridSize) * config.gridSize;
        
        perfectLayout.push({
          ...gate,
          position: { x: snappedX, y: snappedY }
        });
      });
    } else {
      // 通常配置
      const gateCount = layer.gates.length;
      const totalHeight = (gateCount - 1) * config.gateSpacing;
      const startY = config.centerY - totalHeight / 2;
      
      layer.gates.forEach((gate, gateIndex) => {
        const y = startY + gateIndex * config.gateSpacing;
        
        // グリッドスナッピング
        const snappedX = Math.round(x / config.gridSize) * config.gridSize;
        const snappedY = Math.round(y / config.gridSize) * config.gridSize;
        
        perfectLayout.push({
          ...gate,
          position: { x: snappedX, y: snappedY }
        });
      });
    }
  });
  
  return { perfectLayout, layers, config };
}

describe('🔍 fibonacci-counter詳細分析', () => {
  it('🚨 現在の重なり問題を詳細分析', () => {
    const fibonacciCircuit = FEATURED_CIRCUITS.find(c => c.id === 'fibonacci-counter');
    if (!fibonacciCircuit) {
      console.error('❌ fibonacci-counter回路が見つかりません');
      return;
    }
    
    console.log('\n🔍 fibonacci-counter重なり詳細分析');
    console.log(`📊 総ゲート数: ${fibonacciCircuit.gates.length}`);
    
    const overlaps = checkCircuitOverlaps(fibonacciCircuit.gates);
    
    if (overlaps.length === 0) {
      console.log('✅ 重なりなし - 完璧な配置！');
      return;
    }
    
    console.log(`\n🚨 重なり発見: ${overlaps.length}件`);
    
    // 重要度別に分類
    const severe = overlaps.filter(o => o.severity === 'severe');
    const moderate = overlaps.filter(o => o.severity === 'moderate');
    const minor = overlaps.filter(o => o.severity === 'minor');
    
    console.log(`   🔴 重度: ${severe.length}件`);
    console.log(`   🟡 中度: ${moderate.length}件`);
    console.log(`   🟢 軽度: ${minor.length}件`);
    
    // 詳細分析
    overlaps.forEach((overlap, index) => {
      const { gate1, gate2, distance, overlapArea, severity } = overlap;
      const severityIcon = severity === 'severe' ? '🔴' : severity === 'moderate' ? '🟡' : '🟢';
      
      console.log(`\n${severityIcon} 重なり#${index + 1} [${severity.toUpperCase()}]`);
      console.log(`   Gate1: ${gate1.type} (${gate1.id}) at (${gate1.position.x}, ${gate1.position.y})`);
      console.log(`   Gate2: ${gate2.type} (${gate2.id}) at (${gate2.position.x}, ${gate2.position.y})`);
      console.log(`   距離: ${distance.toFixed(1)}px`);
      console.log(`   重なり面積: ${overlapArea.toFixed(0)}px²`);
    });
    
    // 座標分析
    console.log('\n📍 現在の座標分析:');
    const uniqueX = [...new Set(fibonacciCircuit.gates.map(g => g.position.x))].sort((a, b) => a - b);
    const uniqueY = [...new Set(fibonacciCircuit.gates.map(g => g.position.y))].sort((a, b) => a - b);
    
    console.log(`   X座標: [${uniqueX.join(', ')}]`);
    console.log(`   Y座標: [${uniqueY.join(', ')}]`);
    console.log(`   カラム数: ${uniqueX.length}, 行数: ${uniqueY.length}`);
  });
  
  it('🏗️ fibonacci-counter専用層分析', () => {
    const fibonacciCircuit = FEATURED_CIRCUITS.find(c => c.id === 'fibonacci-counter');
    if (!fibonacciCircuit) return;
    
    console.log('\n🏗️ fibonacci-counter層分析');
    
    const layers = analyzeFibonacciCounterLayers(fibonacciCircuit.gates, fibonacciCircuit.wires);
    
    console.log(`\n📊 レイヤー構造 (${layers.length}層):`);
    layers.forEach(layer => {
      console.log(`  Layer ${layer.level}: ${layer.gates.length}個のゲート - ${layer.description}`);
      layer.gates.forEach(gate => {
        console.log(`    - ${gate.type} (${gate.id}): (${gate.position.x}, ${gate.position.y})`);
      });
    });
  });
  
  it('✨ 美的改善後の予想配置', () => {
    const fibonacciCircuit = FEATURED_CIRCUITS.find(c => c.id === 'fibonacci-counter');
    if (!fibonacciCircuit) return;
    
    console.log('\n✨ fibonacci-counter美的改善配置計算');
    
    // 現在の重なり
    const originalOverlaps = checkCircuitOverlaps(fibonacciCircuit.gates);
    console.log(`現在の重なり: ${originalOverlaps.length}件`);
    
    // 美的改善配置計算
    const { perfectLayout, layers, config } = calculateFibonacciCounterAestheticLayout(
      fibonacciCircuit.gates, 
      fibonacciCircuit.wires
    );
    
    // 改善後の重なりチェック
    const newOverlaps = checkCircuitOverlaps(perfectLayout);
    console.log(`改善後の重なり: ${newOverlaps.length}件`);
    
    if (newOverlaps.length === 0) {
      console.log('🎉 完全解決！重なりゼロ達成予想！');
    } else {
      const improvement = ((originalOverlaps.length - newOverlaps.length) / originalOverlaps.length * 100).toFixed(1);
      console.log(`改善度: ${improvement}% (${originalOverlaps.length} → ${newOverlaps.length}件)`);
    }
    
    console.log(`\n📊 設定:`);
    console.log(`  カラム間隔: ${config.columnSpacing}px`);
    console.log(`  ゲート間隔: ${config.gateSpacing}px`);
    console.log(`  中央Y座標: ${config.centerY}px`);
    console.log(`  グリッドサイズ: ${config.gridSize}px`);
    
    console.log(`\n🏗️ 改善後レイヤー構造:`);
    layers.forEach((layer, index) => {
      const x = 100 + index * config.columnSpacing;
      console.log(`  Layer ${layer.level} (x=${x}): ${layer.gates.length}個 - ${layer.description}`);
    });
    
    // 座標例表示
    console.log(`\n📍 改善後座標例（最初の15個）:`);
    perfectLayout.slice(0, 15).forEach(gate => {
      console.log(`    ${gate.id}: (${gate.position.x}, ${gate.position.y}) // ${gate.type}`);
    });
  });
});
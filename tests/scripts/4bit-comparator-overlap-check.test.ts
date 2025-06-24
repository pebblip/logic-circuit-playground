/**
 * 4bit-comparator専用重なりチェック
 */

import { describe, it } from 'vitest';
import { FEATURED_CIRCUITS } from '../../src/features/gallery/data/index';
import type { Gate } from '../../src/types/circuit';

// ゲートの実際の描画サイズ（概算）
const GATE_SIZES = {
  'INPUT': { width: 60, height: 40 },
  'OUTPUT': { width: 60, height: 40 },
  'NOT': { width: 70, height: 50 },
  'AND': { width: 80, height: 60 },
  'OR': { width: 80, height: 60 },
  'XOR': { width: 80, height: 60 },
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

describe('🔍 4bit-comparator重なり詳細分析', () => {
  it('4bit-comparatorの全重なりを詳細分析', () => {
    const comparatorCircuit = FEATURED_CIRCUITS.find(c => c.id === '4bit-comparator');
    if (!comparatorCircuit) {
      console.error('❌ 4bit-comparator回路が見つかりません');
      return;
    }
    
    console.log('\n🔍 4bit-comparator重なり詳細分析');
    console.log(`📊 総ゲート数: ${comparatorCircuit.gates.length}`);
    
    const overlaps = checkCircuitOverlaps(comparatorCircuit.gates);
    
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
      
      // 修正案の計算
      const minDistance = 100;
      if (distance < minDistance) {
        const neededMovement = minDistance - distance;
        console.log(`   💡 修正案: ${neededMovement.toFixed(1)}px離す必要あり`);
      }
    });
    
    // 縦列別の配置確認
    console.log('\n📍 縦列別配置確認:');
    const gatesByColumn = new Map<number, Gate[]>();
    
    comparatorCircuit.gates.forEach(gate => {
      const x = gate.position.x;
      if (!gatesByColumn.has(x)) {
        gatesByColumn.set(x, []);
      }
      gatesByColumn.get(x)!.push(gate);
    });
    
    const sortedColumns = Array.from(gatesByColumn.entries()).sort(([a], [b]) => a - b);
    
    sortedColumns.forEach(([x, gates], columnIndex) => {
      console.log(`\n  Column ${columnIndex + 1} (x=${x}): ${gates.length}個のゲート`);
      const sortedGates = gates.sort((a, b) => a.position.y - b.position.y);
      sortedGates.forEach((gate, gateIndex) => {
        if (gateIndex > 0) {
          const prevGate = sortedGates[gateIndex - 1];
          const gap = gate.position.y - prevGate.position.y;
          const gapStatus = gap >= 100 ? '✅' : gap >= 80 ? '⚠️' : '❌';
          console.log(`    ${gate.type}(${gate.id}): y=${gate.position.y} [gap: ${gap}px ${gapStatus}]`);
        } else {
          console.log(`    ${gate.type}(${gate.id}): y=${gate.position.y}`);
        }
      });
    });
  });
});
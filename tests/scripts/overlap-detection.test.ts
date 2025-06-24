/**
 * ギャラリー回路重なりチェックプログラム
 * 
 * 目的: 手動座標定義の限界を検証し、実際の重なり状況を正確に把握
 */

import { describe, it } from 'vitest';
import { FEATURED_CIRCUITS } from '../../src/features/gallery/data/index';
import type { Gate } from '../../src/types/circuit';
import type { GalleryCircuit } from '../../src/features/gallery/data/types';

// ゲートの実際の描画サイズ（概算）
const GATE_SIZES = {
  'INPUT': { width: 60, height: 40 },
  'OUTPUT': { width: 60, height: 40 },
  'NOT': { width: 70, height: 50 },
  'AND': { width: 80, height: 60 },
  'OR': { width: 80, height: 60 },
  'XOR': { width: 80, height: 60 },
  'NAND': { width: 80, height: 60 },
  'NOR': { width: 80, height: 60 },
  'D-FF': { width: 90, height: 70 },
  'SR-LATCH': { width: 90, height: 70 },
  'CLOCK': { width: 70, height: 50 },
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

/**
 * ゲートのバウンディングボックスを計算
 */
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

/**
 * 2つのバウンディングボックスの重なりを計算
 */
function calculateOverlap(box1: BoundingBox, box2: BoundingBox): number {
  const overlapWidth = Math.max(0, Math.min(box1.right, box2.right) - Math.max(box1.left, box2.left));
  const overlapHeight = Math.max(0, Math.min(box1.bottom, box2.bottom) - Math.max(box1.top, box2.top));
  return overlapWidth * overlapHeight;
}

/**
 * 2点間の距離を計算
 */
function calculateDistance(gate1: Gate, gate2: Gate): number {
  const dx = gate1.position.x - gate2.position.x;
  const dy = gate1.position.y - gate2.position.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 重なり度合いを判定
 */
function getOverlapSeverity(overlapArea: number): 'minor' | 'moderate' | 'severe' {
  if (overlapArea === 0) return 'minor';
  if (overlapArea < 500) return 'minor';
  if (overlapArea < 2000) return 'moderate';
  return 'severe';
}

/**
 * 単一回路の重なりチェック
 */
function checkCircuitOverlaps(circuit: GalleryCircuit): OverlapInfo[] {
  const overlaps: OverlapInfo[] = [];
  const gates = circuit.gates;
  
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

describe('🔍 ギャラリー回路重なり検証', () => {
  it('🌸 曼荼羅回路の重なり詳細分析', () => {
    const mandalaCircuit = FEATURED_CIRCUITS.find(c => c.id === 'mandala-circuit');
    if (!mandalaCircuit) {
      console.error('❌ 曼荼羅回路が見つかりません');
      return;
    }
    
    console.log('\n🔍 曼荼羅回路重なり分析開始');
    console.log(`📊 総ゲート数: ${mandalaCircuit.gates.length}`);
    
    const overlaps = checkCircuitOverlaps(mandalaCircuit);
    
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
      const minDistance = 100; // 最低必要距離
      if (distance < minDistance) {
        const neededMovement = minDistance - distance;
        console.log(`   💡 修正案: ${neededMovement.toFixed(1)}px離す必要あり`);
      }
    });
    
    // 最も問題のあるペアを特定
    if (severe.length > 0) {
      const worst = severe.reduce((prev, curr) => 
        curr.overlapArea > prev.overlapArea ? curr : prev
      );
      console.log(`\n🚨 最重要修正対象:`);
      console.log(`   ${worst.gate1.id} ↔ ${worst.gate2.id}`);
      console.log(`   重なり面積: ${worst.overlapArea.toFixed(0)}px² (${worst.severity})`);
    }
  });
  
  it('📊 全ギャラリー回路の重なり統計', () => {
    console.log('\n📊 全ギャラリー回路重なり統計');
    
    let totalCircuits = 0;
    let problematicCircuits = 0;
    let totalOverlaps = 0;
    
    const circuitResults = FEATURED_CIRCUITS.map(circuit => {
      totalCircuits++;
      const overlaps = checkCircuitOverlaps(circuit);
      
      if (overlaps.length > 0) {
        problematicCircuits++;
        totalOverlaps += overlaps.length;
      }
      
      return {
        id: circuit.id,
        title: circuit.title,
        gateCount: circuit.gates.length,
        overlapCount: overlaps.length,
        severe: overlaps.filter(o => o.severity === 'severe').length,
        moderate: overlaps.filter(o => o.severity === 'moderate').length,
        minor: overlaps.filter(o => o.severity === 'minor').length,
      };
    });
    
    // サマリー
    console.log(`\n📈 統計サマリー:`);
    console.log(`   総回路数: ${totalCircuits}`);
    console.log(`   問題ある回路: ${problematicCircuits} (${(problematicCircuits/totalCircuits*100).toFixed(1)}%)`);
    console.log(`   総重なり数: ${totalOverlaps}`);
    
    // 問題ある回路の詳細
    const problematic = circuitResults.filter(r => r.overlapCount > 0);
    if (problematic.length > 0) {
      console.log(`\n🚨 問題のある回路一覧:`);
      problematic.forEach(result => {
        const severityInfo = result.severe > 0 ? ` (🔴${result.severe}件)` : 
                           result.moderate > 0 ? ` (🟡${result.moderate}件)` : 
                           ` (🟢${result.minor}件)`;
        console.log(`   ${result.id}: ${result.overlapCount}件の重なり${severityInfo}`);
      });
    }
    
    // 最も問題のある回路トップ3
    const topProblematic = problematic
      .sort((a, b) => (b.severe * 100 + b.moderate * 10 + b.minor) - (a.severe * 100 + a.moderate * 10 + a.minor))
      .slice(0, 3);
    
    if (topProblematic.length > 0) {
      console.log(`\n🥇 最も修正が必要な回路 TOP3:`);
      topProblematic.forEach((result, index) => {
        const ranking = ['🥇', '🥈', '🥉'][index];
        console.log(`   ${ranking} ${result.id} (重度:${result.severe}, 中度:${result.moderate}, 軽度:${result.minor})`);
      });
    }
    
    // 手動座標定義の現実性評価
    const successRate = ((totalCircuits - problematicCircuits) / totalCircuits * 100).toFixed(1);
    console.log(`\n🎯 手動座標定義の現実性評価:`);
    console.log(`   成功率: ${successRate}% (${totalCircuits - problematicCircuits}/${totalCircuits})`);
    
    if (parseFloat(successRate) < 80) {
      console.log(`   💔 結論: 手動座標定義は現実的ではない`);
      console.log(`   🤖 推奨: 自動配置 + 手動微調整のハイブリッド方式`);
    } else {
      console.log(`   ✅ 結論: 手動座標定義は実用的`);
      console.log(`   🔧 推奨: 重なりチェック + 局所的修正`);
    }
  });
});
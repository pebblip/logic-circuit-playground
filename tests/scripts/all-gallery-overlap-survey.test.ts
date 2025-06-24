/**
 * 全ギャラリー回路の重なり問題一括調査
 */

import { describe, it } from 'vitest';
import { FEATURED_CIRCUITS } from '../../src/features/gallery/data/index';
import type { Gate } from '../../src/types/circuit';

// ゲートサイズ定義
const GATE_SIZES = {
  'CLOCK': { width: 70, height: 50 },
  'OUTPUT': { width: 60, height: 40 },
  'INPUT': { width: 60, height: 40 },
  'NOT': { width: 70, height: 50 },
  'AND': { width: 80, height: 60 },
  'OR': { width: 80, height: 60 },
  'XOR': { width: 80, height: 60 },
  'NAND': { width: 80, height: 60 },
  'NOR': { width: 80, height: 60 },
  'D-FF': { width: 90, height: 70 },
  'SR-LATCH': { width: 90, height: 70 },
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

interface CircuitAnalysis {
  id: string;
  title: string;
  gateCount: number;
  wireCount: number;
  overlaps: OverlapInfo[];
  severity: 'perfect' | 'minor' | 'moderate' | 'severe';
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedEffort: 'easy' | 'medium' | 'hard';
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

function analyzeCircuit(circuit: any): CircuitAnalysis {
  const overlaps = checkCircuitOverlaps(circuit.gates);
  
  // 重要度分析
  const severeCount = overlaps.filter(o => o.severity === 'severe').length;
  const moderateCount = overlaps.filter(o => o.severity === 'moderate').length;
  const minorCount = overlaps.filter(o => o.severity === 'minor').length;
  
  // 全体的な重要度
  let severity: CircuitAnalysis['severity'];
  if (overlaps.length === 0) severity = 'perfect';
  else if (severeCount > 0) severity = 'severe';
  else if (moderateCount > 0) severity = 'moderate';
  else severity = 'minor';
  
  // 優先度（重なり数とゲート数で計算）
  let priority: CircuitAnalysis['priority'];
  const totalOverlaps = overlaps.length;
  if (totalOverlaps === 0) priority = 'low';
  else if (totalOverlaps >= 10 || severeCount >= 3) priority = 'critical';
  else if (totalOverlaps >= 5 || severeCount >= 1) priority = 'high';
  else if (totalOverlaps >= 2) priority = 'medium';
  else priority = 'low';
  
  // 推定工数（ゲート数と複雑度）
  let estimatedEffort: CircuitAnalysis['estimatedEffort'];
  if (circuit.gates.length <= 10) estimatedEffort = 'easy';
  else if (circuit.gates.length <= 25) estimatedEffort = 'medium';
  else estimatedEffort = 'hard';
  
  return {
    id: circuit.id,
    title: circuit.title,
    gateCount: circuit.gates.length,
    wireCount: circuit.wires.length,
    overlaps,
    severity,
    priority,
    estimatedEffort,
  };
}

describe('🔍 全ギャラリー回路重なり問題調査', () => {
  it('📊 全回路一括分析・優先順位決定', () => {
    console.log('\n🔍 全ギャラリー回路重なり問題一括調査');
    console.log(`📊 総回路数: ${FEATURED_CIRCUITS.length}`);
    
    const analyses: CircuitAnalysis[] = [];
    
    // 既に完了済みの回路
    const completedCircuits = ['4bit-comparator', 'johnson-counter', 'fibonacci-counter'];
    
    FEATURED_CIRCUITS.forEach(circuit => {
      const analysis = analyzeCircuit(circuit);
      analyses.push(analysis);
      
      const statusIcon = completedCircuits.includes(circuit.id) ? '✅' : 
                        analysis.severity === 'perfect' ? '🟢' :
                        analysis.severity === 'minor' ? '🟡' :
                        analysis.severity === 'moderate' ? '🟠' : '🔴';
      
      const priorityIcon = analysis.priority === 'critical' ? '🚨' :
                          analysis.priority === 'high' ? '⬆️' :
                          analysis.priority === 'medium' ? '➡️' : '⬇️';
      
      const effortIcon = analysis.estimatedEffort === 'easy' ? '🟢' :
                        analysis.estimatedEffort === 'medium' ? '🟡' : '🔴';
      
      console.log(`\n${statusIcon} ${circuit.id}`);
      console.log(`   タイトル: ${circuit.title}`);
      console.log(`   ゲート数: ${analysis.gateCount}, ワイヤ数: ${analysis.wireCount}`);
      console.log(`   重なり: ${analysis.overlaps.length}件 (${analysis.severity})`);
      console.log(`   優先度: ${priorityIcon} ${analysis.priority}`);
      console.log(`   推定工数: ${effortIcon} ${analysis.estimatedEffort}`);
      
      if (analysis.overlaps.length > 0) {
        const severe = analysis.overlaps.filter(o => o.severity === 'severe').length;
        const moderate = analysis.overlaps.filter(o => o.severity === 'moderate').length;
        const minor = analysis.overlaps.filter(o => o.severity === 'minor').length;
        console.log(`   重なり詳細: 重度${severe}件, 中度${moderate}件, 軽度${minor}件`);
      }
    });
    
    // 統計サマリー
    const needsWork = analyses.filter(a => !completedCircuits.includes(a.id) && a.overlaps.length > 0);
    const perfect = analyses.filter(a => !completedCircuits.includes(a.id) && a.overlaps.length === 0);
    const completed = analyses.filter(a => completedCircuits.includes(a.id));
    
    console.log('\n📈 全体統計:');
    console.log(`  ✅ 完了済み: ${completed.length}回路`);
    console.log(`  🟢 完璧状態: ${perfect.length}回路`);
    console.log(`  🔧 要改善: ${needsWork.length}回路`);
    
    // 優先順位別作業計画
    console.log('\n🎯 優先順位別作業計画:');
    
    const critical = needsWork.filter(a => a.priority === 'critical');
    const high = needsWork.filter(a => a.priority === 'high');
    const medium = needsWork.filter(a => a.priority === 'medium');
    const low = needsWork.filter(a => a.priority === 'low');
    
    if (critical.length > 0) {
      console.log(`\n🚨 CRITICAL (${critical.length}回路):`);
      critical.forEach(a => console.log(`   - ${a.id}: ${a.overlaps.length}件重なり (${a.estimatedEffort})`));
    }
    
    if (high.length > 0) {
      console.log(`\n⬆️ HIGH (${high.length}回路):`);
      high.forEach(a => console.log(`   - ${a.id}: ${a.overlaps.length}件重なり (${a.estimatedEffort})`));
    }
    
    if (medium.length > 0) {
      console.log(`\n➡️ MEDIUM (${medium.length}回路):`);
      medium.forEach(a => console.log(`   - ${a.id}: ${a.overlaps.length}件重なり (${a.estimatedEffort})`));
    }
    
    if (low.length > 0) {
      console.log(`\n⬇️ LOW (${low.length}回路):`);
      low.forEach(a => console.log(`   - ${a.id}: ${a.overlaps.length}件重なり (${a.estimatedEffort})`));
    }
    
    // 推奨作業順序
    console.log('\n🚀 推奨作業順序:');
    const workOrder = needsWork.sort((a, b) => {
      // 優先度順 → 工数順
      const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      const effortWeight = { easy: 3, medium: 2, hard: 1 };
      
      const scoreA = priorityWeight[a.priority] * 10 + effortWeight[a.estimatedEffort];
      const scoreB = priorityWeight[b.priority] * 10 + effortWeight[b.estimatedEffort];
      
      return scoreB - scoreA;
    });
    
    workOrder.forEach((analysis, index) => {
      const medal = index < 3 ? ['🥇', '🥈', '🥉'][index] : `${index + 1}.`;
      console.log(`${medal} ${analysis.id} (${analysis.priority}優先度, ${analysis.estimatedEffort}工数, ${analysis.overlaps.length}件重なり)`);
    });
    
    // 総重なり件数
    const totalOverlaps = needsWork.reduce((sum, a) => sum + a.overlaps.length, 0);
    console.log(`\n💡 まとめ:`);
    console.log(`  残り重なり総数: ${totalOverlaps}件`);
    console.log(`  推定総工数: ${needsWork.length}回路 × 平均30分 = ${Math.ceil(needsWork.length * 0.5)}時間`);
    console.log(`  美的改善完了後の予想: 全${FEATURED_CIRCUITS.length}回路で重なり0件達成！`);
  });
});
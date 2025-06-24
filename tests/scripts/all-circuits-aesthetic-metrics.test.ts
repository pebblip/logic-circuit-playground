/**
 * 全ギャラリー回路美的メトリクス一括測定
 */

import { describe, it } from 'vitest';
import { FEATURED_CIRCUITS } from '../../src/features/gallery/data/index';
import type { Gate } from '../../src/types/circuit';

/**
 * 詳細美的メトリクス計算
 */
function calculateActualAestheticMetrics(gates: Gate[]) {
  const metrics = {
    regularity: 0,
    symmetry: 0,
    balance: 0,
    gridAlignment: 0,
    spacing: 0,
    overall: 0
  };

  // 1. 規則性: ゲート間距離の一貫性
  const columnSpacings: number[] = [];
  const rowSpacings: number[] = [];
  
  // カラム間隔チェック
  const uniqueX = [...new Set(gates.map(g => g.position.x))].sort((a, b) => a - b);
  for (let i = 1; i < uniqueX.length; i++) {
    columnSpacings.push(uniqueX[i] - uniqueX[i-1]);
  }
  
  // 行間隔チェック（同じカラム内）
  const gatesByColumn = new Map<number, Gate[]>();
  gates.forEach(gate => {
    if (!gatesByColumn.has(gate.position.x)) {
      gatesByColumn.set(gate.position.x, []);
    }
    gatesByColumn.get(gate.position.x)!.push(gate);
  });
  
  gatesByColumn.forEach(columnGates => {
    const sortedGates = columnGates.sort((a, b) => a.position.y - b.position.y);
    for (let i = 1; i < sortedGates.length; i++) {
      rowSpacings.push(sortedGates[i].position.y - sortedGates[i-1].position.y);
    }
  });
  
  // 規則性計算（カラム間隔）
  if (columnSpacings.length > 0) {
    const avgColSpacing = columnSpacings.reduce((a, b) => a + b, 0) / columnSpacings.length;
    const colVariance = columnSpacings.reduce((sum, spacing) => sum + Math.pow(spacing - avgColSpacing, 2), 0) / columnSpacings.length;
    const colRegularity = Math.max(0, 50 - Math.sqrt(colVariance) / 2);
    metrics.regularity += colRegularity;
  }
  
  // 規則性計算（行間隔）
  if (rowSpacings.length > 0) {
    const avgRowSpacing = rowSpacings.reduce((a, b) => a + b, 0) / rowSpacings.length;
    const rowVariance = rowSpacings.reduce((sum, spacing) => sum + Math.pow(spacing - avgRowSpacing, 2), 0) / rowSpacings.length;
    const rowRegularity = Math.max(0, 50 - Math.sqrt(rowVariance) / 2);
    metrics.regularity += rowRegularity;
  }

  // 2. 対称性: 入力・出力の対称配置
  const inputGates = gates.filter(g => g.type === 'INPUT' || g.type === 'CLOCK');
  const outputGates = gates.filter(g => g.type === 'OUTPUT');
  
  if (inputGates.length > 1) {
    const inputCenter = inputGates.reduce((sum, gate) => sum + gate.position.y, 0) / inputGates.length;
    const inputVariance = inputGates.reduce((sum, gate) => sum + Math.pow(gate.position.y - inputCenter, 2), 0) / inputGates.length;
    const inputSymmetry = Math.max(0, 50 - Math.sqrt(inputVariance) / 5);
    metrics.symmetry += inputSymmetry;
  }
  
  if (outputGates.length > 1) {
    const outputCenter = outputGates.reduce((sum, gate) => sum + gate.position.y, 0) / outputGates.length;
    const outputVariance = outputGates.reduce((sum, gate) => sum + Math.pow(gate.position.y - outputCenter, 2), 0) / outputGates.length;
    const outputSymmetry = Math.max(0, 50 - Math.sqrt(outputVariance) / 5);
    metrics.symmetry += outputSymmetry;
  }

  // 3. バランス: 全体の重心
  const centerX = gates.reduce((sum, gate) => sum + gate.position.x, 0) / gates.length;
  const centerY = gates.reduce((sum, gate) => sum + gate.position.y, 0) / gates.length;
  const targetCenterY = 400;
  metrics.balance = Math.max(0, 100 - Math.abs(centerY - targetCenterY) / 5);

  // 4. グリッド整列
  let gridAligned = 0;
  gates.forEach(gate => {
    if (gate.position.x % 25 === 0 && gate.position.y % 25 === 0) {
      gridAligned++;
    }
  });
  metrics.gridAlignment = (gridAligned / gates.length) * 100;

  // 5. 間隔の最適性
  const targetSpacing = 100;
  let spacingScore = 0;
  if (rowSpacings.length > 0) {
    const spacingAccuracy = rowSpacings.filter(spacing => Math.abs(spacing - targetSpacing) <= 10).length;
    spacingScore = (spacingAccuracy / rowSpacings.length) * 100;
  }
  metrics.spacing = spacingScore;

  // 総合スコア
  metrics.overall = (metrics.regularity + metrics.symmetry + metrics.balance + metrics.gridAlignment + metrics.spacing) / 5;

  return metrics;
}

describe('🔬 全ギャラリー回路美的メトリクス一括測定', () => {
  it('📊 全回路美的スコア測定・ランキング作成', () => {
    console.log('\n🔬 全ギャラリー回路美的メトリクス一括測定');
    console.log(`📊 総回路数: ${FEATURED_CIRCUITS.length}`);
    
    const allMetrics: Array<{
      id: string;
      title: string;
      gateCount: number;
      metrics: ReturnType<typeof calculateActualAestheticMetrics>;
      status: 'completed' | 'perfect' | 'needs_improvement';
    }> = [];
    
    // 完了済み回路
    const completedCircuits = ['4bit-comparator', 'johnson-counter', 'fibonacci-counter', 'mandala-circuit'];
    
    FEATURED_CIRCUITS.forEach(circuit => {
      const metrics = calculateActualAestheticMetrics(circuit.gates);
      const status = completedCircuits.includes(circuit.id) ? 'completed' :
                   metrics.overall >= 80 ? 'perfect' : 'needs_improvement';
      
      allMetrics.push({
        id: circuit.id,
        title: circuit.title,
        gateCount: circuit.gates.length,
        metrics,
        status
      });
      
      const statusIcon = status === 'completed' ? '✅' :
                        status === 'perfect' ? '🌟' : '🔧';
      
      console.log(`\n${statusIcon} ${circuit.id}`);
      console.log(`   タイトル: ${circuit.title}`);
      console.log(`   ゲート数: ${circuit.gates.length}`);
      console.log(`   美的スコア: ${metrics.overall.toFixed(1)}/100`);
      console.log(`   規則性: ${metrics.regularity.toFixed(1)}, 対称性: ${metrics.symmetry.toFixed(1)}, バランス: ${metrics.balance.toFixed(1)}`);
      console.log(`   グリッド整列: ${metrics.gridAlignment.toFixed(1)}, 間隔最適性: ${metrics.spacing.toFixed(1)}`);
    });
    
    // 美的スコア順ランキング
    console.log('\n🏆 美的スコアランキング (全14回路):');
    const ranking = allMetrics.sort((a, b) => b.metrics.overall - a.metrics.overall);
    
    ranking.forEach((circuit, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
      const statusIcon = circuit.status === 'completed' ? ' ✅' :
                        circuit.status === 'perfect' ? ' 🌟' : ' 🔧';
      
      console.log(`${medal} ${circuit.id}: ${circuit.metrics.overall.toFixed(1)}/100${statusIcon}`);
    });
    
    // 改善余地分析
    console.log('\n📈 改善余地分析:');
    const needsImprovement = allMetrics.filter(c => c.status === 'needs_improvement');
    const perfectAlready = allMetrics.filter(c => c.status === 'perfect');
    const completed = allMetrics.filter(c => c.status === 'completed');
    
    console.log(`  ✅ 完了済み (美的改善適用済み): ${completed.length}回路`);
    console.log(`  🌟 既に完璧 (80点以上): ${perfectAlready.length}回路`);
    console.log(`  🔧 改善余地あり (80点未満): ${needsImprovement.length}回路`);
    
    if (needsImprovement.length > 0) {
      console.log('\n🎯 美的改善推奨回路:');
      needsImprovement
        .sort((a, b) => a.metrics.overall - b.metrics.overall) // スコア昇順（低い順）
        .forEach((circuit, index) => {
          const potential = Math.min(90, circuit.metrics.overall + 20); // 改善予想
          console.log(`  ${index + 1}. ${circuit.id}: ${circuit.metrics.overall.toFixed(1)} → ${potential.toFixed(1)}点予想`);
        });
    }
    
    if (perfectAlready.length > 0) {
      console.log('\n✨ さらなる美的向上候補:');
      perfectAlready
        .sort((a, b) => a.metrics.overall - b.metrics.overall)
        .forEach((circuit, index) => {
          const potential = Math.min(95, circuit.metrics.overall + 5); // 微調整
          console.log(`  ${index + 1}. ${circuit.id}: ${circuit.metrics.overall.toFixed(1)} → ${potential.toFixed(1)}点予想`);
        });
    }
    
    // 統計サマリー
    const avgScore = allMetrics.reduce((sum, c) => sum + c.metrics.overall, 0) / allMetrics.length;
    const minScore = Math.min(...allMetrics.map(c => c.metrics.overall));
    const maxScore = Math.max(...allMetrics.map(c => c.metrics.overall));
    
    console.log('\n📊 統計サマリー:');
    console.log(`  平均美的スコア: ${avgScore.toFixed(1)}/100`);
    console.log(`  最高スコア: ${maxScore.toFixed(1)}/100`);
    console.log(`  最低スコア: ${minScore.toFixed(1)}/100`);
    console.log(`  スコア幅: ${(maxScore - minScore).toFixed(1)}点`);
    
    console.log('\n🚀 美的改善展開計画:');
    console.log(`  1. 改善余地回路${needsImprovement.length}個の構造化レイアウト適用`);
    console.log(`  2. 既完璧回路${perfectAlready.length}個の微調整`);
    console.log(`  3. 全14回路で85点以上達成目標`);
    console.log(`  4. 美的スコア標準偏差5点以内の統一品質実現`);
  });
});
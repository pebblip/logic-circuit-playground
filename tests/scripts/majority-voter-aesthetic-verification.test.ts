/**
 * majority-voter美的メトリクス検証
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
    
    console.log(`    カラム間隔: [${columnSpacings.join(', ')}]px, 平均: ${avgColSpacing.toFixed(1)}px, 分散: ${colVariance.toFixed(1)}, スコア: ${colRegularity.toFixed(1)}`);
  }
  
  // 規則性計算（行間隔）
  if (rowSpacings.length > 0) {
    const avgRowSpacing = rowSpacings.reduce((a, b) => a + b, 0) / rowSpacings.length;
    const rowVariance = rowSpacings.reduce((sum, spacing) => sum + Math.pow(spacing - avgRowSpacing, 2), 0) / rowSpacings.length;
    const rowRegularity = Math.max(0, 50 - Math.sqrt(rowVariance) / 2);
    metrics.regularity += rowRegularity;
    
    console.log(`    行間隔: 平均 ${avgRowSpacing.toFixed(1)}px, 分散: ${rowVariance.toFixed(1)}, スコア: ${rowRegularity.toFixed(1)}`);
  }

  // 2. 対称性: 入力・出力の対称配置
  const inputGates = gates.filter(g => g.type === 'INPUT' || g.type === 'CLOCK');
  const outputGates = gates.filter(g => g.type === 'OUTPUT');
  
  if (inputGates.length > 1) {
    const inputCenter = inputGates.reduce((sum, gate) => sum + gate.position.y, 0) / inputGates.length;
    const inputVariance = inputGates.reduce((sum, gate) => sum + Math.pow(gate.position.y - inputCenter, 2), 0) / inputGates.length;
    const inputSymmetry = Math.max(0, 50 - Math.sqrt(inputVariance) / 5);
    metrics.symmetry += inputSymmetry;
    
    console.log(`    入力対称性: 中央${inputCenter.toFixed(1)}px, 分散: ${inputVariance.toFixed(1)}, スコア: ${inputSymmetry.toFixed(1)}`);
  }
  
  if (outputGates.length > 1) {
    const outputCenter = outputGates.reduce((sum, gate) => sum + gate.position.y, 0) / outputGates.length;
    const outputVariance = outputGates.reduce((sum, gate) => sum + Math.pow(gate.position.y - outputCenter, 2), 0) / outputGates.length;
    const outputSymmetry = Math.max(0, 50 - Math.sqrt(outputVariance) / 5);
    metrics.symmetry += outputSymmetry;
    
    console.log(`    出力対称性: 中央${outputCenter.toFixed(1)}px, 分散: ${outputVariance.toFixed(1)}, スコア: ${outputSymmetry.toFixed(1)}`);
  }

  // 3. バランス: 全体の重心
  const centerX = gates.reduce((sum, gate) => sum + gate.position.x, 0) / gates.length;
  const centerY = gates.reduce((sum, gate) => sum + gate.position.y, 0) / gates.length;
  const targetCenterY = 400;
  metrics.balance = Math.max(0, 100 - Math.abs(centerY - targetCenterY) / 5);
  
  console.log(`    重心: (${centerX.toFixed(1)}, ${centerY.toFixed(1)}), 目標: (?, ${targetCenterY}), スコア: ${metrics.balance.toFixed(1)}`);

  // 4. グリッド整列
  let gridAligned = 0;
  gates.forEach(gate => {
    if (gate.position.x % 25 === 0 && gate.position.y % 25 === 0) {
      gridAligned++;
    }
  });
  metrics.gridAlignment = (gridAligned / gates.length) * 100;
  
  console.log(`    グリッド整列: ${gridAligned}/${gates.length}個 (${metrics.gridAlignment.toFixed(1)}%)`);

  // 5. 間隔の最適性
  const targetSpacing = 50; // majority-voterは50px間隔が適切
  let spacingScore = 0;
  if (rowSpacings.length > 0) {
    const spacingAccuracy = rowSpacings.filter(spacing => Math.abs(spacing - targetSpacing) <= 15).length;
    spacingScore = (spacingAccuracy / rowSpacings.length) * 100;
  }
  metrics.spacing = spacingScore;
  
  console.log(`    間隔最適性: ${rowSpacings.filter(s => Math.abs(s - targetSpacing) <= 15).length}/${rowSpacings.length}個が50px±15px (${spacingScore.toFixed(1)}%)`);

  // 総合スコア
  metrics.overall = (metrics.regularity + metrics.symmetry + metrics.balance + metrics.gridAlignment + metrics.spacing) / 5;

  return metrics;
}

describe('🔬 majority-voter美的メトリクス検証', () => {
  it('✨ majority-voter美的改善後の詳細メトリクス', () => {
    const majorityCircuit = FEATURED_CIRCUITS.find(c => c.id === 'majority-voter');
    if (!majorityCircuit) return;
    
    console.log('\n🔬 majority-voter美的メトリクス検証');
    console.log(`📊 総ゲート数: ${majorityCircuit.gates.length}`);
    
    // 実際の座標出力（デバッグ用）
    console.log('\n📍 実際の座標:');
    majorityCircuit.gates.forEach(gate => {
      console.log(`    ${gate.id}: (${gate.position.x}, ${gate.position.y}) // ${gate.type}`);
    });
    
    // 美的メトリクス計算
    console.log('\n📊 詳細美的メトリクス分析:');
    const metrics = calculateActualAestheticMetrics(majorityCircuit.gates);
    
    console.log(`\n📊 最終美的メトリクス:`);
    console.log(`    規則性:      ${metrics.regularity.toFixed(1)}/100`);
    console.log(`    対称性:      ${metrics.symmetry.toFixed(1)}/100`);
    console.log(`    バランス:    ${metrics.balance.toFixed(1)}/100`);
    console.log(`    グリッド整列: ${metrics.gridAlignment.toFixed(1)}/100`);
    console.log(`    間隔最適性:   ${metrics.spacing.toFixed(1)}/100`);
    console.log(`    総合スコア:   ${metrics.overall.toFixed(1)}/100`);
    
    // 改善度評価
    const originalScore = 65.7; // 改善前のスコア
    const improvement = metrics.overall - originalScore;
    
    console.log(`\n🎯 改善度評価:`);
    console.log(`  改善前スコア: ${originalScore.toFixed(1)}/100`);
    console.log(`  改善後スコア: ${metrics.overall.toFixed(1)}/100`);
    console.log(`  改善度: ${improvement > 0 ? '+' : ''}${improvement.toFixed(1)}点`);
    
    if (metrics.overall >= 85) {
      console.log(`  🌟 85点台達成成功！予想通り！`);
    } else if (metrics.overall >= 80) {
      console.log(`  🎉 80点台達成成功！`);
    } else if (improvement > 0) {
      console.log(`  ✅ 改善成功`);
    } else {
      console.log(`  ⚠️ 更なる調整が必要`);
    }
    
    // 評価
    console.log(`\n🎯 評価:`);
    if (metrics.overall >= 90) {
      console.log(`  🌟 素晴らしい! 美的配置として優秀`);
    } else if (metrics.overall >= 80) {
      console.log(`  🎉 良好! 美的配置として良い`);
    } else if (metrics.overall >= 70) {
      console.log(`  ✅ 普通. 基準をクリア`);
    } else {
      console.log(`  ❌ 要改善. 美的配置が不十分`);
    }
  });
});
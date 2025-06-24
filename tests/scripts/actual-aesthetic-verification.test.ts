/**
 * 実際のファイル配置の美的メトリクス検証
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
  const inputGates = gates.filter(g => g.type === 'INPUT');
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
  const targetSpacing = 100;
  let spacingScore = 0;
  if (rowSpacings.length > 0) {
    const spacingAccuracy = rowSpacings.filter(spacing => Math.abs(spacing - targetSpacing) <= 10).length;
    spacingScore = (spacingAccuracy / rowSpacings.length) * 100;
  }
  metrics.spacing = spacingScore;
  
  console.log(`    間隔最適性: ${rowSpacings.filter(s => Math.abs(s - targetSpacing) <= 10).length}/${rowSpacings.length}個が100px±10px (${spacingScore.toFixed(1)}%)`);

  // 総合スコア
  metrics.overall = (metrics.regularity + metrics.symmetry + metrics.balance + metrics.gridAlignment + metrics.spacing) / 5;

  return metrics;
}

/**
 * 重なりチェック
 */
function checkOverlaps(gates: Gate[], minDistance = 100) {
  const overlaps = [];
  for (let i = 0; i < gates.length; i++) {
    for (let j = i + 1; j < gates.length; j++) {
      const dist = Math.sqrt(
        (gates[i].position.x - gates[j].position.x) ** 2 +
        (gates[i].position.y - gates[j].position.y) ** 2
      );
      if (dist < minDistance) {
        overlaps.push({
          gate1: gates[i].id,
          gate2: gates[j].id,
          distance: dist
        });
      }
    }
  }
  return overlaps;
}

describe('🔬 実際のファイル配置美的検証', () => {
  it('✨ 完璧配置適用後の4bit-comparator美的メトリクス', () => {
    const comparatorCircuit = FEATURED_CIRCUITS.find(c => c.id === '4bit-comparator');
    if (!comparatorCircuit) return;
    
    console.log('\n🔬 実際のファイル配置美的メトリクス検証');
    console.log(`📊 総ゲート数: ${comparatorCircuit.gates.length}`);
    
    // 重なりチェック
    const overlaps = checkOverlaps(comparatorCircuit.gates);
    console.log(`重なり: ${overlaps.length}件`);
    
    // 実際の座標出力（デバッグ用）
    console.log('\n📍 実際の座標（最初の10個）:');
    comparatorCircuit.gates.slice(0, 10).forEach(gate => {
      console.log(`    ${gate.id}: (${gate.position.x}, ${gate.position.y}) // ${gate.type}`);
    });
    
    // 美的メトリクス計算
    console.log('\n📊 詳細美的メトリクス分析:');
    const metrics = calculateActualAestheticMetrics(comparatorCircuit.gates);
    
    console.log(`\n📊 最終美的メトリクス:`);
    console.log(`    規則性:      ${metrics.regularity.toFixed(1)}/100`);
    console.log(`    対称性:      ${metrics.symmetry.toFixed(1)}/100`);
    console.log(`    バランス:    ${metrics.balance.toFixed(1)}/100`);
    console.log(`    グリッド整列: ${metrics.gridAlignment.toFixed(1)}/100`);
    console.log(`    間隔最適性:   ${metrics.spacing.toFixed(1)}/100`);
    console.log(`    総合スコア:   ${metrics.overall.toFixed(1)}/100`);
    
    // 評価
    console.log(`\n🎯 評価:`);
    if (metrics.overall >= 80) {
      console.log(`  🎉 素晴らしい! 美的配置として優秀`);
    } else if (metrics.overall >= 70) {
      console.log(`  ✅ 良好! 美的配置として良い`);
    } else if (metrics.overall >= 50) {
      console.log(`  ⚠️ 普通. まだ改善の余地あり`);
    } else {
      console.log(`  ❌ 要改善. 美的配置が不十分`);
    }
    
    // 改善提案
    console.log(`\n💡 改善提案:`);
    if (metrics.regularity < 70) {
      console.log(`  - 規則性改善: ゲート間隔を統一する`);
    }
    if (metrics.symmetry < 70) {
      console.log(`  - 対称性改善: 入力/出力ゲートの配置を調整する`);
    }
    if (metrics.gridAlignment < 90) {
      console.log(`  - グリッド整列: 座標を25pxグリッドにスナップする`);
    }
    if (metrics.spacing < 80) {
      console.log(`  - 間隔最適化: 100px間隔に統一する`);
    }
  });
  
  it('🔍 カラム別詳細分析', () => {
    const comparatorCircuit = FEATURED_CIRCUITS.find(c => c.id === '4bit-comparator');
    if (!comparatorCircuit) return;
    
    console.log('\n🔍 カラム別詳細分析');
    
    // カラム別グループ化
    const gatesByX = new Map<number, Gate[]>();
    comparatorCircuit.gates.forEach(gate => {
      if (!gatesByX.has(gate.position.x)) {
        gatesByX.set(gate.position.x, []);
      }
      gatesByX.get(gate.position.x)!.push(gate);
    });
    
    const sortedColumns = Array.from(gatesByX.entries()).sort(([a], [b]) => a - b);
    
    sortedColumns.forEach(([x, gates], columnIndex) => {
      const sortedGates = gates.sort((a, b) => a.position.y - b.position.y);
      
      console.log(`\n  📐 Column ${columnIndex + 1} (x=${x}):`);
      console.log(`    ゲート数: ${gates.length}個`);
      
      // 座標リスト
      console.log(`    Y座標: [${sortedGates.map(g => g.position.y).join(', ')}]`);
      
      // 間隔チェック
      const spacings: number[] = [];
      for (let i = 1; i < sortedGates.length; i++) {
        const spacing = sortedGates[i].position.y - sortedGates[i-1].position.y;
        spacings.push(spacing);
      }
      
      if (spacings.length > 0) {
        const avgSpacing = spacings.reduce((a, b) => a + b, 0) / spacings.length;
        const isRegular = spacings.every(spacing => spacing === spacings[0]);
        const isTarget = spacings.every(spacing => spacing === 100);
        
        console.log(`    間隔: [${spacings.join(', ')}]px`);
        console.log(`    平均間隔: ${avgSpacing.toFixed(1)}px`);
        console.log(`    規則性: ${isRegular ? '✅ 完璧' : '⚠️ 不規則'}`);
        console.log(`    目標(100px): ${isTarget ? '✅ 達成' : '❌ 未達成'}`);
      }
      
      // 中央配置チェック
      const centerY = sortedGates.reduce((sum, gate) => sum + gate.position.y, 0) / sortedGates.length;
      console.log(`    中央Y座標: ${centerY.toFixed(1)}px (目標: 400px)`);
      
      // グリッド整列チェック
      const gridAligned = sortedGates.every(gate => gate.position.x % 25 === 0 && gate.position.y % 25 === 0);
      console.log(`    グリッド整列: ${gridAligned ? '✅ 完璧' : '❌ 未整列'}`);
    });
  });
});
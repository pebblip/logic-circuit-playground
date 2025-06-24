/**
 * 完璧な美的配置計算機
 * 4bit-comparator専用の最適配置を計算
 */

import { describe, it } from 'vitest';

interface Gate {
  id: string;
  type: string;
  position: { x: number; y: number };
}

/**
 * 完璧な美的配置計算
 */
function calculatePerfectAestheticLayout() {
  const config = {
    gateSpacing: 100,      // 統一間隔
    columnSpacing: 150,    // カラム間隔
    gridSize: 25,          // グリッドサイズ
    centerY: 400,          // 中央Y座標
  };

  const layers = [
    // Layer 0: INPUT gates (8個)
    {
      x: 100,
      gates: ['a3', 'a2', 'a1', 'a0', 'b3', 'b2', 'b1', 'b0'],
      types: ['INPUT', 'INPUT', 'INPUT', 'INPUT', 'INPUT', 'INPUT', 'INPUT', 'INPUT']
    },
    
    // Layer 1a: NOT gates for B inputs (4個)
    {
      x: 250,
      gates: ['not_b3', 'not_b2', 'not_b1', 'not_b0'],
      types: ['NOT', 'NOT', 'NOT', 'NOT']
    },
    
    // Layer 1b: XOR gates for equality (4個)
    {
      x: 400,
      gates: ['xor3', 'xor2', 'xor1', 'xor0'],
      types: ['XOR', 'XOR', 'XOR', 'XOR']
    },
    
    // Layer 1c: NOT gates for equality (4個)
    {
      x: 550,
      gates: ['eq3', 'eq2', 'eq1', 'eq0'],
      types: ['NOT', 'NOT', 'NOT', 'NOT']
    },
    
    // Layer 2: AND gates for A>B (4個)
    {
      x: 700,
      gates: ['a3_gt_b3', 'a2_gt_b2', 'a1_gt_b1', 'a0_gt_b0'],
      types: ['AND', 'AND', 'AND', 'AND']
    },
    
    // Layer 3: Intermediate AND gates (3個)
    {
      x: 850,
      gates: ['eq3_eq2', 'eq3_eq2_eq1', 'eq3_eq2_eq1_eq0'],
      types: ['AND', 'AND', 'AND']
    },
    
    // Layer 4: GT condition AND gates (3個)
    {
      x: 1000,
      gates: ['gt_cond2', 'gt_cond1', 'gt_cond0'],
      types: ['AND', 'AND', 'AND']
    },
    
    // Layer 5: OR gates (3個)
    {
      x: 1150,
      gates: ['gt_temp1', 'gt_temp2', 'a_gt_b'],
      types: ['OR', 'OR', 'OR']
    },
    
    // Layer 6: Final logic (3個)
    {
      x: 1300,
      gates: ['a_eq_b', 'not_gt', 'not_eq'],
      types: ['AND', 'NOT', 'NOT']
    },
    
    // Layer 7: LT gate (1個)
    {
      x: 1450,
      gates: ['a_lt_b'],
      types: ['AND']
    },
    
    // Layer 8: OUTPUT gates (3個)
    {
      x: 1600,
      gates: ['out_gt', 'out_eq', 'out_lt'],
      types: ['OUTPUT', 'OUTPUT', 'OUTPUT']
    }
  ];

  // 各レイヤーの完璧な配置計算
  const perfectLayout: Gate[] = [];
  
  layers.forEach(layer => {
    const gateCount = layer.gates.length;
    
    // 中央揃えのための計算
    const totalHeight = (gateCount - 1) * config.gateSpacing;
    const startY = config.centerY - totalHeight / 2;
    
    layer.gates.forEach((gateId, index) => {
      const y = startY + index * config.gateSpacing;
      
      // グリッドスナッピング
      const snappedX = Math.round(layer.x / config.gridSize) * config.gridSize;
      const snappedY = Math.round(y / config.gridSize) * config.gridSize;
      
      perfectLayout.push({
        id: gateId,
        type: layer.types[index],
        position: { x: snappedX, y: snappedY }
      });
    });
  });

  return { perfectLayout, layers, config };
}

/**
 * 美的メトリクス計算（詳細版）
 */
function calculateDetailedAestheticMetrics(gates: Gate[]) {
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
  
  // 規則性計算
  if (columnSpacings.length > 0) {
    const avgColSpacing = columnSpacings.reduce((a, b) => a + b, 0) / columnSpacings.length;
    const colVariance = columnSpacings.reduce((sum, spacing) => sum + Math.pow(spacing - avgColSpacing, 2), 0) / columnSpacings.length;
    metrics.regularity += Math.max(0, 50 - Math.sqrt(colVariance) / 2);
  }
  
  if (rowSpacings.length > 0) {
    const avgRowSpacing = rowSpacings.reduce((a, b) => a + b, 0) / rowSpacings.length;
    const rowVariance = rowSpacings.reduce((sum, spacing) => sum + Math.pow(spacing - avgRowSpacing, 2), 0) / rowSpacings.length;
    metrics.regularity += Math.max(0, 50 - Math.sqrt(rowVariance) / 2);
  }

  // 2. 対称性: 入力・出力の対称配置
  const inputGates = gates.filter(g => g.type === 'INPUT');
  const outputGates = gates.filter(g => g.type === 'OUTPUT');
  
  if (inputGates.length > 1) {
    const inputCenter = inputGates.reduce((sum, gate) => sum + gate.position.y, 0) / inputGates.length;
    const inputVariance = inputGates.reduce((sum, gate) => sum + Math.pow(gate.position.y - inputCenter, 2), 0) / inputGates.length;
    metrics.symmetry += Math.max(0, 50 - Math.sqrt(inputVariance) / 5);
  }
  
  if (outputGates.length > 1) {
    const outputCenter = outputGates.reduce((sum, gate) => sum + gate.position.y, 0) / outputGates.length;
    const outputVariance = outputGates.reduce((sum, gate) => sum + Math.pow(gate.position.y - outputCenter, 2), 0) / outputGates.length;
    metrics.symmetry += Math.max(0, 50 - Math.sqrt(outputVariance) / 5);
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

describe('🎯 完璧な美的配置計算', () => {
  it('✨ 4bit-comparator完璧配置の計算', () => {
    const { perfectLayout, layers, config } = calculatePerfectAestheticLayout();
    
    console.log('\n🎯 完璧な美的配置計算結果');
    console.log(`📊 設定:`);
    console.log(`  ゲート間隔: ${config.gateSpacing}px (統一)`);
    console.log(`  カラム間隔: ${config.columnSpacing}px`);
    console.log(`  グリッドサイズ: ${config.gridSize}px`);
    console.log(`  中央Y座標: ${config.centerY}px`);
    
    console.log(`\n🏗️ レイヤー構造:`);
    layers.forEach((layer, index) => {
      console.log(`  Layer ${index} (x=${layer.x}): ${layer.gates.length}個のゲート`);
    });
    
    // 美的メトリクス計算
    const metrics = calculateDetailedAestheticMetrics(perfectLayout);
    
    console.log(`\n📊 完璧配置の美的メトリクス:`);
    console.log(`  規則性:      ${metrics.regularity.toFixed(1)}/100`);
    console.log(`  対称性:      ${metrics.symmetry.toFixed(1)}/100`);
    console.log(`  バランス:    ${metrics.balance.toFixed(1)}/100`);
    console.log(`  グリッド整列: ${metrics.gridAlignment.toFixed(1)}/100`);
    console.log(`  間隔最適性:   ${metrics.spacing.toFixed(1)}/100`);
    console.log(`  総合スコア:   ${metrics.overall.toFixed(1)}/100`);
    
    // 座標出力（実装用）
    console.log(`\n📍 完璧配置座標（実装用）:`);
    perfectLayout.forEach(gate => {
      console.log(`    ${gate.id}: (${gate.position.x}, ${gate.position.y}) // ${gate.type}`);
    });
    
    // 期待される改善効果
    console.log(`\n🎯 期待される改善効果:`);
    if (metrics.overall >= 80) {
      console.log(`  🎉 素晴らしい! 美的スコア80+達成予想`);
    } else if (metrics.overall >= 70) {
      console.log(`  ✅ 良好! 美的スコア70+達成予想`);
    } else {
      console.log(`  ⚠️ 追加調整が必要`);
    }
  });
  
  it('🔍 各レイヤーの詳細分析', () => {
    const { perfectLayout } = calculatePerfectAestheticLayout();
    
    console.log('\n🔍 各レイヤーの詳細分析');
    
    // レイヤー別グループ化
    const gatesByX = new Map<number, Gate[]>();
    perfectLayout.forEach(gate => {
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
      
      // 間隔チェック
      const spacings: number[] = [];
      for (let i = 1; i < sortedGates.length; i++) {
        const spacing = sortedGates[i].position.y - sortedGates[i-1].position.y;
        spacings.push(spacing);
      }
      
      if (spacings.length > 0) {
        const avgSpacing = spacings.reduce((a, b) => a + b, 0) / spacings.length;
        const isRegular = spacings.every(spacing => spacing === spacings[0]);
        console.log(`    平均間隔: ${avgSpacing.toFixed(1)}px`);
        console.log(`    規則性: ${isRegular ? '✅ 完璧' : '⚠️ 要調整'}`);
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
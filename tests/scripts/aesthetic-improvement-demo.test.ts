/**
 * 美的改善デモンストレーション
 * 構造化配置 + 美的調整のハイブリッドアプローチ
 */

import { describe, it } from 'vitest';
import { FEATURED_CIRCUITS } from '../../src/features/gallery/data/index';
import type { Gate, Wire } from '../../src/types/circuit';

/**
 * 美的改善付き構造化レイアウト
 */
function createAestheticStructuredLayout(gates: Gate[], wires: Wire[]) {
  // Step 1: 層の分析
  const layers = analyzeLayers(gates, wires);
  
  // Step 2: 美的パラメータの設定
  const config = {
    columnSpacing: 150,        // カラム間隔
    gateSpacing: 100,          // ゲート間隔（統一）
    centerAlignment: true,     // 中央揃え
    symmetryOptimization: true, // 対称性最適化
    gridSnapping: true,        // グリッドスナップ
  };
  
  // Step 3: 美的レイアウト適用
  const layoutGates = gates.map(gate => ({ ...gate }));
  
  // 各層の高さを計算して中央揃えを実現
  const totalHeight = Math.max(...layers.map(layer => layer.gates.length)) * config.gateSpacing;
  const centerY = totalHeight / 2;
  
  layers.forEach((layer, layerIndex) => {
    const x = 100 + layerIndex * config.columnSpacing;
    
    // 中央揃えのための開始Y座標計算
    const layerHeight = (layer.gates.length - 1) * config.gateSpacing;
    const startY = centerY - layerHeight / 2;
    
    layer.gates.forEach((gate, gateIndex) => {
      const targetGate = layoutGates.find(g => g.id === gate.id);
      if (targetGate) {
        targetGate.position = {
          x,
          y: startY + gateIndex * config.gateSpacing,
        };
      }
    });
  });
  
  // Step 4: 美的微調整
  const aestheticGates = applyAestheticAdjustments(layoutGates, layers, config);
  
  return { 
    layoutGates: aestheticGates, 
    layers, 
    metrics: calculateAestheticMetrics(aestheticGates, layers) 
  };
}

/**
 * 美的微調整を適用
 */
function applyAestheticAdjustments(gates: Gate[], layers: any[], config: any): Gate[] {
  const adjustedGates = gates.map(gate => ({ ...gate }));
  
  // 1. グリッドスナッピング
  if (config.gridSnapping) {
    adjustedGates.forEach(gate => {
      gate.position.x = Math.round(gate.position.x / 25) * 25; // 25pxグリッド
      gate.position.y = Math.round(gate.position.y / 25) * 25;
    });
  }
  
  // 2. 対称性最適化（入力・出力ゲート）
  if (config.symmetryOptimization) {
    const inputGates = adjustedGates.filter(g => g.type === 'INPUT');
    const outputGates = adjustedGates.filter(g => g.type === 'OUTPUT');
    
    // 入力ゲートの対称配置
    if (inputGates.length > 0) {
      applySymmetricArrangement(inputGates);
    }
    
    // 出力ゲートの対称配置
    if (outputGates.length > 0) {
      applySymmetricArrangement(outputGates);
    }
  }
  
  // 3. 視覚的バランス調整
  applyVisualBalance(adjustedGates, layers);
  
  return adjustedGates;
}

/**
 * 対称配置を適用
 */
function applySymmetricArrangement(gates: Gate[]) {
  if (gates.length <= 1) return;
  
  const centerY = gates.reduce((sum, gate) => sum + gate.position.y, 0) / gates.length;
  
  // Y座標で並び替え
  const sortedGates = gates.sort((a, b) => a.position.y - b.position.y);
  
  // 中央基準で対称配置
  const spacing = 100;
  const totalHeight = (sortedGates.length - 1) * spacing;
  const startY = centerY - totalHeight / 2;
  
  sortedGates.forEach((gate, index) => {
    gate.position.y = startY + index * spacing;
  });
}

/**
 * 視覚的バランス調整
 */
function applyVisualBalance(gates: Gate[], layers: any[]) {
  // カラム間のバランス調整
  const columnCenters = new Map<number, number>();
  
  layers.forEach((layer, index) => {
    const x = layer.gates[0]?.position?.x || 0;
    const gatesInColumn = gates.filter(g => Math.abs(g.position.x - x) < 10);
    
    if (gatesInColumn.length > 0) {
      const avgY = gatesInColumn.reduce((sum, gate) => sum + gate.position.y, 0) / gatesInColumn.length;
      columnCenters.set(x, avgY);
    }
  });
  
  // 全体の視覚的重心を調整
  const targetCenterY = 400; // 目標中心Y座標
  const currentCenterY = Array.from(columnCenters.values()).reduce((sum, y) => sum + y, 0) / columnCenters.size;
  const offsetY = targetCenterY - currentCenterY;
  
  gates.forEach(gate => {
    gate.position.y += offsetY;
  });
}

/**
 * 層分析（既存）
 */
function analyzeLayers(gates: Gate[], wires: Wire[]) {
  const layers: Array<{ level: number; gates: Gate[] }> = [];
  const processed = new Set<string>();
  
  // Layer 0: INPUT gates
  const inputGates = gates.filter(g => g.type === 'INPUT');
  if (inputGates.length > 0) {
    layers.push({ level: 0, gates: inputGates });
    inputGates.forEach(g => processed.add(g.id));
  }
  
  // Intermediate layers: Logic gates
  let currentLevel = 1;
  while (processed.size < gates.length) {
    const currentLayerGates = gates.filter(gate => {
      if (processed.has(gate.id)) return false;
      if (gate.type === 'OUTPUT') return false;
      
      const inputWires = wires.filter(w => w.to.gateId === gate.id);
      return inputWires.every(w => processed.has(w.from.gateId));
    });
    
    if (currentLayerGates.length === 0) break;
    
    layers.push({ level: currentLevel, gates: currentLayerGates });
    currentLayerGates.forEach(g => processed.add(g.id));
    currentLevel++;
  }
  
  // Final layer: OUTPUT gates
  const outputGates = gates.filter(g => g.type === 'OUTPUT' && !processed.has(g.id));
  if (outputGates.length > 0) {
    layers.push({ level: currentLevel, gates: outputGates });
  }
  
  return layers;
}

/**
 * 美的メトリクス計算
 */
function calculateAestheticMetrics(gates: Gate[], layers: any[]) {
  const metrics = {
    regularity: 0,      // 規則性スコア
    symmetry: 0,        // 対称性スコア
    balance: 0,         // バランススコア
    overall: 0,         // 総合美的スコア
  };
  
  // 規則性: ゲート間距離の一貫性
  const distances: number[] = [];
  for (let i = 0; i < gates.length; i++) {
    for (let j = i + 1; j < gates.length; j++) {
      if (Math.abs(gates[i].position.x - gates[j].position.x) < 10) { // 同じカラム
        const dist = Math.abs(gates[i].position.y - gates[j].position.y);
        distances.push(dist);
      }
    }
  }
  
  if (distances.length > 0) {
    const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;
    const variance = distances.reduce((sum, d) => sum + Math.pow(d - avgDistance, 2), 0) / distances.length;
    metrics.regularity = Math.max(0, 100 - Math.sqrt(variance)); // 分散が小さいほど高スコア
  }
  
  // 対称性: 入力・出力ゲートの配置
  const inputGates = gates.filter(g => g.type === 'INPUT');
  const outputGates = gates.filter(g => g.type === 'OUTPUT');
  
  if (inputGates.length > 1) {
    const inputCenter = inputGates.reduce((sum, gate) => sum + gate.position.y, 0) / inputGates.length;
    const inputVariance = inputGates.reduce((sum, gate) => sum + Math.pow(gate.position.y - inputCenter, 2), 0) / inputGates.length;
    metrics.symmetry += Math.max(0, 50 - Math.sqrt(inputVariance) / 2);
  }
  
  if (outputGates.length > 1) {
    const outputCenter = outputGates.reduce((sum, gate) => sum + gate.position.y, 0) / outputGates.length;
    const outputVariance = outputGates.reduce((sum, gate) => sum + Math.pow(gate.position.y - outputCenter, 2), 0) / outputGates.length;
    metrics.symmetry += Math.max(0, 50 - Math.sqrt(outputVariance) / 2);
  }
  
  // バランス: 全体の視覚的重心
  const centerX = gates.reduce((sum, gate) => sum + gate.position.x, 0) / gates.length;
  const centerY = gates.reduce((sum, gate) => sum + gate.position.y, 0) / gates.length;
  const targetCenterY = 400;
  metrics.balance = Math.max(0, 100 - Math.abs(centerY - targetCenterY) / 5);
  
  // 総合スコア
  metrics.overall = (metrics.regularity + metrics.symmetry + metrics.balance) / 3;
  
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

describe('🎨 美的改善デモンストレーション', () => {
  it('✨ 4bit-comparator: 美的改善適用', () => {
    const comparatorCircuit = FEATURED_CIRCUITS.find(c => c.id === '4bit-comparator');
    if (!comparatorCircuit) return;
    
    console.log('\n🎨 美的改善デモ: 4bit-comparator');
    
    // 現在の配置
    const currentOverlaps = checkOverlaps(comparatorCircuit.gates);
    console.log(`現在の配置:`);
    console.log(`  重なり: ${currentOverlaps.length}件`);
    
    // 美的改善適用
    const { layoutGates, layers, metrics } = createAestheticStructuredLayout(
      comparatorCircuit.gates, 
      comparatorCircuit.wires
    );
    
    const newOverlaps = checkOverlaps(layoutGates);
    
    console.log(`\n美的改善後:`);
    console.log(`  重なり: ${newOverlaps.length}件`);
    console.log(`  📊 美的メトリクス:`);
    console.log(`    規則性: ${metrics.regularity.toFixed(1)}/100`);
    console.log(`    対称性: ${metrics.symmetry.toFixed(1)}/100`);
    console.log(`    バランス: ${metrics.balance.toFixed(1)}/100`);
    console.log(`    総合スコア: ${metrics.overall.toFixed(1)}/100`);
    
    // 配置例表示
    console.log(`\n📍 改善後の配置例:`);
    const sampleGates = layoutGates.slice(0, 8);
    sampleGates.forEach(gate => {
      console.log(`    ${gate.type}(${gate.id}): (${gate.position.x}, ${gate.position.y})`);
    });
    
    // レイヤー分析
    console.log(`\n🏗️ レイヤー構造:`);
    layers.forEach(layer => {
      const x = layer.gates[0]?.id ? layoutGates.find(g => g.id === layer.gates[0].id)?.position.x : '?';
      console.log(`    Layer ${layer.level} (x=${x}): ${layer.gates.length}個のゲート`);
    });
  });
  
  it('🔬 美的改善効果の比較分析', () => {
    const comparatorCircuit = FEATURED_CIRCUITS.find(c => c.id === '4bit-comparator');
    if (!comparatorCircuit) return;
    
    console.log('\n🔬 美的改善効果の比較分析');
    
    // オリジナル（現在の手動配置）
    const originalMetrics = calculateAestheticMetrics(comparatorCircuit.gates, []);
    
    // 美的改善適用
    const { layoutGates, metrics: improvedMetrics } = createAestheticStructuredLayout(
      comparatorCircuit.gates, 
      comparatorCircuit.wires
    );
    
    console.log(`\n📊 比較結果:`);
    console.log(`  項目          | オリジナル | 改善後 | 向上`);
    console.log(`  ------------- | --------- | ------ | ----`);
    console.log(`  規則性        | ${originalMetrics.regularity.toFixed(1).padStart(8)} | ${improvedMetrics.regularity.toFixed(1).padStart(6)} | +${(improvedMetrics.regularity - originalMetrics.regularity).toFixed(1)}`);
    console.log(`  対称性        | ${originalMetrics.symmetry.toFixed(1).padStart(8)} | ${improvedMetrics.symmetry.toFixed(1).padStart(6)} | +${(improvedMetrics.symmetry - originalMetrics.symmetry).toFixed(1)}`);
    console.log(`  バランス      | ${originalMetrics.balance.toFixed(1).padStart(8)} | ${improvedMetrics.balance.toFixed(1).padStart(6)} | +${(improvedMetrics.balance - originalMetrics.balance).toFixed(1)}`);
    console.log(`  総合スコア    | ${originalMetrics.overall.toFixed(1).padStart(8)} | ${improvedMetrics.overall.toFixed(1).padStart(6)} | +${(improvedMetrics.overall - originalMetrics.overall).toFixed(1)}`);
    
    // 改善提案
    console.log(`\n💡 改善のポイント:`);
    if (improvedMetrics.regularity > originalMetrics.regularity) {
      console.log(`  ✅ ゲート間距離が規則的になりました`);
    }
    if (improvedMetrics.symmetry > originalMetrics.symmetry) {
      console.log(`  ✅ 対称性が向上しました`);
    }
    if (improvedMetrics.balance > originalMetrics.balance) {
      console.log(`  ✅ 視覚的バランスが改善されました`);
    }
    
    console.log(`\n🎯 次のステップ:`);
    console.log(`  1. 実際の回路ファイルに適用`);
    console.log(`  2. 他の回路への展開`);
    console.log(`  3. ユーザーによる視覚的確認`);
  });
  
  it('🌸 曼荼羅回路への美的改善適用テスト', () => {
    const mandalaCircuit = FEATURED_CIRCUITS.find(c => c.id === 'mandala-circuit');
    if (!mandalaCircuit) return;
    
    console.log('\n🌸 曼荼羅回路への美的改善適用');
    
    // 元の重なり
    const originalOverlaps = checkOverlaps(mandalaCircuit.gates);
    
    // 美的改善適用
    const { layoutGates, metrics } = createAestheticStructuredLayout(
      mandalaCircuit.gates, 
      mandalaCircuit.wires
    );
    
    const newOverlaps = checkOverlaps(layoutGates);
    
    console.log(`元の重なり: ${originalOverlaps.length}件`);
    console.log(`美的改善後: ${newOverlaps.length}件`);
    console.log(`美的スコア: ${metrics.overall.toFixed(1)}/100`);
    
    console.log(`\n🤔 曼荼羅特有の考察:`);
    console.log(`  構造化配置: 機能的だが、放射状美学が失われる`);
    console.log(`  手動配置: 美しいが、重なり問題がある`);
    console.log(`  💡 提案: 曼荼羅専用の放射状配置関数を追加`);
  });
});
/**
 * mandala-circuit詳細分析と美的改善計画
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
 * mandala-circuit専用の美的改善配置計算
 */
function calculateMandalaAestheticLayout(gates: Gate[], wires: Wire[]) {
  // マンダラ回路の特殊性を考慮した改善配置
  const config = {
    centerX: 400,
    centerY: 250,
    ring1Radius: 80,    // 内側リング（3個NOT）
    ring2Radius: 140,   // 外側リング（5個NOT）
    patternRadius: 200, // パターンXOR層
    outputRadius: 280,  // 出力層
    gridSize: 25,       // グリッドスナッピング
  };
  
  const perfectLayout: Gate[] = [];
  
  gates.forEach(gate => {
    let newX = gate.position.x;
    let newY = gate.position.y;
    
    if (gate.id.startsWith('ring1_not')) {
      // 内側リング（3個NOT）- 正三角形配置
      const index = parseInt(gate.id.slice(-1)) - 1;
      const angle = (index * 120 - 90) * Math.PI / 180; // -90度で上から開始
      newX = config.centerX + Math.cos(angle) * config.ring1Radius;
      newY = config.centerY + Math.sin(angle) * config.ring1Radius;
    } 
    else if (gate.id.startsWith('ring2_not')) {
      // 外側リング（5個NOT）- 正五角形配置
      const index = parseInt(gate.id.slice(-1)) - 1;
      const angle = (index * 72 - 90) * Math.PI / 180; // -90度で上から開始
      newX = config.centerX + Math.cos(angle) * config.ring2Radius;
      newY = config.centerY + Math.sin(angle) * config.ring2Radius;
    }
    else if (gate.id === 'interact_xor') {
      // 中央相互作用ゲート - 中心下寄り
      newX = config.centerX;
      newY = config.centerY + 40;
    }
    else if (gate.id.startsWith('pattern_xor')) {
      // パターンXOR - 5個を均等配置
      const patternGates = gates.filter(g => g.id.startsWith('pattern_xor'));
      const index = patternGates.findIndex(g => g.id === gate.id);
      const angle = (index * 72 - 54) * Math.PI / 180; // -54度で偏差
      newX = config.centerX + Math.cos(angle) * config.patternRadius;
      newY = config.centerY + Math.sin(angle) * config.patternRadius;
    }
    else if (gate.id.startsWith('out_')) {
      // 出力ゲート - 6方向放射状
      const direction = gate.id.replace('out_', '');
      switch (direction) {
        case 'north':
          newX = config.centerX;
          newY = config.centerY - config.outputRadius;
          break;
        case 'northeast':
          newX = config.centerX + Math.cos(-30 * Math.PI / 180) * config.outputRadius;
          newY = config.centerY + Math.sin(-30 * Math.PI / 180) * config.outputRadius;
          break;
        case 'southeast':
          newX = config.centerX + Math.cos(30 * Math.PI / 180) * config.outputRadius;
          newY = config.centerY + Math.sin(30 * Math.PI / 180) * config.outputRadius;
          break;
        case 'south':
          newX = config.centerX;
          newY = config.centerY + config.outputRadius;
          break;
        case 'southwest':
          newX = config.centerX + Math.cos(150 * Math.PI / 180) * config.outputRadius;
          newY = config.centerY + Math.sin(150 * Math.PI / 180) * config.outputRadius;
          break;
        case 'northwest':
          newX = config.centerX + Math.cos(-150 * Math.PI / 180) * config.outputRadius;
          newY = config.centerY + Math.sin(-150 * Math.PI / 180) * config.outputRadius;
          break;
      }
    }
    
    // グリッドスナッピング
    const snappedX = Math.round(newX / config.gridSize) * config.gridSize;
    const snappedY = Math.round(newY / config.gridSize) * config.gridSize;
    
    perfectLayout.push({
      ...gate,
      position: { x: snappedX, y: snappedY }
    });
  });
  
  return { perfectLayout, config };
}

describe('🔍 mandala-circuit詳細分析', () => {
  it('🚨 現在の重なり問題を詳細分析', () => {
    const mandalaCircuit = FEATURED_CIRCUITS.find(c => c.id === 'mandala-circuit');
    if (!mandalaCircuit) {
      console.error('❌ mandala-circuit回路が見つかりません');
      return;
    }
    
    console.log('\n🔍 mandala-circuit重なり詳細分析');
    console.log(`📊 総ゲート数: ${mandalaCircuit.gates.length}`);
    
    const overlaps = checkCircuitOverlaps(mandalaCircuit.gates);
    
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
    
    // ゲート分類分析
    console.log('\n📍 ゲート分類別配置:');
    const ring1 = mandalaCircuit.gates.filter(g => g.id.startsWith('ring1_not'));
    const ring2 = mandalaCircuit.gates.filter(g => g.id.startsWith('ring2_not'));
    const patterns = mandalaCircuit.gates.filter(g => g.id.startsWith('pattern_xor'));
    const outputs = mandalaCircuit.gates.filter(g => g.id.startsWith('out_'));
    const interact = mandalaCircuit.gates.filter(g => g.id === 'interact_xor');
    
    console.log(`   Ring1 (3個NOT): ${ring1.length}個`);
    console.log(`   Ring2 (5個NOT): ${ring2.length}個`);
    console.log(`   Pattern XOR: ${patterns.length}個`);
    console.log(`   Interact XOR: ${interact.length}個`);
    console.log(`   Output: ${outputs.length}個`);
  });
  
  it('✨ 美的改善後の予想配置', () => {
    const mandalaCircuit = FEATURED_CIRCUITS.find(c => c.id === 'mandala-circuit');
    if (!mandalaCircuit) return;
    
    console.log('\n✨ mandala-circuit美的改善配置計算');
    
    // 現在の重なり
    const originalOverlaps = checkCircuitOverlaps(mandalaCircuit.gates);
    console.log(`現在の重なり: ${originalOverlaps.length}件`);
    
    // 美的改善配置計算
    const { perfectLayout, config } = calculateMandalaAestheticLayout(
      mandalaCircuit.gates, 
      mandalaCircuit.wires
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
    
    console.log(`\n📊 マンダラ配置設定:`);
    console.log(`  中心座標: (${config.centerX}, ${config.centerY})`);
    console.log(`  Ring1半径: ${config.ring1Radius}px`);
    console.log(`  Ring2半径: ${config.ring2Radius}px`);
    console.log(`  パターン半径: ${config.patternRadius}px`);
    console.log(`  出力半径: ${config.outputRadius}px`);
    console.log(`  グリッドサイズ: ${config.gridSize}px`);
    
    // 座標例表示
    console.log(`\n📍 改善後座標例（最初の10個）:`);
    perfectLayout.slice(0, 10).forEach(gate => {
      console.log(`    ${gate.id}: (${gate.position.x}, ${gate.position.y}) // ${gate.type}`);
    });
  });
});
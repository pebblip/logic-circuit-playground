/**
 * 手動座標配置の難しさを実演するプログラム
 * 
 * 問題: たった1つのゲートを移動するだけで、どれだけ複雑になるか？
 */

import { describe, it } from 'vitest';

// 曼荼羅回路の現在の座標（簡略版）
const currentGates = [
  { id: 'ring1_not1', position: { x: 400, y: 200 } },
  { id: 'ring1_not2', position: { x: 330, y: 280 } },
  { id: 'ring1_not3', position: { x: 470, y: 280 } },
  { id: 'interact_xor', position: { x: 400, y: 280 } },
  { id: 'pattern_xor3', position: { x: 350, y: 70 } },
  { id: 'out_north', position: { x: 400, y: 30 } },
  // ... 他14個のゲート
];

/**
 * 距離計算
 */
function distance(p1: {x: number, y: number}, p2: {x: number, y: number}): number {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

/**
 * 重なりチェック
 */
function checkOverlaps(gates: typeof currentGates, minDistance = 100) {
  const overlaps = [];
  for (let i = 0; i < gates.length; i++) {
    for (let j = i + 1; j < gates.length; j++) {
      const dist = distance(gates[i].position, gates[j].position);
      if (dist < minDistance) {
        overlaps.push({
          gate1: gates[i].id,
          gate2: gates[j].id,
          distance: dist,
          violation: minDistance - dist
        });
      }
    }
  }
  return overlaps;
}

describe('🎯 座標配置の難しさデモンストレーション', () => {
  it('🔥 問題1: たった1つのゲートを動かすだけで...', () => {
    console.log('\n🎯 実験: interact_xorを10px右に動かしてみる');
    
    // 現在の重なり状況
    const originalOverlaps = checkOverlaps(currentGates);
    console.log(`現在の重なり: ${originalOverlaps.length}件`);
    originalOverlaps.forEach(o => {
      console.log(`  ${o.gate1} ↔ ${o.gate2}: ${o.distance.toFixed(1)}px (${o.violation.toFixed(1)}px不足)`);
    });
    
    // interact_xorを10px右に移動
    const modifiedGates = currentGates.map(gate => 
      gate.id === 'interact_xor' 
        ? { ...gate, position: { x: gate.position.x + 10, y: gate.position.y } }
        : gate
    );
    
    const newOverlaps = checkOverlaps(modifiedGates);
    console.log(`\n移動後の重なり: ${newOverlaps.length}件`);
    newOverlaps.forEach(o => {
      console.log(`  ${o.gate1} ↔ ${o.gate2}: ${o.distance.toFixed(1)}px (${o.violation.toFixed(1)}px不足)`);
    });
    
    console.log('\n💡 たった10px動かしただけで複数の制約に影響！');
  });
  
  it('🌀 問題2: 連鎖反応の恐怖', () => {
    console.log('\n🌀 連鎖反応デモンストレーション');
    
    // interact_xorの重なり解消を試みる
    console.log('Step 1: interact_xorを下に40px移動（重なり解消目的）');
    let gates = currentGates.map(gate => 
      gate.id === 'interact_xor' 
        ? { ...gate, position: { x: gate.position.x, y: gate.position.y + 40 } }
        : gate
    );
    
    let overlaps = checkOverlaps(gates);
    console.log(`結果: ${overlaps.length}件の重なり`);
    
    console.log('\nStep 2: 新たな重なりが発生したため、他のゲートも移動が必要');
    console.log('Step 3: それがまた別の重なりを引き起こす...');
    console.log('Step 4: 無限連鎖の始まり 😱');
    
    console.log('\n🔥 これが「座標配置は簡単」ではない理由！');
  });
  
  it('🧠 問題3: 人間の認知限界', () => {
    console.log('\n🧠 人間の認知限界テスト');
    
    // ランダムに5個のゲートを選んで、最適配置を考える
    const selectedGates = currentGates.slice(0, 5);
    
    console.log('課題: 以下5個のゲートを重なりなしで美しく配置せよ');
    selectedGates.forEach(gate => {
      console.log(`  ${gate.id}: (${gate.position.x}, ${gate.position.y})`);
    });
    
    // 全ペア間の現在距離を表示
    console.log('\n現在の全ペア間距離:');
    for (let i = 0; i < selectedGates.length; i++) {
      for (let j = i + 1; j < selectedGates.length; j++) {
        const dist = distance(selectedGates[i].position, selectedGates[j].position);
        const status = dist >= 100 ? '✅' : '❌';
        console.log(`  ${selectedGates[i].id} ↔ ${selectedGates[j].id}: ${dist.toFixed(1)}px ${status}`);
      }
    }
    
    console.log('\n💭 これを頭の中で同時に最適化できますか？');
    console.log('💭 しかも20個のゲート = 190ペアの制約が同時に...?');
  });
  
  it('🎨 問題4: 美的制約 vs 実用制約', () => {
    console.log('\n🎨 美的制約と実用制約の衝突');
    
    console.log('美的要求:');
    console.log('  - 放射状対称性');
    console.log('  - 黄金比配置');
    console.log('  - 視覚的バランス');
    
    console.log('\n実用要求:');
    console.log('  - 100px最低間隔');
    console.log('  - 画面内収納');
    console.log('  - 配線長最小化');
    
    console.log('\n💔 これらの制約は互いに矛盾することが多い');
    console.log('例: 完璧な対称性 = 最小間隔違反');
    console.log('例: 十分な間隔 = 対称性破綻');
    
    console.log('\n🤯 結論: 「単なる座標配置」ではない多目的最適化問題');
  });
  
  it('📊 問題5: スケールの悪夢', () => {
    console.log('\n📊 問題のスケール感');
    
    const gateCount = 20;
    const constraintCount = (gateCount * (gateCount - 1)) / 2; // 全ペア
    const searchSpace = Math.pow(800 * 600, gateCount);
    
    console.log(`ゲート数: ${gateCount}個`);
    console.log(`制約数: ${constraintCount}個 (全ペア間距離)`);
    console.log(`探索空間: 約${searchSpace.toExponential(2)}通り`);
    
    console.log('\n⏰ 人間が試行錯誤で解くには:');
    console.log('- 1回の配置変更: 5分');
    console.log('- 必要な試行回数: 数千～数万回');
    console.log('- 総時間: 数百時間～数年 😱');
    
    console.log('\n🤖 コンピュータでも:');
    console.log('- 総当たり: 宇宙の年齢より長い');
    console.log('- 遺伝的アルゴリズム: 数分～数時間');
    console.log('- 力学シミュレーション: 数秒');
  });
});
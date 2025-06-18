#!/usr/bin/env node

// 2ビットフィボナッチ + オーバーフロー検出の期待動作

console.log('🧮 2ビットフィボナッチ + オーバーフロー検出:');

let a = 1, b = 1;
console.log(`初期: A=${a.toString(2).padStart(2,'0')} (${a}), B=${b.toString(2).padStart(2,'0')} (${b}), キャリー=0`);

for (let cycle = 1; cycle <= 15; cycle++) {
  let next_a = b;
  let sum = a + b;
  let next_b = sum & 0b11; // 2ビットマスク
  let carry = sum > 3 ? 1 : 0; // オーバーフロー検出
  
  console.log(`サイクル${cycle}: A=${next_a.toString(2).padStart(2,'0')} (${next_a}), B=${next_b.toString(2).padStart(2,'0')} (${next_b}), キャリー=${carry} ${carry ? '🔴' : '⚫'}`);
  
  a = next_a;
  b = next_b;
  
  if (cycle > 5 && next_a === 1 && next_b === 1) {
    console.log(`🔄 周期検出: ${cycle}サイクルで初期状態に戻る`);
    break;
  }
}

console.log('\n🔍 分析:');
console.log('- キャリー（最上位ビット）は不規則に光る');
console.log('- A+B > 3の時だけキャリーが発生');
console.log('- この不規則性がフィボナッチ数列の特徴');
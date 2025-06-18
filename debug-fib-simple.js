#!/usr/bin/env node

// フィボナッチカウンターの問題調査
// 2Hzで3分 = 360サイクル実行すれば、3ビットは何度もオーバーフローするはず

console.log('🧮 フィボナッチ数列（3ビット）の期待される動作:');

let a = 1, b = 1;
console.log(`初期: A=${a.toString(2).padStart(3,'0')} (${a}), B=${b.toString(2).padStart(3,'0')} (${b})`);

for (let cycle = 1; cycle <= 20; cycle++) {
  let next_a = b;
  let next_b = (a + b) & 0b111; // 3ビットマスク
  
  console.log(`サイクル${cycle}: A=${next_a.toString(2).padStart(3,'0')} (${next_a}), B=${next_b.toString(2).padStart(3,'0')} (${next_b})`);
  
  a = next_a;
  b = next_b;
  
  if (cycle > 5 && next_a === 1 && next_b === 1) {
    console.log(`🔄 周期検出: ${cycle}サイクルで初期状態に戻る`);
    break;
  }
}

console.log('\n🔍 分析:');
console.log('- bit2（最上位）は サイクル4-6, 8, 13以降で光るはず');
console.log('- bit1（中位）は サイクル2-3, 6-7, 9-10, 12-13などで光るはず');
console.log('- bit0（最下位）は 奇数サイクルで光るはず');
console.log('');
console.log('もし3分間でbit2が一度も光らないなら、加算器に問題がある');
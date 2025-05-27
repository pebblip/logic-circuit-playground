// テスト実行スクリプト
import { execSync } from 'child_process';

console.log('=== 論理回路プレイグラウンド テスト実行 ===\n');

const testFiles = [
  'src/components/__tests__/LogicCircuit.behavior.test.jsx',
  'src/components/__tests__/LogicCircuit.integration.test.jsx',
  'src/components/__tests__/LogicCircuit.e2e.test.jsx'
];

let totalPassed = 0;
let totalFailed = 0;

testFiles.forEach(file => {
  console.log(`\n実行中: ${file}`);
  console.log('='.repeat(60));
  
  try {
    const result = execSync(`pnpm test ${file} --reporter=json`, { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    const json = JSON.parse(result);
    const passed = json.numPassedTests || 0;
    const failed = json.numFailedTests || 0;
    
    totalPassed += passed;
    totalFailed += failed;
    
    console.log(`✅ 成功: ${passed}`);
    console.log(`❌ 失敗: ${failed}`);
    
  } catch (error) {
    console.log('テスト実行エラー:', error.message);
  }
});

console.log('\n' + '='.repeat(60));
console.log(`\n総合結果:`);
console.log(`✅ 成功: ${totalPassed}`);
console.log(`❌ 失敗: ${totalFailed}`);
console.log(`合計: ${totalPassed + totalFailed}`);
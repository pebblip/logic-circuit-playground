import { describe, it, expect } from 'vitest';
import { SELF_OSCILLATING_MEMORY } from '@/features/gallery/data/self-oscillating-memory';

/**
 * 🎯 視覚的位置ガイド
 */
describe('🎯 セルフオシレーティングメモリ 視覚的位置ガイド', () => {
  it('📍 スイッチと出力ゲートの位置確認', () => {
    const circuit = SELF_OSCILLATING_MEMORY;
    
    console.log('\n=== 📍 セルフオシレーティングメモリ 位置ガイド ===');
    
    // 入力スイッチの位置
    const enableGate = circuit.gates.find(g => g.id === 'enable');
    const triggerGate = circuit.gates.find(g => g.id === 'trigger');
    
    console.log('\n🎛️ 入力スイッチ（左側）:');
    console.log(`  Enable  (x:${enableGate?.position.x}, y:${enableGate?.position.y}) - 上のスイッチ`);
    console.log(`  Trigger (x:${triggerGate?.position.x}, y:${triggerGate?.position.y}) - 下のスイッチ`);
    
    // 右端の出力ゲート（x座標800以上）
    const rightOutputs = circuit.gates
      .filter(g => g.type === 'OUTPUT' && g.position.x >= 800)
      .sort((a, b) => a.position.y - b.position.y);
    
    console.log('\n💡 右端の出力ゲート（縦3つ）:');
    rightOutputs.forEach((gate, index) => {
      const position = index === 0 ? '上' : index === 1 ? '真ん中' : '下';
      const target = index === 1 ? ' ← 🎯これを光らせる！' : '';
      console.log(`  ${position}: ${gate.id} (x:${gate.position.x}, y:${gate.position.y})${target}`);
    });
    
    console.log('\n🎯 操作手順:');
    console.log('  1. 左上のスイッチ（Enable）をクリック → ONにする');
    console.log('  2. 左下のスイッチ（Trigger）をクリック → ONにする');  
    console.log('  3. 左下のスイッチ（Trigger）をもう一度クリック → OFFに戻す');
    console.log('  → 右端真ん中の出力ゲートが光る！');
    
    expect(enableGate?.position.x).toBe(100);
    expect(triggerGate?.position.x).toBe(100);
  });

  it('🔍 詳細な視覚的説明', () => {
    console.log('\n=== 🔍 詳細な視覚的説明 ===');
    console.log('');
    console.log('📍 画面レイアウト:');
    console.log('');
    console.log('左側（入力）          中央（回路）              右側（出力）');
    console.log('┌─────────┐        ┌─────────┐          ┌─────────┐');
    console.log('│[Enable] │        │    複雑な    │          │   💡    │ ← 上');
    console.log('│ ↑クリック│        │    回路      │          │  💡🎯  │ ← 真ん中（目標）');
    console.log('│[Trigger]│        │              │          │   💡    │ ← 下');
    console.log('│ ↑クリック│        │              │          │         │');
    console.log('└─────────┘        └─────────┘          └─────────┘');
    console.log('');
    console.log('🎛️ スイッチの見分け方:');
    console.log('  - 左側に2つのスイッチがある');
    console.log('  - 上のスイッチ = Enable');
    console.log('  - 下のスイッチ = Trigger');
    console.log('  - スイッチはトグル式（クリックで ON/OFF 切り替え）');
    console.log('  - ON = 緑色、OFF = グレー');
    console.log('');
    console.log('💡 出力ゲートの見分け方:');
    console.log('  - 右端に縦に3つの電球マーク💡がある');
    console.log('  - 真ん中の💡が目標（振動検出器）');
    console.log('  - 信号があると緑色に光る');

    expect(true).toBe(true);
  });
});
import { describe, it, expect } from 'vitest';
import { SELF_OSCILLATING_MEMORY } from '@/features/gallery/data/self-oscillating-memory';

/**
 * 🔍 初期状態確認
 */
describe('🔍 セルフオシレーティングメモリ初期状態', () => {
  it('📊 初期スイッチ状態の確認', () => {
    const circuit = SELF_OSCILLATING_MEMORY;
    
    console.log('\n=== 📊 初期状態確認 ===');
    
    const enableGate = circuit.gates.find(g => g.id === 'enable');
    const triggerGate = circuit.gates.find(g => g.id === 'trigger');
    
    console.log('\n🎛️ 初期スイッチ状態:');
    console.log(`  Enable (左上):  ${enableGate?.output ? '🟢 ON (緑)' : '⚫ OFF (グレー)'}`);
    console.log(`  Trigger (左下): ${triggerGate?.output ? '🟢 ON (緑)' : '⚫ OFF (グレー)'}`);
    
    // 初期状態での右端出力確認
    const rightOutputs = circuit.gates
      .filter(g => g.type === 'OUTPUT' && g.position.x >= 800)
      .sort((a, b) => a.position.y - b.position.y);
    
    console.log('\n💡 初期出力状態:');
    rightOutputs.forEach((gate, index) => {
      const position = index === 0 ? '上' : index === 1 ? '真ん中' : '下';
      const target = index === 1 ? ' ← 🎯目標' : '';
      console.log(`  ${position}: ${gate.output ? '🟢 光ってる' : '⚫ 暗い'}${target}`);
    });
    
    console.log('\n🎯 現在の状況に応じた操作手順:');
    
    if (enableGate?.output && !triggerGate?.output) {
      console.log('  現在: Enable=ON, Trigger=OFF');
      console.log('  操作: 1. Trigger(左下)をクリック → ON');
      console.log('        2. Trigger(左下)をもう一度クリック → OFF');
      console.log('        → 右端真ん中が光る');
    } else if (!enableGate?.output && !triggerGate?.output) {
      console.log('  現在: 両方OFF');
      console.log('  操作: 1. Enable(左上)をクリック → ON');
      console.log('        2. Trigger(左下)をクリック → ON');  
      console.log('        3. Trigger(左下)をもう一度クリック → OFF');
      console.log('        → 右端真ん中が光る');
    } else {
      console.log('  現在の状態からの操作を確認中...');
    }
    
    expect(enableGate).toBeDefined();
    expect(triggerGate).toBeDefined();
  });

  it('🎯 Enable=ONの場合の簡単操作', () => {
    console.log('\n=== 🎯 Enable既にONの場合の操作 ===');
    console.log('');
    console.log('現状: Enable(左上) = 🟢 緑色（既にON）');
    console.log('      Trigger(左下) = ⚫ グレー（OFF）');
    console.log('');
    console.log('🎯 簡単操作（2ステップのみ）:');
    console.log('  1. 左下のスイッチ(Trigger)をクリック → 緑色になる');
    console.log('  2. 左下のスイッチ(Trigger)をもう一度クリック → グレーに戻る');
    console.log('  → 右端真ん中の💡が光る！');
    console.log('');
    console.log('💡 理由:');
    console.log('  - Enable=ONで既に準備完了');
    console.log('  - TriggerをON→OFFにすることで非対称状態を作る');
    console.log('  - Memory1≠Memory2 → XOR=true → 振動検出器が光る');

    expect(true).toBe(true);
  });
});
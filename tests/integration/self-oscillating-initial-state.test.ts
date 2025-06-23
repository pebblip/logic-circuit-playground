/**
 * self-oscillating-memory-finalの初期状態の詳細調査
 */

import { describe, it, expect } from 'vitest';
import { SELF_OSCILLATING_MEMORY_FINAL } from '@/features/gallery/data/self-oscillating-memory-final';

describe('self-oscillating初期状態調査', () => {
  it('回路定義の初期値を確認', () => {
    console.log('🔍 回路定義の初期状態:\n');
    
    // 重要なゲートの初期outputs値を確認
    const importantGates = ['enable', 'trigger', 'nor1', 'nor2', 'trigger_or', 'fb_and1', 'fb_and2'];
    
    importantGates.forEach(id => {
      const gate = SELF_OSCILLATING_MEMORY_FINAL.gates.find(g => g.id === id);
      if (gate) {
        console.log(`${id}:`);
        console.log(`  type: ${gate.type}`);
        console.log(`  outputs: ${JSON.stringify(gate.outputs)}`);
      }
    });
    
    // 遅延チェーンの初期状態も確認
    console.log('\n🔍 遅延チェーンの初期状態:');
    
    // delay1チェーン (nor1用)
    console.log('\ndelay1チェーン:');
    ['delay1_1', 'delay1_2', 'delay1_3'].forEach(id => {
      const gate = SELF_OSCILLATING_MEMORY_FINAL.gates.find(g => g.id === id);
      if (gate) {
        console.log(`  ${id}: outputs=${JSON.stringify(gate.outputs)}`);
      }
    });
    
    // delay2チェーン (nor2用)
    console.log('\ndelay2チェーン:');
    ['delay2_1', 'delay2_2', 'delay2_3', 'delay2_4', 'delay2_5'].forEach(id => {
      const gate = SELF_OSCILLATING_MEMORY_FINAL.gates.find(g => g.id === id);
      if (gate) {
        console.log(`  ${id}: outputs=${JSON.stringify(gate.outputs)}`);
      }
    });
    
    // 初期状態の論理的整合性を検証
    console.log('\n🔍 論理的整合性チェック:');
    
    const enable = SELF_OSCILLATING_MEMORY_FINAL.gates.find(g => g.id === 'enable');
    const trigger = SELF_OSCILLATING_MEMORY_FINAL.gates.find(g => g.id === 'trigger');
    const nor1 = SELF_OSCILLATING_MEMORY_FINAL.gates.find(g => g.id === 'nor1');
    const nor2 = SELF_OSCILLATING_MEMORY_FINAL.gates.find(g => g.id === 'nor2');
    const delay2_5 = SELF_OSCILLATING_MEMORY_FINAL.gates.find(g => g.id === 'delay2_5');
    const fb_and2 = SELF_OSCILLATING_MEMORY_FINAL.gates.find(g => g.id === 'fb_and2');
    const trigger_or = SELF_OSCILLATING_MEMORY_FINAL.gates.find(g => g.id === 'trigger_or');
    
    // fb_and2の期待される出力
    // 入力: delay2_5の出力 AND enableの出力
    const expectedFbAnd2 = delay2_5?.outputs?.[0] && enable?.outputs?.[0];
    console.log(`fb_and2の期待出力: ${delay2_5?.outputs?.[0]} AND ${enable?.outputs?.[0]} = ${expectedFbAnd2}`);
    console.log(`fb_and2の実際の出力: ${fb_and2?.outputs?.[0]}`);
    
    // trigger_orの期待される出力
    // 入力: triggerの出力 OR fb_and2の出力
    const expectedTriggerOr = trigger?.outputs?.[0] || fb_and2?.outputs?.[0];
    console.log(`\ntrigger_orの期待出力: ${trigger?.outputs?.[0]} OR ${fb_and2?.outputs?.[0]} = ${expectedTriggerOr}`);
    console.log(`trigger_orの実際の出力: ${trigger_or?.outputs?.[0]}`);
    
    // NORゲートの期待される出力
    console.log(`\nnor1の期待される入力: [${trigger_or?.outputs?.[0]}, ${nor2?.outputs?.[0]}]`);
    console.log(`nor1の実際の出力: ${nor1?.outputs?.[0]}`);
    
    console.log(`\nnor2の期待される入力: [fb_and1の出力, ${nor1?.outputs?.[0]}]`);
    console.log(`nor2の実際の出力: ${nor2?.outputs?.[0]}`);
    
    // 初期状態で発振可能かチェック
    const isOscillationPossible = nor1?.outputs?.[0] !== nor2?.outputs?.[0];
    console.log(`\n🔍 初期状態で発振可能: ${isOscillationPossible}`);
    console.log(`  nor1=${nor1?.outputs?.[0]}, nor2=${nor2?.outputs?.[0]}`);
  });
});
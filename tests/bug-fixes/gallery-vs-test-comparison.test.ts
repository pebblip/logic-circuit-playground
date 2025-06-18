import { describe, it, expect } from 'vitest';
import { EnhancedHybridEvaluator } from '@/domain/simulation/event-driven-minimal';
import { SELF_OSCILLATING_MEMORY } from '@/features/gallery/data/self-oscillating-memory';
import type { Circuit } from '@/domain/simulation/core/types';
import { getGateInputValue } from '@/domain/simulation';

/**
 * 🔍 ギャラリーモードと実際の動作の違いを調査
 */
describe('🔍 ギャラリーモード vs テスト環境の比較', () => {
  const evaluator = new EnhancedHybridEvaluator({
    strategy: 'AUTO_SELECT',
    enableDebugLogging: false,
  });

  it('📷 現在のスクリーンショット状況を再現', () => {
    let circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY.gates],
      wires: [...SELF_OSCILLATING_MEMORY.wires],
    };

    console.log('\n=== 📷 スクリーンショット状況の再現 ===');
    
    // スクリーンショットと同じ状態に設定
    const enableGate = circuit.gates.find(g => g.id === 'enable');
    const triggerGate = circuit.gates.find(g => g.id === 'trigger');
    
    // スクリーンショットの状態: Enable=ON, Trigger=OFF
    if (enableGate) enableGate.output = true;
    if (triggerGate) triggerGate.output = false;
    
    console.log('\n🎛️ 設定:');
    console.log(`  Enable: ${enableGate?.output}`);
    console.log(`  Trigger: ${triggerGate?.output}`);
    
    const result = evaluator.evaluate(circuit);
    circuit = result.circuit;
    
    // 右端の出力を確認
    const rightOutputs = [
      { id: 'out_activity', position: 'top' },
      { id: 'out_oscillation', position: 'middle' }, 
      { id: 'out_sync', position: 'bottom' }
    ];
    
    console.log('\n💡 右端出力状態:');
    rightOutputs.forEach(({ id, position }) => {
      const gate = circuit.gates.find(g => g.id === id);
      const isLit = getGateInputValue(gate!, 0);
      const target = position === 'middle' ? ' ← 🎯目標' : '';
      console.log(`  ${position}: ${isLit ? '🟢 光ってる' : '⚫ 暗い'}${target}`);
    });
    
    // メモリ状態も確認
    const memory1 = circuit.gates.find(g => g.id === 'memory1_sr');
    const memory2 = circuit.gates.find(g => g.id === 'memory2_sr');
    const oscillationXor = circuit.gates.find(g => g.id === 'oscillation_xor');
    
    console.log('\n🧠 内部状態:');
    console.log(`  Memory1 Q: ${memory1?.output}`);
    console.log(`  Memory2 Q: ${memory2?.output}`);
    console.log(`  XOR入力: [${memory1?.output}, ${memory2?.output}]`);
    console.log(`  XOR出力: ${oscillationXor?.output}`);
    console.log(`  XOR計算: ${memory1?.output} ≠ ${memory2?.output} = ${memory1?.output !== memory2?.output}`);

    expect(result).toBeDefined();
  });

  it('🧪 Trigger操作シミュレーション', () => {
    let circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY.gates],
      wires: [...SELF_OSCILLATING_MEMORY.wires],
    };

    console.log('\n=== 🧪 Trigger操作の詳細シミュレーション ===');
    
    // 初期状態: Enable=ON, Trigger=OFF
    const enableGate = circuit.gates.find(g => g.id === 'enable');
    const triggerGate = circuit.gates.find(g => g.id === 'trigger');
    
    if (enableGate) enableGate.output = true;
    if (triggerGate) triggerGate.output = false;
    
    console.log('\n📌 初期状態 (Enable=ON, Trigger=OFF):');
    let result = evaluator.evaluate(circuit);
    circuit = result.circuit;
    
    let memory1 = circuit.gates.find(g => g.id === 'memory1_sr');
    let memory2 = circuit.gates.find(g => g.id === 'memory2_sr');
    let oscillationOutput = circuit.gates.find(g => g.id === 'out_oscillation');
    
    console.log(`  Memory1 Q: ${memory1?.output}, Q̄: ${memory1?.outputs?.[1]}`);
    console.log(`  Memory2 Q: ${memory2?.output}, Q̄: ${memory2?.outputs?.[1]}`);
    console.log(`  out_oscillation: ${getGateInputValue(oscillationOutput!, 0) ? '🟢 光る' : '⚫ 暗い'}`);
    
    // Triggerをクリック（ON）
    console.log('\n📌 Triggerをクリック → ON:');
    const triggerGate2 = circuit.gates.find(g => g.id === 'trigger');
    if (triggerGate2) triggerGate2.output = true;
    
    result = evaluator.evaluate(circuit);
    circuit = result.circuit;
    
    memory1 = circuit.gates.find(g => g.id === 'memory1_sr');
    memory2 = circuit.gates.find(g => g.id === 'memory2_sr');
    oscillationOutput = circuit.gates.find(g => g.id === 'out_oscillation');
    
    console.log(`  Memory1 Q: ${memory1?.output}, Q̄: ${memory1?.outputs?.[1]}`);
    console.log(`  Memory2 Q: ${memory2?.output}, Q̄: ${memory2?.outputs?.[1]}`);
    console.log(`  out_oscillation: ${getGateInputValue(oscillationOutput!, 0) ? '🟢 光る' : '⚫ 暗い'}`);
    
    // Triggerをもう一度クリック（OFF）
    console.log('\n📌 Triggerをもう一度クリック → OFF:');
    const triggerGate3 = circuit.gates.find(g => g.id === 'trigger');
    if (triggerGate3) triggerGate3.output = false;
    
    result = evaluator.evaluate(circuit);
    circuit = result.circuit;
    
    memory1 = circuit.gates.find(g => g.id === 'memory1_sr');
    memory2 = circuit.gates.find(g => g.id === 'memory2_sr');
    oscillationOutput = circuit.gates.find(g => g.id === 'out_oscillation');
    
    console.log(`  Memory1 Q: ${memory1?.output}, Q̄: ${memory1?.outputs?.[1]}`);
    console.log(`  Memory2 Q: ${memory2?.output}, Q̄: ${memory2?.outputs?.[1]}`);
    console.log(`  out_oscillation: ${getGateInputValue(oscillationOutput!, 0) ? '🟢 光る！' : '⚫ 暗い'}`);
    
    // XORの詳細計算
    const xorGate = circuit.gates.find(g => g.id === 'oscillation_xor');
    console.log('\n🔍 XOR詳細:');
    console.log(`  XOR inputs: [${xorGate?.inputs}]`);
    console.log(`  XOR output: ${xorGate?.output}`);
    console.log(`  期待値: ${memory1?.output} ≠ ${memory2?.output} = ${memory1?.output !== memory2?.output}`);

    expect(result).toBeDefined();
  });

  it('🐛 問題の特定', () => {
    console.log('\n=== 🐛 なぜ光らないのか - 問題特定 ===');
    console.log('');
    console.log('🔍 **可能性1**: ギャラリーモードの評価エンジンが異なる');
    console.log('  - テスト環境とUI環境で評価器が違う可能性');
    console.log('  - GalleryCanvas.tsx の評価器設定を確認が必要');
    console.log('');
    console.log('🔍 **可能性2**: UIでの操作タイミング問題');
    console.log('  - クリック→評価→再描画のタイミング');
    console.log('  - React状態更新の遅延');
    console.log('');
    console.log('🔍 **可能性3**: 初期状態の違い');
    console.log('  - ギャラリーデータとテストデータで初期値が異なる');
    console.log('  - メタデータの初期化問題');
    console.log('');
    console.log('🔍 **可能性4**: 複数出力ゲートの配線問題');
    console.log('  - SR-LATCHのQ̄出力の配線ミス');
    console.log('  - XORゲートが正しい入力を受けていない');
    console.log('');
    console.log('🎯 **次の調査**: GalleryCanvas.tsx の実装確認');

    expect(true).toBe(true);
  });
});
import { describe, it, expect } from 'vitest';
import { EnhancedHybridEvaluator } from '@/domain/simulation/event-driven-minimal';
import type { Circuit } from '@/domain/simulation/core/types';
import { FEATURED_CIRCUITS } from '@/features/gallery/data/gallery';

// ギャラリーUIと同じ評価エンジンを使用
const enhancedEvaluator = new EnhancedHybridEvaluator({
  strategy: 'AUTO_SELECT',
  enableDebugLogging: false,
});

describe('ギャラリー全回路のシミュレーションテスト', () => {
  FEATURED_CIRCUITS.forEach(circuitDef => {
    it(`${circuitDef.title} - 初期状態でシミュレーションが正常に動作する`, () => {
      // Circuit型に変換
      const circuit: Circuit = {
        gates: circuitDef.gates,
        wires: circuitDef.wires,
      };

      // シミュレーション実行（ギャラリーUIと同じエンジン使用）
      const evaluationResult = enhancedEvaluator.evaluate(circuit);
      const evaluatedCircuit = evaluationResult.circuit;
      
      // 評価が完了していることを確認
      expect(evaluatedCircuit).toBeDefined();
      expect(evaluatedCircuit.gates).toBeDefined();
      expect(evaluatedCircuit.wires).toBeDefined();
      
      // ゲートIDと出力状態をログ出力
      console.log(`\n=== ${circuitDef.title} ===`);
      evaluatedCircuit.gates.forEach(gate => {
        if (gate.type === 'OUTPUT') {
          const inputValue = gate.inputs[0] || '';
          console.log(`  ${gate.id}: output=${inputValue === '1' ? 'true' : 'false'} (inputs[0]="${inputValue}")`);
        } else if (gate.type === 'INPUT') {
          console.log(`  ${gate.id}: output=${gate.output}`);
        }
      });
      
      // 循環回路かどうか判定
      const hasCircularDependency = [
        'sr-latch-basic',
        'ring-oscillator',
        'chaos-generator',
        'fibonacci-counter',
        'johnson-counter',
        'self-oscillating-memory',
        'mandala-circuit'
      ].includes(circuitDef.id);
      
      if (hasCircularDependency) {
        console.log(`  ⚠️  循環回路のため初期状態は不定の可能性があります`);
      }
    });
  });

  it('半加算器の詳細な動作確認', () => {
    const halfAdderDef = FEATURED_CIRCUITS.find(c => c.id === 'half-adder');
    expect(halfAdderDef).toBeDefined();

    if (!halfAdderDef) return;

    const circuit: Circuit = {
      gates: halfAdderDef.gates,
      wires: halfAdderDef.wires,
    };

    const evaluationResult = enhancedEvaluator.evaluate(circuit);
    const evaluatedCircuit = evaluationResult.circuit;
    
    expect(evaluatedCircuit).toBeDefined();

    // ここでevaluatedCircuitは既に定義済み
    
    // 詳細なログ出力
    console.log('\n=== 半加算器の詳細 ===');
    evaluatedCircuit.gates.forEach(gate => {
      console.log(`${gate.id}:`, {
        type: gate.type,
        output: gate.output,
        inputs: gate.inputs,
      });
    });
    
    // ワイヤーの状態も確認
    console.log('\nワイヤー状態:');
    evaluatedCircuit.wires.forEach(wire => {
      console.log(`${wire.id}:`, {
        from: `${wire.from.gateId}[${wire.from.pinIndex}]`,
        to: `${wire.to.gateId}[${wire.to.pinIndex}]`,
        isActive: wire.isActive,
      });
    });
  });
});
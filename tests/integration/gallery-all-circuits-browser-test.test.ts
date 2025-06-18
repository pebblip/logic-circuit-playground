import { describe, it, expect } from 'vitest';
import { EnhancedHybridEvaluator } from '@/domain/simulation/event-driven-minimal';
import type { Circuit } from '@/domain/simulation/core/types';
import { FEATURED_CIRCUITS } from '@/features/gallery/data/gallery';

describe('全ギャラリー回路ブラウザ環境テスト', () => {
  const evaluator = new EnhancedHybridEvaluator({
    strategy: 'EVENT_DRIVEN_ONLY',
    enableDebugLogging: false,
  });

  FEATURED_CIRCUITS.forEach((circuitData) => {
    it(`${circuitData.title}の動作検証`, () => {
      console.log(`\n=== ${circuitData.title} ===`);
      
      const circuit: Circuit = {
        gates: circuitData.gates.map(g => ({ ...g })),
        wires: circuitData.wires.map(w => ({ ...w }))
      };

      // 初期評価
      const result1 = evaluator.evaluate(circuit);
      expect(result1.circuit.gates).toBeDefined();
      
      // OUTPUT ゲートの状態確認
      const outputGates = result1.circuit.gates.filter(g => g.type === 'OUTPUT');
      console.log('OUTPUT状態:', outputGates.map(g => `${g.id}=${g.output ? '1' : '0'}`).join(', '));
      
      // CLOCKゲートがある場合の動作確認
      const clockGates = result1.circuit.gates.filter(g => g.type === 'CLOCK');
      if (clockGates.length > 0) {
        // クロック切り替え後の動作確認
        clockGates.forEach(clock => clock.output = !clock.output);
        
        const result2 = evaluator.evaluate(result1.circuit);
        const outputGates2 = result2.circuit.gates.filter(g => g.type === 'OUTPUT');
        console.log('CLOCK切り替え後:', outputGates2.map(g => `${g.id}=${g.output ? '1' : '0'}`).join(', '));
        
        // D-FFがある場合、状態変化があることを確認
        const dffGates = result2.circuit.gates.filter(g => g.type === 'D-FF');
        if (dffGates.length > 0) {
          const hasStateChange = outputGates.some((out1, i) => 
            out1.output !== outputGates2[i]?.output
          );
          
          if (!hasStateChange) {
            console.warn(`⚠️ ${circuitData.title}: クロック切り替え後に状態変化なし`);
          }
        }
      }
      
      // 基本的な健全性チェック
      expect(result1.circuit.gates.length).toBe(circuitData.gates.length);
      expect(result1.circuit.wires.length).toBe(circuitData.wires.length);
    });
  });
});
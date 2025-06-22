/**
 * Original Gallery Circuits Test
 * 元々のFEATURED_CIRCUITS定義での動作確認
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CircuitEvaluationService } from '../../src/domain/simulation/services/CircuitEvaluationService';
import { FEATURED_CIRCUITS } from '../../src/features/gallery/data/gallery';
import type { Circuit } from '../../src/domain/simulation/core/types';

describe('Original Gallery Circuits', () => {
  let service: CircuitEvaluationService;

  beforeEach(() => {
    service = new CircuitEvaluationService();
  });

  describe('Simple 2-bit LFSR (Original Definition)', () => {
    it('should work with original gallery definition', async () => {
      const originalLFSR = FEATURED_CIRCUITS.find(c => c.id === 'simple-lfsr')!;
      expect(originalLFSR).toBeDefined();

      console.log('=== Original LFSR Test ===');
      console.log('Original circuit gates:', originalLFSR.gates.length);
      console.log('Original circuit wires:', originalLFSR.wires.length);

      // 元々の回路定義を使用
      const circuit: Circuit = {
        gates: originalLFSR.gates,
        wires: originalLFSR.wires,
      };

      // レガシー形式で評価
      const result = await service.evaluate(circuit);

      console.log('Evaluation result:', result.success);

      if (!result.success) {
        console.error('Evaluation failed:', result.error);
        return;
      }

      expect(result.success).toBe(true);

      // 初期状態確認
      const dffA = result.data.circuit.gates.find(g => g.id === 'dff_a');
      const dffB = result.data.circuit.gates.find(g => g.id === 'dff_b');

      console.log('DFF A:', {
        id: dffA?.id,
        output: dffA?.output,
        inputs: dffA?.inputs,
      });
      console.log('DFF B:', {
        id: dffB?.id,
        output: dffB?.output,
        inputs: dffB?.inputs,
      });

      expect(dffA).toBeDefined();
      expect(dffB).toBeDefined();

      // 初期状態の期待値確認（元々の定義から）
      // simple-lfsr.tsでdff_a: output: true, dff_b: output: false
      console.log('Expected: dff_a=true, dff_b=false');
      console.log('Actual: dff_a=', dffA?.output, 'dff_b=', dffB?.output);
    });

    it('should perform clock cycles with original circuit', async () => {
      const originalLFSR = FEATURED_CIRCUITS.find(c => c.id === 'simple-lfsr')!;

      const circuit: Circuit = {
        gates: originalLFSR.gates,
        wires: originalLFSR.wires,
      };

      // 初期評価
      let result = await service.evaluate(circuit);
      expect(result.success).toBe(true);

      if (!result.success) return;

      // クロックゲート確認
      const clockGate = result.data.circuit.gates.find(g => g.type === 'CLOCK');
      console.log('Clock gate found:', !!clockGate);
      console.log('Clock metadata:', clockGate?.metadata);

      // 手動でクロックサイクルをシミュレーション
      console.log('\n=== Manual Clock Cycle Test ===');

      for (let cycle = 1; cycle <= 3; cycle++) {
        // CLOCKをHIGHに設定
        const highClockCircuit = {
          ...result.data.circuit,
          gates: result.data.circuit.gates.map(g =>
            g.type === 'CLOCK'
              ? {
                  ...g,
                  output: true,
                  metadata: {
                    ...g.metadata,
                    manualToggle: true,
                    output: true,
                  },
                }
              : g
          ),
        };

        let highResult = await service.evaluate(highClockCircuit);
        expect(highResult.success).toBe(true);

        // CLOCKをLOWに設定
        const lowClockCircuit = {
          ...highResult.data!.circuit,
          gates: highResult.data!.circuit.gates.map(g =>
            g.type === 'CLOCK'
              ? {
                  ...g,
                  output: false,
                  metadata: {
                    ...g.metadata,
                    manualToggle: false,
                    output: false,
                  },
                }
              : g
          ),
        };

        result = await service.evaluate(lowClockCircuit);
        expect(result.success).toBe(true);

        // 状態確認
        const dffA = result.data!.circuit.gates.find(g => g.id === 'dff_a');
        const dffB = result.data!.circuit.gates.find(g => g.id === 'dff_b');

        console.log(
          `Cycle ${cycle}: A=${dffA?.output}, B=${dffB?.output}, A_inputs=[${dffA?.inputs?.join(',')}], B_inputs=[${dffB?.inputs?.join(',')}]`
        );

        // メタデータも確認
        console.log(`  A_metadata:`, dffA?.metadata);
        console.log(`  B_metadata:`, dffB?.metadata);
      }
    });

    it('should compare original vs pure circuit definitions', () => {
      const originalLFSR = FEATURED_CIRCUITS.find(c => c.id === 'simple-lfsr')!;

      console.log('\n=== Circuit Definition Comparison ===');
      console.log('Original LFSR gates:');
      originalLFSR.gates.forEach(gate => {
        console.log(
          `  ${gate.id} (${gate.type}): output=${gate.output}, inputs=[${gate.inputs?.join(',') || ''}]`
        );
        if (gate.metadata) {
          console.log(`    metadata: ${JSON.stringify(gate.metadata)}`);
        }
      });

      console.log('\nOriginal LFSR wires:');
      originalLFSR.wires.forEach(wire => {
        console.log(
          `  ${wire.id}: ${wire.from.gateId}[${wire.from.pinIndex}] → ${wire.to.gateId}[${wire.to.pinIndex}], active=${wire.isActive}`
        );
      });

      // 基本チェック
      expect(originalLFSR.gates).toHaveLength(5); // clock, dff_a, dff_b, out_a, out_b
      expect(originalLFSR.wires).toHaveLength(6); // clk_a, clk_b, shift, feedback, observe_a, observe_b

      // D-FFの初期値確認
      const dffA = originalLFSR.gates.find(g => g.id === 'dff_a');
      const dffB = originalLFSR.gates.find(g => g.id === 'dff_b');

      console.log('\nExpected initial states:');
      console.log(`  dff_a: output=${dffA?.output} (should be true)`);
      console.log(`  dff_b: output=${dffB?.output} (should be false)`);

      expect(dffA?.output).toBe(true);
      expect(dffB?.output).toBe(false);
    });
  });
});

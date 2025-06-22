/**
 * Gallery Mode Pure Test
 * Pure Circuit形式でのギャラリーモード機能テスト
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CircuitEvaluationService } from '../../src/domain/simulation/services/CircuitEvaluationService';
import { PURE_CIRCUITS } from '../../src/features/gallery/data/circuits-pure';

describe('Gallery Mode Pure Circuits', () => {
  let service: CircuitEvaluationService;

  beforeEach(() => {
    service = new CircuitEvaluationService();
  });

  describe('Basic D-FF Gallery Circuit', () => {
    it('should evaluate basic D-FF circuit correctly', async () => {
      const circuit = PURE_CIRCUITS['basic-dff'];
      const result = await service.evaluatePure(circuit);

      expect(result.success).toBe(true);
      if (result.success) {
        const dff = result.data.circuit.gates.find((g: any) => g.id === 'dff');
        expect(dff).toBeDefined();
        expect(dff.outputs[0]).toBe(false); // 初期状態Q=0
      }
    });

    it('should respond to clock transitions', async () => {
      const circuit = PURE_CIRCUITS['basic-dff'];
      const context = service.getPureService().createInitialContext(circuit);

      // クロックサイクル実行
      const cycleResult = await service.executeClockCycle(circuit, context, 1);

      expect(cycleResult.success).toBe(true);
      if (cycleResult.success) {
        const cycles = cycleResult.data;
        expect(cycles).toHaveLength(1);
        expect(cycles[0].hasStateChange).toBe(true);

        // クロックサイクル後、D=1がキャプチャされてQ=1になる
        const finalCircuit = cycles[0].circuit;
        const dff = finalCircuit.gates.find((g: any) => g.id === 'dff');
        expect(dff.outputs[0]).toBe(true); // Q=1
      }
    });
  });

  describe('SR-Latch Gallery Circuit', () => {
    it('should maintain SET state', async () => {
      const circuit = PURE_CIRCUITS['sr-latch'];
      const result = await service.evaluatePure(circuit);

      expect(result.success).toBe(true);
      if (result.success) {
        const srLatch = result.data.circuit.gates.find(
          (g: any) => g.id === 'sr_latch'
        );
        expect(srLatch).toBeDefined();
        expect(srLatch.outputs[0]).toBe(true); // Q=1 (SET)
        expect(srLatch.outputs[1]).toBe(false); // Q̄=0

        // 出力ゲートの確認
        const outQ = result.data.circuit.gates.find(
          (g: any) => g.id === 'out_q'
        );
        const outQBar = result.data.circuit.gates.find(
          (g: any) => g.id === 'out_qbar'
        );
        expect(outQ.inputs[0]).toBe(true);
        expect(outQBar.inputs[0]).toBe(false);
      }
    });
  });

  describe('2-bit LFSR Gallery Circuit', () => {
    it('should generate correct pseudorandom sequence', async () => {
      const circuit = PURE_CIRCUITS['simple-lfsr'];
      const context = service.getPureService().createInitialContext(circuit);

      console.log('=== LFSR Gallery Mode Test ===');

      // 初期状態確認
      let result = await service.evaluatePure(circuit, context);
      expect(result.success).toBe(true);

      if (result.success) {
        // 初期状態検証
        const initialState = service
          .getPureService()
          .captureCircuitState(result.data.circuit);
        console.log('Initial state:', initialState);

        expect(initialState).toEqual([
          { id: 'dff_a', q: true, qBar: false },
          { id: 'dff_b', q: false, qBar: true },
        ]);

        // 複数クロックサイクル実行
        const cycleResult = await service.executeClockCycle(
          result.data.circuit,
          result.data.context,
          6
        );

        expect(cycleResult.success).toBe(true);
        if (cycleResult.success) {
          const cycles = cycleResult.data;

          // 各サイクルの状態をログ出力
          cycles.forEach((cycle: any, index: number) => {
            const state = service
              .getPureService()
              .captureCircuitState(cycle.circuit);
            console.log(`Gallery Cycle ${index + 1}:`, JSON.stringify(state));
          });

          // LFSRの基本特性確認
          expect(cycles.length).toBe(6);

          // 全サイクルで状態変化があることを確認
          const stateChanges = cycles.filter(
            (cycle: any) => cycle.hasStateChange
          );
          expect(stateChanges.length).toBeGreaterThan(0);

          // 周期性確認（2周期のLFSR）
          const states = cycles.map((cycle: any) =>
            service.getPureService().captureCircuitState(cycle.circuit)
          );

          // 期待されるパターン: [1,0] → [0,1] → [1,0] → [0,1] → [1,0] → [0,1]
          const expectedPattern = [
            [
              { id: 'dff_a', q: false, qBar: true },
              { id: 'dff_b', q: true, qBar: false },
            ], // [0,1]
            [
              { id: 'dff_a', q: true, qBar: false },
              { id: 'dff_b', q: false, qBar: true },
            ], // [1,0]
            [
              { id: 'dff_a', q: false, qBar: true },
              { id: 'dff_b', q: true, qBar: false },
            ], // [0,1]
            [
              { id: 'dff_a', q: true, qBar: false },
              { id: 'dff_b', q: false, qBar: true },
            ], // [1,0]
            [
              { id: 'dff_a', q: false, qBar: true },
              { id: 'dff_b', q: true, qBar: false },
            ], // [0,1]
            [
              { id: 'dff_a', q: true, qBar: false },
              { id: 'dff_b', q: false, qBar: true },
            ], // [1,0]
          ];

          // パターンマッチング
          for (
            let i = 0;
            i < Math.min(states.length, expectedPattern.length);
            i++
          ) {
            expect(states[i]).toEqual(expectedPattern[i]);
          }

          // 2周期性確認
          expect(states[0]).toEqual(states[2]); // サイクル1と3
          expect(states[1]).toEqual(states[3]); // サイクル2と4
          expect(states[0]).toEqual(states[4]); // サイクル1と5
          expect(states[1]).toEqual(states[5]); // サイクル2と6
        }
      }
    });

    it('should show proper wire propagation', async () => {
      const circuit = PURE_CIRCUITS['simple-lfsr'];
      const context = service.getPureService().createInitialContext(circuit);

      // 1クロックサイクル実行
      const cycleResult = await service.executeClockCycle(circuit, context, 1);

      expect(cycleResult.success).toBe(true);
      if (cycleResult.success) {
        const cycle = cycleResult.data[0];
        const finalCircuit = cycle.circuit;

        // ワイヤーの状態確認
        const shiftWire = finalCircuit.wires.find((w: any) => w.id === 'shift');
        const feedbackWire = finalCircuit.wires.find(
          (w: any) => w.id === 'feedback'
        );
        const clockWires = finalCircuit.wires.filter(
          (w: any) => w.id === 'clk_a' || w.id === 'clk_b'
        );

        expect(shiftWire).toBeDefined();
        expect(feedbackWire).toBeDefined();
        expect(clockWires).toHaveLength(2);

        // 信号伝播の確認
        const dffA = finalCircuit.gates.find((g: any) => g.id === 'dff_a');
        const dffB = finalCircuit.gates.find((g: any) => g.id === 'dff_b');

        expect(dffA).toBeDefined();
        expect(dffB).toBeDefined();

        // 初期[1,0]から1サイクル後は[0,1]になるはず
        expect(dffA.outputs[0]).toBe(false); // A: 1→0
        expect(dffB.outputs[0]).toBe(true); // B: 0→1
      }
    });
  });

  describe('Performance Analysis', () => {
    it('should provide performance statistics', async () => {
      const circuit = PURE_CIRCUITS['simple-lfsr'];

      // 複数回評価実行
      for (let i = 0; i < 3; i++) {
        await service.evaluatePure(circuit);
      }

      const stats = service.getPerformanceStats();

      expect(stats.totalEvaluations).toBe(3);
      expect(stats.avgExecutionTime).toBeGreaterThan(0);
      expect(stats.strategyUsageStats.PURE_ENGINE).toBe(3);
    });

    it('should analyze circuit complexity correctly', async () => {
      // レガシー形式でのテスト（互換性確認）
      const legacyCircuit = {
        gates: [
          {
            id: 'input1',
            type: 'INPUT' as const,
            position: { x: 0, y: 0 },
            output: true,
            inputs: [],
          },
          {
            id: 'dff1',
            type: 'D-FF' as const,
            position: { x: 100, y: 0 },
            output: false,
            inputs: ['', ''],
          },
        ],
        wires: [
          {
            id: 'w1',
            from: { gateId: 'input1', pinIndex: -1 },
            to: { gateId: 'dff1', pinIndex: 0 },
            isActive: false,
          },
        ],
      };

      const analysis = service.analyzeComplexity(legacyCircuit);

      expect(analysis.gateCount).toBe(2);
      expect(analysis.wireCount).toBe(1);
      expect(analysis.hasSequentialElements).toBe(true);
      expect(analysis.recommendedStrategy).toBe('PURE_ENGINE');
      expect(analysis.reasoning).toContain('Sequential elements detected');
    });
  });
});

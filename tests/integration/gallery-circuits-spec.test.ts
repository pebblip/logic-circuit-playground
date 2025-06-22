/**
 * ギャラリー回路の機能仕様テスト
 *
 * 各回路が設計仕様通りに動作することを検証する
 * テストは「〜が正しく動作する」という仕様記述として記載
 */

import { describe, test, expect } from 'vitest';
import { CircuitEvaluationService } from '@/domain/simulation/services/CircuitEvaluationService';
import {
  HALF_ADDER,
  SR_LATCH,
  SIMPLE_LFSR,
  BASIC_DFF,
  PARITY_CHECKER,
  DECODER,
  MAJORITY_VOTER,
} from '@/features/gallery/data/circuits-pure';
import type { EvaluationCircuit } from '@/domain/simulation/core/types';

describe('ギャラリー回路の機能仕様', () => {
  const service = new CircuitEvaluationService();

  describe('半加算器 (Half Adder)', () => {
    test('2つの1ビット数の加算結果が正しく出力される', () => {
      // 半加算器の真理値表に基づいた仕様検証
      const truthTable = [
        { a: false, b: false, sum: false, carry: false, description: '0+0=00' },
        { a: false, b: true, sum: true, carry: false, description: '0+1=10' },
        { a: true, b: false, sum: true, carry: false, description: '1+0=10' },
        { a: true, b: true, sum: false, carry: true, description: '1+1=01' },
      ];

      truthTable.forEach(({ a, b, sum, carry, description }) => {
        const circuit = JSON.parse(JSON.stringify(HALF_ADDER));

        // 入力値を設定
        circuit.gates.find(g => g.id === 'input-a')!.outputs[0] = a;
        circuit.gates.find(g => g.id === 'input-b')!.outputs[0] = b;

        // 回路を評価
        const evalCircuit = service.toEvaluationCircuit(circuit);
        const context = service.createInitialContext(evalCircuit);
        const result = service.evaluateDirect(evalCircuit, context);

        // 出力が仕様通りであることを検証
        const sumOutput = result.circuit.gates.find(
          g => g.id === 'output-sum'
        )!;
        const carryOutput = result.circuit.gates.find(
          g => g.id === 'output-carry'
        )!;

        expect(sumOutput.inputs[0]).toBe(sum);
        expect(carryOutput.inputs[0]).toBe(carry);
      });
    });

    test('全てのゲートとワイヤーが正しく接続される', () => {
      const circuit = JSON.parse(JSON.stringify(HALF_ADDER));
      const evalCircuit = service.toEvaluationCircuit(circuit);
      const context = service.createInitialContext(evalCircuit);
      const result = service.evaluateDirect(evalCircuit, context);

      // ゲート間の接続が仕様通りであることを検証
      const xorGate = result.circuit.gates.find(g => g.id === 'xor-sum')!;
      const andGate = result.circuit.gates.find(g => g.id === 'and-carry')!;
      const inputA = result.circuit.gates.find(g => g.id === 'input-a')!;
      const inputB = result.circuit.gates.find(g => g.id === 'input-b')!;

      // XORとANDの両方が同じ入力を受け取る
      expect(xorGate.inputs[0]).toBe(inputA.outputs[0]);
      expect(xorGate.inputs[1]).toBe(inputB.outputs[0]);
      expect(andGate.inputs[0]).toBe(inputA.outputs[0]);
      expect(andGate.inputs[1]).toBe(inputB.outputs[0]);
    });
  });

  describe('SR-Latch', () => {
    test('Set入力でQ出力がHighに設定される', () => {
      const circuit = JSON.parse(JSON.stringify(SR_LATCH));

      // S=1, R=0でSet動作
      circuit.gates.find(g => g.id === 'input_s')!.outputs[0] = true;
      circuit.gates.find(g => g.id === 'input_r')!.outputs[0] = false;

      const evalCircuit = service.toEvaluationCircuit(circuit);
      const context = service.createInitialContext(evalCircuit);
      const result = service.evaluateDirect(evalCircuit, context);
      const qOutput = result.circuit.gates.find(g => g.id === 'out_q')!;
      const qBarOutput = result.circuit.gates.find(g => g.id === 'out_qbar')!;

      // Qが1、Q̄が0になることを検証
      expect(qOutput.inputs[0]).toBe(true);
      expect(qBarOutput.inputs[0]).toBe(false);
    });

    test('Reset入力でQ出力がLowにリセットされる', () => {
      const circuit = JSON.parse(JSON.stringify(SR_LATCH));

      // S=0, R=1でReset動作
      circuit.gates.find(g => g.id === 'input_s')!.outputs[0] = false;
      circuit.gates.find(g => g.id === 'input_r')!.outputs[0] = true;

      const evalCircuit = service.toEvaluationCircuit(circuit);
      const context = service.createInitialContext(evalCircuit);

      // 初期状態をQ=1に設定（SR_LATCHの初期値がQ=1なので既にtrueだが明示的に設定）
      context.memory['sr_latch'] = { q: true };

      const result = service.evaluateDirect(evalCircuit, context);
      const qOutput = result.circuit.gates.find(g => g.id === 'out_q')!;
      const qBarOutput = result.circuit.gates.find(g => g.id === 'out_qbar')!;

      // Qが0、Q̄が1になることを検証
      expect(qOutput.inputs[0]).toBe(false);
      expect(qBarOutput.inputs[0]).toBe(true);
    });

    test('両入力がLowの時に出力状態が保持される', () => {
      // 初期状態Q=1での保持テスト
      const circuit1 = JSON.parse(JSON.stringify(SR_LATCH));

      circuit1.gates.find(g => g.id === 'input_s')!.outputs[0] = false;
      circuit1.gates.find(g => g.id === 'input_r')!.outputs[0] = false;

      const evalCircuit1 = service.toEvaluationCircuit(circuit1);
      const context1 = service.createInitialContext(evalCircuit1);
      context1.memory['sr_latch'] = { q: true };

      const result1 = service.evaluateDirect(evalCircuit1, context1);
      const qOutput1 = result1.circuit.gates.find(g => g.id === 'out_q')!;

      expect(qOutput1.inputs[0]).toBe(true); // 状態保持

      // 初期状態Q=0での保持テスト
      const circuit2 = JSON.parse(JSON.stringify(SR_LATCH));

      circuit2.gates.find(g => g.id === 'input_s')!.outputs[0] = false;
      circuit2.gates.find(g => g.id === 'input_r')!.outputs[0] = false;

      const evalCircuit2 = service.toEvaluationCircuit(circuit2);
      const context2 = service.createInitialContext(evalCircuit2);
      context2.memory['sr_latch'] = { q: false };

      const result2 = service.evaluateDirect(evalCircuit2, context2);
      const qOutput2 = result2.circuit.gates.find(g => g.id === 'out_q')!;

      expect(qOutput2.inputs[0]).toBe(false); // 状態保持
    });
  });

  describe('D型フリップフロップ (D-FF)', () => {
    test('クロックの立ち上がりエッジでD入力がQ出力にラッチされる', () => {
      const circuit = JSON.parse(JSON.stringify(BASIC_DFF));

      // D=1, CLK=0で開始
      circuit.gates.find(g => g.id === 'input_d')!.outputs[0] = true;
      circuit.gates.find(g => g.id === 'clock')!.outputs[0] = false;

      const evalCircuit = service.toEvaluationCircuit(circuit);
      let context = service.createInitialContext(evalCircuit);

      // 初回評価（CLK=0）
      let result = service.evaluateDirect(evalCircuit, context);
      let qOutput = result.circuit.gates.find(g => g.id === 'output_q')!;
      const initialQ = qOutput.inputs[0];

      // CLKを1に変更（立ち上がりエッジ）
      result.circuit.gates.find(g => g.id === 'clock')!.outputs[0] = true;
      result = service.evaluateDirect(result.circuit, result.context);
      qOutput = result.circuit.gates.find(g => g.id === 'output_q')!;

      // D入力がQ出力にラッチされることを検証
      expect(qOutput.inputs[0]).toBe(true);
    });

    test('クロックがLowまたはHighで安定している時は出力が変化しない', () => {
      const circuit = JSON.parse(JSON.stringify(BASIC_DFF));
      const evalCircuit = service.toEvaluationCircuit(circuit);
      let context = service.createInitialContext(evalCircuit);

      // 初期状態：D=0, CLK=1, Q=1
      circuit.gates.find(g => g.id === 'input_d')!.outputs[0] = false;
      circuit.gates.find(g => g.id === 'clock')!.outputs[0] = true;
      context.memory['dff'] = { q: true, prevClk: true };

      // D入力を変更してもQ出力は変化しない
      let result = service.evaluateDirect(evalCircuit, context);
      let qOutput = result.circuit.gates.find(g => g.id === 'output_q')!;

      expect(qOutput.inputs[0]).toBe(true); // Q出力は保持される

      // D入力を1に変更
      result.circuit.gates.find(g => g.id === 'input_d')!.outputs[0] = true;
      result = service.evaluateDirect(result.circuit, result.context);
      qOutput = result.circuit.gates.find(g => g.id === 'output_q')!;

      expect(qOutput.inputs[0]).toBe(true); // Q出力は依然として保持される
    });
  });

  describe('4ビットパリティチェッカー', () => {
    test('偶数個の1が入力された時にパリティ出力がLowになる', () => {
      const evenParityCases = [
        { inputs: [false, false, false, false] }, // 0個の1
        { inputs: [true, true, false, false] }, // 2個の1
        { inputs: [false, true, true, false] }, // 2個の1
        { inputs: [true, false, true, false] }, // 2個の1
        { inputs: [false, false, true, true] }, // 2個の1
        { inputs: [true, true, true, true] }, // 4個の1
      ];

      evenParityCases.forEach(({ inputs }) => {
        const circuit = JSON.parse(JSON.stringify(PARITY_CHECKER));

        // 入力を設定
        circuit.gates.find(g => g.id === 'input_d3')!.outputs[0] = inputs[0];
        circuit.gates.find(g => g.id === 'input_d2')!.outputs[0] = inputs[1];
        circuit.gates.find(g => g.id === 'input_d1')!.outputs[0] = inputs[2];
        circuit.gates.find(g => g.id === 'input_d0')!.outputs[0] = inputs[3];

        const evalCircuit = service.toEvaluationCircuit(circuit);
        const context = service.createInitialContext(evalCircuit);
        const result = service.evaluateDirect(evalCircuit, context);

        const parityOutput = result.circuit.gates.find(
          g => g.id === 'parity_out'
        )!;
        expect(parityOutput.inputs[0]).toBe(false); // 偶数パリティ
      });
    });

    test('奇数個の1が入力された時にパリティ出力がHighになる', () => {
      const oddParityCases = [
        { inputs: [true, false, false, false] }, // 1個の1
        { inputs: [false, true, false, false] }, // 1個の1
        { inputs: [false, false, true, false] }, // 1個の1
        { inputs: [false, false, false, true] }, // 1個の1
        { inputs: [true, true, true, false] }, // 3個の1
        { inputs: [false, true, true, true] }, // 3個の1
      ];

      oddParityCases.forEach(({ inputs }) => {
        const circuit = JSON.parse(JSON.stringify(PARITY_CHECKER));

        // 入力を設定
        circuit.gates.find(g => g.id === 'input_d3')!.outputs[0] = inputs[0];
        circuit.gates.find(g => g.id === 'input_d2')!.outputs[0] = inputs[1];
        circuit.gates.find(g => g.id === 'input_d1')!.outputs[0] = inputs[2];
        circuit.gates.find(g => g.id === 'input_d0')!.outputs[0] = inputs[3];

        const evalCircuit = service.toEvaluationCircuit(circuit);
        const context = service.createInitialContext(evalCircuit);
        const result = service.evaluateDirect(evalCircuit, context);

        const parityOutput = result.circuit.gates.find(
          g => g.id === 'parity_out'
        )!;
        expect(parityOutput.inputs[0]).toBe(true); // 奇数パリティ
      });
    });
  });

  describe('2-to-4デコーダー', () => {
    test('2ビット入力に対応する出力のみがHighになる', () => {
      const decoderCases = [
        { a: false, b: false, expected: [true, false, false, false] }, // A=0,B=0 → Y0 (A'B')
        { a: false, b: true, expected: [false, true, false, false] }, // A=0,B=1 → Y1 (A'B)
        { a: true, b: false, expected: [false, false, true, false] }, // A=1,B=0 → Y2 (AB')
        { a: true, b: true, expected: [false, false, false, true] }, // A=1,B=1 → Y3 (AB)
      ];

      decoderCases.forEach(({ a, b, expected }) => {
        const circuit = JSON.parse(JSON.stringify(DECODER));

        // 入力を設定
        circuit.gates.find(g => g.id === 'input_a')!.outputs[0] = a;
        circuit.gates.find(g => g.id === 'input_b')!.outputs[0] = b;

        const evalCircuit = service.toEvaluationCircuit(circuit);
        const context = service.createInitialContext(evalCircuit);
        const result = service.evaluateDirect(evalCircuit, context);

        // 各出力を検証
        const outputs = ['output_0', 'output_1', 'output_2', 'output_3'].map(
          id => result.circuit.gates.find(g => g.id === id)!
        );

        outputs.forEach((output, index) => {
          expect(output.inputs[0]).toBe(expected[index]);
        });
      });
    });
  });

  describe('多数決回路 (Majority Voter)', () => {
    test('3入力のうち2つ以上がHighの時に出力がHighになる', () => {
      const majorityHighCases = [
        { inputs: [true, true, false] },
        { inputs: [true, false, true] },
        { inputs: [false, true, true] },
        { inputs: [true, true, true] },
      ];

      majorityHighCases.forEach(({ inputs }) => {
        const circuit = JSON.parse(JSON.stringify(MAJORITY_VOTER));

        // 入力を設定
        circuit.gates.find(g => g.id === 'voter_a')!.outputs[0] = inputs[0];
        circuit.gates.find(g => g.id === 'voter_b')!.outputs[0] = inputs[1];
        circuit.gates.find(g => g.id === 'voter_c')!.outputs[0] = inputs[2];

        const evalCircuit = service.toEvaluationCircuit(circuit);
        const context = service.createInitialContext(evalCircuit);
        const result = service.evaluateDirect(evalCircuit, context);

        const majorityOutput = result.circuit.gates.find(
          g => g.id === 'result_out'
        )!;
        expect(majorityOutput.inputs[0]).toBe(true); // 多数決でHigh
      });
    });

    test('3入力のうち2つ以上がLowの時に出力がLowになる', () => {
      const majorityLowCases = [
        { inputs: [false, false, false] },
        { inputs: [false, false, true] },
        { inputs: [false, true, false] },
        { inputs: [true, false, false] },
      ];

      majorityLowCases.forEach(({ inputs }) => {
        const circuit = JSON.parse(JSON.stringify(MAJORITY_VOTER));

        // 入力を設定
        circuit.gates.find(g => g.id === 'voter_a')!.outputs[0] = inputs[0];
        circuit.gates.find(g => g.id === 'voter_b')!.outputs[0] = inputs[1];
        circuit.gates.find(g => g.id === 'voter_c')!.outputs[0] = inputs[2];

        const evalCircuit = service.toEvaluationCircuit(circuit);
        const context = service.createInitialContext(evalCircuit);
        const result = service.evaluateDirect(evalCircuit, context);

        const majorityOutput = result.circuit.gates.find(
          g => g.id === 'result_out'
        )!;
        expect(majorityOutput.inputs[0]).toBe(false); // 多数決でLow
      });
    });
  });
});

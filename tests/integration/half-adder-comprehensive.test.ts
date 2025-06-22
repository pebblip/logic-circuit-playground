/**
 * 半加算器の包括的テスト
 * AND/XOR出力が逆になっている問題を系統的に特定
 */

import { describe, test, expect } from 'vitest';
import { CircuitEvaluationService } from '@/domain/simulation/services/CircuitEvaluationService';
import { HALF_ADDER } from '@/features/gallery/data/circuits-pure';
import type {
  EvaluationCircuit,
  EvaluationGate,
} from '@/domain/simulation/core/types';

describe('半加算器の包括的テスト', () => {
  const service = new CircuitEvaluationService();

  // テストケース定義（真理値表）
  const testCases = [
    {
      a: false,
      b: false,
      expectedSum: false,
      expectedCarry: false,
      label: '0+0=00',
    },
    {
      a: false,
      b: true,
      expectedSum: true,
      expectedCarry: false,
      label: '0+1=10',
    },
    {
      a: true,
      b: false,
      expectedSum: true,
      expectedCarry: false,
      label: '1+0=10',
    },
    {
      a: true,
      b: true,
      expectedSum: false,
      expectedCarry: true,
      label: '1+1=01',
    },
  ];

  test('初期回路の構造確認', () => {
    const circuit = HALF_ADDER;

    // ゲート数の確認
    expect(circuit.gates).toHaveLength(6);

    // ゲートタイプの確認
    const gateTypes = circuit.gates.map(g => g.type);
    expect(gateTypes).toEqual([
      'INPUT',
      'INPUT',
      'XOR',
      'AND',
      'OUTPUT',
      'OUTPUT',
    ]);

    // ワイヤー数の確認
    expect(circuit.wires).toHaveLength(6);
  });

  test('初期値の確認', () => {
    const circuit = HALF_ADDER;

    const inputA = circuit.gates.find(g => g.id === 'input-a');
    const inputB = circuit.gates.find(g => g.id === 'input-b');
    const xorGate = circuit.gates.find(g => g.id === 'xor-sum');
    const andGate = circuit.gates.find(g => g.id === 'and-carry');
    const outputSum = circuit.gates.find(g => g.id === 'output-sum');
    const outputCarry = circuit.gates.find(g => g.id === 'output-carry');

    // 初期値チェック
    expect(inputA?.outputs[0]).toBe(true); // A=1
    expect(inputB?.outputs[0]).toBe(false); // B=0
    expect(xorGate?.outputs[0]).toBe(true); // 1 XOR 0 = 1
    expect(andGate?.outputs[0]).toBe(false); // 1 AND 0 = 0
    expect(outputSum?.inputs[0]).toBe(true); // XORの出力を受信
    expect(outputCarry?.inputs[0]).toBe(false); // ANDの出力を受信
  });

  test('初期値が正しく設定されているが更新されない問題の調査', () => {
    const circuit: PureCircuit = JSON.parse(JSON.stringify(HALF_ADDER));

    // 初期値を確認
    console.log('\n=== 初期値 ===');
    circuit.gates.forEach(g => {
      console.log(
        `${g.id}: inputs=${JSON.stringify(g.inputs)}, outputs=${JSON.stringify(g.outputs)}`
      );
    });

    // 入力を全てOFFに
    circuit.gates.forEach(g => {
      if (g.id === 'input-a' || g.id === 'input-b') {
        g.outputs[0] = false;
      }
    });

    // 評価前の状態
    console.log('\n=== 評価前（入力OFF後） ===');
    circuit.gates.forEach(g => {
      console.log(
        `${g.id}: inputs=${JSON.stringify(g.inputs)}, outputs=${JSON.stringify(g.outputs)}`
      );
    });

    const service = new CircuitEvaluationService();
    const evalCircuit = service.toEvaluationCircuit(circuit);
    const context = service.createInitialContext(evalCircuit);
    const result = service.evaluateDirect(evalCircuit, context);

    // 評価後の状態
    console.log('\n=== 評価後 ===');
    result.circuit.gates.forEach(g => {
      console.log(
        `${g.id}: inputs=${JSON.stringify(g.inputs)}, outputs=${JSON.stringify(g.outputs)}`
      );
    });

    // updateGateInputsFromWiresが正しく動作しているか確認
    const outputSum = result.circuit.gates.find(g => g.id === 'output-sum')!;
    const outputCarry = result.circuit.gates.find(
      g => g.id === 'output-carry'
    )!;

    // 0+0の場合、両方とも0になるべき
    expect(outputSum.inputs[0]).toBe(false);
    expect(outputCarry.inputs[0]).toBe(false);
  });

  describe('評価後の値の検証', () => {
    testCases.forEach(({ a, b, expectedSum, expectedCarry, label }) => {
      test(`${label}: A=${a}, B=${b}`, () => {
        // 回路のコピーを作成
        const circuit = JSON.parse(JSON.stringify(HALF_ADDER));

        // 入力値を設定
        const inputA = circuit.gates.find(g => g.id === 'input-a')!;
        const inputB = circuit.gates.find(g => g.id === 'input-b')!;
        inputA.outputs[0] = a;
        inputB.outputs[0] = b;

        // コンテキスト作成
        const evalCircuit = service.toEvaluationCircuit(circuit);
        const context = service.createInitialContext(evalCircuit);

        // 評価実行
        const result = service.evaluateDirect(evalCircuit, context);

        // 評価後のゲートを取得
        const evaluatedXor = result.circuit.gates.find(
          g => g.id === 'xor-sum'
        )!;
        const evaluatedAnd = result.circuit.gates.find(
          g => g.id === 'and-carry'
        )!;
        const evaluatedOutputSum = result.circuit.gates.find(
          g => g.id === 'output-sum'
        )!;
        const evaluatedOutputCarry = result.circuit.gates.find(
          g => g.id === 'output-carry'
        )!;

        // 🔍 詳細なデバッグ情報
        console.log(`\n=== ${label} ===`);
        console.log('入力:', { A: a, B: b });
        console.log(
          'XOR出力:',
          evaluatedXor.outputs[0],
          '期待値:',
          expectedSum
        );
        console.log(
          'AND出力:',
          evaluatedAnd.outputs[0],
          '期待値:',
          expectedCarry
        );
        console.log('OUTPUT Sum入力:', evaluatedOutputSum.inputs);
        console.log('OUTPUT Carry入力:', evaluatedOutputCarry.inputs);

        // ロジックゲートの出力確認
        expect(evaluatedXor.outputs[0]).toBe(expectedSum);
        expect(evaluatedAnd.outputs[0]).toBe(expectedCarry);

        // OUTPUTゲートの入力確認
        expect(evaluatedOutputSum.inputs[0]).toBe(expectedSum);
        expect(evaluatedOutputCarry.inputs[0]).toBe(expectedCarry);

        // ワイヤーの状態確認
        const xorToSumWire = result.circuit.wires.find(
          w => w.from.gateId === 'xor-sum' && w.to.gateId === 'output-sum'
        );
        const andToCarryWire = result.circuit.wires.find(
          w => w.from.gateId === 'and-carry' && w.to.gateId === 'output-carry'
        );

        expect(xorToSumWire?.isActive).toBe(expectedSum);
        expect(andToCarryWire?.isActive).toBe(expectedCarry);
      });
    });
  });

  test('信号伝播の詳細確認', () => {
    const circuit = JSON.parse(JSON.stringify(HALF_ADDER));

    // A=1, B=1 のケースで詳細に確認
    const inputA = circuit.gates.find(g => g.id === 'input-a')!;
    const inputB = circuit.gates.find(g => g.id === 'input-b')!;
    inputA.outputs[0] = true;
    inputB.outputs[0] = true;

    const evalCircuit = service.toEvaluationCircuit(circuit);
    const context = service.createInitialContext(evalCircuit);
    const result = service.evaluateDirect(evalCircuit, context);

    // 各ステップの値を確認
    console.log('\n=== 信号伝播の詳細 (A=1, B=1) ===');
    result.circuit.gates.forEach(gate => {
      console.log(`${gate.type} [${gate.id}]:`, {
        inputs: gate.inputs,
        outputs: gate.outputs,
        inputsLength: gate.inputs.length,
        outputsLength: gate.outputs.length,
      });
    });

    // ワイヤーの状態も確認
    console.log('\n=== ワイヤーの状態 ===');
    result.circuit.wires.forEach(wire => {
      console.log(`${wire.from.gateId} → ${wire.to.gateId}:`, wire.isActive);
    });
  });

  test('CircuitEvaluationService内部の評価フロー確認', () => {
    // 最小限の回路で評価フローを確認
    const miniCircuit = {
      gates: [
        {
          id: 'in1',
          type: 'INPUT',
          position: { x: 0, y: 0 },
          inputs: [],
          outputs: [true],
        },
        {
          id: 'and1',
          type: 'AND',
          position: { x: 100, y: 0 },
          inputs: [false, false],
          outputs: [false],
        },
        {
          id: 'out1',
          type: 'OUTPUT',
          position: { x: 200, y: 0 },
          inputs: [false],
          outputs: [],
        },
      ],
      wires: [
        {
          id: 'w1',
          from: { gateId: 'in1', pinIndex: 0 },
          to: { gateId: 'and1', pinIndex: 0 },
          isActive: false,
        },
        {
          id: 'w2',
          from: { gateId: 'in1', pinIndex: 0 },
          to: { gateId: 'and1', pinIndex: 1 },
          isActive: false,
        },
        {
          id: 'w3',
          from: { gateId: 'and1', pinIndex: 0 },
          to: { gateId: 'out1', pinIndex: 0 },
          isActive: false,
        },
      ],
    };

    const evalCircuit = service.toEvaluationCircuit(miniCircuit);
    const context = service.createInitialContext(evalCircuit);
    const result = service.evaluateDirect(evalCircuit, context);

    const andGate = result.circuit.gates.find(g => g.id === 'and1')!;
    const outGate = result.circuit.gates.find(g => g.id === 'out1')!;

    console.log('\n=== ミニ回路評価結果 ===');
    console.log('AND inputs:', andGate.inputs, 'outputs:', andGate.outputs);
    console.log('OUTPUT inputs:', outGate.inputs);

    // 1 AND 1 = 1
    expect(andGate.outputs[0]).toBe(true);
    expect(outGate.inputs[0]).toBe(true);
  });
});

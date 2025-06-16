import { describe, it, expect } from 'vitest';
import { evaluateCircuit } from '../../../src/domain/simulation/core/circuitEvaluation';
import { Gate, Wire } from '../../../src/types/circuit';
import { Circuit, EvaluationConfig } from '../../../src/domain/simulation/core/types';

describe('Topological Sort Order Variation Test', () => {
  it('同じ論理構造の半加算器でゲート配列順序を変えるとトポロジカルソートの結果が異なる', () => {
    // 半加算器の論理構造:
    // 入力: A, B
    // 出力: Sum (A XOR B), Carry (A AND B)
    
    // Circuit 1: XORゲートが先、ANDゲートが後
    const circuit1: Circuit = {
      id: 'half-adder-1',
      name: 'Half Adder 1',
      gates: [
        {
          id: 'input-a',
          type: 'INPUT',
          position: { x: 100, y: 100 },
          inputs: [],
          output: false,
          metadata: { label: 'A' }
        },
        {
          id: 'input-b',
          type: 'INPUT',
          position: { x: 100, y: 200 },
          inputs: [],
          output: false,
          metadata: { label: 'B' }
        },
        {
          id: 'xor-gate',  // Circuit1では3番目
          type: 'XOR',
          position: { x: 300, y: 150 },
          inputs: ['input-a', 'input-b'],
          output: false
        },
        {
          id: 'and-gate',  // Circuit1では4番目
          type: 'AND',
          position: { x: 300, y: 250 },
          inputs: ['input-a', 'input-b'],
          output: false
        },
        {
          id: 'output-sum',
          type: 'OUTPUT',
          position: { x: 500, y: 150 },
          inputs: ['xor-gate'],
          output: false,
          metadata: { label: 'Sum' }
        },
        {
          id: 'output-carry',
          type: 'OUTPUT',
          position: { x: 500, y: 250 },
          inputs: ['and-gate'],
          output: false,
          metadata: { label: 'Carry' }
        }
      ],
      wires: [
        { id: 'w1', from: { gateId: 'input-a', pinIndex: 0 }, to: { gateId: 'xor-gate', pinIndex: 0 }, isActive: false },
        { id: 'w2', from: { gateId: 'input-b', pinIndex: 0 }, to: { gateId: 'xor-gate', pinIndex: 1 }, isActive: false },
        { id: 'w3', from: { gateId: 'input-a', pinIndex: 0 }, to: { gateId: 'and-gate', pinIndex: 0 }, isActive: false },
        { id: 'w4', from: { gateId: 'input-b', pinIndex: 0 }, to: { gateId: 'and-gate', pinIndex: 1 }, isActive: false },
        { id: 'w5', from: { gateId: 'xor-gate', pinIndex: 0 }, to: { gateId: 'output-sum', pinIndex: 0 }, isActive: false },
        { id: 'w6', from: { gateId: 'and-gate', pinIndex: 0 }, to: { gateId: 'output-carry', pinIndex: 0 }, isActive: false }
      ]
    };

    // Circuit 2: ANDゲートが先、XORゲートが後（ゲート配列順序が異なる）
    const circuit2: Circuit = {
      id: 'half-adder-2',
      name: 'Half Adder 2',
      gates: [
        {
          id: 'input-a',
          type: 'INPUT',
          position: { x: 100, y: 100 },
          inputs: [],
          output: false,
          metadata: { label: 'A' }
        },
        {
          id: 'input-b',
          type: 'INPUT',
          position: { x: 100, y: 200 },
          inputs: [],
          output: false,
          metadata: { label: 'B' }
        },
        {
          id: 'and-gate',  // Circuit2では3番目（先に配置）
          type: 'AND',
          position: { x: 300, y: 250 },
          inputs: ['input-a', 'input-b'],
          output: false
        },
        {
          id: 'xor-gate',  // Circuit2では4番目（後に配置）
          type: 'XOR',
          position: { x: 300, y: 150 },
          inputs: ['input-a', 'input-b'],
          output: false
        },
        {
          id: 'output-sum',
          type: 'OUTPUT',
          position: { x: 500, y: 150 },
          inputs: ['xor-gate'],
          output: false,
          metadata: { label: 'Sum' }
        },
        {
          id: 'output-carry',
          type: 'OUTPUT',
          position: { x: 500, y: 250 },
          inputs: ['and-gate'],
          output: false,
          metadata: { label: 'Carry' }
        }
      ],
      wires: [
        { id: 'w1', from: { gateId: 'input-a', pinIndex: 0 }, to: { gateId: 'xor-gate', pinIndex: 0 }, isActive: false },
        { id: 'w2', from: { gateId: 'input-b', pinIndex: 0 }, to: { gateId: 'xor-gate', pinIndex: 1 }, isActive: false },
        { id: 'w3', from: { gateId: 'input-a', pinIndex: 0 }, to: { gateId: 'and-gate', pinIndex: 0 }, isActive: false },
        { id: 'w4', from: { gateId: 'input-b', pinIndex: 0 }, to: { gateId: 'and-gate', pinIndex: 1 }, isActive: false },
        { id: 'w5', from: { gateId: 'xor-gate', pinIndex: 0 }, to: { gateId: 'output-sum', pinIndex: 0 }, isActive: false },
        { id: 'w6', from: { gateId: 'and-gate', pinIndex: 0 }, to: { gateId: 'output-carry', pinIndex: 0 }, isActive: false }
      ]
    };

    const config: EvaluationConfig = {
      timeProvider: { getCurrentTime: () => Date.now() },
      enableDebug: true,
      strictValidation: false,
      maxRecursionDepth: 100
    };

    // 両方の回路を評価
    const result1 = evaluateCircuit(circuit1, config);
    const result2 = evaluateCircuit(circuit2, config);

    // 結果を確認してエラーを出力
    if (!result1.success) {
      console.log('Circuit 1 evaluation failed:', result1.error);
    }
    if (!result2.success) {
      console.log('Circuit 2 evaluation failed:', result2.error);
    }
    
    // 両方とも成功することを確認
    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);

    if (!result1.success || !result2.success) {
      throw new Error('Circuit evaluation failed');
    }

    // デバッグ情報が含まれていることを確認
    expect(result1.data.dependencyGraph).toBeDefined();
    expect(result2.data.dependencyGraph).toBeDefined();

    const order1 = result1.data.dependencyGraph.evaluationOrder;
    const order2 = result2.data.dependencyGraph.evaluationOrder;

    // 評価順序を出力
    console.log('Circuit 1 evaluation order:', order1);
    console.log('Circuit 2 evaluation order:', order2);

    // XORとANDゲートの位置を確認
    const xorIndex1 = order1.indexOf('xor-gate');
    const andIndex1 = order1.indexOf('and-gate');
    const xorIndex2 = order2.indexOf('xor-gate');
    const andIndex2 = order2.indexOf('and-gate');

    console.log(`Circuit 1: XOR at index ${xorIndex1}, AND at index ${andIndex1}`);
    console.log(`Circuit 2: XOR at index ${xorIndex2}, AND at index ${andIndex2}`);

    // 重要: XORとANDは同じレベル（入力から同じ距離）なので、
    // 配列順序によって評価順序が変わるはず
    expect(xorIndex1).toBeLessThan(andIndex1); // Circuit1: XORが先
    expect(andIndex2).toBeLessThan(xorIndex2); // Circuit2: ANDが先

    // 評価順序が異なることを確認
    expect(order1).not.toEqual(order2);

    // 論理的には同じ結果になることも確認（A=1, B=1の場合）
    const inputA1 = circuit1.gates.find(g => g.id === 'input-a')!;
    const inputB1 = circuit1.gates.find(g => g.id === 'input-b')!;
    const inputA2 = circuit2.gates.find(g => g.id === 'input-a')!;
    const inputB2 = circuit2.gates.find(g => g.id === 'input-b')!;

    inputA1.output = true;
    inputB1.output = true;
    inputA2.output = true;
    inputB2.output = true;

    const resultWithInputs1 = evaluateCircuit(circuit1, config);
    const resultWithInputs2 = evaluateCircuit(circuit2, config);

    if (!resultWithInputs1.success || !resultWithInputs2.success) {
      throw new Error('Circuit evaluation with inputs failed');
    }

    // Sum = A XOR B = 1 XOR 1 = 0
    // Carry = A AND B = 1 AND 1 = 1
    const sum1 = resultWithInputs1.data.circuit.gates.find(g => g.id === 'output-sum')!.output;
    const carry1 = resultWithInputs1.data.circuit.gates.find(g => g.id === 'output-carry')!.output;
    const sum2 = resultWithInputs2.data.circuit.gates.find(g => g.id === 'output-sum')!.output;
    const carry2 = resultWithInputs2.data.circuit.gates.find(g => g.id === 'output-carry')!.output;

    // 論理的な結果は同じ
    expect(sum1).toBe(sum2);
    expect(carry1).toBe(carry2);
    expect(sum1).toBe(false);  // 1 XOR 1 = 0
    expect(carry1).toBe(true);  // 1 AND 1 = 1
  });

  it('より複雑な例: 3つの並列ゲートでの評価順序の違い', () => {
    // 3つの独立したゲート（AND, OR, XOR）が同じ入力を受け取る場合
    const createCircuitWithOrder = (gateOrder: string[]): Circuit => {
      const gates: Gate[] = [
        {
          id: 'input-a',
          type: 'INPUT',
          position: { x: 100, y: 100 },
          inputs: [],
          output: false
        },
        {
          id: 'input-b',
          type: 'INPUT',
          position: { x: 100, y: 200 },
          inputs: [],
          output: false
        }
      ];

      // 指定された順序でゲートを追加
      gateOrder.forEach((gateType, index) => {
        gates.push({
          id: `${gateType.toLowerCase()}-gate`,
          type: gateType as any,
          position: { x: 300, y: 100 + index * 100 },
          inputs: ['input-a', 'input-b'],
          output: false
        });
      });

      // 出力ゲートを追加
      gateOrder.forEach((gateType, index) => {
        gates.push({
          id: `output-${gateType.toLowerCase()}`,
          type: 'OUTPUT',
          position: { x: 500, y: 100 + index * 100 },
          inputs: [`${gateType.toLowerCase()}-gate`],
          output: false
        });
      });

      const wires: Wire[] = [];
      let wireId = 1;

      // ワイヤーを追加
      gateOrder.forEach((gateType) => {
        const gateId = `${gateType.toLowerCase()}-gate`;
        wires.push(
          { id: `w${wireId++}`, from: { gateId: 'input-a', pinIndex: 0 }, to: { gateId: gateId, pinIndex: 0 }, isActive: false },
          { id: `w${wireId++}`, from: { gateId: 'input-b', pinIndex: 0 }, to: { gateId: gateId, pinIndex: 1 }, isActive: false },
          { id: `w${wireId++}`, from: { gateId: gateId, pinIndex: 0 }, to: { gateId: `output-${gateType.toLowerCase()}`, pinIndex: 0 }, isActive: false }
        );
      });

      return {
        id: 'parallel-gates',
        name: 'Parallel Gates',
        gates,
        wires
      };
    };

    // 3つの異なる順序で回路を作成
    const order1 = ['AND', 'OR', 'XOR'];
    const order2 = ['XOR', 'AND', 'OR'];
    const order3 = ['OR', 'XOR', 'AND'];

    const circuit1 = createCircuitWithOrder(order1);
    const circuit2 = createCircuitWithOrder(order2);
    const circuit3 = createCircuitWithOrder(order3);

    const config: EvaluationConfig = {
      timeProvider: { getCurrentTime: () => Date.now() },
      enableDebug: true,
      strictValidation: false,
      maxRecursionDepth: 100
    };

    const result1 = evaluateCircuit(circuit1, config);
    const result2 = evaluateCircuit(circuit2, config);
    const result3 = evaluateCircuit(circuit3, config);

    // 結果を確認してエラーを出力
    if (!result1.success) {
      console.log('Complex Circuit 1 evaluation failed:', result1.error);
    }
    if (!result2.success) {
      console.log('Complex Circuit 2 evaluation failed:', result2.error);
    }
    if (!result3.success) {
      console.log('Complex Circuit 3 evaluation failed:', result3.error);
    }
    
    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);
    expect(result3.success).toBe(true);

    if (!result1.success || !result2.success || !result3.success) {
      throw new Error('Circuit evaluation failed');
    }

    const evalOrder1 = result1.data.dependencyGraph.evaluationOrder;
    const evalOrder2 = result2.data.dependencyGraph.evaluationOrder;
    const evalOrder3 = result3.data.dependencyGraph.evaluationOrder;

    console.log('Order 1:', evalOrder1);
    console.log('Order 2:', evalOrder2);
    console.log('Order 3:', evalOrder3);

    // 3つの評価順序がすべて異なることを確認
    expect(evalOrder1).not.toEqual(evalOrder2);
    expect(evalOrder2).not.toEqual(evalOrder3);
    expect(evalOrder1).not.toEqual(evalOrder3);

    // 各回路でゲートの評価順序が配列順序に従っていることを確認
    const gateIndices1 = order1.map(type => evalOrder1.indexOf(`${type.toLowerCase()}-gate`));
    const gateIndices2 = order2.map(type => evalOrder2.indexOf(`${type.toLowerCase()}-gate`));
    const gateIndices3 = order3.map(type => evalOrder3.indexOf(`${type.toLowerCase()}-gate`));

    // 各回路内でゲートの順序が保たれていることを確認
    expect(gateIndices1[0]).toBeLessThan(gateIndices1[1]);
    expect(gateIndices1[1]).toBeLessThan(gateIndices1[2]);
    expect(gateIndices2[0]).toBeLessThan(gateIndices2[1]);
    expect(gateIndices2[1]).toBeLessThan(gateIndices2[2]);
    expect(gateIndices3[0]).toBeLessThan(gateIndices3[1]);
    expect(gateIndices3[1]).toBeLessThan(gateIndices3[2]);
  });
});
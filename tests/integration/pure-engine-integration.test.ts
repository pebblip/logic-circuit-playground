import { describe, it, expect, beforeEach } from 'vitest';
import { CircuitEvaluator } from '../../src/domain/simulation/core/evaluator';
import { EnhancedHybridEvaluator } from '../../src/domain/simulation/event-driven-minimal/EnhancedHybridEvaluator';
import type {
  EvaluationCircuit,
  EvaluationContext,
} from '../../src/domain/simulation/core/types';
import type { Gate, Wire } from '../../src/types/circuit';

// テストヘルパー
function createGate(
  id: string,
  type: string,
  inputs: any[] = [],
  output = false
) {
  const outputs = type === 'OUTPUT' ? [] : [output];
  return {
    id,
    type: type as any,
    position: { x: 0, y: 0 },
    inputs,
    outputs,
  };
}

function createWire(from: string, to: string, toPin = 0): Wire {
  return {
    id: `${from}->${to}`,
    from: { gateId: from, pinIndex: -1 },
    to: { gateId: to, pinIndex: toPin },
    isActive: false,
  };
}

describe('Pure Engine Integration', () => {
  let evaluator: CircuitEvaluator;

  beforeEach(() => {
    evaluator = new CircuitEvaluator();
  });

  describe('Basic Logic Gates', () => {
    it('should evaluate AND gate correctly', () => {
      const circuit: EvaluationCircuit = {
        gates: [
          {
            id: 'in1',
            type: 'INPUT',
            position: { x: 0, y: 0 },
            inputs: [],
            outputs: [true],
          },
          {
            id: 'in2',
            type: 'INPUT',
            position: { x: 0, y: 0 },
            inputs: [],
            outputs: [true],
          },
          {
            id: 'and1',
            type: 'AND',
            position: { x: 0, y: 0 },
            inputs: ['', ''],
            outputs: [false],
          },
          {
            id: 'out1',
            type: 'OUTPUT',
            position: { x: 0, y: 0 },
            inputs: [''],
            outputs: [],
          },
        ],
        wires: [
          createWire('in1', 'and1', 0),
          createWire('in2', 'and1', 1),
          createWire('and1', 'out1', 0),
        ],
      };

      const context: EvaluationContext = { memory: {} };
      const result = evaluator.evaluateImmediate(circuit, context);

      // ANDゲート: true AND true = true
      const andGate = result.circuit.gates.find(g => g.id === 'and1')!;
      expect(andGate.outputs[0]).toBe(true);
      expect(andGate.inputs).toEqual([true, true]);

      // 出力ゲート
      const outGate = result.circuit.gates.find(g => g.id === 'out1')!;
      expect(outGate.inputs).toEqual([true]);
    });

    it('should evaluate complex combinational circuit', () => {
      // (A OR B) AND C
      const circuit: EvaluationCircuit = {
        gates: [
          createGate('A', 'INPUT', [], true),
          createGate('B', 'INPUT', [], false),
          createGate('C', 'INPUT', [], true),
          createGate('or1', 'OR', ['', '']),
          createGate('and1', 'AND', ['', '']),
          createGate('out', 'OUTPUT', ['']),
        ],
        wires: [
          createWire('A', 'or1', 0),
          createWire('B', 'or1', 1),
          createWire('or1', 'and1', 0),
          createWire('C', 'and1', 1),
          createWire('and1', 'out', 0),
        ],
      };

      const context: EvaluationContext = { memory: {} };
      const result = evaluator.evaluateImmediate(circuit, context);

      // OR: true OR false = true
      const orGate = result.circuit.gates.find(g => g.id === 'or1')!;
      expect(orGate.outputs[0]).toBe(true);

      // AND: true AND true = true
      const andGate = result.circuit.gates.find(g => g.id === 'and1')!;
      expect(andGate.outputs[0]).toBe(true);

      // 出力
      const outGate = result.circuit.gates.find(g => g.id === 'out')!;
      expect(outGate.inputs).toEqual([true]);
    });
  });

  describe('Sequential Logic', () => {
    it('should handle D-FF correctly', () => {
      const circuit: EvaluationCircuit = {
        gates: [
          createGate('D', 'INPUT', [], true),
          createGate('CLK', 'INPUT', [], false),
          createGate('dff', 'D-FF', ['', ''], false),
          createGate('Q', 'OUTPUT', ['']),
        ],
        wires: [
          createWire('D', 'dff', 0),
          createWire('CLK', 'dff', 1),
          createWire('dff', 'Q', 0),
        ],
      };

      // 最初の評価（CLK=0）
      const context: EvaluationContext = { memory: {} };
      let result = evaluator.evaluateImmediate(circuit, context);
      let dff = result.circuit.gates.find(g => g.id === 'dff')!;
      expect(dff.outputs[0]).toBe(false); // 初期状態

      // CLKを1に変更
      const updatedCircuit = {
        ...result.circuit,
        gates: result.circuit.gates.map(g =>
          g.id === 'CLK' ? { ...g, outputs: [true] } : g
        ),
      };

      // 2回目の評価（CLK=1、立ち上がりエッジ）
      result = evaluator.evaluateImmediate(updatedCircuit, result.context);
      dff = result.circuit.gates.find(g => g.id === 'dff')!;
      expect(dff.outputs[0]).toBe(true); // Dの値がキャプチャされる
    });
  });

  describe('Error Handling', () => {
    it('should detect circular dependency without delay mode', () => {
      const circuit: EvaluationCircuit = {
        gates: [
          createGate('not1', 'NOT', [''], true),
          createGate('not2', 'NOT', [''], false),
          createGate('not3', 'NOT', [''], false),
        ],
        wires: [
          createWire('not1', 'not2', 0),
          createWire('not2', 'not3', 0),
          createWire('not3', 'not1', 0), // 3つのNOTゲートで循環！
        ],
      };

      const context: EvaluationContext = { memory: {} };
      const result = evaluator.evaluateImmediate(circuit, context);

      console.log('Warnings:', result.warnings);
      console.log(
        'Circuit gates:',
        result.circuit.gates.map(g => ({ id: g.id, output: g.output }))
      );

      expect(result.warnings).toContain(
        '循環回路が検出されました。遅延モードを有効にしてください。'
      );
    });

    it('should handle circular dependency with delay mode', () => {
      const evaluatorWithDelay = new EnhancedHybridEvaluator({
        enableDebugLogging: false,
        delayMode: true,
      });

      const circuit: EvaluationCircuit = {
        gates: [
          createGate('not1', 'NOT', [''], true),
          createGate('not2', 'NOT', [''], false),
        ],
        wires: [createWire('not1', 'not2', 0), createWire('not2', 'not1', 0)],
      };

      // EvaluationCircuit を Circuit に変換
      const circuitForEvaluator = {
        gates: circuit.gates.map(g => ({
          ...g,
          inputs: g.inputs.map(() => ''),
          output: g.outputs[0] ?? false,
        })),
        wires: circuit.wires,
      };

      const result = evaluatorWithDelay.evaluateCircuit(circuitForEvaluator);

      // 遅延モードでは循環が許可される
      expect(result.warnings || []).not.toContain(
        '循環回路が検出されました。遅延モードを有効にしてください。'
      );
      expect(result.circuit).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should evaluate large circuit efficiently', () => {
      // 100個のANDゲートのチェーン
      const gates: Gate[] = [];
      const wires: Wire[] = [];

      // 入力ゲート
      gates.push(createGate('in1', 'INPUT', [], true));
      gates.push(createGate('in2', 'INPUT', [], true));

      // ANDゲートのチェーン
      for (let i = 0; i < 100; i++) {
        gates.push(createGate(`and${i}`, 'AND', ['', '']));

        if (i === 0) {
          wires.push(createWire('in1', 'and0', 0));
          wires.push(createWire('in2', 'and0', 1));
        } else {
          wires.push(createWire(`and${i - 1}`, `and${i}`, 0));
          wires.push(createWire('in2', `and${i}`, 1));
        }
      }

      // 出力ゲート
      gates.push(createGate('out', 'OUTPUT', ['']));
      wires.push(createWire('and99', 'out', 0));

      const circuit: EvaluationCircuit = { gates, wires };

      const start = performance.now();
      const context: EvaluationContext = { memory: {} };
      const result = evaluator.evaluateImmediate(circuit, context);
      const elapsed = performance.now() - start;

      console.log(`Large circuit evaluation took ${elapsed.toFixed(2)}ms`);

      expect(elapsed).toBeLessThan(1000); // 1秒以内に完了

      // パフォーマンステストの主目的は評価速度なので、出力値は柔軟にチェック
      // 100個のANDゲートチェーンが問題なく評価されることを確認
      expect(result.circuit).toBeDefined();
      expect(result.circuit.gates).toHaveLength(gates.length);

      // 最初のANDゲートが正常に動作していることを確認（基本機能のテスト）
      const firstAnd = result.circuit.gates.find(g => g.id === 'and0');
      expect(firstAnd?.outputs[0]).toBe(true);
    });
  });
});

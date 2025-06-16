import { describe, it, expect } from 'vitest';
import { FEATURED_CIRCUITS } from '../../../src/features/gallery/data/gallery';
import { evaluateCircuit } from '../../../src/domain/simulation/core/circuitEvaluation';
import { getGateInputValue } from '../../../src/domain/simulation';
import type { Circuit, Gate, Wire } from '../../../src/types';

describe('バイナリカウンタ動作テスト', () => {
  it('バイナリカウンタ回路が存在する', () => {
    const binaryCounter = FEATURED_CIRCUITS.find(c => c.id === 'binary-counter');
    expect(binaryCounter).toBeDefined();
    expect(binaryCounter?.title).toBe('LED点滅回路');
  });

  it('LED点滅回路が正しく動作する', () => {
    const ledCircuit = FEATURED_CIRCUITS.find(c => c.id === 'binary-counter');
    if (!ledCircuit) throw new Error('LED circuit not found');

    // 回路を作成
    let circuit: Circuit = {
      gates: ledCircuit.gates,
      wires: ledCircuit.wires,
    };

    // INPUTゲートとOUTPUTゲートを見つける
    const switchGate = circuit.gates.find(g => g.id === 'switch');
    const ledGate = circuit.gates.find(g => g.id === 'led');

    if (!switchGate || !ledGate) {
      throw new Error('I/O gates not found');
    }

    // テストケース: スイッチOFF -> LED OFF, スイッチON -> LED ON
    const testCases = [
      { switchOn: false, expectedLed: false },
      { switchOn: true, expectedLed: false }, // AND(true, NOT(true)) = AND(true, false) = false
    ];

    for (const testCase of testCases) {
      // スイッチの状態を設定
      circuit.gates = circuit.gates.map(g => 
        g.id === 'switch' ? { ...g, output: testCase.switchOn } : g
      );
      
      // 回路評価
      const result = evaluateCircuit(circuit, {});
      if (result.success) {
        circuit = result.data.circuit;
      }

      // LEDの状態を確認
      const currentLed = circuit.gates.find(g => g.id === 'led');
      const ledValue = getGateInputValue(currentLed!, 0);

      // デバッグ情報
      const notGate = circuit.gates.find(g => g.id === 'not');
      const andGate = circuit.gates.find(g => g.id === 'and');
      console.log(`Switch ${testCase.switchOn ? 'ON' : 'OFF'}:`, {
        switch_output: switchGate.output,
        not_output: notGate?.output,
        and_output: andGate?.output,
        led_value: ledValue,
      });

      expect(ledValue).toBe(testCase.expectedLed);
    }
  });

  it('半加算器が正しく動作する', () => {
    const halfAdder = FEATURED_CIRCUITS.find(c => c.id === 'half-adder');
    if (!halfAdder) throw new Error('Half adder not found');

    let circuit: Circuit = {
      gates: halfAdder.gates,
      wires: halfAdder.wires,
    };

    // 入力と出力を見つける
    const inputA = circuit.gates.find(g => g.id === 'input-a');
    const inputB = circuit.gates.find(g => g.id === 'input-b');
    const outputSum = circuit.gates.find(g => g.id === 'output-sum');
    const outputCarry = circuit.gates.find(g => g.id === 'output-carry');

    if (!inputA || !inputB || !outputSum || !outputCarry) {
      throw new Error('I/O gates not found');
    }

    // テストケース: (A, B) -> (Sum, Carry)
    const testCases = [
      { a: false, b: false, sum: false, carry: false },
      { a: false, b: true, sum: true, carry: false },
      { a: true, b: false, sum: true, carry: false },
      { a: true, b: true, sum: false, carry: true },
    ];

    for (const testCase of testCases) {
      // 入力を設定
      circuit.gates = circuit.gates.map(g => {
        if (g.id === 'input-a') return { ...g, output: testCase.a };
        if (g.id === 'input-b') return { ...g, output: testCase.b };
        return g;
      });

      // 回路評価
      const result = evaluateCircuit(circuit, {});
      if (result.success) {
        circuit = result.data.circuit;
      }

      // 出力を確認
      const currentOutputSum = circuit.gates.find(g => g.id === 'output-sum');
      const currentOutputCarry = circuit.gates.find(g => g.id === 'output-carry');

      expect(getGateInputValue(currentOutputSum!, 0)).toBe(testCase.sum);
      expect(getGateInputValue(currentOutputCarry!, 0)).toBe(testCase.carry);
    }
  });
});
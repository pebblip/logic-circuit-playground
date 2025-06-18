import { describe, it, expect } from 'vitest';
import { evaluateCircuit, defaultConfig, isSuccess } from '@/domain/simulation/core';
import type { Circuit } from '@/domain/simulation/core/types';
import { FEATURED_CIRCUITS } from '@/features/gallery/data/gallery';

describe('半加算器のシミュレーションテスト', () => {
  it('初期状態で半加算器が正しく動作する', () => {
    // ギャラリーから半加算器の定義を取得
    const halfAdderDef = FEATURED_CIRCUITS.find(c => c.id === 'half-adder');
    expect(halfAdderDef).toBeDefined();

    if (!halfAdderDef) return;

    // Circuit型に変換
    const circuit: Circuit = {
      gates: halfAdderDef.gates,
      wires: halfAdderDef.wires,
    };

    // シミュレーション実行
    const result = evaluateCircuit(circuit, defaultConfig);
    expect(isSuccess(result)).toBe(true);

    if (!isSuccess(result)) return;

    // 結果の確認
    const evaluatedCircuit = result.data.circuit;
    
    // ゲートを名前で取得
    const inputA = evaluatedCircuit.gates.find(g => g.id === 'input-a');
    const inputB = evaluatedCircuit.gates.find(g => g.id === 'input-b');
    const xorSum = evaluatedCircuit.gates.find(g => g.id === 'xor-sum');
    const andCarry = evaluatedCircuit.gates.find(g => g.id === 'and-carry');
    const outputSum = evaluatedCircuit.gates.find(g => g.id === 'output-sum');
    const outputCarry = evaluatedCircuit.gates.find(g => g.id === 'output-carry');

    expect(inputA).toBeDefined();
    expect(inputB).toBeDefined();
    expect(xorSum).toBeDefined();
    expect(andCarry).toBeDefined();
    expect(outputSum).toBeDefined();
    expect(outputCarry).toBeDefined();

    // 初期状態: 0 + 0 = 0 (carry: 0)
    console.log('inputA:', inputA);
    console.log('inputB:', inputB);
    console.log('xorSum:', xorSum);
    console.log('andCarry:', andCarry);
    console.log('outputSum:', outputSum);
    console.log('outputCarry:', outputCarry);

    expect(inputA?.output).toBe(false);
    expect(inputB?.output).toBe(false);
    expect(xorSum?.output).toBe(false);
    expect(andCarry?.output).toBe(false);
    expect(outputSum?.output).toBe(false);
    expect(outputCarry?.output).toBe(false);
  });

  it('入力を変更して半加算器が正しく動作する', () => {
    const halfAdderDef = FEATURED_CIRCUITS.find(c => c.id === 'half-adder');
    expect(halfAdderDef).toBeDefined();

    if (!halfAdderDef) return;

    // 入力Aを1に設定
    const modifiedGates = halfAdderDef.gates.map(gate => 
      gate.id === 'input-a' ? { ...gate, output: true } : gate
    );

    const circuit: Circuit = {
      gates: modifiedGates,
      wires: halfAdderDef.wires,
    };

    // シミュレーション実行
    const result = evaluateCircuit(circuit, defaultConfig);
    expect(isSuccess(result)).toBe(true);

    if (!isSuccess(result)) return;

    const evaluatedCircuit = result.data.circuit;
    
    const xorSum = evaluatedCircuit.gates.find(g => g.id === 'xor-sum');
    const andCarry = evaluatedCircuit.gates.find(g => g.id === 'and-carry');
    const outputSum = evaluatedCircuit.gates.find(g => g.id === 'output-sum');
    const outputCarry = evaluatedCircuit.gates.find(g => g.id === 'output-carry');

    // 1 + 0 = 1 (carry: 0)
    expect(xorSum?.output).toBe(true);
    expect(andCarry?.output).toBe(false);
    expect(outputSum?.output).toBe(true);
    expect(outputCarry?.output).toBe(false);
  });
});
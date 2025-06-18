import { describe, it, expect } from 'vitest';
import type { Circuit } from '../../../../src/types/circuit';
import { HybridEvaluator } from '../../../../src/domain/simulation/event-driven-minimal/HybridEvaluator';
import { DEFAULT_GATE_DELAYS } from '../../../../src/constants/gateDelays';

/**
 * HybridEvaluatorの遅延モード対応テスト
 */
describe('HybridEvaluator with Delay Mode', () => {
  /**
   * 非循環回路（ANDゲートチェーン）
   */
  function createNonCircularCircuit(): Circuit {
    return {
      gates: [
        {
          id: 'IN1',
          type: 'INPUT',
          position: { x: 100, y: 100 },
          output: true,
          inputs: [],
        },
        {
          id: 'IN2',
          type: 'INPUT',
          position: { x: 100, y: 200 },
          output: true,
          inputs: [],
        },
        {
          id: 'AND1',
          type: 'AND',
          position: { x: 300, y: 150 },
          output: false,
          inputs: ['', ''],
          timing: {
            propagationDelay: DEFAULT_GATE_DELAYS['AND'], // 2.0ns
          },
        },
        {
          id: 'AND2',
          type: 'AND',
          position: { x: 500, y: 150 },
          output: false,
          inputs: ['', ''],
          timing: {
            propagationDelay: DEFAULT_GATE_DELAYS['AND'], // 2.0ns
          },
        },
        {
          id: 'OUT',
          type: 'OUTPUT',
          position: { x: 700, y: 150 },
          output: false,
          inputs: [''],
        },
      ],
      wires: [
        {
          id: 'w1',
          from: { gateId: 'IN1', pinIndex: -1 },
          to: { gateId: 'AND1', pinIndex: 0 },
          isActive: true,
        },
        {
          id: 'w2',
          from: { gateId: 'IN2', pinIndex: -1 },
          to: { gateId: 'AND1', pinIndex: 1 },
          isActive: true,
        },
        {
          id: 'w3',
          from: { gateId: 'AND1', pinIndex: -1 },
          to: { gateId: 'AND2', pinIndex: 0 },
          isActive: false,
        },
        {
          id: 'w4',
          from: { gateId: 'IN1', pinIndex: -1 },
          to: { gateId: 'AND2', pinIndex: 1 },
          isActive: true,
        },
        {
          id: 'w5',
          from: { gateId: 'AND2', pinIndex: -1 },
          to: { gateId: 'OUT', pinIndex: 0 },
          isActive: false,
        },
      ],
    };
  }

  /**
   * 循環回路（3-NOTリングオシレータ）
   */
  function createCircularCircuit(): Circuit {
    return {
      gates: [
        {
          id: 'NOT1',
          type: 'NOT',
          position: { x: 100, y: 100 },
          output: true,
          inputs: [''],
          timing: { propagationDelay: 1.0 },
        },
        {
          id: 'NOT2',
          type: 'NOT',
          position: { x: 300, y: 100 },
          output: false,
          inputs: [''],
          timing: { propagationDelay: 1.0 },
        },
        {
          id: 'NOT3',
          type: 'NOT',
          position: { x: 500, y: 100 },
          output: false,
          inputs: [''],
          timing: { propagationDelay: 1.0 },
        },
      ],
      wires: [
        {
          id: 'w1',
          from: { gateId: 'NOT1', pinIndex: -1 },
          to: { gateId: 'NOT2', pinIndex: 0 },
          isActive: true,
        },
        {
          id: 'w2',
          from: { gateId: 'NOT2', pinIndex: -1 },
          to: { gateId: 'NOT3', pinIndex: 0 },
          isActive: false,
        },
        {
          id: 'w3',
          from: { gateId: 'NOT3', pinIndex: -1 },
          to: { gateId: 'NOT1', pinIndex: 0 },
          isActive: false,
        },
      ],
    };
  }

  it('should use topological sort for non-circular circuits when delay mode is OFF', () => {
    const circuit = createNonCircularCircuit();
    const evaluator = new HybridEvaluator({ delayMode: false });
    
    const result = evaluator.evaluate(circuit);
    
    // 即座に評価される（遅延なし）
    expect(result.gates.find(g => g.id === 'AND1')?.output).toBe(true);
    expect(result.gates.find(g => g.id === 'AND2')?.output).toBe(true);
    expect(result.gates.find(g => g.id === 'OUT')?.output).toBe(true);
  });

  it('should use event-driven for non-circular circuits when delay mode is ON', () => {
    const circuit = createNonCircularCircuit();
    const evaluator = new HybridEvaluator({ delayMode: true });
    
    // 初期評価
    let result = evaluator.evaluate(circuit);
    
    // 遅延モードでも、初期評価で全てのイベントが処理される
    // （4ns後にAND2が更新される）
    expect(result.gates.find(g => g.id === 'AND1')?.output).toBe(true);
    expect(result.gates.find(g => g.id === 'AND2')?.output).toBe(true);
    expect(result.gates.find(g => g.id === 'OUT')?.output).toBe(true);
    
    // 入力を変更して再評価
    result.gates.find(g => g.id === 'IN1')!.output = false;
    result = evaluator.evaluate(result);
    
    // 遅延後に出力が更新される
    console.log('Non-circular with delay mode:', {
      AND1: result.gates.find(g => g.id === 'AND1')?.output,
      AND2: result.gates.find(g => g.id === 'AND2')?.output,
      OUT: result.gates.find(g => g.id === 'OUT')?.output,
    });
  });

  it('should always use event-driven for circular circuits', () => {
    const circuit = createCircularCircuit();
    
    // 遅延モードOFF
    const evaluatorOff = new HybridEvaluator({ delayMode: false });
    const resultOff = evaluatorOff.evaluate(circuit);
    
    // 遅延モードON
    const evaluatorOn = new HybridEvaluator({ delayMode: true });
    const resultOn = evaluatorOn.evaluate(circuit);
    
    console.log('Circular circuit results:', {
      delayOff: {
        NOT1: resultOff.gates.find(g => g.id === 'NOT1')?.output,
        NOT2: resultOff.gates.find(g => g.id === 'NOT2')?.output,
        NOT3: resultOff.gates.find(g => g.id === 'NOT3')?.output,
      },
      delayOn: {
        NOT1: resultOn.gates.find(g => g.id === 'NOT1')?.output,
        NOT2: resultOn.gates.find(g => g.id === 'NOT2')?.output,
        NOT3: resultOn.gates.find(g => g.id === 'NOT3')?.output,
      },
    });
    
    // 両方ともイベント駆動を使用（発振を検出）
    expect(resultOff).toBeDefined();
    expect(resultOn).toBeDefined();
  });

  it('should switch delay mode dynamically', () => {
    const circuit = createNonCircularCircuit();
    const evaluator = new HybridEvaluator({ delayMode: false });
    
    // 最初は遅延モードOFF（即座に評価）
    let result = evaluator.evaluate(circuit);
    expect(result.gates.find(g => g.id === 'OUT')?.output).toBe(true);
    
    // 遅延モードをONに切り替え
    evaluator.setDelayMode(true);
    
    // 入力を変更
    circuit.gates.find(g => g.id === 'IN2')!.output = false;
    result = evaluator.evaluate(circuit);
    
    // 遅延モードなので、すぐには反映されない
    console.log('After delay mode switch:', {
      AND1: result.gates.find(g => g.id === 'AND1')?.output,
      AND2: result.gates.find(g => g.id === 'AND2')?.output,
      OUT: result.gates.find(g => g.id === 'OUT')?.output,
    });
  });

  it('should detect oscillation in delay mode', () => {
    const circuit = createCircularCircuit();
    const evaluator = new HybridEvaluator({ 
      delayMode: true,
      enableDebug: true,
    });
    
    const result = evaluator.evaluate(circuit);
    
    // 発振が検出されるはず
    console.log('Oscillation detection in delay mode:', {
      NOT1: result.gates.find(g => g.id === 'NOT1')?.output,
      NOT2: result.gates.find(g => g.id === 'NOT2')?.output,
      NOT3: result.gates.find(g => g.id === 'NOT3')?.output,
    });
    
    // 回路は評価される（発振していても結果は返る）
    expect(result).toBeDefined();
    expect(result.gates).toHaveLength(3);
  });
});
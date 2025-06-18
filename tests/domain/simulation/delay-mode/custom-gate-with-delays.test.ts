import { describe, it, expect } from 'vitest';
import type { Circuit, Gate, Wire, CustomGateDefinition } from '../../../../src/types/circuit';
import { EventDrivenEngine } from '../../../../src/domain/simulation/event-driven';
import { calculateCustomGateDelay } from '../../../../src/domain/simulation/delay/customGateDelay';
import { DEFAULT_GATE_DELAYS } from '../../../../src/constants/gateDelays';

/**
 * カスタムゲートの遅延モードテスト
 */
describe('Custom Gate with Delay Mode', () => {
  /**
   * 3-NANDによるORゲートのカスタムゲート定義
   * A OR B = NOT(NOT(A) AND NOT(B))
   * 遅延: NOT(1ns) -> NAND(1.5ns) -> 合計2.5ns
   */
  function createCustomOrGateDefinition(): CustomGateDefinition {
    return {
      id: 'custom-or',
      name: 'CUSTOM_OR',
      displayName: 'Custom OR',
      inputs: [
        { name: 'A', position: { x: 0, y: 30 } },
        { name: 'B', position: { x: 0, y: 50 } },
      ],
      outputs: [
        { name: 'Y', position: { x: 80, y: 40 } },
      ],
      truthTable: {
        '00': '0',
        '01': '1',
        '10': '1',
        '11': '1',
      },
      internalCircuit: {
        gates: [
          {
            id: 'IN_A',
            type: 'INPUT',
            position: { x: 0, y: 30 },
            output: false,
            inputs: [],
          },
          {
            id: 'IN_B',
            type: 'INPUT',
            position: { x: 0, y: 50 },
            output: false,
            inputs: [],
          },
          {
            id: 'NOT1',
            type: 'NOT',
            position: { x: 30, y: 30 },
            output: true,
            inputs: [''],
            timing: { propagationDelay: DEFAULT_GATE_DELAYS['NOT'] },
          },
          {
            id: 'NOT2',
            type: 'NOT',
            position: { x: 30, y: 50 },
            output: true,
            inputs: [''],
            timing: { propagationDelay: DEFAULT_GATE_DELAYS['NOT'] },
          },
          {
            id: 'NAND1',
            type: 'NAND',
            position: { x: 60, y: 40 },
            output: true,
            inputs: ['', ''],
            timing: { propagationDelay: DEFAULT_GATE_DELAYS['NAND'] },
          },
          {
            id: 'OUT_Y',
            type: 'OUTPUT',
            position: { x: 90, y: 40 },
            output: true,
            inputs: [''],
          },
        ],
        wires: [
          { id: 'w1', from: { gateId: 'IN_A', pinIndex: -1 }, to: { gateId: 'NOT1', pinIndex: 0 }, isActive: false },
          { id: 'w2', from: { gateId: 'IN_B', pinIndex: -1 }, to: { gateId: 'NOT2', pinIndex: 0 }, isActive: false },
          { id: 'w3', from: { gateId: 'NOT1', pinIndex: -1 }, to: { gateId: 'NAND1', pinIndex: 0 }, isActive: true },
          { id: 'w4', from: { gateId: 'NOT2', pinIndex: -1 }, to: { gateId: 'NAND1', pinIndex: 1 }, isActive: true },
          { id: 'w5', from: { gateId: 'NAND1', pinIndex: -1 }, to: { gateId: 'OUT_Y', pinIndex: 0 }, isActive: true },
        ],
        inputMappings: {
          0: { gateId: 'IN_A', pinIndex: 0 },
          1: { gateId: 'IN_B', pinIndex: 0 },
        },
        outputMappings: {
          0: { gateId: 'NAND1', pinIndex: -1 },
        },
      },
      backgroundColor: '#E8F5E9',
      iconColor: '#2E7D32',
      pinPositions: {
        inputs: [
          { x: 0, y: 30 },
          { x: 0, y: 50 },
        ],
        outputs: [
          { x: 80, y: 40 },
        ],
      },
    };
  }

  /**
   * カスタムゲートを使用する回路
   */
  function createCircuitWithCustomGate(): Circuit {
    const customOrDef = createCustomOrGateDefinition();
    
    return {
      gates: [
        {
          id: 'IN1',
          type: 'INPUT',
          position: { x: 100, y: 100 },
          output: false,
          inputs: [],
        },
        {
          id: 'IN2',
          type: 'INPUT',
          position: { x: 100, y: 200 },
          output: false,
          inputs: [],
        },
        {
          id: 'CUSTOM1',
          type: 'CUSTOM',
          position: { x: 300, y: 150 },
          output: false,
          inputs: ['', ''],
          customGateDefinition: customOrDef,
        },
        {
          id: 'OUT',
          type: 'OUTPUT',
          position: { x: 500, y: 150 },
          output: false,
          inputs: [''],
        },
      ],
      wires: [
        {
          id: 'w1',
          from: { gateId: 'IN1', pinIndex: -1 },
          to: { gateId: 'CUSTOM1', pinIndex: 0 },
          isActive: false,
        },
        {
          id: 'w2',
          from: { gateId: 'IN2', pinIndex: -1 },
          to: { gateId: 'CUSTOM1', pinIndex: 1 },
          isActive: false,
        },
        {
          id: 'w3',
          from: { gateId: 'CUSTOM1', pinIndex: -1 },
          to: { gateId: 'OUT', pinIndex: 0 },
          isActive: false,
        },
      ],
    };
  }

  it('should calculate custom gate delay from internal circuit', () => {
    const customOrDef = createCustomOrGateDefinition();
    const delayInfo = calculateCustomGateDelay(customOrDef);
    
    expect(delayInfo).toBeDefined();
    expect(delayInfo!.maxDelay).toBe(2.5); // NOT(1ns) + NAND(1.5ns) = 2.5ns
    expect(delayInfo!.criticalPaths).toHaveLength(2); // 2 inputs × 1 output
    
    // 両方の入力から出力へのパスは同じ遅延
    expect(delayInfo!.criticalPaths[0].totalDelay).toBe(2.5);
    expect(delayInfo!.criticalPaths[1].totalDelay).toBe(2.5);
  });

  it('should evaluate custom gate with propagation delay', () => {
    const circuit = createCircuitWithCustomGate();
    const engine = new EventDrivenEngine({
      delayMode: true,
      enableDebug: true,
      maxDeltaCycles: 100,
    });
    
    console.log('\\n=== Custom Gate Delay Test (both inputs LOW) ===');
    let result = engine.evaluate(circuit);
    
    // 初期状態：両入力がLOW → 出力もLOW
    const customGate = result.finalState.gateStates.get('CUSTOM1');
    const outGate = result.finalState.gateStates.get('OUT');
    
    expect(customGate?.outputs[0]).toBe(false);
    expect(outGate?.outputs[0]).toBe(false);
    
    console.log(`Initial state: IN1=0, IN2=0, CUSTOM_OR=0, OUT=0`);
    console.log(`Simulation time: ${result.finalState.currentTime}ns`);
    
    // IN1をHIGHに変更
    circuit.gates.find(g => g.id === 'IN1')!.output = true;
    
    console.log('\\n=== Setting IN1 to HIGH ===');
    result = engine.evaluate(circuit);
    
    // カスタムゲートの遅延後に出力が変化
    const customGateAfter = result.finalState.gateStates.get('CUSTOM1');
    const outGateAfter = result.finalState.gateStates.get('OUT');
    
    expect(customGateAfter?.outputs[0]).toBe(true);
    expect(outGateAfter?.outputs[0]).toBe(true);
    
    console.log(`After change: IN1=1, IN2=0, CUSTOM_OR=1, OUT=1`);
    console.log(`Simulation time: ${result.finalState.currentTime}ns`);
    console.log(`Events processed: ${result.cycleCount}`);
  });

  it('should handle cascaded custom gates', () => {
    const customOrDef = createCustomOrGateDefinition();
    
    // 2つのカスタムORゲートを直列接続
    const circuit: Circuit = {
      gates: [
        {
          id: 'IN1',
          type: 'INPUT',
          position: { x: 100, y: 100 },
          output: false,
          inputs: [],
        },
        {
          id: 'IN2',
          type: 'INPUT',
          position: { x: 100, y: 150 },
          output: false,
          inputs: [],
        },
        {
          id: 'IN3',
          type: 'INPUT',
          position: { x: 100, y: 200 },
          output: false,
          inputs: [],
        },
        {
          id: 'CUSTOM1',
          type: 'CUSTOM',
          position: { x: 250, y: 125 },
          output: false,
          inputs: ['', ''],
          customGateDefinition: customOrDef,
        },
        {
          id: 'CUSTOM2',
          type: 'CUSTOM',
          position: { x: 400, y: 150 },
          output: false,
          inputs: ['', ''],
          customGateDefinition: customOrDef,
        },
        {
          id: 'OUT',
          type: 'OUTPUT',
          position: { x: 550, y: 150 },
          output: false,
          inputs: [''],
        },
      ],
      wires: [
        { id: 'w1', from: { gateId: 'IN1', pinIndex: -1 }, to: { gateId: 'CUSTOM1', pinIndex: 0 }, isActive: false },
        { id: 'w2', from: { gateId: 'IN2', pinIndex: -1 }, to: { gateId: 'CUSTOM1', pinIndex: 1 }, isActive: false },
        { id: 'w3', from: { gateId: 'CUSTOM1', pinIndex: -1 }, to: { gateId: 'CUSTOM2', pinIndex: 0 }, isActive: false },
        { id: 'w4', from: { gateId: 'IN3', pinIndex: -1 }, to: { gateId: 'CUSTOM2', pinIndex: 1 }, isActive: false },
        { id: 'w5', from: { gateId: 'CUSTOM2', pinIndex: -1 }, to: { gateId: 'OUT', pinIndex: 0 }, isActive: false },
      ],
    };
    
    const engine = new EventDrivenEngine({
      delayMode: true,
      enableDebug: false,
      maxDeltaCycles: 100,
    });
    
    console.log('\\n=== Cascaded Custom Gates Test ===');
    
    // IN1をHIGHに変更
    circuit.gates.find(g => g.id === 'IN1')!.output = true;
    
    const result = engine.evaluate(circuit);
    
    // 2つのカスタムゲートの遅延が加算される
    // CUSTOM1: 2.5ns, CUSTOM2: 2.5ns → 合計5ns
    expect(result.finalState.currentTime).toBeGreaterThanOrEqual(5.0);
    
    const outGate = result.finalState.gateStates.get('OUT');
    expect(outGate?.outputs[0]).toBe(true);
    
    console.log(`Cascaded delay: ${result.finalState.currentTime}ns`);
    console.log(`Expected: ≥5.0ns (2.5ns × 2)`);
  });

  it('should compare custom gate vs built-in gate timing', () => {
    const customOrDef = createCustomOrGateDefinition();
    
    // カスタムORゲートと通常のORゲートを比較
    const circuit: Circuit = {
      gates: [
        {
          id: 'IN1',
          type: 'INPUT',
          position: { x: 100, y: 100 },
          output: false,
          inputs: [],
        },
        {
          id: 'IN2',
          type: 'INPUT',
          position: { x: 100, y: 200 },
          output: false,
          inputs: [],
        },
        {
          id: 'CUSTOM_OR',
          type: 'CUSTOM',
          position: { x: 300, y: 100 },
          output: false,
          inputs: ['', ''],
          customGateDefinition: customOrDef,
        },
        {
          id: 'BUILTIN_OR',
          type: 'OR',
          position: { x: 300, y: 200 },
          output: false,
          inputs: ['', ''],
          timing: { propagationDelay: DEFAULT_GATE_DELAYS['OR'] },
        },
        {
          id: 'OUT_CUSTOM',
          type: 'OUTPUT',
          position: { x: 500, y: 100 },
          output: false,
          inputs: [''],
        },
        {
          id: 'OUT_BUILTIN',
          type: 'OUTPUT',
          position: { x: 500, y: 200 },
          output: false,
          inputs: [''],
        },
      ],
      wires: [
        // カスタムORへの接続
        { id: 'w1', from: { gateId: 'IN1', pinIndex: -1 }, to: { gateId: 'CUSTOM_OR', pinIndex: 0 }, isActive: false },
        { id: 'w2', from: { gateId: 'IN2', pinIndex: -1 }, to: { gateId: 'CUSTOM_OR', pinIndex: 1 }, isActive: false },
        { id: 'w3', from: { gateId: 'CUSTOM_OR', pinIndex: -1 }, to: { gateId: 'OUT_CUSTOM', pinIndex: 0 }, isActive: false },
        // 通常のORへの接続
        { id: 'w4', from: { gateId: 'IN1', pinIndex: -1 }, to: { gateId: 'BUILTIN_OR', pinIndex: 0 }, isActive: false },
        { id: 'w5', from: { gateId: 'IN2', pinIndex: -1 }, to: { gateId: 'BUILTIN_OR', pinIndex: 1 }, isActive: false },
        { id: 'w6', from: { gateId: 'BUILTIN_OR', pinIndex: -1 }, to: { gateId: 'OUT_BUILTIN', pinIndex: 0 }, isActive: false },
      ],
    };
    
    const engine = new EventDrivenEngine({
      delayMode: true,
      enableDebug: true,
      maxDeltaCycles: 100,
    });
    
    console.log('\\n=== Custom OR vs Built-in OR Timing ===');
    
    // IN1をHIGHに変更
    circuit.gates.find(g => g.id === 'IN1')!.output = true;
    
    const result = engine.evaluate(circuit);
    
    // 両方の出力を確認
    const customOut = result.finalState.gateStates.get('OUT_CUSTOM');
    const builtinOut = result.finalState.gateStates.get('OUT_BUILTIN');
    
    // 両方とも出力はtrueになるはず
    expect(customOut?.outputs[0]).toBe(true);
    expect(builtinOut?.outputs[0]).toBe(true);
    
    // シミュレーション時間から遅延を推測
    console.log(`Final simulation time: ${result.finalState.currentTime}ns`);
    console.log(`Custom OR expected delay: 2.5ns`);
    console.log(`Built-in OR expected delay: ${DEFAULT_GATE_DELAYS['OR']}ns`);
    
    // カスタムゲートの方が遅延が大きいため、最終的なシミュレーション時間は2.5ns以上になるはず
    expect(result.finalState.currentTime).toBeGreaterThanOrEqual(2.5);
  });

  it('should handle custom gate with feedback loop', () => {
    // フィードバックループを持つカスタムゲート（簡易SR-LATCH）
    const customSRLatchDef: CustomGateDefinition = {
      id: 'custom-sr-latch',
      name: 'CUSTOM_SR_LATCH',
      displayName: 'Custom SR-LATCH',
      inputs: [
        { name: 'S', position: { x: 0, y: 30 } },
        { name: 'R', position: { x: 0, y: 50 } },
      ],
      outputs: [
        { name: 'Q', position: { x: 80, y: 30 } },
        { name: 'Q̄', position: { x: 80, y: 50 } },
      ],
      truthTable: {
        '00': '**', // 保持
        '01': '01', // リセット
        '10': '10', // セット
        '11': '**', // 不定
      },
      internalCircuit: {
        gates: [
          { id: 'IN_S', type: 'INPUT', position: { x: 0, y: 30 }, output: false, inputs: [] },
          { id: 'IN_R', type: 'INPUT', position: { x: 0, y: 50 }, output: false, inputs: [] },
          {
            id: 'NAND1',
            type: 'NAND',
            position: { x: 50, y: 30 },
            output: true,
            inputs: ['', ''],
            timing: { propagationDelay: DEFAULT_GATE_DELAYS['NAND'] },
          },
          {
            id: 'NAND2',
            type: 'NAND',
            position: { x: 50, y: 50 },
            output: false,
            inputs: ['', ''],
            timing: { propagationDelay: DEFAULT_GATE_DELAYS['NAND'] },
          },
          { id: 'OUT_Q', type: 'OUTPUT', position: { x: 100, y: 30 }, output: true, inputs: [''] },
          { id: 'OUT_QBAR', type: 'OUTPUT', position: { x: 100, y: 50 }, output: false, inputs: [''] },
        ],
        wires: [
          { id: 'w1', from: { gateId: 'IN_S', pinIndex: -1 }, to: { gateId: 'NAND1', pinIndex: 0 }, isActive: false },
          { id: 'w2', from: { gateId: 'NAND2', pinIndex: -1 }, to: { gateId: 'NAND1', pinIndex: 1 }, isActive: false },
          { id: 'w3', from: { gateId: 'IN_R', pinIndex: -1 }, to: { gateId: 'NAND2', pinIndex: 1 }, isActive: false },
          { id: 'w4', from: { gateId: 'NAND1', pinIndex: -1 }, to: { gateId: 'NAND2', pinIndex: 0 }, isActive: true },
          { id: 'w5', from: { gateId: 'NAND1', pinIndex: -1 }, to: { gateId: 'OUT_Q', pinIndex: 0 }, isActive: true },
          { id: 'w6', from: { gateId: 'NAND2', pinIndex: -1 }, to: { gateId: 'OUT_QBAR', pinIndex: 0 }, isActive: false },
        ],
        inputMappings: {
          0: { gateId: 'IN_S', pinIndex: 0 },
          1: { gateId: 'IN_R', pinIndex: 0 },
        },
        outputMappings: {
          0: { gateId: 'NAND1', pinIndex: -1 },
          1: { gateId: 'NAND2', pinIndex: -1 },
        },
      },
      backgroundColor: '#FFF3E0',
      iconColor: '#E65100',
      pinPositions: {
        inputs: [
          { x: 0, y: 30 },
          { x: 0, y: 50 },
        ],
        outputs: [
          { x: 80, y: 30 },
          { x: 80, y: 50 },
        ],
      },
    };
    
    const delayInfo = calculateCustomGateDelay(customSRLatchDef);
    
    console.log('\\n=== Custom SR-LATCH Delay Analysis ===');
    console.log(`Critical paths found: ${delayInfo?.criticalPaths.length || 0}`);
    
    if (delayInfo) {
      console.log(`Max delay: ${delayInfo.maxDelay}ns`);
      console.log(`Min delay: ${delayInfo.minDelay}ns`);
      console.log(`Average delay: ${delayInfo.avgDelay}ns`);
      
      // SR-LATCHは内部にフィードバックループがあるため、
      // 単純なパス計算では正確な遅延を決定できない
      expect(delayInfo.maxDelay).toBeGreaterThanOrEqual(DEFAULT_GATE_DELAYS['NAND']);
    }
  });
});
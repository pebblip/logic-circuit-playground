/**
 * D-FFのエッジ検出テスト
 * クロックエッジ検出とメタデータ更新の詳細なテスト
 */

import { describe, test, expect } from 'vitest';
import { EnhancedHybridEvaluator } from '@/domain/simulation/event-driven-minimal/EnhancedHybridEvaluator';
import type { Gate, Wire } from '@/types/circuit';

describe('D-FFエッジ検出テスト', () => {
  function createSimpleD_FFCircuit(): { gates: Gate[], wires: Wire[] } {
    const gates: Gate[] = [
      {
        id: 'clock',
        type: 'CLOCK',
        position: { x: 100, y: 200 },
        output: false,
        inputs: [],
        metadata: { frequency: 1, isRunning: true, startTime: Date.now() },
      },
      {
        id: 'input_d',
        type: 'INPUT',
        position: { x: 100, y: 100 },
        output: true, // D=1に固定
        inputs: [],
      },
      {
        id: 'dff',
        type: 'D-FF',
        position: { x: 300, y: 150 },
        output: false,
        inputs: ['', ''],
        metadata: { qOutput: false, previousClockState: false },
      },
      {
        id: 'output_q',
        type: 'OUTPUT',
        position: { x: 500, y: 150 },
        output: false,
        inputs: [''],
      },
    ];

    const wires: Wire[] = [
      {
        id: 'wire_d',
        from: { gateId: 'input_d', pinIndex: -1 },
        to: { gateId: 'dff', pinIndex: 0 },
        isActive: false,
      },
      {
        id: 'wire_clk',
        from: { gateId: 'clock', pinIndex: -1 },
        to: { gateId: 'dff', pinIndex: 1 },
        isActive: false,
      },
      {
        id: 'wire_q',
        from: { gateId: 'dff', pinIndex: -1 },
        to: { gateId: 'output_q', pinIndex: 0 },
        isActive: false,
      },
    ];

    return { gates, wires };
  }

  test('初期状態でのD-FF状態確認', () => {
    const { gates, wires } = createSimpleD_FFCircuit();
    const evaluator = new EnhancedHybridEvaluator({
      strategy: 'AUTO_SELECT',
      enableDebugLogging: false,
    });

    const result = evaluator.evaluate({ gates, wires });
    const dff = result.circuit.gates.find(g => g.id === 'dff')!;

    console.log('初期状態のD-FF:', {
      output: dff.output,
      qOutput: dff.metadata?.qOutput,
      previousClockState: dff.metadata?.previousClockState,
    });

    // 初期状態ではクロックが0なので出力は変化しない
    expect(dff.metadata?.qOutput).toBe(false);
    expect(dff.metadata?.previousClockState).toBe(false);
  });

  test('クロック立ち上がりエッジでのD-FF動作', () => {
    const { gates, wires } = createSimpleD_FFCircuit();
    const evaluator = new EnhancedHybridEvaluator({
      strategy: 'AUTO_SELECT',
      enableDebugLogging: true,
    });

    // Phase 1: Clock Low
    let clockGate = gates.find(g => g.id === 'clock')!;
    clockGate.output = false;
    
    let result = evaluator.evaluate({ gates: [...gates], wires: [...wires] });
    let dff = result.circuit.gates.find(g => g.id === 'dff')!;
    
    console.log('Phase 1 (Clock Low):', {
      clock: result.circuit.gates.find(g => g.id === 'clock')!.output,
      d: result.circuit.gates.find(g => g.id === 'input_d')!.output,
      dff_output: dff.output,
      qOutput: dff.metadata?.qOutput,
      previousClockState: dff.metadata?.previousClockState,
    });

    // Phase 2: Clock High (立ち上がりエッジ)
    const updatedGates = result.circuit.gates.map(g => 
      g.id === 'clock' ? { ...g, output: true } : g
    );
    
    result = evaluator.evaluate({ gates: updatedGates, wires: result.circuit.wires });
    dff = result.circuit.gates.find(g => g.id === 'dff')!;

    console.log('Phase 2 (Clock High - 立ち上がりエッジ):', {
      clock: result.circuit.gates.find(g => g.id === 'clock')!.output,
      d: result.circuit.gates.find(g => g.id === 'input_d')!.output,
      dff_output: dff.output,
      qOutput: dff.metadata?.qOutput,
      previousClockState: dff.metadata?.previousClockState,
    });

    // 立ち上がりエッジでD=1がQ出力に反映されるべき
    expect(dff.metadata?.qOutput).toBe(true);
    expect(dff.output).toBe(true); // outputとqOutputが一致するべき
    expect(dff.metadata?.previousClockState).toBe(true);
  });

  test('複数サイクルでのD-FF動作', () => {
    const { gates, wires } = createSimpleD_FFCircuit();
    const evaluator = new EnhancedHybridEvaluator({
      strategy: 'AUTO_SELECT',
      enableDebugLogging: false,
    });

    let currentGates = [...gates];
    let currentWires = [...wires];

    // 3回のクロックサイクルをテスト
    for (let cycle = 0; cycle < 3; cycle++) {
      console.log(`\n=== サイクル ${cycle + 1} ===`);
      
      // Low phase
      const clockGate = currentGates.find(g => g.id === 'clock')!;
      clockGate.output = false;
      let result = evaluator.evaluate({ gates: currentGates, wires: currentWires });
      currentGates = [...result.circuit.gates];
      currentWires = [...result.circuit.wires];

      let dff = currentGates.find(g => g.id === 'dff')!;
      console.log('Low phase:', {
        qOutput: dff.metadata?.qOutput,
        output: dff.output,
        previousClockState: dff.metadata?.previousClockState,
      });

      // High phase (立ち上がりエッジ)
      const clockGateHigh = currentGates.find(g => g.id === 'clock')!;
      clockGateHigh.output = true;
      result = evaluator.evaluate({ gates: currentGates, wires: currentWires });
      currentGates = [...result.circuit.gates];
      currentWires = [...result.circuit.wires];

      dff = currentGates.find(g => g.id === 'dff')!;
      console.log('High phase:', {
        qOutput: dff.metadata?.qOutput,
        output: dff.output,
        previousClockState: dff.metadata?.previousClockState,
      });

      // D=1が常に入力されているので、各サイクルでQ=1になるべき
      expect(dff.metadata?.qOutput).toBe(true);
      expect(dff.output).toBe(true);
    }
  });
});
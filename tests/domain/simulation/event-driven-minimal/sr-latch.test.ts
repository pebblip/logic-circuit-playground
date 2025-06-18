import { describe, it, expect } from 'vitest';
import type { Circuit } from '../../../../src/types/circuit';
import { 
  MinimalEventDrivenEngine,
  CircuitAnalyzer,
  HybridEvaluator 
} from '../../../../src/domain/simulation/event-driven-minimal';

describe('SR Latch with NOR gates (Event-Driven)', () => {
  /**
   * SR Latch回路を作成（NORゲート版）
   * 正しい接続：
   * - S → NOR2（Q̄側）の入力
   * - R → NOR1（Q側）の入力
   * - NOR1の出力 → Q
   * - NOR2の出力 → Q̄
   * - クロスカップリング
   */
  function createSRLatchCircuit(): Circuit {
    return {
      gates: [
        // 入力
        {
          id: 'S',
          type: 'INPUT',
          position: { x: 100, y: 100 },
          output: false,
          inputs: [],
        },
        {
          id: 'R',
          type: 'INPUT',
          position: { x: 100, y: 200 },
          output: false,
          inputs: [],
        },
        // NORゲート
        {
          id: 'NOR1',
          type: 'NOR',
          position: { x: 300, y: 100 },
          output: false,
          inputs: ['', ''],
        },
        {
          id: 'NOR2',
          type: 'NOR',
          position: { x: 300, y: 200 },
          output: false,
          inputs: ['', ''],
        },
        // 出力
        {
          id: 'Q',
          type: 'OUTPUT',
          position: { x: 500, y: 100 },
          output: false,
          inputs: [''],
        },
        {
          id: 'Q_BAR',
          type: 'OUTPUT',
          position: { x: 500, y: 200 },
          output: false,
          inputs: [''],
        },
      ],
      wires: [
        // R → NOR1（Q側）の1番目の入力
        {
          id: 'w1',
          from: { gateId: 'R', pinIndex: -1 },
          to: { gateId: 'NOR1', pinIndex: 0 },
          isActive: false,
        },
        // S → NOR2（Q̄側）の1番目の入力
        {
          id: 'w2',
          from: { gateId: 'S', pinIndex: -1 },
          to: { gateId: 'NOR2', pinIndex: 0 },
          isActive: false,
        },
        // NOR1 → Q
        {
          id: 'w3',
          from: { gateId: 'NOR1', pinIndex: -1 },
          to: { gateId: 'Q', pinIndex: 0 },
          isActive: false,
        },
        // NOR2 → Q_BAR
        {
          id: 'w4',
          from: { gateId: 'NOR2', pinIndex: -1 },
          to: { gateId: 'Q_BAR', pinIndex: 0 },
          isActive: false,
        },
        // クロスカップリング: NOR1 → NOR2
        {
          id: 'w5',
          from: { gateId: 'NOR1', pinIndex: -1 },
          to: { gateId: 'NOR2', pinIndex: 1 },
          isActive: false,
        },
        // クロスカップリング: NOR2 → NOR1
        {
          id: 'w6',
          from: { gateId: 'NOR2', pinIndex: -1 },
          to: { gateId: 'NOR1', pinIndex: 1 },
          isActive: false,
        },
      ],
    };
  }

  it('should detect circular dependency in SR Latch', () => {
    const circuit = createSRLatchCircuit();
    const hasCircular = CircuitAnalyzer.hasCircularDependency(circuit);
    
    expect(hasCircular).toBe(true);
  });

  it('should identify circular gates', () => {
    const circuit = createSRLatchCircuit();
    const circularGates = CircuitAnalyzer.findCircularGates(circuit);
    
    expect(circularGates).toContain('NOR1');
    expect(circularGates).toContain('NOR2');
  });

  it('should use event-driven simulation for SR Latch', () => {
    const circuit = createSRLatchCircuit();
    const evaluator = new HybridEvaluator();
    
    const mode = evaluator.getCurrentMode(circuit);
    expect(mode).toBe('event-driven');
  });

  it('should simulate SR Latch Set operation', () => {
    const circuit = createSRLatchCircuit();
    const engine = new MinimalEventDrivenEngine({ 
      enableDebug: true,
      maxDeltaCycles: 10,  // 発振を早めに検出
    });
    
    // Set S=1, R=0
    const sGate = circuit.gates.find(g => g.id === 'S')!;
    const rGate = circuit.gates.find(g => g.id === 'R')!;
    sGate.output = true;
    rGate.output = false;
    
    const result = engine.evaluate(circuit);
    
    // Debug output
    console.log('SR Latch Set Test Result:', {
      success: result.success,
      cycleCount: result.cycleCount,
      hasOscillation: result.hasOscillation,
    });
    
    if (result.debugTrace) {
      console.log('Debug Trace:');
      result.debugTrace.forEach(trace => {
        console.log(`  ${trace.time}: ${trace.event}`, trace.details);
      });
    }
    
    // Log gate states
    circuit.gates.forEach(gate => {
      console.log(`Gate ${gate.id}: output=${gate.output}, outputs=${JSON.stringify(gate.outputs)}`);
    });
    
    expect(result.success).toBe(true);
    expect(result.hasOscillation).toBe(false);
    
    // Check outputs
    const qGate = circuit.gates.find(g => g.id === 'Q')!;
    const qBarGate = circuit.gates.find(g => g.id === 'Q_BAR')!;
    
    expect(qGate.output).toBe(true); // Q = 1
    expect(qBarGate.output).toBe(false); // Q̄ = 0
  });

  it('should simulate SR Latch Reset operation', () => {
    const circuit = createSRLatchCircuit();
    const engine = new MinimalEventDrivenEngine();
    
    // Reset S=0, R=1
    const sGate = circuit.gates.find(g => g.id === 'S')!;
    const rGate = circuit.gates.find(g => g.id === 'R')!;
    sGate.output = false;
    rGate.output = true;
    
    engine.evaluate(circuit);
    
    // Check outputs
    const qGate = circuit.gates.find(g => g.id === 'Q')!;
    const qBarGate = circuit.gates.find(g => g.id === 'Q_BAR')!;
    
    expect(qGate.output).toBe(false); // Q = 0
    expect(qBarGate.output).toBe(true); // Q̄ = 1
  });

  it('should hold state when S=0, R=0', () => {
    const circuit = createSRLatchCircuit();
    const engine = new MinimalEventDrivenEngine();
    
    // First set the latch
    const sGate = circuit.gates.find(g => g.id === 'S')!;
    const rGate = circuit.gates.find(g => g.id === 'R')!;
    sGate.output = true;
    rGate.output = false;
    engine.evaluate(circuit);
    
    const qGate = circuit.gates.find(g => g.id === 'Q')!;
    expect(qGate.output).toBe(true);
    
    // Then hold (S=0, R=0)
    sGate.output = false;
    rGate.output = false;
    engine.evaluate(circuit);
    
    // Should maintain previous state
    expect(qGate.output).toBe(true);
  });

  it('should handle forbidden state S=1, R=1', () => {
    const circuit = createSRLatchCircuit();
    const engine = new MinimalEventDrivenEngine();
    
    // Forbidden state
    const sGate = circuit.gates.find(g => g.id === 'S')!;
    const rGate = circuit.gates.find(g => g.id === 'R')!;
    sGate.output = true;
    rGate.output = true;
    
    const result = engine.evaluate(circuit);
    
    // Should not oscillate
    expect(result.success).toBe(true);
    expect(result.hasOscillation).toBe(false);
    
    // Both outputs should be false (NOR logic)
    const qGate = circuit.gates.find(g => g.id === 'Q')!;
    const qBarGate = circuit.gates.find(g => g.id === 'Q_BAR')!;
    expect(qGate.output).toBe(false);
    expect(qBarGate.output).toBe(false);
  });
});
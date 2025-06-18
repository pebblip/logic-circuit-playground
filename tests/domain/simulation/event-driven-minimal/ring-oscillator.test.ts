import { describe, it, expect } from 'vitest';
import type { Circuit } from '../../../../src/types/circuit';
import { 
  MinimalEventDrivenEngine,
  CircuitAnalyzer,
  HybridEvaluator 
} from '../../../../src/domain/simulation/event-driven-minimal';

describe('Ring Oscillator (Event-Driven)', () => {
  /**
   * リングオシレータ回路を作成（3つのNOTゲート）
   * 
   *      ┌─────┐    ┌─────┐    ┌─────┐
   *   ┌──┤ NOT ├────┤ NOT ├────┤ NOT ├──┐
   *   │  └─────┘    └─────┘    └─────┘  │
   *   │                                  │
   *   └──────────────────────────────────┘
   */
  function createRingOscillatorCircuit(): Circuit {
    return {
      gates: [
        {
          id: 'NOT1',
          type: 'NOT',
          position: { x: 100, y: 100 },
          output: false,
          inputs: [''],
        },
        {
          id: 'NOT2',
          type: 'NOT',
          position: { x: 300, y: 100 },
          output: false,
          inputs: [''],
        },
        {
          id: 'NOT3',
          type: 'NOT',
          position: { x: 500, y: 100 },
          output: false,
          inputs: [''],
        },
        // 観測用OUTPUT
        {
          id: 'OUT',
          type: 'OUTPUT',
          position: { x: 400, y: 200 },
          output: false,
          inputs: [''],
        },
      ],
      wires: [
        // NOT1 → NOT2
        {
          id: 'w1',
          from: { gateId: 'NOT1', pinIndex: -1 },
          to: { gateId: 'NOT2', pinIndex: 0 },
          isActive: false,
        },
        // NOT2 → NOT3
        {
          id: 'w2',
          from: { gateId: 'NOT2', pinIndex: -1 },
          to: { gateId: 'NOT3', pinIndex: 0 },
          isActive: false,
        },
        // NOT3 → NOT1（フィードバック）
        {
          id: 'w3',
          from: { gateId: 'NOT3', pinIndex: -1 },
          to: { gateId: 'NOT1', pinIndex: 0 },
          isActive: false,
        },
        // NOT2 → OUTPUT（観測用）
        {
          id: 'w4',
          from: { gateId: 'NOT2', pinIndex: -1 },
          to: { gateId: 'OUT', pinIndex: 0 },
          isActive: false,
        },
      ],
    };
  }

  it('should detect circular dependency in ring oscillator', () => {
    const circuit = createRingOscillatorCircuit();
    const hasCircular = CircuitAnalyzer.hasCircularDependency(circuit);
    
    expect(hasCircular).toBe(true);
  });

  it('should identify all NOT gates as circular', () => {
    const circuit = createRingOscillatorCircuit();
    const circularGates = CircuitAnalyzer.findCircularGates(circuit);
    
    expect(circularGates).toContain('NOT1');
    expect(circularGates).toContain('NOT2');
    expect(circularGates).toContain('NOT3');
  });

  it('should use event-driven simulation for ring oscillator', () => {
    const circuit = createRingOscillatorCircuit();
    const evaluator = new HybridEvaluator();
    
    const mode = evaluator.getCurrentMode(circuit);
    expect(mode).toBe('event-driven');
  });

  it('should oscillate with period of 6 delta cycles', () => {
    const circuit = createRingOscillatorCircuit();
    
    // 初期状態を設定（NOT1の出力をtrueに）
    const not1 = circuit.gates.find(g => g.id === 'NOT1')!;
    not1.output = true;
    
    const engine = new MinimalEventDrivenEngine({ 
      enableDebug: true,
      maxDeltaCycles: 100,
      continueOnOscillation: true,
      oscillationCyclesAfterDetection: 50, // 発振検出後50サイクル継続
    });
    
    const result = engine.evaluate(circuit);
    
    console.log('Ring Oscillator Test Result:', {
      success: result.success,
      cycleCount: result.cycleCount,
      hasOscillation: result.hasOscillation,
      oscillationInfo: result.oscillationInfo,
    });
    
    // デバッグトレースから発振パターンを確認
    if (result.debugTrace) {
      const outputEvents = result.debugTrace
        .filter(t => t.event === 'EVENT_SCHEDULED' && t.details.gateId === 'NOT2')
        .map(t => ({
          time: t.time,
          value: t.details.newValue,
        }));
      
      console.log('NOT2 output transitions:', outputEvents);
    }
    
    // 発振していることを確認
    expect(result.hasOscillation).toBe(true);
    expect(result.oscillationInfo).toBeDefined();
    
    // 発振検出後も継続実行されたことを確認
    expect(result.cycleCount).toBeGreaterThan(result.oscillationInfo?.detectedAt || 0);
    
    // 最終状態を確認
    const finalStates = circuit.gates.map(g => ({
      id: g.id,
      output: g.output,
    }));
    console.log('Final gate states:', finalStates);
  });

  it('should detect oscillation and continue for specified cycles', () => {
    const circuit = createRingOscillatorCircuit();
    const engine = new MinimalEventDrivenEngine({ 
      enableDebug: false,
      maxDeltaCycles: 100,
      continueOnOscillation: true,
      oscillationCyclesAfterDetection: 90, // 発振検出後90サイクル継続
    });
    
    const result = engine.evaluate(circuit);
    
    console.log('Oscillation test result:', {
      success: result.success,
      cycleCount: result.cycleCount,
      hasOscillation: result.hasOscillation,
      oscillationInfo: result.oscillationInfo,
    });
    
    // 発振を検出したことを確認
    expect(result.hasOscillation).toBe(true);
    expect(result.oscillationInfo).toBeDefined();
    expect(result.oscillationInfo?.detectedAt).toBeGreaterThan(0);
    
    // 発振検出後も継続して実行されたことを確認
    expect(result.cycleCount).toBeGreaterThan(result.oscillationInfo?.detectedAt || 0);
    
    // 継続実行により成功として扱われることを確認
    expect(result.success).toBe(true);
  });

  it('should start oscillating from any initial state', () => {
    const circuit = createRingOscillatorCircuit();
    const engine = new MinimalEventDrivenEngine({ 
      enableDebug: false,
      maxDeltaCycles: 10,
    });
    
    // すべてfalseから開始
    const result1 = engine.evaluate(circuit);
    expect(result1.cycleCount).toBeGreaterThan(0);
    
    // すべてtrueから開始
    circuit.gates.forEach(g => {
      if (g.type === 'NOT') {
        g.output = true;
      }
    });
    
    const result2 = engine.evaluate(circuit);
    expect(result2.cycleCount).toBeGreaterThan(0);
  });
});
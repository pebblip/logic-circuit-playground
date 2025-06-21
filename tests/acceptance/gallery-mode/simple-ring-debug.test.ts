/**
 * シンプルリングオシレータのデバッグテスト
 * 循環依存検出と戦略選択の動作確認
 */

import { describe, it, expect } from 'vitest';
import { SIMPLE_RING_OSCILLATOR } from '@/features/gallery/data/simple-ring-oscillator';
import { CircuitAnalyzer } from '@/domain/simulation/event-driven-minimal/CircuitAnalyzer';
import { EnhancedHybridEvaluator } from '@/domain/simulation/event-driven-minimal';
import type { Circuit } from '@/domain/simulation/core/types';

describe('Simple Ring Oscillator Debug', () => {
  const circuit: Circuit = {
    gates: SIMPLE_RING_OSCILLATOR.gates,
    wires: SIMPLE_RING_OSCILLATOR.wires,
  };

  it('should have correct circuit structure', () => {
    console.log('🔍 Simple Ring Oscillator Structure:');
    console.log(`Gates: ${circuit.gates.length}`);
    console.log(`Wires: ${circuit.wires.length}`);
    
    circuit.gates.forEach(gate => {
      console.log(`  ${gate.id}: ${gate.type} at (${gate.position.x}, ${gate.position.y}) output=${gate.output}`);
    });
    
    circuit.wires.forEach(wire => {
      console.log(`  ${wire.id}: ${wire.from.gateId}[${wire.from.pinIndex}] → ${wire.to.gateId}[${wire.to.pinIndex}]`);
    });

    // 基本構造の確認
    expect(circuit.gates).toHaveLength(6); // 3 NOT + 3 OUTPUT
    expect(circuit.wires).toHaveLength(6); // 3 ring + 3 observation
  });

  it('should detect circular dependency', () => {
    const hasCircularDependency = CircuitAnalyzer.hasCircularDependency(circuit);
    const circularGates = CircuitAnalyzer.findCircularGates(circuit);
    
    console.log('🔄 Circular Dependency Analysis:');
    console.log(`Has circular dependency: ${hasCircularDependency}`);
    console.log(`Circular gates: [${circularGates.join(', ')}]`);
    
    // NOT1 → NOT2 → NOT3 → NOT1 の循環があるはず
    expect(hasCircularDependency).toBe(true);
    expect(circularGates).toContain('NOT1');
    expect(circularGates).toContain('NOT2');
    expect(circularGates).toContain('NOT3');
  });

  it('should select correct strategy based on useUnifiedCanvas logic', () => {
    // useUnifiedCanvas.tsの戦略選択ロジックをテスト
    const circuitTitle = SIMPLE_RING_OSCILLATOR.title || '';
    const isOscillatorCircuit = [
      'オシレータ', 'オシレーター', 'カオス', 'フィボナッチ', 
      'ジョンソン', 'LFSR', 'リング', 'マンダラ', 'メモリ'
    ].some(keyword => circuitTitle.includes(keyword));
    
    const isAnimationRequired = SIMPLE_RING_OSCILLATOR.simulationConfig?.needsAnimation;
    const hasCircularDependency = isOscillatorCircuit || isAnimationRequired;
    const strategy = hasCircularDependency ? 'EVENT_DRIVEN_ONLY' : 'AUTO_SELECT';
    
    console.log('🎯 Strategy Selection:');
    console.log(`Title: "${circuitTitle}"`);
    console.log(`Contains oscillator keywords: ${isOscillatorCircuit}`);
    console.log(`Needs animation: ${isAnimationRequired}`);
    console.log(`Has circular dependency (logic): ${hasCircularDependency}`);
    console.log(`Selected strategy: ${strategy}`);
    
    expect(strategy).toBe('EVENT_DRIVEN_ONLY');
  });

  it('should simulate properly with EVENT_DRIVEN_ONLY strategy', () => {
    const evaluator = new EnhancedHybridEvaluator({
      strategy: 'EVENT_DRIVEN_ONLY',
      delayMode: true,
      enableDebugLogging: true,
    });

    console.log('🔧 Testing simulation with EVENT_DRIVEN_ONLY + delayMode:');
    
    // 初期状態をログ
    console.log('Initial state:');
    circuit.gates.forEach(gate => {
      console.log(`  ${gate.id}: ${gate.output}`);
    });

    // 1回評価
    const result1 = evaluator.evaluate(circuit);
    console.log('After 1st evaluation:');
    result1.circuit.gates.forEach(gate => {
      console.log(`  ${gate.id}: ${gate.output}`);
    });

    // 2回目評価
    const result2 = evaluator.evaluate(result1.circuit);
    console.log('After 2nd evaluation:');
    result2.circuit.gates.forEach(gate => {
      console.log(`  ${gate.id}: ${gate.output}`);
    });

    // 3回目評価
    const result3 = evaluator.evaluate(result2.circuit);
    console.log('After 3rd evaluation:');
    result3.circuit.gates.forEach(gate => {
      console.log(`  ${gate.id}: ${gate.output}`);
    });

    // NOTゲートの出力が変化しているか確認
    const not1Initial = circuit.gates.find(g => g.id === 'NOT1')?.output;
    const not1After3 = result3.circuit.gates.find(g => g.id === 'NOT1')?.output;
    
    console.log(`NOT1 output change: ${not1Initial} → ${not1After3}`);
    
    // 少なくとも何かの変化があることを期待
    const hasAnyChange = result3.circuit.gates.some((gate, index) => {
      const originalGate = circuit.gates[index];
      return originalGate && originalGate.output !== gate.output;
    });
    
    console.log(`Has any output change: ${hasAnyChange}`);
    
    // イベント駆動では変化があるはず
    expect(hasAnyChange).toBe(true);
  });

  it('should test complexity analysis', () => {
    const complexity = CircuitAnalyzer.getCircuitComplexity(circuit);
    
    console.log('📊 Circuit Complexity:');
    console.log(`Gate count: ${complexity.gateCount}`);
    console.log(`Wire count: ${complexity.wireCount}`);
    console.log(`Feedback loops: ${complexity.feedbackLoops}`);
    console.log(`Max fan-out: ${complexity.maxFanOut}`);
    
    expect(complexity.gateCount).toBe(6);
    expect(complexity.wireCount).toBe(6);
    expect(complexity.feedbackLoops).toBeGreaterThan(0); // 循環があるはず
  });
});
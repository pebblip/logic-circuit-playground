/**
 * リングオシレータデータ構造検証
 * 
 * 目的: useCanvasを使わずにデータ構造のみを検証
 */

import { describe, it, expect } from 'vitest';
import { FEATURED_CIRCUITS } from '../../src/features/gallery/data/gallery';
import { getGlobalEvaluationService } from '../../src/domain/simulation/services/CircuitEvaluationService';
import { PURE_CIRCUITS } from '../../src/features/gallery/data/circuits-pure';

describe('Ring Oscillator Data Structure', () => {
  it('should have correct circuit metadata', () => {
    const ringOsc = FEATURED_CIRCUITS.find(c => c.id === 'simple-ring-oscillator')!;
    
    // 基本メタデータ
    expect(ringOsc).toBeDefined();
    expect(ringOsc.id).toBe('simple-ring-oscillator');
    expect(ringOsc.simulationConfig?.needsAnimation).toBe(true);
    expect(ringOsc.simulationConfig?.expectedBehavior).toBe('oscillator');
    
    // 回路構造
    expect(ringOsc.gates).toBeDefined();
    expect(ringOsc.wires).toBeDefined();
    expect(ringOsc.gates.length).toBe(6); // 3 NOT + 3 OUTPUT
    expect(ringOsc.wires.length).toBe(6); // 6本のワイヤー
    
    // NOTゲートの確認
    const notGates = ringOsc.gates.filter(g => g.type === 'NOT');
    expect(notGates.length).toBe(3);
    expect(notGates.map(g => g.id).sort()).toEqual(['NOT1', 'NOT2', 'NOT3']);
    
    // OUTPUTゲートの確認
    const outputGates = ringOsc.gates.filter(g => g.type === 'OUTPUT');
    expect(outputGates.length).toBe(3);
    expect(outputGates.map(g => g.id).sort()).toEqual(['OUT_NOT1', 'OUT_NOT2', 'OUT_NOT3']);
    
    console.log('✅ Circuit metadata is correct');
  });

  it('should have correct wire connections', () => {
    const ringOsc = FEATURED_CIRCUITS.find(c => c.id === 'simple-ring-oscillator')!;
    
    const wireConnections = ringOsc.wires.map(w => ({
      id: w.id,
      from: w.from.gateId,
      to: w.to.gateId
    }));
    
    console.log('🔗 Wire connections:', wireConnections);
    
    // 循環接続の確認
    expect(ringOsc.wires.find(w => w.from.gateId === 'NOT1' && w.to.gateId === 'NOT2')).toBeDefined();
    expect(ringOsc.wires.find(w => w.from.gateId === 'NOT2' && w.to.gateId === 'NOT3')).toBeDefined();
    expect(ringOsc.wires.find(w => w.from.gateId === 'NOT3' && w.to.gateId === 'NOT1')).toBeDefined();
    
    // 出力接続の確認
    expect(ringOsc.wires.find(w => w.from.gateId === 'NOT1' && w.to.gateId === 'OUT_NOT1')).toBeDefined();
    expect(ringOsc.wires.find(w => w.from.gateId === 'NOT2' && w.to.gateId === 'OUT_NOT2')).toBeDefined();
    expect(ringOsc.wires.find(w => w.from.gateId === 'NOT3' && w.to.gateId === 'OUT_NOT3')).toBeDefined();
    
    console.log('✅ Wire connections are correct');
  });

  it('should have pure circuit equivalent', () => {
    const pureCircuit = PURE_CIRCUITS['simple-ring-oscillator'];
    
    expect(pureCircuit).toBeDefined();
    expect(pureCircuit.gates.length).toBe(6);
    expect(pureCircuit.wires.length).toBe(6);
    
    // PureCircuit構造の確認
    const notGates = pureCircuit.gates.filter(g => g.type === 'NOT');
    expect(notGates.length).toBe(3);
    
    console.log('✅ Pure circuit structure is correct');
  });

  it('should be able to initialize evaluator', () => {
    const evaluationService = getGlobalEvaluationService();
    expect(evaluationService).toBeDefined();
    
    // 基本的な評価機能の確認
    expect(typeof evaluationService.evaluateDirect).toBe('function');
    expect(typeof evaluationService.executeClockCycle).toBe('function');
    
    console.log('✅ Evaluation service is available');
  });

  it('should have correct initial gate states', () => {
    const ringOsc = FEATURED_CIRCUITS.find(c => c.id === 'simple-ring-oscillator')!;
    
    // 初期状態の確認
    const not1 = ringOsc.gates.find(g => g.id === 'NOT1')!;
    const not2 = ringOsc.gates.find(g => g.id === 'NOT2')!;
    const not3 = ringOsc.gates.find(g => g.id === 'NOT3')!;
    
    // すべてのNOTゲートが出力を持つ
    expect(not1.outputs).toBeDefined();
    expect(not2.outputs).toBeDefined();
    expect(not3.outputs).toBeDefined();
    expect(not1.outputs.length).toBe(1);
    expect(not2.outputs.length).toBe(1);
    expect(not3.outputs.length).toBe(1);
    
    // 初期状態（回路設計から）
    expect(not1.outputs[0]).toBe(true);  // NOT1 は初期値 true
    expect(not2.outputs[0]).toBe(false); // NOT2 は初期値 false
    expect(not3.outputs[0]).toBe(false); // NOT3 は初期値 false
    
    console.log('🔍 Initial states:', {
      NOT1: not1.outputs[0],
      NOT2: not2.outputs[0], 
      NOT3: not3.outputs[0]
    });
    
    console.log('✅ Initial gate states are as expected');
  });
});
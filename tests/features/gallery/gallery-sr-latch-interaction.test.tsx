import { describe, it, expect, beforeEach } from 'vitest';
import { HybridEvaluator } from '@/domain/simulation/event-driven-minimal';
import { SR_LATCH_BASIC } from '@/features/gallery/data/sr-latch-circuit';
import type { Circuit } from '@/domain/simulation/core/types';

describe('Gallery SR-LATCH Interaction', () => {
  let hybridEvaluator: HybridEvaluator;
  let circuit: Circuit;

  beforeEach(() => {
    hybridEvaluator = new HybridEvaluator();
    circuit = {
      gates: SR_LATCH_BASIC.gates.map(g => ({ ...g })),
      wires: SR_LATCH_BASIC.wires.map(w => ({ ...w }))
    };
  });

  it('初期状態で正しく評価される', () => {
    const result = hybridEvaluator.evaluate(circuit);
    
    // NOR1 (Q) の初期状態は true
    const nor1 = result.gates.find(g => g.id === 'NOR1');
    expect(nor1?.output).toBe(true);
    
    // NOR2 (Q̄) の初期状態は false
    const nor2 = result.gates.find(g => g.id === 'NOR2');
    expect(nor2?.output).toBe(false);
    
    // ワイヤーの状態を確認
    const wireFromNor1 = result.wires.find(w => w.from.gateId === 'NOR1');
    expect(wireFromNor1?.isActive).toBe(true);
  });

  it('S入力をtrueにするとQがtrueになる', () => {
    // S入力をtrueに設定
    const sInput = circuit.gates.find(g => g.id === 'S');
    if (sInput) sInput.output = true;
    
    const result = hybridEvaluator.evaluate(circuit);
    
    // Q出力を確認（OUTPUTゲートの出力値を確認）
    const qOutput = result.gates.find(g => g.id === 'Q');
    expect(qOutput?.output).toBe(true);
    
    // NOR1の出力
    const nor1 = result.gates.find(g => g.id === 'NOR1');
    expect(nor1?.output).toBe(true);
  });

  it('R入力をtrueにするとQがfalseになる', () => {
    // R入力をtrueに設定
    const rInput = circuit.gates.find(g => g.id === 'R');
    if (rInput) rInput.output = true;
    
    const result = hybridEvaluator.evaluate(circuit);
    
    // Q出力を確認（OUTPUTゲートの出力値を確認）
    const qOutput = result.gates.find(g => g.id === 'Q');
    expect(qOutput?.output).toBe(false);
    
    // NOR1の出力
    const nor1 = result.gates.find(g => g.id === 'NOR1');
    expect(nor1?.output).toBe(false);
  });

  it('循環依存が正しく検出される', () => {
    const analysisResult = hybridEvaluator.analyzeCircuit(circuit);
    
    expect(analysisResult.hasCircularDependency).toBe(true);
    expect(analysisResult.circularGates).toContain('NOR1');
    expect(analysisResult.circularGates).toContain('NOR2');
    expect(analysisResult.recommendedMode).toBe('event-driven');
  });

  it('入力切り替えでワイヤーのisActiveが更新される', () => {
    // 初期状態
    let result = hybridEvaluator.evaluate(circuit);
    const initialWireStates = result.wires.map(w => ({
      id: w.id,
      isActive: w.isActive
    }));
    
    // S入力を切り替え
    const sInput = circuit.gates.find(g => g.id === 'S');
    if (sInput) sInput.output = true;
    
    result = hybridEvaluator.evaluate(circuit);
    
    // S入力からのワイヤーがアクティブになっているか確認
    const sWire = result.wires.find(w => w.from.gateId === 'S');
    expect(sWire?.isActive).toBe(true);
    
    // ワイヤーの状態が変化しているか確認
    const changedWires = result.wires.filter((w, i) => 
      w.isActive !== initialWireStates[i].isActive
    );
    expect(changedWires.length).toBeGreaterThan(0);
  });

  it('複数回の評価で状態が安定する', () => {
    // S=false, R=true でリセット
    const sInput = circuit.gates.find(g => g.id === 'S');
    const rInput = circuit.gates.find(g => g.id === 'R');
    if (sInput) sInput.output = false;
    if (rInput) rInput.output = true;
    
    let result1 = hybridEvaluator.evaluate(circuit);
    
    // 同じ入力で再評価
    let result2 = hybridEvaluator.evaluate(circuit);
    
    // 出力が安定しているか確認
    expect(result1.gates.map(g => g.output)).toEqual(
      result2.gates.map(g => g.output)
    );
    expect(result1.wires.map(w => w.isActive)).toEqual(
      result2.wires.map(w => w.isActive)
    );
  });
});
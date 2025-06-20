import { describe, it, expect } from 'vitest';
import { needsTwoPhaseEvaluation } from '../../src/domain/simulation/core/dffTwoPhaseEvaluation';
import { CHAOS_GENERATOR } from '../../src/features/gallery/data/chaos-generator';
import type { Circuit } from '../../src/types/circuit';

describe('二段階評価条件チェック', () => {
  it('カオス発生器が二段階評価条件を満たすか確認', () => {
    // ギャラリーデータから回路を構築
    const circuit: Circuit = {
      gates: CHAOS_GENERATOR.gates,
      wires: CHAOS_GENERATOR.wires
    };

    console.log('=== カオス発生器回路分析 ===');
    console.log('ゲート数:', circuit.gates.length);
    
    // D-FFゲートを特定
    const dffGates = circuit.gates.filter(g => g.type === 'D-FF');
    console.log('D-FFゲート数:', dffGates.length);
    console.log('D-FFゲートID:', dffGates.map(g => g.id));

    // D-FF間の接続を確認
    const dffIds = new Set(dffGates.map(g => g.id));
    const dffConnections = circuit.wires.filter(wire => 
      dffIds.has(wire.from.gateId) && dffIds.has(wire.to.gateId)
    );
    
    console.log('D-FF間の直接接続数:', dffConnections.length);
    console.log('D-FF間接続:', dffConnections.map(w => `${w.from.gateId} → ${w.to.gateId}`));

    // 二段階評価が必要か判定
    const needsTwoPhase = needsTwoPhaseEvaluation(circuit);
    console.log('二段階評価が必要:', needsTwoPhase);

    // 検証
    expect(dffGates.length).toBeGreaterThanOrEqual(2);
    expect(dffConnections.length).toBeGreaterThan(0);
    expect(needsTwoPhase).toBe(true);
  });

  it('二段階評価の判定ロジックを詳細確認', () => {
    const circuit: Circuit = {
      gates: CHAOS_GENERATOR.gates,
      wires: CHAOS_GENERATOR.wires
    };

    // 判定ロジックを手動で再実装して確認
    const dffGates = circuit.gates.filter(g => g.type === 'D-FF');
    console.log('\n=== 手動判定ロジック ===');
    console.log('Step 1: D-FFゲート数 >=2 ?', dffGates.length >= 2);
    
    if (dffGates.length < 2) {
      console.log('→ FALSE: D-FFが2つ未満');
      return;
    }

    const dffIds = new Set(dffGates.map(g => g.id));
    console.log('Step 2: D-FFゲートID集合', Array.from(dffIds));

    const hasDFFConnections = circuit.wires.some(wire => 
      dffIds.has(wire.from.gateId) && dffIds.has(wire.to.gateId)
    );
    console.log('Step 3: D-FF間接続あり?', hasDFFConnections);

    // 全ての配線をチェック
    circuit.wires.forEach(wire => {
      const fromIsDFF = dffIds.has(wire.from.gateId);
      const toIsDFF = dffIds.has(wire.to.gateId);
      if (fromIsDFF || toIsDFF) {
        console.log(`配線: ${wire.from.gateId}[${fromIsDFF ? 'D-FF' : 'OTHER'}] → ${wire.to.gateId}[${toIsDFF ? 'D-FF' : 'OTHER'}]`);
      }
    });

    expect(hasDFFConnections).toBe(true);
  });
});
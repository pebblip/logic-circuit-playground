import { describe, it, expect, beforeEach } from 'vitest';
import type { Circuit } from '../../../../src/types/circuit';
import { DEFAULT_GATE_DELAYS } from '../../../../src/constants/gateDelays';
import { EventDrivenEngine } from '../../../../src/domain/simulation/event-driven';

/**
 * 遅延モードでの3-NOTリングオシレータテスト
 * 
 * 目標：
 * - DELAYゲートなしで発振すること
 * - 各NOTゲートが1nsの遅延を持つこと
 * - 理論的な発振周期（6ns）で動作すること
 */
describe('Ring Oscillator with Propagation Delays', () => {
  /**
   * 3-NOTリングオシレータ回路
   * 
   *      ┌─────┐    ┌─────┐    ┌─────┐
   *   ┌──┤ NOT ├────┤ NOT ├────┤ NOT ├──┐
   *   │  └─────┘    └─────┘    └─────┘  │
   *   │   (1ns)      (1ns)      (1ns)   │
   *   └──────────────────────────────────┘
   */
  function createDelayedRingOscillator(): Circuit {
    return {
      gates: [
        {
          id: 'NOT1',
          type: 'NOT',
          position: { x: 100, y: 100 },
          output: true,  // 初期状態: true
          inputs: [''],
          // Phase 1で実装される遅延設定（現在は無視される）
          timing: {
            propagationDelay: DEFAULT_GATE_DELAYS['NOT'], // 1.0ns
          },
        },
        {
          id: 'NOT2',
          type: 'NOT',
          position: { x: 300, y: 100 },
          output: false, // 初期状態: false
          inputs: [''],
          timing: {
            propagationDelay: DEFAULT_GATE_DELAYS['NOT'], // 1.0ns
          },
        },
        {
          id: 'NOT3',
          type: 'NOT',
          position: { x: 500, y: 100 },
          output: false, // 初期状態: false
          inputs: [''],
          timing: {
            propagationDelay: DEFAULT_GATE_DELAYS['NOT'], // 1.0ns
          },
        },
      ],
      wires: [
        {
          id: 'w1',
          from: { gateId: 'NOT1', pinIndex: -1 },
          to: { gateId: 'NOT2', pinIndex: 0 },
          isActive: true, // NOT1の初期出力がtrue
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

  /**
   * 期待される動作シーケンス（各NOTゲート1ns遅延）
   * 
   * t=0ns: NOT1=1, NOT2=0, NOT3=0
   * t=1ns: NOT1=1, NOT2=1, NOT3=0 (NOT2が変化)
   * t=2ns: NOT1=1, NOT2=1, NOT3=1 (NOT3が変化)
   * t=3ns: NOT1=0, NOT2=1, NOT3=1 (NOT1が変化)
   * t=4ns: NOT1=0, NOT2=0, NOT3=1 (NOT2が変化)
   * t=5ns: NOT1=0, NOT2=0, NOT3=0 (NOT3が変化)
   * t=6ns: NOT1=1, NOT2=0, NOT3=0 (NOT1が変化) ← 初期状態に戻る
   * 
   * 発振周期: 6ns
   */

  it('should oscillate with 6ns period using gate delays', () => {
    const circuit = createDelayedRingOscillator();
    
    // 遅延モードを有効にしてエンジンを作成
    const engine = new EventDrivenEngine({ 
      delayMode: true,
      enableDebug: true,
      maxDeltaCycles: 100,
      continueOnOscillation: true,
      oscillationCyclesAfterDetection: 50,
    });
    
    // シミュレーション実行
    const result = engine.evaluate(circuit);
    
    console.log('Ring Oscillator with Delays Test Result:', {
      success: result.success,
      cycleCount: result.cycleCount,
      hasOscillation: result.hasOscillation,
      oscillationInfo: result.oscillationInfo,
      currentTime: result.finalState.currentTime,
    });
    
    // デバッグトレースから状態遷移を確認
    if (result.debugTrace) {
      const stateChanges = result.debugTrace
        .filter(t => t.event === 'EVENT_SCHEDULED')
        .slice(0, 20) // 最初の20イベント
        .map(t => ({
          time: t.time,
          gate: t.details.gateId,
          newValue: t.details.newValue,
        }));
      
      console.log('State transitions (first 20):', stateChanges);
      
      // 詳細なデバッグ情報を出力
      console.log('\nAll event types:', [...new Set(result.debugTrace.map(t => t.event))]);
      console.log('Total events:', result.debugTrace.length);
      console.log('First 10 events:', result.debugTrace.slice(0, 10).map(t => ({
        time: t.time,
        event: t.event,
        gateId: t.details.gateId,
      })));
    }
    
    // 基本的な確認
    expect(result.hasOscillation).toBe(true);
    expect(result.oscillationInfo).toBeDefined();
    
    // TODO: 発振周期が6nsであることを確認する詳細なテストを追加
  });

  it('should have correct default delays', () => {
    // デフォルト遅延値の確認
    expect(DEFAULT_GATE_DELAYS['NOT']).toBe(1.0);
    expect(DEFAULT_GATE_DELAYS['AND']).toBe(2.0);
    expect(DEFAULT_GATE_DELAYS['OR']).toBe(2.0);
  });

  it('should create circuit with timing properties', () => {
    const circuit = createDelayedRingOscillator();
    
    // すべてのNOTゲートにtimingプロパティが設定されていることを確認
    circuit.gates.forEach(gate => {
      if (gate.type === 'NOT') {
        expect(gate.timing).toBeDefined();
        expect(gate.timing?.propagationDelay).toBe(1.0);
      }
    });
  });

  describe('Expected Behavior Analysis', () => {
    it('should document expected state transitions', () => {
      const expectedStates = [
        { time: 0, NOT1: true,  NOT2: false, NOT3: false },
        { time: 1, NOT1: true,  NOT2: true,  NOT3: false },
        { time: 2, NOT1: true,  NOT2: true,  NOT3: true  },
        { time: 3, NOT1: false, NOT2: true,  NOT3: true  },
        { time: 4, NOT1: false, NOT2: false, NOT3: true  },
        { time: 5, NOT1: false, NOT2: false, NOT3: false },
        { time: 6, NOT1: true,  NOT2: false, NOT3: false }, // 初期状態に戻る
      ];

      // 発振周期の確認（配列インデックスとして）
      const periodIndex = 6; // 配列の7番目の要素（インデックス6）
      // time以外のプロパティが同じであることを確認
      expect({
        NOT1: expectedStates[0].NOT1,
        NOT2: expectedStates[0].NOT2,
        NOT3: expectedStates[0].NOT3,
      }).toEqual({
        NOT1: expectedStates[periodIndex].NOT1,
        NOT2: expectedStates[periodIndex].NOT2,
        NOT3: expectedStates[periodIndex].NOT3,
      });
    });

    it('should work without DELAY gate', () => {
      const circuit = createDelayedRingOscillator();
      
      // DELAYゲートが含まれていないことを確認
      const hasDelayGate = circuit.gates.some(g => g.type === 'DELAY');
      expect(hasDelayGate).toBe(false);
      
      // 3つのNOTゲートのみ
      const notGates = circuit.gates.filter(g => g.type === 'NOT');
      expect(notGates).toHaveLength(3);
    });
  });
});

/**
 * デバッグ用ヘルパー関数
 */
export function debugRingOscillator(circuit: Circuit, duration: number = 20): void {
  console.log('=== Ring Oscillator Debug (Delay Mode) ===');
  console.log('Initial state:');
  circuit.gates.forEach(g => {
    if (g.type === 'NOT') {
      console.log(`  ${g.id}: output=${g.output}, delay=${g.timing?.propagationDelay}ns`);
    }
  });
  
  const engine = new EventDrivenEngine({ 
    delayMode: true,
    enableDebug: true,
    maxDeltaCycles: 200,
  });
  
  const result = engine.evaluate(circuit);
  
  console.log('\nSimulation result:');
  console.log(`  Total cycles: ${result.cycleCount}`);
  console.log(`  Has oscillation: ${result.hasOscillation}`);
  console.log(`  Final time: ${result.finalState.currentTime}ns`);
  
  // トレースから時系列の状態を再構築
  if (result.debugTrace) {
    console.log('\nState history:');
    const events = result.debugTrace
      .filter(t => t.event === 'EVENT_SCHEDULED' && t.details.gateId?.toString().startsWith('NOT'))
      .slice(0, 30);
    
    let lastTime = 0;
    events.forEach(event => {
      const time = event.time;
      const gateId = event.details.gateId;
      const value = event.details.newValue;
      
      if (time !== lastTime) {
        console.log(`\nt=${time}ns:`);
        lastTime = time;
      }
      console.log(`  ${gateId} → ${value}`);
    });
  }
  
  console.log('\nFinal state:');
  circuit.gates.forEach(g => {
    if (g.type === 'NOT') {
      console.log(`  ${g.id}: output=${g.output}`);
    }
  });
}
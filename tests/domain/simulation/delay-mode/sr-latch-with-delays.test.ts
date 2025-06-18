import { describe, it, expect } from 'vitest';
import type { Circuit } from '../../../../src/types/circuit';
import { DEFAULT_GATE_DELAYS } from '../../../../src/constants/gateDelays';
import { EventDrivenEngine } from '../../../../src/domain/simulation/event-driven';

/**
 * 遅延モードでのSR-LATCHテスト
 * 
 * SR-LATCHは2つのNANDゲートで構成される基本的な順序回路
 * 遅延モードでは各NANDゲートが1.5nsの遅延を持つ
 */
describe('SR-LATCH with Propagation Delays', () => {
  /**
   * SR-LATCH回路（NANDゲート実装）
   * 
   *     S ─┬─┐
   *         │ └─[NAND1]─┬─ Q
   *         │     ↑      │
   *         │     │      │
   *         │     └──────┤
   *         │            │
   *         └──────┐     │
   *               ↓     │
   *     R ───────[NAND2]─┴─ Q̄
   */
  function createSRLatchWithNAND(): Circuit {
    return {
      gates: [
        // S入力
        {
          id: 'S',
          type: 'INPUT',
          position: { x: 100, y: 100 },
          output: true, // 初期状態: S=1（非アクティブ）
          inputs: [],
        },
        // R入力
        {
          id: 'R',
          type: 'INPUT',
          position: { x: 100, y: 200 },
          output: true, // 初期状態: R=1（非アクティブ）
          inputs: [],
        },
        // NAND1 (上側) - Q出力
        {
          id: 'NAND1',
          type: 'NAND',
          position: { x: 300, y: 100 },
          output: false, // Q=0の初期状態
          inputs: ['', ''],
          timing: {
            propagationDelay: DEFAULT_GATE_DELAYS['NAND'], // 1.5ns
          },
        },
        // NAND2 (下側) - Q̄出力
        {
          id: 'NAND2',
          type: 'NAND',
          position: { x: 300, y: 200 },
          output: true, // Q̄=1の初期状態
          inputs: ['', ''],
          timing: {
            propagationDelay: DEFAULT_GATE_DELAYS['NAND'], // 1.5ns
          },
        },
        // Q出力観測用
        {
          id: 'Q',
          type: 'OUTPUT',
          position: { x: 500, y: 100 },
          output: false,
          inputs: [''],
        },
        // Q̄出力観測用
        {
          id: 'Q_BAR',
          type: 'OUTPUT',
          position: { x: 500, y: 200 },
          output: true,
          inputs: [''],
        },
      ],
      wires: [
        // S → NAND1の入力0
        {
          id: 'w1',
          from: { gateId: 'S', pinIndex: -1 },
          to: { gateId: 'NAND1', pinIndex: 0 },
          isActive: true,
        },
        // R → NAND2の入力0
        {
          id: 'w2',
          from: { gateId: 'R', pinIndex: -1 },
          to: { gateId: 'NAND2', pinIndex: 0 },
          isActive: true,
        },
        // NAND1出力 → NAND2の入力1（フィードバック）
        {
          id: 'w3',
          from: { gateId: 'NAND1', pinIndex: -1 },
          to: { gateId: 'NAND2', pinIndex: 1 },
          isActive: false,
        },
        // NAND2出力 → NAND1の入力1（フィードバック）
        {
          id: 'w4',
          from: { gateId: 'NAND2', pinIndex: -1 },
          to: { gateId: 'NAND1', pinIndex: 1 },
          isActive: true,
        },
        // NAND1 → Q出力
        {
          id: 'w5',
          from: { gateId: 'NAND1', pinIndex: -1 },
          to: { gateId: 'Q', pinIndex: 0 },
          isActive: false,
        },
        // NAND2 → Q̄出力
        {
          id: 'w6',
          from: { gateId: 'NAND2', pinIndex: -1 },
          to: { gateId: 'Q_BAR', pinIndex: 0 },
          isActive: true,
        },
      ],
    };
  }

  /**
   * 期待される動作シーケンス（NANDゲート1.5ns遅延）
   * 
   * 1. Set動作 (S=0, R=1):
   *    t=0ns: S→0に変化
   *    t=1.5ns: NAND1がQ=1に変化
   *    t=3.0ns: NAND2がQ̄=0に変化
   * 
   * 2. Reset動作 (S=1, R=0):
   *    t=0ns: R→0に変化
   *    t=1.5ns: NAND2がQ̄=1に変化
   *    t=3.0ns: NAND1がQ=0に変化
   */

  it('should respond to Set input with correct timing', () => {
    const circuit = createSRLatchWithNAND();
    
    // 遅延モードを有効にしてエンジンを作成
    const engine = new EventDrivenEngine({ 
      delayMode: true,
      enableDebug: true,
      maxDeltaCycles: 100,
    });
    
    // 初期状態を評価
    let result = engine.evaluate(circuit);
    expect(result.success).toBe(true);
    
    // Set操作: S=0, R=1
    const sGate = circuit.gates.find(g => g.id === 'S')!;
    sGate.output = false;
    
    // シミュレーション実行
    result = engine.evaluate(circuit);
    
    console.log('SR-LATCH Set Operation Test:', {
      success: result.success,
      finalTime: result.finalState.currentTime,
      Q: circuit.gates.find(g => g.id === 'Q')?.output,
      Q_BAR: circuit.gates.find(g => g.id === 'Q_BAR')?.output,
    });
    
    // デバッグトレースから遷移タイミングを確認
    if (result.debugTrace) {
      const transitions = result.debugTrace
        .filter(t => t.event === 'EVENT_SCHEDULED' && 
                (t.details.gateId === 'NAND1' || t.details.gateId === 'NAND2'))
        .map(t => ({
          time: t.time,
          gate: t.details.gateId,
          newValue: t.details.newValue,
        }));
      
      console.log('NAND gate transitions:', transitions);
      
      // タイミングの検証
      const nand1Transition = transitions.find(t => t.gate === 'NAND1' && t.newValue === true);
      const nand2Transition = transitions.find(t => t.gate === 'NAND2' && t.newValue === false);
      
      expect(nand1Transition).toBeDefined();
      expect(nand2Transition).toBeDefined();
      
      // NAND1は1.5ns後に変化
      expect(nand1Transition!.time).toBeCloseTo(1.5, 1);
      // NAND2は3.0ns後に変化
      expect(nand2Transition!.time).toBeCloseTo(3.0, 1);
    }
    
    // 最終状態の確認: Q=1, Q̄=0
    expect(circuit.gates.find(g => g.id === 'Q')?.output).toBe(true);
    expect(circuit.gates.find(g => g.id === 'Q_BAR')?.output).toBe(false);
  });

  it('should respond to Reset input with correct timing', () => {
    const circuit = createSRLatchWithNAND();
    
    // まずSet状態にする（Q=1, Q̄=0）
    circuit.gates.find(g => g.id === 'NAND1')!.output = true;
    circuit.gates.find(g => g.id === 'NAND2')!.output = false;
    circuit.gates.find(g => g.id === 'Q')!.output = true;
    circuit.gates.find(g => g.id === 'Q_BAR')!.output = false;
    
    const engine = new EventDrivenEngine({ 
      delayMode: true,
      enableDebug: true,
      maxDeltaCycles: 100,
    });
    
    // Reset操作: S=1, R=0
    const rGate = circuit.gates.find(g => g.id === 'R')!;
    rGate.output = false;
    
    // シミュレーション実行
    const result = engine.evaluate(circuit);
    
    console.log('SR-LATCH Reset Operation Test:', {
      success: result.success,
      finalTime: result.finalState.currentTime,
      Q: circuit.gates.find(g => g.id === 'Q')?.output,
      Q_BAR: circuit.gates.find(g => g.id === 'Q_BAR')?.output,
    });
    
    // 最終状態の確認: Q=0, Q̄=1
    expect(circuit.gates.find(g => g.id === 'Q')?.output).toBe(false);
    expect(circuit.gates.find(g => g.id === 'Q_BAR')?.output).toBe(true);
  });

  it('should handle metastable state recovery', () => {
    const circuit = createSRLatchWithNAND();
    
    // 遅延モードを有効にしてエンジンを作成
    const engine = new EventDrivenEngine({ 
      delayMode: true,
      enableDebug: true,
      maxDeltaCycles: 100,
    });
    
    // 不正な状態から開始: S=0, R=0（両方アクティブ）
    circuit.gates.find(g => g.id === 'S')!.output = false;
    circuit.gates.find(g => g.id === 'R')!.output = false;
    
    // シミュレーション実行
    let result = engine.evaluate(circuit);
    
    // この状態では両出力が1になる
    expect(circuit.gates.find(g => g.id === 'Q')?.output).toBe(true);
    expect(circuit.gates.find(g => g.id === 'Q_BAR')?.output).toBe(true);
    
    // S=1, R=1に戻す（Hold状態）
    circuit.gates.find(g => g.id === 'S')!.output = true;
    circuit.gates.find(g => g.id === 'R')!.output = true;
    
    result = engine.evaluate(circuit);
    
    console.log('SR-LATCH Metastable Recovery Test:', {
      success: result.success,
      hasOscillation: result.hasOscillation,
      finalTime: result.finalState.currentTime,
      Q: circuit.gates.find(g => g.id === 'Q')?.output,
      Q_BAR: circuit.gates.find(g => g.id === 'Q_BAR')?.output,
    });
    
    // メタステーブル状態から回復し、発振する可能性がある
    // 遅延があるため、どちらかの状態に収束するはず
    const q = circuit.gates.find(g => g.id === 'Q')?.output;
    const qBar = circuit.gates.find(g => g.id === 'Q_BAR')?.output;
    
    // QとQ̄は必ず反対の値になるべき（最終的には）
    if (!result.hasOscillation) {
      expect(q).toBe(!qBar);
    }
  });

  it('should have correct default delays for NAND gates', () => {
    expect(DEFAULT_GATE_DELAYS['NAND']).toBe(1.5);
    expect(DEFAULT_GATE_DELAYS['SR-LATCH']).toBe(4.0); // SR-LATCH専用の遅延値
  });

  it('should compare instant mode vs delay mode', () => {
    const circuit1 = createSRLatchWithNAND();
    const circuit2 = createSRLatchWithNAND();
    
    // 即時モード
    const instantEngine = new EventDrivenEngine({ 
      delayMode: false,
      enableDebug: true,
      maxDeltaCycles: 100,
    });
    
    // 遅延モード
    const delayEngine = new EventDrivenEngine({ 
      delayMode: true,
      enableDebug: true,
      maxDeltaCycles: 100,
    });
    
    // まず初期状態を安定させる
    instantEngine.evaluate(circuit1);
    delayEngine.evaluate(circuit2);
    
    // 両方でSet操作
    circuit1.gates.find(g => g.id === 'S')!.output = false;
    circuit2.gates.find(g => g.id === 'S')!.output = false;
    
    const instantResult = instantEngine.evaluate(circuit1);
    const delayResult = delayEngine.evaluate(circuit2);
    
    console.log('Mode Comparison:', {
      instant: {
        time: instantResult.finalState.currentTime,
        cycles: instantResult.cycleCount,
        Q: circuit1.gates.find(g => g.id === 'Q')?.output,
        Q_BAR: circuit1.gates.find(g => g.id === 'Q_BAR')?.output,
      },
      delay: {
        time: delayResult.finalState.currentTime,
        cycles: delayResult.cycleCount,
        Q: circuit2.gates.find(g => g.id === 'Q')?.output,
        Q_BAR: circuit2.gates.find(g => g.id === 'Q_BAR')?.output,
      },
    });
    
    // SR-LATCHの出力は相補的であるべき（初期状態により最終状態は異なる可能性がある）
    const q1 = circuit1.gates.find(g => g.id === 'Q')?.output;
    const qBar1 = circuit1.gates.find(g => g.id === 'Q_BAR')?.output;
    const q2 = circuit2.gates.find(g => g.id === 'Q')?.output;
    const qBar2 = circuit2.gates.find(g => g.id === 'Q_BAR')?.output;
    
    // 各モードで出力が相補的であることを確認
    expect(q1).toBe(!qBar1);
    expect(q2).toBe(!qBar2);
    
    // 遅延モードの方が実時間がかかる
    expect(delayResult.finalState.currentTime)
      .toBeGreaterThan(instantResult.finalState.currentTime);
  });
});

/**
 * SR-LATCHの動作を視覚的に確認するためのヘルパー
 */
export function debugSRLatch(circuit: Circuit): void {
  console.log('=== SR-LATCH Debug ===');
  console.log('Inputs:');
  console.log(`  S = ${circuit.gates.find(g => g.id === 'S')?.output ? 1 : 0}`);
  console.log(`  R = ${circuit.gates.find(g => g.id === 'R')?.output ? 1 : 0}`);
  console.log('Outputs:');
  console.log(`  Q = ${circuit.gates.find(g => g.id === 'Q')?.output ? 1 : 0}`);
  console.log(`  Q̄ = ${circuit.gates.find(g => g.id === 'Q_BAR')?.output ? 1 : 0}`);
  console.log('NANDs:');
  console.log(`  NAND1 = ${circuit.gates.find(g => g.id === 'NAND1')?.output ? 1 : 0}`);
  console.log(`  NAND2 = ${circuit.gates.find(g => g.id === 'NAND2')?.output ? 1 : 0}`);
}
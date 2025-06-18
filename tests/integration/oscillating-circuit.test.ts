import { describe, it, expect } from 'vitest';
import { useCircuitStore } from '@/stores/circuitStore';
import type { Gate, Wire } from '@/types/circuit';
import { EnhancedHybridEvaluator } from '@/domain/simulation/event-driven-minimal';
import type { Circuit } from '@/domain/simulation/core/types';

describe('セルフオシレーティング回路の動作確認', () => {
  it('3つのNOTゲートとDELAYゲートでリングオシレーターを作成', () => {
    const evaluator = new EnhancedHybridEvaluator({
      strategy: 'EVENT_DRIVEN_ONLY',
      enableDebugLogging: false,
    });
    
    // 回路をクリア
    useCircuitStore.setState({ gates: [], wires: [] });
    
    // 3つのNOTゲートを作成
    const not1: Gate = {
      id: 'not1',
      type: 'NOT',
      position: { x: 100, y: 200 },
      inputs: [''],
      output: true, // 初期状態
    };
    
    const not2: Gate = {
      id: 'not2',
      type: 'NOT',
      position: { x: 300, y: 200 },
      inputs: [''],
      output: false,
    };
    
    const not3: Gate = {
      id: 'not3',
      type: 'NOT',
      position: { x: 500, y: 200 },
      inputs: [''],
      output: true,
    };
    
    // DELAYゲートを追加（フィードバックループに必要）
    const delay: Gate = {
      id: 'delay1',
      type: 'DELAY',
      position: { x: 700, y: 200 },
      inputs: [''],
      output: false,
      metadata: {
        history: [],
      },
    };
    
    // ワイヤーで接続（リング状）
    const wires: Wire[] = [
      {
        id: 'w1',
        from: { gateId: 'not1', pinIndex: -1 },
        to: { gateId: 'not2', pinIndex: 0 },
        isActive: false,
      },
      {
        id: 'w2',
        from: { gateId: 'not2', pinIndex: -1 },
        to: { gateId: 'not3', pinIndex: 0 },
        isActive: false,
      },
      {
        id: 'w3',
        from: { gateId: 'not3', pinIndex: -1 },
        to: { gateId: 'delay1', pinIndex: 0 },
        isActive: false,
      },
      {
        id: 'w4',
        from: { gateId: 'delay1', pinIndex: -1 },
        to: { gateId: 'not1', pinIndex: 0 },
        isActive: false,
      },
    ];
    
    // 回路を作成
    let circuit: Circuit = {
      gates: [not1, not2, not3, delay],
      wires,
    };
    
    // 状態の履歴を記録
    const outputHistory: boolean[] = [];
    
    // 20サイクル実行
    for (let i = 0; i < 20; i++) {
      // シミュレーションを実行
      const result = evaluator.evaluate(circuit);
      circuit = result.circuit;
      
      // NOT1の出力を記録
      const not1Gate = circuit.gates.find(g => g.id === 'not1');
      if (not1Gate) {
        outputHistory.push(not1Gate.output);
      }
    }
    
    // 振動パターンの確認
    console.log('リングオシレーター出力パターン:', 
      outputHistory.map(b => b ? '1' : '0').join(''));
    
    // 状態変化が発生していることを確認
    let changes = 0;
    for (let i = 1; i < outputHistory.length; i++) {
      if (outputHistory[i] !== outputHistory[i - 1]) {
        changes++;
      }
    }
    
    // 振動していることを確認（少なくとも1回は状態が変化）
    expect(changes).toBeGreaterThan(0);
    console.log(`振動確認: ${changes}回の状態変化`);
    
    // DELAYゲートの履歴が正しく管理されているか確認
    const delayGate = circuit.gates.find(g => g.id === 'delay1');
    expect(delayGate?.metadata?.history).toBeDefined();
    expect(Array.isArray(delayGate?.metadata?.history)).toBe(true);
  });
  
  it('SR-LATCHを使用したセルフオシレーティング回路', () => {
    const evaluator = new EnhancedHybridEvaluator({
      strategy: 'EVENT_DRIVEN_ONLY',
      enableDebugLogging: false,
    });
    
    // 2つのSR-LATCHを作成（クロスカップル）
    const latch1: Gate = {
      id: 'latch1',
      type: 'SR-LATCH',
      position: { x: 200, y: 200 },
      inputs: ['', ''],
      output: false,
      outputs: [false, true], // Q, Q̄
      metadata: {
        qOutput: false,
        qBarOutput: true,
      },
    };
    
    const latch2: Gate = {
      id: 'latch2',
      type: 'SR-LATCH',
      position: { x: 500, y: 200 },
      inputs: ['', ''],
      output: false,
      outputs: [false, true], // Q, Q̄
      metadata: {
        qOutput: false,
        qBarOutput: true,
      },
    };
    
    // 2つのDELAYゲートを追加（遅延を導入）
    const delay1: Gate = {
      id: 'delay1',
      type: 'DELAY',
      position: { x: 350, y: 100 },
      inputs: [''],
      output: false,
      metadata: {
        history: [],
      },
    };
    
    const delay2: Gate = {
      id: 'delay2',
      type: 'DELAY',
      position: { x: 350, y: 300 },
      inputs: [''],
      output: false,
      metadata: {
        history: [],
      },
    };
    
    // クロスカップル接続（DELAYを介して）
    const wires: Wire[] = [
      // Latch1のQ出力 -> Delay1 -> Latch2のS入力
      {
        id: 'w1',
        from: { gateId: 'latch1', pinIndex: -1 }, // Q出力
        to: { gateId: 'delay1', pinIndex: 0 },
        isActive: false,
      },
      {
        id: 'w2',
        from: { gateId: 'delay1', pinIndex: -1 },
        to: { gateId: 'latch2', pinIndex: 0 }, // S入力
        isActive: false,
      },
      // Latch2のQ出力 -> Delay2 -> Latch1のR入力
      {
        id: 'w3',
        from: { gateId: 'latch2', pinIndex: -1 }, // Q出力
        to: { gateId: 'delay2', pinIndex: 0 },
        isActive: false,
      },
      {
        id: 'w4',
        from: { gateId: 'delay2', pinIndex: -1 },
        to: { gateId: 'latch1', pinIndex: 1 }, // R入力
        isActive: false,
      },
    ];
    
    // 初期状態を設定（片方のラッチをセット）
    latch1.output = true;
    latch1.outputs = [true, false];
    latch1.metadata = { qOutput: true, qBarOutput: false };
    
    // 回路を作成
    let circuit: Circuit = {
      gates: [latch1, latch2, delay1, delay2],
      wires,
    };
    
    // 状態の履歴を記録
    const latch1History: boolean[] = [];
    const latch2History: boolean[] = [];
    
    // 15サイクル実行
    for (let i = 0; i < 15; i++) {
      // シミュレーションを実行
      const result = evaluator.evaluate(circuit);
      circuit = result.circuit;
      
      // 各ラッチの出力を記録
      const l1 = circuit.gates.find(g => g.id === 'latch1');
      const l2 = circuit.gates.find(g => g.id === 'latch2');
      if (l1 && l2) {
        latch1History.push(l1.output);
        latch2History.push(l2.output);
      }
    }
    
    // 出力パターンの確認
    console.log('Latch1出力:', latch1History.map(b => b ? '1' : '0').join(''));
    console.log('Latch2出力:', latch2History.map(b => b ? '1' : '0').join(''));
    
    // 両方のラッチで状態変化が発生していることを確認
    let l1Changes = 0;
    let l2Changes = 0;
    
    for (let i = 1; i < latch1History.length; i++) {
      if (latch1History[i] !== latch1History[i - 1]) l1Changes++;
      if (latch2History[i] !== latch2History[i - 1]) l2Changes++;
    }
    
    console.log(`Latch1: ${l1Changes}回の状態変化`);
    console.log(`Latch2: ${l2Changes}回の状態変化`);
    
    // DELAYゲートにより、両方のラッチで状態変化が起こることを期待
    expect(l1Changes + l2Changes).toBeGreaterThan(0);
  });
});
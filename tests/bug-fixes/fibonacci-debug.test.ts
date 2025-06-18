/**
 * 🚨 フィボナッチカウンター動作問題調査
 * 
 * ユーザー報告：4つの出力ゲートが光ったまま変化しない
 * テスト結果：D-FFの状態が全く変化していない
 */

import { FEATURED_CIRCUITS } from '../../src/features/gallery/data/gallery';
import { EnhancedHybridEvaluator } from '../../src/domain/simulation/event-driven-minimal/EnhancedHybridEvaluator';
import { getGateInputValue } from '../../src/domain/simulation/signalConversion';

describe('フィボナッチカウンター動作問題調査', () => {
  let evaluator: EnhancedHybridEvaluator;

  beforeEach(() => {
    evaluator = new EnhancedHybridEvaluator({
      strategy: 'AUTO_SELECT',
      autoSelectionThresholds: {
        maxGatesForLegacy: 10,
        minGatesForEventDriven: 20,
      },
      enablePerformanceTracking: true,
      enableDebugLogging: false,
      delayMode: false,
    });
  });

  test('フィボナッチカウンターの詳細動作確認', () => {
    console.log('🌸 フィボナッチカウンターの詳細動作確認');
    
    const fibonacciCounter = FEATURED_CIRCUITS.find(circuit => circuit.id === 'fibonacci-counter');
    expect(fibonacciCounter).toBeTruthy();
    
    if (!fibonacciCounter) return;
    
    const { gates, wires } = fibonacciCounter;
    let currentCircuit = { gates, wires };
    
    console.log(`ゲート数: ${gates.length}, ワイヤー数: ${wires.length}`);
    
    // CLOCKゲート確認
    const clockGates = gates.filter(g => g.type === 'CLOCK');
    console.log(`\n⏰ CLOCKゲート:`);
    clockGates.forEach(clock => {
      console.log(`  ${clock.id}: output=${clock.output}, metadata=${JSON.stringify(clock.metadata)}`);
    });
    
    // D-FFゲート確認
    const dffGates = gates.filter(g => g.type === 'D-FF');
    console.log(`\n💾 D-FFゲート初期状態:`);
    dffGates.forEach(dff => {
      console.log(`  ${dff.id}: output=${dff.output}, metadata=${JSON.stringify(dff.metadata)}`);
    });
    
    // 10サイクル詳細追跡
    for (let cycle = 0; cycle < 10; cycle++) {
      console.log(`\n--- サイクル ${cycle + 1} ---`);
      
      // 評価前のCLOCK状態
      const clockBefore = currentCircuit.gates.find(g => g.id === 'clock');
      console.log(`評価前CLOCK: output=${clockBefore?.output}`);
      
      const result = evaluator.evaluate(currentCircuit);
      
      if (result && result.circuit) {
        const updatedGates = result.circuit.gates;
        
        // 評価後のCLOCK状態
        const clockAfter = updatedGates.find(g => g.id === 'clock');
        console.log(`評価後CLOCK: output=${clockAfter?.output}`);
        
        // D-FFの詳細状態
        console.log('\nD-FF状態:');
        const dffGatesAfter = updatedGates.filter(g => g.type === 'D-FF');
        dffGatesAfter.forEach(dff => {
          console.log(`  ${dff.id}:`);
          console.log(`    output: ${dff.output}`);
          console.log(`    inputs: ${JSON.stringify(dff.inputs)}`);
          console.log(`    metadata: ${JSON.stringify(dff.metadata)}`);
          
          // 入力ピンの実際の値を確認
          if (dff.inputs && dff.inputs.length >= 2) {
            const dInput = dff.inputs[0] === '1';
            const clkInput = dff.inputs[1] === '1';
            console.log(`    → D入力=${dInput}, CLK入力=${clkInput}`);
          }
        });
        
        // 出力状態
        const outputGates = updatedGates.filter(g => g.type === 'OUTPUT');
        const litOutputs = outputGates.filter(gate => getGateInputValue(gate, 0));
        console.log(`\n💡 点灯出力: ${litOutputs.length}/${outputGates.length}`);
        
        // 特定の出力詳細
        const binaryOutputs = outputGates.filter(g => g.id.startsWith('output_'));
        const binaryValues = binaryOutputs.map(gate => 
          getGateInputValue(gate, 0) ? '1' : '0'
        ).join('');
        console.log(`バイナリ出力: ${binaryValues}`);
        
        currentCircuit = result.circuit;
      } else {
        console.error(`❌ サイクル ${cycle + 1} で評価失敗`);
        break;
      }
    }
  });

  test('フィボナッチカウンターの接続確認', () => {
    console.log('\n🔌 フィボナッチカウンターの接続確認');
    
    const fibonacciCounter = FEATURED_CIRCUITS.find(circuit => circuit.id === 'fibonacci-counter');
    if (!fibonacciCounter) return;
    
    const { gates, wires } = fibonacciCounter;
    
    // CLOCKからD-FFへの接続確認
    console.log('\n⏰ CLOCK → D-FF接続:');
    const clockWires = wires.filter(w => w.from.gateId === 'clock');
    clockWires.forEach(wire => {
      const toGate = gates.find(g => g.id === wire.to.gateId);
      console.log(`  clock → ${wire.to.gateId}[${wire.to.pinIndex}] (${toGate?.type})`);
    });
    
    // D-FFの入力接続確認
    console.log('\n💾 D-FF入力接続:');
    const dffGates = gates.filter(g => g.type === 'D-FF');
    dffGates.forEach(dff => {
      console.log(`\n${dff.id}:`);
      
      // D入力（ピン0）の接続
      const dInputWire = wires.find(w => w.to.gateId === dff.id && w.to.pinIndex === 0);
      if (dInputWire) {
        const fromGate = gates.find(g => g.id === dInputWire.from.gateId);
        console.log(`  D入力: ${dInputWire.from.gateId} (${fromGate?.type})`);
      } else {
        console.log(`  D入力: 未接続 ❌`);
      }
      
      // CLK入力（ピン1）の接続
      const clkInputWire = wires.find(w => w.to.gateId === dff.id && w.to.pinIndex === 1);
      if (clkInputWire) {
        const fromGate = gates.find(g => g.id === clkInputWire.from.gateId);
        console.log(`  CLK入力: ${clkInputWire.from.gateId} (${fromGate?.type})`);
      } else {
        console.log(`  CLK入力: 未接続 ❌`);
      }
    });
  });

  test('手動フィボナッチ数列生成確認', () => {
    console.log('\n🧮 手動フィボナッチ数列生成');
    
    let a = 1;  // F(n-2)
    let b = 0;  // F(n-1)
    
    console.log('期待される数列:');
    for (let i = 0; i < 15; i++) {
      const next = (a + b) % 16;  // 4ビット（0-15）
      console.log(`  ステップ ${i}: ${b} (${b.toString(2).padStart(4, '0')})`);
      a = b;
      b = next;
    }
  });
});
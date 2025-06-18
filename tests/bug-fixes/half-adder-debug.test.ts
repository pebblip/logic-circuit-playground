/**
 * 🚨 半加算器の出力問題調査
 * 
 * INPUT Aがtrueに設定されているのに、なぜ出力ゲートが光らないのかを調査
 */

import { FEATURED_CIRCUITS } from '../../src/features/gallery/data/gallery';
import { EnhancedHybridEvaluator } from '../../src/domain/simulation/event-driven-minimal/EnhancedHybridEvaluator';
import { getGateInputValue } from '../../src/domain/simulation/signalConversion';

describe('半加算器出力問題調査', () => {
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

  test('半加算器の構成と初期状態確認', () => {
    console.log('🔍 半加算器の構成と初期状態確認');
    
    const halfAdder = FEATURED_CIRCUITS.find(circuit => circuit.id === 'half-adder');
    expect(halfAdder).toBeTruthy();
    
    if (!halfAdder) return;
    
    const { gates, wires } = halfAdder;
    console.log(`ゲート数: ${gates.length}, ワイヤー数: ${wires.length}`);
    
    // 各ゲートの初期状態確認
    console.log('\n📍 ゲートの初期状態:');
    gates.forEach(gate => {
      console.log(`  ${gate.id} (${gate.type}): output=${gate.output}, inputs=${JSON.stringify(gate.inputs)}`);
    });
    
    // ワイヤー接続確認
    console.log('\n🔌 ワイヤー接続:');
    wires.forEach(wire => {
      console.log(`  ${wire.id}: ${wire.from.gateId}[${wire.from.pinIndex}] → ${wire.to.gateId}[${wire.to.pinIndex}]`);
    });
    
    // 期待される動作
    console.log('\n🧮 期待される動作:');
    console.log('INPUT A = true, INPUT B = false');
    console.log('XOR(true, false) = true → OUTPUT SUM should be true');
    console.log('AND(true, false) = false → OUTPUT CARRY should be false');
  });

  test('半加算器の回路評価詳細', () => {
    console.log('\n📊 半加算器の回路評価詳細');
    
    const halfAdder = FEATURED_CIRCUITS.find(circuit => circuit.id === 'half-adder');
    if (!halfAdder) throw new Error('Half adder not found');
    
    const { gates, wires } = halfAdder;
    const circuitState = { gates, wires };
    
    console.log('評価前の状態:');
    gates.filter(g => g.type === 'INPUT').forEach(gate => {
      console.log(`  ${gate.id}: output=${gate.output}`);
    });
    
    // 回路評価実行
    const result = evaluator.evaluate(circuitState);
    
    console.log('\n評価結果:', {
      hasResult: !!result,
      hasCircuit: !!result?.circuit,
      evaluationInfo: result?.evaluationInfo
    });
    
    if (result && result.circuit) {
      console.log('✅ 評価成功');
      
      const updatedGates = result.circuit.gates;
      
      // 評価後の各ゲート状態確認
      console.log('\n📍 評価後のゲート状態:');
      updatedGates.forEach(gate => {
        const inputValue0 = gate.inputs && gate.inputs[0] !== undefined ? gate.inputs[0] : 'undefined';
        const inputValue1 = gate.inputs && gate.inputs[1] !== undefined ? gate.inputs[1] : 'undefined';
        console.log(`  ${gate.id} (${gate.type}): output=${gate.output}, inputs=[${inputValue0}, ${inputValue1}]`);
      });
      
      // XORとANDゲートの詳細確認
      console.log('\n🔧 論理ゲートの詳細確認:');
      const xorGate = updatedGates.find(g => g.id === 'xor-sum');
      const andGate = updatedGates.find(g => g.id === 'and-carry');
      
      if (xorGate) {
        console.log(`XOR SUM: inputs=${JSON.stringify(xorGate.inputs)}, output=${xorGate.output}`);
      }
      if (andGate) {
        console.log(`AND CARRY: inputs=${JSON.stringify(andGate.inputs)}, output=${andGate.output}`);
      }
      
      // OUTPUTゲートの状態確認
      console.log('\n💡 OUTPUT評価後状態:');
      const outputGates = updatedGates.filter(g => g.type === 'OUTPUT');
      let litOutputCount = 0;
      
      outputGates.forEach(gate => {
        const inputValue = getGateInputValue(gate, 0);
        if (inputValue) litOutputCount++;
        console.log(`  ${gate.id}: inputs=${JSON.stringify(gate.inputs)}, getGateInputValue=${inputValue}`);
      });
      
      console.log(`\n🚨 光っているOUTPUTゲート数: ${litOutputCount}/${outputGates.length}`);
      
      if (litOutputCount === 0) {
        console.log('❌ どのOUTPUTゲートも光らない');
        
        // デバッグ: 論理演算を手動で確認
        console.log('\n🔍 手動論理演算確認:');
        const inputA = updatedGates.find(g => g.id === 'input-a');
        const inputB = updatedGates.find(g => g.id === 'input-b');
        
        if (inputA && inputB) {
          const aValue = inputA.output;
          const bValue = inputB.output;
          console.log(`INPUT A: ${aValue}, INPUT B: ${bValue}`);
          console.log(`手動XOR: ${aValue} ⊕ ${bValue} = ${aValue !== bValue}`);
          console.log(`手動AND: ${aValue} ∧ ${bValue} = ${aValue && bValue}`);
        }
      } else {
        console.log(`✅ ${litOutputCount}個のOUTPUTゲートが光っている`);
      }
      
    } else {
      console.error('❌ 回路評価エラー:', result);
    }
  });

  test('手動での論理演算確認', () => {
    console.log('\n🧪 手動での論理演算確認');
    
    // INPUT状態: A=true, B=false
    const inputA = true;
    const inputB = false;
    
    console.log(`INPUT A: ${inputA}`);
    console.log(`INPUT B: ${inputB}`);
    
    // 期待される論理演算結果
    const expectedXOR = inputA !== inputB; // true ≠ false = true
    const expectedAND = inputA && inputB;  // true && false = false
    
    console.log(`期待されるXOR結果: ${expectedXOR}`);
    console.log(`期待されるAND結果: ${expectedAND}`);
    
    // 期待される出力
    console.log('\n期待される最終出力:');
    console.log(`OUTPUT SUM (XOR): ${expectedXOR} → ${expectedXOR ? '光る' : '光らない'}`);
    console.log(`OUTPUT CARRY (AND): ${expectedAND} → ${expectedAND ? '光る' : '光らない'}`);
    
    expect(expectedXOR).toBe(true);
    expect(expectedAND).toBe(false);
  });
});
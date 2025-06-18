/**
 * 🚨 4ビット比較器の出力問題調査
 * 
 * A=5, B=3に設定されているのに、なぜ出力ゲートが光らないのかを調査
 */

import { COMPARATOR_4BIT } from '../../src/features/gallery/data/comparator-circuit';
import { EnhancedHybridEvaluator } from '../../src/domain/simulation/event-driven-minimal/EnhancedHybridEvaluator';
import { getGateInputValue } from '../../src/domain/simulation/signalConversion';

describe('4ビット比較器出力問題調査', () => {
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

  test('4ビット比較器の構成と初期状態確認', () => {
    console.log('🔍 4ビット比較器の構成と初期状態確認');
    
    const { gates, wires } = COMPARATOR_4BIT;
    console.log(`ゲート数: ${gates.length}, ワイヤー数: ${wires.length}`);
    
    // A入力とB入力の確認
    console.log('\n📍 A入力 (期待値: A=5=0101):');
    ['a3', 'a2', 'a1', 'a0'].forEach(id => {
      const gate = gates.find(g => g.id === id);
      if (gate) {
        console.log(`  ${id}: ${gate.output} (期待: ${id==='a2'||id==='a0' ? 'true' : 'false'})`);
      }
    });
    
    console.log('\n📍 B入力 (期待値: B=3=0011):');
    ['b3', 'b2', 'b1', 'b0'].forEach(id => {
      const gate = gates.find(g => g.id === id);
      if (gate) {
        console.log(`  ${id}: ${gate.output} (期待: ${id==='b1'||id==='b0' ? 'true' : 'false'})`);
      }
    });
    
    // 出力ゲート確認
    console.log('\n📍 出力ゲート:');
    const outputGates = gates.filter(g => g.type === 'OUTPUT');
    outputGates.forEach(gate => {
      console.log(`  ${gate.id}: ${gate.type}`);
    });
    
    // 期待される結果
    console.log('\n🧮 期待される動作:');
    console.log('A=5 (0101), B=3 (0011)');
    console.log('A > B なので、A>B出力が光るはず');
  });

  test('4ビット比較器の回路評価詳細', () => {
    console.log('\n📊 4ビット比較器の回路評価詳細');
    
    const { gates, wires } = COMPARATOR_4BIT;
    const circuitState = { gates, wires };
    
    // 回路評価実行
    const result = evaluator.evaluate(circuitState);
    
    console.log('評価結果:', {
      hasResult: !!result,
      hasCircuit: !!result?.circuit,
      evaluationInfo: result?.evaluationInfo
    });
    
    if (result && result.circuit) {
      console.log('✅ 評価成功');
      
      const updatedGates = result.circuit.gates;
      
      // 評価後のA入力とB入力確認
      console.log('\n📍 評価後のA入力:');
      ['a3', 'a2', 'a1', 'a0'].forEach(id => {
        const gate = updatedGates.find(g => g.id === id);
        if (gate) {
          console.log(`  ${id}: ${gate.output}`);
        }
      });
      
      console.log('\n📍 評価後のB入力:');
      ['b3', 'b2', 'b1', 'b0'].forEach(id => {
        const gate = updatedGates.find(g => g.id === id);
        if (gate) {
          console.log(`  ${id}: ${gate.output}`);
        }
      });
      
      // 中間ゲートの状態確認（XORとNOTなど）
      console.log('\n🔧 中間ゲートの状態:');
      const intermediateGates = updatedGates.filter(g => 
        g.type === 'XOR' || g.type === 'NOT' || g.type === 'AND' || g.type === 'OR'
      );
      intermediateGates.slice(0, 10).forEach(gate => { // 最初の10個のみ表示
        console.log(`  ${gate.id} (${gate.type}): output=${gate.output}, inputs=${JSON.stringify(gate.inputs)}`);
      });
      
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
        
        // 手動計算での検証
        console.log('\n🔍 手動計算での検証:');
        const aInputs = ['a3', 'a2', 'a1', 'a0'].map(id => 
          updatedGates.find(g => g.id === id)?.output || false
        );
        const bInputs = ['b3', 'b2', 'b1', 'b0'].map(id => 
          updatedGates.find(g => g.id === id)?.output || false
        );
        
        console.log(`A inputs: [${aInputs.join(', ')}] = ${aInputs[3] ? 1 : 0}${aInputs[2] ? 1 : 0}${aInputs[1] ? 1 : 0}${aInputs[0] ? 1 : 0}`);
        console.log(`B inputs: [${bInputs.join(', ')}] = ${bInputs[3] ? 1 : 0}${bInputs[2] ? 1 : 0}${bInputs[1] ? 1 : 0}${bInputs[0] ? 1 : 0}`);
        
        const aValue = aInputs[0] ? 1 : 0 + (aInputs[1] ? 2 : 0) + (aInputs[2] ? 4 : 0) + (aInputs[3] ? 8 : 0);
        const bValue = bInputs[0] ? 1 : 0 + (bInputs[1] ? 2 : 0) + (bInputs[2] ? 4 : 0) + (bInputs[3] ? 8 : 0);
        
        console.log(`A値: ${aValue}, B値: ${bValue}`);
        console.log(`期待される結果: A>B=${aValue>bValue}, A=B=${aValue===bValue}, A<B=${aValue<bValue}`);
      } else {
        console.log(`✅ ${litOutputCount}個のOUTPUTゲートが光っている`);
      }
      
    } else {
      console.error('❌ 回路評価エラー:', result);
    }
  });

  test('ビット別等価チェック確認', () => {
    console.log('\n🧪 ビット別等価チェック確認');
    
    // 手動でビット別の比較を確認
    const aInputs = [false, true, false, true]; // A=5 (a3,a2,a1,a0)
    const bInputs = [false, false, true, true]; // B=3 (b3,b2,b1,b0)
    
    console.log('ビット別比較:');
    for (let i = 0; i < 4; i++) {
      const equal = aInputs[i] === bInputs[i];
      const aGreater = aInputs[i] && !bInputs[i];
      const bGreater = !aInputs[i] && bInputs[i];
      console.log(`  Bit ${i}: A=${aInputs[i]}, B=${bInputs[i]} → 等価=${equal}, A>B=${aGreater}, A<B=${bGreater}`);
    }
    
    console.log('\n最上位ビットから比較:');
    console.log('Bit 3: A=false, B=false → 等価');
    console.log('Bit 2: A=true, B=false → A>B確定！');
    console.log('→ 結果: A>B出力が光るべき');
  });
});
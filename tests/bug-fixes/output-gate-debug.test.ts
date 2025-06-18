/**
 * 🚨 OUTPUTゲートが光らないバグの調査
 * 
 * ユーザー報告：「シンプルリングで、信号は流れているようだが、出力ゲートが光らない！」
 */

import { SIMPLE_RING_OSCILLATOR } from '../../src/features/gallery/data/simple-ring-oscillator';
import { EnhancedHybridEvaluator } from '../../src/domain/simulation/event-driven-minimal/EnhancedHybridEvaluator';
import { getGateInputValue } from '../../src/domain/simulation/signalConversion';
import { debug } from '../../src/shared/debug';

describe('OUTPUTゲート光らないバグ調査', () => {
  let evaluator: EnhancedHybridEvaluator;

  beforeEach(() => {
    evaluator = new EnhancedHybridEvaluator({
      strategy: 'AUTO_SELECT',
      autoSelectionThresholds: {
        maxGatesForLegacy: 10,
        minGatesForEventDriven: 20,
      },
      enablePerformanceTracking: true,
      enableDebugLogging: true,
      delayMode: false,
    });
  });

  test('シンプルリングオシレータのOUTPUTゲート状態確認', () => {
    console.log('🔍 シンプルリングオシレータの構成確認');
    
    // ギャラリーデータの確認
    const { gates, wires } = SIMPLE_RING_OSCILLATOR;
    console.log(`ゲート数: ${gates.length}`);
    console.log(`ワイヤー数: ${wires.length}`);
    
    // NOTゲートとOUTPUTゲートの初期状態
    const notGates = gates.filter(g => g.type === 'NOT');
    const outputGates = gates.filter(g => g.type === 'OUTPUT');
    
    console.log('🔧 NOTゲート初期状態:');
    notGates.forEach(gate => {
      console.log(`  ${gate.id}: output=${gate.output}, inputs=${JSON.stringify(gate.inputs)}`);
    });
    
    console.log('💡 OUTPUTゲート初期状態:');
    outputGates.forEach(gate => {
      const inputValue = getGateInputValue(gate, 0);
      console.log(`  ${gate.id}: inputs=${JSON.stringify(gate.inputs)}, getGateInputValue=${inputValue}`);
    });

    // 回路評価を実行（EnhancedHybridEvaluator使用）
    console.log('\n📊 回路評価実行（EnhancedHybridEvaluator使用）');
    const circuitState = { gates, wires };
    const result = evaluator.evaluate(circuitState);
    
    console.log('評価結果:', result);
    
    // デバッグ：evaluationInfoを詳細確認
    if (result && result.evaluationInfo) {
      console.log('🔍 evaluationInfo詳細:', result.evaluationInfo);
    }
    
    if (result && result.circuit) {
      const updatedGates = result.circuit.gates;
      
      console.log('🔧 NOTゲート評価後状態:');
      const updatedNotGates = updatedGates.filter(g => g.type === 'NOT');
      updatedNotGates.forEach(gate => {
        console.log(`  ${gate.id}: output=${gate.output}, inputs=${JSON.stringify(gate.inputs)}`);
      });
      
      console.log('💡 OUTPUTゲート評価後状態:');
      const updatedOutputGates = updatedGates.filter(g => g.type === 'OUTPUT');
      updatedOutputGates.forEach(gate => {
        const inputValue = getGateInputValue(gate, 0);
        console.log(`  ${gate.id}: inputs=${JSON.stringify(gate.inputs)}, getGateInputValue=${inputValue}`);
      });
      
      // OUTPUTゲートが光るかチェック
      const shouldLightUp = updatedOutputGates.some(gate => getGateInputValue(gate, 0));
      console.log(`\n🚨 いずれかのOUTPUTゲートが光るか: ${shouldLightUp}`);
      
      if (!shouldLightUp) {
        console.log('❌ バグ確認: OUTPUTゲートが光らない');
        
        // ワイヤー接続状況の詳細確認
        console.log('\n🔌 ワイヤー接続状況:');
        wires.forEach(wire => {
          const fromGate = updatedGates.find(g => g.id === wire.from.gateId);
          const toGate = updatedGates.find(g => g.id === wire.to.gateId);
          console.log(`  ${wire.id}: ${wire.from.gateId}(output=${fromGate?.output}) → ${wire.to.gateId}(input[${wire.to.pinIndex}]=${toGate?.inputs[wire.to.pinIndex]})`);
        });
      }
      
    } else {
      console.error('❌ 回路評価エラー:', result);
    }
  });

  test('遅延モードでの動作確認', () => {
    console.log('\n🚀 遅延モードでの動作確認');
    
    // 遅延モード用エバリュエーター
    const delayEvaluator = new EnhancedHybridEvaluator({
      strategy: 'AUTO_SELECT',
      autoSelectionThresholds: {
        maxGatesForLegacy: 10,
        minGatesForEventDriven: 20,
      },
      enablePerformanceTracking: true,
      enableDebugLogging: true,
      delayMode: true,
    });
    
    const { gates, wires } = SIMPLE_RING_OSCILLATOR;
    const circuitState = { gates, wires };
    
    const result = delayEvaluator.evaluate(circuitState);
    console.log('遅延モード評価結果:', result);
    
    if (result && result.circuit) {
      console.log('✅ 遅延モードでも評価成功');
      
      const updatedOutputGates = result.circuit.gates.filter(g => g.type === 'OUTPUT');
      console.log('💡 遅延モード後のOUTPUTゲート状態:');
      updatedOutputGates.forEach(gate => {
        const inputValue = getGateInputValue(gate, 0);
        console.log(`  ${gate.id}: inputs=${JSON.stringify(gate.inputs)}, getGateInputValue=${inputValue}`);
      });
    } else {
      console.error('❌ 遅延モード評価エラー:', result);
    }
  });
});
/**
 * 🚨 フィボナッチカウンターのバグ調査
 * 
 * ユーザー報告：「フィボナッチカウンターには、どこにも接続していない入力ゲートがポツンと存在している」
 */

import { FIBONACCI_COUNTER } from '../../src/features/gallery/data/fibonacci-counter';
import { EnhancedHybridEvaluator } from '../../src/domain/simulation/event-driven-minimal/EnhancedHybridEvaluator';
import { getGateInputValue } from '../../src/domain/simulation/signalConversion';

describe('フィボナッチカウンターバグ調査', () => {
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

  test('フィボナッチカウンターの構成確認', () => {
    console.log('🔍 フィボナッチカウンターの構成確認');
    
    const { gates, wires } = FIBONACCI_COUNTER;
    console.log(`ゲート数: ${gates.length}`);
    console.log(`ワイヤー数: ${wires.length}`);
    
    // ゲート種別の分布確認
    const gateTypes = gates.reduce((acc, gate) => {
      acc[gate.type] = (acc[gate.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('ゲート種別:', gateTypes);
    
    // 未接続ゲートの検出
    console.log('\n🔌 未接続ゲートの検出:');
    
    const connectedGateIds = new Set<string>();
    wires.forEach(wire => {
      connectedGateIds.add(wire.from.gateId);
      connectedGateIds.add(wire.to.gateId);
    });
    
    const unconnectedGates = gates.filter(gate => !connectedGateIds.has(gate.id));
    console.log(`未接続ゲート数: ${unconnectedGates.length}`);
    
    if (unconnectedGates.length > 0) {
      console.log('❌ 未接続ゲート一覧:');
      unconnectedGates.forEach(gate => {
        console.log(`  - ${gate.id} (${gate.type}): position=${JSON.stringify(gate.position)}`);
      });
    } else {
      console.log('✅ すべてのゲートが接続されています');
    }
    
    // 特定のゲートの接続状況詳細確認
    console.log('\n📍 resetゲートの接続状況:');
    const resetGate = gates.find(g => g.id === 'reset');
    if (resetGate) {
      const resetAsSource = wires.filter(w => w.from.gateId === 'reset');
      const resetAsTarget = wires.filter(w => w.to.gateId === 'reset');
      
      console.log(`resetゲート: type=${resetGate.type}, output=${resetGate.output}`);
      console.log(`出力接続数: ${resetAsSource.length}`);
      console.log(`入力接続数: ${resetAsTarget.length}`);
      
      if (resetAsSource.length === 0 && resetAsTarget.length === 0) {
        console.log('❌ resetゲートは完全に未接続です！');
      }
    }
  });

  test('フィボナッチカウンターの回路評価', () => {
    console.log('\n📊 フィボナッチカウンターの回路評価');
    
    const { gates, wires } = FIBONACCI_COUNTER;
    const circuitState = { gates, wires };
    const result = evaluator.evaluate(circuitState);
    
    console.log('評価結果:', {
      hasResult: !!result,
      hasCircuit: !!result?.circuit,
      evaluationInfo: result?.evaluationInfo
    });
    
    if (result && result.circuit) {
      console.log('✅ 評価成功');
      
      const updatedGates = result.circuit.gates;
      
      // CLOCKゲートの状態確認
      const updatedClockGate = updatedGates.find(g => g.type === 'CLOCK');
      console.log('CLOCK評価後:', {
        id: updatedClockGate?.id,
        output: updatedClockGate?.output,
        inputs: updatedClockGate?.inputs
      });
      
      // D-FFレジスタの状態確認（A, B）
      console.log('🔧 レジスタA状態:');
      ['reg_a_0', 'reg_a_1', 'reg_a_2'].forEach(id => {
        const gate = updatedGates.find(g => g.id === id);
        if (gate) {
          console.log(`  ${id}: output=${gate.output}, inputs=${JSON.stringify(gate.inputs)}`);
        }
      });
      
      console.log('🔧 レジスタB状態:');
      ['reg_b_0', 'reg_b_1', 'reg_b_2'].forEach(id => {
        const gate = updatedGates.find(g => g.id === id);
        if (gate) {
          console.log(`  ${id}: output=${gate.output}, inputs=${JSON.stringify(gate.inputs)}`);
        }
      });
      
      // OUTPUTゲートの評価後状態
      console.log('💡 OUTPUT評価後状態:');
      const updatedOutputGates = updatedGates.filter(g => g.type === 'OUTPUT');
      let litOutputCount = 0;
      
      updatedOutputGates.forEach(gate => {
        const inputValue = getGateInputValue(gate, 0);
        if (inputValue) litOutputCount++;
        console.log(`  ${gate.id}: inputs=${JSON.stringify(gate.inputs)}, getGateInputValue=${inputValue}`);
      });
      
      console.log(`\n🚨 光っているOUTPUTゲート数: ${litOutputCount}/${updatedOutputGates.length}`);
      
      if (litOutputCount === 0) {
        console.log('❌ どのOUTPUTゲートも光らない');
      } else {
        console.log(`✅ ${litOutputCount}個のOUTPUTゲートが光っている`);
      }
      
    } else {
      console.error('❌ 回路評価エラー:', result);
    }
  });

  test('未接続ゲートの修正案検討', () => {
    console.log('\n🔧 未接続ゲートの修正案検討');
    
    const { gates } = FIBONACCI_COUNTER;
    
    // resetゲートがどのように使われるべきかを考察
    console.log('resetゲートの用途分析:');
    console.log('- resetゲートは通常、レジスタを初期状態にリセットするために使用');
    console.log('- フィボナッチカウンターでは、A=1, B=1 の初期状態にリセットすることが考えられる');
    console.log('- resetが有効な時は、各D-FFの入力をreset信号またはその否定に接続すべき');
    
    // D-FFゲートの接続状況確認
    const dffGates = gates.filter(g => g.type === 'D-FF');
    console.log(`\nD-FFゲート数: ${dffGates.length}`);
    
    console.log('\n推奨修正案:');
    console.log('1. resetゲートを削除（使用されていないため）');
    console.log('2. または、resetロジックを実装:');
    console.log('   - resetが有効な時: reg_a_0 = 1, reg_a_1 = 0, reg_a_2 = 0');
    console.log('   - resetが有効な時: reg_b_0 = 1, reg_b_1 = 0, reg_b_2 = 0');
    console.log('   - MUXゲートを使用してreset時とnormal時の入力を切り替え');
  });

  test('回路設計の一貫性確認', () => {
    console.log('\n🔍 回路設計の一貫性確認');
    
    const { gates, wires } = FIBONACCI_COUNTER;
    
    // すべてのOUTPUTゲートが適切に接続されているか確認
    const outputGates = gates.filter(g => g.type === 'OUTPUT');
    console.log(`OUTPUTゲート数: ${outputGates.length}`);
    
    let disconnectedOutputs = 0;
    outputGates.forEach(gate => {
      const inputWires = wires.filter(w => w.to.gateId === gate.id);
      if (inputWires.length === 0) {
        console.log(`❌ 未接続のOUTPUTゲート: ${gate.id}`);
        disconnectedOutputs++;
      }
    });
    
    if (disconnectedOutputs === 0) {
      console.log('✅ すべてのOUTPUTゲートが接続されています');
    } else {
      console.log(`❌ ${disconnectedOutputs}個のOUTPUTゲートが未接続です`);
    }
    
    // CLOCKゲートの分配確認
    const clockWires = wires.filter(w => w.from.gateId === 'clock');
    console.log(`CLOCKゲートの出力接続数: ${clockWires.length}`);
    
    const dffGates = gates.filter(g => g.type === 'D-FF');
    const clockedDFFs = dffGates.filter(dff => 
      wires.some(w => w.from.gateId === 'clock' && w.to.gateId === dff.id && w.to.pinIndex === 1)
    );
    
    console.log(`D-FFゲート数: ${dffGates.length}`);
    console.log(`CLOCKが接続されたD-FF数: ${clockedDFFs.length}`);
    
    if (clockedDFFs.length === dffGates.length) {
      console.log('✅ すべてのD-FFにCLOCKが接続されています');
    } else {
      console.log('❌ 一部のD-FFにCLOCKが接続されていません');
    }
  });
});
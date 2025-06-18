/**
 * 🚨 カオス発生器のバグ調査
 * 
 * ユーザー報告：「カオス発生器はどの出力ゲートもまったく光らない」
 */

import { CHAOS_GENERATOR } from '../../src/features/gallery/data/chaos-generator';
import { EnhancedHybridEvaluator } from '../../src/domain/simulation/event-driven-minimal/EnhancedHybridEvaluator';
import { getGateInputValue } from '../../src/domain/simulation/signalConversion';

describe('カオス発生器バグ調査', () => {
  let evaluator: EnhancedHybridEvaluator;

  beforeEach(() => {
    evaluator = new EnhancedHybridEvaluator({
      strategy: 'AUTO_SELECT',
      autoSelectionThresholds: {
        maxGatesForLegacy: 10,
        minGatesForEventDriven: 20,
      },
      enablePerformanceTracking: true,
      enableDebugLogging: false, // 詳細すぎるので通常はOFF
      delayMode: false,
    });
  });

  test('カオス発生器の構成確認', () => {
    console.log('🔍 カオス発生器の構成確認');
    
    const { gates, wires } = CHAOS_GENERATOR;
    console.log(`ゲート数: ${gates.length}`);
    console.log(`ワイヤー数: ${wires.length}`);
    
    // ゲート種別の分布確認
    const gateTypes = gates.reduce((acc, gate) => {
      acc[gate.type] = (acc[gate.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('ゲート種別:', gateTypes);
    
    // CLOCKゲートの設定確認
    const clockGate = gates.find(g => g.type === 'CLOCK');
    console.log('CLOCKゲート:', {
      id: clockGate?.id,
      output: clockGate?.output,
      metadata: clockGate?.metadata
    });
    
    // D-FFゲートの初期状態確認
    const dffGates = gates.filter(g => g.type === 'D-FF');
    console.log('D-FFゲート初期状態:');
    dffGates.forEach(gate => {
      console.log(`  ${gate.id}: output=${gate.output}, inputs=${JSON.stringify(gate.inputs)}, metadata=${JSON.stringify(gate.metadata)}`);
    });
    
    // OUTPUTゲートの初期状態確認
    const outputGates = gates.filter(g => g.type === 'OUTPUT');
    console.log('OUTPUTゲート初期状態:');
    outputGates.forEach(gate => {
      const inputValue = getGateInputValue(gate, 0);
      console.log(`  ${gate.id}: inputs=${JSON.stringify(gate.inputs)}, getGateInputValue=${inputValue}`);
    });
  });

  test('カオス発生器の回路評価', () => {
    console.log('\n📊 カオス発生器の回路評価');
    
    const { gates, wires } = CHAOS_GENERATOR;
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
      
      // D-FFゲートの評価後状態
      console.log('🔧 D-FF評価後状態:');
      const updatedDffGates = updatedGates.filter(g => g.type === 'D-FF');
      updatedDffGates.forEach(gate => {
        console.log(`  ${gate.id}: output=${gate.output}, inputs=${JSON.stringify(gate.inputs)}`);
      });
      
      // XORゲートの状態
      const xorGate = updatedGates.find(g => g.type === 'XOR');
      console.log('XOR評価後:', {
        id: xorGate?.id,
        output: xorGate?.output,
        inputs: JSON.stringify(xorGate?.inputs)
      });
      
      // OUTPUTゲートの評価後状態
      console.log('💡 OUTPUT評価後状態:');
      const updatedOutputGates = updatedGates.filter(g => g.type === 'OUTPUT');
      updatedOutputGates.forEach(gate => {
        const inputValue = getGateInputValue(gate, 0);
        console.log(`  ${gate.id}: inputs=${JSON.stringify(gate.inputs)}, getGateInputValue=${inputValue}, shouldLight=${inputValue}`);
      });
      
      // いずれかの出力ゲートが光るかチェック
      const anyOutputLit = updatedOutputGates.some(gate => getGateInputValue(gate, 0));
      console.log(`\n🚨 いずれかのOUTPUTゲートが光るか: ${anyOutputLit}`);
      
      if (!anyOutputLit) {
        console.log('❌ バグ確認: どのOUTPUTゲートも光らない');
        
        // ワイヤー接続状況の詳細確認
        console.log('\n🔌 重要なワイヤー接続状況:');
        const criticalWires = [
          'observe_bit3', 'observe_bit2', 'observe_bit1', 'observe_bit0', 'random_tap'
        ];
        
        criticalWires.forEach(wireId => {
          const wire = wires.find(w => w.id === wireId);
          if (wire) {
            const fromGate = updatedGates.find(g => g.id === wire.from.gateId);
            const toGate = updatedGates.find(g => g.id === wire.to.gateId);
            console.log(`  ${wireId}: ${wire.from.gateId}(output=${fromGate?.output}) → ${wire.to.gateId}(input[${wire.to.pinIndex}]=${toGate?.inputs[wire.to.pinIndex]})`);
          }
        });
      } else {
        console.log('✅ 少なくとも一部のOUTPUTゲートが正常に光っている');
      }
      
    } else {
      console.error('❌ 回路評価エラー:', result);
    }
  });

  test('CLOCKゲート単体の動作確認', () => {
    console.log('\n⏰ CLOCKゲート単体の動作確認');
    
    // CLOCKゲートのみのシンプルな回路を作成
    const simpleClock = {
      gates: [
        {
          id: 'clock',
          type: 'CLOCK' as const,
          position: { x: 100, y: 100 },
          output: true,
          inputs: [],
          metadata: { frequency: 1, isRunning: true },
        },
        {
          id: 'out_clock',
          type: 'OUTPUT' as const,
          position: { x: 200, y: 100 },
          output: false,
          inputs: [''],
        }
      ],
      wires: [
        {
          id: 'clock_to_out',
          from: { gateId: 'clock', pinIndex: -1 },
          to: { gateId: 'out_clock', pinIndex: 0 },
          isActive: false,
        }
      ]
    };
    
    const result = evaluator.evaluate(simpleClock);
    if (result && result.circuit) {
      const outputGate = result.circuit.gates.find(g => g.type === 'OUTPUT');
      const inputValue = getGateInputValue(outputGate!, 0);
      console.log(`CLOCKゲート→OUTPUTゲート: inputValue=${inputValue}`);
      
      if (inputValue) {
        console.log('✅ CLOCKゲートは正常に動作している');
      } else {
        console.log('❌ CLOCKゲートに問題がある可能性');
      }
    }
  });

  test('D-FFゲート単体の動作確認', () => {
    console.log('\n🔄 D-FFゲート単体の動作確認');
    
    // D-FFゲートのシンプルな回路を作成
    const simpleDFF = {
      gates: [
        {
          id: 'input_d',
          type: 'INPUT' as const,
          position: { x: 100, y: 100 },
          output: true, // D入力をtrueに設定
          inputs: [],
        },
        {
          id: 'input_clk',
          type: 'INPUT' as const,
          position: { x: 100, y: 150 },
          output: true, // CLK入力をtrueに設定
          inputs: [],
        },
        {
          id: 'dff',
          type: 'D-FF' as const,
          position: { x: 200, y: 125 },
          output: false,
          inputs: ['', ''],
        },
        {
          id: 'out_q',
          type: 'OUTPUT' as const,
          position: { x: 300, y: 125 },
          output: false,
          inputs: [''],
        }
      ],
      wires: [
        {
          id: 'd_to_dff',
          from: { gateId: 'input_d', pinIndex: -1 },
          to: { gateId: 'dff', pinIndex: 0 },
          isActive: false,
        },
        {
          id: 'clk_to_dff',
          from: { gateId: 'input_clk', pinIndex: -1 },
          to: { gateId: 'dff', pinIndex: 1 },
          isActive: false,
        },
        {
          id: 'dff_to_out',
          from: { gateId: 'dff', pinIndex: -1 },
          to: { gateId: 'out_q', pinIndex: 0 },
          isActive: false,
        }
      ]
    };
    
    const result = evaluator.evaluate(simpleDFF);
    if (result && result.circuit) {
      const dffGate = result.circuit.gates.find(g => g.type === 'D-FF');
      const outputGate = result.circuit.gates.find(g => g.type === 'OUTPUT');
      const inputValue = getGateInputValue(outputGate!, 0);
      
      console.log(`D-FF状態: output=${dffGate?.output}, inputs=${JSON.stringify(dffGate?.inputs)}`);
      console.log(`OUTPUT状態: inputValue=${inputValue}`);
      
      if (inputValue) {
        console.log('✅ D-FFゲートは正常に動作している');
      } else {
        console.log('❌ D-FFゲートに問題がある可能性');
      }
    }
  });
});
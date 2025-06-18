import { describe, it, expect } from 'vitest';
import { EnhancedHybridEvaluator } from '@/domain/simulation/event-driven-minimal';
import { SELF_OSCILLATING_MEMORY } from '@/features/gallery/data/self-oscillating-memory';
import type { Circuit } from '@/domain/simulation/core/types';
import { getGateInputValue } from '@/domain/simulation';

/**
 * 🔍 セルフオシレーティングメモリのOUTPUTピン状態調査
 */
describe('🔍 セルフオシレーティングメモリ - OUTPUTピン状態調査', () => {
  const evaluator = new EnhancedHybridEvaluator({
    strategy: 'AUTO_SELECT',
    enableDebugLogging: false,
  });

  it('🎯 OUTPUTゲートの入力値とピン状態を確認', () => {
    const circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY.gates],
      wires: [...SELF_OSCILLATING_MEMORY.wires],
    };

    console.log('\n=== 🎯 OUTPUTゲートのピン状態調査 ===');
    
    const result = evaluator.evaluate(circuit);
    const updatedCircuit = result.circuit;
    
    // 全てのOUTPUTゲートを確認
    const outputGates = updatedCircuit.gates.filter(g => g.type === 'OUTPUT');
    
    console.log(`\n📊 OUTPUTゲート一覧 (${outputGates.length}個):`);
    
    outputGates.forEach(gate => {
      const inputValue = getGateInputValue(gate, 0);
      const gateOutput = gate.output;
      const inputs = gate.inputs;
      
      console.log(`\n🔌 ${gate.id}:`);
      console.log(`  入力値 (getGateInputValue): ${inputValue}`);
      console.log(`  ゲート出力 (gate.output): ${gateOutput}`);
      console.log(`  ゲート入力配列: [${inputs}]`);
      console.log(`  期待される表示: ${inputValue ? '💚 光る' : '⚫ 暗い'}`);
      
      // 入力接続をチェック
      const inputWires = updatedCircuit.wires.filter(w => w.to.gateId === gate.id);
      console.log(`  接続ワイヤー数: ${inputWires.length}`);
      
      inputWires.forEach((wire, index) => {
        const sourceGate = updatedCircuit.gates.find(g => g.id === wire.from.gateId);
        console.log(`    ワイヤー${index + 1}: ${wire.from.gateId} (${sourceGate?.type}) → ${gate.id}`);
        console.log(`      ソース出力: ${sourceGate?.output}, ワイヤーアクティブ: ${wire.isActive}`);
        console.log(`      pinIndex: ${wire.from.pinIndex} → ${wire.to.pinIndex}`);
      });
    });
    
    expect(outputGates.length).toBeGreaterThan(0);
  });

  it('🔄 Enable入力変更時のOUTPUT状態変化を確認', () => {
    let circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY.gates],
      wires: [...SELF_OSCILLATING_MEMORY.wires],
    };

    console.log('\n=== 🔄 Enable入力変更時のOUTPUT状態変化 ===');
    
    // 初期状態
    console.log('\n📌 初期状態 (Enable=true):');
    let result = evaluator.evaluate(circuit);
    circuit = result.circuit;
    
    const outputGates = circuit.gates.filter(g => g.type === 'OUTPUT');
    outputGates.forEach(gate => {
      const inputValue = getGateInputValue(gate, 0);
      console.log(`  ${gate.id}: 入力=${inputValue}, 出力=${gate.output}`);
    });
    
    // Enable を false に変更
    const enableGate = circuit.gates.find(g => g.id === 'enable');
    if (enableGate) {
      enableGate.output = false;
      console.log('\n📌 Enable=false に変更:');
      
      result = evaluator.evaluate(circuit);
      circuit = result.circuit;
      
      const updatedOutputGates = circuit.gates.filter(g => g.type === 'OUTPUT');
      updatedOutputGates.forEach(gate => {
        const inputValue = getGateInputValue(gate, 0);
        console.log(`  ${gate.id}: 入力=${inputValue}, 出力=${gate.output}`);
      });
    }
    
    // Enable を true に戻す
    const enableGate2 = circuit.gates.find(g => g.id === 'enable');
    if (enableGate2) {
      enableGate2.output = true;
      console.log('\n📌 Enable=true に戻す:');
      
      result = evaluator.evaluate(circuit);
      circuit = result.circuit;
      
      const finalOutputGates = circuit.gates.filter(g => g.type === 'OUTPUT');
      finalOutputGates.forEach(gate => {
        const inputValue = getGateInputValue(gate, 0);
        console.log(`  ${gate.id}: 入力=${inputValue}, 出力=${gate.output} ${inputValue ? '💚' : '⚫'}`);
      });
    }
    
    expect(outputGates.length).toBeGreaterThan(0);
  });

  it('🔧 getGateInputValue関数の動作詳細デバッグ', () => {
    const circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY.gates],
      wires: [...SELF_OSCILLATING_MEMORY.wires],
    };

    console.log('\n=== 🔧 getGateInputValue関数デバッグ ===');
    
    // Enable を true に設定
    const enableGate = circuit.gates.find(g => g.id === 'enable');
    if (enableGate) {
      enableGate.output = true;
    }
    
    const result = evaluator.evaluate(circuit);
    const updatedCircuit = result.circuit;
    
    // out_mem1_q を詳細デバッグ
    const testGate = updatedCircuit.gates.find(g => g.id === 'out_mem1_q');
    if (testGate) {
      console.log('\n🎯 out_mem1_q 詳細デバッグ:');
      console.log(`  gate.inputs 配列: ${JSON.stringify(testGate.inputs)}`);
      console.log(`  gate.inputs の型: ${typeof testGate.inputs}`);
      console.log(`  gate.inputs[0]: ${testGate.inputs[0]}`);
      console.log(`  gate.inputs[0] の型: ${typeof testGate.inputs[0]}`);
      console.log(`  gate.inputs[0] === true: ${testGate.inputs[0] === true}`);
      console.log(`  gate.inputs[0] === false: ${testGate.inputs[0] === false}`);
      console.log(`  gate.inputs[0] === '1': ${testGate.inputs[0] === '1'}`);
      console.log(`  gate.inputs[0] === '': ${testGate.inputs[0] === ''}`);
      
      // getGateInputValue の計算過程をトレース
      const input = testGate.inputs[0];
      console.log(`\n🔍 getGateInputValue計算過程:`);
      console.log(`  input = gate.inputs[0] = ${input}`);
      console.log(`  typeof input = ${typeof input}`);
      
      if (typeof input === 'boolean') {
        console.log(`  boolean分岐: return ${input}`);
      } else {
        const stringResult = input === '1';
        console.log(`  string分岐: displayStateToBoolean('${input}') = ${stringResult}`);
      }
      
      const actualResult = getGateInputValue(testGate, 0);
      console.log(`  実際の結果: ${actualResult}`);
    }
    
    expect(result).toBeDefined();
  });

  it('🔌 ピンコンポーネントに渡される値を確認', () => {
    const circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY.gates],
      wires: [...SELF_OSCILLATING_MEMORY.wires],
    };

    console.log('\n=== 🔌 ピンコンポーネントへの値渡し確認 ===');
    
    // Enable を true に設定
    const enableGate = circuit.gates.find(g => g.id === 'enable');
    if (enableGate) {
      enableGate.output = true;
    }
    
    const result = evaluator.evaluate(circuit);
    const updatedCircuit = result.circuit;
    
    // 特定のOUTPUTゲートに焦点を当てる
    const testOutputs = [
      'out_mem1_q',
      'out_mem1_qbar', 
      'out_mem2_q',
      'out_mem2_qbar'
    ];
    
    console.log('\n🎯 主要OUTPUTゲートの詳細:');
    
    testOutputs.forEach(outputId => {
      const gate = updatedCircuit.gates.find(g => g.id === outputId);
      if (gate) {
        const inputValue = getGateInputValue(gate, 0);
        
        console.log(`\n🔌 ${outputId}:`);
        console.log(`  ゲート出力: ${gate.output}`);
        console.log(`  ゲート入力配列: [${gate.inputs}]`);
        console.log(`  getGateInputValue(gate, 0): ${inputValue}`);
        console.log(`  PinComponent isActive: ${inputValue} (IOGateRenderer line 119)`);
        console.log(`  期待される表示: ${inputValue ? '💚 光る' : '⚫ 暗い'}`);
        
        // 上流のSR-LATCHの状態も確認
        const inputWire = updatedCircuit.wires.find(w => w.to.gateId === outputId);
        if (inputWire) {
          const sourceGate = updatedCircuit.gates.find(g => g.id === inputWire.from.gateId);
          if (sourceGate) {
            console.log(`  上流ゲート: ${sourceGate.id} (${sourceGate.type})`);
            console.log(`  上流ゲート出力: ${sourceGate.output}`);
            console.log(`  上流ゲート outputs配列: [${sourceGate.outputs}]`);
            console.log(`  ワイヤー pinIndex: ${inputWire.from.pinIndex}`);
            console.log(`  ワイヤー isActive: ${inputWire.isActive}`);
          }
        }
      }
    });
    
    expect(result).toBeDefined();
  });
});
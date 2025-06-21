/**
 * ワイヤー伝達とOUTPUTゲート入力値のテスト
 * シンプルリングオシレータでOUTPUTが光らない問題の詳細調査
 */

import { describe, it, expect } from 'vitest';
import { SIMPLE_RING_OSCILLATOR } from '@/features/gallery/data/simple-ring-oscillator';
import { EnhancedHybridEvaluator } from '@/domain/simulation/event-driven-minimal';
import { getGateInputValue } from '@/domain/simulation/signalConversion';
import type { Circuit } from '@/domain/simulation/core/types';

describe('Wire Propagation and OUTPUT Gate Analysis', () => {
  const circuit: Circuit = {
    gates: SIMPLE_RING_OSCILLATOR.gates,
    wires: SIMPLE_RING_OSCILLATOR.wires,
  };

  it('should analyze initial circuit structure and connections', () => {
    console.log('🔌 Circuit Wire Analysis:');
    
    // NOTゲートとOUTPUTゲートの接続を確認
    const notGates = circuit.gates.filter(g => g.type === 'NOT');
    const outputGates = circuit.gates.filter(g => g.type === 'OUTPUT');
    
    console.log(`NOT gates: [${notGates.map(g => g.id).join(', ')}]`);
    console.log(`OUTPUT gates: [${outputGates.map(g => g.id).join(', ')}]`);
    
    // 各OUTPUTゲートに接続されているワイヤーを確認
    outputGates.forEach(outputGate => {
      const inputWire = circuit.wires.find(w => w.to.gateId === outputGate.id && w.to.pinIndex === 0);
      if (inputWire) {
        console.log(`${outputGate.id} ← ${inputWire.from.gateId} (wire: ${inputWire.id})`);
      } else {
        console.log(`${outputGate.id} ← [NO CONNECTION]`);
      }
    });
    
    expect(notGates).toHaveLength(3);
    expect(outputGates).toHaveLength(3);
  });

  it('should check initial input values of OUTPUT gates', () => {
    console.log('🔍 Initial OUTPUT Gate States:');
    
    const outputGates = circuit.gates.filter(g => g.type === 'OUTPUT');
    
    outputGates.forEach(outputGate => {
      const inputValue = getGateInputValue(outputGate, 0);
      console.log(`${outputGate.id}:`);
      console.log(`  - inputs[0]: "${outputGate.inputs[0]}" (type: ${typeof outputGate.inputs[0]})`);
      console.log(`  - getGateInputValue: ${inputValue}`);
      console.log(`  - gate.output: ${outputGate.output}`);
    });
  });

  it('should trace simulation steps and wire propagation', () => {
    const evaluator = new EnhancedHybridEvaluator({
      strategy: 'EVENT_DRIVEN_ONLY',
      delayMode: true,
      enableDebugLogging: false, // ログを抑制
    });

    console.log('🔄 Simulation Step Analysis:');
    
    let currentCircuit = circuit;
    
    for (let step = 0; step < 5; step++) {
      console.log(`\n--- Step ${step} ---`);
      
      // NOTゲートの状態
      const notGates = currentCircuit.gates.filter(g => g.type === 'NOT');
      console.log('NOT gates:');
      notGates.forEach(gate => {
        console.log(`  ${gate.id}: output=${gate.output}, inputs=[${gate.inputs.join(', ')}]`);
      });
      
      // OUTPUTゲートの状態（シミュレーション前）
      const outputGates = currentCircuit.gates.filter(g => g.type === 'OUTPUT');
      console.log('OUTPUT gates (before):');
      outputGates.forEach(gate => {
        const inputValue = getGateInputValue(gate, 0);
        console.log(`  ${gate.id}: inputs[0]="${gate.inputs[0]}" → inputValue=${inputValue}, output=${gate.output}`);
      });
      
      // シミュレーション実行
      const result = evaluator.evaluate(currentCircuit);
      currentCircuit = result.circuit;
      
      // OUTPUTゲートの状態（シミュレーション後）
      const outputGatesAfter = currentCircuit.gates.filter(g => g.type === 'OUTPUT');
      console.log('OUTPUT gates (after):');
      outputGatesAfter.forEach(gate => {
        const inputValue = getGateInputValue(gate, 0);
        console.log(`  ${gate.id}: inputs[0]="${gate.inputs[0]}" → inputValue=${inputValue}, output=${gate.output}`);
      });
    }
  });

  it('should verify wire propagation logic', () => {
    console.log('🔗 Wire Propagation Logic Test:');
    
    // 手動でワイヤー伝達をシミュレート
    const testCircuit = {
      gates: [...circuit.gates],
      wires: [...circuit.wires],
    };
    
    // NOT1の出力をtrueに設定
    const not1 = testCircuit.gates.find(g => g.id === 'NOT1');
    if (not1) {
      not1.output = true;
      console.log(`Set NOT1.output = ${not1.output}`);
    }
    
    // NOT1に接続されているワイヤーを探す
    const wiresFromNot1 = testCircuit.wires.filter(w => w.from.gateId === 'NOT1');
    console.log(`Wires from NOT1: [${wiresFromNot1.map(w => w.id).join(', ')}]`);
    
    wiresFromNot1.forEach(wire => {
      const targetGate = testCircuit.gates.find(g => g.id === wire.to.gateId);
      if (targetGate) {
        console.log(`Wire ${wire.id}: NOT1 → ${wire.to.gateId}[${wire.to.pinIndex}]`);
        console.log(`  Target gate before: inputs=[${targetGate.inputs.join(', ')}]`);
        
        // 手動でワイヤー伝達
        if (wire.to.pinIndex < targetGate.inputs.length) {
          targetGate.inputs[wire.to.pinIndex] = not1?.output ? '1' : '';
          console.log(`  Target gate after: inputs=[${targetGate.inputs.join(', ')}]`);
          
          if (targetGate.type === 'OUTPUT') {
            const inputValue = getGateInputValue(targetGate, 0);
            console.log(`  OUTPUT gate should light up: ${inputValue}`);
          }
        }
      }
    });
  });
});
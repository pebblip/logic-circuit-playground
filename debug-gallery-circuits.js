// デバッグ用スクリプト: ギャラリー回路の動作確認

import { FIBONACCI_COUNTER } from './src/features/gallery/data/fibonacci-counter.ts';
import { JOHNSON_COUNTER } from './src/features/gallery/data/johnson-counter.ts';
import { EnhancedHybridEvaluator } from './src/domain/simulation/event-driven-minimal/EnhancedHybridEvaluator.ts';

// フィボナッチカウンターのデバッグ
console.log('=== フィボナッチカウンター デバッグ ===');

const evaluator = new EnhancedHybridEvaluator({
  strategy: 'AUTO_SELECT',
  enableDebugLogging: true,
});

const fibCircuit = {
  gates: FIBONACCI_COUNTER.gates,
  wires: FIBONACCI_COUNTER.wires
};

console.log('初期状態:');
console.log('CLOCK:', fibCircuit.gates.find(g => g.id === 'clock'));
console.log('D-FF states:', fibCircuit.gates.filter(g => g.type === 'D-FF').map(g => ({ id: g.id, output: g.output, metadata: g.metadata })));

// 初期評価
const result1 = evaluator.evaluate(fibCircuit);
console.log('\n初回評価後:');
console.log('Success:', result1.evaluationInfo.strategyUsed);
console.log('D-FF states:', result1.circuit.gates.filter(g => g.type === 'D-FF').map(g => ({ id: g.id, output: g.output, metadata: g.metadata })));
console.log('OUTPUT states:', result1.circuit.gates.filter(g => g.type === 'OUTPUT').map(g => ({ id: g.id, output: g.output })));

// CLOCK状態を変更してもう一度評価
console.log('\n=== CLOCK切り替え後 ===');
const clockGate = result1.circuit.gates.find(g => g.id === 'clock');
if (clockGate) {
  clockGate.output = !clockGate.output;
  const result2 = evaluator.evaluate(result1.circuit);
  console.log('D-FF states:', result2.circuit.gates.filter(g => g.type === 'D-FF').map(g => ({ id: g.id, output: g.output, metadata: g.metadata })));
  console.log('OUTPUT states:', result2.circuit.gates.filter(g => g.type === 'OUTPUT').map(g => ({ id: g.id, output: g.output })));
}
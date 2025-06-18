#!/usr/bin/env node

// フィボナッチカウンターの詳細デバッグテスト

console.log('🧪 フィボナッチカウンター詳細デバッグテスト');

// Node.js環境でESModulesを動的に実行するため、JavaScriptとして記述

const fibonacci = {
  id: 'fibonacci-counter',
  title: '🌸 フィボナッチカウンター',
  gates: [
    // CLOCK (2Hz for better observation)
    {
      id: 'clock',
      type: 'CLOCK',
      position: { x: 100, y: 200 },
      output: true,
      inputs: [],
      metadata: { frequency: 2, isRunning: true, startTime: Date.now() },
    },
    
    // フィボナッチ数列レジスタ A (前の値)
    {
      id: 'reg_a_0',
      type: 'D-FF',
      position: { x: 250, y: 150 },
      output: true, // F(0) = 1
      inputs: ['', ''],
      metadata: { qOutput: true, previousClockState: false },
    },
    {
      id: 'reg_a_1',
      type: 'D-FF',
      position: { x: 350, y: 150 },
      output: false,
      inputs: ['', ''],
      metadata: { qOutput: false, previousClockState: false },
    },
    
    // フィボナッチ数列レジスタ B (現在の値)
    {
      id: 'reg_b_0',
      type: 'D-FF',
      position: { x: 250, y: 300 },
      output: true, // F(1) = 1
      inputs: ['', ''],
      metadata: { qOutput: true, previousClockState: false },
    },
    {
      id: 'reg_b_1',
      type: 'D-FF',
      position: { x: 350, y: 300 },
      output: false,
      inputs: ['', ''],
      metadata: { qOutput: false, previousClockState: false },
    },
    
    // 出力表示
    {
      id: 'out_a_0',
      type: 'OUTPUT',
      position: { x: 250, y: 50 },
      output: false,
      inputs: [''],
    },
    {
      id: 'out_a_1',
      type: 'OUTPUT',
      position: { x: 350, y: 50 },
      output: false,
      inputs: [''],
    },
    {
      id: 'out_b_0',
      type: 'OUTPUT',
      position: { x: 250, y: 400 },
      output: false,
      inputs: [''],
    },
    {
      id: 'out_b_1',
      type: 'OUTPUT',
      position: { x: 350, y: 400 },
      output: false,
      inputs: [''],
    },
  ],
  wires: [
    // クロック分配
    {
      id: 'clk_a0',
      from: { gateId: 'clock', pinIndex: -1 },
      to: { gateId: 'reg_a_0', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'clk_a1',
      from: { gateId: 'clock', pinIndex: -1 },
      to: { gateId: 'reg_a_1', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'clk_b0',
      from: { gateId: 'clock', pinIndex: -1 },
      to: { gateId: 'reg_b_0', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'clk_b1',
      from: { gateId: 'clock', pinIndex: -1 },
      to: { gateId: 'reg_b_1', pinIndex: 1 },
      isActive: false,
    },
    
    // フィボナッチロジック: A = B
    {
      id: 'b0_to_a0',
      from: { gateId: 'reg_b_0', pinIndex: -1 },
      to: { gateId: 'reg_a_0', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'b1_to_a1',
      from: { gateId: 'reg_b_1', pinIndex: -1 },
      to: { gateId: 'reg_a_1', pinIndex: 0 },
      isActive: false,
    },
    
    // 出力接続
    {
      id: 'a0_to_out_a0',
      from: { gateId: 'reg_a_0', pinIndex: -1 },
      to: { gateId: 'out_a_0', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'a1_to_out_a1',
      from: { gateId: 'reg_a_1', pinIndex: -1 },
      to: { gateId: 'out_a_1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'b0_to_out_b0',
      from: { gateId: 'reg_b_0', pinIndex: -1 },
      to: { gateId: 'out_b_0', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'b1_to_out_b1',
      from: { gateId: 'reg_b_1', pinIndex: -1 },
      to: { gateId: 'out_b_1', pinIndex: 0 },
      isActive: false,
    },
  ],
};

function simulateClockCycle(circuit, clockOn) {
  console.log(`\n📡 CLOCK=${clockOn ? 'HIGH' : 'LOW'} での状態:`);
  
  // CLOCK状態を設定
  const clockGate = circuit.gates.find(g => g.id === 'clock');
  clockGate.output = clockOn;
  
  // D-FFの状態を確認
  const dffGates = circuit.gates.filter(g => g.type === 'D-FF');
  dffGates.forEach(dff => {
    console.log(`  ${dff.id}: output=${dff.output}, qOutput=${dff.metadata?.qOutput}, prevClk=${dff.metadata?.previousClockState}`);
  });
  
  // OUTPUT状態を確認
  const outputGates = circuit.gates.filter(g => g.type === 'OUTPUT');
  outputGates.forEach(out => {
    console.log(`  ${out.id}: output=${out.output}`);
  });
}

console.log('初期状態:');
simulateClockCycle(fibonacci, true);

console.log('\n⏰ クロックサイクル2:');
simulateClockCycle(fibonacci, false);

console.log('\n⏰ クロックサイクル3:');
simulateClockCycle(fibonacci, true);

console.log('\n🔍 分析:');
console.log('- フィボナッチ数列は A,B = (1,1) -> (1,2) -> (2,3) -> (3,5) ... の順に変化すべき');
console.log('- 各クロックエッジで A=B, B=A+B の更新が行われるはず');
console.log('- 現在の実装では、加算器の接続が不完全な可能性がある');
// CLOCKゲート同期問題のデバッグテスト
const { evaluateCircuitPure, defaultConfig } = require('./src/domain/simulation/pure');

// テスト用の複数CLOCKゲート回路を作成
function createMultiClockCircuit() {
  const clock1 = {
    id: 'clock1',
    type: 'CLOCK',
    position: { x: 100, y: 100 },
    inputs: [],
    output: false,
    metadata: {
      isRunning: true,
      frequency: 1,
      // startTimeは意図的に未設定
    }
  };

  const clock2 = {
    id: 'clock2', 
    type: 'CLOCK',
    position: { x: 200, y: 100 },
    inputs: [],
    output: false,
    metadata: {
      isRunning: true,
      frequency: 1,
      // startTimeは意図的に未設定
    }
  };

  return {
    gates: [clock1, clock2],
    wires: []
  };
}

// テスト実行
async function testClockSynchronization() {
  console.log('=== CLOCK同期問題テスト ===');
  
  const circuit = createMultiClockCircuit();
  console.log('初期回路:', circuit.gates.map(g => ({
    id: g.id,
    startTime: g.metadata?.startTime
  })));

  // 最初の評価
  const result1 = evaluateCircuitPure(circuit, defaultConfig);
  if (result1.success) {
    console.log('1回目評価後のstartTime:', result1.data.circuit.gates.map(g => ({
      id: g.id,
      startTime: g.metadata?.startTime,
      output: g.output
    })));
  } else {
    console.error('1回目評価エラー:', result1.error);
    return;
  }

  // 少し待ってから2回目の評価
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const result2 = evaluateCircuitPure(result1.data.circuit, defaultConfig);
  if (result2.success) {
    console.log('2回目評価後:', result2.data.circuit.gates.map(g => ({
      id: g.id,
      startTime: g.metadata?.startTime,
      output: g.output
    })));
  } else {
    console.error('2回目評価エラー:', result2.error);
  }

  // さらに待ってから3回目の評価
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const result3 = evaluateCircuitPure(result2.data.circuit, defaultConfig);
  if (result3.success) {
    console.log('3回目評価後:', result3.data.circuit.gates.map(g => ({
      id: g.id,
      startTime: g.metadata?.startTime,
      output: g.output
    })));
  } else {
    console.error('3回目評価エラー:', result3.error);
  }
}

testClockSynchronization().catch(console.error);
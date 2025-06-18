// ブラウザコンソールで実行してDELAYゲートのピン位置をデバッグ

// 回路からDELAYゲートを探す
const store = useCircuitStore.getState();
const delayGate = store.gates.find(g => g.type === 'DELAY');

if (delayGate) {
  console.log('DELAYゲート情報:');
  console.log('- ID:', delayGate.id);
  console.log('- 位置:', delayGate.position);
  
  // ピン位置計算をインポートして実行
  import('/src/domain/analysis/pinPositionCalculator.js').then(module => {
    const { getInputPinPosition, getOutputPinPosition } = module;
    
    const inputPin = getInputPinPosition(delayGate, 0);
    const outputPin = getOutputPinPosition(delayGate, 0);
    
    console.log('計算されたピン位置:');
    console.log('- 入力ピン:', inputPin);
    console.log('- 出力ピン:', outputPin);
    
    // 期待値と比較
    console.log('期待値:');
    console.log('- 入力ピン:', { x: delayGate.position.x - 50, y: delayGate.position.y });
    console.log('- 出力ピン:', { x: delayGate.position.x + 50, y: delayGate.position.y });
  });
  
  // DELAYゲートに接続されているワイヤーを確認
  const connectedWires = store.wires.filter(w => 
    w.from.gateId === delayGate.id || w.to.gateId === delayGate.id
  );
  
  console.log('接続されているワイヤー:');
  connectedWires.forEach(wire => {
    console.log(`- ${wire.id}: ${wire.from.gateId}[${wire.from.pinIndex}] -> ${wire.to.gateId}[${wire.to.pinIndex}]`);
  });
  
} else {
  console.log('DELAYゲートが見つかりません');
  console.log('現在のゲート一覧:');
  store.gates.forEach(g => {
    console.log(`- ${g.type}: ${g.id} at (${g.position.x}, ${g.position.y})`);
  });
}
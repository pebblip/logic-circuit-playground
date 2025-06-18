// ブラウザコンソールで実行するスクリプト
// DELAYゲートを使ったリングオシレーター回路を実際に作成

const createRingOscillator = () => {
  // useCircuitStoreの現在の状態を取得
  const store = useCircuitStore.getState();
  
  // 現在の回路をクリア
  store.clearCircuit();
  
  // リングオシレーター回路の定義
  const gates = [
    // 3つのNOTゲート（奇数個なので発振可能）
    {
      id: 'oscillator_not1',
      type: 'NOT',
      position: { x: 300, y: 200 },
      inputs: [''],
      output: true, // 初期状態：非対称にするため1つだけtrue
    },
    {
      id: 'oscillator_not2',
      type: 'NOT',
      position: { x: 500, y: 200 },
      inputs: [''],
      output: false,
    },
    {
      id: 'oscillator_not3',
      type: 'NOT',
      position: { x: 700, y: 200 },
      inputs: [''],
      output: false,
    },
    // DELAYゲート（3サイクル遅延でフィードバックループに必要）
    {
      id: 'oscillator_delay1',
      type: 'DELAY',
      position: { x: 500, y: 400 },
      inputs: [''],
      output: false,
      metadata: {
        history: [], // 履歴は空でスタート
      },
    },
    // 出力確認用ゲート
    {
      id: 'oscillator_output1',
      type: 'OUTPUT',
      position: { x: 300, y: 100 },
      inputs: [''],
      output: false,
    },
    // 初期トリガー用INPUT（一時的に使用）
    {
      id: 'oscillator_trigger',
      type: 'INPUT',
      position: { x: 100, y: 200 },
      inputs: [''],
      output: false, // 最初はOFF、手動でONにしてからOFFにしてトリガー
    },
  ];
  
  const wires = [
    // trigger -> not1 (初期トリガー用、後で削除可能)
    {
      id: 'oscillator_w0',
      from: { gateId: 'oscillator_trigger', pinIndex: -1 },
      to: { gateId: 'oscillator_not1', pinIndex: 0 },
      isActive: false,
    },
    // not1 -> not2
    {
      id: 'oscillator_w1',
      from: { gateId: 'oscillator_not1', pinIndex: -1 },
      to: { gateId: 'oscillator_not2', pinIndex: 0 },
      isActive: false,
    },
    // not2 -> not3
    {
      id: 'oscillator_w2',
      from: { gateId: 'oscillator_not2', pinIndex: -1 },
      to: { gateId: 'oscillator_not3', pinIndex: 0 },
      isActive: false,
    },
    // not3 -> delay1
    {
      id: 'oscillator_w3',
      from: { gateId: 'oscillator_not3', pinIndex: -1 },
      to: { gateId: 'oscillator_delay1', pinIndex: 0 },
      isActive: false,
    },
    // delay1 -> not1 (フィードバックループ完成)
    {
      id: 'oscillator_w4',
      from: { gateId: 'oscillator_delay1', pinIndex: -1 },
      to: { gateId: 'oscillator_not1', pinIndex: 0 },
      isActive: false,
    },
    // not1 -> output1 (発振状態確認用)
    {
      id: 'oscillator_w5',
      from: { gateId: 'oscillator_not1', pinIndex: -1 },
      to: { gateId: 'oscillator_output1', pinIndex: 0 },
      isActive: false,
    },
  ];
  
  // 回路を設定
  store.loadCircuit(gates, wires);
  
  console.log('🎯 DELAYリングオシレーター回路が作成されました！');
  console.log('📝 使用方法:');
  console.log('1. TRIGGERゲート（左端）を1回クリックしてONにしてから、もう1回クリックしてOFFにする');
  console.log('2. これで発振が開始されます');
  console.log('3. OUTPUTゲート（上端）で発振状態を確認できます');
  console.log('4. 発振が始まったら、TRIGGERゲートとその接続線は削除しても構いません');
  
  return { gates, wires };
};

// 関数を実行
createRingOscillator();
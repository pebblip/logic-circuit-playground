// DELAYゲートを使ったリングオシレーター回路作成スクリプト

// 必要なゲートとワイヤーを定義
const oscillatorCircuit = {
  gates: [
    // 3つのNOTゲート（奇数個で発振可能）
    {
      id: 'not1',
      type: 'NOT',
      position: { x: 200, y: 300 },
      inputs: [''],
      output: true, // 初期状態：非対称にするため1つだけtrue
    },
    {
      id: 'not2',
      type: 'NOT',
      position: { x: 400, y: 300 },
      inputs: [''],
      output: false,
    },
    {
      id: 'not3',
      type: 'NOT',
      position: { x: 600, y: 300 },
      inputs: [''],
      output: false,
    },
    // DELAYゲート（3サイクル遅延）
    {
      id: 'delay1',
      type: 'DELAY',
      position: { x: 400, y: 500 },
      inputs: [''],
      output: false,
      metadata: {
        history: [], // 履歴は空でスタート
      },
    },
    // 出力確認用
    {
      id: 'output1',
      type: 'OUTPUT',
      position: { x: 200, y: 150 },
      inputs: [''],
      output: false,
    },
  ],
  wires: [
    // not1 -> not2
    {
      id: 'w1',
      from: { gateId: 'not1', pinIndex: -1 },
      to: { gateId: 'not2', pinIndex: 0 },
      isActive: false,
    },
    // not2 -> not3
    {
      id: 'w2',
      from: { gateId: 'not2', pinIndex: -1 },
      to: { gateId: 'not3', pinIndex: 0 },
      isActive: false,
    },
    // not3 -> delay1
    {
      id: 'w3',
      from: { gateId: 'not3', pinIndex: -1 },
      to: { gateId: 'delay1', pinIndex: 0 },
      isActive: false,
    },
    // delay1 -> not1 (フィードバックループ完成)
    {
      id: 'w4',
      from: { gateId: 'delay1', pinIndex: -1 },
      to: { gateId: 'not1', pinIndex: 0 },
      isActive: false,
    },
    // not1 -> output1 (状態確認用)
    {
      id: 'w5',
      from: { gateId: 'not1', pinIndex: -1 },
      to: { gateId: 'output1', pinIndex: 0 },
      isActive: false,
    },
  ],
};

console.log('DELAYリングオシレーター回路定義:');
console.log(JSON.stringify(oscillatorCircuit, null, 2));

// ブラウザでこの回路をロードする手順を表示
console.log('\n=== ブラウザでの回路作成手順 ===');
console.log('1. http://localhost:5174/ にアクセス');
console.log('2. 開発者ツールを開く（F12）');
console.log('3. コンソールで以下を実行:');
console.log(`
// 回路をクリアして新しい回路をロード
import { useCircuitStore } from './src/stores/circuitStore.js';
const store = useCircuitStore.getState();
store.clearCircuit();

// オシレーター回路を設定
const circuit = ${JSON.stringify(oscillatorCircuit, null, 2)};
store.loadCircuit(circuit.gates, circuit.wires);

console.log('リングオシレーター回路が作成されました！');
`);
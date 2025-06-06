import type { StructuredLesson } from '../../../../types/lesson-content';

export const dFlipFlopStructuredLesson: StructuredLesson = {
  id: 'd-flip-flop',
  title: 'Dフリップフロップ - 1ビットメモリ',
  description: 'データを記憶できる基本的な順序回路を作ります',
  difficulty: 'advanced',
  prerequisites: ['alu-basics'],
  estimatedMinutes: 25,
  steps: [
    {
      id: 'intro',
      instruction: 'データを記憶する回路を作ろう！',
      content: [
        {
          type: 'text',
          text: 'これまでの回路は入力が変わると出力もすぐ変わりました。でも...',
        },
        {
          type: 'heading',
          text: '🤔 データを保持するには？',
        },
        {
          type: 'text',
          text: '「前の状態を覚えておく」回路が必要です！',
        },
        {
          type: 'note',
          text: 'これが順序回路の始まり - メモリの最小単位です',
        },
      ],
    },
    {
      id: 'concept',
      instruction: 'Dフリップフロップとは',
      content: [
        {
          type: 'heading',
          text: '📦 1ビットの記憶装置',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'D（Data）：記憶したいデータ',
            'CLK（Clock）：データを取り込むタイミング',
            'Q：記憶されているデータ（出力）',
            "Q'：Qの反転（補助出力）",
          ],
        },
        {
          type: 'heading',
          text: '⏰ クロックの役割',
        },
        {
          type: 'text',
          text: 'CLKが0→1に変わる瞬間（立ち上がりエッジ）でDの値を記憶',
        },
      ],
    },
    {
      id: 'timing-diagram',
      instruction: 'タイミングチャートで理解',
      content: [
        {
          type: 'heading',
          text: '📊 動作タイミング',
        },
        {
          type: 'table',
          headers: ['時刻', 'D', 'CLK', 'Q', '動作'],
          rows: [
            ['t1', '1', '↑', '1', 'D=1を記憶'],
            ['t2', '0', '0', '1', '変化なし（保持）'],
            ['t3', '0', '↑', '0', 'D=0を記憶'],
            ['t4', '1', '0', '0', '変化なし（保持）'],
          ],
        },
        {
          type: 'note',
          text: 'CLKが↑（立ち上がり）の時だけデータを取り込みます',
        },
      ],
    },
    {
      id: 'master-slave',
      instruction: 'マスタースレーブ構造',
      content: [
        {
          type: 'heading',
          text: '🔗 2段構成の理由',
        },
        {
          type: 'text',
          text: 'D-FFは内部で2つのラッチを直列に接続しています：',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'マスターラッチ：CLK=1でDを取り込む',
            'スレーブラッチ：CLK=0で値を出力に伝える',
            '結果：エッジトリガ動作を実現',
          ],
        },
      ],
    },
    {
      id: 'simplified-design',
      instruction: '今回使う特殊ゲート',
      content: [
        {
          type: 'text',
          text: 'D-FFは複雑なので、このシミュレータでは専用ゲートを用意しています。',
        },
        {
          type: 'heading',
          text: '🎯 D-FFゲートの使い方',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '左側入力：D（データ）とCLK（クロック）',
            "右側出力：Q（記憶値）とQ'（反転）",
            'CLOCKゲートと組み合わせて使用',
          ],
        },
        {
          type: 'note',
          text: '実際の回路は約20個のトランジスタで構成されています',
        },
      ],
    },
    {
      id: 'place-clock',
      instruction: 'CLOCKゲートを配置',
      hint: 'タイミング信号を生成',
      content: [
        {
          type: 'text',
          text: '自動的に0と1を繰り返す特殊ゲートです。',
        },
      ],
      action: { type: 'place-gate', gateType: 'CLOCK' },
    },
    {
      id: 'place-data-input',
      instruction: 'データ入力を配置',
      hint: 'D（記憶したいデータ）用のINPUT',
      content: [],
      action: { type: 'place-gate', gateType: 'INPUT' },
    },
    {
      id: 'place-dff',
      instruction: 'D-FFゲートを配置',
      hint: '特殊ゲートからD-FFを選択',
      content: [
        {
          type: 'text',
          text: '1ビットメモリの本体です。',
        },
      ],
      action: { type: 'place-gate', gateType: 'D-FF' },
    },
    {
      id: 'place-outputs',
      instruction: '出力表示を配置',
      hint: "QとQ'用の2つのOUTPUT",
      content: [
        {
          type: 'text',
          text: "Qが記憶値、Q'はその反転です。",
        },
      ],
      action: { type: 'place-gate', gateType: 'OUTPUT' },
    },
    {
      id: 'connect-clock',
      instruction: '配線：クロック信号',
      hint: 'CLOCKをD-FFのCLK入力に接続',
      content: [],
      action: { type: 'connect-wire' },
    },
    {
      id: 'connect-data',
      instruction: '配線：データ信号',
      hint: 'INPUTをD-FFのD入力に接続',
      content: [],
      action: { type: 'connect-wire' },
    },
    {
      id: 'connect-outputs',
      instruction: '配線：出力信号',
      hint: "D-FFのQとQ'をそれぞれOUTPUTに接続",
      content: [],
      action: { type: 'connect-wire' },
    },
    {
      id: 'test-store-1',
      instruction: 'テスト1：1を記憶',
      content: [
        {
          type: 'text',
          text: 'D=1にして、CLOCKの立ち上がりでQ=1になることを確認',
        },
        {
          type: 'note',
          text: 'CLOCKが0→1になる瞬間を観察してください',
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'test-hold',
      instruction: 'テスト2：値の保持',
      content: [
        {
          type: 'text',
          text: 'D=0に変えても、CLOCKが変化するまでQ=1のまま',
        },
        {
          type: 'note',
          text: 'これが「記憶」です！',
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'test-store-0',
      instruction: 'テスト3：0を記憶',
      content: [
        {
          type: 'text',
          text: '次のCLOCK立ち上がりでQ=0に更新されます',
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'register-intro',
      instruction: '【発展】レジスタへの拡張',
      content: [
        {
          type: 'heading',
          text: '🗄️ 複数ビットの記憶',
        },
        {
          type: 'text',
          text: 'D-FFを並列に並べると...',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '8個 → 8ビットレジスタ（1バイト）',
            '32個 → 32ビットレジスタ（CPU内部）',
            '共通CLKで同時に値を更新',
          ],
        },
      ],
    },
    {
      id: 'memory-hierarchy',
      instruction: 'メモリ階層での位置',
      content: [
        {
          type: 'heading',
          text: '📊 記憶装置の階層',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'レジスタ（D-FF）：最速・最小',
            'キャッシュ：高速・小容量',
            'メインメモリ：中速・中容量',
            'ストレージ：低速・大容量',
          ],
        },
        {
          type: 'note',
          text: 'D-FFは最も基本的で高速な記憶素子です',
        },
      ],
    },
    {
      id: 'applications',
      instruction: '【応用】D-FFの活用例',
      content: [
        {
          type: 'heading',
          text: '💻 実用例',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '🖥️ CPUレジスタ：演算データの一時保存',
            '🎮 ゲーム機：前フレームの状態記憶',
            '📡 通信：データの同期とバッファリング',
            '🎵 デジタルオーディオ：サンプリングデータ保持',
            '🚦 信号機：状態遷移の記憶',
          ],
        },
      ],
    },
    {
      id: 'edge-vs-level',
      instruction: 'エッジトリガ vs レベルトリガ',
      content: [
        {
          type: 'heading',
          text: '⚡ トリガ方式の違い',
        },
        {
          type: 'table',
          headers: ['方式', '動作', '特徴'],
          rows: [
            [
              'エッジトリガ（D-FF）',
              'CLKの変化の瞬間だけ反応',
              '安定動作・ノイズに強い',
            ],
            [
              'レベルトリガ（ラッチ）',
              'CLK=1の間ずっと反応',
              '単純な構造・タイミング注意',
            ],
          ],
        },
      ],
    },
    {
      id: 'setup-hold-time',
      instruction: 'セットアップ・ホールド時間',
      content: [
        {
          type: 'heading',
          text: '⏱️ タイミング制約',
        },
        {
          type: 'text',
          text: '実際のD-FFには重要なタイミング制約があります：',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'セットアップ時間：CLK↑前にDを安定させる時間',
            'ホールド時間：CLK↑後もDを維持する時間',
            '違反すると誤動作（メタステーブル）',
          ],
        },
      ],
    },
    {
      id: 'achievement',
      instruction: '🎉 D-FFマスター！',
      content: [
        {
          type: 'heading',
          text: '🏆 習得したスキル',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '✅ データ記憶の基本原理',
            '✅ クロック同期の概念',
            '✅ 順序回路の第一歩',
            '✅ デジタルメモリの基礎',
          ],
        },
        {
          type: 'note',
          text: 'これでコンピュータが「記憶」できる理由がわかりました！',
        },
      ],
    },
    {
      id: 'quiz',
      instruction: '理解度チェック！',
      content: [
        {
          type: 'quiz',
          question: 'D-FFがデータを取り込むタイミングは？',
          options: [
            'D=1のとき',
            'CLK=1のとき',
            'CLKが0→1になるとき',
            'いつでも',
          ],
          correctIndex: 2,
        },
      ],
    },
  ],
};

import type { StructuredLesson } from '../../../../types/lesson-content';

export const registerStructuredLesson: StructuredLesson = {
  id: 'register',
  title: 'レジスタ - 複数ビットの記憶装置',
  description: '複数のビットを同時に記憶・転送できる回路を作ります',
  icon: '🗄️',
  difficulty: 'advanced',
  prerequisites: ['counter'],
  estimatedMinutes: 20,
  steps: [
    {
      id: 'intro',
      instruction: '複数ビットを一度に記憶しよう！',
      content: [
        {
          type: 'text',
          text: '1ビットだけでなく、8ビット、16ビット、32ビット...をまとめて扱いたい！',
        },
        {
          type: 'heading',
          text: '🤔 レジスタとは？',
          icon: '🤔',
        },
        {
          type: 'text',
          text: '複数のフリップフロップを並列に並べた記憶装置です。',
        },
        {
          type: 'note',
          text: 'CPUの中で最も高速なメモリがレジスタです',
          icon: '⚡',
        },
      ],
    },
    {
      id: 'register-types',
      instruction: 'レジスタの種類と用途',
      content: [
        {
          type: 'heading',
          text: '📊 主なレジスタ',
          icon: '📊',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '📥 データレジスタ：演算データの保存',
            '📍 アドレスレジスタ：メモリアドレス',
            '🎯 プログラムカウンタ：次の命令位置',
            '🚩 ステータスレジスタ：CPU状態',
            '📤 入出力レジスタ：外部とのやり取り',
          ],
        },
        {
          type: 'heading',
          text: '🎯 今回作るもの',
          icon: '🎯',
        },
        {
          type: 'text',
          text: '4ビット並列入力・並列出力レジスタ',
        },
      ],
    },
    {
      id: 'parallel-structure',
      instruction: '並列レジスタの構造',
      content: [
        {
          type: 'heading',
          text: '🔧 基本構成',
          icon: '🔧',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '4個のD-FFを横に配置',
            '共通のクロック信号',
            '同時に4ビット記憶',
            'Load信号で書き込み制御',
          ],
        },
        {
          type: 'note',
          text: '全ビットが同じタイミングで更新されます',
          icon: '⏱️',
        },
      ],
    },
    {
      id: 'load-control',
      instruction: 'Load制御の仕組み',
      content: [
        {
          type: 'heading',
          text: '🎛️ 書き込み制御',
          icon: '🎛️',
        },
        {
          type: 'text',
          text: 'Load=1の時だけ新しい値を取り込みます：',
        },
        {
          type: 'table',
          headers: ['Load', 'CLK', '動作'],
          rows: [
            ['0', '↑', '現在値を保持'],
            ['1', '↑', '新しい値を記憶'],
          ],
        },
        {
          type: 'note',
          text: 'MUXを使って入力を切り替えます',
          icon: '🔀',
        },
      ],
    },
    {
      id: 'simplified-design',
      instruction: '今回の簡略版設計',
      content: [
        {
          type: 'text',
          text: '2ビットレジスタで基本を理解しましょう。',
        },
        {
          type: 'heading',
          text: '📐 構成要素',
          icon: '📐',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '2個のD-FF（2ビット分）',
            '共通CLK信号',
            'データ入力（D1, D0）',
            'データ出力（Q1, Q0）',
          ],
        },
      ],
    },
    {
      id: 'place-clock',
      instruction: 'CLOCKゲートを配置',
      hint: '共通のタイミング信号',
      content: [
        {
          type: 'text',
          text: '全ビット同時更新のための同期信号です。',
        },
      ],
      action: { type: 'place-gate', gateType: 'CLOCK' },
    },
    {
      id: 'place-data-inputs',
      instruction: 'データ入力を配置',
      hint: 'D1とD0の2つのINPUT',
      content: [
        {
          type: 'text',
          text: '記憶したい2ビットデータです。',
        },
      ],
      action: { type: 'place-gate', gateType: 'INPUT' },
    },
    {
      id: 'place-dffs',
      instruction: 'D-FFを2個配置',
      hint: '各ビット用のフリップフロップ',
      content: [
        {
          type: 'text',
          text: '並列に配置して同時動作させます。',
        },
      ],
      action: { type: 'place-gate', gateType: 'D-FF' },
    },
    {
      id: 'place-outputs',
      instruction: '出力表示を配置',
      hint: 'Q1とQ0の2つのOUTPUT',
      content: [
        {
          type: 'text',
          text: '記憶されている値を表示します。',
        },
      ],
      action: { type: 'place-gate', gateType: 'OUTPUT' },
    },
    {
      id: 'connect-data',
      instruction: '配線：データ入力',
      hint: '各INPUTを対応するD-FFのD入力に接続',
      content: [],
      action: { type: 'connect-wire' },
    },
    {
      id: 'connect-clock',
      instruction: '配線：クロック信号',
      hint: 'CLOCKを両方のD-FFのCLK入力に接続',
      content: [
        {
          type: 'text',
          text: '共通クロックで同期動作します。',
        },
      ],
      action: { type: 'connect-wire' },
    },
    {
      id: 'connect-outputs',
      instruction: '配線：出力',
      hint: '各D-FFのQ出力を対応するOUTPUTに接続',
      content: [],
      action: { type: 'connect-wire' },
    },
    {
      id: 'test-store-00',
      instruction: 'テスト1：00を記憶',
      content: [
        {
          type: 'text',
          text: 'D1=0, D0=0にして、CLK立ち上がりで記憶',
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'test-store-11',
      instruction: 'テスト2：11を記憶',
      content: [
        {
          type: 'text',
          text: 'D1=1, D0=1に変更し、次のCLKで更新',
        },
        {
          type: 'note',
          text: '2ビットが同時に更新されます',
          icon: '⚡',
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'test-hold',
      instruction: 'テスト3：値の保持',
      content: [
        {
          type: 'text',
          text: '入力を変えても、CLKまでは前の値を保持',
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'bus-connection',
      instruction: '【発展】バス接続',
      content: [
        {
          type: 'heading',
          text: '🚌 データバス',
          icon: '🚌',
        },
        {
          type: 'text',
          text: '複数のレジスタをバスで接続：',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '共通のデータ線（8本、16本...）',
            '各レジスタにLoad信号',
            '選択的な読み書き',
            '効率的なデータ転送',
          ],
        },
      ],
    },
    {
      id: 'register-file',
      instruction: 'レジスタファイル',
      content: [
        {
          type: 'heading',
          text: '🗃️ レジスタの集合体',
          icon: '🗃️',
        },
        {
          type: 'text',
          text: 'CPUには複数のレジスタ：',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '汎用レジスタ：R0〜R15',
            'デコーダで選択',
            '2ポート読み出し',
            '1ポート書き込み',
          ],
        },
        {
          type: 'note',
          text: 'ARM CPUは16個の32ビットレジスタ',
          icon: '💻',
        },
      ],
    },
    {
      id: 'special-registers',
      instruction: '特殊なレジスタ',
      content: [
        {
          type: 'heading',
          text: '🎯 専用機能',
          icon: '🎯',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'PC：プログラムカウンタ（自動インクリメント）',
            'SP：スタックポインタ（PUSH/POP）',
            'SR：ステータスレジスタ（フラグ集合）',
            'MAR：メモリアドレスレジスタ',
            'MDR：メモリデータレジスタ',
          ],
        },
      ],
    },
    {
      id: 'pipeline-register',
      instruction: 'パイプラインレジスタ',
      content: [
        {
          type: 'heading',
          text: '⚡ 高速化の要',
          icon: '⚡',
        },
        {
          type: 'text',
          text: 'CPUパイプラインの段間バッファ：',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'IF/ID：命令フェッチ→デコード',
            'ID/EX：デコード→実行',
            'EX/MEM：実行→メモリアクセス',
            'MEM/WB：メモリ→ライトバック',
          ],
        },
      ],
    },
    {
      id: 'applications',
      instruction: '【応用】レジスタの活用',
      content: [
        {
          type: 'heading',
          text: '💻 実用例',
          icon: '💻',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '🧮 演算の一時保存',
            '📊 データのバッファリング',
            '🔄 値の交換（スワップ）',
            '📸 状態のスナップショット',
            '🎮 ゲームの変数保存',
          ],
        },
      ],
    },
    {
      id: 'achievement',
      instruction: '🎉 レジスタマスター！',
      content: [
        {
          type: 'heading',
          text: '🏆 習得したスキル',
          icon: '🏆',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '✅ 複数ビット同時記憶',
            '✅ 並列データ処理',
            '✅ 同期式記憶装置',
            '✅ CPUの基本要素',
          ],
        },
        {
          type: 'note',
          text: 'これでCPUの高速メモリが理解できました！',
          icon: '✨',
        },
      ],
    },
    {
      id: 'quiz',
      instruction: '理解度チェック！',
      content: [
        {
          type: 'quiz',
          question: '32ビットレジスタには何個のD-FFが必要？',
          options: ['8個', '16個', '32個', '64個'],
          correctIndex: 2,
        },
      ],
    },
  ],
};

import type { StructuredLesson } from '../../../../types/lesson-content';

export const registerStructuredLesson: StructuredLesson = {
  id: 'register',
  title: 'レジスタ - 複数ビットの記憶装置',
  description: '複数のビットを同時に記憶・転送できる回路を作ります',
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
        },
        {
          type: 'text',
          text: '複数のフリップフロップを並列に並べた記憶装置です。',
        },
        {
          type: 'note',
          text: 'CPUの中で最も高速なメモリがレジスタです',
        },
      ],
    },
    {
      id: 'cpu-internal-structure',
      instruction: 'CPU内部でのレジスタの役割',
      content: [
        {
          type: 'heading',
          text: '🏗️ CPU内部ブロック図',
        },
        {
          type: 'text',
          text: 'CPU内部ブロック図：',
        },
        {
          type: 'ascii-art',
          art: `┌─────────────────────────────────────────────┐
│                    CPU                       │
│  ┌─────────┐     ┌─────────┐   ┌────────┐  │
│  │  制御部  │────▶│レジスタ  │◀─▶│  ALU   │  │
│  └─────────┘     │ ファイル │   │        │  │
│        │         └─────────┘   └────────┘  │
│        ▼               │             │       │
│  ┌─────────┐          ▼             ▼       │
│  │   PC    │     ┌─────────┐  ┌────────┐  │
│  └─────────┘     │   MAR   │  │  MDR   │  │
│                  └─────────┘  └────────┘  │
└────────────────────────┼─────────┼─────────┘
                        ▼         ▼
                   ┌──────────────────┐
                   │     メモリ        │
                   └──────────────────┘`,
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '制御部：命令の解読と各部への指示',
            'レジスタファイル：高速な一時記憶領域',
            'ALU：算術論理演算を実行',
            'PC：次に実行する命令のアドレス',
            'MAR：メモリアドレスレジスタ',
            'MDR：メモリデータレジスタ',
          ],
        },
        {
          type: 'note',
          text: 'レジスタはCPU内部の高速な一時記憶装置です',
        },
      ],
    },
    {
      id: 'register-types',
      instruction: 'レジスタの種類と比較',
      content: [
        {
          type: 'heading',
          text: '📊 汎用レジスタ vs 特殊レジスタ',
        },
        {
          type: 'table',
          headers: ['種類', '用途', '特徴', '例'],
          rows: [
            ['汎用レジスタ', '演算・データ保存', '自由に使える', 'R0〜R15'],
            ['データレジスタ', 'データの一時保存', '演算対象', 'AX, BX, CX, DX'],
            ['アドレスレジスタ', 'メモリアドレス指定', 'ポインタ操作', 'SI, DI, BP'],
            ['プログラムカウンタ', '次の命令位置', '自動更新', 'PC'],
            ['スタックポインタ', 'スタック管理', 'PUSH/POP操作', 'SP'],
            ['ステータスレジスタ', 'CPU状態・フラグ', '演算結果の状態', 'FLAGS'],
          ],
        },
        {
          type: 'heading',
          text: '🎯 今回作るもの',
        },
        {
          type: 'text',
          text: '2ビット並列入力・並列出力レジスタ（基本を理解）',
        },
        {
          type: 'heading',
          text: '🔍 メモリ階層とレジスタの位置づけ',
        },
        {
          type: 'ascii-art',
          art: `         高速 ◀──────────────────▶ 低速
         小容量                      大容量
    ┌─────────────┬──────────┬────────┬─────────┐
    │ レジスタ    │ L1キャッシュ│ L2/L3  │ メインメモリ│
    │ <1ns       │ ~4ns      │ ~20ns  │ ~100ns   │
    │ ~1KB       │ ~32KB     │ ~8MB   │ ~16GB    │
    └─────────────┴──────────┴────────┴─────────┘
         CPU内部 ◀────────────────▶ CPU外部`,
        },
        {
          type: 'note',
          text: 'レジスタはCPU内部にあり、最も高速にアクセスできます',
        },
      ],
    },
    {
      id: 'parallel-structure',
      instruction: '並列データ処理の視覚化',
      content: [
        {
          type: 'heading',
          text: '🔧 並列レジスタの動作',
        },
        {
          type: 'text',
          text: '各ビットが同時に動作する様子：',
        },
        {
          type: 'table',
          headers: ['時刻', 'CLK', 'D3', 'D2', 'D1', 'D0', '→', 'Q3', 'Q2', 'Q1', 'Q0'],
          rows: [
            ['t0', '0', '1', '0', '1', '1', '→', '0', '0', '0', '0'],
            ['t1', '↑', '1', '0', '1', '1', '→', '1', '0', '1', '1'],
            ['t2', '0', '0', '1', '0', '0', '→', '1', '0', '1', '1'],
            ['t3', '↑', '0', '1', '0', '0', '→', '0', '1', '0', '0'],
          ],
        },
        {
          type: 'note',
          text: 'CLKの立ち上がりで全ビットが同時に更新！',
        },
        {
          type: 'text',
          text: '構成図：',
        },
        {
          type: 'ascii-art',
          art: `D3 ──┬─[D-FF]─── Q3
     │
D2 ──┼─[D-FF]─── Q2  
     │
D1 ──┼─[D-FF]─── Q1
     │
D0 ──┼─[D-FF]─── Q0
     │
CLK ─┴─────────  共通クロック`,
        },
        {
          type: 'heading',
          text: '⚡ 並列処理の威力',
        },
        {
          type: 'text',
          text: '4ビットレジスタの動作イメージ：',
        },
        {
          type: 'ascii-art',
          art: `時刻t0: データ準備          時刻t1: CLK↑で一斉転送
┌────┐                    ┌────┐
│1011│ ────────────────▶ │1011│ 
└────┘                    └────┘
  ││││                      ││││
  ▼▼▼▼                      ▼▼▼▼
┌─┬─┬─┬─┐                ┌─┬─┬─┬─┐
│?│?│?│?│ レジスタ        │1│0│1│1│ レジスタ
└─┴─┴─┴─┘                └─┴─┴─┴─┘`,
        },
        {
          type: 'note',
          text: '1クロックで4ビット同時転送！シリアル転送なら4クロック必要',
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
      instruction: 'パイプラインでのレジスタ活用',
      content: [
        {
          type: 'heading',
          text: '⚡ パイプライン処理の実例',
        },
        {
          type: 'text',
          text: '5段パイプラインでの命令処理の流れ：',
        },
        {
          type: 'table',
          headers: ['サイクル', '命令1', '命令2', '命令3', '命令4', '命令5'],
          rows: [
            ['1', 'IF', '-', '-', '-', '-'],
            ['2', 'ID', 'IF', '-', '-', '-'],
            ['3', 'EX', 'ID', 'IF', '-', '-'],
            ['4', 'MEM', 'EX', 'ID', 'IF', '-'],
            ['5', 'WB', 'MEM', 'EX', 'ID', 'IF'],
            ['6', '完了', 'WB', 'MEM', 'EX', 'ID'],
          ],
        },
        {
          type: 'text',
          text: '各段階の説明：IF=命令フェッチ、ID=命令デコード、EX=実行、MEM=メモリアクセス、WB=レジスタ書き戻し',
        },
        {
          type: 'note',
          text: '各段階間にパイプラインレジスタが配置され、データを保持',
        },
        {
          type: 'text',
          text: 'パイプラインレジスタの配置：',
        },
        {
          type: 'ascii-art',
          art: `┌────┐    ┌─────┐    ┌────┐    ┌─────┐    ┌────┐
│ IF │───▶│IF/ID│───▶│ ID │───▶│ID/EX│───▶│ EX │
└────┘    └─────┘    └────┘    └─────┘    └────┘
                                              │
┌────┐    ┌───────┐    ┌─────┐              ▼
│ WB │◀───│MEM/WB │◀───│ MEM │◀────────────┘
└────┘    └───────┘    └─────┘`,
        },
        {
          type: 'heading',
          text: '🚀 パイプラインの効果',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '理論上5倍の処理速度（5段の場合）',
            '各段階が独立して動作',
            'レジスタが段階間のデータを保持',
            'データハザードに注意が必要',
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
        },
      ],
    },
    {
      id: 'advanced-features',
      instruction: '【発展】レジスタの高度な機能',
      content: [
        {
          type: 'heading',
          text: '🔮 最新CPUのレジスタ技術',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '🔄 レジスタリネーミング：依存関係の解消',
            '🎯 シャドウレジスタ：高速コンテキストスイッチ',
            '📊 ベクトルレジスタ：SIMD演算用（128/256/512ビット）',
            '🏃 投機的実行：分岐予測失敗時の復元',
          ],
        },
        {
          type: 'table',
          headers: ['CPU世代', 'レジスタ数', 'ビット幅', '特徴'],
          rows: [
            ['8086', '8個', '16ビット', '基本的な汎用レジスタ'],
            ['80386', '8個', '32ビット', '32ビット拡張'],
            ['x86-64', '16個', '64ビット', 'レジスタ数も倍増'],
            ['ARM64', '31個', '64ビット', 'RISC設計で多数'],
          ],
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
        {
          type: 'quiz',
          question: 'パイプラインレジスタの主な役割は？',
          options: [
            'データを永続的に保存する',
            'パイプライン段階間でデータを保持する',
            'メモリアクセスを高速化する',
            '演算を実行する',
          ],
          correctIndex: 1,
        },
      ],
    },
  ],
};

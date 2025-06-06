import type { StructuredLesson } from '../../../../types/lesson-content';

export const srLatchStructuredLesson: StructuredLesson = {
  id: 'sr-latch',
  title: 'SRラッチ - 最もシンプルなメモリ',
  description: 'セット・リセット機能を持つ基本的な記憶回路を作ります',
  icon: '🔒',
  difficulty: 'advanced',
  prerequisites: ['d-flip-flop'],
  estimatedMinutes: 20,
  steps: [
    {
      id: 'intro',
      instruction: '最も基本的な記憶回路を理解しよう！',
      content: [
        {
          type: 'text',
          text: 'D-FFよりもさらにシンプルな記憶回路があります。',
        },
        {
          type: 'heading',
          text: '🤔 SRラッチとは？',
          icon: '🤔',
        },
        {
          type: 'text',
          text: 'Set（セット）とReset（リセット）で状態を制御する双安定回路です。',
        },
        {
          type: 'note',
          text: '「ラッチ」は「掛け金」の意味 - 状態を保持します',
          icon: '🔐',
        },
      ],
    },
    {
      id: 'concept',
      instruction: 'SRラッチの動作原理',
      content: [
        {
          type: 'heading',
          text: '📊 真理値表',
          icon: '📊',
        },
        {
          type: 'table',
          headers: ['S', 'R', 'Q', "Q'", '動作'],
          rows: [
            ['0', '0', 'Q', "Q'", '保持（変化なし）'],
            ['1', '0', '1', '0', 'セット（Q=1）'],
            ['0', '1', '0', '1', 'リセット（Q=0）'],
            ['1', '1', '?', '?', '禁止（不定）'],
          ],
        },
        {
          type: 'note',
          text: 'S=1,R=1は使用禁止！予測不能な動作になります',
          icon: '⚠️',
        },
      ],
    },
    {
      id: 'feedback-loop',
      instruction: 'フィードバックの秘密',
      content: [
        {
          type: 'heading',
          text: '🔄 自己保持の仕組み',
          icon: '🔄',
        },
        {
          type: 'text',
          text: 'SRラッチの核心は「出力を入力に戻す」フィードバックです。',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '2つのNORゲートを交差接続',
            '各ゲートの出力が相手の入力に',
            '安定した2つの状態が存在',
          ],
        },
        {
          type: 'note',
          text: 'この相互フィードバックが記憶を可能にします！',
          icon: '💡',
        },
      ],
    },
    {
      id: 'nor-implementation',
      instruction: 'NORゲートで作るSRラッチ',
      content: [
        {
          type: 'heading',
          text: '🔧 基本構成',
          icon: '🔧',
        },
        {
          type: 'text',
          text: '最も一般的な実装方法です：',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            "上のNOR：S入力とQ'出力を入力に",
            '下のNOR：R入力とQ出力を入力に',
            'クロス結合で双安定状態を作る',
          ],
        },
      ],
    },
    {
      id: 'use-special-gate',
      instruction: '今回は専用ゲートを使用',
      content: [
        {
          type: 'text',
          text: 'フィードバック配線が複雑なので、SR-LATCHゲートを使います。',
        },
        {
          type: 'heading',
          text: '🎯 SR-LATCHゲートの仕様',
          icon: '🎯',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '左側入力：S（セット）とR（リセット）',
            "右側出力：Q（状態）とQ'（反転）",
            '内部でNORゲートのクロス結合を実装',
          ],
        },
      ],
    },
    {
      id: 'place-sr-inputs',
      instruction: 'S/R制御入力を配置',
      hint: 'S（セット）とR（リセット）の2つのINPUT',
      content: [
        {
          type: 'text',
          text: '上がS、下がRです。',
        },
      ],
      action: { type: 'place-gate', gateType: 'INPUT' },
    },
    {
      id: 'place-sr-latch',
      instruction: 'SR-LATCHゲートを配置',
      hint: '特殊ゲートからSR-LATCHを選択',
      content: [
        {
          type: 'text',
          text: '双安定記憶素子の本体です。',
        },
      ],
      action: { type: 'place-gate', gateType: 'SR-LATCH' },
    },
    {
      id: 'place-outputs',
      instruction: '状態表示を配置',
      hint: "QとQ'の2つのOUTPUT",
      content: [
        {
          type: 'text',
          text: '常に反対の値を示します。',
        },
      ],
      action: { type: 'place-gate', gateType: 'OUTPUT' },
    },
    {
      id: 'connect-inputs',
      instruction: '配線：制御信号',
      hint: 'SとRをSR-LATCHの対応する入力に接続',
      content: [],
      action: { type: 'connect-wire' },
    },
    {
      id: 'connect-outputs',
      instruction: '配線：出力表示',
      hint: "QとQ'をそれぞれOUTPUTに接続",
      content: [],
      action: { type: 'connect-wire' },
    },
    {
      id: 'test-initial',
      instruction: 'テスト1：初期状態',
      content: [
        {
          type: 'text',
          text: 'S=0, R=0で、現在の状態が保持されます',
        },
        {
          type: 'note',
          text: '電源投入時の状態は不定です',
          icon: '🎲',
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'test-set',
      instruction: 'テスト2：セット動作',
      content: [
        {
          type: 'text',
          text: 'S=1, R=0にして、Q=1になることを確認',
        },
        {
          type: 'note',
          text: 'Sを0に戻してもQ=1のまま！',
          icon: '✨',
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'test-reset',
      instruction: 'テスト3：リセット動作',
      content: [
        {
          type: 'text',
          text: 'S=0, R=1にして、Q=0になることを確認',
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'test-hold',
      instruction: 'テスト4：状態保持',
      content: [
        {
          type: 'text',
          text: 'S=0, R=0に戻して、最後の状態が保持されることを確認',
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'forbidden-state',
      instruction: '【注意】禁止状態',
      content: [
        {
          type: 'heading',
          text: '⚠️ S=1, R=1の危険性',
          icon: '⚠️',
        },
        {
          type: 'text',
          text: 'この状態では：',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            "Q=0, Q'=0という矛盾状態",
            'S,Rを同時に0にすると不定',
            '実用回路では必ず回避',
          ],
        },
        {
          type: 'note',
          text: '試してみてもOKですが、実際の設計では禁止！',
          icon: '🚫',
        },
      ],
    },
    {
      id: 'gated-sr-latch',
      instruction: '【発展】ゲート付きSRラッチ',
      content: [
        {
          type: 'heading',
          text: '🎛️ Enable信号の追加',
          icon: '🎛️',
        },
        {
          type: 'text',
          text: 'Enable=1の時だけS,Rを受け付ける改良版：',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'タイミング制御が可能',
            'ノイズ耐性の向上',
            'D-FFの基礎となる',
          ],
        },
      ],
    },
    {
      id: 'applications',
      instruction: '【応用】SRラッチの使用例',
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
            '🔘 スイッチのデバウンス回路',
            '🚨 アラームシステムの状態保持',
            '🔧 機械の起動/停止制御',
            '💾 SRAM（静的RAM）の基本セル',
            '🎮 ゲームのフラグ管理',
          ],
        },
      ],
    },
    {
      id: 'comparison',
      instruction: 'D-FF vs SRラッチ',
      content: [
        {
          type: 'heading',
          text: '⚖️ 特徴比較',
          icon: '⚖️',
        },
        {
          type: 'table',
          headers: ['種類', '構造', 'トリガ方式', '動作'],
          rows: [
            ['SRラッチ', 'シンプル（2ゲート）', 'レベルトリガ', '非同期動作'],
            ['D-FF', '複雑（20トランジスタ）', 'エッジトリガ', '同期動作'],
          ],
        },
      ],
    },
    {
      id: 'bistable-principle',
      instruction: '双安定性の原理',
      content: [
        {
          type: 'heading',
          text: '🎢 エネルギーの観点',
          icon: '🎢',
        },
        {
          type: 'text',
          text: '2つの安定状態を持つ理由：',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '正のフィードバックによる自己強化',
            '2つの「谷」を持つエネルギー状態',
            '外部入力で谷から谷へ遷移',
          ],
        },
        {
          type: 'note',
          text: 'ボールが2つの谷のどちらかに落ち着くイメージ',
          icon: '⚪',
        },
      ],
    },
    {
      id: 'achievement',
      instruction: '🎉 SRラッチマスター！',
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
            '✅ 最も基本的な記憶回路',
            '✅ フィードバックの概念',
            '✅ 双安定回路の理解',
            '✅ 非同期メモリの原理',
          ],
        },
        {
          type: 'note',
          text: 'これがすべてのメモリの出発点です！',
          icon: '🌱',
        },
      ],
    },
    {
      id: 'quiz',
      instruction: '理解度チェック！',
      content: [
        {
          type: 'quiz',
          question: 'SRラッチでQ=1を維持するには？',
          options: [
            'S=1, R=1',
            'S=1, R=0の後、S=0, R=0',
            'S=0, R=1',
            'S=0, R=0（最初から）',
          ],
          correctIndex: 1,
        },
      ],
    },
  ],
};

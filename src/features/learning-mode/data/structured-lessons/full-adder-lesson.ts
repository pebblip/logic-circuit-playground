import type { StructuredLesson } from '../../../../types/lesson-content';

export const fullAdderStructuredLesson: StructuredLesson = {
  id: 'full-adder',
  title: '全加算器 - 本物の計算機への進化！',
  description: '3つの数を同時に足せる、より実用的な足し算回路',
  objective:
    '半加算器を組み合わせて、繰り上がりも含めた完全な足し算回路を作り、複数桁の計算原理を理解する',
  category: '基本回路',
  lessonType: 'build',
  difficulty: 'intermediate',
  prerequisites: ['half-adder'],
  estimatedMinutes: 25,
  availableGates: ['INPUT', 'OUTPUT', 'OR', 'XOR', 'AND'],
  steps: [
    {
      id: 'intro',
      instruction: '電卓の「繰り上がり」問題を解決しよう！',
      content: [
        {
          type: 'heading',
          text: '🧮 2桁の計算で困ったこと',
        },
        {
          type: 'rich-text',
          elements: [
            '前回作った半加算器、',
            { text: '1桁の計算は完璧', emphasis: true },
            'でしたね。',
            'でも、',
            { text: '11 + 01', bold: true },
            'のような2桁の計算は？',
          ],
        },
        {
          type: 'heading',
          text: '🤔 繰り上がりの連鎖',
        },
        {
          type: 'rich-text',
          elements: ['筆算を思い出してください：'],
        },
        {
          type: 'table',
          headers: ['', '2桁目', '1桁目'],
          rows: [
            ['', '1', '1'],
            ['+', '0', '1'],
            ['繰り上がり', '1', '←'],
            ['答え', '1', '0', '0'],
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: '問題発見！', bold: true },
            '2桁目の計算では',
            { text: '3つの数', emphasis: true },
            'を足す必要があります：',
            '① 2桁目のA（1）',
            '② 2桁目のB（0）',
            '③ 1桁目からの繰り上がり（1）',
          ],
        },
        {
          type: 'note',
          text: '半加算器は2つしか足せない → 3つ足せる「全加算器」が必要！',
        },
      ],
    },
    {
      id: 'principle',
      instruction: '3つの数を足す魔法の仕組み',
      content: [
        {
          type: 'heading',
          text: '💡 天才的なアイデア',
        },
        {
          type: 'rich-text',
          elements: [
            '「3つを一度に足すのが難しいなら、',
            { text: '2回に分けて足せばいい！', bold: true },
            '」',
          ],
        },
        {
          type: 'heading',
          text: '🎯 2段階方式',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '第1段階：AとBを足す（半加算器1）',
            '第2段階：その結果と繰り上がりCを足す（半加算器2）',
            '最後に：2つの繰り上がりを統合（ORゲート）',
          ],
        },
        {
          type: 'heading',
          text: '📊 全パターンの真理値表',
        },
        {
          type: 'table',
          headers: ['A', 'B', 'Cin', '合計', 'S（和）', 'Cout（繰り上がり）'],
          rows: [
            ['0', '0', '0', '0', '0', '0'],
            ['0', '0', '1', '1', '1', '0'],
            ['0', '1', '0', '1', '1', '0'],
            ['0', '1', '1', '2', '0', '1'],
            ['1', '0', '0', '1', '1', '0'],
            ['1', '0', '1', '2', '0', '1'],
            ['1', '1', '0', '2', '0', '1'],
            ['1', '1', '1', '3', '1', '1'],
          ],
        },
        {
          type: 'note',
          text: '合計が2以上の時は必ず繰り上がりが発生！これが複数桁計算の鍵',
        },
      ],
    },
    {
      id: 'circuit-build',
      instruction: '半加算器を組み合わせて全加算器を作ろう！',
      content: [
        {
          type: 'heading',
          text: '🏗️ 部品と構成',
        },
        {
          type: 'rich-text',
          elements: [
            '今回は',
            { text: '半加算器を2つ', emphasis: true },
            '使います！',
            '前回作った回路が、今回の部品になるのです。',
          ],
        },
        {
          type: 'heading',
          text: '完成イメージ',
        },
        {
          type: 'circuit-diagram',
          circuitId: 'full-adder',
          showTruthTable: false,
        },
        {
          type: 'heading',
          text: '🔧 組み立て手順',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '入力A、B、Cin（前の繰り上がり）を配置',
            '半加算器1を作る：XOR1とAND1を配置',
            'AとBを半加算器1につなぐ',
            '半加算器2を作る：XOR2とAND2を配置',
            '半加算器1の和とCinを半加算器2につなぐ',
            'ORゲートを配置（2つの繰り上がりを統合）',
            '出力S（最終的な和）とCout（最終的な繰り上がり）を配置',
          ],
        },
        {
          type: 'note',
          text: '接続のポイント：XOR1の出力→XOR2の入力、AND1とAND2の出力→ORの入力',
        },
      ],
    },
    {
      id: 'experiment',
      instruction: '予測して実験！8パターンすべてを検証',
      content: [
        {
          type: 'heading',
          text: '🔬 実験の準備',
        },
        {
          type: 'rich-text',
          elements: [
            '全加算器は',
            { text: '8パターン', bold: true },
            'の入力があります。',
            '特に注目すべきは',
            { text: '3つとも1', emphasis: true },
            'の時！',
          ],
        },
        {
          type: 'note',
          text: '予測：1+1+1=11（2進数で3）になるはず。S=1、Cout=1',
        },
        {
          type: 'heading',
          text: '🎮 実験開始！',
        },
        {
          type: 'rich-text',
          elements: [
            '3つの入力を',
            { text: 'ダブルクリック', emphasis: true },
            'して、',
            '以下の重要パターンを試してみましょう：',
          ],
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '0+0+0：すべてOFF（基準状態）',
            '0+1+1：2つだけON（繰り上がり発生？）',
            '1+1+0：前回の半加算器と同じパターン',
            '1+1+1：すべてON（最大値）',
          ],
        },
        {
          type: 'heading',
          text: '🎯 実験結果の確認',
        },
        {
          type: 'table',
          headers: ['パターン', 'A+B+Cin', '期待値', 'S', 'Cout', '正解？'],
          rows: [
            ['すべて0', '0+0+0', '00', '0', '0', '✓'],
            ['2つON', '0+1+1', '10', '0', '1', '✓'],
            ['AB両方ON', '1+1+0', '10', '0', '1', '✓'],
            ['すべて1', '1+1+1', '11', '1', '1', '✓'],
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: '🎉 完璧！', bold: true },
            '全加算器が3つの数を正確に足しています！',
          ],
        },
      ],
    },
    {
      id: 'analysis',
      instruction: '全加算器の巧妙な設計を分析',
      content: [
        {
          type: 'heading',
          text: '🔍 なぜ半加算器2つ＋ORで動くの？',
        },
        {
          type: 'rich-text',
          elements: [
            '秘密は',
            { text: '繰り上がりの性質', emphasis: true },
            'にあります：',
          ],
        },
        {
          type: 'table',
          headers: ['状況', '半加算器1', '半加算器2', 'OR結果'],
          rows: [
            ['3つとも0か1つだけ1', '繰り上がりなし', '繰り上がりなし', '0'],
            [
              '2つが1（どの組み合わせでも）',
              'どちらかで発生',
              'もう片方は0',
              '1',
            ],
            ['3つとも1', '繰り上がり発生', '繰り上がり発生', '1'],
          ],
        },
        {
          type: 'heading',
          text: '💡 設計の美しさ',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '再利用性：半加算器を部品として活用',
            '拡張性：この全加算器も部品になる',
            '効率性：最小限のゲートで実現',
            '汎用性：どんな3つの1ビット数でも計算可能',
          ],
        },
        {
          type: 'heading',
          text: '⚡ 半加算器 vs 全加算器',
        },
        {
          type: 'table',
          headers: ['項目', '半加算器', '全加算器'],
          rows: [
            ['入力数', '2つ（A, B）', '3つ（A, B, Cin）'],
            ['ゲート数', '2個', '5個（XOR×2, AND×2, OR×1）'],
            ['用途', '最下位桁の計算', 'すべての桁で使用可能'],
            ['実用性', '限定的', '非常に高い'],
          ],
        },
        {
          type: 'note',
          text: 'ORゲートの役割：2つの半加算器からの「繰り上がり候補」を統合する',
        },
      ],
    },
    {
      id: 'applications',
      instruction: '全加算器が作る計算の世界',
      content: [
        {
          type: 'heading',
          text: '🌍 複数桁計算への道',
        },
        {
          type: 'rich-text',
          elements: [
            '全加算器を',
            { text: '何個も連結', emphasis: true },
            'すると...',
            { text: '何桁でも計算できる！', bold: true },
          ],
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '4ビット加算器：全加算器×4個 → 0〜15の計算',
            '8ビット加算器：全加算器×8個 → 0〜255の計算',
            '32ビット加算器：全加算器×32個 → 約40億までの計算',
            '64ビット加算器：全加算器×64個 → 天文学的な数の計算',
          ],
        },
        {
          type: 'heading',
          text: '🏢 実際の使用例',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '🏧 ATM：預金残高の計算（入金・出金）',
            '🚗 カーナビ：距離と時間の累積計算',
            '📊 表計算ソフト：セルの合計値計算',
            '🎮 ゲーム：スコアやダメージの累積',
            '⏰ デジタル時計：秒→分→時の繰り上がり',
          ],
        },
        {
          type: 'heading',
          text: '💭 興味深い事実',
        },
        {
          type: 'rich-text',
          elements: [
            'スマートフォンのCPUには',
            { text: '数百万個', bold: true },
            'の全加算器が入っています。',
            '1秒間に',
            { text: '数十億回', emphasis: true },
            'の足し算を実行！',
          ],
        },
        {
          type: 'note',
          text: '全加算器の発明（1940年代）が、現代のデジタル社会の基礎を作りました',
        },
      ],
    },
    {
      id: 'summary',
      instruction: '3つの数を足す回路をマスター！',
      content: [
        {
          type: 'heading',
          text: '🏆 全加算器の要点',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '3つの入力（A, B, 前の繰り上がり）を同時に計算',
            '半加算器2つとORゲート1つで構成',
            '8パターンすべてで正確な結果を出力',
            '複数桁の計算を可能にする基本単位',
          ],
        },
        {
          type: 'quiz',
          question: '全加算器で「1 + 1 + 1」を計算した時の出力は？',
          options: ['S=0、Cout=0', 'S=1、Cout=0', 'S=0、Cout=1', 'S=1、Cout=1'],
          correctIndex: 3,
        },
        {
          type: 'heading',
          text: '次回予告',
        },
        {
          type: 'rich-text',
          elements: [
            { text: '4ビット加算器', bold: true },
            'で、いよいよ実用的な計算機を作ります！',
            '全加算器を4つ連結して、',
            { text: '0〜15の範囲', emphasis: true },
            'で自由に計算できる回路に挑戦。',
            'これで本物の電卓の仕組みが理解できます！',
          ],
        },
        {
          type: 'note',
          text: '今日の全加算器は、すべての計算機の心臓部。この仕組みが世界を変えました！',
        },
      ],
    },
  ],
};

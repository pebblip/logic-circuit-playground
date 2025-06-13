import type { StructuredLesson } from '../../../../types/lesson-content';
import { TERMS } from '../terms';

export const fullAdderStructuredLesson: StructuredLesson = {
  id: 'full-adder',
  title: '全加算器 - 本物の計算機への進化',
  description: '3つの数を同時に足せる、より実用的な足し算回路',
  objective:
    '半加算器を組み合わせて、繰り上がりも含めた完全な足し算回路を作り、複数桁の計算原理を理解する',
  category: '基本回路',
  lessonType: 'build',
  difficulty: 'intermediate',
  prerequisites: ['half-adder'],
  estimatedMinutes: 15,
  availableGates: ['INPUT', 'OUTPUT', 'OR', 'XOR', 'AND'],
  steps: [
    {
      id: 'intro',
      instruction: '繰り上がりを含む足し算の必要性',
      content: [
        {
          type: 'heading',
          text: '身近な例で考える',
        },
        {
          type: 'text',
          text: '普段使っている電卓で、99+1」を計算すると「100」になります。このとき、1桁目の計算で繰り上がりが発生し、2桁目、そして3桁目へと連鎖していきます。',
        },
        {
          type: 'heading',
          text: '半加算器の限界',
        },
        {
          type: 'rich-text',
          elements: [
            '半加算器は',
            { text: '2つの数しか足せません', emphasis: true },
            '。',
            'しかし2桁目以降の計算では、',
            { text: '前の桁からの繰り上がり', bold: true },
            'も考慮する必要があります。',
          ],
        },
        {
          type: 'note',
          text: 'つまり3つの数（A + B + 前の繰り上がり）を足せる「全加算器」が必要',
        },
      ],
    },
    {
      id: 'principle',
      instruction: '全加算器の電気的仕組み',
      content: [
        {
          type: 'heading',
          text: '二段階方式の原理',
        },
        {
          type: 'text',
          text: '3つの数を一度に足すのは困難ですが、半加算器を2つ組み合わせることで解決できます。',
        },
        {
          type: 'heading',
          text: '計算の流れ',
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
          text: '真理値表',
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
      instruction: '全加算器回路を作ってみよう',
      content: [
        {
          type: 'heading',
          text: '手順１：入力ゲートを配置',
        },
        {
          type: 'rich-text',
          elements: [
            { text: `${TERMS.DOUBLE_CLICK}`, emphasis: true },
            'で',
            { text: `${TERMS.INPUT}ゲート`, emphasis: true },
            'を3つ配置します。',
            'A、B、およびCin（前の桁からの繰り上がり）です。',
          ],
        },
        {
          type: 'heading',
          text: '手順２：対象ゲートを配置',
        },
        {
          type: 'rich-text',
          elements: [
            '全加算器では',
            { text: `${TERMS.XOR}ゲート2つ`, emphasis: true },
            '、',
            { text: `${TERMS.AND}ゲート2つ`, emphasis: true },
            '、',
            { text: `${TERMS.OR}ゲート1つ`, emphasis: true },
            'を使用します。',
            'これらが半加算器2つと繰り上がり統合回路を構成します。',
          ],
        },
        {
          type: 'heading',
          text: '手順３：出力ゲートを配置',
        },
        {
          type: 'rich-text',
          elements: [
            { text: `${TERMS.OUTPUT}ゲート`, emphasis: true },
            'を2つ配置します。',
            'S（Sum=和）とCout（Carry out=次の桁への繰り上がり）です。',
          ],
        },
        {
          type: 'heading',
          text: '手順４：配線でつなげる',
        },
        {
          type: 'rich-text',
          elements: [
            '第1段階：AとBをXOR1とAND1に接続。',
            '第2段階：XOR1の出力とCinをXOR2とAND2に接続。',
            '統合：AND1とAND2の出力をORに接続。',
            '最終出力：XOR2→S、OR→Cout。',
          ],
        },
        {
          type: 'note',
          text: '配線のコツ：半加算器2つがORゲートでつながる構造を意識',
        },
      ],
    },
    {
      id: 'experiment',
      instruction: '予測して実験しよう',
      content: [
        {
          type: 'heading',
          text: 'まず予測してみよう',
        },
        {
          type: 'rich-text',
          elements: [
            '3つの入力をどう組み合わせるかで、',
            { text: '8パターン', emphasis: true },
            'の結果が得られます。',
            '特に「1+1+1」のときの動作に注目してください。',
          ],
        },
        {
          type: 'note',
          text: '予想：1+1+1=11（2進数で3）になるはず。S=1、Cout=1',
        },
        {
          type: 'heading',
          text: '実験で確かめよう',
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
          text: '実験結果の分析',
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
            { text: '発見：', bold: true },
            '全加算器が3つの数を正確に足しています。',
            'づ2つ以上が1のときは繰り上がりが発生します。',
          ],
        },
      ],
    },
    {
      id: 'analysis',
      instruction: '全加算器の特徴を分析しよう',
      content: [
        {
          type: 'heading',
          text: '設計の巧妙さ',
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
          text: '半加算器との比較',
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
          type: 'heading',
          text: '確率的な視点',
        },
        {
          type: 'rich-text',
          elements: [
            '8パターンの入力のうち、',
            { text: '繰り上がりが発生する確率', emphasis: true },
            'は50%（4パターン）です。',
            'これは2つ以上の入力が1のときに発生します。',
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
      instruction: '全加算器の実用例',
      content: [
        {
          type: 'heading',
          text: '実世界での活用',
        },
        {
          type: 'text',
          text: '全加算器を複数連結することで、何桁でも計算できるようになります。4ビット加算器は4個、8ビット加算器は8個の全加算器で構成されます。',
        },
        {
          type: 'heading',
          text: '身近な製品での使用例',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'ATM：預金残高の計算（入金・出金）',
            'カーナビ：距離と時間の累積計算',
            '表計算ソフト：セルの合計値計算',
            'ゲーム：スコアやダメージの累積',
            'デジタル時計：秒→分→時の繰り上がり',
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
      instruction: '全加算器をマスター',
      content: [
        {
          type: 'heading',
          text: '全加算器の要点',
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
          text: '全加算器の発明（1940年代）が、現代のデジタル社会の基礎を作りました',
        },
      ],
    },
  ],
};

import type { StructuredLesson } from '../../../../types/lesson-content';
import { TERMS } from '../terms';
export const fullAdderStructuredLesson: StructuredLesson = {
  id: 'full-adder',
  title: '全加算器 - 3つの数を足す回路',
  description: '前の桁からの繰り上がりも含めて計算できる完全な足し算回路',
  objective:
    '半加算器を部品として使い、3つの入力を足せる回路を作る。複数桁の計算への第一歩',
  category: '基本回路',
  lessonType: 'build',
  difficulty: 'intermediate',
  prerequisites: ['half-adder'],
  estimatedMinutes: 25,
  availableGates: ['INPUT', 'OUTPUT', 'OR', 'XOR', 'AND'],
  steps: [
    {
      id: 'intro',
      instruction: '素朴な疑問',
      content: [
        {
          type: 'heading',
          text: '2桁の足し算をやってみよう',
        },
        {
          type: 'text',
          text: '  11  (2進数で3)\n+ 01  (2進数で1)\n----\n 100  (2進数で4)',
        },
        {
          type: 'text',
          text: 'この計算、どうやるか見てみましょう。',
        },
        {
          type: 'heading',
          text: '1桁目の計算',
        },
        {
          type: 'rich-text',
          elements: [
            '1桁目：1 + 1 = 10（2進数）',
            '• 0を書いて',
            '• 1を繰り上げる',
          ],
        },
        {
          type: 'heading',
          text: '2桁目の計算',
        },
        {
          type: 'rich-text',
          elements: [
            '2桁目では：',
            { text: '1 + 0 + 1 = 10', bold: true },
            '（2進数）',
            'つまり3つの数を足す必要があります。',
            'でも前回作った半加算器は2つの数しか足せません。',
          ],
        },
        {
          type: 'note',
          text: 'これが半加算器が「半分」と呼ばれる理由です。繰り上がりを受け取れないから、完全な加算器ではないのです。',
        },
      ],
    },
    {
      id: 'challenge',
      instruction: '今日の挑戦',
      content: [
        {
          type: 'heading',
          text: '目標',
        },
        {
          type: 'rich-text',
          elements: [
            '前回作った半加算器では足りない場面がありました。',
            '繰り上がりも含めて',
            { text: '完全な足し算ができる回路を作れるでしょうか？', bold: true },
          ],
        },
        {
          type: 'heading',
          text: '使うもの',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            `${TERMS.INPUT} 3つ（A、B、繰り上がり）`,
            `${TERMS.OUTPUT} 2つ（結果、次への繰り上がり）`,
            '実は半加算器を2つ使います！',
          ],
        },
        {
          type: 'heading',
          text: 'なぜ半加算器2つ？',
        },
        {
          type: 'rich-text',
          elements: [
            '3つの数を一度に計算するのは難しいですが、',
            { text: '2つずつなら簡単', emphasis: true },
            'ですよね。',
            '実験してみればその仕組みがわかります！',
          ],
        },
      ],
    },
    // 以降のステップは一時的に非表示（デバッグモードでは後でコメントアウトを外す）
    /*
    {
      id: 'approach',
      instruction: '発想の転換',
      content: [
        {
          type: 'heading',
          text: '3つ同時は難しい...',
        },
        {
          type: 'rich-text',
          elements: [
            '一度に3つの数を足すのは複雑です。',
            'でも、',
            { text: '2つずつなら', emphasis: true },
            '半加算器でできますよね？',
          ],
        },
        {
          type: 'heading',
          text: '段階的に計算しよう',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'まず A + B を計算（半加算器1）',
            'その結果 + 前の桁から を計算（半加算器2）',
            '繰り上がりをまとめる（ORゲート）',
          ],
        },
        {
          type: 'note',
          text: '前回作った半加算器を「部品」として使えるんです！',
        },
      ],
    },
    {
      id: 'build',
      instruction: '組み立てよう',
      content: [
        {
          type: 'heading',
          text: '完成形をイメージ',
        },
        {
          type: 'circuit-diagram',
          circuitId: 'full-adder',
          showTruthTable: false,
        },
        {
          type: 'heading',
          text: '作成手順',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            `${TERMS.INPUT}を3つ配置（A、B、前の桁から）`,
            '半加算器1：XORとANDを配置（A + B用）',
            '半加算器2：XORとANDを配置（結果 + 前の桁用）',
            `${TERMS.OR}ゲートを配置（繰り上がりをまとめる）`,
            `${TERMS.OUTPUT}を2つ配置（答え、次の桁へ）`,
          ],
        },
        {
          type: 'heading',
          text: '配線のポイント',
        },
        {
          type: 'rich-text',
          elements: [
            '半加算器では繰り上がりが',
            { text: '2箇所', emphasis: true },
            'から出ます。',
            `これを${TERMS.OR}ゲートで1つにまとめるのがコツです！`,
          ],
        },
      ],
    },
    {
      id: 'experiment',
      instruction: '動作確認',
      content: [
        {
          type: 'heading',
          text: '実験1：簡単なパターン',
        },
        {
          type: 'rich-text',
          elements: [
            '0 + 0 + 1 を試してみましょう。',
            `一番下の${TERMS.INPUT}だけを${TERMS.DOUBLE_CLICK}でONにします。`,
          ],
        },
        {
          type: 'table',
          headers: ['A', 'B', '前の桁', '右の桁', '左の桁'],
          rows: [
            ['0', '0', '1', '1', '0'],
          ],
        },
        {
          type: 'heading',
          text: '実験2：繰り上がりを確認',
        },
        {
          type: 'rich-text',
          elements: [
            '0 + 1 + 1 = 10（2進数）になるはず...',
          ],
        },
        {
          type: 'table',
          headers: ['A', 'B', '前の桁', '右の桁', '左の桁'],
          rows: [
            ['0', '1', '1', '0', '1'],
          ],
        },
        {
          type: 'note',
          text: 'おっ、繰り上がりました！',
        },
        {
          type: 'heading',
          text: '実験3：最大値',
        },
        {
          type: 'rich-text',
          elements: [
            { text: '1 + 1 + 1', bold: true },
            ' これが今回の本命です！',
          ],
        },
        {
          type: 'table',
          headers: ['A', 'B', '前の桁', '右の桁', '左の桁'],
          rows: [
            ['1', '1', '1', '1', '1'],
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: '成功！', bold: true },
            ' 11（2進数）= 3（10進数）が正しく計算できました。',
          ],
        },
      ],
    },
    {
      id: 'discovery',
      instruction: 'なるほど！の瞬間',
      content: [
        {
          type: 'heading',
          text: '実験から気づいたこと',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '3つの数もちゃんと足せた！',
            '半加算器を2つ使えば全加算器になる',
            '繰り上がりは2箇所から出るけど、同時には出ない',
          ],
        },
        {
          type: 'heading',
          text: 'なぜ同時に出ない？',
        },
        {
          type: 'rich-text',
          elements: [
            '半加算器1で繰り上がる',
            { text: '＝A + B = 10', emphasis: true },
            'このとき、次の半加算器への入力は0だから繰り上がらない！',
          ],
        },
        {
          type: 'table',
          headers: ['パターン', '半加算器1', '半加算器2', 'OR出力'],
          rows: [
            ['0+1+1', '繰り上がらない', '繰り上がる', '1'],
            ['1+1+0', '繰り上がる', '繰り上がらない', '1'],
            ['1+1+1', '繰り上がる', '繰り上がらない', '1'],
          ],
        },
        {
          type: 'note',
          text: '小さい回路（半加算器）を組み合わせて、大きい回路（全加算器）が作れました！',
        },
      ],
    },
    {
      id: 'summary',
      instruction: 'できるようになったこと',
      content: [
        {
          type: 'heading',
          text: '今日の成果',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '3つの数を足せる回路を完成',
            '半加算器を「部品」として再利用',
            '複数桁の計算への準備完了',
          ],
        },
        {
          type: 'heading',
          text: 'これがすごい理由',
        },
        {
          type: 'rich-text',
          elements: [
            '今まで：1桁の計算だけ',
            { text: '今回：何桁でも計算できる基礎', bold: true },
            'ができました！',
          ],
        },
        {
          type: 'heading',
          text: '回路の「積み木」',
        },
        {
          type: 'rich-text',
          elements: [
            { text: '小さい部品を組み合わせて大きいものを作る', emphasis: true },
            'これがデジタル回路設計の基本です。',
          ],
        },
        {
          type: 'heading',
          text: '次回予告',
        },
        {
          type: 'rich-text',
          elements: [
            { text: '4ビット加算器', bold: true },
            '（全加算器を4つ繋げて、4桁の計算に挑戦！）',
          ],
        },
        {
          type: 'note',
          text: '半加算器→全加算器と来たあなたなら、必ずできます！',
        },
      ],
    },
    */
  ],
};
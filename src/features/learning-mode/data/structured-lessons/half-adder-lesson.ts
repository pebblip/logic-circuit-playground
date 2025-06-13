import type { StructuredLesson } from '../../../../types/lesson-content';
import { TERMS } from '../terms';

export const halfAdderStructuredLesson: StructuredLesson = {
  id: 'half-adder',
  title: '半加算器 - 電卓の心臓部を作ろう',
  description: '2つのゲートで足し算ができる基本回路',
  objective:
    'XORとANDゲートを組み合わせて、0と1の足し算回路を作り、コンピュータの計算原理を理解する',
  category: '基本回路',
  lessonType: 'build',
  difficulty: 'intermediate',
  prerequisites: ['and-gate', 'xor-gate'],
  estimatedMinutes: 15,
  availableGates: ['INPUT', 'OUTPUT', 'AND', 'XOR'],
  steps: [
    {
      id: 'intro',
      instruction: '電卓は0と1しか知らないという真実',
      content: [
        {
          type: 'rich-text',
          elements: [
            '電卓は実は',
            { text: '0と1だけ', bold: true },
            'で計算しています。',
            'この仕組みは、電気の',
            { text: 'あり・なし', emphasis: true },
            'を使った2進数から生まれます。',
          ],
        },
        {
          type: 'heading',
          text: '身近な例で考える',
        },
        {
          type: 'text',
          text: '指を折って数を数えるとき、普通は10まで数えられます。でも2進数なら、片手だけで31まで数えられるのです。',
        },
        {
          type: 'note',
          text: 'コンピュータの計算原理：たった2つのゲートから始まる魔法',
        },
      ],
    },
    {
      id: 'principle',
      instruction: '2進数の足し算原理',
      content: [
        {
          type: 'heading',
          text: '2進数の足し算パターン',
        },
        {
          type: 'table',
          headers: ['10進数', '2進数', '意味'],
          rows: [
            ['0', '0', '何もない'],
            ['1', '1', '1が1つ'],
            ['2', '10', '2が1つ、1が0個'],
            ['3', '11', '2が1つ、1が1つ'],
            ['4', '100', '4が1つ、2が0個、1が0個'],
          ],
        },
        {
          type: 'heading',
          text: '1+1=10の仕組み',
        },
        {
          type: 'rich-text',
          elements: [
            '2進数では',
            { text: '1 + 1 = 10', bold: true },
            'になります！',
            'これは「2」を意味します。',
            '10進数で9+1=10になるのと同じ原理です。',
          ],
        },
        {
          type: 'heading',
          text: '真理値表で見る足し算',
        },
        {
          type: 'table',
          headers: ['計算', '結果', '10進数では'],
          rows: [
            ['0 + 0', '00', '0'],
            ['0 + 1', '01', '1'],
            ['1 + 0', '01', '1'],
            ['1 + 1', '10', '2（繰り上がり発生！）'],
          ],
        },
        {
          type: 'note',
          text: '右の桁（和）と左の桁（繰り上がり）に注目！これが回路設計のヒントです',
        },
      ],
    },
    {
      id: 'circuit-build',
      instruction: '半加算器回路を作ってみよう',
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
            'を2つ配置します。',
            'これが足し算の2つの数値（AとB）になります。',
          ],
        },
        {
          type: 'heading',
          text: '手順２：対象ゲートを配置',
        },
        {
          type: 'rich-text',
          elements: [
            '半加算器では',
            { text: `${TERMS.XOR}ゲート`, emphasis: true },
            'と',
            { text: `${TERMS.AND}ゲート`, emphasis: true },
            'を2つ使用します。',
            `${TERMS.XOR}は和（1の位）、${TERMS.AND}は繰り上がり（2の位）を計算します。`,
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
            '上側はS（Sum=和）、下側はC（Carry=繰り上がり）の結果を表示します。',
          ],
        },
        {
          type: 'heading',
          text: '手順４：配線でつなげる',
        },
        {
          type: 'rich-text',
          elements: [
            '入力A・Bからの配線を',
            { text: '分岐', emphasis: true },
            'させて、',
            `${TERMS.XOR}と${TERMS.AND}の両方に接続します。`,
            `${TERMS.XOR}の出力→S、${TERMS.AND}の出力→Cに接続します。`,
          ],
        },
        {
          type: 'note',
          text: '配線のコツ：1つの入力から2つのゲートへ配線を分岐させることが半加算器のポイント',
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
            '作った回路が本当に足し算できるか、',
            { text: '4つのパターン', emphasis: true },
            'で予測してみましょう。',
            { text: 'ヒント：', bold: true },
            'XORは「違う時」、ANDは「両方1の時」でしたね...',
          ],
        },
        {
          type: 'note',
          text: '予想：0+0=00、0+1=01、1+0=01、1+1=10になるはず...',
        },
        {
          type: 'heading',
          text: '実験で確かめよう',
        },
        {
          type: 'rich-text',
          elements: [
            '入力A・Bを',
            { text: 'ダブルクリック', emphasis: true },
            'して、すべての組み合わせを試してみましょう！',
            '特に',
            { text: '1 + 1', bold: true },
            'の時の動きに注目！',
          ],
        },
        {
          type: 'heading',
          text: '実験結果の記録',
        },
        {
          type: 'table',
          headers: [
            'A',
            'B',
            'S（和）',
            'C（繰り上がり）',
            '2進数結果',
            '10進数',
          ],
          rows: [
            ['0', '0', '0', '0', '00', '0'],
            ['0', '1', '1', '0', '01', '1'],
            ['1', '0', '1', '0', '01', '1'],
            ['1', '1', '0', '1', '10', '2'],
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: '発見：', bold: true },
            '回路が完璧に2進数の足し算を実行しています。',
            '1+1の時、Sが0、Cが1になって「10」（2進数の2）を表現しています。',
          ],
        },
        {
          type: 'note',
          text: '配線の色にも注目：緑色は電気が流れている（1）、グレーは流れていない（0）',
        },
      ],
    },
    {
      id: 'analysis',
      instruction: '半加算器の特徴を分析しよう',
      content: [
        {
          type: 'heading',
          text: 'この組み合わせの意味',
        },
        {
          type: 'table',
          headers: ['役割', 'ゲート', '動作', '担当する桁'],
          rows: [
            ['和の計算', 'XOR', 'どちらか片方が1', '1の位（右の桁）'],
            ['繰り上がり検出', 'AND', '両方とも1', '2の位（左の桁）'],
          ],
        },
        {
          type: 'heading',
          text: '半加算器の重要性',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '論理演算（真偽の判定）が算術演算（数の計算）になった！',
            'たった2つのゲートで、コンピュータの基本計算が可能に',
            'この原理で、どんな大きな数の計算もできる',
            '世界中のコンピュータがこの仕組みを使っている',
          ],
        },
        {
          type: 'heading',
          text: '確率的な視点',
        },
        {
          type: 'rich-text',
          elements: [
            '入力の組み合わせ4パターンのうち、',
            { text: '和が1になる確率', emphasis: true },
            'は50%（2パターン）、',
            { text: '繰り上がりが1になる確率', emphasis: true },
            'は25%（1パターン）です。',
          ],
        },
        {
          type: 'note',
          text: '「半」加算器という名前は、3つ目の入力（前の桁からの繰り上がり）を扱えないから',
        },
      ],
    },
    {
      id: 'applications',
      instruction: '半加算器の実用例',
      content: [
        {
          type: 'heading',
          text: '実世界での活用',
        },
        {
          type: 'rich-text',
          elements: [
            '今作った回路は、意外なほど',
            { text: 'あらゆる場所', emphasis: true },
            'で活躍しています！',
          ],
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'スマートフォン：アプリの計算処理すべて',
            '自動車：スピードメーターの表示計算',
            'ATM：お金の計算と残高管理',
            'ゲーム機：スコア計算やダメージ計算',
            'デジタル時計：時刻のカウントアップ',
          ],
        },
        {
          type: 'heading',
          text: '身近な製品での使用例',
        },
        {
          type: 'text',
          text: '電卓、コンピュータ、スマートフォンなど、あらゆるデジタル機器の中で半加算器が活躍しています。たった2つのゲートから始まるシンプルな回路が、複雑な計算の基礎となっているのです。',
        },
        {
          type: 'note',
          text: '豆知識：最新のCPUには、約100億個のトランジスタ（ゲートの素）が入っています',
        },
      ],
    },
    {
      id: 'summary',
      instruction: '半加算器をマスター',
      content: [
        {
          type: 'heading',
          text: '半加算器の要点',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '2進数の足し算：0+0=0、0+1=1、1+0=1、1+1=10',
            `${TERMS.XOR}ゲート：和（1の位）を計算`,
            `${TERMS.AND}ゲート：繰り上がり（2の位）を検出`,
            'たった2つのゲートで、すべての計算の基礎が完成',
          ],
        },
        {
          type: 'quiz',
          question:
            '半加算器で「1 + 1」を計算した時、出力S（和）と出力C（繰り上がり）の値は？',
          options: ['S=1、C=1', 'S=0、C=1', 'S=1、C=0', 'S=0、C=0'],
          correctIndex: 1,
        },
        {
          type: 'heading',
          text: '次回予告',
        },
        {
          type: 'rich-text',
          elements: [
            { text: '全加算器', bold: true },
            'で、もっと本格的な計算機を作ります！',
            '3つの数（A + B + 前の繰り上がり）を足せる、',
            'より実用的な回路に挑戦します。',
          ],
        },
        {
          type: 'note',
          text: '今日の半加算器 × たくさん = 本物の電卓やコンピュータの計算回路！',
        },
      ],
    },
  ],
};

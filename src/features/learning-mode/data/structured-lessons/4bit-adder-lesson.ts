import type { StructuredLesson } from '../../../../types/lesson-content';
import { TERMS } from '../terms';

export const fourBitAdderStructuredLesson: StructuredLesson = {
  id: '4bit-adder',
  title: '4ビット加算器 - 大きな数の計算へ',
  description:
    '全加算器を4つ連結して、より大きな数の足し算ができる実用的な計算回路を作ります',
  objective:
    '複数の全加算器を連結して大きな数の計算を可能にし、実際の計算機の仕組みを理解する',
  category: '基本回路',
  lessonType: 'build',
  difficulty: 'intermediate',
  prerequisites: ['full-adder'],
  estimatedMinutes: 15,
  availableGates: ['INPUT', 'OUTPUT', 'CUSTOM'],
  steps: [
    {
      id: 'intro',
      instruction: '大きな数の足し算の必要性',
      content: [
        {
          type: 'heading',
          text: '身近な例で考える',
        },
        {
          type: 'text',
          text: 'ゲームのスコア表示やお小遣いの計算など、1桁では全く足りません。3 + 5 = 8、7 + 9 = 16のような計算は、全加算器1つでは不可能です。',
        },
        {
          type: 'heading',
          text: '筆算の仕組み',
        },
        {
          type: 'text',
          text: '小学校で習った筆算を思い出してください。右から順番に各桁を計算し、繰り上がりを次の桁に伝えていきます。これと同じことを回路で実現します。',
        },
        {
          type: 'note',
          text: '複数桁の計算には、複数の全加算器を連結する必要があります',
        },
      ],
    },
    {
      id: 'principle',
      instruction: '4ビット加算器の電気的仕組み',
      content: [
        {
          type: 'heading',
          text: '4ビットで表せる数',
        },
        {
          type: 'text',
          text: '4ビット（4桁の2進数）では、0000から1111までの16種類の数を表現できます。各桁は1、2、4、8の重みを持ち、最大15（1111）まで表現可能です。',
        },
        {
          type: 'heading',
          text: '連結の原理',
        },
        {
          type: 'text',
          text: '全加算器1つでは最大3までしか計算できませんが、複数の全加算器を連結することで大きな数の計算が可能になります。各桁の計算を1つの全加算器が担当し、繰り上がりを次の全加算器に伝えていきます。',
        },
        {
          type: 'heading',
          text: '真理値表',
        },
        {
          type: 'table',
          headers: ['10進数', '2進数', '8の位', '4の位', '2の位', '1の位'],
          rows: [
            ['0', '0000', '0', '0', '0', '0'],
            ['5', '0101', '0', '1', '0', '1'],
            ['10', '1010', '1', '0', '1', '0'],
            ['15', '1111', '1', '1', '1', '1'],
          ],
        },
        {
          type: 'note',
          text: '各桁の全加算器が繰り上がりを伝えることで、筆算と同じ仕組みを実現',
        },
      ],
    },
    {
      id: 'circuit-build',
      instruction: '4ビット加算器回路を作ってみよう',
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
            'を8つ配置します。',
            '数A（4ビット）と数B（4ビット）の入力です。',
          ],
        },
        {
          type: 'heading',
          text: '手順２：対象ゲートを配置',
        },
        {
          type: 'rich-text',
          elements: [
            'カスタムゲート（全加算器）を',
            { text: '4つ', emphasis: true },
            '配置します。',
            '各桁の計算を担当する全加算器です。',
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
            'を5つ配置します。',
            '和（4ビット）と最終繰り上がり（1ビット）の出力です。',
          ],
        },
        {
          type: 'heading',
          text: '手順４：配線でつなげる',
        },
        {
          type: 'rich-text',
          elements: [
            'データ線：各桁のA、Bを対応する全加算器へ接続。',
            '繰り上がり線：0桁目のCout→1桁目のCin、のように順番に接続。',
            '初期値：0桁目のCinは0（繰り上がりなし）。',
            '出力線：各全加算器のSとCoutを出力へ接続。',
          ],
        },
        {
          type: 'note',
          text: '配線のコツ：1桁ずつ完成させてから次へ進むと間違いが少ない',
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
          type: 'text',
          text: '簡単な計算から始めましょう。3 + 5 = 8（0011 + 0101 = 1000）を試してみます。繰り上がりがどのように伝わるか注目してください。',
        },
        {
          type: 'heading',
          text: '実験で確かめよう',
        },
        {
          type: 'table',
          headers: ['計算', 'A（2進数）', 'B（2進数）', '結果（2進数）', '10進数'],
          rows: [
            ['3 + 5', '0011', '0101', '1000', '8'],
            ['7 + 9', '0111', '1001', '10000', '16'],
            ['15 + 1', '1111', '0001', '10000', '16'],
            ['15 + 15', '1111', '1111', '11110', '30'],
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: '発見：', bold: true },
            '15 + 1の計算では、繰り上がりが',
            { text: '連鎖的に', emphasis: true },
            '伝わっていく様子が観察できます。',
          ],
        },
        {
          type: 'note',
          text: '5ビット目（最終繰り上がり）があることで、4ビット＋4ビットでも正確に計算できます',
        },
      ],
    },
    {
      id: 'analysis',
      instruction: '4ビット加算器の特徴を分析しよう',
      content: [
        {
          type: 'heading',
          text: 'リップルキャリー（波紋のような繰り上がり）',
        },
        {
          type: 'text',
          text: '15 + 1 = 16の計算では、1の位から始まった繰り上がりが波のように順番に伝わっていきます。この方式をリップルキャリー加算器と呼びます。',
        },
        {
          type: 'heading',
          text: '設計の特徴',
        },
        {
          type: 'table',
          headers: ['項目', '1ビット', '4ビット', '拡張性'],
          rows: [
            ['計算範囲', '0〜1', '0〜15', 'ビット数に応じて拡大'],
            ['全加算器数', '不要', '4個', 'ビット数と同数'],
            ['繰り上がり', 'なし', '連鎖的', '順番に伝播'],
            ['計算時間', '即座', '段階的', '桁数に比例'],
          ],
        },
        {
          type: 'heading',
          text: '確率的な視点',
        },
        {
          type: 'rich-text',
          elements: [
            '4ビット同士のランダムな加算で、',
            { text: '最終繰り上がりが発生する確率', emphasis: true },
            'は約50%です。',
            'これは結果が16以上になる確率と等しくなります。',
          ],
        },
        {
          type: 'note',
          text: '利点：構造がシンプル、欠点：桁数が増えると計算時間も増える',
        },
      ],
    },
    {
      id: 'applications',
      instruction: '4ビット加算器の実用例',
      content: [
        {
          type: 'heading',
          text: '実世界での活用',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'レトロゲーム：スコア計算（0〜30点）',
            'タイマー：秒カウンター（0〜30秒）',
            '温度計：温度表示（0〜30度）',
            '信号機：タイマー制御（0〜30秒）',
          ],
        },
        {
          type: 'heading',
          text: '身近な製品での使用例',
        },
        {
          type: 'table',
          headers: ['ビット数', '全加算器数', '計算範囲', '用途例'],
          rows: [
            ['8ビット', '8個', '0〜255', 'マイコン、センサー'],
            ['16ビット', '16個', '0〜65,535', '初期のPC、ゲーム機'],
            ['32ビット', '32個', '0〜約43億', 'スマートフォン'],
            ['64ビット', '64個', '0〜約1800京', '最新のPC、サーバー'],
          ],
        },
        {
          type: 'note',
          text: '基本原理は同じ！規模が大きくなるだけです',
        },
      ],
    },
    {
      id: 'summary',
      instruction: '4ビット加算器をマスター',
      content: [
        {
          type: 'heading',
          text: '4ビット加算器の要点',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '4つの全加算器を連結して0〜15の計算を実現',
            '繰り上がりが順番に伝わるリップルキャリー方式',
            '5ビット目の出力で最大30まで正確に計算',
            '拡張すれば何桁でも計算可能な基本構造',
          ],
        },
        {
          type: 'quiz',
          question: '4ビット加算器で 7 + 9 を計算すると？',
          options: [
            '0000（計算不可）',
            '1111（15）',
            '10000（16）',
            '10001（17）',
          ],
          correctIndex: 2,
        },
        {
          type: 'heading',
          text: '次回予告',
        },
        {
          type: 'rich-text',
          elements: [
            { text: '比較器', bold: true },
            'で、「どちらが大きい？」を判定する回路を学びます。',
            'if文の基礎となる重要な回路です。',
          ],
        },
        {
          type: 'note',
          text: '今日作った4ビット加算器が、すべての計算機の基本です',
        },
      ],
    },
  ],
};
import type { StructuredLesson } from '../../../../types/lesson-content';
import { TERMS } from '../terms';
export const halfAdderStructuredLesson: StructuredLesson = {
  id: 'half-adder',
  title: '半加算器 - 論理ゲートで作る足し算マシン',
  description: '2つのゲートだけで2進数の足し算ができる',
  objective:
    'XORゲートとANDゲートを組み合わせて、2進数の足し算回路を作る',
  category: '基本回路',
  lessonType: 'build',
  difficulty: 'intermediate',
  prerequisites: ['and-gate', 'xor-gate'],
  estimatedMinutes: 20,
  availableGates: ['INPUT', 'OUTPUT', 'AND', 'XOR'],
  steps: [
    {
      id: 'intro',
      instruction: 'コンピュータの数の表し方',
      content: [
        {
          type: 'heading',
          text: '素朴な疑問',
        },
        {
          type: 'rich-text',
          elements: [
            'コンピュータは',
            { text: '0と1しか理解できません', bold: true },
            '。',
            'それなのに、どうやって',
            { text: '足し算', emphasis: true },
            'ができるのでしょうか？',
          ],
        },
        {
          type: 'heading',
          text: '10進数と2進数',
        },
        {
          type: 'rich-text',
          elements: [
            '私たちは普段',
            { text: '10進数', emphasis: true },
            '（0〜9）を使いますが、',
            'コンピュータは',
            { text: '2進数', emphasis: true },
            '（0と1）で数を表現します。',
          ],
        },
        {
          type: 'heading',
          text: '数の対応表',
        },
        {
          type: 'table',
          headers: ['10進数', '2進数'],
          rows: [
            ['0', '0'],
            ['1', '1'],
            ['2', '10'],
            ['3', '11'],
          ],
        },
        {
          type: 'heading',
          text: '繰り上がりの仕組み',
        },
        {
          type: 'rich-text',
          elements: [
            { text: '10進数', emphasis: true },
            '：0→1→2→...→9、そして9の次は',
            { text: '10', bold: true },
            '（2桁になる）',
            { text: '2進数', emphasis: true },
            '：0→1、そして1の次は',
            { text: '10', bold: true },
            '（2桁になる）',
          ],
        },
        {
          type: 'note',
          text: '2進数では「1」の次がすぐに「10」になります！',
        },
      ],
    },
    {
      id: 'binary-addition',
      instruction: '2進数の足し算を理解しよう',
      content: [
        {
          type: 'heading',
          text: '2進数で足し算してみよう',
        },
        {
          type: 'text',
          text: '実際に2進数どうしを足してみましょう。結果は2桁で表現しています。',
        },
        {
          type: 'table',
          headers: ['A', '+', 'B', '=', '結果'],
          rows: [
            ['0', '+', '0', '=', '00'],
            ['0', '+', '1', '=', '01'],
            ['1', '+', '0', '=', '01'],
            ['1', '+', '1', '=', '10'],
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: '注目！', bold: true },
            ' 1 + 1 の結果は「10」になりました。',
            'これは10進数の「2」を2進数で表したものです。',
          ],
        },
        {
          type: 'heading',
          text: '結果を左右に分けて観察',
        },
        {
          type: 'text',
          text: '上の足し算の結果を、右の桁（1の位）と左の桁（2の位）に分けて見てみましょう。',
        },
        {
          type: 'table',
          headers: ['A', 'B', '右の桁', '左の桁'],
          rows: [
            ['0', '0', '0', '0'],
            ['0', '1', '1', '0'],
            ['1', '0', '1', '0'],
            ['1', '1', '0', '1'],
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: '気づきましたか？', bold: true },
          ],
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '右の桁：AとBが異なるときだけ1になる',
            '左の桁：AとBが両方1のときだけ1になる',
          ],
        },
        {
          type: 'note',
          text: 'この2つのパターンが、後で使うゲートの動作と完全に一致します！',
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
            'この2進数の足し算を、',
            { text: '論理ゲートで実現できるでしょうか？', bold: true },
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
            `${TERMS.INPUT}2つ（A、B）`,
            `${TERMS.OUTPUT}2つ（右の桁用、左の桁用）`,
            `${TERMS.XOR}ゲート1つ`,
            `${TERMS.AND}ゲート1つ`,
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: 'なぜこの組み合わせ？', bold: true },
            ' それは実験してみればわかります！',
          ],
        },
      ],
    },
    {
      id: 'build',
      instruction: '回路を作ってみよう',
      content: [
        {
          type: 'heading',
          text: '完成形をイメージ',
        },
        {
          type: 'circuit-diagram',
          circuitId: 'half-adder',
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
            `${TERMS.INPUT}（A、B）を2つ配置`,
            `${TERMS.XOR}ゲートを配置（上側）`,
            `${TERMS.AND}ゲートを配置（下側）`,
            `${TERMS.OUTPUT}を2つ配置（右の桁用と左の桁用）`,
            'AとBから両方のゲートへ配線（分岐）',
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: 'ポイント：', bold: true },
            '配線は',
            { text: '分岐', emphasis: true },
            'させます！1つの出力から2つのゲートへ。',
          ],
        },
      ],
    },
    {
      id: 'experiment',
      instruction: '実験：4つのパターンを試そう',
      content: [
        {
          type: 'heading',
          text: '実験方法',
        },
        {
          type: 'rich-text',
          elements: [
            'A、Bを',
            { text: TERMS.DOUBLE_CLICK, emphasis: true },
            'でON/OFF切り替えて、',
            { text: '本当に足し算ができるか', bold: true },
            '確認します！',
          ],
        },
        {
          type: 'heading',
          text: '観察のポイント',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '右側の出力は正しく右の桁（1の位）を表示するか？',
            '左側の出力は正しく左の桁（2の位）を表示するか？',
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: '特に注目：', bold: true },
            ' 1 + 1 のとき、何が起こるでしょうか...？',
          ],
        },
      ],
    },
    {
      id: 'discovery',
      instruction: '発見：ゲートと足し算の関係',
      content: [
        {
          type: 'heading',
          text: '実験結果を振り返る',
        },
        {
          type: 'table',
          headers: ['A', 'B', '右の桁（1の位）', '左の桁（2の位）'],
          rows: [
            ['0', '0', '0', '0'],
            ['0', '1', '1', '0'],
            ['1', '0', '1', '0'],
            ['1', '1', '0', '1'],
          ],
        },
        {
          type: 'heading',
          text: '驚きの発見',
        },
        {
          type: 'rich-text',
          elements: [
            '見てください！',
          ],
        },
        {
          type: 'list',
          ordered: false,
          items: [
            `${TERMS.XOR}ゲートが右の桁（1の位）を完璧に計算！`,
            `${TERMS.AND}ゲートが左の桁（2の位）を完璧に計算！`,
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: 'これは偶然でしょうか？', emphasis: true },
            'いいえ！',
            { text: '論理演算が算術演算になった瞬間です！', bold: true },
          ],
        },
      ],
    },
    {
      id: 'summary',
      instruction: 'まとめ：半加算器の本質',
      content: [
        {
          type: 'heading',
          text: '今日の成果',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '2進数の足し算を理解',
            `${TERMS.XOR}と${TERMS.AND}で足し算回路を実現`,
            '論理ゲートで計算ができることを発見',
          ],
        },
        {
          type: 'heading',
          text: 'これがすごい理由',
        },
        {
          type: 'rich-text',
          elements: [
            { text: 'たった2つ', emphasis: true },
            'の論理ゲートで、コンピュータの最も基本的な計算ができました。',
            { text: 'これが全てのコンピュータの計算の基礎です！', bold: true },
          ],
        },
        {
          type: 'heading',
          text: '次回予告',
        },
        {
          type: 'rich-text',
          elements: [
            { text: '全加算器', bold: true },
            '（3つの入力を足せる、より高度な回路）',
          ],
        },
        {
          type: 'note',
          text: '今日の発見をベースに、さらに高度な回路へ挑戦します！',
        },
      ],
    },
  ],
};

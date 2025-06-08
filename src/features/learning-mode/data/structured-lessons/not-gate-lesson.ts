import type { StructuredLesson } from '../../../../types/lesson-content';
import { TERMS } from '../terms';

export const notGateStructuredLesson: StructuredLesson = {
  id: 'not-gate',
  title: `${TERMS.NOT}ゲート - 反転の魔法！`,
  description: '入力を反転させる最もシンプルで重要なゲートを学びます',
  objective:
    `${TERMS.NOT}ゲートの動作原理を理解し、「反転」の概念を習得。デジタル回路における0と1の切り替えの重要性を学びます`,
  difficulty: 'beginner',
  prerequisites: ['digital-basics'],
  estimatedMinutes: 10,
  availableGates: ['INPUT', 'OUTPUT', 'NOT'],
  steps: [
    {
      id: 'intro',
      instruction: `${TERMS.NOT}ゲートは「反転」という魔法を使います。`,
      content: [
        {
          type: 'rich-text',
          elements: [
            { text: TERMS.LOW, bold: true },
            'を',
            { text: TERMS.HIGH, bold: true },
            'に、',
            { text: TERMS.HIGH, bold: true },
            'を',
            { text: TERMS.LOW, bold: true },
            'に変える、とてもシンプルだけど超重要な',
            { text: TERMS.GATE, bold: true },
            'です！'
          ]
        },
        {
          type: 'heading',
          text: '🌍 身近な例',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            `💡 ライトスイッチ：${TERMS.ON}→${TERMS.OFF}、${TERMS.OFF}→${TERMS.ON}`,
            '🚪 扉：開いている→閉める、閉まっている→開ける',
            '🌙 昼夜：昼→夜、夜→昼',
            '🔄 反対語：ポジティブ→ネガティブ',
          ],
        },
        {
          type: 'note',
          text: `💡 ${TERMS.NOT}ゲートの別名：「反転ゲート」（入力を逆にするから）`
        },
      ],
    },
    {
      id: 'place-gates',
      instruction: `${TERMS.INPUT}と${TERMS.NOT}ゲートを配置しましょう。`,
      hint: `左のツールパレットから「${TERMS.INPUT}」をキャンバスの左側に、「基本ゲート」から「${TERMS.NOT}」をその右側に配置してください。`,
      content: [
        {
          type: 'rich-text',
          elements: [
            { text: TERMS.NOT, gate: true },
            'ゲートが中心的な役割を果たします。'
          ]
        }
      ],
      action: { type: 'place-gate', gateType: 'NOT' },
    },
    {
      id: 'place-output',
      instruction: `最後に、結果を表示する${TERMS.OUTPUT}を配置します。`,
      hint: `${TERMS.OUTPUT}を${TERMS.NOT}ゲートの右側に配置してください。`,
      content: [],
      action: { type: 'place-gate', gateType: 'OUTPUT' },
    },
    {
      id: 'connect',
      instruction: `${TERMS.WIRE}して${TERMS.CIRCUIT}を完成させましょう。`,
      hint: `${TERMS.INPUT}の${TERMS.OUTPUT_PIN}を${TERMS.NOT}の${TERMS.INPUT_PIN}に、${TERMS.NOT}の${TERMS.OUTPUT_PIN}を${TERMS.OUTPUT}の${TERMS.INPUT_PIN}に${TERMS.CONNECT}してください。`,
      content: [
        {
          type: 'note',
          text: `🔗 配線のポイント：${TERMS.INPUT}の${TERMS.OUTPUT_PIN}（${TERMS.RIGHT_CIRCLE}）を${TERMS.NOT}ゲートの${TERMS.INPUT_PIN}（${TERMS.LEFT_CIRCLE}）に${TERMS.CONNECT}します。`,
        }
      ],
      action: { type: 'connect-wire' },
    },
    {
      id: 'circuit-answer',
      instruction: '完成形を確認しよう！',
      content: [
        {
          type: 'circuit-diagram-v2',
          circuitId: 'not-gate',
          showTruthTable: false,
        },
        {
          type: 'note',
          text: '✅ 入力 → NOTゲート → 出力 の順につながっています'
        }
      ],
    },
    {
      id: 'predict',
      instruction: '予測してみよう！',
      content: [
        {
          type: 'heading',
          text: '🤔 考えてみよう'
        },
        {
          type: 'text',
          text: '「反転の魔法」という名前から、どんな動作をすると思いますか？'
        },
        {
          type: 'rich-text',
          elements: [
            { text: '💭 ヒント：', bold: true },
            '日常生活で「反転」といえば、ON→OFF、OFF→ONのように...'
          ]
        },
        {
          type: 'note',
          text: '予測：入力が0なら1に、1なら0になるはず...'
        }
      ]
    },
    {
      id: 'experiment-and-observation',
      instruction: `実験で確かめよう！${TERMS.NOT}ゲートの動作を確認`,
      content: [
        {
          type: 'rich-text',
          elements: [
            { text: '💡 操作方法：', bold: true },
            `${TERMS.INPUT}を`,
            { text: TERMS.DOUBLE_CLICK, emphasis: true },
            `して動作を確認してください。`
          ]
        },
        {
          type: 'heading',
          text: `📊 ${TERMS.TRUTH_TABLE}（実験結果）`
        },
        {
          type: 'rich-text',
          elements: [
            { text: TERMS.TRUTH_TABLE, emphasis: true },
            `とは、${TERMS.INPUT}と${TERMS.OUTPUT}の関係を示す表です。`
          ]
        },
        {
          type: 'table',
          headers: [`${TERMS.INPUT}`, `${TERMS.OUTPUT}`],
          rows: [
            [`${TERMS.LOW}（${TERMS.OFF}）`, `${TERMS.HIGH}（${TERMS.ON}）`],
            [`${TERMS.HIGH}（${TERMS.ON}）`, `${TERMS.LOW}（${TERMS.OFF}）`]
          ],
        },
        {
          type: 'rich-text',
          elements: [
            '✨ ',
            { text: TERMS.NOT, gate: true },
            'ゲートは入力を',
            { text: '完全に反転', bold: true },
            'させます！'
          ]
        },
        {
          type: 'rich-text',
          elements: [
            { text: '📊 特徴：', bold: true },
            '常に入力と逆の値を出力（100%反転）'  
          ]
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'applications',
      instruction: `【応用】${TERMS.NOT}ゲートの実用例`,
      content: [
        {
          type: 'heading',
          text: '🔧 実際の使用例',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '信号の反転：0を1に、1を0に変換',
            'スイッチの切り替え：ON/OFFを逆にする',
            'エラー検出：正常/異常の判定',
            '状態の反転：現在の状態を逆にする',
          ],
        },
        {
          type: 'note',
          text: `📝 ${TERMS.NOT}ゲートは三角形の先に小さな丸（バブル）がついた形で表されます。この丸が「反転」を意味します。`,
        },
      ],
    },
    {
      id: 'quiz',
      instruction: '理解度チェック！',
      content: [
        {
          type: 'quiz',
          question: `${TERMS.NOT}ゲートに「${TERMS.HIGH}」を入力したら、${TERMS.OUTPUT}は？`,
          options: [TERMS.LOW, TERMS.HIGH, '変化しない', 'エラーになる'],
          correctIndex: 0,
        },
      ],
    },
    {
      id: 'summary',
      instruction: `【まとめ】${TERMS.NOT}ゲートの重要ポイント`,
      content: [
        {
          type: 'heading',
          text: '🎆 今日学んだこと',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            `${TERMS.NOT}ゲートは入力を反転させる`,
            `${TERMS.LOW}→${TERMS.HIGH}、${TERMS.HIGH}→${TERMS.LOW}に変換`,
            '最もシンプルだが重要なゲート',
            `${TERMS.TRUTH_TABLE}はたった2行`,
          ],
        },
        {
          type: 'note',
          text: `🚀 次は「${TERMS.AND}ゲート」で複数の入力を扱いましょう！`,
        },
      ],
    },
  ],
};
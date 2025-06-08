import type { StructuredLesson } from '../../../../types/lesson-content';
import { TERMS } from '../terms';

export const xorGateStructuredLesson: StructuredLesson = {
  id: 'xor-gate',
  title: `${TERMS.XOR}ゲート - 排他的論理和！`,
  description: `2つの${TERMS.INPUT}が「異なる」ときだけ${TERMS.ON}になる特殊なゲートを学びます`,
  objective:
    `${TERMS.XOR}ゲートの動作原理を理解し、「排他的論理和」の概念を習得。実用的な応用例を学びます`,
  difficulty: 'beginner',
  prerequisites: ['and-gate', 'or-gate'],
  estimatedMinutes: 10,
  availableGates: ['INPUT', 'XOR', 'OUTPUT'],
  steps: [
    {
      id: 'intro',
      instruction: `${TERMS.XOR}ゲートは「違い」を検出する特殊なゲートです！`,
      content: [
        {
          type: 'rich-text',
          elements: [
            { text: TERMS.XOR, gate: true },
            `ゲートは、2つの${TERMS.INPUT}が`,
            { text: '異なる値', emphasis: true },
            `のときだけ${TERMS.ON}を出力します。`
          ]
        },
        {
          type: 'heading',
          text: '🎮 ゲームで例えると',
        },
        {
          type: 'text',
          text: '「2人プレイで、違うボタンを押したらポイントゲット！」みたいなルールです。',
        },
      ],
    },
    {
      id: 'place-gates',
      instruction: `${TERMS.INPUT}、${TERMS.XOR}ゲート、${TERMS.OUTPUT}を配置しましょう。`,
      hint: `左のツールパレットから「${TERMS.INPUT}」を2つキャンバスの左側に縦に並べ、「基本ゲート」から「${TERMS.XOR}」をその右側に、最後に${TERMS.OUTPUT}を${TERMS.XOR}ゲートの右側に配置してください。`,
      content: [],
      action: { type: 'place-gate', gateType: 'XOR' },
    },
    {
      id: 'connect',
      instruction: `${TERMS.WIRE}して${TERMS.CIRCUIT}を完成させましょう。`,
      hint: `各${TERMS.INPUT}の${TERMS.OUTPUT_PIN}を${TERMS.XOR}の${TERMS.INPUT_PIN}に、${TERMS.XOR}の${TERMS.OUTPUT_PIN}を${TERMS.OUTPUT}の${TERMS.INPUT_PIN}に${TERMS.CONNECT}してください。`,
      content: [],
      action: { type: 'connect-wire' },
    },
    {
      id: 'circuit-answer',
      instruction: '完成形を確認しよう！',
      content: [
        {
          type: 'circuit-diagram-v2',
          circuitId: 'xor-gate',
          showTruthTable: false,
        },
        {
          type: 'note',
          text: '✅ 2つの入力 → XORゲート → 出力 の順につながっています'
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
          text: '「排他的論理和」という名前から、どんな時に出力がONになると思いますか？'
        },
        {
          type: 'rich-text',
          elements: [
            { text: '💭 ヒント：', bold: true },
            '「違い」がキーワードです。2つの入力が同じ時と違う時を考えてみて。'
          ]
        },
        {
          type: 'note',
          text: '予測：入力が違う時（片方だけON）に出力がONになりそう...'
        }
      ]
    },
    {
      id: 'experiment',
      instruction: '実験で確かめよう！4つのパターンをすべて試してみましょう。',
      content: [
        {
          type: 'rich-text',
          elements: [
            { text: TERMS.XOR, gate: true },
            `は「どちらか片方だけ${TERMS.ON}」のときに反応します。`
          ]
        },
        {
          type: 'note',
          text: `💡 特に「両方${TERMS.ON}」のときに注目してください！違いがあるときだけ${TERMS.ON}になります。`,
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'results',
      instruction: '【パターン分析】実験結果を整理しましょう。',
      content: [
        {
          type: 'table',
          headers: [`${TERMS.INPUT}A`, `${TERMS.INPUT}B`, `${TERMS.OUTPUT}`],
          rows: [
            [TERMS.OFF, TERMS.OFF, TERMS.OFF],
            [TERMS.OFF, TERMS.ON, TERMS.ON],
            [TERMS.ON, TERMS.OFF, TERMS.ON],
            [TERMS.ON, TERMS.ON, TERMS.OFF]
          ],
        },
        {
          type: 'heading',
          text: `💡 発見：${TERMS.INPUT}が「違う」ときだけ${TERMS.ON}を出力！`,
        },
        {
          type: 'text',
          text: `覚え方：「同じなら${TERMS.OFF}、違えば${TERMS.ON}」`,
        },
      ],
    },
    {
      id: 'comparison',
      instruction: '【比較】OR、AND、XORの違いを理解しよう',
      content: [
        {
          type: 'heading',
          text: '🎯 3つのゲートを比較',
        },
        {
          type: 'table',
          headers: [`${TERMS.INPUT}A`, `${TERMS.INPUT}B`, `${TERMS.AND}出力`, `${TERMS.OR}出力`, `${TERMS.XOR}出力`],
          rows: [
            [TERMS.OFF, TERMS.OFF, TERMS.OFF, TERMS.OFF, TERMS.OFF],
            [TERMS.OFF, TERMS.ON, TERMS.OFF, TERMS.ON, TERMS.ON],
            [TERMS.ON, TERMS.OFF, TERMS.OFF, TERMS.ON, TERMS.ON],
            [TERMS.ON, TERMS.ON, TERMS.ON, TERMS.ON, `${TERMS.OFF}✨`],
          ],
        },
        {
          type: 'note',
          text: `💡 「両方${TERMS.ON}」の時だけ違う！${TERMS.AND}=${TERMS.ON}、${TERMS.OR}=${TERMS.ON}、${TERMS.XOR}=${TERMS.OFF}`,
        },
      ],
    },
    {
      id: 'real-world',
      instruction: '【実用例】XORゲートはどこで使われる？',
      content: [
        {
          type: 'heading',
          text: '🌟 実世界での活用',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '🧮 加算器：2進数の足し算の基本部品',
            '🔐 暗号化：データの暗号化・復号化',
            '🎮 ゲーム：同時押し禁止の実装',
            '🚦 エラー検出：データの整合性チェック',
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
          question: `${TERMS.XOR}ゲートで、両方の${TERMS.INPUT}が${TERMS.ON}のとき${TERMS.OUTPUT}は？`,
          options: [TERMS.OFF, TERMS.ON, '不定', 'エラー'],
          correctIndex: 0,
        },
      ],
    },
    {
      id: 'summary',
      instruction: `【まとめ】${TERMS.XOR}ゲートの重要ポイント`,
      content: [
        {
          type: 'heading',
          text: '🎆 今日学んだこと',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            `${TERMS.XOR}は「違い」を見つけるゲート`,
            `${TERMS.INPUT}が異なるときだけ${TERMS.ON}を出力`,
            `両方${TERMS.OFF}または両方${TERMS.ON}のときは${TERMS.OFF}`,
            '加算器やエラー検出に使われる',
          ],
        },
        {
          type: 'note',
          text: `🚀 次は「半加算器」で${TERMS.XOR}を実際に使ってみましょう！`,
        },
      ],
    },
  ],
};

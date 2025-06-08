import type { StructuredLesson } from '../../../../types/lesson-content';
import { TERMS } from '../terms';

export const andGateStructuredLesson: StructuredLesson = {
  id: 'and-gate',
  title: 'ANDゲート - すべてが揃って初めてON！',
  description:
    '2つの入力が両方ともONの時だけ出力がONになる「AND」の動作を学びます',
  objective:
    'ANDゲートの基本動作を理解し、真理値表を確認して「両方必要」の概念を習得する',
  category: '基本ゲート',
  lessonType: 'gate-intro',
  difficulty: 'beginner',
  prerequisites: [],
  estimatedMinutes: 10,
  availableGates: ['INPUT', 'OUTPUT', 'AND'],
  steps: [
    {
      id: 'intro',
      instruction:
        'ANDゲートは「すべての条件が満たされたとき」だけ動作します。',
      content: [
        {
          type: 'rich-text',
          elements: [
            '日常生活で例えると、',
            { text: '「鍵」と「暗証番号」の両方', emphasis: true },
            'が必要な金庫のようなものです。',
          ],
        },
        {
          type: 'heading',
          text: '🎯 身近な例',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '🚪 オートロック：カギも暗証番号も両方必要 → ドアが開く',
            '🚗 車の発進：シートベルトを締めて、エンジンもON → 走れる',
            '📱 スマホ：パスコードと指紋が一致 → ロック解除',
          ],
        },
      ],
    },
    {
      id: 'concept',
      instruction: '【基礎知識】ANDゲートの動作原理',
      content: [
        {
          type: 'heading',
          text: '🔌 なぜ「AND」というの？',
        },
        {
          type: 'rich-text',
          elements: [
            '電気回路で考えると、2つのスイッチを',
            { text: '「つなげて」', emphasis: true },
            '配置したようなものです。',
            {
              text: '両方のスイッチをONにしないと、電気は流れません。',
              bold: true,
            },
          ],
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '両方のスイッチがON → 電流が流れる → 出力がON',
            'どちらかがOFF → 電流が遮断 → 出力がOFF',
          ],
        },
        {
          type: 'heading',
          text: '💡 スイッチの例で考える',
        },
        {
          type: 'text',
          text: '2つのスイッチを直列につないだ回路を想像してください。電源からランプまでの間にスイッチAとスイッチBが順番に並んでいます。',
        },
        {
          type: 'heading',
          text: '【直列回路のイメージ】',
        },
        {
          type: 'svg-diagram',
          diagramType: 'series-circuit',
          width: 400,
          height: 200,
        },
        {
          type: 'rich-text',
          elements: [
            { text: '電源 → スイッチA → スイッチB → ランプ', bold: true },
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: '💡 ポイント：', bold: true },
            'スイッチが',
            { text: '一列につながっている', emphasis: true },
            'ので、',
            { text: 'どちらか1つでもOFF', emphasis: true },
            'なら電気は流れません。',
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: '→ ', bold: true },
            { text: 'スイッチA', emphasis: true },
            'も',
            { text: 'スイッチB', emphasis: true },
            'も',
            { text: '両方ON', bold: true },
            'じゃないと電気は流れない！',
          ],
        },
        {
          type: 'table',
          headers: ['スイッチA', 'スイッチB', '結果'],
          rows: [
            [TERMS.OFF, TERMS.OFF, 'ランプ消灯'],
            [TERMS.OFF, TERMS.ON, 'ランプ消灯'],
            [TERMS.ON, TERMS.OFF, 'ランプ消灯'],
            [TERMS.ON, TERMS.ON, 'ランプ点灯✨'],
          ],
        },
        {
          type: 'note',
          text: '🔌 2つのスイッチをつなげた回路：両方ONじゃないと電気は流れません！',
        },
      ],
    },
    {
      id: 'place-gates',
      instruction: `${TERMS.INPUT}、${TERMS.AND}ゲート、${TERMS.OUTPUT}を配置しましょう。`,
      hint: `左のツールパレットから「${TERMS.INPUT}」を2つキャンバスの左側に縦に並べ、「基本ゲート」から「${TERMS.AND}」をその右側に、最後に${TERMS.OUTPUT}を${TERMS.AND}ゲートの右側に配置してください。`,
      content: [],
      action: { type: 'place-gate', gateType: 'AND' },
    },
    {
      id: 'connect',
      instruction: `${TERMS.WIRE}して${TERMS.CIRCUIT}を完成させましょう。`,
      hint: `各${TERMS.INPUT}の${TERMS.OUTPUT_PIN}を${TERMS.AND}の${TERMS.INPUT_PIN}に、${TERMS.AND}の${TERMS.OUTPUT_PIN}を${TERMS.OUTPUT}の${TERMS.INPUT_PIN}に${TERMS.CONNECT}してください。`,
      content: [
        {
          type: 'note',
          text: `🔗 配線のポイント：各${TERMS.INPUT}の${TERMS.OUTPUT_PIN}（${TERMS.RIGHT_CIRCLE}）を${TERMS.AND}ゲートの${TERMS.INPUT_PIN}（${TERMS.LEFT_CIRCLE}）に${TERMS.CONNECT}します。`,
        },
      ],
      action: { type: 'connect-wire' },
    },
    {
      id: 'circuit-answer',
      instruction: '完成形を確認しよう！',
      content: [
        {
          type: 'circuit-diagram',
          circuitId: 'and-gate',
          showTruthTable: false,
        },
        {
          type: 'note',
          text: '✅ 2つの入力 → ANDゲート → 出力 の順につながっています',
        },
      ],
    },
    {
      id: 'predict',
      instruction: '予測してみよう！',
      content: [
        {
          type: 'heading',
          text: '🤔 考えてみよう',
        },
        {
          type: 'text',
          text: '「すべてが揃って初めてON」という名前から、どんな時に出力がONになると思いますか？',
        },
        {
          type: 'rich-text',
          elements: [
            { text: '💭 ヒント：', bold: true },
            '2つのスイッチが直列につながっていることを思い出してください。',
          ],
        },
        {
          type: 'note',
          text: '予測：きっと両方がONの時だけ、出力もONになるはず...',
        },
      ],
    },
    {
      id: 'experiment',
      instruction: `実験と${TERMS.TRUTH_TABLE}`,
      content: [
        {
          type: 'rich-text',
          elements: [
            { text: '💡 操作方法：', bold: true },
            `${TERMS.INPUT}を`,
            { text: TERMS.DOUBLE_CLICK, emphasis: true },
            `すると、${TERMS.OFF}（${TERMS.LOW}）と${TERMS.ON}（${TERMS.HIGH}）が切り替わります。`,
          ],
        },
        {
          type: 'text',
          text: '予測が当たっているか確認してみてください！',
        },
        {
          type: 'heading',
          text: `📊 ${TERMS.TRUTH_TABLE}とは`,
        },
        {
          type: 'rich-text',
          elements: [
            { text: TERMS.TRUTH_TABLE, emphasis: true },
            `とは、${TERMS.INPUT}と${TERMS.OUTPUT}のすべての組み合わせを表にしたものです。`,
          ],
        },
        {
          type: 'table',
          headers: [`${TERMS.INPUT}A`, `${TERMS.INPUT}B`, `${TERMS.OUTPUT}`],
          rows: [
            [TERMS.LOW, TERMS.LOW, TERMS.LOW],
            [TERMS.LOW, TERMS.HIGH, TERMS.LOW],
            [TERMS.HIGH, TERMS.LOW, TERMS.LOW],
            [TERMS.HIGH, TERMS.HIGH, TERMS.HIGH],
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: '💡 発見：', bold: true },
            `${TERMS.AND}ゲートが${TERMS.ON}を出力するのは`,
            { text: `「両方とも${TERMS.ON}」`, bold: true },
            'の時だけ！',
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: '📊 確率：', bold: true },
            '4パターン中',
            { text: '1パターンのみ', emphasis: true },
            `${TERMS.OUTPUT}が${TERMS.ON}になる（25%）`,
          ],
        },
      ],
    },
    {
      id: 'application',
      instruction: '【応用】ANDゲートの実用例',
      content: [
        {
          type: 'heading',
          text: '🔐 日常生活で見つけるANDゲート',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '🏦 銀行ATM：カードを入れて、暗証番号も正しく入力 → お金を引き出せる',
            '🚗 車の発進：シートベルトを締めて、エンジンもかける → 走れる',
            '🏠 オートロック：正しいカギを使って、正しい暗証番号も入力 → ドアが開く',
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: '💡 重要：', bold: true },
            'ANDゲートは',
            { text: '「安全性」', emphasis: true },
            'を高めるためによく使われます！',
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
          question: 'ANDゲートで出力が1になるのは次のうちどれ？',
          options: [
            '入力の少なくとも1つが1の時',
            '入力の両方が1の時',
            '入力の両方が0の時',
            '入力が異なる値の時',
          ],
          correctIndex: 1,
        },
      ],
    },
    {
      id: 'summary',
      instruction: '【まとめ】ANDゲートの重要ポイント',
      content: [
        {
          type: 'heading',
          text: '🎆 今日学んだこと',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'ANDゲートは「全て」の条件が必要',
            '4パターン中1つだけ出力がON',
            'セキュリティや安全装置によく使われる',
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: '🚀 次は「ORゲート」を学びましょう！', bold: true },
          ],
        },
      ],
    },
  ],
};

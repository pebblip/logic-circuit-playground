import type { StructuredLesson } from '../../../../types/lesson-content';
import { TERMS } from '../terms';

export const orGateStructuredLesson: StructuredLesson = {
  id: 'or-gate',
  title: 'ORゲート - どちらか1つでOK！',
  description:
    '少なくとも1つの入力がONなら出力がONになる「OR」の動作を学びます',
  objective:
    'ORゲートの基本動作を理解し、「どちらか1つでOK」の概念を習得。ANDゲートとの違いを明確にし、実用的な応用例を学びます',
  category: '基本ゲート',
  lessonType: 'gate-intro',
  difficulty: 'beginner',
  prerequisites: ['and-gate'],
  estimatedMinutes: 10,
  availableGates: ['INPUT', 'OR', 'OUTPUT'],
  steps: [
    {
      id: 'intro',
      instruction:
        'ORゲートは「どれか1つでも条件が満たされたとき」に動作します。',
      content: [
        {
          type: 'rich-text',
          elements: [
            '日常生活で例えると、',
            { text: '「現金」または「クレジットカード」', emphasis: true },
            'で支払いができるお店のようなものです。',
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
            '💳 支払い方法：現金でもカードでもOK → 買い物できる',
            '🚪 部屋の照明：入口スイッチか、ベッドサイドのスイッチ → 電気がつく',
            '📱 連絡手段：電話でもメールでも → 連絡がとれる',
          ],
        },
      ],
    },
    {
      id: 'concept',
      instruction: '【基礎知識】ORゲートの電気的意味',
      content: [
        {
          type: 'heading',
          text: '🔌 なぜ「OR」というの？',
        },
        {
          type: 'rich-text',
          elements: [
            '電気回路で考えると、2つのスイッチを',
            { text: '「別々の道」', emphasis: true },
            'に配置したようなものです。',
            {
              text: 'どちらか一方のスイッチをONにすれば、電気は流れます。',
              bold: true,
            },
          ],
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'どちらか一方がON → 電流が流れる → 出力がON',
            '両方がOFF → 電流が流れない → 出力がOFF',
            '両方がON → 電流が流れる → 出力がON',
          ],
        },
        {
          type: 'heading',
          text: '💡 スイッチの例で考える',
        },
        {
          type: 'text',
          text: '2つのスイッチを並列につないだ回路を想像してください。電源からランプまで、2つの別々の経路があり、それぞれにスイッチがあります。',
        },
        {
          type: 'heading',
          text: '【並列回路のイメージ】',
        },
        {
          type: 'svg-diagram',
          diagramType: 'parallel-circuit',
          width: 400,
          height: 200,
        },
        {
          type: 'rich-text',
          elements: [{ text: '電源から2つの道：', bold: true }],
        },
        {
          type: 'rich-text',
          elements: [{ text: '　道1：電源 → スイッチA → ランプ', bold: true }],
        },
        {
          type: 'rich-text',
          elements: [{ text: '　道2：電源 → スイッチB → ランプ', bold: true }],
        },
        {
          type: 'rich-text',
          elements: [
            { text: '💡 ポイント：', bold: true },
            '電気は',
            { text: '2つの道のどちらからでも', emphasis: true },
            '流れることができます。',
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: '→ ', bold: true },
            { text: 'どちらか1つでもON', bold: true },
            'なら電気は流れる！',
          ],
        },
        {
          type: 'table',
          headers: ['スイッチA', 'スイッチB', '結果'],
          rows: [
            [TERMS.OFF, TERMS.OFF, 'ランプ消灯'],
            [TERMS.OFF, TERMS.ON, 'ランプ点灯✨'],
            [TERMS.ON, TERMS.OFF, 'ランプ点灯✨'],
            [TERMS.ON, TERMS.ON, 'ランプ点灯✨'],
          ],
        },
        {
          type: 'note',
          text: '🔌 2つのスイッチを別々の道に配置：どちらか1つでONなら電気は流れます！',
        },
      ],
    },
    {
      id: 'place-gates',
      instruction: `${TERMS.INPUT}、${TERMS.OR}ゲート、${TERMS.OUTPUT}を配置しましょう。`,
      hint: `左のツールパレットから「${TERMS.INPUT}」を2つキャンバスの左側に縦に並べ、「基本ゲート」から「${TERMS.OR}」をその右側に、最後に${TERMS.OUTPUT}を${TERMS.OR}ゲートの右側に配置してください。`,
      content: [],
      action: { type: 'place-gate', gateType: 'OR' },
    },
    {
      id: 'connect',
      instruction: `${TERMS.WIRE}して${TERMS.CIRCUIT}を完成させましょう。`,
      hint: `各${TERMS.INPUT}の${TERMS.OUTPUT_PIN}を${TERMS.OR}の${TERMS.INPUT_PIN}に、${TERMS.OR}の${TERMS.OUTPUT_PIN}を${TERMS.OUTPUT}の${TERMS.INPUT_PIN}に${TERMS.CONNECT}してください。`,
      content: [
        {
          type: 'note',
          text: `🔗 配線のポイント：各${TERMS.INPUT}の${TERMS.OUTPUT_PIN}（${TERMS.RIGHT_CIRCLE}）を${TERMS.OR}ゲートの${TERMS.INPUT_PIN}（${TERMS.LEFT_CIRCLE}）に${TERMS.CONNECT}します。`,
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
          circuitId: 'or-gate',
          showTruthTable: false,
        },
        {
          type: 'note',
          text: '✅ 2つの入力 → ORゲート → 出力 の順につながっています',
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
          text: '「寛容な選択肢」という名前から、どんな時に出力がONになると思いますか？',
        },
        {
          type: 'rich-text',
          elements: [
            { text: '💭 ヒント：', bold: true },
            '2つのスイッチが並列（別々の道）につながっていることを思い出してください。',
          ],
        },
        {
          type: 'note',
          text: '予測：どちらか1つでもONなら、出力もONになりそう...',
        },
      ],
    },
    {
      id: 'experiment-and-analysis',
      instruction: '実験で確かめよう！4つのパターンを試して結果を分析しよう',
      content: [
        {
          type: 'rich-text',
          elements: [
            { text: '💡 操作方法：', bold: true },
            `${TERMS.INPUT}を`,
            { text: TERMS.DOUBLE_CLICK, emphasis: true },
            'して、すべての組み合わせを試してください。',
          ],
        },
        {
          type: 'heading',
          text: '🔬 実験結果',
        },
        {
          type: 'table',
          headers: [`${TERMS.INPUT}A`, `${TERMS.INPUT}B`, `${TERMS.OUTPUT}`],
          rows: [
            [TERMS.OFF, TERMS.OFF, TERMS.OFF],
            [TERMS.OFF, TERMS.ON, TERMS.ON],
            [TERMS.ON, TERMS.OFF, TERMS.ON],
            [TERMS.ON, TERMS.ON, TERMS.ON],
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: '💡 発見：', bold: true },
            `${TERMS.OR}ゲートが${TERMS.OFF}を出力するのは`,
            { text: `「両方とも${TERMS.OFF}」`, bold: true },
            'の時だけ！',
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: '💡 覚え：', bold: true },
            `${TERMS.AND}は`,
            { text: '「厳しい」', emphasis: true },
            '（両方必要）、${TERMS.OR}は',
            { text: '「優しい」', emphasis: true },
            '（1つでOK）！',
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: '📊 確率：', bold: true },
            `${TERMS.OR}ゲートは4パターン中`,
            { text: '3パターン', emphasis: true },
            `で${TERMS.OUTPUT}が${TERMS.ON}になる（75%）`,
          ],
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'comparison',
      instruction: `【比較】${TERMS.AND}と${TERMS.OR}の違いを理解しよう`,
      content: [
        {
          type: 'heading',
          text: `🎯 ${TERMS.AND}と${TERMS.OR}の決定的な違い`,
        },
        {
          type: 'table',
          headers: [
            `${TERMS.INPUT}A`,
            `${TERMS.INPUT}B`,
            `${TERMS.AND}出力`,
            `${TERMS.OR}出力`,
          ],
          rows: [
            [TERMS.OFF, TERMS.OFF, TERMS.OFF, TERMS.OFF],
            [TERMS.OFF, TERMS.ON, TERMS.OFF, TERMS.ON],
            [TERMS.ON, TERMS.OFF, TERMS.OFF, TERMS.ON],
            [TERMS.ON, TERMS.ON, TERMS.ON, TERMS.ON],
          ],
        },
        {
          type: 'rich-text',
          elements: [{ text: '💡 覚え方：', bold: true }],
        },
        {
          type: 'list',
          ordered: false,
          items: [
            `${TERMS.AND}は「厳しい」 → 両方必要 → 1/4の確率でON`,
            `${TERMS.OR}は「優しい」 → 1つでOK → 3/4の確率でON`,
          ],
        },
      ],
    },
    {
      id: 'practical-applications',
      instruction: '【応用】ORゲートの実用例',
      content: [
        {
          type: 'heading',
          text: '🏠 安全・セキュリティで使われるORゲート',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '🚨 防犯システム：窓センサーかドアセンサーが反応 → 警報が鳴る',
            '🚗 車のエアバッグ：正面衝突または側面衝突を検知 → エアバッグ作動',
            '🏢 非常口：停電が起きたか、火災が発生 → 非常灯が点灯',
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: '💡 重要：', bold: true },
            'ORゲートは',
            { text: '「どれか1つでも危険があれば作動」', emphasis: true },
            'という安全装置によく使われます！',
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
          question: `${TERMS.OR}ゲートで${TERMS.OUTPUT}が${TERMS.OFF}になるのは次のうちどれ？`,
          options: [
            `${TERMS.INPUT}の少なくとも1つが${TERMS.ON}の時`,
            `${TERMS.INPUT}の両方が${TERMS.ON}の時`,
            `${TERMS.INPUT}の両方が${TERMS.OFF}の時`,
            `${TERMS.INPUT}が異なる値の時`,
          ],
          correctIndex: 2,
        },
      ],
    },
    {
      id: 'summary',
      instruction: `【まとめ】${TERMS.OR}ゲートの重要ポイント`,
      content: [
        {
          type: 'heading',
          text: '🎆 今日学んだこと',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            `${TERMS.OR}ゲートは「どれか1つ」でOK`,
            `4パターン中3つで${TERMS.OUTPUT}が${TERMS.ON}`,
            `${TERMS.AND}より「優しい」ゲート`,
            '安全装置によく使われる',
          ],
        },
        {
          type: 'rich-text',
          elements: [
            {
              text: `🚀 次は「${TERMS.XOR}ゲート」を学びましょう！`,
              bold: true,
            },
          ],
        },
      ],
    },
  ],
};

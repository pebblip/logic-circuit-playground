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
          text: '身近な例',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '支払い方法：現金でもカードでもOK 買い物できる',
            '部屋の照明：入口スイッチか、ベッドサイドのスイッチ 電気がつく',
            '連絡手段：電話でもメールでも 連絡がとれる',
          ],
        },
      ],
    },
    {
      id: 'principle',
      instruction: 'ORゲートの電気的仕組み',
      content: [
        {
          type: 'heading',
          text: 'なぜ「OR」というの？',
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
            'どちらか一方がON 電流が流れる 出力がON',
            '両方がOFF 電流が流れない 出力がOFF',
            '両方がON 電流が流れる 出力がON',
          ],
        },
        {
          type: 'heading',
          text: 'スイッチの例で考える',
        },
        {
          type: 'text',
          text: '2つのスイッチを別々の道につないだ回路を想像してください。電源からランプまで、2つの別々の経路があり、それぞれにスイッチがあります。',
        },
        {
          type: 'heading',
          text: '【別々の道につないだ回路のイメージ】',
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
          elements: [{ text: '　道1：電源 スイッチA ランプ', bold: true }],
        },
        {
          type: 'rich-text',
          elements: [{ text: '　道2：電源 スイッチB ランプ', bold: true }],
        },
        {
          type: 'rich-text',
          elements: [
            { text: 'ポイント：', bold: true },
            '電気は',
            { text: '2つの道のどちらからでも', emphasis: true },
            '流れることができます。',
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: '', bold: true },
            { text: 'どちらか1つでもON', bold: true },
            'なら電気は流れる！',
          ],
        },
        {
          type: 'table',
          headers: ['スイッチA', 'スイッチB', '結果'],
          rows: [
            [TERMS.OFF, TERMS.OFF, 'ランプ消灯'],
            [TERMS.OFF, TERMS.ON, 'ランプ点灯'],
            [TERMS.ON, TERMS.OFF, 'ランプ点灯'],
            [TERMS.ON, TERMS.ON, 'ランプ点灯'],
          ],
        },
        {
          type: 'note',
          text: '2つのスイッチを別々の道に配置：どちらか1つでONなら電気は流れます！',
        },
      ],
    },
    {
      id: 'circuit-build',
      instruction: 'OR回路を作ってみよう',
      content: [
        {
          type: 'heading',
          text: 'OR回路の構成',
        },
        {
          type: 'rich-text',
          elements: [
            'OR回路は2つの入力が必要です：',
            { text: '入力A', emphasis: true },
            ' + ',
            { text: '入力B', emphasis: true },
            ' ',
            { text: 'ORゲート', emphasis: true },
            ' ',
            { text: '出力', emphasis: true },
          ],
        },
        {
          type: 'circuit-diagram',
          circuitId: 'or-gate',
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
            '入力ゲートを2つ配置（スイッチA・Bの役割）',
            'ORゲートを配置（どちらか1つでOKの魔法使い）',
            '出力ゲートを配置（結果表示のランプ）',
            '配線で3本でつなげる',
          ],
        },
        {
          type: 'heading',
          text: '配線のコツ',
        },
        {
          type: 'rich-text',
          elements: [
            'ORゲートは',
            { text: '2つの入力ピン', emphasis: true },
            'があります。',
            '上下に並んだ入力ゲートの右の丸と、ORゲートの左の2つの丸をそれぞれつなげます。',
          ],
        },
        {
          type: 'note',
          text: '配線のポイント：入力Aの右の丸→ORの上の丸、入力Bの右の丸→ORの下の丸、ORの右の丸→出力の左の丸',
        },
      ],
    },
    {
      id: 'experiment',
      instruction: '実験で確かめよう！4つのパターンを試して結果を分析しよう',
      content: [
        {
          type: 'rich-text',
          elements: [
            { text: '操作方法：', bold: true },
            `${TERMS.INPUT}を`,
            { text: TERMS.DOUBLE_CLICK, emphasis: true },
            'して、すべての組み合わせを試してください。',
          ],
        },
        {
          type: 'heading',
          text: '実験結果',
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
            { text: '発見：', bold: true },
            `${TERMS.OR}ゲートが${TERMS.OFF}を出力するのは`,
            { text: `「両方とも${TERMS.OFF}」`, bold: true },
            'の時だけ！',
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: '覚え：', bold: true },
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
            { text: '確率：', bold: true },
            `${TERMS.OR}ゲートは4パターン中`,
            { text: '3パターン', emphasis: true },
            `で${TERMS.OUTPUT}が${TERMS.ON}になる（75%）`,
          ],
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'analysis',
      instruction: 'ORゲートの特徴を分析しよう',
      content: [
        {
          type: 'heading',
          text: `${TERMS.AND}と${TERMS.OR}の決定的な違い`,
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
          elements: [{ text: '覚え方：', bold: true }],
        },
        {
          type: 'list',
          ordered: false,
          items: [
            `${TERMS.AND}は「厳しい」 両方必要 1/4の確率でON`,
            `${TERMS.OR}は「優しい」 1つでOK 3/4の確率でON`,
          ],
        },
      ],
    },
    {
      id: 'applications',
      instruction: 'ORゲートの実用例',
      content: [
        {
          type: 'heading',
          text: '安全・セキュリティで使われるORゲート',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '防犯システム：窓センサーかドアセンサーが反応 警報が鳴る',
            '車のエアバッグ：正面衝突または側面衝突を検知 エアバッグ作動',
            '非常口：停電が起きたか、火災が発生 非常灯が点灯',
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: '重要：', bold: true },
            'ORゲートは',
            { text: '「どれか1つでも危険があれば作動」', emphasis: true },
            'という安全装置によく使われます！',
          ],
        },
      ],
    },
    {
      id: 'summary',
      instruction: 'ORゲートをマスター！',
      content: [
        {
          type: 'heading',
          text: 'ORゲートの要点',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '「どれか1つでOK」の優しいゲート：片方ONで出力ON',
            '並列回路の原理：電気は2つの道のどちらからでも流れる',
            '柔軟性重視：緊急システムや安全装置で大活躍',
            '確率は75%：4パターン中3パターンでON',
          ],
        },
        {
          type: 'quiz',
          question: 'ORゲートで出力が0になるのは次のうちどれ？',
          options: [
            '入力の少なくとも1つが1の時',
            '入力の両方が1の時',
            '入力の両方が0の時',
            '入力が異なる値の時',
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
            { text: 'XORゲート', bold: true },
            'で、「違いを検出」する特殊な論理を学びましょう！',
            '',
            'ANDの厳しさ、ORの優しさ、そしてXORの特殊性。3つの性格を理解すれば論理回路の基礎は完璧です。',
          ],
        },
      ],
    },
  ],
};

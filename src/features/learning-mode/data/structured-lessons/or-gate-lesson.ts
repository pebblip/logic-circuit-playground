import type { StructuredLesson } from '../../../../types/lesson-content';

export const orGateStructuredLesson: StructuredLesson = {
  id: 'or-gate',
  title: 'ORゲート - 寛容な選択肢',
  description:
    '少なくとも1つの入力がONなら出力がONになる「OR」の動作を学びます',
  objective:
    'ORゲートの基本動作を理解し、論理和の概念を習得。ANDゲートとの違いを明確にし、実用的な応用例を学びます',
  icon: '🎯',
  difficulty: 'beginner',
  prerequisites: ['and-gate'],
  estimatedMinutes: 10,
  steps: [
    {
      id: 'intro',
      instruction:
        'ORゲートは「どれか1つでも条件が満たされたとき」に動作します。',
      content: [
        {
          type: 'text',
          text: '日常生活で例えると、「現金」または「クレジットカード」で支払いができるお店のようなものです。',
        },
        {
          type: 'heading',
          text: '🌍 身近なORの例',
          icon: '🌍',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '💳 支払い：現金 OR カード OR 電子マネー',
            '🚃 交通手段：電車 OR バス OR 自転車',
            '🏠 入館：正面入口 OR 裏口 OR 非常口',
            '📞 連絡手段：電話 OR メール OR LINE',
            '🍷 パーティ参加：招待状 OR 友人紹介 OR 会員資格',
          ],
        },
        {
          type: 'note',
          text: '💡 ORは「選択肢がある」「柔軟性がある」状況を表現します',
          icon: '💡',
        },
      ],
    },
    {
      id: 'concept',
      instruction: '【基礎知識】ORゲートの電気的意味',
      content: [
        {
          type: 'heading',
          text: '🔌 ORゲートの電気回路',
          icon: '🔌',
        },
        {
          type: 'text',
          text: '電気回路では、ORゲートは「並列接続されたスイッチ」と同じです。',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'どちらか一方がON → 電流が流れる → 出力1',
            '両方がOFF → 電流が流れない → 出力0',
            '両方がON → 電流が流れる → 出力1',
          ],
        },
        {
          type: 'note',
          text: '🔌 ANDが直列接続なら、ORは並列接続！',
          icon: '🔌',
        },
      ],
    },
    {
      id: 'place-components',
      instruction: '回路を組み立てましょう。',
      hint: '入力 x2、ORゲート、出力を配置して接続してください。',
      content: [],
      action: { type: 'place-gate', gateType: 'OR' },
    },
    {
      id: 'experiment',
      instruction: '実験開始！4つのパターンをすべて試してみましょう。',
      content: [
        {
          type: 'note',
          text: '入力をダブルクリックして、すべての組み合わせを試してください。',
          icon: '💡',
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'results',
      instruction: '【パターン分析】実験結果を整理しましょう。',
      content: [
        {
          type: 'experiment-result',
          title: '🔬 実験結果まとめ：',
          results: [
            { left: '0', operator: 'OR', right: '0', result: '0' },
            { left: '0', operator: 'OR', right: '1', result: '1' },
            { left: '1', operator: 'OR', right: '0', result: '1' },
            { left: '1', operator: 'OR', right: '1', result: '1' },
          ],
          note: 'ここでの「OR」は論理和演算を表します。記号では「∨」と表記されます。',
        },
        {
          type: 'heading',
          text: '💡 発見：ORゲートが0を出力するのは「両方とも0」の時だけ！',
          icon: '💡',
        },
      ],
    },
    {
      id: 'comparison',
      instruction: '【理論】ANDゲートとORゲートを比較してみましょう。',
      content: [
        {
          type: 'heading',
          text: '🎯 ANDとORの比較',
          icon: '🎯',
        },
        {
          type: 'comparison',
          items: [
            {
              gateType: 'AND',
              values: [
                { left: '0', operator: 'AND', right: '0', result: '0' },
                { left: '0', operator: 'AND', right: '1', result: '0' },
                { left: '1', operator: 'AND', right: '0', result: '0' },
                { left: '1', operator: 'AND', right: '1', result: '1' },
              ],
            },
            {
              gateType: 'OR',
              values: [
                { left: '0', operator: 'OR', right: '0', result: '0' },
                { left: '0', operator: 'OR', right: '1', result: '1' },
                { left: '1', operator: 'OR', right: '0', result: '1' },
                { left: '1', operator: 'OR', right: '1', result: '1' },
              ],
            },
          ],
        },
        {
          type: 'text',
          text: 'ANDは「厳格」（すべて必要）、ORは「寛容」（1つでOK）という性格の違いがあります。',
        },
        {
          type: 'heading',
          text: '📊 確率的な見方',
          icon: '📊',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'AND：4パターン中1パターンで出力1（25%）',
            'OR：4パターン中3パターンで出力1（75%）',
          ],
        },
        {
          type: 'note',
          text: '🎲 ランダム入力の場合、ORはANDの3倍出力が1になりやすい！',
          icon: '🎲',
        },
      ],
    },
    {
      id: 'mathematical-notation',
      instruction: '【発展】数学的表現',
      content: [
        {
          type: 'heading',
          text: '📐 OR演算のさまざまな表記法',
          icon: '📐',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '数学：A ∨ B',
            '集合論：A ∪ B（結合）',
            'プログラミング：A || B, A OR B',
            '電子回路：A + B（加算記号）',
          ],
        },
        {
          type: 'note',
          text: '💡 なぜ加算記号？ 集合の「合併」のイメージから来ています',
          icon: '💡',
        },
      ],
    },
    {
      id: 'practical-applications',
      instruction: '【応用】ORゲートの実用例',
      content: [
        {
          type: 'heading',
          text: '🏠 スマートホーム',
          icon: '🏠',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '照明：リビングスイッチ OR 寝室スイッチ = 玄関ライトON',
            'セキュリティ：窓センサ OR ドアセンサ OR 人感センサ = 警報',
            '節電：人いない OR 夜間 = エアコンOFF',
          ],
        },
        {
          type: 'heading',
          text: '🚑 医療機器',
          icon: '🚑',
        },
        {
          type: 'text',
          text: '生命維持装置のアラーム：',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '心拍異常 OR 呼吸異常 OR 血圧異常 = 緊急アラーム',
            'バッテリー低下 OR 電源切断 OR 機器異常 = バックアップ作動',
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
          question: 'ORゲートで出力が0になるのは次のうちどれ？',
          options: [
            '入力の少なくとも1つが1の時',
            '入力の両方が1の時',
            '入力の両方が0の時',
            '入力が異なる値の時',
          ],
          correctIndex: 2,
        },
      ],
    },
    {
      id: 'advanced-concept',
      instruction: '【発展】万能ゲート',
      content: [
        {
          type: 'heading',
          text: '🎆 NANDとNORの特殊性',
          icon: '🎆',
        },
        {
          type: 'text',
          text: 'NORゲート（NOT OR）は「万能ゲート」の一つです。',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'NORゲートだけで、すべての論理ゲートを作れる',
            'NOT = NOR（両入力を同じ信号に）',
            'OR = NOR → NOT',
            'AND = NORを使ったド・モルガン変換',
          ],
        },
        {
          type: 'note',
          text: '🔬 実際のCPUでは、NANDやNORのような基本ゲートが大量に使われています',
          icon: '🔬',
        },
      ],
    },
  ],
};

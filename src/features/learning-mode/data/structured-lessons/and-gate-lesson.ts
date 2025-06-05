import type { StructuredLesson } from '../../../../types/lesson-content';

export const andGateStructuredLesson: StructuredLesson = {
  id: 'and-gate-structured',
  title: 'ANDゲート - すべてが揃って初めてON',
  description: '2つの入力が両方ともONの時だけ出力がONになる「AND」の動作を学びます',
  icon: '🎯',
  difficulty: 'beginner',
  prerequisites: [],
  estimatedMinutes: 5,
  steps: [
    {
      id: 'intro',
      instruction: 'ANDゲートは「すべての条件が満たされたとき」だけ動作します。',
      content: [
        {
          type: 'text',
          text: '日常生活で例えると、「鍵」と「暗証番号」の両方が必要な金庫のようなものです。',
        },
      ],
    },
    {
      id: 'place-inputs',
      instruction: 'まず、2つのスイッチ（INPUT）を配置しましょう。',
      hint: '左のツールパレットから「INPUT」を2つドラッグして、キャンバスの左側に縦に並べて配置してください。',
      content: [],
      action: { type: 'place-gate', gateType: 'INPUT' },
    },
    {
      id: 'place-and',
      instruction: '次に、ANDゲートを配置します。',
      hint: '「基本ゲート」セクションから「AND」を選んで、INPUTの右側に配置してください。',
      content: [],
      action: { type: 'place-gate', gateType: 'AND' },
    },
    {
      id: 'place-output',
      instruction: '最後に、結果を表示するランプ（OUTPUT）を配置します。',
      hint: 'OUTPUTをANDゲートの右側に配置してください。',
      content: [],
      action: { type: 'place-gate', gateType: 'OUTPUT' },
    },
    {
      id: 'connect',
      instruction: '配線して回路を完成させましょう。',
      hint: '各INPUTの出力（右の丸）をANDの入力（左の丸）に、ANDの出力をOUTPUTの入力に接続してください。',
      content: [],
      action: { type: 'connect-wire' },
    },
    {
      id: 'experiment',
      instruction: '実験開始！4つのパターンをすべて試してみましょう。',
      content: [
        {
          type: 'note',
          text: 'INPUTをダブルクリックすると、OFF（グレー）とON（緑）が切り替わります。',
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
            { input1: '0', operator: '+', input2: '0', output: '0' },
            { input1: '0', operator: '+', input2: '1', output: '0' },
            { input1: '1', operator: '+', input2: '0', output: '0' },
            { input1: '1', operator: '+', input2: '1', output: '1' },
          ],
          note: 'ここでの「+」は論理演算を表します。入力1 + 入力2 = 出力 という意味です。',
        },
        {
          type: 'heading',
          text: '💡 発見：ANDゲートが1を出力するのは「両方とも1」の時だけ！',
          icon: '💡',
        },
      ],
    },
    {
      id: 'truth-table',
      instruction: '【理論】ANDゲートの真理値表を確認しましょう。',
      content: [
        {
          type: 'table',
          headers: ['入力A', '入力B', '出力'],
          rows: [
            ['0', '0', '0'],
            ['0', '1', '0'],
            ['1', '0', '0'],
            ['1', '1', '1'],
          ],
        },
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
              expressions: [
                { input1: '0', operator: '+', input2: '0', output: '0' },
                { input1: '0', operator: '+', input2: '1', output: '0' },
                { input1: '1', operator: '+', input2: '0', output: '0' },
                { input1: '1', operator: '+', input2: '1', output: '1' },
              ],
            },
            {
              gateType: 'OR',
              expressions: [
                { input1: '0', operator: '+', input2: '0', output: '0' },
                { input1: '0', operator: '+', input2: '1', output: '1' },
                { input1: '1', operator: '+', input2: '0', output: '1' },
                { input1: '1', operator: '+', input2: '1', output: '1' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'application',
      instruction: '【応用】ANDゲートの実用例を学びましょう。',
      content: [
        {
          type: 'heading',
          text: '🔐 セキュリティシステム',
          icon: '🔐',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'カードキー AND 暗証番号 = ドア開錠',
            '指紋認証 AND 顔認証 = スマホロック解除',
            '両親の許可 AND 宿題完了 = ゲーム許可',
          ],
        },
        {
          type: 'heading',
          text: '🚗 自動車の安全装置',
          icon: '🚗',
        },
        {
          type: 'text',
          text: 'シートベルト着用 AND エンジンON = 走行可能',
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
          correct: 1,
        },
      ],
    },
  ],
};
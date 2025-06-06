import type { StructuredLesson } from '../../../../types/lesson-content';

export const andGateStructuredLesson: StructuredLesson = {
  id: 'and-gate',
  title: 'ANDゲート - すべてが揃って初めてON',
  description:
    '2つの入力が両方ともONの時だけ出力がONになる「AND」の動作を学びます',
  objective:
    'ANDゲートの基本動作を理解し、真理値表を確認して論理積の概念を習得する',
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
          type: 'text',
          text: '日常生活で例えると、「鍵」と「暗証番号」の両方が必要な金庫のようなものです。',
        },
        {
          type: 'heading',
          text: '📚 ANDゲートの歴史',
        },
        {
          type: 'text',
          text: '論理積（AND）の概念は、19世紀の数学者ジョージ・ブールが体系化しました。ブール代数は現代のコンピュータ科学の基礎となっています。',
        },
        {
          type: 'note',
          text: '🔍 論理積の記号：数学では「∧」、プログラミングでは「&&」や「AND」と表記します',
        },
      ],
    },
    {
      id: 'concept',
      instruction: '【基礎知識】ANDゲートの動作原理',
      content: [
        {
          type: 'heading',
          text: '🔌 ANDゲートの電気的な意味',
        },
        {
          type: 'text',
          text: '電気回路では、ANDゲートは「直列接続されたスイッチ」と同じです。どちらか一方でもOFFなら、電流は流れません。',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '両方のスイッチがON → 電流が流れる → 出力1',
            'どちらかがOFF → 電流が遮断 → 出力0',
          ],
        },
      ],
    },
    {
      id: 'place-inputs',
      instruction: 'まず、2つのスイッチ（入力）を配置しましょう。',
      hint: '左のツールパレットから「入力」を2つドラッグして、キャンバスの左側に縦に並べて配置してください。',
      content: [],
      action: { type: 'place-gate', gateType: 'INPUT' },
    },
    {
      id: 'place-and',
      instruction: '次に、ANDゲートを配置します。',
      hint: '「基本ゲート」セクションから「AND」を選んで、入力の右側に配置してください。',
      content: [],
      action: { type: 'place-gate', gateType: 'AND' },
    },
    {
      id: 'place-output',
      instruction: '最後に、結果を表示するランプ（出力）を配置します。',
      hint: '出力をANDゲートの右側に配置してください。',
      content: [],
      action: { type: 'place-gate', gateType: 'OUTPUT' },
    },
    {
      id: 'connect',
      instruction: '配線して回路を完成させましょう。',
      hint: '各入力の出力（右の丸）をANDの入力（左の丸）に、ANDの出力を出力の入力に接続してください。',
      content: [],
      action: { type: 'connect-wire' },
    },
    {
      id: 'experiment',
      instruction: '実験開始！4つのパターンをすべて試してみましょう。',
      content: [
        {
          type: 'note',
          text: '入力をダブルクリックすると、OFF（0）とON（1）が切り替わります。',
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
            { left: '0', operator: 'AND', right: '0', result: '0' },
            { left: '0', operator: 'AND', right: '1', result: '0' },
            { left: '1', operator: 'AND', right: '0', result: '0' },
            { left: '1', operator: 'AND', right: '1', result: '1' },
          ],
          note: '「AND」は論理積演算を表します。記号では「∧」と表記されます。',
        },
        {
          type: 'heading',
          text: '💡 発見：ANDゲートが1を出力するのは「両方とも1」の時だけ！',
        },
      ],
    },
    {
      id: 'truth-table',
      instruction: '【理論】ANDゲートの真理値表を確認しましょう。',
      content: [
        {
          type: 'table',
          headers: ['入力A', '入力B', '出力', '論理式'],
          rows: [
            ['0', '0', '0', '0 ∧ 0 = 0'],
            ['0', '1', '0', '0 ∧ 1 = 0'],
            ['1', '0', '0', '1 ∧ 0 = 0'],
            ['1', '1', '1', '1 ∧ 1 = 1'],
          ],
        },
        {
          type: 'note',
          text: '📊 確率：4パターン中1パターンのみ出力が1になる（25%）',
        },
        {
          type: 'heading',
          text: '🎯 ANDとORの比較',
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
      ],
    },
    {
      id: 'application',
      instruction: '【応用】ANDゲートの実用例を学びましょう。',
      content: [
        {
          type: 'heading',
          text: '🔐 セキュリティシステム',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '🏦 銀行金庫：カードキー AND 暗証番号 = ドア開錠',
            '📱 スマホ：指紋認証 AND 顔認証 = ロック解除',
            '🎮 ゲーム機：両親の許可 AND 宿題完了 = ゲーム許可',
            '🏂 リレー競走：バトンを持つ AND 走路内 = 走行可能',
            '🚆 電車発車：ドア閉 AND 信号青 = 発車可能',
          ],
        },
        {
          type: 'heading',
          text: '🚗 自動車の安全装置',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'シートベルト着用 AND エンジンON = 走行可能',
            'ブレーキ踏む AND シフトP = エンジン始動可能',
            'ヘッドライトON AND 夜間 = ハイビーム警告',
          ],
        },
        {
          type: 'heading',
          text: '🏭 工場の安全装置',
        },
        {
          type: 'text',
          text: 'より厳格な安全管理のため、複数のAND条件を組み合わせます：',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '安全ヘルメット AND 安全靴 AND 作業許可証 = 入場可能',
            '両手ボタン同時押し AND 安全ゲート閉 = 機械作動',
          ],
        },
      ],
    },
    {
      id: 'mathematical-notation',
      instruction: '【発展】数学的表現',
      content: [
        {
          type: 'heading',
          text: '📐 AND演算のさまざまな表記法',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '数学：A ∧ B',
            '集合論：A ∩ B（交わり）',
            'プログラミング：A && B, A AND B',
            '電子回路：A · B（乗算記号）',
          ],
        },
        {
          type: 'note',
          text: '💡 なぜ乗算記号？ 0×0=0, 0×1=0, 1×0=0, 1×1=1 とANDの真理値表が同じだから！',
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
      id: 'advanced-quiz',
      instruction: '【応用クイズ】',
      content: [
        {
          type: 'text',
          text: 'ANDゲートは3つ以上の入力を持つこともできます。3入力ANDは全ての入力が1の時だけ1を出力します。',
        },
        {
          type: 'quiz',
          question: '3入力ANDゲートで出力が1になる確率は？',
          options: ['12.5%（1/8）', '25%（2/8）', '37.5%（3/8）', '50%（4/8）'],
          correctIndex: 0,
        },
        {
          type: 'note',
          text: '3入力の組み合わせは2³=8通り。その中で全てが1になるのは1通りだけ！',
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
            '真理値表で4パターン中1つだけ出力が1',
            '論理積の記号は「∧」',
            'セキュリティや安全装置に幅広く応用',
          ],
        },
        {
          type: 'note',
          text: '🚀 次は「ORゲート」を学びましょう！',
        },
      ],
    },
  ],
};

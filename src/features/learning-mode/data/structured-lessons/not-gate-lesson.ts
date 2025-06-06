import type { StructuredLesson } from '../../../../types/lesson-content';

export const notGateStructuredLesson: StructuredLesson = {
  id: 'not-gate',
  title: 'NOTゲート - 反転の魔法',
  description: '入力を反転させる最もシンプルで重要なゲートを学びます',
  objective:
    'NOTゲートの動作原理を理解し、論理否定の概念を習得。デジタル回路における反転の重要性を学びます',
  difficulty: 'beginner',
  prerequisites: ['digital-basics'],
  estimatedMinutes: 10,
  steps: [
    {
      id: 'intro',
      instruction: 'NOTゲートは「反転」という魔法を使います。',
      content: [
        {
          type: 'text',
          text: '0を1に、1を0に変える、とてもシンプルだけど超重要なゲートです！',
        },
        {
          type: 'heading',
          text: '🌍 身近な例',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '💡 ライトスイッチ：ON→OFF、OFF→ON',
            '🚪 扉：開いている→閉める、閉まっている→開ける',
            '🌙 昼夜：昼→夜、夜→昼',
            '🌡️ 温冷：暖房→冷房、冷房→暖房',
            '🔄 反対語：ポジティブ→ネガティブ',
          ],
        },
        {
          type: 'note',
          text: '💡 NOTゲートは「否定」「反転」「インバータ」とも呼ばれます',
        },
      ],
    },
    {
      id: 'place-input',
      instruction: 'まず、スイッチ（入力）を配置しましょう。',
      hint: '左のツールパレットから「入力」をドラッグして、キャンバスの左側に配置してください。',
      content: [],
      action: { type: 'place-gate', gateType: 'INPUT' },
    },
    {
      id: 'place-not',
      instruction: '次に、NOTゲートを配置します。',
      hint: '「基本ゲート」セクションから「NOT」を選んで、入力の右側に配置してください。',
      content: [],
      action: { type: 'place-gate', gateType: 'NOT' },
    },
    {
      id: 'place-output',
      instruction: '最後に、結果を表示するランプ（出力）を配置します。',
      hint: '出力をNOTゲートの右側に配置してください。',
      content: [],
      action: { type: 'place-gate', gateType: 'OUTPUT' },
    },
    {
      id: 'connect',
      instruction: '配線して回路を完成させましょう。',
      hint: '入力の出力をNOTの入力に、NOTの出力を出力の入力に接続してください。',
      content: [],
      action: { type: 'connect-wire' },
    },
    {
      id: 'experiment',
      instruction: '実験開始！スイッチを切り替えて動作を確認しましょう。',
      content: [
        {
          type: 'note',
          text: '入力をダブルクリックすると、OFF（0）とON（1）が切り替わります。',
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'observation',
      instruction: '【観察】何が起きましたか？',
      content: [
        {
          type: 'experiment-result',
          title: '🔬 実験結果',
          results: [
            { left: '0', operator: '→', right: '1', result: '' },
            { left: '1', operator: '→', right: '0', result: '' },
          ],
          note: 'NOTゲートは入力を完全に反転させます！',
        },
        {
          type: 'heading',
          text: '💡 重要な発見',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '入力が OFF（0）のとき → 出力は ON（1）',
            '入力が ON（1）のとき → 出力は OFF（0）',
            '常に入力と逆の出力になる！',
          ],
        },
      ],
    },
    {
      id: 'truth-table',
      instruction: '【理論】NOTゲートの真理値表',
      content: [
        {
          type: 'table',
          headers: ['入力', '出力'],
          rows: [
            ['0', '1'],
            ['1', '0'],
          ],
        },
        {
          type: 'text',
          text: 'たった2行！シンプルイズベスト！',
        },
      ],
    },
    {
      id: 'electrical-principle',
      instruction: '【原理】電気的な仕組み',
      content: [
        {
          type: 'heading',
          text: '⚡ NOTゲートの電気回路',
        },
        {
          type: 'text',
          text: '最も簡単なNOTゲートは、トランジスタ1個で作れます：',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '入力が0V（LOW）→ トランジスタOFF → 出力5V（HIGH）',
            '入力が5V（HIGH）→ トランジスタON → 出力0V（LOW）',
          ],
        },
        {
          type: 'note',
          text: '🔬 現代のCPUには数十億個のトランジスタが入っています！',
        },
      ],
    },
    {
      id: 'symbol',
      instruction: '【豆知識】NOTゲートの記号',
      content: [
        {
          type: 'heading',
          text: '📐 回路図での表現',
        },
        {
          type: 'text',
          text: 'NOTゲートは三角形の先に小さな丸（バブル）がついた形で表されます。この丸が「反転」を意味します。',
        },
        {
          type: 'heading',
          text: '📐 さまざまな表記法',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '論理式：Ā、!A、¬A',
            'プログラミング：!A、NOT A、~A',
            '回路図：▷○（三角形+丸）',
            '真理値表：A’、A̅',
          ],
        },
        {
          type: 'note',
          text: '📝 数学では「否定」、電子工学では「インバータ」と呼ばれます',
        },
      ],
    },
    {
      id: 'applications',
      instruction: '【応用】NOTゲートの実用例',
      content: [
        {
          type: 'heading',
          text: '🔧 実際の使用例',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'インバーター回路：信号の反転',
            'プルダウン/プルアップ回路：デフォルト状態の設定',
            'エラー検出：正常/異常の切り替え',
            'トグルスイッチ：状態の切り替え',
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
          question: 'NOTゲートに「1」を入力したら、出力は？',
          options: ['0', '1', '変化しない', 'エラーになる'],
          correctIndex: 0,
        },
      ],
    },
    {
      id: 'challenge',
      instruction: '【チャレンジ】ダブルNOT',
      content: [
        {
          type: 'text',
          text: '2つのNOTゲートを直列に接続したら、どうなるでしょう？',
        },
        {
          type: 'note',
          text: 'ヒント：負の負は正...？',
        },
        {
          type: 'heading',
          text: '🔄 ダブルNOTの真理値表',
        },
        {
          type: 'table',
          headers: ['入力', '一つ目のNOT', '二つ目のNOT'],
          rows: [
            ['0', '1', '0'],
            ['1', '0', '1'],
          ],
        },
        {
          type: 'text',
          text: '答え：元の入力と同じになる！これを「バッファ」として使うこともあります。',
        },
      ],
    },
    {
      id: 'advanced-applications',
      instruction: '【発展】NOTゲートの高度な応用',
      content: [
        {
          type: 'heading',
          text: '🎆 デ・モルガンの法則',
        },
        {
          type: 'text',
          text: 'NOTゲートを使った重要な法則：',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'NOT(A AND B) = (NOT A) OR (NOT B)',
            'NOT(A OR B) = (NOT A) AND (NOT B)',
          ],
        },
        {
          type: 'note',
          text: '💡 これにより、ANDとORを相互変換できます！',
        },
        {
          type: 'heading',
          text: '🔄 オシレータ回路',
        },
        {
          type: 'text',
          text: '奇数個のNOTゲートをリング状に接続すると、信号が振動します（クロック信号の生成）。',
        },
      ],
    },
  ],
};

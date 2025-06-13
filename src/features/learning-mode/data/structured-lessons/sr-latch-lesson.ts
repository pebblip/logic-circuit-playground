import type { StructuredLesson } from '../../../../types/lesson-content';
import { TERMS } from '../terms';

export const srLatchStructuredLesson: StructuredLesson = {
  id: 'sr-latch',
  title: 'SRラッチ - 最もシンプルなメモリ',
  description: 'セット・リセット機能を持つ基本的な記憶回路を作ります',
  objective: 'フィードバックによる双安定回路の動作を理解し、記憶回路の基本原理を習得する',
  category: '順序回路',
  lessonType: 'gate-intro',
  difficulty: 'advanced',
  prerequisites: ['xor-gate'],
  estimatedMinutes: 15,
  availableGates: ['INPUT', 'OUTPUT', 'SR-LATCH'],
  steps: [
    {
      id: 'intro',
      instruction: '最も基本的な記憶回路への第一歩',
      content: [
        {
          type: 'heading',
          text: '身近な例で考える',
        },
        {
          type: 'text',
          text: '照明のスイッチを思い出してください。ONにすると点灯し、OFFにするまでその状態を保ちます。このような「状態を保持する」機能は、デジタル回路では特別な仕組みが必要です。',
        },
        {
          type: 'heading',
          text: 'SRラッチとは',
        },
        {
          type: 'text',
          text: 'Set（セット）で1の状態に、Reset（リセット）で0の状態にできる、最もシンプルな記憶回路です。「ラッチ」は掛け金の意味で、状態をしっかりと保持することを表しています。',
        },
        {
          type: 'note',
          text: 'コンピュータのメモリの最も基本的な構成要素がこのSRラッチです',
        },
      ],
    },
    {
      id: 'principle',
      instruction: 'SRラッチの電気的仕組み',
      content: [
        {
          type: 'heading',
          text: 'フィードバックの秘密',
        },
        {
          type: 'text',
          text: 'SRラッチの核心は「出力を入力に戻す」フィードバックです。2つのNORゲート（またはNANDゲート）を交差接続し、各ゲートの出力が相手の入力になるように配線します。この相互フィードバックが記憶を可能にします。',
        },
        {
          type: 'heading',
          text: '双安定性の原理',
        },
        {
          type: 'text',
          text: '正のフィードバックにより、2つの安定した状態が存在します。ボールが2つの谷のどちらかに落ち着くように、回路も0または1の状態で安定します。外部入力（S、R）により、状態を切り替えることができます。',
        },
        {
          type: 'heading',
          text: '真理値表',
        },
        {
          type: 'table',
          headers: ['S', 'R', 'Q(次の状態)', 'Q\'(反転)', '動作'],
          rows: [
            ['0', '0', 'Q(保持)', 'Q\'(保持)', '現在の状態を維持'],
            ['1', '0', '1', '0', 'セット（Q=1に設定）'],
            ['0', '1', '0', '1', 'リセット（Q=0に設定）'],
            ['1', '1', '禁止', '禁止', '使用禁止（不定状態）'],
          ],
        },
        {
          type: 'note',
          text: 'S=1、R=1は矛盾状態となるため、実用回路では必ず回避します',
        },
      ],
    },
    {
      id: 'circuit-build',
      instruction: 'SRラッチ回路を作ってみよう',
      content: [
        {
          type: 'heading',
          text: '手順１：入力ゲートを配置',
        },
        {
          type: 'rich-text',
          elements: [
            { text: `${TERMS.DOUBLE_CLICK}`, emphasis: true },
            'で',
            { text: `${TERMS.INPUT}ゲート`, emphasis: true },
            'を2つ配置します。',
            '上がS（セット）、下がR（リセット）入力になります。',
          ],
        },
        {
          type: 'heading',
          text: '手順２：対象ゲートを配置',
        },
        {
          type: 'rich-text',
          elements: [
            { text: 'SR-LATCHゲート', emphasis: true },
            'を1つ配置します。',
            'これは内部で2つのNORゲートをクロス結合した特殊ゲートです。',
          ],
        },
        {
          type: 'heading',
          text: '手順３：出力ゲートを配置',
        },
        {
          type: 'rich-text',
          elements: [
            { text: `${TERMS.OUTPUT}ゲート`, emphasis: true },
            'を2つ配置します。',
            'Q（状態）とQ\'（反転状態）の表示用です。',
          ],
        },
        {
          type: 'heading',
          text: '手順４：配線でつなげる',
        },
        {
          type: 'rich-text',
          elements: [
            'S入力→SR-LATCHのS入力へ接続。',
            'R入力→SR-LATCHのR入力へ接続。',
            'SR-LATCHのQ出力→OUTPUT（上）へ接続。',
            'SR-LATCHのQ\'出力→OUTPUT（下）へ接続。',
          ],
        },
        {
          type: 'note',
          text: '配線のコツ：QとQ\'は常に反対の値を示します（禁止状態を除く）',
        },
      ],
    },
    {
      id: 'experiment',
      instruction: '予測して実験しよう',
      content: [
        {
          type: 'heading',
          text: 'まず予測してみよう',
        },
        {
          type: 'text',
          text: 'S=1、R=0にしたときQはどうなるでしょうか？その後、両方を0に戻したら？また、S=0、R=1にしたらどうなるか予測してください。',
        },
        {
          type: 'heading',
          text: '実験で確かめよう',
        },
        {
          type: 'rich-text',
          elements: [
            '1. 初期状態：S=0、R=0（現在の状態を保持）。',
            '2. S入力を',
            { text: `${TERMS.DOUBLE_CLICK}`, emphasis: true },
            'して1に（セット動作）→Q=1になる。',
            '3. Sを0に戻す→Q=1のまま保持される。',
            '4. R入力を1に（リセット動作）→Q=0になる。',
            '5. Rを0に戻す→Q=0のまま保持される。',
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: '発見：', bold: true },
            'SまたはRを一瞬1にするだけで状態が切り替わり、',
            'その後は入力を0に戻しても',
            { text: '状態が保持', emphasis: true },
            'されます。',
          ],
        },
        {
          type: 'note',
          text: '電源投入時の初期状態は不定です。必ずセットかリセットで初期化しましょう',
        },
      ],
    },
    {
      id: 'analysis',
      instruction: 'SRラッチの特徴を分析しよう',
      content: [
        {
          type: 'heading',
          text: '記憶回路の比較',
        },
        {
          type: 'table',
          headers: ['種類', '構造', 'トリガ方式', '同期性', '用途'],
          rows: [
            ['SRラッチ', '2ゲート', 'レベルトリガ', '非同期', '状態保持、デバウンス'],
            ['Dラッチ', '4ゲート', 'レベルトリガ', '部分同期', '一時的な保持'],
            ['D-FF', '20素子', 'エッジトリガ', '完全同期', 'レジスタ、カウンタ'],
          ],
        },
        {
          type: 'heading',
          text: '禁止状態の理解',
        },
        {
          type: 'text',
          text: 'S=1、R=1では両方の出力が0になり、QとQ\'が同じ値という矛盾が生じます。この状態から両入力を同時に0にすると、どちらが1になるか予測できません（競合状態）。',
        },
        {
          type: 'heading',
          text: '確率的な視点',
        },
        {
          type: 'text',
          text: 'ランダムなS、R入力（禁止状態を除く）に対して、Q=1になる確率は約33%（セット状態）、Q=0になる確率も約33%（リセット状態）、残り約33%は保持状態です。',
        },
        {
          type: 'note',
          text: '非同期動作のため、タイミングによっては一時的な不安定状態が発生する可能性があります',
        },
      ],
    },
    {
      id: 'applications',
      instruction: 'SRラッチの実用例',
      content: [
        {
          type: 'heading',
          text: '実世界での活用',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'スイッチのデバウンス回路：機械的な接点のチャタリング除去',
            'アラームシステム：センサー作動後の状態保持',
            '機械制御：起動/停止ボタンの状態記憶',
            'SRAM（静的RAM）：高速メモリの基本セル',
            'フラグ管理：イベント発生の記録',
          ],
        },
        {
          type: 'heading',
          text: '身近な製品での使用例',
        },
        {
          type: 'text',
          text: 'エレベーターのボタン（押すと点灯し、到着まで保持）、火災報知器（作動後リセットまで警報継続）、電子錠（施錠/解錠状態の保持）など、状態を記憶する必要がある多くの機器で使われています。',
        },
        {
          type: 'note',
          text: 'SRラッチは単純ですが、より複雑な記憶回路の基礎となる重要な要素です',
        },
      ],
    },
    {
      id: 'summary',
      instruction: 'SRラッチをマスター',
      content: [
        {
          type: 'heading',
          text: 'SRラッチの要点',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'フィードバックによる双安定回路の実現',
            'セット（S=1）で1、リセット（R=1）で0に設定',
            '入力が0に戻っても状態を保持',
            'S=1、R=1は禁止（不定状態）',
          ],
        },
        {
          type: 'quiz',
          question: 'SRラッチでQ=1を維持するには？',
          options: [
            'S=1、R=1',
            'S=1、R=0の後、S=0、R=0',
            'S=0、R=1',
            'S=0、R=0（最初から）',
          ],
          correctIndex: 1,
        },
        {
          type: 'heading',
          text: '次回予告',
        },
        {
          type: 'rich-text',
          elements: [
            { text: 'レジスタ', bold: true },
            'で、複数ビットのデータを同時に記憶する回路を学びます。',
            'D-FFを並列に並べた実用的な記憶装置です。',
          ],
        },
        {
          type: 'note',
          text: 'SRラッチの理解は、すべての記憶回路の基礎となります',
        },
      ],
    },
  ],
};
import type { StructuredLesson } from '../../../../types/lesson-content';

export const fourBitAdderStructuredLesson: StructuredLesson = {
  id: '4bit-adder',
  title: '4ビット加算器 - もっと大きな足し算をしよう！',
  description: '全加算器を4つ連結して、より大きな数の足し算ができる実用的な計算回路を作ります',
  objective: '複数の全加算器を連結して大きな数の計算を可能にし、実際の計算機の仕組みを理解する',
  difficulty: 'intermediate',
  prerequisites: ['full-adder'],
  estimatedMinutes: 30,
  availableGates: ['INPUT', 'OUTPUT', 'CUSTOM'],
  steps: [
    {
      id: 'intro',
      instruction: 'もっと大きな足し算をしたい！',
      content: [
        {
          type: 'heading',
          text: '🎯 今日のゴール',
        },
        {
          type: 'rich-text',
          elements: [
            '前回は',
            { text: '全加算器', emphasis: true },
            'で1桁の足し算を完璧にマスターしました。',
            '今日は、それを',
            { text: '4つ連結', bold: true },
            'して、',
            { text: 'もっと大きな足し算', emphasis: true },
            'ができるようにします！',
          ],
        },
        {
          type: 'heading',
          text: '🤔 なぜ大きな足し算が必要？',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '🎮 ゲームのスコア：100点、1000点と増えていく',
            '💰 お小遣い計算：500円 + 300円 = 800円',
            '⏱️ タイマー：59秒の次は60秒（1分）',
            '📱 スマホの歩数計：9999歩の次は10000歩',
          ],
        },
        {
          type: 'note',
          text: '1桁では足りない！もっと大きな数を扱いたい！',
        },
      ],
    },
    {
      id: 'limitation',
      instruction: '1つの全加算器の限界を確認',
      content: [
        {
          type: 'heading',
          text: '📊 前回の全加算器を振り返る',
        },
        {
          type: 'rich-text',
          elements: [
            '全加算器は',
            { text: '3つの1ビット', emphasis: true },
            'を足すことができました：',
          ],
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'A：最初の数',
            'B：2番目の数', 
            '前の桁からの繰り上がり（あれば）',
          ],
        },
        {
          type: 'rich-text',
          elements: [
            'そして',
            { text: '2つの結果', emphasis: true },
            'を出力します：',
          ],
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '和（この桁の答え）',
            '次の桁への繰り上がり（あれば）',
          ],
        },
        {
          type: 'table',
          headers: ['入力の例', '計算', '和', '繰り上がり', '意味'],
          rows: [
            ['A=1, B=1, 前=0', '1+1+0=2', '0', '1', '結果は10（2）'],
            ['A=1, B=1, 前=1', '1+1+1=3', '1', '1', '結果は11（3）'],
          ],
        },
        {
          type: 'note',
          text: '専門用語：前の繰り上がりをCin、次への繰り上がりをCout、和をSと呼びます',
        },
        {
          type: 'heading',
          text: '🚧 でも、これだけでは...',
        },
        {
          type: 'rich-text',
          elements: [
            { text: '問題：', bold: true },
            '最大でも',
            { text: '3まで', emphasis: true },
            'しか計算できません。',
            '3 + 5 = ?',
            '7 + 9 = ?',
            'のような計算は',
            { text: '不可能', bold: true },
            'です。',
          ],
        },
        {
          type: 'note',
          text: '解決策：複数の全加算器を使って、複数桁の計算を可能にする！',
        },
      ],
    },
    {
      id: 'multi-digit',
      instruction: '複数桁の足し算の仕組みを理解',
      content: [
        {
          type: 'heading',
          text: '✏️ 筆算を思い出そう',
        },
        {
          type: 'rich-text',
          elements: [
            '小学校で習った筆算、覚えていますか？',
            '例えば',
            { text: '23 + 19', bold: true },
            'の計算：',
          ],
        },
        {
          type: 'ascii-art',
          art: `  2 3
+ 1 9
-----
  4 2

1の位: 3 + 9 = 12 → 2を書いて1を繰り上げ
10の位: 2 + 1 + 1(繰り上がり) = 4`,
        },
        {
          type: 'heading',
          text: '💡 筆算の重要なポイント',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '各桁を別々に計算する',
            '右（1の位）から順番に計算',
            '繰り上がりを次の桁に伝える',
            '各桁で同じ計算方法を使う',
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: 'これがまさに全加算器の連結と同じ！', bold: true },
            '各桁の計算を',
            { text: '1つの全加算器', emphasis: true },
            'が担当し、',
            '繰り上がりを',
            { text: '次の全加算器', emphasis: true },
            'に渡します。',
          ],
        },
      ],
    },
    {
      id: 'binary-multi-digit',
      instruction: '2進数の複数桁を理解',
      content: [
        {
          type: 'heading',
          text: '🔢 4ビットで表せる数',
        },
        {
          type: 'rich-text',
          elements: [
            '4ビット（4桁の2進数）では、',
            { text: '0000から1111', emphasis: true },
            'まで、',
            { text: '16種類', bold: true },
            'の数を表現できます。',
          ],
        },
        {
          type: 'table',
          headers: ['10進数', '2進数', '計算式（お金で例えると）'],
          rows: [
            ['0', '0000', '0×8円 + 0×4円 + 0×2円 + 0×1円 = 0円'],
            ['5', '0101', '0×8円 + 1×4円 + 0×2円 + 1×1円 = 5円'],
            ['10', '1010', '1×8円 + 0×4円 + 1×2円 + 0×1円 = 10円'],
            ['15', '1111', '1×8円 + 1×4円 + 1×2円 + 1×1円 = 15円'],
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: '💰 お金の例え：', bold: true },
            '8の位 = 8円玉、4の位 = 4円玉、2の位 = 2円玉、1の位 = 1円玉',
            'があると思ってください。',
            'それぞれの桁が1なら、その価値分のお金を持っています。',
          ],
        },
        {
          type: 'heading',
          text: '⚡ 4ビット同士の足し算例',
        },
        {
          type: 'ascii-art',
          art: `例: 5 + 7 = 12

  0101 (5)
+ 0111 (7)
---------
  1100 (12)

詳細:
1の位: 1 + 1 = 10 → 0を書いて1を繰り上げ
2の位: 0 + 1 + 1 = 10 → 0を書いて1を繰り上げ  
4の位: 1 + 1 + 1 = 11 → 1を書いて1を繰り上げ
8の位: 0 + 0 + 1 = 01 → 1を書く`,
        },
        {
          type: 'note',
          text: '各桁の計算がまさに全加算器の仕事！繰り上がりが順番に伝わっていきます',
        },
      ],
    },
    {
      id: 'circuit-design',
      instruction: '4ビット加算器の回路設計',
      content: [
        {
          type: 'heading',
          text: '🏗️ 回路の全体構成',
        },
        {
          type: 'ascii-art',
          art: `4ビット加算器の構造:

A3 B3   A2 B2   A1 B1   A0 B0  ← 入力（各桁のA,B）
 ↓ ↓     ↓ ↓     ↓ ↓     ↓ ↓
┌─┴─┴─┐ ┌─┴─┴─┐ ┌─┴─┴─┐ ┌─┴─┴─┐
│全加3│←│全加2│←│全加1│←│全加0│← 0（最初は繰り上がりなし）
└─┬─┬─┘ └─┬─┬─┘ └─┬─┬─┘ └─┬─┬─┘
  ↓ ↓     ↓       ↓       ↓
最終 和3    和2      和1      和0   ← 出力（5ビット）
繰上

全加 = 全加算器
← = 繰り上がりの流れ`,
        },
        {
          type: 'heading',
          text: '📍 重要な接続ポイント',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'データ線：各桁のA,Bを対応する全加算器へ',
            '繰り上がり線：0桁目の繰り上がり → 1桁目へ（連鎖）',
            '初期値：0桁目への繰り上がりは0（最初は繰り上がりなし）',
            '最終出力：5ビット（和4つ + 最終繰り上がり）で最大31まで',
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: 'ポイント：', bold: true },
            '各全加算器は',
            { text: '独立して動作', emphasis: true },
            'しますが、',
            '繰り上がりで',
            { text: '連携', emphasis: true },
            'しています。',
            'まるでリレー競走のバトンパスのようです！',
          ],
        },
      ],
    },
    {
      id: 'build-circuit',
      instruction: '回路を組み立てよう',
      content: [
        {
          type: 'heading',
          text: '🛠️ 組み立て手順',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '入力の配置：左側にINPUT×8個（数A×4個、数B×4個）',
            '全加算器の配置：中央にカスタムゲート×4個',
            '出力の配置：右側にOUTPUT×5個（和×4個 + 最終繰り上がり×1個）',
            'データ配線：各桁のA,Bを全加算器へ',
            '繰り上がり配線：順番に連結（重要！）',
            '出力配線：各全加算器から結果を出力へ',
          ],
        },
        {
          type: 'heading',
          text: '⚠️ 配線のコツ',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '色分け：データ線と繰り上がり線を区別',
            '整理整頓：配線が交差しないよう工夫',
            '確認：各全加算器の入出力を1つずつチェック',
          ],
        },
        {
          type: 'note',
          text: '配線ミスを防ぐコツ：1桁ずつ完成させてから次へ進む',
        },
      ],
    },
    {
      id: 'test-simple',
      instruction: '簡単な計算でテスト（3 + 5）',
      content: [
        {
          type: 'heading',
          text: '🧪 実験1：3 + 5 = 8',
        },
        {
          type: 'rich-text',
          elements: [
            'まず簡単な計算から始めましょう。',
            { text: '3（0011）+ 5（0101）= 8（1000）', bold: true },
          ],
        },
        {
          type: 'table',
          headers: ['桁', 'A', 'B', '前繰り上がり', '計算', '和', '次繰り上がり'],
          rows: [
            ['1の位', '1', '1', '0', '1+1+0=2', '0', '1'],
            ['2の位', '1', '0', '1', '1+0+1=2', '0', '1'],
            ['4の位', '0', '1', '1', '0+1+1=2', '0', '1'],
            ['8の位', '0', '0', '1', '0+0+1=1', '1', '0'],
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: '結果：01000（8）', bold: true },
            '繰り上がりが',
            { text: '3回連続', emphasis: true },
            'で発生し、',
            '最終的に8の位に1が立ちました！',
          ],
        },
      ],
    },
    {
      id: 'test-overflow',
      instruction: '大きな計算でテスト（15 + 15）',
      content: [
        {
          type: 'heading',
          text: '🧪 実験2：15 + 15 = 30',
        },
        {
          type: 'rich-text',
          elements: [
            '4ビットの最大値同士を足してみます。',
            { text: '15（1111）+ 15（1111）= 30（11110）', bold: true },
          ],
        },
        {
          type: 'table',
          headers: ['桁', 'A', 'B', '前繰り上がり', '計算', '和', '次繰り上がり'],
          rows: [
            ['1の位', '1', '1', '0', '1+1+0=2', '0', '1'],
            ['2の位', '1', '1', '1', '1+1+1=3', '1', '1'],
            ['4の位', '1', '1', '1', '1+1+1=3', '1', '1'],
            ['8の位', '1', '1', '1', '1+1+1=3', '1', '1'],
            ['16の位', '-', '-', '1', '繰り上がりのみ', '-', '1'],
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: '結果：11110（30）', bold: true },
            '5ビット目（最終繰り上がり）に',
            { text: '1が出力', emphasis: true },
            'されました！',
            'これが4ビット加算器の',
            { text: '最大の計算結果', bold: true },
            'です。',
          ],
        },
        {
          type: 'note',
          text: '5ビット目があることで、4ビット＋4ビットでも正確に計算できます',
        },
      ],
    },
    {
      id: 'ripple-carry',
      instruction: '繰り上がりの伝播を観察',
      content: [
        {
          type: 'heading',
          text: '🌊 リップルキャリー（波紋のような繰り上がり）',
        },
        {
          type: 'rich-text',
          elements: [
            '特別な例：',
            { text: '15 + 1 = 16', bold: true },
            'で繰り上がりの',
            { text: '連鎖反応', emphasis: true },
            'を観察しましょう。',
          ],
        },
        {
          type: 'ascii-art',
          art: `1111 + 0001 の計算過程:

時刻1: 1の位を計算
  1 + 1 = 10 → 和=0, 繰り上がり=1 発生！

時刻2: 2の位を計算  
  1 + 0 + 1(前繰り上がり) = 10 → 和=0, 繰り上がり=1 発生！

時刻3: 4の位を計算
  1 + 0 + 1(前繰り上がり) = 10 → 和=0, 繰り上がり=1 発生！

時刻4: 8の位を計算
  1 + 0 + 1(前繰り上がり) = 10 → 和=0, 最終繰り上がり=1 発生！

最終結果: 10000（16）`,
        },
        {
          type: 'rich-text',
          elements: [
            '繰り上がりが',
            { text: '波のように', emphasis: true },
            '1の位から16の位まで',
            { text: '順番に伝わっていく', bold: true },
            '様子から、',
            'この方式を',
            { text: 'リップルキャリー加算器', emphasis: true },
            'と呼びます。',
          ],
        },
        {
          type: 'note',
          text: '利点：構造がシンプル、欠点：桁数が増えると計算時間も増える',
        },
      ],
    },
    {
      id: 'troubleshooting',
      instruction: 'うまくいかない時は？',
      content: [
        {
          type: 'heading',
          text: '🔧 よくある配線ミスと対処法',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '❌ 計算結果がおかしい → 各桁のA,Bの配線を確認',
            '❌ 繰り上がりが働かない → Cout→Cinの接続を確認',
            '❌ 特定の桁だけ変 → その桁の全加算器の配線を再確認',
            '❌ 全く動かない → 電源（入力）が入っているか確認',
          ],
        },
        {
          type: 'heading',
          text: '✅ デバッグのコツ',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '簡単な計算（1+1など）から始める',
            '1桁ずつ動作を確認する',
            '繰り上がりの流れを目で追う',
            '配線の色（緑=1、グレー=0）を観察',
          ],
        },
        {
          type: 'note',
          text: 'ヒント：0000 + 0001 = 0001 が正しく動けば、基本配線はOK！',
        },
      ],
    },
    {
      id: 'applications',
      instruction: '4ビット加算器の応用',
      content: [
        {
          type: 'heading',
          text: '🌟 実際の使用例',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '🎮 レトロゲーム：スコア計算（0〜30点）',
            '⏰ タイマー：秒カウンター（0〜30秒）',
            '🌡️ 温度計：温度表示（0〜30度）',
            '🚦 信号機：タイマー制御（0〜30秒）',
          ],
        },
        {
          type: 'heading',
          text: '📈 さらなる拡張',
        },
        {
          type: 'rich-text',
          elements: [
            '今回の',
            { text: '4ビット加算器', emphasis: true },
            'をさらに拡張すると：',
          ],
        },
        {
          type: 'table',
          headers: ['ビット数', '全加算器数', '計算範囲', '用途例'],
          rows: [
            ['8ビット', '8個', '0〜255', 'マイコン、センサー'],
            ['16ビット', '16個', '0〜65,535', '初期のPC、ゲーム機'],
            ['32ビット', '32個', '0〜約43億', 'スマートフォン'],
            ['64ビット', '64個', '0〜約1800京', '最新のPC、サーバー'],
          ],
        },
        {
          type: 'note',
          text: '基本原理は同じ！規模が大きくなるだけです',
        },
      ],
    },
    {
      id: 'achievement',
      instruction: '🎉 本格的な計算機を完成！',
      content: [
        {
          type: 'heading',
          text: '🏆 習得したスキル',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '✅ 複数桁の2進数計算の仕組みを理解',
            '✅ 全加算器を連結して大きな計算を実現',
            '✅ 繰り上がりの連鎖（リップル）を観察',
            '✅ 実用的な計算回路を構築',
          ],
        },
        {
          type: 'quiz',
          question: '4ビット加算器で 7 + 9 を計算すると？',
          options: [
            '0000（計算不可）',
            '1111（15）',
            '10000（16）',
            '10001（17）',
          ],
          correctIndex: 2,
        },
        {
          type: 'heading',
          text: '🚀 次のステップ',
        },
        {
          type: 'rich-text',
          elements: [
            '次回は',
            { text: '比較器', bold: true },
            'を学びます。',
            '「どちらが大きい？」を判定する回路で、',
            'if文の基礎となる重要な回路です！',
          ],
        },
        {
          type: 'note',
          text: '今日作った4ビット加算器が、すべての計算機の基本です！',
        },
      ],
    },
  ],
};
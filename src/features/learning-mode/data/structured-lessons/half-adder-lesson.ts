import type { StructuredLesson } from '../../../../types/lesson-content';
import { TERMS } from '../terms';

export const halfAdderStructuredLesson: StructuredLesson = {
  id: 'half-adder',
  title: '半加算器 - 電卓の心臓部を作ろう！',
  description: 'たった2つのゲートで足し算ができる魔法の回路',
  objective:
    'XORとANDゲートを組み合わせて、0と1の足し算回路を作り、コンピュータの計算原理を理解する',
  category: '基本回路',
  lessonType: 'build',
  difficulty: 'intermediate',
  prerequisites: ['and-gate', 'xor-gate'],
  estimatedMinutes: 20,
  availableGates: ['INPUT', 'OUTPUT', 'AND', 'XOR'],
  steps: [
    {
      id: 'intro',
      instruction: '電卓は0と1しか知らない？驚きの真実',
      content: [
        {
          type: 'heading',
          text: '🧮 電卓を分解したら...？',
        },
        {
          type: 'rich-text',
          elements: [
            '皆さんが使っている電卓、実は',
            { text: '0と1だけ', bold: true },
            'で計算しているって知っていましたか？',
            '「えっ、でも100とか1000とか表示されるよ？」',
            'その秘密を今日は解き明かします！',
          ],
        },
        {
          type: 'heading',
          text: '身近な例で理解しよう',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '🏦 銀行の金庫：ダイヤル0〜9で番号を作る → 10進数',
            '🚦 信号機：赤・青・黄の3色で状態を表す → 3進数',
            '⚡ スイッチ：ON・OFFの2つだけ → 2進数',
            '💻 コンピュータ：電気のあり・なし（1・0）→ 2進数！',
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: '今日のミッション：', bold: true },
            '0と1だけで',
            { text: '足し算ができる回路', emphasis: true },
            'を作ります！',
          ],
        },
        {
          type: 'note',
          text: 'すべてのコンピュータの計算は、今日作る回路から始まります',
        },
      ],
    },
    {
      id: 'principle',
      instruction: '指で数える2進数 - 片手で31まで！',
      content: [
        {
          type: 'heading',
          text: '👋 普通の数え方 vs 2進数の数え方',
        },
        {
          type: 'rich-text',
          elements: [
            '普通は指10本で',
            { text: '10まで', emphasis: true },
            'しか数えられませんが、',
            '2進数なら片手5本で',
            { text: '31まで', bold: true },
            '数えられます！',
          ],
        },
        {
          type: 'heading',
          text: '2進数の仕組み',
        },
        {
          type: 'table',
          headers: ['10進数', '2進数', '意味'],
          rows: [
            ['0', '0', '何もない'],
            ['1', '1', '1が1つ'],
            ['2', '10', '2が1つ、1が0個'],
            ['3', '11', '2が1つ、1が1つ'],
            ['4', '100', '4が1つ、2が0個、1が0個'],
          ],
        },
        {
          type: 'heading',
          text: '💡 1+1=10の謎',
        },
        {
          type: 'rich-text',
          elements: [
            '2進数では',
            { text: '1 + 1 = 10', bold: true },
            'になります！',
            'これは「2」を意味します。',
            '10進数で9+1=10になるのと同じ原理です。',
          ],
        },
        {
          type: 'heading',
          text: '🎯 2進数の足し算パターン',
        },
        {
          type: 'table',
          headers: ['計算', '結果', '10進数では'],
          rows: [
            ['0 + 0', '00', '0'],
            ['0 + 1', '01', '1'],
            ['1 + 0', '01', '1'],
            ['1 + 1', '10', '2（繰り上がり発生！）'],
          ],
        },
        {
          type: 'note',
          text: '右の桁（和）と左の桁（繰り上がり）に注目！これが回路設計のヒントです',
        },
      ],
    },
    {
      id: 'circuit-build',
      instruction: '足し算マシンを組み立てよう！',
      content: [
        {
          type: 'heading',
          text: '🛠️ 必要な部品',
        },
        {
          type: 'rich-text',
          elements: [
            '今日使うのは、以前学んだ',
            { text: '2種類のゲート', emphasis: true },
            'だけです！',
          ],
        },
        {
          type: 'list',
          ordered: false,
          items: [
            `${TERMS.XOR}ゲート：「どちらか片方だけ」を検出 → 和（1の位）担当`,
            `${TERMS.AND}ゲート：「両方とも」を検出 → 繰り上がり（2の位）担当`,
          ],
        },
        {
          type: 'heading',
          text: '完成イメージ',
        },
        {
          type: 'circuit-diagram',
          circuitId: 'half-adder',
          showTruthTable: false,
        },
        {
          type: 'heading',
          text: '組み立て手順',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '入力Aと入力Bを左側に配置（数字を入れる場所）',
            'XORゲートを中央上に配置（和の計算係）',
            'ANDゲートを中央下に配置（繰り上がりの計算係）',
            '出力Sを右上に配置（Sum=和の表示）',
            '出力Cを右下に配置（Carry=繰り上がりの表示）',
            'A・Bからの配線を分岐させて両方のゲートにつなぐ',
          ],
        },
        {
          type: 'note',
          text: '配線のコツ：1つの出力から2つのゲートへ配線を「分岐」させるのがポイント！',
        },
      ],
    },
    {
      id: 'experiment',
      instruction: '予測して実験しよう！足し算は成功するか？',
      content: [
        {
          type: 'heading',
          text: '🔬 まず予測してみよう',
        },
        {
          type: 'rich-text',
          elements: [
            '作った回路が本当に足し算できるか、',
            { text: '4つのパターン', emphasis: true },
            'で予測してみましょう。',
            { text: 'ヒント：', bold: true },
            'XORは「違う時」、ANDは「両方1の時」でしたね...',
          ],
        },
        {
          type: 'note',
          text: '予想：0+0=00、0+1=01、1+0=01、1+1=10になるはず...',
        },
        {
          type: 'heading',
          text: '🎮 実験開始！',
        },
        {
          type: 'rich-text',
          elements: [
            '入力A・Bを',
            { text: 'ダブルクリック', emphasis: true },
            'して、すべての組み合わせを試してみましょう！',
            '特に',
            { text: '1 + 1', bold: true },
            'の時の動きに注目！',
          ],
        },
        {
          type: 'heading',
          text: '実験結果の記録',
        },
        {
          type: 'table',
          headers: [
            'A',
            'B',
            'S（和）',
            'C（繰り上がり）',
            '2進数結果',
            '10進数',
          ],
          rows: [
            ['0', '0', '0', '0', '00', '0'],
            ['0', '1', '1', '0', '01', '1'],
            ['1', '0', '1', '0', '01', '1'],
            ['1', '1', '0', '1', '10', '2'],
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: '🎉 大発見！', bold: true },
            '回路が完璧に2進数の足し算を実行しています！',
            '1+1の時、Sが0、Cが1になって「10」（2進数の2）を表現！',
          ],
        },
        {
          type: 'note',
          text: '配線の色にも注目：緑色は電気が流れている（1）、グレーは流れていない（0）',
        },
      ],
    },
    {
      id: 'analysis',
      instruction: '半加算器の秘密を分析しよう',
      content: [
        {
          type: 'heading',
          text: '🔍 なぜこの組み合わせで動くの？',
        },
        {
          type: 'table',
          headers: ['役割', 'ゲート', '動作', '担当する桁'],
          rows: [
            ['和の計算', 'XOR', 'どちらか片方が1', '1の位（右の桁）'],
            ['繰り上がり検出', 'AND', '両方とも1', '2の位（左の桁）'],
          ],
        },
        {
          type: 'heading',
          text: '💡 この発見がすごい理由',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '論理演算（真偽の判定）が算術演算（数の計算）になった！',
            'たった2つのゲートで、コンピュータの基本計算が可能に',
            'この原理で、どんな大きな数の計算もできる',
            '世界中のコンピュータがこの仕組みを使っている',
          ],
        },
        {
          type: 'heading',
          text: '⚡ 半加算器 vs 人間の計算',
        },
        {
          type: 'table',
          headers: ['項目', '人間', '半加算器'],
          rows: [
            ['使う数字', '0〜9（10種類）', '0と1（2種類）'],
            ['計算速度', '秒単位', 'ナノ秒単位（10億分の1秒）'],
            ['エラー', 'たまに間違える', '絶対に間違えない'],
            ['疲労', '疲れる', '24時間休みなし'],
          ],
        },
        {
          type: 'note',
          text: '「半」加算器という名前は、3つ目の入力（前の桁からの繰り上がり）を扱えないから',
        },
      ],
    },
    {
      id: 'applications',
      instruction: '半加算器が支える現代社会',
      content: [
        {
          type: 'heading',
          text: '🌍 身の回りの半加算器',
        },
        {
          type: 'rich-text',
          elements: [
            '今作った回路は、意外なほど',
            { text: 'あらゆる場所', emphasis: true },
            'で活躍しています！',
          ],
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '📱 スマートフォン：アプリの計算処理すべて',
            '🚗 自動車：スピードメーターの表示計算',
            '🏧 ATM：お金の計算と残高管理',
            '🎮 ゲーム機：スコア計算やダメージ計算',
            '⌚ デジタル時計：時刻のカウントアップ',
          ],
        },
        {
          type: 'heading',
          text: '🚀 プログラミングとの関係',
        },
        {
          type: 'rich-text',
          elements: [
            'プログラムで',
            { text: 'a + b', emphasis: true },
            'と書いた時、',
            'CPUの中では今日作った回路が',
            { text: '超高速で動いています！', bold: true },
          ],
        },
        {
          type: 'heading',
          text: '💭 考えてみよう',
        },
        {
          type: 'rich-text',
          elements: [
            '1秒間に',
            { text: '数十億回', bold: true },
            'の計算ができるコンピュータも、',
            '基本は今日作った',
            { text: 'たった2つのゲート', emphasis: true },
            'から始まっています。',
            'シンプルな仕組みの積み重ねが、複雑な技術を生み出すのです！',
          ],
        },
        {
          type: 'note',
          text: '豆知識：最新のCPUには、約100億個のトランジスタ（ゲートの素）が入っています',
        },
      ],
    },
    {
      id: 'summary',
      instruction: '足し算マシンをマスター！',
      content: [
        {
          type: 'heading',
          text: '🏆 半加算器の要点',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '2進数の足し算：0+0=0、0+1=1、1+0=1、1+1=10',
            'XORゲート：和（1の位）を計算する魔法',
            'ANDゲート：繰り上がり（2の位）を検出する番人',
            'たった2つのゲートで、すべての計算の基礎が完成',
          ],
        },
        {
          type: 'quiz',
          question:
            '半加算器で「1 + 1」を計算した時、出力S（和）と出力C（繰り上がり）の値は？',
          options: ['S=1、C=1', 'S=0、C=1', 'S=1、C=0', 'S=0、C=0'],
          correctIndex: 1,
        },
        {
          type: 'heading',
          text: '次回予告',
        },
        {
          type: 'rich-text',
          elements: [
            { text: '全加算器', bold: true },
            'で、もっと本格的な計算機を作ります！',
            '3つの数（A + B + 前の繰り上がり）を足せる、',
            'より実用的な回路に挑戦します。',
          ],
        },
        {
          type: 'note',
          text: '今日の半加算器 × たくさん = 本物の電卓やコンピュータの計算回路！',
        },
      ],
    },
  ],
};

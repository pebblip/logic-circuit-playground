import type { StructuredLesson } from '../../../../types/lesson-content';
import { TERMS } from '../terms';

export const comparatorStructuredLesson: StructuredLesson = {
  id: 'comparator',
  title: '比較器 - 数の大小判定装置',
  description: '2つの数値を比較して大小関係を判定する回路を作ります',
  objective:
    '1ビット比較器の構築を通じて、条件分岐の基礎原理を理解し、CPUの判断機能の根幹を習得する',
  category: '基本回路',
  lessonType: 'build',
  difficulty: 'intermediate',
  prerequisites: ['xor-gate'],
  estimatedMinutes: 15,
  availableGates: ['INPUT', 'OUTPUT', 'AND', 'XOR', 'NOT'],
  steps: [
    {
      id: 'intro',
      instruction: 'コンピュータの判断力の仕組み',
      content: [
        {
          type: 'heading',
          text: '身近な例で考える',
        },
        {
          type: 'text',
          text: 'ゲームでスコアを比較する場面を思い出してください。「あなたのスコア：85点、ハイスコア：92点」と表示されたとき、コンピュータは内部で85と92を比較して「新記録ではない」と判断しています。',
        },
        {
          type: 'heading',
          text: '比較器とは',
        },
        {
          type: 'text',
          text: '2つの数値を比較して、「等しい」「大きい」「小さい」を判定する回路です。if文やwhile文など、プログラムの条件分岐を支える最も基本的な回路です。',
        },
        {
          type: 'note',
          text: 'CPUの「判断力」の中核となる重要な回路です',
        },
      ],
    },
    {
      id: 'principle',
      instruction: '比較器の電気的仕組み',
      content: [
        {
          type: 'heading',
          text: '1ビット比較器の構造',
        },
        {
          type: 'text',
          text: '最も基本的な1ビット比較器は、2つの入力A、Bから3つの出力「A=B」「A>B」「A<B」を生成します。それぞれが異なる論理ゲートの組み合わせで実現されます。',
        },
        {
          type: 'heading',
          text: '比較結果の判定方法',
        },
        {
          type: 'table',
          headers: ['A', 'B', 'A=B', 'A>B', 'A<B', '意味'],
          rows: [
            ['0', '0', '1', '0', '0', '両方とも0'],
            ['0', '1', '0', '0', '1', '0は1より小さい'],
            ['1', '0', '0', '1', '0', '1は0より大きい'],
            ['1', '1', '1', '0', '0', '両方とも1'],
          ],
        },
        {
          type: 'heading',
          text: '論理式の導出',
        },
        {
          type: 'text',
          text: 'A=B：両方が同じときに1 → NOT(A XOR B)で実現。A>B：Aが1でBが0のときに1 → A AND NOT(B)で実現。A<B：Aが0でBが1のときに1 → NOT(A) AND Bで実現。',
        },
        {
          type: 'note',
          text: 'XORゲートで「違い」を検出し、NOTで反転すると「同じ」を検出できます',
        },
      ],
    },
    {
      id: 'circuit-build',
      instruction: '1ビット比較器回路を作ってみよう',
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
            '上がA（比較したい数値1）、下がB（比較したい数値2）です。',
          ],
        },
        {
          type: 'heading',
          text: '手順２：対象ゲートを配置',
        },
        {
          type: 'rich-text',
          elements: [
            { text: `${TERMS.XOR}ゲート`, emphasis: true },
            'を1つ配置（等値判定用）。',
            { text: `${TERMS.NOT}ゲート`, emphasis: true },
            'を3つ配置（反転処理用）。',
            { text: `${TERMS.AND}ゲート`, emphasis: true },
            'を2つ配置（大小判定用）。',
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
            'を3つ配置します。',
            '上から「A=B」「A>B」「A<B」の順に配置。',
            '常に1つだけがONになります。',
          ],
        },
        {
          type: 'heading',
          text: '手順４：配線でつなげる',
        },
        {
          type: 'rich-text',
          elements: [
            '等値判定：AとBをXORに接続、XORの出力をNOTに接続してA=B出力へ。',
            '大きい判定：AとNOT(B)をANDに接続してA>B出力へ。',
            '小さい判定：NOT(A)とBをANDに接続してA<B出力へ。',
            '各NOT、ANDゲートの配線を完成させる。',
          ],
        },
        {
          type: 'note',
          text: '配線のコツ：3つの出力のうち常に1つだけがONになることを確認',
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
          text: '4つの入力パターン（00、01、10、11）でどの出力がONになるか予測してください。00と11では等値、01では小さい、10では大きいが点灯するはずです。',
        },
        {
          type: 'heading',
          text: '実験で確かめよう',
        },
        {
          type: 'rich-text',
          elements: [
            '1. 初期状態：A=0、B=0→「A=B」がONを確認。',
            '2. Bを',
            { text: `${TERMS.DOUBLE_CLICK}`, emphasis: true },
            'して1に→「A<B」がONに変化。',
            '3. Aも1に→「A=B」がONに戻る。',
            '4. Bを0に戻す→「A>B」がONに変化。',
          ],
        },
        {
          type: 'heading',
          text: '実験結果の確認',
        },
        {
          type: 'table',
          headers: ['A', 'B', 'A=B', 'A>B', 'A<B', '判定結果'],
          rows: [
            ['0', '0', '1', '0', '0', '等しい'],
            ['0', '1', '0', '0', '1', '0 < 1'],
            ['1', '0', '0', '1', '0', '1 > 0'],
            ['1', '1', '1', '0', '0', '等しい'],
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: '発見：', bold: true },
            'どの入力でも必ず',
            { text: '1つだけ', emphasis: true },
            'の出力がONになります。',
            '複数同時にONになることはありません。',
          ],
        },
        {
          type: 'note',
          text: 'この性質により、条件分岐の処理が正確に行われます',
        },
      ],
    },
    {
      id: 'analysis',
      instruction: '比較器の特徴を分析しよう',
      content: [
        {
          type: 'heading',
          text: '多ビット比較器への拡張',
        },
        {
          type: 'text',
          text: '実際のCPUでは32ビットや64ビットの数値を比較します。多ビット比較器では、最上位ビットから順に比較し、最初に違いが見つかった時点で判定が確定します。',
        },
        {
          type: 'heading',
          text: '比較回路の性能分析',
        },
        {
          type: 'table',
          headers: [
            'ビット数',
            '1ビット比較器数',
            'ゲート数（概算）',
            '遅延時間',
          ],
          rows: [
            ['1ビット', '1個', '6個', '2ゲート遅延'],
            ['4ビット', '4個', '24個', '4ゲート遅延'],
            ['32ビット', '32個', '192個', '32ゲート遅延'],
            ['64ビット', '64個', '384個', '64ゲート遅延'],
          ],
        },
        {
          type: 'heading',
          text: 'CPUでの最適化',
        },
        {
          type: 'text',
          text: '現代のCPUでは並列比較や先読み技術により、64ビットでも数ゲート遅延で比較を完了します。また、条件分岐予測機能により、比較結果を事前に推測して処理を高速化しています。',
        },
        {
          type: 'heading',
          text: '確率的な視点',
        },
        {
          type: 'text',
          text: 'ランダムな1ビット入力に対して、A=Bになる確率は50%（00と11）、A>Bは25%（10のみ）、A<Bも25%（01のみ）です。実際の計算では等値の確率は非常に低く、大小判定が多用されます。',
        },
        {
          type: 'note',
          text: '比較器は論理演算と算術演算の橋渡しをする重要な回路です',
        },
      ],
    },
    {
      id: 'applications',
      instruction: '比較器の実用例',
      content: [
        {
          type: 'heading',
          text: '実世界での活用',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'CPU分岐命令：if文、while文の条件判定',
            'ソート処理：数値の並び替えアルゴリズム',
            'ゲーム開発：スコア比較、ランキング判定',
            'データベース：検索条件の評価',
            '制御システム：センサー値の閾値判定',
          ],
        },
        {
          type: 'heading',
          text: '身近な製品での使用例',
        },
        {
          type: 'text',
          text: 'エアコンの温度制御（設定温度との比較）、ゲーム機のスコア判定、スマートフォンのバッテリー残量警告、銀行ATMの残高確認など、数値を比較する必要がある機器すべてで使われています。',
        },
        {
          type: 'note',
          text: '現代のプログラミング言語の比較演算子（==、>、<）は、すべて比較器で実現されています',
        },
      ],
    },
    {
      id: 'summary',
      instruction: '比較器をマスター',
      content: [
        {
          type: 'heading',
          text: '比較器の要点',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '2つの入力から3つの判定結果を出力',
            'XOR、NOT、ANDゲートの組み合わせで実現',
            '常に1つだけの出力がON（排他的出力）',
            'CPUの条件分岐命令の基礎となる回路',
          ],
        },
        {
          type: 'quiz',
          question: '1ビット比較器でA=1、B=0のとき、どの出力が1になる？',
          options: ['A=B', 'A>B', 'A<B', 'すべて0'],
          correctIndex: 1,
        },
        {
          type: 'heading',
          text: '次回予告',
        },
        {
          type: 'rich-text',
          elements: [
            { text: 'ALU（演算論理装置）', bold: true },
            'で、加算器と比較器を統合した万能計算回路を学びます。',
            'CPUの心臓部となる最重要回路です。',
          ],
        },
        {
          type: 'note',
          text: '比較器の理解で、コンピュータの「判断力」の仕組みが分かりました',
        },
      ],
    },
  ],
};

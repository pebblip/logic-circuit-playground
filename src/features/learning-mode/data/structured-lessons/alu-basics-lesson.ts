import type { StructuredLesson } from '../../../../types/lesson-content';
import { TERMS } from '../terms';

export const aluBasicsStructuredLesson: StructuredLesson = {
  id: 'alu-basics',
  title: 'ALU基礎 - CPUの計算エンジン',
  description: '算術論理演算装置（ALU）の基本を理解し簡易版を作ります',
  objective: '演算選択機能を持つ基本ALUの構築を通じて、CPUの計算処理の核心を理解し、デジタル演算システムの基礎を習得する',
  category: '基本回路',
  lessonType: 'build',
  difficulty: 'advanced',
  prerequisites: ['multiplexer'],
  estimatedMinutes: 15,
  availableGates: ['INPUT', 'OUTPUT', 'AND', 'XOR', 'NOT', 'OR'],
  steps: [
    {
      id: 'intro',
      instruction: 'コンピュータの計算能力の源',
      content: [
        {
          type: 'heading',
          text: '身近な例で考える',
        },
        {
          type: 'text',
          text: '電卓で「5 + 3 =」と入力したとき、内部では加算回路が動きます。しかし「5 AND 3」（論理演算）も計算できる電卓があったとしたら？そんな万能計算機がALU（算術論理演算装置）です。',
        },
        {
          type: 'heading',
          text: 'ALUとは',
        },
        {
          type: 'text',
          text: 'Arithmetic Logic Unit（算術論理演算装置）の略で、CPUの中で実際の計算を行う部品です。算術演算（足し算、引き算）と論理演算（AND、OR）の両方を、制御信号によって切り替えて実行できます。',
        },
        {
          type: 'note',
          text: 'すべてのプログラムの計算処理は、最終的にALUで実行されます',
        },
      ],
    },
    {
      id: 'principle',
      instruction: 'ALUの電気的仕組み',
      content: [
        {
          type: 'heading',
          text: '基本的な2機能ALUの構造',
        },
        {
          type: 'text',
          text: '今回作るALUは、2つの入力AとBに対して、制御信号OPにより「論理AND」または「論理XOR」を選択実行します。内部では両方の演算を同時に計算し、マルチプレクサで結果を選択します。',
        },
        {
          type: 'heading',
          text: '演算の選択方法',
        },
        {
          type: 'table',
          headers: ['制御信号OP', '選択演算', '出力結果', '用途'],
          rows: [
            ['0', 'A AND B', '論理積', 'マスク処理、フィルタ'],
            ['1', 'A XOR B', '排他的論理和', '比較、パリティ'],
          ],
        },
        {
          type: 'heading',
          text: '内部構造の概要',
        },
        {
          type: 'text',
          text: 'ALU = 複数の演算回路 + マルチプレクサ + 制御信号。各演算回路（ANDとXOR）が並列で動作し、マルチプレクサが制御信号に基づいて適切な結果を出力に送ります。',
        },
        {
          type: 'note',
          text: '実際のALUでは16〜64種類の演算を選択できますが、原理は同じです',
        },
      ],
    },
    {
      id: 'circuit-build',
      instruction: '2機能ALU回路を作ってみよう',
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
            'を3つ配置します。',
            'A（演算対象1）、B（演算対象2）、OP（演算選択）です。',
          ],
        },
        {
          type: 'heading',
          text: '手順２：対象ゲートを配置',
        },
        {
          type: 'rich-text',
          elements: [
            { text: `${TERMS.AND}ゲート`, emphasis: true },
            'を1つ配置（論理積演算用）。',
            { text: `${TERMS.XOR}ゲート`, emphasis: true },
            'を1つ配置（排他的論理和演算用）。',
            { text: `${TERMS.NOT}ゲート`, emphasis: true },
            'を1つ、',
            { text: `${TERMS.AND}ゲート`, emphasis: true },
            'を2つ、',
            { text: `${TERMS.OR}ゲート`, emphasis: true },
            'を1つ配置（マルチプレクサ用）。',
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
            'を1つ配置します。',
            '選択された演算の結果が出力されます。',
          ],
        },
        {
          type: 'heading',
          text: '手順４：配線でつなげる',
        },
        {
          type: 'rich-text',
          elements: [
            '演算部：AとBを両方のANDゲートとXORゲートに接続。',
            'マルチプレクサ部：OP信号をNOTゲートに接続。',
            '選択回路：AND演算結果とNOT(OP)を1つ目のANDに接続。',
            'XOR演算結果とOPを2つ目のANDに接続。両ANDの出力をORに接続して最終出力へ。',
          ],
        },
        {
          type: 'note',
          text: '配線のコツ：並列演算とマルチプレクサの2段構成を意識する',
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
          text: 'A=1、B=1にした状態で、OP=0とOP=1を切り替えたときの出力を予測してください。OP=0なら1（1 AND 1）、OP=1なら0（1 XOR 1）になるはずです。',
        },
        {
          type: 'heading',
          text: '実験で確かめよう',
        },
        {
          type: 'rich-text',
          elements: [
            '1. 初期設定：A=1、B=1、OP=0→出力が1（AND演算）。',
            '2. OPを',
            { text: `${TERMS.DOUBLE_CLICK}`, emphasis: true },
            'して1に変更→出力が0（XOR演算）。',
            '3. A=1、B=0に変更→OP=0で0、OP=1で1。',
            '4. A=0、B=1に変更→OP=0で0、OP=1で1。',
          ],
        },
        {
          type: 'heading',
          text: '実験結果の確認',
        },
        {
          type: 'table',
          headers: ['A', 'B', 'OP=0（AND）', 'OP=1（XOR）', '動作確認'],
          rows: [
            ['0', '0', '0', '0', '両演算とも0'],
            ['0', '1', '0', '1', '異なる結果'],
            ['1', '0', '0', '1', '異なる結果'],
            ['1', '1', '1', '0', '異なる結果'],
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: '発見：', bold: true },
            '制御信号を変えるだけで、',
            { text: 'リアルタイム', emphasis: true },
            'に異なる演算に切り替わります。',
          ],
        },
        {
          type: 'note',
          text: 'これがプログラムの命令に応じて異なる計算を実行する基本原理です',
        },
      ],
    },
    {
      id: 'analysis',
      instruction: 'ALUの特徴を分析しよう',
      content: [
        {
          type: 'heading',
          text: '実際のCPUでのALU',
        },
        {
          type: 'table',
          headers: ['項目', '今回のALU', '実際のCPU', '拡張方法'],
          rows: [
            ['演算種類', '2種類', '16〜64種類', '演算回路追加'],
            ['制御ビット', '1ビット', '4〜6ビット', 'デコーダ追加'],
            ['データ幅', '1ビット', '32〜64ビット', '並列化'],
            ['付加機能', 'なし', 'フラグ出力', '状態検出回路'],
          ],
        },
        {
          type: 'heading',
          text: 'マイクロアーキテクチャでの位置',
        },
        {
          type: 'text',
          text: 'CPUの命令実行サイクルでは、1)フェッチ（命令取得）、2)デコード（命令解釈）、3)実行（ALU動作）、4)ライトバック（結果保存）の順で処理されます。ALUは第3段階の主役です。',
        },
        {
          type: 'heading',
          text: 'パフォーマンス分析',
        },
        {
          type: 'text',
          text: '現代のCPUでは、複数のALUを並列配置し、異なる演算を同時実行できます。また、パイプライン処理により、複数の命令のALU段階を重複実行して高速化しています。',
        },
        {
          type: 'heading',
          text: '確率的な視点',
        },
        {
          type: 'text',
          text: 'ランダムな入力に対して、AND演算で出力が1になる確率は25%（11のみ）、XOR演算では50%（01と10）です。実際のプログラムでは加算が最頻出で、論理演算はビット操作で多用されます。',
        },
        {
          type: 'note',
          text: 'ALUの設計思想は「全ての演算を並列実行し、必要な結果だけを選択」です',
        },
      ],
    },
    {
      id: 'applications',
      instruction: 'ALUの実用例',
      content: [
        {
          type: 'heading',
          text: '実世界での活用',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'プログラムの算術演算：変数の加算、減算、比較',
            'ビット操作：フラグ設定、マスク処理、暗号化',
            'グラフィックス：ピクセル演算、色計算',
            'AI処理：行列演算、ニューラルネットワーク',
            '信号処理：フィルタリング、圧縮、変換',
          ],
        },
        {
          type: 'heading',
          text: '身近な製品での使用例',
        },
        {
          type: 'text',
          text: 'スマートフォンのカメラアプリ（画像フィルタ）、ゲーム機のリアルタイム描画、音楽プレーヤーの音質調整、GPSナビの経路計算など、計算が必要なあらゆる機能でALUが働いています。',
        },
        {
          type: 'note',
          text: 'AIブーム以降、ALUの並列処理能力がますます重要になっています',
        },
      ],
    },
    {
      id: 'summary',
      instruction: 'ALU基礎をマスター',
      content: [
        {
          type: 'heading',
          text: 'ALUの要点',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '複数の演算回路を並列配置',
            '制御信号で演算を選択',
            'マルチプレクサで結果を出力',
            'CPUの命令実行の中核を担当',
          ],
        },
        {
          type: 'quiz',
          question: 'ALUで演算を切り替える仕組みは？',
          options: [
            '配線を物理的に変更',
            '制御信号でマルチプレクサを操作',
            '演算回路を交換',
            '電圧を変更',
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
            'で、CPUの作業用メモリとなるデータ保持回路を学びます。',
            'ALUと組み合わせて本格的なプロセッサの基礎を完成させます。',
          ],
        },
        {
          type: 'note',
          text: 'ALUの理解で、コンピュータの「計算力」の源が分かりました',
        },
      ],
    },
  ],
};
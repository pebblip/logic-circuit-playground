import type { StructuredLesson } from '../../../../types/lesson-content';
import { TERMS } from '../terms';

export const registerStructuredLesson: StructuredLesson = {
  id: 'register',
  title: 'レジスタ - 複数ビットの記憶装置',
  description: '複数のビットを同時に記憶・転送できる回路を作ります',
  objective:
    '複数D-FFの並列配置による同期記憶システムを構築し、CPUの高速メモリ機構の基礎を習得する',
  category: '順序回路',
  lessonType: 'build',
  difficulty: 'advanced',
  prerequisites: ['d-flip-flop'],
  estimatedMinutes: 15,
  availableGates: ['INPUT', 'OUTPUT', 'CLOCK', 'D-FF'],
  steps: [
    {
      id: 'intro',
      instruction: '複数のデータを同時に記憶する仕組み',
      content: [
        {
          type: 'heading',
          text: '身近な例で考える',
        },
        {
          type: 'text',
          text: 'スマートフォンで写真を撮影するとき、一瞬で何百万画素のデータが同時にメモリに保存されます。この「複数のデータを一度に処理する」機能は、デジタル機器の基本中の基本です。',
        },
        {
          type: 'heading',
          text: 'レジスタとは',
        },
        {
          type: 'text',
          text: '複数のD-フリップフロップを並列に配置して、複数ビットのデータを同時に記憶できるようにした装置です。CPUの中で最も高速にアクセスできるメモリとして機能します。',
        },
        {
          type: 'note',
          text: '1つのクロック信号で、すべてのビットが同時に更新される高速記憶装置です',
        },
      ],
    },
    {
      id: 'principle',
      instruction: 'レジスタの電気的仕組み',
      content: [
        {
          type: 'heading',
          text: '4ビットレジスタの構造',
        },
        {
          type: 'text',
          text: '4つのD-フリップフロップを並列に配置し、共通のクロック信号で同期動作させます。各D-FFが1ビットを担当し、合計4ビットのデータを同時に処理できます。',
        },
        {
          type: 'heading',
          text: '並列動作の利点',
        },
        {
          type: 'table',
          headers: ['方式', '4ビット転送時間', 'クロック数', '用途'],
          rows: [
            ['シリアル（1ビットずつ）', '4クロック', '4回', '通信、配線節約'],
            [
              'パラレル（4ビット同時）',
              '1クロック',
              '1回',
              'CPU内部、高速処理',
            ],
          ],
        },
        {
          type: 'heading',
          text: '同期動作の重要性',
        },
        {
          type: 'text',
          text: 'すべてのD-FFが同じクロック信号を共有することで、データの不整合を防止します。クロックの立ち上がりエッジで、全ビットが一斉に新しい値に更新されます。',
        },
        {
          type: 'note',
          text: 'CPUの動作周波数（2GHz等）は、このクロック信号の周波数を表しています',
        },
      ],
    },
    {
      id: 'circuit-build',
      instruction: '4ビットレジスタ回路を作ってみよう',
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
            'を4つ配置します。',
            'D3、D2、D1、D0（上位から下位ビット）と',
            { text: 'CLOCKゲート', emphasis: true },
            '1つです。',
          ],
        },
        {
          type: 'heading',
          text: '手順２：対象ゲートを配置',
        },
        {
          type: 'rich-text',
          elements: [
            { text: 'D-FFゲート', emphasis: true },
            'を4つ配置します。',
            '各D-FFが1ビットずつ担当し、',
            '縦に並べて配置します。',
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
            'を4つ配置します。',
            'Q3、Q2、Q1、Q0（記憶された4ビットデータ）の表示用です。',
          ],
        },
        {
          type: 'heading',
          text: '手順４：配線でつなげる',
        },
        {
          type: 'rich-text',
          elements: [
            'データ線：各INPUT（D3〜D0）を対応するD-FFのD入力に接続。',
            'クロック線：CLOCKをすべてのD-FFのCLK入力に並列接続。',
            '出力線：各D-FFのQ出力を対応するOUTPUT（Q3〜Q0）に接続。',
            '同期確認：すべてのD-FFが同じクロック信号を受信することを確認。',
          ],
        },
        {
          type: 'note',
          text: '配線のコツ：クロック線は全D-FFに分岐配線し、同期動作を確実にする',
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
          text: 'D3D2D1D0 = 1010にして、クロックが立ち上がったときの出力を予測してください。Q3Q2Q1Q0 = 1010になるはずです。その後、入力を0101に変更した場合は？',
        },
        {
          type: 'heading',
          text: '実験で確かめよう',
        },
        {
          type: 'rich-text',
          elements: [
            '1. 初期設定：すべての入力を0にして、出力も0000を確認。',
            '2. D3とD1を',
            { text: `${TERMS.DOUBLE_CLICK}`, emphasis: true },
            'してON（1010パターン）。',
            '3. クロックの立ち上がりを待って、出力が1010に変化。',
            '4. 入力を0101に変更→クロックまでは1010を保持。',
            '5. 次のクロックで出力が0101に更新。',
          ],
        },
        {
          type: 'heading',
          text: '実験結果の確認',
        },
        {
          type: 'table',
          headers: ['時刻', 'CLK', 'D3D2D1D0', 'Q3Q2Q1Q0', '動作'],
          rows: [
            ['t0', '0', '0000', '0000', '初期状態'],
            ['t1', '↑', '1010', '1010', '1010を記憶'],
            ['t2', '0', '0101', '1010', '1010を保持'],
            ['t3', '↑', '0101', '0101', '0101に更新'],
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: '発見：', bold: true },
            '4ビットすべてが',
            { text: '同時に', emphasis: true },
            '更新されます。',
            'クロック以外のタイミングでは変化しません。',
          ],
        },
        {
          type: 'note',
          text: 'これが高速データ転送の基本原理です',
        },
      ],
    },
    {
      id: 'analysis',
      instruction: 'レジスタの特徴を分析しよう',
      content: [
        {
          type: 'heading',
          text: 'CPUでのレジスタの種類',
        },
        {
          type: 'table',
          headers: ['レジスタ種類', 'ビット幅', '個数', '用途'],
          rows: [
            ['汎用レジスタ', '32/64ビット', '16〜32個', 'データ一時保存'],
            ['特殊レジスタ', '32/64ビット', '数個', 'PC、SP、フラグ'],
            ['ベクトルレジスタ', '128〜512ビット', '16〜32個', 'SIMD演算'],
            ['制御レジスタ', '32/64ビット', '多数', 'システム制御'],
          ],
        },
        {
          type: 'heading',
          text: 'メモリ階層での位置',
        },
        {
          type: 'text',
          text: 'レジスタはCPU内部にあり、メモリ階層の最上位に位置します。アクセス速度は1クロックサイクル（0.3ナノ秒@3GHz）で、キャッシュメモリ（数ナノ秒）やメインメモリ（数百ナノ秒）より桁違いに高速です。',
        },
        {
          type: 'heading',
          text: 'パフォーマンス分析',
        },
        {
          type: 'text',
          text: '64ビットレジスタは64個のD-FFで構成され、理論上64倍のデータを1クロックで処理可能。実際のCPUでは複数のレジスタを並列動作させ、スーパースケーラ実行により更なる高速化を実現しています。',
        },
        {
          type: 'heading',
          text: '確率的な視点',
        },
        {
          type: 'text',
          text: 'ランダムな4ビット入力に対して、レジスタの出力が特定のパターンになる確率は1/16（6.25%）です。プログラム実行時のレジスタ利用率は非常に高く、CPUの性能に直結します。',
        },
        {
          type: 'note',
          text: 'レジスタの数が少ないと、メモリアクセスが増加してCPU性能が低下します',
        },
      ],
    },
    {
      id: 'applications',
      instruction: 'レジスタの実用例',
      content: [
        {
          type: 'heading',
          text: '実世界での活用',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'CPU演算：変数やポインタの一時保存',
            'グラフィックス：ピクセルデータのバッファリング',
            '通信システム：パケットデータの一時保持',
            'AI処理：行列データの高速アクセス',
            'リアルタイム制御：センサーデータの瞬時保存',
          ],
        },
        {
          type: 'heading',
          text: '身近な製品での使用例',
        },
        {
          type: 'text',
          text: 'スマートフォンのカメラ処理（画像データの一時保存）、ゲーム機のリアルタイム描画（頂点座標の保持）、カーナビのGPS計算（位置データの更新）など、高速データ処理が必要なあらゆる機器でレジスタが活用されています。',
        },
        {
          type: 'note',
          text: '現代のCPUには数千個のレジスタが搭載され、並列処理を支えています',
        },
      ],
    },
    {
      id: 'summary',
      instruction: 'レジスタをマスター',
      content: [
        {
          type: 'heading',
          text: 'レジスタの要点',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '複数D-FFの並列配置で多ビット同時記憶',
            '共通クロックによる同期動作',
            'CPUの最高速メモリとして機能',
            '高速データ転送と一時保存を担当',
          ],
        },
        {
          type: 'quiz',
          question: '32ビットレジスタを構成するのに必要なD-FFの個数は？',
          options: ['8個', '16個', '32個', '64個'],
          correctIndex: 2,
        },
        {
          type: 'heading',
          text: '次回予告',
        },
        {
          type: 'rich-text',
          elements: [
            { text: 'シフトレジスタ', bold: true },
            'で、データを順次移動させる特殊なレジスタを学びます。',
            '通信やディスプレイ制御で重要な回路です。',
          ],
        },
        {
          type: 'note',
          text: 'レジスタの理解で、CPUの高速処理の秘密が分かりました',
        },
      ],
    },
  ],
};

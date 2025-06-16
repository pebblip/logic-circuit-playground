import type { StructuredLesson } from '../../../../types/lesson-content';
import { TERMS } from '../terms';

export const shiftRegisterStructuredLesson: StructuredLesson = {
  id: 'shift-register',
  title: 'シフトレジスタ - データの順次移動',
  description: 'データを順番に送り出す・受け取る回路を作ります',
  objective:
    'D-FFの連鎖によるデータシフト機構を構築し、シリアル通信とデータ転送の基礎原理を習得する',
  category: '順序回路',
  lessonType: 'build',
  difficulty: 'advanced',
  prerequisites: ['register'],
  estimatedMinutes: 15,
  availableGates: ['INPUT', 'OUTPUT', 'CLOCK', 'D-FF'],
  steps: [
    {
      id: 'intro',
      instruction: 'データを順番に移動させる仕組み',
      content: [
        {
          type: 'heading',
          text: '身近な例で考える',
        },
        {
          type: 'text',
          text: '駅のホームで電車を待つ行列を思い出してください。新しい人が後ろに並び、電車が来ると前の人から順番に乗車していきます。シフトレジスタは、このような「データの行列」を電子回路で実現したものです。',
        },
        {
          type: 'heading',
          text: 'シフトレジスタとは',
        },
        {
          type: 'text',
          text: '複数のD-フリップフロップを連鎖接続し、クロック信号に合わせてデータを1ビットずつ順次移動（シフト）させる装置です。1本の線でデータを送受信するシリアル通信の基本回路です。',
        },
        {
          type: 'note',
          text: 'USB、Wi-Fi、Bluetoothなど、現代の通信技術の基礎となる回路です',
        },
      ],
    },
    {
      id: 'principle',
      instruction: 'シフトレジスタの電気的仕組み',
      content: [
        {
          type: 'heading',
          text: '4ビットSIPOシフトレジスタの構造',
        },
        {
          type: 'text',
          text: 'SIPO（Serial Input, Parallel Output）は、1ビットずつ順番に入力されたデータを、4ビット並列で出力します。4つのD-FFを直列接続し、各段の出力が次の段の入力になります。',
        },
        {
          type: 'heading',
          text: 'データ移動の流れ',
        },
        {
          type: 'table',
          headers: ['クロック', 'シリアル入力', 'Q3', 'Q2', 'Q1', 'Q0', '動作'],
          rows: [
            ['0', '-', '0', '0', '0', '0', '初期状態'],
            ['1↑', '1', '1', '0', '0', '0', '1が左端に入力'],
            ['2↑', '0', '0', '1', '0', '0', 'データが右へシフト'],
            ['3↑', '1', '1', '0', '1', '0', '新しい1が入力'],
            ['4↑', '1', '1', '1', '0', '1', '全データがシフト'],
          ],
        },
        {
          type: 'heading',
          text: '利点と特徴',
        },
        {
          type: 'text',
          text: '配線数の削減：4ビットデータの転送に、パラレルなら4本必要な配線が、シリアルなら1本で済みます。ただし転送時間は4倍かかるため、用途に応じて使い分けます。',
        },
        {
          type: 'note',
          text: '「速度 vs 配線数」のトレードオフを解決する重要な技術です',
        },
      ],
    },
    {
      id: 'circuit-build',
      instruction: '4ビットシフトレジスタ回路を作ってみよう',
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
            'を1つ配置します（シリアル入力SI）。',
            '続いて',
            { text: 'CLOCKゲート', emphasis: true },
            'を1つ配置します。',
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
            '左から右へ横一列に並べて配置し、',
            'データが左から右へ流れる構造を作ります。',
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
            '各D-FFの出力Q3、Q2、Q1、Q0をそれぞれ表示します。',
          ],
        },
        {
          type: 'heading',
          text: '手順４：配線でつなげる',
        },
        {
          type: 'rich-text',
          elements: [
            'シリアル接続：SI→1段目D-FF→2段目D-FF→3段目D-FF→4段目D-FFと順番に接続。',
            'クロック配線：CLOCKをすべてのD-FFのCLK入力に並列接続。',
            'パラレル出力：各D-FFのQ出力を対応するOUTPUTに接続。',
            '動作確認：データが左から右へ流れる構造を確認。',
          ],
        },
        {
          type: 'note',
          text: '配線のコツ：データの流れる方向を意識して、段間接続を確実に行う',
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
          text: 'SI=1にしてクロックを1回実行した後の出力を予測してください。Q3Q2Q1Q0 = 1000になるはずです。その後SI=0にして再度クロックを実行すると？',
        },
        {
          type: 'heading',
          text: '実験で確かめよう',
        },
        {
          type: 'rich-text',
          elements: [
            '1. 初期状態：SI=0で、すべての出力が0000を確認。',
            '2. SIを',
            { text: `${TERMS.DOUBLE_CLICK}`, emphasis: true },
            'して1にし、クロック実行→1000に変化。',
            '3. SIを0に戻してクロック実行→0100に変化（1が右にシフト）。',
            '4. SIを1にしてクロック実行→1010に変化（新しい1が左端に）。',
            '5. SIを1のままクロック実行→1101に変化。',
          ],
        },
        {
          type: 'heading',
          text: '実験結果の確認',
        },
        {
          type: 'table',
          headers: ['ステップ', 'SI', 'クロック後', 'Q3Q2Q1Q0', '説明'],
          rows: [
            ['1', '1', '1回目', '1000', '最初の1が入力'],
            ['2', '0', '2回目', '0100', '1が右にシフト'],
            ['3', '1', '3回目', '1010', '新しい1が入力'],
            ['4', '1', '4回目', '1101', '連続入力'],
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: '発見：', bold: true },
            'データが',
            { text: 'ベルトコンベア', emphasis: true },
            'のように左から右へ順番に移動します。',
          ],
        },
        {
          type: 'note',
          text: 'これがシリアル通信でデータを受信する基本原理です',
        },
      ],
    },
    {
      id: 'analysis',
      instruction: 'シフトレジスタの特徴を分析しよう',
      content: [
        {
          type: 'heading',
          text: 'シリアル vs パラレル通信',
        },
        {
          type: 'table',
          headers: ['項目', 'シリアル', 'パラレル', '用途'],
          rows: [
            ['配線数', '1本（+クロック）', 'データ幅分', 'シリアル有利'],
            ['転送速度', '1ビット/クロック', '全ビット同時', 'パラレル有利'],
            ['距離耐性', '強い', '弱い（スキュー）', 'シリアル有利'],
            ['コスト', '安い', '高い', 'シリアル有利'],
          ],
        },
        {
          type: 'heading',
          text: 'シフトレジスタの種類',
        },
        {
          type: 'text',
          text: 'SISO（Serial In, Serial Out）：シリアル入出力、遅延回路として使用。SIPO（Serial In, Parallel Out）：今回作成、受信回路。PISO（Parallel In, Serial Out）：送信回路。PIPO（Parallel In, Parallel Out）：通常のレジスタ。',
        },
        {
          type: 'heading',
          text: '実際の通信システム',
        },
        {
          type: 'text',
          text: 'USB 3.0は5Gbps、PCIe 4.0は16Gbpsで動作し、複数の差動ペア（シリアル線）を並列使用してパラレル並みの性能を実現。これによりシリアルの利点（配線数、距離）とパラレルの利点（速度）を両立しています。',
        },
        {
          type: 'heading',
          text: '確率的な視点',
        },
        {
          type: 'text',
          text: 'ランダムなシリアル入力に対して、4ビットレジスタの各出力が1になる確率は、定常状態で50%です。ただし、連続する値には相関があり、隣接ビットの値は入力パターンに依存します。',
        },
        {
          type: 'note',
          text: 'シフトレジスタは「時間軸での並列化」とも言えます',
        },
      ],
    },
    {
      id: 'applications',
      instruction: 'シフトレジスタの実用例',
      content: [
        {
          type: 'heading',
          text: '実世界での活用',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'シリアル通信：USB、SPI、I2C、UARTでのデータ送受信',
            'LEDディスプレイ：大型看板のデータ転送と制御',
            'CCDカメラ：画素データの順次読み出し',
            'デジタル遅延線：信号処理でのタイミング調整',
            'スマートカード：ICカードとリーダー間の通信',
          ],
        },
        {
          type: 'heading',
          text: '身近な製品での使用例',
        },
        {
          type: 'text',
          text: 'スマートフォンの各種センサー通信（I2C、SPI）、パソコンのUSB機器、デジタルカメラの画像センサー、LEDテープやマトリクスディスプレイ、車載システムのCAN通信など、データを順次転送する場面で広く活用されています。',
        },
        {
          type: 'note',
          text: '現代のデジタル機器では、ほぼすべての内部通信にシリアル方式が採用されています',
        },
      ],
    },
    {
      id: 'summary',
      instruction: 'シフトレジスタをマスター',
      content: [
        {
          type: 'heading',
          text: 'シフトレジスタの要点',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'D-FFの連鎖でデータを順次移動',
            'シリアル入力をパラレル出力に変換',
            '配線数削減と長距離通信に有利',
            'シリアル通信システムの基本構成要素',
          ],
        },
        {
          type: 'quiz',
          question:
            '8ビットデータをシフトレジスタで完全に受信するのに必要なクロック数は？',
          options: ['1クロック', '4クロック', '8クロック', '16クロック'],
          correctIndex: 2,
        },
        {
          type: 'heading',
          text: '次回予告',
        },
        {
          type: 'rich-text',
          elements: [
            { text: 'クロック同期回路', bold: true },
            'で、複数の回路を正確なタイミングで動作させる技術を学びます。',
            'デジタルシステム全体の心臓部です。',
          ],
        },
        {
          type: 'note',
          text: 'シフトレジスタの理解で、データ通信の基本原理が分かりました',
        },
      ],
    },
  ],
};

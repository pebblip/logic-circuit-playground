import type { StructuredLesson } from '../../../../types/lesson-content';

export const shiftRegisterStructuredLesson: StructuredLesson = {
  id: 'shift-register',
  title: 'シフトレジスタ - データの行列',
  description: 'データを順番に送り出す・受け取る回路を作ります',
  difficulty: 'advanced',
  prerequisites: ['register'],
  estimatedMinutes: 25,
  availableGates: ['INPUT', 'OUTPUT', 'CLOCK', 'D-FF'],
  steps: [
    {
      id: 'intro',
      instruction: 'データを順番に流す回路を作ろう！',
      content: [
        {
          type: 'text',
          text: '工場のベルトコンベアのように、データを順番に移動させたい...',
        },
        {
          type: 'heading',
          text: '🤔 シフトレジスタとは？',
        },
        {
          type: 'text',
          text: 'データを1ビットずつ順番にシフト（移動）させるレジスタです。',
        },
        {
          type: 'note',
          text: 'シリアル通信の基本となる重要な回路です',
        },
      ],
    },
    {
      id: 'shift-types',
      instruction: 'シフトレジスタの種類',
      content: [
        {
          type: 'heading',
          text: '📊 4つの基本型',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '➡️ SISO：シリアル入力・シリアル出力',
            '📥 SIPO：シリアル入力・パラレル出力',
            '📤 PISO：パラレル入力・シリアル出力',
            '🔄 PIPO：パラレル入力・パラレル出力',
          ],
        },
        {
          type: 'heading',
          text: '🎯 今回作るもの',
        },
        {
          type: 'text',
          text: '4ビットSIPO（シリアル→パラレル変換）',
        },
      ],
    },
    {
      id: 'sipo-concept',
      instruction: 'SIPO動作の仕組み',
      content: [
        {
          type: 'heading',
          text: '🔄 データの流れ',
        },
        {
          type: 'text',
          text: '1ビットずつ入力して、4ビット同時出力：',
        },
        {
          type: 'table',
          headers: ['CLK', '入力', 'Q3', 'Q2', 'Q1', 'Q0'],
          rows: [
            ['初期', '-', '0', '0', '0', '0'],
            ['1↑', '1', '1', '0', '0', '0'],
            ['2↑', '0', '0', '1', '0', '0'],
            ['3↑', '1', '1', '0', '1', '0'],
            ['4↑', '1', '1', '1', '0', '1'],
          ],
        },
        {
          type: 'note',
          text: 'データが右から左へ流れていきます',
        },
      ],
    },
    {
      id: 'cascade-connection',
      instruction: 'カスケード接続の原理',
      content: [
        {
          type: 'heading',
          text: '🔗 D-FFの連鎖',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '各D-FFの出力が次のD-FFの入力に',
            '共通のクロックで同期',
            'データが1段ずつ進む',
            'FIFOバッファのような動作',
          ],
        },
      ],
    },
    {
      id: 'simplified-design',
      instruction: '今回の実装（3ビット版）',
      content: [
        {
          type: 'text',
          text: '基本を理解するため3ビットで構築します。',
        },
        {
          type: 'heading',
          text: '📐 構成',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '3個のD-FF（直列接続）',
            'シリアル入力（SI）',
            'パラレル出力（Q2, Q1, Q0）',
            '共通クロック',
          ],
        },
      ],
    },
    {
      id: 'place-clock',
      instruction: 'CLOCKゲートを配置',
      hint: 'シフトタイミングを制御',
      content: [
        {
          type: 'text',
          text: '全段同時にシフトします。',
        },
      ],
      action: { type: 'place-gate', gateType: 'CLOCK' },
    },
    {
      id: 'place-serial-input',
      instruction: 'シリアル入力を配置',
      hint: 'SI（Serial Input）用のINPUT',
      content: [
        {
          type: 'text',
          text: '1ビットずつデータを投入します。',
        },
      ],
      action: { type: 'place-gate', gateType: 'INPUT' },
    },
    {
      id: 'place-first-dff',
      instruction: '1段目のD-FFを配置',
      hint: '最初のビット格納用',
      content: [],
      action: { type: 'place-gate', gateType: 'D-FF' },
    },
    {
      id: 'place-second-dff',
      instruction: '2段目のD-FFを配置',
      hint: '中間ビット格納用',
      content: [],
      action: { type: 'place-gate', gateType: 'D-FF' },
    },
    {
      id: 'place-third-dff',
      instruction: '3段目のD-FFを配置',
      hint: '最終ビット格納用',
      content: [],
      action: { type: 'place-gate', gateType: 'D-FF' },
    },
    {
      id: 'place-outputs',
      instruction: 'パラレル出力を配置',
      hint: 'Q2, Q1, Q0の3つのOUTPUT',
      content: [
        {
          type: 'text',
          text: '3ビット同時に取り出せます。',
        },
      ],
      action: { type: 'place-gate', gateType: 'OUTPUT' },
    },
    {
      id: 'connect-serial-input',
      instruction: '配線：シリアル入力',
      hint: 'SIを1段目D-FFのDに接続',
      content: [],
      action: { type: 'connect-wire' },
    },
    {
      id: 'connect-cascade',
      instruction: '配線：段間接続',
      hint: '各D-FFのQを次のD-FFのDに接続',
      content: [
        {
          type: 'text',
          text: 'データのバケツリレーです。',
        },
      ],
      action: { type: 'connect-wire' },
    },
    {
      id: 'connect-clocks',
      instruction: '配線：クロック信号',
      hint: 'CLOCKを全てのD-FFのCLKに接続',
      content: [],
      action: { type: 'connect-wire' },
    },
    {
      id: 'connect-outputs',
      instruction: '配線：パラレル出力',
      hint: '各D-FFのQを対応するOUTPUTに接続',
      content: [],
      action: { type: 'connect-wire' },
    },
    {
      id: 'test-shift-1',
      instruction: 'テスト1：最初の1を入力',
      content: [
        {
          type: 'text',
          text: 'SI=1にして、CLKで100になることを確認',
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'test-shift-2',
      instruction: 'テスト2：0を入力してシフト',
      content: [
        {
          type: 'text',
          text: 'SI=0にして、CLKで010になることを確認',
        },
        {
          type: 'note',
          text: '1が右に移動しました！',
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'test-shift-3',
      instruction: 'テスト3：連続入力',
      content: [
        {
          type: 'text',
          text: '好きなパターンを入力して、シフト動作を観察',
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'serial-communication',
      instruction: '【応用】シリアル通信',
      content: [
        {
          type: 'heading',
          text: '📡 USBやUARTの基本',
        },
        {
          type: 'text',
          text: '1本の線で複数ビットを送る：',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '送信側：PISO（パラレル→シリアル）',
            '通信線：1本だけ',
            '受信側：SIPO（シリアル→パラレル）',
            '配線数を大幅削減',
          ],
        },
        {
          type: 'note',
          text: 'USB 3.0は5Gbpsでデータを送ります',
        },
      ],
    },
    {
      id: 'led-display',
      instruction: 'LEDディスプレイへの応用',
      content: [
        {
          type: 'heading',
          text: '💡 ダイナミック点灯',
        },
        {
          type: 'text',
          text: 'シフトレジスタでLEDマトリクスを制御：',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '各行のデータをシフトイン',
            '全行準備完了でラッチ',
            '同時に表示更新',
            '高速繰り返しで動画表示',
          ],
        },
      ],
    },
    {
      id: 'circular-shift',
      instruction: '循環シフトレジスタ',
      content: [
        {
          type: 'heading',
          text: '🔄 リングカウンタ',
        },
        {
          type: 'text',
          text: '最後の出力を最初の入力に接続すると...',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'データが永遠に循環',
            '1つの1が回転',
            'ジョンソンカウンタ（反転接続）',
            'パターンジェネレータ',
          ],
        },
      ],
    },
    {
      id: 'lfsr',
      instruction: 'LFSR（線形帰還シフトレジスタ）',
      content: [
        {
          type: 'heading',
          text: '🎲 疑似乱数生成',
        },
        {
          type: 'text',
          text: '特定ビットのXORを入力に戻すと：',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '長い周期の疑似乱数',
            'CRC計算',
            '暗号化の基礎',
            'パターンテスト',
          ],
        },
      ],
    },
    {
      id: 'barrel-shifter',
      instruction: 'バレルシフタ',
      content: [
        {
          type: 'heading',
          text: '⚡ 高速シフト',
        },
        {
          type: 'text',
          text: '1クロックで複数ビットシフト：',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'MUXの組み合わせ',
            '任意ビット数シフト',
            '乗除算の高速化',
            'ビット演算最適化',
          ],
        },
      ],
    },
    {
      id: 'applications',
      instruction: '【応用】シフトレジスタの活用',
      content: [
        {
          type: 'heading',
          text: '💻 実用例',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '📡 シリアル通信（USB, SPI, I2C）',
            '💡 LED看板・ディスプレイ',
            '🎵 デジタル遅延線',
            '📊 デジタルフィルタ',
            '🔐 暗号化回路',
            '📸 CCDカメラの読み出し',
          ],
        },
      ],
    },
    {
      id: 'achievement',
      instruction: '🎉 シフトレジスタマスター！',
      content: [
        {
          type: 'heading',
          text: '🏆 習得したスキル',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '✅ データの順次転送',
            '✅ シリアル⇔パラレル変換',
            '✅ タイミング制御',
            '✅ 通信回路の基礎',
          ],
        },
        {
          type: 'note',
          text: 'これでデータ転送の仕組みが理解できました！',
        },
      ],
    },
    {
      id: 'quiz',
      instruction: '理解度チェック！',
      content: [
        {
          type: 'quiz',
          question:
            '8ビットSIPOに「10110100」を入力完了するのに必要なクロック数は？',
          options: ['1クロック', '4クロック', '8クロック', '16クロック'],
          correctIndex: 2,
        },
      ],
    },
  ],
};

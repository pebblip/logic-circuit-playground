import type { StructuredLesson } from '../../../../types/lesson-content';

export const trafficLightStructuredLesson: StructuredLesson = {
  id: 'traffic-light',
  title: '信号機 - 実用的な制御回路',
  description: '3色LED信号の自動制御回路を段階的に構築します',
  difficulty: 'advanced',
  prerequisites: ['d-flip-flop', 'counter'],
  estimatedMinutes: 25,
  availableGates: ['OUTPUT', 'AND', 'OR', 'NOT', 'CLOCK', 'D-FF'],
  steps: [
    {
      id: 'intro',
      instruction: '3色信号機を作ろう！',
      content: [
        {
          type: 'text',
          text: '街角の信号機を論理回路で再現します。',
        },
        {
          type: 'heading',
          text: '今回の目標',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '赤 → 青 → 黄 → 赤の順序で自動切り替え',
            'クロック信号に同期した状態遷移',
            '3つのLED（OUTPUT）による視覚的確認',
          ],
        },
        {
          type: 'note',
          text: '2ビットカウンタ + デコーダで実現します',
        },
      ],
    },
    {
      id: 'state-design',
      instruction: '状態の設計',
      content: [
        {
          type: 'heading',
          text: '3つの状態をコード化',
        },
        {
          type: 'table',
          headers: ['状態', 'カウンタ値', '赤', '青', '黄'],
          rows: [
            ['赤信号', '00', '●', '〇', '〇'],
            ['青信号', '01', '〇', '●', '〇'],
            ['黄信号', '10', '〇', '〇', '●'],
            ['未使用', '11', '〇', '〇', '〇'],
          ],
        },
        {
          type: 'text',
          text: '2ビットカウンタ（00→01→10→00）で3つの状態を制御します。',
        },
      ],
    },
    {
      id: 'circuit-overview',
      instruction: '回路の全体構成',
      content: [
        {
          type: 'heading',
          text: '必要な部品',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'CLOCK：状態遷移のタイミング',
            '2つのD-FF：2ビットカウンタ（00→01→10→00）',
            'AND・NOT：状態デコーダ',
            '3つのOUTPUT：赤・青・黄のLED',
          ],
        },
        {
          type: 'text',
          text: 'カウンタ→デコーダ→LED制御の流れで動作します。',
        },
      ],
    },
    {
      id: 'implementation-start',
      instruction: '実装開始！',
      content: [
        {
          type: 'heading',
          text: '構築手順',
        },
        {
          type: 'text',
          text: '次の順番で回路を組み立てます：',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'クロック信号源の配置',
            '2ビットカウンタの構築',
            'デコーダ回路の作成',
            'LED出力の接続',
            '動作テスト',
          ],
        },
      ],
    },
    {
      id: 'place-clock',
      instruction: 'STEP1: CLOCKゲートを配置',
      hint: '信号切り替えのタイミング源',
      content: [
        {
          type: 'text',
          text: 'キャンバスの左上にCLOCKゲートを配置します。',
        },
        {
          type: 'note',
          text: 'このクロックが信号切り替えのペースを決めます',
        },
      ],
      action: { type: 'place-gate', gateType: 'CLOCK' },
    },
    {
      id: 'place-dff1',
      instruction: 'STEP2: 1段目D-FFを配置',
      hint: '下位ビット（Q0）用',
      content: [
        {
          type: 'text',
          text: 'CLOCKの右下に1つ目D-FFを配置します。',
        },
        {
          type: 'note',
          text: 'これがカウンタの下位ビット（Q0）になります',
        },
      ],
      action: { type: 'place-gate', gateType: 'D-FF' },
    },
    {
      id: 'place-dff2',
      instruction: 'STEP3: 2段目D-FFを配置',
      hint: '上位ビット（Q1）用',
      content: [
        {
          type: 'text',
          text: '1つ目D-FFの下に2つ目D-FFを配置します。',
        },
        {
          type: 'note',
          text: 'これがカウンタの上位ビット（Q1）になります',
        },
      ],
      action: { type: 'place-gate', gateType: 'D-FF' },
    },
    {
      id: 'place-decoder-logic',
      instruction: 'STEP4: デコーダロジックを配置',
      hint: '状態検出用のNOTとANDゲート',
      content: [
        {
          type: 'text',
          text: 'D-FFの右側にNOTゲート2個とANDゲート3個を配置します。',
        },
        {
          type: 'list',
          ordered: false,
          items: ['NOTゲート：Q0、Q1の反転用', 'ANDゲート：各状態の検出用'],
        },
      ],
      action: { type: 'place-gate', gateType: 'NOT' },
    },
    {
      id: 'place-outputs',
      instruction: 'STEP5: LED出力を配置',
      hint: '赤・青・黄の3つのOUTPUT',
      content: [
        {
          type: 'text',
          text: 'キャンバスの右端に3つのOUTPUTを縦に配置します。',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '上：赤信号（RED）',
            '中：青信号（GREEN）',
            '下：黄信号（YELLOW）',
          ],
        },
      ],
      action: { type: 'place-gate', gateType: 'OUTPUT' },
    },
    {
      id: 'connect-clock',
      instruction: 'STEP6: クロック配線',
      hint: 'CLOCKを両方のD-FFのCLKピンに接続',
      content: [
        {
          type: 'text',
          text: 'CLOCKゲートの出力を両方のD-FFのCLKピンに接続します。',
        },
        {
          type: 'note',
          text: '同時に状態遷移するための同期信号です',
        },
      ],
      action: { type: 'connect-wire' },
    },
    {
      id: 'connect-counter-logic',
      instruction: 'STEP7: カウンタロジック配線',
      hint: 'D-FFのD入力を適切に接続',
      content: [
        {
          type: 'text',
          text: '次の状態を計算する配線を行います：',
        },
        {
          type: 'list',
          ordered: false,
          items: ['1段目のD入力：Q0とQ1のNOR', '2段目のD入力：Q0の状態'],
        },
      ],
      action: { type: 'connect-wire' },
    },
    {
      id: 'connect-decoder',
      instruction: 'STEP8: デコーダ配線',
      hint: '各状態を検出してLEDに送る',
      content: [
        {
          type: 'text',
          text: '各状態を検出する配線：',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '赤（Q1=0, Q0=0）：NOT Q1 AND NOT Q0',
            '青（Q1=0, Q0=1）：NOT Q1 AND Q0',
            '黄（Q1=1, Q0=0）：Q1 AND NOT Q0',
          ],
        },
      ],
      action: { type: 'connect-wire' },
    },
    {
      id: 'connect-outputs',
      instruction: 'STEP9: LED出力配線',
      hint: 'デコーダから各LEDに接続',
      content: [
        {
          type: 'text',
          text: '各状態検出信号を対応するOUTPUTに接続します。',
        },
      ],
      action: { type: 'connect-wire' },
    },
    {
      id: 'test-sequence',
      instruction: 'STEP10: 動作テスト',
      content: [
        {
          type: 'heading',
          text: '信号切り替えテスト',
        },
        {
          type: 'text',
          text: 'CLOCKゲートを動かして、次の順序で信号が切り替わることを確認します：',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '赤信号（停止）',
            '青信号（進行）',
            '黄信号（注意）',
            '赤信号（繰り返し）',
          ],
        },
        {
          type: 'note',
          text: '各状態では1つのLEDだけが点灯し、他は消灯していることを確認',
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'mid-quiz',
      instruction: '理解度チェック',
      content: [
        {
          type: 'quiz',
          question: '信号機の状態　00」が表すのは？',
          options: ['赤信号', '青信号', '黄信号', '消灯'],
          correctIndex: 0,
        },
      ],
    },
    {
      id: 'practical-applications',
      instruction: '【応用】信号制御の世界',
      content: [
        {
          type: 'heading',
          text: '身近な制御システム',
        },
        {
          type: 'text',
          text: '今作った状態機械の原理は、様々な場所で使われています：',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '電車の自動運転システム',
            'エレベーターの制御',
            '工場の生産ライン',
            '自動販売機の状態管理',
            'スマートフォンのアプリ状態',
          ],
        },
      ],
    },
    {
      id: 'achievement',
      instruction: '信号機マスター！',
      content: [
        {
          type: 'heading',
          text: 'おめでとうございます！',
        },
        {
          type: 'text',
          text: 'あなたは以下の重要なスキルを習得しました：',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '有限状態機械の設計と実装',
            '2ビットカウンタの構築',
            '状態デコーダの作成',
            'クロック同期制御',
            '実用的なシステム設計',
          ],
        },
        {
          type: 'note',
          text: 'これで身近な制御システムの仕組みが理解できました！',
        },
      ],
    },
    {
      id: 'final-quiz',
      instruction: '最終理解度チェック',
      content: [
        {
          type: 'quiz',
          question: '信号機の状態遷移で、黄信号の次に来るのは？',
          options: ['赤信号', '青信号', '再び黄信号', '消灯'],
          correctIndex: 0,
        },
      ],
    },
  ],
};

import type { StructuredLesson } from '../../../../types/lesson-content';
import { TERMS } from '../terms';

export const clockSyncStructuredLesson: StructuredLesson = {
  id: 'clock-sync',
  title: 'クロック同期 - デジタル回路の指揮者',
  description: '複数の回路を正確なタイミングで同期動作させる技術を学びます',
  objective:
    '複数D-FFの同期制御回路の構築を通じて、デジタルシステムの時間管理技術とCPUの動作原理を習得する',
  category: '順序回路',
  lessonType: 'build',
  difficulty: 'advanced',
  prerequisites: ['shift-register'],
  estimatedMinutes: 15,
  availableGates: ['INPUT', 'OUTPUT', 'CLOCK', 'D-FF'],
  steps: [
    {
      id: 'intro',
      instruction: 'デジタル回路の時間管理システム',
      content: [
        {
          type: 'heading',
          text: '身近な例で考える',
        },
        {
          type: 'text',
          text: 'オーケストラで全ての演奏者が指揮者のタクトに合わせて同時に演奏するように、コンピュータ内部でも数百万個の回路が同じリズム（クロック）で動作しています。この統一されたタイミング制御がなければ、回路が混乱してしまいます。',
        },
        {
          type: 'heading',
          text: 'クロック同期とは',
        },
        {
          type: 'text',
          text: '複数の順序回路（D-FFなど）を共通のクロック信号で同期動作させる技術です。すべての回路が同じタイミングでデータを更新することで、システム全体の整合性と予測可能性を保ちます。',
        },
        {
          type: 'note',
          text: 'CPUの「3.5GHz」は、このクロック信号が1秒間に35億回振動することを意味します',
        },
      ],
    },
    {
      id: 'principle',
      instruction: 'クロック同期の電気的仕組み',
      content: [
        {
          type: 'heading',
          text: '同期回路の基本構造',
        },
        {
          type: 'text',
          text: '1つのクロック源（CLOCK）から複数の順序回路に同じ信号を分配し、全ての回路がクロックの立ち上がりエッジで同時にデータを取り込みます。これにより、システム全体が統一されたタイミングで動作します。',
        },
        {
          type: 'heading',
          text: '同期動作の利点',
        },
        {
          type: 'table',
          headers: ['項目', '同期回路', '非同期回路', '結果'],
          rows: [
            ['タイミング', '予測可能', '不確定', '同期有利'],
            ['ノイズ耐性', '強い', '弱い', '同期有利'],
            ['設計難易度', '簡単', '困難', '同期有利'],
            ['消費電力', '一定', '可変', '用途次第'],
          ],
        },
        {
          type: 'heading',
          text: 'クロック信号の特徴',
        },
        {
          type: 'text',
          text: 'クロック信号は規則正しく0と1を繰り返す矩形波です。重要なのは立ち上がりエッジ（0→1の瞬間）で、このタイミングでD-FFがデータを取り込み、出力を更新します。',
        },
        {
          type: 'note',
          text: '現代のCPUでは、クロック配線が最も重要な設計要素の一つです',
        },
      ],
    },
    {
      id: 'circuit-build',
      instruction: '2つのD-FFを同期制御する回路を作ってみよう',
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
            'D1（データ入力1）、D2（データ入力2）です。',
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
            'を2つ配置します。',
            '左右に並べて配置し、',
            'それぞれが独立したデータを記憶できる構造を作ります。',
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
            'Q1、Q2（記憶されたデータ）をそれぞれ表示します。',
          ],
        },
        {
          type: 'heading',
          text: '手順４：配線でつなげる',
        },
        {
          type: 'rich-text',
          elements: [
            'データ線：D1を1つ目のD-FF、D2を2つ目のD-FFのD入力に接続。',
            'クロック線：CLOCKを両方のD-FFのCLK入力に分岐して接続（重要！）。',
            '出力線：各D-FFのQ出力をそれぞれ対応するOUTPUT（Q1、Q2）に接続。',
            '同期確認：両方のD-FFが同じクロック信号を受信することを確認。',
          ],
        },
        {
          type: 'note',
          text: '配線のコツ：クロック線の分岐配線を確実に行い、同期動作を保証する',
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
          text: 'D1=1、D2=0にしてクロックを実行した後の出力を予測してください。Q1=1、Q2=0になり、さらに重要なのは、両方が同じタイミングで更新されることです。',
        },
        {
          type: 'heading',
          text: '実験で確かめよう',
        },
        {
          type: 'rich-text',
          elements: [
            '1. 初期設定：D1=0、D2=0で、出力がQ1=0、Q2=0を確認。',
            '2. D1を',
            { text: `${TERMS.DOUBLE_CLICK}`, emphasis: true },
            'して1に、D2は0のままでクロック実行→Q1=1、Q2=0に同時変化。',
            '3. D1=0、D2=1に変更してクロック実行→Q1=0、Q2=1に同時変化。',
            '4. D1=1、D2=1に変更してクロック実行→Q1=1、Q2=1に同時変化。',
          ],
        },
        {
          type: 'heading',
          text: '実験結果の確認',
        },
        {
          type: 'table',
          headers: [
            'クロック前',
            'D1',
            'D2',
            'クロック後',
            'Q1',
            'Q2',
            '同期性',
          ],
          rows: [
            ['初期', '0', '0', '1回目', '0', '0', '同時更新'],
            ['1回目', '1', '0', '2回目', '1', '0', '同時更新'],
            ['2回目', '0', '1', '3回目', '0', '1', '同時更新'],
            ['3回目', '1', '1', '4回目', '1', '1', '同時更新'],
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: '発見：', bold: true },
            'どの入力パターンでも、',
            { text: '必ず同時に', emphasis: true },
            '両方のD-FFが更新されます。',
            'これが同期動作の威力です。',
          ],
        },
        {
          type: 'note',
          text: 'この同期性により、複雑なシステムでも予測可能な動作が実現されます',
        },
      ],
    },
    {
      id: 'analysis',
      instruction: 'クロック同期の特徴を分析しよう',
      content: [
        {
          type: 'heading',
          text: '同期 vs 非同期の比較',
        },
        {
          type: 'table',
          headers: ['項目', '同期システム', '非同期システム', '実際の使用'],
          rows: [
            [
              '動作タイミング',
              '統一クロック',
              '各自のペース',
              '同期：CPU、メモリ',
            ],
            ['設計複雑さ', '単純', '複雑', '同期：大多数'],
            ['電力効率', '一定消費', '必要時のみ', '非同期：省電力機器'],
            ['信頼性', '高い', '注意必要', '同期：重要システム'],
          ],
        },
        {
          type: 'heading',
          text: 'クロック周波数の実例',
        },
        {
          type: 'text',
          text: 'CPU（3.5GHz）では、1秒間に35億回のクロックサイクルで動作し、各サイクルで膨大な数のD-FFが同期更新されます。メモリ（DDR4-3200）では3.2GHzで動作し、CPUとの同期を保ちます。',
        },
        {
          type: 'heading',
          text: '大規模システムでの課題',
        },
        {
          type: 'text',
          text: '現代のCPUには数十億個のトランジスタがあり、クロック信号を全体に均等に配布するのは大きな技術的挑戦です。クロックスキュー（到達時間のずれ）を最小限に抑える設計が重要です。',
        },
        {
          type: 'heading',
          text: '確率的な視点',
        },
        {
          type: 'text',
          text: 'ランダムな入力に対して、2つのD-FFの出力が同じになる確率は50%（00と11）です。しかし重要なのは確率ではなく、どんな入力でも必ず同時に更新される同期性です。',
        },
        {
          type: 'note',
          text: 'クロック同期は「予測可能性」が最大の価値です',
        },
      ],
    },
    {
      id: 'applications',
      instruction: 'クロック同期の実用例',
      content: [
        {
          type: 'heading',
          text: '実世界での活用',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'CPU命令実行：全ての演算回路が同期して動作',
            'メモリアクセス：データ読み書きのタイミング制御',
            'GPU並列処理：数千個のコアの同期実行',
            'デジタル通信：受信データのサンプリング',
            'リアルタイム制御：センサーとアクチュエータの同期',
          ],
        },
        {
          type: 'heading',
          text: '身近な製品での使用例',
        },
        {
          type: 'text',
          text: 'スマートフォンのアプリ実行（CPUの同期動作）、デジタルカメラの画像処理（並列演算の同期）、ゲーム機のリアルタイム描画、車載システムの安全制御など、高精度な処理が必要な機器すべてでクロック同期が活用されています。',
        },
        {
          type: 'note',
          text: '現代のデジタル社会は、クロック同期技術によって支えられています',
        },
      ],
    },
    {
      id: 'summary',
      instruction: 'クロック同期をマスター',
      content: [
        {
          type: 'heading',
          text: 'クロック同期の要点',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '1つのクロックで複数の回路を同期制御',
            'すべての回路が同じタイミングで更新',
            '予測可能で信頼性の高いシステム実現',
            'CPUから通信まで広範囲で不可欠な技術',
          ],
        },
        {
          type: 'quiz',
          question: 'クロック同期の最大の利点は？',
          options: [
            '消費電力の削減',
            '回路の小型化',
            '動作タイミングの予測可能性',
            '製造コストの削減',
          ],
          correctIndex: 2,
        },
        {
          type: 'heading',
          text: '次回予告',
        },
        {
          type: 'rich-text',
          elements: [
            { text: 'デジタル時計回路', bold: true },
            'で、クロック同期を活用した実用的なシステムを学びます。',
            '時間を刻む回路の完成です。',
          ],
        },
        {
          type: 'note',
          text: 'クロック同期の理解で、デジタルシステムの「心臓部」が分かりました',
        },
      ],
    },
  ],
};

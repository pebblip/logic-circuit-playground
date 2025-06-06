import type { StructuredLesson } from '../../../../types/lesson-content';

export const digitalClockStructuredLesson: StructuredLesson = {
  id: 'digital-clock',
  title: 'デジタル時計 - 時を刻む回路',
  description: '秒・分・時を正確にカウントする時計回路を作ります',
  icon: '⏰',
  difficulty: 'advanced',
  prerequisites: ['traffic-light'],
  estimatedMinutes: 35,
  steps: [
    {
      id: 'intro',
      instruction: '時を刻むデジタル時計を作ろう！',
      content: [
        {
          type: 'text',
          text: 'スマホ、PC、家電...あらゆる機器に内蔵されている時計。その仕組みは？',
        },
        {
          type: 'heading',
          text: '🤔 デジタル時計の構成',
          icon: '🤔',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '💎 水晶振動子：32.768kHz',
            '➗ 分周回路：1Hz生成',
            '🔢 カウンタ：秒・分・時',
            '🔤 表示デコーダ：7セグメント',
          ],
        },
        {
          type: 'note',
          text: '32,768 = 2^15なので、15段分周で1Hzになります',
          icon: '💡',
        },
      ],
    },
    {
      id: 'time-structure',
      instruction: '時刻の構造',
      content: [
        {
          type: 'heading',
          text: '🕐 時:分:秒の関係',
          icon: '🕐',
        },
        {
          type: 'table',
          headers: ['単位', 'カウント範囲', '必要ビット数', '桁上がり'],
          rows: [
            ['秒', '0-59', '6ビット', '60で分へ'],
            ['分', '0-59', '6ビット', '60で時へ'],
            ['時', '0-23', '5ビット', '24で0へ'],
          ],
        },
        {
          type: 'text',
          text: '各単位は60進法（時は24進法）でカウントします。',
        },
      ],
    },
    {
      id: 'bcd-counter',
      instruction: 'BCDカウンタの必要性',
      content: [
        {
          type: 'heading',
          text: '🔢 BCD（2進化10進数）',
          icon: '🔢',
        },
        {
          type: 'text',
          text: '表示を簡単にするため、各桁を4ビットで表現：',
        },
        {
          type: 'table',
          headers: ['10進数', 'BCD', '通常の2進数'],
          rows: [
            ['9', '1001', '1001'],
            ['10', '0001 0000', '1010'],
            ['59', '0101 1001', '111011'],
          ],
        },
        {
          type: 'note',
          text: '各桁が独立しているので7セグメント表示が簡単！',
          icon: '🎯',
        },
      ],
    },
    {
      id: 'seconds-counter',
      instruction: '秒カウンタの設計',
      content: [
        {
          type: 'heading',
          text: '⏱️ 0-59カウンタ',
          icon: '⏱️',
        },
        {
          type: 'text',
          text: '2つのBCDカウンタを組み合わせ：',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '下位桁：0-9カウンタ（1の位）',
            '上位桁：0-5カウンタ（10の位）',
            '59の次は00にリセット',
            'キャリー信号を分へ',
          ],
        },
      ],
    },
    {
      id: 'simplified-demo',
      instruction: '今回の簡易実装',
      content: [
        {
          type: 'text',
          text: '基本原理を理解するため、簡単な秒カウンタを作ります。',
        },
        {
          type: 'heading',
          text: '📐 構成',
          icon: '📐',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'CLOCK（1Hz想定）',
            '4ビットカウンタ（0-9）',
            '7セグメントデコーダ',
            '表示用OUTPUT',
          ],
        },
      ],
    },
    {
      id: 'place-clock',
      instruction: 'CLOCKゲートを配置',
      hint: '1秒ごとのパルス',
      content: [
        {
          type: 'text',
          text: '実際は水晶振動子＋分周回路です。',
        },
      ],
      action: { type: 'place-gate', gateType: 'CLOCK' },
    },
    {
      id: 'place-counter-components',
      instruction: 'BCDカウンタ部品を配置',
      hint: 'D-FF 4個とリセット用ゲート',
      content: [
        {
          type: 'text',
          text: '0-9をカウントする10進カウンタです。',
        },
      ],
      action: { type: 'place-gate', gateType: 'D-FF' },
    },
    {
      id: 'place-decoder-logic',
      instruction: 'デコーダロジックを配置',
      hint: '7セグメント用のANDゲート群',
      content: [
        {
          type: 'text',
          text: '4ビット→7セグメント変換です。',
        },
      ],
      action: { type: 'place-gate', gateType: 'AND' },
    },
    {
      id: 'place-segment-outputs',
      instruction: 'セグメント出力を配置',
      hint: 'a-gの7つのOUTPUT',
      content: [
        {
          type: 'text',
          text: '7本のLEDで数字を形成します。',
        },
      ],
      action: { type: 'place-gate', gateType: 'OUTPUT' },
    },
    {
      id: 'connect-counter',
      instruction: '配線：BCDカウンタ',
      hint: '10でリセットする回路',
      content: [
        {
          type: 'text',
          text: '1010（10）を検出してリセットします。',
        },
      ],
      action: { type: 'connect-wire' },
    },
    {
      id: 'connect-decoder',
      instruction: '配線：7セグデコーダ',
      hint: '各数字のパターンを生成',
      content: [],
      action: { type: 'connect-wire' },
    },
    {
      id: 'test-counting',
      instruction: 'テスト：0-9カウント',
      content: [
        {
          type: 'text',
          text: 'クロックごとに0→1→...→9→0を繰り返すことを確認',
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: '7-segment-patterns',
      instruction: '【知識】7セグメント表示',
      content: [
        {
          type: 'heading',
          text: '🔤 セグメント配置',
          icon: '🔤',
        },
        {
          type: 'text',
          text: '各セグメントの位置：',
        },
        {
          type: 'note',
          text: ' a\nf b\n g\ne c\n d',
          icon: '⬜',
        },
        {
          type: 'table',
          headers: ['数字', 'a', 'b', 'c', 'd', 'e', 'f', 'g'],
          rows: [
            ['0', '1', '1', '1', '1', '1', '1', '0'],
            ['1', '0', '1', '1', '0', '0', '0', '0'],
            ['8', '1', '1', '1', '1', '1', '1', '1'],
          ],
        },
      ],
    },
    {
      id: 'complete-clock',
      instruction: '【発展】完全な時計',
      content: [
        {
          type: 'heading',
          text: '🕰️ フル機能時計',
          icon: '🕰️',
        },
        {
          type: 'text',
          text: '実際の時計に必要な機能：',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '6桁表示（HH:MM:SS）',
            '時刻設定ボタン',
            'アラーム機能',
            '12/24時間切り替え',
            'ストップウォッチ',
            'バックアップ電源',
          ],
        },
      ],
    },
    {
      id: 'rtc-chip',
      instruction: 'RTC（リアルタイムクロック）',
      content: [
        {
          type: 'heading',
          text: '💾 専用ICの利点',
          icon: '💾',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '超低消費電力',
            'コイン電池で年単位動作',
            'カレンダー機能内蔵',
            '温度補償で高精度',
            'I2C/SPIで通信',
          ],
        },
        {
          type: 'note',
          text: 'DS3231などが有名です',
          icon: '🔌',
        },
      ],
    },
    {
      id: 'atomic-clock',
      instruction: '原子時計との同期',
      content: [
        {
          type: 'heading',
          text: '📡 電波時計',
          icon: '📡',
        },
        {
          type: 'text',
          text: '標準電波で時刻を自動修正：',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'JJY（日本）：40/60kHz',
            '1日1回自動受信',
            '誤差±1秒/10万年',
            'GPS時刻も利用可能',
          ],
        },
      ],
    },
    {
      id: 'smart-features',
      instruction: 'スマート機能',
      content: [
        {
          type: 'heading',
          text: '🌐 IoT時代の時計',
          icon: '🌐',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '📱 スマホ連携',
            '🌡️ 温度・湿度表示',
            '📊 活動量計測',
            '🔔 スマート通知',
            '🔋 ワイヤレス充電',
          ],
        },
      ],
    },
    {
      id: 'applications',
      instruction: '【応用】時計回路の応用',
      content: [
        {
          type: 'heading',
          text: '💻 タイミング制御',
          icon: '💻',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '⏲️ タイマー・ストップウォッチ',
            '📸 カメラのシャッター制御',
            '🎵 音楽のテンポ生成',
            '🏭 工場の工程管理',
            '🚦 信号機のタイミング',
            '💊 服薬リマインダー',
          ],
        },
      ],
    },
    {
      id: 'precision',
      instruction: '精度の追求',
      content: [
        {
          type: 'heading',
          text: '🎯 高精度化技術',
          icon: '🎯',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '温度補償（TCXO）',
            '電圧制御（VCXO）',
            'GPS規律発振器',
            'ルビジウム発振器',
            '光格子時計（300億年に1秒）',
          ],
        },
      ],
    },
    {
      id: 'achievement',
      instruction: '🎉 デジタル時計マスター！',
      content: [
        {
          type: 'heading',
          text: '🏆 習得したスキル',
          icon: '🏆',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '✅ 多段カウンタの設計',
            '✅ BCD表現の理解',
            '✅ 7セグメント制御',
            '✅ 精密タイミング生成',
          ],
        },
        {
          type: 'note',
          text: '時を刻む仕組みが理解できました！',
          icon: '⏰',
        },
      ],
    },
    {
      id: 'quiz',
      instruction: '理解度チェック！',
      content: [
        {
          type: 'quiz',
          question: '32.768kHzの水晶を使う理由は？',
          options: [
            '音が良いから',
            '2の15乗で分周しやすいから',
            '安いから',
            '小さいから',
          ],
          correctIndex: 1,
        },
      ],
    },
  ],
};

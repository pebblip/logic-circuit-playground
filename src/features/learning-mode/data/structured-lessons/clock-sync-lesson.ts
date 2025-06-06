import type { StructuredLesson } from '../../../../types/lesson-content';

export const clockSyncStructuredLesson: StructuredLesson = {
  id: 'clock-sync',
  title: 'クロック同期 - タイミングの指揮者',
  description: 'デジタル回路の心臓部、クロック同期システムを理解します',
  icon: '⏰',
  difficulty: 'advanced',
  prerequisites: ['shift-register'],
  estimatedMinutes: 20,
  steps: [
    {
      id: 'intro',
      instruction: 'デジタル回路の時間管理を学ぼう！',
      content: [
        {
          type: 'text',
          text: 'オーケストラには指揮者が必要。デジタル回路にも「タイミングの指揮者」が必要です。',
        },
        {
          type: 'heading',
          text: '🤔 クロック同期とは？',
          icon: '🤔',
        },
        {
          type: 'text',
          text: '全ての回路が同じリズムで動作する仕組みです。',
        },
        {
          type: 'note',
          text: 'CPUの「3.5GHz」などはクロック周波数のことです',
          icon: '💻',
        },
      ],
    },
    {
      id: 'clock-signal',
      instruction: 'クロック信号の基本',
      content: [
        {
          type: 'heading',
          text: '📊 クロック波形',
          icon: '📊',
        },
        {
          type: 'text',
          text: '規則正しく0と1を繰り返す信号：',
        },
        {
          type: 'table',
          headers: ['時刻', 'CLK', '説明'],
          rows: [
            ['t0', '0', 'Low期間'],
            ['t1', '↑', '立ち上がりエッジ（重要！）'],
            ['t2', '1', 'High期間'],
            ['t3', '↓', '立ち下がりエッジ'],
            ['t4', '0', 'Low期間（1周期完了）'],
          ],
        },
        {
          type: 'note',
          text: '多くの回路は立ち上がりエッジで動作します',
          icon: '⚡',
        },
      ],
    },
    {
      id: 'synchronous-design',
      instruction: '同期設計の利点',
      content: [
        {
          type: 'heading',
          text: '✅ なぜ同期が必要？',
          icon: '✅',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '⏱️ タイミングの予測可能性',
            '🛡️ ノイズ・グリッチの除去',
            '🔧 設計・デバッグの容易さ',
            '📈 高速動作の実現',
            '🔄 確実なデータ転送',
          ],
        },
      ],
    },
    {
      id: 'timing-problems',
      instruction: 'タイミング問題の理解',
      content: [
        {
          type: 'heading',
          text: '⚠️ 非同期の危険性',
          icon: '⚠️',
        },
        {
          type: 'text',
          text: 'クロック同期がないと...',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '競合状態（レースコンディション）',
            'グリッチ（一時的な誤動作）',
            'メタステーブル（不安定状態）',
            'データの取りこぼし',
          ],
        },
        {
          type: 'note',
          text: '初期のコンピュータはこれらの問題に悩まされました',
          icon: '📜',
        },
      ],
    },
    {
      id: 'clock-distribution',
      instruction: 'クロック配信の課題',
      content: [
        {
          type: 'heading',
          text: '🌐 クロックツリー',
          icon: '🌐',
        },
        {
          type: 'text',
          text: '大規模回路では全体に均等にクロックを配る必要が：',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '配線遅延の均等化',
            'バッファによる増幅',
            'スキュー（到達時間差）の最小化',
            '消費電力の考慮',
          ],
        },
      ],
    },
    {
      id: 'clock-demo',
      instruction: '同期動作の実演',
      content: [
        {
          type: 'text',
          text: '複数のD-FFを同じクロックで動かしてみましょう。',
        },
        {
          type: 'heading',
          text: '🎯 実験内容',
          icon: '🎯',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'CLOCKゲート1個',
            'D-FF 2個（並列配置）',
            '独立したデータ入力',
            '同時更新の確認',
          ],
        },
      ],
    },
    {
      id: 'place-clock',
      instruction: 'CLOCKゲートを配置',
      hint: '共通のタイミング源',
      content: [],
      action: { type: 'place-gate', gateType: 'CLOCK' },
    },
    {
      id: 'place-inputs',
      instruction: 'データ入力を配置',
      hint: 'D1とD2の2つのINPUT',
      content: [],
      action: { type: 'place-gate', gateType: 'INPUT' },
    },
    {
      id: 'place-dffs',
      instruction: 'D-FFを2個配置',
      hint: '並列に配置',
      content: [],
      action: { type: 'place-gate', gateType: 'D-FF' },
    },
    {
      id: 'place-outputs',
      instruction: '出力表示を配置',
      hint: 'Q1とQ2の2つのOUTPUT',
      content: [],
      action: { type: 'place-gate', gateType: 'OUTPUT' },
    },
    {
      id: 'connect-clock',
      instruction: '配線：クロック信号',
      hint: 'CLOCKを両方のD-FFに接続',
      content: [
        {
          type: 'text',
          text: '1本のクロックで2つのFFを制御します。',
        },
      ],
      action: { type: 'connect-wire' },
    },
    {
      id: 'connect-data',
      instruction: '配線：データ信号',
      hint: '各INPUTを対応するD-FFに接続',
      content: [],
      action: { type: 'connect-wire' },
    },
    {
      id: 'connect-outputs',
      instruction: '配線：出力',
      hint: '各D-FFのQをOUTPUTに接続',
      content: [],
      action: { type: 'connect-wire' },
    },
    {
      id: 'test-sync',
      instruction: 'テスト：同期更新',
      content: [
        {
          type: 'text',
          text: '異なるデータを設定し、同時に更新されることを確認',
        },
        {
          type: 'note',
          text: '両方のFFが同じタイミングで変化します',
          icon: '⏱️',
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'clock-domains',
      instruction: '【発展】クロックドメイン',
      content: [
        {
          type: 'heading',
          text: '🌍 複数クロックの世界',
          icon: '🌍',
        },
        {
          type: 'text',
          text: '現代のシステムは複数の周波数で動作：',
        },
        {
          type: 'list',
          ordered: false,
          items: ['CPU：3.5GHz', 'メモリ：2.4GHz', 'PCIe：8GHz', 'USB：480MHz'],
        },
        {
          type: 'note',
          text: 'ドメイン間の同期が重要な技術です',
          icon: '🔗',
        },
      ],
    },
    {
      id: 'clock-gating',
      instruction: 'クロックゲーティング',
      content: [
        {
          type: 'heading',
          text: '🔋 省電力技術',
          icon: '🔋',
        },
        {
          type: 'text',
          text: '使わない部分のクロックを止めて省電力：',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '動的クロック制御',
            'スリープモード実装',
            '部分的な動作停止',
            'バッテリー寿命延長',
          ],
        },
      ],
    },
    {
      id: 'pll-dll',
      instruction: 'PLL/DLL',
      content: [
        {
          type: 'heading',
          text: '🎯 クロック生成・調整',
          icon: '🎯',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'PLL：Phase Locked Loop（位相同期回路）',
            'DLL：Delay Locked Loop（遅延同期回路）',
            '周波数逓倍（×2, ×4...）',
            '位相調整・スキュー補正',
          ],
        },
      ],
    },
    {
      id: 'timing-constraints',
      instruction: 'タイミング制約',
      content: [
        {
          type: 'heading',
          text: '📏 重要なパラメータ',
          icon: '📏',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'セットアップ時間：データ確定→CLK↑',
            'ホールド時間：CLK↑→データ保持',
            'クロック周期：動作速度の限界',
            'クリティカルパス：最長遅延経路',
          ],
        },
      ],
    },
    {
      id: 'applications',
      instruction: '【応用】クロック同期の実例',
      content: [
        {
          type: 'heading',
          text: '💻 実用例',
          icon: '💻',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '🖥️ CPU：全演算の同期実行',
            '📱 スマートフォン：省電力制御',
            '🎮 GPU：並列処理の同期',
            '📡 通信機器：データサンプリング',
            '🎵 デジタルオーディオ：44.1kHz/48kHz',
            '📺 ビデオ：フレーム同期（60Hz）',
          ],
        },
      ],
    },
    {
      id: 'future',
      instruction: '同期設計の未来',
      content: [
        {
          type: 'heading',
          text: '🚀 次世代技術',
          icon: '🚀',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '非同期回路の復活（省電力）',
            'GALS：Globally Asynchronous Locally Synchronous',
            '量子コンピュータの同期',
            '光クロック配信',
          ],
        },
      ],
    },
    {
      id: 'achievement',
      instruction: '🎉 クロック同期マスター！',
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
            '✅ 同期設計の重要性',
            '✅ クロック信号の役割',
            '✅ タイミング制御',
            '✅ デジタルシステムの時間管理',
          ],
        },
        {
          type: 'note',
          text: 'これで順序回路の基礎が完成しました！',
          icon: '🎊',
        },
      ],
    },
    {
      id: 'quiz',
      instruction: '理解度チェック！',
      content: [
        {
          type: 'quiz',
          question: 'CPUが「3.5GHz」で動作するとき、1クロックの時間は？',
          options: ['3.5ナノ秒', '0.286ナノ秒', '35ナノ秒', '1マイクロ秒'],
          correctIndex: 1,
        },
      ],
    },
  ],
};

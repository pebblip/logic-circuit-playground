export const gateDocumentation = {
  AND: {
    name: 'ANDゲート',
    description: '2つの入力が両方とも1の場合のみ1を出力する論理ゲート',
    symbol: '∧',
    truthTable: [
      { inputs: [0, 0], output: 0 },
      { inputs: [0, 1], output: 0 },
      { inputs: [1, 0], output: 0 },
      { inputs: [1, 1], output: 1 }
    ],
    examples: [
      {
        title: 'セキュリティシステム',
        description: 'パスワードと指紋認証の両方が正しい場合のみドアが開く'
      },
      {
        title: '自動車のエンジン始動',
        description: 'ブレーキペダルが踏まれ、かつスタートボタンが押された時のみエンジンが始動'
      }
    ],
    tips: [
      '論理積とも呼ばれます',
      '掛け算のように考えることができます（1×1=1、それ以外は0）',
      '複数の条件をすべて満たす必要がある場合に使用します'
    ]
  },
  
  OR: {
    name: 'ORゲート',
    description: '2つの入力のうち少なくとも1つが1の場合に1を出力する論理ゲート',
    symbol: '∨',
    truthTable: [
      { inputs: [0, 0], output: 0 },
      { inputs: [0, 1], output: 1 },
      { inputs: [1, 0], output: 1 },
      { inputs: [1, 1], output: 1 }
    ],
    examples: [
      {
        title: '火災報知器',
        description: '煙センサーまたは熱センサーのどちらかが反応したらアラームが鳴る'
      },
      {
        title: 'ドアの開閉',
        description: 'ボタンを押すか、センサーが人を検知したらドアが開く'
      }
    ],
    tips: [
      '論理和とも呼ばれます',
      '足し算のように考えることができます（ただし1+1=1）',
      '複数の条件のうち1つでも満たせばよい場合に使用します'
    ]
  },
  
  NOT: {
    name: 'NOTゲート',
    description: '入力を反転させる論理ゲート（0→1、1→0）',
    symbol: '¬',
    truthTable: [
      { inputs: [0], output: 1 },
      { inputs: [1], output: 0 }
    ],
    examples: [
      {
        title: '電灯のスイッチ',
        description: 'スイッチがOFFの時に電灯がON（暗闇センサー付き常夜灯）'
      },
      {
        title: '満室表示',
        description: '駐車場に空きがない（NOT空き）時に満室ランプが点灯'
      }
    ],
    tips: [
      '否定、インバーターとも呼ばれます',
      '入力を逆転させる最も基本的なゲートです',
      '他のゲートと組み合わせてNAND、NORなどを作ることができます'
    ]
  },
  
  NAND: {
    name: 'NANDゲート',
    description: 'ANDゲートの出力を反転させたゲート（NOT AND）',
    symbol: '⊼',
    truthTable: [
      { inputs: [0, 0], output: 1 },
      { inputs: [0, 1], output: 1 },
      { inputs: [1, 0], output: 1 },
      { inputs: [1, 1], output: 0 }
    ],
    examples: [
      {
        title: '安全装置',
        description: '2つのスイッチが同時に押されていない限り機械が動作する'
      },
      {
        title: 'メモリ回路',
        description: 'コンピュータの基本的なメモリ素子の構成要素'
      }
    ],
    tips: [
      '万能ゲートと呼ばれ、NANDゲートだけで全ての論理回路を構成できます',
      'コンピュータチップの基本構成要素です',
      'ANDゲートとNOTゲートを組み合わせたものと同じです'
    ]
  },
  
  NOR: {
    name: 'NORゲート',
    description: 'ORゲートの出力を反転させたゲート（NOT OR）',
    symbol: '⊽',
    truthTable: [
      { inputs: [0, 0], output: 1 },
      { inputs: [0, 1], output: 0 },
      { inputs: [1, 0], output: 0 },
      { inputs: [1, 1], output: 0 }
    ],
    examples: [
      {
        title: '故障検出',
        description: 'どのセンサーも異常を検知していない時に正常ランプが点灯'
      },
      {
        title: '排他制御',
        description: '複数の入力が全て無効な場合のみ動作を許可'
      }
    ],
    tips: [
      'NANDゲートと同様に万能ゲートです',
      'ORゲートとNOTゲートを組み合わせたものと同じです',
      '「どちらも〜でない」という条件を表現できます'
    ]
  },
  
  XOR: {
    name: 'XORゲート',
    description: '2つの入力が異なる場合に1を出力する排他的論理和ゲート',
    symbol: '⊕',
    truthTable: [
      { inputs: [0, 0], output: 0 },
      { inputs: [0, 1], output: 1 },
      { inputs: [1, 0], output: 1 },
      { inputs: [1, 1], output: 0 }
    ],
    examples: [
      {
        title: '暗号化',
        description: 'データとキーのXOR演算で簡単な暗号化を実現'
      },
      {
        title: '比較回路',
        description: '2つの入力が異なることを検出する'
      },
      {
        title: '加算器',
        description: '2進数の足し算の基本要素（桁上がりなしの加算）'
      }
    ],
    tips: [
      '排他的論理和とも呼ばれます',
      '「どちらか一方だけ」という条件を表現します',
      '2つの入力が同じなら0、異なれば1を出力します'
    ]
  },
  
  XNOR: {
    name: 'XNORゲート',
    description: '2つの入力が同じ場合に1を出力する同値ゲート',
    symbol: '⊙',
    truthTable: [
      { inputs: [0, 0], output: 1 },
      { inputs: [0, 1], output: 0 },
      { inputs: [1, 0], output: 0 },
      { inputs: [1, 1], output: 1 }
    ],
    examples: [
      {
        title: '一致検出',
        description: '2つの信号が同じ値かどうかを判定'
      },
      {
        title: 'パリティチェック',
        description: 'データの整合性確認に使用'
      }
    ],
    tips: [
      'XORゲートの出力を反転させたものです',
      '同値ゲート、一致ゲートとも呼ばれます',
      '2つの入力が同じなら1、異なれば0を出力します'
    ]
  },
  
  BUFFER: {
    name: 'バッファゲート',
    description: '入力をそのまま出力する論理ゲート（信号の増幅・遅延用）',
    symbol: '▷',
    truthTable: [
      { inputs: [0], output: 0 },
      { inputs: [1], output: 1 }
    ],
    examples: [
      {
        title: '信号増幅',
        description: '弱くなった信号を強化して次の回路に送る'
      },
      {
        title: 'タイミング調整',
        description: '信号の到達タイミングを揃える'
      }
    ],
    tips: [
      '論理的には何もしませんが、実際の回路では重要な役割を持ちます',
      '信号の品質を保つために使用されます',
      '複数の出力に分岐する際にも使用されます'
    ]
  },
  
  SWITCH: {
    name: 'スイッチ',
    description: 'ユーザーが手動で0/1を切り替えられる入力素子',
    symbol: '⬚',
    truthTable: [
      { inputs: [], output: '0 or 1' }
    ],
    examples: [
      {
        title: '入力装置',
        description: '回路のテストや制御信号の入力に使用'
      },
      {
        title: 'デバッグ',
        description: '回路の動作確認時に任意の入力パターンを生成'
      }
    ],
    tips: [
      'クリックで0/1を切り替えられます',
      '回路の入力源として使用します',
      '複数のスイッチで様々な入力パターンを作成できます'
    ]
  },
  
  LED: {
    name: 'LED',
    description: '入力が1の時に点灯する出力素子',
    symbol: '◉',
    truthTable: [
      { inputs: [0], output: '消灯' },
      { inputs: [1], output: '点灯' }
    ],
    examples: [
      {
        title: '状態表示',
        description: '回路の出力状態を視覚的に確認'
      },
      {
        title: 'デバッグ',
        description: '回路の各部分の動作確認'
      }
    ],
    tips: [
      '1が入力されると赤く点灯します',
      '回路の出力を視覚的に確認できます',
      '複数のLEDで複雑な出力パターンを表示できます'
    ]
  },
  
  CLOCK: {
    name: 'クロック',
    description: '一定間隔で0と1を交互に出力するパルス発生器',
    symbol: '⏱',
    truthTable: [
      { inputs: [], output: '0→1→0→1...' }
    ],
    examples: [
      {
        title: 'タイミング制御',
        description: '順序回路の動作タイミングを制御'
      },
      {
        title: 'カウンタ',
        description: 'パルスを数えて数値を生成'
      },
      {
        title: 'アニメーション',
        description: 'LEDの点滅パターンを作成'
      }
    ],
    tips: [
      '自動的に0と1を切り替えます',
      '周期は設定で変更できます',
      '順序回路の心臓部として機能します'
    ]
  },
  
  'D-FF': {
    name: 'Dフリップフロップ',
    description: 'クロック信号の立ち上がりでデータ入力(D)を記憶する順序回路',
    symbol: 'D-FF',
    truthTable: [
      { inputs: ['D', 'CLK'], output: 'Q', description: 'CLK↑でQ=D' },
      { inputs: ['0', '↑'], output: '0' },
      { inputs: ['1', '↑'], output: '1' },
      { inputs: ['X', '0/1'], output: '前の値を保持' }
    ],
    examples: [
      {
        title: 'レジスタ',
        description: 'データを一時的に保存する記憶素子'
      },
      {
        title: 'シフトレジスタ',
        description: '複数接続してデータを順次転送'
      }
    ],
    tips: [
      'データラッチとも呼ばれます',
      'クロックの立ち上がりエッジでデータを取り込みます',
      'メモリの基本要素です'
    ]
  },
  
  'T-FF': {
    name: 'Tフリップフロップ',
    description: 'T入力が1の時、クロック信号で出力を反転させる順序回路',
    symbol: 'T-FF',
    truthTable: [
      { inputs: ['T', 'CLK'], output: 'Q', description: 'CLK↑でトグル動作' },
      { inputs: ['0', '↑'], output: '前の値を保持' },
      { inputs: ['1', '↑'], output: '反転' }
    ],
    examples: [
      {
        title: 'カウンタ',
        description: '2進カウンタの構成要素'
      },
      {
        title: '分周器',
        description: 'クロック周波数を半分にする'
      }
    ],
    tips: [
      'トグルフリップフロップとも呼ばれます',
      'T=1でクロックごとに出力が反転します',
      'カウンタ回路の基本要素です'
    ]
  },
  
  'JK-FF': {
    name: 'JKフリップフロップ',
    description: 'J-K入力の組み合わせで動作が変わる万能フリップフロップ',
    symbol: 'JK-FF',
    truthTable: [
      { inputs: ['J', 'K', 'CLK'], output: 'Q', description: 'CLK↑で動作' },
      { inputs: ['0', '0', '↑'], output: '前の値を保持' },
      { inputs: ['1', '0', '↑'], output: '1（セット）' },
      { inputs: ['0', '1', '↑'], output: '0（リセット）' },
      { inputs: ['1', '1', '↑'], output: '反転（トグル）' }
    ],
    examples: [
      {
        title: '汎用メモリ素子',
        description: 'セット、リセット、保持、トグルの全機能'
      },
      {
        title: '状態機械',
        description: '複雑な順序回路の構成'
      }
    ],
    tips: [
      '最も汎用的なフリップフロップです',
      'J=K=1でTフリップフロップとして動作します',
      'すべてのフリップフロップの動作を実現できます'
    ]
  },
  
  'RS-FF': {
    name: 'RSフリップフロップ',
    description: 'セット(S)とリセット(R)入力で状態を制御する基本的なラッチ',
    symbol: 'RS-FF',
    truthTable: [
      { inputs: ['S', 'R'], output: 'Q' },
      { inputs: ['0', '0'], output: '前の値を保持' },
      { inputs: ['1', '0'], output: '1（セット）' },
      { inputs: ['0', '1'], output: '0（リセット）' },
      { inputs: ['1', '1'], output: '不定（禁止）' }
    ],
    examples: [
      {
        title: '基本メモリ',
        description: '最も単純な1ビット記憶素子'
      },
      {
        title: 'デバウンス回路',
        description: 'スイッチのチャタリング除去'
      }
    ],
    tips: [
      'セット・リセットラッチとも呼ばれます',
      'S=R=1は禁止入力です',
      'NANDゲート2個で構成できます'
    ]
  }
};

// ゲートのカテゴリ分類
export const gateCategories = {
  basic: {
    name: '基本ゲート',
    gates: ['AND', 'OR', 'NOT'],
    description: '論理回路の基本となる3つのゲート'
  },
  universal: {
    name: '万能ゲート',
    gates: ['NAND', 'NOR'],
    description: 'これらのゲートだけで全ての論理回路を構成可能'
  },
  extended: {
    name: '拡張ゲート',
    gates: ['XOR', 'XNOR', 'BUFFER'],
    description: '特定の用途に便利な論理ゲート'
  },
  io: {
    name: '入出力',
    gates: ['SWITCH', 'LED', 'CLOCK'],
    description: '回路への入力と出力の表示'
  },
  sequential: {
    name: '順序回路',
    gates: ['D-FF', 'T-FF', 'JK-FF', 'RS-FF'],
    description: '状態を記憶できる回路素子'
  }
};

// 学習順序の推奨
export const learningPath = [
  { category: 'basic', reason: '論理演算の基礎を理解' },
  { category: 'io', reason: '入出力で動作を確認' },
  { category: 'universal', reason: '基本ゲートの組み合わせを学習' },
  { category: 'extended', reason: '実用的な回路に必要' },
  { category: 'sequential', reason: 'メモリやカウンタの構築' }
];

// よくある回路パターン
export const commonPatterns = {
  halfAdder: {
    name: '半加算器',
    description: '1ビットの加算（桁上がりなし）',
    gates: ['XOR', 'AND'],
    usage: 'XORで和、ANDで桁上がりを出力'
  },
  fullAdder: {
    name: '全加算器',
    description: '1ビットの加算（桁上がりあり）',
    gates: ['XOR', 'AND', 'OR'],
    usage: '2つの半加算器を組み合わせて構成'
  },
  decoder: {
    name: 'デコーダ',
    description: 'バイナリコードを個別の出力に変換',
    gates: ['AND', 'NOT'],
    usage: '入力の組み合わせで特定の出力を選択'
  },
  multiplexer: {
    name: 'マルチプレクサ',
    description: '複数の入力から1つを選択',
    gates: ['AND', 'OR', 'NOT'],
    usage: '選択信号により入力を切り替え'
  },
  counter: {
    name: 'カウンタ',
    description: 'パルスを数える順序回路',
    gates: ['T-FF', 'AND'],
    usage: 'Tフリップフロップを直列接続'
  }
};
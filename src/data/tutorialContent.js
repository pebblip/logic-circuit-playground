// チュートリアルの詳細コンテンツ

export const TUTORIAL_CONTENT = {
  // レベル1: 基本ゲート
  and_gate: {
    title: 'ANDゲート - 論理積の世界',
    sections: [
      {
        type: 'introduction',
        title: 'なぜANDゲートが重要なのか？',
        content: `
          ANDゲートは「両方の条件が満たされたときのみ動作する」という、
          私たちの日常生活でもよく使う論理を電子回路で実現します。
          
          例えば：
          • 「鍵を持っている」AND「ドアが開いている」→ 家に入れる
          • 「電源が入っている」AND「スイッチが押されている」→ 機器が動作する
          • 「ユーザー名が正しい」AND「パスワードが正しい」→ ログインできる
        `,
        animation: 'and_gate_intro'
      },
      {
        type: 'real_world',
        title: '実世界での応用',
        content: `
          ANDゲートは以下のような場面で活躍しています：
          
          1. **セキュリティシステム**
             複数の認証要素をすべて満たした場合のみアクセスを許可
          
          2. **安全装置**
             複数の安全条件がすべて満たされた場合のみ機械を動作
          
          3. **CPUの演算**
             ビット単位のAND演算でマスク処理やフラグチェック
        `,
        examples: [
          {
            name: '車のエンジン始動',
            description: 'ブレーキを踏む AND キーを回す → エンジンが始動',
            visual: 'car_engine_and'
          },
          {
            name: 'エレベーターのドア',
            description: '階に到着 AND ドアセンサーOK → ドアが開く',
            visual: 'elevator_and'
          }
        ]
      },
      {
        type: 'technical',
        title: '技術的な詳細',
        content: `
          ANDゲートの真理値表：
          
          | A | B | 出力 |
          |---|---|------|
          | 0 | 0 |  0   |
          | 0 | 1 |  0   |
          | 1 | 0 |  0   |
          | 1 | 1 |  1   |
          
          トランジスタレベルでは、2つのトランジスタを直列に接続することで実現されます。
        `,
        circuit_diagram: 'and_transistor_level'
      },
      {
        type: 'interactive',
        title: '動作を確認してみよう',
        content: '実際にANDゲートを配置して、入力を変えながら動作を確認してみましょう。',
        task: {
          instructions: [
            'ANDゲートをキャンバスに配置',
            '2つの入力（INPUT）を追加',
            '1つの出力（OUTPUT）を追加',
            '接続して動作を確認'
          ],
          success_message: '素晴らしい！ANDゲートの動作を理解できました。'
        }
      }
    ]
  },

  or_gate: {
    title: 'ORゲート - 論理和の世界',
    sections: [
      {
        type: 'introduction',
        title: 'なぜORゲートが重要なのか？',
        content: `
          ORゲートは「どちらか一つでも条件が満たされれば動作する」という論理を実現します。
          これは選択肢や代替案を扱う場面で非常に重要です。
          
          例えば：
          • 「現金を持っている」OR「クレジットカードを持っている」→ 買い物ができる
          • 「管理者権限」OR「所有者権限」→ ファイルにアクセスできる
          • 「左クリック」OR「Enterキー」→ ボタンが押される
        `,
        animation: 'or_gate_intro'
      },
      {
        type: 'real_world',
        title: '実世界での応用',
        content: `
          ORゲートの応用例：
          
          1. **アラームシステム**
             複数のセンサーのいずれかが反応したらアラームを鳴らす
          
          2. **入力デバイスの処理**
             キーボード、マウス、タッチパッドのいずれからでも入力を受け付ける
          
          3. **冗長性システム**
             複数の電源のうち1つでも生きていれば動作を継続
        `,
        examples: [
          {
            name: '自動ドア',
            description: '内側センサー OR 外側センサー → ドアが開く',
            visual: 'auto_door_or'
          },
          {
            name: '緊急停止',
            description: '停止ボタン1 OR 停止ボタン2 → 機械が停止',
            visual: 'emergency_stop_or'
          }
        ]
      },
      {
        type: 'technical',
        title: '技術的な詳細',
        content: `
          ORゲートの真理値表：
          
          | A | B | 出力 |
          |---|---|------|
          | 0 | 0 |  0   |
          | 0 | 1 |  1   |
          | 1 | 0 |  1   |
          | 1 | 1 |  1   |
          
          トランジスタレベルでは、2つのトランジスタを並列に接続することで実現されます。
        `,
        circuit_diagram: 'or_transistor_level'
      }
    ]
  },

  not_gate: {
    title: 'NOTゲート - 反転の世界',
    sections: [
      {
        type: 'introduction',
        title: 'なぜNOTゲートが重要なのか？',
        content: `
          NOTゲートは入力を反転させる最も基本的なゲートです。
          「〜でない」という否定の論理は、条件分岐や状態の切り替えに不可欠です。
          
          例えば：
          • 「電源ON」→ NOT →「電源OFF」
          • 「ドアが開いている」→ NOT →「ドアが閉じている」
          • 「許可されている」→ NOT →「禁止されている」
        `,
        animation: 'not_gate_intro'
      },
      {
        type: 'real_world',
        title: '実世界での応用',
        content: `
          NOTゲートの応用：
          
          1. **信号の反転**
             アクティブローの信号をアクティブハイに変換
          
          2. **状態の切り替え**
             トグルスイッチやフリップフロップの基礎
          
          3. **論理の否定**
             「〜でない場合」の条件判定
        `,
        examples: [
          {
            name: 'LEDの点灯制御',
            description: 'スイッチOFF(0) → NOT → LED ON(1)',
            visual: 'led_not_control'
          }
        ]
      }
    ]
  },

  // NANDゲートのチュートリアル
  nand_from_basic: {
    title: 'NANDゲートを作ろう',
    sections: [
      {
        type: 'introduction',
        title: 'NANDゲートとは？',
        content: `
          NAND（Not AND）ゲートは、ANDゲートの出力を反転させたものです。
          実は、NANDゲートは「万能ゲート」と呼ばれ、これだけで
          すべての論理回路を構築できる特別なゲートです。
          
          なぜ万能なのか？
          • 製造が簡単（トランジスタ2個で実現可能）
          • 他のすべてのゲートをNANDだけで作れる
          • 実際のICチップではNANDが基本単位として使われる
        `,
        animation: 'and_gate_intro'
      },
      {
        type: 'construction',
        title: '構築手順',
        content: `
          NANDゲートは以下の手順で作ります：
          
          1. ANDゲートで論理積を計算
          2. NOTゲートで結果を反転
          
          つまり: NAND = NOT(AND)
        `,
        steps: [
          {
            description: 'ANDゲートを配置',
            visual: 'place_and_gate',
            hint: 'まず論理積を計算します'
          },
          {
            description: 'NOTゲートを配置',
            visual: 'place_not_gate',
            hint: 'ANDの結果を反転させます'
          },
          {
            description: 'ANDの出力をNOTの入力に接続',
            visual: 'connect_and_to_not',
            hint: '出力端子から入力端子へドラッグ'
          }
        ]
      },
      {
        type: 'verification',
        title: '動作確認',
        content: `
          完成したNANDゲートの真理値表：
          
          | A | B | AND | NOT(AND) = NAND |
          |---|---|-----|-----------------|
          | 0 | 0 |  0  |        1        |
          | 0 | 1 |  0  |        1        |
          | 1 | 0 |  0  |        1        |
          | 1 | 1 |  1  |        0        |
          
          両方の入力が1のときだけ0を出力することを確認しましょう。
        `
      }
    ]
  },

  // SRラッチのチュートリアル
  sr_latch_nor: {
    title: 'SRラッチ - 記憶素子の第一歩',
    sections: [
      {
        type: 'introduction',
        title: 'なぜメモリが必要なのか？',
        content: `
          これまでの回路は入力が変わると出力も即座に変わりました。
          しかし、コンピュータには「状態を記憶する」能力が必要です。
          
          SRラッチは最も基本的な記憶素子で：
          • 1ビットの情報を保持できる
          • 電源が供給されている限り状態を維持
          • すべてのメモリの基礎となる回路
          
          S = Set（セット）: 出力を1にする
          R = Reset（リセット）: 出力を0にする
        `,
        animation: 'sr_latch_intro'
      },
      {
        type: 'concept',
        title: 'フィードバックループの魔法',
        content: `
          SRラッチの秘密は「フィードバックループ」にあります。
          出力を入力に戻すことで、回路が自分の状態を「覚えて」いられるのです。
          
          これは鏡を向かい合わせにすると無限に映像が続くのと似ています。
          一度状態が決まると、外部から変更しない限りその状態を保ち続けます。
        `,
        visual: 'feedback_loop_concept'
      },
      {
        type: 'construction',
        title: '構築手順',
        content: `
          2つのNORゲートでSRラッチを作ります：
          
          重要なポイント：
          • 各NORゲートの出力を、もう一方の入力に接続
          • これによりフィードバックループが形成される
          • S入力とR入力で状態を制御
        `,
        circuit_diagram: 'sr_latch_structure'
      },
      {
        type: 'operation',
        title: '動作の理解',
        content: `
          SRラッチの動作：
          
          | S | R | Q（出力） | 動作 |
          |---|---|-----------|------|
          | 0 | 0 | 前の状態を保持 | 記憶 |
          | 1 | 0 | 1 | セット |
          | 0 | 1 | 0 | リセット |
          | 1 | 1 | 不定 | 禁止状態 |
          
          S=1,R=1は避けるべき状態です（両方のNORが0を出力し、矛盾が生じる）。
        `,
        interactive_demo: 'sr_latch_demo'
      },
      {
        type: 'real_world',
        title: '実世界での応用',
        content: `
          SRラッチから発展した記憶素子：
          
          1. **Dフリップフロップ**
             クロック同期で動作する、より安定した記憶素子
          
          2. **レジスタ**
             複数ビットを記憶するCPUの重要な要素
          
          3. **RAM（ランダムアクセスメモリ）**
             大量のデータを記憶するコンピュータのメモリ
          
          すべての基礎にSRラッチの原理があります！
        `
      }
    ]
  },

  // 半加算器のチュートリアル
  build_half_adder: {
    title: '半加算器 - デジタル計算の第一歩',
    sections: [
      {
        type: 'introduction',
        title: 'なぜ加算器が必要なのか？',
        content: `
          コンピュータの最も基本的な仕事の一つは「計算」です。
          すべての計算は加算から始まります：
          
          • 減算 = 負の数の加算
          • 乗算 = 繰り返し加算
          • 除算 = 繰り返し減算
          
          半加算器は1ビット同士の加算を行う最も基本的な演算回路です。
        `,
        animation: 'addition_basics'
      },
      {
        type: 'concept',
        title: '2進数の加算を理解する',
        content: `
          10進数では 5 + 7 = 12 ですが、2進数では：
          
          | A | B | 和 | 桁上がり |
          |---|---|----|---------| 
          | 0 | 0 | 0  |    0    |
          | 0 | 1 | 1  |    0    |
          | 1 | 0 | 1  |    0    |
          | 1 | 1 | 0  |    1    | ← 1+1=10(2進数)
          
          1 + 1 = 10（2進数）なので、和は0、桁上がりは1になります。
        `,
        visual: 'binary_addition_explained'
      },
      {
        type: 'design',
        title: '回路設計の考え方',
        content: `
          半加算器に必要な機能：
          
          1. **和（Sum）の計算**
             • 入力が異なるとき1、同じとき0
             • これはXORゲートの動作そのもの！
          
          2. **桁上がり（Carry）の計算**
             • 両方の入力が1のときだけ1
             • これはANDゲートの動作そのもの！
          
          つまり、XORゲートとANDゲートを組み合わせれば半加算器が完成します。
        `,
        circuit_design: 'half_adder_design'
      },
      {
        type: 'application',
        title: '全加算器への発展',
        content: `
          半加算器の限界：
          • 前の桁からの桁上がりを考慮できない
          • 最下位ビットの計算にしか使えない
          
          全加算器への拡張：
          • 3つの入力（A, B, 前の桁上がり）を処理
          • 2つの半加算器を組み合わせて実現
          • 複数ビットの加算が可能に
        `,
        next_step: 'full_adder_preview'
      }
    ]
  },

  // NORゲートのチュートリアル
  nor_from_basic: {
    title: 'NORゲートを作ろう',
    sections: [
      {
        type: 'introduction', 
        title: 'NORゲートとは？',
        content: `
          NOR（Not OR）ゲートは、ORゲートの出力を反転させたものです。
          NANDゲートと同様に、NORゲートも万能ゲートの一つです。
          
          特徴：
          • すべての入力が0のときだけ1を出力
          • どれか1つでも入力が1なら0を出力
          • フリップフロップなどの記憶素子に使用
        `,
        animation: 'nor_gate_intro'
      },
      {
        type: 'construction',
        title: '構築手順',
        content: `
          NORゲートは以下の手順で作ります：
          
          1. ORゲートで論理和を計算
          2. NOTゲートで結果を反転
          
          つまり: NOR = NOT(OR)
        `,
        steps: [
          {
            description: 'ORゲートを配置',
            visual: 'place_or_gate',
            hint: 'まず論理和を計算します'
          },
          {
            description: 'NOTゲートを配置',
            visual: 'place_not_gate',
            hint: 'ORの結果を反転させます'
          },
          {
            description: 'ORの出力をNOTの入力に接続',
            visual: 'connect_or_to_not',
            hint: '出力端子から入力端子へドラッグ'
          }
        ]
      },
      {
        type: 'verification',
        title: '動作確認',
        content: `
          完成したNORゲートの真理値表：
          
          | A | B | OR | NOT(OR) = NOR |
          |---|---|----|--------------| 
          | 0 | 0 | 0  |      1       |
          | 0 | 1 | 1  |      0       |
          | 1 | 0 | 1  |      0       |
          | 1 | 1 | 1  |      0       |
          
          すべての入力が0のときだけ1を出力することを確認しましょう。
        `
      },
      {
        type: 'application',
        title: 'NORゲートの応用',
        content: `
          NORゲートの重要な応用：
          
          1. **SRラッチ**
             2つのNORゲートで基本的な記憶素子を構成
          
          2. **論理回路の簡素化**
             NORゲートだけですべての論理を実現可能
          
          3. **デコーダー回路**
             特定の入力パターンを検出する回路
        `
      }
    ]
  },

  // XORゲートのチュートリアル
  xor_from_basic: {
    title: 'XORゲートを作ろう',
    sections: [
      {
        type: 'introduction',
        title: 'XORゲートとは？',
        content: `
          XOR（排他的論理和）ゲートは、「どちらか一方だけが真」のときに真を出力します。
          
          日常での例：
          • 「コーヒー」XOR「紅茶」→ どちらか1つを選ぶ
          • 「右折」XOR「左折」→ どちらか一方向のみ
          • 「ON」XOR「OFF」→ 状態の切り替え
          
          XORは「違いを検出する」ゲートとも言えます。
        `,
        animation: 'xor_gate_intro'
      },
      {
        type: 'concept',
        title: 'XORの論理を理解する',
        content: `
          XORは以下の論理式で表現できます：
          
          A XOR B = (A AND NOT B) OR (NOT A AND B)
          
          つまり：
          • 「AがTrueでBがFalse」または
          • 「AがFalseでBがTrue」のとき
          
          結果がTrueになります。
        `,
        visual: 'xor_logic_breakdown'
      },
      {
        type: 'construction',
        title: '構築方法',
        content: `
          基本ゲートでXORを作る方法（複数あります）：
          
          方法1（標準的）:
          1. A AND (NOT B) を計算
          2. (NOT A) AND B を計算
          3. 上記2つをORで結合
          
          方法2（簡潔）:
          1. A OR B を計算
          2. A AND B を計算
          3. (A OR B) AND NOT(A AND B)
        `,
        circuit_options: 'xor_construction_methods'
      },
      {
        type: 'verification',
        title: '動作確認',
        content: `
          XORゲートの真理値表：
          
          | A | B | A XOR B |
          |---|---|---------|
          | 0 | 0 |    0    |
          | 0 | 1 |    1    |
          | 1 | 0 |    1    |
          | 1 | 1 |    0    |
          
          入力が異なるときだけ1を出力することを確認しましょう。
        `
      },
      {
        type: 'application',
        title: 'XORゲートの重要性',
        content: `
          XORゲートの応用：
          
          1. **加算器**
             半加算器の和（Sum）の計算に使用
          
          2. **パリティチェック**
             データの誤り検出に使用
          
          3. **暗号化**
             簡単な暗号化・復号化に使用
             （同じキーでXORを2回行うと元に戻る）
          
          4. **比較回路**
             2つの値が等しいかどうかの判定
        `
      }
    ]
  },

  // 万能NANDのチュートリアル
  universal_nand: {
    title: 'NANDゲートの万能性',
    sections: [
      {
        type: 'introduction',
        title: 'なぜNANDが「万能」なのか？',
        content: `
          驚くべきことに、NANDゲートだけですべての論理回路を作ることができます。
          これがNANDゲートが「万能ゲート」と呼ばれる理由です。
          
          実用的な理由：
          • トランジスタ2個で実現（最小構成）
          • 製造が簡単でコスト効率が良い
          • 実際のICチップの基本単位
          
          理論的な美しさ：
          • 1種類のゲートですべてを表現
          • 回路設計の統一性
        `,
        animation: 'nand_universal'
      },
      {
        type: 'construction',
        title: 'NOTゲートを作る',
        content: `
          NANDでNOTを作る方法：
          
          NAND(A, A) = NOT(A AND A) = NOT(A)
          
          つまり、同じ信号を両方の入力に接続すれば
          NOTゲートとして動作します。
          
          | A | NAND(A,A) |
          |---|-----------|
          | 0 |     1     |
          | 1 |     0     |
        `,
        visual: 'nand_to_not'
      },
      {
        type: 'construction',
        title: 'ANDゲートを作る',
        content: `
          NANDでANDを作る方法：
          
          AND = NOT(NAND) = NAND(NAND(A,B), NAND(A,B))
          
          NANDの出力をもう一度NANDで反転（NOT）すれば
          ANDゲートになります。
          
          手順：
          1. 1つ目のNANDでA NAND Bを計算
          2. その出力を2つ目のNANDの両入力に接続
        `,
        visual: 'nand_to_and'
      },
      {
        type: 'construction',
        title: 'ORゲートを作る',
        content: `
          NANDでORを作る方法（ド・モルガンの法則を使用）：
          
          A OR B = NOT(NOT A AND NOT B)
                 = NAND(NOT A, NOT B)
                 = NAND(NAND(A,A), NAND(B,B))
          
          手順：
          1. NAND(A,A)でNOT Aを作る
          2. NAND(B,B)でNOT Bを作る
          3. 上記2つの出力をNANDに入力
        `,
        visual: 'nand_to_or'
      },
      {
        type: 'challenge',
        title: 'チャレンジ：XORを作ってみよう',
        content: `
          NANDゲートだけでXORゲートを作ることができますか？
          
          ヒント：
          • 必要なNANDゲートは4〜5個
          • まず基本的な論理（NOT, AND, OR）を作り
          • それらを組み合わせてXORを実現
          
          または、より効率的な直接実装も可能です。
        `,
        challenge_level: 'advanced'
      },
      {
        type: 'insight',
        title: '万能性の意味',
        content: `
          NANDゲートの万能性が示すこと：
          
          1. **理論的意義**
             計算可能性の基礎
             チューリング完全性への道
          
          2. **実用的価値**
             大規模集積回路（LSI）の設計
             製造プロセスの標準化
          
          3. **哲学的示唆**
             複雑さは単純な要素の組み合わせから生まれる
             コンピュータの本質は驚くほどシンプル
        `
      }
    ]
  },

  // NANDゲートの理解
  understand_nand: {
    title: 'NANDゲートの理解',
    sections: [
      {
        type: 'introduction',
        title: 'NANDゲートの基本',
        content: `
          NAND（Not AND）ゲートは、論理回路の世界で最も重要なゲートの一つです。
          
          動作原理：
          • ANDゲートの出力を反転
          • 両方の入力が1のときだけ0を出力
          • それ以外はすべて1を出力
          
          なぜ重要なのか：
          • 製造が最も簡単（トランジスタ2個）
          • すべての論理を表現可能（万能ゲート）
          • 実際のCPUの基本構成要素
        `,
        animation: 'nand_basics'
      },
      {
        type: 'truth_table',
        title: '真理値表で理解する',
        content: `
          NANDゲートの真理値表：
          
          | A | B | A NAND B |
          |---|---|----------|
          | 0 | 0 |    1     |
          | 0 | 1 |    1     |
          | 1 | 0 |    1     |
          | 1 | 1 |    0     |
          
          覚え方：「両方1なら0、それ以外は1」
        `,
        interactive: true
      },
      {
        type: 'real_world',
        title: '実世界での使用例',
        content: `
          NANDゲートの応用：
          
          1. **フラッシュメモリ**
             NANDフラッシュは高密度記憶に使用
             SSD、USBメモリ、SDカードなど
          
          2. **プロセッサ設計**
             基本的な演算回路の構成要素
             
          3. **エラー検出回路**
             パリティチェックなどに使用
        `
      }
    ]
  },

  // SRラッチの理解
  understand_sr_latch: {
    title: 'SRラッチの理解',
    sections: [
      {
        type: 'introduction',
        title: '記憶の仕組み',
        content: `
          SRラッチは最も基本的な記憶素子です。
          電子回路が「覚える」ことができる秘密を理解しましょう。
          
          重要な概念：
          • 双安定性：2つの安定状態を持つ
          • フィードバック：出力が入力に戻る
          • 状態保持：電源がある限り記憶を保持
        `,
        animation: 'sr_latch_concept'
      },
      {
        type: 'operation',
        title: '動作モード',
        content: `
          SRラッチの4つの動作モード：
          
          1. **保持モード** (S=0, R=0)
             現在の状態を維持
          
          2. **セットモード** (S=1, R=0)
             出力Qを1にセット
          
          3. **リセットモード** (S=0, R=1)
             出力Qを0にリセット
          
          4. **禁止状態** (S=1, R=1)
             不安定な状態（使用禁止）
        `,
        interactive_demo: true
      },
      {
        type: 'timing',
        title: 'タイミングの重要性',
        content: `
          SRラッチの動作で重要なのはタイミングです：
          
          • 入力が変化してから出力が安定するまでに遅延がある
          • この遅延（伝播遅延）は数ナノ秒
          • 高速動作時は考慮が必要
          
          実際の使用では：
          • 同期式回路（クロック付き）が好まれる
          • Dフリップフロップなどに発展
        `,
        timing_diagram: true
      }
    ]
  },

  // 半加算器の理解
  half_adder: {
    title: '半加算器の理解',
    sections: [
      {
        type: 'introduction',
        title: 'デジタル加算の基礎',
        content: `
          半加算器は2進数の1ビット加算を行う基本回路です。
          コンピュータのすべての計算の出発点がここにあります。
          
          なぜ「半」加算器？
          • 2つの1ビット入力のみを扱う
          • 前の桁からの桁上がりを考慮しない
          • 最下位ビットの加算に使用
        `,
        animation: 'half_adder_intro'
      },
      {
        type: 'components',
        title: '構成要素',
        content: `
          半加算器は2つの出力を生成：
          
          1. **和（Sum）**
             • 加算結果の当該ビット
             • XORゲートで実現
             • A ⊕ B
          
          2. **桁上がり（Carry）**
             • 次の桁への繰り上がり
             • ANDゲートで実現
             • A ∧ B
        `,
        circuit_breakdown: true
      },
      {
        type: 'example',
        title: '計算例',
        content: `
          具体的な計算例：
          
          例1: 0 + 0 = 00 (2進数)
          • Sum = 0, Carry = 0
          
          例2: 0 + 1 = 01 (2進数)
          • Sum = 1, Carry = 0
          
          例3: 1 + 0 = 01 (2進数)
          • Sum = 1, Carry = 0
          
          例4: 1 + 1 = 10 (2進数)
          • Sum = 0, Carry = 1
          
          最後の例で桁上がりが発生します。
        `,
        visual_examples: true
      }
    ]
  },

  // 全加算器の理解
  full_adder: {
    title: '全加算器の理解',
    sections: [
      {
        type: 'introduction',
        title: '完全な加算器',
        content: `
          全加算器は半加算器の限界を克服し、
          前の桁からの桁上がりも考慮できる完全な1ビット加算器です。
          
          3つの入力：
          • A: 第1の加数
          • B: 第2の加数
          • Cin: 前の桁からの桁上がり
          
          2つの出力：
          • Sum: 加算結果
          • Cout: 次の桁への桁上がり
        `,
        animation: 'full_adder_intro'
      },
      {
        type: 'construction',
        title: '構築方法',
        content: `
          全加算器は2つの半加算器と1つのORゲートで構築：
          
          1. **第1の半加算器**
             A + B を計算
             Sum1とCarry1を生成
          
          2. **第2の半加算器**
             Sum1 + Cin を計算
             最終的なSumとCarry2を生成
          
          3. **ORゲート**
             Carry1 OR Carry2 = Cout
             どちらかで桁上がりが発生したら伝播
        `,
        construction_diagram: true
      },
      {
        type: 'truth_table',
        title: '8通りの入力パターン',
        content: `
          全加算器の完全な真理値表：
          
          | A | B | Cin | Sum | Cout |
          |---|---|-----|-----|------|
          | 0 | 0 |  0  |  0  |  0   |
          | 0 | 0 |  1  |  1  |  0   |
          | 0 | 1 |  0  |  1  |  0   |
          | 0 | 1 |  1  |  0  |  1   |
          | 1 | 0 |  0  |  1  |  0   |
          | 1 | 0 |  1  |  0  |  1   |
          | 1 | 1 |  0  |  0  |  1   |
          | 1 | 1 |  1  |  1  |  1   |
          
          パターン：Sum = A ⊕ B ⊕ Cin
                   Cout = AB + ACin + BCin
        `
      },
      {
        type: 'application',
        title: '複数ビット加算器への応用',
        content: `
          全加算器を連結して複数ビット加算器を構築：
          
          4ビット加算器の例：
          • 4個の全加算器を直列接続
          • 各段のCoutを次段のCinに接続
          • リップルキャリー方式と呼ばれる
          
          課題と改善：
          • 桁上がりの伝播に時間がかかる
          • 高速化のため先読みキャリー方式も存在
        `,
        multi_bit_example: true
      }
    ]
  },

  // 4ビット加算器
  build_4bit_adder: {
    title: '4ビット加算器を作る',
    sections: [
      {
        type: 'introduction',
        title: '実用的な加算器',
        content: `
          1ビットの加算から、実用的な複数ビット加算器へ。
          4ビット加算器は0〜15の数値を扱えます。
          
          設計の要点：
          • 4個の全加算器を連結
          • 桁上がりを順次伝播
          • 最下位ビットのCinは0
          
          これは「リップルキャリー加算器」と呼ばれます。
        `,
        animation: 'ripple_carry_intro'
      },
      {
        type: 'architecture',
        title: 'アーキテクチャ',
        content: `
          4ビット加算器の構成：
          
          入力：
          • A[3:0]: 4ビットの第1加数
          • B[3:0]: 4ビットの第2加数
          • Cin: 初期桁上がり（通常0）
          
          出力：
          • S[3:0]: 4ビットの和
          • Cout: 最終桁上がり
          
          内部接続：
          FA0: A[0] + B[0] + Cin → S[0], C1
          FA1: A[1] + B[1] + C1 → S[1], C2
          FA2: A[2] + B[2] + C2 → S[2], C3
          FA3: A[3] + B[3] + C3 → S[3], Cout
        `,
        block_diagram: true
      },
      {
        type: 'timing',
        title: '伝播遅延の理解',
        content: `
          リップルキャリー加算器の特徴：
          
          利点：
          • 構造が単純で理解しやすい
          • 必要なゲート数が最小
          
          欠点：
          • 桁上がりが順次伝播するため遅い
          • nビットでn段の遅延
          
          改善策：
          • キャリールックアヘッド加算器
          • 並列プレフィックス加算器
          • より複雑だが高速
        `,
        timing_analysis: true
      },
      {
        type: 'example',
        title: '計算例',
        content: `
          4ビット加算の例：
          
          例1: 5 + 3 = 8
          • A = 0101 (5)
          • B = 0011 (3)
          • S = 1000 (8)
          • Cout = 0
          
          例2: 9 + 7 = 16
          • A = 1001 (9)
          • B = 0111 (7)
          • S = 0000 (0)
          • Cout = 1 (オーバーフロー)
          
          例3: 15 + 1 = 16
          • A = 1111 (15)
          • B = 0001 (1)
          • S = 0000 (0)
          • Cout = 1
        `,
        interactive_calculator: true
      }
    ]
  },

  // 比較器
  build_comparator: {
    title: '比較器を作る',
    sections: [
      {
        type: 'introduction',
        title: '数値の比較',
        content: `
          比較器は2つの数値の大小関係を判定する重要な回路です。
          
          3つの出力：
          • A = B (等しい)
          • A > B (Aが大きい)
          • A < B (Bが大きい)
          
          用途：
          • 条件分岐の判定
          • ソートアルゴリズム
          • 優先順位の決定
        `,
        animation: 'comparator_intro'
      },
      {
        type: 'design',
        title: '1ビット比較器',
        content: `
          まず1ビット比較器から始めます：
          
          等価性の判定（A = B）：
          • XNORゲートを使用
          • A ⊙ B = (A·B) + (A'·B')
          
          大小関係：
          • A > B: A · B'
          • A < B: A' · B
          
          真理値表：
          | A | B | A=B | A>B | A<B |
          |---|---|-----|-----|-----|
          | 0 | 0 |  1  |  0  |  0  |
          | 0 | 1 |  0  |  0  |  1  |
          | 1 | 0 |  0  |  1  |  0  |
          | 1 | 1 |  1  |  0  |  0  |
        `,
        circuit_design: true
      },
      {
        type: 'extension',
        title: '複数ビット比較器',
        content: `
          複数ビット比較の方法：
          
          1. **並列比較法**
             各ビットを同時に比較
             最上位ビットから優先順位を決定
          
          2. **カスケード接続**
             1ビット比較器を連結
             上位ビットの結果を優先
          
          4ビット比較器の例：
          • 最上位ビット（MSB）から比較開始
          • 等しい場合は次のビットを比較
          • 差が見つかったら結果確定
        `,
        multi_bit_design: true
      },
      {
        type: 'optimization',
        title: '回路の最適化',
        content: `
          効率的な実装のテクニック：
          
          1. **減算による比較**
             A - B の符号で判定
             加算器を流用可能
          
          2. **ビット単位の処理**
             各ビットで生成した信号を統合
             
          3. **優先エンコーダの使用**
             最初の不一致ビットを高速検出
          
          トレードオフ：
          • 速度 vs 回路規模
          • 並列度 vs 複雑さ
        `
      }
    ]
  },

  // マルチプレクサ
  build_multiplexer: {
    title: 'マルチプレクサを作る',
    sections: [
      {
        type: 'introduction', 
        title: 'データセレクタ',
        content: `
          マルチプレクサ（MUX）は複数の入力から1つを選択する回路です。
          「データセレクタ」とも呼ばれます。
          
          基本構成（2:1 MUX）：
          • 2つのデータ入力（D0, D1）
          • 1つの選択入力（S）
          • 1つの出力（Y）
          
          動作：
          • S = 0 → Y = D0
          • S = 1 → Y = D1
        `,
        animation: 'mux_intro'
      },
      {
        type: 'design',
        title: '2:1 MUXの設計',
        content: `
          2:1マルチプレクサの論理式：
          
          Y = S'·D0 + S·D1
          
          必要なゲート：
          1. NOTゲート：Sを反転
          2. 2つのANDゲート：選択信号でゲート
          3. ORゲート：選択された信号を出力
          
          真理値表：
          | S | D0 | D1 | Y |
          |---|----|----|---|
          | 0 | 0  | X  | 0 |
          | 0 | 1  | X  | 1 |
          | 1 | X  | 0  | 0 |
          | 1 | X  | 1  | 1 |
          
          X = Don't care（無関係）
        `,
        circuit_diagram: true
      },
      {
        type: 'extension',
        title: '大規模MUX',
        content: `
          より多くの入力を扱うMUX：
          
          4:1 MUX：
          • 4つのデータ入力（D0〜D3）
          • 2つの選択入力（S1, S0）
          • 選択入力で00〜11の4通り
          
          8:1 MUX：
          • 8つのデータ入力
          • 3つの選択入力
          
          一般化：
          • 2^n個の入力にはn個の選択信号が必要
        `,
        hierarchical_design: true
      },
      {
        type: 'application',
        title: 'MUXの応用',
        content: `
          マルチプレクサの重要な応用：
          
          1. **データバス**
             複数のデータソースから選択
             CPUのレジスタ選択など
          
          2. **論理関数の実装**
             任意の論理関数をMUXで実現可能
             プログラマブルロジック
          
          3. **時分割多重**
             複数の信号を1本の線で伝送
             通信システムで使用
          
          4. **条件付き実行**
             if-then-elseのハードウェア実装
        `,
        practical_examples: true
      }
    ]
  }
};

// ヒントシステムの定義
export const HINT_SYSTEM = {
  progressive_hints: {
    nand_from_basic: [
      {
        level: 1,
        hint: 'NANDは「NOT AND」の略です。何が必要か考えてみましょう。',
        showAfterAttempts: 2
      },
      {
        level: 2,
        hint: 'ANDゲートの出力を反転させる必要があります。NOTゲートを使いましょう。',
        showAfterAttempts: 4
      },
      {
        level: 3,
        hint: '手順：1) ANDゲートを配置 2) NOTゲートを配置 3) ANDの出力をNOTの入力に接続',
        showAfterAttempts: 6,
        visual: 'nand_solution_diagram'
      }
    ],
    
    sr_latch_nor: [
      {
        level: 1,
        hint: 'SRラッチには2つのNORゲートが必要です。フィードバックがポイントです。',
        showAfterAttempts: 2
      },
      {
        level: 2,
        hint: '各NORゲートの出力を、もう一方のNORゲートの入力に接続してみましょう。',
        showAfterAttempts: 4
      },
      {
        level: 3,
        hint: 'NOR1の出力→NOR2の下側入力、NOR2の出力→NOR1の下側入力に接続します。',
        showAfterAttempts: 6,
        visual: 'sr_latch_connection_guide'
      }
    ],
    
    build_half_adder: [
      {
        level: 1,
        hint: '和はXORで、桁上がりはANDで計算できます。',
        showAfterAttempts: 2
      },
      {
        level: 2,
        hint: '両方の入力をXORゲートとANDゲートの両方に接続する必要があります。',
        showAfterAttempts: 4
      },
      {
        level: 3,
        hint: '接続：入力A,B → XORとAND、XOR出力 → 和、AND出力 → 桁上がり',
        showAfterAttempts: 6,
        visual: 'half_adder_complete'
      }
    ]
  },
  
  // 適応的ヒントシステム
  adaptive_hints: {
    analyzeUserAction: (action, context) => {
      // ユーザーの行動を分析してカスタマイズされたヒントを提供
      if (action.type === 'gate_placed' && context.expectedGate !== action.gateType) {
        return `${context.expectedGate}ゲートが必要です。${action.gateType}ではありません。`;
      }
      
      if (action.type === 'connection_failed') {
        return '接続に失敗しました。出力端子から入力端子へドラッグしてください。';
      }
      
      if (action.type === 'wrong_connection') {
        return 'この接続は正しくありません。回路図を確認してください。';
      }
    }
  }
};

// アニメーション定義
export const TUTORIAL_ANIMATIONS = {
  and_gate_intro: {
    duration: 8000,
    steps: [
      { time: 0, action: 'show_inputs', values: [0, 0] },
      { time: 1000, action: 'show_output', values: [0, 0], value: 0 },
      { time: 2500, action: 'show_inputs', values: [0, 1] },
      { time: 3500, action: 'show_output', values: [0, 1], value: 0 },
      { time: 5000, action: 'show_inputs', values: [1, 0] },
      { time: 6000, action: 'show_output', values: [1, 0], value: 0 },
      { time: 7000, action: 'show_inputs', values: [1, 1] },
      { time: 8000, action: 'show_output', values: [1, 1], value: 1, highlight: true }
    ]
  },
  
  feedback_loop_concept: {
    duration: 4000,
    steps: [
      { time: 0, action: 'show_single_nor' },
      { time: 1000, action: 'show_second_nor' },
      { time: 2000, action: 'draw_feedback_line', from: 'nor1_out', to: 'nor2_in' },
      { time: 3000, action: 'draw_feedback_line', from: 'nor2_out', to: 'nor1_in' },
      { time: 3500, action: 'pulse_feedback_loop' }
    ]
  },
  
  binary_addition_explained: {
    duration: 5000,
    steps: [
      { time: 0, action: 'show_decimal', text: '5 + 7 = 12' },
      { time: 1000, action: 'show_binary', text: '101 + 111 = ?' },
      { time: 2000, action: 'highlight_column', column: 0 },
      { time: 2500, action: 'calculate_column', result: '0', carry: '1' },
      { time: 3000, action: 'highlight_column', column: 1 },
      { time: 3500, action: 'calculate_column', result: '0', carry: '1' },
      { time: 4000, action: 'highlight_column', column: 2 },
      { time: 4500, action: 'calculate_column', result: '1', carry: '1' },
      { time: 5000, action: 'show_result', text: '1100 (12 in decimal)' }
    ]
  },
  
  nand_universal: {
    duration: 6000,
    steps: [
      { time: 0, action: 'show_nand_gate' },
      { time: 1000, action: 'show_text', text: 'NANDゲートは万能ゲート' },
      { time: 2000, action: 'transform_to_not', text: 'NOT = NAND(A, A)' },
      { time: 3500, action: 'transform_to_and', text: 'AND = NOT(NAND)' },
      { time: 5000, action: 'transform_to_or', text: 'OR = NAND(NOT A, NOT B)' },
      { time: 6000, action: 'show_conclusion', text: 'すべての論理回路を構築可能！' }
    ]
  },

  // 追加のアニメーション
  or_gate_intro: {
    duration: 8000,
    steps: [
      { time: 0, action: 'show_inputs', values: [0, 0] },
      { time: 1000, action: 'show_output', values: [0, 0], value: 0 },
      { time: 2500, action: 'show_inputs', values: [0, 1] },
      { time: 3500, action: 'show_output', values: [0, 1], value: 1, highlight: true },
      { time: 5000, action: 'show_inputs', values: [1, 0] },
      { time: 6000, action: 'show_output', values: [1, 0], value: 1, highlight: true },
      { time: 7000, action: 'show_inputs', values: [1, 1] },
      { time: 8000, action: 'show_output', values: [1, 1], value: 1, highlight: true }
    ]
  },

  not_gate_intro: {
    duration: 4000,
    steps: [
      { time: 0, action: 'show_input', value: 0 },
      { time: 1000, action: 'show_output', value: 1, highlight: true },
      { time: 2000, action: 'show_input', value: 1 },
      { time: 3000, action: 'show_output', value: 0, highlight: true },
      { time: 3500, action: 'show_text', text: '入力を反転' }
    ]
  },

  nor_gate_intro: {
    duration: 6000,
    steps: [
      { time: 0, action: 'show_inputs', values: [0, 0] },
      { time: 1000, action: 'show_output', values: [0, 0], value: 1, highlight: true },
      { time: 2000, action: 'show_inputs', values: [0, 1] },
      { time: 3000, action: 'show_output', values: [0, 1], value: 0 },
      { time: 4000, action: 'show_inputs', values: [1, 0] },
      { time: 5000, action: 'show_output', values: [1, 0], value: 0 },
      { time: 5500, action: 'show_text', text: 'すべて0のときだけ1' }
    ]
  },

  xor_gate_intro: {
    duration: 6000,
    steps: [
      { time: 0, action: 'show_inputs', values: [0, 0] },
      { time: 1000, action: 'show_output', values: [0, 0], value: 0 },
      { time: 2000, action: 'show_inputs', values: [0, 1] },
      { time: 3000, action: 'show_output', values: [0, 1], value: 1, highlight: true },
      { time: 4000, action: 'show_inputs', values: [1, 0] },
      { time: 5000, action: 'show_output', values: [1, 0], value: 1, highlight: true },
      { time: 5500, action: 'show_text', text: '入力が異なるとき1' }
    ]
  },

  sr_latch_intro: {
    duration: 6000,
    steps: [
      { time: 0, action: 'show_sr_inputs', S: 0, R: 0 },
      { time: 1000, action: 'show_state', text: '保持状態' },
      { time: 2000, action: 'show_sr_inputs', S: 1, R: 0 },
      { time: 3000, action: 'show_state', text: 'セット（Q=1）' },
      { time: 4000, action: 'show_sr_inputs', S: 0, R: 1 },
      { time: 5000, action: 'show_state', text: 'リセット（Q=0）' }
    ]
  },

  half_adder_intro: {
    duration: 5000,
    steps: [
      { time: 0, action: 'show_calculation', A: 0, B: 0 },
      { time: 1000, action: 'show_result', sum: 0, carry: 0 },
      { time: 2000, action: 'show_calculation', A: 1, B: 0 },
      { time: 3000, action: 'show_result', sum: 1, carry: 0 },
      { time: 4000, action: 'show_calculation', A: 1, B: 1 },
      { time: 5000, action: 'show_result', sum: 0, carry: 1, text: '桁上がり発生！' }
    ]
  },

  full_adder_intro: {
    duration: 6000,
    steps: [
      { time: 0, action: 'show_calculation', A: 1, B: 1, Cin: 0 },
      { time: 1500, action: 'show_result', sum: 0, carry: 1 },
      { time: 3000, action: 'show_calculation', A: 1, B: 1, Cin: 1 },
      { time: 4500, action: 'show_result', sum: 1, carry: 1 },
      { time: 5500, action: 'show_text', text: '前の桁上がりも考慮' }
    ]
  },

  ripple_carry_intro: {
    duration: 8000,
    steps: [
      { time: 0, action: 'show_4bit_inputs', A: '0101', B: '0011' },
      { time: 1000, action: 'highlight_bit', position: 0 },
      { time: 2000, action: 'calculate_bit', position: 0, result: '0', carry: '1' },
      { time: 3000, action: 'highlight_bit', position: 1 },
      { time: 4000, action: 'calculate_bit', position: 1, result: '0', carry: '1' },
      { time: 5000, action: 'highlight_bit', position: 2 },
      { time: 6000, action: 'calculate_bit', position: 2, result: '0', carry: '0' },
      { time: 7000, action: 'highlight_bit', position: 3 },
      { time: 8000, action: 'show_final_result', result: '1000' }
    ]
  },

  comparator_intro: {
    duration: 6000,
    steps: [
      { time: 0, action: 'show_comparison', A: 3, B: 5 },
      { time: 1500, action: 'show_result', less: true },
      { time: 3000, action: 'show_comparison', A: 7, B: 7 },
      { time: 4500, action: 'show_result', equal: true },
      { time: 5500, action: 'show_comparison', A: 9, B: 4 },
      { time: 6000, action: 'show_result', greater: true }
    ]
  },

  mux_intro: {
    duration: 6000,
    steps: [
      { time: 0, action: 'show_mux_inputs', D0: 'A', D1: 'B', S: 0 },
      { time: 1500, action: 'highlight_path', from: 'D0', to: 'Y' },
      { time: 2000, action: 'show_output', value: 'A' },
      { time: 3000, action: 'show_mux_inputs', D0: 'A', D1: 'B', S: 1 },
      { time: 4500, action: 'highlight_path', from: 'D1', to: 'Y' },
      { time: 5000, action: 'show_output', value: 'B' },
      { time: 5500, action: 'show_text', text: 'Sで入力を選択' }
    ]
  },

  nand_basics: {
    duration: 4000,
    steps: [
      { time: 0, action: 'show_and_gate' },
      { time: 1000, action: 'add_not_bubble' },
      { time: 2000, action: 'transform_to_nand' },
      { time: 3000, action: 'show_text', text: 'AND + NOT = NAND' }
    ]
  },

  sr_latch_concept: {
    duration: 5000,
    steps: [
      { time: 0, action: 'show_normal_gates' },
      { time: 1000, action: 'add_feedback', from: 'Q', to: 'input' },
      { time: 2000, action: 'pulse_signal' },
      { time: 3000, action: 'show_stable_state' },
      { time: 4000, action: 'show_text', text: '状態が保持される！' }
    ]
  },

  addition_basics: {
    duration: 4000,
    steps: [
      { time: 0, action: 'show_decimal', text: '7 + 5' },
      { time: 1000, action: 'show_binary', text: '0111 + 0101' },
      { time: 2000, action: 'show_carry_propagation' },
      { time: 3000, action: 'show_result', text: '1100 (12)' }
    ]
  }
};
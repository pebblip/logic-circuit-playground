// 🎓 論理回路マスターへの道 - 体系的学習カリキュラム
// 初学者から実用レベルまで、27レッスンで完全習得

export interface Lesson {
  id: string;
  title: string;
  description: string;
  objective: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  prerequisites: string[];
  category: string;
  icon: string;
  steps: LessonStep[];
  verification?: CircuitVerification;
}

export interface LessonStep {
  id: string;
  instruction: string;
  hint?: string;
  action: StepAction;
  validation?: StepValidation;
}

export type StepAction =
  | { type: 'place-gate'; gateType: string; position?: { x: number; y: number } }
  | { type: 'connect-wire'; from: string; to: string }
  | { type: 'toggle-input'; gateId: string; value: boolean }
  | { type: 'observe'; highlight?: string[] }
  | { type: 'quiz'; question: string; options: string[]; correct: number }
  | { type: 'explanation'; content: string; visual?: string };

export interface StepValidation {
  type: 'gate-placed' | 'wire-connected' | 'output-matches' | 'quiz-answered' | 'circuit-complete';
  expected?: any;
}

export interface CircuitVerification {
  inputs: { [key: string]: boolean }[];
  expectedOutputs: { [key: string]: boolean }[];
}

// 🌟 Phase 1: デジタルの世界を理解する
export const lessons: Lesson[] = [
  {
    id: 'digital-basics',
    title: 'デジタルって何？',
    description: '0と1だけで作られる魔法の世界を探検しよう！',
    objective: 'デジタル信号とアナログ信号の違いを理解し、なぜコンピュータは0と1だけを使うのかを学ぶ',
    difficulty: 'beginner',
    estimatedMinutes: 8,
    prerequisites: [],
    category: 'basics',
    icon: '🌟',
    steps: [
      {
        id: 'intro',
        instruction: 'ようこそ、デジタルの世界へ！私たちの周りにあるスマホ、パソコン、エアコンなど、すべてが0と1だけで動いています。なぜでしょうか？',
        action: { type: 'explanation', content: 'デジタル技術は「はっきりした状態」を好みます。電気のON/OFF、明るい/暗い、高い/低いなど、曖昧さがない2つの状態だけを使います。' }
      },
      {
        id: 'binary-concept',
        instruction: 'INPUTゲート（スイッチ）を配置してみましょう。これがデジタルの基本です。',
        action: { type: 'place-gate', gateType: 'INPUT' },
        validation: { type: 'gate-placed' }
      },
      {
        id: 'output-connection',
        instruction: 'OUTPUTゲート（LED）も配置して、INPUTからOUTPUTに線で接続してみましょう。',
        action: { type: 'place-gate', gateType: 'OUTPUT' },
        validation: { type: 'gate-placed' }
      },
      {
        id: 'test-digital',
        instruction: 'INPUTをクリックして、ON（1）とOFF（0）を切り替えてみてください。OUTPUTの色が変わることを確認しましょう。',
        hint: 'これがデジタル信号です！はっきりとONかOFFか、中間はありません。',
        action: { type: 'toggle-input', gateId: 'INPUT', value: true },
        validation: { type: 'output-matches', expected: { OUTPUT: true } }
      },
      {
        id: 'why-binary',
        instruction: 'なぜ0と1だけ？それは「確実」だからです。電圧が高い=1、低い=0。雑音があっても間違えにくく、確実に情報を伝えられます。',
        action: { type: 'explanation', content: 'アナログは無限の値を持ちますが、デジタルは2つだけ。シンプルだからこそ、複雑な処理も確実にできるのです。' }
      }
    ]
  },

  {
    id: 'not-gate-master',
    title: 'NOTゲート - 逆転の魔法',
    description: '真逆に変える、デジタル世界の魔法を習得しよう！',
    objective: 'NOTゲートの動作原理を理解し、なぜ「反転」が重要なのかを学ぶ',
    difficulty: 'beginner',
    estimatedMinutes: 10,
    prerequisites: ['digital-basics'],
    category: 'basics',
    icon: '🔄',
    steps: [
      {
        id: 'not-intro',
        instruction: 'NOTゲートは「反対」の魔法使いです。1を入れると0、0を入れると1に変えてしまいます。',
        action: { type: 'explanation', content: '身近な例：「電気をつけて」→「電気を消す」、「ドアを開けて」→「ドアを閉める」' }
      },
      {
        id: 'build-not-circuit',
        instruction: 'INPUT、NOT、OUTPUTの順に配置して、線で接続してみましょう。',
        action: { type: 'place-gate', gateType: 'INPUT' },
        validation: { type: 'gate-placed' }
      },
      {
        id: 'test-not-off',
        instruction: 'INPUTをOFFにして、OUTPUTを確認してください。逆転していますか？',
        action: { type: 'toggle-input', gateId: 'INPUT', value: false },
        validation: { type: 'output-matches', expected: { OUTPUT: true } }
      },
      {
        id: 'test-not-on',
        instruction: 'INPUTをONにして、今度はどうなるか確認してください。',
        action: { type: 'toggle-input', gateId: 'INPUT', value: true },
        validation: { type: 'output-matches', expected: { OUTPUT: false } }
      },
      {
        id: 'not-applications',
        instruction: 'NOTゲートの使い道は？「警報がOFFの時に安全ランプをON」「昼間でない時に街灯をON」など、条件の逆を作るのに使います。',
        action: { type: 'explanation', content: 'プログラミングの「if not」と同じ概念です！' }
      }
    ]
  },

  {
    id: 'and-gate-master',
    title: 'ANDゲート - 厳格な番人',
    description: '「すべての条件を満たした時だけ」という厳格な判断を学ぼう！',
    objective: 'ANDゲートの動作を理解し、現実世界での応用例を学ぶ',
    difficulty: 'beginner',
    estimatedMinutes: 12,
    prerequisites: ['not-gate-master'],
    category: 'basics',
    icon: '🔗',
    steps: [
      {
        id: 'and-concept',
        instruction: 'ANDゲートは厳格な番人です。「条件A AND 条件B」の両方が満たされた時だけ、通してくれます。',
        action: { type: 'explanation', content: '例：銀行の金庫「カードキー AND 暗証番号」両方正しい時だけ開く' }
      },
      {
        id: 'build-and-circuit',
        instruction: '2つのINPUT、1つのAND、1つのOUTPUTを配置して接続しましょう。',
        action: { type: 'place-gate', gateType: 'INPUT' },
        validation: { type: 'gate-placed' }
      },
      {
        id: 'test-and-combinations',
        instruction: '4つの組み合わせを試してみましょう：OFF+OFF、OFF+ON、ON+OFF、ON+ON',
        hint: 'どの組み合わせでOUTPUTがONになりますか？',
        action: { type: 'observe' }
      },
      {
        id: 'and-quiz',
        instruction: 'ANDゲートはいつOUTPUTが1になりますか？',
        action: {
          type: 'quiz',
          question: 'ANDゲートで出力が1になるのは？',
          options: ['どちらか一方が1の時', '両方が1の時', '両方が0の時', 'いつでも1'],
          correct: 1
        },
        validation: { type: 'quiz-answered' }
      },
      {
        id: 'and-real-world',
        instruction: '現実世界でのAND：車のエンジン（シートベルトANDブレーキペダル）、洗濯機（蓋が閉まっているAND電源ON）、エレベーター（ドア閉ANDボタン押下）',
        action: { type: 'explanation', content: '安全システムには必ずANDゲートの考え方が使われています！' }
      }
    ]
  },

  {
    id: 'or-gate-master',
    title: 'ORゲート - 寛容な選択肢',
    description: '「どちらか一つでもOK」という柔軟な判断を学ぼう！',
    objective: 'ORゲートの動作を理解し、ANDとの違いを明確にする',
    difficulty: 'beginner',
    estimatedMinutes: 12,
    prerequisites: ['and-gate-master'],
    category: 'basics',
    icon: '🌈',
    steps: [
      {
        id: 'or-concept',
        instruction: 'ORゲートは寛容な案内人です。「条件A OR 条件B」のどちらか一つでも満たされれば、通してくれます。',
        action: { type: 'explanation', content: '例：お店の支払い「現金 OR クレジットカード」どちらでもOK' }
      },
      {
        id: 'build-or-circuit',
        instruction: '2つのINPUT、1つのOR、1つのOUTPUTを配置して接続しましょう。',
        action: { type: 'place-gate', gateType: 'INPUT' },
        validation: { type: 'gate-placed' }
      },
      {
        id: 'or-vs-and',
        instruction: 'ANDとの違いを体感してください。同じ入力でも結果が違います！',
        hint: 'OFF+ONの組み合わせで試してみてください。ANDとORで結果が違いますか？',
        action: { type: 'observe' }
      },
      {
        id: 'or-quiz',
        instruction: 'ORゲートはいつOUTPUTが0になりますか？',
        action: {
          type: 'quiz',
          question: 'ORゲートで出力が0になるのは？',
          options: ['どちらか一方が0の時', '両方が0の時', '両方が1の時', '決して0にならない'],
          correct: 1
        },
        validation: { type: 'quiz-answered' }
      },
      {
        id: 'or-applications',
        instruction: 'ORの応用：火災報知器（煙検知OR熱検知）、自動ドア（人感センサーORボタン）、非常停止（手動ボタンOR自動センサー）',
        action: { type: 'explanation', content: 'ORは「選択肢」や「冗長性（バックアップ）」を作るのに使われます！' }
      }
    ]
  },

  {
    id: 'xor-gate-detective',
    title: 'XORゲート - 違いを見つける探偵',
    description: '「違い」を検出する特別な能力を持つゲートを学ぼう！',
    objective: 'XORゲートの特殊な動作を理解し、実用例を学ぶ',
    difficulty: 'beginner',
    estimatedMinutes: 15,
    prerequisites: ['or-gate-master'],
    category: 'basics',
    icon: '✨',
    steps: [
      {
        id: 'xor-concept',
        instruction: 'XORゲートは探偵です。「A と B が違っている時」だけ反応します。同じ時は無反応です。',
        action: { type: 'explanation', content: '「排他的OR」つまり「どちらか一方だけ」という意味です' }
      },
      {
        id: 'build-xor-circuit',
        instruction: '2つのINPUT、1つのXOR、1つのOUTPUTを配置して接続しましょう。',
        action: { type: 'place-gate', gateType: 'INPUT' },
        validation: { type: 'gate-placed' }
      },
      {
        id: 'xor-pattern',
        instruction: '4つの組み合わせを試してください：OFF+OFF、OFF+ON、ON+OFF、ON+ON。パターンに気づきましたか？',
        hint: '「違う組み合わせ」の時だけONになります！',
        action: { type: 'observe' }
      },
      {
        id: 'xor-magic',
        instruction: 'XORの魔法：同じ値同士をXORすると0、異なる値同士をXORすると1。この性質は暗号化に使われています！',
        action: { type: 'explanation', content: 'A XOR B XOR B = A という性質があります。暗号化と復号化で重要！' }
      },
      {
        id: 'xor-applications',
        instruction: 'XORの用途：パリティチェック（エラー検出）、暗号化、加算回路の桁上がり検出、パスワード保護',
        action: { type: 'explanation', content: 'XORは「違いを見つける」探偵として、様々な場面で活躍します！' }
      }
    ]
  },

  // 🔧 Phase 2: 実用的な組み合わせ回路
  {
    id: 'half-adder',
    title: '半加算器 - コンピュータの足し算デビュー',
    description: '0+0、0+1、1+0、1+1...コンピュータはどうやって足し算するの？',
    objective: '1ビット同士の加算回路を作成し、XORとANDの組み合わせを理解する',
    difficulty: 'intermediate',
    estimatedMinutes: 18,
    prerequisites: ['xor-gate-detective'],
    category: 'combinational',
    icon: '➕',
    steps: [
      {
        id: 'addition-problem',
        instruction: 'コンピュータに「1+1=？」と聞いたら何と答えるでしょう？実は「10」（2進数で2）と答えます！',
        action: { type: 'explanation', content: '2進数では：0+0=0、0+1=1、1+0=1、1+1=10（桁上がり）' }
      },
      {
        id: 'half-adder-design',
        instruction: '半加算器の設計：「答え」にはXOR、「桁上がり」にはANDを使います。なぜでしょうか？',
        action: { type: 'explanation', content: 'XOR：違う時だけ1（0+1=1、1+0=1）、AND：両方1の時だけ1（桁上がり）' }
      },
      {
        id: 'place-inputs',
        instruction: 'まず2つのINPUTを配置しましょう。これが足し算する2つの数（AとB）になります。',
        action: { type: 'place-gate', gateType: 'INPUT' },
        hint: '左側に縦に並べると見やすくなります'
      },
      {
        id: 'place-xor',
        instruction: 'XORゲートを配置します。これは「和（答え）」を計算します。',
        action: { type: 'place-gate', gateType: 'XOR' },
        hint: '中央に配置すると接続しやすいです'
      },
      {
        id: 'connect-xor',
        instruction: '両方のINPUTからXORゲートに線を接続しましょう。上のINPUT→XORの上側、下のINPUT→XORの下側です。',
        action: { type: 'connect-wires' },
        hint: 'ピンの近くをクリックして線を引きます'
      },
      {
        id: 'place-and',
        instruction: 'ANDゲートを配置します。これは「桁上がり」を検出します。',
        action: { type: 'place-gate', gateType: 'AND' },
        hint: 'XORゲートの上か下に配置すると見やすいです'
      },
      {
        id: 'connect-and',
        instruction: '同じINPUTからANDゲートにも線を接続しましょう。上のINPUT→ANDの上側、下のINPUT→ANDの下側です。',
        action: { type: 'connect-wires' },
        hint: '1つのINPUTから複数の線を引けます'
      },
      {
        id: 'place-outputs',
        instruction: '2つのOUTPUTを配置します。上が「和（Sum）」、下が「桁上がり（Carry）」です。',
        action: { type: 'place-gate', gateType: 'OUTPUT' },
        hint: '右側に縦に並べます'
      },
      {
        id: 'connect-outputs',
        instruction: 'XORの出力を上のOUTPUT（和）に、ANDの出力を下のOUTPUT（桁上がり）に接続しましょう。',
        action: { type: 'connect-wires' },
        validation: { type: 'circuit-complete' }
      },
      {
        id: 'test-preparation',
        instruction: 'では、作った半加算器をテストしましょう！INPUTゲートをダブルクリックすると値を切り替えられます。緑になると1、グレーのままなら0です。',
        action: { type: 'explanation', content: 'ダブルクリックで切り替え：グレー（0）⇔ 緑（1）' }
      },
      {
        id: 'test-0-plus-0',
        instruction: '【テスト1】まず現在の状態を確認しましょう。今、両方のINPUTはグレー（0）のはずです。これは0+0を計算している状態です。',
        action: { type: 'observe' },
        hint: 'OUTPUTもグレーなら正常です'
      },
      {
        id: 'verify-0-plus-0',
        instruction: '【答え合わせ】両方のOUTPUTがグレーですね？これで0+0=0（桁上がりなし）が確認できました！',
        action: { type: 'observe' }
      },
      {
        id: 'test-0-plus-1',
        instruction: '【テスト2】0+1を計算してみましょう。下のINPUTをダブルクリックして緑（1）にしてください。',
        action: { type: 'observe' },
        hint: '上はグレー（0）のまま、下だけ緑（1）に'
      },
      {
        id: 'verify-0-plus-1',
        instruction: '【答え合わせ】上のOUTPUT（和）が緑になり、下のOUTPUT（桁上がり）はグレーのままですか？0+1=1が計算できています！',
        action: { type: 'observe' }
      },
      {
        id: 'test-1-plus-0',
        instruction: '【テスト3】今度は1+0を試します。上のINPUTを緑（1）に、下のINPUTをグレー（0）に戻してください。',
        action: { type: 'observe' },
        hint: '下のINPUTをもう一度ダブルクリックでグレーに戻せます'
      },
      {
        id: 'test-1-plus-1',
        instruction: '【テスト4】最後に1+1を計算します。両方のINPUTをダブルクリックして緑（1）にしてください。',
        action: { type: 'observe' },
        hint: '両方とも緑にします'
      },
      {
        id: 'verify-1-plus-1',
        instruction: '【答え合わせ】おや？上のOUTPUT（和）がグレーに戻り、下のOUTPUT（桁上がり）が緑になりましたね！これが1+1=10（2進数）です！',
        action: { type: 'observe' }
      },
      {
        id: 'understanding-xor',
        instruction: '理解度チェック：XORゲートはなぜ「和」の計算に適しているのでしょうか？',
        action: {
          type: 'quiz',
          question: 'XORゲートが半加算器の「和」に使われる理由は？',
          options: [
            '両方の入力が同じ時に1を出力するから',
            '両方の入力が違う時だけ1を出力するから',
            '常に1を出力するから',
            '見た目がかっこいいから'
          ],
          correct: 1
        }
      },
      {
        id: 'understanding-and',
        instruction: '理解度チェック：ANDゲートはなぜ「桁上がり」の検出に適しているのでしょうか？',
        action: {
          type: 'quiz',
          question: 'ANDゲートが半加算器の「桁上がり」に使われる理由は？',
          options: [
            'どちらかの入力が1の時に1を出力するから',
            '入力が違う時に1を出力するから',
            '両方の入力が1の時だけ1を出力するから',
            '計算が速いから'
          ],
          correct: 2
        }
      },
      {
        id: 'circuit-insight',
        instruction: '💡回路の洞察：XORは「異なる値を足す」、ANDは「1+1の時の桁上がり」を検出します。この2つの組み合わせが半加算器の本質です！',
        action: { type: 'explanation', content: '実際のCPUでも、この半加算器が基本単位として使われています' }
      },
      {
        id: 'half-adder-limitation',
        instruction: '半加算器の限界：前の桁からの桁上がりを処理できません。これを解決するのが「全加算器」です！',
        action: { type: 'explanation', content: '2+3のような多桁計算には、全加算器が必要になります' }
      }
    ]
  },

  {
    id: 'full-adder',
    title: '全加算器 - 本格的な計算エンジン',
    description: '前の桁からの桁上がりも処理できる、真の加算器を作ろう！',
    objective: '3入力の全加算器を構築し、多桁演算の基礎を理解する',
    difficulty: 'intermediate',
    estimatedMinutes: 22,
    prerequisites: ['half-adder'],
    category: 'combinational',
    icon: '🔢',
    steps: [
      {
        id: 'full-adder-need',
        instruction: '半加算器では「前の桁からの桁上がり」を処理できませんでした。全加算器は3つの入力（A、B、前の桁上がり）を処理します。',
        action: { type: 'explanation', content: '例：123 + 456 の計算では、各桁で前の桁からの桁上がりを考慮する必要があります' }
      },
      {
        id: 'full-adder-inputs',
        instruction: '3つのINPUTを配置しましょう：A（1桁目）、B（1桁目）、Cin（前の桁からの桁上がり）',
        action: { type: 'place-gate', gateType: 'INPUT' },
        validation: { type: 'gate-placed' }
      },
      {
        id: 'full-adder-logic',
        instruction: '全加算器の設計：Sum = A XOR B XOR Cin、Cout = (A AND B) OR (Cin AND (A XOR B))',
        action: { type: 'explanation', content: '2つのXORで答えを、複雑なAND-OR組み合わせで桁上がりを作ります' }
      },
      {
        id: 'build-full-adder',
        instruction: 'XOR、AND、ORゲートを組み合わせて、3入力の全加算器を構築してください。',
        action: { type: 'place-gate', gateType: 'XOR' },
        validation: { type: 'circuit-complete' }
      },
      {
        id: 'test-full-adder',
        instruction: '8通りの組み合わせをテストしてください。特に111（1+1+1=11）の場合を確認しましょう。',
        action: { type: 'observe' }
      }
    ]
  },

  {
    id: '4bit-adder',
    title: '4ビット加算器 - 複数桁の計算',
    description: '全加算器を4つ繋げて、15+15のような計算を実現しよう！',
    objective: '全加算器をチェーンして多桁計算回路を構築する',
    difficulty: 'intermediate',
    estimatedMinutes: 25,
    prerequisites: ['full-adder'],
    category: 'combinational',
    icon: '🔗',
    steps: [
      {
        id: 'chain-concept',
        instruction: '4ビット加算器は4つの全加算器をチェーン接続します。各桁の桁上がり出力を次の桁の桁上がり入力に接続します。',
        action: { type: 'explanation', content: 'まるで小学校の筆算で「桁上がりを次の桁に書く」のと同じです' }
      },
      {
        id: 'build-4bit',
        instruction: '4つの全加算器を配置し、桁上がりをチェーン接続してください。8つのINPUT（A0-A3, B0-B3）と5つのOUTPUT（S0-S3, Cout）が必要です。',
        action: { type: 'place-gate', gateType: 'INPUT' },
        validation: { type: 'circuit-complete' }
      },
      {
        id: 'test-arithmetic',
        instruction: '実際の計算をテストしてみましょう：3 + 5 = 8（0011 + 0101 = 1000）',
        action: { type: 'observe' }
      }
    ]
  },

  {
    id: 'comparator',
    title: '比較器 - 大小を判定する回路',
    description: 'AはBより大きい？小さい？等しい？条件分岐の基礎を学ぼう！',
    objective: '数値比較回路を構築し、条件判断の原理を理解する',
    difficulty: 'intermediate',
    estimatedMinutes: 20,
    prerequisites: ['4bit-adder'],
    category: 'combinational',
    icon: '⚖️',
    steps: [
      {
        id: 'comparison-need',
        instruction: 'プログラムの「if (a > b)」はどう実現される？比較器は2つの数値を比べて、大小関係を出力します。',
        action: { type: 'explanation', content: 'A > B、A = B、A < B の3つの出力を持つ回路を作ります' }
      },
      {
        id: 'magnitude-comparator',
        instruction: '2ビット比較器を構築しましょう。XORで等価判定、複雑な論理で大小判定を行います。',
        action: { type: 'place-gate', gateType: 'XOR' },
        validation: { type: 'circuit-complete' }
      },
      {
        id: 'test-comparison',
        instruction: '様々な比較をテスト：00 vs 01、10 vs 01、11 vs 11など。結果が正しいか確認しましょう。',
        action: { type: 'observe' }
      }
    ]
  },

  {
    id: 'encoder',
    title: 'エンコーダー - 情報を圧縮する',
    description: '8本の線を3本に圧縮！情報を効率的に表現する技術を学ぼう！',
    objective: 'エンコーダー回路を構築し、情報圧縮の原理を理解する',
    difficulty: 'intermediate',
    estimatedMinutes: 18,
    prerequisites: ['comparator'],
    category: 'combinational',
    icon: '📦',
    steps: [
      {
        id: 'encoding-concept',
        instruction: '8つのボタンのうち「どれが押されたか」を3ビット（8パターン）で表現するのがエンコーダーです。',
        action: { type: 'explanation', content: 'キーボードの文字を数値コードに変換するのと同じ原理です' }
      },
      {
        id: 'priority-encoder',
        instruction: '8-to-3エンコーダーを構築しましょう。複数のボタンが同時に押された場合は、優先度の高いものを選択します。',
        action: { type: 'place-gate', gateType: 'OR' },
        validation: { type: 'circuit-complete' }
      },
      {
        id: 'test-encoding',
        instruction: '様々な入力パターンをテストして、正しく3ビット出力が得られるか確認しましょう。',
        action: { type: 'observe' }
      }
    ]
  },

  {
    id: 'decoder',
    title: 'デコーダー - 情報を展開する',
    description: '3本の線を8本に展開！圧縮された情報を元に戻そう！',
    objective: 'デコーダー回路を構築し、情報展開の原理を理解する',
    difficulty: 'intermediate',
    estimatedMinutes: 18,
    prerequisites: ['encoder'],
    category: 'combinational',
    icon: '📤',
    steps: [
      {
        id: 'decoding-concept',
        instruction: 'デコーダーはエンコーダーの逆です。3ビットコード（000-111）を受け取り、対応する8本の出力線のうち1本だけをONにします。',
        action: { type: 'explanation', content: 'メモリのアドレス指定や7セグメントディスプレイの制御に使われます' }
      },
      {
        id: 'build-decoder',
        instruction: '3-to-8デコーダーを構築しましょう。ANDゲートとNOTゲートを組み合わせて、特定のパターンだけを検出します。',
        action: { type: 'place-gate', gateType: 'AND' },
        validation: { type: 'circuit-complete' }
      },
      {
        id: 'test-decoding',
        instruction: '3ビット入力（000, 001, 010...111）を順番に変更して、対応する出力線が正しくONになるか確認しましょう。',
        action: { type: 'observe' }
      }
    ]
  },

  {
    id: 'multiplexer',
    title: 'マルチプレクサー - データ選択の魔術師',
    description: '複数のデータから1つを選ぶ！データルーティングの基礎を学ぼう！',
    objective: 'マルチプレクサー回路を構築し、データ選択の原理を理解する',
    difficulty: 'intermediate',
    estimatedMinutes: 20,
    prerequisites: ['decoder'],
    category: 'combinational',
    icon: '🎛️',
    steps: [
      {
        id: 'mux-concept',
        instruction: 'マルチプレクサー（MUX）は「データの切り替えスイッチ」です。複数の入力から1つを選んで出力に繋げます。',
        action: { type: 'explanation', content: 'テレビのチャンネル切り替えやCPUのデータ経路切り替えに使われます' }
      },
      {
        id: 'build-4to1-mux',
        instruction: '4-to-1マルチプレクサーを構築しましょう。4つのデータ入力、2つの選択信号、1つの出力を持ちます。',
        action: { type: 'place-gate', gateType: 'AND' },
        validation: { type: 'circuit-complete' }
      },
      {
        id: 'test-selection',
        instruction: '選択信号（00, 01, 10, 11）を変更して、対応するデータ入力が出力に現れるか確認しましょう。',
        action: { type: 'observe' }
      }
    ]
  },

  {
    id: 'alu-basics',
    title: 'ALU基礎 - CPUの計算エンジン',
    description: '加算、減算、論理演算...CPUの心臓部であるALUを作ろう！',
    objective: '簡単なALUを構築し、CPUの計算原理を理解する',
    difficulty: 'advanced',
    estimatedMinutes: 30,
    prerequisites: ['multiplexer'],
    category: 'combinational',
    icon: '🧮',
    steps: [
      {
        id: 'alu-concept',
        instruction: 'ALU（算術論理演算装置）は、CPUで計算を担当します。加算、減算、AND、OR、XORなど複数の演算を1つの回路で実現します。',
        action: { type: 'explanation', content: 'コンピュータのすべての計算は、最終的にALUで行われます' }
      },
      {
        id: 'build-simple-alu',
        instruction: '4つの演算（ADD、SUB、AND、OR）を実行できるシンプルなALUを構築しましょう。演算選択信号で動作を切り替えます。',
        action: { type: 'place-gate', gateType: 'AND' },
        validation: { type: 'circuit-complete' }
      },
      {
        id: 'test-operations',
        instruction: '様々な演算をテストしてください：5+3、7-2、15 AND 7、12 OR 3など。',
        action: { type: 'observe' }
      }
    ]
  },

  // 🌟 Phase 3: 記憶と時系列
  {
    id: 'd-flipflop',
    title: 'D-フリップフロップ - デジタル記憶の原点',
    description: '1ビットを記憶する最も基本的な回路を作ろう！',
    objective: 'D-FFの動作原理を理解し、同期式回路の基礎を学ぶ',
    difficulty: 'intermediate',
    estimatedMinutes: 20,
    prerequisites: ['alu-basics'],
    category: 'sequential',
    icon: '💾',
    steps: [
      {
        id: 'memory-need',
        instruction: 'これまでの回路は「組み合わせ回路」で、入力が決まれば出力も決まりました。しかし、コンピュータには「記憶」が必要です。',
        action: { type: 'explanation', content: 'D-フリップフロップは1ビットを記憶する最小単位です' }
      },
      {
        id: 'clock-concept',
        instruction: 'D-FFはクロック信号で動作します。クロックの立ち上がりエッジでのみデータを取り込み、それ以外は記憶を保持します。',
        action: { type: 'explanation', content: 'まるで写真のシャッターのように、特定のタイミングでのみ「記憶」します' }
      },
      {
        id: 'build-dff',
        instruction: 'D-FF回路を構築しましょう。CLOCK、D入力、Q出力を使います。',
        action: { type: 'place-gate', gateType: 'D-FF' },
        validation: { type: 'gate-placed' }
      },
      {
        id: 'test-memory',
        instruction: 'D入力を1にしてクロックを立ち上げ、その後D入力を0に変更してもQ出力が1を保持することを確認しましょう。',
        action: { type: 'observe' }
      }
    ]
  },

  {
    id: 'sr-latch',
    title: 'SR-ラッチ - 非同期記憶回路',
    description: 'セット・リセットで状態を制御する基本記憶回路を学ぼう！',
    objective: 'SR-ラッチの動作を理解し、非同期回路の特性を学ぶ',
    difficulty: 'intermediate',
    estimatedMinutes: 18,
    prerequisites: ['d-flipflop'],
    category: 'sequential',
    icon: '🔒',
    steps: [
      {
        id: 'latch-concept',
        instruction: 'SR-ラッチは最も基本的な記憶回路です。Set信号で1を記憶、Reset信号で0を記憶し、どちらもOFFなら現在の状態を保持します。',
        action: { type: 'explanation', content: '電子的なオンオフスイッチのようなものです' }
      },
      {
        id: 'build-sr-latch',
        instruction: 'NORゲート2つを使ってSR-ラッチを構築しましょう。相互に接続することで記憶効果が生まれます。',
        action: { type: 'place-gate', gateType: 'SR-LATCH' },
        validation: { type: 'gate-placed' }
      },
      {
        id: 'test-sr-operations',
        instruction: 'Set=1でラッチをセット、Reset=1でラッチをリセット、両方=0で状態保持を確認しましょう。',
        action: { type: 'observe' }
      },
      {
        id: 'forbidden-state',
        instruction: '警告：S=1, R=1は禁止状態です！予期しない動作になるので避けましょう。',
        action: { type: 'explanation', content: 'この問題を解決するのがD-フリップフロップです' }
      }
    ]
  },

  {
    id: 'counter',
    title: 'カウンター - 数を数える回路',
    description: '0,1,2,3...と順番に数える、デジタル時計の心臓部を作ろう！',
    objective: 'バイナリカウンターを構築し、順序回路の応用を学ぶ',
    difficulty: 'intermediate',
    estimatedMinutes: 25,
    prerequisites: ['sr-latch'],
    category: 'sequential',
    icon: '🔢',
    steps: [
      {
        id: 'counter-concept',
        instruction: 'カウンターはクロックパルスごとに数値をカウントアップします。デジタル時計、プロセッサーのプログラムカウンターなどに使われます。',
        action: { type: 'explanation', content: '4ビットカウンターは0から15まで数えて、また0に戻ります' }
      },
      {
        id: 'ripple-counter',
        instruction: 'リップルカウンターを構築しましょう。D-FFを数珠繋ぎに接続し、各段の出力を次の段のクロックにします。',
        action: { type: 'place-gate', gateType: 'D-FF' },
        validation: { type: 'circuit-complete' }
      },
      {
        id: 'test-counting',
        instruction: 'クロックを何度も立ち上げて、カウンターが0→1→2→3...と正しく数えることを確認しましょう。',
        action: { type: 'observe' }
      },
      {
        id: 'synchronous-vs-asynchronous',
        instruction: 'リップルカウンターは非同期です。より高速な同期カウンターもありますが、回路が複雑になります。',
        action: { type: 'explanation', content: '用途に応じて適切なカウンター方式を選択することが重要です' }
      }
    ]
  },

  {
    id: 'register',
    title: 'レジスタ - 複数ビットの記憶装置',
    description: '8ビットや16ビットのデータを一度に記憶する装置を作ろう！',
    objective: 'マルチビットレジスタを構築し、データ保存の仕組みを理解する',
    difficulty: 'intermediate',
    estimatedMinutes: 22,
    prerequisites: ['counter'],
    category: 'sequential',
    icon: '📊',
    steps: [
      {
        id: 'register-concept',
        instruction: 'レジスタは複数のD-FFを並列に並べた記憶装置です。CPUの中で一時的なデータ保存に使われます。',
        action: { type: 'explanation', content: '8ビットレジスタなら、8つのD-FFが同じクロックで同期動作します' }
      },
      {
        id: 'parallel-load',
        instruction: '8ビットレジスタを構築しましょう。8つのD-FF、共通クロック、パラレル入力/出力を持ちます。',
        action: { type: 'place-gate', gateType: 'D-FF' },
        validation: { type: 'circuit-complete' }
      },
      {
        id: 'test-storage',
        instruction: '8ビットデータ（例：10110011）をロードし、記憶が保持されることを確認しましょう。',
        action: { type: 'observe' }
      },
      {
        id: 'enable-control',
        instruction: 'Enable信号を追加すると、必要な時だけデータをロードできるようになります。',
        action: { type: 'explanation', content: '実際のCPUレジスタには、読み書き制御機能があります' }
      }
    ]
  },

  {
    id: 'shift-register',
    title: 'シフトレジスタ - データを移動させる',
    description: 'データを左右にスライドさせる、シリアル通信の基礎回路を学ぼう！',
    objective: 'シフトレジスタを構築し、データ転送の原理を理解する',
    difficulty: 'intermediate',
    estimatedMinutes: 20,
    prerequisites: ['register'],
    category: 'sequential',
    icon: '↔️',
    steps: [
      {
        id: 'shift-concept',
        instruction: 'シフトレジスタはデータを左右に移動させます。シリアル通信、乗算・除算、遅延回路などに使われます。',
        action: { type: 'explanation', content: '例：1011 を左シフトすると 0110、右シフトすると 1101 になります' }
      },
      {
        id: 'build-shift-register',
        instruction: '4ビット右シフトレジスタを構築しましょう。各D-FFの出力を次のD-FFの入力に接続します。',
        action: { type: 'place-gate', gateType: 'D-FF' },
        validation: { type: 'circuit-complete' }
      },
      {
        id: 'test-shifting',
        instruction: 'データ1100をロードし、クロックごとにデータが右にシフトすることを確認しましょう（1100→0110→0011→0001）。',
        action: { type: 'observe' }
      },
      {
        id: 'serial-communication',
        instruction: 'シフトレジスタは8ビットを1ビットずつ送信するシリアル通信の基本です。',
        action: { type: 'explanation', content: 'USB、SPI、UARTなど、多くの通信プロトコルで使われています' }
      }
    ]
  },

  {
    id: 'clock-sync',
    title: 'クロック同期 - 全体の調和',
    description: '複数の回路が同じリズムで動く、同期システムの美学を学ぼう！',
    objective: 'クロック分配と同期設計の重要性を理解する',
    difficulty: 'advanced',
    estimatedMinutes: 18,
    prerequisites: ['shift-register'],
    category: 'sequential',
    icon: '🎵',
    steps: [
      {
        id: 'synchronization-importance',
        instruction: 'デジタルシステムでは、全ての回路が同じクロックに合わせて動作する必要があります。でないとデータが壊れてしまいます。',
        action: { type: 'explanation', content: 'オーケストラの指揮者のように、クロックが全体のタイミングを制御します' }
      },
      {
        id: 'clock-distribution',
        instruction: '複数のD-FFに同じクロック信号を分配しましょう。クロックの遅延やスキューに注意が必要です。',
        action: { type: 'place-gate', gateType: 'CLOCK' },
        validation: { type: 'circuit-complete' }
      },
      {
        id: 'test-sync',
        instruction: '複数の回路が同期して動作することを確認しましょう。同じクロックエッジで全ての変化が起こります。',
        action: { type: 'observe' }
      },
      {
        id: 'advanced-clocking',
        instruction: '実際のCPUでは、クロック分周、位相ロックループ（PLL）、クロックゲーティングなど高度な技術が使われます。',
        action: { type: 'explanation', content: 'クロック設計は、高速デジタルシステムの最重要課題の1つです' }
      }
    ]
  },

  // 🚀 Phase 4: 実用システム
  {
    id: 'traffic-light',
    title: '信号機システム - 実世界への第一歩',
    description: '赤→青→黄色と順番に変わる、街の安全を守る信号機を作ろう！',
    objective: '状態マシンを使った実用システムを構築する',
    difficulty: 'advanced',
    estimatedMinutes: 28,
    prerequisites: ['clock-sync'],
    category: 'systems',
    icon: '🚦',
    steps: [
      {
        id: 'traffic-system',
        instruction: '信号機は典型的な状態マシンです。赤(30秒)→青(25秒)→黄色(5秒)→赤...と循環します。',
        action: { type: 'explanation', content: '状態マシンは、決まった順序で状態を変化させるシステムです' }
      },
      {
        id: 'state-design',
        instruction: '3つの状態（赤・青・黄）をカウンターとデコーダーで制御しましょう。タイマーカウンターで時間管理も行います。',
        action: { type: 'place-gate', gateType: 'D-FF' },
        validation: { type: 'circuit-complete' }
      },
      {
        id: 'test-sequence',
        instruction: 'クロックを進めて、信号が正しい順序で変化することを確認しましょう。',
        action: { type: 'observe' }
      },
      {
        id: 'real-world-extension',
        instruction: '実際の信号機には歩行者用信号、感知センサー、緊急車両優先制御などの機能もあります。',
        action: { type: 'explanation', content: 'これらも状態マシンの応用で実現できます' }
      }
    ]
  },

  {
    id: 'digital-clock',
    title: 'デジタル時計 - 時を刻む精密機械',
    description: '秒、分、時をカウントする本格的なデジタル時計を作ろう！',
    objective: '階層的カウンターシステムを構築し、時間管理回路を学ぶ',
    difficulty: 'advanced',
    estimatedMinutes: 32,
    prerequisites: ['traffic-light'],
    category: 'systems',
    icon: '⏰',
    steps: [
      {
        id: 'time-hierarchy',
        instruction: 'デジタル時計は階層的カウンターです。秒カウンター(0-59)→分カウンター(0-59)→時カウンター(0-23)と桁上がりします。',
        action: { type: 'explanation', content: '60進法と24進法の組み合わせという、特殊な数体系です' }
      },
      {
        id: 'build-clock-system',
        instruction: '秒、分、時の3段階カウンターを構築しましょう。各段で上限に達したら次の段をカウントアップし、自分は0にリセットします。',
        action: { type: 'place-gate', gateType: 'D-FF' },
        validation: { type: 'circuit-complete' }
      },
      {
        id: 'bcd-display',
        instruction: '時刻表示には7セグメントディスプレイを使います。BCD（2進化10進）デコーダーが必要です。',
        action: { type: 'explanation', content: '例：9は1001(BCD)で表現し、7セグメント用にデコードします' }
      },
      {
        id: 'test-timekeeping',
        instruction: '高速クロックで動作確認しましょう。59秒→00秒00分→01分、23時59分→00時00分の遷移を確認してください。',
        action: { type: 'observe' }
      }
    ]
  },

  {
    id: 'calculator',
    title: '電卓 - 四則演算マシン',
    description: '加算、減算、乗算、除算ができる本格的な計算機を作ろう！',
    objective: 'ALUを活用した計算システムを構築する',
    difficulty: 'advanced',
    estimatedMinutes: 35,
    prerequisites: ['digital-clock'],
    category: 'systems',
    icon: '🔢',
    steps: [
      {
        id: 'calculator-architecture',
        instruction: '電卓の構成：入力レジスタ、ALU、演算子レジスタ、結果レジスタ、制御ユニット。キー入力に応じて適切な演算を実行します。',
        action: { type: 'explanation', content: '例："7 + 3 =" の入力に対して、ALUで加算を実行し結果を表示します' }
      },
      {
        id: 'build-calculator',
        instruction: 'ALU、レジスタ、制御回路を組み合わせて電卓を構築しましょう。演算子選択でALUの動作モードを切り替えます。',
        action: { type: 'place-gate', gateType: 'AND' },
        validation: { type: 'circuit-complete' }
      },
      {
        id: 'multiplication-division',
        instruction: '乗算は繰り返し加算、除算は繰り返し減算で実現できます。シフト演算を使うとより効率的です。',
        action: { type: 'explanation', content: '例：5×3 = 5+5+5、12÷3 = 12-3-3-3-3（商は減算回数）' }
      },
      {
        id: 'test-calculations',
        instruction: '様々な計算をテストしてください：23+45、67-89、7×8、56÷7など。',
        action: { type: 'observe' }
      }
    ]
  },

  {
    id: 'password-lock',
    title: 'パスワードロック - セキュリティシステム',
    description: '正しい番号を入力した時だけ開く、デジタル金庫を作ろう！',
    objective: 'シーケンス検出器を構築し、セキュリティシステムの基礎を学ぶ',
    difficulty: 'advanced',
    estimatedMinutes: 25,
    prerequisites: ['calculator'],
    category: 'systems',
    icon: '🔐',
    steps: [
      {
        id: 'sequence-detection',
        instruction: 'パスワードロックは「正しい順序での入力検出」です。例：1-2-3-4の順序でボタンが押された時のみ解錠します。',
        action: { type: 'explanation', content: '状態マシンで「どこまで正しく入力されたか」を追跡します' }
      },
      {
        id: 'build-lock-system',
        instruction: '4桁パスワード（例：1234）のロックシステムを構築しましょう。状態レジスタで進行状況を管理します。',
        action: { type: 'place-gate', gateType: 'D-FF' },
        validation: { type: 'circuit-complete' }
      },
      {
        id: 'error-handling',
        instruction: '間違った入力では状態をリセットします。また、連続失敗でロックアウト機能も追加できます。',
        action: { type: 'explanation', content: 'セキュリティシステムでは、攻撃に対する防御機構が重要です' }
      },
      {
        id: 'test-security',
        instruction: '正しいパスワード（1234）と間違いパスワード（1235、1324など）の両方をテストしましょう。',
        action: { type: 'observe' }
      }
    ]
  },

  {
    id: 'traffic-counter',
    title: '交通量カウンター - データ収集システム',
    description: '通過する車の数をカウントし、交通量を分析するシステムを作ろう！',
    objective: 'センサー入力を処理するカウンターシステムを構築する',
    difficulty: 'advanced',
    estimatedMinutes: 22,
    prerequisites: ['password-lock'],
    category: 'systems',
    icon: '🚗',
    steps: [
      {
        id: 'traffic-monitoring',
        instruction: '交通量カウンターは、センサーからの信号を受けて車の通過数をカウントします。上り・下り方向も区別します。',
        action: { type: 'explanation', content: '2つのセンサーの信号タイミングで方向を判定できます' }
      },
      {
        id: 'direction-detection',
        instruction: 'センサーA→センサーBの順序なら上り、B→Aの順序なら下りと判定します。エッジ検出とシーケンス判定を組み合わせます。',
        action: { type: 'place-gate', gateType: 'D-FF' },
        validation: { type: 'circuit-complete' }
      },
      {
        id: 'data-logging',
        instruction: '時間別、方向別の交通量をカウンターで記録します。定期的にデータをリセットして新しい集計を開始できます。',
        action: { type: 'explanation', content: '実際のシステムでは、このデータをコンピューターに送信して分析します' }
      },
      {
        id: 'test-counting',
        instruction: '様々な車両通過パターンをシミュレートして、正確にカウントされることを確認しましょう。',
        action: { type: 'observe' }
      }
    ]
  },

  {
    id: 'vending-machine',
    title: '自動販売機 - 複合システム',
    description: 'お金を投入して商品を選ぶ、実用的な自動販売機システムを作ろう！',
    objective: '複数のサブシステムを統合した実用システムを構築する',
    difficulty: 'advanced',
    estimatedMinutes: 38,
    prerequisites: ['traffic-counter'],
    category: 'systems',
    icon: '🥤',
    steps: [
      {
        id: 'vending-overview',
        instruction: '自動販売機の要素：コイン識別、金額計算、商品選択、おつり計算、在庫管理。これらを統合したシステムです。',
        action: { type: 'explanation', content: '実世界の複雑なシステムも、基本的な論理回路の組み合わせで実現されています' }
      },
      {
        id: 'coin-processing',
        instruction: 'コイン識別器からの信号（10円、50円、100円）を受けて、投入金額を累積計算します。',
        action: { type: 'place-gate', gateType: 'D-FF' },
        validation: { type: 'circuit-complete' }
      },
      {
        id: 'product-selection',
        instruction: '商品ボタンが押されたら、価格と投入金額を比較します。不足なら警告、足りていれば販売処理を開始します。',
        action: { type: 'explanation', content: '比較器回路で金額判定を行います' }
      },
      {
        id: 'change-calculation',
        instruction: 'おつりは投入金額から商品価格を減算して計算します。硬貨の種類別に必要枚数を求めます。',
        action: { type: 'explanation', content: '例：130円投入、100円商品→30円のおつり（10円×3枚）' }
      },
      {
        id: 'test-transactions',
        instruction: '様々な取引パターンをテストしましょう：正確な金額、多めの投入、不足金額、商品完売時の動作など。',
        action: { type: 'observe' }
      }
    ]
  },

  {
    id: 'cpu-basics',
    title: 'CPU基礎 - コンピュータの心臓',
    description: '命令を読み込み実行する、シンプルなCPUの原理を学ぼう！',
    objective: 'フェッチ・デコード・実行サイクルを理解し、CPU設計の基礎を学ぶ',
    difficulty: 'advanced',
    estimatedMinutes: 40,
    prerequisites: ['vending-machine'],
    category: 'systems',
    icon: '🧠',
    steps: [
      {
        id: 'cpu-architecture',
        instruction: 'CPUの基本構成：プログラムカウンター、命令レジスタ、ALU、レジスタファイル、制御ユニット。これらが協調してプログラムを実行します。',
        action: { type: 'explanation', content: 'フェッチ（命令取得）→デコード（命令解析）→実行のサイクルを繰り返します' }
      },
      {
        id: 'instruction-set',
        instruction: 'シンプルな命令セット：LOAD（メモリからレジスタ）、STORE（レジスタからメモリ）、ADD、SUB、JUMP。各命令は数ビットのコードで表現されます。',
        action: { type: 'explanation', content: '例：ADD R1, R2（R1 = R1 + R2）は「0001 01 10」のような機械語になります' }
      },
      {
        id: 'build-simple-cpu',
        instruction: '8ビットの超シンプルCPUを構築しましょう。4つの命令を実行できる最小構成です。',
        action: { type: 'place-gate', gateType: 'D-FF' },
        validation: { type: 'circuit-complete' }
      },
      {
        id: 'program-execution',
        instruction: 'サンプルプログラムを実行してみましょう：「2つの数を加算して結果を保存」する簡単なプログラムです。',
        action: { type: 'observe' }
      },
      {
        id: 'modern-cpu',
        instruction: '現代のCPUには、パイプライン、分岐予測、キャッシュ、マルチコアなど高度な技術が使われていますが、基本原理は同じです。',
        action: { type: 'explanation', content: '論理回路の組み合わせで、どんなに複雑な処理も実現できるのです！' }
      }
    ]
  },

  {
    id: 'final-project',
    title: '総合プロジェクト - あなたの創造力を形に',
    description: '学んだ技術を総動員して、オリジナルのデジタルシステムを設計しよう！',
    objective: '習得した知識を統合し、創造的なシステム設計を行う',
    difficulty: 'advanced',
    estimatedMinutes: 45,
    prerequisites: ['cpu-basics'],
    category: 'systems',
    icon: '🏆',
    steps: [
      {
        id: 'project-planning',
        instruction: 'これまで学んだ27のレッスンを振り返りましょう。基本ゲートから始まって、CPU設計まで到達しました。素晴らしい成長です！',
        action: { type: 'explanation', content: 'あなたは今、デジタルシステムの設計者として十分な知識を持っています' }
      },
      {
        id: 'design-challenge',
        instruction: '最終課題：以下から1つ選んで設計してください。1)デジタル楽器 2)ゲーム機 3)通信システム 4)制御システム 5)完全オリジナル',
        action: { type: 'explanation', content: '制約なく、自由に創造してください。失敗を恐れず、試行錯誤を楽しみましょう' }
      },
      {
        id: 'implementation',
        instruction: '選んだプロジェクトを実装しましょう。必要な機能を分解し、学んだ回路技術を組み合わせて実現してください。',
        action: { type: 'place-gate', gateType: 'INPUT' },
        validation: { type: 'circuit-complete' }
      },
      {
        id: 'testing-refinement',
        instruction: 'システムをテストし、問題があれば改良を重ねましょう。実際の設計では、このサイクルが最も重要です。',
        action: { type: 'observe' }
      },
      {
        id: 'congratulations',
        instruction: '🎉 おめでとうございます！あなたは論理回路マスターです！これからも創造と学習を続けて、素晴らしいシステムを作ってください。',
        action: { type: 'explanation', content: 'デジタル世界の扉は今、あなたの前に大きく開かれています。未来を創造する準備は整いました！' }
      }
    ]
  }
];

// 📚 カテゴリー別整理
export const lessonCategories = {
  basics: {
    title: '🌟 Phase 1: デジタルの世界',
    description: '0と1の魔法を理解しよう',
    color: '#00ff88',
    lessons: ['digital-basics', 'not-gate-master', 'and-gate-master', 'or-gate-master', 'xor-gate-detective']
  },
  combinational: {
    title: '🔧 Phase 2: 組み合わせ回路',
    description: '実用的な計算・判断回路を作ろう',
    color: '#ff6699',
    lessons: ['half-adder', 'full-adder', '4bit-adder', 'comparator', 'encoder', 'decoder', 'multiplexer', 'alu-basics']
  },
  sequential: {
    title: '⏰ Phase 3: 記憶と時系列',
    description: '時間と記憶を扱う回路を学ぼう',
    color: '#ffd700',
    lessons: ['d-flipflop', 'sr-latch', 'counter', 'register', 'shift-register', 'clock-sync']
  },
  systems: {
    title: '🚀 Phase 4: 実用システム',
    description: '本格的なシステムを構築しよう',
    color: '#ff7b00',
    lessons: ['traffic-light', 'digital-clock', 'calculator', 'password-lock', 'traffic-counter', 'vending-machine', 'cpu-basics', 'final-project']
  }
};

// 🏆 学習統計
export const getLearningStats = (completedLessons: Set<string>) => {
  const totalLessons = lessons.length;
  const completed = completedLessons.size;
  const progress = Math.round((completed / totalLessons) * 100);
  
  const phaseStats = Object.entries(lessonCategories).map(([key, category]) => ({
    phase: category.title,
    completed: category.lessons.filter(id => completedLessons.has(id)).length,
    total: category.lessons.length,
    color: category.color
  }));

  return {
    totalLessons,
    completed,
    progress,
    phaseStats,
    estimatedTime: lessons.reduce((sum, lesson) => 
      completedLessons.has(lesson.id) ? sum : sum + lesson.estimatedMinutes, 0
    )
  };
};
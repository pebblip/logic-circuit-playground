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
    estimatedMinutes: 10,
    prerequisites: [],
    category: 'basics',
    icon: '🌟',
    steps: [
      {
        id: 'intro',
        instruction: 'ようこそ、デジタルの世界へ！私たちの周りにあるスマホ、パソコン、エアコンなど、すべてが0と1だけで動いています。なぜでしょうか？',
        action: { type: 'explanation', content: '🌍 身の回りのデジタル：\n・スマートフォン：写真も音楽も0と1の組み合わせ\n・コンピュータ：複雑な計算も0と1の処理\n・デジタル時計：時刻も0と1で表現\n\nデジタル技術は「はっきりした状態」を好みます。\n電気のON/OFF、明るい/暗い、高い/低いなど、曖昧さがない2つの状態だけを使います。' }
      },
      {
        id: 'analog-vs-digital',
        instruction: '【アナログとデジタルの違い】まず、この2つの違いを理解しましょう。',
        action: { type: 'explanation', content: '📊 アナログ vs デジタル\n\nアナログ（連続的）：\n・温度計の水銀：23.456...℃\n・音量つまみ：無段階調整\n・太陽の明るさ：徐々に変化\n\nデジタル（離散的）：\n・温度表示：23℃か24℃\n・音量ボタン：1,2,3...と段階的\n・部屋の電気：ON か OFF\n\n💡 デジタルは「とびとび」の値しか持ちません！' }
      },
      {
        id: 'place-input',
        instruction: '【初めてのゲート配置】INPUTゲート（スイッチ）を配置してみましょう。左のツールパレットから「INPUT」を見つけて、キャンバスにドラッグ＆ドロップしてください。',
        action: { type: 'place-gate', gateType: 'INPUT', position: { x: 150, y: 200 } },
        hint: '「入出力」セクションにあります。キャンバスの左側に配置すると良いでしょう',
        validation: { type: 'gate-placed' }
      },
      {
        id: 'input-explanation',
        instruction: '【INPUTゲートとは】配置したINPUTゲートを観察してみましょう。',
        action: { type: 'explanation', content: '🎚️ INPUTゲートの役割：\n・デジタル世界のスイッチ\n・グレー = OFF = 0\n・緑 = ON = 1\n\nダブルクリックで切り替えられます。\nこれがデジタルの最小単位「ビット」です！' }
      },
      {
        id: 'place-output',
        instruction: '【出力の配置】次にOUTPUTゲート（LED）を配置します。INPUTの右側に少し離して配置してください。',
        action: { type: 'place-gate', gateType: 'OUTPUT', position: { x: 400, y: 200 } },
        hint: 'OUTPUTは結果を表示する電球のようなものです',
        validation: { type: 'gate-placed' }
      },
      {
        id: 'connect-gates',
        instruction: '【接続してみよう】INPUTとOUTPUTを線（ワイヤー）で接続します。①INPUTの右側の丸（出力ピン）をクリック ②OUTPUTの左側の丸（入力ピン）をクリック',
        action: { type: 'connect-wire', from: 'INPUT', to: 'OUTPUT' },
        hint: 'ピンにマウスを近づけると緑色にハイライトされます'
      },
      {
        id: 'first-circuit',
        instruction: '【初めての回路完成！】おめでとうございます！最もシンプルなデジタル回路が完成しました。',
        action: { type: 'explanation', content: '🎉 作った回路の意味：\nINPUT → OUTPUT\n\nこれは「信号をそのまま伝える」回路です。\n現実世界なら「スイッチを押したらランプが点く」という仕組みです。' }
      },
      {
        id: 'test-off-state',
        instruction: '【動作確認1】現在の状態を確認しましょう。両方ともグレー（OFF）のはずです。',
        action: { type: 'observe', highlight: ['INPUT', 'OUTPUT'] },
        hint: '🔍 観察：信号が伝わっている様子を確認してください'
      },
      {
        id: 'test-digital',
        instruction: '【動作確認2】INPUTをダブルクリックして、緑（ON）に変えてみてください。何が起きましたか？',
        action: { type: 'toggle-input', gateId: 'INPUT', value: true },
        hint: 'OUTPUTも同時に緑になったはずです！'
      },
      {
        id: 'signal-observation',
        instruction: '【信号の観察】よく見ると、ワイヤー（線）も緑色に光っていますね。これが「1」の信号が流れている証拠です！',
        action: { type: 'observe', highlight: ['wire'] },
        validation: { type: 'output-matches', expected: { OUTPUT: true } }
      },
      {
        id: 'toggle-multiple',
        instruction: '【実験】INPUTを何度かダブルクリックして、ON/OFFを切り替えてみてください。瞬時に切り替わることを確認しましょう。',
        action: { type: 'observe' },
        hint: '中間の状態（半分ON）は存在しません。これがデジタルの特徴です！'
      },
      {
        id: 'why-binary',
        instruction: '【なぜ0と1だけ？】コンピュータが2進数を使う理由を理解しましょう。',
        action: { type: 'explanation', content: '🤔 2進数を使う理由：\n\n1. 確実性\n・電圧が3.3Vなら1、0Vなら0\n・多少のノイズがあっても判別可能\n\n2. シンプルさ\n・回路が単純 = 故障しにくい\n・高速処理が可能\n\n3. 論理演算との相性\n・AND、OR、NOTなどの論理演算が簡単\n・複雑な計算も基本演算の組み合わせ\n\n💡 シンプルだからこそ、確実で高速！' }
      },
      {
        id: 'digital-world',
        instruction: '【デジタルの可能性】たった0と1だけで、どんなことができるのでしょうか？',
        action: { type: 'explanation', content: '🌟 0と1でできること：\n\n・文字：A=01000001、B=01000010...\n・画像：各ピクセルの色を数値で表現\n・音楽：音波を細かくサンプリング\n・動画：画像を高速で切り替え\n・AI：ニューラルネットワークの計算\n\nすべては0と1の組み合わせ！\n\n次のレッスンでは、これらを操作する「論理ゲート」を学びます。' }
      }
    ]
  },

  {
    id: 'not-gate-master',
    title: 'NOTゲート - 逆転の魔法',
    description: '真逆に変える、デジタル世界の魔法を習得しよう！',
    objective: 'NOTゲートの動作原理を理解し、なぜ「反転」が重要なのかを学ぶ',
    difficulty: 'beginner',
    estimatedMinutes: 12,
    prerequisites: ['digital-basics'],
    category: 'basics',
    icon: '🔄',
    steps: [
      {
        id: 'not-intro',
        instruction: 'NOTゲートは「反対」の魔法使いです。1を入れると0、0を入れると1に変えてしまいます。',
        action: { type: 'explanation', content: '🔄 身近な例：\n・「電気がついている」→「電気を消す」\n・「ドアが開いている」→「ドアを閉める」\n・「音が出ている」→「ミュートにする」\n\n常に「反対の状態」を作り出します！' }
      },
      {
        id: 'place-input',
        instruction: '【配置1】まずINPUTゲートを配置しましょう。ツールパレットから「INPUT」をドラッグして、キャンバスの左端近くにドロップしてください。',
        action: { type: 'place-gate', gateType: 'INPUT', position: { x: 100, y: 200 } },
        hint: 'INPUTは信号の入り口です',
        validation: { type: 'gate-placed' }
      },
      {
        id: 'place-not',
        instruction: '【配置2】次にNOTゲートを配置します。「基本論理」セクションから「NOT」をドラッグして、INPUTの右側（中央あたり）に配置してください。',
        action: { type: 'place-gate', gateType: 'NOT', position: { x: 300, y: 200 } },
        hint: 'NOTゲートは三角形に丸がついた形です'
      },
      {
        id: 'place-output',
        instruction: '【配置3】最後にOUTPUTゲートを配置します。NOTゲートの右側（右端近く）に配置しましょう。',
        action: { type: 'place-gate', gateType: 'OUTPUT', position: { x: 500, y: 200 } },
        hint: 'OUTPUTは結果を表示するLEDのようなものです'
      },
      {
        id: 'connect-circuit',
        instruction: '【接続】ワイヤーで接続します。①INPUTの右側の丸をクリック ②NOTの左側の丸をクリック。同様にNOTの出力をOUTPUTに接続してください。',
        action: { type: 'connect-wire', from: 'INPUT', to: 'NOT' },
        hint: 'ピンが緑色になったらクリック可能です'
      },
      {
        id: 'observe-initial',
        instruction: '【観察1】現在の状態を観察しましょう。INPUTはグレー（OFF=0）、OUTPUTは何色ですか？',
        action: { type: 'observe', highlight: ['INPUT', 'OUTPUT'] },
        hint: '🔍 観察ポイント：NOTゲートは入力を反転させるので...'
      },
      {
        id: 'test-not-off',
        instruction: '【確認1】OUTPUTが緑（ON）になっていますね？これがNOTゲートの魔法です。0を入れたら1が出てきました！',
        action: { type: 'observe' },
        validation: { type: 'output-matches', expected: { OUTPUT: true } }
      },
      {
        id: 'toggle-input',
        instruction: '【実験】INPUTをダブルクリックして、緑（ON=1）に変えてみましょう。OUTPUTはどうなりますか？',
        action: { type: 'toggle-input', gateId: 'INPUT', value: true },
        hint: '入力を反転させるので、今度は...'
      },
      {
        id: 'test-not-on',
        instruction: '【確認2】OUTPUTがグレー（OFF）になりました！1を入れたら0が出てきました。完璧な反転です！',
        action: { type: 'observe' },
        validation: { type: 'output-matches', expected: { OUTPUT: false } }
      },
      {
        id: 'not-truth-table',
        instruction: '【真理値表】NOTゲートの動作をまとめると：',
        action: { type: 'explanation', content: '📊 NOTゲートの真理値表\n\n入力 | 出力\n-----|-----\n  0  |  1\n  1  |  0\n\n💡 覚え方：「逆！」それだけです。\n入力の反対が必ず出力されます。' }
      },
      {
        id: 'not-applications',
        instruction: '【実世界での活用】NOTゲートは「条件の逆」を作るのに大活躍します：',
        action: { type: 'explanation', content: '🏠 スマートホーム：\n・昼間でない（暗い）→ 街灯ON\n・ドアが閉まっていない → 警告音ON\n\n🚗 車の安全装置：\n・シートベルトしていない → 警告ランプON\n・エンジンがかかっていない → スターター作動可能\n\n💻 プログラミング：\nif (!isLoggedIn) { showLoginScreen(); }\n\nNOTは「〜でない時」を表現する基本です！' }
      },
      {
        id: 'double-not',
        instruction: '【発展：二重否定】もしNOTゲートを2つ繋げたらどうなるでしょう？',
        action: { type: 'explanation', content: '🤔 考えてみましょう：\n1 → NOT → 0 → NOT → 1\n0 → NOT → 1 → NOT → 0\n\n元に戻りました！\n「逆の逆は元通り」という法則です。\n\nこれは信号の遅延や、バッファとして使われることがあります。' }
      }
    ]
  },

  {
    id: 'and-gate-master',
    title: 'ANDゲート - 厳格な番人',
    description: '「すべての条件を満たした時だけ」という厳格な判断を学ぼう！',
    objective: 'ANDゲートの動作を理解し、現実世界での応用例を学ぶ',
    difficulty: 'beginner',
    estimatedMinutes: 15,
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
        id: 'place-first-input',
        instruction: '【配置1】まず1つ目のINPUTゲートを配置しましょう。ツールパレットの「入出力」セクションから「INPUT」をドラッグして、キャンバスの左端近くにドロップしてください。',
        action: { type: 'place-gate', gateType: 'INPUT', position: { x: 100, y: 150 } },
        hint: 'ドラッグ中はゲートが半透明になります',
        validation: { type: 'gate-placed' }
      },
      {
        id: 'place-second-input',
        instruction: '【配置2】2つ目のINPUTゲートを配置します。1つ目の下に少し離して配置すると見やすくなります。',
        action: { type: 'place-gate', gateType: 'INPUT', position: { x: 100, y: 250 } },
        hint: '縦に並べると接続がしやすくなります',
        validation: { type: 'gate-placed' }
      },
      {
        id: 'place-and-gate',
        instruction: '【配置3】ANDゲートを配置します。「基本論理」セクションから「AND」をドラッグして、2つのINPUTの右側（中央あたり）にドロップしてください。',
        action: { type: 'place-gate', gateType: 'AND', position: { x: 300, y: 200 } },
        validation: { type: 'gate-placed' }
      },
      {
        id: 'place-output',
        instruction: '【配置4】最後にOUTPUTゲートを配置します。ANDゲートの右側（右端近く）に配置しましょう。',
        action: { type: 'place-gate', gateType: 'OUTPUT', position: { x: 500, y: 200 } },
        validation: { type: 'gate-placed' }
      },
      {
        id: 'connect-wires',
        instruction: '【接続】ワイヤーで接続しましょう。①上のINPUTの右側の丸（出力ピン）をクリック ②ANDの左上の丸（入力ピン）をクリック。同様に下のINPUTもANDの左下に接続。最後にANDの出力をOUTPUTに接続します。',
        action: { type: 'connect-wire', from: 'INPUT', to: 'AND' },
        hint: 'ピンが緑色にハイライトされたらクリック可能です'
      },
      {
        id: 'test-preparation',
        instruction: '【実験準備】これから4つの組み合わせを順番にテストします。INPUTゲートはダブルクリックで切り替えられます：グレー（OFF=0） ⇔ 緑（ON=1）',
        action: { type: 'explanation', content: '🔍 観察ポイント：どの組み合わせの時にOUTPUTが緑になるか注目してください' }
      },
      {
        id: 'test-00',
        instruction: '【テスト1: 0+0】両方のINPUTをグレー（OFF）のままにして、OUTPUTを観察します。',
        action: { type: 'observe', highlight: ['INPUT', 'OUTPUT'] },
        hint: '期待される結果：OUTPUTはグレー（OFF）のはずです'
      },
      {
        id: 'test-01',
        instruction: '【テスト2: 0+1】下のINPUTをダブルクリックして緑（ON）にし、上はグレー（OFF）のままにします。OUTPUTはどうなりましたか？',
        action: { type: 'toggle-input', gateId: 'INPUT-2', value: true },
        hint: '🤔 なぜOUTPUTは変わらないのでしょうか？'
      },
      {
        id: 'test-10',
        instruction: '【テスト3: 1+0】今度は上のINPUTを緑（ON）、下をグレー（OFF）に戻します。下のINPUTをダブルクリックでOFFに、上をダブルクリックでONにしてください。',
        action: { type: 'toggle-input', gateId: 'INPUT-1', value: true },
        hint: '片方だけONでも、OUTPUTはまだグレーのままですね'
      },
      {
        id: 'test-11',
        instruction: '【テスト4: 1+1】最後に両方のINPUTを緑（ON）にしてみましょう！下のINPUTもダブルクリックで緑にしてください。',
        action: { type: 'toggle-input', gateId: 'INPUT-2', value: true },
        hint: '✨ ついにOUTPUTが緑になりました！'
      },
      {
        id: 'pattern-analysis',
        instruction: '【パターン発見】実験結果をまとめましょう。',
        action: { type: 'explanation', content: '📝 まず記号の説明から：\n「0+0=0」の表記について\n「+」は論理演算を表します（算数の足し算ではありません）\n「入力A + 入力B = 出力」という意味です\n\n📊 実験結果：\n0+0=0（両方OFF → 出力OFF）\n0+1=0（片方だけON → 出力OFF）\n1+0=0（片方だけON → 出力OFF）\n1+1=1（両方ON → 出力ON）\n\n💡 重要な発見：ANDは「完全一致」を要求する厳格なゲートです！\n両方が1の時だけ1を出力します。' }
      },
      {
        id: 'and-quiz',
        instruction: '理解度チェック：ANDゲートはいつOUTPUTが1になりますか？',
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
        instruction: '【実世界での活用】ANDゲートの考え方は安全システムで多用されています：',
        action: { type: 'explanation', content: '🚗 車：シートベルト着用 AND ブレーキペダル踏む → エンジン始動可能\n🏠 洗濯機：蓋が閉まっている AND 電源ON → 運転開始\n🏢 エレベーター：ドアが閉まっている AND ボタン押下 → 移動開始\n\n複数の安全条件をすべて満たす必要がある場面で活躍します！' }
      }
    ]
  },

  {
    id: 'or-gate-master',
    title: 'ORゲート - 寛容な選択肢',
    description: '「どちらか一つでもOK」という柔軟な判断を学ぼう！',
    objective: 'ORゲートの動作を理解し、ANDとの違いを明確にする',
    difficulty: 'beginner',
    estimatedMinutes: 15,
    prerequisites: ['and-gate-master'],
    category: 'basics',
    icon: '🌈',
    steps: [
      {
        id: 'or-concept',
        instruction: 'ORゲートは寛容な案内人です。「条件A OR 条件B」のどちらか一つでも満たされれば、通してくれます。',
        action: { type: 'explanation', content: '例：お店の支払い「現金 OR クレジットカード」どちらでもOK\n\n🤔 ANDゲートとの違い：ANDは「両方必要」、ORは「どちらか一つでOK」' }
      },
      {
        id: 'build-or-circuit',
        instruction: '【回路作成】ANDゲートの時と同じ配置で、今度はORゲートを使った回路を作りましょう。①INPUT×2 ②OR×1 ③OUTPUT×1を配置して接続してください。',
        action: { type: 'place-gate', gateType: 'INPUT' },
        hint: '前回と同じレイアウトにすると、比較しやすくなります',
        validation: { type: 'gate-placed' }
      },
      {
        id: 'or-test-prep',
        instruction: '【実験準備】ANDゲートとの違いを体感するため、同じ4つの組み合わせをテストします。特に「片方だけON」の時の違いに注目してください！',
        action: { type: 'explanation', content: '🔍 観察ポイント：ANDでは0だった「0+1」「1+0」の結果はどうなるでしょうか？' }
      },
      {
        id: 'or-test-00',
        instruction: '【テスト1: 0+0】両方のINPUTをグレー（OFF）のままで観察。ANDと同じ結果になるはずです。',
        action: { type: 'observe', highlight: ['OUTPUT'] },
        hint: '結果：OUTPUTはグレー（0）'
      },
      {
        id: 'or-test-01',
        instruction: '【テスト2: 0+1】下のINPUTをダブルクリックして緑（ON）に。ここがANDとの最初の違いです！',
        action: { type: 'toggle-input', gateId: 'INPUT-2', value: true },
        hint: '🎉 OUTPUTが緑になりました！ANDでは0でしたね'
      },
      {
        id: 'or-test-10',
        instruction: '【テスト3: 1+0】上だけONにしてみましょう。下をOFFに戻し、上をONにしてください。',
        action: { type: 'toggle-input', gateId: 'INPUT-1', value: true },
        hint: '片方だけでもOUTPUTは緑のまま！'
      },
      {
        id: 'or-test-11',
        instruction: '【テスト4: 1+1】両方をONにしてみましょう。',
        action: { type: 'toggle-input', gateId: 'INPUT-2', value: true },
        hint: '当然、OUTPUTは緑です'
      },
      {
        id: 'or-pattern-discovery',
        instruction: '【パターン分析】実験結果を整理しましょう。',
        action: { type: 'explanation', content: '📝 記号の説明：\n「0+0=0」の「+」は論理演算を表します。\n「入力1 + 入力2 = 出力」という意味です。\n\n📊 実験結果まとめ：\n0+0=0（両方OFF → 出力OFF）\n0+1=1（片方だけON → 出力ON）\n1+0=1（片方だけON → 出力ON）\n1+1=1（両方ON → 出力ON）\n\n💡 発見：ORゲートが0を出力するのは「両方とも0」の時だけ！\n\n📊 ANDとORの比較\nAND: 0+0=0, 0+1=0, 1+0=0, 1+1=1\nOR:  0+0=0, 0+1=1, 1+0=1, 1+1=1' }
      },
      {
        id: 'or-quiz',
        instruction: '理解度チェック：ORゲートはいつOUTPUTが0になりますか？',
        action: {
          type: 'quiz',
          question: 'ORゲートで出力が0になるのは？',
          options: ['どちらか一方が0の時', '両方が0の時', '両方が1の時', '決して0にならない'],
          correct: 1
        },
        validation: { type: 'quiz-answered' }
      },
      {
        id: 'or-real-world',
        instruction: '【実世界での活用】ORゲートは「選択肢」と「冗長性」を提供します：',
        action: { type: 'explanation', content: '🚨 火災報知器：煙検知 OR 熱検知 → アラーム発動\n🚪 自動ドア：人感センサー OR ボタン押下 → ドア開く\n🛑 非常停止：手動ボタン OR 異常検知 → 機械停止\n💳 支払い：現金 OR カード OR 電子マネー → 決済可能\n\n複数の方法で同じ目的を達成できる柔軟性を提供します！' }
      }
    ]
  },

  {
    id: 'xor-gate-detective',
    title: 'XORゲート - 違いを見つける探偵',
    description: '「違い」を検出する特別な能力を持つゲートを学ぼう！',
    objective: 'XORゲートの特殊な動作を理解し、実用例を学ぶ',
    difficulty: 'beginner',
    estimatedMinutes: 18,
    prerequisites: ['or-gate-master'],
    category: 'basics',
    icon: '✨',
    steps: [
      {
        id: 'xor-concept',
        instruction: 'XORゲートは「違い探偵」です。「A と B が違っている時」だけ反応します。同じ時は無反応です。',
        action: { type: 'explanation', content: '「排他的OR（eXclusive OR）」＝「どちらか一方だけ」という意味\n\n🤔 ORとの違い：ORは「少なくとも一つ」、XORは「ちょうど一つ」' }
      },
      {
        id: 'build-xor-circuit',
        instruction: '【回路作成】今度はXORゲートで回路を作ります。これまでと同じレイアウトで、中央にXORゲートを配置してください。',
        action: { type: 'place-gate', gateType: 'INPUT' },
        hint: 'XORゲートは記号が特徴的です（弧が2本）',
        validation: { type: 'gate-placed' }
      },
      {
        id: 'xor-prediction',
        instruction: '【予想してみよう】テストする前に予想してみましょう。「違いを見つける」という性質から、どんな結果になると思いますか？',
        action: { type: 'explanation', content: '🤔 考えてみて：\n・同じ値（0と0、1と1）→ 違いなし → ？\n・違う値（0と1、1と0）→ 違いあり → ？' }
      },
      {
        id: 'xor-test-00',
        instruction: '【テスト1: 0+0】両方OFF（同じ値）での結果を確認します。',
        action: { type: 'observe', highlight: ['OUTPUT'] },
        hint: '同じ値なので「違いなし」→ OUTPUTは0'
      },
      {
        id: 'xor-test-01',
        instruction: '【テスト2: 0+1】下のINPUTを緑（ON）にして、違う値にしてみましょう。',
        action: { type: 'toggle-input', gateId: 'INPUT-2', value: true },
        hint: '✨ 違いを検出！OUTPUTが緑になりました'
      },
      {
        id: 'xor-test-10',
        instruction: '【テスト3: 1+0】上下を入れ替えても同じでしょうか？下をOFF、上をONにしてください。',
        action: { type: 'toggle-input', gateId: 'INPUT-1', value: true },
        hint: '違う値なので、やはりOUTPUTは緑！'
      },
      {
        id: 'xor-test-11',
        instruction: '【テスト4: 1+1】最後に両方ON（同じ値）にしてみましょう。ORとは違う結果になるはずです！',
        action: { type: 'toggle-input', gateId: 'INPUT-2', value: true },
        hint: '⚡ 同じ値なので「違いなし」→ OUTPUTは0に戻りました！'
      },
      {
        id: 'xor-pattern-analysis',
        instruction: '【パターン完全解析】XORの真理値表が完成しました！',
        action: { type: 'explanation', content: '📊 3つのゲートの比較\n\n入力 | AND | OR | XOR\n-----|-----|----|----- \n0, 0 |  0  | 0  |  0\n0, 1 |  0  | 1  |  1  ← XORとORは同じ\n1, 0 |  0  | 1  |  1  ← XORとORは同じ\n1, 1 |  1  | 1  |  0  ← ここが違う！\n\n💡 XORの特徴：「違う時だけ1」' }
      },
      {
        id: 'xor-magic',
        instruction: '【XORの魔法】XORには不思議な性質があります：同じ値を2回XORすると元に戻る！',
        action: { type: 'explanation', content: '🔐 暗号化の例：\n1. メッセージ：1010\n2. 暗号鍵：1100\n3. 暗号化：1010 XOR 1100 = 0110\n4. 復号化：0110 XOR 1100 = 1010（元に戻った！）\n\nこの性質で簡単な暗号が作れます' }
      },
      {
        id: 'xor-quiz',
        instruction: '理解度チェック：XORゲートが1を出力するのはどんな時？',
        action: {
          type: 'quiz',
          question: 'XORゲートが1を出力するのは？',
          options: [
            '両方の入力が同じ値の時',
            '両方の入力が違う値の時',
            '少なくとも一つが1の時',
            '両方が1の時'
          ],
          correct: 1
        }
      },
      {
        id: 'xor-applications',
        instruction: '【実世界での活用】XORは「違い」と「切り替え」の達人です：',
        action: { type: 'explanation', content: '🔄 スイッチ切り替え：現在の状態 XOR 1 = 反転\n🔐 簡易暗号：データ XOR 鍵 = 暗号化\n✅ エラー検出：データのパリティチェック\n➕ 半加算器：1桁の足し算（XORで和を計算）\n🎮 ゲーム：2つのボタンの同時押し禁止\n\n「違い」を活用する場面で大活躍！' }
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
    estimatedMinutes: 30,
    prerequisites: ['half-adder'],
    category: 'combinational',
    icon: '🔢',
    steps: [
      {
        id: 'full-adder-need',
        instruction: '半加算器では「前の桁からの桁上がり」を処理できませんでした。全加算器は3つの入力（A、B、前の桁上がり）を処理します。',
        action: { type: 'explanation', content: '📊 筆算の例：\n  1← 桁上がり\n  123\n+ 456\n-----\n  579\n\n各桁で3つの数（A、B、桁上がり）を足す必要があります' }
      },
      {
        id: 'full-adder-analysis',
        instruction: '【設計分析】3つの数を足すと、結果はどうなるでしょうか？',
        action: { type: 'explanation', content: '🎯 全加算器の真理値表：\nA B Cin | Sum Cout\n--------|----------\n0 0  0  |  0   0   (0+0+0=00)\n0 0  1  |  1   0   (0+0+1=01)\n0 1  0  |  1   0   (0+1+0=01)\n0 1  1  |  0   1   (0+1+1=10)\n1 0  0  |  1   0   (1+0+0=01)\n1 0  1  |  0   1   (1+0+1=10)\n1 1  0  |  0   1   (1+1+0=10)\n1 1  1  |  1   1   (1+1+1=11)' }
      },
      {
        id: 'place-three-inputs',
        instruction: '【入力配置】3つのINPUTを縦に配置します。上から順に：A（加数1）、B（加数2）、Cin（桁上がり入力）',
        action: { type: 'place-gate', gateType: 'INPUT' },
        hint: '左側に縦に並べると、信号の流れが見やすくなります',
        validation: { type: 'gate-placed' }
      },
      {
        id: 'full-adder-design',
        instruction: '【回路設計】全加算器の論理式を理解しましょう。',
        action: { type: 'explanation', content: '🔧 全加算器の設計：\n\n【和（Sum）の計算】\nSum = A XOR B XOR Cin\n（3つの値の中で奇数個が1の時に1）\n\n【桁上がり（Cout）の計算】\nCout = (A AND B) OR (Cin AND (A XOR B))\n（2つ以上が1の時に1）\n\n💡 なぜこの式？\n・XOR3つ：奇数個の1を検出\n・桁上がり：過半数（2個以上）の1を検出' }
      },
      {
        id: 'place-first-xor',
        instruction: '【XOR配置1】まず最初のXORゲートを配置します。これはAとBを比較します。',
        action: { type: 'place-gate', gateType: 'XOR', position: { x: 300, y: 150 } },
        hint: '中央より少し左に配置すると、後の接続が楽になります'
      },
      {
        id: 'connect-ab-xor',
        instruction: '【接続1】AとBを最初のXORゲートに接続します。A→XOR上側、B→XOR下側です。',
        action: { type: 'connect-wire', from: 'A', to: 'XOR' },
        hint: 'この出力は「A XOR B」（中間結果）になります'
      },
      {
        id: 'place-second-xor',
        instruction: '【XOR配置2】2つ目のXORゲートを配置します。これは中間結果とCinを比較します。',
        action: { type: 'place-gate', gateType: 'XOR', position: { x: 500, y: 200 } },
        hint: '最初のXORの右側に配置します'
      },
      {
        id: 'connect-sum-logic',
        instruction: '【接続2】最初のXORの出力を2つ目のXORの上側に、Cinを下側に接続します。',
        action: { type: 'connect-wire', from: 'XOR1', to: 'XOR2' },
        hint: 'これで Sum = A XOR B XOR Cin が完成！'
      },
      {
        id: 'place-and-gates',
        instruction: '【AND配置】桁上がり計算用に2つのANDゲートを配置します。',
        action: { type: 'place-gate', gateType: 'AND' },
        hint: '1つはA AND B用、もう1つはCin AND (A XOR B)用です'
      },
      {
        id: 'connect-and1',
        instruction: '【接続3】最初のANDゲートにAとBを接続します（A AND B）。',
        action: { type: 'connect-wire', from: 'A', to: 'AND1' },
        hint: 'AとBの両方が1の時の桁上がりを検出'
      },
      {
        id: 'connect-and2',
        instruction: '【接続4】2つ目のANDゲートに、最初のXORの出力とCinを接続します。',
        action: { type: 'connect-wire', from: 'XOR1', to: 'AND2' },
        hint: 'A XOR Bが1で、かつCinも1の時の桁上がりを検出'
      },
      {
        id: 'place-or-gate',
        instruction: '【OR配置】最後にORゲートを配置します。2つのANDの出力をまとめます。',
        action: { type: 'place-gate', gateType: 'OR', position: { x: 600, y: 300 } }
      },
      {
        id: 'connect-carry-logic',
        instruction: '【接続5】両方のANDゲートの出力をORゲートに接続します。',
        action: { type: 'connect-wire', from: 'AND1', to: 'OR' },
        hint: 'どちらかのANDが1なら桁上がり発生'
      },
      {
        id: 'place-outputs',
        instruction: '【出力配置】2つのOUTPUTを配置します。上がSum（和）、下がCout（桁上がり）です。',
        action: { type: 'place-gate', gateType: 'OUTPUT' },
        hint: '右端に縦に並べます'
      },
      {
        id: 'connect-final-outputs',
        instruction: '【最終接続】2つ目のXORをSum出力に、ORをCout出力に接続します。',
        action: { type: 'connect-wire', from: 'XOR2', to: 'Sum' },
        validation: { type: 'circuit-complete' }
      },
      {
        id: 'test-000',
        instruction: '【テスト1】0+0+0を確認。全てのINPUTをOFF（0）のままにします。',
        action: { type: 'observe' },
        hint: '期待：Sum=0、Cout=0'
      },
      {
        id: 'test-001',
        instruction: '【テスト2】0+0+1を確認。Cinだけを緑（1）にします。',
        action: { type: 'toggle-input', gateId: 'Cin', value: true },
        hint: '期待：Sum=1、Cout=0（桁上がりなし）'
      },
      {
        id: 'test-011',
        instruction: '【テスト3】0+1+1を確認。BとCinを緑（1）にします。',
        action: { type: 'toggle-input', gateId: 'B', value: true },
        hint: '期待：Sum=0、Cout=1（2つの1で桁上がり発生）'
      },
      {
        id: 'test-111',
        instruction: '【テスト4：最大】1+1+1を確認。全てのINPUTを緑（1）にします。',
        action: { type: 'toggle-input', gateId: 'A', value: true },
        hint: '期待：Sum=1、Cout=1（3は2進数で11）'
      },
      {
        id: 'full-adder-insight',
        instruction: '【理解の確認】全加算器の本質を理解しましょう。',
        action: { type: 'explanation', content: '💡 重要な洞察：\n\n1. Sumは「奇数判定器」\n   - 1が奇数個（1個か3個）なら1\n   - 1が偶数個（0個か2個）なら0\n\n2. Coutは「過半数判定器」\n   - 1が2個以上なら1\n   - 1が1個以下なら0\n\nこの2つの判定で、3つの数の和を正確に計算できます！' }
      },
      {
        id: 'full-adder-applications',
        instruction: '【応用】全加算器は多桁計算の基本ブロックです。',
        action: { type: 'explanation', content: '🔗 全加算器の使い道：\n・多桁加算器：チェーン接続で何桁でも\n・減算器：2の補数と組み合わせて\n・乗算器：部分積の加算に使用\n・BCD演算：10進数の計算\n\n次のレッスンで4ビット加算器を作ります！' }
      }
    ]
  },

  {
    id: '4bit-adder',
    title: '4ビット加算器 - 複数桁の計算',
    description: '全加算器を4つ繋げて、15+15のような計算を実現しよう！',
    objective: '全加算器をチェーンして多桁計算回路を構築する',
    difficulty: 'intermediate',
    estimatedMinutes: 35,
    prerequisites: ['full-adder'],
    category: 'combinational',
    icon: '🔗',
    steps: [
      {
        id: 'chain-concept',
        instruction: '4ビット加算器は4つの全加算器をチェーン接続します。各桁の桁上がり出力を次の桁の桁上がり入力に接続します。',
        action: { type: 'explanation', content: '🧮 筆算の仕組み：\n  0011 (3)\n+ 0101 (5)\n-------\n  1000 (8)\n\n各桁の桁上がりが次の桁に伝わる様子を回路で実現します' }
      },
      {
        id: '4bit-architecture',
        instruction: '【設計概要】4ビット加算器の構造を理解しましょう。',
        action: { type: 'explanation', content: '📐 必要なコンポーネント：\n・全加算器（FA）×4個 - 各桁の計算用\n・INPUT×8個 - A0-A3（4ビット）、B0-B3（4ビット）\n・OUTPUT×5個 - S0-S3（4ビット和）、Cout（最終桁上がり）\n\n🔗 接続ルール：\nFA0のCout → FA1のCin\nFA1のCout → FA2のCin\nFA2のCout → FA3のCin\nFA3のCout → 最終Cout' }
      },
      {
        id: 'prepare-workspace',
        instruction: '【準備】作業スペースを整理しましょう。この回路は大きくなるので、キャンバスを広く使います。',
        action: { type: 'explanation', content: '💡 配置のコツ：\n・左側：入力（A0-A3、B0-B3）を縦に並べる\n・中央：全加算器を横一列に配置\n・右側：出力（S0-S3、Cout）を縦に並べる\n\nズーム機能（左下のボタン）を使って全体を見渡せるようにしましょう' }
      },
      {
        id: 'place-inputs-a',
        instruction: '【入力配置1】まずA側の入力（A0-A3）を配置します。左端に縦に4つのINPUTを並べてください。上からA3、A2、A1、A0の順です。',
        action: { type: 'place-gate', gateType: 'INPUT' },
        hint: '最上位ビット（A3）を一番上に配置すると、2進数表記と一致して分かりやすくなります'
      },
      {
        id: 'place-inputs-b',
        instruction: '【入力配置2】次にB側の入力（B0-B3）を配置します。A入力の少し右側に、同じく縦に4つ並べてください。',
        action: { type: 'place-gate', gateType: 'INPUT' },
        hint: '各桁のAとBが横に並ぶように配置します'
      },
      {
        id: 'create-fa-components',
        instruction: '【全加算器の準備】ここで問題です。全加算器（FA）は基本ゲートではないので、自分で作る必要があります！',
        action: { type: 'explanation', content: '🔧 全加算器の作り方：\n1. カスタムゲート機能を使う（推奨）\n2. または、各桁ごとに手動で構築\n\n今回は練習のため、最初の1桁分（FA0）を手動で作ってみましょう' }
      },
      {
        id: 'build-fa0',
        instruction: '【FA0構築】最下位桁（0桁目）の全加算器を作ります。A0、B0、Cin（最初は0固定）を入力として、S0とC1を出力します。',
        action: { type: 'explanation', content: '📝 FA0の回路：\n・XOR1：A0 XOR B0 → 中間結果\n・XOR2：中間結果 XOR Cin → S0（和）\n・AND1：A0 AND B0\n・AND2：中間結果 AND Cin\n・OR1：AND1 OR AND2 → C1（桁上がり）\n\n※Cin は最初の桁なので、OFFのINPUTを追加' }
      },
      {
        id: 'connect-fa0',
        instruction: '【FA0接続】配置したゲートを接続して、最初の全加算器を完成させます。',
        action: { type: 'connect-wire', from: 'A0', to: 'XOR1' },
        hint: '複雑な接続なので、ワイヤーが交差しても構いません。機能が正しければOKです'
      },
      {
        id: 'test-fa0',
        instruction: '【FA0テスト】最初の桁が正しく動作するか確認しましょう。A0=1、B0=1にすると、S0=0、C1=1になるはずです。',
        action: { type: 'observe' },
        hint: '1+1=10（2進数）なので、0桁目は0、桁上がりが1'
      },
      {
        id: 'build-remaining-fas',
        instruction: '【残りのFA構築】同様にFA1、FA2、FA3を構築します。重要：各FAのCin入力には、前のFAのCout出力を接続してください。',
        action: { type: 'explanation', content: '⚡ 時短のヒント：\n1. FA0をグループ選択してコピー\n2. 3回ペーストしてFA1-FA3を作成\n3. 桁上がりの接続を追加\n\nまたは、カスタムゲート機能でFAを作成して再利用' }
      },
      {
        id: 'connect-carry-chain',
        instruction: '【桁上がりチェーン】各全加算器の桁上がりを接続します：FA0のCout→FA1のCin、FA1のCout→FA2のCin、FA2のCout→FA3のCin',
        action: { type: 'connect-wire', from: 'FA0-Cout', to: 'FA1-Cin' },
        hint: 'この「キャリーチェーン」が4ビット加算器の心臓部です'
      },
      {
        id: 'place-outputs',
        instruction: '【出力配置】右端に5つのOUTPUTを配置します。上からCout、S3、S2、S1、S0の順です。',
        action: { type: 'place-gate', gateType: 'OUTPUT' },
        hint: '最終的な桁上がり（Cout）も重要な出力です'
      },
      {
        id: 'connect-outputs',
        instruction: '【出力接続】各FAの和出力（S）を対応するOUTPUTに接続し、FA3のCoutを最上位のOUTPUTに接続します。',
        action: { type: 'connect-wire', from: 'FA0-S', to: 'S0' },
        validation: { type: 'circuit-complete' }
      },
      {
        id: 'test-simple-addition',
        instruction: '【テスト1：簡単な足し算】3 + 5 = 8 を計算してみましょう。A=0011、B=0101に設定してください。',
        action: { type: 'observe' },
        hint: '結果：S=1000（8）、Cout=0'
      },
      {
        id: 'test-with-carry',
        instruction: '【テスト2：桁上がりあり】7 + 9 = 16 を計算します。A=0111、B=1001に設定してください。',
        action: { type: 'observe' },
        hint: '結果：S=0000、Cout=1（つまり10000 = 16）'
      },
      {
        id: 'test-maximum',
        instruction: '【テスト3：最大値】15 + 15 = 30 を計算します。A=1111、B=1111に設定してください。',
        action: { type: 'observe' },
        hint: '結果：S=1110（14）、Cout=1（つまり11110 = 30）'
      },
      {
        id: '4bit-applications',
        instruction: '【実用例】4ビット加算器の応用',
        action: { type: 'explanation', content: '🖥️ 実際の使用例：\n・CPU：ALU（演算装置）の基本要素\n・デジタル信号処理：音声・画像の演算\n・暗号化：モジュラー演算\n・ゲーム：スコア計算、座標演算\n\n現代のCPUは64ビット加算器を持ち、原理は同じです！' }
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
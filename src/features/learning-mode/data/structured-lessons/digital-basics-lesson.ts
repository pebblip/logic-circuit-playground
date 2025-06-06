import type { StructuredLesson } from '../../../../types/lesson-content';

export const digitalBasicsStructuredLesson: StructuredLesson = {
  id: 'digital-basics',
  title: 'デジタルって何？',
  description: '0と1だけで作られる魔法の世界を探検しよう！',
  objective:
    'デジタル技術の基礎を理解し、なぜコンピュータが2進数を使うかを体験的に学びます',
  difficulty: 'beginner',
  prerequisites: [],
  estimatedMinutes: 15,
  availableGates: ['INPUT', 'OUTPUT'],
  steps: [
    {
      id: 'welcome',
      instruction: 'ようこそ！デジタルの世界へ！',
      content: [
        {
          type: 'text',
          text: '今から、コンピュータの頭の中を探検します。準備はいいですか？',
        },
        {
          type: 'heading',
          text: '🤖 コンピュータの秘密',
        },
        {
          type: 'text',
          text: 'スマホもゲーム機もパソコンも、実は「0」と「1」だけで動いています！',
        },
        {
          type: 'note',
          text: '💡 豆知識：世界初のコンピュータENIAC（1946年）は、約18,000本の真空管を使って、たった10進数の10桁を計算するので1秒かかりました。今のスマホは1秒間に数十億回の計算ができます！',
        },
      ],
    },
    {
      id: 'analog-vs-digital',
      instruction: 'アナログとデジタルの違い',
      content: [
        {
          type: 'heading',
          text: '📻 アナログの世界',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '音量つまみ：0〜100まで無限の値（20.5、20.51、20.512...）',
            '温度計：水銀が連続的に上下（20.5℃、20.51℃、20.512℃...）',
            '時計の針：秒針がなめらかに回転（スムーズムーブメント）',
            'レコード盤：音の溝が螺旋状に継続（アナログレコード）',
            '人の声：音波は継続的に変化する波形',
          ],
        },
        {
          type: 'heading',
          text: '💻 デジタルの世界',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'スイッチ：ONかOFFの2状態のみ（中間はない）',
            'デジタル時計：12:34 → 12:35（瞬間的に変化）',
            'コンピュータ：0か1だけ（全ての情報を0と1で表現）',
            'CD/DVD：ピットと呼ばれる小さな穴の有無で0と1',
            'デジタルカメラ：光を数値化（256段階などの飛び飛びの値）',
          ],
        },
        {
          type: 'note',
          text: '🎯 ポイント：デジタルは「飛び飛びの値」、アナログは「連続的な値」が特徴です！',
        },
      ],
    },
    {
      id: 'why-binary',
      instruction: 'なぜ0と1だけ？',
      content: [
        {
          type: 'heading',
          text: '🔌 電気で考えよう',
        },
        {
          type: 'text',
          text: 'コンピュータの中は電気で動いています。でもなぜ2つの状態だけなのでしょう？',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '電気が流れている = 1（ON） = 高電圧（例：5V）',
            '電気が流れていない = 0（OFF） = 低電圧（例：0V）',
          ],
        },
        {
          type: 'heading',
          text: '🔍 2進数を選んだ理由',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '🎯 正確性：2つの状態は明確に区別できる（中間がない）',
            '⚡ 高速性：判断が簡単で高速処理が可能',
            '🛡️ 耐ノイズ性：雑音に強い（少しの電圧変化は無視できる）',
            '💰 経済性：回路がシンプルで安価に製造できる',
          ],
        },
        {
          type: 'note',
          text: '🎆 実際には、3進法や5進法のコンピュータも研究されましたが、2進法のシンプルさと実用性には勝てませんでした！',
        },
      ],
    },
    {
      id: 'bit-concept',
      instruction: '【重要】ビットという単位',
      content: [
        {
          type: 'heading',
          text: '🎯 1ビット = 0か1を表す最小単位',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '1ビット = 2通りの状態（0と1）',
            '8ビット = 1バイト = 256通りの状態',
            '1KB = 1,024バイト ≈ 8,000ビット',
            '1MB = 1,024KB ≈ 800万ビット',
            '1GB = 1,024MB ≈ 80億ビット',
          ],
        },
        {
          type: 'note',
          text: '📱 例：スマホの写真1枚（3MB）は約240万個の「0」と「1」でできています！',
        },
      ],
    },
    {
      id: 'first-circuit',
      instruction: '初めての回路を作ってみよう！',
      hint: 'ツールパレットから「入力」をドラッグして配置してください',
      content: [
        {
          type: 'text',
          text: 'まずはスイッチ（入力）を1つ配置してみましょう。これが1ビットを表現します。',
        },
        {
          type: 'note',
          text: '🔧 操作ヒント：ドラッグ＆ドロップで配置できます',
        },
      ],
      action: { type: 'place-gate', gateType: 'INPUT' },
    },
    {
      id: 'add-output',
      instruction: 'ランプ（出力）を追加',
      hint: '入力の右側に出力を配置してください',
      content: [
        {
          type: 'text',
          text: 'スイッチの状態を見るためのランプを配置します。',
        },
      ],
      action: { type: 'place-gate', gateType: 'OUTPUT' },
    },
    {
      id: 'connect-wire',
      instruction: '配線してみよう！',
      hint: '入力の右の丸と出力の左の丸をクリックして接続',
      content: [
        {
          type: 'note',
          text: '配線は電気の通り道です。これで回路が完成！',
        },
      ],
      action: { type: 'connect-wire' },
    },
    {
      id: 'test-circuit',
      instruction: 'スイッチを押してみよう！',
      content: [
        {
          type: 'text',
          text: '入力をダブルクリックすると...',
        },
        {
          type: 'list',
          ordered: false,
          items: ['OFF（0）', 'ON（1）'],
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'observation',
      instruction: '何が起きた？',
      content: [
        {
          type: 'heading',
          text: '💡 観察結果',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'スイッチOFF → ランプ消灯（0→0）',
            'スイッチON → ランプ点灯（1→1）',
          ],
        },
        {
          type: 'text',
          text: 'これが最もシンプルなデジタル回路です！',
        },
      ],
    },
    {
      id: 'binary-numbers',
      instruction: '【発展】2進数の世界',
      content: [
        {
          type: 'heading',
          text: '🔢 10進数 vs 2進数',
        },
        {
          type: 'table',
          headers: ['10進数', '2進数', 'ビット数'],
          rows: [
            ['0', '0', '1ビット'],
            ['1', '1', '1ビット'],
            ['2', '10', '2ビット'],
            ['3', '11', '2ビット'],
            ['4', '100', '3ビット'],
            ['5', '101', '3ビット'],
            ['8', '1000', '4ビット'],
            ['15', '1111', '4ビット'],
            ['16', '10000', '5ビット'],
            ['255', '11111111', '8ビット'],
          ],
        },
        {
          type: 'text',
          text: '2進数は0と1だけで全ての数を表現できます！',
        },
        {
          type: 'note',
          text: '💡 覚え方：nビットで表現できる最大値 = 2^n - 1（例：8ビット = 2^8 - 1 = 255）',
        },
      ],
    },
    {
      id: 'real-examples',
      instruction: '身の回りのデジタル',
      content: [
        {
          type: 'heading',
          text: '📱 実はこれも0と1',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '📷 写真：各ピクセルのRGB値を各256段階（8ビット）で記録',
            '🎵 音楽：音波を1秒44,100回サンプリング（CD音質）',
            '🎥 動画：1秒30コマの連続写真（フルHDで約2百万ピクセル）',
            '💬 テキスト：文字コード（例：「A」= 65 = 01000001）',
            '🎮 ゲーム：3Dモデル、テクスチャ、音声、全てが0と1',
          ],
        },
        {
          type: 'note',
          text: 'すべて0と1の組み合わせで表現されています！',
        },
      ],
    },
    {
      id: 'binary-practice',
      instruction: '【実践】身近な2進数',
      content: [
        {
          type: 'heading',
          text: '🎲 サイコロで数えてみよう',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '1 = 001 （⚀）',
            '2 = 010 （⚁）',
            '3 = 011 （⚂）',
            '4 = 100 （⚃）',
            '5 = 101 （⚄）',
            '6 = 110 （⚅）',
          ],
        },
        {
          type: 'text',
          text: 'サイコロの目を二進数として読むと、黒丸が1、空白が0に対応します！',
        },
      ],
    },
    {
      id: 'quiz',
      instruction: '理解度チェック！',
      content: [
        {
          type: 'quiz',
          question: 'コンピュータが使う数字は？',
          options: [
            '0〜9の10種類',
            '0と1の2種類だけ',
            '無限の種類',
            'アルファベットも使う',
          ],
          correctIndex: 1,
        },
      ],
    },
    {
      id: 'quiz2',
      instruction: '【応用クイズ】',
      content: [
        {
          type: 'quiz',
          question: '8ビットで表現できる最大の数は？',
          options: ['128', '255', '256', '1024'],
          correctIndex: 1,
        },
      ],
    },
    {
      id: 'next-step',
      instruction: '次のステップへ！',
      content: [
        {
          type: 'heading',
          text: '🎉 基礎マスター！',
        },
        {
          type: 'text',
          text: 'デジタルの基本がわかりました！',
        },
        {
          type: 'text',
          text: '次は、0と1を操作する「論理ゲート」について学びます。',
        },
        {
          type: 'note',
          text: 'これからもっと面白くなりますよ！',
        },
      ],
    },
  ],
};

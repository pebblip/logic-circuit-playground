import type { StructuredLesson } from '../../../../types/lesson-content';

export const multiplexerStructuredLesson: StructuredLesson = {
  id: 'multiplexer',
  title: 'マルチプレクサ - データ選択スイッチ',
  description: '複数の入力から1つを選んで出力する回路を作ります',
  difficulty: 'intermediate',
  prerequisites: ['decoder'],
  estimatedMinutes: 25,
  steps: [
    {
      id: 'intro',
      instruction: 'データの切り替えスイッチを作ろう！',
      content: [
        {
          type: 'text',
          text: '4つのセンサーからの信号を、1本の線で順番に送るには？',
        },
        {
          type: 'heading',
          text: '🤔 マルチプレクサ（MUX）とは？',
        },
        {
          type: 'text',
          text: '複数の入力から1つを選んで出力する「電子スイッチ」です。',
        },
        {
          type: 'note',
          text: 'テレビのチャンネル切り替えをイメージしてください！',
        },
      ],
    },
    {
      id: 'concept',
      instruction: '4-to-1 MUXの基本構造',
      content: [
        {
          type: 'heading',
          text: '📊 入出力の関係',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'データ入力：D0, D1, D2, D3（4本）',
            '選択入力：S1, S0（2ビット）',
            '出力：Y（1本）',
          ],
        },
        {
          type: 'table',
          headers: ['S1', 'S0', '選択される入力', '出力Y'],
          rows: [
            ['0', '0', 'D0', 'D0の値'],
            ['0', '1', 'D1', 'D1の値'],
            ['1', '0', 'D2', 'D2の値'],
            ['1', '1', 'D3', 'D3の値'],
          ],
        },
      ],
    },
    {
      id: 'logic-design',
      instruction: 'MUXの論理設計',
      content: [
        {
          type: 'heading',
          text: '🔧 出力の論理式',
        },
        {
          type: 'text',
          text: "Y = (D0 AND S1' AND S0') OR (D1 AND S1' AND S0) OR (D2 AND S1 AND S0') OR (D3 AND S1 AND S0)",
        },
        {
          type: 'heading',
          text: '💡 仕組みの理解',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '各データ入力にANDゲートで「門番」を配置',
            '選択信号で1つの門だけを開く',
            'ORゲートで全ての門の出力を集約',
          ],
        },
      ],
    },
    {
      id: 'simplified-design',
      instruction: '今回作る簡易版2-to-1 MUX',
      content: [
        {
          type: 'text',
          text: 'まずは2入力版から理解しましょう！',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'データ入力：D0, D1（2本）',
            '選択入力：S（1ビット）',
            'S=0ならD0、S=1ならD1を出力',
          ],
        },
        {
          type: 'note',
          text: '基本を理解すれば、4入力、8入力も同じ原理です',
        },
      ],
    },
    {
      id: 'place-data-inputs',
      instruction: 'データ入力を配置',
      hint: 'D0とD1の2つのINPUTを上下に配置',
      content: [
        {
          type: 'text',
          text: '選択したいデータ信号です。',
        },
      ],
      action: { type: 'place-gate', gateType: 'INPUT' },
    },
    {
      id: 'place-select-input',
      instruction: '選択信号を配置',
      hint: 'S（セレクト）用のINPUTを配置',
      content: [
        {
          type: 'text',
          text: 'S=0でD0、S=1でD1を選択します。',
        },
      ],
      action: { type: 'place-gate', gateType: 'INPUT' },
    },
    {
      id: 'place-not-gate',
      instruction: 'NOTゲートを配置',
      hint: 'S信号の反転用',
      content: [
        {
          type: 'text',
          text: "S'（Sの反転）を作ります。",
        },
      ],
      action: { type: 'place-gate', gateType: 'NOT' },
    },
    {
      id: 'place-and-gates',
      instruction: 'ANDゲートを2つ配置',
      hint: '各データ入力の「門番」役',
      content: [
        {
          type: 'text',
          text: '選択信号に応じて、データを通すか決めます。',
        },
      ],
      action: { type: 'place-gate', gateType: 'AND' },
    },
    {
      id: 'place-or-gate',
      instruction: 'ORゲートを配置',
      hint: '2つのANDの出力を集約',
      content: [
        {
          type: 'text',
          text: '選ばれたデータを出力に送ります。',
        },
      ],
      action: { type: 'place-gate', gateType: 'OR' },
    },
    {
      id: 'place-output',
      instruction: '出力を配置',
      hint: 'Y（出力）用のOUTPUT',
      content: [],
      action: { type: 'place-gate', gateType: 'OUTPUT' },
    },
    {
      id: 'connect-select-logic',
      instruction: '配線：選択信号の処理',
      hint: "SをNOTに接続、SとS'を各ANDに配線",
      content: [
        {
          type: 'text',
          text: "D0用AND：D0とS'、D1用AND：D1とS",
        },
      ],
      action: { type: 'connect-wire' },
    },
    {
      id: 'connect-data-gates',
      instruction: '配線：データ入力をANDへ',
      hint: 'D0とD1をそれぞれのANDゲートに接続',
      content: [],
      action: { type: 'connect-wire' },
    },
    {
      id: 'connect-output-logic',
      instruction: '配線：出力部分',
      hint: '2つのAND出力をORに、ORをOUTPUTに接続',
      content: [],
      action: { type: 'connect-wire' },
    },
    {
      id: 'test-select-d0',
      instruction: 'テスト1：D0を選択（S=0）',
      content: [
        {
          type: 'text',
          text: 'D0=1, D1=0, S=0にして、出力がD0と同じになることを確認',
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'test-select-d1',
      instruction: 'テスト2：D1を選択（S=1）',
      content: [
        {
          type: 'text',
          text: 'D0=0, D1=1, S=1にして、出力がD1と同じになることを確認',
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'test-switching',
      instruction: 'テスト3：動的切り替え',
      content: [
        {
          type: 'text',
          text: 'D0=1, D1=0のまま、Sを切り替えて出力が変わることを確認',
        },
        {
          type: 'note',
          text: 'リアルタイムでデータソースを切り替えられます！',
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'larger-mux',
      instruction: '【発展】より大きなMUX',
      content: [
        {
          type: 'heading',
          text: '🔢 8-to-1 MUX',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '8つのデータ入力（D0〜D7）',
            '3ビットの選択信号（S2, S1, S0）',
            '8個のANDゲート（3入力）',
            '1個の大きなORゲート（8入力）',
          ],
        },
        {
          type: 'note',
          text: '選択ビット数 = log₂(入力数)',
        },
      ],
    },
    {
      id: 'applications',
      instruction: '【応用】MUXの活用例',
      content: [
        {
          type: 'heading',
          text: '💻 実世界での使用',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '🎵 オーディオミキサー：複数の音源から選択',
            '📡 通信システム：複数チャンネルの時分割多重',
            '🖥️ CPU：レジスタやメモリからのデータ選択',
            '📹 ビデオスイッチャー：カメラ映像の切り替え',
            '🏭 センサーネットワーク：多数のセンサー読み取り',
          ],
        },
      ],
    },
    {
      id: 'demultiplexer',
      instruction: 'デマルチプレクサ（DEMUX）',
      content: [
        {
          type: 'heading',
          text: '🔄 MUXの逆操作',
        },
        {
          type: 'text',
          text: '1つの入力を複数の出力のどれかに振り分けます。',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'データ配送システム',
            'メモリへの書き込み制御',
            'ディスプレイの行選択',
          ],
        },
        {
          type: 'note',
          text: 'MUXとDEMUXで双方向通信システムが作れます！',
        },
      ],
    },
    {
      id: 'bus-system',
      instruction: 'バスシステムへの応用',
      content: [
        {
          type: 'heading',
          text: '🚌 データバス',
        },
        {
          type: 'text',
          text: 'MUXを使って複数のデバイスが1本のバスを共有',
        },
        {
          type: 'list',
          ordered: false,
          items: ['配線数の大幅削減', '柔軟なデータ経路', 'コスト削減'],
        },
      ],
    },
    {
      id: 'achievement',
      instruction: '🎉 MUXマスター！',
      content: [
        {
          type: 'heading',
          text: '🏆 習得したスキル',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '✅ データ選択回路の構築',
            '✅ 動的な信号切り替え',
            '✅ 効率的なデータ伝送',
            '✅ デジタルスイッチングの基礎',
          ],
        },
        {
          type: 'note',
          text: 'これでデータの流れを自在に制御できます！',
        },
      ],
    },
    {
      id: 'quiz',
      instruction: '理解度チェック！',
      content: [
        {
          type: 'quiz',
          question: '16-to-1 MUXに必要な選択信号のビット数は？',
          options: ['2ビット', '3ビット', '4ビット', '16ビット'],
          correctIndex: 2,
        },
      ],
    },
  ],
};

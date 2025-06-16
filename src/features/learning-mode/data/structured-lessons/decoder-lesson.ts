import type { StructuredLesson } from '../../../../types/lesson-content';
import { TERMS } from '../terms';

export const decoderStructuredLesson: StructuredLesson = {
  id: 'decoder',
  title: 'デコーダ - コードから信号を選択',
  description: 'バイナリコードから特定の出力を選択する回路を作ります',
  objective:
    'バイナリコードを個別の出力信号に変換する原理を理解し、デジタル表示システムの基礎を習得する',
  category: '基本回路',
  lessonType: 'build',
  difficulty: 'intermediate',
  prerequisites: ['encoder'],
  estimatedMinutes: 15,
  availableGates: ['INPUT', 'OUTPUT', 'AND', 'NOT'],
  steps: [
    {
      id: 'intro',
      instruction: 'コードを実際の動作に変換する仕組み',
      content: [
        {
          type: 'heading',
          text: '身近な例で考える',
        },
        {
          type: 'text',
          text: 'デジタル時計の「8」という数字表示を思い出してください。内部では「1000」という4ビットコードが、7つのセグメント（棒状のLED）すべてを光らせる信号に変換されています。',
        },
        {
          type: 'heading',
          text: 'デコーダとは',
        },
        {
          type: 'text',
          text: 'エンコーダの逆変換を行う回路です。バイナリコード（少数のビット）を、多数の個別出力のうち特定の1つまたは組み合わせに変換します。「選択器」の役割を果たします。',
        },
        {
          type: 'note',
          text: '時計、電卓、信号機など、数字や状態を表示する機器すべてで使われています',
        },
      ],
    },
    {
      id: 'principle',
      instruction: 'デコーダの電気的仕組み',
      content: [
        {
          type: 'heading',
          text: '2-to-4デコーダの構造',
        },
        {
          type: 'text',
          text: '2ビットの入力（A1A0）から4つの出力（Y0〜Y3）のうち、入力コードに対応する1つだけを選択してONにします。例えば、入力が「10」なら出力Y2だけがONになります。',
        },
        {
          type: 'heading',
          text: '変換の規則',
        },
        {
          type: 'table',
          headers: ['入力A1A0', '10進数', 'Y0', 'Y1', 'Y2', 'Y3', '動作'],
          rows: [
            ['00', '0', '1', '0', '0', '0', 'Y0のみON'],
            ['01', '1', '0', '1', '0', '0', 'Y1のみON'],
            ['10', '2', '0', '0', '1', '0', 'Y2のみON'],
            ['11', '3', '0', '0', '0', '1', 'Y3のみON'],
          ],
        },
        {
          type: 'heading',
          text: '論理式の導出',
        },
        {
          type: 'text',
          text: '各出力は特定の入力パターンを検出するAND回路です。Y0 = NOT(A1) AND NOT(A0)、Y1 = NOT(A1) AND A0、Y2 = A1 AND NOT(A0)、Y3 = A1 AND A0となります。',
        },
        {
          type: 'note',
          text: 'デコーダの核心は「パターン検出」です。各出力が特定の入力組み合わせを待っています',
        },
      ],
    },
    {
      id: 'circuit-build',
      instruction: '2-to-4デコーダ回路を作ってみよう',
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
            '上がA1（上位ビット）、下がA0（下位ビット）です。',
          ],
        },
        {
          type: 'heading',
          text: '手順２：対象ゲートを配置',
        },
        {
          type: 'rich-text',
          elements: [
            { text: `${TERMS.NOT}ゲート`, emphasis: true },
            'を2つ配置（反転信号用）。',
            { text: `${TERMS.AND}ゲート`, emphasis: true },
            'を4つ配置（各出力のパターン検出用）。',
            '各ANDゲートが特定の入力組み合わせを検出します。',
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
            'を4つ配置します。',
            '上からY0、Y1、Y2、Y3の順に配置。',
            '入力に応じて1つだけが点灯します。',
          ],
        },
        {
          type: 'heading',
          text: '手順４：配線でつなげる',
        },
        {
          type: 'rich-text',
          elements: [
            '反転信号：A1とA0をそれぞれNOTゲートに接続。',
            'Y0：NOT(A1)とNOT(A0)を1つ目のANDに接続。',
            'Y1：NOT(A1)とA0を2つ目のANDに接続。',
            'Y2：A1とNOT(A0)を3つ目のANDに接続。',
            'Y3：A1とA0を4つ目のANDに接続。',
          ],
        },
        {
          type: 'note',
          text: '配線のコツ：各ANDゲートが検出する入力パターン（00,01,10,11）を意識する',
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
          text: '各入力パターンで、どの出力がONになるか予測してください。00→Y0、01→Y1、10→Y2、11→Y3になるはずです。',
        },
        {
          type: 'heading',
          text: '実験で確かめよう',
        },
        {
          type: 'rich-text',
          elements: [
            '1. 初期状態：A1=0、A0=0で、Y0だけがONを確認。',
            '2. A0を',
            { text: `${TERMS.DOUBLE_CLICK}`, emphasis: true },
            'してON（01状態）→Y1だけがONに変化。',
            '3. A1をON、A0をOFF（10状態）→Y2だけがONに変化。',
            '4. A0も再びON（11状態）→Y3だけがONに変化。',
          ],
        },
        {
          type: 'heading',
          text: '重要な観察ポイント',
        },
        {
          type: 'table',
          headers: ['入力', 'Y0', 'Y1', 'Y2', 'Y3', '合計'],
          rows: [
            ['00', '1', '0', '0', '0', '1個'],
            ['01', '0', '1', '0', '0', '1個'],
            ['10', '0', '0', '1', '0', '1個'],
            ['11', '0', '0', '0', '1', '1個'],
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: '発見：', bold: true },
            'どの入力でも必ず',
            { text: '1つだけ', emphasis: true },
            'の出力がONになります。',
            'これが選択機能の本質です。',
          ],
        },
        {
          type: 'note',
          text: '出力の合計が常に1なので、「1-of-4セレクタ」とも呼ばれます',
        },
      ],
    },
    {
      id: 'analysis',
      instruction: 'デコーダの特徴を分析しよう',
      content: [
        {
          type: 'heading',
          text: 'エンコーダとの関係',
        },
        {
          type: 'table',
          headers: ['回路', '入力', '出力', '機能', '用途例'],
          rows: [
            [
              'エンコーダ',
              '多数（ワンホット）',
              '少数（バイナリ）',
              '圧縮',
              'キーボード',
            ],
            [
              'デコーダ',
              '少数（バイナリ）',
              '多数（ワンホット）',
              '展開',
              '表示装置',
            ],
          ],
        },
        {
          type: 'heading',
          text: 'イネーブル信号の役割',
        },
        {
          type: 'text',
          text: '実用的なデコーダには「Enable」入力があり、Enable=0で全出力をOFFにできます。これにより複数のデコーダを切り替えて使用でき、メモリアドレス選択などで重要な機能です。',
        },
        {
          type: 'heading',
          text: '拡張性の考察',
        },
        {
          type: 'table',
          headers: ['入力ビット数', '出力数', 'ANDゲート数', '用途例'],
          rows: [
            ['2ビット', '4個', '4個', '基本セレクタ'],
            ['3ビット', '8個', '8個', '7セグメント制御'],
            ['4ビット', '16個', '16個', 'メモリアドレス'],
            ['6ビット', '64個', '64個', '大容量メモリ'],
          ],
        },
        {
          type: 'heading',
          text: '確率的な視点',
        },
        {
          type: 'text',
          text: 'ランダムな2ビット入力に対して、各出力がONになる確率は正確に25%です。これは4つの出力が平等に選ばれることを意味し、負荷分散の観点で理想的です。',
        },
        {
          type: 'note',
          text: 'デコーダの規模は入力ビット数に対して指数的に増加（2^n個の出力）',
        },
      ],
    },
    {
      id: 'applications',
      instruction: 'デコーダの実用例',
      content: [
        {
          type: 'heading',
          text: '実世界での活用',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '7セグメントディスプレイ：4ビット→7セグメント制御',
            'メモリアドレス選択：アドレスから特定のメモリセルを選択',
            '信号機制御：状態コードから適切な信号パターンを選択',
            'エレベーター表示：階数コードから対応する階数表示LED点灯',
            'CPU命令デコード：機械語命令から制御信号を生成',
          ],
        },
        {
          type: 'heading',
          text: '身近な製品での使用例',
        },
        {
          type: 'text',
          text: 'デジタル時計の数字表示、電卓の画面、カーナビの文字表示、LED看板の文字制御など、数字や文字を表示する機器のほぼすべてでデコーダが使われています。',
        },
        {
          type: 'note',
          text: '現代のディスプレイ技術の基礎となる重要な回路です',
        },
      ],
    },
    {
      id: 'summary',
      instruction: 'デコーダをマスター',
      content: [
        {
          type: 'heading',
          text: 'デコーダの要点',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'バイナリコードから特定の出力を選択',
            'ANDゲートとNOTゲートで特定パターンを検出',
            '常に1つだけの出力がON（1-of-nセレクタ）',
            'エンコーダと対になってデータ変換システムを構成',
          ],
        },
        {
          type: 'quiz',
          question: '3-to-8デコーダで入力が「101」のとき、ONになる出力は？',
          options: ['Y3', 'Y5', 'Y6', 'Y7'],
          correctIndex: 1,
        },
        {
          type: 'heading',
          text: '次回予告',
        },
        {
          type: 'rich-text',
          elements: [
            { text: 'マルチプレクサ', bold: true },
            'で、複数のデータから1つを選択する重要な回路を学びます。',
            'デコーダと組み合わせたデータ選択システムです。',
          ],
        },
        {
          type: 'note',
          text: 'エンコーダとデコーダの理解で、デジタル信号変換の基礎が完成しました',
        },
      ],
    },
  ],
};

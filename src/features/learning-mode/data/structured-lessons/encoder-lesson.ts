import type { StructuredLesson } from '../../../../types/lesson-content';
import { TERMS } from '../terms';

export const encoderStructuredLesson: StructuredLesson = {
  id: 'encoder',
  title: 'エンコーダ - 入力を数値に変換',
  description: '複数の入力から対応するバイナリコードを生成する回路を作ります',
  objective: 'ボタン入力をバイナリコードに変換する原理を理解し、デジタル入力システムの基礎を習得する',
  category: '基本回路',
  lessonType: 'build',
  difficulty: 'intermediate',
  prerequisites: ['comparator'],
  estimatedMinutes: 15,
  availableGates: ['INPUT', 'OUTPUT', 'OR'],
  steps: [
    {
      id: 'intro',
      instruction: 'たくさんのボタンを効率的に処理する方法',
      content: [
        {
          type: 'heading',
          text: '身近な例で考える',
        },
        {
          type: 'text',
          text: 'エレベーターのボタンパネルを思い出してください。10個以上のボタンがありますが、内部では各ボタンを数字として処理しています。10本の配線ではなく、4本で済むのはなぜでしょう？',
        },
        {
          type: 'heading',
          text: 'エンコーダとは',
        },
        {
          type: 'text',
          text: '「どのボタンが押されたか」を「バイナリコード（2進数）」に変換する装置です。10個のボタンなら4ビット（16通り）で表現でき、配線を大幅に削減できます。',
        },
        {
          type: 'note',
          text: 'キーボード、電話、ATMなど、ボタン入力がある機器すべてで使われています',
        },
      ],
    },
    {
      id: 'principle',
      instruction: 'エンコーダの電気的仕組み',
      content: [
        {
          type: 'heading',
          text: '4-to-2エンコーダの構造',
        },
        {
          type: 'text',
          text: '4つの入力（I0〜I3）から2ビットのコード（Y1,Y0）を生成します。各入力は「ボタン0」〜「ボタン3」に対応し、一度に1つだけがONになることを前提とします。',
        },
        {
          type: 'heading',
          text: '変換の規則',
        },
        {
          type: 'table',
          headers: ['押されたボタン', '入力状態', '出力Y1Y0', '10進数'],
          rows: [
            ['ボタン0', 'I0=1, 他は0', '00', '0'],
            ['ボタン1', 'I1=1, 他は0', '01', '1'],
            ['ボタン2', 'I2=1, 他は0', '10', '2'],
            ['ボタン3', 'I3=1, 他は0', '11', '3'],
          ],
        },
        {
          type: 'heading',
          text: '論理式の導出',
        },
        {
          type: 'text',
          text: 'Y0は「ボタン1またはボタン3」で1になるため、Y0 = I1 OR I3。Y1は「ボタン2またはボタン3」で1になるため、Y1 = I2 OR I3。ORゲートだけで実現できます。',
        },
        {
          type: 'note',
          text: '各出力ビットは、特定の入力の組み合わせで1になるパターンを持ちます',
        },
      ],
    },
    {
      id: 'circuit-build',
      instruction: '4-to-2エンコーダ回路を作ってみよう',
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
            'を4つ配置します。',
            '上からI0（ボタン0）、I1（ボタン1）、I2（ボタン2）、I3（ボタン3）です。',
          ],
        },
        {
          type: 'heading',
          text: '手順２：対象ゲートを配置',
        },
        {
          type: 'rich-text',
          elements: [
            { text: `${TERMS.OR}ゲート`, emphasis: true },
            'を2つ配置します。',
            '上のORゲートがY1（上位ビット）用、',
            '下のORゲートがY0（下位ビット）用です。',
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
            '上がY1（2の位）、下がY0（1の位）の出力です。',
          ],
        },
        {
          type: 'heading',
          text: '手順４：配線でつなげる',
        },
        {
          type: 'rich-text',
          elements: [
            'Y0の配線：I1とI3を下のORゲートに接続、その出力をY0へ。',
            'Y1の配線：I2とI3を上のORゲートに接続、その出力をY1へ。',
            '注意：I0はどこにも接続しません（00の出力のため）。',
            'I3は両方のORゲートに接続（11の出力のため）。',
          ],
        },
        {
          type: 'note',
          text: '配線のコツ：各ボタンの2進数表現を考えると配線パターンが見えてきます',
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
          text: '各ボタンを押したとき、2ビットの出力がどうなるか予測してください。ボタン0→00、ボタン1→01、ボタン2→10、ボタン3→11になるはずです。',
        },
        {
          type: 'heading',
          text: '実験で確かめよう',
        },
        {
          type: 'rich-text',
          elements: [
            '1. すべての入力を0にして初期状態を確認（出力：00）。',
            '2. I0だけを',
            { text: `${TERMS.DOUBLE_CLICK}`, emphasis: true },
            'してON→出力は00のまま。',
            '3. I0を戻し、I1をON→出力が01に変化。',
            '4. I1を戻し、I2をON→出力が10に変化。',
            '5. I2を戻し、I3をON→出力が11に変化。',
          ],
        },
        {
          type: 'heading',
          text: '実験結果の確認',
        },
        {
          type: 'table',
          headers: ['ボタン', 'I3I2I1I0', 'Y1Y0', '正しい？'],
          rows: [
            ['ボタン0', '0001', '00', '✓'],
            ['ボタン1', '0010', '01', '✓'],
            ['ボタン2', '0100', '10', '✓'],
            ['ボタン3', '1000', '11', '✓'],
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: '発見：', bold: true },
            '4つの入力状態が正確に2ビットのコードに',
            { text: '圧縮', emphasis: true },
            'されています。',
          ],
        },
        {
          type: 'note',
          text: '複数のボタンを同時に押すと予期しない出力になります（次の分析で詳しく）',
        },
      ],
    },
    {
      id: 'analysis',
      instruction: 'エンコーダの特徴を分析しよう',
      content: [
        {
          type: 'heading',
          text: '同時押しの問題',
        },
        {
          type: 'text',
          text: 'I1とI2を同時にONにすると、Y0=1（I1の影響）、Y1=1（I2の影響）となり、出力は11（ボタン3と同じ）になります。これは設計上の制限です。',
        },
        {
          type: 'heading',
          text: '優先エンコーダという解決策',
        },
        {
          type: 'table',
          headers: ['種類', '複数入力時', '回路規模', '用途'],
          rows: [
            ['通常エンコーダ', '誤動作', 'シンプル', '排他的入力が保証される場合'],
            ['優先エンコーダ', '最高優先度を出力', '複雑', 'キーボード、割り込み処理'],
          ],
        },
        {
          type: 'heading',
          text: '拡張性の考察',
        },
        {
          type: 'table',
          headers: ['入力数', '必要ビット数', 'ゲート数', '配線削減率'],
          rows: [
            ['4個', '2ビット', 'OR×2', '50%（4→2本）'],
            ['8個', '3ビット', 'OR×3', '62.5%（8→3本）'],
            ['16個', '4ビット', 'OR×4', '75%（16→4本）'],
            ['64個', '6ビット', 'OR×6', '90.6%（64→6本）'],
          ],
        },
        {
          type: 'heading',
          text: '確率的な視点',
        },
        {
          type: 'text',
          text: '各ボタンが等確率で押される場合、出力の各ビットが1になる確率は50%です（Y0はI1,I3で、Y1はI2,I3で1になるため）。',
        },
        {
          type: 'note',
          text: '入力数が増えるほど配線削減効果が大きくなり、実用的価値が高まります',
        },
      ],
    },
    {
      id: 'applications',
      instruction: 'エンコーダの実用例',
      content: [
        {
          type: 'heading',
          text: '実世界での活用',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'キーボード：104個のキーを7ビットコードに変換（スキャンコード）',
            'テンキー：0〜9の10個を4ビットBCDコードに変換',
            'エレベーター：階数ボタンをバイナリコードに変換して制御',
            '割り込みコントローラ：複数の割り込み要求を優先順位付きでコード化',
            'ADコンバータ：アナログ値をデジタルコードに変換',
          ],
        },
        {
          type: 'heading',
          text: '身近な製品での使用例',
        },
        {
          type: 'text',
          text: 'ATMのテンキー、電話機、リモコン、ゲームコントローラーなど、ボタン入力がある機器のほぼすべてでエンコーダが使われています。USBキーボードでは、エンコーダが生成したコードをPCに送信しています。',
        },
        {
          type: 'note',
          text: 'エンコーダなしでは、キーボードとPCを104本の線でつなぐ必要があります',
        },
      ],
    },
    {
      id: 'summary',
      instruction: 'エンコーダをマスター',
      content: [
        {
          type: 'heading',
          text: 'エンコーダの要点',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '複数の入力を少ないビット数のコードに変換',
            'ORゲートの組み合わせで実現可能',
            '配線数を大幅に削減（例：10本→4本）',
            '一度に1つの入力のみONが前提（通常版）',
          ],
        },
        {
          type: 'quiz',
          question: '8個の入力を扱うエンコーダの出力ビット数は？',
          options: [
            '2ビット',
            '3ビット',
            '4ビット',
            '8ビット',
          ],
          correctIndex: 1,
        },
        {
          type: 'heading',
          text: '次回予告',
        },
        {
          type: 'rich-text',
          elements: [
            { text: 'デコーダ', bold: true },
            'で、エンコーダの逆変換を学びます。',
            'バイナリコードから個別の出力を生成する重要な回路です。',
          ],
        },
        {
          type: 'note',
          text: 'エンコーダとデコーダはペアで使われ、デジタルシステムの基盤を形成します',
        },
      ],
    },
  ],
};
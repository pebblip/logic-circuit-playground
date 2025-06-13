import type { StructuredLesson } from '../../../../types/lesson-content';
import { TERMS } from '../terms';
export const xorGateStructuredLesson: StructuredLesson = {
  id: 'xor-gate',
  title: `${TERMS.XOR}ゲート - 排他的論理和！`,
  description: `2つの${TERMS.INPUT}が「異なる」ときだけ${TERMS.ON}になる特殊なゲートを学びます`,
  objective: `${TERMS.XOR}ゲートの動作原理を理解し、「排他的論理和」の概念を習得。実用的な応用例を学びます`,
  difficulty: 'beginner',
  prerequisites: ['and-gate', 'or-gate'],
  estimatedMinutes: 15,
  availableGates: ['INPUT', 'XOR', 'OUTPUT'],
  steps: [
    {
      id: 'intro',
      instruction: `${TERMS.XOR}ゲートは「違い」を検出する特殊なゲートです`,
      content: [
        {
          type: 'rich-text',
          elements: [
            { text: TERMS.XOR, gate: true },
            `ゲートは、2つの${TERMS.INPUT}が`,
            { text: '異なる値', emphasis: true },
            `のときだけ${TERMS.ON}を出力します。`,
          ],
        },
        {
          type: 'heading',
          text: '身近な例で考えると',
        },
        {
          type: 'text',
          text: 'エレベーターのボタンのようなものです。上ボタンか下ボタン、どちらか一方だけ押すと動きますが、両方同時に押すと動きません。',
        },
        {
          type: 'note',
          text: '「どちらか一方だけ」という条件は、日常生活でもよく使われています',
        },
      ],
    },
    {
      id: 'principle',
      instruction: 'XORゲートの電気的仕組み',
      content: [
        {
          type: 'heading',
          text: 'なぜ「XOR」（エックスオア）というの？',
        },
        {
          type: 'rich-text',
          elements: [
            'XORは英語の',
            { text: 'eXclusive OR', emphasis: true },
            'の略です。',
            { text: '「どちらか一方だけ」', bold: true },
            'という意味で、両方ONのときは',
            { text: '除外（eXclude）', emphasis: true },
            'されるので出力がOFFになります。',
          ],
        },
        {
          type: 'heading',
          text: '電気的な仕組み',
        },
        {
          type: 'rich-text',
          elements: [
            'XORゲートは、',
            {
              text: '他の基本ゲートを組み合わせて作られています',
              emphasis: true,
            },
            '。',
            '複雑に見えるかもしれませんが、要は「違いを見つける」ための特別な組み合わせです。',
          ],
        },
        {
          type: 'note',
          text: '詳しい仕組み：「どちらかON」かつ「両方ONではない」という条件を実現しています',
        },
        {
          type: 'heading',
          text: 'XORの特徴',
        },
        {
          type: 'rich-text',
          elements: [
            { text: '「違いを検出」', emphasis: true },
            'するゲートです。',
            '2つの入力が同じ値なら',
            { text: 'OFF', emphasis: true },
            '、異なる値なら',
            { text: 'ON', emphasis: true },
            'を出力します。',
          ],
        },
        {
          type: 'note',
          text: 'XORゲートは、デジタル回路で「比較」や「違いの検出」に使われる重要なゲートです',
        },
      ],
    },
    {
      id: 'circuit-build',
      instruction: 'XOR回路を作ってみよう',
      content: [
        {
          type: 'heading',
          text: '手順１：入力ゲートを配置',
        },
        {
          type: 'rich-text',
          elements: [
            { text: TERMS.DOUBLE_CLICK, emphasis: true },
            'で',
            { text: `${TERMS.INPUT}ゲート`, emphasis: true },
            'を2つ配置します。',
            'スイッチAとスイッチBの役割です。',
          ],
        },
        {
          type: 'heading',
          text: '手順２：XORゲートを配置',
        },
        {
          type: 'rich-text',
          elements: [
            '次に',
            { text: 'XORゲート', emphasis: true },
            'を配置します。',
            'これが「違いを検出する」特殊ゲートです。',
          ],
        },
        {
          type: 'heading',
          text: '手順３：出力ゲートを配置',
        },
        {
          type: 'rich-text',
          elements: [
            '最後に',
            { text: `${TERMS.OUTPUT}ゲート`, emphasis: true },
            'を配置します。',
            '結果を表示するランプの役割です。',
          ],
        },
        {
          type: 'heading',
          text: '手順４：配線でつなげる',
        },
        {
          type: 'rich-text',
          elements: [
            'XORゲートは',
            { text: '2つの入力ピン', emphasis: true },
            'があります。',
            '入力Aの右の丸→XORの上の丸、',
            '入力Bの右の丸→XORの下の丸、',
            'XORの右の丸→出力の左の丸',
          ],
        },
        {
          type: 'note',
          text: '配線のコツ：ピンをクリックしてから、次のピンをクリックすると自動的に線が引かれます',
        },
      ],
    },
    {
      id: 'experiment',
      instruction: '予測して実験しよう！',
      content: [
        {
          type: 'heading',
          text: 'まず予測してみよう',
        },
        {
          type: 'rich-text',
          elements: [
            '「違いを検出」するゲートということから、どんな時に出力がONになると思いますか？',
            { text: 'ヒント：', bold: true },
            '「排他的」とは、「どちらか一方だけ」という意味です...',
          ],
        },
        {
          type: 'note',
          text: '予想：入力が違う時（片方だけON）に出力がONになりそう...',
        },
        {
          type: 'heading',
          text: '実験で確かめよう',
        },
        {
          type: 'rich-text',
          elements: [
            '2つの入力をダブルクリックして、4パターンすべてを試してみましょう。',
            '特に「両方ON」の時の動作に注目！',
          ],
        },
        {
          type: 'heading',
          text: '真理値表（実験結果）',
        },
        {
          type: 'table',
          headers: ['入力A', '入力B', '出力', '説明'],
          rows: [
            ['0（OFF）', '0（OFF）', '0（OFF）', '同じ値なので違いなし'],
            ['0（OFF）', '1（ON）', '1（ON）', '異なる値なので違いあり！'],
            ['1（ON）', '0（OFF）', '1（ON）', '異なる値なので違いあり！'],
            ['1（ON）', '1（ON）', '0（OFF）', '同じ値なので違いなし'],
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: '発見：', bold: true },
            'XORゲートは入力が',
            { text: '「異なる時だけ」', emphasis: true },
            '1を出力します！',
          ],
        },
        {
          type: 'note',
          text: '覚え方：「同じならOFF、違えばON」 - これがXORの魅力です！',
        },
      ],
    },
    {
      id: 'analysis',
      instruction: 'XORゲートの特徴を分析しよう',
      content: [
        {
          type: 'heading',
          text: '3つのゲートを比較',
        },
        {
          type: 'table',
          headers: [
            `${TERMS.INPUT}A`,
            `${TERMS.INPUT}B`,
            `${TERMS.AND}出力`,
            `${TERMS.OR}出力`,
            `${TERMS.XOR}出力`,
          ],
          rows: [
            [TERMS.OFF, TERMS.OFF, TERMS.OFF, TERMS.OFF, TERMS.OFF],
            [TERMS.OFF, TERMS.ON, TERMS.OFF, TERMS.ON, TERMS.ON],
            [TERMS.ON, TERMS.OFF, TERMS.OFF, TERMS.ON, TERMS.ON],
            [TERMS.ON, TERMS.ON, TERMS.ON, TERMS.ON, `${TERMS.OFF}`],
          ],
        },
        {
          type: 'note',
          text: `「両方${TERMS.ON}」の時だけ違う！${TERMS.AND}=${TERMS.ON}、${TERMS.OR}=${TERMS.ON}、${TERMS.XOR}=${TERMS.OFF}`,
        },
        {
          type: 'heading',
          text: '確率的な視点',
        },
        {
          type: 'rich-text',
          elements: [
            'ランダムに入力を変えたとき、各ゲートが',
            { text: TERMS.ON, emphasis: true },
            'になる確率：',
          ],
        },
        {
          type: 'list',
          ordered: false,
          items: [
            `${TERMS.AND}ゲート：25%（4パターン中1パターン）`,
            `${TERMS.OR}ゲート：75%（4パターン中3パターン）`,
            `${TERMS.XOR}ゲート：50%（4パターン中2パターン）`,
          ],
        },
        {
          type: 'note',
          text: 'XORは「ちょうど半分」の確率でONになる、バランスの取れたゲートです',
        },
      ],
    },
    {
      id: 'applications',
      instruction: 'XORゲートの実用例',
      content: [
        {
          type: 'heading',
          text: '実世界での活用',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '計算機の足し算：1+1=10（桁上がり）の下位ビット計算',
            'パスワード暗号化：同じキーでもう一度XORすると元に戻る性質を利用',
            'ゲームコントローラー：左右同時押し無効化（格闘ゲームなど）',
            'エラー検出：通信データのパリティチェック（誤り検出）',
          ],
        },
        {
          type: 'heading',
          text: '身近な製品での使用例',
        },
        {
          type: 'text',
          text: 'USBメモリやハードディスクのデータ保護、QRコードのエラー訂正、リモコンの信号送信など、私たちの周りの多くの電子機器でXORゲートが活躍しています。',
        },
        {
          type: 'note',
          text: 'XORの「反転」する性質は、暗号化とエラー検出の基本原理です',
        },
      ],
    },
    {
      id: 'summary',
      instruction: 'XORゲートをマスター！',
      content: [
        {
          type: 'heading',
          text: 'XORゲートの要点',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '「違いを検出」する特殊ゲート：異なる値の時だけ出力ON',
            '複合ゲートの原理：AND、OR、NOTゲートの組み合わせで実現',
            '排他的OR：「どちらか一方だけ」という厳密な条件',
            '確率は50%：4パターン中2パターンでON',
          ],
        },
        {
          type: 'quiz',
          question: 'XORゲートで、両方の入力がONの時の出力は？',
          options: ['0（OFF）', '1（ON）', '不定', 'エラー'],
          correctIndex: 0,
        },
        {
          type: 'heading',
          text: '次回予告',
        },
        {
          type: 'rich-text',
          elements: [
            { text: '半加算器', bold: true },
            'で、XORゲートが実際の計算にどう使われるかを学びましょう！',
            '',
            'AND、OR、XORの3つの基本ゲートをマスターしたあなたなら、きっと理解できます。',
          ],
        },
      ],
    },
  ],
};

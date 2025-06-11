import type { StructuredLesson } from '../../../../types/lesson-content';
import { TERMS } from '../terms';
export const digitalBasicsStructuredLesson: StructuredLesson = {
  id: 'digital-basics',
  title: 'デジタルの基礎！0と1で動く世界',
  description: '電子回路とデジタルの基礎を体験しよう！',
  objective:
    '電子回路の基本とデジタル技術の基礎を理解し、0と1で表現する仕組みを体験的に学びます',
  difficulty: 'beginner',
  prerequisites: [],
  estimatedMinutes: 10,
  availableGates: ['INPUT', 'OUTPUT'],
  steps: [
    {
      id: 'intro',
      instruction: 'デジタルの世界へようこそ！',
      content: [
        {
          type: 'heading',
          text: '電子回路って何？',
        },
        {
          type: 'rich-text',
          elements: [
            'スマホもパソコンもAIも、すべて',
            { text: '電子回路', emphasis: true },
            'という電気の通り道でできています。',
          ],
        },
        {
          type: 'heading',
          text: '身近なデジタル機器',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'スマホ：電子回路が音楽や画像を処理',
            'パソコン：電子回路が文書作成やゲームを実現',
            'AI：大規模な電子回路が学習や推論を実行',
          ],
        },
        {
          type: 'rich-text',
          elements: [
            'これらすべての機器は、',
            { text: '電気が流れる・流れない', emphasis: true },
            'という単純な仕組みを組み合わせて動いています。',
          ],
        },
        {
          type: 'heading',
          text: 'デジタルとは？',
        },
        {
          type: 'rich-text',
          elements: [
            { text: 'デジタル', emphasis: true },
            'とは、すべてを',
            { text: '0', bold: true },
            'と',
            { text: '1', bold: true },
            'の2つの状態で表現する方法です。',
          ],
        },
        {
          type: 'note',
          text: 'このアプリでは、本物の電子回路のようにスイッチやランプをつなげて動かせます！',
        },
      ],
    },
    {
      id: 'binary-principle',
      instruction: 'なぜ0と1だけなの？',
      content: [
        {
          type: 'heading',
          text: '電気の流れで考えよう',
        },
        {
          type: 'rich-text',
          elements: [
            '部屋の電気を例に考えてみましょう。',
            '壁にある',
            { text: 'スイッチ', emphasis: true },
            'を押すと、電気が',
            { text: 'つく', bold: true },
            'か',
            { text: '消える', bold: true },
            'かの2つの状態しかありませんよね？',
          ],
        },
        {
          type: 'list',
          ordered: false,
          items: ['ON = 電気が流れる = 1', 'OFF = 電気が流れない = 0'],
        },
        {
          type: 'heading',
          text: 'なぜ2つだけが良いの？',
        },
        {
          type: 'rich-text',
          elements: [
            { text: '確実', bold: true },
            'で',
            { text: 'シンプル', bold: true },
            'だからです！',
            '3つや4つの状態だと、どこからどこまでが「中間」なのか曖昧になってしまいます。',
          ],
        },
        {
          type: 'heading',
          text: 'このアプリでの信号の見分け方',
        },
        {
          type: 'circuit-diagram',
          circuitId: 'signal-comparison',
          showTruthTable: false,
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'グレーの配線 = 電気が流れていない（0）',
            '緑色の配線 = 電気が流れている（1）',
          ],
        },
        {
          type: 'note',
          text: 'この「確実に区別できる2つの状態」がすべてのデジタル技術の基本です！',
        },
      ],
    },
    {
      id: 'first-circuit',
      instruction: '初めての回路を作ってみよう！',
      content: [
        {
          type: 'heading',
          text: 'シンプルな回路の構成',
        },
        {
          type: 'rich-text',
          elements: [
            '最もシンプルな回路は、',
            { text: '入力', emphasis: true },
            '（スイッチ）と',
            { text: '出力', emphasis: true },
            '（ランプ）をつなげるだけです。',
          ],
        },
        {
          type: 'circuit-diagram',
          circuitId: 'simple-connection',
          showTruthTable: false,
        },
        {
          type: 'heading',
          text: '作成してみよう',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            `${TERMS.INPUT}（スイッチの役割）を配置`,
            `${TERMS.OUTPUT}（ランプの役割）を配置`,
            '2つを配線でつなげる',
          ],
        },
        {
          type: 'note',
          text: '配線のコツ：入力の右側にある丸い接続点と、出力の左側にある丸い接続点をクリックしてつなげます',
        },
      ],
    },
    {
      id: 'experiment',
      instruction: '実験：0と1を体験してみよう！',
      content: [
        {
          type: 'heading',
          text: 'デジタル信号の実験',
        },
        {
          type: 'rich-text',
          elements: [
            '作った回路で、実際に0と1を切り替えてみましょう。',
            { text: TERMS.INPUT, bold: true },
            'を',
            { text: TERMS.DOUBLE_CLICK, emphasis: true },
            'すると、0（OFF）と1（ON）が切り替わります。',
          ],
        },
        {
          type: 'heading',
          text: '観察ポイント',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '入力が0の時：配線がグレー、出力も0',
            '入力が1の時：配線が緑色、出力も1',
          ],
        },
        {
          type: 'note',
          text: '入力の状態（0か1）がそのまま出力に伝わります。電気が流れるか流れないか、という情報が伝わるのです！',
        },
      ],
    },
    {
      id: 'bit-power',
      instruction: 'ビットの組み合わせパワー',
      content: [
        {
          type: 'heading',
          text: '1つじゃ足りない？複数で解決！',
        },
        {
          type: 'rich-text',
          elements: [
            '0と1だけでは2つの状態しか表現できません。',
            'でも、複数組み合わせると...',
            { text: '表現力が爆発的に増加', bold: true },
            'します！',
          ],
        },
        {
          type: 'table',
          headers: ['ビット数', '表現できる状態数', '例'],
          rows: [
            ['1ビット', '2通り', 'ON/OFF'],
            ['2ビット', '4通り', '季節（春夏秋冬）'],
            ['3ビット', '8通り', '音階のド〜シ'],
            ['4ビット', '16通り', '16色のカラーパレット'],
            ['8ビット', '256通り', '1文字（A〜Z、あ〜ん等）'],
          ],
        },
        {
          type: 'note',
          text: '身近な例：スマホに保存される写真も、すべて0と1の組み合わせで表現されています！',
        },
      ],
    },
    {
      id: 'applications',
      instruction: 'デジタル技術の応用',
      content: [
        {
          type: 'heading',
          text: 'デジタルが変えた世界',
        },
        {
          type: 'rich-text',
          elements: [
            '0と1だけのシンプルなルールが、',
            { text: '現代社会のすべて', emphasis: true },
            'を支えています。',
          ],
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '音楽：音波を0と1に変換してデジタル音楽に',
            '写真：光を0と1に変換してデジタル画像に',
            '動画：連続する画像を0と1で記録',
            'インターネット：世界中の情報を0と1で共有',
            'AI：0と1の組み合わせで人間のように考える',
          ],
        },
        {
          type: 'note',
          text: '次回から、この0と1を操る「ゲート」を学んでいきます！',
        },
      ],
    },
    {
      id: 'summary',
      instruction: 'デジタルの基礎をマスター！',
      content: [
        {
          type: 'heading',
          text: '今日の成果',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '電子回路の基本概念を理解',
            'デジタル＝0と1の世界を体験',
            '初めての回路作成に成功',
            'ビットの組み合わせパワーを発見',
          ],
        },
        {
          type: 'quiz',
          question: 'デジタル技術の基本となる数字は？',
          options: [
            '0〜9の10種類',
            '0と1の2種類だけ',
            '無限の種類',
            'アルファベットも含む',
          ],
          correctIndex: 1,
        },
        {
          type: 'heading',
          text: '次のステップ：論理ゲートとは？',
        },
        {
          type: 'rich-text',
          elements: [
            '0と1を操る特別な部品、それが',
            { text: '論理ゲート', bold: true },
            'です！',
          ],
        },
        {
          type: 'heading',
          text: '論理ゲートの正体',
        },
        {
          type: 'rich-text',
          elements: [
            '論理ゲートは、0と1を入力として受け取り、',
            { text: '決められたルール', emphasis: true },
            'に従って0か1を出力する電子部品です。',
          ],
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'NOTゲート：入力を反転（0→1、1→0）',
            'ANDゲート：両方1なら1を出力',
            'ORゲート：どちらか1なら1を出力',
            'XORゲート：入力が異なるなら1を出力',
          ],
        },
        {
          type: 'heading',
          text: 'なぜ「論理」ゲート？',
        },
        {
          type: 'rich-text',
          elements: [
            '人間の',
            { text: '論理的思考', emphasis: true },
            'と同じルールで動くからです：',
          ],
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '「AかつB」→ANDゲート',
            '「AまたはB」→ORゲート',
            '「Aではない」→NOTゲート',
          ],
        },
        {
          type: 'note',
          text: 'すべてのコンピュータは、これらの論理ゲートを何億個も組み合わせて作られています！',
        },
        {
          type: 'heading',
          text: '次回予告',
        },
        {
          type: 'rich-text',
          elements: [
            { text: 'NOTゲート', bold: true },
            'で論理ゲートの世界への第一歩を踏み出しましょう！',
            '最もシンプルで重要な論理ゲートから始めます。',
          ],
        },
      ],
    },
  ],
};

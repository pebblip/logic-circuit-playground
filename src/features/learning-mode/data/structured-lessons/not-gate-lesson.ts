import type { StructuredLesson } from '../../../../types/lesson-content';
import { TERMS } from '../terms';
export const notGateStructuredLesson: StructuredLesson = {
  id: 'not-gate',
  title: `${TERMS.NOT}ゲート - 反転の魔法！`,
  description: '入力を反転させる最もシンプルで重要なゲートを学びます',
  objective: `${TERMS.NOT}ゲートの動作原理を理解し、「反転」の概念を習得。デジタル回路における0と1の切り替えの重要性を学びます`,
  difficulty: 'beginner',
  prerequisites: ['digital-basics'],
  estimatedMinutes: 10,
  availableGates: ['INPUT', 'OUTPUT', 'NOT'],
  steps: [
    {
      id: 'intro',
      instruction: '反転の魔法を使う特別なゲート',
      content: [
        {
          type: 'heading',
          text: '「反対」が欲しい時ってない？',
        },
        {
          type: 'rich-text',
          elements: [
            '日常生活で「今とは逆にしたい」場面、ありますよね？',
            { text: 'NOTゲート', bold: true },
            'は、まさにその「反対にする」魔法を使うゲートです！',
          ],
        },
        {
          type: 'heading',
          text: '身近な反転の例',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'ライトスイッチ：ON→OFF、OFF→ON',
            '扉：開いている→閉める、閉まっている→開ける',
            '昼夜：昼→夜、夜→昼',
            '反対語：ポジティブ→ネガティブ',
            'エレベーター：上→下、下→上',
          ],
        },
        {
          type: 'heading',
          text: 'NOTゲートの仕事',
        },
        {
          type: 'rich-text',
          elements: [
            { text: '0', bold: true },
            'を',
            { text: '1', bold: true },
            'に、',
            { text: '1', bold: true },
            'を',
            { text: '0', bold: true },
            'に変える、とてもシンプルだけど超重要なゲートです！',
          ],
        },
        {
          type: 'note',
          text: 'NOTゲートの別名：「反転ゲート」「インバーター」（入力を逆にするから）',
        },
      ],
    },
    {
      id: 'principle',
      instruction: '反転の仕組みを理解しよう',
      content: [
        {
          type: 'heading',
          text: '電気的な反転の仕組み',
        },
        {
          type: 'rich-text',
          elements: [
            'NOTゲートの内部では、特殊な電子部品が働いています。',
            'この部品は、電気が来たら止めて、来なかったら通す、という',
            { text: '逆転の発想', emphasis: true },
            'で動作します。',
          ],
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '入力が0（電気なし）内部スイッチがON 出力が1（電気あり）',
            '入力が1（電気あり）内部スイッチがOFF 出力が0（電気なし）',
          ],
        },
        {
          type: 'heading',
          text: 'NOTゲートの特徴',
        },
        {
          type: 'rich-text',
          elements: [
            { text: '入力は1つだけ', emphasis: true },
            '（他のゲートは複数入力が多い）',
            { text: '出力も1つだけ', emphasis: true },
            { text: '100%確実に反転', emphasis: true },
            '（例外なし！）',
          ],
        },
        {
          type: 'note',
          text: 'NOTゲートは三角形の先に小さな丸（バブル）がついた形で表されます。この丸が「反転」を意味します。',
        },
      ],
    },
    {
      id: 'circuit-build',
      instruction: 'NOT回路を作ってみよう',
      content: [
        {
          type: 'heading',
          text: 'NOT回路の構成',
        },
        {
          type: 'rich-text',
          elements: [
            'NOT回路は最もシンプルな構成です：',
            { text: '入力', emphasis: true },
            ' ',
            { text: 'NOTゲート', emphasis: true },
            ' ',
            { text: '出力', emphasis: true },
          ],
        },
        {
          type: 'circuit-diagram',
          circuitId: 'not-gate',
          showTruthTable: false,
        },
        {
          type: 'heading',
          text: '作成手順',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '入力ゲートを配置（スイッチの役割）',
            'NOTゲートを配置（反転の魔法使い）',
            '出力ゲートを配置（結果表示のランプ）',
            '配線で3つをつなげる',
          ],
        },
        {
          type: 'note',
          text: '配線のコツ：入力の右の丸と NOTゲートの左の丸、NOTゲートの右の丸と出力の左の丸をクリックしてつなげます',
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
            '「反転の魔法」という名前から、どんな動作をすると思いますか？',
            { text: 'ヒント：', bold: true },
            '日常生活で「反転」といえば、ON→OFF、OFF→ONのように...',
          ],
        },
        {
          type: 'note',
          text: '予想：入力が0なら1に、1なら0になるはず...',
        },
        {
          type: 'heading',
          text: '実験で確かめよう',
        },
        {
          type: 'rich-text',
          elements: [
            '入力をダブルクリックして、0と1を切り替えながら観察してみましょう。',
            '配線の色の変化に注目！',
          ],
        },
        {
          type: 'heading',
          text: '真理値表（実験結果）',
        },
        {
          type: 'table',
          headers: ['入力', '出力', '説明'],
          rows: [
            ['0（OFF）', '1（ON）', '0が入ると1が出る'],
            ['1（ON）', '0（OFF）', '1が入ると0が出る'],
          ],
        },
        {
          type: 'rich-text',
          elements: [
            'NOTゲートは入力を',
            { text: '100%確実に反転', bold: true },
            'させます！例外はありません。',
          ],
        },
      ],
    },
    {
      id: 'analysis',
      instruction: 'NOTゲートの特徴を分析しよう',
      content: [
        {
          type: 'heading',
          text: '他のゲートとの違い',
        },
        {
          type: 'table',
          headers: ['特徴', 'NOTゲート', '他のゲート（AND、OR等）'],
          rows: [
            ['入力数', '1つだけ', '通常2つ以上'],
            ['動作', '必ず反転', '条件によって変化'],
            ['複雑さ', 'とてもシンプル', 'より複雑'],
            ['用途', '信号の反転', '論理演算'],
          ],
        },
        {
          type: 'heading',
          text: 'NOTゲートの重要性',
        },
        {
          type: 'rich-text',
          elements: [
            'NOTゲートはシンプルですが、',
            { text: 'すべてのデジタル回路の基礎', bold: true },
            'となっています。',
            '複雑な回路も、NOTゲートなしでは作れません！',
          ],
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'データの反転処理',
            '状態の切り替え制御',
            '電気の流れの制御',
            'エラー検出とデバッグ',
          ],
        },
        {
          type: 'note',
          text: 'NOTゲートを理解することは、より複雑なゲート（AND、OR、XOR）を学ぶ第一歩です！',
        },
      ],
    },
    {
      id: 'applications',
      instruction: 'NOTゲートの実用例',
      content: [
        {
          type: 'heading',
          text: '現実世界での活用',
        },
        {
          type: 'rich-text',
          elements: ['NOTゲートは意外なところで活躍しています！'],
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '非常灯：通常時はOFF、停電時に自動でON',
            'セキュリティ：ドアが開いている間は警報OFF',
            'メモリ：データの読み書き制御で活用',
            'ゲーム：ジャンプボタンを離したら落下開始',
            'エアコン：設定温度に達したら冷房停止',
          ],
        },
        {
          type: 'heading',
          text: 'プログラミングでも大活躍',
        },
        {
          type: 'rich-text',
          elements: [
            'コンピュータのプログラムでも、',
            { text: '「反転」', bold: true },
            'の処理はNOTゲートと同じ仕組みを使っています。',
            '正しい→間違い、間違い→正しい、のような判定に使われます。',
          ],
        },
        {
          type: 'note',
          text: '身の回りのデジタル機器には、必ずと言っていいほどNOTゲートが使われています',
        },
      ],
    },
    {
      id: 'summary',
      instruction: '反転の魔法をマスター！',
      content: [
        {
          type: 'heading',
          text: 'NOTゲートの要点',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '反転の魔法：0→1、1→0に必ず変換',
            '入力1つ、出力1つのシンプル構造',
            'すべてのデジタル回路の基礎となる重要ゲート',
            '身近な機器にも数多く使われている',
          ],
        },
        {
          type: 'quiz',
          question: 'NOTゲートに「1」を入力したら、出力は？',
          options: ['0', '1', '変化しない', 'エラーになる'],
          correctIndex: 0,
        },
        {
          type: 'heading',
          text: '次回予告',
        },
        {
          type: 'rich-text',
          elements: [
            { text: 'ANDゲート', bold: true },
            'で、複数の条件を組み合わせる論理を学びましょう！',
            '「両方ともONの時だけ」という、より高度な判断ができるようになります。',
          ],
        },
      ],
    },
  ],
};

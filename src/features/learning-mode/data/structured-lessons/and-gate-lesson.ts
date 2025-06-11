import type { StructuredLesson } from '../../../../types/lesson-content';
import { TERMS } from '../terms';
export const andGateStructuredLesson: StructuredLesson = {
  id: 'and-gate',
  title: 'ANDゲート - すべてが揃って初めてON！',
  description:
    '2つの入力が両方ともONの時だけ出力がONになる「AND」の動作を学びます',
  objective:
    'ANDゲートの基本動作を理解し、真理値表を確認して「両方必要」の概念を習得する',
  category: '基本ゲート',
  lessonType: 'gate-intro',
  difficulty: 'beginner',
  prerequisites: [],
  estimatedMinutes: 10,
  availableGates: ['INPUT', 'OUTPUT', 'AND'],
  steps: [
    {
      id: 'intro',
      instruction:
        'ANDゲートは「すべての条件が満たされたとき」だけ動作します。',
      content: [
        {
          type: 'rich-text',
          elements: [
            '日常生活で例えると、',
            { text: '「鍵」と「暗証番号」の両方', emphasis: true },
            'が必要な金庫のようなものです。',
          ],
        },
        {
          type: 'heading',
          text: '身近な例',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'オートロック：カギも暗証番号も両方必要 ドアが開く',
            '車の発進：シートベルトを締めて、エンジンもON 走れる',
            'スマホ：パスコードと指紋が一致 ロック解除',
          ],
        },
      ],
    },
    {
      id: 'principle',
      instruction: 'ANDゲートの電気的仕組み',
      content: [
        {
          type: 'heading',
          text: 'なぜ「AND」というの？',
        },
        {
          type: 'rich-text',
          elements: [
            '電気回路で考えると、2つのスイッチを',
            { text: '「つなげて」', emphasis: true },
            '配置したようなものです。',
            {
              text: '両方のスイッチをONにしないと、電気は流れません。',
              bold: true,
            },
          ],
        },
        {
          type: 'heading',
          text: '一列につないだスイッチで理解しよう',
        },
        {
          type: 'rich-text',
          elements: [
            'ANDゲートの仕組みは、',
            { text: '2つのスイッチを一列に並べた回路', emphasis: true },
            'と同じです。',
            '電源→スイッチA→スイッチB→ランプ、という順番でつながっています。',
          ],
        },
        {
          type: 'heading',
          text: 'スイッチの例で考える',
        },
        {
          type: 'text',
          text: '2つのスイッチを一列につないだ回路を想像してください。電源からランプまでの間にスイッチAとスイッチBが順番に並んでいます。',
        },
        {
          type: 'heading',
          text: '【一列につないだ回路のイメージ】',
        },
        {
          type: 'svg-diagram',
          diagramType: 'series-circuit',
          width: 400,
          height: 200,
        },
        {
          type: 'rich-text',
          elements: [{ text: '電源 スイッチA スイッチB ランプ', bold: true }],
        },
        {
          type: 'rich-text',
          elements: [
            { text: 'ポイント：', bold: true },
            'スイッチが',
            { text: '一列につながっている', emphasis: true },
            'ので、',
            { text: 'どちらか1つでもOFF', emphasis: true },
            'なら電気は流れません。',
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: '', bold: true },
            { text: 'スイッチA', emphasis: true },
            'も',
            { text: 'スイッチB', emphasis: true },
            'も',
            { text: '両方ON', bold: true },
            'じゃないと電気は流れない！',
          ],
        },
        {
          type: 'table',
          headers: ['スイッチA', 'スイッチB', '結果'],
          rows: [
            [TERMS.OFF, TERMS.OFF, 'ランプ消灯'],
            [TERMS.OFF, TERMS.ON, 'ランプ消灯'],
            [TERMS.ON, TERMS.OFF, 'ランプ消灯'],
            [TERMS.ON, TERMS.ON, 'ランプ点灯'],
          ],
        },
        {
          type: 'note',
          text: '2つのスイッチをつなげた回路：両方ONじゃないと電気は流れません！',
        },
      ],
    },
    {
      id: 'circuit-build',
      instruction: 'AND回路を作ってみよう',
      content: [
        {
          type: 'heading',
          text: 'AND回路の構成',
        },
        {
          type: 'rich-text',
          elements: [
            'AND回路は2つの入力が必要です：',
            { text: '入力A', emphasis: true },
            ' + ',
            { text: '入力B', emphasis: true },
            ' ',
            { text: 'ANDゲート', emphasis: true },
            ' ',
            { text: '出力', emphasis: true },
          ],
        },
        {
          type: 'circuit-diagram',
          circuitId: 'and-gate',
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
            '入力ゲートを2つ配置（スイッチA・Bの役割）',
            'ANDゲートを配置（両方必要の魔法使い）',
            '出力ゲートを配置（結果表示のランプ）',
            '配線で3本でつなげる',
          ],
        },
        {
          type: 'heading',
          text: '配線のコツ',
        },
        {
          type: 'rich-text',
          elements: [
            'ANDゲートは',
            { text: '2つの入力ピン', emphasis: true },
            'があります。',
            '上下に並んだ入力ゲートの右の丸と、ANDゲートの左の2つの丸をそれぞれつなげます。',
          ],
        },
        {
          type: 'note',
          text: '配線のポイント：入力Aの右の丸→ANDの上の丸、入力Bの右の丸→ANDの下の丸、ANDの右の丸→出力の左の丸',
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
            '「両方必要」のコンセプトから、どんな時に出力がONになると思いますか？',
            { text: 'ヒント：', bold: true },
            '直列回路では、どちらか1つでもスイッチがOFFなら電気は流れません...',
          ],
        },
        {
          type: 'note',
          text: '予想：両方の入力がONの時だけ、出力もONになるはず...',
        },
        {
          type: 'heading',
          text: '実験で確かめよう',
        },
        {
          type: 'rich-text',
          elements: [
            '2つの入力をダブルクリックして、4パターンすべてを試してみましょう。',
            '配線の色と出力の変化に注目！',
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
            ['0（OFF）', '0（OFF）', '0（OFF）', '両方OFFなので電気は流れない'],
            ['0（OFF）', '1（ON）', '0（OFF）', 'AがOFFなので電気は流れない'],
            ['1（ON）', '0（OFF）', '0（OFF）', 'BがOFFなので電気は流れない'],
            ['1（ON）', '1（ON）', '1（ON）', '両方ONなので電気が流れる！'],
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: '発見：', bold: true },
            'ANDゲートが1を出力するのは',
            { text: '4パターン中1パターンだけ（25%）', emphasis: true },
            'です！',
          ],
        },
        {
          type: 'note',
          text: 'この「厳しさ」が、セキュリティや安全装置にANDゲートが多用される理由です',
        },
      ],
    },
    {
      id: 'analysis',
      instruction: 'ANDゲートの特徴を分析しよう',
      content: [
        {
          type: 'heading',
          text: '他のゲートとの違い',
        },
        {
          type: 'table',
          headers: ['特徴', 'ANDゲート', 'ORゲート'],
          rows: [
            ['出力がONになる条件', '両方の入力がON', '少なくとも1つの入力がON'],
            ['出力がONになる確率', '25%（1/4）', '75%（3/4）'],
            ['電気回路の例', '直列回路', '並列回路'],
            ['性格', '厳しい（全て必要）', '優しい（1つでOK）'],
          ],
        },
        {
          type: 'heading',
          text: 'ANDゲートの重要性',
        },
        {
          type: 'rich-text',
          elements: [
            'ANDゲートは',
            { text: '「確実性」と「安全性」', bold: true },
            'を提供します。',
            '複数の条件がすべて満たされた時だけ動作するため、誤動作を防げます。',
          ],
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'セキュリティシステム（複数認証）',
            '安全装置（複数センサー）',
            'データ処理（条件判定）',
            '計算回路（論理演算）',
          ],
        },
        {
          type: 'note',
          text: 'ANDゲートを理解することは、今後学ぶより複雑な回路を作る基礎になります！',
        },
      ],
    },
    {
      id: 'applications',
      instruction: 'ANDゲートの実用例',
      content: [
        {
          type: 'heading',
          text: '日常生活で見つけるANDゲート',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '銀行ATM：カードを入れて、暗証番号も正しく入力 お金を引き出せる',
            '車の発進：シートベルトを締めて、エンジンもかける 走れる',
            'オートロック：正しいカギを使って、正しい暗証番号も入力 ドアが開く',
          ],
        },
        {
          type: 'heading',
          text: 'コンピュータでの活用',
        },
        {
          type: 'rich-text',
          elements: [
            'コンピュータのプログラムでも、',
            { text: '「両方の条件が必要」', bold: true },
            'という判定にANDゲートと同じ仕組みが使われています！',
            '例：年齢が18歳以上、かつ、免許を持っている 運転可能',
          ],
        },
        {
          type: 'note',
          text: '身の回りのデジタル機器には、必ずANDゲートが組み込まれています',
        },
      ],
    },
    {
      id: 'summary',
      instruction: 'ANDゲートをマスター！',
      content: [
        {
          type: 'heading',
          text: 'ANDゲートの要点',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '「すべて必要」の厳格ゲート：両方ONで初めて出力ON',
            '直列回路の原理：1つでもOFFなら電気は流れない',
            '安全性重視：セキュリティや安全装置で大活躍',
            '確率は25%：4パターン中1パターンのみON',
          ],
        },
        {
          type: 'quiz',
          question: 'ANDゲートで出力が1になるのは次のうちどれ？',
          options: [
            '入力の少なくとも1つが1の時',
            '入力の両方が1の時',
            '入力の両方が0の時',
            '入力が異なる値の時',
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
            { text: 'ORゲート', bold: true },
            'で、「どれか1つでOK」の優しい論理を学びましょう！',
            'ANDの厳しさとORの優しさ、2つの性格を理解すれば論理回路の基礎は完璧です。',
          ],
        },
      ],
    },
  ],
};

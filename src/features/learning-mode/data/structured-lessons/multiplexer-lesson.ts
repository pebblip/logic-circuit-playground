import type { StructuredLesson } from '../../../../types/lesson-content';
import { TERMS } from '../terms';

export const multiplexerStructuredLesson: StructuredLesson = {
  id: 'multiplexer',
  title: 'マルチプレクサ - データ選択スイッチ',
  description: '複数の入力から1つを選んで出力する回路を作ります',
  objective: '選択信号によってデータ入力を切り替える原理を理解し、デジタルスイッチングシステムの基礎を習得する',
  category: '基本回路',
  lessonType: 'build',
  difficulty: 'intermediate',
  prerequisites: ['decoder'],
  estimatedMinutes: 15,
  availableGates: ['INPUT', 'OUTPUT', 'AND', 'NOT', 'OR'],
  steps: [
    {
      id: 'intro',
      instruction: '複数のデータを自在に切り替える仕組み',
      content: [
        {
          type: 'heading',
          text: '身近な例で考える',
        },
        {
          type: 'text',
          text: 'テレビのリモコンでチャンネルを切り替える場面を思い出してください。1号線、2号線、3号線の電波を選択して、同じスピーカーから音を出しています。この「選択機能」をデジタル回路で実現するのがマルチプレクサです。',
        },
        {
          type: 'heading',
          text: 'マルチプレクサ（MUX）とは',
        },
        {
          type: 'text',
          text: '複数のデータ入力から1つを選択して出力する「電子スイッチ」です。選択信号（セレクト信号）によって、どの入力を出力に通すかを制御できます。',
        },
        {
          type: 'note',
          text: 'CPU、通信システム、オーディオ機器など、あらゆるデジタル機器で使われています',
        },
      ],
    },
    {
      id: 'principle',
      instruction: 'マルチプレクサの電気的仕組み',
      content: [
        {
          type: 'heading',
          text: '2-to-1マルチプレクサの構造',
        },
        {
          type: 'text',
          text: '2つのデータ入力（D0、D1）と1つの選択信号（S）を使って、S=0ならD0を、S=1ならD1を出力に送ります。内部では「門番」となるANDゲートが、選択信号に応じてデータを通すかブロックするかを決めます。',
        },
        {
          type: 'heading',
          text: '動作の規則',
        },
        {
          type: 'table',
          headers: ['選択信号S', '出力Y', '動作', '例'],
          rows: [
            ['0', 'D0と同じ', 'D0を選択', 'D0=1なら出力=1'],
            ['1', 'D1と同じ', 'D1を選択', 'D1=0なら出力=0'],
          ],
        },
        {
          type: 'heading',
          text: '論理式の導出',
        },
        {
          type: 'text',
          text: '出力Y = (D0 AND NOT(S)) OR (D1 AND S)となります。NOT(S)でS=0のときD0が通り、SでS=1のときD1が通ります。ORゲートで両方の結果を統合します。',
        },
        {
          type: 'note',
          text: '「門番」のANDゲートが、選択信号に応じて1つの入力だけを通す仕組みです',
        },
      ],
    },
    {
      id: 'circuit-build',
      instruction: '2-to-1マルチプレクサ回路を作ってみよう',
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
            'を3つ配置します。',
            'D0（データ0）、D1（データ1）、S（選択信号）です。',
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
            'を1つ配置（S信号の反転用）。',
            { text: `${TERMS.AND}ゲート`, emphasis: true },
            'を2つ配置（各データの門番用）。',
            { text: `${TERMS.OR}ゲート`, emphasis: true },
            'を1つ配置（結果の統合用）。',
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
            'を1つ配置します。',
            '選択されたデータが出力されます。',
          ],
        },
        {
          type: 'heading',
          text: '手順４：配線でつなげる',
        },
        {
          type: 'rich-text',
          elements: [
            '選択信号：SをNOTゲートに接続してNOT(S)を生成。',
            'データ0経路：D0とNOT(S)を1つ目のANDに接続。',
            'データ1経路：D1とSを2つ目のANDに接続。',
            '統合：両方のAND出力をORに接続、ORの出力をOUTPUTへ。',
          ],
        },
        {
          type: 'note',
          text: '配線のコツ：S=0でD0経路、S=1でD1経路が開く構造を意識する',
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
          text: 'D0=1、D1=0にした状態で、S=0とS=1を切り替えたときの出力を予測してください。S=0なら出力=1、S=1なら出力=0になるはずです。',
        },
        {
          type: 'heading',
          text: '実験で確かめよう',
        },
        {
          type: 'rich-text',
          elements: [
            '1. 初期設定：D0=1、D1=0、S=0→出力が1になることを確認。',
            '2. Sを',
            { text: `${TERMS.DOUBLE_CLICK}`, emphasis: true },
            'して1に変更→出力が0に変化。',
            '3. D1を1、D0を0に変更→S=1なので出力は1のまま。',
            '4. Sを0に戻す→出力が0に変化（D0が選ばれる）。',
          ],
        },
        {
          type: 'heading',
          text: '実験結果の確認',
        },
        {
          type: 'table',
          headers: ['D0', 'D1', 'S', '出力Y', '選択データ'],
          rows: [
            ['1', '0', '0', '1', 'D0が選択'],
            ['1', '0', '1', '0', 'D1が選択'],
            ['0', '1', '0', '0', 'D0が選択'],
            ['0', '1', '1', '1', 'D1が選択'],
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: '発見：', bold: true },
            '選択信号Sを変えるだけで、',
            { text: 'リアルタイム', emphasis: true },
            'にデータソースが切り替わります。',
          ],
        },
        {
          type: 'note',
          text: 'データを変更しても、選択されていない側は出力に影響しません',
        },
      ],
    },
    {
      id: 'analysis',
      instruction: 'マルチプレクサの特徴を分析しよう',
      content: [
        {
          type: 'heading',
          text: 'デコーダとの関係',
        },
        {
          type: 'table',
          headers: ['回路', '機能', '入力→出力', '用途'],
          rows: [
            ['デコーダ', 'コード展開', '少数→多数（1つON）', '選択信号生成'],
            ['マルチプレクサ', 'データ選択', '多数→1つ', 'データ経路制御'],
          ],
        },
        {
          type: 'heading',
          text: '拡張性の考察',
        },
        {
          type: 'table',
          headers: ['データ入力数', '選択信号ビット数', 'ANDゲート数', '用途例'],
          rows: [
            ['2個', '1ビット', '2個', '基本的な選択'],
            ['4個', '2ビット', '4個', 'センサー選択'],
            ['8個', '3ビット', '8個', 'CPU内部'],
            ['16個', '4ビット', '16個', 'メモリシステム'],
          ],
        },
        {
          type: 'heading',
          text: 'デマルチプレクサとの対比',
        },
        {
          type: 'text',
          text: 'マルチプレクサの逆操作がデマルチプレクサです。1つの入力を選択信号に基づいて複数の出力のどれかに振り分けます。組み合わせることで双方向のデータ伝送システムを構築できます。',
        },
        {
          type: 'heading',
          text: '確率的な視点',
        },
        {
          type: 'text',
          text: 'ランダムな選択信号に対して、各データ入力が選ばれる確率は等しくなります（2入力なら50%ずつ、4入力なら25%ずつ）。これは負荷分散の観点で理想的です。',
        },
        {
          type: 'note',
          text: '選択ビット数 = log₂(データ入力数)の関係があります',
        },
      ],
    },
    {
      id: 'applications',
      instruction: 'マルチプレクサの実用例',
      content: [
        {
          type: 'heading',
          text: '実世界での活用',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'CPU内部：複数のレジスタから演算用データを選択',
            '通信システム：複数チャンネルの時分割多重化',
            'オーディオミキサー：複数音源から1つを選択して出力',
            'ビデオスイッチャー：複数カメラ映像の切り替え',
            'センサーネットワーク：多数のセンサーを順次読み取り',
          ],
        },
        {
          type: 'heading',
          text: '身近な製品での使用例',
        },
        {
          type: 'text',
          text: 'テレビのチャンネル切り替え、カーナビの画面切り替え、スマートフォンのセンサー選択、エアコンの温度センサー選択など、複数のデータ源から1つを選ぶ必要がある機器で広く使われています。',
        },
        {
          type: 'note',
          text: 'データバスシステムでは、マルチプレクサにより配線数を大幅に削減できます',
        },
      ],
    },
    {
      id: 'summary',
      instruction: 'マルチプレクサをマスター',
      content: [
        {
          type: 'heading',
          text: 'マルチプレクサの要点',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '選択信号によって複数データから1つを選択',
            'ANDゲートが「門番」として動作',
            'リアルタイムでデータソースを切り替え可能',
            'デマルチプレクサと組み合わせて双方向伝送',
          ],
        },
        {
          type: 'quiz',
          question: '8-to-1マルチプレクサに必要な選択信号のビット数は？',
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
            { text: 'ALU（演算論理装置）', bold: true },
            'で、CPUの心臓部となる計算と論理演算を統合した回路を学びます。',
            'これまでの回路の集大成です。',
          ],
        },
        {
          type: 'note',
          text: 'マルチプレクサの理解で、デジタルスイッチングシステムの基礎が完成しました',
        },
      ],
    },
  ],
};
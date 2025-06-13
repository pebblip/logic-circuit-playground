import type { StructuredLesson } from '../../../../types/lesson-content';
import { TERMS } from '../terms';

export const dFlipFlopStructuredLesson: StructuredLesson = {
  id: 'd-flip-flop',
  title: 'Dフリップフロップ - 1ビットメモリ',
  description: 'データを記憶できる基本的な順序回路を作ります',
  objective: 'クロック同期でデータを記憶する回路を理解し、順序回路の基本概念を習得する',
  category: '順序回路',
  lessonType: 'gate-intro',
  difficulty: 'advanced',
  prerequisites: ['full-adder'],
  estimatedMinutes: 15,
  availableGates: ['INPUT', 'OUTPUT', 'CLOCK', 'D-FF'],
  steps: [
    {
      id: 'intro',
      instruction: 'データを記憶する必要性',
      content: [
        {
          type: 'heading',
          text: '身近な例で考える',
        },
        {
          type: 'text',
          text: 'これまでの回路は入力が変わると出力もすぐ変わりました。しかし、電卓の「＝」ボタンを押した後も結果が表示され続けるように、前の状態を覚えておく必要があります。',
        },
        {
          type: 'heading',
          text: '順序回路への第一歩',
        },
        {
          type: 'text',
          text: '組み合わせ回路は現在の入力だけで出力が決まりますが、順序回路は過去の状態も考慮します。Dフリップフロップは最も基本的な記憶素子です。',
        },
        {
          type: 'note',
          text: 'コンピュータのメモリやレジスタの最小単位がこのDフリップフロップです',
        },
      ],
    },
    {
      id: 'principle',
      instruction: 'Dフリップフロップの電気的仕組み',
      content: [
        {
          type: 'heading',
          text: '1ビットの記憶装置',
        },
        {
          type: 'text',
          text: 'Dフリップフロップは、D（Data）入力のデータをCLK（Clock）信号の立ち上がりエッジ（0→1の瞬間）で記憶します。記憶した値はQ出力に保持され、次のクロックまで変化しません。',
        },
        {
          type: 'heading',
          text: 'エッジトリガの意味',
        },
        {
          type: 'text',
          text: 'クロックが1の間ずっと反応するのではなく、0から1に変わる瞬間だけデータを取り込みます。これにより、安定した動作とノイズへの耐性を実現しています。',
        },
        {
          type: 'heading',
          text: '真理値表',
        },
        {
          type: 'table',
          headers: ['CLK', 'D', 'Q(次の状態)', '動作'],
          rows: [
            ['↑', '0', '0', 'D=0を記憶'],
            ['↑', '1', '1', 'D=1を記憶'],
            ['0', 'X', 'Q(保持)', '変化なし'],
            ['1', 'X', 'Q(保持)', '変化なし'],
          ],
        },
        {
          type: 'note',
          text: 'CLK↑は立ち上がりエッジ、Xは任意の値を表します',
        },
      ],
    },
    {
      id: 'circuit-build',
      instruction: 'Dフリップフロップ回路を作ってみよう',
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
            'を1つ配置します。',
            'これがD（記憶したいデータ）入力になります。',
          ],
        },
        {
          type: 'heading',
          text: '手順２：対象ゲートを配置',
        },
        {
          type: 'rich-text',
          elements: [
            { text: 'CLOCKゲート', emphasis: true },
            'を1つ配置します（自動的に0と1を繰り返す特殊ゲート）。',
            '次に',
            { text: 'D-FFゲート', emphasis: true },
            'を1つ配置します（1ビットメモリの本体）。',
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
            'Q（記憶値）とQ\'（反転値）の表示用です。',
          ],
        },
        {
          type: 'heading',
          text: '手順４：配線でつなげる',
        },
        {
          type: 'rich-text',
          elements: [
            'INPUT→D-FFのD入力へ接続。',
            'CLOCK→D-FFのCLK入力へ接続。',
            'D-FFのQ出力→OUTPUT（上）へ接続。',
            'D-FFのQ\'出力→OUTPUT（下）へ接続。',
          ],
        },
        {
          type: 'note',
          text: '配線のコツ：CLOCKの配線は緑色で点滅し、タイミングが分かります',
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
          text: 'D=1にしたとき、CLOCKが0→1に変わる瞬間にQがどうなるか予測してください。また、その後D=0に変えてもQはどうなるでしょうか？',
        },
        {
          type: 'heading',
          text: '実験で確かめよう',
        },
        {
          type: 'rich-text',
          elements: [
            '1. D入力を',
            { text: `${TERMS.DOUBLE_CLICK}`, emphasis: true },
            'して1にする。',
            '2. CLOCKが0→1になる瞬間を観察（Q=1になる）。',
            '3. D入力を0に変更。',
            '4. Qが1のまま保持されることを確認。',
            '5. 次のCLOCK立ち上がりでQ=0に更新される。',
          ],
        },
        {
          type: 'rich-text',
          elements: [
            { text: '発見：', bold: true },
            'CLOCKの立ち上がりエッジでのみデータが更新され、',
            'それ以外の時間は前の値を',
            { text: '記憶', emphasis: true },
            'し続けます。',
          ],
        },
        {
          type: 'note',
          text: 'これが「メモリ」の基本動作です。電源がある限り値を保持します',
        },
      ],
    },
    {
      id: 'analysis',
      instruction: 'Dフリップフロップの特徴を分析しよう',
      content: [
        {
          type: 'heading',
          text: 'ラッチとの比較',
        },
        {
          type: 'table',
          headers: ['方式', '動作', '特徴', '用途'],
          rows: [
            ['D-FF（エッジトリガ）', 'CLKの0→1の瞬間', '安定・ノイズに強い', 'レジスタ、カウンタ'],
            ['Dラッチ（レベルトリガ）', 'CLK=1の間', '構造が簡単', '一時的な保持'],
          ],
        },
        {
          type: 'heading',
          text: '内部構造の概要',
        },
        {
          type: 'text',
          text: 'D-FFは内部でマスターラッチとスレーブラッチを直列接続した構造です。これにより、エッジトリガ動作を実現しています。実際の回路では約20個のトランジスタで構成されます。',
        },
        {
          type: 'heading',
          text: '確率的な視点',
        },
        {
          type: 'text',
          text: 'ランダムなD入力に対して、Q出力が1になる確率は前のクロックサイクルでD=1だった確率に等しくなります。つまり、過去の入力履歴が現在の出力に影響します。',
        },
        {
          type: 'note',
          text: '組み合わせ回路と違い、同じ入力でも過去の状態により出力が変わります',
        },
      ],
    },
    {
      id: 'applications',
      instruction: 'Dフリップフロップの実用例',
      content: [
        {
          type: 'heading',
          text: '実世界での活用',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'CPUレジスタ：演算データの一時保存（32個や64個を並列使用）',
            'メモリセル：DRAMやSRAMの基本構成要素',
            'シフトレジスタ：データの順次転送（通信やディスプレイ）',
            'カウンタ：クロック数を数える（タイマーや分周器）',
            'ステートマシン：状態遷移の記憶（制御回路）',
          ],
        },
        {
          type: 'heading',
          text: '身近な製品での使用例',
        },
        {
          type: 'text',
          text: 'スマートフォンのメモリ、デジタル時計の秒カウンタ、ゲーム機の画面バッファ、USBメモリのデータ保持など、あらゆるデジタル機器でD-FFが使われています。',
        },
        {
          type: 'note',
          text: '現代のCPUには数十億個のフリップフロップが搭載されています',
        },
      ],
    },
    {
      id: 'summary',
      instruction: 'Dフリップフロップをマスター',
      content: [
        {
          type: 'heading',
          text: 'Dフリップフロップの要点',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'クロックの立ち上がりエッジでデータを記憶',
            'エッジトリガ方式で安定した動作を実現',
            '1ビットの記憶素子（メモリの最小単位）',
            '順序回路の基本構成要素',
          ],
        },
        {
          type: 'quiz',
          question: 'D-FFがデータを取り込むタイミングは？',
          options: [
            'D=1のとき',
            'CLK=1のとき',
            'CLKが0→1になるとき',
            'いつでも',
          ],
          correctIndex: 2,
        },
        {
          type: 'heading',
          text: '次回予告',
        },
        {
          type: 'rich-text',
          elements: [
            { text: 'SRラッチ', bold: true },
            'で、セット・リセット機能を持つ基本的な記憶回路を学びます。',
            'D-FFの内部構造の理解にもつながります。',
          ],
        },
        {
          type: 'note',
          text: 'D-FFの理解は、コンピュータの動作原理を理解する重要な一歩です',
        },
      ],
    },
  ],
};
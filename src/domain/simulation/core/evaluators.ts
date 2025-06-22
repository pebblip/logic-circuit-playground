/**
 * 純粋なゲート評価関数の実装
 *
 * すべての評価関数は純粋関数として実装され、
 * 同じ入力に対して常に同じ出力を返す
 */

import type { GateEvaluatorMap } from './types';

/**
 * ゲート評価関数のマップ
 */
export const gateEvaluators: GateEvaluatorMap = {
  // ========================================
  // 基本論理ゲート（組み合わせ回路）
  // ========================================

  AND: ([a, b]) => ({
    outputs: [a && b],
  }),

  OR: ([a, b]) => ({
    outputs: [a || b],
  }),

  NOT: ([a]) => ({
    outputs: [!a],
  }),

  XOR: ([a, b]) => ({
    outputs: [a !== b],
  }),

  NAND: ([a, b]) => ({
    outputs: [!(a && b)],
  }),

  NOR: ([a, b]) => ({
    outputs: [!(a || b)],
  }),

  // ========================================
  // 入出力ゲート
  // ========================================

  INPUT: (_inputs, gateId, context, gate) => {
    // INPUTゲートは内部状態から出力を決定
    // メモリに状態がない場合は、ゲートの初期outputs値を使用
    const memoryState = context.memory[gateId]?.state;
    const state =
      typeof memoryState === 'boolean'
        ? memoryState
        : (gate?.outputs?.[0] ?? false);
    return {
      outputs: [state],
    };
  },

  OUTPUT: inputs => {
    // inputs parameter not used - OUTPUT gates only display values
    void inputs; // explicitly mark as intentionally unused
    return {
      outputs: [], // OUTPUTゲートは値を出力しない（表示のみ）
    };
  },

  // ========================================
  // 順序回路（ステートフル）
  // ========================================

  'SR-LATCH': ([s, r], gateId, context) => {
    const memory = context.memory[gateId] || { q: false };

    let q: boolean;
    let qBar: boolean;

    if (s && r) {
      // 禁止状態：両方の出力が1
      q = true;
      qBar = true;
    } else if (s && !r) {
      // セット：Q=1, Q̄=0
      q = true;
      qBar = false;
    } else if (!s && r) {
      // リセット：Q=0, Q̄=1
      q = false;
      qBar = true;
    } else {
      // ホールド：前の状態を維持
      q = typeof memory.q === 'boolean' ? memory.q : false;
      qBar = !q;
    }

    return {
      outputs: [q, qBar],
      memoryUpdate: { q },
    };
  },

  'D-FF': ([d, clk], gateId, context) => {
    const memory = context.memory[gateId] || { prevClk: false, q: false };

    // 立ち上がりエッジ検出
    const isRisingEdge = clk && !memory.prevClk;

    let q: boolean;
    if (isRisingEdge) {
      // 立ち上がりエッジでDの値をキャプチャ
      q = d;
    } else {
      // それ以外は前の値を保持
      q = typeof memory.q === 'boolean' ? memory.q : false;
    }

    const qBar = !q;

    return {
      outputs: [q, qBar],
      memoryUpdate: { prevClk: clk, q },
    };
  },

  // ========================================
  // 特殊ゲート
  // ========================================

  CLOCK: (_inputs, gateId, context, gate) => {
    const memory = context.memory[gateId] || {
      output: false,
      frequency: 1, // デフォルト1Hz
      startTime: context.currentTime,
      manualToggle: false, // 手動トグル制御用
    };

    // 手動制御が有効な場合のみ、明示的に設定された値を使用
    if (memory.manualToggle === true) {
      return {
        outputs: [memory.manualToggle],
        memoryUpdate: {
          ...memory,
          output: memory.manualToggle,
        },
      };
    }

    // ゲートのメタデータから周波数と開始時刻を取得
    const frequency =
      gate?.metadata?.frequency ||
      (typeof memory.frequency === 'number' ? memory.frequency : 1);
    const startTime =
      gate?.metadata?.startTime ??
      (typeof memory.startTime === 'number'
        ? memory.startTime
        : context.currentTime);
    const isRunning = gate?.metadata?.isRunning ?? true;

    if (!isRunning) {
      return {
        outputs: [false],
        memoryUpdate: {
          ...memory,
          output: false,
          frequency,
          startTime,
        },
      };
    }

    // 時間ベースの矩形波生成
    const elapsed = context.currentTime - startTime;
    const period = 1000 / frequency; // 周期をms単位で計算
    const halfPeriod = period / 2;

    // 周期内の位置を計算
    const positionInCycle = elapsed % period;
    const newOutput = positionInCycle < halfPeriod;

    return {
      outputs: [newOutput],
      memoryUpdate: {
        output: newOutput,
        frequency,
        startTime,
        manualToggle: memory.manualToggle,
      },
    };
  },

  MUX: (inputs, gateId, context) => {
    // 最後の入力がセレクタ
    // 2-to-1 MUX: [D0, D1, S]
    // 4-to-1 MUX: [D0, D1, D2, D3, S0, S1]

    const memory = context.memory[gateId] || { dataInputCount: 2 };
    const dataInputCount =
      typeof memory.dataInputCount === 'number' ? memory.dataInputCount : 2;
    const selectorBits = Math.ceil(Math.log2(dataInputCount));

    // セレクタビットを数値に変換
    let selectedIndex = 0;
    for (let i = 0; i < selectorBits; i++) {
      const selectorBit = inputs[dataInputCount + i] ?? false;
      if (selectorBit) {
        selectedIndex += 1 << i;
      }
    }

    // 選択されたデータ入力を出力
    const output = inputs[selectedIndex] ?? false;

    return {
      outputs: [output],
      memoryUpdate: { dataInputCount },
    };
  },

  BINARY_COUNTER: ([clk, reset], gateId, context) => {
    const memory = context.memory[gateId] || {
      prevClk: false,
      count: 0,
      bitCount: 4, // デフォルト4ビット
    };

    const isRisingEdge = clk && !memory.prevClk;
    const bitCount = typeof memory.bitCount === 'number' ? memory.bitCount : 4;
    const maxValue = (1 << bitCount) - 1;

    let count = typeof memory.count === 'number' ? memory.count : 0;

    if (reset) {
      count = 0;
    } else if (isRisingEdge) {
      count = (count + 1) & maxValue;
    }

    // カウント値をビット配列に変換
    const outputs: boolean[] = [];
    for (let i = 0; i < bitCount; i++) {
      outputs.push(Boolean(count & (1 << i)));
    }

    return {
      outputs,
      memoryUpdate: {
        prevClk: clk,
        count,
        bitCount,
      },
    };
  },

  CUSTOM: (inputs, gateId, context) => {
    // カスタムゲートは別途定義が必要
    // ここではパススルーとして実装
    // gateId and context parameters reserved for future use
    void gateId; // explicitly mark as intentionally unused
    void context; // explicitly mark as intentionally unused
    return {
      outputs: inputs,
    };
  },
};

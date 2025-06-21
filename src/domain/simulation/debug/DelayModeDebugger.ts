/**
 * 遅延モードのデバッグツール
 *
 * 開発者がコンソールから遅延モードの動作を検証できるようにする
 */

import type { Circuit } from '../core/types';
import { EventDrivenEngine } from '../event-driven';
import type { SimulationResult } from '../event-driven-minimal/types';

export class DelayModeDebugger {
  /**
   * 回路の遅延モード動作をデバッグ
   */
  static debugCircuit(
    circuit: Circuit,
    options: {
      delayMode?: boolean;
      duration?: number;
      verbose?: boolean;
    } = {}
  ): void {
    const { delayMode = true, duration = 20, verbose = false } = options;

    // ゲート情報を表示
    if (verbose) {
      // 詳細ログ出力は必要に応じて実装
    }

    // エンジンを作成して実行
    const engine = new EventDrivenEngine({
      delayMode,
      enableDebug: true,
      maxDeltaCycles: Math.max(100, duration * 10),
      continueOnOscillation: true,
      oscillationCyclesAfterDetection: duration,
    });

    const result = engine.evaluate(circuit);

    // 結果を表示

    // イベント履歴を表示
    if (result.debugTrace && verbose) {
      // デバッグトレースの表示は必要に応じて実装
    }
  }

  /**
   * 3-NOTリングオシレータの動作を比較
   */
  static compareRingOscillator(): void {
    // 3-NOTリングオシレータを作成
    const circuit: Circuit = {
      gates: [
        {
          id: 'NOT1',
          type: 'NOT',
          position: { x: 100, y: 100 },
          output: true,
          inputs: [''],
          timing: { propagationDelay: 1.0 },
        },
        {
          id: 'NOT2',
          type: 'NOT',
          position: { x: 300, y: 100 },
          output: false,
          inputs: [''],
          timing: { propagationDelay: 1.0 },
        },
        {
          id: 'NOT3',
          type: 'NOT',
          position: { x: 500, y: 100 },
          output: false,
          inputs: [''],
          timing: { propagationDelay: 1.0 },
        },
      ],
      wires: [
        {
          id: 'w1',
          from: { gateId: 'NOT1', pinIndex: -1 },
          to: { gateId: 'NOT2', pinIndex: 0 },
          isActive: true,
        },
        {
          id: 'w2',
          from: { gateId: 'NOT2', pinIndex: -1 },
          to: { gateId: 'NOT3', pinIndex: 0 },
          isActive: false,
        },
        {
          id: 'w3',
          from: { gateId: 'NOT3', pinIndex: -1 },
          to: { gateId: 'NOT1', pinIndex: 0 },
          isActive: false,
        },
      ],
    };

    this.debugCircuit(circuit, {
      delayMode: false,
      duration: 10,
      verbose: true,
    });

    this.debugCircuit(circuit, {
      delayMode: true,
      duration: 10,
      verbose: true,
    });
  }

  /**
   * タイミング解析
   */
  static analyzeTimings(result: SimulationResult): void {
    if (!result.debugTrace) {
      return;
    }

    // ゲートごとのイベント時刻を収集
    const gateTimings = new Map<string, number[]>();

    result.debugTrace
      .filter(t => t.event === 'EVENT_SCHEDULED')
      .forEach(event => {
        const gateId = event.details.gateId as string;
        const time = event.time;

        if (!gateTimings.has(gateId)) {
          gateTimings.set(gateId, []);
        }
        gateTimings.get(gateId)!.push(time);
      });

    // ゲートごとの統計を表示
    gateTimings.forEach(times => {
      if (times.length > 1) {
        const intervals = [];
        for (let i = 1; i < times.length; i++) {
          intervals.push(times[i] - times[i - 1]);
        }

        // 平均間隔を計算（必要に応じて使用）
        // const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      }
    });
  }
}

// グローバルに公開（開発者コンソールから使用可能）
declare global {
  interface Window {
    DelayModeDebugger?: typeof DelayModeDebugger;
  }
}

if (typeof window !== 'undefined') {
  window.DelayModeDebugger = DelayModeDebugger;
}

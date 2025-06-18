/**
 * 遅延モードのデバッグツール
 * 
 * 開発者がコンソールから遅延モードの動作を検証できるようにする
 */

import type { Gate } from '../../../types/circuit';
import type { Circuit } from '../core/types';
import { EventDrivenEngine } from '../event-driven';
import type { SimulationResult } from '../event-driven-minimal/types';

export class DelayModeDebugger {
  /**
   * 回路の遅延モード動作をデバッグ
   */
  static debugCircuit(circuit: Circuit, options: {
    delayMode?: boolean;
    duration?: number;
    verbose?: boolean;
  } = {}): void {
    const { delayMode = true, duration = 20, verbose = false } = options;
    
    console.log('=== Delay Mode Debugger ===');
    console.log(`Mode: ${delayMode ? 'Delay Mode (with propagation delays)' : 'Instant Mode (delta cycles)'}`);
    console.log(`Circuit: ${circuit.gates.length} gates, ${circuit.wires.length} wires`);
    console.log('');
    
    // ゲート情報を表示
    if (verbose) {
      console.log('Gates:');
      circuit.gates.forEach((gate: Gate) => {
        const delay = gate.timing?.propagationDelay;
        console.log(`  ${gate.id}: ${gate.type} (delay: ${delay !== undefined ? delay + 'ns' : 'default'})`);
      });
      console.log('');
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
    console.log('Simulation Result:');
    console.log(`  Success: ${result.success}`);
    console.log(`  Cycles: ${result.cycleCount}`);
    console.log(`  Final time: ${result.finalState.currentTime}${delayMode ? 'ns' : ' (delta cycles)'}`);
    console.log(`  Has oscillation: ${result.hasOscillation}`);
    
    if (result.oscillationInfo) {
      console.log(`  Oscillation detected at cycle: ${result.oscillationInfo.detectedAt}`);
      console.log(`  Oscillation period: ${result.oscillationInfo.period}`);
    }
    
    // イベント履歴を表示
    if (result.debugTrace && verbose) {
      console.log('\nEvent History:');
      const events = result.debugTrace
        .filter(t => t.event === 'EVENT_SCHEDULED')
        .slice(0, duration);
      
      let lastTime = -1;
      events.forEach(event => {
        const time = event.time;
        const gateId = event.details.gateId;
        const value = event.details.newValue;
        
        if (time !== lastTime) {
          console.log(`\nt=${time}${delayMode ? 'ns' : ''}:`);
          lastTime = time;
        }
        console.log(`  ${gateId} → ${value}`);
      });
    }
    
    console.log('\n=== End Debug ===');
  }
  
  /**
   * 3-NOTリングオシレータの動作を比較
   */
  static compareRingOscillator(): void {
    console.log('=== Ring Oscillator Comparison ===\n');
    
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
    
    console.log('1. Instant Mode (Delta Cycles):');
    console.log('--------------------------------');
    this.debugCircuit(circuit, { delayMode: false, duration: 10, verbose: true });
    
    console.log('\n\n2. Delay Mode (Propagation Delays):');
    console.log('------------------------------------');
    this.debugCircuit(circuit, { delayMode: true, duration: 10, verbose: true });
  }
  
  /**
   * タイミング解析
   */
  static analyzeTimings(result: SimulationResult): void {
    if (!result.debugTrace) {
      console.log('No debug trace available');
      return;
    }
    
    console.log('=== Timing Analysis ===');
    
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
    gateTimings.forEach((times, gateId) => {
      if (times.length > 1) {
        const intervals = [];
        for (let i = 1; i < times.length; i++) {
          intervals.push(times[i] - times[i - 1]);
        }
        
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        console.log(`\n${gateId}:`);
        console.log(`  Events: ${times.length}`);
        console.log(`  Times: ${times.slice(0, 5).join(', ')}${times.length > 5 ? '...' : ''}`);
        console.log(`  Average interval: ${avgInterval.toFixed(3)}`);
      }
    });
    
    console.log('\n=== End Analysis ===');
  }
}

// グローバルに公開（開発者コンソールから使用可能）
if (typeof window !== 'undefined') {
  (window as any).DelayModeDebugger = DelayModeDebugger;
}
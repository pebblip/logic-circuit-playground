/**
 * 統合されたイベント駆動シミュレーションエンジン
 *
 * MinimalEventDrivenEngineの機能を拡張し、遅延モードをサポート
 */

import type { Gate, Wire } from '../../../types/circuit';
import type { Circuit } from '../core/types';
import type {
  SimTime,
  GateEvent,
  GateState,
  CircuitState,
  SimulationConfig,
  SimulationResult,
  DebugTrace,
} from '../event-driven-minimal/types';
import { DEFAULT_CONFIG } from '../event-driven-minimal/types';
import { EventQueue } from '../event-driven-minimal/EventQueue';
import { evaluateGate } from '../event-driven-minimal/gateEvaluator';
import { DEFAULT_GATE_DELAYS } from '../../../constants/gateDelays';
import { calculateCustomGateDelay } from '../delay/customGateDelay';
import { isCustomGate } from '../../../types/gates';

export interface EventDrivenConfig extends SimulationConfig {
  /** 遅延モードの有効/無効 */
  delayMode: boolean;
  /** 時間単位（将来の拡張用） */
  timeUnit?: 'ps' | 'ns' | 'us' | 'ms';
}

const DEFAULT_EVENT_DRIVEN_CONFIG: EventDrivenConfig = {
  ...DEFAULT_CONFIG,
  delayMode: false,
  timeUnit: 'ns',
};

export class EventDrivenEngine {
  private eventQueue = new EventQueue();
  private circuitState: CircuitState;
  private config: EventDrivenConfig;
  private debugTrace: DebugTrace[] = [];

  // ゲートとワイヤーの接続情報をキャッシュ（MinimalEventDrivenEngineから継承）
  private gateOutputWires: Map<string, Wire[]> = new Map();
  private gateInputWires: Map<string, { wire: Wire; sourceGate: Gate }[]> =
    new Map();
  private gateMap: Map<string, Gate> = new Map();

  // 発振検出用の状態履歴（MinimalEventDrivenEngineから継承）
  private stateHistory: string[] = [];
  private readonly MAX_HISTORY = 20;
  private readonly OSCILLATION_THRESHOLD = 2;

  private oscillationDetected = false;
  private oscillationDetectedAt = 0;
  private oscillationCyclesAfterDetection = 0;
  private oscillationPattern: string[] = [];
  private oscillationPeriod = 0;

  constructor(config: Partial<EventDrivenConfig> = {}) {
    this.config = { ...DEFAULT_EVENT_DRIVEN_CONFIG, ...config };
    this.circuitState = {
      gateStates: new Map(),
      currentTime: 0,
      deltaCount: 0,
    };
  }

  /**
   * 遅延モードの切り替え
   */
  setDelayMode(enabled: boolean): void {
    this.config.delayMode = enabled;
    if (this.config.enableDebug) {
      console.log(`Delay mode ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  /**
   * ゲートの遅延時間を計算
   */
  private calculateGateDelay(gate: Gate): SimTime {
    if (!this.config.delayMode) {
      // 遅延モードOFF: デルタサイクル（従来の動作）
      return 0.0001;
    }

    // 遅延モードON: ゲート固有の遅延を使用

    // 1. 個別設定があれば優先（Phase 5で実装）
    if (gate.timing?.propagationDelay !== undefined) {
      return gate.timing.propagationDelay;
    }

    // 2. カスタムゲートの場合、内部回路から計算
    if (isCustomGate(gate) && gate.customGateDefinition) {
      const delayInfo = calculateCustomGateDelay(gate.customGateDefinition);
      if (delayInfo) {
        return delayInfo.maxDelay; // クリティカルパスの遅延を使用
      }
    }

    // 3. デフォルト値を使用
    const defaultDelay = DEFAULT_GATE_DELAYS[gate.type];
    if (defaultDelay !== undefined) {
      return defaultDelay;
    }

    // 4. フォールバック（未定義のゲートタイプ）
    return 1.0; // 1ns
  }

  /**
   * 回路を評価（MinimalEventDrivenEngineと同じインターフェース）
   */
  evaluate(circuit: Circuit): SimulationResult {
    this.initialize(circuit);

    // 初期イベントをスケジュール
    this.scheduleInitialEvents(circuit);

    // シミュレーション実行
    let cycleCount = 0;
    let hasOscillation = false;

    while (
      !this.eventQueue.isEmpty() &&
      cycleCount < this.config.maxDeltaCycles
    ) {
      const currentTime = this.eventQueue.getNextTime()!;
      this.circuitState.currentTime = currentTime;

      // デルタサイクル処理
      const converged = this.processDeltaCycle(currentTime);

      if (!converged) {
        hasOscillation = true;

        if (!this.oscillationDetected) {
          this.oscillationDetected = true;
          this.oscillationDetectedAt = cycleCount;
          this.addDebugTrace(currentTime, 'OSCILLATION_DETECTED', {
            cycleCount,
            pattern: this.oscillationPattern,
            period: this.oscillationPeriod,
          });

          if (!this.config.continueOnOscillation) {
            break;
          }
        }

        if (this.config.continueOnOscillation && this.oscillationDetected) {
          this.oscillationCyclesAfterDetection++;

          if (
            this.config.oscillationCyclesAfterDetection &&
            this.oscillationCyclesAfterDetection >=
              this.config.oscillationCyclesAfterDetection
          ) {
            this.addDebugTrace(currentTime, 'OSCILLATION_CYCLES_COMPLETED', {
              cyclesAfterDetection: this.oscillationCyclesAfterDetection,
            });
            break;
          }
        }
      }

      cycleCount++;
    }

    // 状態を回路に反映
    this.updateCircuitFromState(circuit);

    return {
      success: cycleCount < this.config.maxDeltaCycles,
      finalState: this.circuitState,
      cycleCount,
      hasOscillation,
      oscillationInfo: this.oscillationDetected
        ? {
            detectedAt: this.oscillationDetectedAt,
            period: this.oscillationPeriod,
            pattern: this.oscillationPattern,
          }
        : undefined,
      debugTrace: this.config.enableDebug ? this.debugTrace : undefined,
    };
  }

  // 以下、MinimalEventDrivenEngineから必要なメソッドを移植
  // （初期化、イベント処理、発振検出など）

  private initialize(circuit: Circuit): void {
    // リセット
    this.eventQueue = new EventQueue();
    this.circuitState.gateStates.clear();
    this.circuitState.currentTime = 0;
    this.circuitState.deltaCount = 0;
    this.debugTrace = [];
    this.gateOutputWires.clear();
    this.gateInputWires.clear();
    this.gateMap.clear();
    this.stateHistory = [];
    this.oscillationDetected = false;
    this.oscillationDetectedAt = 0;
    this.oscillationCyclesAfterDetection = 0;
    this.oscillationPattern = [];
    this.oscillationPeriod = 0;

    // ゲートマップを構築
    for (const gate of circuit.gates) {
      this.gateMap.set(gate.id, gate);
    }

    // ワイヤー接続情報を構築
    for (const wire of circuit.wires) {
      // 出力側
      const outputWires = this.gateOutputWires.get(wire.from.gateId) || [];
      outputWires.push(wire);
      this.gateOutputWires.set(wire.from.gateId, outputWires);

      // 入力側
      const fromGate = circuit.gates.find(
        (g: Gate) => g.id === wire.from.gateId
      );
      if (fromGate) {
        const inputWires = this.gateInputWires.get(wire.to.gateId) || [];
        inputWires.push({ wire, sourceGate: fromGate });
        this.gateInputWires.set(wire.to.gateId, inputWires);
      }
    }

    // ゲート状態を初期化
    for (const gate of circuit.gates) {
      const inputCount = this.getGateInputCount(gate);
      const outputCount = this.getGateOutputCount(gate);

      // 出力値を初期化
      let initialOutputs: boolean[];
      if (gate.outputs && gate.outputs.length === outputCount) {
        initialOutputs = [...gate.outputs];
      } else if (gate.type === 'SR-LATCH' || gate.type === 'D-FF') {
        // SR-LATCHとD-FFは初期状態でQ=false, Q̄=trueに設定
        initialOutputs = [gate.output || false, !(gate.output || false)];
      } else {
        initialOutputs = new Array(outputCount).fill(gate.output || false);
      }

      const state: GateState = {
        inputs: new Array(inputCount).fill(false),
        outputs: initialOutputs,
        previousInputs: new Array(inputCount).fill(false),
        metadata: gate.metadata ? { ...gate.metadata } : {},
      };
      this.circuitState.gateStates.set(gate.id, state);
    }
  }

  private scheduleInitialEvents(circuit: Circuit): void {
    this.addDebugTrace(0, 'INITIAL_SCHEDULE_START', {});

    // INPUTとCLOCKゲートの初期イベント
    for (const gate of circuit.gates) {
      if (gate.type === 'INPUT' || gate.type === 'CLOCK') {
        const state = this.circuitState.gateStates.get(gate.id)!;
        const newOutput = gate.output;

        state.outputs[0] = newOutput;

        this.eventQueue.schedule({
          time: 0,
          gateId: gate.id,
          outputIndex: 0,
          newValue: newOutput,
        });

        this.addDebugTrace(0, 'INITIAL_EVENT_SCHEDULED', {
          gateId: gate.id,
          value: newOutput,
        });
      }
    }

    // その他のゲートの初期評価
    const initialTime = this.config.delayMode ? 0 : 0.00001;
    for (const gate of circuit.gates) {
      if (gate.type !== 'INPUT' && gate.type !== 'CLOCK') {
        const state = this.circuitState.gateStates.get(gate.id)!;
        const inputs = this.collectGateInputs(gate);
        const expectedOutputs = evaluateGate(gate, inputs, state);

        for (let i = 0; i < expectedOutputs.length; i++) {
          if (state.outputs[i] !== expectedOutputs[i]) {
            // 遅延モードの場合は、ゲートの遅延を考慮した時刻でスケジュール
            const scheduleTime = this.config.delayMode
              ? this.calculateGateDelay(gate)
              : initialTime;

            this.eventQueue.schedule({
              time: scheduleTime,
              gateId: gate.id,
              outputIndex: i,
              newValue: expectedOutputs[i],
            });

            this.addDebugTrace(scheduleTime, 'INITIAL_MISMATCH_SCHEDULED', {
              gateId: gate.id,
              outputIndex: i,
              currentValue: state.outputs[i],
              expectedValue: expectedOutputs[i],
              delay: this.config.delayMode ? this.calculateGateDelay(gate) : 0,
            });
          }
        }
      }
    }
  }

  private processDeltaCycle(time: SimTime): boolean {
    const events = this.eventQueue.popEventsAt(time);

    if (events.length === 0) {
      return true; // 収束
    }

    const affectedGates = new Set<string>();

    for (const event of events) {
      this.processEvent(event, affectedGates);
    }

    // 現在の状態のスナップショットを作成
    const stateSnapshot = this.createStateSnapshot();

    // 発振検出
    const oscillationInfo = this.detectOscillation(stateSnapshot);
    if (oscillationInfo.detected) {
      this.oscillationPattern = oscillationInfo.pattern || [];
      this.oscillationPeriod = oscillationInfo.period || 0;

      this.addDebugTrace(time, 'OSCILLATION_PATTERN_DETECTED', {
        pattern: stateSnapshot,
        history: this.stateHistory.slice(-5),
        period: this.oscillationPeriod,
      });
      return false; // 発振検出
    }

    // 影響を受けたゲートを再評価
    let hasChanges = false;

    for (const gateId of affectedGates) {
      const gate = this.findGate(gateId);
      if (!gate) continue;

      // 遅延を考慮した次のイベント時刻を計算
      const delay = this.calculateGateDelay(gate);
      const nextTime = time + delay;

      const changes = this.evaluateGateAndSchedule(gateId, nextTime);
      if (changes) {
        hasChanges = true;
      }
    }

    return true;
  }

  // その他の必要なメソッドは省略（MinimalEventDrivenEngineから移植）

  private processEvent(event: GateEvent, affectedGates: Set<string>): void {
    const state = this.circuitState.gateStates.get(event.gateId);
    if (!state) return;

    state.outputs[event.outputIndex] = event.newValue;

    const outputWires = this.gateOutputWires.get(event.gateId) || [];
    for (const wire of outputWires) {
      const expectedOutputIndex =
        wire.from.pinIndex === -1 ? 0 : wire.from.pinIndex === -2 ? 1 : 0;

      if (event.outputIndex === expectedOutputIndex) {
        affectedGates.add(wire.to.gateId);
      }
    }
  }

  private evaluateGateAndSchedule(gateId: string, time: SimTime): boolean {
    const gate = this.findGate(gateId);
    if (!gate) return false;

    const state = this.circuitState.gateStates.get(gateId)!;
    const inputs = this.collectGateInputs(gate);

    // デバッグ：評価前の状態
    this.addDebugTrace(time, 'GATE_EVALUATE_START', {
      gateId,
      gateType: gate.type,
      inputs: inputs.map((v, i) => `input[${i}]=${v}`),
      currentOutputs: state.outputs.map((v, i) => `output[${i}]=${v}`),
    });

    // D-FFのクロック状態を評価前に保存（重要！）
    let savedPreviousClockState: boolean | undefined;
    if (gate.type === 'D-FF' && inputs.length >= 2) {
      savedPreviousClockState =
        (state.metadata?.previousClockState as boolean) ?? false;
      // 現在のクロック状態をメタデータに保存（evaluateGateで使用される）
      state.metadata = {
        ...state.metadata,
        previousClockState: savedPreviousClockState,
      };
    }

    // ゲートを評価
    const newOutputs = evaluateGate(gate, inputs, state);

    // デバッグ：評価後の結果
    this.addDebugTrace(time, 'GATE_EVALUATE_END', {
      gateId,
      newOutputs: newOutputs.map((v, i) => `output[${i}]=${v}`),
    });

    // 出力が変化したらイベントをスケジュール
    let hasChanges = false;
    for (let i = 0; i < newOutputs.length; i++) {
      if (state.outputs[i] !== newOutputs[i]) {
        this.eventQueue.schedule({
          time,
          gateId,
          outputIndex: i,
          newValue: newOutputs[i],
        });
        hasChanges = true;

        this.addDebugTrace(time, 'EVENT_SCHEDULED', {
          gateId,
          outputIndex: i,
          oldValue: state.outputs[i],
          newValue: newOutputs[i],
          time: time,
        });
      }
    }

    // 入力を記録（次回のエッジ検出用）
    state.previousInputs = [...inputs];

    // D-FFのメタデータを評価後に正しく更新
    if (gate.type === 'D-FF' && inputs.length >= 2) {
      const d = inputs[0];
      const clk = inputs[1];
      const prevClk = savedPreviousClockState ?? false;

      // 立ち上がりエッジでqOutputを更新
      if (!prevClk && clk && newOutputs.length >= 2) {
        state.metadata = {
          ...state.metadata,
          qOutput: newOutputs[0], // Q出力
          qBarOutput: newOutputs[1], // Q̄出力
          previousClockState: clk, // 次回評価用に現在のクロック状態を保存
        };

        this.addDebugTrace(time, 'D-FF_EDGE_DETECTED', {
          gateId,
          d,
          prevClk,
          clk,
          qOutput: newOutputs[0],
          qBarOutput: newOutputs[1],
          updatedPreviousClockState: clk,
        });
      } else {
        // エッジが検出されなくても、クロック状態は更新する
        state.metadata = {
          ...state.metadata,
          previousClockState: clk,
        };

        this.addDebugTrace(time, 'D-FF_CLOCK_STATE_UPDATED', {
          gateId,
          prevClk,
          clk,
          newPreviousClockState: clk,
        });
      }
    } else if (gate.type === 'SR-LATCH' && inputs.length >= 2) {
      const s = inputs[0];
      const r = inputs[1];

      if (newOutputs.length >= 2) {
        state.metadata = {
          ...state.metadata,
          qOutput: newOutputs[0], // Q出力
          qBarOutput: newOutputs[1], // Q̄出力
        };
      }
    }

    return hasChanges;
  }

  private collectGateInputs(gate: Gate): boolean[] {
    const inputWires = this.gateInputWires.get(gate.id) || [];
    const inputCount = this.getGateInputCount(gate);
    const inputs = new Array(inputCount).fill(false);

    for (const { wire, sourceGate } of inputWires) {
      const sourceState = this.circuitState.gateStates.get(sourceGate.id);
      if (!sourceState) continue;

      const outputIndex =
        wire.from.pinIndex === -1 ? 0 : wire.from.pinIndex === -2 ? 1 : 0;
      const value = sourceState.outputs[outputIndex] || false;

      if (wire.to.pinIndex >= 0 && wire.to.pinIndex < inputs.length) {
        inputs[wire.to.pinIndex] = value;
      }
    }

    return inputs;
  }

  private updateCircuitFromState(circuit: Circuit): void {
    for (const gate of circuit.gates) {
      const state = this.circuitState.gateStates.get(gate.id);
      if (!state) continue;

      gate.output = state.outputs[0] || false;
      if (state.outputs.length > 1) {
        gate.outputs = [...state.outputs];
      }

      for (let i = 0; i < gate.inputs.length; i++) {
        gate.inputs[i] = state.inputs[i] ? 'true' : 'false';
      }

      if (state.metadata) {
        gate.metadata = { ...gate.metadata, ...state.metadata };
      }
    }

    for (const wire of circuit.wires) {
      const sourceGate = this.findGate(wire.from.gateId);
      if (!sourceGate) continue;

      const state = this.circuitState.gateStates.get(sourceGate.id);
      if (!state) continue;

      const outputIndex =
        wire.from.pinIndex === -1 ? 0 : wire.from.pinIndex === -2 ? 1 : 0;
      wire.isActive = state.outputs[outputIndex] || false;
    }
  }

  private findGate(gateId: string): Gate | undefined {
    return this.gateMap.get(gateId);
  }

  private addDebugTrace(
    time: SimTime,
    event: string,
    details: Record<string, unknown>
  ): void {
    if (this.config.enableDebug) {
      this.debugTrace.push({ time, event, details });
    }
  }

  /**
   * 状態のスナップショットを作成（発振検出用）
   */
  private createStateSnapshot(): string {
    const states: string[] = [];

    // ゲートの出力状態のみを記録（入力は変化しないため）
    for (const [gateId, state] of this.circuitState.gateStates) {
      const gate = this.gateMap.get(gateId);
      if (gate && gate.type !== 'INPUT' && gate.type !== 'CLOCK') {
        states.push(`${gateId}:${state.outputs.join(',')}`);
      }
    }

    return states.sort().join('|');
  }

  /**
   * 発振パターンを検出
   */
  private detectOscillation(currentSnapshot: string): {
    detected: boolean;
    pattern?: string[];
    period?: number;
  } {
    // 履歴に追加
    this.stateHistory.push(currentSnapshot);

    // 履歴サイズを制限
    if (this.stateHistory.length > this.MAX_HISTORY) {
      this.stateHistory.shift();
    }

    // 履歴が少ない場合は判定しない
    if (this.stateHistory.length < this.OSCILLATION_THRESHOLD) {
      return { detected: false };
    }

    // 同じ状態が繰り返されているかチェック
    let count = 0;
    let firstMatchIndex = -1;
    for (let i = this.stateHistory.length - 2; i >= 0; i--) {
      if (this.stateHistory[i] === currentSnapshot) {
        if (firstMatchIndex === -1) {
          firstMatchIndex = i;
        }
        count++;
        if (count >= this.OSCILLATION_THRESHOLD - 1) {
          // 周期を計算
          const period = this.stateHistory.length - 1 - firstMatchIndex;
          const pattern = this.stateHistory.slice(
            firstMatchIndex,
            this.stateHistory.length - 1
          );
          return { detected: true, pattern, period };
        }
      }
    }

    // 2つの状態が交互に現れるパターンも検出（A-B-A-B）
    if (this.stateHistory.length >= 4) {
      const len = this.stateHistory.length;
      const last4 = this.stateHistory.slice(-4);
      if (
        last4[0] === last4[2] &&
        last4[1] === last4[3] &&
        last4[0] !== last4[1]
      ) {
        return { detected: true, pattern: [last4[0], last4[1]], period: 2 };
      }
    }

    return { detected: false };
  }

  /**
   * ゲートの入力数を取得
   */
  private getGateInputCount(gate: Gate): number {
    // カスタムゲートの場合
    if (isCustomGate(gate) && gate.customGateDefinition) {
      return gate.customGateDefinition.inputs.length;
    }

    switch (gate.type) {
      case 'INPUT':
      case 'CLOCK':
        return 0;
      case 'OUTPUT':
      case 'NOT':
        return 1;
      case 'AND':
      case 'OR':
      case 'XOR':
      case 'NAND':
      case 'NOR':
      case 'SR-LATCH':
      case 'D-FF':
        return 2;
      case 'MUX':
        return 3;
      default:
        return gate.inputs?.length || 0;
    }
  }

  /**
   * ゲートの出力数を取得
   */
  private getGateOutputCount(gate: Gate): number {
    if (gate.outputs) {
      return gate.outputs.length;
    }

    // カスタムゲートの場合
    if (isCustomGate(gate) && gate.customGateDefinition) {
      return gate.customGateDefinition.outputs.length;
    }

    // 特殊ゲートの出力数を明示的に定義
    switch (gate.type) {
      case 'SR-LATCH':
      case 'D-FF':
        return 2; // QとQ̄の2つの出力
      default:
        return 1;
    }
  }
}

/**
 * 最小限のイベント駆動シミュレーションエンジン
 * 循環回路を可能にする核心部分
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
} from './types';
import { DEFAULT_CONFIG } from './types';
import { EventQueue } from './EventQueue';
import { evaluateGate } from './gateEvaluator';

export class MinimalEventDrivenEngine {
  private eventQueue = new EventQueue();
  private circuitState: CircuitState;
  private config: SimulationConfig;
  private debugTrace: DebugTrace[] = [];
  
  // ゲートとワイヤーの接続情報をキャッシュ
  private gateOutputWires: Map<string, Wire[]> = new Map();
  private gateInputWires: Map<string, { wire: Wire; sourceGate: Gate }[]> = new Map();
  private gateMap: Map<string, Gate> = new Map();
  
  // 発振検出用の状態履歴
  private stateHistory: string[] = [];
  private readonly MAX_HISTORY = 20;
  private readonly OSCILLATION_THRESHOLD = 2; // 同じパターンが2回繰り返したら発振
  
  // 発振情報
  private oscillationDetected = false;
  private oscillationDetectedAt = 0;
  private oscillationCyclesAfterDetection = 0;
  private oscillationPattern: string[] = [];
  private oscillationPeriod = 0;

  constructor(config: Partial<SimulationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.circuitState = {
      gateStates: new Map(),
      currentTime: 0,
      deltaCount: 0,
    };
  }

  /**
   * 回路を評価
   */
  evaluate(circuit: Circuit): SimulationResult {
    this.initialize(circuit);
    
    // 初期イベントをスケジュール
    this.scheduleInitialEvents(circuit);
    
    // シミュレーション実行
    let cycleCount = 0;
    let hasOscillation = false;
    
    while (!this.eventQueue.isEmpty() && cycleCount < this.config.maxDeltaCycles) {
      const currentTime = this.eventQueue.getNextTime()!;
      
      
      // デルタサイクル処理
      const converged = this.processDeltaCycle(currentTime);
      
      if (!converged) {
        hasOscillation = true;
        
        if (!this.oscillationDetected) {
          // 初回の発振検出
          this.oscillationDetected = true;
          this.oscillationDetectedAt = cycleCount;
          this.addDebugTrace(currentTime, 'OSCILLATION_DETECTED', {
            cycleCount,
            pattern: this.oscillationPattern,
            period: this.oscillationPeriod
          });
          
          // 継続オプションが無効の場合は終了
          if (!this.config.continueOnOscillation) {
            break;
          }
        }
        
        // 発振検出後の継続処理
        if (this.config.continueOnOscillation && this.oscillationDetected) {
          this.oscillationCyclesAfterDetection++;
          
          // 指定されたサイクル数に達したら終了
          if (this.config.oscillationCyclesAfterDetection && 
              this.oscillationCyclesAfterDetection >= this.config.oscillationCyclesAfterDetection) {
            this.addDebugTrace(currentTime, 'OSCILLATION_CYCLES_COMPLETED', {
              cyclesAfterDetection: this.oscillationCyclesAfterDetection
            });
            break;
          }
          
          // 発振パターンを元に次のイベントを強制的にスケジュール
          this.scheduleNextOscillationCycle(currentTime + 0.0001);
        }
      }
      
      cycleCount++;
    }
    
    // デバッグ：サイクル数が多い場合は警告
    if (cycleCount > 10) {
      this.addDebugTrace(0, 'HIGH_CYCLE_COUNT', { cycleCount });
    }
    
    // 結果を既存の回路形式に反映
    this.updateCircuitFromState(circuit);
    
    return {
      success: !hasOscillation || (hasOscillation && Boolean(this.config.continueOnOscillation)),
      finalState: this.circuitState,
      cycleCount,
      hasOscillation,
      oscillationInfo: this.oscillationDetected ? {
        detectedAt: this.oscillationDetectedAt,
        period: this.oscillationPeriod,
        pattern: this.oscillationPattern
      } : undefined,
      debugTrace: this.config.enableDebug ? this.debugTrace : undefined,
    };
  }

  /**
   * 初期化
   */
  private initialize(circuit: Circuit): void {
    this.eventQueue.clear();
    this.circuitState.gateStates.clear();
    this.debugTrace = [];
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
    
    // 接続情報をキャッシュ
    this.buildConnectionCache(circuit);
    
    // ゲート状態を初期化
    for (const gate of circuit.gates) {
      const inputCount = this.getGateInputCount(gate);
      const outputCount = this.getGateOutputCount(gate);
      
      // 出力値を初期化
      let initialOutputs: boolean[];
      if (gate.outputs && gate.outputs.length === outputCount) {
        initialOutputs = [...gate.outputs];
      } else if (gate.type === 'SR-LATCH') {
        // SR-LATCHは初期状態でQ=false, Q̄=trueに設定
        initialOutputs = [gate.output || false, !(gate.output || false)];
      } else if (gate.type === 'D-FF') {
        // D-FFも同様にQ=false, Q̄=trueに設定
        initialOutputs = [gate.output || false, !(gate.output || false)];
      } else {
        initialOutputs = new Array(outputCount).fill(gate.output || false);
      }
      
      this.circuitState.gateStates.set(gate.id, {
        inputs: new Array(inputCount).fill(false),
        outputs: initialOutputs,
        metadata: gate.metadata ? { ...gate.metadata } : undefined,
      });
      
    }
  }

  /**
   * 接続情報のキャッシュを構築
   */
  private buildConnectionCache(circuit: Circuit): void {
    this.gateOutputWires.clear();
    this.gateInputWires.clear();
    
    // 各ゲートの入出力ワイヤーを収集
    for (const gate of circuit.gates) {
      this.gateOutputWires.set(gate.id, []);
      this.gateInputWires.set(gate.id, []);
    }
    
    // ワイヤー情報を解析
    for (const wire of circuit.wires) {
      // 出力側
      const outputWires = this.gateOutputWires.get(wire.from.gateId) || [];
      outputWires.push(wire);
      this.gateOutputWires.set(wire.from.gateId, outputWires);
      
      // 入力側
      const fromGate = circuit.gates.find((g: Gate) => g.id === wire.from.gateId);
      if (fromGate) {
        const inputWires = this.gateInputWires.get(wire.to.gateId) || [];
        inputWires.push({ wire, sourceGate: fromGate });
        this.gateInputWires.set(wire.to.gateId, inputWires);
      }
    }
  }

  /**
   * 初期イベントをスケジュール
   */
  private scheduleInitialEvents(circuit: Circuit): void {
    // デバッグログ
    this.addDebugTrace(0, 'INITIAL_SCHEDULE_START', {});
    
    // まず、INPUTとCLOCKゲートの状態を直接更新
    for (const gate of circuit.gates) {
      if (gate.type === 'INPUT') {
        const state = this.circuitState.gateStates.get(gate.id)!;
        const newOutput = gate.output;
        
        // 状態を直接更新
        state.outputs[0] = newOutput;
        
        // INPUTゲートは常に初期イベントをスケジュール
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
      } else if (gate.type === 'CLOCK') {
        // CLOCKゲートのstartTime初期化
        const state = this.circuitState.gateStates.get(gate.id)!;
        if (gate.metadata && gate.metadata.startTime === undefined) {
          state.metadata = {
            ...state.metadata,
            frequency: gate.metadata.frequency || 1,
            isRunning: gate.metadata.isRunning ?? true,
            startTime: Date.now(),
          };
        }
        
        // CLOCKの初期状態を評価
        const inputs: boolean[] = [];
        const outputs = evaluateGate(gate, inputs, state);
        state.outputs[0] = outputs[0];
        
        // 初期イベントをスケジュール
        this.eventQueue.schedule({
          time: 0,
          gateId: gate.id,
          outputIndex: 0,
          newValue: outputs[0],
        });
      }
    }
    
    // CLOCKゲートの定期的な再評価をスケジュール
    // これは本来の用途ではないが、CLOCKの動作を実現するための対策
    for (const gate of circuit.gates) {
      if (gate.type === 'CLOCK' && gate.metadata?.isRunning) {
        const state = this.circuitState.gateStates.get(gate.id);
        if (state && state.metadata?.frequency) {
          const frequency = state.metadata.frequency as number;
          const period = 1000 / frequency;
          // 次の変化タイミングを計算
          const startTime = state.metadata.startTime as number || Date.now();
          const elapsed = Date.now() - startTime;
          const nextChangeTime = Math.ceil(elapsed / period) * period;
          
        }
      }
    }
    
    // 全てのゲートを初期評価して、不整合があればイベントをスケジュール
    const initialTime = 0.00001;
    for (const gate of circuit.gates) {
      if (gate.type !== 'INPUT' && gate.type !== 'CLOCK') {
        const state = this.circuitState.gateStates.get(gate.id)!;
        const inputs = this.collectGateInputs(gate);
        const expectedOutputs = evaluateGate(gate, inputs, state);
        
        // 現在の出力と期待される出力が異なる場合、イベントをスケジュール
        for (let i = 0; i < expectedOutputs.length; i++) {
          if (state.outputs[i] !== expectedOutputs[i]) {
            this.eventQueue.schedule({
              time: initialTime,
              gateId: gate.id,
              outputIndex: i,
              newValue: expectedOutputs[i],
            });
            
            this.addDebugTrace(initialTime, 'INITIAL_MISMATCH_SCHEDULED', {
              gateId: gate.id,
              outputIndex: i,
              currentValue: state.outputs[i],
              expectedValue: expectedOutputs[i],
            });
          }
        }
      }
    }
  }

  /**
   * デルタサイクル処理
   */
  private processDeltaCycle(time: SimTime): boolean {
    const events = this.eventQueue.popEventsAt(time);
    
    if (events.length === 0) {
      return true; // 収束
    }
    
    // イベントを処理
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
        period: this.oscillationPeriod
      });
      return false; // 発振検出
    }
    
    // 影響を受けたゲートを再評価
    const nextDeltaTime = time + 0.0001; // デルタ時間を追加
    let hasChanges = false;
    
    for (const gateId of affectedGates) {
      const changes = this.evaluateGateAndSchedule(gateId, nextDeltaTime);
      if (changes) {
        hasChanges = true;
      }
    }
    
    return true; // 収束または処理継続
  }

  /**
   * イベントを処理
   */
  private processEvent(event: GateEvent, affectedGates: Set<string>): void {
    const state = this.circuitState.gateStates.get(event.gateId);
    if (!state) return;
    
    // 出力を更新
    state.outputs[event.outputIndex] = event.newValue;
    
    // このゲートの出力に接続されているゲートを収集
    const outputWires = this.gateOutputWires.get(event.gateId) || [];
    for (const wire of outputWires) {
      // pinIndex -1は単一出力ゲートの出力（出力index 0）
      // pinIndex -2はSR-LATCHのQ̄出力（出力index 1）
      const expectedOutputIndex = wire.from.pinIndex === -1 ? 0 : 
                                  wire.from.pinIndex === -2 ? 1 : 0;
      
      if (event.outputIndex === expectedOutputIndex) {
        affectedGates.add(wire.to.gateId);
        this.addDebugTrace(event.time, 'AFFECTED_GATE_ADDED', {
          fromGate: event.gateId,
          toGate: wire.to.gateId,
          wirePinIndex: wire.from.pinIndex,
          outputIndex: event.outputIndex,
        });
      }
    }
    
    this.addDebugTrace(event.time, 'EVENT_PROCESSED', {
      gateId: event.gateId,
      output: event.outputIndex,
      value: event.newValue,
    });
  }

  /**
   * ゲートを評価して新しいイベントをスケジュール
   */
  private evaluateGateAndSchedule(gateId: string, time: SimTime): boolean {
    const gate = this.findGate(gateId);
    if (!gate) return false;
    
    const state = this.circuitState.gateStates.get(gateId)!;
    
    // 入力値を収集
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
      savedPreviousClockState = (state.metadata?.previousClockState as boolean) ?? false;
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
          qOutput: newOutputs[0],     // Q出力
          qBarOutput: newOutputs[1],  // Q̄出力
          previousClockState: clk,    // 次回評価用に現在のクロック状態を保存
        };
        
        this.addDebugTrace(time, 'D-FF_EDGE_DETECTED', {
          gateId,
          d,
          prevClk,
          clk,
          qOutput: newOutputs[0],
          qBarOutput: newOutputs[1],
          updatedPreviousClockState: clk
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
          newPreviousClockState: clk
        });
      }
    } else if (gate.type === 'SR-LATCH' && inputs.length >= 2) {
      const s = inputs[0];
      const r = inputs[1];
      
      if (newOutputs.length >= 2) {
        state.metadata = {
          ...state.metadata,
          qOutput: newOutputs[0],     // Q出力
          qBarOutput: newOutputs[1],  // Q̄出力
        };
      }
    }
    
    return hasChanges;
  }

  /**
   * ゲートの入力値を収集
   */
  private collectGateInputs(gate: Gate): boolean[] {
    const inputWires = this.gateInputWires.get(gate.id) || [];
    const inputCount = this.getGateInputCount(gate);
    const inputs = new Array(inputCount).fill(false);
    
    
    for (const { wire, sourceGate } of inputWires) {
      const sourceState = this.circuitState.gateStates.get(sourceGate.id);
      if (!sourceState) continue;
      
      // pinIndex -1は単一出力ゲートの出力（出力index 0）
      // pinIndex -2はSR-LATCHのQ̄出力（出力index 1）
      const outputIndex = wire.from.pinIndex === -1 ? 0 : 
                         wire.from.pinIndex === -2 ? 1 : 0;
      const value = sourceState.outputs[outputIndex] || false;
      
      
      if (wire.to.pinIndex >= 0 && wire.to.pinIndex < inputs.length) {
        inputs[wire.to.pinIndex] = value;
      }
    }
    
    return inputs;
  }


  // ヘルパーメソッド
  private findGate(gateId: string): Gate | undefined {
    return this.gateMap.get(gateId);
  }

  private getGateInputCount(gate: Gate): number {
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

  private getGateOutputCount(gate: Gate): number {
    if (gate.outputs) {
      return gate.outputs.length;
    }
    
    // 特殊ゲートの出力数を明示的に定義
    switch (gate.type) {
      case 'SR-LATCH':
        return 2; // QとQ̄の2つの出力
      case 'D-FF':
        return 2; // QとQ̄の2つの出力
      default:
        return 1;
    }
  }

  private addDebugTrace(time: SimTime, event: string, details: Record<string, unknown>): void {
    if (this.config.enableDebug) {
      this.debugTrace.push({ time, event, details });
    }
  }
  
  /**
   * 評価結果を回路に反映
   */
  private updateCircuitFromState(circuit: Circuit): void {
    for (const gate of circuit.gates) {
      const state = this.circuitState.gateStates.get(gate.id);
      if (!state) continue;
      
      // 出力状態を更新
      if (state.outputs.length === 1) {
        gate.output = state.outputs[0];
      } else if (state.outputs.length > 1) {
        gate.output = state.outputs[0]; // プライマリ出力
        gate.outputs = [...state.outputs]; // 複数出力
      }
      
      // メタデータを更新（CLOCK、D-FF、SR-LATCHなど）
      if (state.metadata) {
        gate.metadata = { ...gate.metadata, ...state.metadata };
      }
      
      // 入力値を更新（特にOUTPUTゲートで重要）
      const inputs = this.collectGateInputs(gate);
      gate.inputs = inputs.map(val => String(val));
      
      // ワイヤーの状態も更新
      const outputWires = this.gateOutputWires.get(gate.id) || [];
      for (const wire of outputWires) {
        // pinIndex -1は単一出力、-2以降は複数出力
        const outputIndex = wire.from.pinIndex === -1 ? 0 : 
                           wire.from.pinIndex < -1 ? -(wire.from.pinIndex + 1) : 0;
        if (outputIndex < state.outputs.length) {
          wire.isActive = state.outputs[outputIndex];
        }
      }
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
  private detectOscillation(currentSnapshot: string): { detected: boolean; pattern?: string[]; period?: number } {
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
          const pattern = this.stateHistory.slice(firstMatchIndex, this.stateHistory.length - 1);
          return { detected: true, pattern, period };
        }
      }
    }
    
    // 2つの状態が交互に現れるパターンも検出（A-B-A-B）
    if (this.stateHistory.length >= 4) {
      const len = this.stateHistory.length;
      const last4 = this.stateHistory.slice(-4);
      if (last4[0] === last4[2] && last4[1] === last4[3] && last4[0] !== last4[1]) {
        return { detected: true, pattern: [last4[0], last4[1]], period: 2 };
      }
    }
    
    return { detected: false };
  }
  
  /**
   * 発振継続のために次のサイクルのイベントをスケジュール
   */
  private scheduleNextOscillationCycle(time: SimTime): void {
    // 発振パターンが存在しない場合、全ゲートを再評価
    if (this.oscillationPattern.length === 0) {
      this.forceGateReevaluation(time);
      return;
    }
    
    // 発振パターンの次の状態を決定
    const patternIndex = this.oscillationCyclesAfterDetection % this.oscillationPattern.length;
    const targetPattern = this.oscillationPattern[patternIndex];
    
    this.addDebugTrace(time, 'FORCING_OSCILLATION_CYCLE', {
      patternIndex,
      targetPattern,
      cyclesAfterDetection: this.oscillationCyclesAfterDetection
    });
    
    // 全ゲートを強制的に再評価してイベントを生成
    this.forceGateReevaluation(time);
  }
  
  /**
   * 全ゲートを強制的に再評価
   */
  private forceGateReevaluation(time: SimTime): void {
    for (const [gateId, gate] of this.gateMap) {
      if (gate.type === 'INPUT') {
        continue; // INPUTは除外（外部から制御）
      }
      
      // CLOCKゲートは時間経過で変化するため再評価が必要
      if (gate.type === 'CLOCK') {
        const state = this.circuitState.gateStates.get(gateId);
        if (!state) continue;
        
        // CLOCKゲートを再評価
        const inputs: boolean[] = [];
        const newOutputs = evaluateGate(gate, inputs, state);
        
        // 出力が変化した場合はイベントをスケジュール
        if (state.outputs[0] !== newOutputs[0]) {
          this.eventQueue.schedule({
            time,
            gateId,
            outputIndex: 0,
            newValue: newOutputs[0],
          });
        }
        continue;
      }
      
      const state = this.circuitState.gateStates.get(gateId);
      if (!state) continue;
      
      const inputs = this.collectGateInputs(gate);
      const expectedOutputs = evaluateGate(gate, inputs, state);
      
      // 現在の出力と異なる場合はイベントをスケジュール
      for (let i = 0; i < expectedOutputs.length; i++) {
        if (state.outputs[i] !== expectedOutputs[i]) {
          this.eventQueue.schedule({
            time,
            gateId,
            outputIndex: i,
            newValue: expectedOutputs[i],
          });
          
          this.addDebugTrace(time, 'FORCED_EVENT_SCHEDULED', {
            gateId,
            outputIndex: i,
            oldValue: state.outputs[i],
            newValue: expectedOutputs[i],
          });
        }
      }
    }
  }
}
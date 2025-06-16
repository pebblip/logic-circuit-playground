/**
 * Copy-on-Write 回路状態管理システム
 * 
 * 特徴:
 * - Immutableな状態管理
 * - Copy-on-Writeによるメモリ効率化
 * - Structural Sharing最適化
 * - ガベージコレクション最適化
 * - 履歴管理・巻き戻し機能
 */

import type {
  CircuitState,
  GateState,
  WireState,
  SimulationTime,
  GateStateMetadata,
  SignalStrength,
} from './types';
import type { Gate, Wire } from '../../../types/circuit';

/**
 * 状態変更操作の種類
 */
export type StateOperation = 
  | 'UPDATE_GATE'
  | 'UPDATE_WIRE'
  | 'BATCH_UPDATE'
  | 'ROLLBACK'
  | 'SNAPSHOT';

/**
 * 状態変更情報
 */
export interface StateMutation {
  readonly operation: StateOperation;
  readonly timestamp: SimulationTime;
  readonly targetId: string;
  readonly oldValue?: unknown;
  readonly newValue?: unknown;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Copy-on-Write状態ビルダー
 */
export class StateBuilder {
  private baseState: CircuitState;
  private mutations = new Map<string, StateMutation>();
  private newGateStates?: Map<string, GateState>;
  private newWireStates?: Map<string, WireState>;
  private dirty = false;

  constructor(baseState: CircuitState) {
    this.baseState = baseState;
  }

  /**
   * ゲート状態を更新
   */
  updateGate(
    gateId: string,
    updates: Partial<GateState>,
    timestamp: SimulationTime
  ): StateBuilder {
    this.ensureGateStatesMap();
    
    const currentState = this.newGateStates!.get(gateId) || 
                        this.baseState.gateStates.get(gateId);
    
    if (!currentState) {
      throw new Error(`Gate ${gateId} not found in state`);
    }

    const newState: GateState = {
      ...currentState,
      ...updates,
      lastEvaluated: timestamp,
      evaluationCount: currentState.evaluationCount + 1,
    };

    this.newGateStates!.set(gateId, newState);
    
    this.mutations.set(gateId, {
      operation: 'UPDATE_GATE',
      timestamp,
      targetId: gateId,
      oldValue: currentState,
      newValue: newState,
    });
    
    this.dirty = true;
    return this;
  }

  /**
   * ワイヤー状態を更新
   */
  updateWire(
    wireId: string,
    updates: Partial<WireState>,
    timestamp: SimulationTime
  ): StateBuilder {
    this.ensureWireStatesMap();
    
    const currentState = this.newWireStates!.get(wireId) || 
                        this.baseState.wireStates.get(wireId);
    
    if (!currentState) {
      throw new Error(`Wire ${wireId} not found in state`);
    }

    const newState: WireState = {
      ...currentState,
      ...updates,
      lastChanged: timestamp,
      transitions: updates.value !== currentState.value ? 
                  currentState.transitions + 1 : 
                  currentState.transitions,
    };

    this.newWireStates!.set(wireId, newState);
    
    this.mutations.set(wireId, {
      operation: 'UPDATE_WIRE',
      timestamp,
      targetId: wireId,
      oldValue: currentState,
      newValue: newState,
    });
    
    this.dirty = true;
    return this;
  }

  /**
   * バッチ更新
   */
  batchUpdate(
    gateUpdates: Map<string, Partial<GateState>>,
    wireUpdates: Map<string, Partial<WireState>>,
    timestamp: SimulationTime
  ): StateBuilder {
    // ゲート更新
    for (const [gateId, updates] of gateUpdates) {
      this.updateGate(gateId, updates, timestamp);
    }
    
    // ワイヤー更新
    for (const [wireId, updates] of wireUpdates) {
      this.updateWire(wireId, updates, timestamp);
    }
    
    return this;
  }

  /**
   * 新しい状態を構築
   */
  build(timestamp: SimulationTime): CircuitState {
    if (!this.dirty) {
      return this.baseState;
    }

    const mutationIds = new Set(this.mutations.keys());

    return {
      version: this.baseState.version + 1,
      timestamp,
      gateStates: this.newGateStates || this.baseState.gateStates,
      wireStates: this.newWireStates || this.baseState.wireStates,
      parent: this.baseState,
      mutations: mutationIds,
    };
  }

  /**
   * 変更をクリア
   */
  reset(): StateBuilder {
    this.newGateStates = undefined;
    this.newWireStates = undefined;
    this.mutations.clear();
    this.dirty = false;
    return this;
  }

  /**
   * 変更があるかチェック
   */
  hasChanges(): boolean {
    return this.dirty;
  }

  /**
   * 変更されたオブジェクトID一覧
   */
  getChangedIds(): readonly string[] {
    return Array.from(this.mutations.keys());
  }

  // ===============================
  // プライベートメソッド
  // ===============================

  /**
   * ゲート状態マップの遅延初期化
   */
  private ensureGateStatesMap(): void {
    if (!this.newGateStates) {
      this.newGateStates = new Map(this.baseState.gateStates);
    }
  }

  /**
   * ワイヤー状態マップの遅延初期化
   */
  private ensureWireStatesMap(): void {
    if (!this.newWireStates) {
      this.newWireStates = new Map(this.baseState.wireStates);
    }
  }
}

/**
 * 状態履歴管理
 */
export class StateHistory {
  private snapshots = new Map<number, CircuitState>();
  private currentVersion = 0;
  private maxHistorySize: number;
  private compressionThreshold: number;

  constructor(
    maxHistorySize: number = 1000,
    compressionThreshold: number = 100
  ) {
    this.maxHistorySize = maxHistorySize;
    this.compressionThreshold = compressionThreshold;
  }

  /**
   * スナップショット保存
   */
  saveSnapshot(state: CircuitState): void {
    this.snapshots.set(state.version, state);
    this.currentVersion = state.version;
    
    // 履歴サイズ制限
    if (this.snapshots.size > this.maxHistorySize) {
      this.compressHistory();
    }
  }

  /**
   * 指定バージョンへの巻き戻し
   */
  rollback(targetVersion: number): CircuitState | undefined {
    const targetState = this.snapshots.get(targetVersion);
    if (targetState) {
      this.currentVersion = targetVersion;
      return targetState;
    }
    
    // 指定バージョンが見つからない場合、最も近いものを探す
    const nearestVersion = this.findNearestVersion(targetVersion);
    if (nearestVersion !== undefined) {
      const nearestState = this.snapshots.get(nearestVersion)!;
      this.currentVersion = nearestVersion;
      return nearestState;
    }
    
    return undefined;
  }

  /**
   * 現在のバージョン取得
   */
  getCurrentVersion(): number {
    return this.currentVersion;
  }

  /**
   * 利用可能なバージョン一覧
   */
  getAvailableVersions(): readonly number[] {
    return Array.from(this.snapshots.keys()).sort((a, b) => a - b);
  }

  /**
   * 履歴統計
   */
  getStats(): {
    snapshotCount: number;
    memoryUsage: number;
    compressionRatio: number;
  } {
    return {
      snapshotCount: this.snapshots.size,
      memoryUsage: this.estimateMemoryUsage(),
      compressionRatio: this.calculateCompressionRatio(),
    };
  }

  // ===============================
  // プライベートメソッド
  // ===============================

  /**
   * 履歴圧縮
   */
  private compressHistory(): void {
    const versions = Array.from(this.snapshots.keys()).sort((a, b) => a - b);
    const toDelete = versions.slice(0, versions.length - this.compressionThreshold);
    
    // 古いスナップショットを削除（一定間隔で保持）
    const keepInterval = Math.floor(toDelete.length / 10);
    
    for (let i = 0; i < toDelete.length; i++) {
      if (i % keepInterval !== 0) {
        this.snapshots.delete(toDelete[i]);
      }
    }
  }

  /**
   * 最も近いバージョンを検索
   */
  private findNearestVersion(targetVersion: number): number | undefined {
    const versions = Array.from(this.snapshots.keys());
    
    let nearest: number | undefined;
    let minDistance = Infinity;
    
    for (const version of versions) {
      const distance = Math.abs(version - targetVersion);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = version;
      }
    }
    
    return nearest;
  }

  /**
   * メモリ使用量推定
   */
  private estimateMemoryUsage(): number {
    let totalSize = 0;
    const stateOverhead = 100; // 基本オーバーヘッド
    const gateStateSize = 50;  // ゲート状態あたりのサイズ
    const wireStateSize = 30;  // ワイヤー状態あたりのサイズ
    
    for (const state of this.snapshots.values()) {
      totalSize += stateOverhead;
      totalSize += state.gateStates.size * gateStateSize;
      totalSize += state.wireStates.size * wireStateSize;
    }
    
    return totalSize;
  }

  /**
   * 圧縮率計算
   */
  private calculateCompressionRatio(): number {
    if (this.snapshots.size === 0) return 1;
    
    // 実際のスナップショット数 / 理論上の最大数
    const theoreticalMax = this.currentVersion + 1;
    return this.snapshots.size / theoreticalMax;
  }
}

/**
 * メインの状態管理クラス
 */
export class EventDrivenStateManager {
  private currentState: CircuitState;
  private history: StateHistory;
  private pendingBuilders = new Map<string, StateBuilder>();

  // ガベージコレクション制御
  private gcThreshold: number;
  private lastGcTime = 0;
  private gcInterval: number;

  // メモリ最適化
  private structuralSharingEnabled: boolean;
  private weakReferences = new WeakMap<CircuitState, StateMetadata>();

  constructor(
    initialState: CircuitState,
    options: StateManagerOptions = {}
  ) {
    this.currentState = initialState;
    this.history = new StateHistory(
      options.maxHistorySize,
      options.compressionThreshold
    );
    
    this.gcThreshold = options.gcThreshold || 100;
    this.gcInterval = options.gcInterval || 10000; // 10秒
    this.structuralSharingEnabled = options.structuralSharing ?? true;
    
    // 初期状態を履歴に保存
    this.history.saveSnapshot(initialState);
  }

  /**
   * 現在の状態を取得
   */
  getCurrentState(): CircuitState {
    return this.currentState;
  }

  /**
   * 新しい状態ビルダーを作成
   */
  createBuilder(builderId?: string): StateBuilder {
    const id = builderId || `builder_${Date.now()}_${Math.random()}`;
    const builder = new StateBuilder(this.currentState);
    this.pendingBuilders.set(id, builder);
    return builder;
  }

  /**
   * 状態をコミット
   */
  commitState(
    builder: StateBuilder,
    timestamp: SimulationTime,
    builderId?: string
  ): CircuitState {
    const newState = builder.build(timestamp);
    
    if (newState !== this.currentState) {
      this.currentState = newState;
      this.history.saveSnapshot(newState);
      
      // 構造共有の最適化
      if (this.structuralSharingEnabled) {
        this.optimizeStructuralSharing(newState);
      }
      
      // ガベージコレクション判定
      this.maybeRunGarbageCollection();
    }

    // ビルダーをクリーンアップ
    if (builderId) {
      this.pendingBuilders.delete(builderId);
    }

    return newState;
  }

  /**
   * 状態の巻き戻し
   */
  rollback(targetVersion: number): boolean {
    const rolledBackState = this.history.rollback(targetVersion);
    
    if (rolledBackState) {
      this.currentState = rolledBackState;
      
      // 未決のビルダーをクリア
      this.pendingBuilders.clear();
      
      return true;
    }
    
    return false;
  }

  /**
   * 回路初期化（ゲートとワイヤーから状態作成）
   */
  initializeFromCircuit(
    gates: readonly Gate[],
    wires: readonly Wire[],
    timestamp: SimulationTime = 0
  ): CircuitState {
    const gateStates = new Map<string, GateState>();
    const wireStates = new Map<string, WireState>();

    // ゲート状態初期化
    for (const gate of gates) {
      gateStates.set(gate.id, {
        gateId: gate.id,
        output: gate.output,
        outputs: gate.outputs,
        inputs: gate.inputs ? gate.inputs.map(input => input === '1') : [],
        lastEvaluated: timestamp,
        evaluationCount: 0,
        metadata: this.extractGateMetadata(gate),
      });
    }

    // ワイヤー状態初期化
    for (const wire of wires) {
      wireStates.set(wire.id, {
        wireId: wire.id,
        value: wire.isActive,
        previousValue: false,
        lastChanged: timestamp,
        transitions: 0,
        strength: SignalStrength.STRONG,
      });
    }

    const initialState: CircuitState = {
      version: 0,
      timestamp,
      gateStates,
      wireStates,
      mutations: new Set(),
    };

    this.currentState = initialState;
    this.history.saveSnapshot(initialState);

    return initialState;
  }

  /**
   * 状態の完全性検証
   */
  validateState(state: CircuitState = this.currentState): StateValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // 基本整合性チェック
    if (state.gateStates.size === 0) {
      warnings.push('No gates in state');
    }
    
    if (state.wireStates.size === 0) {
      warnings.push('No wires in state');
    }
    
    // バージョン整合性
    if (state.parent && state.version <= state.parent.version) {
      errors.push('Invalid version progression');
    }
    
    // 変更セット整合性
    for (const mutationId of state.mutations) {
      const hasGate = state.gateStates.has(mutationId);
      const hasWire = state.wireStates.has(mutationId);
      
      if (!hasGate && !hasWire) {
        errors.push(`Mutation reference ${mutationId} not found in state`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      checkedAt: Date.now(),
    };
  }

  /**
   * 統計情報取得
   */
  getStats(): StateManagerStats {
    return {
      currentVersion: this.currentState.version,
      historyStats: this.history.getStats(),
      pendingBuilders: this.pendingBuilders.size,
      memoryUsage: this.estimateMemoryUsage(),
      lastGcTime: this.lastGcTime,
    };
  }

  // ===============================
  // プライベートメソッド
  // ===============================

  /**
   * ゲートメタデータ抽出
   */
  private extractGateMetadata(gate: Gate): GateStateMetadata | undefined {
    if (!gate.metadata) return undefined;

    const metadata: GateStateMetadata = {};

    // クロック状態
    if (gate.type === 'CLOCK' && gate.metadata) {
      metadata.clockState = {
        lastEdge: 'RISING', // デフォルト
        edgeTime: 0,
        frequency: gate.metadata.frequency as number,
      };
    }

    // シーケンシャル状態
    if (gate.type === 'D-FF' || gate.type === 'SR-LATCH') {
      metadata.sequentialState = {
        qOutput: gate.metadata.qOutput as boolean || false,
        qBarOutput: gate.metadata.qBarOutput as boolean || true,
      };
    }

    return Object.keys(metadata).length > 0 ? metadata : undefined;
  }

  /**
   * 構造共有最適化
   */
  private optimizeStructuralSharing(state: CircuitState): void {
    if (!state.parent) return;

    // 変更されていないマップを親から共有
    if (state.mutations.size === 0) return;

    const hasGateChanges = Array.from(state.mutations).some(id => 
      state.gateStates.has(id)
    );
    const hasWireChanges = Array.from(state.mutations).some(id => 
      state.wireStates.has(id)
    );

    // 変更のないマップは親と共有
    if (!hasGateChanges && state.gateStates !== state.parent.gateStates) {
      (state as any).gateStates = state.parent.gateStates;
    }
    
    if (!hasWireChanges && state.wireStates !== state.parent.wireStates) {
      (state as any).wireStates = state.parent.wireStates;
    }
  }

  /**
   * ガベージコレクション判定・実行
   */
  private maybeRunGarbageCollection(): void {
    const now = Date.now();
    
    if (
      (this.currentState.version % this.gcThreshold === 0) ||
      (now - this.lastGcTime > this.gcInterval)
    ) {
      this.runGarbageCollection();
      this.lastGcTime = now;
    }
  }

  /**
   * ガベージコレクション実行
   */
  private runGarbageCollection(): void {
    // 未使用のビルダーをクリーンアップ
    for (const [id, builder] of this.pendingBuilders) {
      if (!builder.hasChanges()) {
        this.pendingBuilders.delete(id);
      }
    }

    // WeakMap の自動クリーンアップは実行時に任せる
    
    // 明示的にGCヒント（ブラウザ環境では効果なし）
    if (typeof globalThis.gc === 'function') {
      globalThis.gc();
    }
  }

  /**
   * メモリ使用量推定
   */
  private estimateMemoryUsage(): number {
    let totalSize = 0;
    
    // 現在状態
    totalSize += this.estimateStateSize(this.currentState);
    
    // 履歴
    totalSize += this.history.getStats().memoryUsage;
    
    // ビルダー
    totalSize += this.pendingBuilders.size * 1000; // 概算
    
    return totalSize;
  }

  /**
   * 状態サイズ推定
   */
  private estimateStateSize(state: CircuitState): number {
    const baseSize = 100;
    const gateSize = state.gateStates.size * 50;
    const wireSize = state.wireStates.size * 30;
    
    return baseSize + gateSize + wireSize;
  }
}

// ===============================
// 型定義
// ===============================

/**
 * 状態管理オプション
 */
export interface StateManagerOptions {
  readonly maxHistorySize?: number;
  readonly compressionThreshold?: number;
  readonly gcThreshold?: number;
  readonly gcInterval?: number;
  readonly structuralSharing?: boolean;
}

/**
 * 状態メタデータ
 */
interface StateMetadata {
  readonly createdAt: number;
  readonly accessCount: number;
  readonly lastAccessed: number;
}

/**
 * 状態検証結果
 */
export interface StateValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly checkedAt: number;
}

/**
 * 状態管理統計
 */
export interface StateManagerStats {
  readonly currentVersion: number;
  readonly historyStats: {
    snapshotCount: number;
    memoryUsage: number;
    compressionRatio: number;
  };
  readonly pendingBuilders: number;
  readonly memoryUsage: number;
  readonly lastGcTime: number;
}
/**
 * Web Workers並列シミュレーションシステム
 * 
 * 並列化戦略:
 * - 論理レベル並列化（独立ゲートの同時評価）
 * - タスクベース並列化（イベント処理分散）
 * - データ並列化（バッチ処理）
 * 
 * 特徴:
 * - Lock-freeデータ構造
 * - 動的負荷分散
 * - エラー回復機能
 * - メインスレッド応答性保持
 */

import type {
  ParallelTask,
  ParallelTaskPayload,
  ParallelResult,
  SimulationEvent,
  CircuitState,
  EventDrivenConfig,
} from './types';

/**
 * ワーカープール設定
 */
export interface WorkerPoolConfig {
  readonly maxWorkers: number;
  readonly minWorkers: number;
  readonly taskQueueSize: number;
  readonly workerTimeout: number; // ms
  readonly loadBalancing: 'ROUND_ROBIN' | 'LEAST_LOADED' | 'ADAPTIVE';
  readonly enableFailover: boolean;
}

/**
 * ワーカー統計
 */
export interface WorkerStats {
  readonly workerId: number;
  readonly tasksCompleted: number;
  readonly tasksFailed: number;
  readonly averageTaskTime: number;
  readonly currentLoad: number;
  readonly isHealthy: boolean;
  readonly lastHeartbeat: number;
}

/**
 * 並列タスク結果
 */
export interface ParallelTaskResult {
  readonly taskId: string;
  readonly success: boolean;
  readonly result?: unknown;
  readonly error?: string;
  readonly executionTime: number;
  readonly workerId: number;
  readonly memory?: {
    readonly before: number;
    readonly after: number;
  };
}

/**
 * ワーカープール管理
 */
export class SimulationWorkerPool {
  private config: WorkerPoolConfig;
  private workers: SimulationWorker[] = [];
  private taskQueue: ParallelTask[] = [];
  private pendingTasks = new Map<string, TaskExecution>();
  private roundRobinIndex = 0;
  
  // 統計情報
  private totalTasksScheduled = 0;
  private totalTasksCompleted = 0;
  private totalExecutionTime = 0;

  constructor(config: WorkerPoolConfig) {
    this.config = config;
    this.initializeWorkers();
  }

  /**
   * タスクを並列実行
   */
  async executeTask(task: ParallelTask): Promise<ParallelTaskResult> {
    this.totalTasksScheduled++;
    
    return new Promise<ParallelTaskResult>((resolve, reject) => {
      const execution: TaskExecution = {
        task,
        resolve,
        reject,
        scheduledAt: Date.now(),
        timeout: setTimeout(() => {
          this.handleTaskTimeout(task.id);
        }, this.config.workerTimeout),
      };

      this.pendingTasks.set(task.id, execution);
      this.scheduleTask(task);
    });
  }

  /**
   * 複数タスクのバッチ実行
   */
  async executeBatch(tasks: readonly ParallelTask[]): Promise<ParallelTaskResult[]> {
    const promises = tasks.map(task => this.executeTask(task));
    return Promise.all(promises);
  }

  /**
   * ワーカー統計取得
   */
  getWorkerStats(): readonly WorkerStats[] {
    return this.workers.map(worker => ({
      workerId: worker.id,
      tasksCompleted: worker.tasksCompleted,
      tasksFailed: worker.tasksFailed,
      averageTaskTime: worker.getAverageTaskTime(),
      currentLoad: worker.getCurrentLoad(),
      isHealthy: worker.isHealthy(),
      lastHeartbeat: worker.lastHeartbeat,
    }));
  }

  /**
   * プール統計取得
   */
  getPoolStats(): {
    totalWorkers: number;
    activeWorkers: number;
    queuedTasks: number;
    pendingTasks: number;
    throughput: number;
    efficiency: number;
  } {
    const activeWorkers = this.workers.filter(w => w.isHealthy()).length;
    const efficiency = this.totalTasksCompleted / this.totalTasksScheduled;
    const throughput = this.totalTasksCompleted / (this.totalExecutionTime / 1000);

    return {
      totalWorkers: this.workers.length,
      activeWorkers,
      queuedTasks: this.taskQueue.length,
      pendingTasks: this.pendingTasks.size,
      throughput,
      efficiency,
    };
  }

  /**
   * リソースクリーンアップ
   */
  dispose(): void {
    // 未完了タスクをキャンセル
    for (const [taskId, execution] of this.pendingTasks) {
      clearTimeout(execution.timeout);
      execution.reject(new Error('Worker pool disposed'));
    }
    this.pendingTasks.clear();

    // 全ワーカー終了
    for (const worker of this.workers) {
      worker.terminate();
    }
    this.workers = [];
  }

  // ===============================
  // プライベートメソッド
  // ===============================

  /**
   * ワーカー初期化
   */
  private initializeWorkers(): void {
    for (let i = 0; i < this.config.minWorkers; i++) {
      this.createWorker(i);
    }
  }

  /**
   * ワーカー作成
   */
  private createWorker(workerId: number): void {
    const worker = new SimulationWorker(workerId, {
      onResult: (result) => this.handleWorkerResult(result),
      onError: (error) => this.handleWorkerError(workerId, error),
      onHeartbeat: () => this.updateWorkerHeartbeat(workerId),
    });
    
    this.workers.push(worker);
  }

  /**
   * タスクスケジューリング
   */
  private scheduleTask(task: ParallelTask): void {
    const worker = this.selectWorker();
    
    if (worker && worker.isAvailable()) {
      worker.executeTask(task);
    } else {
      // 利用可能なワーカーがない場合はキューに追加
      this.taskQueue.push(task);
      
      // 必要に応じて新しいワーカーを作成
      if (this.workers.length < this.config.maxWorkers) {
        this.createWorker(this.workers.length);
      }
    }
  }

  /**
   * ワーカー選択
   */
  private selectWorker(): SimulationWorker | undefined {
    const healthyWorkers = this.workers.filter(w => w.isHealthy() && w.isAvailable());
    
    if (healthyWorkers.length === 0) {
      return undefined;
    }

    switch (this.config.loadBalancing) {
      case 'ROUND_ROBIN':
        return this.selectRoundRobin(healthyWorkers);
      
      case 'LEAST_LOADED':
        return this.selectLeastLoaded(healthyWorkers);
      
      case 'ADAPTIVE':
        return this.selectAdaptive(healthyWorkers);
      
      default:
        return healthyWorkers[0];
    }
  }

  /**
   * ラウンドロビン選択
   */
  private selectRoundRobin(workers: SimulationWorker[]): SimulationWorker {
    const worker = workers[this.roundRobinIndex % workers.length];
    this.roundRobinIndex++;
    return worker;
  }

  /**
   * 最小負荷選択
   */
  private selectLeastLoaded(workers: SimulationWorker[]): SimulationWorker {
    return workers.reduce((min, current) => 
      current.getCurrentLoad() < min.getCurrentLoad() ? current : min
    );
  }

  /**
   * 適応的選択
   */
  private selectAdaptive(workers: SimulationWorker[]): SimulationWorker {
    // パフォーマンス履歴に基づく選択
    return workers.reduce((best, current) => {
      const bestScore = this.calculateWorkerScore(best);
      const currentScore = this.calculateWorkerScore(current);
      return currentScore > bestScore ? current : best;
    });
  }

  /**
   * ワーカースコア計算
   */
  private calculateWorkerScore(worker: SimulationWorker): number {
    const loadWeight = 0.4;
    const speedWeight = 0.4;
    const reliabilityWeight = 0.2;

    const loadScore = 1 - worker.getCurrentLoad();
    const speedScore = 1 / (worker.getAverageTaskTime() + 1);
    const reliabilityScore = worker.tasksCompleted / (worker.tasksCompleted + worker.tasksFailed + 1);

    return loadWeight * loadScore + speedWeight * speedScore + reliabilityWeight * reliabilityScore;
  }

  /**
   * ワーカー結果処理
   */
  private handleWorkerResult(result: ParallelTaskResult): void {
    const execution = this.pendingTasks.get(result.taskId);
    
    if (execution) {
      clearTimeout(execution.timeout);
      this.pendingTasks.delete(result.taskId);
      
      this.totalTasksCompleted++;
      this.totalExecutionTime += result.executionTime;
      
      execution.resolve(result);
    }

    // キューの次のタスクを処理
    this.processNextQueuedTask();
  }

  /**
   * ワーカーエラー処理
   */
  private handleWorkerError(workerId: number, error: string): void {
    const worker = this.workers.find(w => w.id === workerId);
    
    if (worker) {
      worker.tasksFailed++;
      
      if (this.config.enableFailover) {
        // 失敗したタスクを他のワーカーで再実行
        this.retryFailedTasks(workerId);
      }
    }
  }

  /**
   * ワーカーハートビート更新
   */
  private updateWorkerHeartbeat(workerId: number): void {
    const worker = this.workers.find(w => w.id === workerId);
    if (worker) {
      worker.lastHeartbeat = Date.now();
    }
  }

  /**
   * タスクタイムアウト処理
   */
  private handleTaskTimeout(taskId: string): void {
    const execution = this.pendingTasks.get(taskId);
    
    if (execution) {
      this.pendingTasks.delete(taskId);
      execution.reject(new Error(`Task ${taskId} timed out`));
    }
  }

  /**
   * 失敗タスクの再試行
   */
  private retryFailedTasks(failedWorkerId: number): void {
    // 実装省略：失敗したワーカーのタスクを他のワーカーで再実行
  }

  /**
   * キューの次のタスク処理
   */
  private processNextQueuedTask(): void {
    if (this.taskQueue.length > 0) {
      const nextTask = this.taskQueue.shift()!;
      this.scheduleTask(nextTask);
    }
  }
}

/**
 * シミュレーションワーカー
 */
class SimulationWorker {
  public readonly id: number;
  public tasksCompleted = 0;
  public tasksFailed = 0;
  public lastHeartbeat = Date.now();

  private worker?: Worker;
  private callbacks: WorkerCallbacks;
  private currentTask?: ParallelTask;
  private taskHistory: number[] = [];
  private isTerminated = false;

  constructor(id: number, callbacks: WorkerCallbacks) {
    this.id = id;
    this.callbacks = callbacks;
    this.initializeWorker();
  }

  /**
   * タスク実行
   */
  executeTask(task: ParallelTask): void {
    if (!this.worker || this.currentTask) {
      throw new Error('Worker not available');
    }

    this.currentTask = task;
    
    // ワーカーにタスクを送信
    this.worker.postMessage({
      type: 'EXECUTE_TASK',
      task,
    });
  }

  /**
   * 利用可能性チェック
   */
  isAvailable(): boolean {
    return !this.isTerminated && !this.currentTask && this.isHealthy();
  }

  /**
   * 健全性チェック
   */
  isHealthy(): boolean {
    const heartbeatTimeout = 30000; // 30秒
    return Date.now() - this.lastHeartbeat < heartbeatTimeout;
  }

  /**
   * 現在の負荷取得
   */
  getCurrentLoad(): number {
    // 簡略化：タスク実行中は1.0、そうでなければ0.0
    return this.currentTask ? 1.0 : 0.0;
  }

  /**
   * 平均タスク時間取得
   */
  getAverageTaskTime(): number {
    if (this.taskHistory.length === 0) return 0;
    
    const sum = this.taskHistory.reduce((a, b) => a + b, 0);
    return sum / this.taskHistory.length;
  }

  /**
   * ワーカー終了
   */
  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = undefined;
    }
    this.isTerminated = true;
  }

  // ===============================
  // プライベートメソッド
  // ===============================

  /**
   * ワーカー初期化
   */
  private initializeWorker(): void {
    try {
      // 実際の環境では適切なワーカースクリプトのパスを指定
      const workerCode = this.generateWorkerCode();
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      
      this.worker = new Worker(workerUrl);
      this.setupWorkerHandlers();
      
      URL.revokeObjectURL(workerUrl);
    } catch (error) {
      console.error('Failed to create worker:', error);
    }
  }

  /**
   * ワーカーイベントハンドラー設定
   */
  private setupWorkerHandlers(): void {
    if (!this.worker) return;

    this.worker.onmessage = (event) => {
      const { type, data } = event.data;
      
      switch (type) {
        case 'TASK_RESULT':
          this.handleTaskResult(data);
          break;
        
        case 'TASK_ERROR':
          this.handleTaskError(data);
          break;
        
        case 'HEARTBEAT':
          this.callbacks.onHeartbeat();
          break;
        
        default:
          console.warn('Unknown message type:', type);
      }
    };

    this.worker.onerror = (error) => {
      this.callbacks.onError(error.message);
    };
  }

  /**
   * タスク結果処理
   */
  private handleTaskResult(data: ParallelTaskResult): void {
    if (this.currentTask && this.currentTask.id === data.taskId) {
      this.tasksCompleted++;
      this.taskHistory.push(data.executionTime);
      
      // 履歴サイズ制限
      if (this.taskHistory.length > 100) {
        this.taskHistory.shift();
      }
      
      this.currentTask = undefined;
      this.callbacks.onResult(data);
    }
  }

  /**
   * タスクエラー処理
   */
  private handleTaskError(error: string): void {
    if (this.currentTask) {
      this.tasksFailed++;
      this.currentTask = undefined;
      this.callbacks.onError(error);
    }
  }

  /**
   * ワーカーコード生成
   */
  private generateWorkerCode(): string {
    return `
      // シミュレーションワーカーコード
      self.onmessage = function(event) {
        const { type, task } = event.data;
        
        if (type === 'EXECUTE_TASK') {
          executeSimulationTask(task);
        }
      };

      function executeSimulationTask(task) {
        const startTime = performance.now();
        
        try {
          let result;
          
          switch (task.type) {
            case 'GATE_EVALUATION':
              result = evaluateGateBatch(task.payload);
              break;
            
            case 'EVENT_PROCESSING':
              result = processEventBatch(task.payload);
              break;
            
            case 'STATE_UPDATE':
              result = updateStateBatch(task.payload);
              break;
            
            default:
              throw new Error('Unknown task type: ' + task.type);
          }
          
          const endTime = performance.now();
          
          self.postMessage({
            type: 'TASK_RESULT',
            data: {
              taskId: task.id,
              success: true,
              result: result,
              executionTime: endTime - startTime,
              workerId: ${this.id},
            }
          });
          
        } catch (error) {
          self.postMessage({
            type: 'TASK_ERROR',
            data: error.message
          });
        }
      }

      function evaluateGateBatch(payload) {
        // ゲート評価のバッチ処理
        const results = [];
        for (const gateId of payload.gateIds || []) {
          // 簡略化されたゲート評価
          results.push({
            gateId: gateId,
            output: Math.random() > 0.5 // ランダム結果（実際は論理評価）
          });
        }
        return results;
      }

      function processEventBatch(payload) {
        // イベント処理のバッチ処理
        return {
          processedEvents: payload.events?.length || 0,
          timestamp: Date.now()
        };
      }

      function updateStateBatch(payload) {
        // 状態更新のバッチ処理
        return {
          updatedState: payload.state,
          changeCount: 1
        };
      }

      // 定期的なハートビート送信
      setInterval(() => {
        self.postMessage({
          type: 'HEARTBEAT',
          data: { timestamp: Date.now() }
        });
      }, 5000);
    `;
  }
}

// ===============================
// 型定義
// ===============================

/**
 * タスク実行情報
 */
interface TaskExecution {
  readonly task: ParallelTask;
  readonly resolve: (result: ParallelTaskResult) => void;
  readonly reject: (error: Error) => void;
  readonly scheduledAt: number;
  readonly timeout: NodeJS.Timeout;
}

/**
 * ワーカーコールバック
 */
interface WorkerCallbacks {
  readonly onResult: (result: ParallelTaskResult) => void;
  readonly onError: (error: string) => void;
  readonly onHeartbeat: () => void;
}

// ===============================
// ファクトリー関数
// ===============================

/**
 * 教育用ワーカープール作成
 */
export function createEducationalWorkerPool(): SimulationWorkerPool {
  const config: WorkerPoolConfig = {
    maxWorkers: 2,
    minWorkers: 1,
    taskQueueSize: 50,
    workerTimeout: 5000,
    loadBalancing: 'ROUND_ROBIN',
    enableFailover: false,
  };

  return new SimulationWorkerPool(config);
}

/**
 * 高性能ワーカープール作成
 */
export function createHighPerformanceWorkerPool(): SimulationWorkerPool {
  const config: WorkerPoolConfig = {
    maxWorkers: Math.max(4, navigator.hardwareConcurrency || 4),
    minWorkers: 2,
    taskQueueSize: 1000,
    workerTimeout: 30000,
    loadBalancing: 'ADAPTIVE',
    enableFailover: true,
  };

  return new SimulationWorkerPool(config);
}
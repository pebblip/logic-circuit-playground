/**
 * 高性能優先度付きイベントキュー実装
 * 
 * アルゴリズム: Binary Heap (最小ヒープ)
 * 性能特性:
 * - 挿入: O(log n)
 * - 削除: O(log n)
 * - 先頭確認: O(1)
 * - メモリ使用量: O(n)
 * 
 * 最適化:
 * - 配列ベース実装（キャッシュ効率良好）
 * - インライン比較関数
 * - バッチ操作サポート
 */

import type {
  SimulationEvent,
  SimulationTime,
  DeltaCycle,
  EventPriority,
  EventQueue,
  EventQueueStats,
} from './types';

/**
 * イベント比較キー
 * 時刻 → デルタサイクル → 優先度の順でソート
 */
interface EventKey {
  readonly time: SimulationTime;
  readonly deltaCycle: DeltaCycle;
  readonly priority: EventPriority;
  readonly insertionOrder: number; // 安定ソート用
}

/**
 * Binary Heap実装の優先度付きイベントキュー
 */
export class BinaryHeapEventQueue implements EventQueue {
  private heap: SimulationEvent[] = [];
  private keyCache = new Map<string, EventKey>();
  private insertionCounter = 0;
  
  // 統計情報
  private stats: EventQueueStats = {
    totalScheduled: 0,
    totalProcessed: 0,
    currentSize: 0,
    peakSize: 0,
    averageLatency: 0,
    memoryUsage: 0,
  };
  
  private latencySum = 0;
  private latencyCount = 0;

  /**
   * イベントをスケジュール
   */
  schedule(event: SimulationEvent): void {
    const key: EventKey = {
      time: event.time,
      deltaCycle: event.deltaCycle,
      priority: event.priority,
      insertionOrder: this.insertionCounter++,
    };
    
    this.keyCache.set(event.id, key);
    this.heap.push(event);
    this.bubbleUp(this.heap.length - 1);
    
    // 統計更新
    this.stats.totalScheduled++;
    this.stats.currentSize = this.heap.length;
    this.stats.peakSize = Math.max(this.stats.peakSize, this.stats.currentSize);
    this.updateMemoryUsage();
  }

  /**
   * 次のイベントを取得（削除）
   */
  next(): SimulationEvent | undefined {
    if (this.heap.length === 0) {
      return undefined;
    }

    const event = this.heap[0];
    const lastEvent = this.heap.pop()!;
    
    if (this.heap.length > 0) {
      this.heap[0] = lastEvent;
      this.bubbleDown(0);
    }

    // キーキャッシュから削除
    this.keyCache.delete(event.id);
    
    // 統計更新
    this.stats.totalProcessed++;
    this.stats.currentSize = this.heap.length;
    this.updateLatency(event);
    this.updateMemoryUsage();

    return event;
  }

  /**
   * キューの先頭を確認（削除しない）
   */
  peek(): SimulationEvent | undefined {
    return this.heap.length > 0 ? this.heap[0] : undefined;
  }

  /**
   * キューサイズ
   */
  size(): number {
    return this.heap.length;
  }

  /**
   * キューが空かどうか
   */
  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  /**
   * 指定時刻より前のイベントを削除
   */
  clear(beforeTime?: SimulationTime): void {
    if (beforeTime === undefined) {
      this.heap.length = 0;
      this.keyCache.clear();
      this.stats.currentSize = 0;
      this.updateMemoryUsage();
      return;
    }

    // 時刻フィルタリング（非効率だが、まれな操作なので許容）
    const filteredEvents = this.heap.filter(event => event.time >= beforeTime);
    this.heap.length = 0;
    this.keyCache.clear();
    
    // 再構築
    for (const event of filteredEvents) {
      this.schedule(event);
    }
  }

  /**
   * 統計情報取得
   */
  getStats(): EventQueueStats {
    return { ...this.stats };
  }

  /**
   * バッチ操作: 複数イベントを効率的にスケジュール
   */
  scheduleBatch(events: readonly SimulationEvent[]): void {
    // 既存ヒープに追加
    for (const event of events) {
      const key: EventKey = {
        time: event.time,
        deltaCycle: event.deltaCycle,
        priority: event.priority,
        insertionOrder: this.insertionCounter++,
      };
      this.keyCache.set(event.id, key);
      this.heap.push(event);
    }

    // ヒープ性質を一度に復元（ボトムアップ構築）
    for (let i = Math.floor(this.heap.length / 2) - 1; i >= 0; i--) {
      this.bubbleDown(i);
    }

    // 統計更新
    this.stats.totalScheduled += events.length;
    this.stats.currentSize = this.heap.length;
    this.stats.peakSize = Math.max(this.stats.peakSize, this.stats.currentSize);
    this.updateMemoryUsage();
  }

  /**
   * デバッグ用: ヒープ不変条件の検証
   */
  validateHeap(): boolean {
    for (let i = 0; i < Math.floor(this.heap.length / 2); i++) {
      const leftChild = 2 * i + 1;
      const rightChild = 2 * i + 2;

      if (leftChild < this.heap.length) {
        if (this.compare(this.heap[i], this.heap[leftChild]) > 0) {
          return false;
        }
      }

      if (rightChild < this.heap.length) {
        if (this.compare(this.heap[i], this.heap[rightChild]) > 0) {
          return false;
        }
      }
    }
    return true;
  }

  // ===============================
  // プライベートメソッド
  // ===============================

  /**
   * 要素を上位に移動（ヒープ修復）
   */
  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      
      if (this.compare(this.heap[index], this.heap[parentIndex]) >= 0) {
        break;
      }

      this.swap(index, parentIndex);
      index = parentIndex;
    }
  }

  /**
   * 要素を下位に移動（ヒープ修復）
   */
  private bubbleDown(index: number): void {
    while (true) {
      let smallest = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (
        leftChild < this.heap.length &&
        this.compare(this.heap[leftChild], this.heap[smallest]) < 0
      ) {
        smallest = leftChild;
      }

      if (
        rightChild < this.heap.length &&
        this.compare(this.heap[rightChild], this.heap[smallest]) < 0
      ) {
        smallest = rightChild;
      }

      if (smallest === index) {
        break;
      }

      this.swap(index, smallest);
      index = smallest;
    }
  }

  /**
   * イベント比較
   * 優先順序: 時刻 < デルタサイクル < 優先度 < 挿入順序
   */
  private compare(a: SimulationEvent, b: SimulationEvent): number {
    const keyA = this.keyCache.get(a.id);
    const keyB = this.keyCache.get(b.id);

    if (!keyA || !keyB) {
      throw new Error('Event key not found in cache');
    }

    // 時刻比較
    if (keyA.time !== keyB.time) {
      return keyA.time - keyB.time;
    }

    // デルタサイクル比較
    if (keyA.deltaCycle !== keyB.deltaCycle) {
      return keyA.deltaCycle - keyB.deltaCycle;
    }

    // 優先度比較（低い値が高優先度）
    if (keyA.priority !== keyB.priority) {
      return keyA.priority - keyB.priority;
    }

    // 挿入順序比較（FIFO）
    return keyA.insertionOrder - keyB.insertionOrder;
  }

  /**
   * 要素のスワップ
   */
  private swap(i: number, j: number): void {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }

  /**
   * レイテンシ統計更新
   */
  private updateLatency(event: SimulationEvent): void {
    if (event.metadata?.scheduledAt) {
      const latency = Date.now() - event.metadata.scheduledAt;
      this.latencySum += latency;
      this.latencyCount++;
      this.stats.averageLatency = this.latencySum / this.latencyCount;
    }
  }

  /**
   * メモリ使用量更新
   */
  private updateMemoryUsage(): void {
    // 概算メモリ使用量計算
    const eventSize = 200; // 1イベントあたりの概算サイズ(bytes)
    const keySize = 40; // 1キーあたりの概算サイズ(bytes)
    
    this.stats.memoryUsage = 
      this.heap.length * eventSize + 
      this.keyCache.size * keySize +
      this.heap.length * 8; // 配列参照サイズ
  }
}

// ===============================
// Calendar Queue実装（将来拡張用）
// ===============================

/**
 * Calendar Queue実装
 * 特定の時間範囲で高性能（O(1) amortized）
 * スパースな時間軸に最適
 */
export class CalendarQueue implements EventQueue {
  private buckets: Map<number, SimulationEvent[]> = new Map();
  private bucketWidth: SimulationTime;
  private bucketCount: number;
  private currentBucket = 0;
  private lastTime: SimulationTime = 0;

  // 統計情報
  private stats: EventQueueStats = {
    totalScheduled: 0,
    totalProcessed: 0,
    currentSize: 0,
    peakSize: 0,
    averageLatency: 0,
    memoryUsage: 0,
  };

  constructor(
    bucketCount = 1024,
    timeRange: SimulationTime = 1000000 // 1ms in ps
  ) {
    this.bucketCount = bucketCount;
    this.bucketWidth = timeRange / bucketCount;
  }

  schedule(event: SimulationEvent): void {
    const bucketIndex = Math.floor(event.time / this.bucketWidth) % this.bucketCount;
    
    if (!this.buckets.has(bucketIndex)) {
      this.buckets.set(bucketIndex, []);
    }
    
    const bucket = this.buckets.get(bucketIndex)!;
    
    // バケット内でソートして挿入
    this.insertSorted(bucket, event);
    
    this.stats.totalScheduled++;
    this.stats.currentSize++;
    this.stats.peakSize = Math.max(this.stats.peakSize, this.stats.currentSize);
  }

  next(): SimulationEvent | undefined {
    let searchCount = 0;
    
    while (searchCount < this.bucketCount) {
      const bucket = this.buckets.get(this.currentBucket);
      
      if (bucket && bucket.length > 0) {
        const event = bucket.shift()!;
        
        if (event.time >= this.lastTime) {
          this.lastTime = event.time;
          this.stats.totalProcessed++;
          this.stats.currentSize--;
          return event;
        }
        
        // 時間が逆行している場合は再配置
        this.schedule(event);
        continue;
      }
      
      this.currentBucket = (this.currentBucket + 1) % this.bucketCount;
      searchCount++;
    }
    
    return undefined;
  }

  peek(): SimulationEvent | undefined {
    let searchCount = 0;
    let tempBucket = this.currentBucket;
    
    while (searchCount < this.bucketCount) {
      const bucket = this.buckets.get(tempBucket);
      
      if (bucket && bucket.length > 0) {
        return bucket[0];
      }
      
      tempBucket = (tempBucket + 1) % this.bucketCount;
      searchCount++;
    }
    
    return undefined;
  }

  size(): number {
    return this.stats.currentSize;
  }

  isEmpty(): boolean {
    return this.stats.currentSize === 0;
  }

  clear(beforeTime?: SimulationTime): void {
    if (beforeTime === undefined) {
      this.buckets.clear();
      this.stats.currentSize = 0;
      return;
    }

    for (const [bucketIndex, bucket] of this.buckets) {
      const filteredEvents = bucket.filter(event => event.time >= beforeTime);
      if (filteredEvents.length > 0) {
        this.buckets.set(bucketIndex, filteredEvents);
      } else {
        this.buckets.delete(bucketIndex);
      }
    }
    
    // サイズ再計算
    this.stats.currentSize = 0;
    for (const bucket of this.buckets.values()) {
      this.stats.currentSize += bucket.length;
    }
  }

  getStats(): EventQueueStats {
    return { ...this.stats };
  }

  /**
   * バケット内ソート挿入
   */
  private insertSorted(bucket: SimulationEvent[], event: SimulationEvent): void {
    let left = 0;
    let right = bucket.length;
    
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (this.compareEvents(bucket[mid], event) <= 0) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    
    bucket.splice(left, 0, event);
  }

  /**
   * イベント比較
   */
  private compareEvents(a: SimulationEvent, b: SimulationEvent): number {
    if (a.time !== b.time) return a.time - b.time;
    if (a.deltaCycle !== b.deltaCycle) return a.deltaCycle - b.deltaCycle;
    return a.priority - b.priority;
  }
}

// ===============================
// ファクトリー関数
// ===============================

/**
 * 用途に応じた最適なイベントキューを作成
 */
export function createEventQueue(
  expectedSize: number = 1000,
  timeRange?: SimulationTime
): EventQueue {
  // サイズに基づいてアルゴリズム選択
  if (expectedSize < 10000) {
    // 小〜中規模回路: Binary Heap（安定した性能）
    return new BinaryHeapEventQueue();
  } else if (timeRange && timeRange > 1000000) {
    // 大規模回路で時間軸がスパース: Calendar Queue
    return new CalendarQueue(Math.min(2048, expectedSize / 4), timeRange);
  } else {
    // デフォルト: Binary Heap
    return new BinaryHeapEventQueue();
  }
}
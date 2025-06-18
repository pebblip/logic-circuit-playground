/**
 * シンプルなイベントキュー実装
 * 優先度付きキューで時刻順にイベントを管理
 */

import type { GateEvent, SimTime } from './types';

export class EventQueue {
  private events: GateEvent[] = [];
  private processedCount = 0;

  /**
   * イベントを追加（時刻順にソート）
   */
  schedule(event: GateEvent): void {
    // 二分探索で挿入位置を見つける
    let left = 0;
    let right = this.events.length;
    
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (this.events[mid].time <= event.time) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    
    this.events.splice(left, 0, event);
  }

  /**
   * 指定時刻のイベントを全て取得
   */
  popEventsAt(time: SimTime): GateEvent[] {
    const events: GateEvent[] = [];
    
    while (this.events.length > 0 && this.events[0].time === time) {
      const event = this.events.shift()!;
      events.push(event);
      this.processedCount++;
    }
    
    return events;
  }

  /**
   * 次のイベント時刻を取得
   */
  getNextTime(): SimTime | null {
    return this.events.length > 0 ? this.events[0].time : null;
  }

  /**
   * キューが空かどうか
   */
  isEmpty(): boolean {
    return this.events.length === 0;
  }

  /**
   * キューをクリア
   */
  clear(): void {
    this.events = [];
    this.processedCount = 0;
  }

  /**
   * キューのサイズを取得
   */
  size(): number {
    return this.events.length;
  }

  /**
   * 統計情報
   */
  getStats() {
    return {
      pending: this.events.length,
      processed: this.processedCount,
    };
  }

  /**
   * デバッグ用: 現在のキュー内容
   */
  debug(): string {
    return this.events
      .slice(0, 10)
      .map(e => `t=${e.time}: ${e.gateId}[${e.outputIndex}]=${e.newValue}`)
      .join('\n');
  }
}
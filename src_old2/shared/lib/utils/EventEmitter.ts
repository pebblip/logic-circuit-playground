type EventCallback<T = any> = (data: T) => void;

/**
 * シンプルなEventEmitter実装
 * ViewModelパターンでのイベント通知に使用
 */
export class EventEmitter<Events extends Record<string, any>> {
  private events: Map<keyof Events, Set<EventCallback>> = new Map();

  on<K extends keyof Events>(event: K, callback: EventCallback<Events[K]>): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(callback);
  }

  off<K extends keyof Events>(event: K, callback: EventCallback<Events[K]>): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  emit<K extends keyof Events>(event: K, data: Events[K]): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  removeAllListeners(): void {
    this.events.clear();
  }
}
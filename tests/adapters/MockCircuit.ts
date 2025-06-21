/**
 * MockCircuit - テスト専用のCircuitインターフェース実装
 * 
 * 実装詳細に依存せず、仕様ベーステストを可能にします。
 * 実際のZustandストアや複雑なロジックを使わずに、
 * ユーザーの期待動作を純粋にテストできます。
 */

import type {
  Circuit,
  ComponentId,
  ComponentType,
  Position,
  Selection,
} from '@/domain/ports/CircuitDesigner';

interface MockComponent {
  id: ComponentId;
  type: ComponentType;
  position: Position;
}

interface MockConnection {
  from: ComponentId;
  to: ComponentId;
}

interface MockHistoryState {
  components: MockComponent[];
  connections: MockConnection[];
}

export class MockCircuit implements Circuit {
  private components: Map<ComponentId, MockComponent> = new Map();
  private connections: Set<string> = new Set();
  private selection: Selection = [];
  private clipboard: MockComponent[] = [];
  private history: MockHistoryState[] = [];
  private historyIndex: number = -1;
  private nextId: number = 1;

  constructor(public readonly name?: string) {
    this.saveState();
  }

  // === プライベートヘルパー ===

  private generateId(): ComponentId {
    return `mock-${this.nextId++}`;
  }

  private connectionKey(from: ComponentId, to: ComponentId): string {
    return `${from}->${to}`;
  }

  private saveState(): void {
    const state: MockHistoryState = {
      components: Array.from(this.components.values()),
      connections: Array.from(this.connections).map(key => {
        const [from, to] = key.split('->');
        return { from, to };
      }),
    };
    
    // 現在位置より先の履歴を削除
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(state);
    this.historyIndex++;
    
    // 履歴サイズ制限
    if (this.history.length > 50) {
      this.history.shift();
      this.historyIndex--;
    }
  }

  private restoreState(state: MockHistoryState): void {
    this.components.clear();
    this.connections.clear();
    
    state.components.forEach(comp => {
      this.components.set(comp.id, { ...comp });
    });
    
    state.connections.forEach(conn => {
      this.connections.add(this.connectionKey(conn.from, conn.to));
    });
    
    this.selection = [];
  }

  // === CircuitDesigner実装 ===

  async place(type: ComponentType, position: Position): Promise<ComponentId> {
    const id = this.generateId();
    const component: MockComponent = {
      id,
      type,
      position: { ...position },
    };
    
    this.components.set(id, component);
    this.saveState();
    
    return id;
  }

  async remove(componentId: ComponentId): Promise<void> {
    // コンポーネント削除
    this.components.delete(componentId);
    
    // 関連する接続も削除
    const toRemove: string[] = [];
    this.connections.forEach(key => {
      if (key.includes(componentId)) {
        toRemove.push(key);
      }
    });
    toRemove.forEach(key => this.connections.delete(key));
    
    // 選択からも削除
    this.selection = this.selection.filter(id => id !== componentId);
    
    this.saveState();
  }

  async connect(from: ComponentId, to: ComponentId): Promise<void> {
    // 基本的な検証
    if (!this.components.has(from) || !this.components.has(to)) {
      throw new Error('コンポーネントが存在しません');
    }
    
    if (from === to) {
      throw new Error('自分自身には接続できません');
    }
    
    const key = this.connectionKey(from, to);
    if (this.connections.has(key)) {
      return; // 既に接続済み
    }
    
    // 複数入力ゲートの場合は複数接続を許可
    const toComponent = this.components.get(to)!;
    const isMultiInputGate = ['AND', 'OR', 'XOR', 'NAND', 'NOR'].includes(toComponent.type);
    
    if (!isMultiInputGate) {
      // 単一入力ゲートの場合は既存接続を削除
      const existingToConnections = Array.from(this.connections)
        .filter(k => k.endsWith(`->${to}`));
      
      if (existingToConnections.length > 0) {
        existingToConnections.forEach(k => this.connections.delete(k));
      }
    }
    
    this.connections.add(key);
    this.saveState();
  }

  async disconnect(from: ComponentId, to: ComponentId): Promise<void> {
    const key = this.connectionKey(from, to);
    this.connections.delete(key);
    this.saveState();
  }

  select(componentId: ComponentId): void {
    this.selection = [componentId];
  }

  selectMultiple(componentIds: ComponentId[]): void {
    this.selection = [...componentIds];
  }

  clearSelection(): void {
    this.selection = [];
  }

  async moveSelection(delta: Position): Promise<void> {
    this.selection.forEach(id => {
      const component = this.components.get(id);
      if (component) {
        component.position.x += delta.x;
        component.position.y += delta.y;
      }
    });
    
    this.saveState();
  }

  copy(): void {
    this.clipboard = this.selection
      .map(id => this.components.get(id))
      .filter((comp): comp is MockComponent => comp !== undefined)
      .map(comp => ({ ...comp, position: { ...comp.position } }));
  }

  async paste(position: Position): Promise<void> {
    if (this.clipboard.length === 0) return;
    
    // クリップボードの境界を計算
    const bounds = this.clipboard.reduce(
      (acc, comp) => ({
        minX: Math.min(acc.minX, comp.position.x),
        minY: Math.min(acc.minY, comp.position.y),
        maxX: Math.max(acc.maxX, comp.position.x),
        maxY: Math.max(acc.maxY, comp.position.y),
      }),
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    );
    
    // オフセット計算
    const offsetX = position.x - bounds.minX;
    const offsetY = position.y - bounds.minY;
    
    // 新しいIDマッピング
    const idMapping: Map<ComponentId, ComponentId> = new Map();
    const clipboardIds = new Set(this.clipboard.map(comp => comp.id));
    
    // コンポーネントを複製
    for (const comp of this.clipboard) {
      const newId = this.generateId();
      idMapping.set(comp.id, newId);
      
      const newComponent: MockComponent = {
        id: newId,
        type: comp.type,
        position: {
          x: comp.position.x + offsetX,
          y: comp.position.y + offsetY,
        },
      };
      
      this.components.set(newId, newComponent);
    }
    
    // クリップボード内のコンポーネント間の接続も複製
    const clipboardConnections = Array.from(this.connections)
      .filter(key => {
        const [from, to] = key.split('->');
        return clipboardIds.has(from) && clipboardIds.has(to);
      });
    
    for (const connectionKey of clipboardConnections) {
      const [oldFrom, oldTo] = connectionKey.split('->');
      const newFrom = idMapping.get(oldFrom);
      const newTo = idMapping.get(oldTo);
      
      if (newFrom && newTo) {
        const newConnectionKey = this.connectionKey(newFrom, newTo);
        this.connections.add(newConnectionKey);
      }
    }
    
    // 新しい選択を設定
    this.selection = Array.from(idMapping.values());
    
    this.saveState();
  }

  // === 状態確認 ===

  getComponentCount(): number {
    return this.components.size;
  }

  hasComponent(type: ComponentType): boolean {
    return Array.from(this.components.values()).some(comp => comp.type === type);
  }

  areConnected(from: ComponentId, to: ComponentId): boolean {
    return this.connections.has(this.connectionKey(from, to));
  }

  getSelection(): Selection {
    return [...this.selection];
  }

  isEmpty(): boolean {
    return this.components.size === 0 && this.connections.size === 0;
  }

  isValid(): boolean {
    // 簡易的な検証（循環参照チェックなど）
    // 実際の実装では、より詳細な検証が必要
    return true;
  }

  // === 履歴管理 ===

  async undo(): Promise<void> {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.restoreState(this.history[this.historyIndex]);
    }
  }

  async redo(): Promise<void> {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.restoreState(this.history[this.historyIndex]);
    }
  }

  canUndo(): boolean {
    return this.historyIndex > 0;
  }

  canRedo(): boolean {
    return this.historyIndex < this.history.length - 1;
  }

  // === キャンバス操作 ===

  async clear(): Promise<void> {
    this.components.clear();
    this.connections.clear();
    this.selection = [];
    this.saveState();
  }

  getBounds(): { minX: number; minY: number; maxX: number; maxY: number } {
    if (this.components.size === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    }
    
    return Array.from(this.components.values()).reduce(
      (acc, comp) => ({
        minX: Math.min(acc.minX, comp.position.x),
        minY: Math.min(acc.minY, comp.position.y),
        maxX: Math.max(acc.maxX, comp.position.x),
        maxY: Math.max(acc.maxY, comp.position.y),
      }),
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    );
  }

  // === テスト用ヘルパーメソッド ===

  /**
   * 特定のコンポーネントの位置を取得（テスト用）
   */
  getComponentPosition(id: ComponentId): Position | undefined {
    return this.components.get(id)?.position;
  }

  /**
   * 全ての接続を取得（テスト用）
   */
  getAllConnections(): Array<{ from: ComponentId; to: ComponentId }> {
    return Array.from(this.connections).map(key => {
      const [from, to] = key.split('->');
      return { from, to };
    });
  }

  /**
   * 特定タイプのコンポーネントを全て取得（テスト用）
   */
  getComponentsByType(type: ComponentType): ComponentId[] {
    return Array.from(this.components.values())
      .filter(comp => comp.type === type)
      .map(comp => comp.id);
  }
}
/**
 * ZustandCircuitAdapter - 理想インターフェースと既存Zustandストアの架け橋
 *
 * このアダプターにより、理想的な仕様ベーステストが
 * 実際のZustandストア実装で動作するようになります。
 *
 * 設計原則：
 * - 理想インターフェースの完全実装
 * - 既存実装への最小限の影響
 * - エラーハンドリングの強化
 * - パフォーマンスの最適化
 */

import type {
  Circuit,
  ComponentId,
  ComponentType,
  Position,
  Selection,
} from '@/domain/ports/CircuitDesigner';
import { useCircuitStore } from '@/stores/circuitStore';
import type { CircuitStore } from '@/stores/types';

export class ZustandCircuitAdapter implements Circuit {
  constructor() {
    // Zustandストアは常に最新の状態を取得する必要がある
  }

  // === 内部ヘルパーメソッド ===

  private getStore(): CircuitStore {
    // 常に最新の状態を取得
    return useCircuitStore.getState();
  }

  private findGate(componentId: ComponentId) {
    return this.getStore().gates.find(gate => gate.id === componentId);
  }

  private canConnect(fromId: ComponentId, toId: ComponentId): boolean {
    const fromGate = this.findGate(fromId);
    const toGate = this.findGate(toId);

    if (!fromGate || !toGate) return false;
    if (fromId === toId) return false;

    // 基本的な接続可能性チェック
    // 詳細なルールは既存のWireConnectionServiceに委譲
    return true;
  }

  private async waitForStoreUpdate(): Promise<void> {
    // Zustandの状態更新を待機（必要に応じて）
    return new Promise(resolve => setTimeout(resolve, 0));
  }

  // === CircuitDesigner実装 ===

  async place(type: ComponentType, position: Position): Promise<ComponentId> {
    try {
      const store = this.getStore();
      const gate = store.addGate(type, position);
      await this.waitForStoreUpdate();
      return gate.id;
    } catch (error) {
      throw new Error(
        `ゲートの配置に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async remove(componentId: ComponentId): Promise<void> {
    const gate = this.findGate(componentId);
    if (!gate) {
      throw new Error(`削除対象のゲートが見つかりません: ${componentId}`);
    }

    try {
      const store = this.getStore();
      store.deleteGate(componentId);
      await this.waitForStoreUpdate();
    } catch (error) {
      throw new Error(
        `ゲートの削除に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async connect(from: ComponentId, to: ComponentId): Promise<void> {
    if (!this.canConnect(from, to)) {
      throw new Error(`ゲート間を接続できません: ${from} -> ${to}`);
    }

    try {
      const store = this.getStore();

      // 入力ゲートの次の利用可能な入力ピンを探す
      const toGate = this.findGate(to);
      if (!toGate) {
        throw new Error(`接続先ゲートが見つかりません: ${to}`);
      }

      // 既存の接続を確認して、次の利用可能な入力ピンインデックスを見つける
      const existingConnections = store.wires.filter(
        wire => wire.to.gateId === to
      );
      let nextInputPin = 0;

      // 入力ピンが既に使われている場合、次のピンを使用
      while (
        existingConnections.some(wire => wire.to.pinIndex === nextInputPin)
      ) {
        nextInputPin++;
      }

      // 既存の低レベルAPIを使用して接続
      store.startWireDrawing(from, -1); // 出力ピン（-1は慣例）
      store.endWireDrawing(to, nextInputPin); // 次の利用可能な入力ピン
      await this.waitForStoreUpdate();
    } catch (error) {
      // 接続失敗時は描画状態をクリア
      const store = this.getStore();
      store.cancelWireDrawing();
      throw new Error(
        `ゲートの接続に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async disconnect(from: ComponentId, to: ComponentId): Promise<void> {
    const store = this.getStore();
    // 対象のワイヤーを探す
    const wire = store.wires.find(
      w => w.from.gateId === from && w.to.gateId === to
    );

    if (!wire) {
      throw new Error(`指定された接続が存在しません: ${from} -> ${to}`);
    }

    try {
      store.deleteWire(wire.id);
      await this.waitForStoreUpdate();
    } catch (error) {
      throw new Error(
        `接続の削除に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  select(componentId: ComponentId): void {
    const gate = this.findGate(componentId);
    if (!gate) {
      throw new Error(`選択対象のゲートが見つかりません: ${componentId}`);
    }

    const store = this.getStore();
    store.selectGate(componentId);
  }

  selectMultiple(componentIds: ComponentId[]): void {
    // 存在しないゲートをチェック
    const invalidIds = componentIds.filter(id => !this.findGate(id));
    if (invalidIds.length > 0) {
      throw new Error(
        `存在しないゲートが含まれています: ${invalidIds.join(', ')}`
      );
    }

    const store = this.getStore();
    store.setSelectedGates(componentIds);
  }

  clearSelection(): void {
    const store = this.getStore();
    store.clearSelection();
  }

  async moveSelection(delta: Position): Promise<void> {
    const store = this.getStore();
    const selectedIds = store.selectedGateIds;
    if (selectedIds.length === 0) {
      return; // 何も選択されていない場合は何もしない
    }

    try {
      store.moveMultipleGates(selectedIds, delta.x, delta.y, true);
      await this.waitForStoreUpdate();
    } catch (error) {
      throw new Error(
        `選択ゲートの移動に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  copy(): void {
    const store = this.getStore();
    if (store.selectedGateIds.length === 0) {
      throw new Error('コピーするゲートが選択されていません');
    }

    store.copySelection();
  }

  async paste(position: Position): Promise<void> {
    const store = this.getStore();
    if (!store.canPaste()) {
      throw new Error('ペーストできるデータがありません');
    }

    try {
      store.paste(position);
      await this.waitForStoreUpdate();
    } catch (error) {
      throw new Error(
        `ペーストに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // === 状態確認メソッド ===

  getComponentCount(): number {
    const store = this.getStore();
    return store.gates.length;
  }

  hasComponent(type: ComponentType): boolean {
    const store = this.getStore();
    return store.gates.some(gate => gate.type === type);
  }

  areConnected(from: ComponentId, to: ComponentId): boolean {
    const store = this.getStore();
    return store.wires.some(
      wire => wire.from.gateId === from && wire.to.gateId === to
    );
  }

  getSelection(): Selection {
    const store = this.getStore();
    return [...store.selectedGateIds];
  }

  isEmpty(): boolean {
    const store = this.getStore();
    return store.gates.length === 0 && store.wires.length === 0;
  }

  isValid(): boolean {
    // 基本的な整合性チェック
    try {
      const store = this.getStore();
      // すべてのワイヤーが有効なゲートに接続されているかチェック
      const gateIds = new Set(store.gates.map(g => g.id));

      for (const wire of store.wires) {
        if (!gateIds.has(wire.from.gateId) || !gateIds.has(wire.to.gateId)) {
          return false;
        }
      }

      return true;
    } catch {
      return false;
    }
  }

  // === CircuitHistory実装 ===

  async undo(): Promise<void> {
    const store = this.getStore();
    if (!store.canUndo()) {
      throw new Error('取り消せる操作がありません');
    }

    try {
      store.undo();
      await this.waitForStoreUpdate();
    } catch (error) {
      throw new Error(
        `操作の取り消しに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async redo(): Promise<void> {
    const store = this.getStore();
    if (!store.canRedo()) {
      throw new Error('やり直せる操作がありません');
    }

    try {
      store.redo();
      await this.waitForStoreUpdate();
    } catch (error) {
      throw new Error(
        `操作のやり直しに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  canUndo(): boolean {
    const store = this.getStore();
    return store.canUndo();
  }

  canRedo(): boolean {
    const store = this.getStore();
    return store.canRedo();
  }

  // === CircuitCanvas実装 ===

  async clear(): Promise<void> {
    try {
      const store = this.getStore();
      store.clearAll();
      await this.waitForStoreUpdate();
    } catch (error) {
      throw new Error(
        `回路のクリアに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  getBounds(): { minX: number; minY: number; maxX: number; maxY: number } {
    const store = this.getStore();
    if (store.gates.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    }

    return store.gates.reduce(
      (bounds, gate) => ({
        minX: Math.min(bounds.minX, gate.position.x),
        minY: Math.min(bounds.minY, gate.position.y),
        maxX: Math.max(bounds.maxX, gate.position.x),
        maxY: Math.max(bounds.maxY, gate.position.y),
      }),
      {
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity,
      }
    );
  }

  // === 統合テスト用ヘルパーメソッド ===

  /**
   * 特定のコンポーネントの位置を取得（統合テスト用）
   */
  getComponentPosition(id: ComponentId): Position | undefined {
    const gate = this.findGate(id);
    return gate ? { ...gate.position } : undefined;
  }

  /**
   * 全ての接続を取得（統合テスト用）
   */
  getAllConnections(): Array<{ from: ComponentId; to: ComponentId }> {
    const store = this.getStore();
    return store.wires.map(wire => ({
      from: wire.from.gateId,
      to: wire.to.gateId,
    }));
  }

  /**
   * 特定タイプのコンポーネントを全て取得（統合テスト用）
   */
  getComponentsByType(type: ComponentType): ComponentId[] {
    const store = this.getStore();
    return store.gates.filter(gate => gate.type === type).map(gate => gate.id);
  }

  /**
   * 現在の内部ストア状態を取得（デバッグ用）
   */
  getInternalState() {
    const store = this.getStore();
    return {
      gates: store.gates.length,
      wires: store.wires.length,
      selected: store.selectedGateIds.length,
      canUndo: store.canUndo(),
      canRedo: store.canRedo(),
    };
  }
}

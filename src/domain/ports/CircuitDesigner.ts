/**
 * CircuitDesigner Port - 回路設計者の理想的なインターフェース
 *
 * このインターフェースは「回路設計者がやりたいこと」を表現します。
 * 実装詳細（Zustand、DOM操作、低レベルAPI）は完全に隠蔽されます。
 *
 * 設計原則：
 * - ユーザーの意図を直接表現
 * - 実装技術に依存しない
 * - 直感的で覚えやすい
 * - 組み合わせ可能
 */

export type ComponentId = string;
export type ComponentType =
  | 'INPUT'
  | 'OUTPUT'
  | 'AND'
  | 'OR'
  | 'NOT'
  | 'XOR'
  | 'NAND'
  | 'NOR'
  | 'CLOCK';
export type Position = { x: number; y: number };
export type Selection = ComponentId[];

/**
 * 回路設計者の基本操作
 */
export interface CircuitDesigner {
  // === コンポーネント配置 ===

  /**
   * コンポーネントを配置する（パレットからドラッグ&ドロップ）
   * @param type コンポーネントの種類
   * @param position 配置位置
   * @returns 配置されたコンポーネントのID
   */
  place(type: ComponentType, position: Position): Promise<ComponentId>;

  /**
   * コンポーネントを削除する（Deleteキーまたは右クリック削除）
   * @param componentId 削除するコンポーネントのID
   */
  remove(componentId: ComponentId): Promise<void>;

  // === 接続操作 ===

  /**
   * 2つのコンポーネントを接続する（ドラッグで線を引く）
   * @param from 出力側コンポーネント
   * @param to 入力側コンポーネント
   */
  connect(from: ComponentId, to: ComponentId): Promise<void>;

  /**
   * 接続を削除する（線をクリックして削除）
   * @param from 出力側コンポーネント
   * @param to 入力側コンポーネント
   */
  disconnect(from: ComponentId, to: ComponentId): Promise<void>;

  // === 選択と移動 ===

  /**
   * コンポーネントを選択する（クリック）
   * @param componentId 選択するコンポーネント
   */
  select(componentId: ComponentId): void;

  /**
   * 複数のコンポーネントを選択する（Ctrl+クリックまたはドラッグ選択）
   * @param componentIds 選択するコンポーネントのリスト
   */
  selectMultiple(componentIds: ComponentId[]): void;

  /**
   * 選択を解除する（空白をクリック）
   */
  clearSelection(): void;

  /**
   * 選択したコンポーネントを移動する（ドラッグ）
   * @param delta 移動量
   */
  moveSelection(delta: Position): Promise<void>;

  // === クリップボード操作 ===

  /**
   * 選択したコンポーネントをコピーする（Ctrl+C）
   */
  copy(): void;

  /**
   * コピーしたコンポーネントを貼り付ける（Ctrl+V）
   * @param position 貼り付け位置
   */
  paste(position: Position): Promise<void>;

  // === 状態確認 ===

  /**
   * 配置されているコンポーネントの数
   */
  getComponentCount(): number;

  /**
   * 特定タイプのコンポーネントが存在するか
   */
  hasComponent(type: ComponentType): boolean;

  /**
   * 2つのコンポーネントが接続されているか
   */
  areConnected(from: ComponentId, to: ComponentId): boolean;

  /**
   * 現在選択されているコンポーネントのリスト
   */
  getSelection(): Selection;

  /**
   * 回路が空かどうか
   */
  isEmpty(): boolean;

  /**
   * 回路が有効な状態かどうか（循環参照やエラーがない）
   */
  isValid(): boolean;
}

/**
 * 履歴管理（Undo/Redo）
 */
export interface CircuitHistory {
  /**
   * 操作を取り消す（Ctrl+Z）
   */
  undo(): Promise<void>;

  /**
   * 操作をやり直す（Ctrl+Y）
   */
  redo(): Promise<void>;

  /**
   * 取り消し可能か
   */
  canUndo(): boolean;

  /**
   * やり直し可能か
   */
  canRedo(): boolean;
}

/**
 * 回路のクリア操作
 */
export interface CircuitCanvas {
  /**
   * 回路を全消去する（Clearボタン）
   */
  clear(): Promise<void>;

  /**
   * 回路の境界を取得する（表示調整用）
   */
  getBounds(): {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
}

/**
 * 統合インターフェース - 回路設計者ができる全ての操作
 */
export interface Circuit
  extends CircuitDesigner,
    CircuitHistory,
    CircuitCanvas {
  /**
   * 回路の名前
   */
  readonly name?: string;
}

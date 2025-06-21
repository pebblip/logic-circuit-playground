/**
 * CircuitPersistence Port - 回路永続化の理想的なインターフェース
 * 
 * このインターフェースは「回路を保存・共有・復元したい」というユーザーの
 * 根本的なニーズを表現します。技術実装（IndexedDB、LocalStorage、API）は
 * 完全に隠蔽されます。
 * 
 * 設計原則：
 * - ユーザーの意図を直接表現
 * - 保存技術に依存しない
 * - 失敗しない信頼性
 * - 簡単で覚えやすい
 */

export type CircuitId = string;
export type ShareUrl = string;
export type CircuitName = string;

/**
 * 保存された回路の情報
 */
export interface SavedCircuit {
  id: CircuitId;
  name: CircuitName;
  createdAt: Date;
  updatedAt: Date;
  description?: string;
  thumbnail?: string; // Base64画像
}

/**
 * 回路のコンテンツ（技術実装に依存しない形式）
 */
export interface CircuitContent {
  name: CircuitName;
  components: CircuitComponent[];
  connections: CircuitConnection[];
  metadata?: {
    description?: string;
    tags?: string[];
    author?: string;
    version?: string;
  };
}

export interface CircuitComponent {
  id: string;
  type: 'INPUT' | 'OUTPUT' | 'AND' | 'OR' | 'NOT' | 'XOR' | 'NAND' | 'NOR' | 'CLOCK' | 'CUSTOM';
  position: { x: number; y: number };
  label?: string;
  customGateId?: string; // カスタムゲートの場合
}

export interface CircuitConnection {
  id: string;
  from: { componentId: string; outputIndex: number };
  to: { componentId: string; inputIndex: number };
}

/**
 * 回路の保存・読み込み
 */
export interface CircuitPersistence {
  /**
   * 回路を保存する（Ctrl+S または 保存ボタン）
   * @param content 保存する回路の内容
   * @returns 保存された回路のID
   */
  save(content: CircuitContent): Promise<CircuitId>;

  /**
   * 回路を読み込む（ファイル→開く または 一覧から選択）
   * @param circuitId 読み込む回路のID
   * @returns 回路の内容
   */
  load(circuitId: CircuitId): Promise<CircuitContent>;

  /**
   * 回路を削除する（削除ボタン）
   * @param circuitId 削除する回路のID
   */
  delete(circuitId: CircuitId): Promise<void>;

  /**
   * 保存済み回路の一覧を取得する（ファイル一覧表示）
   * @returns 保存されている回路の情報一覧
   */
  list(): Promise<SavedCircuit[]>;

  /**
   * 回路が存在するかチェック
   * @param circuitId 確認する回路のID
   */
  exists(circuitId: CircuitId): Promise<boolean>;
}

/**
 * 回路の共有機能
 */
export interface CircuitSharing {
  /**
   * 回路を共有可能なURLにする（共有ボタン）
   * @param content 共有する回路の内容
   * @returns 共有用URL
   */
  createShareUrl(content: CircuitContent): Promise<ShareUrl>;

  /**
   * 共有URLから回路を復元する（共有URLにアクセス）
   * @param shareUrl 共有URL
   * @returns 回路の内容
   */
  loadFromShareUrl(shareUrl: ShareUrl): Promise<CircuitContent>;

  /**
   * 共有URLが有効かチェック
   * @param shareUrl 確認するURL
   */
  isValidShareUrl(shareUrl: ShareUrl): Promise<boolean>;
}

/**
 * 回路のエクスポート・インポート
 */
export interface CircuitExport {
  /**
   * 回路をファイルにエクスポート（エクスポートボタン）
   * @param content エクスポートする回路
   * @param format エクスポート形式
   * @returns エクスポートされたデータ
   */
  exportToFile(
    content: CircuitContent,
    format: 'json' | 'png' | 'svg'
  ): Promise<Blob>;

  /**
   * ファイルから回路をインポート（インポートボタン）
   * @param file インポートするファイル
   * @returns 回路の内容
   */
  importFromFile(file: File): Promise<CircuitContent>;
}

/**
 * データの整合性保証
 */
export interface DataIntegrity {
  /**
   * 回路データの整合性をチェック
   * @param content チェックする回路
   * @returns 整合性チェック結果
   */
  validate(content: CircuitContent): Promise<ValidationResult>;

  /**
   * 破損したデータを修復（可能な場合）
   * @param content 修復する回路
   * @returns 修復された回路
   */
  repair(content: CircuitContent): Promise<CircuitContent>;

  /**
   * データのバックアップを作成
   */
  createBackup(): Promise<void>;

  /**
   * バックアップからデータを復元
   */
  restoreFromBackup(): Promise<void>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  canRepair: boolean;
}

export interface ValidationError {
  type: 'MISSING_COMPONENT' | 'INVALID_CONNECTION' | 'CIRCULAR_REFERENCE' | 'DATA_CORRUPTION';
  message: string;
  componentId?: string;
  connectionId?: string;
}

export interface ValidationWarning {
  type: 'DEPRECATED_FORMAT' | 'PERFORMANCE_ISSUE' | 'MISSING_METADATA';
  message: string;
  suggestion?: string;
}

/**
 * 統合インターフェース - 回路の永続化に関する全ての操作
 */
export interface CircuitStorage 
  extends CircuitPersistence, 
          CircuitSharing, 
          CircuitExport, 
          DataIntegrity {
  
  /**
   * ストレージシステムが利用可能かチェック
   */
  isAvailable(): Promise<boolean>;

  /**
   * ストレージの使用量情報を取得
   */
  getStorageInfo(): Promise<StorageInfo>;

  /**
   * ストレージをクリア（設定メニューからの全削除）
   */
  clear(): Promise<void>;
}

export interface StorageInfo {
  totalCircuits: number;
  totalSize: number; // bytes
  availableSpace: number; // bytes
  oldestCircuit?: Date;
  newestCircuit?: Date;
}
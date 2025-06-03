import { 
  SavedCircuit, 
  CircuitMetadata, 
  CircuitData, 
  CircuitFilter, 
  CircuitStorageResult,
  ExportOptions,
  ImportOptions,
  CIRCUIT_STORAGE_VERSION 
} from '../types/circuit-storage';
import { Gate, Wire } from '../types/circuit';
import { IdGenerator } from '../utils/idGenerator';

/**
 * 高性能な回路保存・読み込みサービス
 * - LocalStorage: メタデータと小さな回路の高速アクセス
 * - IndexedDB: 大きな回路とサムネイルの大容量保存
 */
export class CircuitStorageService {
  private static instance: CircuitStorageService;
  private dbName = 'CircuitPlaygroundDB';
  private dbVersion = 1;
  private localStorageKey = 'circuit-metadata-index';
  private db: IDBDatabase | null = null;

  private constructor() {
    this.initializeDatabase();
  }

  public static getInstance(): CircuitStorageService {
    if (!CircuitStorageService.instance) {
      CircuitStorageService.instance = new CircuitStorageService();
    }
    return CircuitStorageService.instance;
  }

  /**
   * IndexedDBの初期化
   */
  private async initializeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('IndexedDB initialization failed:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // 回路データ保存用のオブジェクトストア
        if (!db.objectStoreNames.contains('circuits')) {
          const circuitStore = db.createObjectStore('circuits', { keyPath: 'metadata.id' });
          circuitStore.createIndex('name', 'metadata.name', { unique: false });
          circuitStore.createIndex('createdAt', 'metadata.createdAt', { unique: false });
          circuitStore.createIndex('updatedAt', 'metadata.updatedAt', { unique: false });
          circuitStore.createIndex('tags', 'metadata.tags', { unique: false, multiEntry: true });
        }

        // サムネイル専用のオブジェクトストア（大容量対応）
        if (!db.objectStoreNames.contains('thumbnails')) {
          db.createObjectStore('thumbnails', { keyPath: 'circuitId' });
        }
      };
    });
  }

  /**
   * 回路を保存
   */
  public async saveCircuit(
    name: string, 
    gates: Gate[], 
    wires: Wire[], 
    options: {
      description?: string;
      tags?: string[];
      thumbnail?: string;
      overwrite?: boolean;
    } = {}
  ): Promise<CircuitStorageResult> {
    try {
      // メタデータ生成
      const now = new Date().toISOString();
      const circuitId = options.overwrite ? 
        await this.findCircuitIdByName(name) || this.generateId() : 
        this.generateId();

      const metadata: CircuitMetadata = {
        id: circuitId,
        name: name.trim(),
        description: options.description?.trim(),
        createdAt: now,
        updatedAt: now,
        tags: options.tags || [],
        stats: {
          gateCount: gates.length,
          wireCount: wires.length,
          gateTypes: this.calculateGateTypes(gates)
        }
      };

      const circuit: CircuitData = { gates, wires };
      
      const savedCircuit: SavedCircuit = {
        metadata,
        circuit,
        version: CIRCUIT_STORAGE_VERSION
      };

      // IndexedDBに保存
      await this.saveToIndexedDB(savedCircuit);
      
      // サムネイルを別途保存（容量最適化）
      if (options.thumbnail) {
        await this.saveThumbnail(circuitId, options.thumbnail);
      }

      // LocalStorageのインデックスを更新
      await this.updateMetadataIndex(metadata);

      return {
        success: true,
        message: `回路「${name}」を保存しました`,
        data: { id: circuitId }
      };

    } catch (error) {
      console.error('❌ Circuit save failed:', error);
      return {
        success: false,
        message: `保存に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`
      };
    }
  }

  /**
   * 回路を読み込み
   */
  public async loadCircuit(circuitId: string): Promise<CircuitStorageResult> {
    try {
      const savedCircuit = await this.loadFromIndexedDB(circuitId);
      
      if (!savedCircuit) {
        return {
          success: false,
          message: '回路が見つかりません'
        };
      }

      // サムネイルを別途読み込み
      const thumbnail = await this.loadThumbnail(circuitId);
      if (thumbnail) {
        savedCircuit.metadata.thumbnail = thumbnail;
      }

      return {
        success: true,
        message: `回路「${savedCircuit.metadata.name}」を読み込みました`,
        data: savedCircuit
      };

    } catch (error) {
      console.error('❌ Circuit load failed:', error);
      return {
        success: false,
        message: `読み込みに失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`
      };
    }
  }

  /**
   * 保存済み回路一覧を取得
   */
  public async listCircuits(filter: CircuitFilter = {}): Promise<CircuitStorageResult> {
    try {
      // まずはLocalStorageから高速でメタデータを取得
      const metadataList = this.getMetadataIndex();
      
      // フィルタリング
      let filteredList = metadataList;
      
      if (filter.nameQuery) {
        const query = filter.nameQuery.toLowerCase();
        filteredList = filteredList.filter(meta => 
          meta.name.toLowerCase().includes(query) ||
          meta.description?.toLowerCase().includes(query)
        );
      }

      if (filter.tags && filter.tags.length > 0) {
        filteredList = filteredList.filter(meta =>
          filter.tags!.some(tag => meta.tags?.includes(tag))
        );
      }

      // ソート
      const sortBy = filter.sortBy || 'updatedAt';
      const sortOrder = filter.sortOrder || 'desc';
      
      filteredList.sort((a, b) => {
        let aVal: any, bVal: any;
        
        switch (sortBy) {
          case 'name':
            aVal = a.name.toLowerCase();
            bVal = b.name.toLowerCase();
            break;
          case 'gateCount':
            aVal = a.stats.gateCount;
            bVal = b.stats.gateCount;
            break;
          default:
            aVal = new Date(a[sortBy]).getTime();
            bVal = new Date(b[sortBy]).getTime();
        }

        return sortOrder === 'asc' ? 
          (aVal > bVal ? 1 : -1) : 
          (aVal < bVal ? 1 : -1);
      });

      // ページネーション
      if (filter.offset || filter.limit) {
        const start = filter.offset || 0;
        const end = filter.limit ? start + filter.limit : undefined;
        filteredList = filteredList.slice(start, end);
      }

      return {
        success: true,
        message: `${filteredList.length}個の回路が見つかりました`,
        data: filteredList
      };

    } catch (error) {
      console.error('❌ Circuit list failed:', error);
      return {
        success: false,
        message: `一覧取得に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`
      };
    }
  }

  /**
   * 回路を削除
   */
  public async deleteCircuit(circuitId: string): Promise<CircuitStorageResult> {
    try {
      // IndexedDBから削除
      await this.deleteFromIndexedDB(circuitId);
      
      // サムネイルも削除
      await this.deleteThumbnail(circuitId);
      
      // LocalStorageのインデックスからも削除
      await this.removeFromMetadataIndex(circuitId);

      return {
        success: true,
        message: '回路を削除しました'
      };

    } catch (error) {
      console.error('❌ Circuit delete failed:', error);
      return {
        success: false,
        message: `削除に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`
      };
    }
  }

  /**
   * 回路をJSONファイルとしてエクスポート
   */
  public async exportCircuit(circuitId: string, options: ExportOptions = {
    includeMetadata: true,
    includeThumbnail: false,
    compress: false
  }): Promise<CircuitStorageResult> {
    try {
      const result = await this.loadCircuit(circuitId);
      if (!result.success || !result.data) {
        return result;
      }

      const savedCircuit: SavedCircuit = result.data;
      
      // オプションに応じてデータを調整
      if (!options.includeMetadata) {
        delete savedCircuit.metadata.description;
        delete savedCircuit.metadata.author;
        delete savedCircuit.metadata.tags;
      }

      if (!options.includeThumbnail) {
        delete savedCircuit.metadata.thumbnail;
      }

      const jsonData = JSON.stringify(savedCircuit, null, options.compress ? 0 : 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      
      // ダウンロードリンクを作成
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${savedCircuit.metadata.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return {
        success: true,
        message: `回路「${savedCircuit.metadata.name}」をエクスポートしました`
      };

    } catch (error) {
      console.error('❌ Circuit export failed:', error);
      return {
        success: false,
        message: `エクスポートに失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`
      };
    }
  }

  /**
   * JSONファイルから回路をインポート
   */
  public async importCircuit(file: File, options: ImportOptions = {
    overwriteExisting: false,
    generateNewName: true,
    validate: true
  }): Promise<CircuitStorageResult> {
    try {
      const text = await file.text();
      const savedCircuit: SavedCircuit = JSON.parse(text);

      // バリデーション
      if (options.validate && !this.validateCircuitData(savedCircuit)) {
        return {
          success: false,
          message: '無効な回路ファイルです'
        };
      }

      // 名前の重複チェック
      if (options.generateNewName) {
        savedCircuit.metadata.name = await this.generateUniqueName(savedCircuit.metadata.name);
      }

      // 新しいIDを生成
      const oldId = savedCircuit.metadata.id;
      savedCircuit.metadata.id = this.generateId();
      savedCircuit.metadata.createdAt = new Date().toISOString();
      savedCircuit.metadata.updatedAt = new Date().toISOString();

      // 保存
      const saveResult = await this.saveCircuit(
        savedCircuit.metadata.name,
        savedCircuit.circuit.gates,
        savedCircuit.circuit.wires,
        {
          description: savedCircuit.metadata.description,
          tags: savedCircuit.metadata.tags,
          thumbnail: savedCircuit.metadata.thumbnail,
          overwrite: options.overwriteExisting
        }
      );

      return saveResult;

    } catch (error) {
      console.error('❌ Circuit import failed:', error);
      return {
        success: false,
        message: `インポートに失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`
      };
    }
  }

  // === プライベートメソッド ===

  private async saveToIndexedDB(circuit: SavedCircuit): Promise<void> {
    if (!this.db) await this.initializeDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['circuits'], 'readwrite');
      const store = transaction.objectStore('circuits');
      const request = store.put(circuit);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async loadFromIndexedDB(circuitId: string): Promise<SavedCircuit | null> {
    if (!this.db) await this.initializeDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['circuits'], 'readonly');
      const store = transaction.objectStore('circuits');
      const request = store.get(circuitId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  private async deleteFromIndexedDB(circuitId: string): Promise<void> {
    if (!this.db) await this.initializeDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['circuits'], 'readwrite');
      const store = transaction.objectStore('circuits');
      const request = store.delete(circuitId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async saveThumbnail(circuitId: string, thumbnail: string): Promise<void> {
    if (!this.db) await this.initializeDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['thumbnails'], 'readwrite');
      const store = transaction.objectStore('thumbnails');
      const request = store.put({ circuitId, data: thumbnail });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async loadThumbnail(circuitId: string): Promise<string | null> {
    if (!this.db) await this.initializeDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['thumbnails'], 'readonly');
      const store = transaction.objectStore('thumbnails');
      const request = store.get(circuitId);

      request.onsuccess = () => resolve(request.result?.data || null);
      request.onerror = () => reject(request.error);
    });
  }

  private async deleteThumbnail(circuitId: string): Promise<void> {
    if (!this.db) await this.initializeDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['thumbnails'], 'readwrite');
      const store = transaction.objectStore('thumbnails');
      const request = store.delete(circuitId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private getMetadataIndex(): CircuitMetadata[] {
    try {
      const stored = localStorage.getItem(this.localStorageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private async updateMetadataIndex(metadata: CircuitMetadata): Promise<void> {
    const index = this.getMetadataIndex();
    const existingIndex = index.findIndex(m => m.id === metadata.id);
    
    if (existingIndex >= 0) {
      index[existingIndex] = metadata;
    } else {
      index.push(metadata);
    }
    
    localStorage.setItem(this.localStorageKey, JSON.stringify(index));
  }

  private async removeFromMetadataIndex(circuitId: string): Promise<void> {
    const index = this.getMetadataIndex();
    const filtered = index.filter(m => m.id !== circuitId);
    localStorage.setItem(this.localStorageKey, JSON.stringify(filtered));
  }

  private generateId(): string {
    return IdGenerator.generateCircuitId();
  }

  private calculateGateTypes(gates: Gate[]): Record<string, number> {
    const types: Record<string, number> = {};
    gates.forEach(gate => {
      types[gate.type] = (types[gate.type] || 0) + 1;
    });
    return types;
  }

  private async findCircuitIdByName(name: string): Promise<string | null> {
    const index = this.getMetadataIndex();
    const found = index.find(m => m.name === name);
    return found?.id || null;
  }

  private async generateUniqueName(baseName: string): Promise<string> {
    const index = this.getMetadataIndex();
    const existingNames = new Set(index.map(m => m.name));
    
    if (!existingNames.has(baseName)) {
      return baseName;
    }

    let counter = 1;
    while (existingNames.has(`${baseName} (${counter})`)) {
      counter++;
    }
    
    return `${baseName} (${counter})`;
  }

  private validateCircuitData(circuit: SavedCircuit): boolean {
    return !!(
      circuit &&
      circuit.metadata &&
      circuit.metadata.id &&
      circuit.metadata.name &&
      circuit.circuit &&
      Array.isArray(circuit.circuit.gates) &&
      Array.isArray(circuit.circuit.wires) &&
      circuit.version
    );
  }
}

// シングルトンインスタンスを遅延初期化でエクスポート
export const circuitStorage = (() => {
  let instance: CircuitStorageService | null = null;
  return {
    get: () => {
      if (!instance) {
        instance = CircuitStorageService.getInstance();
      }
      return instance;
    }
  };
})();
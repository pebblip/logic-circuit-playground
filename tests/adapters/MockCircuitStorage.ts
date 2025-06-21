/**
 * MockCircuitStorage - テスト専用のCircuitStorageインターフェース実装
 * 
 * 実装詳細（IndexedDB、API、ファイルシステム）に依存せず、
 * 純粋にユーザーの期待動作をテストできます。
 */

import type {
  CircuitStorage,
  CircuitId,
  ShareUrl,
  CircuitName,
  CircuitContent,
  SavedCircuit,
  ValidationResult,
  StorageInfo,
} from '@/domain/ports/CircuitPersistence';

export class MockCircuitStorage implements CircuitStorage {
  private circuits: Map<CircuitId, SavedCircuit & { content: CircuitContent }> = new Map();
  private shareUrls: Map<ShareUrl, CircuitContent> = new Map();
  private nextId: number = 1;
  private available: boolean = true;

  constructor() {
    // テスト用にいくつかのサンプル回路を追加
    this.addSampleCircuits();
  }

  private generateId(): CircuitId {
    return `circuit-${this.nextId++}`;
  }

  private generateShareUrl(): ShareUrl {
    return `https://example.com/share/${Math.random().toString(36).slice(2)}`;
  }

  private addSampleCircuits(): void {
    // 空の回路
    const emptyCircuit: CircuitContent = {
      name: '空の回路',
      components: [],
      connections: [],
      metadata: {
        description: 'テスト用の空の回路',
        tags: ['テスト'],
        author: 'テストユーザー',
      },
    };

    // 基本的な回路
    const basicCircuit: CircuitContent = {
      name: '基本回路',
      components: [
        { id: 'input1', type: 'INPUT', position: { x: 100, y: 100 } },
        { id: 'not1', type: 'NOT', position: { x: 300, y: 100 } },
        { id: 'output1', type: 'OUTPUT', position: { x: 500, y: 100 } },
      ],
      connections: [
        {
          id: 'conn1',
          from: { componentId: 'input1', outputIndex: 0 },
          to: { componentId: 'not1', inputIndex: 0 },
        },
        {
          id: 'conn2',
          from: { componentId: 'not1', outputIndex: 0 },
          to: { componentId: 'output1', inputIndex: 0 },
        },
      ],
      metadata: {
        description: 'INPUTとNOTとOUTPUTを接続した基本回路',
        tags: ['基本', 'NOT'],
      },
    };

    // 初期サンプルを保存
    const now = new Date();
    
    this.circuits.set('sample-1', {
      id: 'sample-1',
      name: emptyCircuit.name,
      content: emptyCircuit,
      createdAt: new Date(now.getTime() - 86400000), // 1日前
      updatedAt: new Date(now.getTime() - 86400000),
      description: emptyCircuit.metadata?.description,
    });

    this.circuits.set('sample-2', {
      id: 'sample-2',
      name: basicCircuit.name,
      content: basicCircuit,
      createdAt: new Date(now.getTime() - 3600000), // 1時間前
      updatedAt: new Date(now.getTime() - 3600000),
      description: basicCircuit.metadata?.description,
    });
  }

  // === CircuitPersistence実装 ===

  async save(content: CircuitContent): Promise<CircuitId> {
    if (!this.available) {
      throw new Error('ストレージが利用できません');
    }

    // 既存の回路を更新するか、新しい回路を作成するかを判断
    const existingId = Array.from(this.circuits.values())
      .find(saved => saved.name === content.name)?.id;

    const id = existingId || this.generateId();
    const now = new Date();

    const savedCircuit = {
      id,
      name: content.name,
      content: { ...content },
      createdAt: existingId ? this.circuits.get(existingId)!.createdAt : now,
      updatedAt: now,
      description: content.metadata?.description,
    };

    this.circuits.set(id, savedCircuit);
    return id;
  }

  async load(circuitId: CircuitId): Promise<CircuitContent> {
    if (!this.available) {
      throw new Error('ストレージが利用できません');
    }

    const circuit = this.circuits.get(circuitId);
    if (!circuit) {
      throw new Error(`回路が見つかりません: ${circuitId}`);
    }

    return { ...circuit.content };
  }

  async delete(circuitId: CircuitId): Promise<void> {
    if (!this.available) {
      throw new Error('ストレージが利用できません');
    }

    if (!this.circuits.has(circuitId)) {
      throw new Error(`回路が見つかりません: ${circuitId}`);
    }

    this.circuits.delete(circuitId);
  }

  async list(): Promise<SavedCircuit[]> {
    if (!this.available) {
      throw new Error('ストレージが利用できません');
    }

    return Array.from(this.circuits.values())
      .map(({ content, ...saved }) => saved)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async exists(circuitId: CircuitId): Promise<boolean> {
    return this.circuits.has(circuitId);
  }

  // === CircuitSharing実装 ===

  async createShareUrl(content: CircuitContent): Promise<ShareUrl> {
    if (!this.available) {
      throw new Error('ストレージが利用できません');
    }

    // 簡易的なサイズ制限（実際のURL長制限をシミュレート）
    const serialized = JSON.stringify(content);
    if (serialized.length > 2000) {
      throw new Error('回路が大きすぎてURLで共有できません');
    }

    const shareUrl = this.generateShareUrl();
    this.shareUrls.set(shareUrl, { ...content });
    return shareUrl;
  }

  async loadFromShareUrl(shareUrl: ShareUrl): Promise<CircuitContent> {
    const content = this.shareUrls.get(shareUrl);
    if (!content) {
      throw new Error('無効な共有URLです');
    }

    return { ...content };
  }

  async isValidShareUrl(shareUrl: ShareUrl): Promise<boolean> {
    return this.shareUrls.has(shareUrl);
  }

  // === CircuitExport実装 ===

  async exportToFile(
    content: CircuitContent,
    format: 'json' | 'png' | 'svg'
  ): Promise<Blob> {
    switch (format) {
      case 'json':
        const jsonData = JSON.stringify(content, null, 2);
        return new Blob([jsonData], { type: 'application/json' });
      
      case 'png':
        // テスト環境用のPNGモック（Canvas不要）
        const pngData = `Mock PNG for circuit: ${content.name}`;
        return new Blob([pngData], { type: 'image/png' });
      
      case 'svg':
        // SVG画像のモック
        const svgContent = `
          <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
            <rect width="800" height="600" fill="#f0f0f0"/>
            <text x="50" y="50" font-family="Arial" font-size="20" fill="#333">
              Mock Circuit: ${content.name}
            </text>
          </svg>
        `;
        return new Blob([svgContent], { type: 'image/svg+xml' });
      
      default:
        throw new Error(`サポートされていない形式: ${format}`);
    }
  }

  async importFromFile(file: File): Promise<CircuitContent> {
    // テスト環境用の簡易実装
    let text: string;
    
    try {
      if (typeof file.text === 'function') {
        // 本番環境
        text = await file.text();
      } else {
        // テスト環境：FileReaderを使用
        text = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('ファイル読み込みエラー'));
          reader.readAsText(file);
        });
      }
    } catch (error) {
      throw new Error('ファイルの読み込みに失敗しました');
    }
    
    try {
      const content = JSON.parse(text) as CircuitContent;
      
      // 基本的な形式チェック
      if (!content.name || !Array.isArray(content.components) || !Array.isArray(content.connections)) {
        throw new Error('無効な回路ファイル形式です');
      }
      
      return content;
    } catch (error) {
      throw new Error('ファイルの読み込みに失敗しました');
    }
  }

  // === DataIntegrity実装 ===

  async validate(content: CircuitContent): Promise<ValidationResult> {
    const errors: any[] = [];
    const warnings: any[] = [];
    
    // 基本的な検証
    if (!content.name || content.name.trim() === '') {
      errors.push({
        type: 'DATA_CORRUPTION',
        message: '回路名が空です',
      });
    }
    
    // コンポーネントの検証
    const componentIds = new Set(content.components.map(c => c.id));
    
    content.connections.forEach(conn => {
      if (!componentIds.has(conn.from.componentId)) {
        errors.push({
          type: 'MISSING_COMPONENT',
          message: `存在しないコンポーネントからの接続: ${conn.from.componentId}`,
          connectionId: conn.id,
        });
      }
      
      if (!componentIds.has(conn.to.componentId)) {
        errors.push({
          type: 'MISSING_COMPONENT',
          message: `存在しないコンポーネントへの接続: ${conn.to.componentId}`,
          connectionId: conn.id,
        });
      }
    });
    
    // パフォーマンス警告
    if (content.components.length > 100) {
      warnings.push({
        type: 'PERFORMANCE_ISSUE',
        message: 'コンポーネント数が多すぎます',
        suggestion: '回路を分割することを検討してください',
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      canRepair: errors.some(e => e.type === 'MISSING_COMPONENT'),
    };
  }

  async repair(content: CircuitContent): Promise<CircuitContent> {
    const validation = await this.validate(content);
    if (validation.isValid) {
      return content;
    }
    
    const repairedContent = { ...content };
    const componentIds = new Set(content.components.map(c => c.id));
    
    // 存在しないコンポーネントへの接続を削除
    repairedContent.connections = content.connections.filter(conn => 
      componentIds.has(conn.from.componentId) && 
      componentIds.has(conn.to.componentId)
    );
    
    // 回路名が空の場合は適当な名前を付ける
    if (!repairedContent.name || repairedContent.name.trim() === '') {
      repairedContent.name = `修復された回路 ${new Date().toISOString()}`;
    }
    
    return repairedContent;
  }

  async createBackup(): Promise<void> {
    // モックでは何もしない（実際は全データをバックアップ）
    console.log('バックアップを作成しました（モック）');
  }

  async restoreFromBackup(): Promise<void> {
    // モックでは初期状態に戻す
    this.circuits.clear();
    this.shareUrls.clear();
    this.nextId = 1;
    this.addSampleCircuits();
    console.log('バックアップから復元しました（モック）');
  }

  // === CircuitStorage実装 ===

  async isAvailable(): Promise<boolean> {
    return this.available;
  }

  async getStorageInfo(): Promise<StorageInfo> {
    const circuits = Array.from(this.circuits.values());
    const totalSize = circuits.reduce((sum, circuit) => {
      return sum + JSON.stringify(circuit.content).length;
    }, 0);
    
    const createdDates = circuits.map(c => c.createdAt);
    
    return {
      totalCircuits: circuits.length,
      totalSize,
      availableSpace: 1024 * 1024 * 10, // 10MB (モック)
      oldestCircuit: createdDates.length > 0 ? new Date(Math.min(...createdDates.map(d => d.getTime()))) : undefined,
      newestCircuit: createdDates.length > 0 ? new Date(Math.max(...createdDates.map(d => d.getTime()))) : undefined,
    };
  }

  async clear(): Promise<void> {
    this.circuits.clear();
    this.shareUrls.clear();
    this.nextId = 1;
  }

  // === テスト用ヘルパーメソッド ===

  /**
   * ストレージを利用不可状態にする（エラーテスト用）
   */
  setUnavailable(): void {
    this.available = false;
  }

  /**
   * ストレージを利用可能状態に戻す
   */
  setAvailable(): void {
    this.available = true;
  }

  /**
   * 保存された回路の数を取得
   */
  getCircuitCount(): number {
    return this.circuits.size;
  }

  /**
   * 特定の名前の回路が存在するかチェック
   */
  hasCircuitNamed(name: string): boolean {
    return Array.from(this.circuits.values()).some(circuit => circuit.name === name);
  }

  /**
   * 共有URLの数を取得
   */
  getShareUrlCount(): number {
    return this.shareUrls.size;
  }
}
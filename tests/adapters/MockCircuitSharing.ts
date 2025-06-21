/**
 * MockCircuitSharing - 回路共有機能の理想実装
 * 
 * 実装技術（URL生成、JSON圧縮等）に依存しない、
 * 純粋な回路共有の仕様を実装します。
 */

import type { 
  CircuitSharing, 
  CircuitContent, 
  ShareUrl, 
  ShareResult 
} from '@/domain/ports/CircuitSharing';

export class MockCircuitSharing implements CircuitSharing {
  private shared = new Map<string, CircuitContent>();
  private urlCounter = 1;

  /**
   * 回路を共有用URLに変換
   */
  async share(circuit: CircuitContent): Promise<ShareResult> {
    try {
      // 入力検証
      if (!circuit || typeof circuit !== 'object') {
        return {
          success: false,
          error: 'Invalid circuit data',
        };
      }

      if (!circuit.name || !circuit.components || !circuit.connections) {
        return {
          success: false,
          error: 'Missing required circuit properties',
        };
      }

      const shareId = `share_${this.urlCounter++}`;
      const shareUrl = `https://example.com/share/${shareId}` as ShareUrl;
      
      // 回路データを保存（実際の実装では圧縮・暗号化等）
      this.shared.set(shareId, structuredClone(circuit));
      
      return {
        success: true,
        shareUrl,
        shareId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 共有URLから回路を復元
   */
  async load(shareUrl: ShareUrl): Promise<CircuitContent | null> {
    try {
      const shareId = this.extractShareId(shareUrl);
      const circuit = this.shared.get(shareId);
      
      if (!circuit) {
        return null;
      }
      
      // 新しいインスタンスを返す（参照を共有しない）
      return structuredClone(circuit);
    } catch (error) {
      return null;
    }
  }

  /**
   * 共有URLが有効かチェック
   */
  async isValidShareUrl(shareUrl: ShareUrl): Promise<boolean> {
    try {
      const shareId = this.extractShareId(shareUrl);
      return this.shared.has(shareId);
    } catch {
      return false;
    }
  }

  /**
   * 共有データの統計情報
   */
  async getShareStats(shareId: string): Promise<{
    accessCount: number;
    createdAt: Date;
    lastAccessed: Date;
  } | null> {
    if (!this.shared.has(shareId)) {
      return null;
    }
    
    // Mock統計情報
    return {
      accessCount: Math.floor(Math.random() * 100),
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      lastAccessed: new Date(),
    };
  }

  /**
   * テスト用ヘルパー: 共有状態をクリア
   */
  clearSharedCircuits(): void {
    this.shared.clear();
    this.urlCounter = 1;
  }

  /**
   * テスト用ヘルパー: 共有数を取得
   */
  getSharedCount(): number {
    return this.shared.size;
  }

  private extractShareId(shareUrl: ShareUrl): string {
    const match = shareUrl.match(/\/share\/(.+)$/);
    if (!match) {
      throw new Error('Invalid share URL format');
    }
    return match[1];
  }
}
/**
 * 回路共有機能のポートインターフェース
 *
 * 実装技術（URL生成、圧縮、暗号化等）に依存しない、
 * 純粋な回路共有の仕様を定義します。
 */

import type { CircuitContent } from './CircuitPersistence';
export type { CircuitContent } from './CircuitPersistence';

/**
 * 共有URL型（type-safe）
 */
export type ShareUrl = string & { readonly _brand: 'ShareUrl' };

/**
 * 共有結果
 */
export interface ShareResult {
  success: boolean;
  shareUrl?: ShareUrl;
  shareId?: string;
  error?: string;
}

/**
 * 回路共有サービスのインターフェース
 */
export interface CircuitSharing {
  /**
   * 回路を共有用URLに変換
   * @param circuit 共有する回路
   * @returns 共有URL生成結果
   */
  share(circuit: CircuitContent): Promise<ShareResult>;

  /**
   * 共有URLから回路を復元
   * @param shareUrl 共有URL
   * @returns 復元された回路（失敗時はnull）
   */
  load(shareUrl: ShareUrl): Promise<CircuitContent | null>;

  /**
   * 共有URLが有効かチェック
   * @param shareUrl チェック対象のURL
   * @returns 有効性
   */
  isValidShareUrl(shareUrl: ShareUrl): Promise<boolean>;

  /**
   * 共有データの統計情報取得
   * @param shareId 共有ID
   * @returns 統計情報（存在しない場合はnull）
   */
  getShareStats(shareId: string): Promise<{
    accessCount: number;
    createdAt: Date;
    lastAccessed: Date;
  } | null>;
}

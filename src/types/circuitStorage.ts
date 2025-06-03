import { Gate, Wire } from './circuit';

/**
 * 保存用の回路データ構造
 */
export interface SavedCircuit {
  /** 回路メタデータ */
  metadata: CircuitMetadata;
  /** 回路データ */
  circuit: CircuitData;
  /** フォーマットバージョン（将来の互換性のため） */
  version: string;
}

/**
 * 回路メタデータ
 */
export interface CircuitMetadata {
  /** 回路ID（UUID） */
  id: string;
  /** 回路名 */
  name: string;
  /** 説明（オプション） */
  description?: string;
  /** 作成日時 */
  createdAt: string; // ISO 8601 format
  /** 最終更新日時 */
  updatedAt: string; // ISO 8601 format
  /** 作成者（将来の拡張用） */
  author?: string;
  /** タグ（カテゴリ分け用） */
  tags?: string[];
  /** サムネイル画像（Base64エンコード、オプション） */
  thumbnail?: string;
  /** ゲート数の統計 */
  stats: {
    gateCount: number;
    wireCount: number;
    gateTypes: Record<string, number>;
  };
}

/**
 * 回路データ（実際のゲートとワイヤー情報）
 */
export interface CircuitData {
  /** ゲート一覧 */
  gates: Gate[];
  /** ワイヤー一覧 */
  wires: Wire[];
  /** 追加設定（将来の拡張用） */
  settings?: {
    /** 表示設定 */
    view?: {
      zoom: number;
      centerX: number;
      centerY: number;
    };
    /** シミュレーション設定 */
    simulation?: {
      clockFrequency: number;
      autoRun: boolean;
    };
  };
}

/**
 * 保存・読み込み用のフィルター・ソート設定
 */
export interface CircuitFilter {
  /** 名前で検索 */
  nameQuery?: string;
  /** タグでフィルター */
  tags?: string[];
  /** 作成日時でソート */
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'gateCount';
  /** ソート順 */
  sortOrder?: 'asc' | 'desc';
  /** 取得制限 */
  limit?: number;
  /** オフセット */
  offset?: number;
}

/**
 * 保存・読み込み操作の結果
 */
export interface CircuitStorageResult {
  success: boolean;
  message?: string;
  data?: any;
}

/**
 * エクスポート・インポート用の設定
 */
export interface ExportOptions {
  /** メタデータを含むかどうか */
  includeMetadata: boolean;
  /** サムネイルを含むかどうか */
  includeThumbnail: boolean;
  /** 圧縮するかどうか */
  compress: boolean;
}

/**
 * インポート時の設定
 */
export interface ImportOptions {
  /** 既存の回路を上書きするかどうか */
  overwriteExisting: boolean;
  /** 新しい名前を付けるかどうか */
  generateNewName: boolean;
  /** バリデーションを行うかどうか */
  validate: boolean;
}

// 定数定義
export const CIRCUIT_STORAGE_VERSION = '1.0.0';
export const MAX_CIRCUIT_NAME_LENGTH = 100;
export const MAX_DESCRIPTION_LENGTH = 500;
export const MAX_THUMBNAIL_SIZE = 1024 * 1024; // 1MB

// ヘルパー関数の型定義
export type CircuitValidator = (circuit: SavedCircuit) => boolean;
export type CircuitTransformer = (circuit: SavedCircuit) => SavedCircuit;
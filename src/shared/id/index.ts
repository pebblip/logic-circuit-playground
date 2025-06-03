/**
 * 統一ID生成システム
 * 
 * 複数箇所で重複していたID生成ロジックを統一し、
 * 一貫性と保守性を向上させるユーティリティ
 */

/**
 * ID生成に使用する設定
 */
interface IdConfig {
  prefix: string;
  length: number;
  separator: string;
}

/**
 * デフォルトのID設定
 */
const DEFAULT_CONFIG: IdConfig = {
  prefix: '',
  length: 12, // セキュリティを向上させるため9→12文字に増加
  separator: '-'
};

/**
 * 高品質なランダム文字列を生成
 * 
 * @param length - 生成する文字列の長さ
 * @returns ランダム文字列（英数字のみ）
 */
function generateRandomString(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  // crypto.getRandomValues()が利用可能な場合は使用（より安全）
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
  } else {
    // フォールバック: Math.random()を使用
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  
  return result;
}

/**
 * 基本ID生成関数
 * 
 * @param config - ID生成設定
 * @returns 一意なID文字列
 */
function generateId(config: Partial<IdConfig> = {}): string {
  const { prefix, length, separator } = { ...DEFAULT_CONFIG, ...config };
  
  const timestamp = Date.now();
  const randomPart = generateRandomString(length);
  
  // タイムスタンプと追加エントロピーで衝突回避を強化
  const entropy = Math.floor(Math.random() * 1000);
  
  if (prefix) {
    return `${prefix}${separator}${timestamp}${separator}${entropy}${separator}${randomPart}`;
  } else {
    return `${timestamp}${separator}${entropy}${separator}${randomPart}`;
  }
}

/**
 * 統一ID生成クラス
 * 各種エンティティ用の型安全なID生成を提供
 */
export class IdGenerator {
  /**
   * ゲートIDを生成
   * 
   * @returns gate-{timestamp}-{entropy}-{random} 形式のID
   * 
   * @example
   * ```typescript
   * const gateId = IdGenerator.generateGateId();
   * // => "gate-1704067200000-123-abc123def456"
   * ```
   */
  static generateGateId(): string {
    return generateId({ prefix: 'gate' });
  }

  /**
   * ワイヤーIDを生成
   * 
   * @returns wire-{timestamp}-{entropy}-{random} 形式のID
   * 
   * @example
   * ```typescript
   * const wireId = IdGenerator.generateWireId();
   * // => "wire-1704067200000-456-xyz789abc123"
   * ```
   */
  static generateWireId(): string {
    return generateId({ prefix: 'wire' });
  }

  /**
   * 回路IDを生成
   * 
   * @returns circuit-{timestamp}-{entropy}-{random} 形式のID
   * 
   * @example
   * ```typescript
   * const circuitId = IdGenerator.generateCircuitId();
   * // => "circuit-1704067200000-789-def456ghi789"
   * ```
   */
  static generateCircuitId(): string {
    return generateId({ prefix: 'circuit' });
  }

  /**
   * カスタムゲートIDを生成
   * 
   * @returns custom-{timestamp}-{entropy}-{random} 形式のID
   * 
   * @example
   * ```typescript
   * const customGateId = IdGenerator.generateCustomGateId();
   * // => "custom-1704067200000-321-ghi789jkl012"
   * ```
   */
  static generateCustomGateId(): string {
    return generateId({ prefix: 'custom' });
  }

  /**
   * カスタムプレフィックスでIDを生成
   * 
   * @param prefix - カスタムプレフィックス
   * @param options - 追加オプション
   * @returns 指定されたプレフィックス付きのID
   * 
   * @example
   * ```typescript
   * const sessionId = IdGenerator.generateCustomId('session');
   * // => "session-1704067200000-654-jkl012mno345"
   * ```
   */
  static generateCustomId(prefix: string, options: Partial<Omit<IdConfig, 'prefix'>> = {}): string {
    return generateId({ prefix, ...options });
  }

  /**
   * プレフィックスなしの汎用IDを生成
   * 
   * @param options - ID生成オプション
   * @returns タイムスタンプとランダム文字列のみのID
   * 
   * @example
   * ```typescript
   * const genericId = IdGenerator.generateGenericId();
   * // => "1704067200000-987-mno345pqr678"
   * ```
   */
  static generateGenericId(options: Partial<IdConfig> = {}): string {
    return generateId({ prefix: '', ...options });
  }
}

/**
 * レガシー互換性のためのヘルパー関数
 * 既存コードとの互換性を保つために提供
 */

/**
 * @deprecated IdGenerator.generateGateId() を使用してください
 */
export function generateGateId(): string {
  return IdGenerator.generateGateId();
}

/**
 * @deprecated IdGenerator.generateWireId() を使用してください
 */
export function generateWireId(): string {
  return IdGenerator.generateWireId();
}

/**
 * @deprecated IdGenerator.generateCircuitId() を使用してください
 */
export function generateCircuitId(): string {
  return IdGenerator.generateCircuitId();
}

/**
 * @deprecated IdGenerator.generateCustomGateId() を使用してください
 */
export function generateCustomGateId(): string {
  return IdGenerator.generateCustomGateId();
}

/**
 * IDの検証ユーティリティ
 */
export class IdValidator {
  /**
   * IDが有効な形式かどうかを検証
   * 
   * @param id - 検証するID
   * @param expectedPrefix - 期待されるプレフィックス（省略可）
   * @returns 有効な場合はtrue
   */
  static isValidId(id: string, expectedPrefix?: string): boolean {
    if (!id || typeof id !== 'string') {
      return false;
    }

    // 基本的な形式チェック（prefix-timestamp-entropy-random）
    const parts = id.split('-');
    if (parts.length < 3) {
      return false;
    }

    // プレフィックスチェック
    if (expectedPrefix && !id.startsWith(expectedPrefix + '-')) {
      return false;
    }

    return true;
  }

  /**
   * ゲートIDの検証
   */
  static isValidGateId(id: string): boolean {
    return this.isValidId(id, 'gate');
  }

  /**
   * ワイヤーIDの検証
   */
  static isValidWireId(id: string): boolean {
    return this.isValidId(id, 'wire');
  }

  /**
   * 回路IDの検証
   */
  static isValidCircuitId(id: string): boolean {
    return this.isValidId(id, 'circuit');
  }

  /**
   * カスタムゲートIDの検証
   */
  static isValidCustomGateId(id: string): boolean {
    return this.isValidId(id, 'custom');
  }
}
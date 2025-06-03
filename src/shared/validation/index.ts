/**
 * 統一バリデーションシステム
 *
 * 複数箇所で重複していたバリデーションロジックを統一し、
 * 一貫性と保守性を向上させるユーティリティ
 */

/**
 * バリデーション結果の型
 */
export interface ValidationResult {
  /** バリデーションが成功したかどうか */
  isValid: boolean;
  /** エラーメッセージ（バリデーション失敗時） */
  error?: string;
  /** 清浄化された値（成功時） */
  value?: any;
}

/**
 * バリデーション関数の型
 */
export type ValidationFunction<T = any> = (value: T) => ValidationResult;

/**
 * バリデーションルールの設定
 */
export interface ValidationRule {
  /** ルール名 */
  name: string;
  /** バリデーション関数 */
  validate: ValidationFunction;
  /** エラーメッセージ */
  message: string;
}

/**
 * 基本的なバリデーション関数群
 */
export class ValidationRules {
  /**
   * 必須入力のバリデーション
   *
   * @param fieldName - フィールド名（エラーメッセージ用）
   * @returns バリデーション関数
   */
  static required(fieldName: string = 'この項目'): ValidationFunction<string> {
    return (value: string): ValidationResult => {
      const trimmed = value?.trim() || '';
      if (!trimmed) {
        return {
          isValid: false,
          error: `${fieldName}を入力してください`,
        };
      }
      return {
        isValid: true,
        value: trimmed,
      };
    };
  }

  /**
   * 文字数制限のバリデーション
   *
   * @param min - 最小文字数
   * @param max - 最大文字数
   * @param fieldName - フィールド名（エラーメッセージ用）
   * @returns バリデーション関数
   */
  static length(
    min: number = 0,
    max: number = Infinity,
    fieldName: string = 'この項目'
  ): ValidationFunction<string> {
    return (value: string): ValidationResult => {
      const trimmed = value?.trim() || '';
      const length = trimmed.length;

      if (length < min) {
        return {
          isValid: false,
          error: `${fieldName}は${min}文字以上で入力してください`,
        };
      }

      if (length > max) {
        return {
          isValid: false,
          error: `${fieldName}は${max}文字以内で入力してください`,
        };
      }

      return {
        isValid: true,
        value: trimmed,
      };
    };
  }

  /**
   * 回路名のバリデーション
   * 統一された回路名の検証ルール
   */
  static circuitName(): ValidationFunction<string> {
    return (value: string): ValidationResult => {
      const trimmed = value?.trim() || '';

      // 必須チェック
      if (!trimmed) {
        return {
          isValid: false,
          error: '回路名を入力してください',
        };
      }

      // 文字数チェック（1-100文字）
      if (trimmed.length > 100) {
        return {
          isValid: false,
          error: '回路名は100文字以内で入力してください',
        };
      }

      // 特殊文字チェック（基本的な記号は許可）
      // eslint-disable-next-line no-control-regex
      const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
      if (invalidChars.test(trimmed)) {
        return {
          isValid: false,
          error: '回路名に使用できない文字が含まれています',
        };
      }

      return {
        isValid: true,
        value: trimmed,
      };
    };
  }

  /**
   * ゲート名のバリデーション（カスタムゲート用）
   * 統一されたゲート名の検証ルール
   */
  static gateName(): ValidationFunction<string> {
    return (value: string): ValidationResult => {
      const trimmed = value?.trim() || '';

      // 必須チェック
      if (!trimmed) {
        return {
          isValid: false,
          error: 'ゲート名を入力してください',
        };
      }

      // 文字数チェック（1-50文字）
      if (trimmed.length > 50) {
        return {
          isValid: false,
          error: 'ゲート名は50文字以内で入力してください',
        };
      }

      // 英数字とアンダースコアのみ許可（プログラム識別子として使用）
      const validPattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
      if (!validPattern.test(trimmed)) {
        return {
          isValid: false,
          error:
            'ゲート名は英字で始まり、英数字とアンダースコアのみ使用できます',
        };
      }

      return {
        isValid: true,
        value: trimmed,
      };
    };
  }

  /**
   * 表示名のバリデーション（カスタムゲート用）
   */
  static displayName(): ValidationFunction<string> {
    return (value: string): ValidationResult => {
      const trimmed = value?.trim() || '';

      // 必須チェック
      if (!trimmed) {
        return {
          isValid: false,
          error: '表示名を入力してください',
        };
      }

      // 文字数チェック（1-30文字）
      if (trimmed.length > 30) {
        return {
          isValid: false,
          error: '表示名は30文字以内で入力してください',
        };
      }

      return {
        isValid: true,
        value: trimmed,
      };
    };
  }

  /**
   * 説明文のバリデーション
   */
  static description(): ValidationFunction<string> {
    return (value: string): ValidationResult => {
      const trimmed = value?.trim() || '';

      // 最大文字数チェック（500文字）
      if (trimmed.length > 500) {
        return {
          isValid: false,
          error: '説明は500文字以内で入力してください',
        };
      }

      return {
        isValid: true,
        value: trimmed,
      };
    };
  }

  /**
   * タグのバリデーション
   */
  static tag(): ValidationFunction<string> {
    return (value: string): ValidationResult => {
      const trimmed = value?.trim() || '';

      if (!trimmed) {
        return {
          isValid: false,
          error: 'タグを入力してください',
        };
      }

      // 文字数チェック（1-20文字）
      if (trimmed.length > 20) {
        return {
          isValid: false,
          error: 'タグは20文字以内で入力してください',
        };
      }

      // スペースやカンマは使用不可
      if (/[\s,]/.test(trimmed)) {
        return {
          isValid: false,
          error: 'タグにスペースやカンマは使用できません',
        };
      }

      return {
        isValid: true,
        value: trimmed,
      };
    };
  }

  /**
   * ファイル名のバリデーション
   */
  static fileName(
    allowedExtensions: string[] = []
  ): ValidationFunction<string> {
    return (value: string): ValidationResult => {
      const trimmed = value?.trim() || '';

      if (!trimmed) {
        return {
          isValid: false,
          error: 'ファイル名を入力してください',
        };
      }

      // 拡張子チェック
      if (allowedExtensions.length > 0) {
        const hasValidExtension = allowedExtensions.some(ext =>
          trimmed.toLowerCase().endsWith(ext.toLowerCase())
        );

        if (!hasValidExtension) {
          return {
            isValid: false,
            error: `ファイル形式は ${allowedExtensions.join(', ')} のみサポートしています`,
          };
        }
      }

      // OSで使用できない文字のチェック
      // eslint-disable-next-line no-control-regex
      const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
      if (invalidChars.test(trimmed)) {
        return {
          isValid: false,
          error: 'ファイル名に使用できない文字が含まれています',
        };
      }

      return {
        isValid: true,
        value: trimmed,
      };
    };
  }

  /**
   * 数値のバリデーション
   */
  static number(
    min: number = -Infinity,
    max: number = Infinity
  ): ValidationFunction<string | number> {
    return (value: string | number): ValidationResult => {
      const num = typeof value === 'string' ? parseFloat(value) : value;

      if (isNaN(num)) {
        return {
          isValid: false,
          error: '数値を入力してください',
        };
      }

      if (num < min) {
        return {
          isValid: false,
          error: `${min}以上の値を入力してください`,
        };
      }

      if (num > max) {
        return {
          isValid: false,
          error: `${max}以下の値を入力してください`,
        };
      }

      return {
        isValid: true,
        value: num,
      };
    };
  }

  /**
   * 周波数のバリデーション（CLOCK ゲート用）
   */
  static frequency(): ValidationFunction<string | number> {
    return (value: string | number): ValidationResult => {
      const num = typeof value === 'string' ? parseFloat(value) : value;

      if (isNaN(num)) {
        return {
          isValid: false,
          error: '周波数を数値で入力してください',
        };
      }

      if (num <= 0) {
        return {
          isValid: false,
          error: '周波数は正の数値を入力してください',
        };
      }

      if (num > 100) {
        return {
          isValid: false,
          error: '周波数は100Hz以下で入力してください',
        };
      }

      return {
        isValid: true,
        value: num,
      };
    };
  }
}

/**
 * 複数のバリデーションを組み合わせる
 */
export function combineValidations<T>(
  ...validators: ValidationFunction<T>[]
): ValidationFunction<T> {
  return (value: T): ValidationResult => {
    for (const validator of validators) {
      const result = validator(value);
      if (!result.isValid) {
        return result;
      }
      // 次のバリデーションには清浄化された値を渡す
      value = result.value ?? value;
    }
    return {
      isValid: true,
      value,
    };
  };
}

/**
 * フォーム全体のバリデーション
 */
export class FormValidator {
  private fields: Record<string, ValidationFunction> = {};
  private values: Record<string, any> = {};
  private errors: Record<string, string> = {};

  /**
   * フィールドのバリデーションルールを追加
   */
  addField(name: string, validator: ValidationFunction): this {
    this.fields[name] = validator;
    return this;
  }

  /**
   * 値を設定
   */
  setValue(name: string, value: any): this {
    this.values[name] = value;
    return this;
  }

  /**
   * 複数の値を設定
   */
  setValues(values: Record<string, any>): this {
    this.values = { ...this.values, ...values };
    return this;
  }

  /**
   * 単一フィールドのバリデーション
   */
  validateField(name: string): ValidationResult {
    const validator = this.fields[name];
    const value = this.values[name];

    if (!validator) {
      return { isValid: true, value };
    }

    const result = validator(value);

    if (result.isValid) {
      delete this.errors[name];
      this.values[name] = result.value;
    } else {
      this.errors[name] = result.error || 'バリデーションエラー';
    }

    return result;
  }

  /**
   * 全フィールドのバリデーション
   */
  validateAll(): {
    isValid: boolean;
    errors: Record<string, string>;
    values: Record<string, any>;
  } {
    this.errors = {};

    for (const fieldName of Object.keys(this.fields)) {
      this.validateField(fieldName);
    }

    return {
      isValid: Object.keys(this.errors).length === 0,
      errors: { ...this.errors },
      values: { ...this.values },
    };
  }

  /**
   * エラーメッセージを取得
   */
  getError(name: string): string | undefined {
    return this.errors[name];
  }

  /**
   * 全エラーメッセージを取得
   */
  getAllErrors(): Record<string, string> {
    return { ...this.errors };
  }

  /**
   * バリデーション済みの値を取得
   */
  getValue(name: string): any {
    return this.values[name];
  }

  /**
   * 全ての値を取得
   */
  getValues(): Record<string, any> {
    return { ...this.values };
  }

  /**
   * エラーをクリア
   */
  clearErrors(): this {
    this.errors = {};
    return this;
  }

  /**
   * 特定フィールドのエラーをクリア
   */
  clearError(name: string): this {
    delete this.errors[name];
    return this;
  }
}

/**
 * 便利なヘルパー関数
 */

/**
 * 単一値の即座なバリデーション
 */
export function validate<T>(
  value: T,
  validator: ValidationFunction<T>
): ValidationResult {
  return validator(value);
}

/**
 * 回路名の即座なバリデーション
 */
export function validateCircuitName(name: string): ValidationResult {
  return ValidationRules.circuitName()(name);
}

/**
 * ゲート名の即座なバリデーション
 */
export function validateGateName(name: string): ValidationResult {
  return ValidationRules.gateName()(name);
}

/**
 * ファイル名の即座なバリデーション（JSON ファイル）
 */
export function validateJsonFileName(fileName: string): ValidationResult {
  return ValidationRules.fileName(['.json'])(fileName);
}

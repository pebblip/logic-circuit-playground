import type { CustomGateDefinition } from '@/types/circuit';
import { debug } from '@/shared/debug';

const STORAGE_KEY = 'logic-circuit-playground-custom-gates';
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB limit

/**
 * カスタムゲート定義の検証
 */
export function validateCustomGate(
  gate: unknown
): gate is CustomGateDefinition {
  if (typeof gate !== 'object' || gate === null) {
    return false;
  }

  const g = gate as Record<string, unknown>;

  return (
    typeof g.id === 'string' &&
    typeof g.name === 'string' &&
    typeof g.displayName === 'string' &&
    Array.isArray(g.inputs) &&
    Array.isArray(g.outputs) &&
    typeof g.width === 'number' &&
    typeof g.height === 'number' &&
    typeof g.createdAt === 'number' &&
    typeof g.updatedAt === 'number'
  );
}

/**
 * 循環参照を検出
 */
function hasCircularReference(obj: unknown, seen = new WeakSet()): boolean {
  if (obj === null || typeof obj !== 'object') {
    return false;
  }

  if (seen.has(obj)) {
    return true;
  }

  seen.add(obj);

  const objRecord = obj as Record<string, unknown>;
  for (const key in objRecord) {
    if (
      Object.prototype.hasOwnProperty.call(objRecord, key) &&
      hasCircularReference(objRecord[key], seen)
    ) {
      return true;
    }
  }

  return false;
}

/**
 * 重複IDを除去
 */
export function removeDuplicateIds(
  customGates: CustomGateDefinition[]
): CustomGateDefinition[] {
  const seen = new Set<string>();
  return customGates.filter(gate => {
    if (seen.has(gate.id)) {
      console.warn(`⚠️ 重複ID検出: ${gate.id}`);
      return false;
    }
    seen.add(gate.id);
    return true;
  });
}

/**
 * ストレージサイズを推定
 */
function estimateStorageSize(data: unknown): number {
  try {
    return new Blob([JSON.stringify(data)]).size;
  } catch {
    return 0;
  }
}

/**
 * カスタムゲートをlocalStorageに保存（拡張版）
 */
export function saveCustomGatesEnhanced(
  customGates: CustomGateDefinition[],
  options: {
    validate?: boolean;
    removeDuplicates?: boolean;
    checkSize?: boolean;
  } = {}
): { success: boolean; error?: string } {
  const {
    validate = true,
    removeDuplicates = true,
    checkSize = true,
  } = options;

  try {
    // localStorage が利用可能かチェック
    if (typeof localStorage === 'undefined') {
      throw new Error('localStorage is not available');
    }

    let gatesToSave = customGates;

    // 検証
    if (validate) {
      const invalidGates = gatesToSave.filter(
        gate => !validateCustomGate(gate)
      );
      if (invalidGates.length > 0) {
        console.warn(
          `⚠️ ${invalidGates.length}個の無効なゲート定義をスキップしました`
        );
        gatesToSave = gatesToSave.filter(validateCustomGate);
      }
    }

    // 重複ID除去
    if (removeDuplicates) {
      gatesToSave = removeDuplicateIds(gatesToSave);
    }

    // 循環参照チェック
    for (const gate of gatesToSave) {
      if (hasCircularReference(gate)) {
        throw new Error(`ゲート ${gate.id} に循環参照が含まれています`);
      }
    }

    // サイズチェック
    if (checkSize) {
      const size = estimateStorageSize(gatesToSave);
      if (size > MAX_STORAGE_SIZE) {
        throw new Error(
          `データサイズが制限を超えています: ${(size / 1024 / 1024).toFixed(2)}MB`
        );
      }
    }

    const json = JSON.stringify(gatesToSave);
    localStorage.setItem(STORAGE_KEY, json);
    debug.log(`✅ ${gatesToSave.length}個のカスタムゲートを保存しました`);

    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ カスタムゲートの保存に失敗:', error);
    return { success: false, error: errorMessage };
  }
}

/**
 * カスタムゲートをlocalStorageから読み込み（拡張版）
 */
export function loadCustomGatesEnhanced(
  options: {
    validate?: boolean;
    removeDuplicates?: boolean;
    fallbackToPartial?: boolean;
  } = {}
): {
  gates: CustomGateDefinition[];
  errors: string[];
} {
  const {
    validate = true,
    removeDuplicates = true,
    fallbackToPartial = true,
  } = options;
  const errors: string[] = [];

  try {
    // localStorage が利用可能かチェック
    if (typeof localStorage === 'undefined') {
      throw new Error('localStorage is not available');
    }

    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) {
      debug.log('💡 保存されたカスタムゲートはありません');
      return { gates: [], errors: [] };
    }

    const parsed = JSON.parse(json);
    let customGates: unknown[];

    // 配列でない場合の処理
    if (!Array.isArray(parsed)) {
      if (fallbackToPartial && typeof parsed === 'object') {
        customGates = [parsed];
        errors.push('データが配列形式ではありませんでした');
      } else {
        throw new Error('Invalid data format');
      }
    } else {
      customGates = parsed;
    }

    // null/undefined を除去
    const nonNullGates = customGates.filter(
      (gate): gate is CustomGateDefinition => gate != null
    );

    let finalGates = nonNullGates;

    // 検証
    if (validate) {
      const validGates = finalGates.filter(validateCustomGate);
      const invalidCount = finalGates.length - validGates.length;
      if (invalidCount > 0) {
        errors.push(`${invalidCount}個の無効なゲート定義をスキップしました`);
        finalGates = validGates;
      }
    }

    // 重複ID除去
    if (removeDuplicates) {
      const beforeCount = finalGates.length;
      finalGates = removeDuplicateIds(finalGates);
      const removedCount = beforeCount - finalGates.length;
      if (removedCount > 0) {
        errors.push(`${removedCount}個の重複IDを除去しました`);
      }
    }

    debug.log(`✅ ${finalGates.length}個のカスタムゲートを読み込みました`);
    if (errors.length > 0) {
      console.warn('⚠️ 読み込み時の警告:', errors);
    }

    return { gates: finalGates, errors };
  } catch (error) {
    console.error('❌ カスタムゲートの読み込みに失敗:', error);
    errors.push(error instanceof Error ? error.message : 'Unknown error');
    return { gates: [], errors };
  }
}

/**
 * カスタムゲートのエクスポート
 */
export function exportCustomGates(customGates: CustomGateDefinition[]): string {
  return JSON.stringify(customGates, null, 2);
}

/**
 * カスタムゲートのインポート
 */
export function importCustomGates(
  jsonString: string,
  options: {
    merge?: boolean;
    validate?: boolean;
  } = {}
): { gates: CustomGateDefinition[]; errors: string[] } {
  const { merge = false, validate = true } = options;
  const errors: string[] = [];

  try {
    const imported = JSON.parse(jsonString);

    if (!Array.isArray(imported)) {
      throw new Error('インポートデータは配列形式である必要があります');
    }

    let gates = imported;

    if (validate) {
      gates = imported.filter(validateCustomGate);
      const invalidCount = imported.length - gates.length;
      if (invalidCount > 0) {
        errors.push(`${invalidCount}個の無効なゲート定義をスキップしました`);
      }
    }

    if (merge) {
      const existing = loadCustomGatesEnhanced({ validate }).gates;
      const existingIds = new Set(existing.map(g => g.id));

      // 既存のIDと重複するものは新しいIDを生成
      gates = gates.map(gate => {
        if (existingIds.has(gate.id)) {
          const newId = `${gate.id}_imported_${Date.now()}`;
          errors.push(`ID ${gate.id} が重複したため ${newId} に変更しました`);
          return { ...gate, id: newId };
        }
        return gate;
      });

      gates = [...existing, ...gates];
    }

    return { gates, errors };
  } catch (error) {
    console.error('❌ インポートに失敗:', error);
    errors.push(error instanceof Error ? error.message : 'Unknown error');
    return { gates: [], errors };
  }
}

/**
 * 古い形式からの移行
 */
export function migrateOldFormat(
  oldData: unknown
): CustomGateDefinition | null {
  try {
    if (typeof oldData !== 'object' || oldData === null) {
      return null;
    }

    const data = oldData as Record<string, unknown>;

    // 最低限必要なフィールドがあるかチェック
    if (!data.id || !data.name) {
      return null;
    }

    // 新しい形式に変換
    const migrated: CustomGateDefinition = {
      id: String(data.id),
      name: String(data.name),
      displayName: String(data.displayName || data.name),
      description: String(data.description || ''),
      inputs: Array.isArray(data.inputs) ? data.inputs : [],
      outputs: Array.isArray(data.outputs)
        ? data.outputs
        : data.output
          ? [{ name: 'Q', index: 0 }]
          : [],
      truthTable: data.truthTable as Record<string, string> | undefined,
      internalCircuit:
        data.internalCircuit as CustomGateDefinition['internalCircuit'],
      analysis: data.analysis as CustomGateDefinition['analysis'],
      icon: data.icon ? String(data.icon) : undefined,
      category: data.category ? String(data.category) : undefined,
      width: typeof data.width === 'number' ? data.width : 80,
      height: typeof data.height === 'number' ? data.height : 60,
      createdAt:
        typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
      updatedAt:
        typeof data.updatedAt === 'number' ? data.updatedAt : Date.now(),
    };

    return validateCustomGate(migrated) ? migrated : null;
  } catch {
    return null;
  }
}

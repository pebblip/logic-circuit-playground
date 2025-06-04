import type { CustomGateDefinition } from '@/types/circuit';

const STORAGE_KEY = 'logic-circuit-playground-custom-gates';
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB limit

/**
 * カスタムゲート定義の検証
 */
export function validateCustomGate(gate: any): gate is CustomGateDefinition {
  return (
    typeof gate === 'object' &&
    gate !== null &&
    typeof gate.id === 'string' &&
    typeof gate.name === 'string' &&
    typeof gate.displayName === 'string' &&
    Array.isArray(gate.inputs) &&
    Array.isArray(gate.outputs) &&
    typeof gate.width === 'number' &&
    typeof gate.height === 'number' &&
    typeof gate.createdAt === 'number' &&
    typeof gate.updatedAt === 'number'
  );
}

/**
 * 循環参照を検出
 */
function hasCircularReference(obj: any, seen = new WeakSet()): boolean {
  if (obj === null || typeof obj !== 'object') {
    return false;
  }

  if (seen.has(obj)) {
    return true;
  }

  seen.add(obj);

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && hasCircularReference(obj[key], seen)) {
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
function estimateStorageSize(data: any): number {
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
    console.log(`✅ ${gatesToSave.length}個のカスタムゲートを保存しました`);

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
      console.log('💡 保存されたカスタムゲートはありません');
      return { gates: [], errors: [] };
    }

    let customGates = JSON.parse(json);

    // 配列でない場合の処理
    if (!Array.isArray(customGates)) {
      if (fallbackToPartial && typeof customGates === 'object') {
        customGates = [customGates];
        errors.push('データが配列形式ではありませんでした');
      } else {
        throw new Error('Invalid data format');
      }
    }

    // null/undefined を除去
    customGates = customGates.filter(gate => gate != null);

    // 検証
    if (validate) {
      const validGates = customGates.filter(validateCustomGate);
      const invalidCount = customGates.length - validGates.length;
      if (invalidCount > 0) {
        errors.push(`${invalidCount}個の無効なゲート定義をスキップしました`);
        customGates = validGates;
      }
    }

    // 重複ID除去
    if (removeDuplicates) {
      const beforeCount = customGates.length;
      customGates = removeDuplicateIds(customGates);
      const removedCount = beforeCount - customGates.length;
      if (removedCount > 0) {
        errors.push(`${removedCount}個の重複IDを除去しました`);
      }
    }

    console.log(`✅ ${customGates.length}個のカスタムゲートを読み込みました`);
    if (errors.length > 0) {
      console.warn('⚠️ 読み込み時の警告:', errors);
    }

    return { gates: customGates, errors };
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
export function migrateOldFormat(oldData: any): CustomGateDefinition | null {
  try {
    // 最低限必要なフィールドがあるかチェック
    if (!oldData.id || !oldData.name) {
      return null;
    }

    // 新しい形式に変換
    const migrated: CustomGateDefinition = {
      id: oldData.id,
      name: oldData.name,
      displayName: oldData.displayName || oldData.name,
      description: oldData.description || '',
      inputs: oldData.inputs || [],
      outputs:
        oldData.outputs || (oldData.output ? [{ name: 'Q', index: 0 }] : []),
      truthTable: oldData.truthTable,
      internalCircuit: oldData.internalCircuit,
      analysis: oldData.analysis,
      icon: oldData.icon,
      category: oldData.category,
      width: oldData.width || 80,
      height: oldData.height || 60,
      createdAt: oldData.createdAt || Date.now(),
      updatedAt: oldData.updatedAt || Date.now(),
    };

    return validateCustomGate(migrated) ? migrated : null;
  } catch {
    return null;
  }
}

import { CustomGateDefinition } from '@/types/circuit';

const STORAGE_KEY = 'logic-circuit-playground-custom-gates';

/**
 * カスタムゲートをlocalStorageに保存
 */
export function saveCustomGates(customGates: CustomGateDefinition[]): void {
  try {
    const json = JSON.stringify(customGates);
    localStorage.setItem(STORAGE_KEY, json);
  } catch (error) {
    console.error('❌ カスタムゲートの保存に失敗:', error);
  }
}

/**
 * カスタムゲートをlocalStorageから読み込み
 */
export function loadCustomGates(): CustomGateDefinition[] {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) {
      return [];
    }
    
    const customGates = JSON.parse(json) as CustomGateDefinition[];
    return customGates;
  } catch (error) {
    console.error('❌ カスタムゲートの読み込みに失敗:', error);
    return [];
  }
}

/**
 * カスタムゲートをlocalStorageから削除
 */
export function clearCustomGates(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('❌ カスタムゲートの削除に失敗:', error);
  }
}
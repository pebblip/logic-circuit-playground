import type { CustomGateDefinition } from '@/types/circuit';

const STORAGE_KEY = 'logic-circuit-playground-custom-gates';

/**
 * カスタムゲートをlocalStorageに保存
 */
export function saveCustomGates(customGates: CustomGateDefinition[]): void {
  try {
    const json = JSON.stringify(customGates);
    localStorage.setItem(STORAGE_KEY, json);
    console.log(`✅ ${customGates.length}個のカスタムゲートを保存しました`);
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
      console.log('💡 保存されたカスタムゲートはありません');
      return [];
    }

    const customGates = JSON.parse(json) as CustomGateDefinition[];
    console.log(`✅ ${customGates.length}個のカスタムゲートを読み込みました`);
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

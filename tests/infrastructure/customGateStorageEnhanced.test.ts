import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  validateCustomGate,
  removeDuplicateIds,
  saveCustomGatesEnhanced,
  loadCustomGatesEnhanced,
  exportCustomGates,
  importCustomGates,
  migrateOldFormat,
} from '@infrastructure/storage/customGateStorageEnhanced';
import { CustomGateDefinition } from '../types/circuit';

// localStorage のモック
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
  };
})();

// console メソッドのモック
const consoleMock = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
};

describe('customGateStorageEnhanced', () => {
  beforeEach(() => {
    // localStorage モックの設定
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    
    // console モックの設定
    vi.spyOn(console, 'log').mockImplementation(consoleMock.log);
    vi.spyOn(console, 'error').mockImplementation(consoleMock.error);
    vi.spyOn(console, 'warn').mockImplementation(consoleMock.warn);
    
    // モックのリセット
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // テスト用のカスタムゲート定義
  const createTestCustomGate = (id: string, name: string): CustomGateDefinition => ({
    id,
    name,
    displayName: name,
    description: `Test ${name} gate`,
    inputs: [
      { name: 'A', index: 0 },
      { name: 'B', index: 1 },
    ],
    outputs: [
      { name: 'Q', index: 0 },
    ],
    truthTable: {
      '00': '0',
      '01': '0',
      '10': '0',
      '11': '1',
    },
    width: 80,
    height: 60,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  describe('validateCustomGate', () => {
    it('有効なカスタムゲートを検証できる', () => {
      const gate = createTestCustomGate('test', 'TestGate');
      expect(validateCustomGate(gate)).toBe(true);
    });

    it('必須フィールドが欠けているゲートを無効と判定', () => {
      const invalidGates = [
        { id: 'test' }, // name等が欠けている
        { name: 'test' }, // idが欠けている
        { id: 'test', name: 'test' }, // inputs/outputs等が欠けている
        null,
        undefined,
        'not an object',
        123,
      ];

      invalidGates.forEach(gate => {
        expect(validateCustomGate(gate)).toBe(false);
      });
    });

    it('フィールドの型が間違っているゲートを無効と判定', () => {
      const gate = createTestCustomGate('test', 'TestGate');
      const invalidGate = {
        ...gate,
        inputs: 'not an array', // 配列でなければならない
      };
      expect(validateCustomGate(invalidGate)).toBe(false);
    });
  });

  describe('removeDuplicateIds', () => {
    it('重複IDを持つゲートを除去', () => {
      const gates = [
        createTestCustomGate('id1', 'Gate1'),
        createTestCustomGate('id2', 'Gate2'),
        createTestCustomGate('id1', 'Gate3'), // 重複
        createTestCustomGate('id3', 'Gate4'),
        createTestCustomGate('id2', 'Gate5'), // 重複
      ];

      const result = removeDuplicateIds(gates);
      
      expect(result).toHaveLength(3);
      expect(result.map(g => g.id)).toEqual(['id1', 'id2', 'id3']);
      expect(consoleMock.warn).toHaveBeenCalledTimes(2);
    });

    it('重複がない場合はそのまま返す', () => {
      const gates = [
        createTestCustomGate('id1', 'Gate1'),
        createTestCustomGate('id2', 'Gate2'),
        createTestCustomGate('id3', 'Gate3'),
      ];

      const result = removeDuplicateIds(gates);
      
      expect(result).toEqual(gates);
      expect(consoleMock.warn).not.toHaveBeenCalled();
    });
  });

  describe('saveCustomGatesEnhanced', () => {
    it('有効なカスタムゲートを保存', () => {
      const gates = [
        createTestCustomGate('id1', 'Gate1'),
        createTestCustomGate('id2', 'Gate2'),
      ];

      const result = saveCustomGatesEnhanced(gates);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(localStorageMock.setItem).toHaveBeenCalled();
      expect(consoleMock.log).toHaveBeenCalledWith('✅ 2個のカスタムゲートを保存しました');
    });

    it('無効なゲートをスキップして保存', () => {
      const gates = [
        createTestCustomGate('id1', 'Gate1'),
        { invalid: 'gate' } as any,
        createTestCustomGate('id2', 'Gate2'),
      ];

      const result = saveCustomGatesEnhanced(gates);

      expect(result.success).toBe(true);
      expect(consoleMock.warn).toHaveBeenCalledWith('⚠️ 1個の無効なゲート定義をスキップしました');
      expect(consoleMock.log).toHaveBeenCalledWith('✅ 2個のカスタムゲートを保存しました');
    });

    it('重複IDを除去して保存', () => {
      const gates = [
        createTestCustomGate('id1', 'Gate1'),
        createTestCustomGate('id1', 'Gate2'), // 重複
        createTestCustomGate('id2', 'Gate3'),
      ];

      const result = saveCustomGatesEnhanced(gates);

      expect(result.success).toBe(true);
      expect(consoleMock.warn).toHaveBeenCalledWith('⚠️ 重複ID検出: id1');
      expect(consoleMock.log).toHaveBeenCalledWith('✅ 2個のカスタムゲートを保存しました');
    });

    it('循環参照を検出してエラーを返す', () => {
      const gate = createTestCustomGate('circular', 'CircularGate');
      (gate as any).self = gate; // 循環参照

      const result = saveCustomGatesEnhanced([gate]);

      expect(result.success).toBe(false);
      expect(result.error).toContain('循環参照');
    });

    it('サイズ制限を超えた場合エラーを返す', () => {
      const hugeGate = createTestCustomGate('huge', 'HugeGate');
      hugeGate.description = 'x'.repeat(6 * 1024 * 1024); // 6MB

      const result = saveCustomGatesEnhanced([hugeGate], { checkSize: true });

      expect(result.success).toBe(false);
      expect(result.error).toContain('データサイズが制限を超えています');
    });

    it('オプションで検証をスキップ', () => {
      const invalidGate = { invalid: 'gate' } as any;

      const result = saveCustomGatesEnhanced([invalidGate], { validate: false });

      expect(result.success).toBe(true);
      expect(consoleMock.warn).not.toHaveBeenCalled();
    });

    it('localStorageが利用できない場合エラーを返す', () => {
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true,
      });

      const result = saveCustomGatesEnhanced([createTestCustomGate('id1', 'Gate1')]);

      expect(result.success).toBe(false);
      expect(result.error).toContain('localStorage is not available');
    });
  });

  describe('loadCustomGatesEnhanced', () => {
    it('保存されたカスタムゲートを読み込み', () => {
      const gates = [
        createTestCustomGate('id1', 'Gate1'),
        createTestCustomGate('id2', 'Gate2'),
      ];
      localStorageMock.setItem(
        'logic-circuit-playground-custom-gates',
        JSON.stringify(gates)
      );

      const result = loadCustomGatesEnhanced();

      expect(result.gates).toEqual(gates);
      expect(result.errors).toEqual([]);
      expect(consoleMock.log).toHaveBeenCalledWith('✅ 2個のカスタムゲートを読み込みました');
    });

    it('無効なゲートをスキップして読み込み', () => {
      const data = [
        createTestCustomGate('id1', 'Gate1'),
        { invalid: 'gate' },
        null,
        undefined,
        createTestCustomGate('id2', 'Gate2'),
      ];
      localStorageMock.setItem(
        'logic-circuit-playground-custom-gates',
        JSON.stringify(data)
      );

      const result = loadCustomGatesEnhanced();

      expect(result.gates).toHaveLength(2);
      expect(result.errors).toContain('1個の無効なゲート定義をスキップしました');
    });

    it('配列でないデータを配列に変換', () => {
      const singleGate = createTestCustomGate('id1', 'Gate1');
      localStorageMock.setItem(
        'logic-circuit-playground-custom-gates',
        JSON.stringify(singleGate)
      );

      const result = loadCustomGatesEnhanced({ fallbackToPartial: true });

      expect(result.gates).toHaveLength(1);
      expect(result.gates[0]).toEqual(singleGate);
      expect(result.errors).toContain('データが配列形式ではありませんでした');
    });

    it('壊れたJSONデータの場合エラーを返す', () => {
      localStorageMock.setItem(
        'logic-circuit-playground-custom-gates',
        '{invalid json'
      );

      const result = loadCustomGatesEnhanced();

      expect(result.gates).toEqual([]);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('データが存在しない場合空の結果を返す', () => {
      const result = loadCustomGatesEnhanced();

      expect(result.gates).toEqual([]);
      expect(result.errors).toEqual([]);
      expect(consoleMock.log).toHaveBeenCalledWith('💡 保存されたカスタムゲートはありません');
    });
  });

  describe('exportCustomGates', () => {
    it('カスタムゲートをJSON文字列としてエクスポート', () => {
      const gates = [
        createTestCustomGate('id1', 'Gate1'),
        createTestCustomGate('id2', 'Gate2'),
      ];

      const exported = exportCustomGates(gates);
      const parsed = JSON.parse(exported);

      expect(parsed).toEqual(gates);
      expect(exported).toContain('\n'); // 整形されている
    });
  });

  describe('importCustomGates', () => {
    it('JSON文字列からカスタムゲートをインポート', () => {
      const gates = [
        createTestCustomGate('id1', 'Gate1'),
        createTestCustomGate('id2', 'Gate2'),
      ];
      const jsonString = JSON.stringify(gates);

      const result = importCustomGates(jsonString);

      expect(result.gates).toEqual(gates);
      expect(result.errors).toEqual([]);
    });

    it('無効なゲートをスキップしてインポート', () => {
      const data = [
        createTestCustomGate('id1', 'Gate1'),
        { invalid: 'gate' },
        createTestCustomGate('id2', 'Gate2'),
      ];
      const jsonString = JSON.stringify(data);

      const result = importCustomGates(jsonString);

      expect(result.gates).toHaveLength(2);
      expect(result.errors).toContain('1個の無効なゲート定義をスキップしました');
    });

    it('既存のゲートとマージ', () => {
      // 既存のゲートを設定
      const existing = [createTestCustomGate('existing1', 'ExistingGate')];
      localStorageMock.setItem(
        'logic-circuit-playground-custom-gates',
        JSON.stringify(existing)
      );

      // インポートするゲート
      const toImport = [
        createTestCustomGate('new1', 'NewGate1'),
        createTestCustomGate('existing1', 'ConflictGate'), // ID重複
      ];
      const jsonString = JSON.stringify(toImport);

      const result = importCustomGates(jsonString, { merge: true });

      expect(result.gates).toHaveLength(3);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('ID existing1 が重複');
    });

    it('不正なJSON文字列の場合エラーを返す', () => {
      const result = importCustomGates('{invalid json');

      expect(result.gates).toEqual([]);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('配列でないデータの場合エラーを返す', () => {
      const result = importCustomGates('{"not": "array"}');

      expect(result.gates).toEqual([]);
      expect(result.errors).toContain('インポートデータは配列形式である必要があります');
    });
  });

  describe('migrateOldFormat', () => {
    it('古い形式のデータを新形式に移行', () => {
      const oldData = {
        id: 'old1',
        name: 'OldGate',
        // displayName, outputs等が欠けている古い形式
        inputs: [{ name: 'A', index: 0 }],
        truthTable: { '0': '1', '1': '0' },
      };

      const migrated = migrateOldFormat(oldData);

      expect(migrated).not.toBeNull();
      expect(migrated?.displayName).toBe('OldGate');
      expect(migrated?.outputs).toEqual([]);
      expect(migrated?.width).toBe(80);
      expect(migrated?.height).toBe(60);
      expect(migrated?.createdAt).toBeDefined();
    });

    it('必須フィールドがない場合nullを返す', () => {
      const invalidData = [
        { name: 'NoId' }, // idがない
        { id: 'NoName' }, // nameがない
        {},
        null,
        undefined,
      ];

      invalidData.forEach(data => {
        expect(migrateOldFormat(data)).toBeNull();
      });
    });

    it('outputフィールドからoutputsを生成', () => {
      const oldData = {
        id: 'old1',
        name: 'OldGate',
        output: true, // 古い単一出力形式
      };

      const migrated = migrateOldFormat(oldData);

      expect(migrated?.outputs).toEqual([{ name: 'Q', index: 0 }]);
    });

    it('移行後の検証に失敗した場合nullを返す', () => {
      const oldData = {
        id: 'old1',
        name: 'OldGate',
        width: 'not a number', // 不正な型
      };

      const migrated = migrateOldFormat(oldData);

      expect(migrated).toBeNull();
    });
  });

  describe('統合テスト', () => {
    it('保存、読み込み、エクスポート、インポートの一連の流れ', () => {
      // 1. 初期データを保存
      const initialGates = [
        createTestCustomGate('id1', 'Gate1'),
        createTestCustomGate('id2', 'Gate2'),
      ];
      
      const saveResult = saveCustomGatesEnhanced(initialGates);
      expect(saveResult.success).toBe(true);

      // 2. 読み込み
      const loadResult = loadCustomGatesEnhanced();
      expect(loadResult.gates).toHaveLength(2);

      // 3. エクスポート
      const exported = exportCustomGates(loadResult.gates);
      expect(exported).toBeTruthy();

      // 4. 新しいゲートを追加してインポート
      const newGate = createTestCustomGate('id3', 'Gate3');
      const importData = [...loadResult.gates, newGate];
      const importResult = importCustomGates(JSON.stringify(importData));
      
      expect(importResult.gates).toHaveLength(3);
      
      // 5. インポート結果を保存
      const finalSaveResult = saveCustomGatesEnhanced(importResult.gates);
      expect(finalSaveResult.success).toBe(true);

      // 6. 最終確認
      const finalLoadResult = loadCustomGatesEnhanced();
      expect(finalLoadResult.gates).toHaveLength(3);
      expect(finalLoadResult.gates.map(g => g.id)).toEqual(['id1', 'id2', 'id3']);
    });
  });
});
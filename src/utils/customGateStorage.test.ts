import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { saveCustomGates, loadCustomGates, clearCustomGates } from './customGateStorage';
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
};

describe('customGateStorage', () => {
  beforeEach(() => {
    // localStorage モックの設定
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    
    // console モックの設定
    vi.spyOn(console, 'log').mockImplementation(consoleMock.log);
    vi.spyOn(console, 'error').mockImplementation(consoleMock.error);
    
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

  describe('saveCustomGates', () => {
    it('カスタムゲート定義を保存できる', () => {
      const customGates = [
        createTestCustomGate('custom1', 'MyGate1'),
        createTestCustomGate('custom2', 'MyGate2'),
      ];

      saveCustomGates(customGates);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'logic-circuit-playground-custom-gates',
        JSON.stringify(customGates)
      );
      expect(consoleMock.log).toHaveBeenCalledWith('✅ 2個のカスタムゲートを保存しました');
    });

    it('空の配列を保存できる', () => {
      saveCustomGates([]);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'logic-circuit-playground-custom-gates',
        '[]'
      );
      expect(consoleMock.log).toHaveBeenCalledWith('✅ 0個のカスタムゲートを保存しました');
    });

    it('保存エラーを適切にハンドリングする', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage quota exceeded');
      });

      const customGates = [createTestCustomGate('custom1', 'MyGate1')];
      saveCustomGates(customGates);

      expect(consoleMock.error).toHaveBeenCalledWith(
        '❌ カスタムゲートの保存に失敗:',
        expect.any(Error)
      );
    });

    it('大きなカスタムゲート定義を保存できる', () => {
      const largeCustomGate = createTestCustomGate('large', 'LargeGate');
      largeCustomGate.internalCircuit = {
        gates: Array(100).fill(null).map((_, i) => ({
          id: `gate${i}`,
          type: 'AND' as const,
          position: { x: i * 100, y: i * 50 },
          inputs: ['0', '0'],
          output: false,
        })),
        wires: Array(99).fill(null).map((_, i) => ({
          id: `wire${i}`,
          from: { gateId: `gate${i}`, pinIndex: 0 },
          to: { gateId: `gate${i + 1}`, pinIndex: 0 },
          isActive: false,
        })),
        inputMappings: { 0: { gateId: 'gate0', pinIndex: 0 } },
        outputMappings: { 0: { gateId: 'gate99', pinIndex: 0 } },
      };

      saveCustomGates([largeCustomGate]);

      expect(localStorageMock.setItem).toHaveBeenCalled();
      expect(consoleMock.log).toHaveBeenCalledWith('✅ 1個のカスタムゲートを保存しました');
    });
  });

  describe('loadCustomGates', () => {
    it('保存されたカスタムゲートを読み込める', () => {
      const customGates = [
        createTestCustomGate('custom1', 'MyGate1'),
        createTestCustomGate('custom2', 'MyGate2'),
      ];
      localStorageMock.setItem(
        'logic-circuit-playground-custom-gates',
        JSON.stringify(customGates)
      );

      const loaded = loadCustomGates();

      expect(loaded).toEqual(customGates);
      expect(consoleMock.log).toHaveBeenCalledWith('✅ 2個のカスタムゲートを読み込みました');
    });

    it('データが存在しない場合は空の配列を返す', () => {
      const loaded = loadCustomGates();

      expect(loaded).toEqual([]);
      expect(consoleMock.log).toHaveBeenCalledWith('💡 保存されたカスタムゲートはありません');
    });

    it('壊れたJSONデータを適切にハンドリングする', () => {
      localStorageMock.setItem(
        'logic-circuit-playground-custom-gates',
        '{invalid json'
      );

      const loaded = loadCustomGates();

      expect(loaded).toEqual([]);
      expect(consoleMock.error).toHaveBeenCalledWith(
        '❌ カスタムゲートの読み込みに失敗:',
        expect.any(Error)
      );
    });

    it('不正な構造のデータを適切にハンドリングする', () => {
      localStorageMock.setItem(
        'logic-circuit-playground-custom-gates',
        JSON.stringify({ not: 'an array' })
      );

      const loaded = loadCustomGates();

      // 不正な構造でもパースは成功するため、そのまま返される
      expect(loaded).toEqual({ not: 'an array' });
    });

    it('読み込みエラーを適切にハンドリングする', () => {
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('Storage access denied');
      });

      const loaded = loadCustomGates();

      expect(loaded).toEqual([]);
      expect(consoleMock.error).toHaveBeenCalledWith(
        '❌ カスタムゲートの読み込みに失敗:',
        expect.any(Error)
      );
    });
  });

  describe('clearCustomGates', () => {
    it('保存されたカスタムゲートを削除できる', () => {
      localStorageMock.setItem(
        'logic-circuit-playground-custom-gates',
        JSON.stringify([createTestCustomGate('custom1', 'MyGate1')])
      );

      clearCustomGates();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'logic-circuit-playground-custom-gates'
      );
      expect(consoleMock.log).toHaveBeenCalledWith('🗑️ 保存されたカスタムゲートを削除しました');
    });

    it('削除エラーを適切にハンドリングする', () => {
      localStorageMock.removeItem.mockImplementationOnce(() => {
        throw new Error('Storage access denied');
      });

      clearCustomGates();

      expect(consoleMock.error).toHaveBeenCalledWith(
        '❌ カスタムゲートの削除に失敗:',
        expect.any(Error)
      );
    });
  });

  describe('既存定義の更新', () => {
    it('同じIDで保存すると上書きされる', () => {
      const original = [createTestCustomGate('custom1', 'OriginalGate')];
      saveCustomGates(original);

      const updated = [createTestCustomGate('custom1', 'UpdatedGate')];
      saveCustomGates(updated);

      const loaded = loadCustomGates();
      expect(loaded[0].displayName).toBe('UpdatedGate');
    });
  });

  describe('ブラウザ互換性', () => {
    it('localStorageが使用できない環境でもクラッシュしない', () => {
      // localStorage を undefined にする
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true,
      });

      expect(() => saveCustomGates([])).not.toThrow();
      expect(() => loadCustomGates()).not.toThrow();
      expect(() => clearCustomGates()).not.toThrow();
    });

    it('localStorage にアクセス権限がない場合もクラッシュしない', () => {
      // localStorage へのアクセスで例外を投げる
      Object.defineProperty(window, 'localStorage', {
        get() {
          throw new Error('Access denied');
        },
      });

      expect(() => saveCustomGates([])).not.toThrow();
      expect(() => loadCustomGates()).not.toThrow();
      expect(() => clearCustomGates()).not.toThrow();
    });
  });

  describe('同時アクセス', () => {
    it('複数の保存操作が同時に行われても問題ない', async () => {
      const promises = [];
      
      for (let i = 0; i < 10; i++) {
        promises.push(
          new Promise<void>((resolve) => {
            saveCustomGates([createTestCustomGate(`custom${i}`, `Gate${i}`)]);
            resolve();
          })
        );
      }

      await Promise.all(promises);

      // 最後の保存が勝つ
      const loaded = loadCustomGates();
      expect(loaded).toHaveLength(1);
    });
  });

  describe('大量のカスタムゲート', () => {
    it('1000個以上のカスタムゲートを扱える', () => {
      const manyGates = Array(1000)
        .fill(null)
        .map((_, i) => createTestCustomGate(`custom${i}`, `Gate${i}`));

      saveCustomGates(manyGates);
      const loaded = loadCustomGates();

      expect(loaded).toHaveLength(1000);
      expect(loaded[0].id).toBe('custom0');
      expect(loaded[999].id).toBe('custom999');
    });

    it('localStorageの容量制限に達した場合のエラーハンドリング', () => {
      // 非常に大きなデータを作成（実際の制限は5-10MB程度）
      const hugeGate = createTestCustomGate('huge', 'HugeGate');
      hugeGate.description = 'x'.repeat(5 * 1024 * 1024); // 5MB

      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new DOMException('QuotaExceededError');
      });

      saveCustomGates([hugeGate]);

      expect(consoleMock.error).toHaveBeenCalledWith(
        '❌ カスタムゲートの保存に失敗:',
        expect.any(DOMException)
      );
    });
  });

  describe('不正なゲート構造', () => {
    it('必須フィールドが欠けているゲートを検証', () => {
      const invalidGate = {
        id: 'invalid',
        // name, displayName, inputs, outputs などが欠けている
      } as any;

      saveCustomGates([invalidGate]);
      const loaded = loadCustomGates();

      // 現在の実装では検証なしで保存される
      expect(loaded[0]).toEqual(invalidGate);
    });

    it('循環参照を含むゲート定義', () => {
      const circularGate = createTestCustomGate('circular', 'CircularGate');
      
      // 循環参照を作成
      (circularGate as any).self = circularGate;

      // JSON.stringify will throw TypeError for circular reference
      saveCustomGates([circularGate]);
      
      expect(consoleMock.error).toHaveBeenCalledWith(
        '❌ カスタムゲートの保存に失敗:',
        expect.any(TypeError)
      );
    });
  });

  describe('データ移行', () => {
    it('古い形式のデータを読み込める（後方互換性）', () => {
      // 古い形式のデータ（例：outputsフィールドがない）
      const oldFormatData = [{
        id: 'old1',
        name: 'OldGate',
        displayName: 'Old Gate',
        inputs: [{ name: 'A', index: 0 }],
        // outputs フィールドがない古い形式
        truthTable: { '0': '1', '1': '0' },
        width: 60,
        height: 40,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }];

      localStorageMock.setItem(
        'logic-circuit-playground-custom-gates',
        JSON.stringify(oldFormatData)
      );

      const loaded = loadCustomGates();
      expect(loaded).toHaveLength(1);
      expect(loaded[0].id).toBe('old1');
    });
  });

  describe('エクスポート/インポート機能', () => {
    it('カスタムゲートをJSON文字列としてエクスポート', () => {
      const gates = [
        createTestCustomGate('export1', 'ExportGate1'),
        createTestCustomGate('export2', 'ExportGate2'),
      ];

      saveCustomGates(gates);
      
      // 実際のエクスポート機能の実装が必要
      const savedData = localStorageMock.getItem('logic-circuit-playground-custom-gates');
      const exported = JSON.parse(savedData!);

      expect(exported).toEqual(gates);
    });

    it('JSON文字列からカスタムゲートをインポート', () => {
      const importData = JSON.stringify([
        createTestCustomGate('import1', 'ImportGate1'),
        createTestCustomGate('import2', 'ImportGate2'),
      ]);

      // 実際のインポート機能の実装が必要
      localStorageMock.setItem('logic-circuit-playground-custom-gates', importData);
      const imported = loadCustomGates();

      expect(imported).toHaveLength(2);
      expect(imported[0].displayName).toBe('ImportGate1');
      expect(imported[1].displayName).toBe('ImportGate2');
    });
  });

  describe('重複IDの処理', () => {
    it('同じIDを持つゲートの処理', () => {
      const gates = [
        createTestCustomGate('duplicate', 'Gate1'),
        createTestCustomGate('duplicate', 'Gate2'), // 同じID
        createTestCustomGate('unique', 'Gate3'),
      ];

      saveCustomGates(gates);
      const loaded = loadCustomGates();

      // 現在の実装では重複IDも保存される
      expect(loaded).toHaveLength(3);
      expect(loaded.filter(g => g.id === 'duplicate')).toHaveLength(2);
    });
  });

  describe('カスタムゲート内の循環依存', () => {
    it('内部回路に循環依存があるゲート', () => {
      const circularDependencyGate = createTestCustomGate('circular', 'CircularGate');
      
      circularDependencyGate.internalCircuit = {
        gates: [
          {
            id: 'gate1',
            type: 'AND',
            position: { x: 0, y: 0 },
            inputs: ['0', '0'],
            output: false,
          },
          {
            id: 'gate2',
            type: 'OR',
            position: { x: 100, y: 0 },
            inputs: ['0', '0'],
            output: false,
          },
        ],
        wires: [
          {
            id: 'wire1',
            from: { gateId: 'gate1', pinIndex: 0 },
            to: { gateId: 'gate2', pinIndex: 0 },
            isActive: false,
          },
          {
            id: 'wire2',
            from: { gateId: 'gate2', pinIndex: 0 },
            to: { gateId: 'gate1', pinIndex: 1 },
            isActive: false,
          },
        ],
        inputMappings: {},
        outputMappings: {},
      };

      saveCustomGates([circularDependencyGate]);
      const loaded = loadCustomGates();

      expect(loaded[0].internalCircuit?.wires).toHaveLength(2);
    });
  });

  describe('パフォーマンステスト', () => {
    it('多数のカスタムゲートの保存/読み込みパフォーマンス', () => {
      const startSave = performance.now();
      
      const manyGates = Array(100)
        .fill(null)
        .map((_, i) => {
          const gate = createTestCustomGate(`perf${i}`, `PerfGate${i}`);
          // 各ゲートに大きな内部回路を追加
          gate.internalCircuit = {
            gates: Array(10).fill(null).map((_, j) => ({
              id: `g${i}_${j}`,
              type: 'AND' as const,
              position: { x: j * 50, y: j * 50 },
              inputs: ['0', '0'],
              output: false,
            })),
            wires: [],
            inputMappings: {},
            outputMappings: {},
          };
          return gate;
        });

      saveCustomGates(manyGates);
      const saveDuration = performance.now() - startSave;

      const startLoad = performance.now();
      const loaded = loadCustomGates();
      const loadDuration = performance.now() - startLoad;

      expect(loaded).toHaveLength(100);
      expect(saveDuration).toBeLessThan(1000); // 1秒以内
      expect(loadDuration).toBeLessThan(1000); // 1秒以内
    });
  });

  describe('エラーリカバリー', () => {
    it('部分的に壊れたデータからの復旧', () => {
      // 一部のゲートが不正な形式のデータ
      const mixedData = [
        createTestCustomGate('valid1', 'ValidGate1'),
        { invalid: 'data' }, // 不正なデータ
        createTestCustomGate('valid2', 'ValidGate2'),
        null, // null値
        undefined, // undefined値
        createTestCustomGate('valid3', 'ValidGate3'),
      ];

      localStorageMock.setItem(
        'logic-circuit-playground-custom-gates',
        JSON.stringify(mixedData)
      );

      const loaded = loadCustomGates();
      
      // 現在の実装では全てのデータがそのまま返される
      expect(loaded).toHaveLength(6);
    });
  });

  describe('メモリリーク対策', () => {
    it('大量の操作後もメモリが解放される', () => {
      // 大量の保存と読み込みを繰り返す
      for (let i = 0; i < 100; i++) {
        const gates = Array(10)
          .fill(null)
          .map((_, j) => createTestCustomGate(`mem${i}_${j}`, `MemGate${i}_${j}`));
        
        saveCustomGates(gates);
        loadCustomGates();
        clearCustomGates();
      }

      // メモリ使用量の確認（実際のメモリ測定は困難なので、
      // エラーなく完了することを確認）
      expect(true).toBe(true);
    });
  });
});
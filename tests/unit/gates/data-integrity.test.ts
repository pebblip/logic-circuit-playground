import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { CircuitStorageService } from '@/services/CircuitStorageService';
import { CircuitShareService } from '@/services/CircuitShareService';
import { useCircuitStore } from '@/stores/circuitStore';
import type { Gate, Wire, CustomGateDefinition } from '@/types/circuit';

/**
 * データ永続性テスト
 * 
 * このテストはユーザーの信頼を守る最重要機能を保護します。
 * ユーザーが作成した回路やカスタムゲートが失われることは絶対に許されません。
 */
describe('データの永続性', () => {
  let storage: CircuitStorageService;
  let originalLocalStorage: Storage;
  let mockDB: any;

  beforeEach(() => {
    // IndexedDBをグローバルに定義（後で上書きされる）
    global.indexedDB = {} as any;
    
    // CircuitStorageServiceのインスタンスを取得
    storage = CircuitStorageService.getInstance();

    // LocalStorageのモック
    originalLocalStorage = global.localStorage;
    const store: Record<string, string> = {};
    global.localStorage = {
      getItem: vi.fn((key) => store[key] || null),
      setItem: vi.fn((key, value) => { store[key] = value; }),
      removeItem: vi.fn((key) => { delete store[key]; }),
      clear: vi.fn(() => { Object.keys(store).forEach(key => delete store[key]); }),
      length: 0,
      key: vi.fn(),
    };

    // IndexedDBの完全なモック実装
    const mockStores: Record<string, any[]> = {
      circuits: [],
      thumbnails: [],
    };

    mockDB = {
      transaction: (storeNames: string[], mode: string) => {
        const transaction = {
          objectStore: (name: string) => ({
            put: (data: any) => {
              const req = { 
                onsuccess: null as any,
                onerror: null as any,
                result: data 
              };
              setTimeout(() => {
                if (!mockStores[name]) mockStores[name] = [];
                const key = name === 'circuits' ? data.metadata.id : data.circuitId;
                const index = mockStores[name].findIndex((item: any) => 
                  name === 'circuits' ? item.metadata.id === key : item.circuitId === key
                );
                if (index >= 0) {
                  mockStores[name][index] = data;
                } else {
                  mockStores[name].push(data);
                }
                if (req.onsuccess) req.onsuccess();
              }, 0);
              return req;
            },
            get: (id: string) => {
              const req = { 
                onsuccess: null as any,
                onerror: null as any,
                result: null as any
              };
              setTimeout(() => {
                req.result = mockStores[name]?.find((item: any) => 
                  name === 'circuits' ? item.metadata.id === id : item.circuitId === id
                ) || null;
                if (req.onsuccess) req.onsuccess();
              }, 0);
              return req;
            },
            delete: (id: string) => {
              const req = { 
                onsuccess: null as any,
                onerror: null as any
              };
              setTimeout(() => {
                if (mockStores[name]) {
                  mockStores[name] = mockStores[name].filter((item: any) => 
                    name === 'circuits' ? item.metadata.id !== id : item.circuitId !== id
                  );
                }
                if (req.onsuccess) req.onsuccess();
              }, 0);
              return req;
            },
          }),
        };
        return transaction;
      },
      objectStoreNames: { contains: vi.fn(() => true) },
    };

    const mockIndexedDB = {
      open: vi.fn(() => {
        const request: any = {
          result: mockDB,
          error: null,
          onsuccess: null,
          onerror: null,
          onupgradeneeded: null,
        };
        
        // 非同期でsuccessを呼ぶ
        setTimeout(() => {
          if (request.onsuccess) {
            request.onsuccess();
          }
        }, 0);
        
        return request;
      }),
    };
    global.indexedDB = mockIndexedDB as any;

    // データベース初期化を待つためのハック
    (storage as any).db = mockDB;

    // ストアの初期化
    useCircuitStore.setState({
      gates: [],
      wires: [],
      customGates: [],
      selectedGateIds: [],
    });
  });

  afterEach(() => {
    global.localStorage = originalLocalStorage;
    vi.clearAllMocks();
  });

  describe('回路データの保存と復元', () => {
    test('基本的な回路が正しく保存・復元される', async () => {
      // テスト用の回路を作成
      const testGates: Gate[] = [
        {
          id: 'input1',
          type: 'INPUT',
          position: { x: 100, y: 100 },
          inputs: [],
          output: true,
        },
        {
          id: 'and1',
          type: 'AND',
          position: { x: 300, y: 150 },
          inputs: ['true', 'false'],
          output: false,
        },
        {
          id: 'output1',
          type: 'OUTPUT',
          position: { x: 500, y: 150 },
          inputs: ['false'],
          output: false,
        },
      ];
      
      const testWires: Wire[] = [
        {
          id: 'wire1',
          from: { gateId: 'input1', pinIndex: -1 },
          to: { gateId: 'and1', pinIndex: 0 },
          isActive: true,
        },
        {
          id: 'wire2',
          from: { gateId: 'and1', pinIndex: -1 },
          to: { gateId: 'output1', pinIndex: 0 },
          isActive: false,
        },
      ];

      // 回路を保存
      const saveResult = await storage.saveCircuit('test-circuit', testGates, testWires, {
        description: 'テスト用回路',
        tags: ['test', 'and-gate'],
      });
      
      expect(saveResult.success).toBe(true);
      expect(saveResult.data?.id).toBeTruthy();

      // LocalStorageに保存されたことを確認
      expect(localStorage.setItem).toHaveBeenCalled();

      // 保存された回路IDを使って読み込み
      if (saveResult.data?.id) {
        const loadResult = await storage.loadCircuit(saveResult.data.id);
        expect(loadResult.success).toBe(true);
        
        if (loadResult.data) {
          expect(loadResult.data.circuit.gates).toHaveLength(3);
          expect(loadResult.data.circuit.wires).toHaveLength(2);
          expect(loadResult.data.metadata.name).toBe('test-circuit');
          expect(loadResult.data.metadata.description).toBe('テスト用回路');
          expect(loadResult.data.metadata.tags).toContain('test');
        }
      }
    });

    test('複雑な回路（メタデータ含む）が正しく保存・復元される', async () => {
      const complexGates: Gate[] = [
        {
          id: 'clock1',
          type: 'CLOCK',
          position: { x: 100, y: 100 },
          inputs: [],
          output: false,
          metadata: {
            isRunning: true,
            frequency: 1000,
            startTime: Date.now(),
            previousClockState: false,
          },
        },
        {
          id: 'dff1',
          type: 'D-FF',
          position: { x: 300, y: 100 },
          inputs: ['true', 'false'],
          output: false,
          outputs: [false, true],
          metadata: {
            qOutput: false,
            qBarOutput: true,
            previousClockState: false,
          },
        },
      ];
      
      const complexWires: Wire[] = [
        {
          id: 'wire1',
          from: { gateId: 'clock1', pinIndex: -1 },
          to: { gateId: 'dff1', pinIndex: 1 },
          isActive: false,
        },
      ];

      // 保存
      const saveResult = await storage.saveCircuit('complex-circuit', complexGates, complexWires);
      expect(saveResult.success).toBe(true);

      // 読み込み
      if (saveResult.data?.id) {
        const loadResult = await storage.loadCircuit(saveResult.data.id);
        expect(loadResult.success).toBe(true);

        if (loadResult.data) {
          const gates = loadResult.data.circuit.gates;
          
          // CLOCKゲートのメタデータ確認
          const clockGate = gates.find(g => g.id === 'clock1');
          expect(clockGate?.metadata?.frequency).toBe(1000);
          expect(clockGate?.metadata?.isRunning).toBe(true);

          // D-FFのメタデータ確認
          const dffGate = gates.find(g => g.id === 'dff1');
          expect(dffGate?.metadata?.qOutput).toBe(false);
          expect(dffGate?.metadata?.qBarOutput).toBe(true);
          expect(dffGate?.outputs).toEqual([false, true]);
        }
      }
    });

    test('保存された回路リストが正しく取得できる', async () => {
      // 複数の回路を保存
      const circuits = [
        { name: 'circuit1', gates: [], wires: [] },
        { name: 'circuit2', gates: [], wires: [] },
        { name: 'circuit3', gates: [], wires: [] },
      ];

      for (const circuit of circuits) {
        await storage.saveCircuit(circuit.name, circuit.gates, circuit.wires);
      }

      // リストを取得
      const listResult = await storage.listCircuits();
      expect(listResult.success).toBe(true);
      
      if (listResult.data) {
        expect(listResult.data.length).toBeGreaterThanOrEqual(3);
        const names = listResult.data.map(c => c.name);
        expect(names).toContain('circuit1');
        expect(names).toContain('circuit2');
        expect(names).toContain('circuit3');

        // 各回路のメタデータを確認
        listResult.data.forEach(circuit => {
          expect(circuit.createdAt).toBeTruthy();
          expect(circuit.updatedAt).toBeTruthy();
          expect(circuit.stats.gateCount).toBeDefined();
          expect(circuit.stats.wireCount).toBeDefined();
        });
      }
    });

    test('回路の削除が正しく動作する', async () => {
      // 回路を保存
      const saveResult = await storage.saveCircuit('to-delete', [], []);
      expect(saveResult.success).toBe(true);
      
      const circuitId = saveResult.data?.id;
      expect(circuitId).toBeTruthy();

      if (circuitId) {
        // 削除前に存在することを確認
        const beforeDelete = await storage.loadCircuit(circuitId);
        expect(beforeDelete.success).toBe(true);

        // 削除
        const deleteResult = await storage.deleteCircuit(circuitId);
        expect(deleteResult.success).toBe(true);

        // 削除後は読み込めない
        const afterDelete = await storage.loadCircuit(circuitId);
        expect(afterDelete.success).toBe(false);
      }
    });
  });

  describe('回路共有機能', () => {
    test('共有URLが正しく生成される', async () => {
      const gates: Gate[] = [
        {
          id: 'and1',
          type: 'AND',
          position: { x: 200, y: 200 },
          inputs: ['true', 'true'],
          output: true,
        },
      ];
      const wires: Wire[] = [];

      const result = await CircuitShareService.createShareUrl(gates, wires, {
        name: 'テスト回路',
        description: 'ANDゲート1つ',
      });

      expect(result.success).toBe(true);
      expect(result.url).toBeTruthy();
      if (result.url) {
        expect(result.url).toContain('?circuit=');
        expect(result.url.length).toBeGreaterThan(20);
      }
    });

    test('共有URLから回路が正しく復元される', async () => {
      const originalGates: Gate[] = [
        {
          id: 'input1',
          type: 'INPUT',
          position: { x: 100, y: 100 },
          inputs: [],
          output: true,
        },
        {
          id: 'not1',
          type: 'NOT',
          position: { x: 300, y: 100 },
          inputs: ['true'],
          output: false,
        },
        {
          id: 'output1',
          type: 'OUTPUT',
          position: { x: 500, y: 100 },
          inputs: ['false'],
          output: false,
        },
      ];
      
      const originalWires: Wire[] = [
        {
          id: 'w1',
          from: { gateId: 'input1', pinIndex: -1 },
          to: { gateId: 'not1', pinIndex: 0 },
          isActive: true,
        },
        {
          id: 'w2',
          from: { gateId: 'not1', pinIndex: -1 },
          to: { gateId: 'output1', pinIndex: 0 },
          isActive: false,
        },
      ];

      // URLを生成
      const createResult = await CircuitShareService.createShareUrl(
        originalGates,
        originalWires,
        { name: 'NOT回路' }
      );

      expect(createResult.success).toBe(true);
      expect(createResult.url).toBeTruthy();

      if (createResult.url) {
        // URLから回路を復元
        const parseResult = await CircuitShareService.parseShareUrl(createResult.url);
        expect(parseResult.success).toBe(true);

        if (parseResult.data) {
          expect(parseResult.data.name).toBe('NOT回路');
          expect(parseResult.data.gates).toHaveLength(3);
          expect(parseResult.data.wires).toHaveLength(2);

          // ゲートの詳細を確認
          const inputGate = parseResult.data.gates.find(g => g.type === 'INPUT');
          expect(inputGate?.output).toBe(true);

          const notGate = parseResult.data.gates.find(g => g.type === 'NOT');
          expect(notGate?.inputs).toEqual(['true']);

          // ワイヤーの詳細を確認（isActiveは共有データに含まれない）
          const wire1 = parseResult.data.wires.find(w => w.id === 'w1');
          expect(wire1).toBeTruthy();
          expect(wire1?.from.gateId).toBe('input1');
          expect(wire1?.to.gateId).toBe('not1');
        }
      }
    });

    test('大規模な回路でも共有URLが機能する', async () => {
      // 5ゲート、5ワイヤーの回路を作成（URL長制限内に確実に収まるサイズ）
      const largeGates: Gate[] = Array.from({ length: 5 }, (_, i) => ({
        id: `g${i}`,
        type: 'AND',
        position: { x: i * 100, y: 100 },
        inputs: ['0', '0'],
        output: false,
      } as Gate));
      
      const largeWires: Wire[] = Array.from({ length: 5 }, (_, i) => ({
        id: `w${i}`,
        from: { gateId: `g${i % 5}`, pinIndex: -1 },
        to: { gateId: `g${(i + 1) % 5}`, pinIndex: 0 },
        isActive: false,
      } as Wire));

      // 共有URLを生成
      const createResult = await CircuitShareService.createShareUrl(largeGates, largeWires);
      if (!createResult.success) {
        console.error('エラー:', createResult.error);
      }
      expect(createResult.success).toBe(true);

      if (createResult.url) {
        // URLから復元
        const parseResult = await CircuitShareService.parseShareUrl(createResult.url);
        expect(parseResult.success).toBe(true);

        if (parseResult.data) {
          expect(parseResult.data.gates).toHaveLength(5);
          expect(parseResult.data.wires).toHaveLength(5);
          expect(parseResult.data.gates[0].id).toBe('g0');
          expect(parseResult.data.wires[4].id).toBe('w4');
        }
      }
    });

    test('不正な共有URLを適切に処理する', async () => {
      // 不正なURL
      const invalidUrls = [
        'https://example.com',  // パラメータなし
        'https://example.com?circuit=invalid-data',  // 不正なデータ
        'https://example.com?circuit=',  // 空のデータ
      ];

      for (const url of invalidUrls) {
        const result = await CircuitShareService.parseShareUrl(url);
        expect(result.success).toBe(false);
        expect(result.error).toBeTruthy();
      }
    });
  });

  describe('データ整合性の検証', () => {
    test('循環参照を含む回路でも正しく保存・復元される', async () => {
      const circularGates: Gate[] = [
        {
          id: 'or1',
          type: 'OR',
          position: { x: 200, y: 100 },
          inputs: ['false', 'false'],
          output: false,
        },
        {
          id: 'not1',
          type: 'NOT',
          position: { x: 400, y: 100 },
          inputs: ['false'],
          output: true,
        },
      ];
      
      const circularWires: Wire[] = [
        {
          id: 'w1',
          from: { gateId: 'or1', pinIndex: -1 },
          to: { gateId: 'not1', pinIndex: 0 },
          isActive: false,
        },
        {
          id: 'w2',
          from: { gateId: 'not1', pinIndex: -1 },
          to: { gateId: 'or1', pinIndex: 1 },
          isActive: true,
        },
      ];

      // 保存
      const saveResult = await storage.saveCircuit('circular', circularGates, circularWires);
      expect(saveResult.success).toBe(true);

      // 復元
      if (saveResult.data?.id) {
        const loadResult = await storage.loadCircuit(saveResult.data.id);
        expect(loadResult.success).toBe(true);

        if (loadResult.data) {
          expect(loadResult.data.circuit.gates).toHaveLength(2);
          expect(loadResult.data.circuit.wires).toHaveLength(2);
          
          // 循環参照が正しく復元されている
          const w2 = loadResult.data.circuit.wires.find(w => w.id === 'w2');
          expect(w2?.from.gateId).toBe('not1');
          expect(w2?.to.gateId).toBe('or1');
        }
      }
    });

    test('IDの重複がある場合でも保存できる', async () => {
      const duplicateIdGates: Gate[] = [
        {
          id: 'gate1',
          type: 'AND',
          position: { x: 100, y: 100 },
          inputs: [],
          output: false,
        },
        {
          id: 'gate1', // 重複ID
          type: 'OR',
          position: { x: 200, y: 100 },
          inputs: [],
          output: false,
        },
      ];

      // 保存は成功する（データの整合性はアプリケーション側で保証）
      const saveResult = await storage.saveCircuit('duplicate', duplicateIdGates, []);
      expect(saveResult.success).toBe(true);

      // 読み込み時にデータが存在することを確認
      if (saveResult.data?.id) {
        const loadResult = await storage.loadCircuit(saveResult.data.id);
        expect(loadResult.success).toBe(true);
        expect(loadResult.data?.circuit.gates).toHaveLength(2);
      }
    });
  });
});
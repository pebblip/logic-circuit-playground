// 回路保存/読み込みサービスの単体テスト
// データ永続化機能の確実な品質保証

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CircuitStorageService } from '@/services/CircuitStorageService';
import { Gate, Wire } from '@/types/circuit';
import { SavedCircuit, CIRCUIT_STORAGE_VERSION } from '@/types/circuit-storage';

// LocalStorageのモック
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => localStorageMock.store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageMock.store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageMock.store[key];
  }),
  clear: vi.fn(() => {
    localStorageMock.store = {};
  })
};

// IndexedDBのモック
const createMockIDBRequest = (result: any = null, error: any = null) => {
  return {
    result,
    error,
    onsuccess: null as any,
    onerror: null as any,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  };
};

const mockIDBDatabase = {
  transaction: vi.fn(() => ({
    objectStore: vi.fn(() => ({
      put: vi.fn(() => createMockIDBRequest()),
      get: vi.fn(() => createMockIDBRequest()),
      delete: vi.fn(() => createMockIDBRequest())
    }))
  })),
  createObjectStore: vi.fn(() => ({
    createIndex: vi.fn()
  })),
  objectStoreNames: {
    contains: vi.fn(() => false)
  }
};

// グローバルモック設定
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
});

Object.defineProperty(global, 'indexedDB', {
  value: {
    open: vi.fn(() => {
      const request = createMockIDBRequest(mockIDBDatabase);
      // IndexedDB初期化成功をシミュレート
      setTimeout(() => {
        if (request.onsuccess) request.onsuccess({ target: request });
      }, 0);
      return request;
    })
  },
  writable: true
});

// BlobとURL.createObjectURLのモック（エクスポート機能用）
global.Blob = vi.fn().mockImplementation((content, options) => ({
  content,
  options
})) as any;

global.URL = {
  createObjectURL: vi.fn(() => 'mock-url'),
  revokeObjectURL: vi.fn()
} as any;

// DOMのモック（ダウンロード機能用）
Object.defineProperty(global, 'document', {
  value: {
    createElement: vi.fn(() => ({
      href: '',
      download: '',
      click: vi.fn(),
      style: {}
    })),
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn()
    }
  }
});

describe('CircuitStorageService', () => {
  let service: CircuitStorageService;
  let sampleGates: Gate[];
  let sampleWires: Wire[];

  beforeEach(() => {
    // モックをリセット
    vi.clearAllMocks();
    localStorageMock.clear();
    
    // サービスのインスタンスを新規作成（テスト隔離）
    service = CircuitStorageService.getInstance();
    
    // サンプルデータ
    sampleGates = [
      {
        id: 'gate1',
        type: 'INPUT',
        position: { x: 0, y: 0 },
        inputs: [],
        output: true
      },
      {
        id: 'gate2',
        type: 'AND',
        position: { x: 100, y: 0 },
        inputs: ['', ''],
        output: false
      },
      {
        id: 'gate3',
        type: 'OUTPUT',
        position: { x: 200, y: 0 },
        inputs: [''],
        output: false
      }
    ];

    sampleWires = [
      {
        id: 'wire1',
        from: { gateId: 'gate1', pinIndex: -1 },
        to: { gateId: 'gate2', pinIndex: 0 },
        isActive: false
      },
      {
        id: 'wire2',
        from: { gateId: 'gate2', pinIndex: -1 },
        to: { gateId: 'gate3', pinIndex: 0 },
        isActive: false
      }
    ];
  });

  describe('Data Validation', () => {
    it('should validate circuit data correctly', () => {
      const validCircuit: SavedCircuit = {
        metadata: {
          id: 'test-id',
          name: 'Test Circuit',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
          stats: {
            gateCount: 2,
            wireCount: 1,
            gateTypes: { 'INPUT': 1, 'AND': 1 }
          }
        },
        circuit: {
          gates: sampleGates,
          wires: sampleWires
        },
        version: CIRCUIT_STORAGE_VERSION
      };

      // プライベートメソッドをテストするため、型アサーション
      const result = (service as any).validateCircuitData(validCircuit);
      expect(result).toBe(true);
    });

    it('should reject invalid circuit data', () => {
      const invalidCircuits = [
        {},
        { metadata: {} },
        { metadata: { id: 'test' }, circuit: null },
        { metadata: { id: 'test' }, circuit: { gates: null, wires: [] } },
        { metadata: { id: 'test' }, circuit: { gates: [], wires: null } }
      ];

      invalidCircuits.forEach(invalidCircuit => {
        const result = (service as any).validateCircuitData(invalidCircuit);
        expect(result).toBe(false);
      });
      
      // null を別途テスト
      expect((service as any).validateCircuitData(null)).toBe(false);
    });
  });

  describe('Utility Functions', () => {
    it('should generate unique IDs', () => {
      const id1 = (service as any).generateId();
      const id2 = (service as any).generateId();
      
      expect(id1).toMatch(/^circuit-\d+-\d+-[a-z0-9]+$/);
      expect(id2).toMatch(/^circuit-\d+-\d+-[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });

    it('should calculate gate type statistics correctly', () => {
      const stats = (service as any).calculateGateTypes(sampleGates);
      
      expect(stats).toEqual({
        'INPUT': 1,
        'AND': 1,
        'OUTPUT': 1
      });
    });

    it('should calculate empty gate statistics for empty array', () => {
      const stats = (service as any).calculateGateTypes([]);
      expect(stats).toEqual({});
    });
  });

  describe('Metadata Management', () => {
    it('should handle empty metadata index', () => {
      const index = (service as any).getMetadataIndex();
      expect(index).toEqual([]);
    });

    it('should update metadata index correctly', async () => {
      const metadata = {
        id: 'test-id',
        name: 'Test Circuit',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        stats: {
          gateCount: 3,
          wireCount: 2,
          gateTypes: { 'INPUT': 1, 'AND': 1, 'OUTPUT': 1 }
        }
      };

      await (service as any).updateMetadataIndex(metadata);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'circuit-metadata-index',
        JSON.stringify([metadata])
      );
    });

    it('should update existing metadata in index', async () => {
      // 初期データを設定
      const initialMetadata = {
        id: 'test-id',
        name: 'Old Name',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        stats: { gateCount: 1, wireCount: 0, gateTypes: {} }
      };
      
      localStorageMock.store['circuit-metadata-index'] = JSON.stringify([initialMetadata]);

      // 更新データ
      const updatedMetadata = {
        ...initialMetadata,
        name: 'New Name',
        updatedAt: '2023-01-02T00:00:00.000Z'
      };

      await (service as any).updateMetadataIndex(updatedMetadata);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'circuit-metadata-index',
        JSON.stringify([updatedMetadata])
      );
    });

    it('should remove metadata from index', async () => {
      // 初期データを設定
      const metadata1 = { id: 'id1', name: 'Circuit 1', createdAt: '2023-01-01T00:00:00.000Z', updatedAt: '2023-01-01T00:00:00.000Z', stats: { gateCount: 1, wireCount: 0, gateTypes: {} } };
      const metadata2 = { id: 'id2', name: 'Circuit 2', createdAt: '2023-01-01T00:00:00.000Z', updatedAt: '2023-01-01T00:00:00.000Z', stats: { gateCount: 1, wireCount: 0, gateTypes: {} } };
      
      localStorageMock.store['circuit-metadata-index'] = JSON.stringify([metadata1, metadata2]);

      await (service as any).removeFromMetadataIndex('id1');
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'circuit-metadata-index',
        JSON.stringify([metadata2])
      );
    });
  });

  describe('Name Generation', () => {
    it('should return original name if unique', async () => {
      const name = await (service as any).generateUniqueName('Test Circuit');
      expect(name).toBe('Test Circuit');
    });

    it('should generate unique name with counter', async () => {
      // 既存の名前を設定
      const existingMetadata = [
        { id: 'id1', name: 'Test Circuit', createdAt: '2023-01-01T00:00:00.000Z', updatedAt: '2023-01-01T00:00:00.000Z', stats: { gateCount: 1, wireCount: 0, gateTypes: {} } },
        { id: 'id2', name: 'Test Circuit (1)', createdAt: '2023-01-01T00:00:00.000Z', updatedAt: '2023-01-01T00:00:00.000Z', stats: { gateCount: 1, wireCount: 0, gateTypes: {} } }
      ];
      
      localStorageMock.store['circuit-metadata-index'] = JSON.stringify(existingMetadata);

      const name = await (service as any).generateUniqueName('Test Circuit');
      expect(name).toBe('Test Circuit (2)');
    });
  });

  describe('Circuit Search', () => {
    it('should find circuit ID by name', async () => {
      const metadata = [
        { id: 'found-id', name: 'Target Circuit', createdAt: '2023-01-01T00:00:00.000Z', updatedAt: '2023-01-01T00:00:00.000Z', stats: { gateCount: 1, wireCount: 0, gateTypes: {} } },
        { id: 'other-id', name: 'Other Circuit', createdAt: '2023-01-01T00:00:00.000Z', updatedAt: '2023-01-01T00:00:00.000Z', stats: { gateCount: 1, wireCount: 0, gateTypes: {} } }
      ];
      
      localStorageMock.store['circuit-metadata-index'] = JSON.stringify(metadata);

      const foundId = await (service as any).findCircuitIdByName('Target Circuit');
      expect(foundId).toBe('found-id');
    });

    it('should return null for non-existent name', async () => {
      const foundId = await (service as any).findCircuitIdByName('Non-existent Circuit');
      expect(foundId).toBeNull();
    });
  });

  describe('Integration Tests', () => {
    it('should handle basic save workflow without errors', async () => {
      // IndexedDB保存をモック
      const mockPut = vi.fn().mockImplementation(() => {
        const request = createMockIDBRequest();
        setTimeout(() => request.onsuccess && request.onsuccess({}), 0);
        return request;
      });

      mockIDBDatabase.transaction.mockReturnValue({
        objectStore: vi.fn(() => ({ put: mockPut }))
      });

      const result = await service.saveCircuit(
        'Test Circuit',
        sampleGates,
        sampleWires,
        { description: 'A test circuit' }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('Test Circuit');
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should handle save errors gracefully', async () => {
      // IndexedDB エラーをモック
      const mockPut = vi.fn().mockImplementation(() => {
        const request = createMockIDBRequest(null, new Error('DB Error'));
        setTimeout(() => request.onerror && request.onerror({}), 0);
        return request;
      });

      mockIDBDatabase.transaction.mockReturnValue({
        objectStore: vi.fn(() => ({ put: mockPut }))
      });

      const result = await service.saveCircuit('Test Circuit', sampleGates, sampleWires);

      expect(result.success).toBe(false);
      expect(result.message).toContain('保存に失敗');
    });

    it('should validate file content in import', async () => {
      const invalidJson = 'invalid json';
      const mockFile = {
        name: 'test.json',
        type: 'application/json',
        text: vi.fn().mockResolvedValue(invalidJson)
      } as any;

      const result = await service.importCircuit(mockFile);

      expect(result.success).toBe(false);
      expect(result.message).toContain('インポートに失敗');
    });
  });

  describe('Export Functionality', () => {
    it('should handle export options correctly', async () => {
      // Mock successful load
      const mockGet = vi.fn().mockImplementation(() => {
        const mockCircuit: SavedCircuit = {
          metadata: {
            id: 'test-id',
            name: 'Test Circuit',
            description: 'Test Description',
            author: 'Test Author',
            tags: ['test'],
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-01T00:00:00.000Z',
            stats: { gateCount: 3, wireCount: 2, gateTypes: {} }
          },
          circuit: { gates: sampleGates, wires: sampleWires },
          version: CIRCUIT_STORAGE_VERSION
        };
        
        const request = createMockIDBRequest(mockCircuit);
        setTimeout(() => request.onsuccess && request.onsuccess({ target: request }), 0);
        return request;
      });

      mockIDBDatabase.transaction.mockReturnValue({
        objectStore: vi.fn(() => ({ get: mockGet }))
      });

      const result = await service.exportCircuit('test-id', {
        includeMetadata: false,
        includeThumbnail: false,
        compress: true
      });

      expect(result.success).toBe(true);
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });
});
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { IdGenerator, IdValidator, generateGateId, generateWireId, generateCircuitId, generateCustomGateId } from './idGenerator';

describe('統一ID生成システム', () => {
  beforeEach(() => {
    // Date.nowをモック
    vi.spyOn(Date, 'now').mockReturnValue(1640995200000); // 2022-01-01 00:00:00
    
    // Math.randomをモック
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  describe('IdGenerator', () => {
    describe('generateGateId', () => {
      it('正しい形式のゲートIDを生成する', () => {
        const id = IdGenerator.generateGateId();
        
        expect(id).toMatch(/^gate-\d+-\d+-[a-z0-9]+$/);
        expect(id).toContain('gate-1640995200000');
      });

      it('毎回異なるIDを生成する', () => {
        vi.spyOn(Math, 'random').mockReturnValueOnce(0.1).mockReturnValueOnce(0.9);
        
        const id1 = IdGenerator.generateGateId();
        const id2 = IdGenerator.generateGateId();
        
        expect(id1).not.toBe(id2);
      });
    });

    describe('generateWireId', () => {
      it('正しい形式のワイヤーIDを生成する', () => {
        const id = IdGenerator.generateWireId();
        
        expect(id).toMatch(/^wire-\d+-\d+-[a-z0-9]+$/);
        expect(id).toContain('wire-1640995200000');
      });
    });

    describe('generateCircuitId', () => {
      it('正しい形式の回路IDを生成する', () => {
        const id = IdGenerator.generateCircuitId();
        
        expect(id).toMatch(/^circuit-\d+-\d+-[a-z0-9]+$/);
        expect(id).toContain('circuit-1640995200000');
      });
    });

    describe('generateCustomGateId', () => {
      it('正しい形式のカスタムゲートIDを生成する', () => {
        const id = IdGenerator.generateCustomGateId();
        
        expect(id).toMatch(/^custom-\d+-\d+-[a-z0-9]+$/);
        expect(id).toContain('custom-1640995200000');
      });
    });

    describe('generateCustomId', () => {
      it('カスタムプレフィックスでIDを生成する', () => {
        const id = IdGenerator.generateCustomId('session');
        
        expect(id).toMatch(/^session-\d+-\d+-[a-z0-9]+$/);
        expect(id).toContain('session-1640995200000');
      });

      it('カスタムオプションでIDを生成する', () => {
        const id = IdGenerator.generateCustomId('test', { length: 8, separator: '_' });
        
        expect(id).toMatch(/^test_\d+_\d+_[a-z0-9]+$/);
        expect(id).toContain('test_1640995200000');
      });
    });

    describe('generateGenericId', () => {
      it('プレフィックスなしのIDを生成する', () => {
        const id = IdGenerator.generateGenericId();
        
        expect(id).toMatch(/^\d+-\d+-[a-z0-9]+$/);
        expect(id).toContain('1640995200000');
      });
    });
  });

  describe('IdValidator', () => {
    describe('isValidId', () => {
      it('有効なIDを正しく識別する', () => {
        const validId = 'gate-1640995200000-500-abc123def456';
        
        expect(IdValidator.isValidId(validId)).toBe(true);
      });

      it('無効なIDを正しく識別する', () => {
        expect(IdValidator.isValidId('')).toBe(false);
        expect(IdValidator.isValidId('invalid')).toBe(false);
        expect(IdValidator.isValidId('a-b')).toBe(false);
        expect(IdValidator.isValidId(null as any)).toBe(false);
        expect(IdValidator.isValidId(undefined as any)).toBe(false);
      });

      it('期待されるプレフィックスをチェックする', () => {
        const gateId = 'gate-1640995200000-500-abc123def456';
        const wireId = 'wire-1640995200000-500-abc123def456';
        
        expect(IdValidator.isValidId(gateId, 'gate')).toBe(true);
        expect(IdValidator.isValidId(wireId, 'gate')).toBe(false);
        expect(IdValidator.isValidId(gateId, 'wire')).toBe(false);
        expect(IdValidator.isValidId(wireId, 'wire')).toBe(true);
      });
    });

    describe('isValidGateId', () => {
      it('有効なゲートIDを正しく識別する', () => {
        const gateId = 'gate-1640995200000-500-abc123def456';
        
        expect(IdValidator.isValidGateId(gateId)).toBe(true);
      });

      it('無効なゲートIDを正しく識別する', () => {
        expect(IdValidator.isValidGateId('wire-1640995200000-500-abc123def456')).toBe(false);
        expect(IdValidator.isValidGateId('invalid-id')).toBe(false);
      });
    });

    describe('isValidWireId', () => {
      it('有効なワイヤーIDを正しく識別する', () => {
        const wireId = 'wire-1640995200000-500-abc123def456';
        
        expect(IdValidator.isValidWireId(wireId)).toBe(true);
      });

      it('無効なワイヤーIDを正しく識別する', () => {
        expect(IdValidator.isValidWireId('gate-1640995200000-500-abc123def456')).toBe(false);
      });
    });

    describe('isValidCircuitId', () => {
      it('有効な回路IDを正しく識別する', () => {
        const circuitId = 'circuit-1640995200000-500-abc123def456';
        
        expect(IdValidator.isValidCircuitId(circuitId)).toBe(true);
      });
    });

    describe('isValidCustomGateId', () => {
      it('有効なカスタムゲートIDを正しく識別する', () => {
        const customGateId = 'custom-1640995200000-500-abc123def456';
        
        expect(IdValidator.isValidCustomGateId(customGateId)).toBe(true);
      });
    });
  });

  describe('レガシー互換性関数', () => {
    it('generateGateId関数が正しく動作する', () => {
      const id = generateGateId();
      
      expect(id).toMatch(/^gate-\d+-\d+-[a-z0-9]+$/);
    });

    it('generateWireId関数が正しく動作する', () => {
      const id = generateWireId();
      
      expect(id).toMatch(/^wire-\d+-\d+-[a-z0-9]+$/);
    });

    it('generateCircuitId関数が正しく動作する', () => {
      const id = generateCircuitId();
      
      expect(id).toMatch(/^circuit-\d+-\d+-[a-z0-9]+$/);
    });

    it('generateCustomGateId関数が正しく動作する', () => {
      const id = generateCustomGateId();
      
      expect(id).toMatch(/^custom-\d+-\d+-[a-z0-9]+$/);
    });
  });

  describe('ランダム文字列生成', () => {
    it('基本的なID生成が正しく動作する', () => {
      const id = IdGenerator.generateGateId();
      
      expect(id).toMatch(/^gate-\d+-\d+-[a-z0-9]+$/);
      expect(id).toContain('gate-1640995200000');
    });

    it('ランダム性が確保されている', () => {
      // Math.randomをリセットして異なる値を生成
      vi.spyOn(Math, 'random').mockReturnValueOnce(0.1).mockReturnValueOnce(0.9);
      
      const id1 = IdGenerator.generateGateId();
      const id2 = IdGenerator.generateGateId();
      
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^gate-\d+-\d+-[a-z0-9]+$/);
      expect(id2).toMatch(/^gate-\d+-\d+-[a-z0-9]+$/);
    });
  });
});
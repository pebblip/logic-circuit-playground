import { describe, it, expect } from 'vitest';
import {
  success,
  failure,
  isSuccess,
  isFailure,
  mapResult,
  flatMapResult,
  createGateResult,
  createValidationError,
  createEvaluationError,
  createDependencyError,
  defaultConfig,
  type Result,
  type GateEvaluationResult,
  type ValidationError,
  type EvaluationError,
  type DependencyError
} from '@domain/simulation/pure/types';

describe('Pure API Types', () => {
  describe('Result型パターン', () => {
    describe('success/failure作成', () => {
      it('should create success result', () => {
        const result = success('test data');
        
        expect(result.success).toBe(true);
        expect(result.data).toBe('test data');
        expect(result.warnings).toEqual([]);
      });

      it('should create success result with warnings', () => {
        const warnings = ['warning1', 'warning2'];
        const result = success('test data', warnings);
        
        expect(result.success).toBe(true);
        expect(result.data).toBe('test data');
        expect(result.warnings).toEqual(warnings);
      });

      it('should create failure result', () => {
        const error = createValidationError('test error');
        const result = failure(error);
        
        expect(result.success).toBe(false);
        expect(result.error).toBe(error);
        expect(result.warnings).toEqual([]);
      });

      it('should create failure result with warnings', () => {
        const error = createValidationError('test error');
        const warnings = ['warning1'];
        const result = failure(error, warnings);
        
        expect(result.success).toBe(false);
        expect(result.error).toBe(error);
        expect(result.warnings).toEqual(warnings);
      });
    });

    describe('型ガード', () => {
      it('should correctly identify success results', () => {
        const successResult = success('data');
        const failureResult = failure(createValidationError('error'));
        
        expect(isSuccess(successResult)).toBe(true);
        expect(isSuccess(failureResult)).toBe(false);
      });

      it('should correctly identify failure results', () => {
        const successResult = success('data');
        const failureResult = failure(createValidationError('error'));
        
        expect(isFailure(successResult)).toBe(false);
        expect(isFailure(failureResult)).toBe(true);
      });

      it('should provide type safety with type guards', () => {
        const result: Result<string, ValidationError> = success('test');
        
        if (isSuccess(result)) {
          // TypeScriptはここで result.data が string 型であることを知っている
          expect(typeof result.data).toBe('string');
          expect(result.data.length).toBe(4);
        }
        
        if (isFailure(result)) {
          // TypeScriptはここで result.error が ValidationError 型であることを知っている
          expect(result.error.type).toBe('VALIDATION_ERROR');
        }
      });
    });

    describe('Result型操作', () => {
      it('should map success values', () => {
        const result = success(10);
        const mapped = mapResult(result, x => x * 2);
        
        expect(mapped.success).toBe(true);
        if (mapped.success) {
          expect(mapped.data).toBe(20);
        }
      });

      it('should not map failure values', () => {
        const error = createValidationError('error');
        const result = failure(error);
        const mapped = mapResult(result, x => x * 2);
        
        expect(mapped.success).toBe(false);
        if (!mapped.success) {
          expect(mapped.error).toBe(error);
        }
      });

      it('should preserve warnings in map operations', () => {
        const warnings = ['warning'];
        const result = success(10, warnings);
        const mapped = mapResult(result, x => x * 2);
        
        expect(mapped.success).toBe(true);
        if (mapped.success) {
          expect(mapped.warnings).toEqual(warnings);
        }
      });

      it('should flat map success values', () => {
        const result = success(10);
        const flatMapped = flatMapResult(result, x => success(x * 2));
        
        expect(flatMapped.success).toBe(true);
        if (flatMapped.success) {
          expect(flatMapped.data).toBe(20);
        }
      });

      it('should handle flat map with failure', () => {
        const result = success(10);
        const error = createValidationError('error');
        const flatMapped = flatMapResult(result, () => failure(error));
        
        expect(flatMapped.success).toBe(false);
        if (!flatMapped.success) {
          expect(flatMapped.error).toBe(error);
        }
      });

      it('should combine warnings in flat map', () => {
        const warnings1 = ['warning1'];
        const warnings2 = ['warning2'];
        const result = success(10, warnings1);
        const flatMapped = flatMapResult(result, x => success(x * 2, warnings2));
        
        expect(flatMapped.success).toBe(true);
        if (flatMapped.success) {
          expect(flatMapped.warnings).toEqual(['warning1', 'warning2']);
        }
      });
    });
  });

  describe('エラー作成ヘルパー', () => {
    describe('createValidationError', () => {
      it('should create validation error with default values', () => {
        const error = createValidationError('test message');
        
        expect(error.type).toBe('VALIDATION_ERROR');
        expect(error.message).toBe('test message');
        expect(error.violations).toEqual([]);
        expect(error.context).toBeUndefined();
      });

      it('should create validation error with violations', () => {
        const violations = [
          { field: 'id', value: '', constraint: 'must not be empty' }
        ];
        const error = createValidationError('test message', violations);
        
        expect(error.violations).toEqual(violations);
      });

      it('should create validation error with context', () => {
        const context = { gateId: 'gate1' };
        const error = createValidationError('test message', [], context);
        
        expect(error.context).toEqual(context);
      });
    });

    describe('createEvaluationError', () => {
      it('should create evaluation error', () => {
        const error = createEvaluationError('eval error', 'GATE_LOGIC');
        
        expect(error.type).toBe('EVALUATION_ERROR');
        expect(error.message).toBe('eval error');
        expect(error.stage).toBe('GATE_LOGIC');
      });

      it('should create evaluation error with context and original error', () => {
        const originalError = new Error('original');
        const context = { gateId: 'gate1' };
        const error = createEvaluationError('eval error', 'GATE_LOGIC', context, originalError);
        
        expect(error.context).toEqual(context);
        expect(error.originalError).toBe(originalError);
      });
    });

    describe('createDependencyError', () => {
      it('should create dependency error', () => {
        const missing = ['gate1'];
        const circular = [['gate2', 'gate3', 'gate2']];
        const error = createDependencyError('dep error', missing, circular);
        
        expect(error.type).toBe('DEPENDENCY_ERROR');
        expect(error.message).toBe('dep error');
        expect(error.missingDependencies).toEqual(missing);
        expect(error.circularDependencies).toEqual(circular);
      });
    });
  });

  describe('ゲート評価結果ヘルパー', () => {
    describe('createGateResult', () => {
      it('should create single output gate result', () => {
        const outputs = [true];
        const result = createGateResult(outputs);
        
        expect(result.outputs).toEqual([true]);
        expect(result.primaryOutput).toBe(true);
        expect(result.isSingleOutput).toBe(true);
        expect(result.metadata).toBeUndefined();
        expect(result.debugInfo).toBeUndefined();
      });

      it('should create multi output gate result', () => {
        const outputs = [true, false, true];
        const result = createGateResult(outputs);
        
        expect(result.outputs).toEqual([true, false, true]);
        expect(result.primaryOutput).toBe(true);
        expect(result.isSingleOutput).toBe(false);
      });

      it('should handle empty outputs', () => {
        const outputs: boolean[] = [];
        const result = createGateResult(outputs);
        
        expect(result.outputs).toEqual([]);
        expect(result.primaryOutput).toBe(false); // デフォルト値
        expect(result.isSingleOutput).toBe(false);
      });

      it('should include metadata and debug info', () => {
        const outputs = [true];
        const metadata = {
          evaluationTime: 1.5,
          inputValidation: {
            expectedInputCount: 2,
            actualInputCount: 2,
            isValid: true
          }
        };
        const debugInfo = {
          gateId: 'gate1',
          gateType: 'AND',
          inputs: [true, false],
          evaluationTimeMs: 1.5,
          intermediateValues: { test: 'value' }
        };
        
        const result = createGateResult(outputs, metadata, debugInfo);
        
        expect(result.metadata).toEqual(metadata);
        expect(result.debugInfo).toEqual(debugInfo);
      });
    });
  });

  describe('デフォルト設定', () => {
    it('should provide valid default configuration', () => {
      expect(defaultConfig).toBeDefined();
      expect(defaultConfig.timeProvider).toBeDefined();
      expect(typeof defaultConfig.timeProvider.getCurrentTime).toBe('function');
      expect(typeof defaultConfig.enableDebug).toBe('boolean');
      expect(typeof defaultConfig.strictValidation).toBe('boolean');
      expect(typeof defaultConfig.maxRecursionDepth).toBe('number');
      
      // 実行可能であることを確認
      const time = defaultConfig.timeProvider.getCurrentTime();
      expect(typeof time).toBe('number');
      expect(time).toBeGreaterThan(0);
    });

    it('should have reasonable default values', () => {
      expect(defaultConfig.enableDebug).toBe(false);
      expect(defaultConfig.strictValidation).toBe(true);
      expect(defaultConfig.maxRecursionDepth).toBe(100);
    });
  });

  describe('不変性の確認', () => {
    it('should provide reference stability for primitive data', () => {
      const originalData = 'test string';
      const result = success(originalData);
      
      // プリミティブ値は不変
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(originalData);
      }
    });

    it('should provide shallow immutability protection through readonly types', () => {
      const originalWarnings = ['warning1'];
      const result = success('data', originalWarnings);
      
      // TypeScriptコンパイル時にreadonlyによる保護がある
      // result.warnings.push('new warning'); // コンパイルエラーになるべき
      // result.warnings[0] = 'modified'; // コンパイルエラーになるべき
      
      // 型レベルでの保護を確認
      expect(result.warnings).toEqual(['warning1']);
      expect(Array.isArray(result.warnings)).toBe(true);
    });
  });

  describe('型安全性の確認', () => {
    it('should enforce readonly arrays', () => {
      const result = createGateResult([true, false]);
      
      // TypeScriptレベルでreadonly配列の変更が防がれる
      // result.outputs.push(true); // コンパイルエラーになるべき
      // result.outputs[0] = false; // コンパイルエラーになるべき
      
      expect(result.outputs).toEqual([true, false]);
    });

    it('should work with generic types', () => {
      interface CustomData {
        id: string;
        value: number;
      }
      
      const data: CustomData = { id: 'test', value: 42 };
      const result: Result<CustomData, ValidationError> = success(data);
      
      if (isSuccess(result)) {
        // TypeScriptは result.data が CustomData 型であることを認識
        expect(result.data.id).toBe('test');
        expect(result.data.value).toBe(42);
      }
    });
  });

  describe('エラーチェーン', () => {
    it('should chain multiple operations and preserve first error', () => {
      const error1 = createValidationError('first error');
      const error2 = createEvaluationError('second error', 'GATE_LOGIC');
      
      const result = failure(error1);
      const mapped = mapResult(result, x => x + '!');
      const flatMapped = flatMapResult(mapped, () => failure(error2));
      
      expect(flatMapped.success).toBe(false);
      if (!flatMapped.success) {
        expect(flatMapped.error).toBe(error1); // 最初のエラーが保持される
      }
    });

    it('should accumulate warnings through operations', () => {
      const result1 = success('data', ['warning1']);
      const result2 = flatMapResult(result1, data => success(data.toUpperCase(), ['warning2']));
      const result3 = mapResult(result2, data => data + '!');
      
      expect(result3.success).toBe(true);
      if (result3.success) {
        expect(result3.data).toBe('DATA!');
        expect(result3.warnings).toEqual(['warning1', 'warning2']);
      }
    });
  });
});
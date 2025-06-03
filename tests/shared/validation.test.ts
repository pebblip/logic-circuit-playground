import { describe, it, expect } from 'vitest';
import { 
  ValidationRules, 
  FormValidator, 
  combineValidations, 
  validate, 
  validateCircuitName, 
  validateGateName, 
  validateJsonFileName 
} from '@shared/validation';

describe('統一バリデーションシステム', () => {
  describe('ValidationRules', () => {
    describe('required', () => {
      const validator = ValidationRules.required('テストフィールド');

      it('有効な値を受け入れる', () => {
        const result = validator('有効な値');
        
        expect(result.isValid).toBe(true);
        expect(result.value).toBe('有効な値');
        expect(result.error).toBeUndefined();
      });

      it('空文字列を拒否する', () => {
        const result = validator('');
        
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('テストフィールドを入力してください');
      });

      it('空白のみの文字列を拒否する', () => {
        const result = validator('   ');
        
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('テストフィールドを入力してください');
      });

      it('前後の空白をトリムする', () => {
        const result = validator('  有効な値  ');
        
        expect(result.isValid).toBe(true);
        expect(result.value).toBe('有効な値');
      });
    });

    describe('length', () => {
      const validator = ValidationRules.length(2, 10, 'テストフィールド');

      it('有効な長さの値を受け入れる', () => {
        const result = validator('有効');
        
        expect(result.isValid).toBe(true);
        expect(result.value).toBe('有効');
      });

      it('短すぎる値を拒否する', () => {
        const result = validator('短');
        
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('テストフィールドは2文字以上で入力してください');
      });

      it('長すぎる値を拒否する', () => {
        const result = validator('これは長すぎる値ですよ。この文字列は10文字を超えています');
        
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('テストフィールドは10文字以内で入力してください');
      });
    });

    describe('circuitName', () => {
      const validator = ValidationRules.circuitName();

      it('有効な回路名を受け入れる', () => {
        const result = validator('有効な回路名');
        
        expect(result.isValid).toBe(true);
        expect(result.value).toBe('有効な回路名');
      });

      it('空の回路名を拒否する', () => {
        const result = validator('');
        
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('回路名を入力してください');
      });

      it('長すぎる回路名を拒否する', () => {
        const longName = 'a'.repeat(101);
        const result = validator(longName);
        
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('回路名は100文字以内で入力してください');
      });

      it('無効な文字を含む回路名を拒否する', () => {
        const result = validator('無効な<文字>を含む回路名');
        
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('回路名に使用できない文字が含まれています');
      });

      it('パス区切り文字を含む回路名を拒否する', () => {
        const result = validator('パス/区切り\\文字');
        
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('回路名に使用できない文字が含まれています');
      });
    });

    describe('gateName', () => {
      const validator = ValidationRules.gateName();

      it('有効なゲート名を受け入れる', () => {
        const result = validator('validGateName');
        
        expect(result.isValid).toBe(true);
        expect(result.value).toBe('validGateName');
      });

      it('アンダースコアを含むゲート名を受け入れる', () => {
        const result = validator('valid_gate_name');
        
        expect(result.isValid).toBe(true);
        expect(result.value).toBe('valid_gate_name');
      });

      it('数字で始まるゲート名を拒否する', () => {
        const result = validator('1invalidName');
        
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('ゲート名は英字で始まり、英数字とアンダースコアのみ使用できます');
      });

      it('無効な文字を含むゲート名を拒否する', () => {
        const result = validator('invalid-name');
        
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('ゲート名は英字で始まり、英数字とアンダースコアのみ使用できます');
      });

      it('長すぎるゲート名を拒否する', () => {
        const longName = 'a'.repeat(51);
        const result = validator(longName);
        
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('ゲート名は50文字以内で入力してください');
      });
    });

    describe('displayName', () => {
      const validator = ValidationRules.displayName();

      it('有効な表示名を受け入れる', () => {
        const result = validator('有効な表示名');
        
        expect(result.isValid).toBe(true);
        expect(result.value).toBe('有効な表示名');
      });

      it('空の表示名を拒否する', () => {
        const result = validator('');
        
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('表示名を入力してください');
      });

      it('長すぎる表示名を拒否する', () => {
        const longName = 'a'.repeat(31);
        const result = validator(longName);
        
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('表示名は30文字以内で入力してください');
      });
    });

    describe('description', () => {
      const validator = ValidationRules.description();

      it('有効な説明を受け入れる', () => {
        const result = validator('有効な説明文');
        
        expect(result.isValid).toBe(true);
        expect(result.value).toBe('有効な説明文');
      });

      it('空の説明を受け入れる', () => {
        const result = validator('');
        
        expect(result.isValid).toBe(true);
        expect(result.value).toBe('');
      });

      it('長すぎる説明を拒否する', () => {
        const longDescription = 'a'.repeat(501);
        const result = validator(longDescription);
        
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('説明は500文字以内で入力してください');
      });
    });

    describe('tag', () => {
      const validator = ValidationRules.tag();

      it('有効なタグを受け入れる', () => {
        const result = validator('有効なタグ');
        
        expect(result.isValid).toBe(true);
        expect(result.value).toBe('有効なタグ');
      });

      it('スペースを含むタグを拒否する', () => {
        const result = validator('無効 なタグ');
        
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('タグにスペースやカンマは使用できません');
      });

      it('カンマを含むタグを拒否する', () => {
        const result = validator('無効,なタグ');
        
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('タグにスペースやカンマは使用できません');
      });
    });

    describe('fileName', () => {
      const validator = ValidationRules.fileName(['.json', '.txt']);

      it('有効な拡張子のファイル名を受け入れる', () => {
        const result = validator('test.json');
        
        expect(result.isValid).toBe(true);
        expect(result.value).toBe('test.json');
      });

      it('無効な拡張子のファイル名を拒否する', () => {
        const result = validator('test.pdf');
        
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('ファイル形式は .json, .txt のみサポートしています');
      });

      it('無効な文字を含むファイル名を拒否する', () => {
        const result = validator('test<invalid>.json');
        
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('ファイル名に使用できない文字が含まれています');
      });
    });

    describe('number', () => {
      const validator = ValidationRules.number(1, 100);

      it('有効な数値を受け入れる', () => {
        const result = validator('50');
        
        expect(result.isValid).toBe(true);
        expect(result.value).toBe(50);
      });

      it('数値型の入力を受け入れる', () => {
        const result = validator(75);
        
        expect(result.isValid).toBe(true);
        expect(result.value).toBe(75);
      });

      it('範囲外の数値を拒否する', () => {
        const result = validator('150');
        
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('100以下の値を入力してください');
      });

      it('非数値を拒否する', () => {
        const result = validator('abc');
        
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('数値を入力してください');
      });
    });

    describe('frequency', () => {
      const validator = ValidationRules.frequency();

      it('有効な周波数を受け入れる', () => {
        const result = validator('50');
        
        expect(result.isValid).toBe(true);
        expect(result.value).toBe(50);
      });

      it('負の値を拒否する', () => {
        const result = validator('-10');
        
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('周波数は正の数値を入力してください');
      });

      it('大きすぎる値を拒否する', () => {
        const result = validator('150');
        
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('周波数は100Hz以下で入力してください');
      });
    });
  });

  describe('combineValidations', () => {
    it('複数のバリデーションを組み合わせる', () => {
      const combined = combineValidations(
        ValidationRules.required('テスト'),
        ValidationRules.length(2, 10, 'テスト')
      );

      const validResult = combined('有効な値');
      expect(validResult.isValid).toBe(true);

      const invalidResult = combined('この文字列は長すぎるためバリデーションに失敗します');
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.error).toBe('テストは10文字以内で入力してください');
    });

    it('最初の失敗で停止する', () => {
      const combined = combineValidations(
        ValidationRules.required('テスト'),
        ValidationRules.length(2, 10, 'テスト')
      );

      const result = combined('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('テストを入力してください');
    });
  });

  describe('FormValidator', () => {
    it('複数フィールドのバリデーションを管理する', () => {
      const validator = new FormValidator()
        .addField('name', ValidationRules.required('名前'))
        .addField('description', ValidationRules.length(0, 100, '説明'));

      validator.setValues({
        name: '有効な名前',
        description: '有効な説明'
      });

      const result = validator.validateAll();
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
      expect(result.values.name).toBe('有効な名前');
    });

    it('エラーがある場合は適切に報告する', () => {
      const validator = new FormValidator()
        .addField('name', ValidationRules.required('名前'))
        .addField('email', ValidationRules.required('メール'));

      validator.setValues({
        name: '',
        email: 'valid@example.com'
      });

      const result = validator.validateAll();
      
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('名前を入力してください');
      expect(result.errors.email).toBeUndefined();
    });

    it('単一フィールドのバリデーションができる', () => {
      const validator = new FormValidator()
        .addField('name', ValidationRules.required('名前'));

      validator.setValue('name', '有効な名前');

      const result = validator.validateField('name');
      expect(result.isValid).toBe(true);
    });
  });

  describe('ヘルパー関数', () => {
    describe('validate', () => {
      it('単一値の即座なバリデーションができる', () => {
        const result = validate('テスト値', ValidationRules.required('テスト'));
        
        expect(result.isValid).toBe(true);
        expect(result.value).toBe('テスト値');
      });
    });

    describe('validateCircuitName', () => {
      it('回路名の即座なバリデーションができる', () => {
        const result = validateCircuitName('有効な回路名');
        
        expect(result.isValid).toBe(true);
        expect(result.value).toBe('有効な回路名');
      });
    });

    describe('validateGateName', () => {
      it('ゲート名の即座なバリデーションができる', () => {
        const result = validateGateName('validGateName');
        
        expect(result.isValid).toBe(true);
        expect(result.value).toBe('validGateName');
      });
    });

    describe('validateJsonFileName', () => {
      it('JSONファイル名の即座なバリデーションができる', () => {
        const result = validateJsonFileName('test.json');
        
        expect(result.isValid).toBe(true);
        expect(result.value).toBe('test.json');
      });

      it('非JSONファイル名を拒否する', () => {
        const result = validateJsonFileName('test.txt');
        
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('ファイル形式は .json のみサポートしています');
      });
    });
  });
});
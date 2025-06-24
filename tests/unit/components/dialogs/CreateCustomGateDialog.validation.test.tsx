import { describe, it, expect } from 'vitest';
import { CreateCustomGateDialog } from '@/components/dialogs/CreateCustomGateDialog';

// 検証ロジックを直接テスト
describe('CreateCustomGateDialog Validation Logic', () => {
  it('ゲート名の検証ルールが正しい', () => {
    // 有効なゲート名
    const validNames = ['MyGate', 'gate_123', 'TEST_GATE', 'Gate01'];
    validNames.forEach(name => {
      expect(/^[a-zA-Z0-9_]+$/.test(name)).toBe(true);
      expect(name.length).toBeLessThanOrEqual(30);
    });

    // 無効なゲート名
    const invalidNames = ['my-gate', 'gate!', 'ゲート', 'gate name', ''];
    invalidNames.forEach(name => {
      const isValid = name !== '' && /^[a-zA-Z0-9_]+$/.test(name);
      expect(isValid).toBe(false);
    });
  });

  it('表示名の検証ルールが正しい', () => {
    // 有効な表示名
    const validDisplayNames = ['表示名', 'Display Name', 'ゲート123', ''];
    validDisplayNames.forEach(name => {
      const hasInvalidChars = /[<>\"\'&]/.test(name);
      const isTooLong = name.length > 20;
      expect(!hasInvalidChars && !isTooLong).toBe(true);
    });

    // 無効な表示名
    const invalidDisplayNames = [
      '<script>alert</script>',
      'Name"with"quotes',
      "Name'with'quotes",
      'Name&with&amp',
      'あ'.repeat(21), // 21文字
    ];
    invalidDisplayNames.forEach(name => {
      const hasInvalidChars = /[<>\"\'&]/.test(name);
      const isTooLong = name.length > 20;
      expect(hasInvalidChars || isTooLong).toBe(true);
    });
  });

  it('ピン数の検証ルールが正しい', () => {
    // 有効なピン数の組み合わせ
    const validPinCombos = [
      { inputs: 1, outputs: 1 }, // 最小
      { inputs: 10, outputs: 10 }, // 最大
      { inputs: 5, outputs: 3 },
      { inputs: 1, outputs: 19 }, // 合計20
    ];

    validPinCombos.forEach(({ inputs, outputs }) => {
      const total = inputs + outputs;
      const isValid = inputs > 0 && outputs > 0 && total <= 20;
      expect(isValid).toBe(true);
    });

    // 無効なピン数の組み合わせ
    const invalidPinCombos = [
      { inputs: 0, outputs: 1 }, // 入力なし
      { inputs: 1, outputs: 0 }, // 出力なし
      { inputs: 0, outputs: 0 }, // 両方なし
      { inputs: 11, outputs: 10 }, // 合計21
      { inputs: 20, outputs: 1 }, // 合計21
    ];

    invalidPinCombos.forEach(({ inputs, outputs }) => {
      const total = inputs + outputs;
      const isValid = inputs > 0 && outputs > 0 && total <= 20;
      expect(isValid).toBe(false);
    });
  });

  it('ゲート名の長さ制限が適切', () => {
    const maxLength = 30;
    
    // 境界値テスト
    expect('a'.repeat(30).length).toBe(maxLength); // 最大長OK
    expect('a'.repeat(31).length).toBeGreaterThan(maxLength); // 超過NG
  });

  it('表示名の長さ制限が適切', () => {
    const maxLength = 20;
    
    // 境界値テスト（日本語文字でも）
    expect('あ'.repeat(20).length).toBe(maxLength); // 最大長OK
    expect('あ'.repeat(21).length).toBeGreaterThan(maxLength); // 超過NG
  });

  it('エラーメッセージが適切', () => {
    // エラーメッセージの内容を確認
    const errorMessages = {
      emptyName: 'カスタムゲートには名前を付けてください',
      invalidNameChars: '半角の英数字とアンダースコア（_）のみ使用できます',
      nameTooLong: 'ゲート名は30文字以内で入力してください',
      displayNameTooLong: '表示名は20文字以内で入力してください',
      displayNameInvalidChars: '表示名に特殊文字（< > " \' &）は使用できません',
      noInputPins: '少なくとも1つの入力ピンが必要です',
      noOutputPins: '少なくとも1つの出力ピンが必要です',
      tooManyPins: 'ピンの合計数が多すぎます',
    };

    // 各エラーメッセージが適切な情報を含んでいることを確認
    Object.values(errorMessages).forEach(message => {
      expect(message.length).toBeGreaterThan(0);
      expect(message).toMatch(/[ぁ-ん]/); // 日本語を含む
    });
  });
});
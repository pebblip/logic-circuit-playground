/**
 * 統一エラーハンドリングシステムの動作テスト
 *
 * 新しいシステムが正常に動作するかをテストするための一時的なファイル
 */

import {
  handleError,
  handleCircuitError,
  handleWarning,
  handleInfo,
} from './infrastructure/errorHandler';

// テスト実行関数
export const testUnifiedErrorSystem = () => {
  console.log('=== 統一エラーハンドリングシステムのテスト開始 ===');

  // 1. 基本的なエラーハンドリング
  console.log('\n1. 基本的なエラーハンドリング');
  handleError(new Error('テスト用エラー'), 'test-context', {
    userAction: 'テストボタンクリック',
  });

  // 2. 回路評価エラー
  console.log('\n2. 回路評価エラー');
  handleCircuitError(
    new Error('Circuit evaluation failed'),
    'circuit-simulation',
    'ゲート追加'
  );

  // 3. 警告メッセージ
  console.log('\n3. 警告メッセージ');
  handleWarning(
    'パフォーマンスの問題が検出されました',
    'performance-check',
    'ゲート数確認'
  );

  // 4. 情報メッセージ
  console.log('\n4. 情報メッセージ');
  handleInfo(
    'カスタムゲートが作成されました',
    'custom-gate-creation',
    'ゲート作成完了'
  );

  // 5. 特定のエラータイプテスト
  console.log('\n5. カスタムゲートエラー');
  handleError('カスタムゲートの定義が無効です', 'custom-gate-validation', {
    severity: 'medium',
    actions: [
      {
        label: 'テストアクション',
        action: () => console.log('テストアクション実行'),
      },
    ],
  });

  console.log('\n=== テスト完了 ===');
};

// ブラウザのコンソールから実行できるように
if (typeof window !== 'undefined') {
  (window as any).testUnifiedErrorSystem = testUnifiedErrorSystem;
}

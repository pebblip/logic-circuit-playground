# 学習モード新アーキテクチャ移行ガイド

## 概要

学習モードを文字列パースベースから構造化されたコンポーネントベースのアーキテクチャに移行します。

## 主な変更点

### 1. 型定義の追加
- `types/lesson-content.ts`: 構造化されたコンテンツ要素の型定義
- 各コンテンツタイプに専用の型（TextContent, TableContent, QuizContent など）

### 2. コンポーネントの分離
- `components/content-renderers/`: 各コンテンツタイプ専用のレンダラー
  - TextRenderer
  - HeadingRenderer
  - ListRenderer
  - TableRenderer
  - BinaryExpressionRenderer
  - ComparisonRenderer
  - ExperimentResultRenderer
  - QuizRenderer
  - ContentRenderer（統合レンダラー）

### 3. レッスンステップレンダラー
- `components/LessonStepRenderer.tsx`: ステップ全体のレンダリング

## 移行手順

### 1. 新しい構造化レッスンの作成

```typescript
import type { StructuredLesson } from '../../types/lesson-content';

export const myLesson: StructuredLesson = {
  id: 'my-lesson',
  title: 'レッスンタイトル',
  lessonType: 'gate-intro', // レッスンタイプを指定
  steps: [
    {
      id: 'step1',
      instruction: '基本の説明文',
      content: [
        {
          type: 'heading',
          level: 4,
          text: '見出し'
        },
        {
          type: 'text',
          text: 'テキストコンテンツ'
        },
        {
          type: 'table',
          headers: ['入力', '出力'],
          rows: [['0', '1'], ['1', '0']]
        }
      ],
      action: { type: 'explanation' }
    }
  ]
};
```

### 2. 既存レッスンの段階的移行

1. `contentParser.ts` を使用して既存のレッスンを自動変換
2. 生成された構造を確認・調整
3. `structured-lessons/` ディレクトリに保存
4. LearningPanelV2 の `structuredLessons` に追加

### 3. テスト

1. 新旧両方のフォーマットが正しく表示されることを確認
2. パフォーマンスの改善を測定
3. エッジケースのテスト

## 利点

1. **型安全性**: すべてのコンテンツが型付けされている
2. **保守性**: 各コンテンツタイプが独立したコンポーネント
3. **拡張性**: 新しいコンテンツタイプの追加が容易
4. **パフォーマンス**: 文字列パースの削減
5. **テスタビリティ**: 各コンポーネントを個別にテスト可能

## 注意事項

1. 既存のレッスンは引き続き動作（後方互換性）
2. 新しいレッスンは構造化フォーマットで作成
3. 段階的に移行（一度にすべてを変更しない）

## 次のステップ

1. 主要なレッスンから順次移行
2. パフォーマンス測定とフィードバック収集
3. 必要に応じてコンポーネントの最適化
4. 全レッスンの移行完了後、旧コードの削除
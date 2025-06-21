# LogiCirc テスト戦略 v3.0

> このドキュメントは、LogiCircプロジェクトの包括的なテスト戦略を定義します。  
> 最終更新: 2025-06-21

## 🎯 基本理念

**テストは機能を守るもの、バグを追いかけるものではない**

## 📐 永続的な品質基準

### テストの価値判定基準

```typescript
interface ValuableTest {
  // 必須要件（全て満たす）
  verifiesFunctionality: boolean;    // 機能の動作を検証
  clearFailureMessage: boolean;      // 失敗時に原因が明確
  maintainable: boolean;             // 実装変更に強い

  // 除外要件（1つでも該当したら削除）
  onlyChecksExistence?: boolean;     // 存在確認のみ
  bugSpecific?: boolean;             // 特定バグ専用
  implementationDependent?: boolean;  // 実装詳細に依存
}
```

## 🏗️ テストアーキテクチャ

### 機能カバレッジマトリックス

| 機能 | Unit | Integration | E2E |
|------|------|-------------|-----|
| 回路エディタ | ✓ | ✓ | ✓ |
| シミュレーション | ✓ | ✓ | - |
| 学習モード | ✓ | ✓ | ✓ |
| ギャラリー | ✓ | ✓ | ✓ |
| カスタムゲート | ✓ | ✓ | ✓ |
| データ永続化 | ✓ | ✓ | ✓ |

### テストピラミッド

```
         /\
        /E2E\      (10%) - クリティカルユーザージャーニー
       /------\
      /統合テスト\   (20%) - 機能間連携
     /----------\
    /  単体テスト  \  (70%) - コアロジック
   /--------------\
```

## 📝 実行計画

### Phase 1: 既存テストの整理（Week 1）

#### 削除対象（基準に基づく）

1. **存在確認のみのテスト**
   - `tests/bug-fixes/binary-counter-*.test.tsx`
   - `tests/components/canvas/canvasTypes.test.ts`

2. **特定バグ専用のテスト**
   - `tests/bug-fixes/*.test.ts` → 機能テストに統合

3. **実装詳細依存のテスト**
   - 過度に詳細なフック・ユーティリティテスト

#### 保持・改善対象

- **コア機能**
  - `tests/domain/simulation/core/gateEvaluation.test.ts`
  - `tests/stores/circuitStore.test.ts`

- **統合価値あり**（リファクタリング）
  - `tests/components/canvas/UnifiedCanvas.test.tsx`
  - `tests/features/gallery/gallery-mode.test.tsx`

### Phase 2: 新規テスト体系の構築（Week 2-3）

#### 機能単位のテストスイート

```
src/features/editor/tests/
├── editor-operations.test.ts      // ゲート配置、ワイヤー接続
├── editor-constraints.test.ts     // 制約条件、バリデーション
└── editor-integration.test.tsx    // UIとロジックの連携

src/features/simulation/tests/
├── logic-evaluation.test.ts       // 全ゲートタイプの評価
├── circuit-analysis.test.ts       // 循環検出、依存解析
└── timing-simulation.test.ts      // クロック、遅延モード

src/features/learning/tests/
├── lesson-progression.test.ts     // レッスン進行ロジック
├── quiz-evaluation.test.ts        // クイズ採点
└── learning-flow.test.tsx         // 学習体験全体
```

#### E2Eシナリオテスト（厳選）

```
cypress/e2e/scenarios/
├── beginner-journey.cy.ts         // 初心者の学習完了まで
├── circuit-lifecycle.cy.ts        // 作成→保存→共有→編集
├── custom-gate-mastery.cy.ts      // カスタムゲート活用
└── gallery-exploration.cy.ts      // 発見→学習→応用
```

### Phase 3: 継続的品質管理（Week 4+）

#### 自動品質ゲート

```yaml
# .github/workflows/test-quality.yml
- name: Check Test Quality
  run: |
    # toBeInTheDocument()のみのテスト検出
    # バグ番号を含むテスト名の検出
    # カバレッジ低下の防止
```

#### テスト追加ルール

新規テスト追加時は以下のチェックリストを確認：

- [ ] 機能の動作を検証している
- [ ] 失敗時のメッセージが明確
- [ ] 実装変更に強い
- [ ] 既存テストと重複していない

## 📈 成功指標と監視

| 指標 | 目標 | 測定方法 |
|------|------|----------|
| 機能カバレッジ | 100% | 全機能に対応するテスト |
| 回帰バグ率 | 0% | 同じバグの再発ゼロ |
| テスト保守コスト | <20% | 実装変更時のテスト修正率 |
| 新規バグ検出 | >80% | 本番前にテストで検出 |

## 🚦 品質の持続性を保つ仕組み

### 定期レビュー（月次）
- テスト価値の再評価
- 重複・陳腐化したテストの削除
- カバレッジギャップの特定

### ドキュメント更新
- テスト設計の意図を記録
- なぜそのテストが必要かを明文化

### チーム文化
- 「とりあえずテスト追加」を避ける
- 「このテストは何を守るか」を常に問う

## 📌 関連ドキュメント

- [CLAUDE.md](../../CLAUDE.md) - 品質保証の全体方針
- [GUIDELINES.md](../GUIDELINES.md) - 開発ガイドライン
- [QUALITY_FRAMEWORK.md](../management/QUALITY_FRAMEWORK.md) - 品質フレームワーク

## 🔄 改訂履歴

- 2025-06-21: v3.0 - 機能カバレッジ重視の包括的戦略に刷新

---

> **注意**: このドキュメントは生きた文書です。プロジェクトの成長と共に継続的に更新されます。
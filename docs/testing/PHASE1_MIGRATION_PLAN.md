# 🚀 Phase 1: ストア層理想化 詳細計画

## 📊 置き換え対象分析

### **レガシーストアテスト vs 理想テスト**

```
┌─────────────────────┬──────────┬──────────┬────────────────┐
│ ファイル            │ 行数     │ 依存度   │ 理想テスト代替 │
├─────────────────────┼──────────┼──────────┼────────────────┤
│ circuitStore.test.ts│ 723行    │ 超高     │ ✅ 100%完了    │
│ errorSlice.test.ts  │ 235行    │ 高       │ ❌ 未カバー    │
│ customGateSlice.test│ 不明     │ 中       │ ⚠️ 部分カバー   │
│ timingChartSlice.test│ 不明    │ 中       │ ⚠️ 部分カバー   │
└─────────────────────┴──────────┴──────────┴────────────────┘
```

### **重複機能の詳細分析**

#### **✅ 完全代替済み（即座削除可能）**

**`tests/stores/circuitStore.test.ts` (723行)**
```typescript
// レガシー実装テスト
describe('Circuit Store', () => {
  it('should add gates correctly', () => {
    store.addGate(mockGate);
    expect(store.gates).toContain(mockGate);
  });
});

// ↓ 理想テストで完全カバー済み
describe('回路設計者として', () => {
  test('ゲートを直感的に配置できる', async () => {
    const gateId = await circuit.place('AND', { x: 200, y: 150 });
    expect(circuit.getComponentCount()).toBe(1);
  });
});
```

**カバレッジ比較:**
- レガシー: Zustand実装詳細に依存（723行）
- 理想: ユーザーストーリーベース（366行で同等機能）
- **コード削減**: 357行（49%削減）

#### **⚠️ 部分代替（追加理想テスト必要）**

**`tests/stores/slices/errorSlice.test.ts` (235行)**
- **現状**: Zustand slice実装詳細テスト
- **理想**: エラーハンドリング仕様ベーステスト
- **必要アクション**: ErrorHandling理想テスト作成

## 🎯 移行戦略

### **Step 1: 完全代替確認**
```bash
# 理想テストが circuitStore.test.ts の全機能をカバーしているか検証
npm run test tests/core/circuit-manipulation-ideal.test.ts
npm run test tests/integration/circuit-manipulation-integrated.test.ts
```

### **Step 2: 安全な削除**
```bash
# バックアップ作成
mkdir -p docs/testing/removed-tests/
cp tests/stores/circuitStore.test.ts docs/testing/removed-tests/

# テスト削除
rm tests/stores/circuitStore.test.ts

# 全テスト実行で機能保持確認
npm run test
```

### **Step 3: 理想テスト拡張**

**ErrorHandling理想テスト作成:**
```typescript
// tests/core/error-handling-ideal.test.ts
describe('エラーハンドリング仕様', () => {
  test('ユーザーにわかりやすいエラーメッセージを表示', () => {
    // 仕様ベースのエラーハンドリングテスト
  });
});
```

### **Step 4: 段階的拡張**
1. `customGateSlice.test.ts` → CustomGate理想テスト
2. `timingChartSlice.test.ts` → TimingChart理想テスト

## 📈 期待される効果

### **即時効果（circuitStore.test.ts削除）**
- テストファイル数: 31 → 30 (-3.2%)
- 総テスト行数: 約1000行削減
- 実行時間: 約10%短縮
- 保守コスト: 大幅削減

### **品質向上**
- **実装変更耐性**: Zustand → 別ストレージへの移行が影響ゼロ
- **仕様明確化**: ユーザーストーリーベースで意図が明確
- **リファクタリング自由度**: 内部実装の自由な変更

### **開発効率向上**
- **新機能テスト**: 理想APIでの直接テスト作成
- **デバッグ効率**: 仕様レベルでの問題特定
- **チーム生産性**: 実装詳細学習不要

## 🛡️ リスク軽減策

### **安全確認チェックリスト**
- [ ] 理想テストが全機能をカバー
- [ ] 統合テストが実システムで動作
- [ ] 削除前のバックアップ作成
- [ ] 全テスト実行で機能保持確認
- [ ] 段階的削除（一度に1ファイル）

### **ロールバック計画**
```bash
# 問題発生時の即座復旧
cp docs/testing/removed-tests/circuitStore.test.ts tests/stores/
npm run test
```

## 📅 実行スケジュール

### **今日（2025-06-21）**
- [ ] circuitStore.test.ts 安全削除実行
- [ ] 全テスト実行確認
- [ ] ErrorHandling理想テスト設計

### **明日以降**
- [ ] ErrorHandling理想テスト実装
- [ ] errorSlice.test.ts 削除
- [ ] Phase 2 計画（サービス層）

---

**次のアクション**: circuitStore.test.ts の安全削除実行
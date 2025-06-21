# テスト影響度トリアージ分析

## 📊 現在のテスト状況
- **総テスト数**: 34個
- **成功率**: 100%
- **実装依存度**: 高（60-80%）

---

## 🔥 **HIGH IMPACT**（即座に改善必要）
**ユーザー価値への影響が大きく、設計改善効果が高い**

### **1. データ永続性テスト** (data-integrity.test.ts)
```typescript
// 🚨 問題: 技術実装詳細に深く依存
global.indexedDB = mockIndexedDB;
storage = CircuitStorageService.getInstance();
const testGates: Gate[] = [/* 内部データ構造 */];

// ✅ 理想: ユーザー価値ベース
describe('回路設計者として', () => {
  test('作成した回路を保存して後で再開できる', async () => {
    await circuit.create('半加算器');
    await circuit.save();
    
    await circuit.load('半加算器');
    expect(circuit.isValid()).toBe(true);
  });
});
```
**優先度**: 🔥🔥🔥 **最高**

### **2. 回路操作の低レベルAPI依存** (circuit-manipulation.test.ts)
```typescript
// 🚨 問題: 実装詳細の複雑な手順
store.startWireDrawing(inputId, -1);
store.endWireDrawing(outputId, 0);

// ✅ 理想: 直感的なユーザー操作
circuit.connect(inputGate, outputGate);
expect(circuit.areConnected(inputGate, outputGate)).toBe(true);
```
**優先度**: 🔥🔥🔥 **最高**

---

## 🟡 **MEDIUM IMPACT**（段階的改善対象）
**設計改善効果はあるが、現在動作している**

### **3. ゲート内部状態の詳細テスト**
```typescript
// 🚨 問題: 内部データ構造への依存
expect(gates[0].inputs).toEqual(['', '']);

// ✅ 改善: 動作ベースのテスト
expect(circuit.getGate(gateId).canAcceptInput()).toBe(true);
```
**優先度**: 🟡🟡 **中**

### **4. カスタムゲート評価器設定**
```typescript
// 🚨 問題: 評価エンジン実装詳細
const configWithCustomEvaluator: EvaluationConfig = {
  customGateEvaluator: { /* 詳細設定 */ }
};

// ✅ 改善: 動作ベース
expect(customGate.evaluate([true, false])).toEqual([true, false]);
```
**優先度**: 🟡 **中**

---

## 🟢 **LOW IMPACT**（現状維持）
**実装依存だが、変更リスクが低い**

### **5. 基本的なCRUD操作**
```typescript
// 動作する、リスク低、改善効果小
store.addGate('AND', position);
expect(gates).toHaveLength(1);
```
**優先度**: 🟢 **低（現状維持）**

---

## 📋 **改善計画**

### **Phase 1: HIGH IMPACT改善** (今すぐ)
1. **データ永続性の抽象化**
   - PersistencePort インターフェース設計
   - Mock実装作成
   - 仕様ベーステスト書き直し

2. **回路操作APIの直感化**
   - CircuitDesigner インターフェース設計
   - 低レベルAPI隠蔽
   - ユーザー体験ベーステスト作成

### **Phase 2: MEDIUM IMPACT改善** (3-6ヶ月後)
1. **内部状態テストの動作ベース化**
2. **カスタムゲートテストの仕様化**

### **Phase 3: 完全理想化** (1-2年後)
1. **全テストの仕様ベース化**
2. **レガシーコードのリファクタリング**

---

## 💡 **期待効果**

### **短期効果** (Phase 1完了時)
- ✅ データ永続性の安定性向上
- ✅ 回路操作の直感性向上
- ✅ 実装変更への耐性獲得

### **長期効果** (Phase 3完了時)
- 🚀 完全な設計駆動開発
- 🚀 保守コスト大幅削減
- 🚀 開発速度向上
- 🚀 品質の飛躍的向上

---

**次のアクション**: Phase 1の詳細設計開始
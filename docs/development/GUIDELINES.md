# 📋 開発ガイドライン

> 品質100%を達成するための開発規約とベストプラクティス

## 🎯 品質基準

### 必須達成項目
```bash
# コミット前に必ず全て成功させる
npm run typecheck  # 型エラー: 0個
npm run test       # テスト失敗: 0個  
npm run build      # ビルドエラー: 0個
```

### 品質指標
- **テストカバレッジ**: 新規コード80%以上
- **型安全性**: strict mode、any禁止
- **ビルド時間**: 30秒以内
- **バンドルサイズ**: 500KB以下（gzip）

---

## 🔧 開発フロー

### 1. 開発前チェック
```bash
# 現在の品質状態を確認
npm run typecheck && npm run test && npm run build
```

### 2. 開発サイクル
```
1. テスト作成（Red）
   ↓
2. 実装（Green）
   ↓
3. リファクタリング（Refactor）
   ↓
4. 品質チェック
```

### 3. コミット前チェック
```bash
# 3つ全て成功が必須
npm run typecheck
npm run test
npm run build
```

---

## 📝 コーディング規約

### TypeScript
```typescript
// ✅ 良い例
interface GateProps {
  id: string;
  type: GateType;
  position: Position;
}

// ❌ 悪い例
interface GateProps {
  id: any;  // any禁止
  type: string;  // 型定義を使う
  x: number;  // Positionオブジェクトを使う
  y: number;
}
```

### React
```typescript
// ✅ 良い例: メモ化とカスタムフック
export const GateComponent = React.memo(({ gate }: GateProps) => {
  const { isActive, toggle } = useGateState(gate.id);
  return <Gate {...} />;
});

// ❌ 悪い例: 再レンダリング多発
export const GateComponent = ({ gate }) => {
  const [state, setState] = useState();  // 型なし
  return <Gate {...} />;
});
```

### テスト
```typescript
// ✅ 良い例: 明確なテストケース
describe('CollisionDetector', () => {
  it('should detect pin hit within 20px radius', () => {
    const result = detector.detectPinHit({ x: 10, y: 10 }, pin);
    expect(result).toBe(true);
  });
});

// ❌ 悪い例: 曖昧なテスト
it('works', () => {
  expect(detector.detect()).toBeTruthy();
});
```

---

## 🚀 コミット規約

### Conventional Commits
```bash
feat: 新機能追加
fix: バグ修正
docs: ドキュメント更新
style: フォーマット修正
refactor: リファクタリング
test: テスト追加・修正
chore: ビルド・ツール関連

# 例
git commit -m "feat: add magnetic connection effect"
git commit -m "fix: pin hit detection on mobile devices"
```

### プルリクエスト
1. **タイトル**: 明確で簡潔に
2. **説明**: 何を・なぜ・どのように
3. **チェックリスト**: 品質チェック完了を確認
4. **スクリーンショット**: UI変更時は必須

---

## ⚡ パフォーマンス最適化

### React最適化
- `React.memo`で不要な再レンダリング防止
- `useMemo`で重い計算をメモ化
- `useCallback`でコールバック関数を安定化

### バンドル最適化
- 動的インポートでコード分割
- Tree shakingで未使用コード削除
- 画像・アセットの最適化

---

## 🔍 デバッグ指針

### エラー対応
1. **エラーメッセージを正確に読む**
2. **スタックトレースを追跡**
3. **最小再現コードを作成**
4. **単体テストで検証**

### パフォーマンス問題
1. **React DevToolsでプロファイリング**
2. **不要な再レンダリングを特定**
3. **メモ化で最適化**

---

## 📚 参考資料

### 必読ドキュメント
- [PROJECT_BLUEPRINT.md](../PROJECT_BLUEPRINT.md) - プロジェクト全体像
- [ARCHITECTURE.md](./ARCHITECTURE.md) - 技術設計
- [ROADMAP.md](./ROADMAP.md) - 開発計画

### 外部リソース
- [React公式ドキュメント](https://react.dev)
- [TypeScript公式ドキュメント](https://www.typescriptlang.org)
- [Conventional Commits](https://www.conventionalcommits.org)

---

## 🚨 重要な教訓

### 過去の失敗から学ぶ
- **92.2%の成功率は失敗**: 100%でなければ未完成
- **型エラーの放置は技術的負債**: 即座に修正
- **テスト失敗の放置は品質低下**: Red状態を許容しない

### プロフェッショナルの心得
- 品質に妥協しない
- エラーは即座に修正
- テストファーストを徹底
- ドキュメントを最新に保つ

---

*最終更新: 2024年1月*
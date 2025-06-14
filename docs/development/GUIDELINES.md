# 📋 開発ガイドライン

> Claude と User のための実践的開発プロセス

## 📄 必須確認事項
**セッション開始時は必ず [PROGRESS.md](../../PROGRESS.md) を確認してください**

## 🎯 基本原則

### プロジェクトの三原則
1. **動くものを最優先** - 完璧より進捗
2. **段階的改善** - 一度に全部やらない
3. **記録を残す** - 未来の自分（次のセッション）のために

## 🔄 開発サイクル

### 1. セッション開始
```bash
# 進捗確認
cat PROGRESS.md

# 現状把握
git log --oneline -10
git status
npm test
```

### 2. 開発・修正
```bash
# 小さく実装
# → テスト
# → コミット
# → 繰り返し
```

### 3. 品質確認
```bash
# 必須チェック
npm run typecheck  # 型エラー: 0
npm run test       # テスト: 通る
npm run build      # ビルド: 成功

# UI変更時
npx cypress run --spec cypress/e2e/app-smoke-test.cy.js
```

### 4. セッション終了
```bash
# PROGRESS.md更新
# コミット（引き継ぎ情報付き）
# 未完了タスクの明記
```

## 📊 作業判断基準

### テスト作成が必須の場合
- ビジネスロジックの追加・変更
- バグ修正（再発防止）
- 公開APIの変更
- 複雑な条件分岐

### スクリーンショット確認が必須の場合
- UIの新機能追加
- レイアウト変更
- 視覚的フィードバックの変更
- モバイル対応

### リファクタリングのタイミング
- 同じパターンを3回以上
- ファイル300行超過
- 関数50行超過
- ネスト4段階超過

## 📦 新機能開発フロー

### 1. 設計・検討
- アイデアをPROGRESS.mdに記録
- 既存機能への影響を確認
- アーキテクチャとの整合性確認

### 2. 実装
- 最小動作する状態から開始
- 機能追加とテスト作成を交互に
- 小さくコミット

### 3. 品質確保
- 必要なテストを追加
- スクリーンショットでUI確認
- 回帰テストで副作用チェック

### 4. ドキュメント更新
- README.md：新機能の説明
- CHANGELOG.md：変更履歴
- PROGRESS.md：進捗更新

## 📑 ドキュメント更新ルール

### 即座に更新
- **新機能追加**: README.md, CHANGELOG.md
- **破壊的変更**: 全関連ドキュメント
- **アーキテクチャ変更**: ARCHITECTURE.md

### 作業の区切りで更新
- **Phase完了時**: ROADMAP.md
- **大きな機能群の完成**: PROJECT_BLUEPRINT.md
- **10個以上のコミット後**: 全体整合性チェック

### レビュートリガー
- ユーザーからの明示的な指示
- 新Phase開始前
- 実装とドキュメントのズレを感じた時

## 🧪 テスト戦略

### テスト実行のルール
- **単体テスト**: 15秒以内（現在7.85秒）
- **E2Eテスト**: 2分以内
- **ビルド**: 30秒以内（現在5.6秒）

⚠️ 長時間実行の場合は中断して原因分析

### テスト作成の優先順位
1. バグ修正時（再発防止）
2. 新しいビジネスロジック
3. UIの重要な機能
4. エッジケース

## 💻 コーディング規約

### TypeScript
```typescript
// ✅ このプロジェクトの型定義
interface GateProps {
  gate: Gate | ClockGate | DFlipFlopGate | SRLatchGate | MuxGate | CustomGate;
  isSelected: boolean;
  onSelect: () => void;
}

// ✅ Result<T,E>パターン
const result = evaluateCircuit(circuit);
if (result.success) {
  const { gates } = result.data; // 型安全
} else {
  debug.error('Evaluation failed:', result.error.message);
}

// ❌ any型は使わない
// どうしても必要な場合は Record<string, unknown> を使用
```

### デバッグユーティリティ
```typescript
import { debug } from '@/shared/debug';

// 開発環境でのみ出力（本番では自動無効化）
debug.log('[Component] State:', state);
debug.error('Critical error:', errorDetails);
debug.table(complexData);
```

## 🔄 コミット戦略

### コミットメッセージテンプレート
```bash
git commit -m "<type>: <summary>

完了:
- 

未完了:
- 

次回作業:
1. 

技術メモ:
- 

[SESSION-NOTE] <重要な判断や気づき>"
```

### コミットタイミング
- 機能単位で動作する状態
- テストが通る状態
- 意味のある作業単位

### コミットタイプ
- `feat`: 新機能
- `fix`: バグ修正
- `refactor`: リファクタリング
- `docs`: ドキュメント
- `test`: テスト
- `chore`: ビルド・ツール

## 📊 パフォーマンス基準

### 現在の状態（参考）
- バンドルサイズ: 616KB（目標: 700KB以下）
- ビルド時間: 5.6秒（目標: 30秒以内）
- 単体テスト: 7.85秒（目標: 15秒以内）

### パフォーマンス改善のタイミング
- バンドルサイズが700KBを超えたら
- ビルド時間が目立って遅くなったら
- 操作のレスポンスが悪くなったら

## 🎯 チェックリスト

### コミット前の必須確認
- [ ] ビルドが通る `npm run build`
- [ ] 型エラーなし `npm run typecheck`
- [ ] 既存テストが通る `npm test`
- [ ] 新機能にはテスト追加
- [ ] UI変更はスクリーンショット確認
- [ ] 重要変更はCHANGELOG更新
- [ ] PROGRESS.md更新

## 📦 セッション引き継ぎ

### セッション終了時の必須作業
1. PROGRESS.mdの更新
2. 意味のある単位でコミット
3. 未完了タスクをコミットメッセージに記載

### 次のセッションでの確認
```bash
# 1. 進捗確認
cat PROGRESS.md

# 2. 現状把握
git log --oneline -10
npm test
```

## 🎯 成功の指標

### コード品質
- 型エラー: 0個
- ビルドエラー: 0個
- コンソールエラー: 0個

### プロセス品質
- 重要な変更にはテストを追加
- UI変更はスクリーンショット確認
- 動作確認後にコミット
- ドキュメントを最新に保つ

## 📚 関連ドキュメント

- [README.md](../../README.md) - プロジェクト概要
- [PROGRESS.md](../../PROGRESS.md) - 進捗管理
- [ARCHITECTURE.md](./ARCHITECTURE.md) - 技術アーキテクチャ
- [ROADMAP.md](./ROADMAP.md) - 開発ロードマップ

---

**このガイドラインはプロジェクトの進化に合わせて更新されます。**
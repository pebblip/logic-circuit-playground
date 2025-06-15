# LogiCirc - 開発ガイド for Claude

## 🎯 プロジェクト概要
このプロジェクトは教育用の論理回路シミュレータです。ユーザーは様々な論理ゲートを配置・接続して回路を作成し、リアルタイムでシミュレーションできます。

### 主な特徴
- ドラッグ&ドロップによる直感的なゲート配置
- リアルタイムシミュレーション（coreAPIベース）
- 視覚的フィードバック（アクティブな信号の表示）
- 特殊ゲート対応（CLOCK、D-FF、SR-LATCH、MUX）
- カスタムゲート作成機能（回路から新しいゲートを作成）
- 真理値表自動生成・表示機能
- 学習モード（構造化コンテンツによる段階的学習）
- 型安全性重視のコード基盤（ESLint準拠）
- レスポンシブデザイン対応（デスクトップ・タブレット・モバイル）

## 📊 必ず確認すること
**セッション開始時は必ず [PROGRESS.md](PROGRESS.md) を確認してください**
- 現在の進捗状況
- 前回の作業内容
- 次回の作業予定
- 未解決の課題

```bash
# セッション開始時の必須コマンド
cat PROGRESS.md          # 進捗確認
git log --oneline -5     # 最近のコミット
npm test                 # テスト状態
```

## 📚 ドキュメント構造

### 必読ドキュメント
1. `PROGRESS.md` - **進捗管理とセッション引き継ぎ（最重要）**
2. `docs/development/GUIDELINES.md` - 開発ガイドライン（コーディング規約、品質基準）
3. `docs/development/ARCHITECTURE.md` - アーキテクチャ（Hybrid Feature-Domain）
4. `docs/development/ROADMAP.md` - 開発ロードマップ
5. `docs/PROJECT_BLUEPRINT.md` - プロジェクト全体の青写真

### 実践的ドキュメント（セッション中によく参照）
- `docs/QUICK_START.md` - 5分で始めるガイド（環境構築・初回実行）
- `docs/FAQ.md` - よくある質問と解決方法（最優先トラブルシューティング）
- `docs/TROUBLESHOOTING.md` - 技術的問題の詳細解決方法
- `docs/COMMAND_REFERENCE.md` - 全コマンドの完全ガイド

### モックアップ
- `docs/design/mockups/final-gate-design.html` - ゲートのデザイン仕様

## 🛠️ 開発ルール

### 基本原則
1. **動く製品を最優先** - 完璧よりも動作を重視
2. **段階的な改善** - 小さな変更を積み重ねる
3. **ユーザーファースト** - 使いやすさを常に意識

### コーディング規約
```typescript
// ✅ 良い例：明確な型定義
interface Gate {
  id: string;
  type: GateType;
  position: Position;
  inputs: string[];
  output: boolean;
  metadata?: Record<string, unknown>; // 特殊ゲート用
}

// ❌ 悪い例：any型の使用
// const gate: any = { ... }; // ← 使用禁止！
```

### テスト実行
```bash
# 単体テストの実行（推奨：高速で詳細）
npm run test

# 特定のテストファイルのみ実行
npm run test -- tests/components/TruthTableDisplay.test.tsx

# E2Eテストの実行（開発中によく使う）
npm run test:e2e

# 特定のE2Eテストのみ実行
npx cypress run --spec "cypress/e2e/特定のテスト.cy.js"

# ヘッドレスモードでE2Eテスト
npm run test:e2e:headless

# TypeScriptのチェック
npm run typecheck

# ビルドの確認
npm run build
```

### 重要：テスト実行ガイドライン
- 新機能追加時は必ず対応するテストケースを追加
- カスタムゲート関連機能は`TruthTableDisplay.test.tsx`を参考にテスト作成
- テストカバレッジ80%以上を目標とする

## 📝 コミットルール

### Conventional Commits形式
```bash
# 機能追加
feat: 特殊ゲート（CLOCK、D-FF）を実装

# バグ修正
fix: SR-LATCHの接続線のずれを修正

# ドキュメント
docs: 開発ガイドラインを更新

# リファクタリング
refactor: ゲートファクトリーパターンを導入

# テスト
test: 特殊ゲートの統合テストを追加
```

## 🏗️ アーキテクチャ要点

### Hybrid Feature-Domain Architecture
```
src/
├── domain/                    # ドメインロジック
│   ├── analysis/             # 真理値表生成・回路分析
│   ├── circuit/              # 回路レイアウト・操作
│   └── simulation/           # coreAPI：純粋関数シミュレーション
│       └── core/             # Result<T,E>パターン実装
├── stores/                   # Zustand状態管理
│   └── slices/              # 機能別スライス
├── components/               # UIコンポーネント
│   ├── dialogs/             # モーダルダイアログ
│   ├── gate/                # ゲート関連コンポーネント
│   ├── layouts/             # レスポンシブレイアウト
│   └── tool-palette/        # ツールパレット
├── features/                 # 機能別実装
│   ├── gallery/             # ギャラリーモード
│   ├── learning-mode/       # 学習モード
│   └── puzzle-mode/         # パズルモード
├── hooks/                   # カスタムフック
├── infrastructure/         # インフラ層
└── types/                  # 型定義
```

### 重要ファイル
- `src/stores/circuitStore.ts` - 中央状態管理
- `src/domain/simulation/core/circuitEvaluation.ts` - coreAPI回路評価
- `src/domain/simulation/core/gateEvaluation.ts` - coreAPIゲート評価
- `src/components/TruthTableDisplay.tsx` - 真理値表表示
- `src/components/ToolPalette.tsx` - カスタムゲート作成
- `src/domain/analysis/pinPositionCalculator.ts` - ピン位置計算
- `src/models/gates/GateFactory.ts` - ゲート生成ファクトリー
- `src/features/learning-mode/` - 学習モード

## 🔧 よくある問題と解決方法

### 1. 共有URL復元時の接続線問題 ✅修正済み
**原因**: ゲートIDの再生成時にワイヤー接続が更新されない
**解決**: IDマッピングを作成してワイヤー接続を正しく更新
**場所**: `src/stores/slices/shareSlice.ts`

### 2. CLOCKゲートの高周波数問題 ✅修正済み
**原因**: 固定更新間隔（100ms）による低サンプリングレート
**解決**: 動的更新間隔（Nyquist定理準拠、最高周波数の4倍）
**場所**: `src/components/Canvas.tsx`

### 3. タイミングチャート表示問題 ✅修正済み
**原因**: CLOCKゲート選択状態の管理不備
**解決**: clockSelectionSliceで選択状態を専用管理
**場所**: `src/stores/slices/clockSelectionSlice.ts`

### 4. ヘルプコンテンツの改行問題 ✅修正済み
**原因**: `\n`文字が正しく表示されない
**解決**: 構造化リスト表示で視覚的に改善
**場所**: `src/components/HelpPanel.tsx`

### 現在の既知問題
1. **大規模回路のパフォーマンス**: 100+ゲートで遅延
2. **モバイルタッチ精度**: ピン接続の困難さ
3. **テストカバレッジ**: 一部機能で不足

### デバッグ手順
1. `npm run typecheck` - 型エラーチェック
2. `npm run lint` - コード品質チェック  
3. `npm run test` - 単体テスト実行
4. ブラウザ開発者ツールでコンソール確認

## 💡 開発のコツ

### 座標系の扱い
- SVG座標系を使用（左上が原点）
- マウスイベントではSVG座標に変換が必要
```typescript
const point = svg.createSVGPoint();
point.x = event.clientX;
point.y = event.clientY;
const svgPoint = point.matrixTransform(svg.getScreenCTM()!.inverse());
```

### 状態管理
- Zustandを使用（シンプルで高速）
- Immerは使わない（プロキシ問題を避ける）
- 更新は必ずimmutableに
- coreAPIではResult<T,E>パターンでエラーハンドリング

### coreAPIシミュレーション（推奨）
```typescript
// ✅ 良い例：coreAPI使用
const result = evaluateCircuit(circuit, config);
if (result.success) {
  const { circuit: updatedCircuit } = result.data;
  // 成功時の処理
} else {
  console.error('Evaluation failed:', result.error.message);
}

// ❌ 旧API（非推奨）
const updatedCircuit = evaluateCircuitLegacy(circuit); // エラーが見えない
```

### カスタムゲート開発
- `definition.outputs`の`name`プロパティは必須
- 真理値表は自動生成される
- ピン位置計算は`pinPositionCalculator.ts`で統一

### パフォーマンス
- 不要な再レンダリングを避ける（React.memo活用）
- CLOCKゲートは動的更新間隔（1-20Hz対応、Nyquist定理準拠）
- 真理値表は計算コストが高いため、キャッシュを活用
- 大規模回路では仮想化やWebWorker検討

## 🚀 開発アプローチ

### 開発の優先順位
1. **基本機能の安定性**
   - コア機能の動作保証
   - エラーハンドリングの充実
   - ユーザビリティの向上

2. **段階的な機能拡張**
   - 学習モードの充実
   - パズルモードの問題追加
   - ギャラリーモードの実装

3. **利便性の向上**
   - キーボードショートカット
   - 履歴機能（元に戻す/やり直し）
   - 回路保存・共有機能

4. **高度な機能**
   - 自動レイアウト機能
   - 回路検証・最適化
   - パフォーマンス分析

### 主要機能の実装状況（2025-06-15現在）
- **学習モード**: 構造化レッスンによる段階的学習 ✅
- **フリーモード**: 自由な回路作成とシミュレーション ✅
- **真理値表表示**: 自動生成・表示機能 ✅
- **カスタムゲート**: 回路からゲート作成機能 ✅
- **タイミングチャート**: CLOCKゲート対応、オシロスコープモード ✅
- **共有機能**: URL共有、接続線復元対応 ✅
- **coreAPIシミュレーション**: Result<T,E>パターンで型安全 ✅
- **レスポンシブ対応**: デスクトップ・タブレット・モバイル対応 ✅
- **キーボードショートカット**: 効率的な操作 ✅
- **履歴機能**: 元に戻す/やり直し ✅
- **回路保存・読み込み**: ローカルストレージ対応 ✅

### 今後の実装予定
- **パズルモード**: 制約付き問題解決（開発中）
- **ギャラリーモード**: サンプル回路ライブラリ（開発中）
- **パフォーマンス最適化**: 大規模回路対応（高優先度）
- **モバイルUX改善**: タッチ操作精度向上（高優先度）
- **PNG画像エクスポート**: 回路図の画像化（準備中）
- **AI支援機能**: 回路設計アシスタント（研究中）

### 技術的基盤
- **API設計**: coreAPIによる関数型アプローチ
- **コード品質**: ESLintによる品質管理
- **型安全性**: TypeScript strict mode対応
- **ドキュメント**: 開発ガイドラインの整備

## 📋 チェックリスト

### 開発前
- [ ] ドキュメントで関連機能を確認
- [ ] 関連するテストケースを確認
- [ ] アーキテクチャガイドラインを確認

### 実装中
- [ ] TypeScriptの型を正しく使用
- [ ] エラーハンドリングを適切に
- [ ] パフォーマンスを意識

### コミット前
- [ ] `npm run typecheck`でエラーなし
- [ ] `npm run lint`でエラーなし（警告は許容）
- [ ] `npm run test`で単体テストが通る
- [ ] 関連するE2Eテストが通る
- [ ] コミットメッセージが規約に従っている
- [ ] カスタムゲート関連の変更は真理値表表示も確認

## 🎨 UI/UXの指針

### モックアップ準拠
- ゲートサイズは`docs/design/mockups/final-gate-design.html`を参照
- 色使いは既存のCSSに従う（#00ff88がアクティブ色）

### ユーザビリティ
- クリック領域は見た目より大きく（特にピン）
- 視覚的フィードバックは必須
- エラーは分かりやすく表示

## 📌 重要な注意事項

1. **ViewModelパターンは使わない**（Zustandで十分）
2. **過度な抽象化は避ける**（シンプルに保つ）
3. **動作確認は必ずブラウザで**（テストだけでは不十分）
4. **品質管理**: QUALITY_REVIEW.mdに基づく継続的改善
5. **進捗管理**: PROGRESS.mdで現在の状況を常に把握

## 📋 セッション開始時のチェックリスト

### 必須確認事項
1. [ ] [PROGRESS.md](PROGRESS.md)で現在の進捗確認
2. [ ] [QUALITY_REVIEW.md](QUALITY_REVIEW.md)で品質状況確認
3. [ ] [CHANGELOG.md](CHANGELOG.md)で最新の変更確認
4. [ ] `git log --oneline -5`で最近のコミット確認
5. [ ] `npm run typecheck`で型エラーなしを確認

### 開発開始前
- [ ] 作業対象の優先度確認（PROGRESS.mdの「次回の作業候補」参照）
- [ ] 関連するテストケースの確認
- [ ] アーキテクチャガイドラインの確認

---

**重要**: セッション終了時は必ずPROGRESS.mdを更新してください。
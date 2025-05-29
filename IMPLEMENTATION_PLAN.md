# Logic Circuit Playground - 実装計画

## 🎯 実装開始！

アーキテクチャ設計に基づいて、以下の順序で実装を進めます。

## 📋 実装順序

### Phase 0: 基盤構築（今すぐ開始）

#### 1. デザインシステムの構築
```bash
src/
├── design-system/
│   ├── tokens.ts          # デザイントークン定義
│   ├── themes/
│   │   ├── dark.ts        # ダークテーマ
│   │   └── light.ts       # ライトテーマ（将来用）
│   └── components/        # 基本コンポーネント
│       ├── Button/
│       ├── Card/
│       └── Layout/
```

#### 2. ViewModelレイヤーの基盤
```bash
src/
├── viewmodels/
│   ├── base/
│   │   ├── ViewModel.ts   # 基底クラス
│   │   └── Observable.ts  # リアクティビティ
│   ├── CircuitViewModel.ts
│   └── GateViewModel.ts
```

#### 3. テスト環境の整備
- Vitest設定の最適化
- Storybookの導入
- Cypressの設定改善
- CI/CDパイプライン構築

### Phase 1: Milestone 1 実装開始

#### Week 1: モード選択とレイアウト
- [ ] モード選択画面（探検/実験室/チャレンジ）
- [ ] メインレイアウト（ヘッダー、サイドバー、キャンバス）
- [ ] デザイントークンの適用
- [ ] レスポンシブ対応

#### Week 2: 基本機能とデモ
- [ ] ゲートのドラッグ&ドロップ改善
- [ ] 配線システムの実装
- [ ] デモ回路10個
- [ ] 保存・共有機能

## 🛠️ 今すぐやること

### 1. ブランチ戦略
```bash
main
├── develop                 # 開発ブランチ
│   ├── feature/design-system
│   ├── feature/viewmodel-layer
│   └── feature/mode-selection
└── release/v1.0           # リリース準備
```

### 2. 初期セットアップ
```bash
# 必要なパッケージのインストール
pnpm add @emotion/react @emotion/styled   # CSS-in-JS
pnpm add mobx mobx-react-lite             # 状態管理
pnpm add -D @storybook/react-vite         # Storybook
pnpm add -D chromatic                     # Visual Testing

# 設定ファイルの作成
touch .storybook/main.ts
touch .storybook/preview.ts
touch src/design-system/tokens.ts
```

### 3. ファイル構造の整備
```bash
src/
├── components/           # UIコンポーネント
├── viewmodels/          # ViewModelレイヤー
├── models/              # ドメインモデル（既存）
├── hooks/               # カスタムフック
├── design-system/       # デザインシステム
├── utils/               # ユーティリティ
├── services/            # 外部サービス連携
└── test-utils/          # テストユーティリティ
```

## 📝 コーディング規約

### TypeScript
- strictモード有効
- 型定義は必須
- anyは原則禁止

### React
- 関数コンポーネントのみ
- カスタムフックでロジック分離
- メモ化は測定してから

### テスト
- テストファーストで開発
- AAA（Arrange-Act-Assert）パターン
- データビルダーパターン活用

### CSS
- CSS Modules + CSS-in-TS
- デザイントークン使用必須
- BEMは使わない（CSS Modulesで解決）

## 🚀 次のアクション

1. **design-systemブランチ作成**
   ```bash
   git checkout -b feature/design-system
   ```

2. **デザイントークン実装**
   - tokens.ts作成
   - 基本コンポーネント作成
   - Storybook設定

3. **PR作成とレビュー**
   - 小さくPRを作る
   - CIが全て通ることを確認
   - マージ後すぐ次へ

## 📊 成功の測定

- **コードカバレッジ**: 80%以上
- **Lighthouse Score**: 90以上
- **ビルド時間**: 1分以内
- **PR〜マージ**: 1日以内

---

さあ、最高のサービスを作り始めましょう！🎉
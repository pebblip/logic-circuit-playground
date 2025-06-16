# 📚 ドキュメント構成

このディレクトリには、LogiCircの設計・開発・運用に関するドキュメントが含まれています。

## 📁 ディレクトリ構造

```
docs/
├── user-guide/        # 👤 ユーザー向けドキュメント
├── development/       # 🛠️ 開発者向けドキュメント
├── management/        # 📊 プロジェクト管理
├── design/            # 🎨 設計関連
└── archive/           # 📦 過去のドキュメント
```

## 📋 ドキュメント一覧

### 👤 ユーザーガイド
- **[user-guide/QUICK_START.md](./user-guide/QUICK_START.md)** - 5分で始めるガイド
- **[user-guide/FAQ.md](./user-guide/FAQ.md)** - よくある質問と解決方法
- **[user-guide/TROUBLESHOOTING.md](./user-guide/TROUBLESHOOTING.md)** - 技術的問題の詳細解決方法
- **[user-guide/COMMAND_REFERENCE.md](./user-guide/COMMAND_REFERENCE.md)** - 全コマンドの完全ガイド

### 🛠️ 開発ドキュメント
- **[development/ARCHITECTURE.md](./development/ARCHITECTURE.md)** - 技術アーキテクチャ
  - Hybrid Feature-Domain Architecture
  - ディレクトリ構造、状態管理
- **[development/GUIDELINES.md](./development/GUIDELINES.md)** - 開発ガイドライン
  - 実践的開発プロセス
  - 品質基準、コーディング規約
  - デバッグプロセス
- **[development/ROADMAP.md](./development/ROADMAP.md)** - 開発ロードマップ
- **[development/retrospectives/](./development/retrospectives/)** - レトロスペクティブ記録

### 📊 プロジェクト管理
- **[management/PROGRESS.md](./management/PROGRESS.md)** - 進捗管理とセッション引き継ぎ
- **[management/QUALITY_REVIEW.md](./management/QUALITY_REVIEW.md)** - 品質レビュー報告
- **[management/PROJECT_BLUEPRINT.md](./management/PROJECT_BLUEPRINT.md)** - プロジェクト全体の設計書

### 🎨 設計ドキュメント
- **[design/mockups/](./design/mockups/)** - UIモックアップ
  - `desktop-ui.html` - デスクトップ版UI
  - `mobile-ui.html` - モバイル版UI
  - `final-gate-design.html` - ゲートデザイン仕様
- **[design/timing-chart-*.md](./design/)** - タイミングチャート設計文書

## 🔄 ドキュメントの読み方

### 初めての方
1. **ユーザー**: [QUICK_START.md](./user-guide/QUICK_START.md)から開始
2. **開発者**: [CLAUDE.md](../CLAUDE.md)を必読（プロジェクトルート）

### 開発者の方
1. [PROGRESS.md](./management/PROGRESS.md)で現在の進捗を確認
2. [GUIDELINES.md](./development/GUIDELINES.md)で開発ルールを確認
3. [ARCHITECTURE.md](./development/ARCHITECTURE.md)で技術構成を理解

### プロジェクト管理者
1. [PROGRESS.md](./management/PROGRESS.md)で進捗確認
2. [QUALITY_REVIEW.md](./management/QUALITY_REVIEW.md)で品質状況確認
3. [PROJECT_BLUEPRINT.md](./management/PROJECT_BLUEPRINT.md)で全体像把握

## 📝 ドキュメント更新ルール

### 更新タイミング
- 機能追加・変更時は関連ドキュメントも更新
- アーキテクチャ変更時は必ずARCHITECTURE.mdを更新
- セッション終了時はPROGRESS.mdを更新

### 品質チェック
- ドキュメント間の整合性を確認
- コードとドキュメントの一致を確認
- リンク切れがないか確認

## 📄 その他の重要ドキュメント

- **[../README.md](../README.md)** - プロジェクトルートのREADME
- **[../CLAUDE.md](../CLAUDE.md)** - Claude向け開発ガイド（重要）
- **[../CHANGELOG.md](../CHANGELOG.md)** - バージョン履歴と変更内容
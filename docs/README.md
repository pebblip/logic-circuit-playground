# 📚 ドキュメント構成

このディレクトリには、LogiCircの設計・開発に関するドキュメントが含まれています。

## 📋 ドキュメント一覧

### 🎯 設計ドキュメント
- **[PROJECT_BLUEPRINT.md](./PROJECT_BLUEPRINT.md)** - プロジェクト全体の設計書
  - ビジョン、コアバリュー、機能仕様
  - UI/UXデザイン、技術スタック
  - 開発ロードマップ、品質基準

### 🏗️ 開発ドキュメント
- **[development/ARCHITECTURE.md](./development/ARCHITECTURE.md)** - 技術アーキテクチャ
  - Hybrid Feature-Domain Architecture
  - ディレクトリ構造、状態管理
  - 技術的な設計判断

- **[development/GUIDELINES.md](./development/GUIDELINES.md)** - 開発ガイドライン
  - 実践的開発プロセス（検証・コミット必須）
  - UI開発手順（スクリーンショット確認必須）
  - 品質基準、コーディング規約、緊急時対応

- **[development/ROADMAP.md](./development/ROADMAP.md)** - 開発ロードマップ
  - 完了したフェーズと現在の状況
  - 次期開発予定の機能

### 🎨 デザインリソース
- **[design/mockups/](./design/mockups/)** - UIモックアップ
  - `desktop-ui.html` - デスクトップ版UI
  - `mobile-ui.html` - モバイル版UI
  - `final-gate-design.html` - ゲートデザイン仕様

## 🔄 ドキュメントの読み方

### 初めての方
1. まず[PROJECT_BLUEPRINT.md](./PROJECT_BLUEPRINT.md)でプロジェクト全体像を把握
2. 次に[ARCHITECTURE.md](./development/ARCHITECTURE.md)で技術的な構成を理解
3. 開発に参加する場合は[GUIDELINES.md](./development/GUIDELINES.md)を必読

### 開発者の方
1. [GUIDELINES.md](./development/GUIDELINES.md)で品質基準を確認
2. [ROADMAP.md](./development/ROADMAP.md)で現在のフェーズを確認
3. モックアップで最終的なUIイメージを確認

## 📝 ドキュメント更新ルール

### 更新タイミング
- 機能追加・変更時は関連ドキュメントも更新
- アーキテクチャ変更時は必ずARCHITECTURE.mdを更新
- フェーズ完了時はROADMAP.mdのステータスを更新

### 品質チェック
- ドキュメント間の整合性を確認
- コードとドキュメントの一致を確認
- リンク切れがないか確認

## 📄 その他のドキュメント

- **[CHANGELOG.md](./CHANGELOG.md)** - バージョン履歴と変更内容

## 🚀 今後検討中のドキュメント

- **API_REFERENCE.md** - コンポーネント・フックのAPI仕様
- **TESTING.md** - テスト戦略とガイド
- **DEPLOYMENT.md** - デプロイ手順
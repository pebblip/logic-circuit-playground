# 📚 ドキュメント構成

このディレクトリには、Logic Circuit Playgroundプロジェクトの全てのドキュメントが含まれています。

## 📋 ドキュメントの関係と役割

### 🎯 プロジェクト全体像
```
PROJECT_BLUEPRINT.md（設計書）
    ├── ビジョン・コンセプト
    ├── 機能仕様
    ├── UI/UXデザイン
    └── 品質基準
           ↓
REACT_ARCHITECTURE_ROADMAP.md（技術設計）
    ├── アーキテクチャ詳細
    ├── ディレクトリ構造
    ├── 状態管理戦略
    └── 実装パターン
           ↓
REVISED_ROADMAP.md（開発計画）
    ├── スプリント計画
    ├── マイルストーン
    ├── リリース戦略
    └── タイムライン
```

### 📁 ディレクトリ構成

```
docs/
├── README.md                        # このファイル（ドキュメント構成説明）
├── PROJECT_BLUEPRINT.md             # プロジェクト設計書（What & Why）
├── design/                          # デザイン関連
│   └── mockups/                     # UIモックアップ
│       ├── final-gate-design.html   # ゲートデザイン仕様
│       ├── mobile-ui.html           # モバイル版UI
│       └── desktop-ui.html          # デスクトップ版UI
└── development/                     # 開発関連
    ├── ARCHITECTURE.md              # 技術アーキテクチャ（How）
    ├── ROADMAP.md                   # 開発ロードマップ（When）
    └── GUIDELINES.md                # 開発ガイドライン（Rules）
```

## 📖 各ドキュメントの詳細

### PROJECT_BLUEPRINT.md
**目的**: プロジェクトの全体像を理解する
- プロジェクトのビジョンとゴール
- 3つのモード（学習・自由制作・パズル）の詳細仕様
- UI/UXデザインの方針
- 技術スタックの概要
- 品質基準と成功指標

**読者**: 全員（開発者、デザイナー、ステークホルダー）

### development/ARCHITECTURE.md
**目的**: 技術的な実装方法を理解する
- Feature-Sliced Design + カスタムフックアーキテクチャ
- 詳細なディレクトリ構造
- 状態管理（Zustand + Jotai）の実装方法
- 統一された設計パターン（CollisionDetector等）
- コード例とベストプラクティス

**読者**: 開発者

### development/ROADMAP.md
**目的**: いつ何を作るかを理解する（具体的な開発スケジュール）
- 7つのスプリント計画（Sprint 0-6）
- 3つのマイルストーン（3週間、6週間、10週間）
- リリース戦略（v0.1.0 → v1.0.0）
- 各スプリントの具体的なタスク
- ハイブリッドアプローチ（基本モード + 最小限の学習要素を優先）

**読者**: 開発者、プロジェクトマネージャー

**位置付け**: PROJECT_BLUEPRINTの「何を作るか」とARCHITECTUREの「どう作るか」を受けて、「いつ作るか」を定義。開発の実行計画書。

### development/GUIDELINES.md（旧CLAUDE.md）
**目的**: 開発時の規約とルールを理解する
- 品質基準（100%達成必須）
- テスト駆動開発の手順
- コミット規約
- コードレビュー基準

**読者**: 開発者

## 🚀 ドキュメントの使い方

### 新規参加者の場合
1. **PROJECT_BLUEPRINT.md** を読んでプロジェクトを理解
2. **ROADMAP.md** で現在の進捗を確認
3. **ARCHITECTURE.md** で技術的な詳細を学習
4. **GUIDELINES.md** で開発ルールを確認

### 開発作業時
1. **ROADMAP.md** で現在のスプリントのタスクを確認
2. **ARCHITECTURE.md** で実装パターンを参照
3. **GUIDELINES.md** に従って品質チェック

### デザイン作業時
1. **PROJECT_BLUEPRINT.md** でUI/UX方針を確認
2. **design/mockups/** で既存のデザインを参照

## 📝 ドキュメント更新ルール

- ドキュメントは常に最新の状態を保つ
- 大きな変更時は関連する全てのドキュメントを更新
- 図や例を積極的に使用して理解しやすくする
- バージョン履歴を記録する

---

*最終更新: 2024年1月*
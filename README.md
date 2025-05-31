# 🎯 Logic Circuit Playground

> 誰でも楽しく論理回路からCPUまで学べる、最高の教育プラットフォーム

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646cff)](https://vitejs.dev/)

## 🚀 概要

Logic Circuit Playgroundは、論理回路の基礎から応用まで段階的に学習できるインタラクティブなWebアプリケーションです。ドラッグ&ドロップで回路を構築し、リアルタイムでシミュレーションを実行できます。

### ✨ 特徴
- 🎮 **3つのモード**: 学習・自由制作・パズルチャレンジ
- 🎨 **直感的な操作**: ドラッグ&ドロップで簡単回路作成
- ⚡ **リアルタイムシミュレーション**: 信号の流れをアニメーション表示
- 📱 **マルチデバイス対応**: PC・タブレット・スマホで快適操作
- 🎯 **段階的学習**: 基本ゲートからCPU設計まで

## 🎯 始め方

### 必要環境
- Node.js 18以上
- npm または pnpm

### インストール
```bash
# リポジトリをクローン
git clone https://github.com/yourusername/logic-circuit-playground.git
cd logic-circuit-playground

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

### ビルド
```bash
# プロダクションビルド
npm run build

# ビルドをプレビュー
npm run preview
```

## 🎮 使い方

### 学習モード
1. 初回起動時は自動的にチュートリアルが開始
2. 基本的な操作を学んだ後、段階的なレッスンへ
3. 各レッスンをクリアするとバッジを獲得

### 自由制作モード
1. ツールパレットからゲートをドラッグ&ドロップ
2. ピンをクリックして接続を作成
3. 実行ボタンでシミュレーション開始
4. 作品を保存・共有

### パズルモード
1. 与えられた条件を満たす回路を作成
2. ヒントを使いながら問題を解決
3. 最小ゲート数でクリアを目指す

## 🛠️ アーキテクチャ

Feature-Sliced Design + カスタムフックベースの設計を採用。詳細は[PROJECT_BLUEPRINT.md](./PROJECT_BLUEPRINT.md)を参照。

```
src/
├── features/      # 機能単位のモジュール
├── entities/      # ドメインモデル
├── shared/        # 共有リソース
└── app/          # アプリケーション層
```

## 🧪 開発

### コマンド一覧
```bash
npm run dev        # 開発サーバー起動
npm run build      # プロダクションビルド
npm run test       # テスト実行
npm run typecheck  # 型チェック
npm run lint       # リント実行
npm run format     # コード整形
```

### 品質チェック（必須）
```bash
# コミット前に必ず実行
npm run typecheck && npm run test && npm run build
```

## 📚 ドキュメント

- [ドキュメント構成](./docs/README.md) - ドキュメントの全体像と関係
- [プロジェクト設計書](./docs/PROJECT_BLUEPRINT.md) - 全体設計（What & Why）
- [技術アーキテクチャ](./docs/development/ARCHITECTURE.md) - 実装詳細（How）
- [開発ロードマップ](./docs/development/ROADMAP.md) - 開発計画（When）
- [開発ガイドライン](./docs/development/GUIDELINES.md) - 品質基準と規約（Rules）
- [UIデザイン](./docs/design/mockups/) - モックアップとデザイン仕様

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'feat: add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

### コミット規約
[Conventional Commits](https://www.conventionalcommits.org/)に従います：
- `feat:` 新機能
- `fix:` バグ修正
- `docs:` ドキュメント
- `style:` フォーマット
- `refactor:` リファクタリング
- `test:` テスト
- `chore:` その他

## 📄 ライセンス

MIT License - 詳細は[LICENSE](./LICENSE)を参照

## 🙏 謝辞

このプロジェクトは教育目的で作成されました。論理回路の楽しさを多くの人に伝えられることを願っています。

---

**楽しく学んで、創造しよう！** 🚀
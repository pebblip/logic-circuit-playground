# 🎯 LogiCirc (Logic Circuit Playground)

> 誰でも楽しく論理回路からCPUまで学べる、直感的な教育プラットフォーム

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646cff)](https://vitejs.dev/)

## 🚀 概要

Logic Circuit Playgroundは、論理回路の基礎から応用まで段階的に学習できるインタラクティブなWebアプリケーションです。ドラッグ&ドロップでゲートを配置し、リアルタイムでシミュレーションを実行できます。

### ✨ 特徴
- 🎮 **3つのモード**: 学習・フリー・パズル
- 🎨 **直感的な操作**: ドラッグ&ドロップで簡単ゲート配置
- ⚡ **リアルタイムシミュレーション**: 信号の流れをアニメーション表示
- 🔧 **カスタムゲート作成**: 回路から新しいゲートを作成可能
- 📊 **真理値表表示**: ゲートの動作を視覚的に確認
- 📱 **マルチデバイス対応**: PC・タブレット・スマホで快適操作
- 🎯 **段階的学習**: 基本ゲートからCPU設計まで

### 🛠️ 技術的特徴
- Result<T,E>パターンによる型安全なAPI
- 純粋関数ベースの回路シミュレーション
- 防御的プログラミングによる安定性
- 充実したテストスイート
- 詳細は[CHANGELOG.md](./docs/CHANGELOG.md)を参照

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

### フリーモード
1. ツールパレットからゲートをドラッグ&ドロップで配置
2. ピンをクリックして接続を作成
3. リアルタイムでシミュレーション実行
4. 作品を保存・共有
5. **回路からカスタムゲートを作成**
6. **真理値表で動作を確認**

### パズルモード
1. 与えられた条件を満たす回路を作成
2. ヒントを使いながら問題を解決
3. 最小ゲート数でクリアを目指す

## ⚡ 新機能ハイライト

### 🔧 カスタムゲート作成
- **回路から新しいゲートを作成**: 複雑な回路を再利用可能なゲートに変換
- **自動真理値表生成**: カスタムゲートの動作を自動的に分析
- **視覚的な動作確認**: 真理値表で入出力関係を確認

### 🚀 API設計
- **Result<T,E>パターン**: Rustスタイルの型安全なエラーハンドリング
- **純粋関数設計**: サイドエフェクトなし、完全にテスタブル
- **Immutable**: 元データを変更せず、新しいデータを返す
- **防御的プログラミング**: 予期せぬ入力に対する堅牢性

### 🎯 使用例
```typescript
import { evaluateCircuit, defaultConfig } from '@domain/simulation/core';

const result = evaluateCircuit(circuit, defaultConfig);

if (result.success) {
  console.log('評価成功！', result.data.circuit);
  console.log('統計情報:', result.data.evaluationStats);
} else {
  console.error('エラー:', result.error.message);
}
```

## 🛠️ アーキテクチャ

Hybrid Feature-Domain Architectureを採用。詳細は[ARCHITECTURE.md](./docs/development/ARCHITECTURE.md)を参照。

```
src/
├── domain/                    # ドメインロジック
│   ├── analysis/             # 真理値表生成・回路分析
│   ├── circuit/              # 回路レイアウト・操作
│   └── simulation/           # 回路シミュレーション
│       └── core/             # Result<T,E>パターン実装
├── stores/                   # Zustand状態管理
├── components/               # UIコンポーネント
├── features/                 # 機能別実装
├── hooks/                   # カスタムフック
└── types/                  # 型定義
```

## 🧪 開発

### コマンド一覧
```bash
npm run dev        # 開発サーバー起動
npm run build      # プロダクションビルド
npm run test       # 単体テスト実行（推奨）
npm run test:e2e   # E2Eテスト実行
npm run typecheck  # 型チェック
npm run lint       # リント実行
npm run format     # コード整形
```

### テスト戦略
- 包括的なテストスイート
- コンポーネントテストとE2Eテスト
- ドメインロジックの単体テスト
- 継続的な品質管理

### 品質チェック
```bash
# コミット前に必ず実行
npm run typecheck && npm run test && npm run build
```
詳細なプロセスは[開発ガイドライン](./docs/development/GUIDELINES.md)を参照。

## 📚 ドキュメント

- [ドキュメント構成](./docs/README.md) - ドキュメントの全体像と関係
- [プロジェクト設計書](./docs/PROJECT_BLUEPRINT.md) - 全体設計（What & Why）
- [技術アーキテクチャ](./docs/development/ARCHITECTURE.md) - 実装詳細（How）
- [開発ロードマップ](./docs/development/ROADMAP.md) - 開発計画（When）
- [開発ガイドライン](./docs/development/GUIDELINES.md) - 実践的開発プロセスと品質基準
- [UIデザイン](./docs/design/mockups/) - モックアップとデザイン仕様

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'feat: add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

### コミット規約
[Conventional Commits](https://www.conventionalcommits.org/)形式を使用。  
詳細は[開発ガイドライン](./docs/development/GUIDELINES.md)を参照。

## 📄 ライセンス

MIT License - 詳細は[LICENSE](./LICENSE)を参照

## 🙏 謝辞

このプロジェクトは教育目的で作成されました。論理回路の楽しさを多くの人に伝えられることを願っています。

---

**楽しく学んで、創造しよう！** 🚀
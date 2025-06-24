# 🎯 LogiCirc (Logic Circuit Playground)

> 誰でも楽しく論理回路からCPUまで学べる、直感的な教育プラットフォーム

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646cff)](https://vitejs.dev/)

## 🚀 概要

Logic Circuit Playgroundは、論理回路の基礎から応用まで段階的に学習できるインタラクティブなWebアプリケーションです。ドラッグ&ドロップでゲートを配置し、リアルタイムでシミュレーションを実行できます。

### ✨ 特徴
- 🎮 **4つのモード**: 学習・フリー・パズル・ギャラリー
- 🎨 **直感的な操作**: ドラッグ&ドロップで簡単ゲート配置
- ⚡ **リアルタイムシミュレーション**: coreAPIによる高速・型安全な回路評価
- 🔧 **カスタムゲート作成**: 回路から新しいゲートを作成可能
- 📊 **真理値表表示**: ゲートの動作を視覚的に確認
- 📱 **マルチデバイス対応**: PC・タブレット・スマホで快適操作
- 🎯 **段階的学習**: 22の構造化レッスン（18レッスンがproduction品質、4レッスンがbeta品質）
- ⌨️ **キーボードショートカット**: Delete、Undo/Redo、Copy/Paste、SelectAll
- 🔗 **URL共有機能**: Base64エンコードによる即座の回路共有
- 🚨 **視覚的エラー通知**: トースト形式の分かりやすいエラー表示

### 🛠️ 技術的特徴
- **coreAPI**: Result<T,E>パターンによる型安全なシミュレーション
- **Hybrid Feature-Domain Architecture**: プロジェクト規模に適した設計
- **Zustand**: 10個のスライスによる効率的な状態管理
- **TypeScript strict mode**: エラー0の型安全性
- **統一されたレッスン構造**: 7ステップ構成の学習体験
- **レスポンシブ設計**: 各デバイスに最適化されたレイアウト
- **オブジェクト指向設計**: 設定駆動型アーキテクチャで高い拡張性
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

### 学習モード（22レッスン実装済み）
1. 基礎編：NOT、AND、OR、XORゲート
2. 算術編：半加算器、全加算器、4ビット加算器
3. 記憶編：D-FF、SR-LATCH、レジスタ、シフトレジスタ
4. 制御編：エンコーダ、デコーダ、マルチプレクサ、比較器
5. 応用編：ALU、カウンタ、CLOCK同期、デジタル時計
6. 各レッスンは7ステップ構成（導入→原理→回路作成→実験→分析→応用→まとめ）

### フリーモード
1. ツールパレットからゲートをドラッグ&ドロップで配置
2. ピンをクリックして接続を作成
3. リアルタイムでシミュレーション実行
4. 作品を保存・共有
5. **回路からカスタムゲートを作成**
6. **真理値表で動作を確認**

### パズルモード
1. 与えられた条件を満たす回路を作成
2. リアルタイムで正誤判定
3. 段階的ヒントシステムで学習をサポート
4. 難易度別の問題セット

### ギャラリーモード
1. 基本回路から高度な回路まで多数のサンプル
2. 動作説明付きで理解を深める
3. 自由に編集・実験可能

## ⚡ 主要機能

### 🔧 カスタムゲート作成
- **回路から新しいゲートを作成**: 複雑な回路を再利用可能なゲートに変換
- **自動真理値表生成**: カスタムゲートの動作を自動的に分析
- **視覚的な動作確認**: 真理値表で入出力関係を確認
- **ピン位置の最適化**: CustomGateRendererによる自動レイアウト

### 🎨 プロパティパネル強化
- **ゲート情報表示**: 選択したゲートの詳細情報
- **真理値表の統合**: ワンクリックで真理値表を表示
- **学習リソース**: 配置済みゲートにも学習資料を表示
- **カスタムゲートサポート**: 作成したゲートの説明も表示

### ⌨️ キーボードショートカット
- **Delete**: 選択したゲートを削除
- **Ctrl/Cmd+Z/Y**: Undo/Redo
- **Ctrl/Cmd+C/V**: Copy/Paste
- **Ctrl/Cmd+A**: 全選択
- **Escape**: 操作キャンセル
- **?**: ヘルプ表示

### 🚀 coreAPI設計
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
- 機能カバレッジ100%を目指す包括的テスト体系
- 明確な価値判定基準に基づくテスト管理
- テストピラミッド原則（単体70%、統合20%、E2E10%）
- 継続的な品質向上プロセス

詳細は [テスト戦略ドキュメント](docs/testing/TEST_STRATEGY.md) を参照

### 品質チェック
```bash
# コミット前に必ず実行
npm run typecheck && npm run test && npm run build
```
詳細なプロセスは[開発ガイドライン](./docs/development/GUIDELINES.md)を参照。

## 📚 ドキュメント

### 🚀 スタートガイド
- [🚀 クイックスタート](./docs/user-guide/QUICK_START.md) - 5分で始めるLogicCirc
- [❓ FAQ](./docs/user-guide/FAQ.md) - よくある質問と解決方法
- [🔧 トラブルシューティング](./docs/user-guide/TROUBLESHOOTING.md) - 詳細な問題解決ガイド
- [📋 コマンドリファレンス](./docs/user-guide/COMMAND_REFERENCE.md) - 全コマンドの完全ガイド

### 📖 設計・開発
- [ドキュメント構成](./docs/README.md) - ドキュメントの全体像と関係
- [プロジェクト設計書](./docs/management/PROJECT_BLUEPRINT.md) - 全体設計（What & Why）
- [技術アーキテクチャ](./docs/development/ARCHITECTURE.md) - 実装詳細（How）
- [開発ロードマップ](./docs/development/ROADMAP.md) - 開発計画（When）
- [開発ガイドライン](./docs/development/GUIDELINES.md) - 実践的開発プロセスと品質基準
- [UIデザイン](./docs/design/mockups/) - モックアップとデザイン仕様
- [変更履歴](./CHANGELOG.md) - バージョン履歴と変更内容

## 📅 開発状況

- **Phase 0**: ✅ 基本機能の確立（完了）
- **Phase 1**: ✅ アーキテクチャ整理（完了）
- **Phase 2**: 🚧 UI/UX改善（80%完了）
- **Phase 3**: 📋 次世代機能（計画中）

詳細は[開発ロードマップ](./docs/development/ROADMAP.md)を参照。

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
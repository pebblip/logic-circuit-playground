# Logic Circuit Playground

論理回路の設計・シミュレーションを行うための教育用アプリケーション

## 概要

Logic Circuit Playgroundは、論理回路の基礎から応用まで段階的に学習できるインタラクティブなWebアプリケーションです。ドラッグ&ドロップで回路を構築し、リアルタイムでシミュレーションを実行できます。

## 機能

### 🎯 主要機能
- **ドラッグ&ドロップ回路設計**: 直感的な操作で論理ゲートを配置・接続
- **リアルタイムシミュレーション**: 手動計算と自動実行モード
- **段階的学習システム**: 4つのレベルで基礎から応用まで学習
- **回路の保存/読み込み**: 作成した回路を保存して再利用

### 📚 学習レベル
1. **基本ゲート**: AND, OR, NOT, INPUT, OUTPUT
2. **メモリ要素**: NAND, NOR, CLOCK, SR Latch, D Flip-Flop
3. **演算回路**: XOR, Half Adder, Full Adder
4. **CPU要素**: Register, ALU（将来実装予定）

## 技術スタック

- **フロントエンド**: React 18
- **ビルドツール**: Vite
- **スタイリング**: TailwindCSS v4
- **パッケージマネージャー**: pnpm
- **テスト**: Vitest, React Testing Library
- **型チェック**: PropTypes

## セットアップ

### 必要条件
- Node.js 18以上
- pnpm 8以上

### インストール
```bash
# リポジトリのクローン
git clone https://github.com/your-username/logic-circuit-playground.git
cd logic-circuit-playground

# 依存関係のインストール
pnpm install

# 開発サーバーの起動
pnpm dev
```

### ビルド
```bash
# プロダクションビルド
pnpm build

# ビルドのプレビュー
pnpm preview
```

### テスト
```bash
# テストの実行
pnpm test

# テストのUIモード
pnpm test:ui
```

## プロジェクト構造

```
src/
├── components/           # UIコンポーネント
│   ├── Circuit/         # 回路関連コンポーネント
│   │   ├── Gate.jsx     # ゲートコンポーネント
│   │   ├── Connection.jsx # 接続線コンポーネント
│   │   └── Canvas.jsx   # キャンバスコンポーネント
│   ├── UI/              # 汎用UIコンポーネント
│   │   ├── Toolbar.jsx  # ツールバー
│   │   ├── LevelPanel.jsx # レベル選択パネル
│   │   └── ...
│   └── ErrorBoundary.jsx # エラーハンドリング
├── hooks/               # カスタムフック
│   ├── useCircuitSimulation.js # 回路シミュレーション
│   └── useDragAndDrop.js # ドラッグ&ドロップ
├── utils/               # ユーティリティ関数
│   ├── circuit.js       # 回路計算ロジック
│   └── svg.js          # SVG操作
├── constants/           # 定数定義
│   └── circuit.js      # 回路関連の定数
├── reducers/           # 状態管理
│   └── circuitReducer.js # 回路状態のリデューサー
└── __tests__/          # テストファイル
```

## アーキテクチャの特徴

### 🏗️ コンポーネント設計
- **単一責任の原則**: 各コンポーネントは1つの責務のみを持つ
- **再利用可能性**: 汎用的なコンポーネントとして設計
- **PropTypes**: 全コンポーネントで型定義を実装

### 🔄 状態管理
- **useReducer**: 複雑な状態更新ロジックを一元管理
- **カスタムフック**: ロジックの再利用とテスタビリティの向上
- **イミュータブル更新**: 予測可能な状態変更

### 🧪 テスト戦略
- **ユニットテスト**: 純粋関数とユーティリティのテスト
- **統合テスト**: ユーザーインタラクションのテスト
- **エラーハンドリング**: ErrorBoundaryによる包括的なエラー処理

### ⚡ パフォーマンス最適化
- **React.memo**: 不要な再レンダリングを防止
- **useCallback/useMemo**: 関数と値のメモ化
- **効率的な状態更新**: バッチ更新による最適化

## 開発ガイドライン

### コーディング規約
- ESLintとPrettierの設定に従う
- コンポーネントには必ずPropTypesを定義
- カスタムフックは`use`プレフィックスを使用
- 定数は大文字のスネークケースで定義

### コミット規約
- Conventional Commitsに従う
- 例: `feat: 新機能の追加`, `fix: バグ修正`, `refactor: リファクタリング`

## 今後の実装予定

- [ ] フリップフロップとメモリ要素の実装（Level 2）
- [ ] 加算器と演算回路の実装（Level 3）
- [ ] 簡易CPU要素の実装（Level 4）
- [ ] タイミング図の表示機能
- [ ] 真理値表の自動生成
- [ ] 回路のエクスポート/インポート機能
- [ ] チュートリアルモード
- [ ] ダークモード対応

## ライセンス

MIT License

## 貢献

プルリクエストは歓迎します。大きな変更の場合は、まずissueを作成して変更内容について議論してください。
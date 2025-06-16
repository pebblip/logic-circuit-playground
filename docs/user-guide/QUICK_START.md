# 🚀 クイックスタート - 5分で始めるLogicCirc

LogicCirc（論理回路プレイグラウンド）をすぐに体験できるガイドです。
このガイドに従えば、5分以内に開発環境をセットアップし、最初の論理回路を作成できます。

## 📋 前提条件

- Node.js 18以上
- npm または yarn
- Git

## 🎯 1. プロジェクトのセットアップ（1分）

```bash
# リポジトリのクローン
git clone https://github.com/[your-username]/logic-circuit-playground.git
cd logic-circuit-playground

# 依存関係のインストール
npm install
```

### トラブルシューティング
- `npm install`でエラーが出る場合：
  ```bash
  # Node.jsバージョンを確認
  node -v  # v18.0.0以上であることを確認
  
  # キャッシュクリア後に再試行
  npm cache clean --force
  npm install
  ```

## 🚀 2. 開発サーバーの起動（30秒）

```bash
# 開発サーバーを起動
npm run dev

# 以下のようなメッセージが表示されます：
# VITE v5.0.8  ready in 500 ms
# ➜  Local:   http://localhost:5173/
# ➜  Network: use --host to expose
```

ブラウザで http://localhost:5173 を開くと、LogicCircが起動します！

### ポート競合の解決
```bash
# 別のポートで起動する場合
npm run dev -- --port 3000
```

## 🔧 3. 最初の回路を作成（3分）

### ステップ1: フリーモードを選択
1. トップページで「フリーモード」をクリック
2. 空のキャンバスが表示されます

### ステップ2: 基本的なAND回路を作成
1. **INPUTゲートを配置**
   - 左側のツールパレットから「INPUT」をドラッグ
   - キャンバスの左側に2つ配置

2. **ANDゲートを配置**
   - ツールパレットから「AND」をドラッグ
   - INPUTの右側に配置

3. **OUTPUTゲートを配置**
   - ツールパレットから「OUTPUT」をドラッグ
   - ANDゲートの右側に配置

### ステップ3: ワイヤーで接続
1. 最初のINPUTの出力ピン（右側の丸）をクリック
2. ANDゲートの上側入力ピン（左側の上の丸）をクリック
3. 同様に2番目のINPUTをANDゲートの下側入力に接続
4. ANDゲートの出力をOUTPUTゲートに接続

### ステップ4: シミュレーション実行
1. 画面上部の「▶️ 実行」ボタンをクリック
2. INPUTゲートをクリックしてON/OFFを切り替え
3. 両方のINPUTがONの時だけOUTPUTがONになることを確認！

## 📚 4. 次のステップ（30秒）

### 学習モードを試す
```bash
# ブラウザで学習モードにアクセス
# トップページ → 学習モード → 基本ゲート → ANDゲート
```

### 開発を始める
```bash
# TypeScriptの型チェック
npm run typecheck

# テストの実行
npm test

# ビルドの確認
npm run build
```

## 🆘 困ったときは？

### よくある問題と解決方法

| 問題 | 解決方法 |
|------|----------|
| ページが真っ白 | コンソールでエラーを確認、`npm run dev`を再起動 |
| ワイヤーが繋がらない | ピンを正確にクリック、ズームインして試す |
| 型エラーが大量に出る | `npm run typecheck`で詳細確認 |
| テストが失敗する | `npm test -- --watch`で個別に確認 |

### デバッグ方法
```bash
# 開発者ツールを開く
# Chrome/Edge: F12 または Ctrl+Shift+I
# Firefox: F12 または Ctrl+Shift+I
# Safari: Cmd+Option+I

# コンソールでエラーメッセージを確認
```

## 📖 関連ドキュメント

- [GUIDELINES.md](../development/GUIDELINES.md) - 開発ガイドライン
- [ARCHITECTURE.md](../development/ARCHITECTURE.md) - アーキテクチャ解説
- [FAQ.md](./FAQ.md) - よくある質問
- [CLAUDE.md](../../CLAUDE.md) - Claude向け開発ガイド

---

**🎉 おめでとうございます！**  
LogicCircの開発環境が整いました。楽しい論理回路の世界へようこそ！

何か問題があれば、[FAQ.md](./FAQ.md)を確認するか、GitHubのIssuesで質問してください。
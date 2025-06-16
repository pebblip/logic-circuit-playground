# 📋 コマンドリファレンス

LogicCirc開発で使用する全コマンドの完全ガイドです。

## 🚀 開発コマンド

### 基本的な開発

| コマンド | 説明 | オプション |
|---------|------|-----------|
| `npm run dev` | 開発サーバーを起動（http://localhost:5173） | `-- --port 3000` で別ポート<br>`-- --host` でネットワーク公開 |
| `npm run build` | プロダクションビルド（型チェック付き） | `-- --analyze` でバンドル分析 |
| `npm run build:no-typecheck` | プロダクションビルド（型チェックなし） | 緊急時のみ使用 |
| `npm run preview` | ビルド結果をプレビュー | ビルド後の動作確認用 |

### 開発サーバーのオプション例
```bash
# 別のポートで起動
npm run dev -- --port 3000

# ネットワーク経由でアクセス可能に（モバイルテスト用）
npm run dev -- --host

# HTTPSで起動（自己署名証明書）
npm run dev -- --https

# 全オプションを組み合わせ
npm run dev -- --port 3000 --host --https
```

## 🧪 テストコマンド

### 単体テスト

| コマンド | 説明 | 使用場面 |
|---------|------|----------|
| `npm test` | 全テストを実行 | コミット前の確認 |
| `npm run test:ui` | Vitest UIを起動 | 視覚的にテスト結果を確認 |
| `npm run test:performance` | パフォーマンステストのみ実行 | 大規模回路のテスト |

### テストのオプション例
```bash
# 特定のファイルのみテスト
npm test tests/components/Canvas.test.tsx

# ウォッチモードで実行
npm test -- --watch

# カバレッジを測定
npm test -- --coverage

# 特定のテスト名でフィルタ
npm test -- -t "should render gate"

# 並列実行数を制限（CI環境用）
npm test -- --maxWorkers=2
```

### E2Eテスト

| コマンド | 説明 | 使用場面 |
|---------|------|----------|
| `npm run cypress:open` | Cypress GUIを起動 | テスト作成・デバッグ |
| `npm run cypress:run` | ヘッドレスモードで実行 | CI環境 |
| `npm run test:e2e` | E2Eテストを実行（エイリアス） | 自動テスト |

### E2Eテストのオプション例
```bash
# 特定のspecファイルのみ実行
npx cypress run --spec "cypress/e2e/free-mode.cy.js"

# ブラウザを指定
npx cypress run --browser chrome

# スクリーンショットを無効化（高速化）
npx cypress run --config screenshotOnRunFailure=false

# ビデオ録画を有効化
npx cypress run --config video=true
```

## 🔍 品質チェックコマンド

### 型チェック

| コマンド | 説明 | 必須度 |
|---------|------|--------|
| `npm run typecheck` | TypeScriptの型チェック | コミット前必須 |
| `npm run typecheck:watch` | 型チェックをウォッチモード | 開発中推奨 |

```bash
# 特定のファイルのみチェック
npx tsc --noEmit src/components/Canvas.tsx

# 型エラーの詳細を表示
npx tsc --noEmit --pretty

# strictモードを一時的に無効化（非推奨）
npx tsc --noEmit --strict false
```

### Lintとフォーマット

| コマンド | 説明 | 使用タイミング |
|---------|------|---------------|
| `npm run lint` | ESLintでコード品質チェック | PR前必須 |
| `npm run lint:fix` | ESLintエラーを自動修正 | 開発中 |
| `npm run format` | Prettierでコード整形 | コミット前推奨 |
| `npm run format:check` | フォーマットチェックのみ | CI環境 |

```bash
# 特定のディレクトリのみlint
npx eslint src/components --ext .ts,.tsx

# 警告も含めて表示
npm run lint -- --max-warnings 0

# 特定のルールを無効化
npx eslint src --rule 'no-console: off'

# Prettierで特定のファイルを整形
npx prettier --write src/components/Canvas.tsx
```

## 📚 ドキュメント・その他

### Storybook

| コマンド | 説明 | 使用場面 |
|---------|------|----------|
| `npm run storybook` | Storybookを起動 | コンポーネント開発 |
| `npm run build-storybook` | Storybookをビルド | デプロイ用 |

```bash
# 別ポートで起動
npm run storybook -- -p 6007

# 静的ファイルとしてビルド
npm run build-storybook -- -o storybook-static
```

## 🎯 実践的なコマンド組み合わせ

### 開発フロー

```bash
# 1. 朝の開発開始時
git pull
npm install  # package.jsonが更新されている場合
npm run dev

# 2. 機能開発中
npm run typecheck:watch  # 別ターミナルで実行
npm test -- --watch      # 別ターミナルで実行

# 3. コミット前の確認
npm run typecheck && npm run lint && npm test

# 4. PR作成前の完全チェック
npm run typecheck && \
npm run lint && \
npm test && \
npm run build && \
npm run test:e2e
```

### デバッグ

```bash
# TypeScriptエラーの詳細調査
npx tsc --noEmit --listFiles | grep "error"

# 特定のテストをデバッグモード
node --inspect-brk ./node_modules/.bin/vitest run tests/specific.test.ts

# ビルドエラーの調査
npm run build -- --debug
```

### パフォーマンス分析

```bash
# バンドルサイズ分析
npm run build -- --analyze

# ビルド時間の測定
time npm run build

# 依存関係のサイズ確認
npx bundle-phobia
```

### CI/CD用

```bash
# GitHub Actions用
npm ci
npm run typecheck
npm run lint
npm test -- --coverage
npm run build

# Vercel用（自動実行）
npm run build
```

## 🛠️ トラブルシューティング用コマンド

### 環境リセット

```bash
# 完全クリーンインストール
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# ビルドキャッシュクリア
rm -rf dist .vite
npm run build

# Git状態のクリーンアップ
git clean -fdx  # ⚠️ 注意：未追跡ファイルも削除
```

### 依存関係の確認

```bash
# 古い依存関係をチェック
npm outdated

# セキュリティ脆弱性をチェック
npm audit

# 依存関係ツリーを表示
npm ls

# 特定のパッケージの依存を確認
npm ls react
```

## 📊 環境変数

開発時に使用可能な環境変数：

| 変数名 | 説明 | デフォルト値 |
|--------|------|-------------|
| `VITE_API_URL` | APIエンドポイント | なし |
| `NODE_ENV` | 環境モード | development/production |
| `PORT` | 開発サーバーポート | 5173 |

```bash
# 環境変数を設定して実行
VITE_API_URL=http://api.example.com npm run dev

# .envファイルを使用
echo "VITE_API_URL=http://localhost:3000" > .env.local
npm run dev
```

## 🔗 関連ドキュメント

- [QUICK_START.md](./QUICK_START.md) - 5分で始めるガイド
- [FAQ.md](./FAQ.md) - よくある質問
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - トラブルシューティング
- [GUIDELINES.md](./development/GUIDELINES.md) - 開発ガイドライン

---

**💡 ヒント**: このリファレンスをブックマークして、開発中にすぐアクセスできるようにしましょう。
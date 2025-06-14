# ❓ FAQ - よくある質問

LogicCirc開発でよく遭遇する問題と解決方法をまとめました。

## 📋 目次

1. [環境構築](#環境構築)
2. [開発サーバー](#開発サーバー)
3. [TypeScriptとビルド](#typescriptとビルド)
4. [テスト](#テスト)
5. [UI・レイアウト](#ui・レイアウト)
6. [ゲートとワイヤー](#ゲートとワイヤー)
7. [シミュレーション](#シミュレーション)
8. [カスタムゲート](#カスタムゲート)
9. [パフォーマンス](#パフォーマンス)
10. [デバッグ](#デバッグ)

---

## 環境構築

### Q: npm installでエラーが出る
**A:** Node.jsのバージョンを確認してください。
```bash
node -v  # v18.0.0以上が必要

# nvm使用の場合
nvm install 18
nvm use 18

# 依存関係を再インストール
rm -rf node_modules package-lock.json
npm install
```

### Q: Windowsで改行コードの警告が出る
**A:** Git設定を確認してください。
```bash
# 改行コードを自動変換しない設定
git config --global core.autocrlf false

# 既存ファイルの改行コードを修正
npm run format
```

## 開発サーバー

### Q: localhost:5173にアクセスできない
**A:** ポートが使用中か、ファイアウォールの可能性があります。
```bash
# 別のポートで起動
npm run dev -- --port 3000

# ネットワーク経由でアクセス可能にする
npm run dev -- --host
```

### Q: ホットリロードが効かない
**A:** Viteの設定やファイルシステムの問題です。
```bash
# Viteのキャッシュをクリア
rm -rf node_modules/.vite

# ファイル監視の上限を増やす（Linux/Mac）
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## TypeScriptとビルド

### Q: 大量の型エラーが表示される
**A:** TypeScript設定とVSCode設定を確認してください。
```bash
# TypeScriptバージョンを確認
npx tsc --version  # Version 5.8.3

# 型チェックのみ実行
npm run typecheck

# VSCodeの設定（.vscode/settings.json）
{
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

### Q: import文でパスエラーが出る
**A:** エイリアスの設定を確認してください。
```typescript
// ✅ 正しい
import { Gate } from '@/types/circuit';

// ❌ 間違い
import { Gate } from '../../../types/circuit';
```

### Q: ビルドが失敗する
**A:** エラーメッセージに従って対処してください。
```bash
# 型エラーを無視してビルド（非推奨）
npm run build:no-typecheck

# ビルドサイズ分析
npm run build -- --analyze
```

## テスト

### Q: テストがタイムアウトする
**A:** テストの実行時間を確認してください。
```bash
# 特定のテストファイルのみ実行
npm test -- tests/components/Canvas.test.tsx

# タイムアウトを延長
npm test -- --testTimeout=10000
```

### Q: SVG要素の警告が大量に出る
**A:** jsdom環境の制限です。無視して構いません。
```javascript
// テストファイルで警告を抑制
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
```

### Q: E2Eテストが動かない
**A:** Cypressの設定を確認してください。
```bash
# Cypressを対話モードで起動
npx cypress open

# ヘッドレスモードで実行
npm run test:e2e
```

## UI・レイアウト

### Q: モバイルでボタンが小さすぎる
**A:** タッチターゲットのサイズを確認してください。
```css
/* 最小44x44pxを確保 */
.button {
  min-width: 44px;
  min-height: 44px;
  padding: 12px;
}
```

### Q: レスポンシブデザインが崩れる
**A:** ブレークポイントとメディアクエリを確認してください。
```typescript
// useMediaQuery.tsの設定
const breakpoints = {
  mobile: 640,
  tablet: 768,
  desktop: 1024
};
```

## ゲートとワイヤー

### Q: ワイヤーの接続がずれる
**A:** ピン位置の計算を確認してください。
```typescript
// pinPositionCalculator.tsの設定
const PIN_OFFSET = {
  standard: 85,  // 標準ゲート
  custom: 85,    // カスタムゲート（統一）
};
```

### Q: ゲートが選択できない
**A:** z-indexとイベントハンドラを確認してください。
```typescript
// クリック領域のデバッグ
onMouseDown={(e) => {
  console.log('Gate clicked:', gate.id);
  e.stopPropagation();
}}
```

### Q: ドラッグ&ドロップが効かない
**A:** イベントの伝播を確認してください。
```typescript
// ToolPalette.tsxでの実装
onDragStart={(e) => {
  e.dataTransfer.setData('gateType', gateType);
  e.dataTransfer.effectAllowed = 'copy';
}}
```

## シミュレーション

### Q: CLOCKゲートが同期しない
**A:** useEffectの依存配列を確認してください。
```typescript
// Canvas.tsxでの実装
useEffect(() => {
  // CLOCKゲートの同期処理
}, [clockGates.length, isRunning]); // 両方の依存が必要
```

### Q: 評価エラー「Maximum depth exceeded」
**A:** 回路にループがある可能性があります。
```typescript
// 評価設定を調整
const config = {
  maxEvaluationDepth: 1000, // デフォルト100から増加
};
```

### Q: シミュレーションが遅い
**A:** 回路の複雑さとCLOCKの周波数を確認してください。
```typescript
// CLOCK周波数を調整（デフォルト50ms）
const CLOCK_INTERVAL = 100; // 100msに変更
```

## カスタムゲート

### Q: カスタムゲート作成ダイアログが開かない
**A:** イベントリスナーとカスタムイベントを確認してください。
```typescript
// デバッグログを追加
window.addEventListener('open-custom-gate-dialog', (e) => {
  console.log('Custom gate dialog event:', e.detail);
});
```

### Q: 真理値表が生成されない
**A:** 入出力の定義を確認してください。
```typescript
// definition.outputsにnameプロパティが必須
outputs: [
  { id: 'out1', name: 'OUT1' }, // nameが必要
];
```

## パフォーマンス

### Q: 大規模回路で動作が重い
**A:** 最適化の方法：
```typescript
// 1. 不要な再レンダリングを防ぐ
const MemoizedGate = memo(GateRenderer);

// 2. 評価を効率化
const evaluateOnlyChanged = true;

// 3. デバッグ出力を無効化
debug.disable();
```

### Q: メモリ使用量が増え続ける
**A:** メモリリークの可能性があります。
```typescript
// クリーンアップを確実に実行
useEffect(() => {
  const interval = setInterval(updateClock, 50);
  return () => clearInterval(interval); // 必須
}, []);
```

## デバッグ

### Q: console.logが本番環境で表示される
**A:** debugユーティリティを使用してください。
```typescript
import { debug } from '@/shared/debug';

// 開発環境でのみ出力
debug.log('Component state:', state);
debug.error('Error occurred:', error);
```

### Q: 状態の変更が追跡できない
**A:** Zustand DevToolsを活用してください。
```typescript
// ブラウザコンソールで実行
window.__ZUSTAND_DEVTOOLS__ = true;

// Redux DevToolsで状態を確認
```

### Q: エラーの原因が分からない
**A:** 段階的にデバッグしてください。
```bash
# 1. TypeScriptエラーを確認
npm run typecheck

# 2. テストを実行
npm test

# 3. ビルドを確認
npm run build

# 4. ブラウザコンソールを確認
# 5. React Developer Toolsで確認
```

---

## 🔗 関連ドキュメント

- [QUICK_START.md](./QUICK_START.md) - 5分で始めるガイド
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - 詳細なトラブルシューティング
- [GUIDELINES.md](./development/GUIDELINES.md) - 開発ガイドライン
- [ARCHITECTURE.md](./development/ARCHITECTURE.md) - 技術アーキテクチャ

## 💬 それでも解決しない場合

1. エラーメッセージを正確にコピー
2. 再現手順を明確に記録
3. 環境情報を収集（OS、Node.jsバージョン、ブラウザ）
4. GitHubのIssuesで質問

---

**このFAQは継続的に更新されます。新しい問題と解決方法を追加してください。**
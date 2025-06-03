# 移行計画

## 現在の状況

### 完了した作業
- ✅ 新しいストア構造の設計と実装
  - `historyStore.ts`
  - `selectionStore.ts` 
  - `clipboardStore.ts`
  - `circuitStore.refactored.ts`
  - `WireConnectionService.ts`
- ✅ 型安全性の向上（`specialGates.ts`）
- ✅ ピン位置計算の統一化
- ✅ E2Eテストファイルの整理（141→18ファイル）

### 未完了の作業
- ❌ アプリケーションコードの移行
- ❌ テストの更新
- ❌ data-testid属性の追加

## 移行手順

### Phase 1: 準備（1-2時間）
1. **data-testid属性の追加**
   - ToolPalette.tsx: 各ゲートボタンに`data-testid="gate-{type}"`
   - Canvas.tsx: `data-testid="canvas"`
   - Gate.tsx: `data-gate-id={gate.id}`属性
   - Wire.tsx: `data-wire-id={wire.id}`属性

2. **インポートパスの準備**
   - 新旧のストアを共存させる
   - 段階的に移行できるようにする

### Phase 2: コンポーネントの移行（2-3時間）
1. **選択機能の移行**
   - Gate.tsx → useSelectionStore
   - Canvas.tsx → useSelectionStore

2. **クリップボード機能の移行**
   - Header.tsx → useClipboardStore
   - キーボードショートカット → useClipboardStore

3. **履歴機能の移行**
   - Header.tsx → useHistoryStore

### Phase 3: メインストアの移行（3-4時間）
1. **circuitStore.tsの置き換え**
   - 既存のインポートを`circuitStore.refactored.ts`に変更
   - または`useStores`フックを使用

2. **ワイヤー接続ロジックの移行**
   - WireConnectionServiceを使用

### Phase 4: テストの修正（2-3時間）
1. **E2Eテストの更新**
   - 新しいdata-testidを使用
   - ドラッグ&ドロップ方式に対応

2. **単体テストの追加**
   - 新しいストアのテスト
   - サービスのテスト

## リスクと対策

### リスク
1. **大規模な変更による一時的な不安定性**
   - 対策: 段階的移行、十分なテスト

2. **パフォーマンスへの影響**
   - 対策: 開発者ツールでの監視

3. **予期しない依存関係**
   - 対策: TypeScriptの型チェック活用

## 期待される成果
- コードの保守性向上
- テストの信頼性向上
- 開発効率の向上
- バグの削減
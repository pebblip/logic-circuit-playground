# ToolPalette Component Tests

## テストファイル
`/src/components/ToolPalette.test.tsx`

## テストカバレッジ

### 1. Render all gate types (すべてのゲートタイプの表示)
- 基本ゲート（AND, OR, NOT, XOR, NAND, NOR）の表示確認
- 入出力ゲート（INPUT, OUTPUT, CLOCK）の表示確認
- 特殊ゲート（D-FF, SR-LATCH, MUX）の表示確認
- セクションタイトルの表示確認
- デモカスタムゲート（半加算器）の表示確認

### 2. Gate selection functionality (ゲート選択機能)
- ツールチップの表示確認
- 学習モードでの禁止ゲートの無効化
- 自由制作モードでの全ゲート有効化

### 3. Drag initiation from palette (パレットからのドラッグ開始)
- 基本ゲートのドラッグ開始
- カスタムゲートのドラッグ開始  
- 無効化されたゲートのドラッグ制限
- ドラッグ終了時の状態クリア
- window._draggedGateへの情報設定確認

### 4. Search/filter gates (ゲート検索・フィルタ機能)
- 将来的な検索機能のテスト構造
- 現在は未実装のため基本構造のみ

### 5. Category organization (カテゴリ分け)
- 基本ゲートカテゴリの表示確認（6個）
- 入出力ゲートカテゴリの表示確認（3個）
- 特殊ゲートカテゴリの表示確認（3個）

### 6. Custom gates in palette (カスタムゲートの表示)
- ユーザー作成カスタムゲートの表示
- カスタムゲート作成ボタンの表示・動作
- カスタムゲートの右クリック真理値表表示

### 7. Mobile/desktop layouts (モバイル・デスクトップレイアウト)
- ツールパレットの基本表示
- ツールカードの適切なクラス設定
- ツールグリッドレイアウトの適用

### 8. Keyboard navigation (キーボードナビゲーション)
- フォーカス可能要素の確認
- ドラッグ可能要素のカーソルスタイル確認
- 現在は基本構造のみ（将来的な拡張用）

### 9. Custom gate dialog integration (カスタムゲートダイアログ統合)
- ダイアログの初期状態確認
- カスタムゲート作成関数の存在確認

### 10. Error handling and edge cases (エラーハンドリングとエッジケース)
- カスタムゲート空配列の処理
- allowedGatesがnullの場合の処理
- dataTransferがnullの場合のドラッグハンドリング
- 真理値表がないカスタムゲートの右クリック処理

## モック設定

### useCircuitStore
- gates, customGates, addCustomGate, createCustomGateFromCurrentCircuit
- allowedGates, appMode の状態管理

### TruthTableDisplay
- 真理値表表示ダイアログのモック

### CreateCustomGateDialog  
- カスタムゲート作成ダイアログのモック

## テスト実行
```bash
npm test -- src/components/ToolPalette.test.tsx
```

## テスト結果
✅ 31 tests passed (全テスト成功)

## 主な検証項目
- ゲートの正しい表示と分類
- ドラッグ&ドロップ機能
- 学習モード・自由制作モードでの動作差
- カスタムゲートの管理・表示
- エラーハンドリング
- UI要素の適切な配置とスタイリング
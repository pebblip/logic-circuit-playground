# 🏗️ 論理回路プレイグラウンド - Hybrid Feature-Domain Architecture

## 🎯 アーキテクチャ選定理由

### なぜHybrid Feature-Domain Architectureか？

このプロジェクトの特性を考慮した結果、Pure Feature-Sliced DesignでもシンプルなMVCでもない、**ハイブリッドアーキテクチャ**を採用しています。

#### プロジェクトの特性

- **規模**: 中規模（大規模アーキテクチャは過剰）
- **ドメイン**: 明確（回路シミュレーション）
- **UI複雑度**: 高い（インタラクティブなキャンバス操作）
- **拡張性**: 必要（学習モード、パズルモード、カスタムゲート）

#### このアーキテクチャの特徴

1. **Feature層**: UIとその直接的なロジックを機能単位で管理
2. **Domain層**: UIに依存しないビジネスロジックを集約
3. **適切な粒度**: 機能の複雑さに応じて柔軟に構造化

## 📁 現在のディレクトリ構造

```
src/
├── 🎨 features/                 # 機能単位のUI層
│   ├── gallery/                 # ギャラリーモード
│   │   ├── components/
│   │   │   ├── GalleryListPanel.tsx
│   │   │   ├── GalleryDetailPanel.tsx
│   │   │   └── GalleryModeLayout.tsx
│   │   └── data/               # 構造化レイアウト済みサンプル回路
│   │       ├── sr-latch-basic.ts
│   │       ├── clock-divider.ts
│   │       └── ...
│   │
│   ├── learning-mode/           # 学習モード（完成度高）
│   │   ├── components/          # レッスン表示コンポーネント
│   │   │   ├── LessonStepRenderer.tsx
│   │   │   └── content-renderers/
│   │   ├── data/               # レッスンデータ
│   │   │   ├── lessons.ts
│   │   │   ├── lesson-quality.ts
│   │   │   └── structured-lessons/
│   │   └── ui/
│   │       └── LearningPanel.tsx
│   │
│   └── puzzle-mode/            # パズルモード
│       ├── data/
│       │   └── puzzles.ts
│       ├── model/
│       │   └── PuzzleValidator.ts
│       └── ui/
│           └── PuzzlePanel.tsx
│
├── 🔧 domain/                   # ビジネスロジック層
│   ├── analysis/                # 回路分析
│   │   ├── pinPositionCalculator.ts
│   │   └── truthTableGenerator.ts
│   │
│   ├── circuit/                 # 回路操作
│   │   └── layout.ts           # レイアウト計算
│   │
│   └── simulation/             # シミュレーションエンジン
│       ├── core/               # coreAPI（Result<T,E>パターン）
│       │   ├── circuitEvaluation.ts
│       │   ├── gateEvaluation.ts
│       │   ├── errorMessages.ts
│       │   ├── types.ts
│       │   └── validation.ts
│       └── signalConversion.ts
│
├── 🏪 stores/                   # グローバル状態管理（Zustand）
│   ├── circuitStore.ts         # ストア統合
│   └── slices/                 # 機能別スライス（10スライス）
│       ├── appModeSlice.ts     # アプリモード管理
│       ├── clipboardSlice.ts   # コピー&ペースト
│       ├── customGateSlice.ts  # カスタムゲート
│       ├── errorSlice.ts       # エラーメッセージ
│       ├── gateOperations.ts  # ゲート操作
│       ├── historySlice.ts     # 履歴管理
│       ├── selectionSlice.ts  # 選択状態
│       ├── shareSlice.ts       # 回路共有
│       ├── toolPaletteSlice.ts # ツール選択
│       └── wireOperations.ts  # ワイヤー操作
│
├── 🎯 components/               # UIコンポーネント（共有・汎用）
│   ├── canvas/                 # キャンバス関連
│   │   ├── Canvas.tsx          # メインキャンバス
│   │   ├── hooks/
│   │   │   ├── useCanvas.ts    # キャンバスロジック統合
│   │   │   └── useAutoFit.ts  # 自動フィット機能
│   │   └── components/
│   │       └── CanvasControls.tsx
│   ├── Gate.tsx                # ゲート表示
│   ├── Wire.tsx                # ワイヤー表示（遅延モード対応）
│   ├── Header.tsx              # ヘッダー
│   ├── ToolPalette.tsx         # ツールパレット
│   ├── TruthTableDisplay.tsx   # 真理値表表示
│   ├── ErrorNotification.tsx   # エラー通知
│   ├── KeyboardShortcutsHelp.tsx # ショートカットヘルプ
│   │
│   ├── common/                 # 共通コンポーネント
│   │   └── CircuitPreview.tsx
│   │
│   ├── dialogs/                # ダイアログ群
│   │   ├── CreateCustomGateDialog.tsx
│   │   ├── LoadCircuitDialog.tsx
│   │   ├── SaveCircuitDialog.tsx
│   │   └── ShareCircuitDialog.tsx
│   │
│   ├── gate-renderers/         # ゲート描画
│   │   ├── BasicGateRenderer.tsx
│   │   ├── CustomGateRenderer.tsx
│   │   └── SpecialGateRenderer.tsx
│   │
│   ├── layouts/                # レスポンシブレイアウト
│   │   ├── ResponsiveLayout.tsx
│   │   ├── DesktopLayout.tsx
│   │   ├── TabletLayout.tsx
│   │   └── MobileLayout.tsx
│   │
│   └── property-panel/         # プロパティパネル
│       ├── PropertyPanel.tsx
│       ├── GateInfo.tsx
│       └── TruthTableModal.tsx
│
├── 🔨 hooks/                    # カスタムフック
│   ├── useCanvasZoom.ts        # ズーム機能
│   ├── useGateDragAndDrop.ts   # ドラッグ&ドロップ
│   ├── useKeyboardShortcuts.ts # キーボード操作
│   └── useResponsive.ts        # レスポンシブ判定
│
├── 📂 services/                 # ビジネスロジックサービス
│   ├── CircuitShareService.ts  # 回路共有
│   ├── CircuitStorageService.ts # 保存/読み込み
│   └── WireConnectionService.ts # ワイヤー接続検証
│
├── 🎨 styles/                   # スタイルシート
│   ├── index.css               # メインスタイル
│   ├── design-tokens.css       # デザイントークン
│   └── components.css          # コンポーネントスタイル
│
├── 📝 types/                    # 型定義
│   ├── circuit.ts              # 回路関連の型
│   ├── gates.ts                # ゲート関連の型
│   ├── appMode.ts              # アプリモード
│   └── lesson-content.ts       # レッスンコンテンツ
│
└── App.tsx                     # アプリケーションエントリ
```

## 🎮 状態管理戦略

### グローバル状態: Zustand（シンプルに）

```typescript
// stores/circuitStore.ts
export const useCircuitStore = create<CircuitStore>()((...a) => ({
  // 基本的な状態
  gates: [],
  wires: [],
  isDrawingWire: false,
  wireStart: null,

  // エラーメッセージ
  errorMessage: null,
  errorType: null,

  // 各スライスをマージ
  ...createHistorySlice(...a),
  ...createSelectionSlice(...a),
  ...createGateOperationsSlice(...a),
  ...createWireOperationsSlice(...a),
  ...createClipboardSlice(...a),
  ...createCustomGateSlice(...a),
  ...createAppModeSlice(...a),
  ...createToolPaletteSlice(...a),
  ...createShareSlice(...a),
  ...createErrorSlice(...a),
}));
```

### ローカル状態: useState（コンポーネント内）

- UI状態（モーダルの開閉、フォーム入力など）
- 一時的な表示状態

## 🔄 データフロー

```
ユーザー操作
    ↓
UIコンポーネント（features/components）
    ↓
カスタムフック（必要に応じて）
    ↓
Zustand Store（状態更新）
    ↓
Domain層（ビジネスロジック実行）
    ↓
Store更新
    ↓
UIレンダリング
```

## 🏛️ 設計原則

### 1. 機能の凝集性

- 関連する機能は同じディレクトリにまとめる
- 共通利用されるものは適切な階層に配置

### 2. 依存の方向

- UI → Domain（一方向）
- Domain層はUIに依存しない
- 循環依存を避ける

### 3. 責任の分離

- **components/**: 表示とユーザーインタラクション
- **domain/**: ビジネスロジックと計算
- **stores/**: 状態管理
- **services/**: 外部連携や複雑な処理

### 4. 型安全性

- TypeScriptの厳格モード
- Result<T,E>パターンでエラーハンドリング
- any型の使用禁止
- 統一型システム（EvaluationGate→Gate完了）

## 🚀 拡張ポイント

### 新しいゲートタイプの追加

1. `types/gates.ts`に型を追加
2. `models/gates/GateFactory.ts`にファクトリーメソッドを追加
3. `components/gate-renderers/`に描画ロジックを追加

### 新しいモードの追加

1. `features/`に新しいディレクトリを作成
2. `types/appMode.ts`にモードを追加
3. `stores/slices/appModeSlice.ts`に切り替えロジックを追加

### 新しい解析機能の追加

1. `domain/analysis/`に解析ロジックを追加
2. 必要に応じてストアに状態を追加
3. UIコンポーネントから呼び出し

## 📊 パフォーマンス考慮事項

### レンダリング最適化

- React.memoで不要な再レンダリングを防止
- useMemoで計算結果をキャッシュ
- 大量のゲートは仮想化を検討

### 状態更新の最適化

- Zustandのshallow比較で部分更新
- バッチ更新で複数の状態変更をまとめる
- デバウンスで頻繁な更新を制御

## 🔍 デバッグとテスト

### デバッグツール

- React Developer Tools
- Zustand DevTools
- カスタムロギング（debug/index.ts）

### テスト戦略

- ユニットテスト: Domain層のロジック
- 統合テスト: Store + Domain
- E2Eテスト: ユーザーシナリオ

---

## 🎯 最近の主要改善

### 型システム統一（2025年6月）

- EvaluationGateをGateに統一
- 型安全性の完全達成

### ギャラリーレイアウト最適化（2025年6月）

- 構造化レイアウトアルゴリズム導入
- 美的スコアリングシステム（規則性・対称性・バランス）
- 全ギャラリー回路の重なり解消（0件達成）

### 自動フィット機能（2025年6月）

- useAutoFitフックによる動的viewBox計算
- ギャラリーモードでの最適表示

### 遅延モード実装（2025年6月）

- 信号伝播の視覚化
- Wireコンポーネントのアニメーション対応

---

_最終更新: 2025年6月24日_

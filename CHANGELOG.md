# 変更履歴

## [未リリース] - 2025-06-17

### 追加
- Canvas.tsxの包括的リファクタリング
  - 5つのUIコンポーネントを分離（CanvasBackground, CanvasControls, CanvasPreviewHeader, SelectionRect, WirePreview）
  - 3つのカスタムフックを作成（useCanvasSimulation, useCanvasInteraction, useCanvasGateManagement）
  - 1,058行から495行へ削減（53%削減）
  - 新しいフックのテスト作成（34個中32個成功）
- イベント駆動シミュレーション機能の強化
  - MinimalEventDrivenEngineに発振検出機能を追加
  - EnhancedHybridEvaluatorを実装（AUTO_SELECT戦略）
  - SR-LATCHの安定動作を実現
- パズル・ギャラリーモードの統合
  - PuzzlePanelをDesktopLayoutに統合
  - モード切替によるパネル表示制御

### 削除
- 未使用の_future-implementationディレクトリ（6,764行）
- バックアップファイル（.bak）7個（2,440行）
- 合計9,204行の未使用コードを削除

### リファクタリング
- 座標変換関数の統一
  - 6ファイルで重複していた実装をinfrastructure/ui/svgCoordinates.tsに統一
  - clientToSVGCoordinates、touchToSVGCoordinates、reactEventToSVGCoordinatesを標準化

## [未リリース] - 2025-06-16

### 追加
- タイミングチャート機能の実装
  - CLOCKゲートの周波数に応じた動的更新間隔
  - 選択したCLOCKのみ表示機能
  - 連続スクロールモード（オシロスコープライク）
- 品質レビュー報告書（QUALITY_REVIEW.md）の作成
- ヘルプコンテンツのリスト表示対応

### 変更
- 共有ダイアログのデザインを暗いテーマに統一
- ヘルプ機能を右上のヘルプボタンに統合（右下の？ボタンを削除）
- ズームコントロールを右上、ステータスバーを上部中央に配置
- タイミングチャートボタンを左側コントロールパネルに移動
- ヘルプコンテンツの更新
  - CLOCK周波数を1-20Hzに修正
  - ギャラリー/パズルモードを「今後の実装予定」に移動
  - 実装されていない機能の削除（+/-キーズーム、中クリックパン）

### 修正
- ピン状態同期バグを修正（INPUTゲート状態変更時にピン表示が更新されない問題）
  - GateComponentのメモ化比較関数にgate.inputsを追加
- 共有URL復元時の接続線が表示されない問題を修正
- 用語の統一性改善（TERMS使用の徹底）
- ヘルプダイアログの改行表示問題を修正
- KeyboardShortcutsHelpコンポーネントの削除（重複機能）

### 技術的改善
- TypeScript型定義の強化
- コンポーネントの最適化
- 不要なインポートの削除

## [1.0.0] - 2025-06-01

### 初回リリース
- 基本的な論理回路シミュレーション機能
- ドラッグ&ドロップによるゲート配置
- リアルタイムシミュレーション
- カスタムゲート作成機能
- 真理値表自動生成
- 学習モード
- レスポンシブデザイン対応
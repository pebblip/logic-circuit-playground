# CLOCKゲートの使い方

## CLOCKゲートとは
CLOCKゲートは、一定間隔で自動的にON/OFFを繰り返す特殊なゲートです。デジタル回路の同期信号源として使用されます。

## 基本的な使い方

### 1. CLOCKゲートの配置
- ツールバーから「クロック」ボタンをクリック
- キャンバス上の任意の位置をクリックして配置

### 2. CLOCKゲートの制御
CLOCKゲートを右クリックすると、以下の操作ができます：
- **開始/停止**: クロックの動作を開始・停止
- **間隔設定**: パルスの間隔を変更（デフォルト: 1000ms = 1秒）
- **手動トグル**: 現在の状態を手動で切り替え

## 使用例

### 例1: LEDの点滅
```
[CLOCK] → [OUTPUT(LED)]
```
- CLOCKゲートをOUTPUTに接続すると、LEDが自動的に点滅します

### 例2: カウンタ回路
```
[CLOCK] → [Tフリップフロップ] → [OUTPUT]
```
- クロック信号でフリップフロップを駆動し、カウンタを作成

### 例3: データのサンプリング
```
[INPUT(データ)] → [AND] → [OUTPUT]
[CLOCK] --------→ [AND]
```
- クロック信号がHIGHの時だけデータを通過させる

## 実装例コード

```javascript
// CLOCKゲートを追加
const clock = viewModel.addGate('CLOCK', 100, 100);

// 間隔を500msに設定
viewModel.setClockInterval(clock.id, 500);

// クロックを開始
viewModel.startClock(clock.id);

// 状態を確認
const state = viewModel.getClockState(clock.id);
console.log('Running:', state.isRunning); // true
console.log('Interval:', state.interval); // 500

// クロックを停止
viewModel.stopClock(clock.id);
```

## 注意事項
- 複数のCLOCKゲートを使用する場合、それぞれ独立して動作します
- ブラウザのタブが非アクティブになると、タイマーの精度が低下する可能性があります
- 保存・読み込み時は、クロックの動作状態も保存されます

## トラブルシューティング
- **クロックが動かない**: 「開始」をクリックしているか確認
- **速度が遅い**: 間隔設定で値を小さくする（最小: 100ms）
- **不規則な動作**: ブラウザのパフォーマンスを確認
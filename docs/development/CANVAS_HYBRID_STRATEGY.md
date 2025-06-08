# Canvas + HTMLハイブリッド戦略

## 概要
Canvas APIのテキストレンダリングの課題を解決するため、**Canvas（グラフィック）+ HTML（テキスト）**のハイブリッドアプローチを採用。

## 基本原則

### Canvas内のテキストは最小限に
- ❌ タイトル、説明文、ラベル
- ✅ 数値のみ（"0", "1", "2.5V" など）
- ✅ 必要最小限の短いテキスト

### HTMLで表示すべき要素
- タイトル・見出し
- 説明文・キャプション
- 軸ラベル（"時間", "電圧" など）
- インタラクティブコントロール
- 統計情報・計算結果
- 凡例・レジェンド

## 実装パターン

```html
<!-- HTMLコンテナ -->
<div class="diagram-container">
    <h2 class="diagram-title">アナログ vs デジタル信号</h2>
    
    <!-- 凡例（HTML） -->
    <div class="signal-labels">
        <div class="signal-label">
            <div class="indicator analog"></div>
            <span>アナログ信号</span>
        </div>
    </div>
    
    <!-- Canvas（グラフィックのみ） -->
    <div class="canvas-wrapper">
        <canvas id="waveform"></canvas>
    </div>
    
    <!-- 説明（HTML） -->
    <div class="description">
        <p>連続的に変化する信号...</p>
    </div>
</div>
```

```javascript
// Canvas側：グラフィックに専念
function drawWaveform(ctx) {
    // 波形描画
    ctx.strokeStyle = '#ff9500';
    ctx.beginPath();
    // ... 波形の描画 ...
    ctx.stroke();
    
    // 最小限のテキスト（数値のみ）
    ctx.fillText('1', x, y);
}
```

## メリット

### 1. テキスト品質の確保
- ブラウザネイティブのフォントレンダリング
- 日本語表示の問題なし
- サブピクセルレンダリング対応

### 2. アクセシビリティ
- スクリーンリーダー対応
- テキスト選択可能
- キーボードナビゲーション

### 3. レスポンシブ対応
- CSSメディアクエリで簡単に対応
- フォントサイズの動的調整
- レイアウトの柔軟性

### 4. メンテナンス性
- テキスト変更が容易
- 多言語対応が簡単
- スタイルの一元管理

## 実装例

### 波形図
```javascript
// React コンポーネント
const WaveformDiagram = ({ data }) => {
    return (
        <div className="waveform-container">
            <h3>信号波形</h3>
            <div className="axis-labels">
                <span className="y-label">電圧(V)</span>
                <canvas ref={canvasRef} />
                <span className="x-label">時間(ms)</span>
            </div>
            <div className="legend">
                {/* 凡例 */}
            </div>
        </div>
    );
};
```

### タイミングチャート
```javascript
const TimingChart = ({ signals }) => {
    return (
        <div className="timing-chart">
            <div className="signal-names">
                {signals.map(s => <div key={s.id}>{s.name}</div>)}
            </div>
            <canvas ref={canvasRef} />
            <div className="time-axis">
                {/* 時間軸の目盛り */}
            </div>
        </div>
    );
};
```

## 注意点

1. **レイアウトの同期**
   - CanvasとHTMLの位置合わせに注意
   - ResizeObserverで動的にサイズ調整

2. **z-indexの管理**
   - HTML要素がCanvasを覆わないように
   - 適切なレイヤー管理

3. **パフォーマンス**
   - 不要な再描画を避ける
   - requestAnimationFrameの活用

## 結論

このハイブリッドアプローチにより：
- Canvas APIの描画能力を活かしつつ
- テキスト表示の問題を完全に解決
- 保守性とアクセシビリティを確保

学習モードの図表表現において、最も実用的な解決策となる。
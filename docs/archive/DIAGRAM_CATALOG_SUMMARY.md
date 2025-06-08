# 学習モード ダイアグラムカタログ実装まとめ

## 実装完了項目

### 1. 基本ゲート記号（4種類）
- **ANDゲート**: すべての入力が1のときのみ出力が1
- **ORゲート**: 少なくとも1つの入力が1なら出力が1
- **NOTゲート**: 入力を反転
- **XORゲート**: 入力が異なるときのみ出力が1

**特徴**:
- Canvas内はグラフィックのみ（ゲート形状、配線）
- テキスト（ラベル、説明）はHTML側
- 真理値表もHTMLテーブルで表示

### 2. 波形・信号（3種類）
- **アナログ vs デジタル信号**: 連続波形と離散信号の比較
- **クロック信号**: アニメーション付き、周波数調整可能
- **タイミングチャート**: CLK、D、Q信号の時間関係

**特徴**:
- インタラクティブコントロールはHTML側
- Canvas内の日本語テキストは最小限に
- 凡例はHTML側で管理

### 3. 回路接続図（2種類）
- **基本的な接続**: NOTゲート → ANDゲートの例
- **半加算器**: XORとANDで構成される1ビット加算器

**特徴**:
- 複合回路の構成を視覚的に表現
- 信号の流れを色分けで表示

### 4. データ表現（2種類）
- **4ビット加算の視覚化**: 繰り上がりを含む加算過程（アニメーション付き）
- **キャリー伝播遅延**: 繰り上がり信号の伝播を視覚化

**特徴**:
- ビット単位の処理を段階的に表示
- 遅延の概念を視覚的に説明

## Canvas + HTMLハイブリッドの実装パターン

```html
<!-- HTMLコンテナ -->
<div class="diagram-card">
    <!-- ヘッダー（タイトル・説明） -->
    <div class="diagram-header">
        <h3 class="diagram-title">タイトル</h3>
        <p class="diagram-description">説明</p>
    </div>
    
    <!-- Canvas（グラフィックのみ） -->
    <div class="canvas-wrapper">
        <canvas id="canvasId" width="400" height="250"></canvas>
    </div>
    
    <!-- 凡例・ラベル（HTML） -->
    <div class="legend">
        <!-- 凡例項目 -->
    </div>
    
    <!-- コントロール（HTML） -->
    <div class="controls">
        <button>アクション</button>
        <input type="range">
    </div>
    
    <!-- 関連データ（HTMLテーブル） -->
    <div class="table-wrapper">
        <table>
            <!-- 真理値表など -->
        </table>
    </div>
</div>
```

## 学習モードへの組み込み方法

### 1. 新しいコンテンツタイプの定義

```typescript
// types/lesson-content.ts に追加
interface CanvasDiagramContent {
  type: 'canvas-diagram';
  diagramType: 'gate-symbol' | 'waveform' | 'timing-chart' | 'circuit' | 'bit-array';
  props: {
    id: string;
    title?: string;
    description?: string;
    width?: number;
    height?: number;
    // その他のプロパティ
  };
}
```

### 2. レンダラーコンポーネントの作成

```typescript
// components/content-renderers/CanvasDiagramRenderer.tsx
import React, { useEffect, useRef } from 'react';

export const CanvasDiagramRenderer: React.FC<Props> = ({ content }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // diagramTypeに応じて適切な描画関数を呼び出す
    switch (content.diagramType) {
      case 'gate-symbol':
        drawGateSymbol(ctx, content.props);
        break;
      case 'waveform':
        drawWaveform(ctx, content.props);
        break;
      // ...
    }
  }, [content]);
  
  return (
    <div className="canvas-diagram-container">
      {content.props.title && (
        <h4 className="diagram-title">{content.props.title}</h4>
      )}
      <div className="canvas-wrapper">
        <canvas 
          ref={canvasRef}
          width={content.props.width || 400}
          height={content.props.height || 250}
        />
      </div>
      {content.props.description && (
        <p className="diagram-description">{content.props.description}</p>
      )}
    </div>
  );
};
```

### 3. 描画関数の移植

カタログで実装した描画関数を別ファイルに移植：

```typescript
// utils/canvasDrawing.ts
export function drawGateSymbol(
  ctx: CanvasRenderingContext2D,
  type: 'AND' | 'OR' | 'NOT' | 'XOR',
  x: number,
  y: number,
  width = 80,
  height = 60
) {
  // カタログから移植
}

export function drawWaveform(
  ctx: CanvasRenderingContext2D,
  signals: SignalData[]
) {
  // カタログから移植
}
```

### 4. 既存のASCIIアートを置き換え

例：デジタル基礎レッスンの波形

```typescript
// 旧（ASCIIアート）
{
  type: 'ascii-art',
  art: `電圧レベルとデジタル信号...`
}

// 新（Canvas図）
{
  type: 'canvas-diagram',
  diagramType: 'waveform',
  props: {
    id: 'digital-levels',
    title: '電圧レベルとデジタル信号',
    signals: [
      { name: 'analog', type: 'analog', color: '#ff9500' },
      { name: 'digital', type: 'digital', color: '#00ff88' }
    ]
  }
}
```

## 実装の優先順位

1. **Phase 1**: 基本実装
   - CanvasDiagramRendererコンポーネント作成
   - 描画関数の移植
   - ContentRendererへの統合

2. **Phase 2**: 段階的置き換え
   - 最も単純な図（ゲート記号）から開始
   - 波形図、タイミングチャートへ拡張
   - 複雑な回路図は最後に

3. **Phase 3**: 機能拡張
   - アニメーション機能
   - インタラクティブ要素
   - レスポンシブ対応

## まとめ

Canvas + HTMLハイブリッドアプローチにより：
- **テキスト品質**: HTMLでネイティブレンダリング
- **グラフィック品質**: Canvasで精密な描画
- **保守性**: 関心の分離により管理が容易
- **アクセシビリティ**: HTML側でスクリーンリーダー対応

このカタログを基に、学習モードの視覚的品質を大幅に向上させることができます。
# 配線視認性改善提案

## 問題の要約
半加算器のような複数分岐がある回路では、どの入力がどのゲートに接続されているか分かりにくい。

## 解決策の比較

### 1. 色分け方式 ⭐⭐⭐⭐⭐
**実装内容**:
```typescript
interface WireConfig {
  // 既存のプロパティ
  from: { x: number; y: number };
  to: { x: number; y: number };
  // 新規追加
  color?: string;  // 配線の色
  group?: string;  // グループ識別子（例: 'input-a', 'input-b'）
}
```

**メリット**:
- 実装が簡単（1時間程度）
- 静的でも効果的
- 学習者に直感的

### 2. ホバー強調 ⭐⭐⭐⭐
**実装内容**:
- 配線をグループ化（`<g class="wire-group">`）
- CSSでホバー効果
- 他のグループを半透明化

**メリット**:
- インタラクティブで学習効果高
- 実装は中程度（1-2時間）

### 3. 改善されたルーティング ⭐⭐⭐⭐⭐
**実装内容**:
- 分岐点を垂直に整列
- 配線の間隔を適切に設定
- ジャンクション（分岐点）を明示

**メリット**:
- 構造が明確
- 実装が簡単（座標調整のみ）

### 4. アニメーション ⭐⭐⭐
**実装内容**:
- CSS/JSでの信号フローアニメーション
- 点線の移動で流れを表現

**メリット**:
- 視覚的にインパクトがある
- 実装は中程度だが、学習モードでは過剰かも

## 推奨：統合アプローチ

### 実装内容
```typescript
// StaticCircuitDiagramV2の拡張
interface WireConfig {
  from: { x: number; y: number };
  to: { x: number; y: number };
  active?: boolean;
  label?: string;
  type?: 'straight' | 'orthogonal' | 'bezier';
  // 新規追加
  color?: string;          // 配線の色
  group?: string;          // グループID（ホバー用）
  showJunction?: boolean;  // 分岐点表示
  backgroundOpacity?: number; // 背景の透明度
}

// 使用例
const halfAdderWires = [
  // 入力A（オレンジ）
  {
    from: { x: 135, y: 150 },
    to: { x: 255, y: 105 },
    color: '#ff9500',
    group: 'input-a',
    showJunction: true,
    type: 'orthogonal'
  },
  // 入力B（シアン）
  {
    from: { x: 135, y: 250 },
    to: { x: 255, y: 135 },
    color: '#4ecdc4',
    group: 'input-b',
    showJunction: true,
    type: 'orthogonal'
  }
];
```

### 視覚的改善
1. **色分け**: 入力ごとに異なる色
2. **ジャンクション**: 分岐点に●表示
3. **背景**: 薄い色で配線グループを強調
4. **ラベル**: 分岐点に入力名表示
5. **ホバー**: マウスオーバーで強調

### CSSの追加
```css
/* 配線グループのホバー効果 */
.wire-group {
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.wire-group:hover .wire {
  stroke-width: 4;
  filter: drop-shadow(0 0 8px currentColor);
}

/* 他のグループを薄くする */
.circuit-diagram:has(.wire-group:hover) .wire-group:not(:hover) {
  opacity: 0.3;
}

/* ジャンクション */
.junction {
  fill: currentColor;
  stroke: var(--bg-primary);
  stroke-width: 2;
}
```

## 実装工数と優先順位

### Phase 1: 基本実装（2時間）
1. WireConfigに色とグループプロパティ追加
2. predefinedCircuitsV2の更新
3. 基本的な色分け実装

### Phase 2: 視覚的改善（1時間）
1. ジャンクション表示
2. 配線の背景追加
3. ラベル表示

### Phase 3: インタラクティブ機能（1時間）
1. ホバー効果
2. グループの強調表示

**合計: 約4時間**

## 期待される効果

1. **学習効果の向上**
   - 配線の追跡が容易に
   - 回路の理解が深まる

2. **ユーザビリティ向上**
   - 直感的な操作
   - 視覚的に美しい

3. **拡張性**
   - 将来的により複雑な回路にも対応可能

## 実装サンプル

```tsx
// components/circuit-diagram/StaticCircuitDiagramV2.tsx の拡張

const renderWire = (wire: WireConfig, defaultType: WireType = 'straight') => {
  const { 
    from, to, active = false, label, 
    type = defaultType, color, group, 
    showJunction, backgroundOpacity = 0.2 
  } = wire;
  
  const strokeColor = color || (active ? '#00ff88' : '#666');
  const path = getWirePath(from, to, type);
  
  return (
    <g className={`wire-group ${group || ''}`} data-group={group}>
      {/* 背景 */}
      {backgroundOpacity > 0 && (
        <path
          d={path}
          fill="none"
          stroke={strokeColor}
          strokeWidth={8}
          opacity={backgroundOpacity}
        />
      )}
      
      {/* メイン配線 */}
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={2}
        className="wire"
      />
      
      {/* ジャンクション */}
      {showJunction && (
        <circle
          cx={from.x}
          cy={from.y}
          r={5}
          fill={strokeColor}
          className="junction"
        />
      )}
      
      {/* ラベル */}
      {label && (
        <text
          x={from.x}
          y={from.y - 10}
          textAnchor="middle"
          fill={strokeColor}
          fontSize={10}
          fontWeight="bold"
        >
          {label}
        </text>
      )}
    </g>
  );
};
```

この提案により、学習モードの回路図がより分かりやすく、教育効果の高いものになります。
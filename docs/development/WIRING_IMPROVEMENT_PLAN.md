# 学習モード配線表示の改善提案

## 現状の問題点

スクリーンショットを確認した結果、以下の問題が判明：

### 1. 配線が繋がって見えない
- ベジェ曲線により、視覚的に配線が浮いて見える
- 特にゲートの入力ピンへの接続が不明瞭

### 2. 学習用途には複雑すぎる
- ベジェ曲線は美しいが、初学者には分かりにくい
- 標準的な回路図は直線か90度の折れ線を使用

## 実装オプションの比較

### オプション1: StaticCircuitDiagramを拡張（推奨）✅

```typescript
interface WireConfig {
  from: { x: number; y: number };
  to: { x: number; y: number };
  active?: boolean;
  label?: string;
  type?: 'bezier' | 'straight' | 'orthogonal'; // 新規追加
}
```

**メリット**:
- 工数: 小（1-2時間）
- 既存コードを活かせる
- 段階的な改善が可能

**実装例**:
```typescript
const renderWire = (wire: WireConfig) => {
  const { from, to, active = false, type = 'straight' } = wire;
  
  let path: string;
  switch (type) {
    case 'straight':
      path = `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
      break;
    case 'orthogonal':
      // L字型の配線
      if (Math.abs(to.x - from.x) > Math.abs(to.y - from.y)) {
        // 水平方向優先
        const midX = (from.x + to.x) / 2;
        path = `M ${from.x} ${from.y} L ${midX} ${from.y} L ${midX} ${to.y} L ${to.x} ${to.y}`;
      } else {
        // 垂直方向優先
        const midY = (from.y + to.y) / 2;
        path = `M ${from.x} ${from.y} L ${from.x} ${midY} L ${to.x} ${midY} L ${to.x} ${to.y}`;
      }
      break;
    case 'bezier':
    default:
      // 現在の実装
      const midX = (from.x + to.x) / 2;
      path = `M ${from.x} ${from.y} Q ${midX} ${from.y} ${midX} ${(from.y + to.y) / 2} T ${to.x} ${to.y}`;
  }
  
  return <path d={path} ... />;
};
```

### オプション2: 学習専用コンポーネント

**メリット**:
- シンプルで理解しやすい
- 学習に特化した機能

**デメリット**:
- 工数: 中（3-4時間）
- コードの重複
- メンテナンスコスト増

### オプション3: 既存Canvasを静的モードで使用

**メリット**:
- 統一感のあるデザイン
- 実際の回路と同じ見た目

**デメリット**:
- 工数: 大（5-6時間）
- 複雑すぎる
- パフォーマンスの懸念

## 座標計算の改善

現在の問題：
```typescript
// INPUTの出力: x=135 (100+35)
// ANDの入力上: x=265, y=135 (150-15)
// ANDの入力下: x=265, y=165 (150+15)
```

改善案：
```typescript
// ゲートのピン位置を正確に計算する関数
function getGatePinPosition(gate: GateConfig, pinType: 'input' | 'output', index: number = 0) {
  const { type, x, y } = gate;
  
  if (type === 'INPUT') {
    return { x: x + 35, y: y };
  }
  
  if (type === 'OUTPUT') {
    return { x: x - 35, y: y };
  }
  
  // 基本ゲート
  if (pinType === 'output') {
    return { x: x + 35, y: y };
  } else {
    // 入力ピン
    const isNotGate = type === 'NOT';
    if (isNotGate) {
      return { x: x - 35, y: y };
    } else {
      // 2入力ゲート
      const yOffset = index === 0 ? -15 : 15;
      return { x: x - 35, y: y + yOffset };
    }
  }
}
```

## 実装手順

### Phase 1: 直線配線の実装（1時間）
1. WireConfigに`type`プロパティを追加
2. renderWireメソッドを拡張
3. 既存のpredefinedCircuitsを直線配線に更新

### Phase 2: 座標計算の改善（30分）
1. getGatePinPosition関数を実装
2. predefinedCircuitsの座標を自動計算に変更

### Phase 3: orthogonal配線の実装（30分）
1. L字型配線のロジックを実装
2. 複雑な回路用のオプションとして提供

## 期待される結果

### Before（現在）
- ベジェ曲線で浮いて見える配線
- ゲートとの接続が不明瞭

### After（改善後）
- 直線または90度の折れ線
- 明確な接続点
- 学習者にとって分かりやすい表示

## 使用例

```typescript
// 学習モードでの使用
<StaticCircuitDiagram
  gates={[...]}
  wires={[
    { 
      from: getGatePinPosition(inputA, 'output'),
      to: getGatePinPosition(andGate, 'input', 0),
      type: 'straight',  // または 'orthogonal'
      active: true
    }
  ]}
  width={600}
  height={300}
  title="ANDゲート基本回路"
/>
```

## まとめ

- **推奨**: オプション1（StaticCircuitDiagram拡張）
- **工数**: 約2時間
- **効果**: 学習者にとって分かりやすい回路図表示
- **拡張性**: 将来的に他の配線スタイルも追加可能
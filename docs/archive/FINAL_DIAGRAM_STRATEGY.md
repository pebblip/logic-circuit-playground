# 学習モード図表表現の最終戦略

## エグゼクティブサマリー
調査の結果、単一の手法では完成に至らないことが判明。**ハイブリッドアプローチ**を推奨。

## 推奨実装戦略

### 1. 回路図 → **既存Canvasコンポーネント**（静的モード）
```typescript
// 既存の高品質なレンダラーを活用
<Canvas readOnly={true} circuit={lessonCircuit} />
```
- **理由**: 既に完成度が高く、統一感がある
- **実装コスト**: 最小（既存資産の活用）

### 2. 波形図・タイミングチャート → **Canvas API**
```typescript
// 新規実装：WaveformRenderer
interface WaveformData {
  signals: {
    name: string;
    data: number[];
    type: 'analog' | 'digital';
  }[];
  timeScale: number;
}
```
- **理由**: 時間軸の滑らかな表現、高パフォーマンス
- **参考**: public/diagram-rendering-demo.htmlのCanvas実装

### 3. 比較図（アナログvs デジタル）→ **SVG + CSS**
```typescript
// シンプルなSVGコンポーネント
<ComparisonDiagram type="analog-vs-digital" />
```
- **理由**: 静的で単純な図形、レスポンシブ対応が容易

### 4. 真理値表 → **現状維持（HTML Table）**
- **理由**: すでに美しく機能的
- **改善点**: インタラクティブなハイライト追加

### 5. ブロック図・フローチャート → **Mermaid.js**（オプション）
```typescript
// 宣言的な記述
const cpuBlockDiagram = `
graph LR
  A[入力部] --> B[デコーダ]
  B --> C[演算部]
  C --> D[出力部]
`;
```
- **理由**: 自動レイアウト、保守性が高い
- **注意**: バンドルサイズを考慮し、必要最小限に

## 実装優先順位

1. **Phase 1（即時実装）**
   - 回路図: 既存Canvasの静的モード化
   - 真理値表: 現状維持

2. **Phase 2（短期）**
   - 波形図: Canvas APIでWaveformRenderer実装
   - 比較図: シンプルなSVGコンポーネント

3. **Phase 3（中期・オプション）**
   - ブロック図: 必要に応じてMermaid.js導入
   - アニメーション: Framer Motion（ユーザー要望次第）

## なぜこのアプローチで完成に向かうのか

1. **既存資産の最大活用**
   - 回路図は既に高品質なので再利用
   - 車輪の再発明を避ける

2. **適材適所**
   - 各図表タイプに最適な技術を選択
   - 無理にSVGで統一しない

3. **段階的実装**
   - 小さく始めて確実に進める
   - ユーザーフィードバックを取り入れやすい

4. **保守性重視**
   - 各コンポーネントが独立
   - 将来の改善が容易

## 実装例

```typescript
// ContentRenderer.tsxの改善
export const ContentRenderer: React.FC<ContentProps> = ({ content }) => {
  switch (content.type) {
    case 'circuit':
      // 既存のCanvasを静的モードで使用
      return <StaticCircuitDiagram circuit={content.circuit} />;
      
    case 'waveform':
      // 新規：Canvas APIベース
      return <WaveformRenderer data={content.waveformData} />;
      
    case 'comparison':
      // 新規：シンプルなSVG
      return <ComparisonDiagram {...content.props} />;
      
    case 'table':
      // 現状維持
      return <TableRenderer {...content} />;
      
    // 既存のASCIIアートは段階的に置換
    case 'ascii-art':
      return <AsciiArtRenderer {...content} />;
  }
};
```

## 成功の指標

1. **完成度**: 各図表が美しく正確に表示される
2. **統一感**: アプリ全体でデザインが統一されている
3. **パフォーマンス**: 高速な描画と応答性
4. **保守性**: 将来の改善が容易

この戦略により、確実に完成に向かうことができます。
# オブジェクト指向リファクタリング

## 概要

このドキュメントは、Logic Circuit Playgroundにおける大規模なオブジェクト指向リファクタリングの記録です。

## 実施内容

### 1. レガシーoutputフィールドの完全削除

**背景**: 
- ゲートの出力値が`output`と`outputs[0]`の2つのフィールドで管理されていた
- 中途半端な移行状態が技術負債化していた

**対応**:
- 全ファイルで`gate.output`を`gate.outputs[0]`に置き換え
- 型定義から`output?: boolean`フィールドを削除
- 移行ユーティリティの作成を避け、完全移行を実施

### 2. SpecialGateRendererのオブジェクト指向化

**背景**:
- 783行の巨大なswitch文でレンダラーを選択していた
- 新しいゲート追加時にswitch文の修正が必要だった

**対応**:
```typescript
// Before
switch (gate.type) {
  case 'CLOCK':
    return <ClockGateRenderer ... />;
  case 'D-FF':
    return <DFFGateRenderer ... />;
  // ... 延々と続く
}

// After
const SPECIAL_GATE_RENDERERS: Record<string, RendererComponent> = {
  CLOCK: ClockGateRenderer,
  'D-FF': DFFGateRenderer,
  // ... 設定ベース
};

return <Renderer {...props} />;
```

**成果**:
- ファイルサイズ: 783行 → 47行（94%削減）
- 個別レンダラーを別ファイルに分離
- 新規ゲート追加が設定追加のみで可能に

### 3. GateFactoryのオブジェクト指向化

**背景**:
- switch文でゲートタイプごとに処理を分岐
- ゲート定義が複数箇所に散在

**対応**:
```typescript
const GATE_CONFIGS: Record<string, GateConfig> = {
  AND: { size: { width: 70, height: 50 }, pins: { inputs: 2, outputs: 1 } },
  // ... 全ゲートの設定を一元管理
};
```

**成果**:
- 設定駆動型のゲート生成
- Single Source of Truth実現
- 型安全性の向上

### 4. 技術負債の完全削除

**削除したファイル/ディレクトリ**:
- `src/domain/migration/` - 移行ユーティリティ
- `src/types/specialGates.ts` - 未使用の型定義
- `tests/integration/legacy-compatibility.test.ts` - レガシー互換テスト
- その他の移行関連コード

**変更した用語**:
- `legacy` → `ui` (UI表示用を明確に)
- アダプターパターンの完全削除

## アーキテクチャの改善

### Before
```
Component → switch文 → 具体的な処理
            ↓
         新規追加時に修正必要
```

### After
```
Component → 設定オブジェクト → 動的ディスパッチ
                ↓
            設定追加のみで拡張可能
```

## 品質指標

- **TypeScript**: エラー0件
- **ESLint**: エラー0件
- **テストカバレッジ**: 全機能のテストを維持
- **コード削減**: 重複コードの大幅削減

## 今後の拡張性

新しいゲートタイプの追加手順:

1. `GATE_CONFIGS`に設定を追加
2. レンダラーコンポーネントを作成
3. `SPECIAL_GATE_RENDERERS`にマッピングを追加

switch文の修正は一切不要。

## 学んだ教訓

1. **中途半端な移行は避ける**: 移行ユーティリティは技術負債になりやすい
2. **設定駆動型設計の価値**: 拡張が容易で保守性が高い
3. **完全性の重要性**: 部分的な対応より完全な対応を選ぶ

## 参考

- CLAUDE.md: 品質ゲートシステムの遵守
- オブジェクト指向設計原則
- Single Source of Truth原則
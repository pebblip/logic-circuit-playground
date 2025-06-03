# アーキテクチャリファクタリング計画

## 🎯 目標
- utilアンチパターンの完全解消
- テストとプロダクションコードの明確分離
- 一貫したファイル命名規則の確立
- ドメイン駆動設計による保守性向上

## ❌ 現在の問題

### 1. utilディレクトリの問題
```
src/utils/
├── simulation.ts          # ❌ コアドメインロジックがutil扱い
├── circuitLayout.ts       # ❌ レイアウト機能がutil扱い
├── truthTableGenerator.ts # ❌ 分析機能がutil扱い
└── validation.ts          # ❌ 共通機能だがutil扱い
```

### 2. テスト混在問題
```
src/utils/
├── simulation.ts          # プロダクション
├── simulation.test.ts     # テスト ←混在で見づらい
├── validation.ts          # プロダクション
└── validation.test.ts     # テスト ←混在で見づらい
```

### 3. 命名規則混在
- React Components: `Canvas.tsx`, `Gate.tsx` (PascalCase)
- Utils: `simulation.ts`, `validation.ts` (camelCase)
- 一貫性がない

## 🏗️ 新アーキテクチャ設計

### ディレクトリ構造
```
src/
├── components/              # React Components (PascalCase)
│   ├── Canvas.tsx
│   ├── Gate.tsx
│   └── Header.tsx
├── domain/                  # ドメインロジック
│   ├── simulation/
│   │   ├── index.ts
│   │   ├── circuitSimulation.ts
│   │   ├── clockSimulation.ts
│   │   └── signalConversion.ts
│   ├── circuit/
│   │   ├── index.ts
│   │   ├── layout.ts
│   │   └── patternRecognizer.ts
│   ├── gates/
│   │   ├── index.ts
│   │   ├── gateFactory.ts
│   │   └── customGateDefinition.ts
│   └── analysis/
│       ├── index.ts
│       ├── truthTableGenerator.ts
│       └── pinPositionCalculator.ts
├── shared/                  # 共通ユーティリティ
│   ├── validation/
│   │   └── index.ts
│   ├── errors/
│   │   └── index.ts
│   ├── id/
│   │   └── index.ts
│   └── coordinates/
│       └── index.ts
├── infrastructure/          # インフラ層
│   ├── storage/
│   │   ├── circuitStorage.ts
│   │   └── customGateStorage.ts
│   └── ui/
│       ├── svgCoordinates.ts
│       └── dialogState.ts
└── features/               # 機能別
    ├── learning-mode/
    ├── gallery/
    └── puzzle-mode/

tests/                      # テスト専用ディレクトリ
├── domain/
│   ├── simulation/
│   │   ├── circuitSimulation.test.ts
│   │   ├── clockSimulation.test.ts
│   │   └── signalConversion.test.ts
│   ├── circuit/
│   │   └── layout.test.ts
│   └── analysis/
│       └── truthTableGenerator.test.ts
├── shared/
│   ├── validation/
│   │   └── validation.test.ts
│   └── errors/
│       └── errorHandling.test.ts
└── components/
    ├── Canvas.test.tsx
    └── Gate.test.tsx
```

## 🔄 ファイル移動マッピング

### Phase 2A: ドメイン分離
```
src/utils/simulation.ts        → src/domain/simulation/circuitSimulation.ts
src/utils/clockSimulation.ts   → src/domain/simulation/clockSimulation.ts
src/utils/signalConversion.ts  → src/domain/simulation/signalConversion.ts
src/utils/circuitLayout.ts     → src/domain/circuit/layout.ts
src/utils/truthTableGenerator.ts → src/domain/analysis/truthTableGenerator.ts
src/utils/pinPositionCalculator.ts → src/domain/analysis/pinPositionCalculator.ts
```

### Phase 2B: 共通機能分離
```
src/utils/validation.ts       → src/shared/validation/index.ts
src/utils/errorHandling.ts    → src/shared/errors/index.ts
src/utils/idGenerator.ts      → src/shared/id/index.ts
src/utils/svgCoordinates.ts   → src/infrastructure/ui/svgCoordinates.ts
```

### Phase 2C: ストレージ層分離
```
src/utils/customGateStorage.ts → src/infrastructure/storage/customGateStorage.ts
src/services/CircuitStorageService.ts → src/infrastructure/storage/circuitStorage.ts
```

### Phase 2D: テスト分離
```
src/utils/*.test.ts → tests/[対応するディレクトリ]/*.test.ts
src/components/*.test.tsx → tests/components/*.test.tsx
```

## 📦 インポートパス改善

### tsconfig.json更新
```json
{
  "paths": {
    "@/*": ["src/*"],
    "@domain/*": ["src/domain/*"],
    "@shared/*": ["src/shared/*"],
    "@infrastructure/*": ["src/infrastructure/*"],
    "@components/*": ["src/components/*"],
    "@features/*": ["src/features/*"],
    "@tests/*": ["tests/*"]
  }
}
```

### 使用例
```typescript
// Before
import { simulation } from '../../../utils/simulation';
import { validation } from '../utils/validation';

// After
import { circuitSimulation } from '@domain/simulation';
import { validation } from '@shared/validation';
```

## 🎯 命名規則統一

### React Components: PascalCase
- `Canvas.tsx`
- `Gate.tsx`
- `TruthTableDisplay.tsx`

### Domain/Shared Modules: camelCase
- `circuitSimulation.ts`
- `validation.ts`
- `errorHandling.ts`

### index.ts Export統一
```typescript
// src/domain/simulation/index.ts
export { circuitSimulation } from './circuitSimulation';
export { clockSimulation } from './clockSimulation';
export { signalConversion } from './signalConversion';
```

## 🔄 実装段階

### Phase 2A: ドメイン構造作成 (優先度: 高)
1. 新ディレクトリ構造作成
2. ドメインファイル移動
3. インポートパス更新

### Phase 2B: 共通機能分離 (優先度: 高)
1. sharedディレクトリ構築
2. 共通ユーティリティ移動
3. 依存関係更新

### Phase 2C: テスト分離 (優先度: 中)
1. testsディレクトリ作成
2. 全テストファイル移動
3. テスト設定更新

### Phase 2D: インフラ層分離 (優先度: 中)
1. infrastructureディレクトリ構築
2. ストレージ層移動
3. UI関連ユーティリティ移動

## ✅ 期待される効果

1. **保守性向上**: 機能別の明確な分離
2. **可読性向上**: テストとプロダクションの分離
3. **一貫性向上**: 統一された命名規則
4. **拡張性向上**: ドメイン駆動設計による柔軟性
5. **アンチパターン解消**: utilディレクトリの完全削除

この設計により、前回のような「意味のないリファクタリング」ではなく、
真に価値のあるアーキテクチャ改善を実現します。
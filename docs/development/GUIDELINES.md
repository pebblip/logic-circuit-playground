# 開発ガイドライン

## 📋 概要
このドキュメントは LogiCirc プロジェクトの技術標準と開発プラクティスを定義します。一貫した品質のコードベース維持を目的としています。

## 🏗️ アーキテクチャ原則

### Hybrid Feature-Domain Architecture
```
src/
├── domain/           # ドメインロジック（ビジネスルール）
│   ├── analysis/     # 真理値表生成・回路分析
│   ├── circuit/      # 回路レイアウト・操作
│   └── simulation/   # シミュレーションエンジン
├── features/         # 機能別実装
│   ├── gallery/      # ギャラリーモード
│   ├── learning-mode/ # 学習モード
│   └── puzzle-mode/  # パズルモード
├── components/       # 再利用可能UIコンポーネント
├── stores/          # 状態管理（Zustand）
├── hooks/           # カスタムReactフック
├── types/           # TypeScript型定義
└── infrastructure/  # 外部システム連携
```

### 設計原則
1. **単一責任原則**: 各モジュールは明確な責任を持つ
2. **依存性逆転**: 具象ではなく抽象に依存
3. **開放閉鎖原則**: 拡張に開いて修正に閉じる
4. **関心の分離**: UIロジックとビジネスロジックの分離

## 📝 コーディング規約

### TypeScript使用規則

#### 型定義 - Type-level Prevention戦略
```typescript
// ✅ 推奨: 明示的で厳密な型定義（Index signature回避）
interface Gate {
  readonly id: string;
  readonly type: GateType;
  position: Position;
  output: boolean;
  inputs: readonly string[];
  // 🚨 [key: string]: unknown は禁止
  // 全プロパティを明示的に定義すること
}

interface DFlipFlopMetadata {
  clockEdge: 'rising' | 'falling';
  previousClockState: boolean;
  qOutput: boolean;
  qBarOutput: boolean;
  isFirstEvaluation?: boolean;
  // ✅ 必要に応じて明示的プロパティを追加
  // ❌ [key: string]: unknown; の使用禁止
}

// ❌ 避ける: 曖昧な型定義
interface LooseGate {
  id: any;                           // any型
  type: string;                      // 制限のない文字列
  data: object;                      // 曖昧なobject型
  [key: string]: unknown;            // Index signature（型安全性を破る）
}
```

#### Type-level Prevention原則
```typescript
// ✅ Compile-time型安全性優先
interface StrictConfig {
  enableFeature: boolean;
  maxRetries: number;
  allowedTypes: ReadonlyArray<'A' | 'B' | 'C'>;
}

// ❌ Runtime validation依存（型レベルで防げるものは防ぐ）
interface LooseConfig {
  [key: string]: unknown;  // Runtimeでのvalidationが必要
}

// ✅ Union型による制限
type GateType = 'AND' | 'OR' | 'NOT' | 'XOR' | 'CLOCK' | 'INPUT' | 'OUTPUT';

// ❌ 文字列での自由記述
type LooseGateType = string;
```

#### 型安全なエラーハンドリング
```typescript
// Result型パターンの使用
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

// 使用例
function validateCircuit(circuit: Circuit): Result<ValidatedCircuit, ValidationError[]> {
  const errors = performValidation(circuit);
  
  if (errors.length > 0) {
    return { success: false, error: errors };
  }
  
  return { success: true, data: circuit as ValidatedCircuit };
}
```

#### 禁止事項と例外
```typescript
// ❌ 使用禁止（ESLintが自動検出）
const data: any = {};                    // any型
const config = circuit as any;           // 不適切なキャスト
eval(userInput);                        // eval関数

// ⚠️ 例外的使用（必要最小限のみ）
delete gate.metadata!.state;            // 型安全な範囲でのdelete（設計上必要な場合）

// ✅ 推奨代替手段
const { state, ...cleanMetadata } = gate.metadata; // Destructuring分離
const newMetadata: Metadata = { /* 明示的構築 */ };  // 型安全な再構築
```

### React開発規約

#### コンポーネント設計
```typescript
// ✅ 推奨: 明確なProps型定義
interface GateComponentProps {
  readonly gate: Gate;
  readonly isHighlighted: boolean;
  readonly onInputClick?: (gateId: string) => void;
}

export const GateComponent: React.FC<GateComponentProps> = React.memo(({
  gate,
  isHighlighted,
  onInputClick
}) => {
  // コンポーネント実装
});

// displayNameを設定（デバッグ用）
GateComponent.displayName = 'GateComponent';
```

#### フックの使用
```typescript
// ✅ カスタムフックによる関心の分離
function useCircuitSimulation(circuit: Circuit) {
  const [result, setResult] = useState<SimulationResult | null>(null);
  
  useEffect(() => {
    const simulator = new CircuitSimulator(circuit);
    setResult(simulator.evaluate());
  }, [circuit]);
  
  return result;
}

// ❌ コンポーネント内での複雑なロジック
function Component({ circuit }: Props) {
  const [result, setResult] = useState(null);
  
  useEffect(() => {
    // 複雑なシミュレーションロジック（分離すべき）
  }, [circuit]);
}
```

### 状態管理規約

#### Zustand使用パターン
```typescript
// ✅ 推奨: 型安全なスライス設計
interface CircuitState {
  gates: Gate[];
  wires: Wire[];
  selectedGates: string[];
}

interface CircuitActions {
  addGate: (gate: Omit<Gate, 'id'>) => void;
  removeGate: (gateId: string) => void;
  updateGate: (gateId: string, updates: Partial<Gate>) => void;
}

type CircuitSlice = CircuitState & CircuitActions;

const createCircuitSlice: StateCreator<CircuitSlice> = (set, get) => ({
  gates: [],
  wires: [],
  selectedGates: [],
  
  addGate: (gate) => set((state) => ({
    gates: [...state.gates, { ...gate, id: generateId() }]
  })),
  // その他のアクション
});
```

#### 不変性の維持
```typescript
// ✅ 推奨: 不変性を保った更新
updateGate: (gateId, updates) => set((state) => ({
  gates: state.gates.map(gate => 
    gate.id === gateId ? { ...gate, ...updates } : gate
  )
}));

// ❌ 避ける: 直接的な変更
updateGate: (gateId, updates) => set((state) => {
  const gate = state.gates.find(g => g.id === gateId);
  if (gate) {
    gate.position = updates.position; // 直接変更
  }
});
```

## 🧪 テスト標準

### テスト構造
```typescript
describe('FeatureName', () => {
  describe('MethodName', () => {
    it('should handle normal case correctly', () => {
      // Arrange
      const input = createTestInput();
      
      // Act
      const result = methodUnderTest(input);
      
      // Assert
      expect(result).toEqual(expectedOutput);
    });
    
    it('should handle error case gracefully', () => {
      // エラーケースのテスト
    });
    
    it('should maintain immutability', () => {
      // 不変性のテスト
    });
  });
});
```

### テストの種類と責任

#### 単体テスト
- **対象**: 純粋関数、ユーティリティ関数
- **責任**: ロジックの正確性
- **カバレッジ**: 80%以上

#### 統合テスト
- **対象**: コンポーネント間の連携
- **責任**: データフローの確認
- **重点**: 実際の使用シナリオ

#### E2Eテスト
- **対象**: ユーザーワークフロー
- **責任**: 全体的な動作確認
- **範囲**: 主要機能のクリティカルパス

### モック戦略
```typescript
// ✅ 推奨: 具体的なモック
const mockCircuitEvaluator = {
  evaluate: vi.fn().mockReturnValue({
    success: true,
    data: { gates: [], wires: [] }
  })
};

// ❌ 避ける: 過度なモック
vi.mock('entire-module'); // モジュール全体のモック
```

## 🔍 品質管理

### 品質徹底主義
このプロジェクトは**妥協なき品質追求**を基本方針とします：

#### 核心原則
- ✅ **場当たり的修正の絶対禁止**: アンダースコア逃避等の回避策は使用しない
- ✅ **警告も含む完全準拠**: ESLintエラー・警告は全て0件を維持
- ✅ **Type-level prevention**: Runtime validationよりcompile-time型安全性を優先
- ✅ **自動品質ゲート**: Pre-commit hooksによる強制チェック

### 静的解析ツール

#### ESLint厳格設定
```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/prefer-readonly": "error",
    "@typescript-eslint/prefer-readonly-parameter-types": "warn",
    "prefer-const": "error",
    "no-var": "error",
    "unused-imports/no-unused-vars": [
      "error",
      {
        // 🚨 アンダースコア逃避を完全禁止
        "argsIgnorePattern": "^",     // 何もマッチしない = 例外なし
        "varsIgnorePattern": "^",     // 何もマッチしない = 例外なし
        "destructuredArrayIgnorePattern": "^" // 何もマッチしない = 例外なし
      }
    ]
  }
}
```

#### 品質コマンド
```bash
# 総合品質確認（必須）
npm run typecheck && npm run test && npm run lint

# 段階別確認
npm run typecheck    # TypeScript型安全性確認
npm run lint         # ESLint完全準拠確認（エラー・警告0件）
npm run test         # テスト完全成功確認
```

### Pre-commit Hooks自動化

#### Husky + lint-staged設定
```json
// .lintstagedrc.json
{
  "*.{ts,tsx}": [
    "prettier --write",
    "eslint --fix --max-warnings 0"  // 警告も含む0件強制
  ],
  "*.{json,md,yml,yaml}": [
    "prettier --write"
  ],
  "*.css": [
    "prettier --write"
  ]
}
```

```bash
# .husky/pre-commit
npx lint-staged
```

#### 設定手順
```bash
# 初回設定
npm install --save-dev husky lint-staged
npm run prepare

# 既存プロジェクトでは設定済み
```

#### TypeScript厳格設定
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### パフォーマンス指針

#### React最適化
```typescript
// ✅ 推奨: 適切なメモ化
const ExpensiveComponent = React.memo(({ data }: Props) => {
  const processedData = useMemo(() => 
    expensiveProcessing(data), [data]
  );
  
  const handleClick = useCallback((id: string) => {
    // ハンドラー処理
  }, []);
  
  return <div>{/* レンダリング */}</div>;
});

// ✅ 条件付きレンダリング
const ConditionalComponent: React.FC<Props> = ({ shouldShow, children }) => {
  if (!shouldShow) return null;
  
  return <div>{children}</div>;
};
```

#### バンドルサイズ最適化
```typescript
// ✅ Tree shaking対応のインポート
import { debounce } from 'lodash-es';

// ❌ 避ける: 全体インポート
import _ from 'lodash';
```

## 🔒 セキュリティ考慮事項

### 入力検証
```typescript
// ユーザー入力の検証
function validateGateInput(input: unknown): Gate | null {
  if (!isObject(input)) return null;
  
  const { id, type, position } = input;
  
  if (typeof id !== 'string' || !isValidGateType(type)) {
    return null;
  }
  
  return sanitizeGateData({ id, type, position });
}
```

### XSS防止
```typescript
// ✅ 安全なHTML生成
const safeContent = DOMPurify.sanitize(userContent);

// ❌ 危険: 直接的なHTML挿入
element.innerHTML = userContent;
```

## 📊 コード品質メトリクス

### 測定指標
| メトリクス | 目標値 | 現在値 | ステータス | ツール |
|-----------|--------|--------|-----------|--------|
| TypeScript厳格度 | 100% | **100%** | ✅ 達成 | tsc --strict |
| ESLintエラー | 0 | **0** | ✅ 達成 | eslint |
| ESLint警告 | 0 | **0** | ✅ 達成 | eslint --max-warnings 0 |
| Pre-commit自動化 | 有効 | **有効** | ✅ 達成 | husky + lint-staged |
| Type-level Prevention | 有効 | **有効** | ✅ 達成 | 明示的型定義 |
| テストカバレッジ | 80%+ | 確認中 | 🔄 測定要 | vitest --coverage |
| 循環的複雑度 | <10 | 確認中 | 🔄 測定要 | 静的解析 |
| バンドルサイズ | <1MB | 確認中 | 🔄 測定要 | bundleanalyzer |

### 継続的改善・品質維持

#### 日次品質確認（必須）
```bash
# 総合品質ゲート通過確認
npm run typecheck && npm run lint && npm run test

# 段階別詳細確認
npm run typecheck     # TypeScript型安全性（エラー0件）
npm run lint         # ESLint完全準拠（エラー・警告0件）
npm run test         # テスト完全成功
npm run build        # ビルド確認
```

#### Pre-commit品質自動化
```bash
# 自動実行（git commit時）
npx lint-staged      # Prettier + ESLint --max-warnings 0

# 手動確認
git add . && git commit -m "test"  # フックテスト
```

#### 週次実行推奨
```bash
npm run test:coverage # カバレッジ確認（80%+目標）
npm run analyze      # バンドル分析
npm audit            # セキュリティ確認
npm outdated         # 依存関係更新確認
```

#### 品質劣化防止チェック
```bash
# エラー・警告チェック
npm run lint -- --format=compact | wc -l  # 0行である事を確認

# 型エラーチェック  
npm run typecheck 2>&1 | grep "error TS" | wc -l  # 0行である事を確認

# テスト失敗チェック
npm run test 2>&1 | grep -E "(FAIL|FAILED)" | wc -l  # 0行である事を確認
```

## 📝 ドキュメント標準

### コードコメント
```typescript
/**
 * 回路の真理値表を生成します
 * 
 * @param circuit - 対象となる回路データ
 * @param maxInputCombinations - 生成する入力組み合わせの最大数（デフォルト: 256）
 * @returns 真理値表の生成結果またはエラー
 * 
 * @example
 * ```typescript
 * const result = generateTruthTable(circuit, 16);
 * if (result.success) {
 *   console.log(result.data.table);
 * }
 * ```
 */
function generateTruthTable(
  circuit: Circuit, 
  maxInputCombinations = 256
): Result<TruthTable, ValidationError[]> {
  // 実装
}
```

### README更新規則
- 機能追加時は必ずREADME更新
- インストール手順の動作確認
- スクリーンショットの更新
- API変更時の破壊的変更の記載

## 🚀 デプロイメント

### ビルドプロセス
```bash
# 本番ビルド手順
npm run typecheck    # 型チェック
npm run lint        # 静的解析
npm run test        # テスト実行
npm run build       # 本番ビルド
```

### 環境別設定
```typescript
// 環境変数による設定
const config = {
  isDevelopment: import.meta.env.DEV,
  enableDebugMode: import.meta.env.VITE_DEBUG === 'true',
  apiEndpoint: import.meta.env.VITE_API_ENDPOINT || '/api'
};
```

## 🔄 依存関係管理

### パッケージ選定基準
1. **メンテナンス状況**: 活発な開発
2. **セキュリティ**: 既知の脆弱性なし
3. **サイズ**: バンドルサイズへの影響
4. **型安全性**: TypeScript対応

### 更新戦略
```bash
# 定期更新（月次）
npm audit           # セキュリティ監査
npm outdated        # 更新可能パッケージ確認
npm update          # パッチ・マイナー更新

# メジャー更新時
npm run test        # 更新前テスト
npm install package@latest
npm run test        # 更新後テスト
```

---

*このガイドラインは開発経験と標準的なプラクティスに基づいて定期的に更新されます。*
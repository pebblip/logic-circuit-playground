# Logic Circuit Playground - アーキテクチャ設計書

## 🎯 設計理念
**「最高のサービスを最高の品質で、かつ最速・保守性の高い形で」**

## 🏗️ アーキテクチャ概要

### コア原則
1. **変更容易性** - デザインもロジックも簡単に変更可能
2. **テスタビリティ** - 全てがテスト可能な設計
3. **パフォーマンス** - 大規模回路でもサクサク動作
4. **保守性** - 1年後の自分でも理解できるコード
5. **レスポンシブ** - どのデバイスでも最適な体験

## 📐 システムアーキテクチャ

### レイヤード・アーキテクチャ
```
┌─────────────────────────────────────┐
│          Presentation Layer         │ ← React Components + CSS
├─────────────────────────────────────┤
│          ViewModel Layer            │ ← 状態管理・UI Logic
├─────────────────────────────────────┤
│          Domain Layer               │ ← ビジネスロジック（Gates, Circuit）
├─────────────────────────────────────┤
│          Infrastructure Layer       │ ← Storage, API, External Services
└─────────────────────────────────────┘
```

### 依存関係の方向
- Presentation → ViewModel → Domain ← Infrastructure
- Domain層は他の層に依存しない（Clean Architecture）

## 🎨 デザインシステム

### 1. Design Tokens
```typescript
// src/design-system/tokens.ts
export const tokens = {
  colors: {
    primary: { 
      50: 'var(--color-primary-50)',
      // ... テーマ切り替え可能
    },
    semantic: {
      success: 'var(--color-success)',
      error: 'var(--color-error)',
      // ... 意味的な色定義
    }
  },
  spacing: {
    xs: '0.25rem',  // 4px
    sm: '0.5rem',   // 8px
    md: '1rem',     // 16px
    // ... 8の倍数ベース
  },
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1440px'
  }
};
```

### 2. コンポーネント設計
```typescript
// Atomic Design + Compound Components パターン
interface GateProps {
  variant?: 'default' | 'highlighted' | 'error';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

// 使用例
<Gate variant="highlighted" size="md">
  <Gate.Symbol>AND</Gate.Symbol>
  <Gate.Inputs count={2} />
  <Gate.Output />
</Gate>
```

### 3. CSS戦略
```typescript
// CSS Modules + CSS-in-TS
// src/components/Gate/Gate.module.css
.gate {
  /* ローカルスコープ */
  container-type: inline-size;
}

// レスポンシブ（Container Queries）
@container (min-width: 320px) {
  .gate { /* モバイル最適化 */ }
}
```

### 4. テーマシステム
```typescript
interface Theme {
  name: string;
  colors: ColorPalette;
  typography: Typography;
  animations: AnimationConfig;
}

// Context経由で全体に適用
const ThemeProvider: React.FC = ({ children, theme }) => {
  // CSS変数を動的に更新
  useEffect(() => {
    Object.entries(theme.colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value);
    });
  }, [theme]);
};
```

## 🧩 状態管理アーキテクチャ

### 1. ViewModel パターン（MVVM）
```typescript
// ViewModelが状態とロジックを管理
class CircuitViewModel {
  private circuit: Circuit;
  private eventBus: EventEmitter;
  
  // 状態
  @observable gates: GateViewModel[] = [];
  @observable connections: ConnectionViewModel[] = [];
  @observable selectedItem: SelectableItem | null = null;
  
  // コマンド（UIからの操作）
  addGate(type: GateType, position: Point): void {
    const gate = this.circuit.addGate(type, position);
    this.gates.push(new GateViewModel(gate));
    this.eventBus.emit('gateAdded', gate);
  }
  
  // 自動保存
  @debounce(1000)
  private autoSave(): void {
    this.saveToStorage();
  }
}
```

### 2. イベント駆動アーキテクチャ
```typescript
// Domain EventsでViewModelと疎結合に
interface DomainEvent {
  type: string;
  timestamp: number;
  payload: any;
}

class EventBus {
  private handlers = new Map<string, Set<Handler>>();
  
  on(event: string, handler: Handler): Unsubscribe {
    // ... イベント登録
  }
  
  emit(event: string, payload: any): void {
    // ... イベント発火
  }
}
```

### 3. Command パターン
```typescript
// Undo/Redoを簡単に実装
interface Command {
  execute(): void;
  undo(): void;
  redo(): void;
}

class AddGateCommand implements Command {
  constructor(
    private circuit: Circuit,
    private gate: Gate
  ) {}
  
  execute(): void {
    this.circuit.addGate(this.gate);
  }
  
  undo(): void {
    this.circuit.removeGate(this.gate.id);
  }
}
```

## 🧪 テスト戦略

### 1. テストピラミッド
```
         /\
        /E2E\      ← 10% (主要ユーザーフロー)
       /------\
      /  統合  \    ← 30% (ViewModel + Domain)
     /----------\
    /   単体     \  ← 60% (ビジネスロジック)
   /--------------\
```

### 2. テスト設計パターン
```typescript
// 1. Arrange-Act-Assert パターン
describe('GateViewModel', () => {
  it('should toggle input value when clicked', () => {
    // Arrange
    const gate = new InputGate();
    const viewModel = new GateViewModel(gate);
    
    // Act
    viewModel.toggleInput();
    
    // Assert
    expect(viewModel.outputValue).toBe(true);
  });
});

// 2. テストビルダーパターン
class CircuitBuilder {
  private gates: Gate[] = [];
  
  withAndGate(): this {
    this.gates.push(new ANDGate());
    return this;
  }
  
  build(): Circuit {
    return new Circuit(this.gates);
  }
}

// 使用例
const circuit = new CircuitBuilder()
  .withAndGate()
  .withInputGates(2)
  .connected()
  .build();
```

### 3. Visual Regression Testing
```typescript
// Storybook + Chromatic
export default {
  title: 'Components/Gate',
  component: Gate,
};

export const Default = {
  args: { type: 'AND' },
  play: async ({ canvasElement }) => {
    // インタラクションテスト
    const gate = within(canvasElement).getByRole('gate');
    await userEvent.click(gate);
    expect(gate).toHaveClass('selected');
  },
};
```

## 🚀 パフォーマンス最適化

### 1. レンダリング最適化
```typescript
// React.memo + useMemo
const Gate = React.memo(({ gate, isSelected }: GateProps) => {
  const style = useMemo(() => 
    calculateGateStyle(gate, isSelected), 
    [gate.id, gate.position, isSelected]
  );
  
  return <div style={style}>...</div>;
});

// 仮想化（大規模回路対応）
<VirtualCanvas
  items={gates}
  renderItem={(gate) => <Gate key={gate.id} gate={gate} />}
  viewportSize={viewportSize}
/>
```

### 2. Web Worker活用
```typescript
// シミュレーションを別スレッドで
class SimulationWorker {
  private worker = new Worker('simulation.worker.ts');
  
  async simulate(circuit: SerializedCircuit): Promise<SimulationResult> {
    return new Promise((resolve) => {
      this.worker.postMessage({ type: 'SIMULATE', circuit });
      this.worker.onmessage = (e) => {
        if (e.data.type === 'RESULT') {
          resolve(e.data.result);
        }
      };
    });
  }
}
```

### 3. 最適化されたデータ構造
```typescript
// 接続の高速検索
class ConnectionIndex {
  private bySource = new Map<string, Set<Connection>>();
  private byTarget = new Map<string, Set<Connection>>();
  
  addConnection(connection: Connection): void {
    // O(1)でインデックス更新
  }
  
  getConnectionsFrom(gateId: string): Connection[] {
    return Array.from(this.bySource.get(gateId) || []);
  }
}
```

## 📱 レスポンシブ設計

### 1. Responsive First
```typescript
// コンポーネントレベルでレスポンシブ
const useResponsive = () => {
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>();
  
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    // ... レスポンシブロジック
  }, []);
  
  return { device, isMobile: device === 'mobile' };
};
```

### 2. タッチ対応
```typescript
// PointerEvents API使用
const usePointerGestures = () => {
  const handlePointerDown = (e: PointerEvent) => {
    if (e.pointerType === 'touch') {
      // タッチ用の処理
    }
  };
  
  return { onPointerDown: handlePointerDown };
};
```

## 🔐 セキュリティ・品質保証

### 1. 型安全性
```typescript
// Branded Types
type GateId = string & { __brand: 'GateId' };
type ConnectionId = string & { __brand: 'ConnectionId' };

// 実行時検証
const GateIdSchema = z.string().brand('GateId');
```

### 2. エラーハンドリング
```typescript
// Result型パターン
type Result<T, E = Error> = 
  | { ok: true; value: T }
  | { ok: false; error: E };

function connectGates(
  source: Gate, 
  target: Gate
): Result<Connection, ConnectionError> {
  if (!canConnect(source, target)) {
    return { ok: false, error: new ConnectionError('Invalid connection') };
  }
  // ...
}
```

## 🛠️ 開発環境・CI/CD

### 1. 開発ワークフロー
```yaml
# .github/workflows/ci.yml
on: [push, pull_request]
jobs:
  quality:
    steps:
      - name: Type Check
        run: pnpm type-check
      - name: Lint
        run: pnpm lint
      - name: Test
        run: pnpm test:unit
      - name: E2E Test
        run: pnpm test:e2e
      - name: Visual Test
        run: pnpm chromatic
```

### 2. Feature Flags
```typescript
// 段階的リリース
const features = {
  customGates: useFeatureFlag('custom-gates'),
  collaboration: useFeatureFlag('collaboration'),
};

if (features.customGates) {
  // 新機能を条件付きで有効化
}
```

## 📊 モニタリング・分析

### 1. パフォーマンスモニタリング
```typescript
// Web Vitals + カスタムメトリクス
import { getCLS, getFID, getLCP } from 'web-vitals';

// カスタムメトリクス
performance.mark('circuit-load-start');
// ... 読み込み処理
performance.mark('circuit-load-end');
performance.measure('circuit-load', 'circuit-load-start', 'circuit-load-end');
```

### 2. エラートラッキング
```typescript
// Sentryインテグレーション
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    new BrowserTracing(),
    new Replay(),
  ],
});
```

## 🎯 まとめ

この設計により実現できること：
1. **変更容易性**: デザイントークン・ViewModelパターンで実現
2. **高品質**: 包括的なテスト戦略で保証
3. **高速開発**: 再利用可能なコンポーネント・自動化
4. **保守性**: Clean Architecture・明確な責任分離
5. **パフォーマンス**: 最適化されたレンダリング・Web Worker

**これが私の考える「最高のサービスを最高の品質で」実現するアーキテクチャです！**
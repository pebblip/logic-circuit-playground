# 🏗️ 論理回路プレイグラウンド - Hybrid Feature-Domain Architecture

## 🎯 アーキテクチャ選定理由

### なぜHybrid Feature-Domain Architectureか？

このプロジェクトの特性を考慮した結果、Pure Feature-Sliced DesignでもシンプルなMVCでもない、**ハイブリッドアーキテクチャ**を採用します。

#### プロジェクトの特性
- **規模**: 中規模（大規模アーキテクチャは過剰）
- **ドメイン**: 明確（回路シミュレーション）
- **UI複雑度**: 高い（インタラクティブなキャンバス操作）
- **拡張性**: 必要（学習モード、パズルモード、カスタムゲート）

#### このアーキテクチャの特徴
1. **Feature層**: UIとその直接的なロジックを機能単位で管理
2. **Domain層**: UIに依存しないビジネスロジックを集約
3. **適切な粒度**: 機能の複雑さに応じて柔軟に構造化

## 📁 ディレクトリ構造

```
src/
├── 🎨 features/                 # 機能単位のUI層
│   ├── circuit-editor/          # 回路エディタ機能
│   │   ├── CircuitCanvas.tsx    # メインキャンバス
│   │   ├── components/          # この機能専用のコンポーネント
│   │   │   ├── Gate.tsx         # ゲート表示
│   │   │   ├── Wire.tsx         # ワイヤー表示
│   │   │   └── Pin.tsx          # ピン表示
│   │   └── hooks/               # この機能専用のフック
│   │       ├── useCircuitEditor.ts
│   │       └── useWireDrawing.ts
│   │
│   ├── learning-mode/           # 学習モード
│   │   ├── LearningPanel.tsx
│   │   ├── TutorialOverlay.tsx
│   │   └── useLearningProgress.ts
│   │
│   ├── tool-palette/            # ツールパレット
│   │   ├── ToolPalette.tsx
│   │   └── useToolSelection.ts
│   │
│   └── property-panel/          # プロパティパネル
│       ├── PropertyPanel.tsx    # ゲート情報表示（構造化説明対応）
│       ├── TruthTableDisplay.tsx # 真理値表モーダル表示
│       └── TruthTable.tsx
│
├── 🔧 domain/                   # ビジネスロジック層
│   ├── entities/                # 【既存を活用】ドメインモデル
│   │   ├── gates/               # ゲートクラス群
│   │   │   ├── BaseGate.ts     # 抽象基底クラス
│   │   │   ├── ANDGate.ts
│   │   │   ├── ORGate.ts
│   │   │   ├── GateFactory.ts
│   │   │   └── index.ts
│   │   ├── circuit/             # 回路関連
│   │   │   ├── Circuit.ts
│   │   │   ├── Connection.ts
│   │   │   └── Pin.ts
│   │   └── types/               # ドメイン型定義
│   │
│   ├── services/                # ビジネスロジックサービス
│   │   ├── CircuitSimulator.ts # シミュレーションエンジン
│   │   ├── GatePlacement.ts    # ゲート配置ロジック
│   │   ├── CollisionDetector.ts # 当たり判定
│   │   └── CircuitSerializer.ts # 保存/読み込み
│   │
│   └── stores/                  # グローバル状態管理
│       └── circuitStore.ts      # Zustand store
│
├── 🎯 shared/                   # 共有リソース
│   ├── components/              # 汎用UIコンポーネント
│   │   ├── Button/
│   │   ├── Modal/
│   │   └── Icons/
│   ├── hooks/                   # 汎用カスタムフック
│   │   ├── useResponsive.ts
│   │   └── useKeyboardShortcuts.ts
│   └── utils/                   # ユーティリティ
│       ├── geometry.ts          # 幾何計算
│       ├── constants.ts         # 定数定義
│       └── truthTableGenerator.ts # 真理値表自動生成
│
└── 📱 app/                      # アプリケーション設定
    ├── App.tsx                  # ルートコンポーネント
    ├── providers/               # プロバイダー
    │   └── StoreProvider.tsx
    └── layouts/                 # レイアウト
        ├── DesktopLayout.tsx
        ├── MobileLayout.tsx
        └── components/          # レイアウト用コンポーネント
```

## 🎮 状態管理戦略

### グローバル状態: Zustand（シンプルに）

```typescript
// domain/stores/circuitStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { BaseGate } from '../entities/gates/BaseGate';
import { Connection } from '../entities/circuit/Connection';

interface CircuitState {
  // 状態
  gates: BaseGate[];
  connections: Connection[];
  selectedGateId: string | null;
  
  // アクション
  addGate: (gate: BaseGate) => void;
  moveGate: (gateId: string, position: Position) => void;
  deleteGate: (gateId: string) => void;
  connectPins: (fromPinId: string, toPinId: string) => void;
  setSelectedGate: (gateId: string | null) => void;
  
  // 派生状態
  getSelectedGate: () => BaseGate | null;
}

export const useCircuitStore = create<CircuitState>()(
  immer((set, get) => ({
    gates: [],
    connections: [],
    selectedGateId: null,
    
    addGate: (gate) => set((state) => {
      state.gates.push(gate);
    }),
    
    moveGate: (gateId, position) => set((state) => {
      const gate = state.gates.find(g => g.id === gateId);
      if (gate) {
        gate.position = position;
      }
    }),
    
    deleteGate: (gateId) => set((state) => {
      state.gates = state.gates.filter(g => g.id !== gateId);
      state.connections = state.connections.filter(
        c => c.from.gateId !== gateId && c.to.gateId !== gateId
      );
    }),
    
    connectPins: (fromPinId, toPinId) => set((state) => {
      const connection = new Connection(fromPinId, toPinId);
      state.connections.push(connection);
    }),
    
    setSelectedGate: (gateId) => set((state) => {
      state.selectedGateId = gateId;
    }),
    
    getSelectedGate: () => {
      const state = get();
      return state.gates.find(g => g.id === state.selectedGateId) || null;
    }
  }))
);
```

### ローカル状態: useState + カスタムフック

```typescript
// features/circuit-editor/hooks/useCircuitEditor.ts
export const useCircuitEditor = () => {
  // UI状態はローカルで管理
  const [isDragging, setIsDragging] = useState(false);
  const [drawingWire, setDrawingWire] = useState<DrawingWire | null>(null);
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null);
  
  // ドメインロジックはservicesから
  const placement = useMemo(() => new GatePlacement(), []);
  const collision = useMemo(() => CollisionDetector.getInstance(), []);
  
  // グローバル状態はstoreから
  const { gates, addGate, selectedGateId } = useCircuitStore();
  
  const handleGatePlace = useCallback((type: GateType) => {
    const position = placement.calculateOptimalPosition(gates);
    const gate = GateFactory.create(type, position);
    addGate(gate);
  }, [gates, addGate, placement]);
  
  return {
    // 状態
    isDragging,
    drawingWire,
    hoveredPinId,
    
    // アクション
    handleGatePlace,
    setDrawingWire,
    setHoveredPinId
  };
};
```

## 🏛️ アーキテクチャの原則

### 1. 依存関係の方向

```
features → domain → shared
    ↓        ↓        ↓
   UI層   ビジネス層  共通層
```

- features層はdomain層に依存OK
- domain層はfeatures層に依存NG
- shared層はどこからでも利用可能

### 2. 責任の分離

#### Features層の責任
- UIの表示とインタラクション
- ユーザー操作の処理
- ローカルなUI状態の管理

#### Domain層の責任
- ビジネスロジックの実装
- データモデルの定義
- グローバル状態の管理

#### Shared層の責任
- 汎用的な機能の提供
- 複数の機能で使われるコンポーネント
- アプリ全体の設定や定数

### 3. コードの配置基準

```typescript
// 🤔 このコードはどこに置く？

// 1. 特定の機能でのみ使う → features/
features/circuit-editor/components/GateContextMenu.tsx

// 2. UIに依存しないロジック → domain/services/
domain/services/CircuitValidator.ts

// 3. 複数の機能で使う → shared/
shared/components/Tooltip.tsx
shared/hooks/useDebounce.ts
```

## 🚀 実装例

### ワンクリックゲート配置の実装

```typescript
// features/tool-palette/ToolPalette.tsx
import { useCircuitEditor } from '../circuit-editor/hooks/useCircuitEditor';

export const ToolPalette: React.FC = () => {
  const { handleGatePlace } = useCircuitEditor();
  
  return (
    <div className="tool-palette">
      {GATE_TYPES.map(type => (
        <button
          key={type}
          onClick={() => handleGatePlace(type)}
          className="tool-button"
        >
          <GateIcon type={type} />
          <span>{type}</span>
        </button>
      ))}
    </div>
  );
};

// domain/services/GatePlacement.ts
export class GatePlacement {
  private static readonly GRID_SIZE = 20;
  private static readonly INITIAL_OFFSET = { x: 100, y: 100 };
  private static readonly SPACING = 120;
  
  calculateOptimalPosition(existingGates: BaseGate[]): Position {
    if (existingGates.length === 0) {
      return this.snapToGrid(this.INITIAL_OFFSET);
    }
    
    // 既存ゲートの右側に配置
    const rightmostGate = this.findRightmostGate(existingGates);
    const newPosition = {
      x: rightmostGate.position.x + this.SPACING,
      y: rightmostGate.position.y
    };
    
    // 衝突チェックして調整
    return this.avoidCollision(newPosition, existingGates);
  }
  
  private snapToGrid(position: Position): Position {
    return {
      x: Math.round(position.x / this.GRID_SIZE) * this.GRID_SIZE,
      y: Math.round(position.y / this.GRID_SIZE) * this.GRID_SIZE
    };
  }
}
```


## 📊 この設計の利点

### 1. 段階的な複雑性
- シンプルな機能 = シンプルな実装
- 複雑な機能 = 適切に構造化

### 2. 保守性
- ロジックの重複なし
- 責任の所在が明確
- テストが書きやすい

### 3. 拡張性
- 新機能の追加が容易
- 既存機能への影響を最小化
- チーム開発にも対応

### 4. 実装の容易さ
- 既存コードを活かせる
- 学習コストが低い
- すぐに開発を開始できる

## 🎯 まとめ

このHybrid Feature-Domain Architectureは：

1. **適切な複雑さ** - 過不足のない構造
2. **実践的** - 理論よりも実装のしやすさを重視
3. **柔軟** - プロジェクトの成長に合わせて進化可能
4. **明確** - どこに何を書くべきかが明確

Pure Feature-Sliced Designの厳格さより、**このプロジェクトに最適化された実用的な設計**を選択しました。


# 🚀 論理回路プレイグラウンド - React最適化アーキテクチャ

## 🎯 アーキテクチャ選定理由

### なぜクリーンアーキテクチャではないのか？
1. **オーバーエンジニアリング**: Reactアプリには過度に複雑
2. **Reactのパラダイムと不一致**: カスタムフックとの相性が悪い
3. **開発速度の低下**: 抽象化レイヤーが多すぎる
4. **実際の採用例が少ない**: React界隈では主流ではない

### 推奨アーキテクチャの特徴
- **Feature-Sliced Design**: 機能単位で整理（ロシア発の実践的手法）
- **カスタムフック中心**: Reactの強みを最大活用
- **既存ViewModelパターンの活用**: 現在の良い設計を継承
- **段階的移行可能**: 動作するコードを壊さない

## 📁 推奨ディレクトリ構造

```
src/
├── 🎯 features/                 # 機能単位で整理
│   ├── circuit-editor/          # 回路エディタ機能
│   │   ├── ui/                 # UIコンポーネント
│   │   │   ├── Canvas/         # キャンバス関連
│   │   │   ├── Gates/          # ゲートコンポーネント
│   │   │   └── Toolbar/        # ツールバー
│   │   ├── model/              # ビジネスロジック・状態
│   │   │   ├── stores/         # Zustand stores
│   │   │   ├── hooks/          # カスタムフック
│   │   │   └── services/       # ビジネスロジック
│   │   └── lib/                # ユーティリティ
│   │       ├── collision.ts    # 当たり判定（一元化）
│   │       └── geometry.ts     # 幾何計算
│   │
│   ├── learning-mode/           # 学習モード
│   │   ├── ui/
│   │   │   ├── TutorialOverlay/
│   │   │   └── ProgressBar/
│   │   ├── model/
│   │   │   └── useLearningProgress.ts
│   │   └── data/
│   │       └── tutorials.ts
│   │
│   ├── puzzle-mode/             # パズルモード
│   │   ├── ui/
│   │   ├── model/
│   │   └── data/
│   │
│   └── simulation/              # シミュレーション機能
│       ├── model/
│       │   └── simulation.worker.ts
│       └── lib/
│           └── signalPropagation.ts
│
├── 🔧 entities/                 # ドメインモデル（既存を活用）
│   ├── gates/                   # 既存のmodels/gates
│   ├── circuit/                 # Circuit, Connection, Pin
│   └── types/                   # 型定義
│
├── 🎨 shared/                   # 共有リソース
│   ├── ui/                      # 共通コンポーネント
│   │   ├── Button/
│   │   ├── Modal/
│   │   └── Icons/
│   ├── lib/                     # 共通ユーティリティ
│   │   ├── hooks/               # 汎用カスタムフック
│   │   └── utils/               # ユーティリティ関数
│   └── config/                  # 設定・定数
│       ├── theme.ts             # テーマ設定
│       └── constants.ts         # 定数
│
├── 📱 app/                      # アプリケーションシェル
│   ├── providers/               # プロバイダー
│   │   ├── ThemeProvider.tsx
│   │   └── StoreProvider.tsx
│   ├── layouts/                 # レイアウト
│   │   ├── MobileLayout.tsx
│   │   └── DesktopLayout.tsx
│   └── App.tsx                  # ルートコンポーネント
│
└── 🧪 __tests__/               # テスト（機能と並列）
```

## 🎮 状態管理戦略

### 1. グローバル状態: Zustand
```typescript
// features/circuit-editor/model/stores/circuitStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface CircuitState {
  // 状態
  gates: Gate[];
  connections: Connection[];
  selectedGateId: string | null;
  
  // ViewModelインスタンス（既存を活用）
  viewModel: UltraModernCircuitViewModel;
  
  // アクション
  addGate: (gate: Gate) => void;
  connectPins: (sourcePin: string, targetPin: string) => void;
  deleteSelection: () => void;
}

export const useCircuitStore = create<CircuitState>()(
  immer((set, get) => ({
    gates: [],
    connections: [],
    selectedGateId: null,
    viewModel: new UltraModernCircuitViewModel(),
    
    addGate: (gate) => set(state => {
      state.viewModel.addGate(gate);
      state.gates = state.viewModel.getAllGates();
    }),
    
    connectPins: (sourcePin, targetPin) => set(state => {
      const success = state.viewModel.connectPins(sourcePin, targetPin);
      if (success) {
        state.connections = state.viewModel.getAllConnections();
      }
    }),
    
    deleteSelection: () => set(state => {
      if (state.selectedGateId) {
        state.viewModel.removeGate(state.selectedGateId);
        state.gates = state.viewModel.getAllGates();
        state.selectedGateId = null;
      }
    })
  }))
);
```

### 2. UI状態: Jotai（原子的状態管理）
```typescript
// features/circuit-editor/model/atoms.ts
import { atom } from 'jotai';

// UI専用の状態
export const hoveredPinAtom = atom<string | null>(null);
export const isDraggingAtom = atom(false);
export const drawingWireAtom = atom<{
  from: Position;
  to: Position;
} | null>(null);
export const zoomLevelAtom = atom(1.0);
export const panOffsetAtom = atom({ x: 0, y: 0 });

// デバイス対応
export const isMobileAtom = atom(false);
export const touchModeAtom = atom<'select' | 'pan' | 'connect'>('select');
```

## 🎨 コンポーネント設計

### 1. ゲート描画の統一（○─ピン形式）
```typescript
// features/circuit-editor/ui/Gates/GateRenderer.tsx
interface GateRendererProps {
  gate: Gate;
  isSelected: boolean;
  isHovered: boolean;
}

export const GateRenderer: React.FC<GateRendererProps> = React.memo(({ 
  gate, 
  isSelected, 
  isHovered 
}) => {
  // ピン位置の計算をメモ化
  const pins = useMemo(() => 
    calculatePinPositions(gate), 
    [gate.type, gate.position]
  );
  
  return (
    <g transform={`translate(${gate.x}, ${gate.y})`}>
      {/* ゲート本体 */}
      <GateShape type={gate.type} isActive={gate.isActive} />
      
      {/* ピン（○─形式） */}
      {pins.map(pin => (
        <PinRenderer key={pin.id} pin={pin} />
      ))}
      
      {/* 選択枠 */}
      {isSelected && <SelectionFrame />}
    </g>
  );
}, arePropsEqual);

// ピン描画コンポーネント（再利用可能）
export const PinRenderer: React.FC<{ pin: Pin }> = ({ pin }) => {
  const [isHovered] = useAtom(hoveredPinAtom);
  
  return (
    <g transform={`translate(${pin.x}, ${pin.y})`}>
      <circle r={6} className={`pin ${pin.isActive ? 'active' : ''}`} />
      <line x1={-10} y1={0} x2={0} y2={0} className="pin-line" />
      {/* タッチ用の大きなヒットエリア */}
      <circle r={20} className="pin-hit-area" />
    </g>
  );
};
```

### 2. 当たり判定の一元化
```typescript
// features/circuit-editor/lib/collision.ts
export class CollisionDetector {
  private static instance: CollisionDetector;
  
  static getInstance() {
    if (!this.instance) {
      this.instance = new CollisionDetector();
    }
    return this.instance;
  }
  
  // ピンのヒット判定（モバイル対応）
  detectPinHit(point: Position, pins: Pin[], isMobile: boolean): Pin | null {
    const hitRadius = isMobile ? 30 : 20;
    
    for (const pin of pins) {
      const distance = Math.hypot(
        point.x - pin.worldX, 
        point.y - pin.worldY
      );
      if (distance <= hitRadius) {
        return pin;
      }
    }
    return null;
  }
  
  // ゲートのヒット判定
  detectGateHit(point: Position, gates: Gate[]): Gate | null {
    // 効率的な空間インデックスを使用
    return this.spatialIndex.query(point);
  }
}
```

### 3. カスタムフックによるロジック分離
```typescript
// features/circuit-editor/model/hooks/useCanvasInteraction.ts
export const useCanvasInteraction = () => {
  const { viewModel, selectedGateId } = useCircuitStore();
  const [hoveredPin, setHoveredPin] = useAtom(hoveredPinAtom);
  const [drawingWire, setDrawingWire] = useAtom(drawingWireAtom);
  const { isMobile } = useResponsive();
  
  const collision = useMemo(() => CollisionDetector.getInstance(), []);
  
  const handlePointerDown = useCallback((e: PointerEvent) => {
    const point = getCanvasPoint(e);
    
    // ピンのヒット判定
    const pin = collision.detectPinHit(
      point, 
      viewModel.getAllPins(), 
      isMobile
    );
    
    if (pin) {
      setDrawingWire({ from: pin.position, to: point });
      return;
    }
    
    // ゲートのヒット判定
    const gate = collision.detectGateHit(point, viewModel.getAllGates());
    if (gate) {
      viewModel.selectGate(gate.id);
    }
  }, [viewModel, collision, isMobile]);
  
  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    hoveredPin,
    drawingWire
  };
};
```

## 🚀 移行計画

### Phase 1: 基盤整備（1週間）
1. **ディレクトリ構造の段階的移行**
   ```bash
   # 既存ファイルを新構造に移動
   mv src/components/Circuit/* src/features/circuit-editor/ui/
   mv src/models/* src/entities/
   mv src/hooks/* src/shared/lib/hooks/
   ```

2. **Zustand導入**
   - ViewModelをZustandでラップ
   - 既存の動作を維持

3. **当たり判定の統一**
   - CollisionDetectorクラス作成
   - 既存のバラバラな判定ロジックを統合

### Phase 2: UI最適化（1週間）
1. **ゲート描画の統一**
   - GateRenderer作成
   - ○─ピン形式への移行

2. **メモ化とパフォーマンス**
   - React.memoの適用
   - useMemoによる計算最適化

3. **レスポンシブ対応**
   - useResponsiveフック
   - モバイル/デスクトップレイアウト

### Phase 3: 機能実装（2週間）
1. **3モードシステム**
   - 各モードをfeatureとして実装
   - 既存UIの再利用

2. **シミュレーション最適化**
   - Web Worker導入
   - 非同期実行

### Phase 4: テストとリファクタリング（継続的）
1. **テスト追加**
   - 各featureごとのテスト
   - 統合テスト

2. **継続的改善**
   - パフォーマンス計測
   - UX改善

## 📊 メリット

### 開発効率
- **既存コードの活用**: ViewModelパターンをそのまま使える
- **段階的移行**: 動作を維持しながら改善
- **Reactらしい設計**: カスタムフックでロジック分離

### パフォーマンス
- **最適化しやすい**: React.memo、useMemoが自然に使える
- **Web Worker対応**: 重い計算を別スレッドで
- **効率的な再レンダリング**: 原子的状態管理

### 保守性
- **機能単位の整理**: Feature-Sliced Design
- **関心の分離**: UI、ロジック、データの明確な分離
- **テストしやすい**: 各レイヤーを独立してテスト可能

## 🎯 結論

このアーキテクチャは：
1. **Reactのベストプラクティスに準拠**
2. **既存の良い設計（ViewModel）を活かす**
3. **段階的に移行可能**
4. **教育アプリの要件（インタラクティブ性、リアルタイム性）に最適**

クリーンアーキテクチャの厳格さより、**実用的で保守しやすい**設計を選択しました。
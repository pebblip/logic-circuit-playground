# 開発ガイドライン

## 開発方針

### 1. テスト駆動開発（TDD）
- 新機能を実装する前に必ずテストを書く
- 特にユーザーインタラクション（ドラッグ、クリック）のテストを重視
- `npm test` でテストを実行

### 2. コンポーネント設計
- 小さく、単一責任のコンポーネントに分割
- 状態管理とUIを分離（カスタムフックの活用）
- 再利用可能なコンポーネントを作成

### 3. エラー防止策
- 早期リターンで異常系を処理
- null/undefinedチェックを徹底
- エッジケースを考慮した実装

### 4. 状態管理
- 予測可能な状態更新（イミュータブルな更新）
- 複雑な状態はuseReducerを使用
- デバッグしやすい構造

## コード例

### 良い例：テスト可能な配線コンポーネント
```jsx
// 状態管理をカスタムフックに分離
export const useWireConnections = () => {
  const [connections, setConnections] = useState([]);
  const [activeConnection, setActiveConnection] = useState(null);
  
  // 明確な関数名と単一責任
  const startConnection = (fromId, fromPoint) => {
    setActiveConnection({
      fromId,
      fromPoint,
      id: `temp_${Date.now()}`
    });
  };
  
  // エラーケースを早期リターン
  const completeConnection = (toId, toPoint, toIndex) => {
    if (!activeConnection || activeConnection.fromId === toId) {
      setActiveConnection(null);
      return false;
    }
    // ...
  };
  
  return {
    connections,
    activeConnection,
    startConnection,
    completeConnection
  };
};
```

### 悪い例：テストが難しい実装
```jsx
// すべてを1つのコンポーネントに詰め込む
const Circuit = () => {
  // 大量の状態
  const [gates, setGates] = useState([]);
  const [connections, setConnections] = useState([]);
  const [draggedConnection, setDraggedConnection] = useState(null);
  // ...多数の状態
  
  // 複雑なイベントハンドラ
  const handleMouseDown = (e) => {
    // 多数の条件分岐
    if (e.target.classList.contains('output')) {
      // ...
    } else if (e.target.classList.contains('input')) {
      // ...
    }
    // ...
  };
  
  // 巨大なレンダリング
  return (
    <div>
      {/* 数百行のJSX */}
    </div>
  );
};
```

## テスト戦略

### 単体テスト
- 各コンポーネントの個別機能をテスト
- カスタムフックのロジックをテスト
- エッジケースを網羅

### 統合テスト
- ユーザー操作のシナリオをテスト
- コンポーネント間の連携をテスト

### テスト例
```jsx
describe('配線機能', () => {
  it('2つの入力に別々の配線ができる', () => {
    const { result } = renderHook(() => useWireConnections());
    
    // 1つ目の配線
    act(() => {
      result.current.startConnection('gate1', { x: 10, y: 20 });
    });
    act(() => {
      result.current.completeConnection('gate3', { x: 100, y: 100 }, 0);
    });
    
    // 2つ目の配線
    act(() => {
      result.current.startConnection('gate2', { x: 30, y: 40 });
    });
    act(() => {
      result.current.completeConnection('gate3', { x: 100, y: 120 }, 1);
    });
    
    expect(result.current.connections).toHaveLength(2);
  });
});
```

## デバッグのヒント

1. React Developer Toolsを使用して状態を確認
2. console.logではなく、ブレークポイントを活用
3. テストでエラーを再現してから修正

## パフォーマンス最適化

1. React.memoで不要な再レンダリングを防止
2. useCallbackで関数の再生成を防止
3. 大量のSVG要素は仮想化を検討
# 🔧 トラブルシューティングガイド

LogicCirc開発で遭遇する技術的な問題の詳細な解決方法を提供します。

## 📋 目次

1. [エラーメッセージ別対処法](#エラーメッセージ別対処法)
2. [デバッグテクニック](#デバッグテクニック)
3. [パフォーマンス問題](#パフォーマンス問題)
4. [ビルド・デプロイ問題](#ビルド・デプロイ問題)
5. [開発ツール活用法](#開発ツール活用法)

---

## エラーメッセージ別対処法

### TypeError: Cannot read property 'x' of undefined

**発生箇所**: ピン位置計算、ワイヤー描画
```typescript
// 問題のあるコード
const pinPos = getGatePinPosition(gate.id, 'output');
const x = pinPos.x; // ここでエラー

// 解決方法
const pinPos = getGatePinPosition(gate.id, 'output');
if (!pinPos) {
  debug.error(`Pin position not found for gate ${gate.id}`);
  return { x: 0, y: 0 }; // デフォルト値を返す
}
const x = pinPos.x;
```

### Error: Maximum evaluation depth exceeded

**発生箇所**: 回路評価（coreAPI）
```typescript
// 原因：回路にループが存在
// 解決方法1：評価深度を増やす
const result = evaluateCircuit(circuit, {
  maxEvaluationDepth: 1000, // デフォルト100から増加
});

// 解決方法2：循環検出を追加
function detectCycles(circuit: Circuit): boolean {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  
  function hasCycle(gateId: string): boolean {
    visited.add(gateId);
    recursionStack.add(gateId);
    
    const connections = circuit.connections.filter(c => c.from.gateId === gateId);
    for (const conn of connections) {
      if (!visited.has(conn.to.gateId)) {
        if (hasCycle(conn.to.gateId)) return true;
      } else if (recursionStack.has(conn.to.gateId)) {
        return true;
      }
    }
    
    recursionStack.delete(gateId);
    return false;
  }
  
  return circuit.gates.some(g => !visited.has(g.id) && hasCycle(g.id));
}
```

### React Hook useEffect has missing dependencies

**発生箇所**: React コンポーネント
```typescript
// 問題のあるコード
useEffect(() => {
  updateSimulation(gates);
}, []); // 警告：gatesが依存配列にない

// 解決方法1：依存配列に追加
useEffect(() => {
  updateSimulation(gates);
}, [gates, updateSimulation]);

// 解決方法2：useCallbackで関数を安定化
const stableUpdate = useCallback((gates) => {
  updateSimulation(gates);
}, []);

useEffect(() => {
  stableUpdate(gates);
}, [gates, stableUpdate]);
```

### Module not found: Can't resolve '@/components/...'

**発生箇所**: インポート文
```typescript
// tsconfig.jsonのパス設定を確認
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}

// vite.config.tsも同様に設定
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

## デバッグテクニック

### 1. coreAPIのデバッグ

```typescript
// 評価プロセスの詳細追跡
import { evaluateCircuit } from '@/domain/simulation/core/circuitEvaluation';

const debugConfig = {
  ...defaultConfig,
  debug: true, // デバッグモード有効化
};

const result = evaluateCircuit(circuit, debugConfig);

if (!result.success) {
  console.error('Evaluation failed:', result.error);
  console.error('Error details:', {
    type: result.error.type,
    message: result.error.message,
    code: result.error.code,
  });
} else {
  console.log('Evaluation stats:', result.data.evaluationStats);
  console.log('Gate states:', result.data.circuit.gates);
}
```

### 2. 状態管理のデバッグ

```typescript
// Zustand storeのデバッグ
import { useCircuitStore } from '@/stores/circuitStore';

// コンポーネント内でのデバッグ
function DebugPanel() {
  const store = useCircuitStore();
  
  // 全状態をログ出力
  useEffect(() => {
    console.log('Circuit Store State:', {
      gates: store.gates,
      connections: store.connections,
      isRunning: store.isRunning,
    });
  }, [store]);
  
  // 特定のアクションをトレース
  const tracedAddGate = (gate: Gate) => {
    console.log('Before addGate:', store.gates.length);
    store.addGate(gate);
    console.log('After addGate:', store.gates.length);
  };
  
  return null;
}

// ブラウザコンソールでの直接アクセス
// window.__ZUSTAND_DEVTOOLS__ = true;
// Redux DevToolsで状態を監視
```

### 3. レンダリングパフォーマンスのデバッグ

```typescript
// React Profilerを使用
import { Profiler } from 'react';

function onRenderCallback(
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number,
  interactions: Set<any>
) {
  console.log(`${id} (${phase}) took ${actualDuration}ms`);
}

<Profiler id="Canvas" onRender={onRenderCallback}>
  <Canvas />
</Profiler>

// 不要な再レンダリングの検出
function GateRenderer({ gate }: { gate: Gate }) {
  useEffect(() => {
    console.log(`Gate ${gate.id} re-rendered`);
  });
  
  return <GateComponent gate={gate} />;
}
```

### 4. ワイヤー接続問題のデバッグ

```typescript
// SVG座標系のデバッグ
function debugSVGCoordinates(event: MouseEvent, svg: SVGSVGElement) {
  const pt = svg.createSVGPoint();
  pt.x = event.clientX;
  pt.y = event.clientY;
  
  const svgP = pt.matrixTransform(svg.getScreenCTM()!.inverse());
  
  console.log('Debug coordinates:', {
    client: { x: event.clientX, y: event.clientY },
    svg: { x: svgP.x, y: svgP.y },
    ctm: svg.getScreenCTM(),
  });
  
  // 視覚的デバッグ：クリック位置に赤い点を表示
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', String(svgP.x));
  circle.setAttribute('cy', String(svgP.y));
  circle.setAttribute('r', '5');
  circle.setAttribute('fill', 'red');
  svg.appendChild(circle);
  
  setTimeout(() => svg.removeChild(circle), 1000);
}
```

## パフォーマンス問題

### 大規模回路での遅延

```typescript
// 1. 評価の最適化
const optimizedEvaluate = useMemo(() => {
  return debounce((circuit: Circuit) => {
    evaluateCircuit(circuit, { 
      evaluateOnlyChanged: true // 変更されたゲートのみ評価
    });
  }, 50);
}, []);

// 2. コンポーネントのメモ化
const MemoizedGate = memo(GateRenderer, (prev, next) => {
  // カスタム比較関数で再レンダリングを制御
  return (
    prev.gate.id === next.gate.id &&
    prev.gate.output === next.gate.output &&
    prev.isSelected === next.isSelected
  );
});

// 3. 仮想化の導入（大量のゲート表示時）
import { FixedSizeList } from 'react-window';

function VirtualizedGateList({ gates }: { gates: Gate[] }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={gates.length}
      itemSize={100}
      width='100%'
    >
      {({ index, style }) => (
        <div style={style}>
          <GateRenderer gate={gates[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}
```

### メモリリークの検出と修正

```typescript
// 1. イベントリスナーのクリーンアップ
useEffect(() => {
  const handleResize = () => {
    // リサイズ処理
  };
  
  window.addEventListener('resize', handleResize);
  
  // クリーンアップ関数を必ず返す
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);

// 2. タイマーのクリーンアップ
useEffect(() => {
  const intervals: number[] = [];
  
  clockGates.forEach(gate => {
    const interval = setInterval(() => {
      updateClock(gate.id);
    }, 50);
    intervals.push(interval);
  });
  
  return () => {
    intervals.forEach(clearInterval);
  };
}, [clockGates]);

// 3. 非同期処理のキャンセル
useEffect(() => {
  let cancelled = false;
  
  async function loadData() {
    const data = await fetchCircuitData();
    if (!cancelled) {
      setCircuitData(data);
    }
  }
  
  loadData();
  
  return () => {
    cancelled = true;
  };
}, []);
```

## ビルド・デプロイ問題

### ビルドエラーの解決

```bash
# 1. 依存関係の問題
rm -rf node_modules package-lock.json
npm install

# 2. TypeScriptエラーを一時的に無視
npm run build:no-typecheck

# 3. ビルドキャッシュのクリア
rm -rf dist .vite

# 4. 環境変数の確認
echo "VITE_API_URL=$VITE_API_URL"
```

### バンドルサイズの最適化

```typescript
// 1. 動的インポートの使用
const LearningMode = lazy(() => import('@/features/learning-mode/LearningMode'));

// 2. Tree shakingの確保
// package.jsonに"sideEffects": falseを追加

// 3. 未使用コードの削除
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      treeshake: {
        preset: 'recommended',
        manualPureFunctions: ['console.log', 'debug.log'],
      },
    },
  },
});

// 4. バンドル分析
npm run build -- --analyze
```

## 開発ツール活用法

### VSCode設定の最適化

```json
// .vscode/settings.json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "files.exclude": {
    "**/.git": true,
    "**/node_modules": true,
    "**/dist": true
  }
}
```

### Chrome DevToolsの活用

```javascript
// 1. パフォーマンスプロファイリング
performance.mark('evaluation-start');
evaluateCircuit(circuit);
performance.mark('evaluation-end');
performance.measure('evaluation', 'evaluation-start', 'evaluation-end');

// 2. メモリプロファイリング
// Heap snapshotを取得して比較

// 3. ネットワークタブでバンドルサイズ確認
// Slow 3Gでパフォーマンステスト
```

### デバッグユーティリティの活用

```typescript
// src/shared/debug.ts の活用例
import { debug } from '@/shared/debug';

// グループ化されたログ
debug.group('Gate Evaluation');
debug.log('Input:', input);
debug.log('Output:', output);
debug.groupEnd();

// テーブル形式での出力
debug.table(gates.map(g => ({
  id: g.id,
  type: g.type,
  output: g.output,
})));

// 条件付きログ
debug.assert(gates.length > 0, 'No gates in circuit');

// タイミング測定
debug.time('circuit-evaluation');
evaluateCircuit(circuit);
debug.timeEnd('circuit-evaluation');
```

---

## 🔗 関連ドキュメント

- [FAQ.md](./FAQ.md) - よくある質問
- [QUICK_START.md](./QUICK_START.md) - クイックスタート
- [GUIDELINES.md](./development/GUIDELINES.md) - 開発ガイドライン
- [ARCHITECTURE.md](./development/ARCHITECTURE.md) - アーキテクチャ

---

**問題が解決しない場合は、エラーメッセージ、再現手順、環境情報を添えてGitHub Issuesに報告してください。**
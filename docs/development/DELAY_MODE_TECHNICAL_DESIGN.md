# 遅延モード技術設計書

## 概要

本文書は、LogiCircに真のイベント駆動シミュレーション（遅延モード）を実装するための技術設計を定義します。

## アーキテクチャ変更

### 1. 型定義の拡張（Phase 0で完了）

```typescript
// src/types/circuit.ts
export interface Gate {
  // 既存のプロパティ...
  timing?: GateTiming; // 新規追加
}

export interface GateTiming {
  propagationDelay?: number; // 伝播遅延（ns単位）
  riseTime?: number;         // 立ち上がり時間（将来の拡張用）
  fallTime?: number;         // 立ち下がり時間（将来の拡張用）
}
```

### 2. 定数定義（Phase 0で完了）

```typescript
// src/constants/gateDelays.ts
export const DEFAULT_GATE_DELAYS: Record<GateType, number> = {
  'NOT': 1.0,
  'AND': 2.0,
  'OR': 2.0,
  'NAND': 1.5,
  'NOR': 1.5,
  'XOR': 3.0,
  // ...
};
```

### 3. EventDrivenEngineの統合（Phase 1）

現在の構造：
```
event-driven-minimal/
├── MinimalEventDrivenEngine.ts
├── EnhancedHybridEvaluator.ts
└── HybridEvaluator.ts
```

目標の構造：
```
event-driven/
├── EventDrivenEngine.ts      // 統合されたエンジン
├── types.ts                  // 型定義
├── EventQueue.ts             // イベントキュー
└── strategies/               // 戦略パターン（将来の拡張用）
```

### 4. 遅延計算の実装

```typescript
class EventDrivenEngine {
  private delayMode: boolean = false;
  
  private scheduleGateOutput(
    gate: Gate,
    newValue: boolean,
    currentTime: SimTime
  ): void {
    const delay = this.calculateDelay(gate);
    const eventTime = currentTime + delay;
    
    this.eventQueue.schedule({
      time: eventTime,
      gateId: gate.id,
      outputIndex: 0,
      newValue,
    });
  }
  
  private calculateDelay(gate: Gate): number {
    if (!this.delayMode) {
      return 0.0001; // デルタサイクル（従来の動作）
    }
    
    // 個別設定があれば優先
    if (gate.timing?.propagationDelay !== undefined) {
      return gate.timing.propagationDelay;
    }
    
    // デフォルト値を使用
    return DEFAULT_GATE_DELAYS[gate.type] || 1.0;
  }
}
```

## データフロー

### 遅延OFF時（従来の動作）
```
入力変化 → 即座に評価 → デルタサイクル（0.0001）→ 出力更新
```

### 遅延ON時（新機能）
```
入力変化 → 遅延計算 → イベントスケジュール → 指定時間後に出力更新
```

## 重要な考慮事項

### 1. 後方互換性
- デフォルトは遅延OFF
- 既存の回路は変更なしで動作
- 設定はlocalStorageに保存

### 2. パフォーマンス
- 遅延計算は軽量（単純な数値参照）
- イベントキューは既存のBinaryHeap実装を使用
- 1000ゲート規模でも問題なし（Phase 1で検証）

### 3. カスタムゲート
- 内部回路のクリティカルパスから自動計算（Phase 5）
- 当面はデフォルト値（5.0ns）を使用

### 4. DELAYゲートの扱い
- 互換性のため残す
- 将来的に非推奨化の警告を表示

## テスト戦略

### 単体テスト
1. 遅延計算の正確性
2. イベントスケジューリング
3. モード切替の動作

### 統合テスト
1. 3-NOTリングオシレータ（最重要）
2. SR-Latch
3. D-FF with Clock

### E2Eテスト
1. UIトグルの動作
2. 設定の永続化
3. 視覚的フィードバック

## リスクと軽減策

| リスク | 影響 | 軽減策 |
|--------|------|--------|
| 既存回路の非互換 | 高 | デフォルトOFF、警告表示 |
| パフォーマンス劣化 | 中 | Phase 1で早期測定 |
| 複雑性の増加 | 低 | シンプルな実装を維持 |

## 次のステップ

1. EventDrivenEngineのリファクタリング開始
2. 3-NOTテストケースの作成
3. 基本的な遅延計算の実装

---

更新日: 2024-06-18
作成者: LogiCirc開発チーム
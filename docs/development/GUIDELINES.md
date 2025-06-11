# 📋 開発ガイドライン

> 実践的開発プロセスと品質基準

## 🚨 最重要：日常プロセス

### 修正する時の鉄則
```bash
# 1. 現状確認（必須）
npx cypress run --spec cypress/e2e/app-smoke-test.cy.js

# 2. 修正実装

# 3. 即座の検証（必須）
npm run build
npx cypress run --spec cypress/e2e/関連テスト.cy.js

# 4. 動作確認完了後のコミット（必須）
git add .
git commit -m "fix: 具体的な修正内容"
```

### ❌ 絶対禁止
- **検証なき修正**: コード変更後の動作確認なし
- **視覚的確認の省略**: UI問題でスクリーンショット未確認
- **推測での修正**: 原因不明のまま修正
- **コミットの先送り**: 動作確認済み修正の未コミット

### ✅ 必須の確認
- [ ] スクリーンショットで視覚的確認
- [ ] 関連テストが全て通過
- [ ] ビルドエラーなし
- [ ] コンソールエラーなし

---

## 📱 UI開発プロセス

### 問題発生時
1. **現状把握**
   ```bash
   npx cypress run --spec cypress/e2e/app-smoke-test.cy.js
   ```

2. **問題特定**
   ```bash
   # デバッグログ追加（src/shared/debug/index.ts使用）
   import { debug } from '@/shared/debug';
   debug.log('[Component] State:', state);
   
   # 再現テスト作成
   describe('問題再現', () => {
     it('具体的な問題', () => {
       // 再現手順
     });
   });
   ```

3. **段階的修正**
   ```bash
   # 1つずつ修正 → 即座の検証
   # 検証完了 → 即座のコミット
   ```

### デバッグ手法

#### 推奨：debug.log()による開発時デバッグ
```typescript
// デバッグユーティリティの使用（推奨）
import { debug } from '@/shared/debug';

// UI状態の確認
debug.log('[Gate] Pins:', gate.inputPins.length, gate.outputPins.length);
debug.log('[Render] Position:', position);

// イベントの確認
const handleClick = (e: MouseEvent) => {
  debug.log('[Event] Click:', e.target, e.clientX, e.clientY);
};

// パフォーマンス測定
debug.time('Render Time');
// 処理
debug.timeEnd('Render Time');

// 複雑なデータ構造の確認
debug.table(gateConnections);

// エラー・警告の出力（本番環境でも出力される）
debug.error('Critical error:', errorDetails);
debug.warn('Warning:', warningMessage);
```

#### デバッグユーティリティの利点
- **開発環境のみ**: 本番ビルドでは自動的に無効化
- **型安全**: TypeScriptで適切に型付け
- **統一された形式**: プロジェクト全体で一貫したデバッグ出力
- **技術的負債の回避**: console.logの放置を防ぐ

#### 禁止：console.logの直接使用
```typescript
// ❌ 技術的負債の原因となるため禁止
console.log('Debug info');  // 本番環境に残る可能性
console.log(data);          // 型安全でない

// ✅ 代わりにdebug.log()を使用
debug.log('Debug info');    // 自動的に本番では無効化
debug.log(data);            // 型安全
```

---

## 📋 品質基準

### 必須チェック（コミット前）
```bash
# 3つとも必ず成功させる
npm run typecheck  # 型エラー: 0個
npm run test       # テスト失敗: 0個
npm run build      # ビルドエラー: 0個
```

### テスト戦略
```bash
# 基本動作テスト（UI変更時は必須）
npx cypress run --spec cypress/e2e/app-smoke-test.cy.js

# カスタムゲート機能テスト（関連機能修正時）
npx cypress run --spec cypress/e2e/test-custom-gate-final.cy.js

# 最小構成テスト（重要な変更時）
npx cypress run --spec cypress/e2e/final-minimalist-check.cy.js

# 視覚化機能テスト（新機能追加時）
npx cypress run --spec cypress/e2e/new-visualizer-test.cy.js
```

### パフォーマンス
- バンドルサイズ: 500KB以下（gzip）
- ビルド時間: 30秒以内
- テスト実行時間: 60秒以内（単体テスト）、120秒以内（E2Eテスト）

### テスト実行の注意事項
⚠️ **重要**: ユーザー指示により、テスト実行が長すぎる場合は失敗とみなし中断する
```bash
# 単体テストが60秒を超える場合は中断し、原因分析
npm run test  # 60秒以内を期待

# E2Eテストが120秒を超える場合は中断し、原因分析
npm run test:e2e  # 120秒以内を期待

# 特定のテストファイルのみ実行して問題を特定
npm run test -- tests/問題のあるファイル.test.tsx
```

---

## 💻 コーディング規約

### TypeScript

#### 型安全性の重要性
```typescript
// ✅ 良い例: 型安全な実装
interface GateProps {
  gate: BaseGate;
  isSelected: boolean;
  onSelect: () => void;
}

const GateComponent = ({ gate, isSelected, onSelect }: GateProps) => {
  // IDEサポート: 自動補完、型チェック、リファクタリング支援
  const pinCount = gate.inputPins.length; // ✅ 型安全
  return <g onClick={onSelect}>...</g>;
};
```

#### any型の問題と代替手段
```typescript
// ❌ any型の問題
interface BadGateProps {
  gate: any;  // 🚨 any禁止の理由：
              // 1. 型安全性の喪失（ランタイムエラーの温床）
              // 2. IDEサポートなし（自動補完、リファクタリング不可）
              // 3. 保守性の低下（コードの意図が不明）
              // 4. テストの困難（型による検証ができない）
  selected: boolean;  // ❌ 命名不統一（isSelectedが統一ルール）
}

// ✅ any型の適切な代替手段
interface GoodGateProps {
  // 1. ユニオン型（最も推奨）
  gate: BaseGate | SpecialGate;
  
  // 2. 事前定義済み型
  gate: TypedGate;
  
  // 3. ジェネリック型
  gate: Gate<TMetadata>;
  
  // 4. どうしても必要な場合のみ
  metadata: Record<string, unknown>; // インデックスシグネチャ
  dynamicProps: { [key: string]: unknown }; // プロパティが動的な場合
}
```

#### 実際のプロジェクトでの型活用例
```typescript
// ✅ このプロジェクトでの型安全な実装例
import type { ClockGate, TypedGate } from '@/types/specialGates';

// 型ガード関数の活用
function processGate(gate: TypedGate) {
  if (isClockGate(gate)) {
    // gate.metadata は ClockMetadata 型として推論される
    const frequency = gate.metadata.frequency; // ✅ 型安全
    debug.log('Clock frequency:', frequency);
  }
}

// Result<T, E>パターンでエラーハンドリング
const result = evaluateCircuit(circuit);
if (result.success) {
  const { gates } = result.data; // ✅ 型安全なデータアクセス
} else {
  debug.error('Evaluation failed:', result.error.message);
}
```

### React
```typescript
// ✅ 良い例: メモ化
export const Gate = React.memo(({ gate }: GateProps) => {
  const handleClick = useCallback(() => {
    onSelect();
  }, [onSelect]);
  
  return <g onClick={handleClick}>{/* ... */}</g>;
});

// ❌ 悪い例: 毎回再作成、型なし
export const Gate = ({ gate }: any) => {
  return <g onClick={() => onSelect()}>{/* ... */}</g>;
};
```

---

## 🔄 Git管理

### コミット規約
```bash
# 機能
feat: 新機能追加
fix: バグ修正
ui: UI改善

# 品質
test: テスト追加
refactor: リファクタリング
perf: パフォーマンス改善

# その他
docs: ドキュメント更新
chore: ビルド・ツール
```

### 必須コミットタイミング
1. **各修正完了後** - 動作確認完了時点
2. **デバッグ情報追加後** - 調査用コード追加時
3. **テスト追加後** - 新しいテスト作成時
4. **問題解決後** - 最終的な修正完了時

### コミットメッセージ例
```bash
git commit -m "fix: ピンクリック判定の修正

- ヒットエリアの重複を解決
- pointer-eventsで要素の重なり問題を修正
- デバッグ用の赤い円を開発環境でのみ表示

Closes #123"
```

---

## 🧪 テスト戦略

### テスト種別
1. **UI確認テスト** - スクリーンショット比較
2. **インタラクションテスト** - ユーザー操作の確認
3. **機能テスト** - ビジネスロジックの確認
4. **統合テスト** - システム全体の動作確認

### テスト作成方針
```javascript
// ✅ 良い例: 具体的で再現性のあるテスト
describe('Gate Pin Interaction', () => {
  it('should render input pin at correct position', () => {
    cy.visit('/');
    cy.get('button').contains('INPUT').click();
    cy.get('svg circle[r="6"]').should('exist');
    cy.screenshot('input-gate-with-pins');
  });
});

// ❌ 悪い例: 曖昧なテスト
it('works', () => {
  cy.visit('/');
  cy.get('button').click();
  // 何をテストしているか不明
});
```

---

## 🚨 緊急時対応

### 重大問題発生時
```bash
# 1. 即座の現状把握
npx cypress run --spec cypress/e2e/app-smoke-test.cy.js

# 2. 影響範囲の確認
git log --oneline -10  # 最近の変更を確認
git diff HEAD~5 HEAD   # 差分を確認

# 3. 最小限の修正から開始
# 4. 各修正後に必ず検証
# 5. 検証済み修正は即座にコミット
```

### 原因不明の問題
```bash
# デバッグ用テスト作成
describe('Debug: Unknown Issue', () => {
  it('should capture current state', () => {
    cy.visit('/');
    // 現在の状態をキャプチャ
    cy.screenshot('debug-unknown-issue');
    
    // デバッグログを確認
    cy.window().then((win) => {
      // デバッグ関数の実行確認
      cy.wrap(win).its('debug').should('exist');
    });
  });
});
```

---

## 📚 関連ドキュメント

- [README.md](../../README.md) - プロジェクト概要・クイックスタート
- [ARCHITECTURE.md](./ARCHITECTURE.md) - 技術アーキテクチャ
- [ROADMAP.md](./ROADMAP.md) - 開発ロードマップ
- [デザインモックアップ](../design/mockups/) - UI仕様

---

## 🎯 成功の指標

### プロセス品質
- [ ] 修正後100%の動作確認率
- [ ] UI変更時100%のスクリーンショット確認率
- [ ] 動作確認済み修正100%のコミット率

### コード品質
- [ ] 型エラー: 0個
- [ ] テスト失敗: 0個
- [ ] ビルドエラー: 0個
- [ ] コンソールエラー: 0個

### チーム品質
- [ ] ガイドライン遵守率: 100%
- [ ] ドキュメント最新率: 100%
- [ ] 問題再発率: 0%

---

**このガイドラインは例外なく遵守してください。**
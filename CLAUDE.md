# LogiCirc - 開発ガイド

## 🎯 プロジェクト概要
教育用論理回路シミュレータの開発手順と品質管理方法を記載します。実際の開発で発生した問題の対策と予防方法をまとめています。

### 核心機能
- インタラクティブな論理回路設計環境
- リアルタイム回路シミュレーション
- 教育用学習モードとギャラリー機能
- 高度なカスタムゲート作成機能

## 🏗️ 開発哲学

### 基本原則
1. **品質優先**: 動作する確実な機能を段階的に構築
2. **予防的思考**: 問題の発生を事前に防ぐ設計
3. **継続的検証**: 全ての変更に対する多層的な確認
4. **謙虚な姿勢**: 完璧は存在しない前提での開発

### 品質に対する考え方
- 完璧なシステムは存在しない
- 自動化は補助手段であり、人的確認を代替しない
- 過去の成功は将来の失敗を保証しない
- 小さな見落としが大きな問題を引き起こす

## 🛡️ 不具合予防システム

### Level 1: 設計段階での予防
#### データ・ロジック統合原則
```typescript
// ✅ 推奨: 設定とデータの統合
export const CIRCUIT_DATA = {
  id: 'example-circuit',
  gates: [...],
  wires: [...],
  behaviorConfig: {           // 動作設定を同じ場所に
    needsAnimation: true,
    updateInterval: 200,
    expectedBehavior: 'oscillator'
  }
};

// ❌ 避ける: 設定の分散配置
// データファイル: export const CIRCUIT_DATA = { gates, wires }
// 別ファイル: if (title.includes('keyword')) { /* 設定 */ }
```

#### 型安全性の徹底
```typescript
// ✅ 厳密な型定義
interface CircuitConfig {
  needsAnimation: boolean;
  updateInterval: number;
  expectedBehavior: 'oscillator' | 'logic_gate' | 'memory_circuit';
}

// ❌ 曖昧な型定義
// config: any, settings: object, etc.
```

### Level 2: 実装段階での予防
#### 命名規則の統一
```typescript
// ✅ 一貫した命名
metadata: {
  qOutput: boolean;           // D-FFの出力
  qBarOutput: boolean;        // D-FFの反転出力
  previousClockState: boolean; // クロック状態記録
}

// ❌ 非一貫な命名
// state, output, prevState, etc.
```

#### 自動フォールバック機能
```typescript
// 設定漏れ時の安全な動作
const needsAnimation = circuit?.behaviorConfig?.needsAnimation ?? 
  detectAnimationNeed(circuit); // 自動検出による補完
```

### Level 3: テスト段階での予防
#### 多層テスト戦略
1. **構造テスト**: データ整合性の自動検証
2. **動作テスト**: 期待される振る舞いの確認
3. **統合テスト**: コンポーネント間の連携確認
4. **回帰テスト**: 既存機能の動作保証

#### 必須テストパターン
```typescript
describe('新機能のテスト', () => {
  it('基本構造が正しい', () => {
    // データ整合性
  });
  
  it('期待動作を実行する', () => {
    // 機能動作
  });
  
  it('エラー状態を適切に処理する', () => {
    // エラーハンドリング
  });
  
  it('既存機能に影響しない', () => {
    // 回帰防止
  });
});
```

### Level 4: デプロイ段階での予防
#### 段階的リリース検証
1. **型チェック**: `npm run typecheck`
2. **自動テスト**: `npm run test`
3. **手動確認**: ブラウザでの実際の動作確認
4. **統合確認**: 関連機能との相互作用確認

## 🔄 品質保証ワークフロー

### 機能追加時の必須手順

#### 1. 計画段階
- [ ] 既存システムとの整合性確認
- [ ] データ構造の統合性確認
- [ ] 潜在的副作用の評価
- [ ] テスト戦略の策定

#### 2. 実装段階
```bash
# 開発環境での継続的確認
npm run typecheck:watch  # 型エラーの即座検出
npm run test            # テストスイート実行
npm run dev            # 実際の動作確認
```

#### 3. 検証段階
- [ ] 自動テストの全通過
- [ ] 型安全性の確認
- [ ] ブラウザでの手動確認（最低30秒観察）
- [ ] 関連機能の動作確認
- [ ] エラーケースの動作確認

#### 4. 統合段階
- [ ] コードレビュー（可能な場合）
- [ ] ドキュメント更新
- [ ] PROGRESS.mdの更新
- [ ] 既知問題リストの更新

### ギャラリー回路の特別要件

#### 新規回路追加チェックリスト
```typescript
// 必須: 統合された設定
export const NEW_CIRCUIT = {
  id: 'unique-circuit-id',
  title: '回路名',
  description: '明確な説明',
  behaviorConfig: {                    // 必須項目
    needsAnimation: true/false,        // アニメーション要否
    updateInterval: number,            // 更新間隔(ms)
    expectedBehavior: BehaviorType,    // 動作タイプ
    minimumCycles: number             // テスト用サイクル数
  },
  gates: [...],
  wires: [...]
};
```

#### 検証手順
1. **構造確認**: 必須プロパティの存在
2. **動作確認**: ブラウザでの実際の動作
3. **テスト作成**: 基本動作テストの追加
4. **回帰確認**: 既存回路への影響なし

## 🔍 継続的品質管理

### 定期的品質チェック
```bash
# 週次実行推奨
npm run validate:all      # 全体品質チェック
npm run test:coverage     # テストカバレッジ確認
npm run analyze:performance # パフォーマンス分析
```

### 品質メトリクス
| 指標 | 目標値 | 現在値 | 状態 |
|------|--------|--------|------|
| 型安全性 | 100% | 確認中 | 🟡 |
| テストカバレッジ | 80%+ | 確認中 | 🟡 |
| 回帰テスト通過率 | 100% | 確認中 | 🟡 |
| 手動確認完了率 | 100% | 確認中 | 🟡 |

### 問題発生時の対応

#### インシデント対応プロセス
1. **即座の現状確認**: 影響範囲の特定
2. **根本原因分析**: 技術的・プロセス的要因の調査
3. **修正と検証**: 確実な解決策の実装
4. **予防策策定**: 同種問題の再発防止
5. **ドキュメント更新**: 知見の蓄積と共有

#### 学習サイクル
```
問題発生 → 原因分析 → 対策実装 → プロセス改善 → ドキュメント更新
```

## 📚 実装ガイド

### 開発環境セットアップ
```bash
# セッション開始時の必須確認
cat docs/management/PROGRESS.md     # 現在の状況把握
git log --oneline -5               # 最近の変更確認
npm run typecheck                  # 型エラーチェック
npm test                          # テスト状態確認
```

### コーディング標準

#### TypeScript使用規則
```typescript
// ✅ 推奨パターン
interface StrictType {
  required: string;
  optional?: number;
}

const result: Result<Data, Error> = processData(input);
if (result.success) {
  // 成功時の処理
} else {
  // エラーハンドリング
}

// ❌ 避けるパターン
const data: any = getData();        // any型の使用
throw new Error('Something');       // 不明確なエラー
```

#### エラーハンドリング標準
```typescript
// 統一されたエラーハンドリング
type Result<T, E> = 
  | { success: true; data: T }
  | { success: false; error: E };

// 具体的なエラー情報の提供
interface ValidationError {
  field: string;
  message: string;
  suggestion?: string;
}
```

### デバッグ手順
1. **再現可能性の確認**: 問題の一貫した発生
2. **最小再現ケースの作成**: 問題の本質的要因の特定
3. **仮説立案と検証**: 体系的な原因調査
4. **解決策の実装**: 根本的な問題解決
5. **回帰防止策の実装**: 同種問題の予防

## 🎯 プロジェクト管理

### 作業管理原則
- **段階的開発**: 小さな変更の積み重ね
- **継続的統合**: 変更の早期検証
- **文書化の徹底**: 知見の確実な記録
- **振り返りの実施**: 定期的なプロセス改善

### セッション管理
```bash
# セッション開始時
1. PROGRESS.mdで現状確認
2. 前回の作業内容の把握
3. 今回の作業計画の策定
4. リスク要因の事前評価

# セッション終了時
1. 作業内容のPROGRESS.md更新
2. 発見した問題の記録
3. 次回作業の計画更新
4. 学んだ教訓の文書化
```

## 🔧 ツールとスクリプト

### 開発支援ツール
```json
{
  "scripts": {
    "dev": "vite",                    // 開発サーバー
    "build": "npm run typecheck && vite build",  // 本番ビルド
    "test": "vitest",                 // テスト実行
    "test:coverage": "vitest --coverage", // カバレッジ確認
    "typecheck": "tsc --noEmit",      // 型チェック
    "lint": "eslint src --ext .ts,.tsx", // コード品質
    "validate:gallery": "node scripts/validate-circuits.js" // 回路検証
  }
}
```

### 品質チェックコマンド
```bash
# 総合品質確認
npm run build && npm run test && npm run lint

# 特定領域の確認
npm run validate:gallery          # ギャラリー回路
npm run test:integration         # 統合テスト
npm run analyze:bundle          # バンドルサイズ
```

## 📖 関連ドキュメント

### 必読文書
- `docs/development/ARCHITECTURE.md` - システム設計
- `docs/development/GUIDELINES.md` - 技術標準
- `docs/management/PROGRESS.md` - 進捗管理
- `docs/user-guide/QUICK_START.md` - 環境構築

### 参考文書
- `docs/user-guide/FAQ.md` - よくある問題と解決
- `docs/user-guide/TROUBLESHOOTING.md` - 詳細トラブルシューティング
- `docs/design/mockups/` - UI/UX仕様

## 🎉 品質改善のアプローチ

### 品質に対する姿勢
- **高品質を目指すが、不完全さを受け入れる**
- **自動化を活用するが、人的確認を怠らない**
- **過去の成功に慢心せず、新たなリスクに警戒する**
- **問題を隠さず、学習機会として活用する**

### 継続的改善
このドキュメントも継続的に改善していきます。新たな経験、発見された問題、改良されたプロセスに基づいて定期的に更新し、開発実践の改善を反映させていきます。

---

*最終更新: 2025-06-18 | このドキュメントは実際の開発経験に基づいて継続的に改善されています*
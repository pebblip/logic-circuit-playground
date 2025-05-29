# テスティングの教訓

## 2025年1月29日 - 入力ゲートのON/OFF切り替えバグ

### 問題の概要
- 入力ゲートをクリックしてもON/OFFが切り替わらない問題が発生
- 単体テストは成功していたが、実際のUIでは動作しなかった

### 根本原因
ViewModelとコンポーネント間のイベント名の不一致：
- ViewModelは `simulationCompleted` イベントを発火
- コンポーネントは `simulationResultsChanged` イベントをリスニング

### なぜテストで見逃したか

#### 1. テストの範囲が限定的だった
```typescript
// ❌ 単体テストのみ実施していた
it('ViewModelのtoggleInputが正しく動作する', () => {
  const viewModel = new UltraModernCircuitViewModel();
  const gate = viewModel.addGate('INPUT', { x: 100, y: 100 });
  
  // 直接メソッドを呼んで結果を確認
  viewModel.toggleInput(gate.id);
  expect(viewModel.getSimulationResults()[gate.id]).toBe(true);
});
```

このテストは：
- ✅ ViewModelの内部ロジックは検証できた
- ❌ イベントの発火と受信の連携は検証できなかった

#### 2. 統合テストの欠如
実際のシステムでは以下の流れで動作：
1. ユーザーがゲートをクリック
2. ViewModelの`toggleInput`が呼ばれる
3. ViewModelがイベントを発火
4. コンポーネントがイベントを受信
5. UIが更新される

単体テストでは2番目のステップしか検証していなかった。

### 改善策

#### 1. 3層のテスト戦略

```typescript
// 1. 単体テスト - ロジックの正しさ
describe('InputGate', () => {
  it('toggle()で状態が切り替わる', () => {
    const gate = new InputGate('id', { x: 0, y: 0 });
    gate.toggle();
    expect(gate.getState()).toBe(true);
  });
});

// 2. 統合テスト - コンポーネント間の連携
describe('ViewModelとコンポーネントの統合', () => {
  it('toggleInputでUIが更新される', async () => {
    const viewModel = new UltraModernCircuitViewModel();
    const { getByTestId } = render(<Component viewModel={viewModel} />);
    
    // イベントの伝播を含めてテスト
    fireEvent.click(getByTestId('input-gate'));
    await waitFor(() => {
      expect(getByTestId('gate-state')).toHaveTextContent('ON');
    });
  });
});

// 3. E2Eテスト - 実際のユーザー操作
describe('入力ゲートの操作', () => {
  it('ユーザーがゲートをクリックすると状態が変わる', () => {
    cy.visit('/');
    cy.get('[data-testid="input-gate"]').click();
    cy.get('[data-testid="gate-state"]').should('contain', 'ON');
  });
});
```

#### 2. イベント駆動システムのテスト

```typescript
// イベントの発火と受信を明示的にテスト
it('正しいイベントが発火される', () => {
  const viewModel = new UltraModernCircuitViewModel();
  const eventSpy = vi.fn();
  
  viewModel.on('simulationResultsChanged', eventSpy);
  viewModel.toggleInput('gate-1');
  
  expect(eventSpy).toHaveBeenCalled();
  expect(eventSpy).toHaveBeenCalledWith(expect.any(Map));
});
```

#### 3. テストファーストの実践

1. **要件を理解**
   - 「入力ゲートをクリックするとON/OFFが切り替わる」
   
2. **失敗するテストを書く**
   - UIレベルのテストから始める
   - 統合テストを書く
   - 単体テストを書く

3. **実装する**
   - テストが通るように実装

4. **リファクタリング**
   - テストが通ることを確認しながら改善

### チェックリスト

新機能を実装する際の確認事項：

- [ ] 単体テストを作成したか？
- [ ] 統合テストを作成したか？
- [ ] E2Eテストは必要か？作成したか？
- [ ] イベント駆動の場合、イベントの発火と受信をテストしたか？
- [ ] エッジケースをテストしたか？
- [ ] エラーケースをテストしたか？

### 重要な気づき

> 「テストが成功している」≠「システムが正しく動作している」

テストは、テストされた範囲でのみ品質を保証する。包括的なテスト戦略が必要。

### 参考：今回作成したテストファイル

1. `/src/models/__tests__/InputGateToggle.test.ts` - 単体テスト
2. `/src/viewmodels/__tests__/ViewModelEvents.test.ts` - イベント発火のテスト
3. `/src/components/__tests__/InputGateIntegration.test.tsx` - 統合テスト
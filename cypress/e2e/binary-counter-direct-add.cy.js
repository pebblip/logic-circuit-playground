/// <reference types="cypress" />

describe('BINARY_COUNTER Direct Store Addition', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(2000);
  });

  it('should render BINARY_COUNTER when added directly to store', () => {
    // ブラウザのウィンドウオブジェクトを通じて直接ストアにゲートを追加
    cy.window().then((win) => {
      // Zustandストアにアクセス（開発者ツールで確認される方法）
      const gateToAdd = {
        id: 'test-binary-counter',
        type: 'BINARY_COUNTER',
        position: { x: 400, y: 300 },
        inputs: [''],
        output: false,
        outputs: [false, false],
        metadata: {
          bitCount: 2,
          currentValue: 0,
          previousClockState: false,
        },
      };

      // React DevToolsから取得可能なストアにアクセス
      // または、ストアが window に公開されている場合
      if (win.useCircuitStore && win.useCircuitStore.getState) {
        const currentState = win.useCircuitStore.getState();
        win.useCircuitStore.setState({
          ...currentState,
          gates: [...currentState.gates, gateToAdd]
        });
      } else {
        // フォールバック: localStorage を通じてデータを設定
        const circuitData = {
          gates: [gateToAdd],
          wires: []
        };
        win.localStorage.setItem('circuit', JSON.stringify(circuitData));
        // ページをリロードして変更を適用
        cy.reload();
        cy.wait(2000);
      }
    });

    cy.wait(1000);

    // BINARY_COUNTERが正しくレンダリングされることを確認
    cy.get('svg[data-testid="canvas"]').within(() => {
      cy.get('rect[width="120"]', { timeout: 5000 }).should('exist');
      cy.get('[data-testid="counter-label"]', { timeout: 5000 }).should('be.visible');
      cy.get('[data-testid="counter-bit-label"]', { timeout: 5000 }).should('be.visible');
      cy.get('[data-testid="counter-value"]', { timeout: 5000 }).should('be.visible');
    });

    cy.screenshot('binary-counter-direct-add-success');
  });

  it('should use programmatic gate addition via DOM manipulation', () => {
    // 別のアプローチ: DOMイベントを直接トリガー
    cy.window().then((win) => {
      // カスタムイベントを発生させてゲートを追加
      const addGateEvent = new win.CustomEvent('addGate', {
        detail: {
          type: 'BINARY_COUNTER',
          position: { x: 400, y: 300 }
        }
      });
      win.document.dispatchEvent(addGateEvent);
    });

    cy.wait(1000);

    // または、Reactの内部APIを直接呼び出し
    cy.get('[data-testid="canvas"]').then(() => {
      // React Fiber APIを使用してコンポーネントの状態を変更
      cy.window().then((win) => {
        // React DevTools API経由でストアを更新
        cy.log('Attempting to add gate via React internals...');
      });
    });

    cy.screenshot('binary-counter-programmatic-add');
  });
});
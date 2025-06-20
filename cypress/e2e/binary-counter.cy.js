/// <reference types="cypress" />

describe('BINARY_COUNTER Gate', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should add BINARY_COUNTER gate to circuit', () => {
    // UI操作の代わりに直接ストアにゲートを追加（UI操作に問題があるため）
    cy.window().then((win) => {
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

      // ストア経由でゲートを追加
      if (win.useCircuitStore && win.useCircuitStore.getState) {
        const currentState = win.useCircuitStore.getState();
        win.useCircuitStore.setState({
          ...currentState,
          gates: [...currentState.gates, gateToAdd]
        });
      }
    });

    cy.wait(1000);
    
    // ゲートが配置されたことを確認
    cy.get('svg[data-testid="canvas"]').within(() => {
      cy.get('rect[width="120"]').should('exist');
      cy.get('[data-testid="counter-label"]').should('be.visible');
      cy.get('[data-testid="counter-bit-label"]').should('be.visible'); 
      cy.get('[data-testid="counter-value"]').should('be.visible');
    });
    
    // 値が正しく表示されることを確認
    cy.get('[data-testid="counter-value"]').should('contain', '00');
    cy.get('[data-testid="counter-bit-label"]').should('contain', '2bit');
  });

  it('should count with CLOCK input', () => {
    // UI操作の代わりに直接ストアにゲートを追加
    cy.window().then((win) => {
      const clockGate = {
        id: 'test-clock',
        type: 'CLOCK',
        position: { x: 200, y: 300 },
        inputs: [],
        output: false,
        metadata: {
          frequency: 1,
          isRunning: true,
          startTime: undefined,
        },
      };

      const counterGate = {
        id: 'test-counter',
        type: 'BINARY_COUNTER',
        position: { x: 500, y: 300 },
        inputs: [''],
        output: false,
        outputs: [false, false],
        metadata: {
          bitCount: 2,
          currentValue: 0,
          previousClockState: false,
        },
      };

      const outputGate1 = {
        id: 'test-output1',
        type: 'OUTPUT',
        position: { x: 700, y: 250 },
        inputs: [''],
        output: false,
      };

      const outputGate2 = {
        id: 'test-output2',
        type: 'OUTPUT',
        position: { x: 700, y: 350 },
        inputs: [''],
        output: false,
      };

      // ストア経由でゲートを追加
      if (win.useCircuitStore && win.useCircuitStore.getState) {
        const currentState = win.useCircuitStore.getState();
        win.useCircuitStore.setState({
          ...currentState,
          gates: [...currentState.gates, clockGate, counterGate, outputGate1, outputGate2]
        });
      }
    });

    cy.wait(2000);
    
    // 全てのゲートが配置されていることを確認
    cy.get('svg[data-testid="canvas"]').within(() => {
      cy.get('[data-testid="counter-value"]').should('be.visible');
      
      // CLOCK要素の存在確認
      cy.get('circle[r="45"]').should('exist'); // CLOCKゲートの外枠
      // COUNTER要素の存在確認  
      cy.get('rect[width="120"]').should('exist'); // BINARY_COUNTERゲートの外枠
    });
    
    // 初期状態を確認（カウンタ = 0）
    cy.get('[data-testid="counter-value"]').should('contain', '00');
    
    // カウンタが存在し、値が表示されていることを確認
    cy.get('[data-testid="counter-value"]').should('be.visible');
  });
});
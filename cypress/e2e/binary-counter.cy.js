/// <reference types="cypress" />

describe('BINARY_COUNTER Gate', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should add BINARY_COUNTER gate to circuit', () => {
    // 特殊ゲートセクションを開く
    cy.contains('⚙️').parent().click();
    
    // COUNTERゲートをクリック
    cy.contains('.gate-item', 'COUNTER').click();
    
    // キャンバスをクリックして配置
    cy.get('#circuit-canvas').click(400, 300);
    
    // ゲートが配置されたことを確認
    cy.get('#circuit-canvas').within(() => {
      cy.contains('COUNTER').should('exist');
      cy.contains('2bit').should('exist');
    });
  });

  it('should count with CLOCK input', () => {
    // CLOCKゲートを配置
    cy.contains('🔌').parent().click();
    cy.contains('.gate-item', 'CLOCK').click();
    cy.get('#circuit-canvas').click(200, 300);
    
    // BINARY_COUNTERゲートを配置
    cy.contains('⚙️').parent().click();
    cy.contains('.gate-item', 'COUNTER').click();
    cy.get('#circuit-canvas').click(500, 300);
    
    // OUTPUTゲートを2つ配置（Q0, Q1用）
    cy.contains('.gate-item', 'OUTPUT').click();
    cy.get('#circuit-canvas').click(700, 250);
    cy.contains('.gate-item', 'OUTPUT').click();
    cy.get('#circuit-canvas').click(700, 350);
    
    // ワイヤーを接続
    // CLOCK -> COUNTER CLK
    cy.get('#circuit-canvas').within(() => {
      // CLOCKの出力ピン
      cy.get('circle[cx="50"][cy="0"]').first().click();
      // COUNTERのCLK入力ピン
      cy.get('circle[cx="-60"][cy="0"]').eq(1).click();
      
      // COUNTER Q0 -> OUTPUT 1
      cy.get('circle[cx="60"][cy="-15"]').first().click();
      cy.get('circle[cx="-30"][cy="0"]').eq(1).click();
      
      // COUNTER Q1 -> OUTPUT 2
      cy.get('circle[cx="60"][cy="15"]').first().click();
      cy.get('circle[cx="-30"][cy="0"]').eq(2).click();
    });
    
    // 初期状態を確認（カウンタ = 0）
    cy.get('#circuit-canvas').within(() => {
      cy.contains('00').should('exist'); // カウンタ値表示
    });
    
    // シミュレーションが実行されていることを確認
    cy.wait(2000); // CLOCKが1Hzなので2秒待つ
    
    // カウンタが増加していることを確認
    cy.get('#circuit-canvas').within(() => {
      cy.contains(/0[1-3]/).should('exist'); // カウンタが1,2,3のいずれか
    });
  });
});
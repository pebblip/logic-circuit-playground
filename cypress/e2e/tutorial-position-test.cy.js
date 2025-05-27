describe('チュートリアルボックスの位置確認', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('「入力を切り替え」ステップでボックスがゲートと重ならない', () => {
    // ウェルカムステップ
    cy.contains('ようこそ！').should('be.visible');
    cy.contains('次へ').click();
    
    // ツールバーステップ
    cy.contains('ツールバー').should('be.visible');
    cy.contains('次へ').click();
    
    // 入力ゲート配置ステップ
    cy.contains('入力ゲートを配置').should('be.visible');
    
    // 入力ゲートを配置
    cy.get('button').contains('入力').click();
    
    // 入力を切り替えステップが表示されるまで待つ
    cy.contains('入力を切り替え', { timeout: 1000 }).should('be.visible');
    
    // チュートリアルボックスの位置を確認
    cy.contains('入力を切り替え').parent().parent().then($tutorialBox => {
      const tutorialRect = $tutorialBox[0].getBoundingClientRect();
      
      // ゲートの位置を確認（中央付近に配置される）
      cy.get('g[data-gate-id]').first().then($gate => {
        const gateRect = $gate[0].getBoundingClientRect();
        
        // チュートリアルボックスがゲートの右側にあることを確認
        expect(tutorialRect.left).to.be.greaterThan(gateRect.right);
        
        // ログ出力
        cy.log('Tutorial Box Left:', tutorialRect.left);
        cy.log('Gate Right:', gateRect.right);
        cy.log('Gap:', tutorialRect.left - gateRect.right);
      });
    });
    
    // ゲートがクリック可能であることを確認
    cy.get('g[data-gate-id]').first().click();
    
    // INPUT_TOGGLEDイベントが発火してステップが進むことを確認
    cy.contains('出力ゲートを配置', { timeout: 1000 }).should('be.visible');
  });
  
  it('チュートリアルボックスの各ポジションが正しく表示される', () => {
    // center position
    cy.contains('ようこそ！').should('be.visible');
    cy.contains('ようこそ！').parent().parent().should($el => {
      const rect = $el[0].getBoundingClientRect();
      const viewportWidth = Cypress.config('viewportWidth');
      const viewportHeight = Cypress.config('viewportHeight');
      
      // 中央に配置されているか確認（誤差50px以内）
      expect(Math.abs(rect.left + rect.width / 2 - viewportWidth / 2)).to.be.lessThan(50);
      expect(Math.abs(rect.top + rect.height / 2 - viewportHeight / 2)).to.be.lessThan(50);
    });
    
    cy.contains('次へ').click();
    
    // right position (toolbar)
    cy.contains('ツールバー').should('be.visible');
    cy.contains('ツールバー').parent().parent().should($el => {
      const rect = $el[0].getBoundingClientRect();
      
      // 左側に配置されているか確認
      expect(rect.left).to.equal(100);
      expect(rect.top).to.equal(150);
    });
  });
});
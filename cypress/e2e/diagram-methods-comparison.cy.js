describe('回路図表現手法の比較', () => {
  beforeEach(() => {
    cy.visit('/diagram-methods-comparison.html');
    cy.viewport(1400, 3000); // 全体を撮影するため高さを大きく
    cy.wait(1000); // Mermaidなどの描画完了を待つ
  });

  it('各手法の比較スクリーンショットを撮影', () => {
    // 全体のスクリーンショット
    cy.screenshot('diagram-methods/00-full-comparison', {
      capture: 'fullPage',
      overwrite: true
    });

    // 各手法のセクションを個別に撮影
    cy.get('.method-section').eq(0).screenshot('diagram-methods/01-css-html-method', {
      overwrite: true
    });

    cy.get('.method-section').eq(1).screenshot('diagram-methods/02-mermaid-method', {
      overwrite: true
    });

    cy.get('.method-section').eq(2).screenshot('diagram-methods/03-react-flow-method', {
      overwrite: true
    });

    cy.get('.method-section').eq(3).screenshot('diagram-methods/04-canvas-api-method', {
      overwrite: true
    });

    cy.get('.method-section').eq(4).screenshot('diagram-methods/05-existing-components', {
      overwrite: true
    });

    // 最終評価部分
    cy.get('.final-comparison').screenshot('diagram-methods/06-conclusion', {
      overwrite: true
    });
  });

  it('各手法の特徴を確認', () => {
    // CSS+HTML方式の確認
    cy.get('.method-section').eq(0).within(() => {
      cy.contains('CSS + HTML方式').should('be.visible');
      cy.get('.circuit-container').should('exist');
      cy.get('table').should('exist'); // 真理値表
    });

    // Mermaid方式の確認
    cy.get('.method-section').eq(1).within(() => {
      cy.contains('Mermaid方式').should('be.visible');
      cy.get('.mermaid svg').should('exist'); // Mermaidが描画されているか
    });

    // Canvas API方式の確認
    cy.get('.method-section').eq(3).within(() => {
      cy.contains('Canvas API方式').should('be.visible');
      cy.get('#canvas-demo').should('exist');
    });

    // 総合評価の確認
    cy.get('.score-table').within(() => {
      cy.contains('既存コンポーネント').parent().find('td').last()
        .should('contain', '⭐⭐⭐⭐⭐')
        .should('have.css', 'background-color', 'rgb(0, 255, 136)');
    });
  });
});
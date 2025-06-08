// SVG図表カタログ v3のスクリーンショット撮影

describe('SVG Catalog v3 - Cycle 1', () => {
  beforeEach(() => {
    cy.visit('/svg-diagram-catalog-v3.html');
    cy.wait(500);
  });

  it('should capture v3 improvements', () => {
    // 全体のスクリーンショット
    cy.screenshot('svg-catalog-v3-cycle1/00-full-page', {
      capture: 'fullPage',
      overwrite: true
    });
  });

  it('should capture detailed sections', () => {
    // 1. 改良された基本ゲート
    cy.get('h2').contains('基本ゲート記号').scrollIntoView();
    cy.wait(300);
    cy.screenshot('svg-catalog-v3-cycle1/01-improved-gates', {
      capture: 'viewport',
      overwrite: true
    });

    // 2. 改良された複合回路
    cy.get('h2').contains('複合回路').scrollIntoView();
    cy.wait(300);
    cy.screenshot('svg-catalog-v3-cycle1/02-improved-complex-circuits', {
      capture: 'viewport',
      overwrite: true
    });

    // 3. アナログ vs デジタル復活
    cy.get('h2').contains('信号波形').scrollIntoView();
    cy.wait(300);
    cy.screenshot('svg-catalog-v3-cycle1/03-analog-vs-digital-restored', {
      capture: 'viewport',
      overwrite: true
    });
  });

  it('should verify connection improvements', () => {
    // 配線とゲートの重複確認
    cy.get('svg').first().within(() => {
      // 配線終点とゲート開始点の重複を確認
      cy.get('line').first().should('have.attr', 'x2', '65');
      cy.get('path').first().should('have.attr', 'd')
        .and('include', 'M 60'); // 5px重複
    });

    // 分岐点の円が存在することを確認
    cy.get('svg').contains('半加算器').parents('svg').within(() => {
      cy.get('circle[fill="#00ff88"]').should('have.length.greaterThan', 0);
    });

    // アナログ波形の復活確認
    cy.get('svg').contains('アナログ信号').should('exist');
    cy.get('path[stroke="#ff9500"]').should('exist');
  });

  it('should capture individual improvements', () => {
    // ANDゲートの接続改善
    cy.contains('ANDゲート').parents('.diagram-container')
      .screenshot('svg-catalog-v3-cycle1/detail-and-gate-improved', {
        padding: 10,
        overwrite: true
      });

    // 半加算器の配線改善
    cy.contains('半加算器').parents('.diagram-container')
      .screenshot('svg-catalog-v3-cycle1/detail-half-adder-wiring', {
        padding: 10,
        overwrite: true
      });

    // アナログ vs デジタル対比
    cy.contains('アナログ信号 vs デジタル信号').parents('.diagram-container')
      .screenshot('svg-catalog-v3-cycle1/detail-analog-digital-comparison', {
        padding: 10,
        overwrite: true
      });
  });
});
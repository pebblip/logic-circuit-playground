// 独立したSVG図表カタログHTMLのスクリーンショット撮影

describe('SVG Catalog Standalone', () => {
  beforeEach(() => {
    cy.visit('/svg-diagram-catalog.html');
    cy.wait(1000);
  });

  it('should capture the complete catalog', () => {
    // 全体のスクリーンショット
    cy.screenshot('svg-catalog-standalone/00-full-page', {
      capture: 'fullPage',
      overwrite: true
    });
  });

  it('should capture each section separately', () => {
    // 1. ゲート記号セクション
    cy.get('h2').contains('1. ゲート記号').scrollIntoView();
    cy.wait(500);
    cy.screenshot('svg-catalog-standalone/01-gate-symbols', {
      capture: 'viewport',
      overwrite: true
    });

    // 2. 回路接続図セクション
    cy.get('h2').contains('2. 回路接続図').scrollIntoView();
    cy.wait(500);
    cy.screenshot('svg-catalog-standalone/02-circuit-connections', {
      capture: 'viewport',
      overwrite: true
    });

    // 3. 複合回路セクション
    cy.get('h2').contains('3. 複合回路').scrollIntoView();
    cy.wait(500);
    cy.screenshot('svg-catalog-standalone/03-complex-circuits', {
      capture: 'viewport',
      overwrite: true
    });

    // 4. 信号波形セクション
    cy.get('h2').contains('4. 信号波形').scrollIntoView();
    cy.wait(500);
    cy.screenshot('svg-catalog-standalone/04-signal-waveforms', {
      capture: 'viewport',
      overwrite: true
    });

    // 5. 真理値表セクション
    cy.get('h2').contains('5. 真理値表').scrollIntoView();
    cy.wait(500);
    cy.screenshot('svg-catalog-standalone/05-truth-tables', {
      capture: 'viewport',
      overwrite: true
    });
  });

  it('should test responsive behavior', () => {
    // デスクトップサイズ
    cy.viewport(1920, 1080);
    cy.screenshot('svg-catalog-standalone/responsive-desktop', {
      capture: 'viewport',
      overwrite: true
    });

    // タブレットサイズ
    cy.viewport(768, 1024);
    cy.screenshot('svg-catalog-standalone/responsive-tablet', {
      capture: 'viewport',
      overwrite: true
    });

    // モバイルサイズ
    cy.viewport(375, 667);
    cy.screenshot('svg-catalog-standalone/responsive-mobile', {
      capture: 'viewport',
      overwrite: true
    });
  });

  it('should verify SVG quality', () => {
    // SVG要素の存在確認
    cy.get('svg.circuit-diagram').should('have.length.greaterThan', 5);
    
    // 各SVGのviewBox属性確認
    cy.get('svg.circuit-diagram').each(($svg) => {
      expect($svg.attr('viewBox')).to.exist;
    });

    // ANDゲートの表示確認（&ではなくAND）
    cy.get('svg').contains('AND').should('exist');
    cy.get('svg').contains('&').should('not.exist');

    // 真理値表の緑色ハイライト確認
    cy.get('.truth-table td.active').should('exist');
    cy.get('.truth-table td.active').should('have.css', 'background-color')
      .and('include', 'rgba(0, 255, 136');
  });

  it('should capture individual diagrams in detail', () => {
    // ANDゲートの詳細
    cy.get('.diagram-container').first().screenshot('svg-catalog-standalone/detail-and-gate', {
      padding: 20,
      overwrite: true
    });

    // 半加算器の詳細
    cy.contains('半加算器').parent().screenshot('svg-catalog-standalone/detail-half-adder', {
      padding: 20,
      overwrite: true
    });

    // クロック信号の詳細
    cy.contains('クロック信号').parent().screenshot('svg-catalog-standalone/detail-clock-signal', {
      padding: 20,
      overwrite: true
    });
  });
});
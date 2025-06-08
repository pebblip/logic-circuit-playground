// SVG図表カタログ v2のスクリーンショット撮影

describe('SVG Catalog v2', () => {
  beforeEach(() => {
    cy.visit('/svg-diagram-catalog-v2.html');
    cy.wait(500);
  });

  it('should capture the complete v2 catalog', () => {
    // 全体のスクリーンショット
    cy.screenshot('svg-catalog-v2/00-full-page', {
      capture: 'fullPage',
      overwrite: true
    });
  });

  it('should capture each section separately', () => {
    // 1. 基本ゲート記号
    cy.get('h2').contains('1. 基本ゲート記号').scrollIntoView();
    cy.wait(300);
    cy.screenshot('svg-catalog-v2/01-basic-gates', {
      capture: 'viewport',
      overwrite: true
    });

    // 2. 基本回路
    cy.get('h2').contains('2. 基本回路').scrollIntoView();
    cy.wait(300);
    cy.screenshot('svg-catalog-v2/02-basic-circuits', {
      capture: 'viewport',
      overwrite: true
    });

    // 3. 複合回路
    cy.get('h2').contains('3. 複合回路').scrollIntoView();
    cy.wait(300);
    cy.screenshot('svg-catalog-v2/03-complex-circuits', {
      capture: 'viewport',
      overwrite: true
    });

    // 4. 信号波形
    cy.get('h2').contains('4. 信号波形').scrollIntoView();
    cy.wait(300);
    cy.screenshot('svg-catalog-v2/04-signal-waveforms', {
      capture: 'viewport',
      overwrite: true
    });

    // 5. 真理値表
    cy.get('h2').contains('5. 真理値表').scrollIntoView();
    cy.wait(300);
    cy.screenshot('svg-catalog-v2/05-truth-tables', {
      capture: 'viewport',
      overwrite: true
    });
  });

  it('should verify design improvements', () => {
    // ゲートサイズの統一確認
    cy.get('svg.circuit-diagram').first().within(() => {
      // ANDゲートのサイズ確認
      cy.get('path').first().should('have.attr', 'd')
        .and('include', 'M 60 30'); // 統一された開始点
    });

    // 配線の直接接続確認
    cy.get('svg').contains('AND').parents('svg').within(() => {
      // 配線がゲートに直接接続（x=60でゲート開始）
      cy.get('line').first().should('have.attr', 'x2', '60');
    });

    // テキストサイズの統一確認
    cy.get('svg text').each(($text) => {
      const fontSize = $text.attr('font-size');
      expect(['14', '16']).to.include(fontSize); // 14pxまたは16pxのみ
    });

    // 真理値表のアクティブセル確認
    cy.get('.truth-table td.active').should('exist');
    cy.get('.truth-table td.active').should('have.css', 'background-color')
      .and('include', 'rgba(0, 255, 136'); // 緑色のハイライト
  });

  it('should capture individual diagrams for quality check', () => {
    // ANDゲートの詳細
    cy.contains('ANDゲート').parents('.diagram-container')
      .screenshot('svg-catalog-v2/detail-and-gate', {
        padding: 10,
        overwrite: true
      });

    // 半加算器の詳細
    cy.contains('半加算器').parents('.diagram-container')
      .screenshot('svg-catalog-v2/detail-half-adder', {
        padding: 10,
        overwrite: true
      });

    // クロック信号の詳細
    cy.contains('クロック信号').parents('.diagram-container')
      .screenshot('svg-catalog-v2/detail-clock-signal', {
        padding: 10,
        overwrite: true
      });
  });

  it('should test responsive behavior', () => {
    // デスクトップ
    cy.viewport(1920, 1080);
    cy.screenshot('svg-catalog-v2/responsive-desktop', {
      capture: 'viewport',
      overwrite: true
    });

    // タブレット
    cy.viewport(768, 1024);
    cy.screenshot('svg-catalog-v2/responsive-tablet', {
      capture: 'viewport',
      overwrite: true
    });

    // モバイル
    cy.viewport(375, 667);
    cy.contains('基本ゲート記号').scrollIntoView();
    cy.screenshot('svg-catalog-v2/responsive-mobile', {
      capture: 'viewport',
      overwrite: true
    });
  });
});
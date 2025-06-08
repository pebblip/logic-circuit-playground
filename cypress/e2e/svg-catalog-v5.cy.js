// SVG図表カタログ v5のスクリーンショット撮影

describe('SVG Catalog v5 - Cycle 3 Aesthetic Perfection', () => {
  beforeEach(() => {
    cy.visit('/svg-diagram-catalog-v5.html');
    cy.wait(500);
  });

  it('should capture v5 aesthetic perfection', () => {
    // 全体のスクリーンショット
    cy.screenshot('svg-catalog-v5-cycle3/00-full-page-aesthetic', {
      capture: 'fullPage',
      overwrite: true
    });
  });

  it('should capture perfected sections', () => {
    // 1. 美的完成された基本ゲート
    cy.get('h2').contains('基本ゲート記号').scrollIntoView();
    cy.wait(300);
    cy.screenshot('svg-catalog-v5-cycle3/01-aesthetic-gates', {
      capture: 'viewport',
      overwrite: true
    });

    // 2. 曲線美を追求した複合回路
    cy.get('h2').contains('複合回路').scrollIntoView();
    cy.wait(300);
    cy.screenshot('svg-catalog-v5-cycle3/02-curve-beauty-circuits', {
      capture: 'viewport',
      overwrite: true
    });

    // 3. 完璧な信号波形
    cy.get('h2').contains('信号波形').scrollIntoView();
    cy.wait(300);
    cy.screenshot('svg-catalog-v5-cycle3/03-perfect-waveforms', {
      capture: 'viewport',
      overwrite: true
    });
  });

  it('should verify aesthetic improvements', () => {
    // グロー効果の存在確認
    cy.get('filter[id="wireGlow"]').should('exist');
    cy.get('filter[id="gateGlow"]').should('exist');

    // XORの太い補助曲線確認
    cy.get('svg').contains('XOR').parents('svg').within(() => {
      cy.get('path[stroke-width="4"]').should('exist');
    });

    // 黄金比ゲートサイズ確認
    cy.get('text[font-size="20"]').should('exist');

    // 大型分岐点確認
    cy.get('circle[r="8"]').should('exist');
  });

  it('should capture aesthetic details', () => {
    // XORゲートの完璧な二重曲線
    cy.contains('XORゲート').parents('.diagram-container')
      .screenshot('svg-catalog-v5-cycle3/detail-perfect-xor-curves', {
        padding: 20,
        overwrite: true
      });

    // 半加算器の曲線美
    cy.contains('半加算器').parents('.diagram-container')
      .screenshot('svg-catalog-v5-cycle3/detail-curve-beauty-half-adder', {
        padding: 20,
        overwrite: true
      });

    // 完璧なアナログ vs デジタル
    cy.contains('アナログ信号 vs デジタル信号').parents('.diagram-container')
      .screenshot('svg-catalog-v5-cycle3/detail-perfect-analog-digital', {
        padding: 20,
        overwrite: true
      });

    // ANDゲートの黄金比プロポーション
    cy.contains('ANDゲート').parents('.diagram-container')
      .screenshot('svg-catalog-v5-cycle3/detail-golden-ratio-and', {
        padding: 20,
        overwrite: true
      });

    // NOTゲートの美的反転円
    cy.contains('NOTゲート').parents('.diagram-container')
      .screenshot('svg-catalog-v5-cycle3/detail-aesthetic-not-circle', {
        padding: 20,
        overwrite: true
      });
  });
});
// SVG図表カタログ v4のスクリーンショット撮影

describe('SVG Catalog v4 - Cycle 2', () => {
  beforeEach(() => {
    cy.visit('/svg-diagram-catalog-v4.html');
    cy.wait(500);
  });

  it('should capture v4 major improvements', () => {
    // 全体のスクリーンショット
    cy.screenshot('svg-catalog-v4-cycle2/00-full-page', {
      capture: 'fullPage',
      overwrite: true
    });
  });

  it('should capture redesigned sections', () => {
    // 1. 完全再設計された基本ゲート
    cy.get('h2').contains('基本ゲート記号').scrollIntoView();
    cy.wait(300);
    cy.screenshot('svg-catalog-v4-cycle2/01-redesigned-gates', {
      capture: 'viewport',
      overwrite: true
    });

    // 2. 最適化された複合回路
    cy.get('h2').contains('複合回路').scrollIntoView();
    cy.wait(300);
    cy.screenshot('svg-catalog-v4-cycle2/02-optimized-complex-circuits', {
      capture: 'viewport',
      overwrite: true
    });

    // 3. 完成された信号波形
    cy.get('h2').contains('信号波形').scrollIntoView();
    cy.wait(300);
    cy.screenshot('svg-catalog-v4-cycle2/03-finalized-waveforms', {
      capture: 'viewport',
      overwrite: true
    });
  });

  it('should verify major improvements', () => {
    // XORゲートの二重曲線確認
    cy.get('svg').contains('XOR').parents('svg').within(() => {
      // 太い補助曲線の存在確認
      cy.get('path[stroke-width="3"]').should('have.length.greaterThan', 1);
    });

    // 配線の太さ確認
    cy.get('line[stroke-width="4"]').should('exist');

    // 大型分岐点確認
    cy.get('circle[r="6"]').should('exist');

    // 拡大されたゲート確認
    cy.get('text[font-size="18"]').should('exist');
  });

  it('should capture detailed improvements', () => {
    // XORゲートの二重曲線改善
    cy.contains('XORゲート').parents('.diagram-container')
      .screenshot('svg-catalog-v4-cycle2/detail-xor-double-curves', {
        padding: 15,
        overwrite: true
      });

    // 半加算器の配線最適化
    cy.contains('半加算器').parents('.diagram-container')
      .screenshot('svg-catalog-v4-cycle2/detail-half-adder-optimized', {
        padding: 15,
        overwrite: true
      });

    // アナログ vs デジタル最終版
    cy.contains('アナログ信号 vs デジタル信号').parents('.diagram-container')
      .screenshot('svg-catalog-v4-cycle2/detail-analog-digital-final', {
        padding: 15,
        overwrite: true
      });

    // ANDゲートの浸透接続
    cy.contains('ANDゲート').parents('.diagram-container')
      .screenshot('svg-catalog-v4-cycle2/detail-and-gate-penetration', {
        padding: 15,
        overwrite: true
      });
  });
});
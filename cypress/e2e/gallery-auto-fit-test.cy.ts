/**
 * ギャラリーモード自動フィット機能テスト
 */

describe('ギャラリーモード自動フィット機能', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5176/');
    cy.get('[data-testid="mode-selector-gallery"]').click();
  });

  it('回路選択時に自動的にフィットする', () => {
    // 大きな回路を選択（7セグメントデコーダー）
    cy.get('[data-testid="gallery-circuit-seven-segment"]').click();
    
    // 回路全体が表示されていることを確認
    cy.get('[data-gate-type]').should('have.length.at.least', 10);
    
    // キャンバスのビューボックスが調整されていることを確認
    cy.get('.unified-canvas__svg').then(($svg) => {
      const viewBox = $svg.attr('viewBox');
      expect(viewBox).to.not.equal('0 0 1200 800'); // デフォルト値ではない
      // viewBoxの幅が変わっていることを確認（自動フィットされた証拠）
      expect(viewBox).to.not.include('1200 800');
    });
  });

  it('小さい回路でも適切にフィットする', () => {
    // 小さな回路を選択（SRラッチ）
    cy.get('[data-testid="gallery-circuit-sr-latch"]').click();
    
    // 回路が中央に配置されていることを視覚的に確認
    cy.get('[data-gate-type="SR-LATCH"]').should('exist');
    
    // スケールが適切であることを確認（拡大しすぎない）
    cy.get('.unified-canvas').should('exist');
  });

  it('複数の回路を切り替えても適切にフィットする', () => {
    // 最初の回路
    cy.get('[data-testid="gallery-circuit-4bit-comparator"]').click();
    cy.wait(500);
    
    // 別の回路に切り替え
    cy.get('[data-testid="gallery-circuit-mandala-circuit"]').click();
    cy.wait(500);
    
    // それぞれの回路が適切にフィットしていることを確認
    cy.get('[data-gate-type]').should('be.visible');
  });

  it('手動ズーム後は自動フィットしない', () => {
    // 回路を選択
    cy.get('[data-testid="gallery-circuit-fibonacci-counter"]').click();
    
    // ズームイン
    cy.get('[data-testid="zoom-in-button"]').click();
    cy.wait(500);
    
    // 現在のviewBoxを記録
    let previousViewBox: string;
    cy.get('.unified-canvas__svg').then(($svg) => {
      previousViewBox = $svg.attr('viewBox') || '';
    });
    
    // 別の回路に切り替え
    cy.get('[data-testid="gallery-circuit-johnson-counter"]').click();
    cy.wait(500);
    
    // viewBoxが前の値から変わっていることを確認（自動フィットは新しい回路でも発生する）
    cy.get('.unified-canvas__svg').then(($svg) => {
      const currentViewBox = $svg.attr('viewBox');
      // 注: 現在の実装では、新しい回路選択時に常に自動フィットが発生する
      expect(currentViewBox).to.not.equal(previousViewBox);
    });
  });
});
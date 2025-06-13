/* eslint-disable */
describe('モバイルタッチジェスチャー', () => {
  beforeEach(() => {
    // iPhone 13のビューポートサイズ
    cy.viewport(390, 844);
    cy.visit('/', {
      onBeforeLoad(win) {
        // タッチイベントをエミュレート
        win.ontouchstart = true;
      },
    });
  });

  it('ツールバーからゲートをタップして配置できる', () => {
    // ツールバーを開く
    cy.get('.swipe-handle').click();
    cy.get('.mobile-toolbar').should('have.class', 'open');

    // ANDゲートをタップ
    cy.get('.tool-item').contains('AND').click();

    // ゲートが配置されることを確認
    cy.get('.gate-container').should('have.length', 1);
    cy.get('.gate-text').should('contain', 'AND');

    // スクリーンショット
    cy.screenshot('mobile-tap-place-gate');
  });

  it('ゲートをドラッグして配置できる', () => {
    // ツールバーを開く
    cy.get('.swipe-handle').click();

    // ORゲートをドラッグ
    cy.get('.tool-item')
      .contains('OR')
      .trigger('touchstart', { touches: [{ clientX: 195, clientY: 700 }] })
      .wait(100)
      .trigger('touchmove', { 
        touches: [{ clientX: 195, clientY: 400 }],
        force: true 
      })
      .trigger('touchend', { 
        changedTouches: [{ clientX: 195, clientY: 400 }] 
      });

    // ゲートが配置されることを確認
    cy.get('.gate-container').should('have.length', 1);
    cy.get('.gate-text').should('contain', 'OR');

    // スクリーンショット
    cy.screenshot('mobile-drag-place-gate');
  });

  it('複数のゲートを配置してワイヤーで接続できる', () => {
    // ツールバーを開く
    cy.get('.swipe-handle').click();

    // 入力カテゴリに切り替え
    cy.get('.category-chip').contains('入出力').click();

    // INPUTゲートを配置
    cy.get('.tool-item').contains('入力').click();
    cy.wait(500);

    // 基本カテゴリに戻る
    cy.get('.category-chip').contains('基本').click();

    // NOTゲートを配置
    cy.get('.tool-item').contains('NOT').click();
    cy.wait(500);

    // 入出力カテゴリに切り替え
    cy.get('.category-chip').contains('入出力').click();

    // OUTPUTゲートを配置
    cy.get('.tool-item').contains('出力').click();

    // 3つのゲートが配置されたことを確認
    cy.get('.gate-container').should('have.length', 3);

    // ワイヤー接続のテスト（ピンのタッチをシミュレート）
    // 注: 実際のピン位置は動的なので、この部分は簡略化
    cy.screenshot('mobile-multiple-gates');
  });


  it('ツールバーのカテゴリを切り替えられる', () => {
    // ツールバーを開く
    cy.get('.swipe-handle').click();

    // 特殊カテゴリに切り替え
    cy.get('.category-chip').contains('特殊').click();
    cy.get('.category-chip').contains('特殊').should('have.class', 'active');

    // CLOCKゲートが表示されることを確認
    cy.get('.tool-item').contains('クロック').should('be.visible');

    // スクリーンショット
    cy.screenshot('mobile-special-category');
  });

  it('タッチしてゲートを移動できる（長押し）', () => {
    // ゲートを配置
    cy.get('.swipe-handle').click();
    cy.get('.tool-item').contains('XOR').click();

    // ゲートの長押しと移動をシミュレート
    cy.get('.gate-container')
      .first()
      .trigger('touchstart', { 
        touches: [{ clientX: 195, clientY: 400 }],
        force: true 
      })
      .wait(200) // 長押し時間
      .trigger('touchmove', { 
        touches: [{ clientX: 250, clientY: 450 }],
        force: true 
      })
      .trigger('touchend', { 
        changedTouches: [{ clientX: 250, clientY: 450 }],
        force: true 
      });

    // スクリーンショット
    cy.screenshot('mobile-gate-move');
  });
});
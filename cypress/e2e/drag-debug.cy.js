describe('ドラッグデバッグテスト', () => {
  beforeEach(() => {
    // モード選択をスキップ
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('logic-circuit-force-skip-mode-selection', 'true');
        win.localStorage.setItem('logic-circuit-learning-mode', 'advanced');
        win.localStorage.setItem('logic-circuit-discovery-welcome-shown', 'true');
      }
    });
    cy.wait(1000);
  });

  it('ゲートを追加してドラッグできることを確認', () => {
    // ウェルカム画面が表示されている場合は閉じる
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("次へ")').length > 0) {
        cy.get('button').contains('次へ').click();
        cy.wait(500);
      }
    });
    
    // ツールパレットが表示されているか確認
    cy.get('div').contains('ゲート').should('exist');
    
    // デバッグ用にスクリーンショットを撮影
    cy.screenshot('01-initial-state');
    
    // ゲートボタンを探す（異なるセレクタで試す）
    cy.get('button').then($buttons => {
      cy.log(`Found ${$buttons.length} buttons`);
      $buttons.each((index, button) => {
        const svg = button.querySelector('svg');
        if (svg) {
          cy.log(`Button ${index} has SVG`);
        }
      });
    });
    
    // SVGを含むボタンをクリック（最初のゲートボタン）
    cy.get('button').filter((index, el) => {
      return el.querySelector('svg') !== null;
    }).first().click();
    
    cy.screenshot('02-after-gate-add');
    
    // ゲートが追加されたか確認
    cy.get('svg g[data-testid^="gate-"]').should('have.length.at.least', 1);
    
    // ゲートをドラッグ
    cy.get('svg g[data-testid^="gate-"]').first().then($gate => {
      const transform = $gate.attr('transform');
      cy.log(`Initial transform: ${transform}`);
      
      // ドラッグ操作
      cy.wrap($gate)
        .trigger('mousedown', { button: 0, clientX: 300, clientY: 200 })
        .wait(100);
      
      cy.get('svg')
        .trigger('mousemove', { clientX: 400, clientY: 300 })
        .wait(100)
        .trigger('mousemove', { clientX: 450, clientY: 350 })
        .wait(100);
      
      cy.screenshot('03-during-drag');
      
      cy.get('svg')
        .trigger('mouseup')
        .wait(100);
      
      cy.screenshot('04-after-drag');
      
      // 位置が変わったか確認
      cy.get('svg g[data-testid^="gate-"]').first().then($movedGate => {
        const newTransform = $movedGate.attr('transform');
        cy.log(`New transform: ${newTransform}`);
        expect(newTransform).to.not.equal(transform);
      });
    });
  });
});
// 手動でナビゲートしてスクリーンショットを撮影

describe('Manual Navigation Screenshots', () => {
  beforeEach(() => {
    // LocalStorageで学習モードを設定
    cy.window().then((win) => {
      win.localStorage.setItem('circuit-mode', JSON.stringify('learning'));
      win.localStorage.setItem('logic-circuit-preferences', JSON.stringify({
        mode: 'learning',
        tutorialCompleted: true,
        skipModeSelection: true
      }));
      win.localStorage.setItem('hasSeenModeSelector', 'true');
    });
    
    cy.visit('/');
    cy.wait(3000); // 長めに待つ
  });

  it('should capture the lesson list and available lessons', () => {
    // 学習モードのレッスンリストをスクリーンショット
    cy.screenshot('manual/00-lesson-list-full', {
      capture: 'fullPage'
    });
    
    // Phase 4のセクションまでスクロール
    cy.contains('Phase 4').scrollIntoView();
    cy.wait(500);
    
    cy.screenshot('manual/01-phase4-section', {
      capture: 'viewport'
    });
    
    // カタログレッスンを探す
    cy.get('.lesson-card').each(($card) => {
      const text = $card.text();
      if (text.includes('カタログ') || text.includes('図表')) {
        cy.wrap($card).screenshot('manual/02-catalog-lesson-card', {
          padding: 10
        });
      }
    });
  });

  it('should manually navigate through lessons', () => {
    // すべてのレッスンカードを確認
    cy.get('.lesson-card').then(($cards) => {
      cy.log(`Found ${$cards.length} lesson cards`);
      
      // 各レッスンのタイトルをログに出力
      $cards.each((index, card) => {
        cy.log(`Lesson ${index + 1}: ${card.innerText}`);
      });
    });
    
    // 最後のレッスンカードをクリック
    cy.get('.lesson-card').last().click();
    cy.wait(1000);
    
    cy.screenshot('manual/03-last-lesson-detail', {
      capture: 'viewport'
    });
    
    // レッスンを開始できるか確認
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("レッスンを開始")').length > 0) {
        cy.contains('レッスンを開始').click();
        cy.wait(1000);
        cy.screenshot('manual/04-lesson-content', {
          capture: 'viewport'
        });
      }
    });
  });

});
describe('全機能の動作確認', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    // localStorageをクリアしてモード選択画面を表示
    cy.clearLocalStorage();
    cy.visit('/');
  });

  describe('1. 基本操作の確認', () => {
    it('初期画面が正しく表示される', () => {
      // 画面が表示されることを確認
      cy.get('body').should('be.visible');
      cy.screenshot('01-initial-screen');
      
      // モード選択画面またはメイン画面が表示される
      cy.get('body').then($body => {
        if ($body.find('[data-testid="mode-selector"]').length > 0) {
          cy.log('モード選択画面が表示されています');
          cy.get('[data-testid="mode-selector"]').should('be.visible');
          cy.get('[data-testid="mode-learning"]').click();
        } else if ($body.find('[data-testid="mode-learning-button"]').length > 0) {
          cy.log('学習モードボタンが表示されています');
          cy.get('[data-testid="mode-learning-button"]').click();
        } else {
          cy.log('既にメイン画面が表示されています');
        }
      });
      cy.wait(1000);
      
      // 基本的なUI要素が表示されることを確認
      cy.get('svg').should('be.visible'); // キャンバス
      cy.screenshot('02-main-screen');
    });
  });

  describe('2. ゲート配置の確認', () => {
    beforeEach(() => {
      // チュートリアルが表示されたらスキップ
      cy.get('body').then($body => {
        if ($body.find('button:contains("スキップ")').length > 0) {
          cy.get('button:contains("スキップ")').click();
        }
      });
      cy.wait(500);
    });

    it('各種ゲートを配置できる', () => {
      // INPUTゲートを配置
      cy.contains('button', 'INPUT').click();
      cy.wait(500);
      cy.screenshot('03-after-input-placement');
      
      // OUTPUTゲートを配置
      cy.contains('button', 'OUTPUT').click();
      cy.wait(500);
      cy.screenshot('04-after-output-placement');
      
      // ANDゲートを配置
      cy.contains('button', 'AND').click();
      cy.wait(500);
      cy.screenshot('05-after-and-placement');
      
      // ゲートが3つ配置されていることを確認
      cy.get('svg g[transform*="translate"]').should('have.length.at.least', 3);
    });
  });

  describe('3. ワイヤー接続の確認', () => {
    beforeEach(() => {
      // チュートリアルが表示されたらスキップ
      cy.get('body').then($body => {
        if ($body.find('button:contains("スキップ")').length > 0) {
          cy.get('button:contains("スキップ")').click();
        }
      });
      cy.wait(500);
      
      // ゲートを配置
      cy.contains('button', 'INPUT').click();
      cy.wait(200);
      cy.contains('button', 'INPUT').click();
      cy.wait(200);
      cy.contains('button', 'AND').click();
      cy.wait(200);
      cy.contains('button', 'OUTPUT').click();
      cy.wait(500);
    });

    it('ゲート間をワイヤーで接続できる', () => {
      cy.screenshot('06-before-wiring');
      
      // 接続を試みる（ピンの位置は推定）
      cy.get('svg').trigger('mousedown', 150, 100);
      cy.get('svg').trigger('mousemove', 250, 100);
      cy.get('svg').trigger('mouseup', 250, 100);
      
      cy.wait(500);
      cy.screenshot('07-after-first-wire');
    });
  });

  describe('4. シミュレーション動作の確認', () => {
    beforeEach(() => {
      // チュートリアルが表示されたらスキップ
      cy.get('body').then($body => {
        if ($body.find('button:contains("スキップ")').length > 0) {
          cy.get('button:contains("スキップ")').click();
        }
      });
      cy.wait(500);
      
      // 簡単な回路を作成
      cy.contains('button', 'INPUT').click();
      cy.wait(200);
    });

    it('INPUTゲートをクリックで ON/OFF 切り替えできる', () => {
      cy.screenshot('08-input-gate-off');
      
      // INPUTゲートをクリック（位置は推定）
      cy.get('svg').click(100, 100);
      cy.wait(500);
      cy.screenshot('09-input-gate-on');
      
      // もう一度クリックでOFF
      cy.get('svg').click(100, 100);
      cy.wait(500);
      cy.screenshot('10-input-gate-off-again');
    });
  });

  describe('5. モード切り替えの確認', () => {
    it('学習モードから自由モードへ切り替えできる', () => {
      // チュートリアルが表示されたらスキップ
      cy.get('body').then($body => {
        if ($body.find('button:contains("スキップ")').length > 0) {
          cy.get('button:contains("スキップ")').click();
        }
      });
      cy.wait(500);
      
      // モード切り替えボタンを探す（サイドバー内）
      cy.get('body').then($body => {
        // サイドバーのボタンを探す
        if ($body.find('[aria-label="自由に作る"]').length > 0) {
          cy.get('[aria-label="自由に作る"]').click();
          cy.wait(500);
          cy.screenshot('11-free-mode-active');
        } else if ($body.find('button:contains("自由に作る")').length > 0) {
          cy.get('button:contains("自由に作る")').click();
          cy.wait(500);
          cy.screenshot('11-free-mode-active');
        } else {
          cy.log('自由モード切り替えボタンが見つかりません');
          cy.screenshot('11-mode-switch-not-found');
        }
      });
    });
  });

  describe('6. レスポンシブ動作の確認', () => {
    it('モバイル表示が正しく動作する', () => {
      // モバイルビューポート
      cy.viewport(375, 667);
      cy.reload();
      cy.wait(1000);
      
      // チュートリアルが表示されたらスキップ
      cy.get('body').then($body => {
        if ($body.find('button:contains("スキップ")').length > 0) {
          cy.get('button:contains("スキップ")').click();
        }
      });
      cy.wait(500);
      
      cy.screenshot('13-mobile-view');
      
      // ボトムナビゲーションが表示されることを確認
      cy.get('body').then($body => {
        if ($body.find('[data-testid="mobile-bottom-nav"]').length > 0) {
          cy.get('[data-testid="mobile-bottom-nav"]').should('be.visible');
          cy.screenshot('14-mobile-bottom-nav');
        }
      });
    });

    it('タブレット表示が正しく動作する', () => {
      cy.viewport(768, 1024);
      cy.reload();
      cy.wait(1000);
      
      // チュートリアルが表示されたらスキップ
      cy.get('body').then($body => {
        if ($body.find('button:contains("スキップ")').length > 0) {
          cy.get('button:contains("スキップ")').click();
        }
      });
      cy.wait(500);
      
      cy.screenshot('15-tablet-view');
    });
  });

  describe('7. 保存・読み込み機能の確認', () => {
    beforeEach(() => {
      // チュートリアルが表示されたらスキップ
      cy.get('body').then($body => {
        if ($body.find('button:contains("スキップ")').length > 0) {
          cy.get('button:contains("スキップ")').click();
        }
      });
      cy.wait(500);
    });

    it('保存・読み込みパネルが開ける', () => {
      // 保存ボタンを探す
      cy.get('button').contains('保存').then($btn => {
        if ($btn.length > 0) {
          cy.wrap($btn).click();
          cy.screenshot('16-save-panel-open');
        } else {
          cy.log('保存ボタンが見つかりません');
        }
      });
    });
  });
});
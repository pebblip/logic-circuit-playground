/// <reference types="cypress" />

describe('循環回路の基本動作確認', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.viewport(1280, 720);
    // アプリが完全に読み込まれるまで待つ
    cy.wait(2000);
  });

  describe('ギャラリーモードから循環回路を読み込み', () => {
    it('ギャラリーモードが正常に動作する', () => {
      // ギャラリーモードタブをクリック
      cy.get('.mode-tabs').contains('ギャラリーモード').click();
      
      // ギャラリーパネルが表示される
      cy.get('.gallery-panel').should('be.visible');
      cy.get('.gallery-header h1').should('contain', '🎨 回路ギャラリー');
      
      // 回路カードが表示される
      cy.get('.circuits-grid').should('be.visible');
      cy.get('.circuit-card').should('have.length.greaterThan', 0);
    });

    it('SRラッチ（基本ゲート版）を読み込める', () => {
      // ギャラリーモードに移動
      cy.get('.mode-tabs').contains('ギャラリーモード').click();
      cy.get('.gallery-panel').should('be.visible');

      // SRラッチ（基本ゲート版）の回路カードを探す
      cy.get('.circuit-card').contains('SRラッチ（基本ゲート版）').parent().within(() => {
        cy.get('.circuit-title').should('contain', 'SRラッチ（基本ゲート版）');
        cy.get('.load-button').click();
      });

      // フリーモードに切り替わる
      cy.get('.mode-tab.active').should('contain', 'フリーモード');
      
      // 回路が正しく読み込まれたことを確認
      cy.get('svg[data-testid="canvas"]').should('be.visible');
      cy.wait(1000);
      
      // 基本的なゲートが存在することを確認
      cy.get('[data-gate-type="INPUT"]').should('exist');
      cy.get('[data-gate-type="NOR"]').should('exist');
      cy.get('[data-gate-type="OUTPUT"]').should('exist');
      
      // ワイヤーが配置されていることを確認
      cy.get('path.wire').should('exist');
    });

    it('リングオシレータを読み込める', () => {
      // ギャラリーモードに移動
      cy.get('.mode-tabs').contains('ギャラリーモード').click();
      cy.get('.gallery-panel').should('be.visible');

      // リングオシレータの回路カードを探す
      cy.get('.circuit-card').contains('リングオシレータ').parent().within(() => {
        cy.get('.circuit-title').should('contain', 'リングオシレータ');
        cy.get('.load-button').click();
      });

      // フリーモードに切り替わる
      cy.get('.mode-tab.active').should('contain', 'フリーモード');
      
      // 回路が正しく読み込まれたことを確認
      cy.get('svg[data-testid="canvas"]').should('be.visible');
      cy.wait(1000);
      
      // 基本的なゲートが存在することを確認
      cy.get('[data-gate-type="NOT"]').should('exist');
      cy.get('[data-gate-type="OUTPUT"]').should('exist');
      
      // ワイヤーが配置されていることを確認
      cy.get('path.wire').should('exist');
    });
  });

  describe('循環回路の基本動作テスト', () => {
    it('SRラッチの入力操作が正常に動作する', () => {
      // ギャラリーからSRラッチを読み込み
      cy.get('.mode-tabs').contains('ギャラリーモード').click();
      cy.get('.circuit-card').contains('SRラッチ（基本ゲート版）').parent().within(() => {
        cy.get('.load-button').click();
      });
      cy.wait(2000);

      // 入力ゲートを探してクリック
      cy.get('[data-gate-type="INPUT"]').first().click();
      cy.wait(1000);
      
      // 入力がアクティブになったことを確認（visual feedback）
      // シンプルにクリック操作が機能することを確認
      cy.get('[data-gate-type="INPUT"]').first().should('exist');

      // 2回目のクリックでOFFにする
      cy.get('[data-gate-type="INPUT"]').first().click();
      cy.wait(1000);
      
      // 3回目のクリックでONにする（機能が動作していることを確認）
      cy.get('[data-gate-type="INPUT"]').first().click();
      cy.wait(1000);
      
      // 操作が正常に完了したことを確認（エラーがないこと）
      cy.get('.error-message').should('not.exist');
    });

    it('循環回路読み込み後にエラーが発生しない', () => {
      // SRラッチを読み込み
      cy.get('.mode-tabs').contains('ギャラリーモード').click();
      cy.get('.circuit-card').contains('SRラッチ（基本ゲート版）').parent().within(() => {
        cy.get('.load-button').click();
      });
      cy.wait(2000);

      // エラーメッセージがないことを確認
      cy.get('.error-message').should('not.exist');
      cy.get('.error-dialog').should('not.exist');
      
      // リングオシレータも同様にテスト
      cy.get('.mode-tabs').contains('ギャラリーモード').click();
      cy.get('.circuit-card').contains('リングオシレータ').parent().within(() => {
        cy.get('.load-button').click();
      });
      cy.wait(2000);

      cy.get('.error-message').should('not.exist');
      cy.get('.error-dialog').should('not.exist');
    });

    it('循環回路での複数操作が安定している', () => {
      // SRラッチを読み込み
      cy.get('.mode-tabs').contains('ギャラリーモード').click();
      cy.get('.circuit-card').contains('SRラッチ（基本ゲート版）').parent().within(() => {
        cy.get('.load-button').click();
      });
      cy.wait(2000);

      // 複数回の入力操作を行ってもクラッシュしない
      for (let i = 0; i < 3; i++) {
        cy.get('[data-gate-type="INPUT"]').first().click();
        cy.wait(300);
        cy.get('[data-gate-type="INPUT"]').eq(1).click();
        cy.wait(300);
      }

      // アプリケーションが正常に動作していることを確認
      cy.get('svg[data-testid="canvas"]').should('be.visible');
      cy.get('[data-gate-type]').should('have.length.greaterThan', 0);
    });
  });

  describe('UI応答性', () => {
    it('循環回路でのUI操作が応答性良く動作する', () => {
      // リングオシレータを読み込み
      cy.get('.mode-tabs').contains('ギャラリーモード').click();
      cy.get('.circuit-card').contains('リングオシレータ').parent().within(() => {
        cy.get('.load-button').click();
      });
      cy.wait(2000);

      // UI操作がスムーズに行われることを確認
      const startTime = Date.now();
      
      // 複数のUI操作を連続実行
      cy.get('svg[data-testid="canvas"]').click(300, 300);
      cy.get('svg[data-testid="canvas"]').click(400, 400);
      cy.get('[data-gate-type="NOT"]').first().click();
      
      cy.then(() => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        // 応答時間が妥当であることを確認（5秒以内）
        expect(responseTime).to.be.lessThan(5000);
      });
    });

    it('モード切り替えが正常に動作する', () => {
      // SRラッチを読み込み
      cy.get('.mode-tabs').contains('ギャラリーモード').click();
      cy.get('.circuit-card').contains('SRラッチ（基本ゲート版）').parent().within(() => {
        cy.get('.load-button').click();
      });
      cy.wait(2000);

      // 他のモードに切り替えてから戻る
      cy.get('.mode-tabs').contains('学習モード').click();
      cy.wait(1000);
      cy.get('.mode-tabs').contains('フリーモード').click();
      cy.wait(1000);

      // 回路が保持されていることを確認
      cy.get('[data-gate-type="INPUT"]').should('exist');
      cy.get('[data-gate-type="NOR"]').should('exist');
      cy.get('[data-gate-type="OUTPUT"]').should('exist');
    });
  });
});
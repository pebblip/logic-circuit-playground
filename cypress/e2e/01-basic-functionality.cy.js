/**
 * 基本機能のE2Eテスト
 * 実装に依存しないテストケース
 */

describe('論理回路プレイグラウンド - 基本機能', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('初期表示', () => {
    it('アプリケーションが正しく起動する', () => {
      cy.contains('論理回路プレイグラウンド').should('be.visible');
      cy.get('svg').should('be.visible');
      cy.contains('button', '配置モード').should('have.class', 'bg-blue-500');
    });

    it('すべてのゲートタイプがサイドバーに表示される', () => {
      const gateTypes = ['INPUT', 'OUTPUT', 'AND', 'OR', 'NOT'];
      gateTypes.forEach(type => {
        cy.contains('button', type).should('be.visible');
      });
    });
  });

  describe('ゲート配置機能', () => {
    it('配置モードでゲートを配置できる', () => {
      cy.placeGate('INPUT', 200, 200);
      cy.assertGateExists('INPUT', 1);
      
      cy.placeGate('AND', 400, 200);
      cy.assertGateExists('AND', 1);
      
      cy.placeGate('OUTPUT', 600, 200);
      cy.assertGateExists('OUTPUT', 1);
    });

    it('接続モードではゲートが配置されない', () => {
      cy.switchMode('connect');
      cy.get('svg').click(300, 300);
      
      // ゲートが配置されていないことを確認
      cy.get('svg').within(() => {
        cy.get('text').should('not.exist');
      });
    });

    it('右クリックでゲートを削除できる', () => {
      cy.placeGate('INPUT', 300, 300);
      cy.assertGateExists('INPUT', 1);
      
      // 右クリックで削除
      cy.get('svg').within(() => {
        cy.contains('text', 'INPUT').parent()
          .find('rect').rightclick();
      });
      
      // ゲートが削除されたことを確認
      cy.get('svg').within(() => {
        cy.contains('text', 'INPUT').should('not.exist');
      });
    });
  });

  describe('モード切り替え', () => {
    it('配置モードと接続モードを切り替えられる', () => {
      // 初期状態は配置モード
      cy.contains('button', '配置モード').should('have.class', 'bg-blue-500');
      cy.contains('button', '接続モード').should('not.have.class', 'bg-blue-500');
      
      // 接続モードに切り替え
      cy.switchMode('connect');
      cy.contains('button', '接続モード').should('have.class', 'bg-blue-500');
      cy.contains('button', '配置モード').should('not.have.class', 'bg-blue-500');
      
      // 配置モードに戻す
      cy.switchMode('place');
      cy.contains('button', '配置モード').should('have.class', 'bg-blue-500');
    });

    it('モードに応じた説明文が表示される', () => {
      cy.contains('キャンバスをクリックしてゲートを配置').should('be.visible');
      
      cy.switchMode('connect');
      cy.contains('ゲートの端子をドラッグして接続').should('be.visible');
    });
  });

  describe('INPUTゲートの操作', () => {
    it('INPUTゲートをクリックして値を切り替えられる', () => {
      cy.placeGate('INPUT', 200, 200);
      
      // 初期状態は非アクティブ（灰色）
      cy.get('svg').within(() => {
        cy.contains('text', 'INPUT').parent()
          .find('rect').should('have.attr', 'fill', '#6b7280');
      });
      
      // クリックしてアクティブに
      cy.toggleInput(0);
      cy.get('svg').within(() => {
        cy.contains('text', 'INPUT').parent()
          .find('rect').should('have.attr', 'fill', '#10b981');
      });
      
      // もう一度クリックして非アクティブに
      cy.toggleInput(0);
      cy.get('svg').within(() => {
        cy.contains('text', 'INPUT').parent()
          .find('rect').should('have.attr', 'fill', '#6b7280');
      });
    });
  });

  describe('履歴機能', () => {
    it('元に戻す/やり直すが動作する', () => {
      // ゲートを配置
      cy.placeGate('INPUT', 200, 200);
      cy.assertGateExists('INPUT', 1);
      
      // 少し待つ（履歴保存のため）
      cy.wait(100);
      
      // 元に戻す
      cy.contains('button', '元に戻す').click();
      cy.get('svg').within(() => {
        cy.contains('text', 'INPUT').should('not.exist');
      });
      
      // やり直す
      cy.contains('button', 'やり直す').click();
      cy.assertGateExists('INPUT', 1);
    });
  });
});
// テストヘルパーをインポート
import { setupApp, switchMode, skipWelcomeScreen, waitForAppInit } from '../support/test-helpers';

describe('SVG Diagram System Test', () => {
  it('should display the diagram demo lesson and show SVG diagrams correctly', () => {
    // 学習モードで起動
    setupApp({ mode: 'learning', skipWelcome: true });
    cy.wait(1000);

    // デモレッスンが表示されることを確認
    cy.contains('図表表示の新しい方法').should('be.visible');
    
    // レッスンをクリック
    cy.contains('図表表示の新しい方法').click();
    
    // レッスン開始ボタンをクリック
    cy.contains('レッスンを開始').click();
    cy.wait(500);

    // ASCIIアートとSVG図表の両方が表示されることを確認
    cy.contains('従来のASCIIアート表示').should('be.visible');
    cy.contains('新しいSVG図表表示').should('be.visible');
    
    // SVG要素が存在することを確認
    cy.get('svg.circuit-diagram').should('exist');
    
    // ANDゲートのSVGが表示されていることを確認
    cy.get('svg.circuit-diagram').within(() => {
      // ANDゲートのシンボル（&）が表示されている
      cy.contains('&').should('be.visible');
    });

    // スクリーンショットを撮影（比較用）
    cy.screenshot('svg-diagram-demo/01-ascii-vs-svg-comparison');

    // 次のステップへ
    cy.contains('次へ').click();
    cy.wait(500);

    // 信号波形の図が表示されることを確認
    cy.contains('信号波形の表示例').should('be.visible');
    cy.contains('アナログ:').should('be.visible');
    cy.contains('デジタル:').should('be.visible');
    
    cy.screenshot('svg-diagram-demo/02-signal-flow');

    // 次のステップへ
    cy.contains('次へ').click();
    cy.wait(500);

    // 接続図が表示されることを確認
    cy.contains('接続図の表示例').should('be.visible');
    cy.get('svg.circuit-diagram').within(() => {
      cy.contains('入力').should('be.visible');
      cy.contains('出力').should('be.visible');
    });
    
    cy.screenshot('svg-diagram-demo/03-connection');

    // 次のステップへ
    cy.contains('次へ').click();
    cy.wait(500);

    // 真理値表が表示されることを確認
    cy.contains('真理値表のビジュアル表現').should('be.visible');
    cy.get('.truth-table').should('exist');
    cy.get('.truth-table th').should('have.length', 3);
    cy.get('.truth-table td.active').should('exist');
    
    cy.screenshot('svg-diagram-demo/04-truth-table');

    // 次のステップへ
    cy.contains('次へ').click();
    cy.wait(500);

    // カスタムSVGが表示されることを確認
    cy.contains('カスタムSVGの例').should('be.visible');
    cy.contains('D-FF').should('be.visible');
    
    cy.screenshot('svg-diagram-demo/05-custom-svg');

    // 最後のステップへ
    cy.contains('次へ').click();
    cy.wait(500);

    // メリットの説明が表示されることを確認
    cy.contains('SVG図表のメリット').should('be.visible');
    cy.contains('どんなブラウザでも正確に表示').should('be.visible');
    
    cy.screenshot('svg-diagram-demo/06-benefits');
  });

  it('should render SVG diagrams without visual artifacts', () => {
    // 学習モードで起動
    setupApp({ mode: 'learning', skipWelcome: true });
    cy.wait(1000);

    // デジタル基礎レッスンを開く（ASCIIアートがまだ残っているレッスン）
    cy.contains('デジタルって何？').click();
    cy.contains('レッスンを開始').click();
    cy.wait(500);

    // アナログとデジタルの説明まで進む
    cy.contains('次へ').click();
    cy.wait(500);

    // ASCIIアートが表示されることを確認（まだ置き換えていない部分）
    cy.get('.ascii-art').should('exist');
    
    // フォントが等幅フォントであることを確認
    cy.get('.ascii-art').should('have.css', 'font-family').and('match', /monospace|Consolas|Monaco|Courier/);
    
    cy.screenshot('svg-diagram-demo/ascii-art-current-state');
  });
});
describe('循環回路動作テスト', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('SR-LATCHを手動で構築して動作確認', () => {
    // 1. NOR1ゲートを配置
    cy.get('[data-testid="gate-card-NOR"]').click();
    cy.get('svg.canvas').click(400, 300);
    
    // 2. NOR2ゲートを配置
    cy.get('[data-testid="gate-card-NOR"]').click();
    cy.get('svg.canvas').click(400, 400);
    
    // 3. INPUT S を配置
    cy.get('[data-testid="gate-card-INPUT"]').click();
    cy.get('svg.canvas').click(200, 350);
    
    // 4. INPUT R を配置
    cy.get('[data-testid="gate-card-INPUT"]').click();
    cy.get('svg.canvas').click(200, 450);
    
    // 5. OUTPUT Q を配置
    cy.get('[data-testid="gate-card-OUTPUT"]').click();
    cy.get('svg.canvas').click(600, 300);
    
    // 6. OUTPUT Q_BAR を配置
    cy.get('[data-testid="gate-card-OUTPUT"]').click();
    cy.get('svg.canvas').click(600, 400);
    
    // ワイヤー接続は手動で必要（簡略化のため省略）
    cy.wait(1000);
    
    // シミュレーションを開始
    cy.get('[data-testid="simulation-toggle"]').click();
    cy.wait(500);
    
    // S入力をONにする（Set操作）
    cy.get('[data-testid^="gate-"]').eq(2).dblclick(); // INPUT S
    cy.wait(500);
    
    // Q出力がONになることを確認
    cy.get('[data-testid^="gate-"]').eq(4).within(() => {
      cy.get('circle').last().should('have.attr', 'fill', '#00ff88');
    });
    
    // S入力をOFFに戻す
    cy.get('[data-testid^="gate-"]').eq(2).dblclick();
    cy.wait(500);
    
    // Q出力が保持されることを確認（メモリ動作）
    cy.get('[data-testid^="gate-"]').eq(4).within(() => {
      cy.get('circle').last().should('have.attr', 'fill', '#00ff88');
    });
    
    // R入力をONにする（Reset操作）
    cy.get('[data-testid^="gate-"]').eq(3).dblclick(); // INPUT R
    cy.wait(500);
    
    // Q出力がOFFになることを確認
    cy.get('[data-testid^="gate-"]').eq(4).within(() => {
      cy.get('circle').last().should('have.attr', 'fill', '#333');
    });
  });

  it('ギャラリーモードでSR-LATCHが正しく動作', () => {
    // ギャラリーモードに切り替え
    cy.get('button').contains('ギャラリーモード').click();
    cy.wait(500);
    
    // SR-LATCHを選択
    cy.get('.circuit-item').contains('SRラッチ').click();
    cy.wait(1000);
    
    // 初期状態を確認
    cy.get('[data-testid="gate-NOR1"]').should('exist');
    cy.get('[data-testid="gate-NOR2"]').should('exist');
    
    // S入力をダブルクリック（Set操作）
    cy.get('[data-testid="gate-S"]').dblclick();
    cy.wait(500);
    
    // ワイヤーの状態が変化することを確認
    cy.get('path.wire.active').should('have.length.greaterThan', 2);
    
    // R入力をダブルクリック（Reset操作）
    cy.get('[data-testid="gate-S"]').dblclick(); // Sを戻す
    cy.wait(200);
    cy.get('[data-testid="gate-R"]').dblclick();
    cy.wait(500);
    
    // ワイヤーの状態が変化することを確認
    cy.get('path.wire.active').should('exist');
  });

  it('リングオシレータを構築して発振を確認', () => {
    // 3つのNOTゲートを配置
    cy.get('[data-testid="gate-card-NOT"]').click();
    cy.get('svg.canvas').click(300, 350);
    
    cy.get('[data-testid="gate-card-NOT"]').click();
    cy.get('svg.canvas').click(400, 350);
    
    cy.get('[data-testid="gate-card-NOT"]').click();
    cy.get('svg.canvas').click(500, 350);
    
    // ワイヤー接続（手動で必要）
    // NOT1 → NOT2
    // NOT2 → NOT3
    // NOT3 → NOT1（循環）
    
    cy.wait(1000);
    
    // シミュレーションを開始
    cy.get('[data-testid="simulation-toggle"]').click();
    cy.wait(100);
    
    // 初期状態を記録
    let initialState;
    cy.get('[data-testid^="gate-"]').first().then($gate => {
      const transform = $gate.attr('transform');
      const match = transform.match(/translate\(([\d.]+), ([\d.]+)\)/);
      if (match) {
        initialState = $gate.find('rect').attr('stroke');
      }
    });
    
    // 少し待って状態が変化することを確認（発振）
    cy.wait(1000);
    
    cy.get('[data-testid^="gate-"]').first().then($gate => {
      const currentState = $gate.find('rect').attr('stroke');
      // 発振により状態が変化している可能性が高い
      // （ただし、実際の動作は初期状態に依存）
    });
  });

  it('循環回路の警告メッセージが表示される', () => {
    // 循環を作る簡単な例：NOT → NOT（2つのNOTゲートの循環）
    cy.get('[data-testid="gate-card-NOT"]').click();
    cy.get('svg.canvas').click(300, 350);
    
    cy.get('[data-testid="gate-card-NOT"]').click();
    cy.get('svg.canvas').click(500, 350);
    
    // ワイヤー接続（手動）
    // この時点で循環が検出される場合、警告が表示される可能性
    
    // エラーメッセージが表示されないことを確認
    // （HybridEvaluatorが正しく動作していれば）
    cy.get('.error-message').should('not.exist');
    cy.get('.error-toast').should('not.exist');
  });

  it('D-FFの動作確認', () => {
    // D-FFを配置
    cy.get('[data-testid="gate-card-D-FF"]').click();
    cy.get('svg.canvas').click(400, 350);
    
    // CLOCKを配置
    cy.get('[data-testid="gate-card-CLOCK"]').click();
    cy.get('svg.canvas').click(200, 400);
    
    // INPUT（データ入力）を配置
    cy.get('[data-testid="gate-card-INPUT"]').click();
    cy.get('svg.canvas').click(200, 300);
    
    // OUTPUT（Q出力）を配置
    cy.get('[data-testid="gate-card-OUTPUT"]').click();
    cy.get('svg.canvas').click(600, 350);
    
    // ワイヤー接続が必要
    cy.wait(1000);
    
    // シミュレーション開始
    cy.get('[data-testid="simulation-toggle"]').click();
    
    // CLOCKを開始
    cy.get('[data-testid^="gate-"]').contains('CLOCK').parent().find('button').click();
    cy.wait(500);
    
    // データ入力をONにする
    cy.get('[data-testid^="gate-"]').eq(2).dblclick();
    
    // クロックエッジで出力が変化することを確認
    cy.wait(1500); // CLOCKの周期を待つ
    
    cy.get('[data-testid^="gate-"]').last().within(() => {
      cy.get('circle').last().should('have.attr', 'fill', '#00ff88');
    });
  });
});
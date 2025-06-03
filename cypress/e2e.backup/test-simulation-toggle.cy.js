describe('シミュレーション切り替えテスト', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(1000);
  });

  it('CLOCKゲートのシミュレーション制御が動作する', () => {
    // CLOCKゲートを配置
    cy.get('[data-gate-type="CLOCK"]').click();
    cy.get('.canvas').click(400, 300);
    cy.wait(500);

    // OUTPUTゲートを配置
    cy.get('[data-gate-type="OUTPUT"]').click();
    cy.get('.canvas').click(600, 300);
    cy.wait(500);

    // CLOCKゲートの出力ピンをクリック
    cy.get('.canvas').click(455, 300);
    // OUTPUTゲートの入力ピンをクリック
    cy.get('.canvas').click(570, 300);
    cy.wait(500);

    // コンソールログを監視
    cy.window().then((win) => {
      cy.spy(win.console, 'log');
    });

    // シミュレーション開始
    cy.contains('button', '実行').click();
    cy.wait(1000);

    // コンソールログを確認
    cy.window().then((win) => {
      expect(win.console.log).to.have.been.calledWithMatch(/\[Header\] シミュレーションボタンクリック/);
      expect(win.console.log).to.have.been.calledWithMatch(/\[circuitStore\] toggleSimulation呼び出し/);
      expect(win.console.log).to.have.been.calledWithMatch(/\[circuitStore\] startSimulation実行開始/);
    });

    // CLOCKゲートが動作しているか確認（視覚的フィードバック）
    cy.get('[data-gate-id] circle[stroke="#00ff88"]').should('exist');

    // 2秒待って、CLOCKゲートの出力が変化しているか確認
    cy.wait(2000);

    // シミュレーション停止
    cy.contains('button', '停止').click();
    cy.wait(1000);

    // コンソールログを確認
    cy.window().then((win) => {
      expect(win.console.log).to.have.been.calledWithMatch(/\[circuitStore\] stopSimulation実行開始/);
    });

    // スクリーンショット
    cy.screenshot('simulation-toggle-result');
  });

  it('シミュレーション状態がUIに反映される', () => {
    // CLOCKゲートを配置
    cy.get('[data-gate-type="CLOCK"]').click();
    cy.get('.canvas').click(400, 300);

    // 初期状態：実行ボタンが表示される
    cy.contains('button', '実行').should('exist');
    cy.contains('button', '停止').should('not.exist');

    // シミュレーション開始
    cy.contains('button', '実行').click();

    // 停止ボタンに変わる
    cy.contains('button', '停止').should('exist');
    cy.contains('button', '実行').should('not.exist');

    // ボタンがアクティブ状態になる
    cy.get('button.primary.active').should('exist');

    // シミュレーション停止
    cy.contains('button', '停止').click();

    // 実行ボタンに戻る
    cy.contains('button', '実行').should('exist');
    cy.contains('button', '停止').should('not.exist');
  });
});
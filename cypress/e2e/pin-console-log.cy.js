describe('ピンのコンソールログ確認', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.clearLocalStorage();
    
    // コンソールログをキャプチャ
    cy.visit('/', {
      onBeforeLoad(win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
    
    // チュートリアルが表示されたらスキップ
    cy.get('body').then($body => {
      if ($body.find('button:contains("スキップ")').length > 0) {
        cy.get('button:contains("スキップ")').click();
      }
    });
    cy.wait(500);
  });

  it('INPUTゲート配置時のログを確認', () => {
    // INPUTゲートを配置
    cy.contains('button', 'INPUT').click();
    cy.wait(1000);
    
    // コンソールログを確認
    cy.get('@consoleLog').then((stub) => {
      const calls = stub.getCalls();
      console.log('Total console.log calls:', calls.length);
      
      // ピン関連のログを探す
      const pinLogs = calls.filter(call => {
        const args = call.args;
        return args.some(arg => 
          typeof arg === 'string' && 
          (arg.includes('pin') || arg.includes('Pin') || arg.includes('Rendering'))
        );
      });
      
      console.log('Pin-related logs:', pinLogs.length);
      
      pinLogs.forEach((call, index) => {
        console.log(`Log ${index}:`, ...call.args);
      });
      
      // デバッグ用ログも確認
      const debugLogs = calls.filter(call => {
        const args = call.args;
        return args.some(arg => 
          typeof arg === 'string' && arg.includes('Debug')
        );
      });
      
      debugLogs.forEach((call) => {
        console.log('Debug log:', ...call.args);
      });
    });
    
    // ViewModelの状態も確認
    cy.window().then((win) => {
      const gates = win.debugGates;
      if (gates && gates.length > 0) {
        console.log('First gate data:', gates[0]);
      }
    });
    
    cy.screenshot('console-log-check');
  });
});
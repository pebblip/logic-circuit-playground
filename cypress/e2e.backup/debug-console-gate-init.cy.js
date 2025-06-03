describe('Debug: Gate Initialization', () => {
  it('should capture gate initialization logs', () => {
    // コンソールログをキャプチャ
    const logs = [];
    cy.on('window:before:load', (win) => {
      const originalLog = win.console.log;
      win.console.log = (...args) => {
        logs.push(args.join(' '));
        originalLog.apply(win.console, args);
      };
    });
    
    cy.visit('/');
    cy.wait(1000);
    
    // INPUTゲートを追加
    cy.get('button').contains('INPUT').click();
    cy.wait(1000);
    
    // OUTPUTゲートを追加  
    cy.get('button').contains('OUTPUT').click();
    cy.wait(1000);
    
    // ログ出力
    cy.then(() => {
      cy.log('=== Gate Initialization Logs ===');
      const gateInitLogs = logs.filter(log => 
        log.includes('BaseGate') || 
        log.includes('InputGate') || 
        log.includes('OutputGate') ||
        log.includes('Initializing pins')
      );
      
      if (gateInitLogs.length === 0) {
        cy.log('No gate initialization logs found!');
        cy.log('All logs:', logs);
      } else {
        gateInitLogs.forEach((log, index) => {
          cy.log(`${index}: ${log}`);
        });
      }
    });
    
    // SVG構造も確認
    cy.get('svg').then($svg => {
      const gates = $svg.find('g[transform]');
      cy.log(`Found ${gates.length} gates in SVG`);
      
      gates.each((index, gate) => {
        const $gate = Cypress.$(gate);
        const pinGroups = $gate.find('.pin-group');
        const circles = $gate.find('circle');
        cy.log(`Gate ${index}: pin-groups=${pinGroups.length}, circles=${circles.length}`);
      });
    });
    
    // スクリーンショット
    cy.screenshot('debug-gate-initialization');
  });
});
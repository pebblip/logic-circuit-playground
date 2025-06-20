describe('Debug Chaos Generator', () => {
  it('should capture console logs for chaos generator', () => {
    // コンソールログをキャプチャ
    const logs: string[] = [];
    
    cy.on('window:before:load', (win) => {
      // オリジナルのconsole.logを保存
      const originalLog = win.console.log;
      
      // console.logをオーバーライド
      win.console.log = (...args) => {
        logs.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' '));
        originalLog.apply(win.console, args);
      };
    });
    
    // アプリケーションを開く
    cy.visit('/');
    
    // ギャラリーモードに切り替え
    cy.contains('button', 'ギャラリーモード').click();
    
    // カオス発生器を選択
    cy.contains('🌀 カオス発生器').click();
    
    // アニメーションが数サイクル実行されるのを待つ
    cy.wait(3000);
    
    // ログを出力
    cy.then(() => {
      console.log('=== CAPTURED LOGS ===');
      logs.forEach(log => console.log(log));
      
      // 重要なログのみフィルタリング
      const importantLogs = logs.filter(log => 
        log.includes('[CircuitEval]') || 
        log.includes('[CLOCK') ||
        log.includes('Evaluation order') ||
        log.includes('circular dependencies') ||
        log.includes('[EnhancedHybridEvaluator]')
      );
      
      console.log('=== IMPORTANT LOGS ===');
      importantLogs.forEach(log => console.log(log));
      
      // CLOCKが評価されているかチェック
      const clockEvalLogs = logs.filter(log => log.includes('[CircuitEval] Evaluating clock'));
      
      // ログをファイルに保存（デバッグ用）
      cy.writeFile('cypress/logs/chaos-generator-debug.log', logs.join('\n'));
      cy.writeFile('cypress/logs/chaos-generator-important.log', importantLogs.join('\n'));
      
      // CLOCKが評価されていない場合、評価順序を確認
      if (clockEvalLogs.length === 0) {
        const evaluationOrderLogs = logs.filter(log => log.includes('Evaluation order:'));
        console.log('=== EVALUATION ORDER LOGS ===');
        evaluationOrderLogs.forEach(log => console.log(log));
        
        const circularLogs = logs.filter(log => log.includes('circular dependencies'));
        console.log('=== CIRCULAR DEPENDENCY LOGS ===');
        circularLogs.forEach(log => console.log(log));
      }
      
      // CLOCKが評価されているかのアサーションは一旦コメントアウト
      // expect(clockEvalLogs.length, 'CLOCK should be evaluated').to.be.greaterThan(0);
    });
  });
});
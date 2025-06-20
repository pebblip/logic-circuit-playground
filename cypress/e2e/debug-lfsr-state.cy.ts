describe('LFSRの状態遷移デバッグ', () => {
  it('カオス発生器の出力状態を詳細に追跡', () => {
    const logs: string[] = [];
    let cycleCount = 0;
    
    // コンソールログをキャプチャ
    cy.on('window:before:load', (win) => {
      const originalLog = win.console.log;
      win.console.log = (...args) => {
        const message = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ');
        
        // D-FFの状態変化を追跡
        if (message.includes('dff') && message.includes('evaluated output')) {
          logs.push(`[Cycle ${cycleCount}] ${message}`);
        }
        // CLOCKの変化も追跡
        if (message.includes('CLOCK') && message.includes('OUTPUT CHANGE')) {
          cycleCount++;
          logs.push(`\n=== Cycle ${cycleCount} Started ===`);
        }
        // XORフィードバックの状態
        if (message.includes('xor_feedback') && message.includes('evaluated output')) {
          logs.push(`[Cycle ${cycleCount}] ${message}`);
        }
        
        originalLog.apply(win.console, args);
      };
    });
    
    cy.visit('/');
    cy.wait(2000);
    
    // ギャラリーモードに切り替え
    cy.get('[data-testid="mode-gallery"]').click();
    cy.wait(500);
    
    // カオス発生器を選択
    cy.get('[data-testid="circuit-preview-chaos-generator"]').click();
    cy.wait(5000); // 5秒間実行
    
    // ログを保存
    cy.writeFile('cypress/logs/lfsr-state-transitions.log', logs.join('\n'));
    
    // LFSRのパターンを分析
    cy.readFile('cypress/logs/lfsr-state-transitions.log').then((content) => {
      const lines = content.split('\n');
      const dff1States: boolean[] = [];
      const dff2States: boolean[] = [];
      const dff3States: boolean[] = [];
      const dff4States: boolean[] = [];
      
      lines.forEach((line: string) => {
        if (line.includes('dff1') && line.includes('evaluated output=')) {
          const match = line.match(/evaluated output=(\w+)/);
          if (match) {
            dff1States.push(match[1] === 'true');
          }
        }
        if (line.includes('dff2') && line.includes('evaluated output=')) {
          const match = line.match(/evaluated output=(\w+)/);
          if (match) {
            dff2States.push(match[1] === 'true');
          }
        }
        if (line.includes('dff3') && line.includes('evaluated output=')) {
          const match = line.match(/evaluated output=(\w+)/);
          if (match) {
            dff3States.push(match[1] === 'true');
          }
        }
        if (line.includes('dff4') && line.includes('evaluated output=')) {
          const match = line.match(/evaluated output=(\w+)/);
          if (match) {
            dff4States.push(match[1] === 'true');
          }
        }
      });
      
      // 状態遷移のサマリー
      const summary = [
        '\n=== LFSR State Analysis ===',
        `Total cycles captured: ${cycleCount}`,
        `DFF1 (out_bit3) states: ${dff1States.map(s => s ? '1' : '0').join('')}`,
        `DFF2 (out_bit2) states: ${dff2States.map(s => s ? '1' : '0').join('')}`,
        `DFF3 (out_bit1) states: ${dff3States.map(s => s ? '1' : '0').join('')}`,
        `DFF4 (out_bit0) states: ${dff4States.map(s => s ? '1' : '0').join('')}`,
        '',
        `DFF1 true count: ${dff1States.filter(s => s).length}/${dff1States.length}`,
        `DFF2 true count: ${dff2States.filter(s => s).length}/${dff2States.length}`,
        `DFF3 true count: ${dff3States.filter(s => s).length}/${dff3States.length}`,
        `DFF4 true count: ${dff4States.filter(s => s).length}/${dff4States.length}`,
      ];
      
      cy.writeFile('cypress/logs/lfsr-analysis.log', [...logs, ...summary].join('\n'));
    });
  });
});
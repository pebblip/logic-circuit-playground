describe('直接イベント発火テスト', () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem('logic-circuit-force-skip-mode-selection', 'true');
      win.localStorage.setItem('logic-circuit-learning-mode', 'advanced');
    });
  });

  it('ピンのイベントを直接発火', () => {
    cy.visit('/');
    cy.wait(1000);
    
    // INPUTゲートを追加
    cy.contains('button', 'INPUT').click();
    cy.wait(500);
    
    // OUTPUTゲートを追加  
    cy.contains('button', 'OUTPUT').click();
    cy.wait(500);
    
    // コンソールログを監視
    cy.window().then((win) => {
      // 元のconsole.logを保存
      const originalLog = win.console.log;
      const logs = [];
      
      // console.logをオーバーライド
      win.console.log = (...args) => {
        originalLog.apply(win.console, args);
        logs.push(args.join(' '));
      };
      
      // SVG内で操作
      cy.get('svg').then($svg => {
        const svg = $svg[0];
        
        // r="12"のcircleを全て取得
        const circles = svg.querySelectorAll('circle[r="12"]');
        cy.log(`Found ${circles.length} circles with r="12"`);
        
        if (circles.length >= 2) {
          // 最初のピン（出力）でmousedownイベントを直接発火
          const outputPin = circles[0];
          const mouseDownEvent = new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            view: win,
            button: 0,
            clientX: 100,
            clientY: 100
          });
          
          cy.log('Dispatching mousedown on output pin');
          outputPin.dispatchEvent(mouseDownEvent);
          
          // 少し待機
          cy.wait(100).then(() => {
            // ログを確認
            cy.log('Logs after mousedown:');
            logs.forEach(log => cy.log(log));
            
            // mouseenterイベントを2番目のピンで発火
            const inputPin = circles[1];
            const mouseEnterEvent = new MouseEvent('mouseenter', {
              bubbles: true,
              cancelable: true,
              view: win
            });
            
            cy.log('Dispatching mouseenter on input pin');
            inputPin.dispatchEvent(mouseEnterEvent);
            
            cy.wait(100).then(() => {
              // SVGでmouseupイベントを発火
              const mouseUpEvent = new MouseEvent('mouseup', {
                bubbles: true,
                cancelable: true,
                view: win,
                button: 0
              });
              
              cy.log('Dispatching mouseup on SVG');
              svg.dispatchEvent(mouseUpEvent);
              
              cy.wait(100).then(() => {
                // 最終的なログを確認
                cy.log('All logs:');
                logs.forEach(log => cy.log(log));
                
                // 接続が作成されたか確認
                const paths = svg.querySelectorAll('path');
                cy.log(`Found ${paths.length} paths`);
              });
            });
          });
        } else {
          cy.log('ERROR: Not enough pins found!');
        }
      });
    });
    
    cy.screenshot('direct-event-result');
  });
});
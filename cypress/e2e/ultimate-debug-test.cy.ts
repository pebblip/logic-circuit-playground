/**
 * 🔥 究極のデバッグテスト
 * 
 * 1. 視覚的デバッグログボックス（スクリーンショット可能）
 * 2. 正しいCypressコンソールログ取得
 * 3. 両方の方法で確実にデバッグ情報を取得
 */

describe('究極のデバッグテスト', () => {
  let consoleLogsCapture: string[] = [];

  beforeEach(() => {
    consoleLogsCapture = [];
    
    // 正しいCypressコンソールログ取得方法
    cy.visit('http://localhost:5176/', {
      onBeforeLoad: (win) => {
        // 元のconsole.logを保存
        const originalLog = win.console.log;
        const originalError = win.console.error;
        const originalWarn = win.console.warn;
        
        // コンソールログをインターセプト
        win.console.log = (...args) => {
          const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(' ');
          consoleLogsCapture.push(`LOG: ${message}`);
          originalLog.apply(win.console, args);
        };
        
        win.console.error = (...args) => {
          const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(' ');
          consoleLogsCapture.push(`ERROR: ${message}`);
          originalError.apply(win.console, args);
        };
        
        win.console.warn = (...args) => {
          const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(' ');
          consoleLogsCapture.push(`WARN: ${message}`);
          originalWarn.apply(win.console, args);
        };
      }
    });
  });

  it('🔍 視覚的デバッグログボックスで問題を特定', () => {
    // ギャラリーモードに移行
    cy.contains('ギャラリーモード').click();
    cy.wait(1000);
    
    // カオス発生器を選択
    cy.contains('カオス発生器').click();
    cy.wait(2000);
    
    // デバッグログボックスが表示されることを確認
    cy.get('[data-testid="debug-log-display"]').should('be.visible');
    
    // 初期状態のスクリーンショット（ログボックス付き）
    cy.screenshot('debug-log-initial-state');
    
    // 5秒待機してログの蓄積を確認
    cy.wait(5000);
    
    // ログエントリが存在することを確認
    cy.get('[data-testid="debug-log-container"]').within(() => {
      cy.get('[data-testid^="debug-log-entry-"]').should('have.length.greaterThan', 0);
    });
    
    // 最終状態のスクリーンショット（ログボックス付き）
    cy.screenshot('debug-log-final-state');
    
    // ログの内容を分析
    cy.get('[data-testid="debug-log-container"]').then($container => {
      const logEntries = $container.find('[data-testid^="debug-log-entry-"]');
      console.log('📋 視覚的デバッグログ分析:');
      console.log('  ログエントリ数:', logEntries.length);
      
      // 各ログエントリの内容を出力
      logEntries.each((index, element) => {
        const message = Cypress.$(element).find('.debug-log-message').text();
        const level = Cypress.$(element).find('.debug-log-level').text();
        console.log(`  ${index + 1}: [${level}] ${message}`);
      });
    });
  });

  it('📝 Cypressコンソールログキャプチャで詳細分析', () => {
    cy.contains('ギャラリーモード').click();
    cy.wait(500);
    cy.contains('カオス発生器').click();
    cy.wait(3000); // 十分な時間を待機
    
    // キャプチャしたログを分析
    cy.then(() => {
      console.log('=== Cypressキャプチャログ分析 ===');
      console.log('総ログ数:', consoleLogsCapture.length);
      
      // Gallery Animation関連のログを抽出
      const galleryLogs = consoleLogsCapture.filter(log => 
        log.includes('Gallery Animation') || log.includes('自動アニメーション')
      );
      
      console.log('Gallery Animation関連ログ数:', galleryLogs.length);
      
      if (galleryLogs.length > 0) {
        console.log('Gallery Animation関連ログ:');
        galleryLogs.forEach((log, index) => {
          console.log(`  ${index + 1}: ${log}`);
        });
      } else {
        console.log('❌ Gallery Animationログが見つかりません');
      }
      
      // 条件チェック関連のログを抽出
      const conditionLogs = consoleLogsCapture.filter(log => 
        log.includes('条件チェック') || log.includes('autoSimulation')
      );
      
      console.log('条件チェック関連ログ数:', conditionLogs.length);
      conditionLogs.forEach((log, index) => {
        console.log(`  条件${index + 1}: ${log}`);
      });
      
      // エラーログを抽出
      const errorLogs = consoleLogsCapture.filter(log => log.startsWith('ERROR:'));
      console.log('エラーログ数:', errorLogs.length);
      errorLogs.forEach((log, index) => {
        console.log(`  エラー${index + 1}: ${log}`);
      });
    });
  });

  it('🔬 手動でデバッグ情報を強制出力', () => {
    cy.contains('ギャラリーモード').click();
    cy.contains('カオス発生器').click();
    cy.wait(1000);
    
    // ブラウザのwindowオブジェクトに直接アクセスして強制デバッグ
    cy.window().then((win) => {
      // カスタムデバッグ関数を実行
      if ((win as any).debugLog) {
        (win as any).debugLog('info', '🔬 手動デバッグ開始', {
          timestamp: Date.now(),
          test: 'ultimate-debug-test'
        });
        
        (win as any).debugLog('warn', '強制デバッグ情報出力中', {
          location: 'Cypress test',
          action: '手動実行'
        });
      } else {
        console.log('❌ debugLog関数が利用できません');
      }
      
      // 強制的にアニメーション実行をトリガー
      const event = new win.CustomEvent('forceDebugAnimation', {
        detail: { force: true, test: true }
      });
      win.document.dispatchEvent(event);
    });
    
    cy.wait(2000);
    cy.screenshot('manual-debug-output');
  });

  it('🎯 問題の根本原因を特定', () => {
    cy.contains('ギャラリーモード').click();
    cy.contains('カオス発生器').click();
    cy.wait(3000);
    
    // すべての情報を統合して分析
    cy.then(() => {
      console.log('=== 🎯 根本原因分析 ===');
      
      // 1. アニメーション開始ログがあるか
      const animationStartLogs = consoleLogsCapture.filter(log => 
        log.includes('アニメーション開始') || log.includes('startAnimation')
      );
      
      if (animationStartLogs.length === 0) {
        console.log('❌ 問題: アニメーションが全く開始されていない');
        console.log('   原因候補: autoSimulation設定、galleryCircuit設定、useEffect条件');
      } else {
        console.log('✅ アニメーションは開始されている');
        console.log('   開始回数:', animationStartLogs.length);
      }
      
      // 2. 評価ログがあるか
      const evaluationLogs = consoleLogsCapture.filter(log => 
        log.includes('評価実行') || log.includes('evaluation')
      );
      
      if (evaluationLogs.length === 0) {
        console.log('❌ 問題: 回路評価が実行されていない');
        console.log('   原因候補: evaluatorRef、localGatesRef、回路データ');
      } else {
        console.log('✅ 回路評価は実行されている');
      }
      
      // 3. 状態変化ログがあるか  
      const stateChangeLogs = consoleLogsCapture.filter(log => 
        log.includes('状態変化') || log.includes('hasChanges')
      );
      
      if (stateChangeLogs.length === 0) {
        console.log('❌ 問題: 状態変化が検出されていない');
        console.log('   原因候補: D-FF評価、時刻管理、二段階評価');
      } else {
        console.log('✅ 状態変化検出機能は動作している');
      }
      
      console.log('=== 解決策提案 ===');
      if (animationStartLogs.length === 0) {
        console.log('1. GalleryModeLayoutの設定を確認');
        console.log('2. useUnifiedCanvasのuseEffect条件を確認');
      } else if (evaluationLogs.length === 0) {
        console.log('1. EnhancedHybridEvaluatorの初期化を確認');
        console.log('2. 回路データの構造を確認');
      } else {
        console.log('1. D-FF評価ロジックを確認');
        console.log('2. CLOCKゲートのstartTime管理を確認');
      }
    });
    
    // 最終分析スクリーンショット
    cy.screenshot('root-cause-analysis-final');
  });
})
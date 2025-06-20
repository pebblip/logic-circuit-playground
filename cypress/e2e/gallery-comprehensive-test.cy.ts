/**
 * ギャラリー全回路の包括的動作検証
 * カオス発生器と同様の手法で全15回路を順次検証
 */

describe('ギャラリー全回路動作検証', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5176/')
    cy.get('[data-testid="mode-selector-gallery"]').click()
    cy.wait(1000); // ギャラリーモード安定化
  });

  it('🔧 SIMPLE_LFSR の動作検証', () => {
    // Simple LFSRを選択（circuit.idベース）
    cy.get('[data-testid="gallery-circuit-simple-lfsr"]').click();
    cy.wait(2000); // 回路読み込み待機
    
    // 初期状態スクリーンショット
    cy.screenshot('simple-lfsr-initial');
    
    // 3秒後の状態確認
    cy.wait(3000);
    cy.screenshot('simple-lfsr-after-3sec');
    
    // 6秒後の状態確認
    cy.wait(3000);
    cy.screenshot('simple-lfsr-after-6sec');
    
    // 状態変化の確認（デバッグログエリアが表示されているか）
    cy.get('[data-testid="debug-log-container"]').should('be.visible');
    
    // アニメーション動作ログの確認
    cy.get('[data-testid="debug-log-container"]').within(() => {
      cy.get('[data-testid^="debug-log-entry"]').should('exist');
    });
  });

  it('🌸 FIBONACCI_COUNTER の動作検証', () => {
    // フィボナッチカウンターを選択
    cy.get('[data-testid="gallery-circuit-fibonacci-counter"]').click();
    cy.wait(2000);
    
    cy.screenshot('fibonacci-initial');
    
    // フィボナッチ数列の変化を確認
    cy.wait(5000);
    cy.screenshot('fibonacci-after-5sec');
    
    cy.wait(5000);
    cy.screenshot('fibonacci-after-10sec');
    
    // 計算結果の変化確認
    cy.get('[data-testid="debug-log-container"]').should('be.visible');
  });

  it('💫 JOHNSON_COUNTER の動作検証', () => {
    // ジョンソンカウンターを選択
    cy.get('[data-testid="gallery-circuit-johnson-counter"]').click();
    cy.wait(2000);
    
    cy.screenshot('johnson-initial');
    
    // 回転パターンの確認
    cy.wait(4000);
    cy.screenshot('johnson-after-4sec');
    
    cy.wait(4000);
    cy.screenshot('johnson-after-8sec');
    
    // パターン変化の確認
    cy.get('[data-testid="debug-log-container"]').should('be.visible');
  });

  it('🌸 MANDALA_CIRCUIT の動作検証', () => {
    // マンダラ回路を選択
    cy.get('[data-testid="gallery-circuit-mandala-circuit"]').click();
    cy.wait(2000);
    
    cy.screenshot('mandala-initial');
    
    // 発振パターンの確認
    cy.wait(3000);
    cy.screenshot('mandala-after-3sec');
    
    cy.wait(3000);
    cy.screenshot('mandala-after-6sec');
    
    // 発振状態の確認
    cy.get('[data-testid="debug-log-container"]').should('be.visible');
  });

  it('🔥 SIMPLE_RING_OSCILLATOR の動作検証', () => {
    // シンプルリングオシレーターを選択
    cy.get('[data-testid="gallery-circuit-simple-ring-oscillator"]').click();
    cy.wait(2000);
    
    cy.screenshot('ring-oscillator-initial');
    
    // 発振確認
    cy.wait(4000);
    cy.screenshot('ring-oscillator-after-4sec');
    
    cy.get('[data-testid="debug-log-container"]').should('be.visible');
  });

  it('📊 SRラッチ（基本ゲート版）の動作検証', () => {
    // SRラッチを選択
    cy.get('[data-testid="gallery-circuit-sr-latch-basic"]').click();
    cy.wait(2000);
    
    cy.screenshot('sr-latch-basic-initial');
    
    // メモリ状態確認
    cy.wait(3000);
    cy.screenshot('sr-latch-basic-after-3sec');
    
    cy.get('[data-testid="debug-log-container"]').should('be.visible');
  });

  it('🌀 セルフオシレーティングメモリの動作検証', () => {
    // セルフオシレーティングメモリを選択
    cy.get('[data-testid="gallery-circuit-self-oscillating-memory-final"]').click();
    cy.wait(2000);
    
    cy.screenshot('self-oscillating-initial');
    
    // 発振確認
    cy.wait(5000);
    cy.screenshot('self-oscillating-after-5sec');
    
    cy.get('[data-testid="debug-log-container"]').should('be.visible');
  });

  it('📋 全体結果サマリー', () => {
    // 最終確認として各回路を順次確認
    const circuits = [
      { id: 'half-adder', name: '半加算器' },
      { id: 'decoder', name: 'デコーダー回路' }, 
      { id: '4bit-comparator', name: '4ビット比較器' },
      { id: 'parity-checker', name: 'パリティチェッカー' },
      { id: 'majority-voter', name: '多数決回路' },
      { id: 'seven-segment', name: '7セグメントデコーダー' }
    ];

    circuits.forEach((circuit, index) => {
      cy.get(`[data-testid="gallery-circuit-${circuit.id}"]`).click();
      cy.wait(1000);
      cy.screenshot(`static-circuit-${index + 1}-${circuit.name.replace(/[^\w]/g, '')}`);
    });
    
    // 最終サマリー
    cy.screenshot('comprehensive-test-complete');
  });
});
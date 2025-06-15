/**
 * ピン状態表示バグの調査用E2Eテスト
 * 
 * 問題: ANDゲートの入力ピンの状態（色）が適切に切り替わらないケースがある
 * - スクリーンショットで確認された問題：ANDゲートの下の入力ピンが緑色（アクティブ）になっているが、接続元はOFF
 */

describe('ピン状態表示バグの調査', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(500); // アプリケーションの初期化を待つ
  });

  describe('初期状態の確認', () => {
    it('新しく配置したANDゲートの入力ピンは両方とも非アクティブ（グレー）で表示される', () => {
      // ANDゲートを配置
      cy.get('[data-testid="gate-AND"]').click();
      cy.get('[data-testid="canvas"]').click(300, 200);
      
      // 入力ピンの状態を確認（両方とも非アクティブ）
      cy.get('g').contains('AND').parent().within(() => {
        // 入力ピン（左側）を確認
        cy.get('circle.input-pin').should('have.length', 2);
        cy.get('circle.input-pin').each(($pin) => {
          // fill属性がnoneまたは透明（非アクティブ状態）
          cy.wrap($pin).should('have.attr', 'fill', 'none');
          cy.wrap($pin).should('not.have.class', 'active');
        });
      });
    });
  });

  describe('ワイヤー接続時の動作確認', () => {
    it('INPUTゲート（OFF）をANDゲートに接続した場合、入力ピンは非アクティブのまま', () => {
      // INPUTゲートを配置
      cy.get('[data-testid="gate-INPUT"]').click();
      cy.get('[data-testid="canvas"]').click(100, 200);
      
      // ANDゲートを配置
      cy.get('[data-testid="gate-AND"]').click();
      cy.get('[data-testid="canvas"]').click(300, 200);
      
      // INPUTがOFFであることを確認
      cy.get('g').contains('INPUT').parent().within(() => {
        cy.get('rect').should('not.have.class', 'active');
      });
      
      // ワイヤーで接続（INPUTの出力 -> ANDの下の入力）
      // INPUTの出力ピンをクリック
      cy.get('g').contains('INPUT').parent().within(() => {
        cy.get('circle.output-pin').click();
      });
      
      // ANDの下の入力ピンをクリック
      cy.get('g').contains('AND').parent().within(() => {
        cy.get('circle.input-pin').eq(1).click(); // 下の入力ピン
      });
      
      // 接続後、ANDゲートの下の入力ピンが非アクティブであることを確認
      cy.get('g').contains('AND').parent().within(() => {
        cy.get('circle.input-pin').eq(1).should('have.attr', 'fill', 'none');
        cy.get('circle.input-pin').eq(1).should('not.have.class', 'active');
      });
      
      // スクリーンショットを撮影（デバッグ用）
      cy.screenshot('and-gate-with-off-input');
    });

    it('INPUTゲート（ON）をANDゲートに接続した場合、入力ピンはアクティブになる', () => {
      // INPUTゲートを配置
      cy.get('[data-testid="gate-INPUT"]').click();
      cy.get('[data-testid="canvas"]').click(100, 200);
      
      // INPUTをONに設定
      cy.get('g').contains('INPUT').click();
      cy.wait(100);
      
      // INPUTがONになったことを確認
      cy.get('g').contains('INPUT').parent().within(() => {
        cy.get('rect').should('have.class', 'active');
      });
      
      // ANDゲートを配置
      cy.get('[data-testid="gate-AND"]').click();
      cy.get('[data-testid="canvas"]').click(300, 200);
      
      // ワイヤーで接続
      cy.get('g').contains('INPUT').parent().within(() => {
        cy.get('circle.output-pin').click();
      });
      
      cy.get('g').contains('AND').parent().within(() => {
        cy.get('circle.input-pin').eq(1).click();
      });
      
      // 接続後、ANDゲートの下の入力ピンがアクティブであることを確認
      cy.get('g').contains('AND').parent().within(() => {
        cy.get('circle.input-pin').eq(1).should('have.attr', 'fill', '#00ff88');
        cy.get('circle.input-pin').eq(1).should('have.class', 'active');
      });
      
      cy.screenshot('and-gate-with-on-input');
    });
  });

  describe('動的な状態変更のテスト', () => {
    it('接続後にINPUTゲートの状態を変更すると、ANDゲートの入力ピンの表示も更新される', () => {
      // セットアップ：INPUT（OFF）とANDを接続
      cy.get('[data-testid="gate-INPUT"]').click();
      cy.get('[data-testid="canvas"]').click(100, 200);
      
      cy.get('[data-testid="gate-AND"]').click();
      cy.get('[data-testid="canvas"]').click(300, 200);
      
      // 接続
      cy.get('g').contains('INPUT').parent().within(() => {
        cy.get('circle.output-pin').click();
      });
      cy.get('g').contains('AND').parent().within(() => {
        cy.get('circle.input-pin').eq(1).click();
      });
      
      // 初期状態：ANDの入力は非アクティブ
      cy.get('g').contains('AND').parent().within(() => {
        cy.get('circle.input-pin').eq(1).should('have.attr', 'fill', 'none');
      });
      
      // INPUTをONに変更
      cy.get('g').contains('INPUT').click();
      cy.wait(100);
      
      // ANDの入力がアクティブになることを確認
      cy.get('g').contains('AND').parent().within(() => {
        cy.get('circle.input-pin').eq(1).should('have.attr', 'fill', '#00ff88');
      });
      
      // INPUTを再度OFFに変更
      cy.get('g').contains('INPUT').click();
      cy.wait(100);
      
      // ANDの入力が非アクティブに戻ることを確認
      cy.get('g').contains('AND').parent().within(() => {
        cy.get('circle.input-pin').eq(1).should('have.attr', 'fill', 'none');
      });
    });
  });

  describe('複雑な接続パターンのテスト', () => {
    it('複数のINPUTゲートを接続した場合、各ピンの状態が独立して管理される', () => {
      // 2つのINPUTゲートを配置
      cy.get('[data-testid="gate-INPUT"]').click();
      cy.get('[data-testid="canvas"]').click(100, 150);
      
      cy.get('[data-testid="gate-INPUT"]').click();
      cy.get('[data-testid="canvas"]').click(100, 250);
      
      // 1つ目のINPUTをONに設定
      cy.get('g').contains('INPUT').eq(0).click();
      cy.wait(100);
      
      // ANDゲートを配置
      cy.get('[data-testid="gate-AND"]').click();
      cy.get('[data-testid="canvas"]').click(300, 200);
      
      // 1つ目のINPUT（ON）をANDの上の入力に接続
      cy.get('g').contains('INPUT').eq(0).parent().within(() => {
        cy.get('circle.output-pin').click();
      });
      cy.get('g').contains('AND').parent().within(() => {
        cy.get('circle.input-pin').eq(0).click();
      });
      
      // 2つ目のINPUT（OFF）をANDの下の入力に接続
      cy.get('g').contains('INPUT').eq(1).parent().within(() => {
        cy.get('circle.output-pin').click();
      });
      cy.get('g').contains('AND').parent().within(() => {
        cy.get('circle.input-pin').eq(1).click();
      });
      
      // ANDゲートの各入力ピンの状態を確認
      cy.get('g').contains('AND').parent().within(() => {
        // 上の入力ピン（ON）
        cy.get('circle.input-pin').eq(0).should('have.attr', 'fill', '#00ff88');
        // 下の入力ピン（OFF）
        cy.get('circle.input-pin').eq(1).should('have.attr', 'fill', 'none');
      });
      
      cy.screenshot('and-gate-with-mixed-inputs');
    });
  });

  describe('問題の再現テスト', () => {
    it('特定の操作順序で入力ピンの状態が不正になるケースを探る', () => {
      // 複数のゲートを素早く配置
      cy.get('[data-testid="gate-INPUT"]').click();
      cy.get('[data-testid="canvas"]').click(100, 100);
      
      cy.get('[data-testid="gate-INPUT"]').click();
      cy.get('[data-testid="canvas"]').click(100, 200);
      
      cy.get('[data-testid="gate-AND"]').click();
      cy.get('[data-testid="canvas"]').click(300, 150);
      
      // 素早く接続を行う
      cy.get('g').contains('INPUT').eq(0).parent().within(() => {
        cy.get('circle.output-pin').click();
      });
      cy.get('g').contains('AND').parent().within(() => {
        cy.get('circle.input-pin').eq(0).click();
      });
      
      // 即座に2つ目も接続
      cy.get('g').contains('INPUT').eq(1).parent().within(() => {
        cy.get('circle.output-pin').click();
      });
      cy.get('g').contains('AND').parent().within(() => {
        cy.get('circle.input-pin').eq(1).click();
      });
      
      // 少し待機してから状態を確認
      cy.wait(500);
      
      // 両方のINPUTがOFFの場合、ANDの入力も両方OFFであるべき
      cy.get('g').contains('AND').parent().within(() => {
        cy.get('circle.input-pin').each(($pin) => {
          cy.wrap($pin).should('have.attr', 'fill', 'none');
        });
      });
      
      // 問題が発生している場合のスクリーンショット
      cy.screenshot('potential-bug-state');
    });

    it('ゲートの削除と再配置を繰り返した場合の状態確認', () => {
      // ANDゲートを配置
      cy.get('[data-testid="gate-AND"]').click();
      cy.get('[data-testid="canvas"]').click(300, 200);
      
      // INPUTゲートを配置して接続
      cy.get('[data-testid="gate-INPUT"]').click();
      cy.get('[data-testid="canvas"]').click(100, 200);
      
      // 接続
      cy.get('g').contains('INPUT').parent().within(() => {
        cy.get('circle.output-pin').click();
      });
      cy.get('g').contains('AND').parent().within(() => {
        cy.get('circle.input-pin').eq(0).click();
      });
      
      // INPUTゲートを削除
      cy.get('g').contains('INPUT').click();
      cy.get('body').type('{del}');
      cy.wait(100);
      
      // 新しいINPUTゲートを配置
      cy.get('[data-testid="gate-INPUT"]').click();
      cy.get('[data-testid="canvas"]').click(100, 200);
      
      // ANDゲートの入力ピンが正しくリセットされているか確認
      cy.get('g').contains('AND').parent().within(() => {
        cy.get('circle.input-pin').each(($pin) => {
          cy.wrap($pin).should('have.attr', 'fill', 'none');
        });
      });
      
      cy.screenshot('after-delete-and-recreate');
    });
  });
});
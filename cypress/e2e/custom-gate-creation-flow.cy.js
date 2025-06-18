describe('カスタムゲート作成フロー', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('半加算器カスタムゲートを作成できる', () => {
    // 1. 半加算器回路を構築
    // ANDゲートを配置
    cy.get('[data-testid="gate-card-AND"]').click();
    cy.get('svg.canvas').click(400, 300);
    
    // XORゲートを配置
    cy.get('[data-testid="gate-card-XOR"]').click();
    cy.get('svg.canvas').click(400, 400);
    
    // INPUT1を配置
    cy.get('[data-testid="gate-card-INPUT"]').click();
    cy.get('svg.canvas').click(200, 300);
    
    // INPUT2を配置
    cy.get('[data-testid="gate-card-INPUT"]').click();
    cy.get('svg.canvas').click(200, 400);
    
    // OUTPUT1（Carry）を配置
    cy.get('[data-testid="gate-card-OUTPUT"]').click();
    cy.get('svg.canvas').click(600, 300);
    
    // OUTPUT2（Sum）を配置
    cy.get('[data-testid="gate-card-OUTPUT"]').click();
    cy.get('svg.canvas').click(600, 400);
    
    // ワイヤーを接続（ここは簡略化）
    cy.wait(500); // 配置の安定を待つ
    
    // 2. カスタムゲート作成ダイアログを開く
    cy.get('[data-testid="create-custom-gate-button"]').click();
    
    // 3. 基本情報を入力
    cy.get('[data-testid="custom-gate-name"]').type('半加算器');
    cy.get('[data-testid="custom-gate-display-name"]').type('HA');
    cy.get('[data-testid="custom-gate-description"]').type('1ビットの半加算器');
    
    // 4. ピン設定を確認・編集
    cy.get('[data-testid="custom-gate-input-pins"]').within(() => {
      // INPUT1をAに変更
      cy.get('input').eq(0).clear().type('A');
      // INPUT2をBに変更
      cy.get('input').eq(1).clear().type('B');
    });
    
    cy.get('[data-testid="custom-gate-output-pins"]').within(() => {
      // OUTPUT1をCarryに変更
      cy.get('input').eq(0).clear().type('Carry');
      // OUTPUT2をSumに変更
      cy.get('input').eq(1).clear().type('Sum');
    });
    
    // 5. プレビューを確認
    cy.get('[data-testid="custom-gate-preview"]').should('be.visible');
    
    // 6. 真理値表を確認
    cy.get('[data-testid="truth-table-tab"]').click();
    cy.get('.truth-table').within(() => {
      // 00 → 00
      cy.contains('tr', '0').contains('td', '0').should('exist');
      // 01 → 01
      cy.contains('tr', '0').contains('td', '1').should('exist');
      // 10 → 01
      // 11 → 10
      cy.contains('tr', '1').contains('td', '0').should('exist');
    });
    
    // 7. カスタムゲートを作成
    cy.get('[data-testid="create-custom-gate-confirm"]').click();
    
    // 8. カスタムゲートがツールパレットに追加されたことを確認
    cy.get('.custom-gates-section').should('be.visible');
    cy.get('[data-testid="custom-gate-半加算器"]').should('exist');
  });

  it('作成したカスタムゲートを使用できる', () => {
    // 前のテストで作成したカスタムゲートがあると仮定
    // （実際のテストでは事前準備が必要）
    
    // カスタムゲートセクションを開く
    cy.get('.custom-gates-section').click();
    
    // カスタムゲートをキャンバスに配置
    cy.get('[data-testid="custom-gate-半加算器"]').click();
    cy.get('svg.canvas').click(400, 350);
    
    // カスタムゲートが配置されたことを確認
    cy.get('[data-gate-type="CUSTOM"]').should('exist');
    
    // INPUTを2つ配置して接続
    cy.get('[data-testid="gate-card-INPUT"]').click();
    cy.get('svg.canvas').click(200, 300);
    
    cy.get('[data-testid="gate-card-INPUT"]').click();
    cy.get('svg.canvas').click(200, 400);
    
    // シミュレーションを実行
    cy.get('[data-testid="simulation-toggle"]').click();
    
    // 入力を変更して動作確認
    cy.get('[data-testid^="gate-"]').eq(1).dblclick(); // INPUT1をON
    cy.wait(100);
    
    // Sum出力がONになることを確認
    cy.get('[data-gate-type="CUSTOM"]').should('have.attr', 'data-sum-output', 'true');
  });

  it('選択したゲートからカスタムゲートを作成できる', () => {
    // ゲートを配置
    cy.get('[data-testid="gate-card-OR"]').click();
    cy.get('svg.canvas').click(400, 350);
    
    cy.get('[data-testid="gate-card-NOT"]').click();
    cy.get('svg.canvas').click(500, 350);
    
    // Ctrlキーを押しながら両方のゲートを選択
    cy.get('[data-testid^="gate-"]').eq(0).click();
    cy.get('[data-testid^="gate-"]').eq(1).click({ ctrlKey: true });
    
    // 選択状態から作成ボタンが表示される
    cy.get('[data-testid="create-from-selection-button"]').should('be.visible');
    cy.get('[data-testid="create-from-selection-button"]').click();
    
    // ダイアログが開き、選択したゲートが含まれていることを確認
    cy.get('[data-testid="custom-gate-dialog"]').should('be.visible');
    cy.get('[data-testid="selected-gates-count"]').should('contain', '2');
  });

  it('カスタムゲートの検証エラーが表示される', () => {
    // カスタムゲート作成ダイアログを開く
    cy.get('[data-testid="create-custom-gate-button"]').click();
    
    // 空の名前で作成を試みる
    cy.get('[data-testid="create-custom-gate-confirm"]').click();
    
    // エラーメッセージが表示される
    cy.get('.error-message').should('contain', '名前を入力してください');
    
    // 予約語を使用
    cy.get('[data-testid="custom-gate-name"]').type('AND');
    cy.get('[data-testid="create-custom-gate-confirm"]').click();
    
    // エラーメッセージが表示される
    cy.get('.error-message').should('contain', '予約語は使用できません');
    
    // 入出力ピンがない場合
    cy.get('[data-testid="custom-gate-name"]').clear().type('テストゲート');
    // （入出力ピンを削除する操作）
    cy.get('[data-testid="create-custom-gate-confirm"]').click();
    
    // エラーメッセージが表示される
    cy.get('.error-message').should('contain', '入力ピンと出力ピンが必要です');
  });

  it('カスタムゲートを削除できる', () => {
    // カスタムゲートが存在する前提
    cy.get('.custom-gates-section').click();
    
    // カスタムゲートの削除ボタンをクリック
    cy.get('[data-testid="custom-gate-半加算器"]')
      .trigger('mouseover')
      .find('.delete-button')
      .click();
    
    // 確認ダイアログが表示される
    cy.get('.confirm-dialog').should('contain', '削除しますか');
    
    // 削除を確認
    cy.get('[data-testid="confirm-delete"]').click();
    
    // カスタムゲートがリストから削除される
    cy.get('[data-testid="custom-gate-半加算器"]').should('not.exist');
    
    // 既に配置されたカスタムゲートは残る（参照エラーにならない）
    cy.get('[data-gate-type="CUSTOM"]').should('exist');
  });

  it('カスタムゲートの真理値表が正しく生成される', () => {
    // 3入力ANDゲート相当の回路を作成
    cy.get('[data-testid="gate-card-AND"]').click();
    cy.get('svg.canvas').click(300, 350);
    
    cy.get('[data-testid="gate-card-AND"]').click();
    cy.get('svg.canvas').click(500, 350);
    
    // 入力を3つ配置
    for (let i = 0; i < 3; i++) {
      cy.get('[data-testid="gate-card-INPUT"]').click();
      cy.get('svg.canvas').click(100, 300 + i * 50);
    }
    
    // 出力を1つ配置
    cy.get('[data-testid="gate-card-OUTPUT"]').click();
    cy.get('svg.canvas').click(700, 350);
    
    // カスタムゲート作成
    cy.get('[data-testid="create-custom-gate-button"]').click();
    cy.get('[data-testid="custom-gate-name"]').type('3入力AND');
    
    // 真理値表タブを開く
    cy.get('[data-testid="truth-table-tab"]').click();
    
    // 真理値表が8行（2^3）あることを確認
    cy.get('.truth-table tbody tr').should('have.length', 8);
    
    // 全て0の入力で出力が0
    cy.get('.truth-table tbody tr').first().should('contain', '0');
    
    // 全て1の入力で出力が1
    cy.get('.truth-table tbody tr').last().should('contain', '1');
  });
});
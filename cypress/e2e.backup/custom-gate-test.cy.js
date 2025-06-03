describe('カスタムゲート機能テスト', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
    // 既存のカスタムゲートをクリア
    cy.window().then((win) => {
      win.localStorage.clear();
    });
    cy.reload();
  });

  it('カスタムゲートを作成してLocalStorageに保存される', () => {
    // 1. まず簡単な回路を作成（AND相当）
    cy.get('[data-gate-type="INPUT"]').click();
    cy.get('svg.canvas').click(200, 200);
    
    cy.get('[data-gate-type="INPUT"]').click();
    cy.get('svg.canvas').click(200, 300);
    
    cy.get('[data-gate-type="AND"]').click();
    cy.get('svg.canvas').click(400, 250);
    
    cy.get('[data-gate-type="OUTPUT"]').click();
    cy.get('svg.canvas').click(600, 250);
    
    // 2. 接続を作成
    // INPUT1 -> AND
    cy.get('g[data-gate-id]').eq(0).find('circle[cx="35"]').first().click();
    cy.get('g[data-gate-id]').eq(2).find('circle[cx="-45"][cy="-10"]').first().click();
    
    // INPUT2 -> AND
    cy.get('g[data-gate-id]').eq(1).find('circle[cx="35"]').first().click();
    cy.get('g[data-gate-id]').eq(2).find('circle[cx="-45"][cy="10"]').first().click();
    
    // AND -> OUTPUT
    cy.get('g[data-gate-id]').eq(2).find('circle[cx="45"]').first().click();
    cy.get('g[data-gate-id]').eq(3).find('circle[cx="-30"]').first().click();
    
    // 3. カスタムゲート作成ボタンをクリック
    cy.get('.create-custom-gate').click();
    
    // 4. カスタムゲート作成ダイアログが表示される
    cy.get('.dialog-overlay').should('be.visible');
    
    // 5. 必要な情報を入力
    cy.get('input[placeholder="例: HalfAdder"]').type('MyANDGate');
    cy.get('input[placeholder="例: 半加算器"]').type('カスタムAND');
    cy.get('textarea[placeholder="このゲートの機能を説明..."]').type('2入力ANDゲートのカスタム実装');
    
    // 6. 作成ボタンをクリック
    cy.contains('button', '作成').click();
    
    // 7. ダイアログが閉じる
    cy.get('.dialog-overlay').should('not.exist');
    
    // 8. カスタムゲートがツールパレットに表示される
    cy.contains('.tool-label', 'カスタムAND').should('be.visible');
    
    // 9. LocalStorageにカスタムゲートが保存されているか確認
    cy.window().then((win) => {
      const customGates = win.localStorage.getItem('logic-circuit-playground-custom-gates');
      expect(customGates).to.not.be.null;
      
      const gates = JSON.parse(customGates);
      expect(gates).to.have.length(1);
      expect(gates[0].name).to.equal('MyANDGate');
      expect(gates[0].displayName).to.equal('カスタムAND');
    });
  });

  it('リロード後もカスタムゲートが保持される', () => {
    // テストデータをLocalStorageに設定
    const testCustomGate = {
      id: 'test-custom-gate',
      name: 'TestGate',
      displayName: 'テストゲート',
      description: 'テスト用のカスタムゲート',
      inputs: [
        { name: 'A', index: 0 },
        { name: 'B', index: 1 }
      ],
      outputs: [
        { name: 'Y', index: 0 }
      ],
      truthTable: {
        '00': '0',
        '01': '1',
        '10': '1',
        '11': '0'
      },
      icon: '🧪',
      category: 'custom',
      width: 100,
      height: 80,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    cy.window().then((win) => {
      win.localStorage.setItem(
        'logic-circuit-playground-custom-gates',
        JSON.stringify([testCustomGate])
      );
    });
    
    // ページをリロード
    cy.reload();
    
    // カスタムゲートがツールパレットに表示されているか確認
    cy.contains('.tool-label', 'テストゲート').should('be.visible');
  });

  it('カスタムゲートをクリックして選択できる', () => {
    // テスト用のカスタムゲートをLocalStorageに設定
    const testCustomGate = {
      id: 'test-selectable-gate',
      name: 'SelectableGate',
      displayName: '選択可能ゲート',
      description: '選択をテストするためのゲート',
      inputs: [{ name: 'A', index: 0 }],
      outputs: [{ name: 'Y', index: 0 }],
      truthTable: { '0': '0', '1': '1' },
      icon: '🎯',
      category: 'custom',
      width: 100,
      height: 80,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    cy.window().then((win) => {
      win.localStorage.setItem(
        'logic-circuit-playground-custom-gates',
        JSON.stringify([testCustomGate])
      );
    });
    
    // ページをリロードしてカスタムゲートを読み込む
    cy.reload();
    
    // カスタムゲートを配置
    cy.contains('.tool-label', '選択可能ゲート').click();
    cy.get('svg.canvas').click(300, 300);
    
    // カスタムゲートをクリックして選択
    cy.get('.custom-gate').click();
    
    // 選択されたことを確認（選択時のボーダー色）
    cy.get('.custom-gate.selected').should('exist');
  });

  it('カスタムゲートの真理値表を確認できる', () => {
    // テスト用のカスタムゲートをLocalStorageに設定（内部回路付き）
    const testGate = {
      id: 'test-gate-with-circuit',
      name: 'TestGateWithTruthTable',
      displayName: 'XORカスタム',
      description: 'XOR機能のカスタムゲート',
      inputs: [
        { name: 'A', index: 0 },
        { name: 'B', index: 1 }
      ],
      outputs: [{ name: 'Y', index: 0 }],
      truthTable: { '00': '0', '01': '1', '10': '1', '11': '0' }, // XORパターン
      icon: '⊕',
      category: 'custom',
      width: 100,
      height: 80,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    cy.window().then((win) => {
      win.localStorage.setItem(
        'logic-circuit-playground-custom-gates',
        JSON.stringify([testGate])
      );
    });
    
    cy.reload();
    
    // カスタムゲートを配置
    cy.contains('.tool-label', 'XORカスタム').click();
    cy.get('svg.canvas').click(300, 300);
    
    // INPUTゲートを2つ配置
    cy.get('[data-gate-type="INPUT"]').click();
    cy.get('svg.canvas').click(100, 250);
    
    cy.get('[data-gate-type="INPUT"]').click();
    cy.get('svg.canvas').click(100, 350);
    
    // OUTPUTゲートを配置
    cy.get('[data-gate-type="OUTPUT"]').click();
    cy.get('svg.canvas').click(500, 300);
    
    // 接続: INPUT1 -> カスタムゲートのA
    cy.get('g[data-gate-id]').eq(1).find('circle[cx="35"]').first().click();
    cy.get('g[data-gate-id]').eq(0).find('circle[fill="transparent"]').eq(0).click();
    
    // 接続: INPUT2 -> カスタムゲートのB
    cy.get('g[data-gate-id]').eq(2).find('circle[cx="35"]').first().click();
    cy.get('g[data-gate-id]').eq(0).find('circle[fill="transparent"]').eq(1).click();
    
    // 接続: カスタムゲート -> OUTPUT
    cy.get('g[data-gate-id]').eq(0).find('circle[fill="transparent"]').eq(2).click();
    cy.get('g[data-gate-id]').eq(3).find('circle[cx="-30"]').first().click();
    
    // XORの動作確認
    // 両方OFF -> 出力OFF
    cy.get('g[data-gate-id]').eq(3).find('circle[cx="0"][cy="0"]').eq(1).should('have.attr', 'fill', '#333');
    
    // INPUT1をON
    cy.get('g[data-gate-id]').eq(1).find('.switch-track').dblclick({ force: true });
    cy.wait(100);
    // 片方ON -> 出力ON
    cy.get('g[data-gate-id]').eq(3).find('circle[cx="0"][cy="0"]').eq(1).should('have.attr', 'fill', '#00ff88');
    
    // INPUT2もON
    cy.get('g[data-gate-id]').eq(2).find('.switch-track').dblclick({ force: true });
    cy.wait(100);
    // 両方ON -> 出力OFF（XOR動作）
    cy.get('g[data-gate-id]').eq(3).find('circle[cx="0"][cy="0"]').eq(1).should('have.attr', 'fill', '#333');
  });
});
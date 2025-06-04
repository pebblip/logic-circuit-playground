describe('カスタムゲート問題の最終調査', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(3000);
  });

  it('1. GatePreviewコンポーネントの表示確認', () => {
    // INPUT/OUTPUTゲートを配置
    cy.get('button:contains("INPUT")').click();
    cy.get('svg').click(200, 200);
    cy.get('button:contains("OUTPUT")').click();
    cy.get('svg').click(400, 200);
    
    // 「回路→IC」ボタンでダイアログを開く
    cy.get('button:contains("回路→IC")').click();
    
    // ダイアログが開くことを確認
    cy.get('.dialog-overlay').should('exist');
    cy.log('カスタムゲートダイアログが開きました');
    
    // プレビューセクションの確認
    cy.get('h3:contains("プレビュー")').should('exist').then(() => {
      cy.log('✅ プレビューセクションのタイトルが表示されています');
    });
    
    // SVGプレビューが存在することを確認
    cy.get('svg').should('exist').then(($svg) => {
      const svgCount = $svg.length;
      cy.log(`SVG要素数: ${svgCount}`);
      
      // プレビュー用のSVGを特定（通常最後のSVGがプレビュー）
      const previewSvg = $svg.last();
      const width = previewSvg.attr('width');
      const height = previewSvg.attr('height');
      cy.log(`プレビューSVGサイズ: ${width} x ${height}`);
      
      // SVG内の要素を確認
      cy.wrap(previewSvg).within(() => {
        // ゲート本体の矩形
        cy.get('rect').should('exist').then(($rects) => {
          cy.log(`✅ 矩形要素数: ${$rects.length}`);
          $rects.each((index, rect) => {
            const x = rect.getAttribute('x');
            const y = rect.getAttribute('y');
            const width = rect.getAttribute('width');
            const height = rect.getAttribute('height');
            cy.log(`  Rect${index}: x=${x}, y=${y}, w=${width}, h=${height}`);
          });
        });
        
        // テキスト要素（ゲート名、アイコン）
        cy.get('text').should('exist').then(($texts) => {
          cy.log(`✅ テキスト要素数: ${$texts.length}`);
          $texts.each((index, text) => {
            const content = text.textContent;
            const x = text.getAttribute('x');
            const y = text.getAttribute('y');
            cy.log(`  Text${index}: "${content}" at (${x}, ${y})`);
          });
        });
        
        // ピン要素（円）
        cy.get('circle').should('exist').then(($circles) => {
          cy.log(`✅ ピン数: ${$circles.length}`);
          $circles.each((index, circle) => {
            const cx = circle.getAttribute('cx');
            const cy = circle.getAttribute('cy');
            const r = circle.getAttribute('r');
            const isOutput = parseFloat(cx) > 0;
            cy.log(`  Pin${index}: cx=${cx}, cy=${cy}, r=${r}, type=${isOutput ? '出力' : '入力'}`);
          });
        });
        
        // 線要素（ピンと本体を接続）
        cy.get('line').should('exist').then(($lines) => {
          cy.log(`✅ 線要素数: ${$lines.length}`);
          $lines.each((index, line) => {
            const x1 = line.getAttribute('x1');
            const y1 = line.getAttribute('y1');
            const x2 = line.getAttribute('x2');
            const y2 = line.getAttribute('y2');
            cy.log(`  Line${index}: (${x1}, ${y1}) → (${x2}, ${y2})`);
          });
        });
      });
    });
    
    // ダイアログを閉じる
    cy.get('button:contains("キャンセル")').click();
  });

  it('2. 複数出力カスタムゲートの手動作成とピン位置確認', () => {
    // ツールパレットでカスタムゲート作成ボタンを探す
    cy.get('body').then($body => {
      // プラスボタンやカスタムゲート追加ボタンを探す
      const addButton = $body.find('button:contains("+"), button[title*="追加"], button[title*="作成"]');
      
      if (addButton.length > 0) {
        cy.log('カスタムゲート追加ボタンが見つかりました');
        cy.wrap(addButton.first()).click();
      } else {
        cy.log('直接的なカスタムゲート作成ボタンが見つからないため、別の方法を試します');
        
        // カスタムゲートセクションを右クリックしてコンテキストメニューを探す
        cy.get('.section-title:contains("カスタムゲート")').should('exist').then(() => {
          cy.log('カスタムゲートセクションが見つかりました');
          
          // セクション内のプラスアイコンや追加ボタンを探す
          cy.get('.section-title:contains("カスタムゲート")').parent().within(() => {
            cy.get('button, [role="button"]').each(($btn) => {
              const text = $btn.text();
              const title = $btn.attr('title') || '';
              cy.log(`セクション内ボタン: "${text}" title="${title}"`);
            });
          });
        });
      }
    });
  });

  it('3. カスタムゲートのピン位置計算ロジックの検証', () => {
    // デモカスタムゲート（半加算器）の確認
    cy.get(':contains("半加算器")').should('exist').then(() => {
      cy.log('✅ デモカスタムゲート（半加算器）が見つかりました');
      
      // 半加算器を配置
      cy.get(':contains("半加算器")').click();
      cy.get('svg').click(300, 300);
      
      // 配置されたカスタムゲートの確認
      cy.get('[data-gate-type="CUSTOM"]').should('exist').within(() => {
        // ピン位置を詳細確認
        cy.get('circle').then(($circles) => {
          cy.log(`半加算器のピン数: ${$circles.length}`);
          
          const pins = [];
          $circles.each((index, circle) => {
            const cx = parseFloat(circle.getAttribute('cx'));
            const cy = parseFloat(circle.getAttribute('cy'));
            const isOutput = cx > 0;
            pins.push({ index, cx, cy, isOutput });
            cy.log(`  ピン${index}: cx=${cx}, cy=${cy}, 種類=${isOutput ? '出力' : '入力'}`);
          });
          
          // 複数出力ピンの間隔を確認
          const outputPins = pins.filter(p => p.isOutput);
          if (outputPins.length >= 2) {
            const spacing = Math.abs(outputPins[1].cy - outputPins[0].cy);
            cy.log(`📏 出力ピン間隔: ${spacing}px`);
            
            // 間隔が適切かチェック（30px程度が期待値）
            if (spacing < 20 || spacing > 50) {
              cy.log(`⚠️  出力ピン間隔が不適切です: ${spacing}px`);
            } else {
              cy.log(`✅ 出力ピン間隔は適切です: ${spacing}px`);
            }
          }
        });
      });
      
      // ANDゲートを配置して接続テスト
      cy.get('button:contains("AND")').click();
      cy.get('svg').click(500, 300);
      
      // ワイヤー接続をテスト
      cy.get('[data-gate-type="CUSTOM"] circle').first().then(($pin) => {
        const cx = parseFloat($pin.attr('cx'));
        const cy = parseFloat($pin.attr('cy'));
        const isOutput = cx > 0;
        
        if (isOutput) {
          cy.log('出力ピンからANDゲートの入力へ接続テスト');
          cy.wrap($pin).click();
          cy.get('[data-gate-type="AND"] circle').first().click();
        } else {
          cy.log('入力ピンへの接続はANDゲートの出力から');
          cy.get('[data-gate-type="AND"] circle').last().click();
          cy.wrap($pin).click();
        }
        
        // ワイヤーが描画されたか確認
        cy.wait(1000);
        cy.get('line, path').then(($wires) => {
          const wireCount = $wires.length;
          cy.log(`描画されたワイヤー数: ${wireCount}`);
          
          if (wireCount > 0) {
            cy.log('✅ ワイヤー接続が成功しました');
          } else {
            cy.log('❌ ワイヤー接続に失敗しました');
          }
        });
      });
    });
  });
});
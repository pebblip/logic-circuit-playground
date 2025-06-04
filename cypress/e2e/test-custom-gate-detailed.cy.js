describe('カスタムゲート詳細問題調査', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(2000);
  });

  it('プレビューエリアのSVG内容を詳細に調査', () => {
    // まずINPUTとOUTPUTゲートを配置（「回路→IC」に必要）
    cy.get('button:contains("INPUT")').click();
    cy.get('svg').click(200, 200);
    cy.get('button:contains("OUTPUT")').click();
    cy.get('svg').click(400, 200);
    
    // カスタムゲートダイアログを開く（「回路→IC」ボタンを使用）
    cy.get('button:contains("回路→IC"), button[title*="カスタムゲート"]').first().click();
    cy.get('.dialog-overlay').should('exist');
    
    // プレビューセクションを詳細確認
    cy.get('h3:contains("プレビュー")').should('exist').then(() => {
      cy.log('プレビューセクションのタイトルが表示されています');
    });
    
    // SVGプレビューコンテナ
    cy.get('svg').should('exist').then(($svg) => {
      const width = $svg.attr('width');
      const height = $svg.attr('height');
      cy.log(`SVGサイズ: width=${width}, height=${height}`);
      
      // SVG内の要素を詳細確認
      cy.wrap($svg).within(() => {
        // ゲート本体の確認
        cy.get('rect').should('have.length.at.least', 1).then(($rects) => {
          $rects.each((index, rect) => {
            const x = rect.getAttribute('x');
            const y = rect.getAttribute('y');
            const width = rect.getAttribute('width');
            const height = rect.getAttribute('height');
            const fill = rect.getAttribute('fill');
            const stroke = rect.getAttribute('stroke');
            cy.log(`Rect${index}: x=${x}, y=${y}, w=${width}, h=${height}, fill=${fill}, stroke=${stroke}`);
          });
        });
        
        // テキスト要素の確認
        cy.get('text').then(($texts) => {
          $texts.each((index, text) => {
            const x = text.getAttribute('x');
            const y = text.getAttribute('y');
            const content = text.textContent;
            cy.log(`Text${index}: x=${x}, y=${y}, content="${content}"`);
          });
        });
        
        // ピン（円）の確認
        cy.get('circle').then(($circles) => {
          $circles.each((index, circle) => {
            const cx = circle.getAttribute('cx');
            const cy = circle.getAttribute('cy');
            const r = circle.getAttribute('r');
            const fill = circle.getAttribute('fill');
            cy.log(`Circle${index}: cx=${cx}, cy=${cy}, r=${r}, fill=${fill}`);
          });
        });
        
        // 線の確認
        cy.get('line').then(($lines) => {
          $lines.each((index, line) => {
            const x1 = line.getAttribute('x1');
            const y1 = line.getAttribute('y1');
            const x2 = line.getAttribute('x2');
            const y2 = line.getAttribute('y2');
            cy.log(`Line${index}: x1=${x1}, y1=${y1}, x2=${x2}, y2=${y2}`);
          });
        });
      });
    });
    
    // フォームデータの確認
    cy.get('input[placeholder*="内部名"]').should('exist').then(($input) => {
      const value = $input.val();
      cy.log(`ゲート名入力フィールドの値: "${value}"`);
    });
  });

  it('複数出力を追加した時のプレビュー変化を詳細調査', () => {
    // まずINPUTとOUTPUTゲートを配置（「回路→IC」に必要）
    cy.get('button:contains("INPUT")').click();
    cy.get('svg').click(200, 200);
    cy.get('button:contains("OUTPUT")').click();
    cy.get('svg').click(400, 200);
    
    cy.get('button:contains("回路→IC"), button[title*="カスタムゲート"]').first().click();
    cy.get('.dialog-overlay').should('exist');
    
    // 初期状態のピン数を記録
    cy.get('svg circle').then(($initialCircles) => {
      const initialCount = $initialCircles.length;
      cy.log(`初期ピン数: ${initialCount}`);
      
      // 出力を追加
      cy.get('button:contains("出力を追加")').click();
      
      // 変化後のピン数を確認
      cy.get('svg circle').should('have.length.at.least', initialCount).then(($newCircles) => {
        const newCount = $newCircles.length;
        cy.log(`出力追加後のピン数: ${newCount}`);
        
        // 各ピンの位置を詳細に確認
        $newCircles.each((index, circle) => {
          const cx = parseFloat(circle.getAttribute('cx'));
          const cy = parseFloat(circle.getAttribute('cy'));
          const isOutput = cx > 0; // 右側は出力
          cy.log(`ピン${index}: cx=${cx}, cy=${cy}, 種類=${isOutput ? '出力' : '入力'}`);
        });
      });
      
      // さらに出力を追加
      cy.get('button:contains("出力を追加")').click();
      
      // 3つの出力がある状態のピン位置
      cy.get('svg circle').then(($finalCircles) => {
        const finalCount = $finalCircles.length;
        cy.log(`最終ピン数: ${finalCount}`);
        
        // 出力ピンの間隔を計算
        const outputPins = Array.from($finalCircles).filter(circle => {
          const cx = parseFloat(circle.getAttribute('cx'));
          return cx > 0;
        });
        
        if (outputPins.length >= 2) {
          const pin0Y = parseFloat(outputPins[0].getAttribute('cy'));
          const pin1Y = parseFloat(outputPins[1].getAttribute('cy'));
          const spacing = Math.abs(pin1Y - pin0Y);
          cy.log(`出力ピン間隔: ${spacing}px`);
        }
      });
    });
  });

  it('カスタムゲート作成後の実際の配置と接続線位置の精密調査', () => {
    // まずINPUTとOUTPUTゲートを配置（「回路→IC」に必要）
    cy.get('button:contains("INPUT")').click();
    cy.get('svg').click(200, 200);
    cy.get('button:contains("OUTPUT")').click();
    cy.get('svg').click(400, 200);
    
    // カスタムゲートを作成
    cy.get('button:contains("回路→IC"), button[title*="カスタムゲート"]').first().click();
    cy.get('.dialog-overlay').should('exist');
    
    // 複数出力を設定
    cy.get('button:contains("出力を追加")').click();
    cy.get('button:contains("出力を追加")').click();
    
    // ゲート名設定
    cy.get('input[placeholder*="内部名"]').clear().type('DebugGate');
    
    // プレビューでの最終ピン位置を記録
    cy.get('svg circle').then(($previewCircles) => {
      const previewPins = [];
      $previewCircles.each((index, circle) => {
        const cx = parseFloat(circle.getAttribute('cx'));
        const cy = parseFloat(circle.getAttribute('cy'));
        previewPins.push({ index, cx, cy, isOutput: cx > 0 });
      });
      
      cy.log('プレビューでのピン位置:');
      previewPins.forEach(pin => {
        cy.log(`  ${pin.isOutput ? '出力' : '入力'}${pin.index}: cx=${pin.cx}, cy=${pin.cy}`);
      });
      
      // 保存
      cy.get('button:contains("作成")').click();
      
      // カスタムゲートがツールパレットに追加されるのを確認
      cy.get(':contains("DebugGate")').should('exist');
      
      // キャンバスに配置
      cy.get(':contains("DebugGate")').first().click();
      cy.get('svg').click(400, 300);
      
      // 配置されたゲートの実際のピン位置を確認
      cy.wait(1000); // 配置完了を待つ
      
      cy.get('[data-gate-type="CUSTOM"]').should('exist').within(() => {
        cy.get('circle').then(($actualCircles) => {
          const actualPins = [];
          $actualCircles.each((index, circle) => {
            const cx = parseFloat(circle.getAttribute('cx'));
            const cy = parseFloat(circle.getAttribute('cy'));
            actualPins.push({ index, cx, cy, isOutput: cx > 0 });
          });
          
          cy.log('配置後の実際のピン位置:');
          actualPins.forEach(pin => {
            cy.log(`  ${pin.isOutput ? '出力' : '入力'}${pin.index}: cx=${pin.cx}, cy=${pin.cy}`);
          });
          
          // プレビューと実際の位置の差異を確認
          cy.log('プレビューと実際の位置の比較:');
          previewPins.forEach((previewPin, i) => {
            const actualPin = actualPins[i];
            if (actualPin) {
              const cxDiff = Math.abs(previewPin.cx - actualPin.cx);
              const cyDiff = Math.abs(previewPin.cy - actualPin.cy);
              cy.log(`  ピン${i}: cx差=${cxDiff}, cy差=${cyDiff}`);
            }
          });
        });
      });
      
      // 基本ゲート（例：AND）も配置して接続テスト
      cy.get('button:contains("AND")').click();
      cy.get('svg').click(600, 300);
      
      // ワイヤー接続を試行
      cy.get('[data-gate-type="CUSTOM"] circle').first().click();
      cy.get('[data-gate-type="AND"] circle').first().click();
      
      // ワイヤーが正しく描画されているか確認
      cy.get('line, path').then(($wires) => {
        if ($wires.length > 0) {
          cy.log('ワイヤーが描画されました');
          $wires.each((index, wire) => {
            if (wire.tagName === 'line') {
              const x1 = wire.getAttribute('x1');
              const y1 = wire.getAttribute('y1');
              const x2 = wire.getAttribute('x2');
              const y2 = wire.getAttribute('y2');
              cy.log(`ワイヤー${index}: x1=${x1}, y1=${y1}, x2=${x2}, y2=${y2}`);
            } else if (wire.tagName === 'path') {
              const d = wire.getAttribute('d');
              cy.log(`ワイヤーパス${index}: ${d}`);
            }
          });
        } else {
          cy.log('ワイヤーが描画されていません');
        }
      });
    });
  });
});
/// <reference types="cypress" />

describe('Canvas Placement Debug', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(2000);
  });

  it('should debug canvas click behavior', () => {
    // キャンバスが存在することを確認
    cy.get('[data-testid="canvas"]').should('be.visible');
    
    // キャンバスのサイズと位置を確認
    cy.get('[data-testid="canvas"]').then($canvas => {
      const canvas = $canvas[0];
      console.log('Canvas element:', canvas);
      console.log('Canvas bounds:', canvas.getBoundingClientRect());
      console.log('Canvas tagName:', canvas.tagName);
      console.log('Canvas attributes:', Array.from(canvas.attributes).map(attr => `${attr.name}="${attr.value}"`));
    });

    // 最初に基本的なゲート（INPUT）で試してみる
    cy.get('[data-testid="INPUT-button"]').click();
    cy.wait(500);
    
    // 選択状態を確認
    cy.get('[data-testid="INPUT-button"]').should('have.class', 'selected');
    
    // キャンバスをクリック
    cy.get('[data-testid="canvas"]').click(300, 200, { force: true });
    cy.wait(2000); // 長めに待機
    
    // キャンバス内の要素を確認
    cy.get('[data-testid="canvas"]').within(() => {
      cy.get('*').then($elements => {
        console.log('After INPUT placement - Canvas children:', $elements.length);
        if ($elements.length > 0) {
          console.log('Elements found!');
          $elements.each((index, element) => {
            console.log(`Element ${index}:`, {
              tagName: element.tagName,
              id: element.id,
              class: element.className,
              testId: element.getAttribute('data-testid'),
              text: element.textContent
            });
          });
        } else {
          console.log('No elements found in canvas');
        }
      });
    });
    
    cy.screenshot('debug-input-placement');
  });

  it('should test canvas SVG structure', () => {
    // SVGキャンバスの構造を確認
    cy.get('svg').then($svgs => {
      console.log('SVG elements found:', $svgs.length);
      $svgs.each((index, svg) => {
        console.log(`SVG ${index}:`, {
          class: svg.className.baseVal || svg.className,
          testId: svg.getAttribute('data-testid'),
          viewBox: svg.getAttribute('viewBox'),
          children: svg.children.length
        });
      });
    });
    
    // メインキャンバスSVGを確認
    cy.get('svg[data-testid="canvas"]').then($svg => {
      const svg = $svg[0];
      console.log('Main canvas SVG:', {
        viewBox: svg.getAttribute('viewBox'),
        children: svg.children.length,
        innerHTML: svg.innerHTML.substring(0, 200) + '...'
      });
    });
    
    cy.screenshot('debug-svg-structure');
  });

  it('should check circuit store state', () => {
    // ブラウザのコンソールでストアの状態を確認
    cy.window().then((win) => {
      // Zustandストアの状態を確認
      cy.log('Checking circuit store state...');
      
      // ストアが利用可能かどうか確認
      if (win.__CIRCUIT_STORE__) {
        console.log('Circuit store found:', win.__CIRCUIT_STORE__);
      } else {
        console.log('Circuit store not found on window');
      }
    });

    // INPUTゲートを配置してストアの変化を確認
    cy.get('[data-testid="INPUT-button"]').click();
    cy.wait(500);
    
    cy.get('[data-testid="canvas"]').click(300, 200, { force: true });
    cy.wait(1000);
    
    // 再度ストアの状態を確認
    cy.window().then((win) => {
      if (win.__CIRCUIT_STORE__) {
        console.log('Circuit store after placement:', win.__CIRCUIT_STORE__);
      }
    });
  });

  it('should test direct BINARY_COUNTER placement', () => {
    // BINARY_COUNTERを試す前に、まずInputが動作するか確認
    cy.get('[data-testid="INPUT-button"]').click();
    cy.wait(500);
    cy.get('[data-testid="canvas"]').click(200, 200, { force: true });
    cy.wait(1000);
    
    // INPUTが配置されたかチェック
    cy.get('[data-testid="canvas"]').within(() => {
      cy.get('*').then($elements => {
        console.log('INPUT elements in canvas:', $elements.length);
      });
    });
    
    // 次にBINARY_COUNTERを試す
    cy.get('[data-testid="BINARY_COUNTER-button"]').click();
    cy.wait(500);
    cy.get('[data-testid="canvas"]').click(400, 300, { force: true });
    cy.wait(2000);
    
    // BINARY_COUNTERが配置されたかチェック
    cy.get('[data-testid="canvas"]').within(() => {
      cy.get('*').then($elements => {
        console.log('After BINARY_COUNTER placement - Canvas children:', $elements.length);
        $elements.each((index, element) => {
          if (element.textContent && element.textContent.includes('COUNTER')) {
            console.log('Found COUNTER text:', element);
          }
        });
      });
    });
    
    cy.screenshot('debug-binary-counter-placement');
  });
});
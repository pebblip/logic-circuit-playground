describe('ギャラリー半加算器デバッグテスト', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.contains('ギャラリーモード').click();
  });

  it('半加算器の初期状態をデバッグ', () => {
    cy.contains('半加算器').parent().parent().find('button').contains('詳細を見る').click();
    cy.contains('キャンバスで開く').click();
    cy.wait(2000); // 十分な待機時間
    
    // すべてのゲートの存在を確認
    cy.get('[data-testid^="gate-"]').then($gates => {
      console.log('Found gates:', $gates.length);
      $gates.each((i, el) => {
        console.log(`Gate ${i}:`, el.getAttribute('data-testid'));
      });
    });
    
    // すべてのoutputゲートの状態を確認
    cy.get('[data-testid^="output-"]').then($outputs => {
      console.log('Found outputs:', $outputs.length);
      $outputs.each((i, el) => {
        const testId = el.getAttribute('data-testid');
        const active = el.getAttribute('data-active');
        console.log(`Output ${i}: ${testId} = ${active}`);
      });
    });
    
    // 特定のOUTPUTゲートのデバッグ
    cy.get('[data-testid="output-output-sum"]').then($el => {
      console.log('output-sum element:', $el);
      console.log('data-active:', $el.attr('data-active'));
      console.log('element type:', $el.prop('tagName'));
      console.log('all attributes:', Array.from($el[0].attributes).map(attr => `${attr.name}="${attr.value}"`));
    });
    
    // g要素内のcircle要素も確認
    cy.get('[data-testid="output-output-sum"] circle').then($circles => {
      console.log('Circles in output-sum:', $circles.length);
      $circles.each((i, el) => {
        console.log(`Circle ${i} fill:`, el.getAttribute('fill'));
      });
    });
  });
});
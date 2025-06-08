describe('学習モード図表カタログ Phase1&2 完全版', () => {
  it('全レッスンの図表を確認', () => {
    cy.visit('/lesson-diagrams-catalog.html')
    cy.wait(1000) // Canvas描画待機
    
    // Phase 1レッスン
    const phase1Lessons = [
      { title: 'デジタルって何？', selector: 'レッスン1' },
      { title: 'ANDゲート', selector: 'レッスン2' },
      { title: 'ORゲート', selector: 'レッスン3' },
      { title: 'NOTゲート', selector: 'レッスン4' },
      { title: 'XORゲート', selector: 'レッスン5' }
    ]
    
    // Phase 2レッスン
    const phase2Lessons = [
      { title: '半加算器', selector: 'レッスン7' },
      { title: '全加算器', selector: 'レッスン8' },
      { title: '4ビット加算器', selector: 'レッスン9' },
      { title: '比較器', selector: 'レッスン10' },
      { title: 'エンコーダ', selector: 'レッスン11' },
      { title: 'デコーダ', selector: 'レッスン12' },
      { title: 'マルチプレクサ', selector: 'レッスン13' },
      { title: 'Dフリップフロップ', selector: 'レッスン14' },
      { title: 'クロック同期', selector: 'レッスン16' },
      { title: 'ALU基礎', selector: 'レッスン19' }
    ]
    
    // 全体スクリーンショット
    cy.screenshot('00-lesson-catalog-full', { capture: 'fullPage' })
    
    // Phase 1の各レッスンをスクロール＆スクリーンショット
    phase1Lessons.forEach((lesson, index) => {
      cy.contains('h2', lesson.selector).scrollIntoView()
      cy.wait(500)
      cy.screenshot(`phase1-${index + 1}-${lesson.title}`, { capture: 'viewport' })
    })
    
    // Phase 2の各レッスンをスクロール＆スクリーンショット
    phase2Lessons.forEach((lesson, index) => {
      cy.contains('h2', lesson.selector).scrollIntoView()
      cy.wait(500)
      cy.screenshot(`phase2-${index + 1}-${lesson.title}`, { capture: 'viewport' })
    })
    
    // 特定の回路図の詳細確認
    cy.contains('h3', '全加算器回路図').scrollIntoView()
    cy.wait(500)
    cy.screenshot('detail-full-adder', { capture: 'viewport' })
    
    cy.contains('h3', '4ビット加算器のブロック図').scrollIntoView()
    cy.wait(500)
    cy.screenshot('detail-4bit-adder', { capture: 'viewport' })
    
    cy.contains('h3', '簡単な2ビットALU').scrollIntoView()
    cy.wait(500)
    cy.screenshot('detail-alu', { capture: 'viewport' })
  })
})
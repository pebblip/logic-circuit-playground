// このスクリプトはCypressを使用してスクリーンショットを撮影します
// 使用方法: npm run cypress:screenshot

const SCREENSHOTS_TO_TAKE = [
  {
    name: 'svg-diagram-demo',
    steps: [
      // 学習モードを開く
      { action: 'click', selector: '[data-testid="mode-button-learning"]' },
      { action: 'wait', duration: 1000 },
      
      // デモレッスンを見つけてクリック
      { action: 'contains-click', text: '図表表示の新しい方法' },
      { action: 'wait', duration: 1000 },
      
      // レッスンを開始
      { action: 'contains-click', text: 'レッスンを開始' },
      { action: 'wait', duration: 2000 },
    ]
  },
  {
    name: 'svg-vs-ascii-comparison',
    steps: [
      // 既に開いているレッスンの最初のステップをスクリーンショット
      { action: 'wait', duration: 500 },
    ]
  },
  {
    name: 'signal-flow-diagram',
    steps: [
      // 次のステップへ
      { action: 'contains-click', text: '次へ' },
      { action: 'wait', duration: 1000 },
    ]
  },
  {
    name: 'connection-diagram',
    steps: [
      // 次のステップへ
      { action: 'contains-click', text: '次へ' },
      { action: 'wait', duration: 1000 },
    ]
  },
  {
    name: 'truth-table-visual',
    steps: [
      // 次のステップへ
      { action: 'contains-click', text: '次へ' },
      { action: 'wait', duration: 1000 },
    ]
  },
  {
    name: 'custom-svg-diagram',
    steps: [
      // 次のステップへ
      { action: 'contains-click', text: '次へ' },
      { action: 'wait', duration: 1000 },
    ]
  }
];

// Cypressタスクとして実行
describe('Screenshot Capture', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5175');
    cy.viewport(1280, 720);
  });

  SCREENSHOTS_TO_TAKE.forEach((screenshot) => {
    it(`captures ${screenshot.name}`, () => {
      screenshot.steps.forEach((step) => {
        switch (step.action) {
          case 'click':
            cy.get(step.selector).click();
            break;
          case 'contains-click':
            cy.contains(step.text).click();
            break;
          case 'wait':
            cy.wait(step.duration);
            break;
        }
      });
      
      // スクリーンショットを撮影
      cy.screenshot(`svg-diagrams/${screenshot.name}`, {
        capture: 'fullPage',
        overwrite: true
      });
    });
  });
});
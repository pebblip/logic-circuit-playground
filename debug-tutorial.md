# Tutorial Debug Instructions

## デバッグ手順

1. アプリケーションを起動
2. ブラウザの開発者コンソールを開く (F12 or Cmd+Option+I)
3. 学習モードに切り替える
4. NANDゲートまたはSRラッチのチュートリアルをクリック

## 期待されるコンソールログ

1. `handleStartChallenge called with: nand_from_basic` (または `sr_latch_nor`)
2. `Current level: 1`
3. `Found challenge: {id: "nand_from_basic", ...}`
4. `Available tutorial steps: ["nand_from_basic", "sr_latch_nor"]`
5. `Starting construction tutorial for: nand_from_basic`
6. `Tutorial steps exist? true`
7. `startTutorial called with: nand_from_basic`
8. `Setting currentTutorial to: nand_from_basic`
9. `Tutorial started successfully`
10. `getCurrentTutorialStep called`
11. `Tutorial state: {currentTutorial: "nand_from_basic", ...}`

## 問題の可能性

1. チュートリアルステップが正しく設定されていない
2. currentStepがnullになっている
3. TutorialPanelのレンダリング条件が満たされていない

## 確認事項

- コンソールにエラーが表示されていないか
- どのログメッセージまで表示されているか
- Tutorial stateのcurrentStepがnullかどうか
import React, { useState, useEffect, useRef } from 'react';

interface TutorialSystemV2Props {
  onComplete: () => void;
  onSkip: () => void;
}

/**
 * 改良版チュートリアルシステム
 * - パネルは画面下部に固定
 * - 操作対象をハイライト表示
 * - シンプルな流れ（ANDゲート説明を削除）
 */
const TutorialSystemV2: React.FC<TutorialSystemV2Props> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [highlightRect, setHighlightRect] = useState(null);
  const highlightCheckInterval = useRef(null);
  
  // チュートリアルのステップ定義（シンプル化）
  const tutorialSteps = [
    {
      id: 'welcome',
      title: 'ようこそ！',
      content: '論理回路プレイグラウンドへようこそ！\nここでは、コンピュータの基礎となる論理回路を楽しく学べます。',
      target: null,
      action: null
    },
    {
      id: 'toolbar',
      title: 'ツールバー',
      content: 'ここにあるボタンをクリックすると、ゲートを配置できます。',
      target: '[data-tutorial-target="toolbar"]',
      highlight: true
    },
    {
      id: 'place-input',
      title: '入力ゲートを配置',
      content: '「入力」ボタンをクリックして、入力ゲートを配置してみましょう！',
      target: 'button:contains("入力")',
      highlight: true,
      waitFor: 'INPUT_PLACED'
    },
    {
      id: 'toggle-input',
      title: '入力を切り替え',
      content: '配置した入力ゲートをクリックすると、ON/OFFを切り替えられます。\n赤い丸をクリックしてみてください。',
      target: 'g[data-gate-type="INPUT"]',
      highlight: true,
      waitFor: 'INPUT_TOGGLED'
    },
    {
      id: 'place-output',
      title: '出力ゲートを配置',
      content: '次に「出力」ボタンをクリックして、出力ゲートを配置しましょう。',
      target: 'button:contains("出力")',
      highlight: true,
      waitFor: 'OUTPUT_PLACED'
    },
    {
      id: 'connect-wire',
      title: 'ワイヤーで接続',
      content: '入力ゲートの右側の端子から出力ゲートの左側の端子へドラッグして接続します。',
      target: null,
      waitFor: 'WIRE_CONNECTED'
    },
    {
      id: 'complete',
      title: 'チュートリアル完了！',
      content: 'おめでとうございます！\n基本的な操作を習得しました。\n次はチャレンジ問題に挑戦してみましょう！',
      target: null
    }
  ];

  const currentStepData = tutorialSteps[currentStep];

  // 次のステップへ
  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  // 前のステップへ
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // スキップ
  const handleSkip = () => {
    setIsActive(false);
    onSkip();
  };

  // ハイライト対象の要素を探して位置を更新
  const updateHighlight = () => {
    if (!currentStepData.highlight || !currentStepData.target) {
      setHighlightRect(null);
      return;
    }

    // セレクタに基づいて要素を探す
    let element = null;
    
    if (currentStepData.target.includes(':contains')) {
      // :contains疑似セレクタの処理
      const [selector, text] = currentStepData.target.split(':contains("');
      const searchText = text.replace('")', '');
      const elements = document.querySelectorAll(selector || 'button');
      element = Array.from(elements).find(el => el.textContent.includes(searchText));
    } else {
      element = document.querySelector(currentStepData.target);
    }

    if (element) {
      const rect = element.getBoundingClientRect();
      setHighlightRect({
        top: rect.top - 5,
        left: rect.left - 5,
        width: rect.width + 10,
        height: rect.height + 10
      });
    } else {
      setHighlightRect(null);
    }
  };

  // ハイライトの位置を定期的に更新（要素が動く可能性があるため）
  useEffect(() => {
    updateHighlight();
    
    highlightCheckInterval.current = setInterval(updateHighlight, 100);
    
    return () => {
      if (highlightCheckInterval.current) {
        clearInterval(highlightCheckInterval.current);
      }
    };
  }, [currentStep, currentStepData]);

  // イベントリスナー（ユーザーアクションを待つステップ用）
  useEffect(() => {
    if (!currentStepData.waitFor) return;

    const handleAction = (event) => {
      if (event.detail.action === currentStepData.waitFor) {
        setTimeout(nextStep, 500); // 少し待ってから次へ
      }
    };

    window.addEventListener('tutorial-action', handleAction);
    return () => window.removeEventListener('tutorial-action', handleAction);
  }, [currentStep, currentStepData]);

  if (!isActive) return null;

  return (
    <>
      {/* オーバーレイ（ハイライト以外を暗くする） */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        zIndex: 998,
        pointerEvents: currentStepData.waitFor ? 'none' : 'auto'
      }} onClick={currentStepData.waitFor ? null : handleSkip} />

      {/* ハイライト */}
      {highlightRect && (
        <div style={{
          position: 'fixed',
          ...highlightRect,
          border: '3px solid #00ff88',
          borderRadius: '8px',
          backgroundColor: 'transparent',
          zIndex: 999,
          pointerEvents: 'none',
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.3)',
          animation: 'pulse 2s infinite'
        }} />
      )}
      
      {/* パルスアニメーション用のスタイル */}
      <style>
        {`
          @keyframes pulse {
            0% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.3), 0 0 0 0 rgba(0, 255, 136, 0.4); }
            50% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.3), 0 0 0 10px rgba(0, 255, 136, 0); }
            100% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.3), 0 0 0 0 rgba(0, 255, 136, 0); }
          }
        `}
      </style>

      {/* チュートリアルパネル（画面下部に固定） */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '20px 30px',
        borderRadius: '12px',
        maxWidth: '600px',
        width: '90%',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(0, 255, 136, 0.5)',
        pointerEvents: 'auto'
      }}>
        <h3 style={{
          margin: '0 0 12px 0',
          fontSize: '20px',
          fontWeight: '600',
          color: '#00ff88'
        }}>
          {currentStepData.title}
        </h3>
        
        <p style={{
          margin: '0 0 20px 0',
          fontSize: '16px',
          lineHeight: '1.6',
          whiteSpace: 'pre-line'
        }}>
          {currentStepData.content}
        </p>

        {/* 進捗インジケーター */}
        <div style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '16px'
        }}>
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              style={{
                flex: 1,
                height: '4px',
                backgroundColor: index <= currentStep ? '#00ff88' : 'rgba(255, 255, 255, 0.2)',
                borderRadius: '2px',
                transition: 'background-color 0.3s'
              }}
            />
          ))}
        </div>

        {/* ボタン */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={handleSkip}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: 'rgba(255, 255, 255, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            スキップ
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            {currentStep > 0 && !currentStepData.waitFor && (
              <button
                onClick={prevStep}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                戻る
              </button>
            )}
            
            {!currentStepData.waitFor && (
              <button
                onClick={nextStep}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#00ff88',
                  color: '#000',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                {currentStep === tutorialSteps.length - 1 ? '完了' : '次へ'}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TutorialSystemV2;
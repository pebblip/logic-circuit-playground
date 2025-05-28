import React, { useState, useEffect } from 'react';

interface TutorialSystemProps {
  onComplete: () => void;
  onSkip: () => void;
}

/**
 * チュートリアルシステム
 * 初心者向けのステップバイステップガイド
 */
const TutorialSystem: React.FC<TutorialSystemProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(true);
  
  // チュートリアルのステップ定義
  const tutorialSteps = [
    {
      id: 'welcome',
      title: 'ようこそ！',
      content: '論理回路プレイグラウンドへようこそ！\nここでは、コンピュータの基礎となる論理回路を楽しく学べます。',
      target: null,
      action: null,
      position: 'center'
    },
    {
      id: 'toolbar',
      title: 'ツールバー',
      content: 'ここにあるボタンをクリックすると、ゲートを配置できます。',
      target: 'toolbar',
      position: 'right'
    },
    {
      id: 'place-input',
      title: '入力ゲートを配置',
      content: '「入力」ボタンをクリックして、入力ゲートを配置してみましょう！',
      target: 'input-button',
      position: 'right',
      waitFor: 'INPUT_PLACED'
    },
    {
      id: 'toggle-input',
      title: '入力を切り替え',
      content: '配置した入力ゲートをクリックすると、ON/OFFを切り替えられます。',
      target: 'input-gate',
      position: 'right',
      waitFor: 'INPUT_TOGGLED'
    },
    {
      id: 'place-output',
      title: '出力ゲートを配置',
      content: '次に「出力」ボタンをクリックして、出力ゲートを配置しましょう。',
      target: 'output-button',
      position: 'right',
      waitFor: 'OUTPUT_PLACED'
    },
    {
      id: 'connect-wire',
      title: 'ワイヤーで接続',
      content: '入力ゲートの右側の端子から出力ゲートの左側の端子へドラッグして接続します。',
      target: 'canvas',
      position: 'top',
      waitFor: 'WIRE_CONNECTED'
    },
    {
      id: 'signal-flow',
      title: '信号の流れ',
      content: '素晴らしい！入力がONの時、信号が出力まで流れているのが見えますね。',
      target: null,
      position: 'center'
    },
    {
      id: 'and-gate',
      title: 'ANDゲート',
      content: 'ANDゲートは、すべての入力がONの時だけ出力がONになります。\n試してみましょう！',
      target: 'and-button',
      position: 'right'
    },
    {
      id: 'complete',
      title: 'チュートリアル完了！',
      content: 'おめでとうございます！\n基本的な操作を習得しました。\n次はチャレンジ問題に挑戦してみましょう！',
      target: null,
      position: 'center'
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

  // ポジション計算
  const getPosition = () => {
    const pos = currentStepData.position;
    const base = {
      zIndex: 1000,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '20px',
      borderRadius: '12px',
      maxWidth: '400px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(0, 255, 136, 0.5)'
    };

    switch (pos) {
      case 'center':
        return {
          ...base,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        };
      case 'right':
        return {
          ...base,
          top: currentStepData.target === 'toolbar' ? '150px' : '50%',
          left: currentStepData.target === 'input-gate' ? '60%' : '100px',
          transform: currentStepData.target === 'input-gate' ? 'translateY(-50%)' : 'none'
        };
      case 'bottom':
        return {
          ...base,
          bottom: '100px',
          left: '50%',
          transform: 'translateX(-50%)'
        };
      case 'top':
        return {
          ...base,
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)'
        };
      default:
        return base;
    }
  };


  return (
    <>
      {/* オーバーレイ */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 999,
        pointerEvents: currentStepData.waitFor ? 'none' : 'auto'
      }} onClick={currentStepData.waitFor ? null : handleSkip} />

      {/* チュートリアルボックス */}
      <div style={{ 
        ...getPosition(), 
        position: 'fixed',
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

export default TutorialSystem;

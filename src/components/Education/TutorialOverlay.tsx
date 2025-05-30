import React, { useState, useEffect, useRef } from 'react';
import { AppMode } from '../../types/mode';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  target?: string; // CSS selector for highlight target
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: string; // Expected user action
  waitFor?: string; // Event to wait for
  skippable?: boolean;
}

interface TutorialOverlayProps {
  currentMode: AppMode;
  currentLesson: number;
  currentStep: number;
  onStepComplete: (stepId: string) => void;
  onTutorialComplete: () => void;
  onSkip: () => void;
  isActive: boolean;
}

// レッスン別チュートリアル定義
const TUTORIAL_LESSONS: Record<number, TutorialStep[]> = {
  1: [ // プレイグラウンドの基本操作
    {
      id: 'welcome',
      title: '🎉 ようこそ論理回路の世界へ！',
      content: 'このプレイグラウンドでは、コンピュータの心臓部である論理回路を楽しく学べます。\n\nまずは基本的な操作から始めましょう！',
      position: 'center',
      skippable: true
    },
    {
      id: 'toolbar-intro',
      title: '🔧 ツールバーを確認',
      content: '画面上部にあるツールバーには、様々なゲート（論理素子）が並んでいます。\n\nこれらをドラッグして回路を作っていきます。',
      target: '[data-testid="gate-palette"]',
      position: 'bottom'
    },
    {
      id: 'place-input',
      title: '📥 入力ゲートを配置してみよう',
      content: '「INPUT」ボタンをクリックして、キャンバスに入力ゲートを配置してください。\n\n入力ゲートは回路に信号を送る起点です。',
      target: 'button[data-gate-type="INPUT"]',
      action: 'place-gate',
      waitFor: 'GATE_PLACED'
    },
    {
      id: 'toggle-input',
      title: '🔄 入力を切り替えてみよう',
      content: '配置した入力ゲートをクリックすると、ON（1）とOFF（0）を切り替えられます。\n\n試しにクリックしてみてください！',
      target: 'g[data-gate-type="INPUT"]',
      action: 'toggle-input',
      waitFor: 'INPUT_TOGGLED'
    },
    {
      id: 'place-output',
      title: '📤 出力ゲートを配置',
      content: '次に「OUTPUT」ボタンをクリックして、出力ゲートを配置してください。\n\n出力ゲートは回路の結果を表示します。',
      target: 'button[data-gate-type="OUTPUT"]',
      action: 'place-gate',
      waitFor: 'OUTPUT_PLACED'
    }
  ],
  2: [ // ANDゲートの世界
    {
      id: 'and-intro',
      title: '🤝 ANDゲートの登場',
      content: 'ANDゲートは「両方の入力がONの時だけ、出力がONになる」特別なゲートです。\n\n論理回路の基本中の基本です！',
      position: 'center'
    },
    {
      id: 'place-and',
      title: '⚡ ANDゲートを配置',
      content: '「AND」ボタンをクリックして、ANDゲートを配置してみましょう。',
      target: 'button[data-gate-type="AND"]',
      action: 'place-gate',
      waitFor: 'AND_PLACED'
    },
    {
      id: 'connect-inputs',
      title: '🔗 回路を接続しよう',
      content: '入力ゲートの出力ピン（右側の点）からANDゲートの入力ピン（左側の点）にドラッグして接続してください。',
      target: 'g[data-gate-type="INPUT"] circle[data-pin-type="output"]',
      action: 'create-connection',
      waitFor: 'CONNECTION_CREATED'
    },
    {
      id: 'test-and-gate',
      title: '🧪 ANDゲートをテスト',
      content: '入力ゲートをクリックして、ANDゲートの動作を確認してみましょう。\n\n両方の入力がONの時だけ、出力がONになりますか？',
      action: 'test-logic',
      waitFor: 'LOGIC_TESTED'
    }
  ]
};

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  currentMode,
  currentLesson,
  currentStep,
  onStepComplete,
  onTutorialComplete,
  onSkip,
  isActive
}) => {
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const [overlayPosition, setOverlayPosition] = useState({ x: 0, y: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);
  const highlightCheckInterval = useRef<NodeJS.Timeout | null>(null);

  // 学習モード以外では表示しない
  if (currentMode !== 'learning' || !isActive) {
    return null;
  }

  const tutorialSteps = TUTORIAL_LESSONS[currentLesson] || [];
  const currentTutorialStep = tutorialSteps[currentStep];

  if (!currentTutorialStep) {
    return null;
  }

  // ターゲット要素のハイライト処理
  useEffect(() => {
    if (currentTutorialStep.target) {
      const updateHighlight = () => {
        const targetElement = document.querySelector(currentTutorialStep.target!);
        if (targetElement) {
          const rect = targetElement.getBoundingClientRect();
          setHighlightRect(rect);
          
          // オーバーレイの位置を計算
          const position = currentTutorialStep.position || 'bottom';
          let x = rect.left + rect.width / 2;
          let y = rect.bottom + 20;
          
          switch (position) {
            case 'top':
              y = rect.top - 20;
              break;
            case 'left':
              x = rect.left - 20;
              y = rect.top + rect.height / 2;
              break;
            case 'right':
              x = rect.right + 20;
              y = rect.top + rect.height / 2;
              break;
            case 'center':
              x = window.innerWidth / 2;
              y = window.innerHeight / 2;
              break;
          }
          
          setOverlayPosition({ x, y });
        }
      };

      updateHighlight();
      highlightCheckInterval.current = setInterval(updateHighlight, 100);
    } else {
      setHighlightRect(null);
      setOverlayPosition({ 
        x: window.innerWidth / 2, 
        y: window.innerHeight / 2 
      });
    }

    return () => {
      if (highlightCheckInterval.current) {
        clearInterval(highlightCheckInterval.current);
      }
    };
  }, [currentTutorialStep]);

  // ステップ進行処理
  const handleNext = () => {
    onStepComplete(currentTutorialStep.id);
  };

  const handleSkip = () => {
    onSkip();
  };

  const handleComplete = () => {
    onTutorialComplete();
  };

  const isLastStep = currentStep >= tutorialSteps.length - 1;
  const progressPercentage = ((currentStep + 1) / tutorialSteps.length) * 100;

  return (
    <>
      {/* ダークオーバーレイ */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.7)',
          zIndex: 1000,
          pointerEvents: 'none'
        }}
      />

      {/* ハイライト領域 */}
      {highlightRect && (
        <div
          style={{
            position: 'fixed',
            top: highlightRect.top - 8,
            left: highlightRect.left - 8,
            width: highlightRect.width + 16,
            height: highlightRect.height + 16,
            border: '3px solid #3b82f6',
            borderRadius: '8px',
            background: 'rgba(59, 130, 246, 0.1)',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
            zIndex: 1001,
            pointerEvents: 'none',
            animation: 'pulse 2s infinite'
          }}
        />
      )}

      {/* チュートリアルパネル */}
      <div
        ref={overlayRef}
        style={{
          position: 'fixed',
          left: overlayPosition.x,
          top: overlayPosition.y,
          transform: 'translate(-50%, -50%)',
          maxWidth: '400px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          zIndex: 1002,
          overflow: 'hidden',
          animation: 'slideIn 0.3s ease-out'
        }}
      >
        {/* ヘッダー */}
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          color: 'white',
          padding: '20px',
          position: 'relative'
        }}>
          {/* プログレスバー */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '4px',
            width: `${progressPercentage}%`,
            background: 'linear-gradient(90deg, #10b981, #34d399)',
            transition: 'width 0.3s ease'
          }} />

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '12px'
          }}>
            <div style={{
              fontSize: '18px',
              fontWeight: '700',
              lineHeight: '1.3'
            }}>
              {currentTutorialStep.title}
            </div>
            
            <div style={{
              fontSize: '12px',
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '4px 8px',
              borderRadius: '12px'
            }}>
              {currentStep + 1}/{tutorialSteps.length}
            </div>
          </div>

          <div style={{
            fontSize: '14px',
            lineHeight: '1.5',
            opacity: 0.95,
            whiteSpace: 'pre-line'
          }}>
            {currentTutorialStep.content}
          </div>
        </div>

        {/* フッター */}
        <div style={{
          padding: '20px',
          background: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px'
        }}>
          {/* スキップボタン */}
          {currentTutorialStep.skippable && (
            <button
              onClick={handleSkip}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#6b7280',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              スキップ
            </button>
          )}

          <div style={{ flex: 1 }} />

          {/* 次へ/完了ボタン */}
          <button
            onClick={isLastStep ? handleComplete : handleNext}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {isLastStep ? (
              <>
                <span>完了</span>
                <span>🎉</span>
              </>
            ) : (
              <>
                <span>次へ</span>
                <span>→</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* アニメーションスタイル */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          50% {
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 0 8px rgba(59, 130, 246, 0.3);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </>
  );
};
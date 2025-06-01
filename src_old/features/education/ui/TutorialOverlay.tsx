import React, { useState, useEffect, useRef } from 'react';
import { AppMode } from '../../../entities/types/mode';

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
      content: '画面左側にあるツールパレットには、様々なゲート（論理素子）が並んでいます。\n\nこれらをクリックして回路を作っていきます。',
      target: '.gate-palette',
      position: 'right'
    },
    {
      id: 'place-input',
      title: '📥 入力ゲートを配置してみよう',
      content: '「入力」ボタンをクリックして、キャンバスに入力ゲートを配置してください。\n\n入力ゲートは回路に信号を送る起点です。',
      target: 'button:has-text("入力")',
      action: 'place-gate',
      waitFor: 'GATE_PLACED'
    },
    {
      id: 'drag-input',
      title: '✋ ゲートを動かしてみよう',
      content: '配置したゲートはドラッグで移動できます。\n\n好きな位置に配置してみてください！',
      target: 'g[data-gate-type="INPUT"]',
      action: 'drag-gate'
    },
    {
      id: 'toggle-input',
      title: '🔄 入力を切り替えてみよう',
      content: '入力ゲートをクリックすると、ON（1）とOFF（0）を切り替えられます。\n\n赤色がON、グレーがOFFです。試してみてください！',
      target: 'g[data-gate-type="INPUT"]',
      action: 'toggle-input',
      waitFor: 'INPUT_TOGGLED'
    },
    {
      id: 'place-output',
      title: '📤 出力ゲートを配置',
      content: '次に「出力」ボタンをクリックして、出力ゲートを配置してください。\n\n出力ゲートは回路の結果を表示します。',
      target: 'button:has-text("出力")',
      action: 'place-gate',
      waitFor: 'OUTPUT_PLACED'
    },
    {
      id: 'connect-wire',
      title: '🔗 ワイヤーで接続しよう',
      content: '入力ゲートの右側の点（出力ピン）から、出力ゲートの左側の点（入力ピン）へドラッグして接続してください。\n\n接続すると信号が伝わります！',
      target: 'g[data-gate-type="INPUT"] circle.output-pin',
      action: 'create-connection',
      waitFor: 'CONNECTION_CREATED'
    },
    {
      id: 'test-signal',
      title: '⚡ 信号を確認しよう',
      content: '入力ゲートをクリックしてON/OFFを切り替えると、出力ゲートにも反映されます。\n\nこれが論理回路の基本です！',
      action: 'test-circuit'
    },
    {
      id: 'delete-practice',
      title: '🗑️ 削除の練習',
      content: 'ゲートやワイヤーをクリックして選択し、Deleteキーで削除できます。\n\nまたは右クリックメニューからも削除できます。',
      action: 'practice-delete'
    },
    {
      id: 'lesson1-complete',
      title: '🎊 レッスン1完了！',
      content: 'お疲れさまでした！基本操作をマスターしました。\n\n次のレッスンでは、論理ゲートについて学びます。',
      position: 'center',
      skippable: true
    }
  ],
  2: [ // ANDゲートの世界
    {
      id: 'and-intro',
      title: '🤝 論理ゲートを学ぼう',
      content: '論理ゲートは、入力信号を処理して出力を決める部品です。\n\n今回は「ANDゲート」について学びます！',
      position: 'center',
      skippable: true
    },
    {
      id: 'and-explanation',
      title: '📚 ANDゲートとは？',
      content: 'ANDゲートは「すべての入力がONの時だけ、出力がONになる」ゲートです。\n\n例：「雨が降っていない」AND「時間がある」= 散歩に行ける',
      position: 'center'
    },
    {
      id: 'place-inputs-for-and',
      title: '📥 入力を2つ配置',
      content: 'まず、入力ゲートを2つ配置してください。\n\nANDゲートには2つの入力が必要です。',
      target: 'button:has-text("入力")',
      action: 'place-two-gates',
      waitFor: 'INPUTS_PLACED'
    },
    {
      id: 'place-and',
      title: '⚡ ANDゲートを配置',
      content: '「AND」ボタンをクリックして、ANDゲートを配置してみましょう。',
      target: 'button:has-text("AND")',
      action: 'place-gate',
      waitFor: 'AND_PLACED'
    },
    {
      id: 'place-output-for-and',
      title: '📤 出力ゲートを配置',
      content: '結果を確認するため、出力ゲートも配置しましょう。',
      target: 'button:has-text("出力")',
      action: 'place-gate',
      waitFor: 'OUTPUT_PLACED'
    },
    {
      id: 'connect-first-input',
      title: '🔗 1つ目の入力を接続',
      content: '上の入力ゲートからANDゲートの上側の入力ピンへ接続してください。',
      target: 'g[data-gate-type="INPUT"]:first-of-type circle.output-pin',
      action: 'create-connection',
      waitFor: 'FIRST_CONNECTION'
    },
    {
      id: 'connect-second-input',
      title: '🔗 2つ目の入力を接続',
      content: '下の入力ゲートからANDゲートの下側の入力ピンへ接続してください。',
      target: 'g[data-gate-type="INPUT"]:last-of-type circle.output-pin',
      action: 'create-connection',
      waitFor: 'SECOND_CONNECTION'
    },
    {
      id: 'connect-and-output',
      title: '🔗 出力を接続',
      content: 'ANDゲートの出力ピンから出力ゲートへ接続してください。',
      target: 'g[data-gate-type="AND"] circle.output-pin',
      action: 'create-connection',
      waitFor: 'OUTPUT_CONNECTION'
    },
    {
      id: 'test-and-00',
      title: '🧪 テスト1: 両方OFF',
      content: '両方の入力をOFF（グレー）にしてください。\n\n出力はどうなりますか？',
      action: 'test-and-logic',
      waitFor: 'TEST_00_COMPLETE'
    },
    {
      id: 'test-and-01',
      title: '🧪 テスト2: 片方だけON',
      content: '片方の入力だけON（赤）にしてください。\n\n出力はまだOFFのはずです。',
      action: 'test-and-logic',
      waitFor: 'TEST_01_COMPLETE'
    },
    {
      id: 'test-and-11',
      title: '🧪 テスト3: 両方ON',
      content: '両方の入力をON（赤）にしてください。\n\n今度は出力もONになりましたね！',
      action: 'test-and-logic',
      waitFor: 'TEST_11_COMPLETE'
    },
    {
      id: 'and-truth-table',
      title: '📊 真理値表',
      content: 'ANDゲートの真理値表:\n\n入力A | 入力B | 出力\n  0   |   0   |  0\n  0   |   1   |  0\n  1   |   0   |  0\n  1   |   1   |  1',
      position: 'center'
    },
    {
      id: 'lesson2-complete',
      title: '🎊 レッスン2完了！',
      content: 'ANDゲートの動作を理解できました！\n\n次はORゲートやNOTゲートなど、他の論理ゲートも学んでいきましょう。',
      position: 'center',
      skippable: true
    }
  ],
  3: [ // ORゲートとNOTゲート
    {
      id: 'or-intro',
      title: '🔀 ORゲートを学ぼう',
      content: 'ORゲートは「どれか1つでも入力がONなら、出力がONになる」ゲートです。\n\n例：「電車で行く」OR「バスで行く」= 会場に到着できる',
      position: 'center',
      skippable: true
    },
    {
      id: 'create-or-circuit',
      title: '🛠️ OR回路を作ろう',
      content: '前回と同じように、2つの入力、ORゲート、出力を配置して接続してください。',
      action: 'create-or-circuit'
    },
    {
      id: 'test-or-gate',
      title: '🧪 ORゲートをテスト',
      content: 'いろいろな入力パターンを試してみてください。\n\nどれか1つでもONなら出力がONになることを確認しましょう！',
      action: 'test-or-logic'
    },
    {
      id: 'not-intro',
      title: '🔄 NOTゲートを学ぼう',
      content: 'NOTゲートは「入力を反転する」ゲートです。\n\nONならOFF、OFFならONを出力します。',
      position: 'center'
    },
    {
      id: 'create-not-circuit',
      title: '🛠️ NOT回路を作ろう',
      content: '1つの入力、NOTゲート、出力を配置して接続してください。\n\nNOTゲートは入力が1つだけです。',
      action: 'create-not-circuit'
    },
    {
      id: 'test-not-gate',
      title: '🧪 反転を確認',
      content: '入力をON/OFFして、出力が反転することを確認してください。',
      action: 'test-not-logic'
    },
    {
      id: 'lesson3-complete',
      title: '🎊 基本ゲート完了！',
      content: 'AND、OR、NOTの3つの基本ゲートをマスターしました！\n\nこれらを組み合わせると、どんな論理回路も作れます。',
      position: 'center',
      skippable: true
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

  const tutorialSteps = TUTORIAL_LESSONS[currentLesson] || [];
  const currentTutorialStep = tutorialSteps[currentStep];

  // ターゲット要素のハイライト処理
  useEffect(() => {
    if (currentTutorialStep?.target) {
      const updateHighlight = () => {
        const targetElement = document.querySelector(currentTutorialStep?.target || '');
        if (targetElement) {
          const rect = targetElement.getBoundingClientRect();
          setHighlightRect(rect);
          
          // TODO: ユーザーアクションの検出を実装
          if (currentTutorialStep.waitFor) {
            console.log(`TODO: "${currentTutorialStep.waitFor}"イベントの検出機能は未実装です`);
          }
          
          // オーバーレイの位置を計算
          const position = currentTutorialStep?.position || 'bottom';
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
    // TODO: 実際のステップ進行機能を実装
    const message = 'TODO: ステップ進行機能は未実装です。\n\n現在の実装:\n- チュートリアルコンテンツの表示 ✅\n- スキップ機能 ✅\n\n未実装:\n- 次のステップへの遷移\n- ユーザーアクションの検出\n- ステップ完了の判定';
    
    // テスト環境の判定とアラート表示
    const isTestEnv = process.env.NODE_ENV === 'test' || typeof window === 'undefined' || !window.alert;
    
    if (!isTestEnv) {
      alert(message);
    } else {
      console.log(message);
    }
    
    if (currentTutorialStep) {
      onStepComplete(currentTutorialStep.id);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const handleComplete = () => {
    onTutorialComplete();
  };

  const isLastStep = currentStep >= tutorialSteps.length - 1;
  const progressPercentage = ((currentStep + 1) / tutorialSteps.length) * 100;

  // 学習モード以外では表示しない
  const shouldShow = currentMode === 'learning' && isActive && currentTutorialStep;

  if (!shouldShow) {
    return null;
  }

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
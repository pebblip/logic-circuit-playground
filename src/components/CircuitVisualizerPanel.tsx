import React, { useState, useEffect, useMemo } from 'react';
import { useCircuitStore } from '../stores/circuitStore';
import type { CircuitPattern } from '../services/CircuitPatternRecognizer';
import { circuitPatternRecognizer } from '../services/CircuitPatternRecognizer';
import { LEDCounterVisualizer } from './visualizers/LEDCounterVisualizer';
import './CircuitVisualizerPanel.css';

interface CircuitVisualizerPanelProps {
  isVisible: boolean;
  onClose: () => void;
  onGateHighlight?: (gateId: string) => void;
  onGateUnhighlight?: () => void;
}

export const CircuitVisualizerPanel: React.FC<CircuitVisualizerPanelProps> = ({
  isVisible,
  onClose,
  onGateHighlight,
  onGateUnhighlight,
}) => {
  const { gates, wires } = useCircuitStore();
  const [recognizedPattern, setRecognizedPattern] =
    useState<CircuitPattern | null>(null);
  const [_isAnalyzing, _setIsAnalyzing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenHint, setShowFullscreenHint] = useState(false);

  // 回路パターン認識（依存配列を最適化）
  const currentPattern = useMemo(() => {
    if (gates.length === 0) return null;

    // ゲートとワイヤーの実質的な変更のみを検出
    const _gateSignature = gates
      .map(g => `${g.id}-${g.type}-${g.output}`)
      .join('|');
    const _wireSignature = wires
      .map(w => `${w.from.gateId}-${w.to.gateId}`)
      .join('|');

    return circuitPatternRecognizer.recognizePattern(gates, wires);
  }, [gates.length, gates.map(g => g.output).join(','), wires.length]);

  useEffect(() => {
    if (currentPattern && currentPattern.confidence > 70) {
      setRecognizedPattern(currentPattern);
    } else {
      setRecognizedPattern(null);
    }
  }, [currentPattern]);

  const renderVisualizer = () => {
    if (!recognizedPattern) {
      return (
        <div className="no-pattern">
          <div className="no-pattern-icon">🔍</div>
          <h3>回路パターンを探しています...</h3>
          <p>
            認識可能な回路を作成すると、ここに美しいビジュアライザーが表示されます！
          </p>
          <div className="pattern-hints">
            <h4>💡 試してみてください:</h4>
            <ul>
              <li>
                🔢 <strong>LEDカウンタ</strong>: CLOCK + OUTPUT×2-8個
              </li>
              <li>
                🕐 <strong>デジタル時計</strong> (準備中)
              </li>
              <li>
                🚦 <strong>信号機制御</strong> (準備中)
              </li>
            </ul>
          </div>
        </div>
      );
    }

    switch (recognizedPattern.type) {
      case 'led-counter':
        return (
          <LEDCounterVisualizer
            pattern={recognizedPattern as any}
            onGateHighlight={onGateHighlight}
            onGateUnhighlight={onGateUnhighlight}
          />
        );
      default:
        return (
          <div className="unknown-pattern">
            <h3>認識できない回路です</h3>
            <p>このパターンはまだサポートされていません。</p>
          </div>
        );
    }
  };

  // ESCキーでフルスクリーンを終了
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isFullscreen]);

  if (!isVisible) return null;

  return (
    <div
      className={`circuit-visualizer-panel ${isFullscreen ? 'fullscreen' : ''}`}
      onMouseEnter={() => !isFullscreen && setShowFullscreenHint(true)}
      onMouseLeave={() => setShowFullscreenHint(false)}
    >
      {/* フルスクリーンヒント */}
      {showFullscreenHint && !isFullscreen && (
        <div className="fullscreen-hint" onClick={() => setIsFullscreen(true)}>
          <div className="hint-content">
            <span className="hint-icon">⛶</span>
            <span className="hint-text">クリックで全画面表示</span>
          </div>
        </div>
      )}

      <div className="panel-header">
        <div className="panel-title">
          <span className="title-icon">🎯</span>
          <h2>回路ビジュアライザー</h2>
        </div>

        <div className="panel-controls">
          {recognizedPattern && (
            <div className="pattern-info">
              <div className="confidence-badge">
                信頼度: {recognizedPattern.confidence}%
              </div>
              <div className="pattern-description">
                {recognizedPattern.description}
              </div>
            </div>
          )}

          {isFullscreen && (
            <button
              className="exit-fullscreen-button"
              onClick={() => setIsFullscreen(false)}
              title="通常表示に戻る"
            >
              <span className="exit-icon">×</span>
              <span className="exit-text">ESC</span>
            </button>
          )}

          {!isFullscreen && (
            <button
              className="close-button"
              onClick={onClose}
              title="ビジュアライザーを閉じる"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="visualizer-content">{renderVisualizer()}</div>

      {recognizedPattern && (
        <div className="panel-footer">
          <div className="educational-note">
            💡 <strong>ヒント:</strong> マウスを各要素にホバーすると、
            対応する回路部分がハイライトされます！
          </div>
        </div>
      )}
    </div>
  );
};

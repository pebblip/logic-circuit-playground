import React, { useState, useMemo } from 'react';
import { CounterPattern } from '../../services/CircuitPatternRecognizer';
import './LEDCounterVisualizer.css';

interface LEDCounterVisualizerProps {
  pattern: CounterPattern;
  onGateHighlight?: (gateId: string) => void;
  onGateUnhighlight?: () => void;
}

export const LEDCounterVisualizer: React.FC<LEDCounterVisualizerProps> = ({
  pattern,
  onGateHighlight,
  onGateUnhighlight
}) => {
  const { bitCount, outputGates, maxValue } = pattern.metadata;
  const [displayMode, setDisplayMode] = useState<'decimal' | 'hex' | 'binary'>('decimal');
  const [countDirection, setCountDirection] = useState<'up' | 'down'>('up');
  const [showTooltip, setShowTooltip] = useState(false);

  // 各OUTPUTゲートの状態から二進数と十進数を計算
  const { binaryStates, decimalValue, binaryString } = useMemo(() => {
    // 出力ゲートをX座標でソート（左から右へ、MSBからLSBへ）
    const sortedOutputs = [...outputGates].sort((a, b) => a.position.x - b.position.x);
    
    const states = sortedOutputs.map(gate => gate.output || false);
    const binary = states.map(state => state ? '1' : '0').join('');
    const decimal = states.reduce((acc, state, index) => {
      return acc + (state ? Math.pow(2, bitCount - 1 - index) : 0);
    }, 0);

    return {
      binaryStates: states,
      decimalValue: decimal,
      binaryString: binary
    };
  }, [outputGates, bitCount]);

  const handleLEDMouseEnter = (index: number) => {
    const gate = outputGates[index];
    if (gate && onGateHighlight) {
      onGateHighlight(gate.id);
    }
  };

  const handleLEDMouseLeave = () => {
    if (onGateUnhighlight) {
      onGateUnhighlight();
    }
  };

  return (
    <div className="led-counter-visualizer">
      <div className="visualizer-header">
        <h3>🔢 LEDカウンタ</h3>
        <div className="counter-info">
          {bitCount}ビット (0-{maxValue})
        </div>
      </div>

      {/* メインカウンタ表示 */}
      <div className="main-counter">
        <div className="decimal-display">
          <div className="decimal-number">{decimalValue}</div>
          <div className="decimal-label">現在の値</div>
        </div>
        
        <div className="conversion-arrow">
          <span>⬇️</span>
          <div className="conversion-label">二進数から変換</div>
        </div>
      </div>

      {/* LED表示 */}
      <div className="led-display">
        <div className="led-row">
          {binaryStates.map((isOn, index) => (
            <div key={index} className="led-container">
              <div
                className={`led ${isOn ? 'on' : 'off'}`}
                onMouseEnter={() => handleLEDMouseEnter(index)}
                onMouseLeave={handleLEDMouseLeave}
              >
                <div className="led-inner" />
                <div className="led-glow" />
              </div>
              <div className="led-label">
                <div className="bit-position">2^{bitCount - 1 - index}</div>
                <div className="bit-value">{isOn ? '1' : '0'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 二進数表示 */}
      <div className="binary-display">
        <div className="binary-label">二進数:</div>
        <div className="binary-value">
          {binaryString.split('').map((bit, index) => (
            <span 
              key={index} 
              className={`binary-bit ${bit === '1' ? 'active' : ''}`}
              onMouseEnter={() => handleLEDMouseEnter(index)}
              onMouseLeave={handleLEDMouseLeave}
            >
              {bit}
            </span>
          ))}
        </div>
      </div>

      {/* 計算説明 */}
      {displayMode === 'decimal' && (
        <div className="calculation-breakdown">
          <div className="calculation-title">💡 計算方法:</div>
          <div className="calculation-steps">
            {binaryStates.map((isOn, index) => {
              const power = bitCount - 1 - index;
              const value = isOn ? Math.pow(2, power) : 0;
              return (
                <div 
                  key={index} 
                  className={`calculation-step ${isOn ? 'active' : 'inactive'}`}
                  onMouseEnter={() => handleLEDMouseEnter(index)}
                  onMouseLeave={handleLEDMouseLeave}
                >
                  <span className="bit-part">{isOn ? '1' : '0'}</span>
                  <span className="multiply">×</span>
                  <span className="power">2^{power}</span>
                  <span className="equals">=</span>
                  <span className="result">{value}</span>
                </div>
              );
            })}
          </div>
          <div className="final-sum">
            合計: {binaryStates.map((isOn, index) => {
              const power = bitCount - 1 - index;
              return isOn ? Math.pow(2, power) : 0;
            }).filter(v => v > 0).join(' + ')} = <strong>{decimalValue}</strong>
          </div>
        </div>
      )}
      
      {/* 16進数変換説明 */}
      {displayMode === 'hex' && (
        <div className="calculation-breakdown hex-explanation">
          <div className="calculation-title">🅰️ 16進数変換:</div>
          <div className="hex-content">
            <div className="hex-conversion">
              {decimalValue} ÷ 16 = {Math.floor(decimalValue / 16)} 余り {decimalValue % 16}
              {decimalValue % 16 > 9 && ` (${(decimalValue % 16).toString(16).toUpperCase()})`}
            </div>
            <div className="hex-table">
              <div className="hex-note">0-9 = 0-9, 10-15 = A-F</div>
              <div className="hex-result">
                結果: <strong>0x{decimalValue.toString(16).toUpperCase()}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 進行状況 */}
      <div className="progress-indicator">
        <div className="progress-label">
          {countDirection === 'up' ? 'カウントアップ進行状況' : 'カウントダウン進行状況'}
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: countDirection === 'up' 
                ? `${(decimalValue / maxValue) * 100}%`
                : `${((maxValue - decimalValue) / maxValue) * 100}%`
            }}
          />
        </div>
        <div className="progress-text">
          {countDirection === 'up' 
            ? `${decimalValue} / ${maxValue} (${Math.round((decimalValue / maxValue) * 100)}%)`
            : `${decimalValue} / 0 (残り${Math.round(((maxValue - decimalValue) / maxValue) * 100)}%)`
          }
        </div>
      </div>
    </div>
  );
};
import React, { useMemo } from 'react';
import { useCircuitStore } from '../stores/circuitStore';
import { circuitPatternRecognizer } from '../services/CircuitPatternRecognizer';

interface CircuitVisualizerPanelProps {
  isVisible: boolean;
  onGateHighlight?: (gateId: string) => void;
  onGateUnhighlight?: () => void;
}

export const CircuitVisualizerPanel: React.FC<CircuitVisualizerPanelProps> = ({
  isVisible,
  onGateHighlight,
  onGateUnhighlight,
}) => {
  const { gates, wires } = useCircuitStore();

  // 回路パターン認識
  const currentPattern = useMemo(() => {
    if (gates.length === 0) return null;
    return circuitPatternRecognizer.recognizePattern(gates, wires);
  }, [gates, wires]);

  if (!isVisible) return null;

  const gateCount = gates.length;
  const wireCount = wires.length;
  const inputGates = gates.filter(g => g.type === 'INPUT');
  const outputGates = gates.filter(g => g.type === 'OUTPUT');
  const activeGates = gates.filter(g => g.output).length;

  // 入出力の状態を取得
  const _getBinaryInputs = () => {
    const inputs = inputGates.map(gate => (gate.output ? '1' : '0'));
    if (inputs.length === 0) return '未接続';
    return inputs.join('');
  };

  const getBinaryOutputs = () => {
    const outputs = outputGates.map(gate => (gate.output ? '1' : '0'));
    if (outputs.length === 0) return '未接続';
    return outputs.join('');
  };

  // 出力の10進数値を計算（LEDカウンタの場合）
  const getDecimalValue = () => {
    if (outputGates.length === 0) return 0;
    const sortedOutputs = [...outputGates].sort(
      (a, b) => a.position.x - b.position.x
    );
    return sortedOutputs.reduce((acc, gate, index) => {
      return (
        acc + (gate.output ? Math.pow(2, outputGates.length - 1 - index) : 0)
      );
    }, 0);
  };

  const decimalValue = getDecimalValue();

  // LEDの表示用
  const renderLEDs = () => {
    if (outputGates.length === 0) return null;

    const sortedOutputs = [...outputGates].sort(
      (a, b) => a.position.x - b.position.x
    );

    return (
      <div
        style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
          margin: '16px 0',
        }}
      >
        {sortedOutputs.map((gate, index) => (
          <div
            key={gate.id}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: gate.output ? '#00ff88' : '#333',
              border: gate.output ? '2px solid #00ff88' : '2px solid #555',
              boxShadow: gate.output
                ? '0 0 12px rgba(0, 255, 136, 0.6)'
                : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={() => onGateHighlight?.(gate.id)}
            onMouseLeave={() => onGateUnhighlight?.()}
            title={`LED ${index + 1}: ${gate.output ? 'ON' : 'OFF'}`}
          />
        ))}
      </div>
    );
  };

  // パターン表示名の取得
  const getPatternDisplayName = (type: string): string => {
    switch (type) {
      case 'led-counter':
        return 'カウンター回路';
      case 'digital-clock':
        return 'デジタル時計';
      case 'traffic-light':
        return '信号機';
      case 'password-lock':
        return 'パスワードロック';
      default:
        return '回路';
    }
  };

  return (
    <div
      className="circuit-visualizer-panel"
      style={{
        background: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)',
        border: '1px solid rgba(0, 255, 136, 0.2)',
        borderRadius: '12px',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ヘッダー */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '18px' }}>📟</span>
        <h3
          style={{
            margin: 0,
            color: '#e6edf3',
            fontSize: '16px',
            fontWeight: '600',
          }}
          data-testid="circuit-monitor-title"
        >
          回路モニター
        </h3>
      </div>

      {/* メインコンテンツ */}
      <div style={{ flex: 1, padding: '20px', textAlign: 'center' }}>
        {gateCount === 0 ? (
          <div style={{ color: '#7d8590', padding: '40px 0' }} data-testid="circuit-monitor-empty-state">
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚡</div>
            <div style={{ fontSize: '14px' }} data-testid="circuit-monitor-empty-message">
              回路を作成すると
              <br />
              動作状況が表示されます
            </div>
          </div>
        ) : outputGates.length === 0 ? (
          <div style={{ color: '#7d8590', padding: '40px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💡</div>
            <div style={{ fontSize: '14px' }}>
              OUTPUT ゲートを追加すると
              <br />
              LED表示されます
            </div>
          </div>
        ) : (
          <>
            {/* 大きな数値表示 */}
            <div
              style={{
                fontSize: '72px',
                fontWeight: '700',
                color: '#00ff88',
                marginBottom: '8px',
                fontFamily: 'monospace',
              }}
            >
              {decimalValue}
            </div>

            <div
              style={{
                fontSize: '14px',
                color: '#7d8590',
                marginBottom: '20px',
              }}
            >
              現在の値
            </div>

            {/* LED表示 */}
            {renderLEDs()}

            {/* 2進数表示 */}
            <div
              style={{
                background: 'rgba(0, 255, 136, 0.1)',
                border: '1px solid rgba(0, 255, 136, 0.3)',
                borderRadius: '8px',
                padding: '12px',
                margin: '16px 0',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  color: '#7d8590',
                  marginBottom: '4px',
                }}
              >
                2進数:{' '}
                <span
                  style={{
                    fontFamily: 'monospace',
                    color: '#00ff88',
                    fontSize: '16px',
                    fontWeight: '600',
                  }}
                >
                  {getBinaryOutputs()}
                </span>
              </div>
            </div>

            {/* 基本情報 */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '6px',
                padding: '12px',
                fontSize: '12px',
                color: '#7d8590',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '4px',
                }}
              >
                <span>ゲート数</span>
                <span style={{ color: '#e6edf3' }}>{gateCount}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '4px',
                }}
              >
                <span>接続数</span>
                <span style={{ color: '#e6edf3' }}>{wireCount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>アクティブ</span>
                <span style={{ color: '#e6edf3' }}>{activeGates}</span>
              </div>
            </div>

            {/* パターン情報（あれば） */}
            {currentPattern && (
              <div
                style={{
                  background: 'rgba(255, 165, 0, 0.1)',
                  border: '1px solid rgba(255, 165, 0, 0.3)',
                  borderRadius: '6px',
                  padding: '8px',
                  marginTop: '12px',
                  fontSize: '12px',
                  color: '#ffa657',
                }}
              >
                {getPatternDisplayName(currentPattern.type)}を検出
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

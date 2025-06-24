import React from 'react';
import type { Gate, Wire } from '@/types/circuit';

interface CircuitDiagnosticsProps {
  gates: Gate[];
  wires: Wire[];
  show?: boolean;
}

export const CircuitDiagnostics: React.FC<CircuitDiagnosticsProps> = ({
  gates,
  wires,
  show = false,
}) => {
  if (!show || import.meta.env.PROD) return null;

  const activeWires = wires.filter(w => w.isActive);
  const inputGates = gates.filter(g => g.type === 'INPUT');
  const outputGates = gates.filter(g => g.type === 'OUTPUT');

  return (
    <div
      style={{
        position: 'absolute',
        top: 10,
        right: 10,
        background: 'rgba(0, 0, 0, 0.8)',
        color: '#00ff88',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        fontFamily: 'monospace',
        maxWidth: '300px',
        zIndex: 1000,
      }}
    >
      <h4 style={{ margin: '0 0 10px 0' }}>回路診断</h4>

      <div style={{ marginBottom: '5px' }}>
        <strong>ゲート状態:</strong>
        {gates.map(g => (
          <div key={g.id} style={{ marginLeft: '10px' }}>
            {g.id} ({g.type}): {(g.outputs?.[0] ?? false) ? '✓' : '✗'}
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '5px' }}>
        <strong>アクティブワイヤー:</strong> {activeWires.length}/{wires.length}
        {activeWires.map(w => (
          <div key={w.id} style={{ marginLeft: '10px' }}>
            {w.from.gateId} → {w.to.gateId}
          </div>
        ))}
      </div>

      <div>
        <strong>入力:</strong>
        {inputGates.map(g => (
          <span key={g.id} style={{ marginLeft: '5px' }}>
            {g.id}:{(g.outputs?.[0] ?? false) ? '1' : '0'}
          </span>
        ))}
      </div>

      <div>
        <strong>出力:</strong>
        {outputGates.map(g => (
          <span key={g.id} style={{ marginLeft: '5px' }}>
            {g.id}:{g.inputs[0] ? '1' : '0'}
          </span>
        ))}
      </div>
    </div>
  );
};

import React from 'react';
import ReactDOM from 'react-dom';
import type { CustomGateDefinition, Gate, Wire } from '@/types/circuit';
import { GateComponent } from '../Gate';
import {
  getInputPinPosition,
  getOutputPinPosition,
} from '@/domain/analysis/pinPositionCalculator';

interface ViewCustomGateDialogProps {
  definition: CustomGateDefinition;
  onClose: () => void;
}

// 内部回路のワイヤー描画コンポーネント
const InternalWire: React.FC<{ wire: Wire; gates: Gate[] }> = ({ wire, gates }) => {
  const fromGate = gates.find(g => g.id === wire.from.gateId);
  const toGate = gates.find(g => g.id === wire.to.gateId);

  if (!fromGate || !toGate) return null;

  const outputPinIndex = Math.abs(wire.from.pinIndex) - 1;
  const from = getOutputPinPosition(fromGate, outputPinIndex);
  const to = getInputPinPosition(toGate, wire.to.pinIndex);

  const controlPoint1X = from.x + (to.x - from.x) * 0.5;
  const controlPoint1Y = from.y;
  const controlPoint2X = from.x + (to.x - from.x) * 0.5;
  const controlPoint2Y = to.y;

  const path = `M ${from.x} ${from.y} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${to.x} ${to.y}`;

  return (
    <path
      d={path}
      fill="none"
      stroke={wire.isActive ? '#00ff88' : '#00ff88'}
      strokeWidth="2"
      opacity={wire.isActive ? '1' : '0.3'}
      strokeLinecap="round"
    />
  );
};

export const ViewCustomGateDialog: React.FC<ViewCustomGateDialogProps> = ({
  definition,
  onClose,
}) => {
  const content = !definition.internalCircuit ? (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" onClick={e => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>{definition.displayName || definition.name} - 内部回路</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="dialog-body">
          <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            このカスタムゲートには内部回路情報がありません。
            <br />
            新しく作成されたカスタムゲートのみ内部回路を表示できます。
          </p>
        </div>
      </div>
    </div>
  ) : (() => {
    const { gates, wires } = definition.internalCircuit!;

    // 回路の境界を計算
    const minX = Math.min(...gates.map(g => g.position.x)) - 100;
    const maxX = Math.max(...gates.map(g => g.position.x)) + 100;
    const minY = Math.min(...gates.map(g => g.position.y)) - 100;
    const maxY = Math.max(...gates.map(g => g.position.y)) + 100;
    const width = maxX - minX;
    const height = maxY - minY;

    return (
      <div className="dialog-overlay" onClick={onClose}>
        <div className="dialog large-dialog" onClick={e => e.stopPropagation()}>
          <div className="dialog-header">
            <h2>{definition.displayName || definition.name} - 内部回路</h2>
            <button className="close-button" onClick={onClose}>
              ✕
            </button>
          </div>
          <div className="dialog-body">
            <div className="circuit-preview-container">
              <svg
                className="circuit-preview"
                viewBox={`${minX} ${minY} ${width} ${height}`}
                style={{
                  width: '100%',
                  height: '500px',
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #333',
                }}
              >
                {/* グリッド背景 */}
                <defs>
                  <pattern
                    id="grid"
                    width="50"
                    height="50"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle cx="0" cy="0" r="1" fill="#333" />
                  </pattern>
                </defs>
                <rect
                  x={minX}
                  y={minY}
                  width={width}
                  height={height}
                  fill="url(#grid)"
                />

                {/* ワイヤー */}
                {wires.map(wire => (
                  <InternalWire
                    key={wire.id}
                    wire={wire}
                    gates={gates}
                  />
                ))}

                {/* ゲート */}
                {gates.map(gate => (
                  <g key={gate.id} transform={`translate(${gate.position.x}, ${gate.position.y})`}>
                    <GateComponent
                      gate={gate}
                    />
                  </g>
                ))}
              </svg>
            </div>

            <div className="dialog-info">
              <p>
                <strong>入力:</strong> {definition.inputs.length}個
                {definition.inputs.map((input, i) => (
                  <span key={i} style={{ marginLeft: '10px' }}>
                    {input.name}
                  </span>
                ))}
              </p>
              <p>
                <strong>出力:</strong> {definition.outputs.length}個
                {definition.outputs.map((output, i) => (
                  <span key={i} style={{ marginLeft: '10px' }}>
                    {output.name}
                  </span>
                ))}
              </p>
              <p>
                <strong>ゲート数:</strong> {gates.length}個
              </p>
              <p>
                <strong>ワイヤー数:</strong> {wires.length}本
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  })();

  return ReactDOM.createPortal(content, document.body);
};
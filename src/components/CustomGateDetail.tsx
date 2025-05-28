import React, { CSSProperties } from 'react';
import { getCustomGates } from '../utils/circuitStorage';
import { CustomGateDetailProps } from '../types/ComponentProps';

interface GatePin {
  id: string;
  name: string;
}

interface CircuitGate {
  id: string;
  type: string;
  x: number;
  y: number;
}

interface CircuitConnection {
  id: string;
  from: string;
  to: string;
}

interface CustomGateData {
  inputs: GatePin[];
  outputs: GatePin[];
  circuit: {
    gates?: CircuitGate[];
    connections?: CircuitConnection[];
  };
  metadata?: {
    category?: string;
    createdAt?: number;
    updatedAt?: number;
    version?: number;
  };
}

/**
 * カスタムゲートの詳細を表示するコンポーネント
 */
const CustomGateDetail: React.FC<CustomGateDetailProps> = ({ gateName, onClose }) => {
  const customGates = getCustomGates();
  const gateData = customGates[gateName] as CustomGateData | undefined;
  
  if (!gateData) {
    return null;
  }
  
  const { inputs, outputs, circuit, metadata } = gateData;
  
  // 簡易的な回路プレビュー
  const renderCircuitPreview = (): JSX.Element => {
    const gates = circuit.gates || [];
    const connections = circuit.connections || [];
    
    // キャンバスのサイズを計算
    const minX = Math.min(...gates.map(g => g.x), 100);
    const maxX = Math.max(...gates.map(g => g.x), 400);
    const minY = Math.min(...gates.map(g => g.y), 100);
    const maxY = Math.max(...gates.map(g => g.y), 300);
    const width = maxX - minX + 100;
    const height = maxY - minY + 100;
    const viewBox = `${minX - 50} ${minY - 50} ${width} ${height}`;
    
    return (
      <svg
        width="100%"
        height="250"
        viewBox={viewBox}
        style={{
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* グリッド */}
        <defs>
          <pattern id="detail-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.5" fill="rgba(255, 255, 255, 0.1)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#detail-grid)" />
        
        {/* 接続線 */}
        {connections.map(conn => {
          const fromGate = gates.find(g => g.id === conn.from);
          const toGate = gates.find(g => g.id === conn.to);
          if (!fromGate || !toGate) return null;
          
          const startX = fromGate.x + 25;
          const startY = fromGate.y;
          const endX = toGate.x - 25;
          const endY = toGate.y;
          const midX = (startX + endX) / 2;
          
          return (
            <path
              key={conn.id}
              d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
              fill="none"
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="2"
            />
          );
        })}
        
        {/* ゲート */}
        {gates.map(gate => (
          <g key={gate.id} transform={`translate(${gate.x}, ${gate.y})`}>
            <rect
              x={-25}
              y={-25}
              width={50}
              height={50}
              rx={gate.type === 'INPUT' || gate.type === 'OUTPUT' ? 25 : 8}
              fill={
                gate.type === 'INPUT' ? 'rgba(0, 255, 136, 0.2)' :
                gate.type === 'OUTPUT' ? 'rgba(255, 102, 102, 0.2)' :
                'rgba(255, 255, 255, 0.1)'
              }
              stroke={
                gate.type === 'INPUT' ? '#00ff88' :
                gate.type === 'OUTPUT' ? '#ff6666' :
                'rgba(255, 255, 255, 0.3)'
              }
              strokeWidth="2"
            />
            <text
              x={0}
              y={5}
              textAnchor="middle"
              fill="white"
              fontSize="12"
              fontWeight="600"
            >
              {gate.type}
            </text>
          </g>
        ))}
        
        {/* 入出力ラベル */}
        {inputs.map((input, index) => {
          const inputGate = gates.find(g => g.id === input.id);
          if (!inputGate) return null;
          
          return (
            <text
              key={`input-label-${index}`}
              x={inputGate.x - 40}
              y={inputGate.y + 5}
              textAnchor="end"
              fill="#00ff88"
              fontSize="10"
              fontWeight="500"
            >
              {input.name}
            </text>
          );
        })}
        
        {outputs.map((output, index) => {
          const outputGate = gates.find(g => g.id === output.id);
          if (!outputGate) return null;
          
          return (
            <text
              key={`output-label-${index}`}
              x={outputGate.x + 40}
              y={outputGate.y + 5}
              textAnchor="start"
              fill="#ff6666"
              fontSize="10"
              fontWeight="500"
            >
              {output.name}
            </text>
          );
        })}
      </svg>
    );
  };

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2100,
    backdropFilter: 'blur(4px)'
  };

  const dialogStyle: CSSProperties = {
    width: '700px',
    maxWidth: '90vw',
    maxHeight: '90vh',
    backgroundColor: '#0f1441',
    border: '1px solid rgba(0, 255, 136, 0.5)',
    borderRadius: '16px',
    padding: '24px',
    color: 'white',
    overflow: 'auto',
    position: 'relative'
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  };

  const titleStyle: CSSProperties = {
    margin: 0,
    fontSize: '24px',
    fontWeight: '600',
    color: '#00ff88'
  };

  const closeButtonStyle: CSSProperties = {
    background: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '4px',
    lineHeight: 1
  };

  const sectionStyle: CSSProperties = {
    marginBottom: '24px',
    padding: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '8px'
  };

  const sectionTitleStyle: CSSProperties = {
    margin: '0 0 12px 0',
    fontSize: '16px',
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)'
  };
  
  return (
    <div style={overlayStyle}>
      <div style={dialogStyle}>
        {/* ヘッダー */}
        <div style={headerStyle}>
          <h2 style={titleStyle}>
            {gateName} の詳細
          </h2>
          <button onClick={onClose} style={closeButtonStyle}>
            ×
          </button>
        </div>
        
        {/* 基本情報 */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>
            基本情報
          </h3>
          <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
            <div>
              <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>カテゴリ: </span>
              <span>{metadata?.category || 'custom'}</span>
            </div>
            <div>
              <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>作成日時: </span>
              <span>
                {metadata?.createdAt ? new Date(metadata.createdAt).toLocaleString('ja-JP') : '不明'}
              </span>
            </div>
            <div>
              <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>更新日時: </span>
              <span>
                {metadata?.updatedAt ? new Date(metadata.updatedAt).toLocaleString('ja-JP') : '不明'}
              </span>
            </div>
            <div>
              <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>バージョン: </span>
              <span>{metadata?.version || 1}</span>
            </div>
          </div>
        </div>
        
        {/* 入出力ピン */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {/* 入力ピン */}
          <PinSection
            title="入力ピン"
            pins={inputs}
            color="#00ff88"
            backgroundColor="rgba(0, 255, 136, 0.1)"
            borderColor="rgba(0, 255, 136, 0.3)"
          />
          
          {/* 出力ピン */}
          <PinSection
            title="出力ピン"
            pins={outputs}
            color="#ff6666"
            backgroundColor="rgba(255, 102, 102, 0.1)"
            borderColor="rgba(255, 102, 102, 0.3)"
          />
        </div>
        
        {/* 内部回路プレビュー */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={sectionTitleStyle}>
            内部回路
          </h3>
          {renderCircuitPreview()}
        </div>
        
        {/* 統計情報 */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>
            統計情報
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            textAlign: 'center'
          }}>
            <StatItem
              value={circuit.gates?.length || 0}
              label="内部ゲート数"
              color="#00ff88"
            />
            <StatItem
              value={circuit.connections?.length || 0}
              label="接続数"
              color="#ff6666"
            />
            <StatItem
              value={inputs.length + outputs.length}
              label="総ピン数"
              color="#00b4d8"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Pin Section Component
interface PinSectionProps {
  title: string;
  pins: GatePin[];
  color: string;
  backgroundColor: string;
  borderColor: string;
}

const PinSection: React.FC<PinSectionProps> = ({ title, pins, color, backgroundColor, borderColor }) => {
  const sectionStyle: CSSProperties = {
    padding: '16px',
    backgroundColor,
    borderRadius: '8px',
    border: `1px solid ${borderColor}`
  };

  const titleStyle: CSSProperties = {
    margin: '0 0 12px 0',
    fontSize: '16px',
    fontWeight: '500',
    color
  };

  const pinStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '4px'
  };

  const indicatorStyle: CSSProperties = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: color
  };

  return (
    <div style={sectionStyle}>
      <h3 style={titleStyle}>
        {title} ({pins.length})
      </h3>
      <div style={{ display: 'grid', gap: '8px' }}>
        {pins.map((pin, index) => (
          <div key={index} style={pinStyle}>
            <div style={indicatorStyle} />
            <span style={{ fontSize: '14px' }}>
              #{index + 1}: {pin.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Stat Item Component
interface StatItemProps {
  value: number;
  label: string;
  color: string;
}

const StatItem: React.FC<StatItemProps> = ({ value, label, color }) => {
  const valueStyle: CSSProperties = {
    fontSize: '24px',
    fontWeight: '600',
    color
  };

  const labelStyle: CSSProperties = {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.6)'
  };

  return (
    <div>
      <div style={valueStyle}>{value}</div>
      <div style={labelStyle}>{label}</div>
    </div>
  );
};

export default CustomGateDetail;
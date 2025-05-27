import React, { useState } from 'react';
import { getCustomGates } from '../utils/circuitStorage';

/**
 * カスタムゲートの詳細を表示するコンポーネント
 */
const CustomGateDetail = ({ gateName, onClose }) => {
  const customGates = getCustomGates();
  const gateData = customGates[gateName];
  
  if (!gateData) {
    return null;
  }
  
  const { inputs, outputs, circuit, metadata } = gateData;
  
  // 簡易的な回路プレビュー
  const renderCircuitPreview = () => {
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
  
  return (
    <div style={{
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
    }}>
      <div style={{
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
      }}>
        {/* ヘッダー */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: '600',
            color: '#00ff88'
          }}>
            {gateName} の詳細
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px',
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>
        
        {/* 基本情報 */}
        <div style={{
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px'
        }}>
          <h3 style={{
            margin: '0 0 12px 0',
            fontSize: '16px',
            fontWeight: '500',
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
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
          <div style={{
            padding: '16px',
            backgroundColor: 'rgba(0, 255, 136, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(0, 255, 136, 0.3)'
          }}>
            <h3 style={{
              margin: '0 0 12px 0',
              fontSize: '16px',
              fontWeight: '500',
              color: '#00ff88'
            }}>
              入力ピン ({inputs.length})
            </h3>
            <div style={{ display: 'grid', gap: '8px' }}>
              {inputs.map((input, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '4px'
                  }}
                >
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#00ff88'
                  }} />
                  <span style={{ fontSize: '14px' }}>
                    #{index + 1}: {input.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* 出力ピン */}
          <div style={{
            padding: '16px',
            backgroundColor: 'rgba(255, 102, 102, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 102, 102, 0.3)'
          }}>
            <h3 style={{
              margin: '0 0 12px 0',
              fontSize: '16px',
              fontWeight: '500',
              color: '#ff6666'
            }}>
              出力ピン ({outputs.length})
            </h3>
            <div style={{ display: 'grid', gap: '8px' }}>
              {outputs.map((output, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '4px'
                  }}
                >
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#ff6666'
                  }} />
                  <span style={{ fontSize: '14px' }}>
                    #{index + 1}: {output.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* 内部回路プレビュー */}
        <div style={{
          marginBottom: '24px'
        }}>
          <h3 style={{
            margin: '0 0 12px 0',
            fontSize: '16px',
            fontWeight: '500',
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            内部回路
          </h3>
          {renderCircuitPreview()}
        </div>
        
        {/* 統計情報 */}
        <div style={{
          padding: '16px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px'
        }}>
          <h3 style={{
            margin: '0 0 12px 0',
            fontSize: '16px',
            fontWeight: '500',
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            統計情報
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            textAlign: 'center'
          }}>
            <div>
              <div style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#00ff88'
              }}>
                {circuit.gates?.length || 0}
              </div>
              <div style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.6)'
              }}>
                内部ゲート数
              </div>
            </div>
            <div>
              <div style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#ff6666'
              }}>
                {circuit.connections?.length || 0}
              </div>
              <div style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.6)'
              }}>
                接続数
              </div>
            </div>
            <div>
              <div style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#00b4d8'
              }}>
                {inputs.length + outputs.length}
              </div>
              <div style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.6)'
              }}>
                総ピン数
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomGateDetail;
import React from 'react';
import type { TruthTableResult } from '../domain/analysis';
import {
  exportTruthTableAsCSV,
  calculateTruthTableStats,
} from '../domain/analysis';
import { displayStateToBoolean } from '../domain/simulation';

interface TruthTableDisplayProps {
  result: TruthTableResult;
  inputNames: string[];
  outputNames: string[];
  gateName?: string;
  onClose?: () => void;
}

export const TruthTableDisplay: React.FC<TruthTableDisplayProps> = ({
  result,
  inputNames,
  outputNames,
  gateName = 'カスタムゲート',
  onClose,
}) => {
  const stats = calculateTruthTableStats(result);

  const handleExportCSV = () => {
    const csvContent = exportTruthTableAsCSV(result, inputNames, outputNames);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${gateName}_truth_table.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3000,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          width: '90vw',
          maxWidth: '800px',
          maxHeight: '90vh',
          backgroundColor: '#0f1441',
          border: '1px solid rgba(0, 255, 136, 0.5)',
          borderRadius: '16px',
          color: 'white',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ヘッダー */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            backgroundColor: 'rgba(0, 255, 136, 0.05)',
            borderBottom: '1px solid rgba(0, 255, 136, 0.2)',
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: '600',
              color: '#00ff88',
            }}
          >
            📊 {gateName} の真理値表
          </h2>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={handleExportCSV}
              style={{
                padding: '6px 12px',
                backgroundColor: 'rgba(0, 255, 136, 0.2)',
                border: '1px solid #00ff88',
                borderRadius: '6px',
                color: '#00ff88',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              📄 CSV出力
            </button>
            {onClose && (
              <button
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: '4px',
                  lineHeight: 1,
                  borderRadius: '4px',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.backgroundColor =
                    'rgba(255, 255, 255, 0.1)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* 統計情報とパターン認識 */}
        <div
          style={{
            padding: '16px 24px',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            gap: '24px',
            flexWrap: 'wrap',
          }}
        >
          {result.recognizedPattern && (
            <div
              style={{
                padding: '8px 16px',
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                border: '1px solid #00ff88',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            >
              🎯 <strong>パターン:</strong> {result.recognizedPattern}
            </div>
          )}
          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
            <span>組み合わせ数: {stats.totalCombinations}</span> •
            <span> 複雑度: {stats.complexity}</span> •
            <span> TRUE率: {(stats.trueOutputRatio * 100).toFixed(1)}%</span>
          </div>
        </div>

        {/* 真理値表 */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '16px',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px',
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: 'rgba(0, 255, 136, 0.1)',
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                }}
              >
                {inputNames.map((name, index) => (
                  <th
                    key={`input-${index}`}
                    style={{
                      padding: '12px 8px',
                      textAlign: 'center',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#00ff88',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}
                  >
                    {name}
                  </th>
                ))}
                <th
                  style={{
                    padding: '12px 8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    width: '2px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }}
                ></th>
                {outputNames.map((name, index) => (
                  <th
                    key={`output-${index}`}
                    style={{
                      padding: '12px 8px',
                      textAlign: 'center',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#ff6699',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}
                  >
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.table.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  style={{
                    backgroundColor:
                      rowIndex % 2 === 0
                        ? 'rgba(255, 255, 255, 0.02)'
                        : 'transparent',
                  }}
                >
                  {row.inputs.split('').map((input, colIndex) => (
                    <td
                      key={`input-${rowIndex}-${colIndex}`}
                      style={{
                        padding: '10px 8px',
                        textAlign: 'center',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        fontFamily: 'monospace',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: displayStateToBoolean(input)
                          ? '#00ff88'
                          : 'rgba(255, 255, 255, 0.5)',
                      }}
                    >
                      {input}
                    </td>
                  ))}
                  <td
                    style={{
                      padding: '10px 8px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      width: '2px',
                    }}
                  ></td>
                  {row.outputs.split('').map((output, colIndex) => (
                    <td
                      key={`output-${rowIndex}-${colIndex}`}
                      style={{
                        padding: '10px 8px',
                        textAlign: 'center',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        fontFamily: 'monospace',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: displayStateToBoolean(output)
                          ? '#ff6699'
                          : 'rgba(255, 255, 255, 0.5)',
                      }}
                    >
                      {output}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* フッター */}
        <div
          style={{
            padding: '12px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.5)',
            textAlign: 'center',
          }}
        >
          💡 ヒント: この真理値表から回路の動作を理解できます
        </div>
      </div>
    </div>
  );
};

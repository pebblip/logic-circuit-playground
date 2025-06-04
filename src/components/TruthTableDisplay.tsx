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

  // デバッグ: props の内容を確認
  console.log('=== TruthTableDisplay Debug ===');
  console.log('inputNames:', inputNames);
  console.log('outputNames:', outputNames);
  console.log('outputNames details:', {
    length: outputNames.length,
    content: outputNames.map((name, i) => ({ index: i, name, type: typeof name }))
  });
  console.log('result.table sample:', result.table[0]);

  // outputNamesが空や不正な場合のフォールバック
  const safeOutputNames = outputNames.length > 0 
    ? outputNames.map((name, index) => name || `出力${index + 1}`)
    : Array.from({ length: result.outputCount || 1 }, (_, i) => `出力${i + 1}`);
  
  console.log('safeOutputNames:', safeOutputNames);

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
          width: '95vw',
          maxWidth: safeOutputNames.length > 3 ? '1200px' : '800px', // 複数出力対応
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
          <div style={{ overflowX: 'auto', minWidth: '100%' }}>
            <table
              style={{
                width: '100%',
                minWidth: `${Math.max(400, (inputNames.length + safeOutputNames.length + 1) * 80)}px`, // 動的最小幅
                borderCollapse: 'collapse',
                fontSize: safeOutputNames.length > 5 ? '12px' : '14px', // 多出力時は小さく
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
                {safeOutputNames.map((name, index) => {
                  console.log(`=== Output Header ${index} Debug ===`);
                  console.log(`Header ${index}:`, {
                    name: name,
                    nameType: typeof name,
                    nameLength: name?.length,
                    isEmpty: name === '',
                    isNull: name === null,
                    isUndefined: name === undefined,
                    rawValue: JSON.stringify(name)
                  });
                  
                  // name が空の場合のフォールバック
                  const displayName = name || `出力${index + 1}`;
                  console.log(`Display name for header ${index}: "${displayName}"`);
                  
                  return (
                    <th
                      key={`output-${index}`}
                      style={{
                        padding: safeOutputNames.length > 4 ? '8px 6px' : '12px 8px',
                        textAlign: 'center',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#ff6699',
                        fontSize: safeOutputNames.length > 6 ? '10px' : '12px',
                        fontWeight: '600',
                        minWidth: '40px',
                        backgroundColor: index % 2 === 0 ? 'rgba(255, 102, 153, 0.1)' : 'rgba(255, 102, 153, 0.05)', // デバッグ用背景色
                      }}
                    >
                      {displayName}
                    </th>
                  );
                })}
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
                        padding: safeOutputNames.length > 4 ? '8px 6px' : '10px 8px',
                        textAlign: 'center',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        fontFamily: 'monospace',
                        fontSize: safeOutputNames.length > 6 ? '14px' : '16px',
                        fontWeight: '600',
                        color: displayStateToBoolean(output)
                          ? '#ff6699'
                          : 'rgba(255, 255, 255, 0.5)',
                        // maxWidth制限を一時的に削除
                        // maxWidth: outputNames.length > 4 ? '60px' : 'auto',
                        minWidth: '40px', // 最小幅を保証
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

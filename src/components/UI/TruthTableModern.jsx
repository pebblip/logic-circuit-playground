// モダンな真理値表コンポーネント

import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { calculateCircuit } from '../../utils/circuit';
import { colors, spacing, typography, radius } from '../../styles/design-tokens';

/**
 * モダンな真理値表コンポーネント
 */
const TruthTableModern = memo(({ gates, connections }) => {
  const truthTable = useMemo(() => {
    const inputs = gates.filter(g => g.type === 'INPUT').sort((a, b) => a.y - b.y);
    const outputs = gates.filter(g => g.type === 'OUTPUT').sort((a, b) => a.y - b.y);
    
    if (inputs.length === 0 || inputs.length > 5) {
      return null;
    }
    
    const rows = [];
    const combinations = Math.pow(2, inputs.length);
    
    for (let i = 0; i < combinations; i++) {
      const inputValues = [];
      for (let j = 0; j < inputs.length; j++) {
        inputValues.push((i >> (inputs.length - 1 - j)) & 1);
      }
      
      const testGates = gates.map(g => {
        if (g.type === 'INPUT') {
          const index = inputs.findIndex(input => input.id === g.id);
          return { ...g, value: inputValues[index] === 1 };
        }
        return { ...g };
      });
      
      const simulation = calculateCircuit(testGates, connections);
      
      const outputValues = [];
      
      // 通常のゲート出力
      gates.forEach(gate => {
        if (gate.type !== 'INPUT' && gate.type !== 'CLOCK') {
          const gateInfo = gate.type;
          const hasMultipleOutputs = ['SR_LATCH', 'D_FF', 'HALF_ADDER', 'FULL_ADDER'].includes(gate.type);
          
          if (hasMultipleOutputs) {
            outputValues.push({
              name: `${gate.type}(${gate.id})`,
              values: [
                simulation[gate.id] ? 1 : 0,
                simulation[`${gate.id}_out1`] ? 1 : 0
              ]
            });
          } else if (gate.type === 'OUTPUT') {
            outputValues.push({
              name: `OUT${outputs.findIndex(o => o.id === gate.id) + 1}`,
              values: [simulation[gate.id] ? 1 : 0]
            });
          } else {
            outputValues.push({
              name: gate.type,
              values: [simulation[gate.id] ? 1 : 0]
            });
          }
        }
      });
      
      rows.push({
        inputs: inputValues,
        outputs: outputValues
      });
    }
    
    return {
      inputs: inputs.map((input, index) => `IN${index + 1}`),
      outputs: outputValues.length > 0 ? outputValues[0].name : '',
      rows
    };
  }, [gates, connections]);

  if (!truthTable) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm" style={{ color: colors.ui.text.tertiary }}>
          {gates.filter(g => g.type === 'INPUT').length === 0 
            ? '入力ゲートを配置してください'
            : '入力が多すぎます（最大5個）'}
        </p>
      </div>
    );
  }

  // 信号の視覚表現
  const SignalIndicator = ({ value }) => (
    <div className="flex items-center justify-center">
      <div 
        className="w-6 h-6 rounded-full transition-all"
        style={{
          backgroundColor: value ? colors.signal.on : colors.ui.background,
          border: `2px solid ${value ? colors.signal.on : colors.ui.border}`,
          boxShadow: value ? `0 0 8px ${colors.signal.onGlow}` : 'none',
        }}
      />
      <span 
        className="ml-2 text-xs font-mono"
        style={{ color: value ? colors.signal.on : colors.ui.text.tertiary }}
      >
        {value}
      </span>
    </div>
  );

  return (
    <div className="p-4">
      <div className="overflow-x-auto">
        <table className="w-full" style={{ minWidth: '400px' }}>
          <thead>
            <tr>
              {/* 入力列 */}
              {truthTable.inputs.map((input, index) => (
                <th 
                  key={`input-${index}`}
                  className="px-3 py-2 text-left"
                  style={{
                    backgroundColor: colors.ui.background,
                    color: colors.ui.text.primary,
                    fontSize: typography.size.sm,
                    fontWeight: typography.weight.semibold,
                    borderBottom: `2px solid ${colors.ui.border}`,
                  }}
                >
                  {input}
                </th>
              ))}
              
              {/* 区切り線 */}
              <th 
                className="w-px"
                style={{ 
                  backgroundColor: colors.ui.border,
                  borderBottom: `2px solid ${colors.ui.border}`,
                }}
              />
              
              {/* 出力列 */}
              {truthTable.rows[0]?.outputs.map((output, index) => (
                <React.Fragment key={`output-${index}`}>
                  {output.values.map((_, valueIndex) => (
                    <th 
                      key={`output-${index}-${valueIndex}`}
                      className="px-3 py-2 text-left"
                      style={{
                        backgroundColor: colors.ui.background,
                        color: colors.ui.text.primary,
                        fontSize: typography.size.sm,
                        fontWeight: typography.weight.semibold,
                        borderBottom: `2px solid ${colors.ui.border}`,
                      }}
                    >
                      {output.name}
                      {output.values.length > 1 && (
                        <span style={{ color: colors.ui.text.tertiary }}>
                          {valueIndex === 0 ? ' (S/Q)' : ' (C/Q̄)'}
                        </span>
                      )}
                    </th>
                  ))}
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {truthTable.rows.map((row, rowIndex) => (
              <tr 
                key={rowIndex}
                className="hover:bg-gray-50 transition-colors"
              >
                {/* 入力値 */}
                {row.inputs.map((value, index) => (
                  <td 
                    key={`input-${index}`}
                    className="px-3 py-2"
                    style={{
                      borderBottom: `1px solid ${colors.ui.border}`,
                    }}
                  >
                    <SignalIndicator value={value} />
                  </td>
                ))}
                
                {/* 区切り線 */}
                <td 
                  className="w-px"
                  style={{ 
                    backgroundColor: colors.ui.border,
                    borderBottom: `1px solid ${colors.ui.border}`,
                  }}
                />
                
                {/* 出力値 */}
                {row.outputs.map((output, outputIndex) => (
                  <React.Fragment key={`output-${outputIndex}`}>
                    {output.values.map((value, valueIndex) => (
                      <td 
                        key={`output-${outputIndex}-${valueIndex}`}
                        className="px-3 py-2"
                        style={{
                          borderBottom: `1px solid ${colors.ui.border}`,
                        }}
                      >
                        <SignalIndicator value={value} />
                      </td>
                    ))}
                  </React.Fragment>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* 説明 */}
      <div 
        className="mt-4 p-3 rounded-lg"
        style={{ 
          backgroundColor: colors.ui.background,
          border: `1px solid ${colors.ui.border}`,
        }}
      >
        <p className="text-xs" style={{ color: colors.ui.text.secondary }}>
          <span className="font-semibold">ヒント:</span> 
          緑色の丸は信号がON（1）、グレーの丸はOFF（0）を表します。
          入力の全組み合わせに対する出力を確認できます。
        </p>
      </div>
    </div>
  );
});

TruthTableModern.displayName = 'TruthTableModern';

TruthTableModern.propTypes = {
  gates: PropTypes.array.isRequired,
  connections: PropTypes.array.isRequired
};

export default TruthTableModern;
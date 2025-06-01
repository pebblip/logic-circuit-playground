import React from 'react';
import { useCircuitViewModel } from '../../../features/circuit-editor/model/useCircuitViewModel';
import { GateData } from '../../../entities/types';

/**
 * プロパティパネルコンポーネント
 */
export const PropertyPanel: React.FC = () => {
  const { gates, selectedGateId } = useCircuitViewModel();
  
  const selectedGate = gates.find(g => g.id === selectedGateId);
  
  if (!selectedGate) {
    return (
      <div className="property-group">
        <div className="section-title">
          <span>📝</span>
          <span>プロパティ</span>
        </div>
        <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '13px' }}>
          ゲートを選択してください
        </div>
      </div>
    );
  }
  
  return (
    <>
      {/* 選択中ゲート情報 */}
      <div className="property-group">
        <div className="section-title">
          <span>📝</span>
          <span>選択中: {selectedGate.type} ゲート</span>
        </div>
        
        <PropertyRow label="タイプ" value={getGateDescription(selectedGate.type)} />
        <PropertyRow label="ID" value={selectedGate.id} />
        <PropertyRow 
          label="位置" 
          value={`X: ${Math.round(selectedGate.position.x)}, Y: ${Math.round(selectedGate.position.y)}`} 
        />
        {selectedGate.value !== undefined && (
          <PropertyRow 
            label="状態" 
            value={selectedGate.value ? 'HIGH (1)' : 'LOW (0)'}
            valueStyle={selectedGate.value ? { color: '#00ff88' } : undefined}
          />
        )}
      </div>
      
      {/* 真理値表 */}
      {shouldShowTruthTable(selectedGate.type) && (
        <div className="property-group">
          <div className="section-title">
            <span>📊</span>
            <span>真理値表</span>
          </div>
          <TruthTable gateType={selectedGate.type} />
        </div>
      )}
      
      {/* ヒント */}
      <div className="property-group">
        <div className="section-title">
          <span>💡</span>
          <span>ヒント</span>
        </div>
        <div style={{
          padding: '12px',
          background: 'rgba(0, 255, 136, 0.05)',
          borderRadius: '8px',
          border: '1px solid rgba(0, 255, 136, 0.1)',
          fontSize: '13px',
          lineHeight: 1.6
        }}>
          {getGateHint(selectedGate.type)}
        </div>
      </div>
    </>
  );
};

interface PropertyRowProps {
  label: string;
  value: string;
  valueStyle?: React.CSSProperties;
}

const PropertyRow: React.FC<PropertyRowProps> = ({ label, value, valueStyle }) => {
  return (
    <div className="property-row">
      <span className="property-label">{label}</span>
      <span className="property-value" style={valueStyle}>{value}</span>
    </div>
  );
};

const TruthTable: React.FC<{ gateType: string }> = ({ gateType }) => {
  const tables: Record<string, { inputs: string[]; outputs: string[][] }> = {
    AND: {
      inputs: ['A', 'B'],
      outputs: [
        ['0', '0', '0'],
        ['0', '1', '0'],
        ['1', '0', '0'],
        ['1', '1', '1']
      ]
    },
    OR: {
      inputs: ['A', 'B'],
      outputs: [
        ['0', '0', '0'],
        ['0', '1', '1'],
        ['1', '0', '1'],
        ['1', '1', '1']
      ]
    },
    NOT: {
      inputs: ['A'],
      outputs: [
        ['0', '1'],
        ['1', '0']
      ]
    },
    XOR: {
      inputs: ['A', 'B'],
      outputs: [
        ['0', '0', '0'],
        ['0', '1', '1'],
        ['1', '0', '1'],
        ['1', '1', '0']
      ]
    }
  };
  
  const table = tables[gateType];
  if (!table) return null;
  
  return (
    <table style={{ width: '100%', fontSize: '13px', marginTop: '12px' }}>
      <thead>
        <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
          {table.inputs.map(input => (
            <th key={input} style={{ padding: '8px', textAlign: 'left' }}>{input}</th>
          ))}
          <th style={{ padding: '8px', textAlign: 'left' }}>出力</th>
        </tr>
      </thead>
      <tbody>
        {table.outputs.map((row, i) => (
          <tr key={i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
            {row.map((value, j) => (
              <td 
                key={j} 
                style={{ 
                  padding: '8px',
                  color: value === '1' ? '#00ff88' : undefined
                }}
              >
                {value}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

function getGateDescription(type: string): string {
  const descriptions: Record<string, string> = {
    AND: 'AND (論理積)',
    OR: 'OR (論理和)',
    NOT: 'NOT (否定)',
    XOR: 'XOR (排他的論理和)',
    NAND: 'NAND (否定論理積)',
    NOR: 'NOR (否定論理和)',
    INPUT: '入力スイッチ',
    OUTPUT: '出力LED'
  };
  return descriptions[type] || type;
}

function getGateHint(type: string): string {
  const hints: Record<string, string> = {
    AND: 'ANDゲートは、すべての入力がONの時にのみ出力がONになります。',
    OR: 'ORゲートは、いずれかの入力がONの時に出力がONになります。',
    NOT: 'NOTゲートは、入力を反転します。ON→OFF、OFF→ON',
    XOR: 'XORゲートは「どちらか片方だけ」がONの時に出力がONになります。',
    INPUT: 'クリックでON/OFFを切り替えられます。',
    OUTPUT: '入力がONの時に点灯します。'
  };
  return hints[type] || 'このゲートについて詳しく調べてみましょう。';
}

function shouldShowTruthTable(type: string): boolean {
  return ['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR'].includes(type);
}
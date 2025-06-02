import React from 'react';
import { useCircuitStore } from '../stores/circuitStore';

export const PropertyPanel: React.FC = () => {
  const { gates, selectedGateId } = useCircuitStore();
  const selectedGate = gates.find(g => g.id === selectedGateId);

  if (!selectedGate) {
    return (
      <aside className="property-panel">
        <div className="property-group">
          <div className="section-title">
            <span>📝</span>
            <span>プロパティ</span>
          </div>
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '13px' }}>
            ゲートを選択してください
          </p>
        </div>
      </aside>
    );
  }

  const getTruthTable = () => {
    switch (selectedGate.type) {
      case 'AND':
        return [
          { a: 0, b: 0, out: 0 },
          { a: 0, b: 1, out: 0 },
          { a: 1, b: 0, out: 0 },
          { a: 1, b: 1, out: 1 },
        ];
      case 'OR':
        return [
          { a: 0, b: 0, out: 0 },
          { a: 0, b: 1, out: 1 },
          { a: 1, b: 0, out: 1 },
          { a: 1, b: 1, out: 1 },
        ];
      case 'XOR':
        return [
          { a: 0, b: 0, out: 0 },
          { a: 0, b: 1, out: 1 },
          { a: 1, b: 0, out: 1 },
          { a: 1, b: 1, out: 0 },
        ];
      case 'NOT':
        return [
          { a: 0, out: 1 },
          { a: 1, out: 0 },
        ];
      case 'NAND':
        return [
          { a: 0, b: 0, out: 1 },
          { a: 0, b: 1, out: 1 },
          { a: 1, b: 0, out: 1 },
          { a: 1, b: 1, out: 0 },
        ];
      case 'NOR':
        return [
          { a: 0, b: 0, out: 1 },
          { a: 0, b: 1, out: 0 },
          { a: 1, b: 0, out: 0 },
          { a: 1, b: 1, out: 0 },
        ];
      default:
        return [];
    }
  };

  const truthTable = getTruthTable();

  const getGateDescription = () => {
    switch (selectedGate.type) {
      case 'AND':
        return 'ANDゲートは全ての入力がONの時のみ出力がONになります。';
      case 'OR':
        return 'ORゲートは少なくとも1つの入力がONの時に出力がONになります。';
      case 'XOR':
        return 'XORゲートは「どちらか片方だけ」がONの時に出力がONになります。両方ONまたは両方OFFの時は出力がOFFになります。';
      case 'NOT':
        return 'NOTゲートは入力を反転します。入力がONなら出力はOFF、入力がOFFなら出力はONになります。';
      case 'NAND':
        return 'NANDゲートはANDの出力を反転したものです。全ての入力がONの時のみ出力がOFFになります。';
      case 'NOR':
        return 'NORゲートはORの出力を反転したものです。全ての入力がOFFの時のみ出力がONになります。';
      case 'INPUT':
        return 'INPUTゲートはクリックすることでON/OFFを切り替えることができます。';
      case 'OUTPUT':
        return 'OUTPUTゲートは接続された入力の状態を視覚的に表示します。';
      case 'CLOCK':
        return 'CLOCKゲートは一定間隔でON/OFFを繰り返す信号を生成します。';
      default:
        return '詳細な説明はまだ実装されていません。';
    }
  };

  return (
    <aside className="property-panel">
      <div className="property-group">
        <div className="section-title">
          <span>📝</span>
          <span>選択中: {selectedGate.type} ゲート</span>
        </div>
        <div className="property-row">
          <span className="property-label">タイプ</span>
          <span className="property-value">{selectedGate.type}</span>
        </div>
        <div className="property-row">
          <span className="property-label">ID</span>
          <span className="property-value">{selectedGate.id}</span>
        </div>
        <div className="property-row">
          <span className="property-label">位置</span>
          <span className="property-value">
            X: {Math.round(selectedGate.position.x)}, Y: {Math.round(selectedGate.position.y)}
          </span>
        </div>
      </div>

      {truthTable.length > 0 && (
        <div className="property-group">
          <div className="section-title">
            <span>📊</span>
            <span>真理値表</span>
          </div>
          <table style={{ width: '100%', fontSize: '13px', marginTop: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
                {'a' in truthTable[0] && <th style={{ padding: '8px', textAlign: 'left' }}>A</th>}
                {'b' in truthTable[0] && <th style={{ padding: '8px', textAlign: 'left' }}>B</th>}
                <th style={{ padding: '8px', textAlign: 'left' }}>出力</th>
              </tr>
            </thead>
            <tbody>
              {truthTable.map((row, index) => (
                <tr key={index} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  {'a' in row && <td style={{ padding: '8px' }}>{row.a}</td>}
                  {'b' in row && <td style={{ padding: '8px' }}>{row.b}</td>}
                  <td style={{ padding: '8px', color: row.out ? '#00ff88' : '#fff' }}>{row.out}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="property-group">
        <div className="section-title">
          <span>💡</span>
          <span>ヒント</span>
        </div>
        <div style={{
          padding: '12px',
          background: 'rgba(0, 255, 136, 0.05)',
          border: '1px solid rgba(0, 255, 136, 0.1)',
          borderRadius: '8px',
          fontSize: '13px',
          lineHeight: '1.6',
          color: 'rgba(255, 255, 255, 0.8)'
        }}>
          {getGateDescription()}
        </div>
      </div>
    </aside>
  );
};
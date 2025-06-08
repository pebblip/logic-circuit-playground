import React from 'react';

interface DigitalSignalRendererProps {
  title?: string;
  showAnalog?: boolean;
  showDigital?: boolean;
}

/**
 * アナログ信号とデジタル信号の比較図
 */
export const DigitalSignalRenderer: React.FC<DigitalSignalRendererProps> = ({
  title = 'アナログ信号 vs デジタル信号',
  showAnalog = true,
  showDigital = true,
}) => {
  return (
    <div className="signal-diagram">
      {title && <h4 className="diagram-title">{title}</h4>}
      <svg viewBox="0 0 600 300" className="circuit-diagram">
        {showAnalog && (
          <g>
            {/* アナログ信号のラベル */}
            <text x="20" y="30" fill="#fff" fontSize="14" fontWeight="bold">
              アナログ：
            </text>

            {/* アナログ信号の波形 */}
            <path
              d="M 120 50 Q 180 30, 240 70 T 360 50 Q 420 30, 480 60 T 580 50"
              stroke="#00aaff"
              strokeWidth="2"
              fill="none"
            />

            {/* アナログ信号の特徴 */}
            <text x="120" y="100" fill="#888" fontSize="12">
              連続的な値の変化
            </text>
          </g>
        )}

        {showDigital && (
          <g>
            {/* デジタル信号のラベル */}
            <text x="20" y="170" fill="#fff" fontSize="14" fontWeight="bold">
              デジタル：
            </text>

            {/* デジタル信号の波形 */}
            <path
              d="M 120 220 L 180 220 L 180 150 L 240 150 L 240 220 L 300 220 L 300 150 L 360 150 L 360 220 L 420 220 L 420 150 L 480 150 L 480 220 L 540 220"
              stroke="#00ff88"
              strokeWidth="2"
              fill="none"
            />

            {/* HIGH/LOWレベル表示 */}
            <text x="100" y="145" fill="#888" fontSize="10">
              HIGH
            </text>
            <text x="100" y="235" fill="#888" fontSize="10">
              LOW
            </text>

            {/* 1/0表示 */}
            <text x="150" y="140" fill="#00ff88" fontSize="12">
              1
            </text>
            <text x="210" y="240" fill="#00ff88" fontSize="12">
              0
            </text>
            <text x="270" y="140" fill="#00ff88" fontSize="12">
              1
            </text>
            <text x="330" y="140" fill="#00ff88" fontSize="12">
              1
            </text>
            <text x="390" y="240" fill="#00ff88" fontSize="12">
              0
            </text>
            <text x="450" y="140" fill="#00ff88" fontSize="12">
              1
            </text>
            <text x="510" y="240" fill="#00ff88" fontSize="12">
              0
            </text>

            {/* デジタル信号の特徴 */}
            <text x="120" y="270" fill="#888" fontSize="12">
              離散的な値（0か1のみ）
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};

/**
 * 電圧レベルとデジタル信号の関係図
 */
export const VoltageSignalRenderer: React.FC = () => {
  return (
    <div className="voltage-diagram">
      <h4 className="diagram-title">電圧レベルとデジタル信号</h4>
      <svg viewBox="0 0 600 300" className="circuit-diagram">
        {/* 電圧軸 */}
        <line x1="50" y1="250" x2="50" y2="50" stroke="#666" strokeWidth="2" />
        <line
          x1="50"
          y1="250"
          x2="550"
          y2="250"
          stroke="#666"
          strokeWidth="2"
        />

        {/* 電圧レベル表示 */}
        <text x="20" y="55" fill="#fff" fontSize="12">
          5V
        </text>
        <text x="20" y="155" fill="#fff" fontSize="12">
          2.5V
        </text>
        <text x="20" y="255" fill="#fff" fontSize="12">
          0V
        </text>

        {/* 閾値線 */}
        <line
          x1="50"
          y1="150"
          x2="550"
          y2="150"
          stroke="#ff6b6b"
          strokeWidth="1"
          strokeDasharray="5,5"
        />
        <text x="560" y="155" fill="#ff6b6b" fontSize="12">
          閾値
        </text>

        {/* デジタル信号波形 */}
        <path
          d="M 100 250 L 150 250 L 150 50 L 200 50 L 200 250 L 250 250 L 250 50 L 300 50 L 300 250 L 350 250 L 350 50 L 400 50 L 400 250 L 450 250 L 450 50 L 500 50"
          stroke="#00ff88"
          strokeWidth="3"
          fill="none"
        />

        {/* 1/0表示 */}
        <text x="120" y="280" fill="#888" fontSize="14">
          0
        </text>
        <text x="170" y="280" fill="#888" fontSize="14">
          1
        </text>
        <text x="220" y="280" fill="#888" fontSize="14">
          0
        </text>
        <text x="270" y="280" fill="#888" fontSize="14">
          1
        </text>
        <text x="320" y="280" fill="#888" fontSize="14">
          0
        </text>
        <text x="370" y="280" fill="#888" fontSize="14">
          1
        </text>
        <text x="420" y="280" fill="#888" fontSize="14">
          0
        </text>
        <text x="470" y="280" fill="#888" fontSize="14">
          1
        </text>

        {/* 時間軸 */}
        <text x="550" y="270" fill="#666" fontSize="12">
          時間 →
        </text>
      </svg>
    </div>
  );
};

/**
 * ビット数と表現可能な値の表
 */
export const BitPatternTable: React.FC = () => {
  return (
    <div className="bit-pattern-table">
      <table className="lesson-table">
        <thead>
          <tr>
            <th>ビット数</th>
            <th>組み合わせ例</th>
            <th>パターン数</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1ビット</td>
            <td>0, 1</td>
            <td>2通り</td>
          </tr>
          <tr>
            <td>2ビット</td>
            <td>00, 01, 10, 11</td>
            <td>4通り</td>
          </tr>
          <tr>
            <td>3ビット</td>
            <td>000, 001, 010, 011, 100, 101, 110, 111</td>
            <td>8通り</td>
          </tr>
          <tr>
            <td>4ビット</td>
            <td>0000 〜 1111</td>
            <td>16通り</td>
          </tr>
          <tr>
            <td>8ビット</td>
            <td>00000000 〜 11111111</td>
            <td>256通り（1バイト）</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

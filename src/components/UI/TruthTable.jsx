// 真理値表表示コンポーネント

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { generateTruthTable, truthTableToCSV, downloadCSV } from '../../utils/truthTable';

/**
 * 真理値表コンポーネント
 */
const TruthTable = ({ gates, connections }) => {
  // 真理値表を生成（メモ化）
  const truthTable = useMemo(() => {
    return generateTruthTable(gates, connections);
  }, [gates, connections]);

  const { inputs, outputs, rows } = truthTable;

  // CSVエクスポート
  const handleExportCSV = () => {
    const csv = truthTableToCSV(truthTable);
    downloadCSV(csv);
  };

  // 入力も出力もない場合
  if (inputs.length === 0 && outputs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <p className="text-sm">回路に入力と出力を追加してください</p>
      </div>
    );
  }

  // 入力がない場合
  if (inputs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <p className="text-sm">入力ゲートを追加してください</p>
      </div>
    );
  }

  // 出力がない場合
  if (outputs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <p className="text-sm">出力ゲートを追加してください</p>
      </div>
    );
  }

  // 入力が多すぎる場合の警告
  if (inputs.length > 8) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-amber-600">
        <p className="text-sm font-medium">入力が多すぎます</p>
        <p className="text-xs mt-1">真理値表は最大8入力まで対応しています</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-gray-700">
          真理値表（{Math.pow(2, inputs.length)}行）
        </h3>
        <button
          onClick={handleExportCSV}
          className="text-xs px-3 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded transition-colors"
        >
          CSVエクスポート
        </button>
      </div>

      {/* テーブル */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {/* 入力列 */}
              {inputs.map(input => (
                <th
                  key={input.id}
                  className="px-3 py-2 text-left font-medium text-gray-700 border-r border-gray-200"
                >
                  {input.name}
                </th>
              ))}
              {/* 区切り */}
              <th className="w-px bg-gray-400"></th>
              {/* 出力列 */}
              {outputs.map(output => (
                <th
                  key={output.id}
                  className="px-3 py-2 text-left font-medium text-gray-700"
                >
                  {output.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                {/* 入力値 */}
                {row.inputs.map((value, i) => (
                  <td
                    key={i}
                    className="px-3 py-2 text-center border-r border-gray-200"
                  >
                    <span className={value ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                      {value ? '1' : '0'}
                    </span>
                  </td>
                ))}
                {/* 区切り */}
                <td className="w-px bg-gray-400"></td>
                {/* 出力値 */}
                {row.outputs.map((value, i) => (
                  <td
                    key={i}
                    className="px-3 py-2 text-center"
                  >
                    <span className={value ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                      {value ? '1' : '0'}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 注意事項 */}
      {inputs.length > 5 && (
        <div className="mt-2 text-xs text-gray-500">
          ※ 入力数が多いと計算に時間がかかる場合があります
        </div>
      )}
    </div>
  );
};

TruthTable.propTypes = {
  gates: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    type: PropTypes.string.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    value: PropTypes.bool
  })).isRequired,
  connections: PropTypes.arrayOf(PropTypes.shape({
    from: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    to: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    fromOutput: PropTypes.number,
    toInput: PropTypes.number.isRequired
  })).isRequired
};

export default TruthTable;
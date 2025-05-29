import React from 'react';
import { BaseGate } from '../../models/gates/BaseGate';
import { Connection } from '../../models/Connection';

interface TruthTableProps {
  gates: BaseGate[];
  connections: Connection[];
}

const TruthTable: React.FC<TruthTableProps> = ({ gates, connections }) => {
  return (
    <div className="p-4">
      <p className="text-sm text-gray-500">
        真理値表機能は現在開発中です
      </p>
    </div>
  );
};

export default TruthTable;
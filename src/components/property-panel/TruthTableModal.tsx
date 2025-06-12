import React from 'react';
import { TruthTableDisplay } from '@/components/TruthTableDisplay';
import { useCircuitStore } from '@/stores/circuitStore';
import type { Gate } from '@/types/circuit';
import { DEMO_CUSTOM_GATES } from '@/components/tool-palette/gateDefinitions';

export interface TruthTableResult {
  table: Array<{
    inputs: string;
    outputs: string;
    inputValues: boolean[];
    outputValues: boolean[];
  }>;
  inputCount: number;
  outputCount: number;
  isSequential: boolean;
}

interface TruthTableModalProps {
  selectedGate?: Gate;
  gateType?: string;
  customGateId?: string | null;
  showTruthTableModal: boolean;
  onClose: () => void;
  truthTableData?: {
    gateId: string;
    gateType: string;
    truthTable: Record<string, string>;
    result?: TruthTableResult;
    inputNames?: string[];
    outputNames?: string[];
    gateName?: string;
  } | null;
}

export const TruthTableModal: React.FC<TruthTableModalProps> = ({
  selectedGate,
  gateType,
  customGateId,
  showTruthTableModal,
  onClose,
  truthTableData,
}) => {
  const { customGates } = useCircuitStore();

  if (!showTruthTableModal) return null;

  // ツールパレットから選択された場合の処理
  if (gateType && !selectedGate) {
    // 基本ゲートの真理値表
    const getTruthTable = (): Record<string, string> | null => {
      switch (gateType) {
        case 'AND':
          return { '00': '0', '01': '0', '10': '0', '11': '1' };
        case 'OR':
          return { '00': '0', '01': '1', '10': '1', '11': '1' };
        case 'NOT':
          return { '0': '1', '1': '0' };
        case 'XOR':
          return { '00': '0', '01': '1', '10': '1', '11': '0' };
        case 'NAND':
          return { '00': '1', '01': '1', '10': '1', '11': '0' };
        case 'NOR':
          return { '00': '1', '01': '0', '10': '0', '11': '0' };
        default:
          return null;
      }
    };

    const truthTable = getTruthTable();
    if (truthTable) {
      const inputNames = gateType === 'NOT' ? ['入力'] : ['A', 'B'];
      const outputNames = ['出力'];

      return (
        <TruthTableDisplay
          gateType={gateType}
          truthTable={truthTable}
          inputNames={inputNames}
          outputNames={outputNames}
          gateName={`${gateType}ゲート`}
          onClose={onClose}
        />
      );
    }

    // カスタムゲートの場合
    if (gateType === 'CUSTOM' && customGateId) {
      // デモカスタムゲートから検索
      let customGate = DEMO_CUSTOM_GATES.find(g => g.id === customGateId);
      
      // ユーザー作成のカスタムゲートからも検索
      if (!customGate) {
        customGate = customGates.find(g => g.id === customGateId);
      }

      if (customGate && customGate.truthTable) {
        const inputNames = customGate.inputs.map(
          pin => pin.name || `入力${pin.index + 1}`
        );
        const outputNames = customGate.outputs.map(
          pin => pin.name || `出力${pin.index + 1}`
        );

        return (
          <TruthTableDisplay
            gateType="CUSTOM"
            truthTable={customGate.truthTable}
            inputNames={inputNames}
            outputNames={outputNames}
            gateName={customGate.displayName}
            onClose={onClose}
          />
        );
      }
    }
  }

  // 配置済みゲートから選択された場合（従来の処理）
  if (truthTableData?.result) {
    return (
      <TruthTableDisplay
        result={truthTableData.result}
        inputNames={truthTableData.inputNames || []}
        outputNames={truthTableData.outputNames || []}
        gateName={truthTableData.gateName || 'カスタムゲート'}
        onClose={onClose}
      />
    );
  }

  return null;
};

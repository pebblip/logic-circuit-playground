import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useCircuitStore } from '@/stores/circuitStore';
import { isCustomGate } from '@/types/gates';
import { booleanToDisplayState } from '@domain/simulation';
import { DetailModal } from './DetailModal';
import { TruthTableModal } from './TruthTableModal';
import { GateInfo } from './GateInfo';
import { ClockControls } from './ClockControls';
import { ActionButtons } from './ActionButtons';

export const PropertyPanel: React.FC = () => {
  const { gates, selectedGateId, updateClockFrequency } = useCircuitStore();
  const selectedGate = gates.find(g => g.id === selectedGateId);

  // モーダル管理用のstate
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showTruthTableModal, setShowTruthTableModal] = useState(false);
  const [truthTableData, setTruthTableData] = useState<{
    gateId: string;
    gateType: string;
    truthTable: Record<string, string>;
    result?: any;
    inputNames?: string[];
    outputNames?: string[];
    gateName?: string;
  } | null>(null);
  const [clockWasRunning, setClockWasRunning] = useState(false);

  // 前回のselectedGateIdを記憶
  const prevSelectedGateIdRef = useRef(selectedGateId);

  // ゲート選択が変わった時にモーダルを閉じる
  useEffect(() => {
    // 実際にselectedGateIdが変わった場合のみ処理
    if (prevSelectedGateIdRef.current !== selectedGateId) {
      prevSelectedGateIdRef.current = selectedGateId;

      // モーダルが開いている場合のみ処理
      if (showDetailModal || showTruthTableModal) {
        // すべてのCLOCKゲートの状態を復元
        if (clockWasRunning) {
          const currentGates = useCircuitStore.getState().gates;
          const updatedGates = currentGates.map(gate => {
            if (
              gate.type === 'CLOCK' &&
              gate.metadata &&
              !gate.metadata.isRunning
            ) {
              return {
                ...gate,
                metadata: { ...gate.metadata, isRunning: true },
              };
            }
            return gate;
          });
          useCircuitStore.setState({ gates: updatedGates });
          setClockWasRunning(false);
        }

        setShowDetailModal(false);
        setShowTruthTableModal(false);
        setTruthTableData(null);
      }
    }
  }, [selectedGateId, showDetailModal, showTruthTableModal, clockWasRunning]);

  // 強制的にモーダルを閉じる関数
  const forceCloseModal = useCallback(() => {
    // すべてのCLOCKゲートの実行状態を復元
    if (clockWasRunning) {
      // 最新のgatesを直接取得
      const currentGates = useCircuitStore.getState().gates;
      const updatedGates = currentGates.map(gate => {
        if (
          gate.type === 'CLOCK' &&
          gate.metadata &&
          !gate.metadata.isRunning
        ) {
          // 停止しているCLOCKゲートを再開
          return { ...gate, metadata: { ...gate.metadata, isRunning: true } };
        }
        return gate;
      });
      useCircuitStore.setState({ gates: updatedGates });
      setClockWasRunning(false);
    }

    setShowDetailModal(false);
    setShowTruthTableModal(false);
    setTruthTableData(null);
  }, [clockWasRunning]);

  // Escapeキーでモーダルを閉じる
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && (showDetailModal || showTruthTableModal)) {
        forceCloseModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showDetailModal, showTruthTableModal, forceCloseModal]);

  // 詳細説明表示ハンドラ
  const handleShowDetail = () => {
    // すべての実行中のCLOCKゲートを一時停止
    const runningClocks = gates.filter(
      g => g.type === 'CLOCK' && g.metadata?.isRunning
    );
    if (runningClocks.length > 0) {
      setClockWasRunning(true);
      const updatedGates = gates.map(gate => {
        if (gate.type === 'CLOCK' && gate.metadata?.isRunning) {
          return { ...gate, metadata: { ...gate.metadata, isRunning: false } };
        }
        return gate;
      });
      useCircuitStore.setState({ gates: updatedGates });
    }

    setShowDetailModal(true);
  };

  // 真理値表生成関数
  const getTruthTable = () => {
    if (!selectedGate) return [];

    // カスタムゲートの場合
    if (
      isCustomGate(selectedGate) &&
      selectedGate.customGateDefinition?.truthTable
    ) {
      const definition = selectedGate.customGateDefinition;
      const truthTable = definition.truthTable;
      if (!truthTable) return [];
      return Object.entries(truthTable).map(([inputs, outputs]) => {
        const row: Record<string, string> = {};

        // 入力列を追加
        definition.inputs.forEach((inputPin, index) => {
          row[inputPin.name] = inputs[index];
        });

        // 出力列を追加
        definition.outputs.forEach((outputPin, index) => {
          row[`out_${outputPin.name}`] = outputs[index];
        });

        return row;
      });
    }

    // 基本ゲートの真理値表
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
      case 'NOT':
        return [
          { a: 0, out: 1 },
          { a: 1, out: 0 },
        ];
      case 'XOR':
        return [
          { a: 0, b: 0, out: 0 },
          { a: 0, b: 1, out: 1 },
          { a: 1, b: 0, out: 1 },
          { a: 1, b: 1, out: 0 },
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

  // 真理値表表示ハンドラ
  const handleShowTruthTable = () => {
    if (!selectedGate) return;

    // すべての実行中のCLOCKゲートを一時停止
    const runningClocks = gates.filter(
      g => g.type === 'CLOCK' && g.metadata?.isRunning
    );
    if (runningClocks.length > 0) {
      setClockWasRunning(true);
      const updatedGates = gates.map(gate => {
        if (gate.type === 'CLOCK' && gate.metadata?.isRunning) {
          return { ...gate, metadata: { ...gate.metadata, isRunning: false } };
        }
        return gate;
      });
      useCircuitStore.setState({ gates: updatedGates });
    }

    // カスタムゲートの場合
    if (isCustomGate(selectedGate) && selectedGate.customGateDefinition) {
      const definition = selectedGate.customGateDefinition;
      const inputNames = definition.inputs.map(pin => pin.name);
      const outputNames = definition.outputs.map(pin => pin.name);

      // 真理値表の準備
      const truthTable = definition.truthTable;
      if (!truthTable) return;

      // truthTable形式を標準形式に変換
      const table = Object.entries(truthTable).map(([inputs, outputs]) => {
        return {
          inputs,
          outputs,
          inputValues: inputs.split('').map(bit => bit === '1'),
          outputValues: outputs.split('').map(bit => bit === '1'),
        };
      });

      const result = {
        table,
        inputCount: definition.inputs.length,
        outputCount: definition.outputs.length,
        isSequential: false,
      };

      setTruthTableData({
        gateId: selectedGate.id,
        gateType: selectedGate.type,
        truthTable: truthTable,
        result,
        inputNames,
        outputNames,
        gateName: definition.displayName,
      });
    } else {
      // 基本ゲートの場合
      const inputNames = selectedGate.type === 'NOT' ? ['A'] : ['A', 'B'];
      const outputNames = ['出力'];
      const gateName = `${selectedGate.type}ゲート`;

      // 基本ゲートの真理値表を生成
      const truthTable = getTruthTable() as any[];
      if (truthTable.length > 0) {
        const table = truthTable.map(row => {
          const inputs =
            selectedGate.type === 'NOT'
              ? booleanToDisplayState(!!row.a)
              : `${booleanToDisplayState(!!row.a)}${booleanToDisplayState(!!row.b)}`;
          const outputs = booleanToDisplayState(!!row.out);

          return {
            inputs,
            outputs,
            inputValues: inputs.split('').map(bit => bit === '1'),
            outputValues: outputs.split('').map(bit => bit === '1'),
          };
        });

        setTruthTableData({
          gateId: selectedGate.id,
          gateType: selectedGate.type,
          truthTable: truthTable.reduce((acc, row: any, index) => {
            const inputStr = selectedGate.type === 'NOT' 
              ? booleanToDisplayState(!!row.a)
              : `${booleanToDisplayState(!!row.a)}${booleanToDisplayState(!!(row.b || 0))}`;
            const outputStr = booleanToDisplayState(!!row.out);
            acc[inputStr] = outputStr;
            return acc;
          }, {} as Record<string, string>),
          result: {
            table,
            inputCount: inputNames.length,
            outputCount: 1,
            isSequential: false,
            recognizedPattern: selectedGate.type,
          },
          inputNames,
          outputNames,
          gateName,
        });
      }
    }

    setShowTruthTableModal(true);
  };

  if (!selectedGate) {
    return (
      <aside className="property-panel">
        <div className="property-group">
          <div className="section-title">
            <span>📝</span>
            <span>プロパティ</span>
          </div>
          <p
            style={{
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '14px',
              lineHeight: '1.6',
              textAlign: 'center',
              margin: '20px 0',
            }}
          >
            ゲートを選択すると
            <br />
            詳細情報が表示されます
          </p>
        </div>
      </aside>
    );
  }

  return (
    <>
      <aside className="property-panel">
        <GateInfo selectedGate={selectedGate} />
        <ActionButtons
          selectedGate={selectedGate}
          onShowDetail={handleShowDetail}
          onShowTruthTable={handleShowTruthTable}
        />
        <ClockControls
          selectedGate={selectedGate}
          updateClockFrequency={updateClockFrequency}
        />
      </aside>

      {/* モーダル */}
      <DetailModal
        selectedGate={selectedGate}
        showDetailModal={showDetailModal}
        onClose={forceCloseModal}
      />
      <TruthTableModal
        showTruthTableModal={showTruthTableModal}
        truthTableData={truthTableData}
        onClose={forceCloseModal}
      />
    </>
  );
};

import React from 'react';
import type { GateType, CustomGateDefinition } from '../types/circuit';
import { useCircuitStore } from '../stores/circuitStore';
import { CreateCustomGateDialog } from './dialogs/CreateCustomGateDialog';
import { TruthTableDisplay } from './TruthTableDisplay';
import { generateTruthTable } from '../domain/analysis';
import { displayStateToBoolean } from '../domain/simulation';
import { GateSection } from './tool-palette/GateSection';
import { CustomGateSection } from './tool-palette/CustomGateSection';
import { useDragGate } from './tool-palette/hooks/useDragGate';
import { useCustomGateDialog } from './tool-palette/hooks/useCustomGateDialog';

const BASIC_GATES: { type: GateType; label: string }[] = [
  { type: 'AND', label: 'AND' },
  { type: 'OR', label: 'OR' },
  { type: 'NOT', label: 'NOT' },
  { type: 'XOR', label: 'XOR' },
  { type: 'NAND', label: 'NAND' },
  { type: 'NOR', label: 'NOR' },
];

const IO_GATES: { type: GateType; label: string }[] = [
  { type: 'INPUT', label: 'INPUT' },
  { type: 'OUTPUT', label: 'OUTPUT' },
  { type: 'CLOCK', label: 'CLOCK' },
];

// 特殊ゲート
const SPECIAL_GATES: { type: GateType; label: string }[] = [
  { type: 'D-FF', label: 'D-FF' },
  { type: 'SR-LATCH', label: 'SR-LATCH' },
  { type: 'MUX', label: 'MUX' },
];

// デモ用カスタムゲート定義（教育的価値の高いもののみ）
const DEMO_CUSTOM_GATES: CustomGateDefinition[] = [
  {
    id: 'demo-half-adder',
    name: 'HalfAdder',
    displayName: '半加算器',
    description: '2進数の1桁加算を実現。A + B = Sum(S) + Carry(C)',
    inputs: [
      { name: 'A', index: 0 },
      { name: 'B', index: 1 },
    ],
    outputs: [
      { name: 'S', index: 0 }, // Sum（和）
      { name: 'C', index: 1 }, // Carry（桁上がり）
    ],
    truthTable: {
      '00': '00', // 0+0 = 0 (carry=0)
      '01': '10', // 0+1 = 1 (carry=0)
      '10': '10', // 1+0 = 1 (carry=0)
      '11': '01', // 1+1 = 0 (carry=1)
    },
    icon: '➕',
    category: 'arithmetic',
    width: 100,
    height: 80,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

export const ToolPalette: React.FC = () => {
  const { customGates, addCustomGate, createCustomGateFromCurrentCircuit, allowedGates } = useCircuitStore();
  
  const { startDrag, endDrag } = useDragGate();
  const {
    isCreateDialogOpen,
    dialogInitialData,
    isTruthTableOpen,
    currentTruthTable,
    closeCreateDialog,
    openTruthTable,
    closeTruthTable,
  } = useCustomGateDialog();

  const handleCreateCustomGate = (definition: CustomGateDefinition) => {
    const state = useCircuitStore.getState();
    const { gates, wires } = state;

    // isFullCircuitフラグがある場合は全回路から作成
    if (dialogInitialData.isFullCircuit) {
      const inputGates = gates.filter(g => g.type === 'INPUT');
      const outputGates = gates.filter(g => g.type === 'OUTPUT');

      // 内部回路の座標を正規化（左上を0,0に）
      const minX = Math.min(...gates.map(g => g.position.x));
      const minY = Math.min(...gates.map(g => g.position.y));

      const normalizedGates = gates.map(g => ({
        ...g,
        position: {
          x: g.position.x - minX,
          y: g.position.y - minY,
        },
      }));

      // 入出力マッピングを作成
      const inputMappings: Record<
        number,
        { gateId: string; pinIndex: number }
      > = {};
      inputGates.forEach((gate, index) => {
        inputMappings[index] = {
          gateId: gate.id,
          pinIndex: -1, // INPUTゲートの出力ピン
        };
      });

      const outputMappings: Record<
        number,
        { gateId: string; pinIndex: number }
      > = {};
      outputGates.forEach((gate, index) => {
        outputMappings[index] = {
          gateId: gate.id,
          pinIndex: 0, // OUTPUTゲートの入力ピン
        };
      });

      // 内部回路情報を定義に追加
      definition.internalCircuit = {
        gates: normalizedGates,
        wires: wires,
        inputMappings,
        outputMappings,
      };

      // 真理値表を自動生成
      try {
        const truthTableResult = generateTruthTable(
          normalizedGates,
          wires,
          inputGates,
          outputGates
        );

        // 真理値表をRecord形式に変換
        const truthTable: Record<string, string> = {};
        truthTableResult.table.forEach(row => {
          truthTable[row.inputs] = row.outputs;
        });

        definition.truthTable = truthTable;

        // 作成後に真理値表を表示
        const inputNames = definition.inputs.map(input => input.name);
        const outputNames = definition.outputs.map(output => output.name);

        openTruthTable({
          result: truthTableResult,
          inputNames,
          outputNames,
          gateName: definition.displayName,
        });
      } catch (error) {
        console.warn('真理値表の生成に失敗しました:', error);
      }
    }

    // 新しいカスタムゲート定義をストアに追加
    addCustomGate(definition);
    closeCreateDialog();
  };

  const handleContextMenu = (definition: CustomGateDefinition) => {
    if (definition.internalCircuit && definition.truthTable) {
      const inputNames = definition.inputs.map(input => input.name);
      const outputNames = definition.outputs.map(output => output.name);

      // 真理値表をTruthTableResult形式に変換
      const table = Object.entries(definition.truthTable).map(
        ([inputs, outputs]) => ({
          inputs,
          outputs,
          inputValues: inputs
            .split('')
            .map(bit => displayStateToBoolean(bit)),
          outputValues: outputs
            .split('')
            .map(bit => displayStateToBoolean(bit)),
        })
      );

      const result = {
        table,
        inputCount: definition.inputs.length,
        outputCount: definition.outputs.length,
        isSequential: false,
        recognizedPattern: undefined,
      };

      openTruthTable({
        result,
        inputNames,
        outputNames,
        gateName: definition.displayName,
      });
    }
  };

  return (
    <aside className="tool-palette">
      <GateSection
        title="基本ゲート"
        icon="🔲"
        gates={BASIC_GATES}
        allowedGates={allowedGates}
        onDragStart={startDrag}
        onDragEnd={endDrag}
      />

      <GateSection
        title="入出力"
        icon="🔌"
        gates={IO_GATES}
        allowedGates={allowedGates}
        onDragStart={startDrag}
        onDragEnd={endDrag}
      />

      <GateSection
        title="特殊ゲート"
        icon="⚙️"
        gates={SPECIAL_GATES}
        allowedGates={allowedGates}
        onDragStart={startDrag}
        onDragEnd={endDrag}
      />

      <CustomGateSection
        demoCustomGates={DEMO_CUSTOM_GATES}
        userCustomGates={customGates || []}
        onDragStart={startDrag}
        onDragEnd={endDrag}
        onContextMenu={handleContextMenu}
        onCreateFromCircuit={createCustomGateFromCurrentCircuit}
      />

      {/* カスタムゲート作成ダイアログ */}
      <CreateCustomGateDialog
        isOpen={isCreateDialogOpen}
        onClose={closeCreateDialog}
        onSave={handleCreateCustomGate}
        initialInputs={dialogInitialData.initialInputs}
        initialOutputs={dialogInitialData.initialOutputs}
        isReadOnly={dialogInitialData.isFullCircuit}
      />

      {/* 真理値表表示ダイアログ */}
      {isTruthTableOpen && currentTruthTable && (
        <TruthTableDisplay
          result={currentTruthTable.result}
          inputNames={currentTruthTable.inputNames}
          outputNames={currentTruthTable.outputNames}
          gateName={currentTruthTable.gateName}
          onClose={closeTruthTable}
        />
      )}
    </aside>
  );
};

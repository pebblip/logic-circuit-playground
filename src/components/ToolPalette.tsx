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
import { debug } from '../shared/debug';
import { useCustomGateDialog } from './tool-palette/hooks/useCustomGateDialog';
import { TERMS } from '../features/learning-mode/data/terms';

const BASIC_GATES: { type: GateType; label: string }[] = [
  { type: 'AND', label: 'AND' },
  { type: 'OR', label: 'OR' },
  { type: 'NOT', label: 'NOT' },
  { type: 'XOR', label: 'XOR' },
  { type: 'NAND', label: 'NAND' },
  { type: 'NOR', label: 'NOR' },
];

const IO_GATES: { type: GateType; label: string }[] = [
  { type: 'INPUT', label: TERMS.INPUT },
  { type: 'OUTPUT', label: TERMS.OUTPUT },
  { type: 'CLOCK', label: TERMS.CLOCK },
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
    // 内部回路：XORゲートとANDゲート
    internalCircuit: {
      gates: [
        {
          id: 'xor1',
          type: 'XOR',
          position: { x: 200, y: 150 },
          inputs: ['input0', 'input1'],
          output: false,
        },
        {
          id: 'and1',
          type: 'AND',
          position: { x: 200, y: 250 },
          inputs: ['input0', 'input1'],
          output: false,
        },
      ],
      wires: [],
      inputMappings: {
        0: { gateId: 'input0', pinIndex: 0 },
        1: { gateId: 'input1', pinIndex: 0 },
      },
      outputMappings: {
        0: { gateId: 'xor1', pinIndex: 0 },
        1: { gateId: 'and1', pinIndex: 0 },
      },
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
  const {
    customGates,
    addCustomGate,
    gates,
    wires: _wires,
    allowedGates,
    selectedToolGateType,
    selectedToolCustomGateId,
    selectToolGate,
  } = useCircuitStore();

  const { startDrag, endDrag } = useDragGate();
  const {
    isCreateDialogOpen,
    dialogInitialData,
    isTruthTableOpen,
    currentTruthTable,
    openCreateDialog: _openCreateDialog,
    closeCreateDialog,
    openTruthTable,
    closeTruthTable,
  } = useCustomGateDialog();

  // 回路からカスタムゲート作成ダイアログを開く
  const _handleOpenCreateFromCircuit = () => {
    const inputGates = gates.filter(g => g.type === 'INPUT');
    const outputGates = gates.filter(g => g.type === 'OUTPUT');

    if (inputGates.length === 0 || outputGates.length === 0) {
      alert(
        `${TERMS.CIRCUIT}には${TERMS.INPUT}${TERMS.GATE}と${TERMS.OUTPUT}${TERMS.GATE}が${TERMS.REQUIRED}です`
      );
      return;
    }

    // 回路から検出されたピン情報を作成
    const initialInputs = inputGates.map((gate, index) => ({
      name: `IN${index + 1}`,
      index,
      gateId: gate.id,
    }));

    const initialOutputs = outputGates.map((gate, index) => ({
      name: `OUT${index + 1}`,
      index,
      gateId: gate.id,
    }));

    // デバッグ: 初期値を確認
    debug.log('=== Initial Values Debug ===');
    debug.log('initialInputs:', initialInputs);
    debug.log('initialOutputs:', initialOutputs);

    // カスタムイベントを発火してダイアログを開く
    const event = new CustomEvent('open-custom-gate-dialog', {
      detail: {
        initialInputs,
        initialOutputs,
        isFullCircuit: true,
      },
    });
    window.dispatchEvent(event);
  };

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
        const inputNames = definition.inputs.map(
          (input, index) => input.name || `IN${index + 1}`
        );
        const outputNames = definition.outputs.map(
          (output, index) => output.name || `OUT${index + 1}`
        );

        // デバッグ: 真理値表表示時のpropsを確認
        debug.log('=== ToolPalette Truth Table Debug (Create) ===');
        debug.log('CRITICAL: definition object:', definition);
        debug.log('CRITICAL: definition.inputs:', definition.inputs);
        debug.log('CRITICAL: definition.outputs:', definition.outputs);
        debug.log(
          'CRITICAL: definition.outputs length:',
          definition.outputs?.length
        );
        debug.log(
          'CRITICAL: definition.outputs structure:',
          JSON.stringify(definition.outputs, null, 2)
        );

        // outputsの詳細を一つずつ確認
        if (definition.outputs) {
          definition.outputs.forEach((output, index) => {
            debug.log(`CRITICAL: output[${index}]:`, output);
            debug.log(`CRITICAL: output[${index}].name:`, output?.name);
          });
        } else {
          debug.log('CRITICAL: definition.outputs is null/undefined!');
        }

        debug.log('inputNames:', inputNames);
        debug.log('outputNames:', outputNames);
        debug.log('truthTableResult:', truthTableResult);

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
    // internalCircuitがないデモカスタムゲートも真理値表を表示できるように修正
    if (definition.truthTable) {
      const inputNames = definition.inputs.map(
        (input, index) => input.name || `IN${index + 1}`
      );
      const outputNames = definition.outputs.map(
        (output, index) => output.name || `OUT${index + 1}`
      );

      // デバッグ: 右クリックメニューでの真理値表表示時のpropsを確認
      debug.log('=== ToolPalette Truth Table Debug (Context Menu) ===');
      debug.log('definition:', definition);
      debug.log('definition.inputs:', definition.inputs);
      debug.log('definition.outputs:', definition.outputs);
      debug.log('definition.outputs length:', definition.outputs?.length);
      debug.log(
        'definition.outputs structure:',
        JSON.stringify(definition.outputs, null, 2)
      );

      // outputsの詳細を一つずつ確認
      if (definition.outputs) {
        definition.outputs.forEach((output, index) => {
          debug.log(`output[${index}]:`, output);
          debug.log(`output[${index}].name:`, output?.name);
        });
      }

      debug.log('inputNames:', inputNames);
      debug.log('outputNames:', outputNames);
      debug.log('definition.truthTable:', definition.truthTable);

      // 真理値表をTruthTableResult形式に変換
      const table = Object.entries(definition.truthTable).map(
        ([inputs, outputs]) => ({
          inputs,
          outputs,
          inputValues: inputs.split('').map(bit => displayStateToBoolean(bit)),
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

      debug.log('Generated TruthTableResult:', result);

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
      <div className="tool-palette-sections">
        <GateSection
          title="基本ゲート"
          icon="🔲"
          gates={BASIC_GATES}
          allowedGates={allowedGates}
          selectedGateType={selectedToolGateType}
          onDragStart={startDrag}
          onDragEnd={endDrag}
          onGateClick={type => selectToolGate(type)}
        />

        <GateSection
          title="入出力"
          icon="🔌"
          gates={IO_GATES}
          allowedGates={allowedGates}
          selectedGateType={selectedToolGateType}
          onDragStart={startDrag}
          onDragEnd={endDrag}
          onGateClick={type => selectToolGate(type)}
        />

        <GateSection
          title="特殊ゲート"
          icon="⚙️"
          gates={SPECIAL_GATES}
          allowedGates={allowedGates}
          selectedGateType={selectedToolGateType}
          onDragStart={startDrag}
          onDragEnd={endDrag}
          onGateClick={type => selectToolGate(type)}
        />

        <CustomGateSection
          demoCustomGates={DEMO_CUSTOM_GATES}
          userCustomGates={customGates || []}
          selectedGateType={selectedToolGateType}
          selectedCustomGateId={selectedToolCustomGateId}
          onDragStart={startDrag}
          onDragEnd={endDrag}
          onContextMenu={handleContextMenu}
          onGateClick={customGateId => selectToolGate('CUSTOM', customGateId)}
        />
      </div>

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

import { Gate, Wire, GateType } from '../types/circuit';
import { isCustomGate } from '../types/gates';

// ゲートのロジックを評価
export function evaluateGate(gate: Gate, inputs: boolean[]): boolean | boolean[] {
  switch (gate.type) {
    case 'INPUT':
      return gate.output;
    
    case 'OUTPUT':
      return inputs[0] || false;
    
    case 'AND':
      return inputs.length === 2 && inputs[0] && inputs[1];
    
    case 'OR':
      return inputs.some(input => input);
    
    case 'NOT':
      return !inputs[0];
    
    case 'XOR':
      return inputs.length === 2 && inputs[0] !== inputs[1];
    
    case 'NAND':
      return !(inputs.length === 2 && inputs[0] && inputs[1]);
    
    case 'NOR':
      return !inputs.some(input => input);
    
    // 特殊ゲート（今後実装）
    case 'CLOCK':
      // CLOCKゲートは自己生成信号
      if (gate.metadata?.isRunning) {
        const frequency = gate.metadata.frequency || 1;
        const period = 1000 / frequency;
        const now = Date.now();
        const startTime = gate.metadata.startTime || now;
        const elapsed = now - startTime;
        // 周期的な切り替え
        return Math.floor(elapsed / period) % 2 === 1;
      }
      return false;
    
    case 'D-FF':
      // D-FFの実装（立ち上がりエッジでDをキャプチャ）
      if (gate.metadata && inputs.length >= 2) {
        const d = inputs[0];
        const clk = inputs[1];
        const prevClk = gate.metadata.previousClockState || false;
        
        // 立ち上がりエッジ検出
        if (!prevClk && clk) {
          gate.metadata.qOutput = d;
          gate.metadata.qBarOutput = !d;
        }
        
        // 現在のクロック状態を保存
        gate.metadata.previousClockState = clk;
        
        return gate.metadata.qOutput;
      }
      return false;
    
    case 'SR-LATCH':
      // SR-Latchの実装
      if (gate.metadata && inputs.length >= 2) {
        const s = inputs[0]; // Set
        const r = inputs[1]; // Reset
        
        // S=1, R=0 => Q=1
        if (s && !r) {
          gate.metadata.qOutput = true;
          gate.metadata.qBarOutput = false;
        }
        // S=0, R=1 => Q=0
        else if (!s && r) {
          gate.metadata.qOutput = false;
          gate.metadata.qBarOutput = true;
        }
        // S=0, R=0 => 状態保持
        // S=1, R=1 => 不定状態（避けるべき）
        
        return gate.metadata.qOutput;
      }
      return false;
    
    case 'MUX':
      // 2:1 MUXの実装
      if (inputs.length >= 3) {
        const i0 = inputs[0];    // Input 0
        const i1 = inputs[1];    // Input 1
        const select = inputs[2]; // Select
        // S=0 => Y=I0, S=1 => Y=I1
        return select ? i1 : i0;
      }
      return false;
    
    case 'CUSTOM':
      // カスタムゲートの評価
      if (isCustomGate(gate) && gate.customGateDefinition) {
        const definition = gate.customGateDefinition;
        console.log('🔧 カスタムゲート評価開始:', {
          gateId: gate.id,
          gateName: definition.name,
          inputs: inputs,
          inputsLength: inputs.length,
          definitionInputs: definition.inputs.length,
          outputsCount: definition.outputs.length
        });
        
        // 内部回路がある場合は回路評価
        if (definition.internalCircuit) {
          console.log('📋 内部回路を評価:', {
            internalGatesCount: definition.internalCircuit.gates.length,
            inputMappings: definition.internalCircuit.inputMappings,
            outputMappings: definition.internalCircuit.outputMappings
          });
          
          // 入力値を内部ゲートにマッピング
          const internalGates = definition.internalCircuit.gates.map(g => ({ ...g }));
          
          // 入力マッピングを適用
          Object.entries(definition.internalCircuit.inputMappings).forEach(([pinIndex, mapping]) => {
            const inputValue = inputs[Number(pinIndex)] || false;
            const targetGate = internalGates.find(g => g.id === mapping.gateId);
            console.log('🔌 入力マッピング適用:', {
              pinIndex,
              inputValue,
              targetGateId: mapping.gateId,
              targetGateType: targetGate?.type
            });
            if (targetGate) {
              // INPUTゲートの場合はoutputを設定
              if (targetGate.type === 'INPUT') {
                targetGate.output = inputValue;
                console.log('📥 INPUTゲート出力設定:', { gateId: targetGate.id, output: inputValue });
              } else if (mapping.pinIndex < targetGate.inputs.length) {
                targetGate.inputs[mapping.pinIndex] = inputValue ? '1' : '';
                console.log('📥 ゲート入力設定:', { 
                  gateId: targetGate.id, 
                  pinIndex: mapping.pinIndex, 
                  value: inputValue ? '1' : '' 
                });
              }
            }
          });
          
          // 内部回路を評価
          const { gates: evaluatedGates } = evaluateCircuit(
            internalGates, 
            definition.internalCircuit.wires
          );
          
          console.log('⚡ 内部回路評価完了:', {
            evaluatedGatesCount: evaluatedGates.length,
            gateOutputs: evaluatedGates.map(g => ({ id: g.id, type: g.type, output: g.output }))
          });
          
          // 全ての出力マッピングから結果を取得
          const outputs: boolean[] = [];
          for (let outputIndex = 0; outputIndex < definition.outputs.length; outputIndex++) {
            const outputMapping = definition.internalCircuit.outputMappings[outputIndex];
            if (outputMapping) {
              const outputGate = evaluatedGates.find(g => g.id === outputMapping.gateId);
              console.log('📤 出力マッピング処理 [' + outputIndex + ']:', {
                outputMapping,
                outputGateId: outputMapping.gateId,
                outputGateFound: !!outputGate,
                outputGateType: outputGate?.type,
                outputGateOutput: outputGate?.output
              });
              if (outputGate) {
                let result;
                // OUTPUTゲートの場合、outputを返す
                if (outputGate.type === 'OUTPUT') {
                  result = outputGate.output;
                  console.log('✅ OUTPUTゲートから結果取得 [' + outputIndex + ']:', { result });
                }
                // その他のゲートで出力ピンの場合
                else if (outputMapping.pinIndex === -1) {
                  result = outputGate.output;
                  console.log('✅ 出力ピンから結果取得 [' + outputIndex + ']:', { result });
                }
                // 入力ピンの場合
                else {
                  result = outputGate.inputs[outputMapping.pinIndex] === '1';
                  console.log('✅ 入力ピンから結果取得 [' + outputIndex + ']:', { 
                    pinIndex: outputMapping.pinIndex,
                    pinValue: outputGate.inputs[outputMapping.pinIndex],
                    result 
                  });
                }
                outputs.push(result);
              } else {
                outputs.push(false);
              }
            } else {
              outputs.push(false);
            }
          }
          
          console.log('🎯 カスタムゲート全出力:', { outputs });
          
          // 単一出力の場合は後方互換性のためにbooleanを返す
          if (outputs.length === 1) {
            return outputs[0];
          }
          // 複数出力の場合は配列を返す
          return outputs;
        }
        // 真理値表がある場合はフォールバック
        else if (definition.truthTable) {
          const inputPattern = inputs.map(input => input ? '1' : '0').join('');
          const outputPattern = definition.truthTable[inputPattern];
          
          console.log('📊 真理値表フォールバック処理:', {
            gateId: gate.id,
            gateName: definition.name,
            inputs,
            inputPattern,
            truthTable: definition.truthTable,
            outputPattern
          });
          
          if (outputPattern) {
            // 真理値表から全ての出力を取得
            const outputs = outputPattern.split('').map(bit => bit === '1');
            console.log('✅ 真理値表から結果取得:', { outputs });
            
            // 単一出力の場合は後方互換性のためにbooleanを返す
            if (outputs.length === 1) {
              return outputs[0];
            }
            // 複数出力の場合は配列を返す
            return outputs;
          }
        }
      }
      return false;
    
    default:
      return false;
  }
}

// 回路全体を評価
export function evaluateCircuit(gates: Gate[], wires: Wire[]): { gates: Gate[], wires: Wire[] } {
  // ゲートをコピー（immutability）
  const updatedGates = gates.map(gate => ({ ...gate }));
  const updatedWires = wires.map(wire => ({ ...wire }));
  
  // ゲートの出力を計算するための依存関係グラフを構築
  const gateInputs = new Map<string, boolean[]>();
  const gateOutputConnections = new Map<string, { wireId: string, toGateId: string, toPinIndex: number }[]>();
  
  // 各ゲートの入力配列を初期化
  updatedGates.forEach(gate => {
    let inputCount = 2; // デフォルト
    if (gate.type === 'NOT' || gate.type === 'OUTPUT') {
      inputCount = 1;
    } else if (gate.type === 'D-FF' || gate.type === 'SR-LATCH') {
      inputCount = 2;
    } else if (gate.type === 'MUX') {
      inputCount = 3;
    } else if (gate.type === 'CLOCK' || gate.type === 'INPUT') {
      inputCount = 0;
    } else if (gate.type === 'CUSTOM' && isCustomGate(gate) && gate.customGateDefinition) {
      inputCount = gate.customGateDefinition.inputs.length;
    }
    gateInputs.set(gate.id, new Array(inputCount).fill(false));
    gateOutputConnections.set(gate.id, []);
  });
  
  // ワイヤーの接続情報を解析
  updatedWires.forEach(wire => {
    const fromGate = updatedGates.find(g => g.id === wire.from.gateId);
    const toGate = updatedGates.find(g => g.id === wire.to.gateId);
    
    if (fromGate && toGate) {
      // 出力側のゲートに接続情報を追加
      const connections = gateOutputConnections.get(fromGate.id) || [];
      connections.push({
        wireId: wire.id,
        toGateId: toGate.id,
        toPinIndex: wire.to.pinIndex
      });
      gateOutputConnections.set(fromGate.id, connections);
    }
  });
  
  // トポロジカルソートで評価順序を決定
  const visited = new Set<string>();
  const evaluationOrder: string[] = [];
  
  function visit(gateId: string) {
    if (visited.has(gateId)) return;
    visited.add(gateId);
    
    // このゲートに入力を提供するゲートを先に訪問
    updatedWires.forEach(wire => {
      if (wire.to.gateId === gateId) {
        visit(wire.from.gateId);
      }
    });
    
    evaluationOrder.push(gateId);
  }
  
  // すべてのゲートを訪問
  updatedGates.forEach(gate => visit(gate.id));
  
  // 評価順序に従ってゲートを評価
  evaluationOrder.forEach(gateId => {
    const gate = updatedGates.find(g => g.id === gateId);
    if (!gate) return;
    
    // CLOCKゲートの場合、開始時刻を初期化
    if (gate.type === 'CLOCK' && gate.metadata && !gate.metadata.startTime) {
      gate.metadata.startTime = Date.now();
    }
    
    // このゲートへの入力を収集
    const inputs = gateInputs.get(gateId) || [];
    updatedWires.forEach(wire => {
      if (wire.to.gateId === gateId) {
        const fromGate = updatedGates.find(g => g.id === wire.from.gateId);
        if (fromGate) {
          // カスタムゲートで複数出力がある場合
          if (fromGate.type === 'CUSTOM' && fromGate.outputs && wire.from.pinIndex < 0) {
            // 出力ピンインデックスを計算（-1 → 0, -2 → 1, ...）
            const outputIndex = (-wire.from.pinIndex) - 1;
            inputs[wire.to.pinIndex] = fromGate.outputs[outputIndex] || false;
          } else {
            // 通常のゲートまたは単一出力
            inputs[wire.to.pinIndex] = fromGate.output;
          }
        }
      }
    });
    
    // ゲートを評価
    if (gate.type !== 'INPUT') {
      const result = evaluateGate(gate, inputs);
      
      // 結果が配列の場合（複数出力）
      if (Array.isArray(result)) {
        gate.outputs = result;
        // 後方互換性のため、最初の出力を gate.output にも設定
        gate.output = result[0] || false;
      } else {
        // 単一出力の場合
        gate.output = result;
        // outputs配列もクリア
        gate.outputs = undefined;
      }
    }
    
    // すべてのゲートで入力状態を保存（表示用）
    if (gate.type !== 'INPUT') {
      gate.inputs = inputs.map(input => input ? '1' : '');
    }
    
    // このゲートから出ているワイヤーの状態を更新
    const connections = gateOutputConnections.get(gateId) || [];
    connections.forEach(conn => {
      const wire = updatedWires.find(w => w.id === conn.wireId);
      if (wire && wire.from.gateId === gateId) {
        // カスタムゲートで複数出力がある場合
        if (gate.type === 'CUSTOM' && gate.outputs && wire.from.pinIndex < 0) {
          // 出力ピンインデックスを計算（-1 → 0, -2 → 1, ...）
          const outputIndex = (-wire.from.pinIndex) - 1;
          wire.isActive = gate.outputs[outputIndex] || false;
        } else {
          // 通常のゲートまたは単一出力
          wire.isActive = gate.output;
        }
      }
    });
  });
  
  // カスタムゲートの評価結果をログ出力
  const customGates = updatedGates.filter(g => g.type === 'CUSTOM');
  if (customGates.length > 0) {
    console.log('🔄 回路評価完了 - カスタムゲート状態:', {
      customGatesCount: customGates.length,
      customGateStates: customGates.map(g => ({
        id: g.id,
        name: g.customGateDefinition?.name,
        inputs: g.inputs,
        output: g.output,
        inputsLength: g.inputs.length,
        definitionInputsLength: g.customGateDefinition?.inputs.length
      }))
    });
  }
  
  return { gates: updatedGates, wires: updatedWires };
}
import { describe, it, expect } from 'vitest';
import { UltraModernCircuitViewModel } from '../../model/UltraModernCircuitViewModel';

describe('OUTPUTゲートの表示テスト', () => {
  it('INPUTからOUTPUTへの信号伝播', () => {
    const viewModel = new UltraModernCircuitViewModel();
    
    console.log('=== INPUTとOUTPUTの接続テスト ===');
    
    // INPUT -> OUTPUT回路を作成
    const input = viewModel.addGate('INPUT', 100, 100);
    const output = viewModel.addGate('OUTPUT', 300, 100);
    
    viewModel.addConnection(input.id, 0, output.id, 0);
    
    // 初期状態
    let results = viewModel.getSimulationResults();
    console.log('初期状態:');
    console.log('  INPUT:', results[input.id]);
    console.log('  OUTPUT:', results[output.id]);
    
    // INPUTをONにする
    viewModel.toggleInput(input.id);
    results = viewModel.getSimulationResults();
    console.log('INPUT ON後:');
    console.log('  INPUT:', results[input.id]);
    console.log('  OUTPUT:', results[output.id]);
    
    // 内部ゲートの状態も確認
    const inputInternalId = (viewModel as any).gateIdMap.get(input.id);
    const outputInternalId = (viewModel as any).gateIdMap.get(output.id);
    
    const inputGate = (viewModel as any).circuit.getGate(inputInternalId);
    const outputGate = (viewModel as any).circuit.getGate(outputInternalId);
    
    console.log('内部ゲートの状態:');
    console.log('  INPUT出力値:', inputGate?.outputs[0]?.value);
    console.log('  OUTPUT入力値:', outputGate?.inputs[0]?.value);
    console.log('  OUTPUT出力値:', outputGate?.outputs[0]?.value);
  });

  it('CLOCKからOUTPUTへの信号伝播', () => {
    const viewModel = new UltraModernCircuitViewModel();
    
    console.log('=== CLOCKとOUTPUTの接続テスト ===');
    
    // CLOCK -> OUTPUT回路を作成
    const clock = viewModel.addGate('CLOCK', 100, 100);
    const output = viewModel.addGate('OUTPUT', 300, 100);
    
    viewModel.addConnection(clock.id, 0, output.id, 0);
    
    // 初期状態
    let results = viewModel.getSimulationResults();
    console.log('初期状態:');
    console.log('  CLOCK:', results[clock.id]);
    console.log('  OUTPUT:', results[output.id]);
    
    // CLOCKを手動でトグル
    const clockInternalId = (viewModel as any).gateIdMap.get(clock.id);
    const clockGate = (viewModel as any).circuit.getGate(clockInternalId);
    
    if (clockGate) {
      clockGate.toggle();
      viewModel.simulate();
      
      results = viewModel.getSimulationResults();
      console.log('CLOCK トグル後:');
      console.log('  CLOCK:', results[clock.id]);
      console.log('  OUTPUT:', results[output.id]);
      
      // 内部状態も確認
      const outputInternalId = (viewModel as any).gateIdMap.get(output.id);
      const outputGate = (viewModel as any).circuit.getGate(outputInternalId);
      
      console.log('内部ゲートの状態:');
      console.log('  CLOCK出力値:', clockGate.outputs[0]?.value);
      console.log('  OUTPUT入力値:', outputGate?.inputs[0]?.value);
      console.log('  OUTPUT出力値:', outputGate?.outputs[0]?.value);
    }
  });

  it('OUTPUTゲートのcompute動作確認', () => {
    const viewModel = new UltraModernCircuitViewModel();
    
    console.log('=== OUTPUTゲートのcompute確認 ===');
    
    const output = viewModel.addGate('OUTPUT', 300, 100);
    const outputInternalId = (viewModel as any).gateIdMap.get(output.id);
    const outputGate = (viewModel as any).circuit.getGate(outputInternalId);
    
    if (outputGate) {
      console.log('OUTPUTゲートの型:', outputGate.constructor.name);
      console.log('computeメソッド:', typeof outputGate.compute === 'function');
      
      // 手動で入力値を設定
      if (outputGate.inputs[0]) {
        outputGate.inputs[0].value = true;
        console.log('入力値をtrueに設定');
      }
      
      console.log('compute前の出力値:', outputGate.outputs[0]?.value);
      outputGate.compute();
      console.log('compute後の出力値:', outputGate.outputs[0]?.value);
      
      // シミュレーション実行
      viewModel.simulate();
      const results = viewModel.getSimulationResults();
      console.log('シミュレーション後のVM結果:', results[output.id]);
    }
  });
});
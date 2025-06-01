import { Gate, GateType, Position } from '../../types/circuit';
import { GATE_SIZES, PIN_CONFIGS } from '../../types/gates';

export class GateFactory {
  /**
   * ゲートを作成する
   * 既存のaddGateとの互換性を保ちながら、特殊ゲートに対応
   */
  static createGate(type: GateType, position: Position): Gate {
    const id = `gate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const pinConfig = PIN_CONFIGS[type];
    
    // 基本的なゲート構造
    const baseGate: Gate = {
      id,
      type,
      position,
      inputs: this.createInputArray(type),
      output: type === 'INPUT' ? false : false,
    };

    // 特殊ゲート用のメタデータを追加
    switch (type) {
      case 'CLOCK':
        return {
          ...baseGate,
          metadata: {
            frequency: 1, // 1Hz default
            isRunning: true,
            startTime: Date.now(),
          }
        };
      
      case 'D-FF':
        return {
          ...baseGate,
          inputs: ['', ''], // D, CLK
          metadata: {
            clockEdge: 'rising',
            previousClockState: false,
            qOutput: false,
            qBarOutput: true,
          }
        };
      
      case 'SR-LATCH':
        return {
          ...baseGate,
          inputs: ['', ''], // S, R
          output: false, // 初期状態
          metadata: {
            qOutput: false,
            qBarOutput: true,
          }
        };
      
      case 'MUX':
        return {
          ...baseGate,
          inputs: ['', '', ''], // 2:1 MUX default (2 data + 1 select)
          metadata: {
            dataInputs: ['', ''],
            selectInputs: [''],
          }
        };
      
      default:
        return baseGate;
    }
  }

  /**
   * ゲートタイプに応じた入力配列を作成
   */
  private static createInputArray(type: GateType): string[] {
    const config = PIN_CONFIGS[type];
    
    if (type === 'INPUT' || type === 'CLOCK') {
      return []; // 入力ピンなし
    }
    
    if (type === 'NOT' || type === 'OUTPUT') {
      return ['']; // 1入力
    }
    
    if (type === 'MUX') {
      return ['', '', '']; // デフォルトは2:1 MUX
    }
    
    // その他は2入力
    return ['', ''];
  }

  /**
   * ゲートのサイズを取得
   */
  static getGateSize(type: GateType): { width: number; height: number } {
    return GATE_SIZES[type] || { width: 70, height: 50 };
  }

  /**
   * ゲートのピン数を取得
   */
  static getPinCount(type: GateType): { inputs: number; outputs: number } {
    return PIN_CONFIGS[type] || { inputs: 2, outputs: 1 };
  }
}
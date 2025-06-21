import type { CircuitMetadata } from '../data/gallery';

export interface ValidationError {
  type: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
  autoFix?: () => void;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  suggestions: ValidationError[];
}

export class CircuitValidator {
  /**
   * ギャラリー回路の品質検証
   */
  static validate(circuit: CircuitMetadata): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const suggestions: ValidationError[] = [];

    // 1. 基本構造チェック
    this.validateBasicStructure(circuit, errors);

    // 2. simulationConfig チェック
    this.validateSimulationConfig(circuit, errors, warnings);

    // 3. メタデータ命名規則チェック
    this.validateMetadataNaming(circuit, errors);

    // 4. オシレーター回路の整合性チェック
    this.validateOscillatorConsistency(circuit, warnings);

    // 5. パフォーマンスチェック
    this.validatePerformance(circuit, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  private static validateBasicStructure(
    circuit: CircuitMetadata,
    errors: ValidationError[]
  ) {
    if (!circuit.id) {
      errors.push({
        type: 'error',
        message: 'Circuit ID is required',
      });
    }

    if (!circuit.title) {
      errors.push({
        type: 'error',
        message: 'Circuit title is required',
      });
    }

    if (!circuit.gates || circuit.gates.length === 0) {
      errors.push({
        type: 'error',
        message: 'Circuit must have at least one gate',
      });
    }

    // ワイヤー接続の整合性チェック
    circuit.wires?.forEach(wire => {
      const fromGate = circuit.gates.find(g => g.id === wire.from.gateId);
      const toGate = circuit.gates.find(g => g.id === wire.to.gateId);

      if (!fromGate) {
        errors.push({
          type: 'error',
          message: `Wire ${wire.id}: from gate "${wire.from.gateId}" not found`,
        });
      }

      if (!toGate) {
        errors.push({
          type: 'error',
          message: `Wire ${wire.id}: to gate "${wire.to.gateId}" not found`,
        });
      }
    });
  }

  private static validateSimulationConfig(
    circuit: CircuitMetadata,
    errors: ValidationError[],
    warnings: ValidationError[]
  ) {
    const hasOscillatorGates = circuit.gates.some(
      g => g.type === 'D-FF' || g.type === 'SR-LATCH'
    );

    const hasOscillatorKeywords = [
      'オシレータ',
      'カオス',
      'メモリ',
      'フィボナッチ',
      'マンダラ',
      'ジョンソン',
    ].some(keyword => circuit.title.includes(keyword));

    if (hasOscillatorGates || hasOscillatorKeywords) {
      if (!circuit.simulationConfig?.needsAnimation) {
        errors.push({
          type: 'error',
          message: `オシレーター回路 "${circuit.title}" には simulationConfig.needsAnimation: true が必要です`,
          suggestion: `simulationConfig: { needsAnimation: true, updateInterval: 200, expectedBehavior: 'oscillator' }`,
          autoFix: () => {
            if (!circuit.simulationConfig) {
              // 型安全な方法で新しいオブジェクトを作成
              const updatedCircuit = circuit as CircuitMetadata & {
                simulationConfig: NonNullable<
                  CircuitMetadata['simulationConfig']
                >;
              };
              updatedCircuit.simulationConfig = {};
            }
            circuit.simulationConfig!.needsAnimation = true;
            circuit.simulationConfig!.updateInterval =
              circuit.simulationConfig!.updateInterval ?? 200;
            circuit.simulationConfig!.expectedBehavior =
              circuit.simulationConfig!.expectedBehavior ?? 'oscillator';
          },
        });
      }
    }

    // CLOCKゲートの周波数チェック
    const clockGates = circuit.gates.filter(g => g.type === 'CLOCK');
    if (clockGates.length > 0 && circuit.simulationConfig?.clockFrequency) {
      clockGates.forEach(clock => {
        if (
          clock.metadata?.frequency !== circuit.simulationConfig?.clockFrequency
        ) {
          warnings.push({
            type: 'warning',
            message: `CLOCK gate "${clock.id}" frequency (${clock.metadata?.frequency}) doesn't match simulationConfig.clockFrequency (${circuit.simulationConfig?.clockFrequency})`,
          });
        }
      });
    }
  }

  private static validateMetadataNaming(
    circuit: CircuitMetadata,
    errors: ValidationError[]
  ) {
    circuit.gates.forEach(gate => {
      if (gate.type === 'D-FF' && gate.metadata) {
        // 型レベルで 'state' は完全に排除済み
        // 必要なプロパティの検証のみ行う

        // 必須プロパティのチェック
        if (!('previousClockState' in gate.metadata)) {
          errors.push({
            type: 'error',
            message: `D-FF gate "${gate.id}": 'previousClockState' プロパティが必要です`,
            autoFix: () => {
              gate.metadata!.previousClockState = false;
            },
          });
        }
      }
    });
  }

  private static validateOscillatorConsistency(
    circuit: CircuitMetadata,
    warnings: ValidationError[]
  ) {
    if (circuit.simulationConfig?.needsAnimation) {
      // アニメーションが必要な回路で OUTPUT ゲートがない場合
      const outputGates = circuit.gates.filter(g => g.type === 'OUTPUT');
      if (outputGates.length === 0) {
        warnings.push({
          type: 'warning',
          message:
            'オシレーター回路ですが OUTPUT ゲートがありません。動作確認が困難です。',
        });
      }

      // 更新間隔が適切か
      const interval = circuit.simulationConfig.updateInterval ?? 200;
      if (interval < 50) {
        warnings.push({
          type: 'warning',
          message: `更新間隔 ${interval}ms は短すぎる可能性があります（推奨: 100ms以上）`,
        });
      }

      if (interval > 1000) {
        warnings.push({
          type: 'warning',
          message: `更新間隔 ${interval}ms は長すぎる可能性があります（推奨: 500ms以下）`,
        });
      }
    }
  }

  private static validatePerformance(
    circuit: CircuitMetadata,
    warnings: ValidationError[]
  ) {
    const gateCount = circuit.gates.length;
    const wireCount = circuit.wires.length;

    if (gateCount > 50) {
      warnings.push({
        type: 'warning',
        message: `ゲート数が多い (${gateCount}個) ため、パフォーマンスに影響する可能性があります`,
      });
    }

    if (wireCount > 100) {
      warnings.push({
        type: 'warning',
        message: `ワイヤー数が多い (${wireCount}本) ため、パフォーマンスに影響する可能性があります`,
      });
    }

    // 複雑度チェック（1ゲートあたりのワイヤー数）
    const wireToGateRatio = wireCount / gateCount;
    if (wireToGateRatio > 3) {
      warnings.push({
        type: 'warning',
        message: `回路の複雑度が高い (ワイヤー/ゲート比: ${wireToGateRatio.toFixed(1)}) ため、理解が困難な可能性があります`,
      });
    }
  }
}

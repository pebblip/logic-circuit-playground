import type { Gate, Wire } from '../../../types';
import type { Puzzle, PuzzleTestCase } from '../data/puzzles';

export interface ValidationResult {
  passed: boolean;
  message: string;
  testResults: boolean[];
  constraintErrors: string[];
}

export class PuzzleValidator {
  constructor(private puzzle: Puzzle) {}

  /**
   * 回路全体を検証
   * ultrathink: シンプルで明確な検証ロジック
   */
  validateCircuit(gates: Gate[], wires: Wire[]): ValidationResult {
    // 1. 制約条件をチェック
    const constraintErrors = this.validateConstraints(gates, wires);

    // 2. 入力/出力ゲートの数をチェック
    const inputGates = gates.filter(g => g.type === 'INPUT');
    const outputGates = gates.filter(g => g.type === 'OUTPUT');

    if (inputGates.length === 0) {
      return {
        passed: false,
        message: 'INPUTゲートが必要です',
        testResults: [],
        constraintErrors,
      };
    }

    if (outputGates.length === 0) {
      return {
        passed: false,
        message: 'OUTPUTゲートが必要です',
        testResults: [],
        constraintErrors,
      };
    }

    // 3. 各テストケースを実行
    const testResults = this.runTestCases(gates, wires);
    const allTestsPassed = testResults.every(result => result);

    // 4. 結果をまとめる
    const passedCount = testResults.filter(r => r).length;
    const totalCount = testResults.length;

    let message: string;
    if (constraintErrors.length > 0) {
      message = `制約違反: ${constraintErrors[0]}`;
    } else if (allTestsPassed) {
      message = `🎉 すべてのテストに合格！ (${passedCount}/${totalCount})`;
    } else {
      message = `テスト結果: ${passedCount}/${totalCount} 合格`;
    }

    return {
      passed: allTestsPassed && constraintErrors.length === 0,
      message,
      testResults,
      constraintErrors,
    };
  }

  /**
   * 制約条件を検証
   */
  private validateConstraints(gates: Gate[], wires: Wire[]): string[] {
    const errors: string[] = [];
    const constraints = this.puzzle.constraints;

    // ゲート数制限
    if (constraints.maxGates && gates.length > constraints.maxGates) {
      errors.push(
        `ゲート数が上限を超えています (${gates.length}/${constraints.maxGates})`
      );
    }

    // ワイヤー数制限
    if (constraints.maxWires && wires.length > constraints.maxWires) {
      errors.push(
        `ワイヤー数が上限を超えています (${wires.length}/${constraints.maxWires})`
      );
    }

    // 使用可能ゲート制限
    const usedGateTypes = gates.map(g => g.type);
    const disallowedGates = usedGateTypes.filter(
      type => !constraints.allowedGates.includes(type)
    );
    if (disallowedGates.length > 0) {
      errors.push(
        `使用不可のゲート: ${[...new Set(disallowedGates)].join(', ')}`
      );
    }

    // 必須ゲート確認
    if (constraints.requiredGates) {
      const missingGates = constraints.requiredGates.filter(
        required => !usedGateTypes.includes(required)
      );
      if (missingGates.length > 0) {
        errors.push(`必須ゲートが不足: ${missingGates.join(', ')}`);
      }
    }

    return errors;
  }

  /**
   * 全テストケースを実行
   */
  private runTestCases(gates: Gate[], wires: Wire[]): boolean[] {
    return this.puzzle.testCases.map(testCase =>
      this.runSingleTest(gates, wires, testCase)
    );
  }

  /**
   * 単一テストケースを実行
   * ultrathink: 明確で予測可能なテスト実行
   */
  private runSingleTest(
    gates: Gate[],
    wires: Wire[],
    testCase: PuzzleTestCase
  ): boolean {
    try {
      // 1. 入力ゲートを特定
      const inputGates = gates.filter(g => g.type === 'INPUT');
      const outputGates = gates.filter(g => g.type === 'OUTPUT');

      if (inputGates.length !== testCase.inputs.length) {
        console.warn(
          `入力数が一致しません: ${inputGates.length} vs ${testCase.inputs.length}`
        );
        return false;
      }

      if (outputGates.length === 0) {
        return false;
      }

      // 2. 回路状態をコピー（元の状態を保持）
      const testGates = gates.map(gate => ({ ...gate }));

      // 3. 入力値を設定
      testCase.inputs.forEach((inputValue, index) => {
        if (inputGates[index]) {
          const testGate = testGates.find(g => g.id === inputGates[index].id);
          if (testGate) {
            testGate.outputs = [inputValue];
          }
        }
      });

      // 4. 回路をシミュレート
      const simulatedResult = this.simulateCircuit(testGates, wires);

      // 5. 出力を比較（最初のOUTPUTゲートの結果で判定）
      const firstOutputGate = simulatedResult.find(g => g.type === 'OUTPUT');
      const actualOutput = firstOutputGate?.outputs?.[0] ?? false;

      return actualOutput === testCase.expectedOutput;
    } catch (error) {
      console.error('Test execution error:', error);
      return false;
    }
  }

  /**
   * 回路シミュレーション
   * ultrathink: シンプルな順伝播計算
   */
  private simulateCircuit(gates: Gate[], wires: Wire[]): Gate[] {
    const result = gates.map(gate => ({ ...gate }));
    const processed = new Set<string>();

    // 入力ゲート（INPUT, CLOCK）は初期状態を維持
    result
      .filter(g => g.type === 'INPUT' || g.type === 'CLOCK')
      .forEach(g => processed.add(g.id));

    // 最大10回の反復で収束させる
    for (let iteration = 0; iteration < 10; iteration++) {
      let hasChanges = false;

      result.forEach(gate => {
        if (processed.has(gate.id)) return;
        if (
          gate.type === 'INPUT' ||
          gate.type === 'CLOCK' ||
          gate.type === 'OUTPUT'
        )
          return;

        // このゲートの入力がすべて計算済みかチェック
        const inputValues = this.getGateInputs(gate, result, wires);
        if (inputValues === null) return; // まだ入力が確定していない

        // ゲート演算を実行
        const newOutput = this.calculateGateOutput(gate.type, inputValues);
        gate.outputs = [newOutput];
        processed.add(gate.id);
        hasChanges = true;
      });

      // OUTPUTゲートの更新
      result
        .filter(g => g.type === 'OUTPUT')
        .forEach(outputGate => {
          const inputValues = this.getGateInputs(outputGate, result, wires);
          if (inputValues !== null && inputValues.length > 0) {
            outputGate.outputs = [inputValues[0]]; // OUTPUTは最初の入力をそのまま出力
            processed.add(outputGate.id);
            hasChanges = true;
          }
        });

      if (!hasChanges) break;
    }

    return result;
  }

  /**
   * ゲートの入力値を取得
   */
  private getGateInputs(
    gate: Gate,
    gates: Gate[],
    wires: Wire[]
  ): boolean[] | null {
    const inputs: boolean[] = [];

    // このゲートへの入力ワイヤーを検索
    const inputWires = wires.filter(wire => wire.to.gateId === gate.id);

    // 入力ピンの順序でソート
    inputWires.sort((a, b) => a.to.pinIndex - b.to.pinIndex);

    for (const wire of inputWires) {
      const sourceGate = gates.find(g => g.id === wire.from.gateId);
      if (!sourceGate || sourceGate.outputs?.[0] === undefined) {
        return null; // まだ計算されていない入力がある
      }
      inputs.push(sourceGate.outputs?.[0] ?? false);
    }

    return inputs;
  }

  /**
   * ゲート演算を実行
   * ultrathink: クリアで予測可能な論理演算
   */
  private calculateGateOutput(gateType: string, inputs: boolean[]): boolean {
    switch (gateType) {
      case 'AND':
        return inputs.length >= 2 ? inputs[0] && inputs[1] : false;

      case 'OR':
        return inputs.length >= 2 ? inputs[0] || inputs[1] : false;

      case 'NOT':
        return inputs.length >= 1 ? !inputs[0] : false;

      case 'NAND':
        return inputs.length >= 2 ? !(inputs[0] && inputs[1]) : true;

      case 'NOR':
        return inputs.length >= 2 ? !(inputs[0] || inputs[1]) : true;

      case 'XOR':
        return inputs.length >= 2 ? inputs[0] !== inputs[1] : false;

      default:
        console.warn(`Unknown gate type: ${gateType}`);
        return false;
    }
  }
}

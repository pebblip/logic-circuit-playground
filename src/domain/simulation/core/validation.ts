/**
 * 新API用バリデーション機能
 *
 * 特徴:
 * - 包括的な入力検証
 * - 詳細なエラー情報提供
 * - 段階的バリデーション（警告とエラーの分離）
 * - パフォーマンスを考慮した効率的な検証
 */

import type { Gate, Wire } from '../../../types/circuit';
import type { CustomGateDefinition } from '../../../types/gates';
import {
  type Result,
  type ValidationResult,
  type ValidationViolation,
  type ValidationError,
  type Circuit,
  success,
  failure,
  createValidationError,
} from './types';
import { ERROR_MESSAGES, SUGGESTION_MESSAGES } from './errorMessages';

// ===============================
// バリデーション設定
// ===============================

interface ValidationConfig {
  readonly strictMode: boolean;
  readonly checkCircularDependencies: boolean;
  readonly validateCustomGates: boolean;
  readonly maxGateCount: number;
  readonly maxWireCount: number;
  readonly maxPinCount: number;
}

const defaultValidationConfig: ValidationConfig = {
  strictMode: true,
  checkCircularDependencies: true,
  validateCustomGates: true,
  maxGateCount: 10000,
  maxWireCount: 50000,
  maxPinCount: 100,
};

// ===============================
// ヘルパー関数
// ===============================

/**
 * 簡単なviolationオブジェクトをValidationViolation形式に変換
 */
function createViolation(
  field: string,
  value: unknown,
  constraint: string,
  code?: string,
  severity: 'ERROR' | 'WARNING' | 'INFO' = 'ERROR'
): ValidationViolation {
  return {
    severity,
    code: code || `INVALID_${field.toUpperCase()}`,
    message: constraint,
    location: field.includes('gateId')
      ? { gateId: value as string }
      : field.includes('wireId')
        ? { wireId: value as string }
        : {},
    suggestion: field.includes('gate')
      ? SUGGESTION_MESSAGES.VERIFY_GATE_SETTINGS
      : SUGGESTION_MESSAGES.CHECK_CONNECTIONS,
  };
}

// ===============================
// 基本バリデーション関数
// ===============================

/**
 * ゲートIDの妥当性を検証
 */
export function validateGateId(
  gateId: unknown
): Result<string, ValidationError> {
  if (typeof gateId !== 'string') {
    return failure(
      createValidationError(ERROR_MESSAGES.GATE_INVALID_ID, [
        createViolation('gateId', gateId, ERROR_MESSAGES.GATE_INVALID_ID),
      ])
    );
  }

  if (gateId.trim().length === 0) {
    return failure(
      createValidationError(ERROR_MESSAGES.GATE_EMPTY_ID, [
        createViolation('gateId', gateId, ERROR_MESSAGES.GATE_EMPTY_ID),
      ])
    );
  }

  if (gateId.length > 100) {
    return failure(
      createValidationError(ERROR_MESSAGES.GATE_ID_TOO_LONG, [
        createViolation('gateId', gateId, ERROR_MESSAGES.GATE_ID_TOO_LONG),
      ])
    );
  }

  // 特殊文字チェック（英数字、アンダースコア、ハイフンのみ許可）
  const validIdPattern = /^[a-zA-Z0-9_-]+$/;
  if (!validIdPattern.test(gateId)) {
    return failure(
      createValidationError(ERROR_MESSAGES.GATE_ID_INVALID_CHARS, [
        createViolation('gateId', gateId, ERROR_MESSAGES.GATE_ID_INVALID_CHARS),
      ])
    );
  }

  return success(gateId);
}

/**
 * ゲートタイプの妥当性を検証
 */
export function validateGateType(
  gateType: unknown
): Result<string, ValidationError> {
  if (typeof gateType !== 'string') {
    return failure(
      createValidationError(ERROR_MESSAGES.GATE_INVALID_TYPE, [
        createViolation('type', gateType, ERROR_MESSAGES.GATE_INVALID_TYPE),
      ])
    );
  }

  const validGateTypes = [
    'INPUT',
    'OUTPUT',
    'AND',
    'OR',
    'NOT',
    'XOR',
    'NAND',
    'NOR',
    'CLOCK',
    'D-FF',
    'SR-LATCH',
    'MUX',
    'BINARY_COUNTER',
    'CUSTOM',
  ];
  if (!validGateTypes.includes(gateType)) {
    return failure(
      createValidationError(ERROR_MESSAGES.GATE_INVALID_TYPE, [
        createViolation('type', gateType, ERROR_MESSAGES.GATE_INVALID_TYPE),
      ])
    );
  }

  return success(gateType);
}

/**
 * ゲート位置の妥当性を検証
 */
export function validateGatePosition(
  position: unknown
): Result<{ x: number; y: number }, ValidationError> {
  if (!position || typeof position !== 'object' || Array.isArray(position)) {
    return failure(
      createValidationError(ERROR_MESSAGES.GATE_INVALID_POSITION, [
        createViolation('position', position, 'must be object with x and y'),
      ])
    );
  }

  const pos = position as { x: unknown; y: unknown };

  if (typeof pos.x !== 'number' || typeof pos.y !== 'number') {
    return failure(
      createValidationError(ERROR_MESSAGES.GATE_POSITION_NOT_NUMBER, [
        createViolation('position.x', pos.x, 'must be number'),
        createViolation('position.y', pos.y, 'must be number'),
      ])
    );
  }

  if (!Number.isFinite(pos.x) || !Number.isFinite(pos.y)) {
    return failure(
      createValidationError(ERROR_MESSAGES.GATE_POSITION_NOT_FINITE, [
        createViolation('position.x', pos.x, 'must be finite'),
        createViolation('position.y', pos.y, 'must be finite'),
      ])
    );
  }

  return success({ x: pos.x, y: pos.y });
}

/**
 * ゲート入力の妥当性を検証（オーバーロード）
 */
export function validateGateInputs(
  inputs: unknown,
  type: string,
  customDef?: CustomGateDefinition
): Result<void, ValidationError>;
// eslint-disable-next-line no-redeclare
export function validateGateInputs(
  gate: Readonly<Gate>,
  inputs: readonly boolean[]
): Result<void, ValidationError>;

/**
 * ゲート入力の妥当性を検証（実装）
 */
// eslint-disable-next-line no-redeclare
export function validateGateInputs(
  gateOrInputs: unknown,
  typeOrInputs?: string | readonly boolean[],
  customDef?: CustomGateDefinition
): Result<void, ValidationError> {
  // オーバーロードの判定
  let gate: Readonly<Gate>;
  let inputs: readonly boolean[];

  if (typeof typeOrInputs === 'string') {
    // 簡易版の呼び出し (inputs, type, customDef?)
    if (!Array.isArray(gateOrInputs)) {
      return failure(
        createValidationError(ERROR_MESSAGES.GATE_INPUTS_NOT_ARRAY, [
          createViolation('inputs', gateOrInputs, 'must be array'),
        ])
      );
    }

    // 簡易的なゲートオブジェクトを作成
    gate = {
      id: 'temp',
      type: typeOrInputs,
      position: { x: 0, y: 0 },
      inputs: [],
      output: false,
      ...(typeOrInputs === 'CUSTOM' && customDef
        ? { customGateDefinition: customDef }
        : {}),
    } as Gate;
    inputs = gateOrInputs as boolean[];
  } else {
    // 完全版の呼び出し (gate, inputs)
    gate = gateOrInputs as Readonly<Gate>;
    inputs = typeOrInputs as readonly boolean[];
  }
  const violations: ValidationViolation[] = [];

  // 期待する入力数を計算
  let expectedInputCount = 2; // デフォルト
  switch (gate.type) {
    case 'INPUT':
    case 'CLOCK':
      expectedInputCount = 0;
      break;
    case 'OUTPUT':
    case 'NOT':
      expectedInputCount = 1;
      break;
    case 'AND':
    case 'OR':
    case 'XOR':
    case 'NAND':
    case 'NOR':
    case 'D-FF':
    case 'SR-LATCH':
      expectedInputCount = 2;
      break;
    case 'MUX':
      expectedInputCount = 3;
      break;
    case 'BINARY_COUNTER':
      expectedInputCount = 1;
      break;
    case 'CUSTOM':
      if ('customGateDefinition' in gate && gate.customGateDefinition) {
        expectedInputCount = gate.customGateDefinition.inputs.length;
      } else {
        violations.push({
          severity: 'ERROR',
          code: 'MISSING_CUSTOM_GATE_DEFINITION',
          message: 'Custom gate must have definition',
          location: { gateId: gate.id },
          suggestion: 'Ensure the custom gate has a valid definition',
        });
      }
      break;
  }

  // 入力数チェック
  if (inputs.length !== expectedInputCount) {
    const message = ERROR_MESSAGES.INPUT_COUNT_MISMATCH(
      expectedInputCount,
      inputs.length
    );
    violations.push({
      severity: 'ERROR',
      code: 'INVALID_INPUT_COUNT',
      message,
      location: { gateId: gate.id },
      suggestion: ERROR_MESSAGES.INPUT_PROVIDE_CORRECT_COUNT(
        expectedInputCount,
        gate.type
      ),
    });
  }

  // 入力値の型チェック
  inputs.forEach((input, index) => {
    if (typeof input !== 'boolean') {
      violations.push({
        severity: 'ERROR',
        code: 'INVALID_INPUT_TYPE',
        message: ERROR_MESSAGES.INPUT_TYPE_INVALID(index),
        location: { gateId: gate.id, pinIndex: index },
        suggestion: 'Ensure all inputs are boolean values',
      });
    }
  });

  if (violations.length > 0) {
    return failure(
      createValidationError(
        violations[0].message, // Use first violation message as main message
        violations,
        { gateId: gate.id }
      )
    );
  }

  return success(undefined);
}

// ===============================
// ゲートバリデーション
// ===============================

/**
 * 単一ゲートの包括的検証
 */
export function validateGate(gate: unknown): Result<Gate, ValidationError> {
  if (!gate || typeof gate !== 'object') {
    return failure(
      createValidationError('Gate must be an object', [
        createViolation('gate', gate, 'must be object'),
      ])
    );
  }

  const g = gate as {
    id: unknown;
    type: unknown;
    position: unknown;
    inputs: unknown;
    output: unknown;
    metadata?: unknown;
    customGateDefinition?: unknown;
  };
  const violations: ValidationViolation[] = [];

  // ID検証
  const idResult = validateGateId(g.id);
  if (!idResult.success && idResult.error.violations) {
    violations.push(...idResult.error.violations);
  }

  // タイプ検証
  const typeResult = validateGateType(g.type);
  if (!typeResult.success && typeResult.error.violations) {
    violations.push(...typeResult.error.violations);
  }

  // 位置検証
  const positionResult = validateGatePosition(g.position);
  if (!positionResult.success && positionResult.error.violations) {
    violations.push(...positionResult.error.violations);
  }

  // 入力配列検証
  if (!Array.isArray(g.inputs)) {
    violations.push({
      severity: 'ERROR',
      code: 'INVALID_INPUTS_TYPE',
      message: ERROR_MESSAGES.GATE_INPUTS_NOT_ARRAY,
      location: { gateId: String(g.id) },
      suggestion: 'Provide inputs as an array',
    });
  }

  // 出力値検証
  if (typeof g.output !== 'boolean') {
    violations.push({
      severity: 'ERROR',
      code: 'INVALID_OUTPUT_TYPE',
      message: ERROR_MESSAGES.GATE_OUTPUT_NOT_BOOLEAN,
      location: { gateId: String(g.id) },
      suggestion: 'Ensure gate output is a boolean value',
    });
  }

  // カスタムゲート特有の検証
  if (g.type === 'CUSTOM') {
    if (!g.customGateDefinition) {
      violations.push({
        severity: 'ERROR',
        code: 'MISSING_CUSTOM_GATE_DEFINITION',
        message: ERROR_MESSAGES.GATE_MISSING_CUSTOM_DEFINITION,
        location: { gateId: String(g.id) },
        suggestion: 'Provide a valid customGateDefinition for custom gates',
      });
    } else {
      const customValidation = validateCustomGateDefinition(
        g.customGateDefinition
      );
      if (!customValidation.success && customValidation.error.violations) {
        violations.push(...customValidation.error.violations);
      }
    }
  }

  if (violations.length > 0) {
    return failure(
      createValidationError(
        violations[0].message, // Use first violation message as main message
        violations,
        {
          gateId: String(g.id),
        }
      )
    );
  }

  return success(g as Gate);
}

/**
 * カスタムゲート定義の検証
 */
export function validateCustomGateDefinition(
  definition: unknown
): Result<CustomGateDefinition, ValidationError> {
  if (!definition || typeof definition !== 'object') {
    return failure(
      createValidationError('Custom gate definition must be an object', [
        createViolation('customGateDefinition', definition, 'must be object'),
      ])
    );
  }

  const def = definition as {
    id: unknown;
    name: unknown;
    inputs: unknown;
    outputs: unknown;
    internalCircuit: unknown;
    truthTable?: unknown;
  };
  const violations: ValidationViolation[] = [];

  // ID検証
  if (typeof def.id !== 'string' || def.id.trim().length === 0) {
    violations.push({
      severity: 'ERROR',
      code: 'INVALID_DEFINITION_ID',
      message: 'Custom gate definition ID must be non-empty string',
      location: {},
      suggestion: 'Provide a valid ID for the custom gate definition',
    });
  }

  // 名前検証
  if (typeof def.name !== 'string' || def.name.trim().length === 0) {
    violations.push({
      severity: 'ERROR',
      code: 'INVALID_DEFINITION_NAME',
      message: 'Custom gate definition name must be non-empty string',
      location: {},
      suggestion: 'Provide a valid name for the custom gate definition',
    });
  }

  // 入力定義検証
  if (!Array.isArray(def.inputs)) {
    violations.push({
      severity: 'ERROR',
      code: 'INVALID_DEFINITION_INPUTS',
      message: 'Custom gate definition inputs must be array',
      location: {},
      suggestion: 'Provide inputs as an array of input definitions',
    });
  } else if (def.inputs.length === 0) {
    violations.push({
      severity: 'ERROR',
      code: 'NO_INPUTS_DEFINED',
      message: 'Custom gate definition must have at least one input',
      location: {},
      suggestion: 'Add at least one input to the custom gate definition',
    });
  }

  // 出力定義検証
  if (!Array.isArray(def.outputs)) {
    violations.push({
      severity: 'ERROR',
      code: 'INVALID_DEFINITION_OUTPUTS',
      message: 'Custom gate definition outputs must be array',
      location: {},
      suggestion: 'Provide outputs as an array of output definitions',
    });
  } else if (def.outputs.length === 0) {
    violations.push({
      severity: 'ERROR',
      code: 'NO_OUTPUTS_DEFINED',
      message: 'Custom gate definition must have at least one output',
      location: {},
      suggestion: 'Add at least one output to the custom gate definition',
    });
  }

  // 真理値表または内部回路のどちらかが必要
  if (!def.truthTable && !def.internalCircuit) {
    violations.push({
      severity: 'ERROR',
      code: 'NO_IMPLEMENTATION_DEFINED',
      message: ERROR_MESSAGES.CUSTOM_GATE_NO_IMPLEMENTATION,
      location: {},
      suggestion:
        'Provide either a truth table or internal circuit for the custom gate',
    });
  }

  if (violations.length > 0) {
    return failure(
      createValidationError(
        violations[0].message, // Use first violation message as main message
        violations
      )
    );
  }

  return success(def as CustomGateDefinition);
}

// ===============================
// ワイヤーバリデーション
// ===============================

/**
 * ワイヤーの妥当性を検証
 */
export function validateWire(wire: unknown): Result<Wire, ValidationError> {
  if (!wire || typeof wire !== 'object') {
    return failure(
      createValidationError('Wire must be an object', [
        createViolation('wire', wire, 'must be object'),
      ])
    );
  }

  const w = wire as {
    id: unknown;
    from: unknown;
    to: unknown;
    isActive: unknown;
  };
  const violations: ValidationViolation[] = [];

  // ID検証（ワイヤー専用）
  if (typeof w.id !== 'string') {
    violations.push({
      severity: 'ERROR',
      code: 'INVALID_WIRE_ID_TYPE',
      message: 'Wire ID must be a non-empty string',
      location: { wireId: w.id as string },
    });
  } else if (w.id.trim().length === 0) {
    violations.push({
      severity: 'ERROR',
      code: 'EMPTY_WIRE_ID',
      message: 'Wire ID must be a non-empty string',
      location: { wireId: String(w.id) },
    });
  }

  // from接続点検証
  if (!w.from || typeof w.from !== 'object') {
    violations.push({
      severity: 'ERROR',
      code: 'INVALID_WIRE_FROM',
      message: 'Wire from must be object with gateId and pinIndex',
      location: { wireId: String(w.id) },
      suggestion:
        'Provide a valid from connection point with gateId and pinIndex',
    });
  } else {
    const from = w.from as { gateId?: unknown; pinIndex?: unknown };
    if (typeof from.gateId !== 'string' || from.gateId.trim().length === 0) {
      violations.push({
        severity: 'ERROR',
        code: 'INVALID_FROM_GATE_ID',
        message: 'Wire from.gateId must be a non-empty string',
        location: { wireId: String(w.id) },
        suggestion: 'Provide a valid gate ID for the wire source',
      });
    }
    if (typeof from.pinIndex !== 'number') {
      violations.push({
        severity: 'ERROR',
        code: 'INVALID_FROM_PIN_INDEX',
        message: 'Wire from.pinIndex must be number',
        location: {
          wireId: String(w.id),
          pinIndex:
            typeof from.pinIndex === 'number'
              ? (from.pinIndex as number)
              : undefined,
        },
        suggestion: 'Provide a valid numeric pin index for the wire source',
      });
    }
  }

  // to接続点検証
  if (!w.to || typeof w.to !== 'object') {
    violations.push({
      severity: 'ERROR',
      code: 'INVALID_WIRE_TO',
      message: 'Wire to must be object with gateId and pinIndex',
      location: { wireId: String(w.id) },
      suggestion:
        'Provide a valid to connection point with gateId and pinIndex',
    });
  } else {
    if (
      typeof (w.to as { gateId: unknown }).gateId !== 'string' ||
      (w.to as { gateId: string }).gateId.trim().length === 0
    ) {
      violations.push({
        severity: 'ERROR',
        code: 'INVALID_TO_GATE_ID',
        message: 'Wire to.gateId must be non-empty string',
        location: { wireId: String(w.id) },
        suggestion: 'Provide a valid gate ID for the wire target',
      });
    }
    if (
      typeof (w.to as { pinIndex: unknown }).pinIndex !== 'number' ||
      (w.to as { pinIndex: number }).pinIndex < 0
    ) {
      violations.push({
        severity: 'ERROR',
        code: 'INVALID_TO_PIN_INDEX',
        message: 'Wire to.pinIndex must be non-negative number',
        location: {
          wireId: String(w.id),
          pinIndex:
            typeof (w.to as { pinIndex: unknown }).pinIndex === 'number'
              ? (w.to as { pinIndex: number }).pinIndex
              : undefined,
        },
        suggestion:
          'Provide a valid non-negative pin index for the wire target',
      });
    }
  }

  // isActive検証
  if (typeof w.isActive !== 'boolean') {
    violations.push({
      severity: 'ERROR',
      code: 'INVALID_WIRE_ACTIVE_STATE',
      message: 'Wire isActive must be boolean',
      location: { wireId: String(w.id) },
      suggestion: 'Ensure wire isActive is a boolean value',
    });
  }

  if (violations.length > 0) {
    return failure(
      createValidationError(
        `Invalid wire: ${String(w.id) || 'unknown'}`,
        violations,
        {
          wireId: String(w.id),
        }
      )
    );
  }

  return success(w as Wire);
}

// ===============================
// 回路全体のバリデーション
// ===============================

/**
 * 回路全体の包括的検証
 */
export function validateCircuit(
  circuit: Readonly<Circuit>,
  config: Partial<ValidationConfig> = {}
): Result<ValidationResult, ValidationError> {
  const validationConfig = { ...defaultValidationConfig, ...config };
  const violations: ValidationViolation[] = [];
  const suggestions: string[] = [];
  const startTime = Date.now();

  // 規模チェック
  if (circuit.gates.length > validationConfig.maxGateCount) {
    violations.push({
      severity: 'ERROR',
      code: 'CIRCUIT_TOO_LARGE',
      message: ERROR_MESSAGES.CIRCUIT_TOO_LARGE(
        circuit.gates.length,
        validationConfig.maxGateCount
      ),
      location: {},
    });
  }

  if (circuit.wires.length > validationConfig.maxWireCount) {
    violations.push({
      severity: 'ERROR',
      code: 'CIRCUIT_TOO_COMPLEX',
      message: ERROR_MESSAGES.CIRCUIT_TOO_COMPLEX(
        circuit.wires.length,
        validationConfig.maxWireCount
      ),
      location: {},
    });
  }

  // ゲート個別検証
  const gateIds = new Set<string>();
  circuit.gates.forEach((gate, _index) => {
    const gateValidation = validateGate(gate);
    if (!gateValidation.success) {
      gateValidation.error.violations?.forEach(violation => {
        violations.push({
          severity: violation.severity || 'ERROR',
          code: violation.code,
          message: violation.message,
          location: violation.location,
        });
      });
    }

    // 重複ID検証
    if (gateIds.has(gate.id)) {
      violations.push({
        severity: 'ERROR',
        code: 'DUPLICATE_GATE_ID',
        message: ERROR_MESSAGES.GATE_DUPLICATE_ID,
        location: { gateId: gate.id },
      });
    } else {
      gateIds.add(gate.id);
    }
  });

  // ワイヤー個別検証
  const wireIds = new Set<string>();
  circuit.wires.forEach((wire, _index) => {
    const wireValidation = validateWire(wire);
    if (!wireValidation.success) {
      wireValidation.error.violations?.forEach(violation => {
        violations.push({
          severity: violation.severity || 'ERROR',
          code: violation.code,
          message: violation.message,
          location: violation.location,
        });
      });
    }

    // 重複ID検証
    if (wireIds.has(wire.id)) {
      violations.push({
        severity: 'ERROR',
        code: 'DUPLICATE_WIRE_ID',
        message: `Duplicate wire ID: ${wire.id}`,
        location: { wireId: wire.id },
      });
    } else {
      wireIds.add(wire.id);
    }

    // 接続先ゲート存在検証
    if (!gateIds.has(wire.from.gateId)) {
      violations.push({
        severity: 'ERROR',
        code: 'MISSING_SOURCE_GATE',
        message: ERROR_MESSAGES.WIRE_FROM_GATE_MISSING,
        location: { wireId: wire.id, gateId: wire.from.gateId },
      });
    }

    if (!gateIds.has(wire.to.gateId)) {
      violations.push({
        severity: 'ERROR',
        code: 'MISSING_TARGET_GATE',
        message: ERROR_MESSAGES.WIRE_TO_GATE_MISSING,
        location: { wireId: wire.id, gateId: wire.to.gateId },
      });
    }
  });

  // 回路構造的検証
  if (validationConfig.checkCircularDependencies) {
    const circularDeps = findCircularDependencies(circuit);
    circularDeps.forEach(cycle => {
      violations.push({
        severity: 'ERROR',
        code: 'CIRCULAR_DEPENDENCY',
        message: ERROR_MESSAGES.CIRCUIT_CIRCULAR_DEPENDENCY(cycle),
        location: {},
      });
    });
  }

  // 出力ピンインデックスの検証
  circuit.wires.forEach((wire, _index) => {
    const sourceGate = circuit.gates.find(g => g.id === wire.from.gateId);
    if (sourceGate) {
      // カスタムゲートの場合、複数出力をチェック
      if (
        sourceGate.type === 'CUSTOM' &&
        'customGateDefinition' in sourceGate &&
        sourceGate.customGateDefinition
      ) {
        const outputCount = sourceGate.customGateDefinition.outputs.length;
        const outputIndex = -wire.from.pinIndex - 1;
        if (wire.from.pinIndex < 0 && outputIndex >= outputCount) {
          violations.push({
            severity: 'ERROR',
            code: 'INVALID_PIN_INDEX',
            message: `Wire ${wire.id}: Invalid pin index ${wire.from.pinIndex} for custom gate ${sourceGate.id} (has ${outputCount} outputs)`,
            location: { wireId: wire.id, gateId: sourceGate.id },
          });
        }
      } else {
        // 標準ゲートは単一出力のみ（pinIndex: -1）
        if (wire.from.pinIndex < -1) {
          violations.push({
            severity: 'ERROR',
            code: 'INVALID_PIN_INDEX',
            message: `Wire ${wire.id}: Invalid pin index ${wire.from.pinIndex} for gate ${sourceGate.id} (standard gates only support pinIndex -1)`,
            location: { wireId: wire.id, gateId: sourceGate.id },
          });
        }
      }
    }
  });

  // 提案生成
  const inputGates = circuit.gates.filter(g => g.type === 'INPUT');
  const outputGates = circuit.gates.filter(g => g.type === 'OUTPUT');

  if (inputGates.length === 0) {
    suggestions.push(SUGGESTION_MESSAGES.ADD_INPUT_GATES);
  }

  if (outputGates.length === 0) {
    suggestions.push(SUGGESTION_MESSAGES.ADD_OUTPUT_GATES);
  }

  if (
    circuit.gates.length > 100 &&
    circuit.wires.length > circuit.gates.length * 3
  ) {
    suggestions.push(SUGGESTION_MESSAGES.USE_CUSTOM_GATES);
  }

  const endTime = Date.now();
  const errors = violations.filter(v => v.severity === 'ERROR');
  const isValid = errors.length === 0;

  const result: ValidationResult = {
    isValid,
    violations,
    suggestions,
    metadata: {
      validatedAt: Date.now(),
      validationTimeMs: endTime - startTime,
      rulesApplied: [
        'BASIC_STRUCTURE',
        'ID_UNIQUENESS',
        'REFERENCE_INTEGRITY',
        'CIRCULAR_DEPENDENCY',
      ],
    },
  };

  // Return failure if there are errors
  if (!isValid) {
    return failure(createValidationError(errors[0].message, violations));
  }

  return success(result);
}

/**
 * 循環依存の検出
 */
function findCircularDependencies(circuit: Readonly<Circuit>): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  // 依存関係グラフを構築
  const dependencies = new Map<string, string[]>();
  circuit.gates.forEach(gate => {
    dependencies.set(gate.id, []);
  });

  circuit.wires.forEach(wire => {
    const deps = dependencies.get(wire.to.gateId) || [];
    deps.push(wire.from.gateId);
    dependencies.set(wire.to.gateId, deps);
  });

  function visit(gateId: string, path: string[]): void {
    if (visiting.has(gateId)) {
      // 循環を発見
      const cycleStart = path.indexOf(gateId);
      if (cycleStart >= 0) {
        cycles.push([...path.slice(cycleStart), gateId]);
      }
      return;
    }

    if (visited.has(gateId)) return;

    visiting.add(gateId);
    const newPath = [...path, gateId];

    const deps = dependencies.get(gateId) || [];
    deps.forEach(depId => {
      visit(depId, newPath);
    });

    visiting.delete(gateId);
    visited.add(gateId);
  }

  circuit.gates.forEach(gate => {
    if (!visited.has(gate.id)) {
      visit(gate.id, []);
    }
  });

  return cycles;
}

// ===============================
// 高速バリデーション（パフォーマンス重視）
// ===============================

/**
 * 軽量バリデーション（基本チェックのみ）
 */
export function validateCircuitLight(
  circuit: Readonly<Circuit>
): Result<boolean, ValidationError> {
  // 最低限のチェックのみ
  if (!circuit.gates || !Array.isArray(circuit.gates)) {
    return failure(
      createValidationError('Invalid circuit: gates must be array')
    );
  }

  if (!circuit.wires || !Array.isArray(circuit.wires)) {
    return failure(
      createValidationError('Invalid circuit: wires must be array')
    );
  }

  // 基本的な構造チェック
  for (const gate of circuit.gates) {
    if (!gate.id || typeof gate.id !== 'string') {
      return failure(createValidationError(`Invalid gate ID: ${gate.id}`));
    }
    if (!gate.type || typeof gate.type !== 'string') {
      return failure(createValidationError(`Invalid gate type: ${gate.type}`));
    }
  }

  for (const wire of circuit.wires) {
    if (!wire.id || typeof wire.id !== 'string') {
      return failure(createValidationError(`Invalid wire ID: ${wire.id}`));
    }
    if (!wire.from?.gateId || !wire.to?.gateId) {
      return failure(
        createValidationError(`Invalid wire connection: ${wire.id}`)
      );
    }
  }

  return success(true);
}

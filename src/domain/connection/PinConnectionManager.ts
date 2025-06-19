/**
 * ピン接続管理の統一インターフェース
 *
 * CLAUDE.md準拠: 品質優先・予防的思考
 * - 分散したピン接続ロジックを統一
 * - 型安全性の徹底
 * - 自動フォールバック機能付き
 * - 継続的検証による信頼性確保
 */

import type { Gate, Wire, Position } from '@/types/circuit';
import { handleError } from '@/infrastructure/errorHandler';
import {
  PIN_CLICK_AREA,
  PIN_OFFSETS,
  CUSTOM_GATE_CONFIG,
  CONNECTION_VALIDATION,
  CONNECTION_ERRORS,
  getPinConfig,
  getPinOffsetY,
} from './pinConnectionConfig';

// 型定義
export interface PinPosition {
  x: number;
  y: number;
  gateId: string;
  pinIndex: number;
  isOutput: boolean;
}

export interface PinReference {
  gateId: string;
  pinIndex: number;
  isOutput: boolean;
}

export interface ConnectionResult {
  success: boolean;
  wire?: Wire;
  error?: string;
  errorCode?: keyof typeof CONNECTION_ERRORS;
}

export interface FindPinOptions {
  maxDistance?: number;
  excludeGateId?: string;
  pinType?: 'input' | 'output' | 'both';
}

/**
 * ピン接続管理の統一クラス
 * 全てのピン関連操作を一元化
 */
export class PinConnectionManager {
  private gates: Map<string, Gate> = new Map();
  private wires: Wire[] = [];

  // 初期化とデータ管理
  updateGates(gates: Gate[]): void {
    this.gates.clear();
    gates.forEach(gate => this.gates.set(gate.id, gate));
  }

  updateWires(wires: Wire[]): void {
    this.wires = [...wires];
  }

  /**
   * ピン位置の正確な計算
   * 既存のpinPositionCalculator.tsの機能を統合・改善
   */
  calculatePinPosition(
    gate: Gate,
    pinIndex: number,
    isOutput: boolean
  ): PinPosition {
    try {
      const { x, y } = gate.position;
      const position = this.calculatePinCoordinates(gate, pinIndex, isOutput);

      return {
        x: x + position.x,
        y: y + position.y,
        gateId: gate.id,
        pinIndex,
        isOutput,
      };
    } catch (error) {
      handleError(
        error instanceof Error ? error : new Error(String(error)),
        'PinConnectionManager',
        {
          userAction: 'ピン位置の計算',
          severity: 'medium',
          showToUser: false,
        }
      );

      // フォールバック: ゲート中心位置を返す
      return {
        x: gate.position.x,
        y: gate.position.y,
        gateId: gate.id,
        pinIndex,
        isOutput,
      };
    }
  }

  /**
   * ピン座標の相対位置計算（ゲート中心からのオフセット）
   */
  private calculatePinCoordinates(
    gate: Gate,
    pinIndex: number,
    isOutput: boolean
  ): Position {
    // カスタムゲートの特別処理
    if (gate.type === 'CUSTOM' && gate.customGateDefinition) {
      return this.calculateCustomGatePinPosition(gate, pinIndex, isOutput);
    }

    // 通常ゲートの処理
    const config = getPinConfig(gate.type);

    if (isOutput && config.output) {
      const offsetX = config.output.x;
      const offsetY = getPinOffsetY(config.output.y, pinIndex);
      return { x: offsetX, y: offsetY };
    } else if (!isOutput && config.input) {
      const offsetX = config.input.x;
      const offsetY = getPinOffsetY(config.input.y, pinIndex);
      return { x: offsetX, y: offsetY };
    }

    // フォールバック: 基本的な位置
    console.warn(
      `Pin position fallback for gate ${gate.type}, pin ${pinIndex}, output: ${isOutput}`
    );

    return {
      x: isOutput
        ? PIN_OFFSETS.BASIC_GATES.output.x
        : PIN_OFFSETS.BASIC_GATES.input.x,
      y: 0,
    };
  }

  /**
   * カスタムゲートのピン位置計算
   */
  private calculateCustomGatePinPosition(
    gate: Gate,
    pinIndex: number,
    isOutput: boolean
  ): Position {
    const definition = gate.customGateDefinition!;
    const width = definition.width || CUSTOM_GATE_CONFIG.defaultSize.width;
    const height =
      definition.height ||
      Math.max(
        CUSTOM_GATE_CONFIG.defaultSize.height,
        Math.max(definition.inputs.length, definition.outputs.length) * 30 + 20
      );

    const halfWidth = width / 2;
    const margin = CUSTOM_GATE_CONFIG.margins.horizontal;

    if (isOutput) {
      const outputCount = definition.outputs.length;
      const pinY = this.calculateCustomPinY(outputCount, pinIndex, height);
      return { x: halfWidth + margin, y: pinY };
    } else {
      const inputCount = definition.inputs.length;
      const pinY = this.calculateCustomPinY(inputCount, pinIndex, height);
      return { x: -halfWidth - margin, y: pinY };
    }
  }

  /**
   * カスタムゲートのY座標計算
   */
  private calculateCustomPinY(
    pinCount: number,
    pinIndex: number,
    gateHeight: number
  ): number {
    if (pinCount === 1) return 0;

    const availableHeight =
      gateHeight - 2 * CUSTOM_GATE_CONFIG.margins.vertical;
    const spacing = Math.min(
      CUSTOM_GATE_CONFIG.pinSpacing.default,
      availableHeight / (pinCount - 1)
    );

    return -((pinCount - 1) * spacing) / 2 + pinIndex * spacing;
  }

  /**
   * 指定位置に最も近いピンを検索
   */
  findNearestPin(
    position: Position,
    options: FindPinOptions = {}
  ): PinPosition | null {
    const {
      maxDistance = CONNECTION_VALIDATION.maxConnectionDistance,
      excludeGateId,
      pinType = 'both',
    } = options;

    let nearestPin: PinPosition | null = null;
    let minDistance = maxDistance;

    for (const gate of this.gates.values()) {
      if (excludeGateId && gate.id === excludeGateId) continue;

      // 入力ピンの検索
      if (pinType === 'input' || pinType === 'both') {
        const inputCount = this.getGateInputCount(gate);
        for (let i = 0; i < inputCount; i++) {
          const pinPos = this.calculatePinPosition(gate, i, false);
          const distance = this.calculateDistance(position, pinPos);

          if (distance < minDistance) {
            minDistance = distance;
            nearestPin = pinPos;
          }
        }
      }

      // 出力ピンの検索
      if (pinType === 'output' || pinType === 'both') {
        const outputCount = this.getGateOutputCount(gate);
        for (let i = 0; i < outputCount; i++) {
          const pinPos = this.calculatePinPosition(gate, i, true);
          const distance = this.calculateDistance(position, pinPos);

          if (distance < minDistance) {
            minDistance = distance;
            nearestPin = pinPos;
          }
        }
      }
    }

    return nearestPin;
  }

  /**
   * 接続可能性の検証
   */
  validateConnection(from: PinReference, to: PinReference): ConnectionResult {
    try {
      // 基本的な検証
      const basicValidation = this.performBasicValidation(from, to);
      if (!basicValidation.success) {
        return basicValidation;
      }

      // 距離検証
      const distanceValidation = this.performDistanceValidation(from, to);
      if (!distanceValidation.success) {
        return distanceValidation;
      }

      // 重複接続検証
      const duplicateValidation = this.performDuplicateValidation(from, to);
      if (!duplicateValidation.success) {
        return duplicateValidation;
      }

      return { success: true };
    } catch (error) {
      handleError(
        error instanceof Error ? error : new Error(String(error)),
        'PinConnectionManager',
        {
          userAction: '接続検証',
          severity: 'medium',
          showToUser: true,
        }
      );

      return {
        success: false,
        error: CONNECTION_ERRORS.INVALID_PIN_INDEX,
        errorCode: 'INVALID_PIN_INDEX',
      };
    }
  }

  /**
   * 基本的な接続検証
   */
  private performBasicValidation(
    from: PinReference,
    to: PinReference
  ): ConnectionResult {
    // 同一タイプチェック
    if (from.isOutput === to.isOutput) {
      return {
        success: false,
        error: CONNECTION_ERRORS.SAME_TYPE,
        errorCode: 'SAME_TYPE',
      };
    }

    // 自己接続チェック
    if (from.gateId === to.gateId) {
      return {
        success: false,
        error: CONNECTION_ERRORS.SELF_CONNECTION,
        errorCode: 'SELF_CONNECTION',
      };
    }

    // ゲート存在チェック
    if (!this.gates.has(from.gateId) || !this.gates.has(to.gateId)) {
      return {
        success: false,
        error: CONNECTION_ERRORS.GATE_NOT_FOUND,
        errorCode: 'GATE_NOT_FOUND',
      };
    }

    return { success: true };
  }

  /**
   * 距離検証
   */
  private performDistanceValidation(
    from: PinReference,
    to: PinReference
  ): ConnectionResult {
    const fromGate = this.gates.get(from.gateId)!;
    const toGate = this.gates.get(to.gateId)!;

    const fromPos = this.calculatePinPosition(
      fromGate,
      from.pinIndex,
      from.isOutput
    );
    const toPos = this.calculatePinPosition(toGate, to.pinIndex, to.isOutput);

    const distance = this.calculateDistance(fromPos, toPos);

    if (distance > CONNECTION_VALIDATION.maxConnectionDistance) {
      return {
        success: false,
        error: CONNECTION_ERRORS.DISTANCE_TOO_FAR,
        errorCode: 'DISTANCE_TOO_FAR',
      };
    }

    return { success: true };
  }

  /**
   * 重複接続検証
   */
  private performDuplicateValidation(
    from: PinReference,
    to: PinReference
  ): ConnectionResult {
    // 入力ピンへの複数接続チェック
    const inputPin = from.isOutput ? to : from;
    const existingConnection = this.wires.find(
      wire =>
        wire.to.gateId === inputPin.gateId &&
        wire.to.pinIndex === inputPin.pinIndex
    );

    if (existingConnection) {
      return {
        success: false,
        error: CONNECTION_ERRORS.MULTIPLE_INPUT,
        errorCode: 'MULTIPLE_INPUT',
      };
    }

    return { success: true };
  }

  /**
   * ワイヤー作成
   */
  createWire(from: PinReference, to: PinReference): ConnectionResult {
    const validation = this.validateConnection(from, to);
    if (!validation.success) {
      return validation;
    }

    try {
      // 入力・出力の正規化（入力を常にto側に）
      const normalizedFrom = from.isOutput ? from : to;
      const normalizedTo = from.isOutput ? to : from;

      const wire: Wire = {
        id: `wire-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        from: {
          gateId: normalizedFrom.gateId,
          pinIndex: normalizedFrom.pinIndex,
        },
        to: {
          gateId: normalizedTo.gateId,
          pinIndex: normalizedTo.pinIndex,
        },
        isActive: false, // 初期状態
      };

      return { success: true, wire };
    } catch (error) {
      handleError(
        error instanceof Error ? error : new Error(String(error)),
        'PinConnectionManager',
        {
          userAction: 'ワイヤー作成',
          severity: 'high',
          showToUser: true,
        }
      );

      return {
        success: false,
        error: 'ワイヤーの作成に失敗しました',
      };
    }
  }

  /**
   * ピンがクリック範囲内かどうかの判定
   */
  isWithinClickArea(clickPos: Position, pinPos: PinPosition): boolean {
    const dx = Math.abs(clickPos.x - pinPos.x);
    const dy = Math.abs(clickPos.y - pinPos.y);

    return dx <= PIN_CLICK_AREA.rx && dy <= PIN_CLICK_AREA.ry;
  }

  /**
   * ゲートの入力ピン数を取得（公開メソッド）
   */
  getInputPinCount(gate: Gate): number {
    return this.getGateInputCount(gate);
  }

  /**
   * ゲートの出力ピン数を取得（公開メソッド）
   */
  getOutputPinCount(gate: Gate): number {
    return this.getGateOutputCount(gate);
  }

  // ヘルパーメソッド
  private calculateDistance(pos1: Position, pos2: Position): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private getGateInputCount(gate: Gate): number {
    if (gate.type === 'CUSTOM' && gate.customGateDefinition) {
      return gate.customGateDefinition.inputs.length;
    }

    switch (gate.type) {
      case 'INPUT':
      case 'CLOCK':
        return 0;
      case 'OUTPUT':
      case 'NOT':
        return 1;
      case 'AND':
      case 'OR':
      case 'XOR':
      case 'NAND':
      case 'NOR':
      case 'SR-LATCH':
      case 'D-FF':
        return 2;
      case 'MUX':
        return 3;
      case 'BINARY_COUNTER':
        return 1; // CLK入力のみ
      default:
        return 2; // デフォルト
    }
  }

  private getGateOutputCount(gate: Gate): number {
    if (gate.type === 'CUSTOM' && gate.customGateDefinition) {
      return gate.customGateDefinition.outputs.length;
    }

    switch (gate.type) {
      case 'INPUT':
      case 'CLOCK':
      case 'AND':
      case 'OR':
      case 'XOR':
      case 'NAND':
      case 'NOR':
      case 'NOT':
      case 'MUX':
        return 1;
      case 'OUTPUT':
        return 0;
      case 'D-FF':
      case 'SR-LATCH':
        return 2; // Q, Q̄
      case 'BINARY_COUNTER':
        return 3; // Q0, Q1, Q2
      default:
        return 1; // デフォルト
    }
  }
}

// シングルトンインスタンス（オプション）
let globalManager: PinConnectionManager | null = null;

export function getGlobalPinConnectionManager(): PinConnectionManager {
  if (!globalManager) {
    globalManager = new PinConnectionManager();
  }
  return globalManager;
}

export function setGlobalPinConnectionManager(
  manager: PinConnectionManager
): void {
  globalManager = manager;
}

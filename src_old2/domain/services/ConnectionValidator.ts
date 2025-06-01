import { BaseGate } from '../../entities/gates/BaseGate';
import { Connection } from '../stores/circuitStore';

/**
 * 接続の妥当性チェックサービス
 * - 接続ルールの検証
 * - 循環参照の検出
 * - 接続可能性の判定
 */
export class ConnectionValidator {
  private static instance: ConnectionValidator;

  private constructor() {}

  static getInstance(): ConnectionValidator {
    if (!ConnectionValidator.instance) {
      ConnectionValidator.instance = new ConnectionValidator();
    }
    return ConnectionValidator.instance;
  }

  /**
   * 新しい接続が有効かチェック
   */
  validateConnection(
    fromGateId: string,
    fromPinIndex: number,
    toGateId: string,
    toPinIndex: number,
    gates: BaseGate[],
    existingConnections: Connection[]
  ): {
    isValid: boolean;
    reason?: string;
  } {
    // 1. 基本的なチェック
    if (fromGateId === toGateId) {
      return { isValid: false, reason: '同じゲート同士は接続できません' };
    }

    // 2. ゲートの存在チェック
    const fromGate = gates.find(g => g.id === fromGateId);
    const toGate = gates.find(g => g.id === toGateId);
    
    if (!fromGate || !toGate) {
      return { isValid: false, reason: 'ゲートが見つかりません' };
    }

    // 3. ピンのインデックスチェック（immerプロキシ対応）
    const fromOutputPins = (fromGate as any)._outputs || fromGate.outputPins || [];
    const toInputPins = (toGate as any)._inputs || toGate.inputPins || [];
    
    if (fromPinIndex < 0 || fromPinIndex >= fromOutputPins.length) {
      return { isValid: false, reason: '出力ピンのインデックスが無効です' };
    }
    
    if (toPinIndex < 0 || toPinIndex >= toInputPins.length) {
      return { isValid: false, reason: '入力ピンのインデックスが無効です' };
    }

    // 4. 既存の接続チェック（入力ピンは一つの出力にのみ接続可能）
    const existingInputConnection = existingConnections.find(
      conn => conn.toGateId === toGateId && conn.toPinIndex === toPinIndex
    );
    
    if (existingInputConnection) {
      return { isValid: false, reason: 'この入力ピンは既に接続されています' };
    }

    // 5. 重複接続チェック
    const duplicateConnection = existingConnections.find(
      conn => conn.fromGateId === fromGateId && 
               conn.fromPinIndex === fromPinIndex &&
               conn.toGateId === toGateId && 
               conn.toPinIndex === toPinIndex
    );
    
    if (duplicateConnection) {
      return { isValid: false, reason: 'この接続は既に存在します' };
    }

    // 6. 循環参照チェック
    if (this.wouldCreateCycle(fromGateId, toGateId, existingConnections)) {
      return { isValid: false, reason: '循環参照が発生します' };
    }

    return { isValid: true };
  }

  /**
   * 循環参照の検出
   */
  private wouldCreateCycle(
    fromGateId: string, 
    toGateId: string, 
    connections: Connection[]
  ): boolean {
    // DFS（深さ優先探索）で循環を検出
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (currentGateId: string): boolean => {
      if (recursionStack.has(currentGateId)) {
        return true; // 循環発見
      }
      
      if (visited.has(currentGateId)) {
        return false; // 既に探索済み
      }

      visited.add(currentGateId);
      recursionStack.add(currentGateId);

      // 現在のゲートから出力されている接続を探す
      const outgoingConnections = connections.filter(conn => conn.fromGateId === currentGateId);
      
      // 新しい接続も考慮
      if (currentGateId === fromGateId) {
        outgoingConnections.push({
          id: 'temp',
          fromGateId,
          fromPinIndex: 0,
          toGateId,
          toPinIndex: 0
        });
      }

      for (const conn of outgoingConnections) {
        if (hasCycle(conn.toGateId)) {
          return true;
        }
      }

      recursionStack.delete(currentGateId);
      return false;
    };

    return hasCycle(fromGateId);
  }

  /**
   * 接続可能なピンを取得
   */
  getConnectablePins(
    drawingFromGateId: string,
    drawingFromPinIndex: number,
    targetGate: BaseGate,
    existingConnections: Connection[]
  ): number[] {
    const connectablePins: number[] = [];

    // immerプロキシ対応
    const inputPins = (targetGate as any)._inputs || targetGate.inputPins || [];
    
    // 入力ピンのみ接続可能
    for (let i = 0; i < inputPins.length; i++) {
      const validation = this.validateConnection(
        drawingFromGateId,
        drawingFromPinIndex,
        targetGate.id,
        i,
        [targetGate], // 最小限のチェック用
        existingConnections
      );

      if (validation.isValid) {
        connectablePins.push(i);
      }
    }

    return connectablePins;
  }

  /**
   * 接続の品質スコア計算
   * より良い接続を推奨するため
   */
  calculateConnectionScore(
    fromGate: BaseGate,
    fromPinIndex: number,
    toGate: BaseGate,
    toPinIndex: number
  ): number {
    let score = 100;

    // 距離による減点
    const distance = Math.sqrt(
      Math.pow(toGate.position.x - fromGate.position.x, 2) +
      Math.pow(toGate.position.y - fromGate.position.y, 2)
    );
    score -= distance / 10;

    // 水平方向の接続を優遇
    const horizontalAlignment = Math.abs(toGate.position.y - fromGate.position.y);
    score -= horizontalAlignment / 5;

    // 左から右への接続を優遇
    if (toGate.position.x > fromGate.position.x) {
      score += 20;
    }

    return Math.max(0, score);
  }

  /**
   * 最適な接続ターゲットを推奨
   */
  suggestBestConnection(
    fromGateId: string,
    fromPinIndex: number,
    candidateGates: BaseGate[],
    existingConnections: Connection[]
  ): {
    gateId: string;
    pinIndex: number;
    score: number;
  } | null {
    let bestConnection: { gateId: string; pinIndex: number; score: number } | null = null;

    const fromGate = candidateGates.find(g => g.id === fromGateId);
    if (!fromGate) return null;

    for (const targetGate of candidateGates) {
      if (targetGate.id === fromGateId) continue;

      const connectablePins = this.getConnectablePins(
        fromGateId,
        fromPinIndex,
        targetGate,
        existingConnections
      );

      for (const pinIndex of connectablePins) {
        const score = this.calculateConnectionScore(
          fromGate,
          fromPinIndex,
          targetGate,
          pinIndex
        );

        if (!bestConnection || score > bestConnection.score) {
          bestConnection = {
            gateId: targetGate.id,
            pinIndex,
            score
          };
        }
      }
    }

    return bestConnection;
  }

  /**
   * 接続の統計情報
   */
  getConnectionStats(connections: Connection[], gates: BaseGate[]): {
    totalConnections: number;
    averageConnections: number;
    maxConnections: number;
    unconnectedInputs: number;
    unconnectedOutputs: number;
  } {
    const totalConnections = connections.length;
    const gateConnectionCounts = gates.map(gate => {
      const outputConnections = connections.filter(c => c.fromGateId === gate.id).length;
      const inputConnections = connections.filter(c => c.toGateId === gate.id).length;
      return outputConnections + inputConnections;
    });

    const averageConnections = totalConnections > 0 ? 
      gateConnectionCounts.reduce((sum, count) => sum + count, 0) / gates.length : 0;
    const maxConnections = Math.max(...gateConnectionCounts, 0);

    // 未接続のピン数を計算
    let unconnectedInputs = 0;
    let unconnectedOutputs = 0;

    gates.forEach(gate => {
      // 入力ピンの未接続数
      for (let i = 0; i < gate.inputPins.length; i++) {
        const isConnected = connections.some(c => c.toGateId === gate.id && c.toPinIndex === i);
        if (!isConnected) unconnectedInputs++;
      }

      // 出力ピンの未接続数（出力は複数接続可能なので、0接続のみカウント）
      for (let i = 0; i < gate.outputPins.length; i++) {
        const connectionCount = connections.filter(c => c.fromGateId === gate.id && c.fromPinIndex === i).length;
        if (connectionCount === 0) unconnectedOutputs++;
      }
    });

    return {
      totalConnections,
      averageConnections,
      maxConnections,
      unconnectedInputs,
      unconnectedOutputs
    };
  }
}
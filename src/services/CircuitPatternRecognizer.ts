import type { Gate, Wire } from '../types/circuit';

export interface CircuitPattern {
  type:
    | 'led-counter'
    | 'digital-clock'
    | 'traffic-light'
    | 'password-lock'
    | 'unknown';
  confidence: number; // 0-100
  description: string;
  relatedGates: Gate[];
  metadata?: any;
}

export interface CounterPattern extends CircuitPattern {
  type: 'led-counter';
  metadata: {
    bitCount: number;
    clockGate: Gate;
    outputGates: Gate[];
    maxValue: number;
  };
}

export class CircuitPatternRecognizer {
  recognizePattern(gates: Gate[], wires: Wire[]): CircuitPattern {
    // LEDカウンタパターンを最初に実装
    const counterPattern = this.recognizeLEDCounter(gates, wires);
    if (counterPattern.confidence > 70) {
      return counterPattern;
    }

    // 他のパターンは将来実装
    // const clockPattern = this.recognizeDigitalClock(gates, wires);
    // const trafficPattern = this.recognizeTrafficLight(gates, wires);

    return {
      type: 'unknown',
      confidence: 0,
      description: '認識できないパターンです',
      relatedGates: [],
    };
  }

  private recognizeLEDCounter(gates: Gate[], wires: Wire[]): CounterPattern {
    // 1. CLOCKゲートが存在するか
    const clockGates = gates.filter(g => g.type === 'CLOCK');
    if (clockGates.length !== 1) {
      return this.createEmptyCounterPattern();
    }

    // 2. OUTPUTゲートが2-8個存在するか
    const outputGates = gates.filter(g => g.type === 'OUTPUT');
    if (outputGates.length < 2 || outputGates.length > 8) {
      return this.createEmptyCounterPattern();
    }

    // 3. CLOCKから各OUTPUTへのパスが存在するか
    const clockGate = clockGates[0];
    const reachableOutputs = this.findReachableOutputs(clockGate, gates, wires);

    if (reachableOutputs.length < 2) {
      return this.createEmptyCounterPattern();
    }

    // 4. カウンタっぽい構造か（フリップフロップや論理ゲートの組み合わせ）
    const hasCounterStructure = this.hasCounterLikeStructure(gates, wires);

    let confidence = 60; // 基本スコア

    // 信頼度計算
    if (reachableOutputs.length === outputGates.length) confidence += 20;
    if (hasCounterStructure) confidence += 15;
    if (this.hasSequentialPattern(outputGates, wires)) confidence += 5;

    return {
      type: 'led-counter',
      confidence: Math.min(confidence, 95),
      description: `${reachableOutputs.length}ビットLEDカウンタ`,
      relatedGates: [clockGate, ...reachableOutputs],
      metadata: {
        bitCount: reachableOutputs.length,
        clockGate,
        outputGates: reachableOutputs,
        maxValue: Math.pow(2, reachableOutputs.length) - 1,
      },
    };
  }

  private createEmptyCounterPattern(): CounterPattern {
    return {
      type: 'led-counter',
      confidence: 0,
      description: 'LEDカウンタではありません',
      relatedGates: [],
      metadata: {
        bitCount: 0,
        clockGate: {} as Gate,
        outputGates: [],
        maxValue: 0,
      },
    };
  }

  private findReachableOutputs(
    sourceGate: Gate,
    gates: Gate[],
    wires: Wire[]
  ): Gate[] {
    const reachableOutputs: Gate[] = [];
    const visited = new Set<string>();

    const traverse = (gateId: string) => {
      if (visited.has(gateId)) return;
      visited.add(gateId);

      // このゲートから出ているワイヤーを探す
      const outgoingWires = wires.filter(w => w.from.gateId === gateId);

      for (const wire of outgoingWires) {
        const targetGate = gates.find(g => g.id === wire.to.gateId);
        if (!targetGate) continue;

        if (targetGate.type === 'OUTPUT') {
          reachableOutputs.push(targetGate);
        } else {
          // 中間ゲートを通って続行
          traverse(targetGate.id);
        }
      }
    };

    traverse(sourceGate.id);
    return reachableOutputs;
  }

  private hasCounterLikeStructure(gates: Gate[], wires: Wire[]): boolean {
    // フリップフロップ、ラッチ、またはフィードバックループの存在をチェック
    const flipflopGates = gates.filter(
      g => g.type === 'D-FF' || g.type === 'SR-LATCH'
    );

    if (flipflopGates.length > 0) return true;

    // フィードバックループの検出（簡易版）
    return this.hasFeedbackLoop(gates, wires);
  }

  private hasFeedbackLoop(_gates: Gate[], _wires: Wire[]): boolean {
    // 簡易的なフィードバックループ検出
    // 詳細な実装は必要に応じて後で
    return false;
  }

  private hasSequentialPattern(outputGates: Gate[], _wires: Wire[]): boolean {
    // OUTPUTゲートが順序立って配置されているかチェック
    if (outputGates.length < 2) return false;

    const sortedByX = outputGates.sort((a, b) => a.position.x - b.position.x);

    // X座標が順序立っている場合にボーナスポイント
    for (let i = 1; i < sortedByX.length; i++) {
      if (sortedByX[i].position.x <= sortedByX[i - 1].position.x) {
        return false;
      }
    }

    return true;
  }

  // 将来の拡張用
  /*
  private recognizeDigitalClock(gates: Gate[], wires: Wire[]): CircuitPattern {
    // 時計パターンの認識ロジック
  }

  private recognizeTrafficLight(gates: Gate[], wires: Wire[]): CircuitPattern {
    // 信号機パターンの認識ロジック
  }
  */
}

export const circuitPatternRecognizer = new CircuitPatternRecognizer();

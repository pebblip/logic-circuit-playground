/**
 * 回路解析ツール
 * 循環依存の検出とシミュレーション方式の選択
 */

import type { Circuit } from '../core/types';

export class CircuitAnalyzer {
  /**
   * 回路に循環依存があるかチェック
   */
  static hasCircularDependency(circuit: Circuit): boolean {
    const graph = this.buildDependencyGraph(circuit);
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    for (const gateId of graph.keys()) {
      if (this.hasCycleFrom(gateId, graph, visited, recursionStack)) {
        return true;
      }
    }

    return false;
  }

  /**
   * 循環を形成しているゲートのリストを取得
   */
  static findCircularGates(circuit: Circuit): string[] {
    const graph = this.buildDependencyGraph(circuit);
    const circularGates: Set<string> = new Set();

    for (const gateId of graph.keys()) {
      const visited = new Set<string>();
      const recursionStack = new Set<string>();
      const path: string[] = [];

      if (this.findCyclePath(gateId, graph, visited, recursionStack, path)) {
        // パス内の全てのゲートを循環ゲートとして記録
        path.forEach(id => circularGates.add(id));
      }
    }

    return Array.from(circularGates);
  }

  /**
   * 依存関係グラフを構築
   */
  private static buildDependencyGraph(circuit: Circuit): Map<string, string[]> {
    const graph = new Map<string, string[]>();

    // 初期化
    for (const gate of circuit.gates) {
      graph.set(gate.id, []);
    }

    // ワイヤーから依存関係を構築
    for (const wire of circuit.wires) {
      const dependencies = graph.get(wire.to.gateId) || [];
      dependencies.push(wire.from.gateId);
      graph.set(wire.to.gateId, dependencies);
    }

    return graph;
  }

  /**
   * DFSで循環をチェック
   */
  private static hasCycleFrom(
    nodeId: string,
    graph: Map<string, string[]>,
    visited: Set<string>,
    recursionStack: Set<string>
  ): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const neighbors = graph.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (this.hasCycleFrom(neighbor, graph, visited, recursionStack)) {
          return true;
        }
      } else if (recursionStack.has(neighbor)) {
        return true; // 循環検出
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  /**
   * 循環パスを見つける
   */
  private static findCyclePath(
    nodeId: string,
    graph: Map<string, string[]>,
    visited: Set<string>,
    recursionStack: Set<string>,
    path: string[]
  ): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    path.push(nodeId);

    const neighbors = graph.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (
          this.findCyclePath(neighbor, graph, visited, recursionStack, path)
        ) {
          return true;
        }
      } else if (recursionStack.has(neighbor)) {
        // 循環の開始点を見つける
        const cycleStart = path.indexOf(neighbor);
        if (cycleStart !== -1) {
          path.splice(0, cycleStart);
        }
        return true;
      }
    }

    recursionStack.delete(nodeId);
    path.pop();
    return false;
  }

  /**
   * 回路の複雑度を計算（デバッグ用）
   */
  static getCircuitComplexity(circuit: Circuit): {
    gateCount: number;
    wireCount: number;
    feedbackLoops: number;
    maxFanOut: number;
  } {
    const fanOut = new Map<string, number>();

    for (const wire of circuit.wires) {
      const count = fanOut.get(wire.from.gateId) || 0;
      fanOut.set(wire.from.gateId, count + 1);
    }

    const maxFanOut = Math.max(...Array.from(fanOut.values()), 0);
    const circularGates = this.findCircularGates(circuit);

    return {
      gateCount: circuit.gates.length,
      wireCount: circuit.wires.length,
      feedbackLoops: circularGates.length,
      maxFanOut,
    };
  }
}

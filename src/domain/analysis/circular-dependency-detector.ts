/**
 * 回路の循環依存を検出するユーティリティ
 *
 * 深さ優先探索（DFS）を使用して、回路内の循環を検出する
 */

import type { Circuit } from '../simulation/core/types';

export class CircularDependencyDetector {
  /**
   * 回路内のすべての循環を検出
   * @returns 循環を構成するゲートIDの配列の配列
   */
  detectCycles(circuit: Circuit): string[][] {
    const adjacencyList = this.buildAdjacencyList(circuit);
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const currentPath: string[] = [];

    // 各ゲートから深さ優先探索を開始
    for (const gate of circuit.gates) {
      if (!visited.has(gate.id)) {
        this.dfs(
          gate.id,
          adjacencyList,
          visited,
          recursionStack,
          currentPath,
          cycles
        );
      }
    }

    // 重複する循環を除去（同じ循環の異なる開始点）
    return this.deduplicateCycles(cycles);
  }

  /**
   * 回路に循環依存があるかどうかを判定
   */
  hasCircularDependency(circuit: Circuit): boolean {
    const adjacencyList = this.buildAdjacencyList(circuit);
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    for (const gate of circuit.gates) {
      if (!visited.has(gate.id)) {
        if (this.hasCycleDFS(gate.id, adjacencyList, visited, recursionStack)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * 隣接リストを構築
   */
  private buildAdjacencyList(circuit: Circuit): Map<string, string[]> {
    const adjacencyList = new Map<string, string[]>();

    // 存在するゲートIDのセットを作成
    const gateIds = new Set(circuit.gates.map(g => g.id));

    // すべてのゲートを隣接リストに追加
    for (const gate of circuit.gates) {
      adjacencyList.set(gate.id, []);
    }

    // ワイヤーから隣接関係を構築
    for (const wire of circuit.wires) {
      const from = wire.from.gateId;
      const to = wire.to.gateId;

      // 存在しないゲートへの接続は無視
      if (!gateIds.has(from) || !gateIds.has(to)) {
        continue;
      }

      const neighbors = adjacencyList.get(from) || [];
      neighbors.push(to);
      adjacencyList.set(from, neighbors);
    }

    return adjacencyList;
  }

  /**
   * 深さ優先探索で循環を検出（詳細版）
   */
  private dfs(
    node: string,
    adjacencyList: Map<string, string[]>,
    visited: Set<string>,
    recursionStack: Set<string>,
    currentPath: string[],
    cycles: string[][]
  ): void {
    visited.add(node);
    recursionStack.add(node);
    currentPath.push(node);

    const neighbors = adjacencyList.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        this.dfs(
          neighbor,
          adjacencyList,
          visited,
          recursionStack,
          currentPath,
          cycles
        );
      } else if (recursionStack.has(neighbor)) {
        // 循環を検出
        const cycleStartIndex = currentPath.indexOf(neighbor);
        if (cycleStartIndex !== -1) {
          const cycle = currentPath.slice(cycleStartIndex);
          cycles.push([...cycle]);
        }
      }
    }

    recursionStack.delete(node);
    currentPath.pop();
  }

  /**
   * 深さ優先探索で循環を検出（高速版）
   */
  private hasCycleDFS(
    node: string,
    adjacencyList: Map<string, string[]>,
    visited: Set<string>,
    recursionStack: Set<string>
  ): boolean {
    visited.add(node);
    recursionStack.add(node);

    const neighbors = adjacencyList.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (
          this.hasCycleDFS(neighbor, adjacencyList, visited, recursionStack)
        ) {
          return true;
        }
      } else if (recursionStack.has(neighbor)) {
        return true;
      }
    }

    recursionStack.delete(node);
    return false;
  }

  /**
   * 重複する循環を除去
   */
  private deduplicateCycles(cycles: string[][]): string[][] {
    const uniqueCycles: string[][] = [];
    const seen = new Set<string>();

    for (const cycle of cycles) {
      // 循環を正規化（最小のIDから始まるように回転）
      const normalized = this.normalizeCycle(cycle);
      const key = normalized.join(',');

      if (!seen.has(key)) {
        seen.add(key);
        uniqueCycles.push(cycle);
      }
    }

    return uniqueCycles;
  }

  /**
   * 循環を正規化（最小のIDから始まるように回転）
   */
  private normalizeCycle(cycle: string[]): string[] {
    if (cycle.length === 0) return cycle;

    let minIndex = 0;
    let minId = cycle[0];

    for (let i = 1; i < cycle.length; i++) {
      if (cycle[i] < minId) {
        minIndex = i;
        minId = cycle[i];
      }
    }

    return [...cycle.slice(minIndex), ...cycle.slice(0, minIndex)];
  }
}

/**
 * ServiceCircuitSharingAdapter - 実サービス統合アダプター
 *
 * 理想的なCircuitSharingインターフェースを
 * 既存のCircuitShareServiceで実装します。
 */

import { CircuitShareService } from '@/services/CircuitShareService';
import type { Gate, Wire } from '@/types/circuit';
import type {
  CircuitSharing,
  CircuitContent,
  ShareUrl,
  ShareResult,
} from '@/domain/ports/CircuitSharing';

export class ServiceCircuitSharingAdapter implements CircuitSharing {
  /**
   * 回路を共有用URLに変換
   */
  async share(circuit: CircuitContent): Promise<ShareResult> {
    try {
      // 入力検証
      if (!circuit || typeof circuit !== 'object') {
        return {
          success: false,
          error: 'Invalid circuit data',
        };
      }

      if (!circuit.name || !circuit.components || !circuit.connections) {
        return {
          success: false,
          error: 'Missing required circuit properties',
        };
      }

      // CircuitContent を Gate[], Wire[] に変換
      const gates = this.convertComponentsToGates(circuit.components);
      const wires = this.convertConnectionsToWires(circuit.connections);

      // 既存サービスを使用
      const result = await CircuitShareService.createShareUrl(gates, wires, {
        name: circuit.name,
        description: circuit.metadata?.description || '',
      });

      if (result.success && result.url) {
        return {
          success: true,
          shareUrl: result.url as ShareUrl,
          shareId: this.extractShareIdFromUrl(result.url),
        };
      } else {
        return {
          success: false,
          error: result.error || 'Failed to create share URL',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 共有URLから回路を復元
   */
  async load(shareUrl: ShareUrl): Promise<CircuitContent | null> {
    try {
      const result = await CircuitShareService.parseShareUrl(shareUrl);

      if (!result.success || !result.data?.gates || !result.data?.wires) {
        return null;
      }

      // Gate[], Wire[] を CircuitContent に変換
      return {
        name: result.data?.name || 'Shared Circuit',
        components: this.convertGatesToComponents(result.data.gates),
        connections: this.convertWiresToConnections(result.data.wires),
        metadata: {
          description: result.data?.description || '',
        },
      };
    } catch (error) {
      console.error('Failed to load circuit from share URL:', error);
      return null;
    }
  }

  /**
   * 共有URLが有効かチェック
   */
  async isValidShareUrl(shareUrl: ShareUrl): Promise<boolean> {
    try {
      const circuit = await this.load(shareUrl);
      return circuit !== null;
    } catch {
      return false;
    }
  }

  /**
   * 共有データの統計情報取得
   */
  async getShareStats(shareId: string): Promise<{
    accessCount: number;
    createdAt: Date;
    lastAccessed: Date;
  } | null> {
    // 既存サービスに統計機能がないため、Mock実装
    // 実際のプロダクションでは統計サービスと連携
    return {
      accessCount: 0,
      createdAt: new Date(),
      lastAccessed: new Date(),
    };
  }

  // === 内部変換メソッド ===

  private convertComponentsToGates(components: any[]): Gate[] {
    return components.map(component => ({
      id: component.id,
      type: component.type,
      position: component.position,
      inputs: [], // 適切な初期値を設定
      output: false,
    }));
  }

  private convertConnectionsToWires(connections: any[]): Wire[] {
    return connections.map(connection => ({
      id: connection.id,
      from: {
        gateId: connection.from.componentId,
        pinIndex: connection.from.outputIndex,
      },
      to: {
        gateId: connection.to.componentId,
        pinIndex: connection.to.inputIndex,
      },
      isActive: false, // 必須プロパティを追加
    }));
  }

  private convertGatesToComponents(gates: Gate[]): any[] {
    return gates.map(gate => ({
      id: gate.id,
      type: gate.type,
      position: gate.position,
    }));
  }

  private convertWiresToConnections(wires: Wire[]): any[] {
    return wires.map(wire => ({
      id: wire.id,
      from: {
        componentId: wire.from.gateId,
        outputIndex: wire.from.pinIndex,
      },
      to: {
        componentId: wire.to.gateId,
        inputIndex: wire.to.pinIndex,
      },
    }));
  }

  private extractShareIdFromUrl(url: string): string {
    // URL形式に応じてIDを抽出
    const match = url.match(/[?&]circuit=([^&]+)/);
    return match ? match[1] : 'unknown';
  }
}

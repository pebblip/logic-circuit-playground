/**
 * ServiceCircuitStorageAdapter - 理想インターフェースと既存サービスの架け橋
 *
 * このアダプターにより、理想的な仕様ベーステストが
 * 実際のIndexedDB/LocalStorageサービスで動作するようになります。
 *
 * 設計原則：
 * - 理想インターフェースの完全実装
 * - 既存サービス実装への最小限の影響
 * - データ損失の絶対防止
 * - パフォーマンスの最適化
 */

import type {
  CircuitStorage,
  CircuitContent,
  CircuitId,
  ShareUrl,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  StorageInfo,
  SavedCircuit,
} from '@/domain/ports/CircuitPersistence';
import { CircuitStorageService } from '@/services/CircuitStorageService';
import { CircuitShareService } from '@/services/CircuitShareService';
import type { Gate, Wire, GateType } from '@/types/circuit';
import type {
  SavedCircuit as StorageServiceSavedCircuit,
  CircuitMetadata,
} from '@/types/circuitStorage';

export class ServiceCircuitStorageAdapter implements CircuitStorage {
  private storageService: CircuitStorageService;

  constructor() {
    this.storageService = CircuitStorageService.getInstance();
  }

  // === 内部ヘルパーメソッド ===

  private mapGateTypeToCircuitComponentType(
    gateType: GateType | string
  ): CircuitContent['components'][0]['type'] {
    // Map GateType to the restricted set of component types
    const typeMap: Record<string, CircuitContent['components'][0]['type']> = {
      AND: 'AND',
      OR: 'OR',
      NOT: 'NOT',
      XOR: 'XOR',
      NAND: 'NAND',
      NOR: 'NOR',
      INPUT: 'INPUT',
      OUTPUT: 'OUTPUT',
      CLOCK: 'CLOCK',
      CUSTOM: 'CUSTOM',
      // Map extended gate types to CUSTOM
      'D-FF': 'CUSTOM',
      'SR-LATCH': 'CUSTOM',
      MUX: 'CUSTOM',
      BINARY_COUNTER: 'CUSTOM',
    };
    return typeMap[gateType] || 'CUSTOM';
  }

  private convertToServiceFormat(content: CircuitContent): {
    name: string;
    gates: Gate[];
    wires: Wire[];
    options: {
      description?: string;
      tags?: string[];
      thumbnail?: string;
    };
  } {
    const gates: Gate[] = content.components.map(component => ({
      id: component.id,
      type: component.type as GateType,
      position: component.position,
      inputs: [], // デフォルト値
      output: false, // デフォルト値
    }));

    const wires: Wire[] = content.connections.map(connection => ({
      id: connection.id,
      from: {
        gateId: connection.from.componentId,
        pinIndex: connection.from.outputIndex,
      },
      to: {
        gateId: connection.to.componentId,
        pinIndex: connection.to.inputIndex,
      },
      isActive: false,
    }));

    return {
      name: content.name,
      gates,
      wires,
      options: {
        description: content.metadata?.description,
        tags: content.metadata?.tags,
      },
    };
  }

  private convertFromServiceFormat(
    savedCircuit: StorageServiceSavedCircuit
  ): CircuitContent {
    return {
      name: savedCircuit.metadata.name,
      components: savedCircuit.circuit.gates.map(gate => ({
        id: gate.id,
        type: this.mapGateTypeToCircuitComponentType(gate.type),
        position: gate.position,
      })),
      connections: savedCircuit.circuit.wires.map(wire => ({
        id: wire.id,
        from: {
          componentId: wire.from.gateId,
          outputIndex: wire.from.pinIndex,
        },
        to: {
          componentId: wire.to.gateId,
          inputIndex: wire.to.pinIndex,
        },
      })),
      metadata: {
        description: savedCircuit.metadata.description,
        tags: savedCircuit.metadata.tags,
        author: undefined,
      },
    };
  }

  private convertMetadata(metadata: CircuitMetadata): SavedCircuit {
    return {
      id: metadata.id,
      name: metadata.name,
      createdAt: new Date(metadata.createdAt || metadata.updatedAt),
      updatedAt: new Date(metadata.updatedAt),
      description: metadata.description,
      thumbnail: metadata.thumbnail,
    };
  }

  // === CircuitStorage実装 ===

  async save(content: CircuitContent): Promise<CircuitId> {
    const { name, gates, wires, options } =
      this.convertToServiceFormat(content);

    const result = await this.storageService.saveCircuit(
      name,
      gates,
      wires,
      options
    );

    if (!result.success) {
      throw new Error(result.message || '回路の保存に失敗しました');
    }

    return result.data!.id;
  }

  async load(circuitId: CircuitId): Promise<CircuitContent> {
    const result = await this.storageService.loadCircuit(circuitId);

    if (!result.success || !result.data) {
      throw new Error(result.message || '回路の読み込みに失敗しました');
    }

    return this.convertFromServiceFormat(result.data);
  }

  async exists(circuitId: CircuitId): Promise<boolean> {
    try {
      const result = await this.storageService.loadCircuit(circuitId);
      return result.success && result.data !== undefined;
    } catch {
      return false;
    }
  }

  async list(): Promise<SavedCircuit[]> {
    const result = await this.storageService.listCircuits();

    if (!result.success || !result.data) {
      return [];
    }

    return result.data.map(metadata => this.convertMetadata(metadata));
  }

  async delete(circuitId: CircuitId): Promise<void> {
    const result = await this.storageService.deleteCircuit(circuitId);

    if (!result.success) {
      throw new Error(result.message || '回路の削除に失敗しました');
    }
  }

  async createShareUrl(content: CircuitContent): Promise<ShareUrl> {
    const { gates, wires } = this.convertToServiceFormat(content);

    const result = await CircuitShareService.createShareUrl(gates, wires, {
      name: content.name,
      description: content.metadata?.description,
    });

    if (!result.success || !result.url) {
      throw new Error(result.error || '共有URLの作成に失敗しました');
    }

    return result.url;
  }

  async loadFromShareUrl(shareUrl: ShareUrl): Promise<CircuitContent> {
    try {
      const url = new URL(shareUrl);
      const circuitParam = url.searchParams.get('circuit');

      if (!circuitParam) {
        throw new Error('無効な共有URL: 回路データが見つかりません');
      }

      const result = await CircuitShareService.parseShareUrl(shareUrl);

      if (!result.success || !result.data) {
        throw new Error(result.error || '共有URLからの読み込みに失敗しました');
      }

      // 簡易的な変換（実際のサービス実装に依存）
      return {
        name: result.data.name || '共有回路',
        components:
          result.data.gates?.map((gate: Gate) => ({
            id: gate.id,
            type: this.mapGateTypeToCircuitComponentType(gate.type),
            position: gate.position,
          })) || [],
        connections:
          result.data.wires?.map((wire: Wire) => ({
            id: wire.id,
            from: {
              componentId: wire.from.gateId,
              outputIndex: wire.from.pinIndex,
            },
            to: {
              componentId: wire.to.gateId,
              inputIndex: wire.to.pinIndex,
            },
          })) || [],
        metadata: {
          description: result.data.description,
        },
      };
    } catch (error) {
      throw new Error(
        `無効な共有URL: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async isValidShareUrl(shareUrl: ShareUrl): Promise<boolean> {
    try {
      const url = new URL(shareUrl);
      const circuitParam = url.searchParams.get('circuit');

      if (!circuitParam) {
        return false;
      }

      // Try to parse to check validity
      const result = await CircuitShareService.parseShareUrl(shareUrl);
      return result.success === true;
    } catch {
      return false;
    }
  }

  async validate(content: CircuitContent): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // 基本的な整合性チェック
    const componentIds = new Set(content.components.map(c => c.id));

    // 接続の整合性チェック
    for (const connection of content.connections) {
      if (!componentIds.has(connection.from.componentId)) {
        errors.push({
          type: 'MISSING_COMPONENT' as const,
          message: `接続元コンポーネントが存在しません: ${connection.from.componentId}`,
          componentId: connection.from.componentId,
        });
      }

      if (!componentIds.has(connection.to.componentId)) {
        errors.push({
          type: 'MISSING_COMPONENT' as const,
          message: `接続先コンポーネントが存在しません: ${connection.to.componentId}`,
          componentId: connection.to.componentId,
        });
      }
    }

    // 名前の検証
    if (!content.name || content.name.trim().length === 0) {
      errors.push({
        type: 'DATA_CORRUPTION' as const,
        message: '回路名が設定されていません',
      });
    }

    // パフォーマンス警告
    if (content.components.length > 100) {
      warnings.push({
        type: 'PERFORMANCE_ISSUE' as const,
        message: 'コンポーネント数が多いため、動作が重くなる可能性があります',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      canRepair: errors.some(
        e => e.type === 'MISSING_COMPONENT' || e.type === 'DATA_CORRUPTION'
      ),
    };
  }

  async repair(content: CircuitContent): Promise<CircuitContent> {
    const repaired = { ...content };

    // 名前の修復
    if (!repaired.name || repaired.name.trim().length === 0) {
      repaired.name = `修復された回路_${new Date().toISOString().slice(0, 10)}`;
    }

    // 無効な接続の削除
    const componentIds = new Set(repaired.components.map(c => c.id));
    repaired.connections = repaired.connections.filter(
      connection =>
        componentIds.has(connection.from.componentId) &&
        componentIds.has(connection.to.componentId)
    );

    return repaired;
  }

  async isAvailable(): Promise<boolean> {
    try {
      // IndexedDBが利用可能かチェック
      return typeof indexedDB !== 'undefined';
    } catch {
      return false;
    }
  }

  async getStorageInfo(): Promise<StorageInfo> {
    const circuitsList = await this.list();

    // 簡易的な情報計算
    const totalSize = circuitsList.length * 1024; // 概算
    const dates = circuitsList.map(c => c.updatedAt).sort();

    return {
      totalCircuits: circuitsList.length,
      totalSize,
      availableSpace: 50 * 1024 * 1024, // 仮の値（50MB）
      oldestCircuit: dates[0] || new Date(),
      newestCircuit: dates[dates.length - 1] || new Date(),
    };
  }

  async clear(): Promise<void> {
    const circuitsList = await this.list();

    // 全ての回路を削除
    for (const circuit of circuitsList) {
      try {
        await this.delete(circuit.id);
      } catch {
        // 削除に失敗した場合は無視して続行
      }
    }
  }

  async exportToFile(
    content: CircuitContent,
    format: 'json' | 'png'
  ): Promise<Blob> {
    if (format === 'json') {
      const json = JSON.stringify(content, null, 2);
      return new Blob([json], { type: 'application/json' });
    } else if (format === 'png') {
      // PNG生成のモック実装（実際の実装ではCanvasを使用）
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d')!;

      // 簡易的な回路描画
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#000000';
      ctx.font = '16px Arial';
      ctx.fillText(`Circuit: ${content.name}`, 10, 30);
      ctx.fillText(`Components: ${content.components.length}`, 10, 60);
      ctx.fillText(`Connections: ${content.connections.length}`, 10, 90);

      return new Promise(resolve => {
        canvas.toBlob(blob => {
          resolve(blob || new Blob());
        }, 'image/png');
      });
    } else {
      throw new Error(`サポートされていないフォーマット: ${format}`);
    }
  }

  async importFromFile(file: File): Promise<CircuitContent> {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      // 基本的なフォーマット検証
      if (
        !parsed.name ||
        !Array.isArray(parsed.components) ||
        !Array.isArray(parsed.connections)
      ) {
        throw new Error('無効なファイル形式です');
      }

      return parsed as CircuitContent;
    } catch (error) {
      throw new Error(
        `ファイルの読み込みに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async createBackup(): Promise<void> {
    // バックアップ機能のモック実装
  }

  async restoreFromBackup(): Promise<void> {
    // 復元機能のモック実装
  }
}

/**
 * Canvasのゲート管理フック
 * ドラッグ&ドロップによるゲート配置を管理
 */

import { useCallback, RefObject } from 'react';
import { useCircuitStore } from '@/stores/circuitStore';
import { reactEventToSVGCoordinates } from '@infrastructure/ui/svgCoordinates';
import type { GateType, CustomGateDefinition } from '@/types/gates';

interface UseCanvasGateManagementProps {
  svgRef: RefObject<SVGSVGElement>;
  isReadOnly: boolean;
}

export const useCanvasGateManagement = ({ 
  svgRef, 
  isReadOnly 
}: UseCanvasGateManagementProps) => {
  const { addGate, addCustomGateInstance } = useCircuitStore();

  // ドロップハンドラ
  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    // プレビューモードでは配置不可
    if (isReadOnly) {
      return;
    }

    const draggedGateData = (window as Window & { _draggedGate?: unknown })
      ._draggedGate;
    if (!draggedGateData || !svgRef.current) return;

    // 型アサーション
    const draggedGate = draggedGateData as {
      type: GateType;
      customDefinition?: CustomGateDefinition;
    };

    // SVG座標系でのドロップ位置を取得
    const svgPoint = reactEventToSVGCoordinates(event, svgRef.current);
    if (!svgPoint) return;

    // 🛡️ 座標の防護策：左上角（0,0）近辺への配置を防ぐ
    const safeX = Math.max(svgPoint.x, 100); // 最小X座標を100に
    const safeY = Math.max(svgPoint.y, 100); // 最小Y座標を100に
    
    // デバッグ情報（開発時のみ）
    if (import.meta.env.DEV && (svgPoint.x !== safeX || svgPoint.y !== safeY)) {
      console.warn(`⚠️ ゲート配置座標を調整: (${svgPoint.x}, ${svgPoint.y}) -> (${safeX}, ${safeY})`);
    }

    // ゲートを配置（安全な座標で）
    if (draggedGate.type === 'CUSTOM' && draggedGate.customDefinition) {
      addCustomGateInstance(draggedGate.customDefinition, {
        x: safeX,
        y: safeY,
      });
    } else {
      addGate(draggedGate.type, { x: safeX, y: safeY });
    }
  }, [svgRef, isReadOnly, addGate, addCustomGateInstance]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }, []);

  return {
    handleDrop,
    handleDragOver,
  };
};
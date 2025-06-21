/**
 * Canvasのゲート管理フック
 * ドラッグ&ドロップによるゲート配置を管理
 */

import type { RefObject } from 'react';
import { useCallback } from 'react';
import { useCircuitStore } from '@/stores/circuitStore';
import { reactEventToSVGCoordinates } from '@infrastructure/ui/svgCoordinates';
import type { GateType, CustomGateDefinition } from '@/types/gates';

interface UseCanvasGateManagementProps {
  svgRef: RefObject<SVGSVGElement>;
  isReadOnly: boolean;
}

export const useCanvasGateManagement = ({
  svgRef,
  isReadOnly,
}: UseCanvasGateManagementProps) => {
  const { addGate, addCustomGateInstance } = useCircuitStore();

  // ドロップハンドラ
  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      console.log('🎯 ドロップイベント開始:', {
        clientX: event.clientX,
        clientY: event.clientY,
        isReadOnly,
      });

      // プレビューモードでは配置不可
      if (isReadOnly) {
        console.log('❌ 読み取り専用モードのため配置をスキップ');
        return;
      }

      const draggedGateData = (window as Window & { _draggedGate?: unknown })
        ._draggedGate;

      console.log('🔍 ドラッグされたゲートデータ:', draggedGateData);

      if (!draggedGateData || !svgRef.current) {
        console.log('❌ ドラッグデータまたはSVG Refが不正:', {
          draggedGateData: !!draggedGateData,
          svgRef: !!svgRef.current,
        });
        return;
      }

      // 型アサーション
      const draggedGate = draggedGateData as {
        type: GateType;
        customDefinition?: CustomGateDefinition;
      };

      // SVG座標系でのドロップ位置を取得
      const svgPoint = reactEventToSVGCoordinates(event, svgRef.current);
      if (!svgPoint) {
        console.warn(
          '⚠️ SVG座標変換に失敗しました。フォールバック座標を使用します。'
        );
        // フォールバック: 単純なクライアント座標をそのまま使用
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;

        const fallbackPoint = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };

        console.log('🛡️ フォールバック座標:', fallbackPoint);

        // フォールバック座標で処理を続行
        const safeX = Math.max(fallbackPoint.x, 100);
        const safeY = Math.max(fallbackPoint.y, 100);

        if (draggedGate.type === 'CUSTOM' && draggedGate.customDefinition) {
          addCustomGateInstance(draggedGate.customDefinition, {
            x: safeX,
            y: safeY,
          });
        } else {
          console.log('🎯 ゲート配置実行:', {
            type: draggedGate.type,
            position: { x: safeX, y: safeY },
          });
          addGate(draggedGate.type, { x: safeX, y: safeY });
        }
        return;
      }

      console.log('✅ SVG座標変換成功:', svgPoint);

      // 🛡️ 座標の防護策：左上角（0,0）近辺への配置を防ぐ
      const safeX = Math.max(svgPoint.x, 100); // 最小X座標を100に
      const safeY = Math.max(svgPoint.y, 100); // 最小Y座標を100に

      // デバッグ情報（開発時のみ）
      if (
        import.meta.env.DEV &&
        (svgPoint.x !== safeX || svgPoint.y !== safeY)
      ) {
        console.warn(
          `⚠️ ゲート配置座標を調整: (${svgPoint.x}, ${svgPoint.y}) -> (${safeX}, ${safeY})`
        );
      }

      // ゲートを配置（安全な座標で）
      if (draggedGate.type === 'CUSTOM' && draggedGate.customDefinition) {
        console.log('🎯 カスタムゲート配置実行:', {
          type: draggedGate.type,
          position: { x: safeX, y: safeY },
        });
        addCustomGateInstance(draggedGate.customDefinition, {
          x: safeX,
          y: safeY,
        });
      } else {
        console.log('🎯 標準ゲート配置実行:', {
          type: draggedGate.type,
          position: { x: safeX, y: safeY },
        });
        addGate(draggedGate.type, { x: safeX, y: safeY });
      }
    },
    [svgRef, isReadOnly, addGate, addCustomGateInstance]
  );

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

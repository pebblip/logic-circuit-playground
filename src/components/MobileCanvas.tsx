import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { Canvas } from './Canvas';
import { useMobileGateMovement } from '../hooks/useMobileGateMovement';
import { useMobileTapWireConnection } from '../hooks/useMobileTapWireConnection';
import { useCircuitStore } from '@/stores/circuitStore';
import { getPinPosition } from '@/domain/analysis/pinPositionCalculator';
import { useIsMobile } from '@/hooks/useResponsive';

interface MobileCanvasProps {
  highlightedGateId?: string | null;
}

export const MobileCanvas: React.FC<MobileCanvasProps> = ({
  highlightedGateId,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [activeTouch, setActiveTouch] = useState<number | null>(null);
  const { gates } = useCircuitStore();
  const isMobile = useIsMobile();
  const scaleFactor = isMobile ? 2 : 1;

  const {
    isDraggingGate,
    startGateTouch,
    updateGateTouch,
    endGateTouch,
    cancelGateTouch,
  } = useMobileGateMovement();

  const { selectedPin, handlePinTap, cancelConnection } =
    useMobileTapWireConnection();

  // 選択中のピンの位置を計算（スケールファクター考慮）
  const selectedPinPosition = useMemo(() => {
    if (!selectedPin) return null;

    const gate = gates.find(g => g.id === selectedPin.gateId);
    if (!gate) return null;

    // ピンインデックスを変換（出力ピンは負の値）
    const pinIndex = selectedPin.isOutput
      ? -(selectedPin.pinIndex + 1)
      : selectedPin.pinIndex;
    const pinPos = getPinPosition(gate, pinIndex);

    // スケールファクターを考慮した位置計算
    return {
      ...pinPos,
      x: gate.position.x + (pinPos.x - gate.position.x) * scaleFactor,
      y: gate.position.y + (pinPos.y - gate.position.y) * scaleFactor,
    };
  }, [selectedPin, gates, scaleFactor]);

  // タッチイベントをSVG座標に変換
  const touchToSVGPoint = (touch: Touch): { x: number; y: number } | null => {
    const svg = canvasRef.current?.querySelector('svg') as SVGSVGElement;
    if (!svg) return null;

    const svgPoint = svg.createSVGPoint();
    svgPoint.x = touch.clientX;
    svgPoint.y = touch.clientY;
    return svgPoint.matrixTransform(svg.getScreenCTM()!.inverse());
  };

  // ピンのタッチハンドラー（タップベース接続）
  const handlePinTouch = useCallback(
    (event: TouchEvent, gateId: string, pinIndex: number) => {
      event.preventDefault();
      event.stopPropagation();

      if (event.touches.length !== 1) return;

      // ピンインデックスから出力かどうかを判定
      const isOutput = pinIndex < 0;
      const actualPinIndex = isOutput ? Math.abs(pinIndex) - 1 : pinIndex;

      // タップベースの接続処理
      handlePinTap(gateId, actualPinIndex, isOutput);
    },
    [handlePinTap]
  );

  // ゲートのタッチハンドラー
  const handleGateTouch = useCallback(
    (event: TouchEvent, gateId: string) => {
      event.preventDefault();

      if (event.touches.length !== 1) return;

      const touch = event.touches[0];
      const svgPoint = touchToSVGPoint(touch);
      if (!svgPoint) return;

      setActiveTouch(touch.identifier);
      startGateTouch(gateId, { x: touch.clientX, y: touch.clientY }, svgPoint);
    },
    [startGateTouch]
  );

  // グローバルタッチイベントハンドラー
  useEffect(() => {
    const handleTouchMove = (event: TouchEvent) => {
      if (activeTouch === null) return;

      const touch = Array.from(event.touches).find(
        t => t.identifier === activeTouch
      );
      if (!touch) return;

      const svgPoint = touchToSVGPoint(touch);
      if (!svgPoint) return;

      // ゲートドラッグのみ処理（ワイヤー接続はタップベース）
      if (isDraggingGate) {
        updateGateTouch(svgPoint);
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (activeTouch === null) return;

      const touch = Array.from(event.changedTouches).find(
        t => t.identifier === activeTouch
      );
      if (!touch) return;

      // ゲートドラッグのみ処理（ワイヤー接続はタップベースに変更）
      if (isDraggingGate) {
        endGateTouch();
      }

      setActiveTouch(null);
    };

    const handleTouchCancel = () => {
      if (selectedPin) {
        cancelConnection();
      } else if (isDraggingGate) {
        cancelGateTouch();
      }
      setActiveTouch(null);
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchcancel', handleTouchCancel);

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [
    activeTouch,
    selectedPin,
    isDraggingGate,
    updateGateTouch,
    endGateTouch,
    cancelConnection,
    cancelGateTouch,
  ]);

  // ピンとゲートにタッチイベントを追加
  useEffect(() => {
    if (!canvasRef.current) return;

    const addTouchHandlers = () => {
      // ピンにタッチイベントを追加
      const pins = canvasRef.current!.querySelectorAll('[data-pin-index]');
      pins.forEach(pin => {
        const gateId = pin.getAttribute('data-gate-id');
        const pinIndex = pin.getAttribute('data-pin-index');
        if (gateId && pinIndex) {
          pin.addEventListener(
            'touchstart',
            e => {
              handlePinTouch(e as TouchEvent, gateId, parseInt(pinIndex));
            },
            { passive: true }
          );
        }
      });

      // ゲートにタッチイベントを追加
      const gates = canvasRef.current!.querySelectorAll('[data-gate-id]');
      gates.forEach(gate => {
        const gateId = gate.getAttribute('data-gate-id');
        if (gateId) {
          gate.addEventListener(
            'touchstart',
            e => {
              handleGateTouch(e as TouchEvent, gateId);
            },
            { passive: true }
          );
        }
      });
    };

    // MutationObserverで動的に追加される要素も監視
    const observer = new MutationObserver(addTouchHandlers);
    observer.observe(canvasRef.current, {
      childList: true,
      subtree: true,
    });

    addTouchHandlers();

    return () => {
      observer.disconnect();
    };
  }, [handleGateTouch, handlePinTouch]);

  return (
    <div ref={canvasRef} className="mobile-canvas-wrapper">
      <Canvas highlightedGateId={highlightedGateId} />

      {/* 選択中のピンの視覚的フィードバック */}
      {selectedPin && selectedPinPosition && (
        <svg
          className="selected-pin-indicator"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 100,
          }}
        >
          <circle
            cx={selectedPinPosition.x}
            cy={selectedPinPosition.y}
            r="10"
            fill="rgba(0, 255, 136, 0.2)"
            stroke="#00ff88"
            strokeWidth="2"
            className="selected-pin-pulse"
          />
        </svg>
      )}
    </div>
  );
};

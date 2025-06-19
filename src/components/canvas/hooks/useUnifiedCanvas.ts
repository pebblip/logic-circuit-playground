/**
 * 統一キャンバス管理Hook
 * 
 * CLAUDE.md準拠: 継続的検証による信頼性確保
 * - Canvas.tsx と GalleryCanvas.tsx の機能統合
 * - モード別機能の動的切り替え
 * - 型安全な状態管理とエラーハンドリング
 */

import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useCircuitStore } from '@/stores/circuitStore';
import { handleError } from '@/infrastructure/errorHandler';
import { EnhancedHybridEvaluator } from '@/domain/simulation/event-driven-minimal';
import { GateFactory } from '@/models/gates/GateFactory';
// import { formatCircuitWithAnimation } from '@/domain/circuit/layout';
import type { Gate, Wire } from '@/types/circuit';
import type { Circuit } from '@/domain/simulation/core/types';
import type {
  CanvasConfig,
  CanvasDataSource,
  CanvasEventHandlers,
  CanvasInternalState,
  CanvasOperationResult,
  CoordinateTransform,
} from '../types/canvasTypes';

/**
 * 統一キャンバス管理Hookの戻り値
 */
export interface UseUnifiedCanvasReturn {
  /** SVG参照 */
  svgRef: React.RefObject<SVGSVGElement>;
  
  /** 内部状態 */
  state: CanvasInternalState;
  
  /** 座標変換ユーティリティ */
  transform: CoordinateTransform;
  
  /** 操作関数 */
  actions: {
    /** ゲートクリック処理 */
    handleGateClick: (gateId: string) => void;
    
    /** 入力ゲート値切り替え */
    toggleInput: (gateId: string) => CanvasOperationResult;
    
    /** ズーム操作 */
    setZoom: (scale: number) => void;
    
    /** パン操作 */
    setPan: (offset: { x: number; y: number }) => void;
    
    /** 選択操作 */
    setSelection: (gateIds: string[]) => void;
    
    /** 回路データ更新 */
    updateCircuit: (gates: Gate[], wires: Wire[]) => void;
    
    /** アニメーション制御 */
    startAnimation: () => void;
    stopAnimation: () => void;
  };
  
  /** モード別表示フラグ */
  features: {
    canEdit: boolean;
    canSelect: boolean;
    canZoom: boolean;
    canPan: boolean;
    showControls: boolean;
    showBackground: boolean;
    autoSimulate: boolean;
  };
}

/**
 * 統一キャンバス管理Hook
 */
export function useUnifiedCanvas(
  config: CanvasConfig,
  dataSource: CanvasDataSource,
  handlers?: CanvasEventHandlers
): UseUnifiedCanvasReturn {
  const svgRef = useRef<SVGSVGElement>(null);
  const animationRef = useRef<number | null>(null);
  const evaluatorRef = useRef<EnhancedHybridEvaluator | null>(null);
  
  // Zustandストア（エディターモード用）
  const circuitStore = useCircuitStore();
  const viewMode = useCircuitStore(state => state.viewMode);
  const previewingCustomGateId = useCircuitStore(state => state.previewingCustomGateId);
  const customGates = useCircuitStore(state => state.customGates);
  
  // ローカル状態（ギャラリーモード用）
  const [localGates, setLocalGates] = useState<Gate[]>([]);
  const [localWires, setLocalWires] = useState<Wire[]>([]);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 800, height: 600 });
  const [scale, setScale] = useState(config.galleryOptions?.initialScale ?? 1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [mousePosition, setMousePosition] = useState({ x: 400, y: 300 });
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // シミュレーターの初期化
  useEffect(() => {
    if (config.mode === 'gallery' || config.simulationMode === 'local') {
      evaluatorRef.current = new EnhancedHybridEvaluator({
        strategy: 'AUTO_SELECT',
        enableDebugLogging: config.galleryOptions?.showDebugInfo ?? false,
      });
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [config.mode, config.simulationMode, config.galleryOptions?.showDebugInfo]);
  
  // データソースからゲート・ワイヤーを取得
  const { displayGates, displayWires } = useMemo(() => {
    try {
      // カスタムゲートプレビューモードの場合
      if (viewMode === 'custom-gate-preview' && previewingCustomGateId) {
        const customGate = customGates.find(g => g.id === previewingCustomGateId);
        if (customGate?.internalCircuit) {
          return {
            displayGates: customGate.internalCircuit.gates,
            displayWires: customGate.internalCircuit.wires,
          };
        }
      }
      
      if (config.simulationMode === 'store' || dataSource.store) {
        return {
          displayGates: circuitStore.gates,
          displayWires: circuitStore.wires,
        };
      }
      
      if (dataSource.galleryCircuit && config.mode !== 'gallery') {
        return {
          displayGates: dataSource.galleryCircuit.gates,
          displayWires: dataSource.galleryCircuit.wires,
        };
      }
      
      if (dataSource.customData) {
        return {
          displayGates: dataSource.customData.gates,
          displayWires: dataSource.customData.wires,
        };
      }
      
      return {
        displayGates: localGates,
        displayWires: localWires,
      };
    } catch (error) {
      handleError(
        error instanceof Error ? error : new Error('Unknown error'),
        'useUnifiedCanvas',
        {
          userAction: 'データソース取得',
          severity: 'medium',
          showToUser: false,
        }
      );
      return { displayGates: [], displayWires: [] };
    }
  }, [
    config.simulationMode,
    dataSource,
    circuitStore.gates,
    circuitStore.wires,
    localGates,
    localWires,
    viewMode,
    previewingCustomGateId,
    customGates,
  ]);
  
  // ギャラリーモードでの自動フォーマット
  useEffect(() => {
    if (config.mode === 'gallery' && dataSource.galleryCircuit) {
      try {
        // ギャラリーゲートにinputs配列を適切に設定
        const formattedGates = dataSource.galleryCircuit.gates.map(gate => {
          // ゲートタイプに応じたinputs配列を作成
          let inputs = gate.inputs;
          if (inputs.length === 0) {
            if (gate.type === 'INPUT' || gate.type === 'CLOCK') {
              inputs = [];
            } else if (gate.type === 'NOT' || gate.type === 'OUTPUT') {
              inputs = [''];
            } else if (gate.type === 'MUX') {
              inputs = ['', '', ''];
            } else {
              inputs = ['', ''];
            }
          }
          
          return {
            ...gate,
            inputs,
          } as Gate;
        });
        setLocalGates(formattedGates);
        setLocalWires(dataSource.galleryCircuit.wires);
      } catch (error) {
        handleError(
          error instanceof Error ? error : new Error('Circuit formatting failed'),
          'useUnifiedCanvas',
          {
            userAction: '回路フォーマット',
            severity: 'medium',
            showToUser: true,
          }
        );
      }
    }
  }, [config.mode, dataSource.galleryCircuit]);
  
  // 座標変換ユーティリティ
  const transform: CoordinateTransform = useMemo(() => {
    return {
      svgToScreen: (point) => ({
        x: (point.x - viewBox.x) * scale,
        y: (point.y - viewBox.y) * scale,
      }),
      screenToSvg: (point) => ({
        x: point.x / scale + viewBox.x,
        y: point.y / scale + viewBox.y,
      }),
      scale,
      offset: { x: viewBox.x, y: viewBox.y },
    };
  }, [viewBox, scale]);
  
  // ゲートクリック処理
  const handleGateClick = useCallback((gateId: string) => {
    try {
      const gate = displayGates.find(g => g.id === gateId);
      if (!gate) return;
      
      // ハンドラー呼び出し
      handlers?.onGateClick?.(gateId, gate);
      
      // 入力ゲートの場合は値を切り替え
      if (gate.type === 'INPUT' && config.interactionLevel !== 'view_only') {
        toggleInput(gateId);
      }
      
      // 選択機能が有効な場合
      if (config.editorOptions?.enableMultiSelection) {
        const newSelection = new Set(selectedIds);
        if (newSelection.has(gateId)) {
          newSelection.delete(gateId);
        } else {
          newSelection.add(gateId);
        }
        setSelectedIds(newSelection);
        handlers?.onSelectionChange?.(Array.from(newSelection));
      }
    } catch (error) {
      handleError(
        error instanceof Error ? error : new Error('Gate click failed'),
        'useUnifiedCanvas',
        {
          userAction: 'ゲートクリック',
          severity: 'low',
          showToUser: false,
        }
      );
    }
  }, [displayGates, handlers, config.interactionLevel, config.editorOptions?.enableMultiSelection, selectedIds]);
  
  // 入力ゲート値切り替え
  const toggleInput = useCallback((gateId: string): CanvasOperationResult => {
    try {
      if (config.simulationMode === 'store') {
        const gate = circuitStore.gates.find(g => g.id === gateId);
        if (gate && gate.type === 'INPUT') {
          // 入力ゲートの値を切り替え
          const newValue = !gate.output;
          circuitStore.updateGateOutput(gateId, newValue);
          handlers?.onInputToggle?.(gateId, newValue);
          return { success: true, data: undefined };
        }
      } else {
        setLocalGates(prevGates => {
          const newGates = prevGates.map(gate => {
            if (gate.id === gateId && gate.type === 'INPUT') {
              const newValue = !gate.output;
              handlers?.onInputToggle?.(gateId, newValue);
              return { ...gate, output: newValue };
            }
            return gate;
          });
          return newGates;
        });
        return { success: true, data: undefined };
      }
      
      return { success: false, error: 'Gate not found or not an input gate' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      handleError(
        error instanceof Error ? error : new Error(errorMessage),
        'useUnifiedCanvas',
        {
          userAction: '入力値切り替え',
          severity: 'medium',
          showToUser: true,
        }
      );
      return { success: false, error: errorMessage };
    }
  }, [config.simulationMode, circuitStore, handlers]);
  
  // アニメーション制御
  const startAnimation = useCallback(() => {
    if (config.mode !== 'gallery' || isAnimating) return;
    
    setIsAnimating(true);
    
    const animate = () => {
      try {
        if (evaluatorRef.current) {
          const circuit: Circuit = { gates: localGates, wires: localWires };
          const result = evaluatorRef.current.evaluate(circuit);
          
          // 評価結果をローカルゲートに反映
          setLocalGates([...result.circuit.gates]);
          setLocalWires([...result.circuit.wires]);
        }
        
        const interval = config.galleryOptions?.animationInterval ?? 1000;
        animationRef.current = window.setTimeout(() => {
          if (isAnimating) {
            animate();
          }
        }, interval);
      } catch (error) {
        handleError(
          error instanceof Error ? error : new Error('Animation failed'),
          'useUnifiedCanvas',
          {
            userAction: 'アニメーション実行',
            severity: 'medium',
            showToUser: false,
          }
        );
        setIsAnimating(false);
      }
    };
    
    animate();
  }, [config.mode, config.galleryOptions?.animationInterval, isAnimating, localGates, localWires]);
  
  const stopAnimation = useCallback(() => {
    setIsAnimating(false);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
  }, []);
  
  // 自動アニメーション開始
  useEffect(() => {
    if (config.galleryOptions?.autoSimulation && localGates.length > 0) {
      startAnimation();
    }
    
    return () => {
      stopAnimation();
    };
  }, [config.galleryOptions?.autoSimulation, localGates.length, startAnimation, stopAnimation]);
  
  // 機能フラグの計算
  const features = useMemo(() => ({
    canEdit: config.interactionLevel === 'full',
    canSelect: config.interactionLevel !== 'view_only' && (config.editorOptions?.enableMultiSelection ?? false),
    canZoom: config.interactionLevel !== 'view_only',
    canPan: config.interactionLevel !== 'view_only',
    showControls: config.uiControls?.showControls ?? true,
    showBackground: config.uiControls?.showBackground ?? true,
    autoSimulate: config.galleryOptions?.autoSimulation ?? false,
  }), [config]);
  
  // 内部状態の構築
  const state: CanvasInternalState = useMemo(() => ({
    displayGates,
    displayWires,
    viewBox,
    scale,
    selectedIds,
    mousePosition,
    isDragging,
    isPanning,
    isAnimating,
  }), [displayGates, displayWires, viewBox, scale, selectedIds, mousePosition, isDragging, isPanning, isAnimating]);
  
  return {
    svgRef,
    state,
    transform,
    actions: {
      handleGateClick,
      toggleInput,
      setZoom: setScale,
      setPan: (offset) => setViewBox(prev => ({ ...prev, x: offset.x, y: offset.y })),
      setSelection: (gateIds) => {
        const newSelection = new Set(gateIds);
        setSelectedIds(newSelection);
        handlers?.onSelectionChange?.(gateIds);
      },
      updateCircuit: (gates, wires) => {
        setLocalGates(gates);
        setLocalWires(wires);
      },
      startAnimation,
      stopAnimation,
    },
    features,
  };
}
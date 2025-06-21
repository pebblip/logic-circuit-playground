/**
 * 統一キャンバス管理Hook
 *
 * CLAUDE.md準拠: 継続的検証による信頼性確保
 * - Canvas.tsx と GalleryCanvas.tsx の機能統合
 * - モード別機能の動的切り替え
 * - 型安全な状態管理とエラーハンドリング
 */

import type React from 'react';
import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useCircuitStore } from '@/stores/circuitStore';
import { handleError } from '@/infrastructure/errorHandler';
import { EnhancedHybridEvaluator } from '@/domain/simulation/event-driven-minimal';
import { getGateInputValue } from '@/domain/simulation/signalConversion';
import {
  calculateCircuitBounds,
  calculateOptimalScale,
  calculateCenteringPan,
} from '../utils/circuitBounds';
import { autoLayoutCircuit } from '@/features/learning-mode/utils/autoLayout';
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
  const localGatesRef = useRef<Gate[]>([]);
  const localWiresRef = useRef<Wire[]>([]);
  const hasAutoFitRef = useRef(false); // 自動フィット済みフラグ

  // Zustandストア（エディターモード用）
  const circuitStore = useCircuitStore();
  const viewMode = useCircuitStore(state => state.viewMode);
  const previewingCustomGateId = useCircuitStore(
    state => state.previewingCustomGateId
  );
  const customGates = useCircuitStore(state => state.customGates);

  // ローカル状態（ギャラリーモード用）
  const [localGates, setLocalGates] = useState<Gate[]>([]);
  const [localWires, setLocalWires] = useState<Wire[]>([]);
  const [viewBox, setViewBox] = useState({
    x: 0,
    y: 0,
    width: 800,
    height: 600,
  });
  const [scale, setScale] = useState(config.galleryOptions?.initialScale ?? 1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [mousePosition] = useState({ x: 400, y: 300 });
  const [isDragging] = useState(false);
  const [isPanning] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // シミュレーターの初期化
  useEffect(() => {
    if (config.mode === 'gallery' || config.simulationMode === 'local') {
      // 🔧 重要: dataSource.galleryCircuitが存在しない場合は何もしない
      if (!dataSource.galleryCircuit) {
        if (config.galleryOptions?.showDebugInfo && import.meta.env.DEV) {
          console.warn('🚫 No gallery circuit available, skipping evaluator setup');
        }
        return;
      }
      
      // ギャラリーモードで循環依存があるかチェック
      const hasCircularDependency = (() => {
        // オシレーター回路の特定パターンを検出
        const circuitTitle = dataSource.galleryCircuit!.title || '';
        const isOscillatorCircuit = [
          'オシレータ',
          'オシレーター',
          'カオス',
          'フィボナッチ',
          'ジョンソン',
          'LFSR',
          'リング',
          'マンダラ',
          'メモリ',
        ].some(keyword => circuitTitle.includes(keyword));

        // オシレーター回路またはsimulationConfig.needsAnimationがある場合
        const isAnimationRequired =
          dataSource.galleryCircuit!.simulationConfig?.needsAnimation;

        return isOscillatorCircuit || isAnimationRequired;
      })();

      // 循環依存回路（オシレーター）は強制的にEVENT_DRIVEN使用
      const strategy = hasCircularDependency
        ? 'EVENT_DRIVEN_ONLY'
        : 'AUTO_SELECT';

      // デバッグログ（開発時の確認用）
      if (config.galleryOptions?.showDebugInfo && import.meta.env.DEV) {
        console.warn(`🔧 Gallery Simulation Strategy: ${strategy}`, {
          title: dataSource.galleryCircuit?.title,
          hasCircularDependency,
          needsAnimation:
            dataSource.galleryCircuit?.simulationConfig?.needsAnimation,
          // 🔍 詳細デバッグ情報
          circuitTitle: dataSource.galleryCircuit?.title,
          isOscillatorKeywordFound: dataSource.galleryCircuit ? [
            'オシレータ',
            'オシレーター', 
            'カオス',
            'フィボナッチ',
            'ジョンソン',
            'LFSR',
            'リング',
            'マンダラ',
            'メモリ',
          ].filter(keyword => dataSource.galleryCircuit!.title.includes(keyword)) : [],
          actualSimulationConfig: dataSource.galleryCircuit?.simulationConfig,
        });
      }

      // ギャラリーモードでは常に遅延モードを有効にする（オシレータ対応）
      evaluatorRef.current = new EnhancedHybridEvaluator({
        strategy,
        enableDebugLogging: config.galleryOptions?.showDebugInfo ?? false,
        delayMode: true, // オシレータ回路のために遅延モードを有効化
        autoSelectionThresholds: {
          maxGatesForLegacy: 20,
          minGatesForEventDriven: 5,
        },
        enablePerformanceTracking: false,
      });
    }

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [
    config.mode,
    config.simulationMode,
    config.galleryOptions?.showDebugInfo,
  ]);

  // データソースからゲート・ワイヤーを取得
  const { displayGates, displayWires } = useMemo(() => {
    try {
      // カスタムゲートプレビューモードの場合
      if (viewMode === 'custom-gate-preview' && previewingCustomGateId) {
        const customGate = customGates.find(
          g => g.id === previewingCustomGateId
        );
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

      // ギャラリーモード時: 動的localGatesが存在する場合はそれを優先、そうでなければ自動レイアウトを適用
      if (dataSource.galleryCircuit && config.mode === 'gallery') {
        // 🔧 重要: アニメーション中は動的に更新されるlocalGatesを使用
        if (localGates.length > 0) {
          return {
            displayGates: localGates, // 🎯 動的データを使用
            displayWires: localWires,
          };
        }
        
        // 初期ロード時のみ自動レイアウトを適用
        const autoLayoutGates = autoLayoutCircuit(
          dataSource.galleryCircuit.gates,
          dataSource.galleryCircuit.wires,
          {
            padding: 80,
            gateSpacing: { x: 160, y: 100 },
            layerWidth: 180,
            preferredWidth: 1000,
            preferredHeight: 600,
          }
        );
        return {
          displayGates: autoLayoutGates,
          displayWires: dataSource.galleryCircuit.wires,
        };
      }

      // 非ギャラリーモード時: 元のレイアウトを使用
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
    config.mode,
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
  const [currentGalleryCircuitId, setCurrentGalleryCircuitId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (config.mode === 'gallery' && dataSource.galleryCircuit) {
      // 同じ回路が既に読み込まれている場合はスキップ
      if (currentGalleryCircuitId === dataSource.galleryCircuit.id) {
        return;
      }

      setCurrentGalleryCircuitId(dataSource.galleryCircuit.id);

      // 自動フィットフラグをリセット（新しい回路用）
      hasAutoFitRef.current = false;

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

          // CLOCKゲートのstartTimeを安定化（一度設定したら変更しない）+ isRunning強制有効化
          if (gate.type === 'CLOCK' && gate.metadata) {
            const needsStartTime = gate.metadata.startTime === undefined;
            return {
              ...gate,
              inputs,
              metadata: {
                ...gate.metadata,
                startTime: needsStartTime
                  ? Date.now()
                  : gate.metadata.startTime, // 🔧 既存のstartTimeを保持
                isRunning: true, // 🔧 強制的にisRunning=trueに設定
                frequency: gate.metadata.frequency || 2, // デフォルト2Hz
              },
            } as Gate;
          }

          return {
            ...gate,
            inputs,
          } as Gate;
        });
        setLocalGates(formattedGates);
        setLocalWires(dataSource.galleryCircuit.wires);
        localGatesRef.current = formattedGates;
        localWiresRef.current = dataSource.galleryCircuit.wires;
      } catch (error) {
        handleError(
          error instanceof Error
            ? error
            : new Error('Circuit formatting failed'),
          'useUnifiedCanvas',
          {
            userAction: '回路フォーマット',
            severity: 'medium',
            showToUser: true,
          }
        );
      }
    }
  }, [config.mode, dataSource.galleryCircuit, currentGalleryCircuitId]);

  // localGates/localWiresが更新されたらRefも更新
  useEffect(() => {
    localGatesRef.current = localGates;
    localWiresRef.current = localWires;
  }, [localGates, localWires]);

  // 座標変換ユーティリティ
  const transform: CoordinateTransform = useMemo(() => {
    return {
      svgToScreen: point => ({
        x: (point.x - viewBox.x) * scale,
        y: (point.y - viewBox.y) * scale,
      }),
      screenToSvg: point => ({
        x: point.x / scale + viewBox.x,
        y: point.y / scale + viewBox.y,
      }),
      scale,
      offset: { x: viewBox.x, y: viewBox.y },
    };
  }, [viewBox, scale]);

  // 入力ゲート値切り替え
  const toggleInput = useCallback(
    (gateId: string): CanvasOperationResult => {
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
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
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
    },
    [config.simulationMode, circuitStore, handlers]
  );

  // ゲートクリック処理
  const handleGateClick = useCallback(
    (gateId: string) => {
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
    },
    [
      displayGates,
      handlers,
      config.interactionLevel,
      config.editorOptions?.enableMultiSelection,
      selectedIds,
      toggleInput,
    ]
  );

  // アニメーション制御
  const startAnimation = useCallback(() => {
    if (config.mode !== 'gallery') return;

    if (config.galleryOptions?.showDebugInfo && import.meta.env.DEV) {
      console.warn('🎬 startAnimation called for gallery mode');
    }

    // 既存のアニメーションをクリア
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }

    setIsAnimating(true);

    if (config.galleryOptions?.showDebugInfo && import.meta.env.DEV) {
      console.warn('🎯 Animation state set to true');
    }

    // 🔧 CLOCK周波数に基づく動的間隔計算（メモ化）
    let cachedInterval: number | null = null;
    const calculateOptimalInterval = (): number => {
      if (cachedInterval !== null) return cachedInterval;

      const clockGates = localGatesRef.current.filter(g => g.type === 'CLOCK');
      if (clockGates.length === 0) {
        cachedInterval = config.galleryOptions?.animationInterval ?? 1000;
        return cachedInterval;
      }

      // 最高周波数のCLOCKを見つける
      const maxFrequency = Math.max(
        ...clockGates.map(g => g.metadata?.frequency || 1)
      );

      // 最高周波数のCLOCKの半周期の1/4を間隔とする（スムーズな更新のため）
      cachedInterval = Math.max(50, 1000 / maxFrequency / 8);
      return cachedInterval;
    };

    const animate = () => {
      try {
        // 🔧 重要: アニメーション継続中かどうかは animationRef で判定
        const isActuallyAnimating = !!animationRef.current;
        
        if (config.galleryOptions?.showDebugInfo && import.meta.env.DEV) {
          console.warn('🔄 Animation loop executing...', {
            hasEvaluator: !!evaluatorRef.current,
            gateCount: localGatesRef.current.length,
            isAnimating,
            animationRefExists: !!animationRef.current,
            isActuallyAnimating,
            shouldContinue: isActuallyAnimating,
          });
        }

        // 🔧 重要: evaluatorが存在しない場合は動的に作成
        if (!evaluatorRef.current) {
          if (config.galleryOptions?.showDebugInfo && import.meta.env.DEV) {
            console.warn('🚨 Evaluator missing! Creating dynamically...');
          }
          
          // evaluatorを動的に作成（シンプルリングオシレータ用の設定）
          evaluatorRef.current = new EnhancedHybridEvaluator({
            strategy: 'EVENT_DRIVEN_ONLY', // ギャラリーモードでは安全にEVENT_DRIVEN_ONLY
            enableDebugLogging: true, // 🔍 一時的に強制有効化してワイヤー伝達を確認
            delayMode: true, // オシレータ回路のために遅延モードを有効化
            autoSelectionThresholds: {
              maxGatesForLegacy: 20,
              minGatesForEventDriven: 5,
            },
            enablePerformanceTracking: false,
          });
        }

        if (evaluatorRef.current && localGatesRef.current.length > 0) {
          const circuit: Circuit = {
            gates: localGatesRef.current,
            wires: localWiresRef.current,
          };
          const result = evaluatorRef.current.evaluate(circuit);

          if (config.galleryOptions?.showDebugInfo && import.meta.env.DEV) {
            console.warn('📊 Evaluation result:', {
              gateOutputs: result.circuit.gates.map(g => ({
                id: g.id,
                type: g.type,
                output: g.output,
                inputs: g.inputs,
              })),
              // 🔍 OUTPUTゲート専用デバッグ
              outputGatesDetail: result.circuit.gates
                .filter(g => g.type === 'OUTPUT')
                .map(g => {
                  const inputValue = getGateInputValue(g, 0);
                  return {
                    id: g.id,
                    inputs: g.inputs,
                    inputValue0: g.inputs[0],
                    inputValueType: typeof g.inputs[0],
                    shouldLight: g.inputs[0] === '1' || g.inputs[0] === 'true',
                    // 🔍 getGateInputValue関数の実際の値も確認
                    getGateInputValueResult: inputValue,
                    // 🚨 重要: displayStateToBoolean関数の直接結果
                    displayStateToBooleanResult: typeof g.inputs[0] === 'string' ? (g.inputs[0] === '1' || g.inputs[0] === 'true') : g.inputs[0],
                    rawInput0Value: JSON.stringify(g.inputs[0]), // 実際の値をJSON形式で確認
                  };
                }),
              // 🚨 CRITICAL: 実際のdisplayGatesの状態確認
              actualDisplayGates: displayGates
                .filter(g => g.type === 'OUTPUT')
                .map(g => ({
                  id: g.id,
                  inputs: g.inputs,
                  inputValue0: g.inputs[0],
                  getGateInputValueResult: getGateInputValue(g, 0),
                  rawInput0Value: JSON.stringify(g.inputs[0]),
                })),
              // 🚨 BEFORE vs AFTER 比較
              comparisonOldVsNew: result.circuit.gates
                .filter(g => g.type === 'OUTPUT')
                .map(newGate => {
                  const oldGate = localGatesRef.current.find(old => old.id === newGate.id);
                  return {
                    id: newGate.id,
                    old: oldGate ? { inputs: oldGate.inputs, output: oldGate.output } : 'not found',
                    new: { inputs: newGate.inputs, output: newGate.output },
                    inputsChanged: oldGate ? oldGate.inputs[0] !== newGate.inputs[0] : 'no old gate',
                  };
                }),
            });
          }

          // 評価結果をローカルゲートに反映
          const newGates = result.circuit.gates.map(newGate => {
            const oldGate = localGatesRef.current.find(
              g => g.id === newGate.id
            );

            // CLOCKゲートのisRunning状態を強制維持
            if (newGate.type === 'CLOCK') {
              return {
                ...newGate,
                metadata: {
                  ...newGate.metadata,
                  isRunning: true, // 🔧 常にtrue
                  frequency: newGate.metadata?.frequency || 2,
                },
              };
            }

            // D-FFメタデータを保持（特にpreviousClockState）
            if (oldGate && newGate.type === 'D-FF' && newGate.metadata) {
              return newGate;
            }

            return newGate;
          });
          const newWires = [...result.circuit.wires];

          // 状態変化を検出（outputとinputsの両方をチェック）
          const hasChanges = newGates.some((newGate, index) => {
            const oldGate = localGatesRef.current[index];
            if (!oldGate) return true;
            
            // outputの変化をチェック
            if (oldGate.output !== newGate.output) return true;
            
            // inputsの変化をチェック（特にOUTPUTゲート用）
            if (newGate.type === 'OUTPUT' && oldGate.inputs.length > 0 && newGate.inputs.length > 0) {
              return oldGate.inputs[0] !== newGate.inputs[0];
            }
            
            return false;
          });

          // 🔧 パフォーマンス改善: 変化があった場合のみ更新
          if (hasChanges) {
            if (config.galleryOptions?.showDebugInfo && import.meta.env.DEV) {
              console.warn('🔄 React state update triggered:', {
                changedGates: newGates
                  .filter((g, i) => {
                    const old = localGatesRef.current[i];
                    return old && old.output !== g.output;
                  })
                  .map(g => ({ id: g.id, output: g.output })),
                // 🔍 OUTPUTゲート更新状況も確認
                outputGatesAfterUpdate: newGates
                  .filter(g => g.type === 'OUTPUT')
                  .map(g => ({
                    id: g.id,
                    inputs: g.inputs,
                    inputValue0: g.inputs[0],
                    getGateInputValueResult: getGateInputValue(g, 0),
                    shouldRenderAsLit: getGateInputValue(g, 0),
                  })),
                // 🚨 CRITICAL: 実際にReactで表示されるdisplayGatesとの比較
                displayGatesComparison: newGates
                  .filter(g => g.type === 'OUTPUT')
                  .map(g => {
                    // displayGatesから同じIDのゲートを探す
                    const displayGate = displayGates.find(dg => dg.id === g.id);
                    return {
                      id: g.id,
                      simulationGate: { inputs: g.inputs, output: g.output },
                      displayGate: displayGate ? { inputs: displayGate.inputs, output: displayGate.output } : 'not found',
                      areIdentical: displayGate ? JSON.stringify(g.inputs) === JSON.stringify(displayGate.inputs) : false,
                    };
                  }),
              });
            }
            setLocalGates(newGates);
            setLocalWires(newWires);
          } else if (
            config.galleryOptions?.showDebugInfo &&
            import.meta.env.DEV
          ) {
            console.warn('⏸️ No changes detected, skipping React state update');
          }

          // Refは常に更新（次回の比較のため）
          localGatesRef.current = newGates;
          localWiresRef.current = newWires;
        }

        // 🔧 動的間隔計算
        const interval = calculateOptimalInterval();

        animationRef.current = window.setTimeout(() => {
          animate();
        }, interval);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('💥 [Gallery Animation] エラー発生:', error);
        }
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
  }, [config.mode, config.galleryOptions?.animationInterval]);

  const stopAnimation = useCallback(() => {
    setIsAnimating(false);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  // 自動フィット機能
  useEffect(() => {
    if (
      config.galleryOptions?.autoFit &&
      config.mode === 'gallery' &&
      dataSource.galleryCircuit &&
      localGates.length > 0 &&
      !hasAutoFitRef.current
    ) {
      // 回路の境界を計算
      const bounds = calculateCircuitBounds(localGates);

      // キャンバスサイズ（デフォルト値使用）
      const canvasSize = { width: 1200, height: 800 };

      // 最適なスケールを計算
      const optimalScale = calculateOptimalScale(
        bounds,
        canvasSize,
        config.galleryOptions.autoFitPadding || 100
      );

      // 中央配置のためのパン値を計算
      const pan = calculateCenteringPan(bounds, canvasSize, optimalScale);

      // スケールとビューボックスを設定
      const newViewBox = {
        x: -pan.x / optimalScale,
        y: -pan.y / optimalScale,
        width: canvasSize.width / optimalScale,
        height: canvasSize.height / optimalScale,
      };

      setScale(optimalScale);
      setViewBox(newViewBox);

      // 自動フィット済みフラグを設定
      hasAutoFitRef.current = true;
    }
  }, [
    config.galleryOptions?.autoFit,
    config.galleryOptions?.autoFitPadding,
    config.mode,
    dataSource.galleryCircuit,
    dataSource.galleryCircuit?.id,
    localGates,
  ]);

  // 自動アニメーション開始
  useEffect(() => {
    if (config.galleryOptions?.showDebugInfo && import.meta.env.DEV) {
      console.warn('🎬 Auto-animation check:', {
        autoSimulation: config.galleryOptions?.autoSimulation,
        mode: config.mode,
        hasGalleryCircuit: !!dataSource.galleryCircuit,
        circuitTitle: dataSource.galleryCircuit?.title,
        localGatesCount: localGates.length,
        evaluatorExists: !!evaluatorRef.current,
      });
    }

    if (
      config.galleryOptions?.autoSimulation &&
      config.mode === 'gallery' &&
      dataSource.galleryCircuit &&
      localGates.length > 0 // ⚡ localGatesが準備できてからアニメーション開始
    ) {
      if (config.galleryOptions?.showDebugInfo && import.meta.env.DEV) {
        console.warn(
          '🚀 Starting auto-animation for:',
          dataSource.galleryCircuit.title
        );
      }

      // 新しい回路が選択されたときはアニメーションをリセット
      stopAnimation();

      // 少し遅延させてからアニメーションを開始
      const timer = setTimeout(() => {
        if (config.galleryOptions?.showDebugInfo && import.meta.env.DEV) {
          console.warn(
            '🎬 Animation timer triggered, calling startAnimation...'
          );
        }
        startAnimation();
      }, 200);

      return () => {
        clearTimeout(timer);
        stopAnimation();
      };
    }

    return () => {
      stopAnimation();
    };
  }, [
    config.galleryOptions?.autoSimulation,
    config.mode,
    dataSource.galleryCircuit,
    dataSource.galleryCircuit?.id,
    localGates.length, // ⚡ localGatesの準備完了を監視
    startAnimation,
    stopAnimation,
  ]);

  // 機能フラグの計算
  const features = useMemo(
    () => ({
      canEdit: config.interactionLevel === 'full',
      canSelect:
        config.interactionLevel !== 'view_only' &&
        (config.editorOptions?.enableMultiSelection ?? false),
      canZoom: config.interactionLevel !== 'view_only',
      canPan: config.interactionLevel !== 'view_only',
      showControls: config.uiControls?.showControls ?? true,
      showBackground: config.uiControls?.showBackground ?? true,
      autoSimulate: config.galleryOptions?.autoSimulation ?? false,
    }),
    [config]
  );

  // 内部状態の構築
  const state: CanvasInternalState = useMemo(
    () => ({
      displayGates,
      displayWires,
      viewBox,
      scale,
      selectedIds,
      mousePosition,
      isDragging,
      isPanning,
      isAnimating,
    }),
    [
      displayGates,
      displayWires,
      viewBox,
      scale,
      selectedIds,
      mousePosition,
      isDragging,
      isPanning,
      isAnimating,
    ]
  );

  return {
    svgRef,
    state,
    transform,
    actions: {
      handleGateClick,
      toggleInput,
      setZoom: setScale,
      setPan: offset =>
        setViewBox(prev => ({ ...prev, x: offset.x, y: offset.y })),
      setSelection: gateIds => {
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

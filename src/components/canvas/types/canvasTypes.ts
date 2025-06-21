/**
 * 統一キャンバスシステムの型定義
 * 
 * CLAUDE.md準拠: データ・ロジック統合原則
 * - Canvas.tsx と GalleryCanvas.tsx の統合基盤
 * - モード別機能の型安全な分離
 * - 段階的移行による安全性確保
 */

import type { Gate, Wire } from '@/types/circuit';
import type { CircuitMetadata } from '@/features/gallery/data/gallery';

/**
 * キャンバス動作モード
 * 
 * - editor: フル機能エディターモード（既存Canvas.tsx相当）
 * - gallery: ギャラリービューアーモード（既存GalleryCanvas.tsx相当）
 * - preview: プレビューモード（将来拡張用）
 */
export type CanvasMode = 'editor' | 'gallery' | 'preview';

/**
 * インタラクション機能レベル
 * 
 * - full: 全機能（編集、選択、ドラッグ、ズーム、パン）
 * - view_interactive: 表示＋基本操作（ズーム、パン、入力ゲートクリック）
 * - view_only: 表示のみ
 */
export type InteractionLevel = 'full' | 'view_interactive' | 'view_only';

/**
 * シミュレーション統合方式
 * 
 * - store: Zustandストア経由（既存Canvas.tsx方式）
 * - local: ローカル状態管理（既存GalleryCanvas.tsx方式）
 * - hybrid: 状況に応じた自動選択
 */
export type SimulationMode = 'store' | 'local' | 'hybrid';

/**
 * 統一キャンバス設定
 */
export interface CanvasConfig {
  /** 動作モード */
  mode: CanvasMode;
  
  /** インタラクション機能レベル */
  interactionLevel: InteractionLevel;
  
  /** シミュレーション統合方式 */
  simulationMode: SimulationMode;
  
  /** ギャラリーモード専用設定 */
  galleryOptions?: {
    /** 自動シミュレーション実行 */
    autoSimulation?: boolean;
    
    /** アニメーション更新間隔（ms） */
    animationInterval?: number;
    
    /** デバッグ情報表示 */
    showDebugInfo?: boolean;
    
    /** 初期スケール */
    initialScale?: number;
    
    /** 自動フィット機能 */
    autoFit?: boolean;
    
    /** 自動フィット時のパディング */
    autoFitPadding?: number;
  };
  
  /** エディターモード専用設定 */
  editorOptions?: {
    /** タイミングチャート連携 */
    enableTimingChart?: boolean;
    
    /** 複数選択機能 */
    enableMultiSelection?: boolean;
    
    /** グリッドスナップ */
    enableGridSnap?: boolean;
    
    /** ゲート追加機能 */
    enableGateAddition?: boolean;
  };
  
  /** プレビューモード専用設定 */
  previewOptions?: {
    /** カスタムゲート名 */
    customGateName?: string;
    
    /** 読み取り専用モード */
    readOnly?: boolean;
  };
  
  /** UI制御 */
  uiControls?: {
    /** コントロールパネル表示 */
    showControls?: boolean;
    
    /** プレビューヘッダー表示 */
    showPreviewHeader?: boolean;
    
    /** 背景グリッド表示 */
    showBackground?: boolean;
  };
}

/**
 * キャンバスデータソース
 */
export interface CanvasDataSource {
  /** エディターモード: Zustandストアから取得 */
  store?: boolean;
  
  /** ギャラリーモード: 直接データ指定 */
  galleryCircuit?: CircuitMetadata;
  
  /** カスタムデータ: 直接ゲート・ワイヤー指定 */
  customData?: {
    gates: Gate[];
    wires: Wire[];
  };
}

/**
 * キャンバスイベントハンドラー
 */
export interface CanvasEventHandlers {
  /** ゲートクリック */
  onGateClick?: (gateId: string, gate: Gate) => void;
  
  /** 入力ゲート値変更 */
  onInputToggle?: (gateId: string, newValue: boolean) => void;
  
  /** ワイヤークリック */
  onWireClick?: (wireId: string, wire: Wire) => void;
  
  /** キャンバスクリック（空白部分） */
  onCanvasClick?: (position: { x: number; y: number }) => void;
  
  /** 選択変更 */
  onSelectionChange?: (selectedIds: string[]) => void;
  
  /** ズーム変更 */
  onZoomChange?: (scale: number) => void;
  
  /** ビューボックス変更 */
  onViewChange?: (viewBox: { x: number; y: number; width: number; height: number }) => void;
  
  /** プレビューモード終了 */
  onExitPreview?: () => void;
  
  /** エラー発生 */
  onError?: (error: Error, context: string) => void;
}

/**
 * 統一キャンバスProps
 */
export interface UnifiedCanvasProps {
  /** キャンバス設定 */
  config: CanvasConfig;
  
  /** データソース */
  dataSource: CanvasDataSource;
  
  /** イベントハンドラー */
  handlers?: CanvasEventHandlers;
  
  /** 既存Canvas.tsx互換性 */
  highlightedGateId?: string | null;
  
  /** CSS className */
  className?: string;
  
  /** CSS styles */
  style?: React.CSSProperties;
}

/**
 * モード別プリセット設定
 */
export const CANVAS_MODE_PRESETS: Record<CanvasMode, CanvasConfig> = {
  editor: {
    mode: 'editor',
    interactionLevel: 'full',
    simulationMode: 'store',
    editorOptions: {
      enableTimingChart: true,
      enableMultiSelection: true,
      enableGridSnap: true,
      enableGateAddition: true,
    },
    uiControls: {
      showControls: true,
      showPreviewHeader: false,
      showBackground: true,
    },
  },
  
  gallery: {
    mode: 'gallery',
    interactionLevel: 'view_interactive',
    simulationMode: 'local',
    galleryOptions: {
      autoSimulation: true,
      animationInterval: 1000,
      showDebugInfo: false,
      initialScale: 0.7,
      autoFit: true, // 自動フィット有効化
      autoFitPadding: 80, // 80pxの余白
    },
    uiControls: {
      showControls: true,
      showPreviewHeader: false,
      showBackground: false,
    },
  },
  
  preview: {
    mode: 'preview',
    interactionLevel: 'view_only',
    simulationMode: 'local',
    previewOptions: {
      customGateName: 'カスタムゲート',
      readOnly: true,
    },
    uiControls: {
      showControls: false,
      showPreviewHeader: true,
      showBackground: true,
    },
  },
};

/**
 * デフォルト設定
 */
export const DEFAULT_CANVAS_CONFIG: CanvasConfig = CANVAS_MODE_PRESETS.editor;

/**
 * キャンバス状態管理の内部型
 */
export interface CanvasInternalState {
  /** 表示用ゲート */
  displayGates: Gate[];
  
  /** 表示用ワイヤー */
  displayWires: Wire[];
  
  /** ビューボックス */
  viewBox: { x: number; y: number; width: number; height: number };
  
  /** ズームスケール */
  scale: number;
  
  /** 選択されたアイテム */
  selectedIds: Set<string>;
  
  /** マウス位置 */
  mousePosition: { x: number; y: number };
  
  /** ドラッグ状態 */
  isDragging: boolean;
  
  /** パン状態 */
  isPanning: boolean;
  
  /** アニメーション状態 */
  isAnimating: boolean;
}

/**
 * キャンバス操作の結果型
 */
export type CanvasOperationResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string; context?: string };

/**
 * 座標変換用ヘルパー型
 */
export interface CoordinateTransform {
  /** SVG座標からスクリーン座標 */
  svgToScreen: (point: { x: number; y: number }) => { x: number; y: number };
  
  /** スクリーン座標からSVG座標 */
  screenToSvg: (point: { x: number; y: number }) => { x: number; y: number };
  
  /** 現在のスケール */
  scale: number;
  
  /** 現在のオフセット */
  offset: { x: number; y: number };
}
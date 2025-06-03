import React, { useState, useCallback } from 'react';

/**
 * ダイアログ状態管理フック
 * 
 * 複数箇所で重複していたダイアログのオープン・クローズ・データ管理を統一し、
 * 一貫性と保守性を向上させるユーティリティ
 */

/**
 * ダイアログの設定オプション
 */
interface DialogOptions<T> {
  /** ダイアログオープン時の初期データ */
  initialData?: T;
  /** オープン時のコールバック */
  onOpen?: (data?: T) => void;
  /** クローズ時のコールバック */
  onClose?: (data?: T | null) => void;
  /** データリセット時のコールバック */
  onReset?: () => void;
  /** オープン後の自動クローズタイマー（ミリ秒） */
  autoCloseMs?: number;
}

/**
 * ダイアログの状態と操作メソッド
 */
interface DialogState<T> {
  /** ダイアログが開いているかどうか */
  isOpen: boolean;
  /** ダイアログに関連するデータ */
  data: T | null;
  /** ダイアログを開く */
  open: (initialData?: T) => void;
  /** ダイアログを閉じる */
  close: () => void;
  /** ダイアログの開閉を切り替える */
  toggle: (initialData?: T) => void;
  /** データを更新する（ダイアログが開いている状態で） */
  updateData: (newData: T | ((prevData: T | null) => T)) => void;
  /** データをリセットする */
  resetData: () => void;
  /** ダイアログ状態を完全にリセット */
  reset: () => void;
}

/**
 * 単一のダイアログを管理するフック
 * 
 * @template T - ダイアログに関連するデータの型
 * @param options - ダイアログの設定オプション
 * @returns ダイアログの状態と操作メソッド
 * 
 * @example
 * ```typescript
 * // 基本的な使用例
 * const saveDialog = useDialog({
 *   onOpen: () => console.log('Save dialog opened'),
 *   onClose: () => console.log('Save dialog closed')
 * });
 * 
 * // データ付きの使用例
 * interface TruthTableData {
 *   gateId: string;
 *   gateType: string;
 * }
 * 
 * const truthTableDialog = useDialog<TruthTableData>({
 *   initialData: null,
 *   onOpen: (data) => console.log('Truth table opened for:', data?.gateType),
 *   onClose: () => console.log('Truth table closed')
 * });
 * 
 * // 使用方法
 * <button onClick={() => saveDialog.open()}>Save</button>
 * <SaveDialog 
 *   isOpen={saveDialog.isOpen} 
 *   onClose={saveDialog.close} 
 * />
 * 
 * <button onClick={() => truthTableDialog.open({ gateId: 'gate-1', gateType: 'AND' })}>
 *   Show Truth Table
 * </button>
 * <TruthTableDialog 
 *   isOpen={truthTableDialog.isOpen} 
 *   onClose={truthTableDialog.close}
 *   data={truthTableDialog.data}
 * />
 * ```
 */
export function useDialog<T = any>(options: DialogOptions<T> = {}): DialogState<T> {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | null>(options.initialData || null);
  const [autoCloseTimer, setAutoCloseTimer] = useState<NodeJS.Timeout | null>(null);

  const open = useCallback((initialData?: T) => {
    setIsOpen(true);
    
    if (initialData !== undefined) {
      setData(initialData);
    }
    
    // オープン時のコールバック実行
    options.onOpen?.(initialData || data || undefined);
    
    // 自動クローズタイマーの設定
    if (options.autoCloseMs) {
      const timer = setTimeout(() => {
        setIsOpen(false);
        options.onClose?.(data ?? null);
      }, options.autoCloseMs);
      setAutoCloseTimer(timer);
    }
  }, [data, options]);

  const close = useCallback(() => {
    setIsOpen(false);
    
    // 自動クローズタイマーのクリア
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      setAutoCloseTimer(null);
    }
    
    // クローズ時のコールバック実行
    options.onClose?.(data ?? null);
  }, [data, options, autoCloseTimer]);

  const toggle = useCallback((initialData?: T) => {
    if (isOpen) {
      close();
    } else {
      open(initialData);
    }
  }, [isOpen, open, close]);

  const updateData = useCallback((newData: T | ((prevData: T | null) => T)) => {
    if (typeof newData === 'function') {
      setData(prevData => (newData as (prevData: T | null) => T)(prevData));
    } else {
      setData(newData);
    }
  }, []);

  const resetData = useCallback(() => {
    setData(options.initialData || null);
    options.onReset?.();
  }, [options]);

  const reset = useCallback(() => {
    setIsOpen(false);
    setData(options.initialData || null);
    
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      setAutoCloseTimer(null);
    }
    
    options.onReset?.();
  }, [options, autoCloseTimer]);

  return {
    isOpen,
    data,
    open,
    close,
    toggle,
    updateData,
    resetData,
    reset
  };
}

/**
 * 複数のダイアログを管理するフック
 * 
 * @param dialogConfigs - 各ダイアログの設定
 * @returns 各ダイアログの状態と操作メソッドのマップ
 * 
 * @example
 * ```typescript
 * const dialogs = useMultipleDialogs({
 *   save: { onOpen: () => console.log('Save opened') },
 *   load: { onOpen: () => console.log('Load opened') },
 *   export: { onOpen: () => console.log('Export opened') }
 * });
 * 
 * // 使用方法
 * <button onClick={() => dialogs.save.open()}>Save</button>
 * <button onClick={() => dialogs.load.open()}>Load</button>
 * <button onClick={() => dialogs.export.open()}>Export</button>
 * 
 * <SaveDialog isOpen={dialogs.save.isOpen} onClose={dialogs.save.close} />
 * <LoadDialog isOpen={dialogs.load.isOpen} onClose={dialogs.load.close} />
 * <ExportDialog isOpen={dialogs.export.isOpen} onClose={dialogs.export.close} />
 * ```
 */
export function useMultipleDialogs<T extends Record<string, DialogOptions<any>>>(
  dialogConfigs: T
): {
  [K in keyof T]: DialogState<T[K] extends DialogOptions<infer U> ? U : any>
} {
  const dialogs = {} as any;
  
  for (const [key, config] of Object.entries(dialogConfigs)) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    dialogs[key] = useDialog(config);
  }
  
  return dialogs;
}

/**
 * モーダルダイアログ専用のフック（ESCキー対応）
 * 
 * @param options - ダイアログの設定オプション + モーダル固有設定
 * @returns ダイアログの状態と操作メソッド + モーダル固有機能
 * 
 * @example
 * ```typescript
 * const modal = useModalDialog({
 *   closeOnEscape: true,
 *   closeOnBackdropClick: true,
 *   onOpen: () => console.log('Modal opened')
 * });
 * 
 * // ESCキーでモーダルが自動的に閉じる
 * ```
 */
export function useModalDialog<T = any>(
  options: DialogOptions<T> & {
    closeOnEscape?: boolean;
    closeOnBackdropClick?: boolean;
  } = {}
): DialogState<T> & {
  handleEscapeKey: (event: KeyboardEvent) => void;
  handleBackdropClick: (event: React.MouseEvent) => void;
} {
  const dialog = useDialog<T>(options);

  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && options.closeOnEscape !== false) {
      dialog.close();
    }
  }, [dialog, options.closeOnEscape]);

  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget && options.closeOnBackdropClick !== false) {
      dialog.close();
    }
  }, [dialog, options.closeOnBackdropClick]);

  // ESCキーのイベントリスナーを設定
  React.useEffect(() => {
    if (dialog.isOpen && options.closeOnEscape !== false) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [dialog.isOpen, handleEscapeKey, options.closeOnEscape]);

  return {
    ...dialog,
    handleEscapeKey,
    handleBackdropClick
  };
}

/**
 * データ付きダイアログの型安全なヘルパー
 */
export type DialogWithData<T> = DialogState<T> & {
  /** データが存在する場合のみ実行される安全なオープン */
  openWithData: (data: T) => void;
  /** データが存在するかどうか */
  hasData: boolean;
};

/**
 * 必ずデータが必要なダイアログ用のフック
 * 
 * @param options - ダイアログの設定オプション
 * @returns データ付きダイアログの状態と操作メソッド
 */
export function useDataDialog<T>(options: DialogOptions<T> = {}): DialogWithData<T> {
  const dialog = useDialog<T>(options);
  
  const openWithData = useCallback((data: T) => {
    dialog.open(data);
  }, [dialog]);
  
  const hasData = dialog.data !== null && dialog.data !== undefined;
  
  return {
    ...dialog,
    openWithData,
    hasData
  };
}
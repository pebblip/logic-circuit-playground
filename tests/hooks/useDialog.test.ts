import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDialog, useMultipleDialogs, useModalDialog, useDataDialog } from '@/hooks/useDialog';

// タイマーのモック
vi.useFakeTimers();

describe('統一ダイアログ状態管理フック', () => {
  beforeEach(() => {
    vi.clearAllTimers();
  });

  describe('useDialog', () => {
    it('初期状態が正しく設定される', () => {
      const { result } = renderHook(() => useDialog());

      expect(result.current.isOpen).toBe(false);
      expect(result.current.data).toBeNull();
    });

    it('初期データありで初期化できる', () => {
      const initialData = { test: 'value' };
      const { result } = renderHook(() => useDialog({ initialData }));

      expect(result.current.data).toBe(initialData);
    });

    it('ダイアログを開くことができる', () => {
      const onOpen = vi.fn();
      const { result } = renderHook(() => useDialog({ onOpen }));

      act(() => {
        result.current.open();
      });

      expect(result.current.isOpen).toBe(true);
      expect(onOpen).toHaveBeenCalledWith(undefined);
    });

    it('データ付きでダイアログを開くことができる', () => {
      const onOpen = vi.fn();
      const testData = { id: 1, name: 'test' };
      const { result } = renderHook(() => useDialog({ onOpen }));

      act(() => {
        result.current.open(testData);
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.data).toBe(testData);
      expect(onOpen).toHaveBeenCalledWith(testData);
    });

    it('ダイアログを閉じることができる', () => {
      const onClose = vi.fn();
      const { result } = renderHook(() => useDialog({ onClose }));

      act(() => {
        result.current.open();
      });

      act(() => {
        result.current.close();
      });

      expect(result.current.isOpen).toBe(false);
      expect(onClose).toHaveBeenCalledWith(null);
    });

    it('トグル機能が正しく動作する', () => {
      const { result } = renderHook(() => useDialog());

      act(() => {
        result.current.toggle();
      });
      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.toggle();
      });
      expect(result.current.isOpen).toBe(false);
    });

    it('データを更新できる', () => {
      const { result } = renderHook(() => useDialog<{ count: number }>());

      act(() => {
        result.current.updateData({ count: 1 });
      });
      expect(result.current.data).toEqual({ count: 1 });

      act(() => {
        result.current.updateData(prev => ({ count: (prev?.count || 0) + 1 }));
      });
      expect(result.current.data).toEqual({ count: 2 });
    });

    it('データをリセットできる', () => {
      const onReset = vi.fn();
      const initialData = { test: 'initial' };
      const { result } = renderHook(() => useDialog({ initialData, onReset }));

      act(() => {
        result.current.updateData({ test: 'updated' });
      });
      expect(result.current.data).toEqual({ test: 'updated' });

      act(() => {
        result.current.resetData();
      });
      expect(result.current.data).toBe(initialData);
      expect(onReset).toHaveBeenCalled();
    });

    it('完全にリセットできる', () => {
      const onReset = vi.fn();
      const { result } = renderHook(() => useDialog({ onReset }));

      act(() => {
        result.current.open({ test: 'data' });
      });
      expect(result.current.isOpen).toBe(true);
      expect(result.current.data).toEqual({ test: 'data' });

      act(() => {
        result.current.reset();
      });
      expect(result.current.isOpen).toBe(false);
      expect(result.current.data).toBeNull();
      expect(onReset).toHaveBeenCalled();
    });

    it('自動クローズタイマーが動作する', () => {
      const onClose = vi.fn();
      const { result } = renderHook(() => useDialog({
        autoCloseMs: 1000,
        onClose
      }));

      act(() => {
        result.current.open();
      });
      expect(result.current.isOpen).toBe(true);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.isOpen).toBe(false);
      expect(onClose).toHaveBeenCalled();
    });

    it('手動でクローズすると自動クローズタイマーがクリアされる', () => {
      const onClose = vi.fn();
      const { result } = renderHook(() => useDialog({
        autoCloseMs: 1000,
        onClose
      }));

      act(() => {
        result.current.open();
      });

      act(() => {
        result.current.close();
      });

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // onCloseは手動クローズ時の1回のみ呼ばれるべき
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('useMultipleDialogs', () => {
    it('複数のダイアログを管理できる', () => {
      const { result } = renderHook(() => useMultipleDialogs({
        save: { onOpen: vi.fn() },
        load: { onOpen: vi.fn() },
        export: { onOpen: vi.fn() }
      }));

      expect(result.current.save.isOpen).toBe(false);
      expect(result.current.load.isOpen).toBe(false);
      expect(result.current.export.isOpen).toBe(false);

      act(() => {
        result.current.save.open();
      });

      expect(result.current.save.isOpen).toBe(true);
      expect(result.current.load.isOpen).toBe(false);
      expect(result.current.export.isOpen).toBe(false);
    });

    it('各ダイアログが独立して動作する', () => {
      const saveOnOpen = vi.fn();
      const loadOnOpen = vi.fn();
      const { result } = renderHook(() => useMultipleDialogs({
        save: { onOpen: saveOnOpen },
        load: { onOpen: loadOnOpen }
      }));

      act(() => {
        result.current.save.open();
        result.current.load.open();
      });

      expect(saveOnOpen).toHaveBeenCalled();
      expect(loadOnOpen).toHaveBeenCalled();
      expect(result.current.save.isOpen).toBe(true);
      expect(result.current.load.isOpen).toBe(true);
    });
  });

  describe('useModalDialog', () => {
    it('ESCキーハンドラーが提供される', () => {
      const { result } = renderHook(() => useModalDialog());

      expect(typeof result.current.handleEscapeKey).toBe('function');
      expect(typeof result.current.handleBackdropClick).toBe('function');
    });

    it('ESCキーでモーダルが閉じる', () => {
      const { result } = renderHook(() => useModalDialog());

      act(() => {
        result.current.open();
      });
      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.handleEscapeKey({ key: 'Escape' } as KeyboardEvent);
      });
      expect(result.current.isOpen).toBe(false);
    });

    it('ESCキー以外では閉じない', () => {
      const { result } = renderHook(() => useModalDialog());

      act(() => {
        result.current.open();
      });

      act(() => {
        result.current.handleEscapeKey({ key: 'Enter' } as KeyboardEvent);
      });
      expect(result.current.isOpen).toBe(true);
    });

    it('closeOnEscapeがfalseの場合はESCキーで閉じない', () => {
      const { result } = renderHook(() => useModalDialog({ closeOnEscape: false }));

      act(() => {
        result.current.open();
      });

      act(() => {
        result.current.handleEscapeKey({ key: 'Escape' } as KeyboardEvent);
      });
      expect(result.current.isOpen).toBe(true);
    });

    it('バックドロップクリックでモーダルが閉じる', () => {
      const { result } = renderHook(() => useModalDialog());

      act(() => {
        result.current.open();
      });

      const backdropElement = { id: 'backdrop' };
      const mockEvent = {
        target: backdropElement,
        currentTarget: backdropElement
      } as React.MouseEvent;

      act(() => {
        result.current.handleBackdropClick(mockEvent);
      });
      expect(result.current.isOpen).toBe(false);
    });

    it('closeOnBackdropClickがfalseの場合はバックドロップクリックで閉じない', () => {
      const { result } = renderHook(() => useModalDialog({ closeOnBackdropClick: false }));

      act(() => {
        result.current.open();
      });

      const mockEvent = {
        target: { id: 'backdrop' },
        currentTarget: { id: 'backdrop' }
      } as React.MouseEvent;

      act(() => {
        result.current.handleBackdropClick(mockEvent);
      });
      expect(result.current.isOpen).toBe(true);
    });
  });

  describe('useDataDialog', () => {
    it('データ付きダイアログの機能が提供される', () => {
      const { result } = renderHook(() => useDataDialog<{ id: number }>());

      expect(typeof result.current.openWithData).toBe('function');
      expect(result.current.hasData).toBe(false);
    });

    it('openWithDataでデータ付きで開ける', () => {
      const { result } = renderHook(() => useDataDialog<{ id: number }>());

      const testData = { id: 123 };

      act(() => {
        result.current.openWithData(testData);
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.data).toBe(testData);
      expect(result.current.hasData).toBe(true);
    });

    it('hasDataが正しく動作する', () => {
      const { result } = renderHook(() => useDataDialog());

      expect(result.current.hasData).toBe(false);

      act(() => {
        result.current.openWithData({ test: 'data' });
      });

      expect(result.current.hasData).toBe(true);

      act(() => {
        result.current.updateData(null);
      });

      expect(result.current.hasData).toBe(false);
    });
  });
});
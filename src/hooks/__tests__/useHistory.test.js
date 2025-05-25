import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHistory } from '../useHistory';

describe('useHistory', () => {
  const initialState = {
    gates: [
      { id: 1, type: 'INPUT', value: true },
      { id: 2, type: 'AND', value: false }
    ],
    connections: [
      { from: 1, to: 2, toInput: 0 }
    ]
  };

  describe('初期状態', () => {
    it('初期値が正しく設定される', () => {
      const { result } = renderHook(() => useHistory(initialState));

      expect(result.current.current).toEqual(initialState);
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(false);
      expect(result.current.historyLength).toBe(1);
      expect(result.current.currentIndex).toBe(0);
    });
  });

  describe('履歴の追加', () => {
    it('新しい状態を履歴に追加できる', () => {
      const { result } = renderHook(() => useHistory(initialState));

      const newState = {
        gates: [...initialState.gates, { id: 3, type: 'OUTPUT', value: false }],
        connections: initialState.connections
      };

      act(() => {
        result.current.pushState(newState);
      });

      expect(result.current.current).toEqual(newState);
      expect(result.current.canUndo).toBe(true);
      expect(result.current.canRedo).toBe(false);
      expect(result.current.historyLength).toBe(2);
      expect(result.current.currentIndex).toBe(1);
    });

    it('履歴の最大数を超えた場合、古い履歴が削除される', () => {
      const { result } = renderHook(() => useHistory(initialState, 2));

      // 2つの履歴を追加
      act(() => {
        result.current.pushState({ ...initialState, gates: [...initialState.gates] });
        result.current.pushState({ ...initialState, gates: [...initialState.gates] });
      });

      expect(result.current.historyLength).toBe(2); // 最大値でクリップされる
    });

    it('Undo後に新しい状態を追加すると、Redo履歴が削除される', () => {
      const { result } = renderHook(() => useHistory(initialState));

      const state2 = { ...initialState, gates: [...initialState.gates, { id: 3, type: 'OR', value: false }] };
      const state3 = { ...initialState, gates: [...initialState.gates, { id: 4, type: 'NOT', value: false }] };

      act(() => {
        result.current.pushState(state2);
      });
      
      act(() => {
        result.current.pushState(state3);
      });

      expect(result.current.historyLength).toBe(3);
      expect(result.current.currentIndex).toBe(2);

      // Undoを実行
      act(() => {
        result.current.undo();
      });

      expect(result.current.historyLength).toBe(3);
      expect(result.current.currentIndex).toBe(1);
      expect(result.current.canRedo).toBe(true);

      // 新しい状態を追加
      const state4 = { ...initialState, gates: [...initialState.gates, { id: 4 }] };
      act(() => {
        result.current.pushState(state4);
      });

      // Redo履歴が削除される
      expect(result.current.canRedo).toBe(false);
      expect(result.current.historyLength).toBe(3); // initial, state2, state4
    });
  });

  describe('Undo/Redo機能', () => {
    it('Undoで前の状態に戻れる', () => {
      const { result } = renderHook(() => useHistory(initialState));

      const newState = {
        gates: [...initialState.gates, { id: 3, type: 'OUTPUT', value: false }],
        connections: initialState.connections
      };

      act(() => {
        result.current.pushState(newState);
      });

      act(() => {
        const undoResult = result.current.undo();
        expect(undoResult).not.toBeNull();
        expect(undoResult.state).toEqual(initialState);
        expect(undoResult.index).toBe(0);
      });

      expect(result.current.current).toEqual(initialState);
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(true);
    });

    it('Redoで次の状態に進める', () => {
      const { result } = renderHook(() => useHistory(initialState));

      const newState = {
        gates: [...initialState.gates, { id: 3, type: 'OUTPUT', value: false }],
        connections: initialState.connections
      };

      act(() => {
        result.current.pushState(newState);
      });
      
      act(() => {
        result.current.undo();
      });

      // redoが正しく動作するように、canRedoをチェック
      expect(result.current.canRedo).toBe(true);
      
      act(() => {
        const redoResult = result.current.redo();
        expect(redoResult).not.toBeNull();
        expect(redoResult.state).toEqual(newState);
        expect(redoResult.index).toBe(1);
      });

      expect(result.current.current).toEqual(newState);
      expect(result.current.canUndo).toBe(true);
      expect(result.current.canRedo).toBe(false);
    });

    it('履歴の最初でUndoを呼んでもnullが返る', () => {
      const { result } = renderHook(() => useHistory(initialState));

      act(() => {
        const undoResult = result.current.undo();
        expect(undoResult).toBeNull();
      });

      expect(result.current.canUndo).toBe(false);
    });

    it('履歴の最後でRedoを呼んでもnullが返る', () => {
      const { result } = renderHook(() => useHistory(initialState));

      act(() => {
        const redoResult = result.current.redo();
        expect(redoResult).toBeNull();
      });

      expect(result.current.canRedo).toBe(false);
    });
  });

  describe('clearHistory', () => {
    it('履歴をクリアして現在の状態のみが残る', () => {
      const { result } = renderHook(() => useHistory(initialState));

      const state2 = { ...initialState, gates: [...initialState.gates, { id: 2 }] };
      const state3 = { ...initialState, gates: [...initialState.gates, { id: 3 }] };

      act(() => {
        result.current.pushState(state2);
      });
      
      expect(result.current.historyLength).toBe(2); // initial, state2
      
      act(() => {
        result.current.pushState(state3);
      });

      expect(result.current.historyLength).toBe(3); // initial, state2, state3

      act(() => {
        result.current.clearHistory();
      });

      expect(result.current.historyLength).toBe(1);
      expect(result.current.current).toEqual(state3);
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(false);
    });
  });

  describe('キーボードショートカット', () => {
    beforeEach(() => {
      vi.spyOn(window, 'addEventListener');
      vi.spyOn(window, 'removeEventListener');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('キーボードイベントリスナーが登録される', () => {
      renderHook(() => useHistory(initialState));

      expect(window.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('アンマウント時にキーボードイベントリスナーが削除される', () => {
      const { unmount } = renderHook(() => useHistory(initialState));

      unmount();

      expect(window.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('Ctrl+Zでundoが呼ばれる', () => {
      const { result } = renderHook(() => useHistory(initialState));

      const newState = {
        gates: [...initialState.gates, { id: 3, type: 'OUTPUT', value: false }],
        connections: initialState.connections
      };

      act(() => {
        result.current.pushState(newState);
      });

      // Ctrl+Zイベントを発火
      const event = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        shiftKey: false
      });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(result.current.current).toEqual(initialState);
    });

    it('Ctrl+Shift+Zでredoが呼ばれる', () => {
      const { result } = renderHook(() => useHistory(initialState));

      const newState = {
        gates: [...initialState.gates, { id: 3, type: 'OUTPUT', value: false }],
        connections: initialState.connections
      };

      act(() => {
        result.current.pushState(newState);
        result.current.undo();
      });

      // Ctrl+Shift+Zイベントを発火
      const event = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        shiftKey: true
      });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(result.current.current).toEqual(newState);
    });

    it('Ctrl+Yでredoが呼ばれる', () => {
      const { result } = renderHook(() => useHistory(initialState));

      const newState = {
        gates: [...initialState.gates, { id: 3, type: 'OUTPUT', value: false }],
        connections: initialState.connections
      };

      act(() => {
        result.current.pushState(newState);
        result.current.undo();
      });

      // Ctrl+Yイベントを発火
      const event = new KeyboardEvent('keydown', {
        key: 'y',
        ctrlKey: true
      });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(result.current.current).toEqual(newState);
    });
  });

  describe('内部フラグの動作', () => {
    it('undo/redo後のpushStateは無視される', () => {
      const { result } = renderHook(() => useHistory(initialState));

      const state2 = { ...initialState, gates: [...initialState.gates] };

      act(() => {
        result.current.pushState(state2);
      });

      // undoを実行すると内部フラグがtrueになる
      act(() => {
        result.current.undo();
      });

      // 直後のpushStateは無視される
      act(() => {
        result.current.pushState({ ...initialState });
      });

      // 履歴長は変わらない
      expect(result.current.historyLength).toBe(2);
    });
  });
});
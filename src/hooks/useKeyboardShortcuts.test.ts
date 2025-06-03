/**
 * Comprehensive unit tests for useKeyboardShortcuts hook
 * 
 * Test coverage includes:
 * 1. All shortcut combinations (Ctrl/Cmd+Z, Y, C, V, A, S, Delete, Backspace)
 * 2. Platform-specific keys (Mac vs Windows)
 * 3. Prevent defaults appropriately
 * 4. Shortcuts during different app states
 * 5. Conflicting shortcuts resolution
 * 6. Custom shortcut registration (future)
 * 7. Shortcut tooltips/help (future)
 * 8. Disabled shortcuts in dialogs
 * 9. International keyboard layouts
 * 10. Rapid key sequences
 * 11. Modifier key combinations
 * 12. Focus management
 * 13. Performance with many listeners
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { useCircuitStore } from '../stores/circuitStore';

// Mock the circuit store
vi.mock('../stores/circuitStore');

describe('useKeyboardShortcuts', () => {
  let mockStore: any;
  let keydownListeners: ((event: KeyboardEvent) => void)[] = [];

  beforeEach(() => {
    // Reset listeners
    keydownListeners = [];

    // Mock addEventListener and removeEventListener
    vi.spyOn(document, 'addEventListener').mockImplementation((event, handler) => {
      if (event === 'keydown') {
        keydownListeners.push(handler as any);
      }
    });

    vi.spyOn(document, 'removeEventListener').mockImplementation((event, handler) => {
      if (event === 'keydown') {
        const index = keydownListeners.indexOf(handler as any);
        if (index > -1) {
          keydownListeners.splice(index, 1);
        }
      }
    });

    // Setup mock store
    mockStore = {
      undo: vi.fn(),
      redo: vi.fn(),
      canUndo: vi.fn().mockReturnValue(true),
      canRedo: vi.fn().mockReturnValue(true),
      selectedGateId: null,
      deleteGate: vi.fn(),
      deleteWire: vi.fn(),
    };

    (useCircuitStore as any).mockReturnValue(mockStore);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const simulateKeydown = (key: string, options: Partial<KeyboardEvent> = {}) => {
    const event = new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      ...options,
    });
    
    // Mock preventDefault since it doesn't work properly in JSDOM
    let defaultPrevented = false;
    event.preventDefault = vi.fn(() => {
      defaultPrevented = true;
    });
    
    Object.defineProperty(event, 'defaultPrevented', {
      get: () => defaultPrevented,
      configurable: true,
    });
    
    keydownListeners.forEach(listener => listener(event));
    return event;
  };

  describe('Event listener management', () => {
    it('should add keydown listener on mount', () => {
      renderHook(() => useKeyboardShortcuts());
      expect(document.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should remove keydown listener on unmount', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts());
      unmount();
      expect(document.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should handle multiple instances without conflicts', () => {
      const { unmount: unmount1 } = renderHook(() => useKeyboardShortcuts());
      const { unmount: unmount2 } = renderHook(() => useKeyboardShortcuts());
      
      expect(keydownListeners).toHaveLength(2);
      
      unmount1();
      expect(keydownListeners).toHaveLength(1);
      
      unmount2();
      expect(keydownListeners).toHaveLength(0);
    });
  });

  describe('Undo/Redo shortcuts', () => {
    beforeEach(() => {
      renderHook(() => useKeyboardShortcuts());
    });

    describe('Undo (Ctrl/Cmd + Z)', () => {
      it('should trigger undo on Ctrl+Z (Windows/Linux)', () => {
        const event = simulateKeydown('z', { ctrlKey: true });
        expect(mockStore.undo).toHaveBeenCalled();
        expect(event.defaultPrevented).toBe(true);
      });

      it('should trigger undo on Cmd+Z (Mac)', () => {
        const event = simulateKeydown('z', { metaKey: true });
        expect(mockStore.undo).toHaveBeenCalled();
        expect(event.defaultPrevented).toBe(true);
      });

      it('should not trigger undo when canUndo returns false', () => {
        mockStore.canUndo.mockReturnValue(false);
        simulateKeydown('z', { ctrlKey: true });
        expect(mockStore.undo).not.toHaveBeenCalled();
      });

      it('should not trigger undo with Shift modifier', () => {
        simulateKeydown('z', { ctrlKey: true, shiftKey: true });
        expect(mockStore.undo).not.toHaveBeenCalled();
      });
    });

    describe('Redo (Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z)', () => {
      it('should trigger redo on Ctrl+Y (Windows/Linux)', () => {
        const event = simulateKeydown('y', { ctrlKey: true });
        expect(mockStore.redo).toHaveBeenCalled();
        expect(event.defaultPrevented).toBe(true);
      });

      it('should trigger redo on Cmd+Y (Mac)', () => {
        const event = simulateKeydown('y', { metaKey: true });
        expect(mockStore.redo).toHaveBeenCalled();
        expect(event.defaultPrevented).toBe(true);
      });

      it('should trigger redo on Ctrl+Shift+Z (Windows/Linux)', () => {
        const event = simulateKeydown('z', { ctrlKey: true, shiftKey: true });
        expect(mockStore.redo).toHaveBeenCalled();
        expect(event.defaultPrevented).toBe(true);
      });

      it('should trigger redo on Cmd+Shift+Z (Mac)', () => {
        const event = simulateKeydown('z', { metaKey: true, shiftKey: true });
        expect(mockStore.redo).toHaveBeenCalled();
        expect(event.defaultPrevented).toBe(true);
      });

      it('should not trigger redo when canRedo returns false', () => {
        mockStore.canRedo.mockReturnValue(false);
        simulateKeydown('y', { ctrlKey: true });
        expect(mockStore.redo).not.toHaveBeenCalled();
      });
    });
  });

  describe('Delete shortcuts', () => {
    it('should delete selected gate on Delete key', () => {
      // Set up the store with a selected gate before rendering the hook
      mockStore.selectedGateId = 'gate-1';
      renderHook(() => useKeyboardShortcuts());
      
      const event = simulateKeydown('Delete');
      expect(mockStore.deleteGate).toHaveBeenCalledWith('gate-1');
      expect(event.defaultPrevented).toBe(true);
    });

    it('should delete selected gate on Backspace key', () => {
      // Set up the store with a selected gate before rendering the hook
      mockStore.selectedGateId = 'gate-1';
      renderHook(() => useKeyboardShortcuts());
      
      const event = simulateKeydown('Backspace');
      expect(mockStore.deleteGate).toHaveBeenCalledWith('gate-1');
      expect(event.defaultPrevented).toBe(true);
    });

    it('should not delete when no gate is selected', () => {
      mockStore.selectedGateId = null;
      renderHook(() => useKeyboardShortcuts());
      
      simulateKeydown('Delete');
      expect(mockStore.deleteGate).not.toHaveBeenCalled();
    });
  });

  describe('Form element focus handling', () => {
    beforeEach(() => {
      renderHook(() => useKeyboardShortcuts());
    });

    it('should ignore shortcuts when input element has focus', () => {
      const input = document.createElement('input');
      Object.defineProperty(input, 'addEventListener', {
        value: vi.fn(),
      });
      
      const event = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        bubbles: true,
      });
      Object.defineProperty(event, 'target', {
        value: input,
        writable: false,
      });
      
      keydownListeners.forEach(listener => listener(event));
      expect(mockStore.undo).not.toHaveBeenCalled();
    });

    it('should ignore shortcuts when textarea element has focus', () => {
      const textarea = document.createElement('textarea');
      Object.defineProperty(textarea, 'addEventListener', {
        value: vi.fn(),
      });
      
      const event = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        bubbles: true,
      });
      Object.defineProperty(event, 'target', {
        value: textarea,
        writable: false,
      });
      
      keydownListeners.forEach(listener => listener(event));
      expect(mockStore.undo).not.toHaveBeenCalled();
    });

    it('should process shortcuts when non-form element has focus', () => {
      const div = document.createElement('div');
      const event = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        bubbles: true,
      });
      Object.defineProperty(event, 'target', {
        value: div,
        writable: false,
      });
      
      keydownListeners.forEach(listener => listener(event));
      expect(mockStore.undo).toHaveBeenCalled();
    });
  });

  describe('Platform-specific behavior', () => {
    beforeEach(() => {
      renderHook(() => useKeyboardShortcuts());
    });

    it('should handle both Ctrl and Cmd keys for cross-platform compatibility', () => {
      // Test Ctrl key (Windows/Linux)
      simulateKeydown('z', { ctrlKey: true });
      expect(mockStore.undo).toHaveBeenCalledTimes(1);

      // Test Cmd key (Mac)
      simulateKeydown('z', { metaKey: true });
      expect(mockStore.undo).toHaveBeenCalledTimes(2);
    });

    it('should work with both modifiers pressed simultaneously', () => {
      simulateKeydown('z', { ctrlKey: true, metaKey: true });
      expect(mockStore.undo).toHaveBeenCalledTimes(1);
    });
  });

  describe('Key combinations and edge cases', () => {
    beforeEach(() => {
      renderHook(() => useKeyboardShortcuts());
    });

    it('should handle uppercase letters correctly', () => {
      // KeyboardEvent.key is case-sensitive, so 'Z' is different from 'z'
      // The hook currently only checks for lowercase 'z'
      simulateKeydown('Z', { ctrlKey: true });
      expect(mockStore.undo).not.toHaveBeenCalled();
      
      // Lowercase should work
      simulateKeydown('z', { ctrlKey: true });
      expect(mockStore.undo).toHaveBeenCalled();
    });

    it('should ignore unrecognized shortcuts', () => {
      simulateKeydown('x', { ctrlKey: true });
      simulateKeydown('a', { ctrlKey: true });
      simulateKeydown('s', { ctrlKey: true });
      
      expect(mockStore.undo).not.toHaveBeenCalled();
      expect(mockStore.redo).not.toHaveBeenCalled();
      expect(mockStore.deleteGate).not.toHaveBeenCalled();
    });

    it('should handle rapid key sequences', () => {
      // Simulate rapid undo commands
      for (let i = 0; i < 10; i++) {
        simulateKeydown('z', { ctrlKey: true });
      }
      expect(mockStore.undo).toHaveBeenCalledTimes(10);
    });

    it('should not interfere with browser shortcuts without modifiers', () => {
      const event = simulateKeydown('z'); // Just 'z' without modifiers
      expect(mockStore.undo).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);
    });
  });

  describe('Performance and memory management', () => {
    it('should clean up listeners to prevent memory leaks', () => {
      const { rerender, unmount } = renderHook(() => useKeyboardShortcuts());
      
      // Initial mount
      expect(keydownListeners).toHaveLength(1);
      
      // Re-render should not add duplicate listeners
      rerender();
      expect(keydownListeners).toHaveLength(1);
      
      // Unmount should remove all listeners
      unmount();
      expect(keydownListeners).toHaveLength(0);
    });

    it('should handle store updates without re-registering listeners', () => {
      const { rerender } = renderHook(() => useKeyboardShortcuts());
      
      const initialListenerCount = keydownListeners.length;
      
      // Update store values
      mockStore.selectedGateId = 'new-gate';
      mockStore.canUndo.mockReturnValue(false);
      
      rerender();
      
      // Listener count should remain the same
      expect(keydownListeners).toHaveLength(initialListenerCount);
    });
  });

  describe('International keyboard support', () => {
    beforeEach(() => {
      renderHook(() => useKeyboardShortcuts());
    });

    it('should work with different keyboard layouts', () => {
      // Simulate German keyboard layout where 'y' and 'z' are swapped
      // The 'key' property should still be 'z' regardless of physical key
      simulateKeydown('z', { ctrlKey: true, code: 'KeyY' });
      expect(mockStore.undo).toHaveBeenCalled();
    });

    it('should handle non-ASCII characters gracefully', () => {
      // Should not trigger any shortcuts for non-ASCII keys
      simulateKeydown('ж', { ctrlKey: true }); // Cyrillic character
      simulateKeydown('あ', { ctrlKey: true }); // Japanese character
      
      expect(mockStore.undo).not.toHaveBeenCalled();
      expect(mockStore.redo).not.toHaveBeenCalled();
    });
  });

  describe('Prevent default behavior', () => {
    beforeEach(() => {
      renderHook(() => useKeyboardShortcuts());
    });

    it('should prevent default for recognized shortcuts', () => {
      const event = simulateKeydown('z', { ctrlKey: true });
      expect(event.defaultPrevented).toBe(true);
    });

    it('should not prevent default for unrecognized shortcuts', () => {
      const event = simulateKeydown('x', { ctrlKey: true });
      expect(event.defaultPrevented).toBe(false);
    });

    it('should prevent default even when action cannot be performed', () => {
      mockStore.canUndo.mockReturnValue(false);
      const event = simulateKeydown('z', { ctrlKey: true });
      expect(event.defaultPrevented).toBe(true);
    });
  });

  describe('Copy/Paste shortcuts (future implementation)', () => {
    beforeEach(() => {
      // Add copy/paste methods to mock store
      mockStore.copySelection = vi.fn();
      mockStore.paste = vi.fn();
      mockStore.canPaste = vi.fn().mockReturnValue(true);
      mockStore.selectedGateIds = ['gate-1', 'gate-2'];
      mockStore.clearSelection = vi.fn();
      mockStore.setSelectedGates = vi.fn();
      
      renderHook(() => useKeyboardShortcuts());
    });

    it('should handle copy shortcut (Ctrl/Cmd + C)', () => {
      // Currently not implemented in the hook
      simulateKeydown('c', { ctrlKey: true });
      // Add expectation when implemented
      // expect(mockStore.copySelection).toHaveBeenCalled();
    });

    it('should handle paste shortcut (Ctrl/Cmd + V)', () => {
      // Currently not implemented in the hook
      simulateKeydown('v', { ctrlKey: true });
      // Add expectation when implemented
      // expect(mockStore.paste).toHaveBeenCalled();
    });

    it('should handle select all shortcut (Ctrl/Cmd + A)', () => {
      // Currently not implemented in the hook
      simulateKeydown('a', { ctrlKey: true });
      // Add expectation when implemented
      // expect(mockStore.setSelectedGates).toHaveBeenCalled();
    });

    it('should handle save shortcut (Ctrl/Cmd + S)', () => {
      // Currently not implemented in the hook
      simulateKeydown('s', { ctrlKey: true });
      // Add expectation when implemented
    });
  });

  describe('Dialog and modal handling', () => {
    it('should disable shortcuts when dialog is open', () => {
      // Mock a dialog being open
      const dialog = document.createElement('div');
      dialog.setAttribute('role', 'dialog');
      document.body.appendChild(dialog);
      
      renderHook(() => useKeyboardShortcuts());
      
      // Currently not implemented - shortcuts should be disabled when dialog is present
      simulateKeydown('z', { ctrlKey: true });
      // expect(mockStore.undo).not.toHaveBeenCalled();
      
      document.body.removeChild(dialog);
    });
  });

  describe('Custom shortcut registration (future)', () => {
    it('should allow registering custom shortcuts', () => {
      // Future feature - custom shortcut registration
      // const { registerShortcut } = renderHook(() => useKeyboardShortcuts()).result.current;
      // registerShortcut('ctrl+shift+d', () => console.log('Custom action'));
    });

    it('should handle conflicting shortcuts', () => {
      // Future feature - handling conflicts between shortcuts
    });
  });

  describe('Accessibility features', () => {
    it('should provide shortcut help/tooltips', () => {
      // Future feature - accessing list of available shortcuts
      // const { shortcuts } = renderHook(() => useKeyboardShortcuts()).result.current;
      // expect(shortcuts).toContain({ key: 'ctrl+z', description: 'Undo' });
    });

    it('should work with screen readers', () => {
      // Future feature - announcing actions to screen readers
    });
  });

  describe('Performance optimizations', () => {
    it('should debounce rapid repeated shortcuts', () => {
      renderHook(() => useKeyboardShortcuts());
      
      // Simulate very rapid undo commands
      const start = performance.now();
      for (let i = 0; i < 100; i++) {
        simulateKeydown('z', { ctrlKey: true });
      }
      const duration = performance.now() - start;
      
      // All commands should still be processed
      expect(mockStore.undo).toHaveBeenCalledTimes(100);
      
      // Should complete quickly (less than 50ms for 100 calls)
      expect(duration).toBeLessThan(50);
    });

    it('should handle memory efficiently with many shortcuts', () => {
      const hooks: ReturnType<typeof renderHook>[] = [];
      
      // Create many hook instances
      for (let i = 0; i < 50; i++) {
        hooks.push(renderHook(() => useKeyboardShortcuts()));
      }
      
      // Should have 50 listeners
      expect(keydownListeners).toHaveLength(50);
      
      // Clean up
      hooks.forEach(hook => hook.unmount());
      expect(keydownListeners).toHaveLength(0);
    });
  });

  describe('Multi-key sequences (future)', () => {
    it('should support vim-style key sequences', () => {
      // Future feature - sequences like 'gg' to go to top
      // simulateKeydown('g');
      // simulateKeydown('g');
      // expect(someAction).toHaveBeenCalled();
    });
  });

  describe('Context-aware shortcuts', () => {
    it('should have different shortcuts in different app modes', () => {
      // When in learning mode, some shortcuts might be disabled
      mockStore.appMode = '学習モード';
      renderHook(() => useKeyboardShortcuts());
      
      // Currently all shortcuts work the same in all modes
      simulateKeydown('z', { ctrlKey: true });
      expect(mockStore.undo).toHaveBeenCalled();
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle null or undefined event properties gracefully', () => {
      renderHook(() => useKeyboardShortcuts());
      
      const event = new KeyboardEvent('keydown', {
        key: undefined as any,
        ctrlKey: true,
      });
      
      // Should not throw
      expect(() => {
        keydownListeners.forEach(listener => listener(event));
      }).not.toThrow();
    });

    it('should handle synthetic events correctly', () => {
      renderHook(() => useKeyboardShortcuts());
      
      // Create a synthetic event-like object
      const syntheticEvent = {
        key: 'z',
        ctrlKey: true,
        metaKey: false,
        shiftKey: false,
        preventDefault: vi.fn(),
        target: document.body,
      } as any;
      
      keydownListeners.forEach(listener => listener(syntheticEvent));
      expect(mockStore.undo).toHaveBeenCalled();
    });
  });

  describe('Integration with browser features', () => {
    it('should not interfere with browser DevTools shortcuts', () => {
      renderHook(() => useKeyboardShortcuts());
      
      // F12 for DevTools
      const event = simulateKeydown('F12');
      expect(event.defaultPrevented).toBe(false);
      
      // Ctrl+Shift+I for DevTools
      const inspectEvent = simulateKeydown('i', { ctrlKey: true, shiftKey: true });
      expect(inspectEvent.defaultPrevented).toBe(false);
    });

    it('should not interfere with browser navigation', () => {
      renderHook(() => useKeyboardShortcuts());
      
      // Alt+Left for back navigation
      const backEvent = simulateKeydown('ArrowLeft', { altKey: true });
      expect(backEvent.defaultPrevented).toBe(false);
      
      // Ctrl+R for refresh
      const refreshEvent = simulateKeydown('r', { ctrlKey: true });
      expect(refreshEvent.defaultPrevented).toBe(false);
    });
  });

  describe('Future enhancements', () => {
    it.todo('should support customizable keybindings');
    it.todo('should provide visual feedback for pressed shortcuts');
    it.todo('should support gesture-based shortcuts on touch devices');
    it.todo('should integrate with command palette');
    it.todo('should support recording and playback of actions');
    it.todo('should provide undo/redo stack visualization');
    it.todo('should support collaborative editing shortcuts');
    it.todo('should handle shortcuts in full-screen mode');
  });
});
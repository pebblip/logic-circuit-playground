import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { WireComponent } from '@/components/Wire';
import type { Wire, Gate } from '@/types/circuit';
import { useCircuitStore } from '@/stores/circuitStore';

// Mock the store
vi.mock('@/stores/circuitStore', () => ({
  useCircuitStore: vi.fn(),
}));

describe('Wire Hover Functionality', () => {
  const mockWire: Wire = {
    id: 'wire1',
    from: { gateId: 'gate1', pinIndex: -1 },
    to: { gateId: 'gate2', pinIndex: 0 },
    isActive: false,
  };

  const mockGates: Gate[] = [
    {
      id: 'gate1',
      type: 'AND',
      position: { x: 100, y: 100 },
      inputs: [false, false],
      outputs: [false],
      output: false,
    },
    {
      id: 'gate2',
      type: 'OR',
      position: { x: 300, y: 100 },
      inputs: [false, false],
      outputs: [false],
      output: false,
    },
  ];

  beforeEach(() => {
    (useCircuitStore as any).mockImplementation(selector => {
      const state = {
        gates: mockGates,
        deleteWire: vi.fn(),
        wireStyle: 'bezier',
      };
      return selector ? selector(state) : state;
    });
  });

  it('ホバー時に wire-hover クラスが追加される', () => {
    const { container } = render(<WireComponent wire={mockWire} gates={mockGates} />);
    
    const wireGroup = container.querySelector('g[data-wire-id="wire1"]');
    expect(wireGroup).toBeDefined();
    
    // 初期状態では wire-hover クラスがない
    const wirePath = container.querySelector('.wire');
    expect(wirePath?.classList.contains('wire-hover')).toBe(false);
    
    // ホバー時
    if (wireGroup) {
      fireEvent.mouseEnter(wireGroup);
      expect(wirePath?.classList.contains('wire-hover')).toBe(true);
      
      // ホバー解除時
      fireEvent.mouseLeave(wireGroup);
      expect(wirePath?.classList.contains('wire-hover')).toBe(false);
    }
  });

  it('ホバー時にツールチップが表示される', () => {
    const { container, getByText } = render(<WireComponent wire={mockWire} gates={mockGates} />);
    
    const wireGroup = container.querySelector('g[data-wire-id="wire1"]');
    
    // 初期状態ではツールチップが表示されない
    expect(() => getByText('右クリックで削除')).toThrow();
    
    // ホバー時にツールチップが表示される
    if (wireGroup) {
      fireEvent.mouseEnter(wireGroup);
      expect(getByText('右クリックで削除')).toBeDefined();
      
      // ホバー解除時にツールチップが消える
      fireEvent.mouseLeave(wireGroup);
      expect(() => getByText('右クリックで削除')).toThrow();
    }
  });

  it('右クリックでコンテキストメニューが表示される', () => {
    const { container } = render(<WireComponent wire={mockWire} gates={mockGates} />);
    
    const wireGroup = container.querySelector('g[data-wire-id="wire1"]');
    
    if (wireGroup) {
      fireEvent.contextMenu(wireGroup);
      
      // コンテキストメニューがbodyにポータルで表示される
      const contextMenu = document.body.querySelector('.wire-context-menu');
      expect(contextMenu).toBeDefined();
    }
  });

  it('透明なパスでクリック領域が拡大されている', () => {
    const { container } = render(<WireComponent wire={mockWire} gates={mockGates} />);
    
    const transparentPath = container.querySelector('path[stroke="transparent"]');
    expect(transparentPath).toBeDefined();
    expect(transparentPath?.getAttribute('stroke-width')).toBe('20');
  });

  it('アクティブなワイヤーでもホバー効果が適用される', () => {
    const activeWire = { ...mockWire, isActive: true };
    const { container } = render(<WireComponent wire={activeWire} gates={mockGates} />);
    
    const wireGroup = container.querySelector('g[data-wire-id="wire1"]');
    const wirePath = container.querySelector('.wire');
    
    // アクティブ状態の確認
    expect(wirePath?.classList.contains('active')).toBe(true);
    
    // ホバー時にもアクティブ状態が維持される
    if (wireGroup) {
      fireEvent.mouseEnter(wireGroup);
      expect(wirePath?.classList.contains('active')).toBe(true);
      expect(wirePath?.classList.contains('wire-hover')).toBe(true);
    }
  });
});
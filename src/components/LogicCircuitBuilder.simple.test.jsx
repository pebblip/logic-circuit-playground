import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import LogicCircuitBuilder from './LogicCircuitBuilder';

describe('LogicCircuitBuilder - シンプルなテスト', () => {
  it('コンポーネントがエラーなくレンダリングされる', () => {
    const { container } = render(<LogicCircuitBuilder />);
    expect(container).toBeTruthy();
  });

  it('初期状態で必要な要素が存在する', () => {
    const { getByText, container } = render(<LogicCircuitBuilder />);
    
    // ヘッダー
    expect(getByText('Logic Circuit Builder')).toBeTruthy();
    
    // ボタン類
    expect(getByText('AND')).toBeTruthy();
    expect(getByText('OR')).toBeTruthy();
    expect(getByText('NOT')).toBeTruthy();
    expect(getByText('IN')).toBeTruthy();
    expect(getByText('OUT')).toBeTruthy();
    
    expect(getByText('計算')).toBeTruthy();
    expect(getByText('自動実行')).toBeTruthy();
    expect(getByText('リセット')).toBeTruthy();
    
    // SVG要素
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });
});
// 最小限のテストファイル（問題の特定用）

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LogicCircuitBuilder from '../LogicCircuitBuilderRefactored';

describe('LogicCircuitBuilder - Minimal Tests', () => {
  it('should render without crashing', () => {
    render(<LogicCircuitBuilder />);
    expect(screen.getByText('Logic Circuit Builder')).toBeInTheDocument();
  });

  it('should show level panel', () => {
    render(<LogicCircuitBuilder />);
    expect(screen.getByText('レベル選択')).toBeInTheDocument();
  });

  it('should show toolbar with gate buttons', () => {
    render(<LogicCircuitBuilder />);
    expect(screen.getByText('AND')).toBeInTheDocument();
    expect(screen.getByText('OR')).toBeInTheDocument();
    expect(screen.getByText('NOT')).toBeInTheDocument();
  });
});
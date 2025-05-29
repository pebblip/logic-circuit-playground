import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MainLayout } from './MainLayout';
import { ThemeProvider } from '../../design-system/ThemeProvider';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('MainLayout', () => {
  const defaultProps = {
    currentMode: 'sandbox' as const,
    availableGates: ['AND', 'OR', 'NOT'] as const,
  };

  it('renders header with current mode', () => {
    renderWithTheme(
      <MainLayout {...defaultProps}>
        <div>Content</div>
      </MainLayout>
    );

    expect(screen.getByText('実験室')).toBeInTheDocument();
  });

  it('renders sidebar with available gates', () => {
    renderWithTheme(
      <MainLayout {...defaultProps}>
        <div>Content</div>
      </MainLayout>
    );

    expect(screen.getByText('基本ゲート')).toBeInTheDocument();
    expect(screen.getByText('AND')).toBeInTheDocument();
    expect(screen.getByText('OR')).toBeInTheDocument();
    expect(screen.getByText('NOT')).toBeInTheDocument();
  });

  it('renders children content', () => {
    renderWithTheme(
      <MainLayout {...defaultProps}>
        <div>Test Content</div>
      </MainLayout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('hides sidebar when showSidebar is false', () => {
    renderWithTheme(
      <MainLayout {...defaultProps} showSidebar={false}>
        <div>Content</div>
      </MainLayout>
    );

    expect(screen.queryByText('基本ゲート')).not.toBeInTheDocument();
  });

  it('shows auto save status', () => {
    renderWithTheme(
      <MainLayout {...defaultProps} autoSaveStatus="saving">
        <div>Content</div>
      </MainLayout>
    );

    expect(screen.getByText('保存中...')).toBeInTheDocument();
  });

  it('shows custom gates when provided', () => {
    const customGates = [
      { id: 'custom1', name: '半加算器' },
      { id: 'custom2', name: 'マルチプレクサ', icon: '🔀' },
    ];

    renderWithTheme(
      <MainLayout {...defaultProps} customGates={customGates}>
        <div>Content</div>
      </MainLayout>
    );

    expect(screen.getByText('カスタムゲート')).toBeInTheDocument();
    expect(screen.getByText('半加算器')).toBeInTheDocument();
    expect(screen.getByText('マルチプレクサ')).toBeInTheDocument();
  });

  it('calls onModeChange when mode button is clicked', () => {
    const mockOnModeChange = vi.fn();
    
    renderWithTheme(
      <MainLayout 
        {...defaultProps} 
        onModeChange={mockOnModeChange}
      >
        <div>Content</div>
      </MainLayout>
    );

    const discoveryButton = screen.getByText('探検');
    discoveryButton.click();

    expect(mockOnModeChange).toHaveBeenCalledWith('discovery');
  });

  it('shows locked gates with lock icon', () => {
    renderWithTheme(
      <MainLayout 
        {...defaultProps}
        availableGates={['AND', 'OR']}
        lockedGates={['NOT']}
      >
        <div>Content</div>
      </MainLayout>
    );

    // NOTゲートがロックされていることを確認
    const notGateLabel = screen.getByText('NOT');
    const lockIcons = screen.getAllByText('🔒');
    
    expect(notGateLabel).toBeInTheDocument();
    expect(lockIcons.length).toBeGreaterThan(0); // 少なくとも1つのロックアイコンが存在
  });
});
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModeSelection } from './ModeSelection';
import { ThemeProvider } from '../../design-system/ThemeProvider';
import type { LearningMode } from '../../types/mode';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('ModeSelection', () => {
  it('renders all three mode options', () => {
    const mockOnModeSelect = vi.fn();
    renderWithTheme(<ModeSelection onModeSelect={mockOnModeSelect} />);

    expect(screen.getByText('探検モード')).toBeInTheDocument();
    expect(screen.getByText('実験室モード')).toBeInTheDocument();
    expect(screen.getByText('チャレンジ')).toBeInTheDocument();
  });

  it('displays correct descriptions for each mode', () => {
    const mockOnModeSelect = vi.fn();
    renderWithTheme(<ModeSelection onModeSelect={mockOnModeSelect} />);

    expect(screen.getByText(/はじめての方へ/)).toBeInTheDocument();
    expect(screen.getByText(/自由に作成/)).toBeInTheDocument();
    expect(screen.getByText(/腕試し/)).toBeInTheDocument();
  });

  it('calls onModeSelect with correct mode when clicking a card', () => {
    const mockOnModeSelect = vi.fn();
    renderWithTheme(<ModeSelection onModeSelect={mockOnModeSelect} />);

    const discoveryCard = screen.getByText('探検モード').closest('[role="button"]');
    fireEvent.click(discoveryCard!);

    expect(mockOnModeSelect).toHaveBeenCalledWith('discovery');
  });

  it('calls onModeSelect when pressing Enter on a card', () => {
    const mockOnModeSelect = vi.fn();
    renderWithTheme(<ModeSelection onModeSelect={mockOnModeSelect} />);

    const sandboxCard = screen.getByText('実験室モード').closest('[role="button"]');
    fireEvent.keyDown(sandboxCard!, { key: 'Enter' });

    expect(mockOnModeSelect).toHaveBeenCalledWith('sandbox');
  });

  it('calls onModeSelect when pressing Space on a card', () => {
    const mockOnModeSelect = vi.fn();
    renderWithTheme(<ModeSelection onModeSelect={mockOnModeSelect} />);

    const challengeCard = screen.getByText('チャレンジ').closest('[role="button"]');
    fireEvent.keyDown(challengeCard!, { key: ' ' });

    expect(mockOnModeSelect).toHaveBeenCalledWith('challenge');
  });

  it('renders all mode icons', () => {
    const mockOnModeSelect = vi.fn();
    renderWithTheme(<ModeSelection onModeSelect={mockOnModeSelect} />);

    expect(screen.getByText('🔍')).toBeInTheDocument();
    expect(screen.getByText('🧪')).toBeInTheDocument();
    expect(screen.getByText('🏆')).toBeInTheDocument();
  });

  it('renders the title', () => {
    const mockOnModeSelect = vi.fn();
    renderWithTheme(<ModeSelection onModeSelect={mockOnModeSelect} />);

    expect(screen.getByText('Logic Circuit Playground')).toBeInTheDocument();
  });

  it('renders the logo', () => {
    const mockOnModeSelect = vi.fn();
    renderWithTheme(<ModeSelection onModeSelect={mockOnModeSelect} />);

    expect(screen.getByText('⚡')).toBeInTheDocument();
  });

  it('has accessible keyboard navigation', () => {
    const mockOnModeSelect = vi.fn();
    renderWithTheme(<ModeSelection onModeSelect={mockOnModeSelect} />);

    const cards = screen.getAllByRole('button');
    expect(cards).toHaveLength(3);

    cards.forEach(card => {
      expect(card).toHaveAttribute('tabIndex', '0');
    });
  });
});
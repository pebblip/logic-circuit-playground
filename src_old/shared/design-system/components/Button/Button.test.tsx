/**
 * Buttonコンポーネントのテスト
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies variant styles correctly', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    let button = screen.getByRole('button');
    const primaryStyles = window.getComputedStyle(button);
    expect(primaryStyles.backgroundColor).toBeTruthy();

    rerender(<Button variant="secondary">Secondary</Button>);
    button = screen.getByRole('button');
    const secondaryStyles = window.getComputedStyle(button);
    expect(secondaryStyles.backgroundColor).toBeTruthy();

    rerender(<Button variant="ghost">Ghost</Button>);
    button = screen.getByRole('button');
    const ghostStyles = window.getComputedStyle(button);
    expect(ghostStyles.backgroundColor).toBe('rgba(0, 0, 0, 0)');

    rerender(<Button variant="danger">Danger</Button>);
    button = screen.getByRole('button');
    const dangerStyles = window.getComputedStyle(button);
    expect(dangerStyles.backgroundColor).toBeTruthy();
  });

  it('applies size styles correctly', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    let button = screen.getByRole('button');
    const smStyles = window.getComputedStyle(button);
    expect(smStyles.height).toBe('2rem'); // spacing[8]

    rerender(<Button size="md">Medium</Button>);
    button = screen.getByRole('button');
    const mdStyles = window.getComputedStyle(button);
    expect(mdStyles.height).toBe('2.5rem'); // spacing[10]

    rerender(<Button size="lg">Large</Button>);
    button = screen.getByRole('button');
    const lgStyles = window.getComputedStyle(button);
    expect(lgStyles.height).toBe('3rem'); // spacing[12]
  });

  it('handles fullWidth prop', () => {
    const { rerender } = render(<Button fullWidth>Full Width</Button>);
    let button = screen.getByRole('button');
    const fullWidthStyles = window.getComputedStyle(button);
    expect(fullWidthStyles.width).toBe('100%');

    rerender(<Button>Normal Width</Button>);
    button = screen.getByRole('button');
    const normalStyles = window.getComputedStyle(button);
    expect(normalStyles.width).not.toBe('100%');
  });

  it('handles disabled state', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    const disabledStyles = window.getComputedStyle(button);
    expect(disabledStyles.cursor).toBe('not-allowed');
    expect(disabledStyles.opacity).toBe('0.5');
  });

  it('handles loading state', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    const loadingStyles = window.getComputedStyle(button);
    expect(loadingStyles.color).toBe('rgba(0, 0, 0, 0)');
  });

  it('renders icon in correct position', () => {
    const icon = <span data-testid="icon">👍</span>;
    
    const { rerender } = render(
      <Button icon={icon} iconPosition="left">
        Text
      </Button>
    );
    
    // 左側のアイコンの場合、アイコンがテキストの前にある
    const button = screen.getByRole('button');
    const buttonContent = button.textContent;
    expect(buttonContent).toBe('👍Text');

    rerender(
      <Button icon={icon} iconPosition="right">
        Text
      </Button>
    );
    
    // 右側のアイコンの場合、アイコンがテキストの後にある
    const buttonRight = screen.getByRole('button');
    const buttonRightContent = buttonRight.textContent;
    expect(buttonRightContent).toBe('Text👍');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire click when disabled', () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('does not fire click when loading', () => {
    const handleClick = vi.fn();
    render(
      <Button loading onClick={handleClick}>
        Loading
      </Button>
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Button ref={ref}>Button</Button>);
    
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
  });

  it('passes through additional props', () => {
    render(
      <Button data-testid="custom-button" aria-label="Custom Label">
        Button
      </Button>
    );
    
    const button = screen.getByTestId('custom-button');
    expect(button).toHaveAttribute('aria-label', 'Custom Label');
  });
});
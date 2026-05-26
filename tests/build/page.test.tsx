import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders primary variant with saffron background class', () => {
    render(<Button>Click me</Button>);
    const btn = screen.getByRole('button', { name: /click me/i });
    expect(btn).toBeInTheDocument();
    expect(btn.className).toContain('bg-saffron');
    expect(btn.className).toContain('text-white');
  });

  it('renders secondary variant without saffron background', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const btn = screen.getByRole('button', { name: /secondary/i });
    expect(btn.className).not.toContain('bg-saffron');
    expect(btn.className).toContain('border-indigo');
  });
});

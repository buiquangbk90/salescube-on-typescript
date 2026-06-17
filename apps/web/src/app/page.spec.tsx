import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from './page';

describe('HomePage', () => {
  it('renders the SalesCube heading', () => {
    render(<HomePage />);
    expect(screen.getByText('SalesCube')).toBeDefined();
  });

  it('renders the dashboard link', () => {
    render(<HomePage />);
    expect(screen.getByRole('link', { name: /go to dashboard/i })).toBeDefined();
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FilterSelector } from '../FilterSelector';

describe('FilterSelector', () => {
  it('should render all 7 filter options', () => {
    render(<FilterSelector selected="original" onSelect={vi.fn()} />);
    expect(screen.getByText('Original')).toBeInTheDocument();
    expect(screen.getByText('Studio')).toBeInTheDocument();
    expect(screen.getByText('Spotlight')).toBeInTheDocument();
    expect(screen.getByText('Prime')).toBeInTheDocument();
    expect(screen.getByText('Classic')).toBeInTheDocument();
    expect(screen.getByText('Edge')).toBeInTheDocument();
    expect(screen.getByText('Luminate')).toBeInTheDocument();
  });

  it('should call onSelect when clicking filter', () => {
    const onSelect = vi.fn();
    render(<FilterSelector selected="original" onSelect={onSelect} />);
    fireEvent.click(screen.getByText('Studio'));
    expect(onSelect).toHaveBeenCalledWith('studio');
  });

  it('should highlight selected filter', () => {
    render(<FilterSelector selected="studio" onSelect={vi.fn()} />);
    const studioButton = screen.getByText('Studio').closest('button');
    expect(studioButton).toHaveClass('border-brand-blue');
  });
});

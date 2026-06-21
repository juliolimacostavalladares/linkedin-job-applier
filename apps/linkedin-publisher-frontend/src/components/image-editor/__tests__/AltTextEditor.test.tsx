import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AltTextEditor } from '../AltTextEditor';

describe('AltTextEditor', () => {
  it('should render textarea with placeholder', () => {
    render(<AltTextEditor value="" onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText(/Como você descreveria/)).toBeInTheDocument();
  });

  it('should call onChange when typing', () => {
    const onChange = vi.fn();
    render(<AltTextEditor value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Test description' } });
    expect(onChange).toHaveBeenCalledWith('Test description');
  });

  it('should show character counter', () => {
    render(<AltTextEditor value="Hello world" onChange={vi.fn()} />);
    expect(screen.getByText('11 / 1000')).toBeInTheDocument();
  });
});

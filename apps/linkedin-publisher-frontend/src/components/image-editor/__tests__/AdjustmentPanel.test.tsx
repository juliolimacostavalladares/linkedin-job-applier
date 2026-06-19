import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AdjustmentPanel } from '../AdjustmentPanel';

describe('AdjustmentPanel', () => {
  const defaultAdj = { brightness: 0, contrast: 0, saturation: 0 };

  it('should render all three sliders', () => {
    render(<AdjustmentPanel adjustments={defaultAdj} onChange={vi.fn()} />);
    expect(screen.getByLabelText('Brilho')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraste')).toBeInTheDocument();
    expect(screen.getByLabelText('Saturação')).toBeInTheDocument();
  });

  it('should call onChange when adjusting brightness', () => {
    const onChange = vi.fn();
    render(<AdjustmentPanel adjustments={defaultAdj} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Brilho'), { target: { value: '20' } });
    expect(onChange).toHaveBeenCalledWith({ brightness: 20, contrast: 0, saturation: 0 });
  });

  it('should display current values', () => {
    render(<AdjustmentPanel adjustments={{ brightness: 30, contrast: -15, saturation: 10 }} onChange={vi.fn()} />);
    expect(screen.getByText('+30')).toBeInTheDocument();
    expect(screen.getByText('-15')).toBeInTheDocument();
    expect(screen.getByText('+10')).toBeInTheDocument();
  });
});

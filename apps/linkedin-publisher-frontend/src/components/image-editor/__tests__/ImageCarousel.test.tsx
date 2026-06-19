import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ImageCarousel } from '../ImageCarousel';

describe('ImageCarousel', () => {
  const files = [
    new File([''], 'img1.jpg', { type: 'image/jpeg' }),
    new File([''], 'img2.jpg', { type: 'image/jpeg' }),
    new File([''], 'img3.jpg', { type: 'image/jpeg' })
  ];

  it('should show current index indicator', () => {
    render(<ImageCarousel images={files} currentIndex={0} onNavigate={vi.fn()} />);
    expect(screen.getByText('1 de 3')).toBeInTheDocument();
  });

  it('should call onNavigate when clicking next', () => {
    const onNavigate = vi.fn();
    render(<ImageCarousel images={files} currentIndex={0} onNavigate={onNavigate} />);
    const nextButton = screen.getByLabelText('Próxima imagem');
    fireEvent.click(nextButton);
    expect(onNavigate).toHaveBeenCalledWith(1);
  });

  it('should disable previous button on first image', () => {
    render(<ImageCarousel images={files} currentIndex={0} onNavigate={vi.fn()} />);
    expect(screen.getByLabelText('Imagem anterior')).toBeDisabled();
  });
});

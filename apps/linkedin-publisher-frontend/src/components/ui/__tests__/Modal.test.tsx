import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Modal } from '../Modal';

describe('Modal', () => {
  it('should render children when open', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} zIndex={50}>
        <div>Modal Content</div>
      </Modal>
    );
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} zIndex={50}>
        <div>Modal Content</div>
      </Modal>
    );
    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
  });

  it('should apply correct z-index', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} zIndex={60}>
        <div>Modal Content</div>
      </Modal>
    );
    const backdrop = document.querySelector('[data-testid="modal-backdrop"]');
    expect(backdrop).toHaveStyle({ zIndex: '55' });
  });
});

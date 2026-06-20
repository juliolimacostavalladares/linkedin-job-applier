import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useScrollLock } from '../useScrollLock';
import { useModalEscapeKey } from '../useModalEscapeKey';

describe('Modal Hooks', () => {
  it('useScrollLock should lock body scroll', () => {
    const { rerender } = renderHook(
      ({ locked }) => useScrollLock(locked),
      { initialProps: { locked: false } }
    );

    expect(document.body.style.overflow).toBe('');

    rerender({ locked: true });
    expect(document.body.style.overflow).toBe('hidden');

    rerender({ locked: false });
    expect(document.body.style.overflow).toBe('');
  });

  it('useModalEscapeKey should call onClose on Escape', () => {
    const onClose = vi.fn();
    renderHook(() => useModalEscapeKey(true, onClose));

    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(event);

    expect(onClose).toHaveBeenCalledOnce();
  });
});

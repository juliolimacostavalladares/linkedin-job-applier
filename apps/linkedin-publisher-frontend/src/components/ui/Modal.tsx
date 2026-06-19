import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { useScrollLock } from '../../hooks/useScrollLock';
import { useModalEscapeKey } from '../../hooks/useModalEscapeKey';
import { useModalFocusTrap } from '../../hooks/useModalFocusTrap';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  zIndex: number;
  children: React.ReactNode;
  showCloseButton?: boolean;
  title?: string;
}

export function Modal({
  isOpen,
  onClose,
  zIndex,
  children,
  showCloseButton = true,
  title
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useScrollLock(isOpen);
  useModalEscapeKey(isOpen, onClose);
  useModalFocusTrap(isOpen, modalRef);

  if (!isOpen) return null;

  const backdropZIndex = zIndex - 5;
  const modalZIndex = zIndex;

  return createPortal(
    <>
      <div
        data-testid="modal-backdrop"
        className="fixed inset-0 bg-black transition-opacity"
        style={{
          zIndex: backdropZIndex,
          opacity: zIndex >= 60 ? 0.8 : 0.6
        }}
        onClick={onClose}
      />

      <div
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ zIndex: modalZIndex }}
      >
        <div
          ref={modalRef}
          className="bg-card rounded-lg shadow-subtle w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-4 border-b border-border-color">
              {title && <h2 className="text-lg font-semibold text-primary">{title}</h2>}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-hover rounded-full transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

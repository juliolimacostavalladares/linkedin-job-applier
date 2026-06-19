import { useState, useCallback } from 'react';

interface ModalStackItem {
  id: string;
  zIndex: number;
}

export function useModalStack() {
  const [stack, setStack] = useState<ModalStackItem[]>([]);

  const push = useCallback((id: string, zIndex: number) => {
    setStack((prev) => [...prev, { id, zIndex }]);
  }, []);

  const pop = useCallback((id: string) => {
    setStack((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const isTop = useCallback(
    (id: string) => {
      return stack[stack.length - 1]?.id === id;
    },
    [stack]
  );

  return { push, pop, isTop, count: stack.length };
}

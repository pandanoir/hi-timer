// https://github.com/reactjs/rfcs/blob/useevent/text/0000-useevent.md#internal-implementation
// (!) Approximate behavior

import { useRef, useLayoutEffect, useCallback } from 'react';

export function useEffectEvent<T>(handler: (...args: T[]) => void) {
  const handlerRef = useRef<(...args: T[]) => void>();

  // In a real implementation, this would run before layout effects
  useLayoutEffect(() => {
    handlerRef.current = handler;
  });

  return useCallback((...args: T[]) => {
    // In a real implementation, this would throw if called during render
    const fn = handlerRef.current;
    return fn?.(...args);
  }, []);
}

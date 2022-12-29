import { useCallback, useRef, useState } from 'react';

export const useCountdownTimer = (duration: number) => {
  const [hasFinished, setHasFinished] = useState<null | boolean>(null); // 開始前は null、開始後は false、時間が経過したら true
  const id = useRef<number | undefined>(undefined);
  const on = useCallback(() => {
    setHasFinished(false);
    clearTimeout(id.current);
    id.current = window.setTimeout(() => {
      setHasFinished(true);
    }, duration);
  }, [duration]);
  const off = useCallback(() => {
    clearTimeout(id.current);
    setHasFinished(null);
  }, []);
  return { on, off, hasFinished } as const;
};

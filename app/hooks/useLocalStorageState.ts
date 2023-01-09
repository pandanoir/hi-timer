import { useEffect, useLayoutEffect, useRef, useState } from 'react';

export const useLocalStorageState = <T>(init: T, key: string) => {
  const [state, setState] = useState<T>(init);

  const hasCalled = useRef(false);
  useLayoutEffect(() => {
    if (hasCalled.current) {
      return;
    }
    hasCalled.current = true;
    try {
      setState(JSON.parse(localStorage.getItem(key) ?? `${init}`));
    } catch {
      void 0;
    }
  }, [init, key]);

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);
  return [state, setState] as const;
};

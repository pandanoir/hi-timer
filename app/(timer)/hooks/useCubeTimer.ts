import { useCallback, useEffect, useState } from 'react';

const fps = 60;
const useStopwatch = ({
  onStop = () => void 0,
}: { onStop?: (elapsedTime: number) => void } = {}) => {
  const [elapsedTime, setElapsedTime] = useState<null | number>(null);
  const [startedAt, setStartedAt] = useState(0);
  useEffect(() => {
    if (elapsedTime === null) {
      return;
    }
    let id: number;
    const work = () => {
      setElapsedTime(Date.now() - startedAt);
      id = window.setTimeout(work, 1000 / fps);
    };
    id = window.setTimeout(work, 1000 / fps);
    return () => window.clearTimeout(id);
  }, [elapsedTime, startedAt]);

  const start = useCallback(() => {
    setStartedAt(Date.now());
    setElapsedTime(0);
  }, []);
  const stop = useCallback(() => {
    onStop(Date.now() - startedAt);
    setStartedAt(0);
    setElapsedTime(null);
  }, [startedAt, onStop]);

  return elapsedTime === null
    ? ({ start } as const)
    : ({ stop, elapsedTime } as const);
};

export const useCubeTimer = ({
  usesInspection,
  onStop,
}: {
  usesInspection: boolean;
  onStop: (record: number, inspectionTime: number | null) => void;
}) => {
  const [inspectionTime, setInspectionTime] = useState<null | number>(null);
  const stopwatch = useStopwatch({
    onStop: useCallback(
      (elapsedTime: number) => {
        onStop(elapsedTime, inspectionTime);
        setInspectionTime(null);
      },
      [onStop, inspectionTime]
    ),
  });
  const { start: startStopwatch } = stopwatch;
  const inspectionStopwatch = useStopwatch({
    onStop: useCallback(
      (elapsedTime: number) => {
        setInspectionTime(elapsedTime);
        startStopwatch?.();
      },
      [startStopwatch]
    ),
  });

  if (stopwatch.stop)
    return {
      state: 'recording',
      stop: stopwatch.stop,
      elapsedTime: stopwatch.elapsedTime,
    } as const;
  if (!usesInspection) {
    return { state: 'before start', start: stopwatch.start } as const;
  }
  if (inspectionTime === null && inspectionStopwatch.start)
    return {
      state: 'before inspection',
      startInspection: inspectionStopwatch.start,
    } as const;
  if (inspectionStopwatch.stop)
    return {
      state: 'inspecting',
      start: inspectionStopwatch.stop,
      elapsedInspectionTime: inspectionStopwatch.elapsedTime,
    } as const;
  throw new Error('unexpected error occurred'); // inspection用のタイマーも stopwatch も動いていない分岐なので、起こりえないはず
};

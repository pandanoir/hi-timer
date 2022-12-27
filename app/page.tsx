'use client';
import { UserProfile, withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import styles from '../styles/Home.module.css';

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
const useTimer = (duration: number) => {
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
  return { on, off, hasFinished: hasFinished } as const;
};

const TodoPage: FC<{ user: UserProfile }> = () => {
  const [usesInspection, setUsesInspection] = useState(true);
  const [inspectionTime, setInspectionTime] = useState<null | number>(null);
  const [records, setRecords] = useState<{ time: number; createdAt: number }[]>(
    []
  );

  const stopwatch = useStopwatch({
    onStop: useCallback((elapsedTime: number) => {
      setRecords((records) => [
        ...records,
        { time: elapsedTime, createdAt: Date.now() },
      ]);
      setInspectionTime(null);
    }, []),
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
  const timerState = usesInspection
    ? inspectionTime === null && inspectionStopwatch.start
      ? 'before inspection'
      : inspectionStopwatch.stop
      ? 'inspecting'
      : stopwatch.stop
      ? 'recording'
      : 'undefined'
    : stopwatch.start
    ? 'before start'
    : 'recording';
  const IsSpaceKeyPressed = useRef(false);
  const { hasFinished: isReadyToStart, on, off } = useTimer(300);
  useEffect(() => {
    if (!usesInspection) {
      const keydownListener = (event: KeyboardEvent) => {
        if (event.key !== ' ') {
          return;
        }
        switch (timerState) {
          case 'before start':
            if (!IsSpaceKeyPressed.current) {
              on();
            }
            break;
          case 'recording':
            stopwatch.stop?.();
            break;
        }
        IsSpaceKeyPressed.current = true;
      };
      const keyupListener = (event: KeyboardEvent) => {
        if (event.key !== ' ') {
          return;
        }
        switch (timerState) {
          case 'before start':
            if (isReadyToStart) {
              stopwatch.start?.();
            }
            off();
            break;
          case 'recording':
            break;
        }
        IsSpaceKeyPressed.current = false;
      };
      document.addEventListener('keydown', keydownListener);
      document.addEventListener('keyup', keyupListener);
      return () => {
        document.removeEventListener('keydown', keydownListener);
        document.removeEventListener('keyup', keyupListener);
      };
    }
    const keydownListener = (event: KeyboardEvent) => {
      if (event.key !== ' ') {
        return;
      }
      switch (timerState) {
        case 'before inspection':
          if (!IsSpaceKeyPressed.current) {
            inspectionStopwatch.start?.();
          }
          break;
        case 'inspecting':
          if (!IsSpaceKeyPressed.current) {
            on();
          }
          break;
        case 'recording':
          stopwatch.stop?.();
          break;
      }
      IsSpaceKeyPressed.current = true;
    };
    const keyupListener = (event: KeyboardEvent) => {
      if (event.key !== ' ') {
        return;
      }
      switch (timerState) {
        case 'before inspection':
          break;
        case 'inspecting':
          if (isReadyToStart) {
            inspectionStopwatch.stop?.();
          }
          off();
          break;
        case 'recording':
          break;
      }
      IsSpaceKeyPressed.current = false;
    };
    document.addEventListener('keydown', keydownListener);
    document.addEventListener('keyup', keyupListener);
    return () => {
      document.removeEventListener('keydown', keydownListener);
      document.removeEventListener('keyup', keyupListener);
    };
  }, [
    inspectionStopwatch,
    isReadyToStart,
    off,
    on,
    stopwatch,
    timerState,
    usesInspection,
  ]);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Hi Timer</h1>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/api/auth/logout">Logout</a>
        uses inspection:{' '}
        <input
          type="checkbox"
          checked={usesInspection}
          onChange={({ target: { checked } }) => setUsesInspection(checked)}
          disabled={
            !(
              (usesInspection &&
                inspectionTime === null &&
                inspectionStopwatch.start) ||
              (!usesInspection && stopwatch.start)
            )
          }
        />
        {usesInspection ? (
          inspectionTime === null ? (
            inspectionStopwatch.start ? (
              <button
                key="inspection start"
                onClick={inspectionStopwatch.start}
              >
                inspection start
              </button>
            ) : (
              <button
                key="start recording"
                onPointerDown={on}
                onPointerUp={() => {
                  if (isReadyToStart) {
                    inspectionStopwatch.stop?.();
                  }
                  off();
                }}
                style={{
                  color:
                    isReadyToStart === null
                      ? 'white'
                      : isReadyToStart
                      ? 'red'
                      : 'green',
                }}
              >
                {inspectionStopwatch.elapsedTime < 15000
                  ? `${
                      15 - Math.trunc(inspectionStopwatch.elapsedTime / 1000)
                    }sec`
                  : inspectionStopwatch.elapsedTime < 17000
                  ? '+2'
                  : 'DNF'}
              </button>
            )
          ) : stopwatch.start ? (
            <button key="start recording" onClick={stopwatch.start}>
              start
            </button>
          ) : (
            <button key="stop recording" onClick={stopwatch.stop}>
              stop
            </button>
          )
        ) : stopwatch.start ? (
          <button
            key="start recording"
            onPointerDown={on}
            onPointerUp={() => {
              if (isReadyToStart) {
                stopwatch.start?.();
              }
              off();
            }}
            style={{
              color:
                isReadyToStart === null
                  ? 'white'
                  : isReadyToStart
                  ? 'red'
                  : 'green',
            }}
          >
            start
          </button>
        ) : (
          <button key="stop recording" onClick={stopwatch.stop}>
            stop
          </button>
        )}
        {typeof stopwatch.elapsedTime === 'number' &&
          `${Math.trunc(stopwatch.elapsedTime) / 1000}sec`}
        {records.map(({ createdAt, time }) => (
          <li key={createdAt}>{Math.trunc(time) / 1000}sec</li>
        ))}
      </main>
    </div>
  );
};
export default withPageAuthRequired(TodoPage);

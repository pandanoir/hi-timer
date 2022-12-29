import { Box, Text, Button, VStack } from '@chakra-ui/react';
import {
  ComponentProps,
  FC,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

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

const ScreenButton = (props: ComponentProps<typeof VStack>) => (
  <VStack h="full" align="center" justify="center" {...props} />
);

export const Timer: FC<{
  usesInspection: boolean;
  onStart: () => void;
  onStop: (record: number, inspectionTime: number | null) => void;
}> = ({ usesInspection, onStart, onStop }) => {
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
  {
    const prevInspectionStopwatch = useRef(inspectionStopwatch);
    useEffect(() => {
      if (!usesInspection) {
        return;
      }
      if (
        prevInspectionStopwatch.current.start !== inspectionStopwatch.start &&
        !inspectionStopwatch.start
      ) {
        onStart();
      }
      prevInspectionStopwatch.current = inspectionStopwatch;
    });
  }
  {
    const prevStopwatch = useRef(stopwatch);
    useEffect(() => {
      if (usesInspection) {
        return;
      }
      if (prevStopwatch.current.start !== stopwatch.start && !stopwatch.start) {
        onStart();
      }
      prevStopwatch.current = stopwatch;
    });
  }
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

  return stopwatch.stop ? (
    <ScreenButton key="stop recording" onClick={stopwatch.stop}>
      <Button onClick={stopwatch.stop}>stop</Button>
      <Text>
        {typeof stopwatch.elapsedTime === 'number' &&
          `${Math.trunc(stopwatch.elapsedTime) / 1000}sec`}
      </Text>
    </ScreenButton>
  ) : !usesInspection ? (
    <ScreenButton
      key="start recording"
      onPointerDown={on}
      onPointerUp={() => {
        if (isReadyToStart) {
          stopwatch.start?.();
        }
        off();
      }}
    >
      <Button
        onPointerDown={on}
        onPointerUp={() => {
          if (isReadyToStart) {
            stopwatch.start?.();
          }
          off();
        }}
        style={{
          color:
            isReadyToStart === null ? '' : isReadyToStart ? 'red' : 'green',
        }}
      >
        start
      </Button>
    </ScreenButton>
  ) : typeof inspectionStopwatch.elapsedTime !== 'number' ? (
    <ScreenButton key="start inspection" onClick={inspectionStopwatch.start}>
      <Button onClick={inspectionStopwatch.start}>inspection start</Button>
    </ScreenButton>
  ) : (
    <ScreenButton
      key="start recording with inspection"
      onPointerDown={on}
      onPointerUp={() => {
        if (isReadyToStart) {
          inspectionStopwatch.stop?.();
        }
        off();
      }}
    >
      <Button
        onPointerDown={on}
        onPointerUp={() => {
          if (isReadyToStart) {
            inspectionStopwatch.stop?.();
          }
          off();
        }}
        style={{
          color:
            isReadyToStart === null ? '' : isReadyToStart ? 'red' : 'green',
        }}
      >
        {inspectionStopwatch.elapsedTime < 15000
          ? `${15 - Math.trunc(inspectionStopwatch.elapsedTime / 1000)}sec`
          : inspectionStopwatch.elapsedTime < 17000
          ? '+2'
          : 'DNF'}
      </Button>
    </ScreenButton>
  );
};

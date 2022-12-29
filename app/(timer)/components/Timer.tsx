import { Text, Button, VStack } from '@chakra-ui/react';
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
const useCountdownTimer = (duration: number) => {
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

const ScreenButton = (props: ComponentProps<typeof VStack>) => (
  <VStack h="full" align="center" justify="center" {...props} />
);

const useCubeTimer = ({
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

export const Timer: FC<{
  usesInspection: boolean;
  onStart: () => void;
  onStop: (record: number, inspectionTime: number | null) => void;
}> = ({ usesInspection, onStart, onStop }) => {
  const timer = useCubeTimer({ onStop, usesInspection });

  const isSpaceKeyPressed = useRef(false);
  const { hasFinished: isReadyToStart, on, off } = useCountdownTimer(300);

  const prevTimerState = useRef<typeof timer.state>(timer.state);
  useEffect(() => {
    if (prevTimerState.current === timer.state) {
      return;
    }
    if (timer.state === 'inspecting' || timer.state === 'recording') {
      onStart();
    }
    prevTimerState.current = timer.state;
  }, [onStart, timer.state]);

  useEffect(() => {
    if (!usesInspection) {
      const keydownListener = ({ key }: KeyboardEvent) => {
        if (key !== ' ') {
          return;
        }
        switch (timer.state) {
          case 'before start':
            if (!isSpaceKeyPressed.current) {
              on();
            }
            break;
          case 'recording':
            timer.stop();
            break;
        }
        isSpaceKeyPressed.current = true;
      };
      const keyupListener = ({ key }: KeyboardEvent) => {
        if (key !== ' ') {
          return;
        }
        switch (timer.state) {
          case 'before start':
            if (isReadyToStart) {
              timer.start();
            }
            off();
            break;
          case 'recording':
            break;
        }
        isSpaceKeyPressed.current = false;
      };
      document.addEventListener('keydown', keydownListener);
      document.addEventListener('keyup', keyupListener);
      return () => {
        document.removeEventListener('keydown', keydownListener);
        document.removeEventListener('keyup', keyupListener);
      };
    }
    const keydownListener = ({ key }: KeyboardEvent) => {
      if (key !== ' ') {
        return;
      }
      switch (timer.state) {
        case 'before inspection':
          if (!isSpaceKeyPressed.current) {
            timer.startInspection();
          }
          break;
        case 'inspecting':
          if (!isSpaceKeyPressed.current) {
            on();
          }
          break;
        case 'recording':
          timer.stop();
          break;
      }
      isSpaceKeyPressed.current = true;
    };
    const keyupListener = ({ key }: KeyboardEvent) => {
      if (key !== ' ') {
        return;
      }
      switch (timer.state) {
        case 'before inspection':
          break;
        case 'inspecting':
          if (isReadyToStart) {
            timer.start();
          }
          off();
          break;
        case 'recording':
          break;
      }
      isSpaceKeyPressed.current = false;
    };
    document.addEventListener('keydown', keydownListener);
    document.addEventListener('keyup', keyupListener);
    return () => {
      document.removeEventListener('keydown', keydownListener);
      document.removeEventListener('keyup', keyupListener);
    };
  }, [isReadyToStart, off, on, timer, usesInspection]);

  if (timer.state === 'inspecting' || timer.state === 'before start') {
    let buttonText = 'start';
    if (timer.state === 'inspecting') {
      buttonText =
        timer.elapsedInspectionTime < 15000
          ? `${15 - Math.trunc(timer.elapsedInspectionTime / 1000)}sec`
          : timer.elapsedInspectionTime < 17000
          ? '+2'
          : 'DNF';
    }

    return (
      <ScreenButton
        key={timer.state}
        onPointerDown={on}
        onPointerUp={() => {
          if (isReadyToStart) {
            timer.start();
          }
          off();
        }}
      >
        <Button
          onPointerDown={on}
          onPointerUp={() => {
            if (isReadyToStart) {
              timer.start();
            }
            off();
          }}
          colorScheme={
            isReadyToStart !== null
              ? isReadyToStart
                ? 'pink'
                : 'teal'
              : undefined
          }
        >
          {buttonText}
        </Button>
      </ScreenButton>
    );
  }
  return timer.state === 'before inspection' ? (
    <ScreenButton key={timer.state} onClick={timer.startInspection}>
      <Button onClick={timer.startInspection}>inspection start</Button>
    </ScreenButton>
  ) : timer.state === 'recording' ? (
    <ScreenButton key={timer.state} onClick={timer.stop}>
      <Button onClick={timer.stop}>stop</Button>
      <Text>
        {typeof timer.elapsedTime === 'number' &&
          `${Math.trunc(timer.elapsedTime) / 1000}sec`}
      </Text>
    </ScreenButton>
  ) : (
    (timer satisfies never, null)
  );
};

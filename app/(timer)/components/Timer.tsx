import { Text, Button, VStack } from '@chakra-ui/react';
import {
  ComponentProps,
  FC,
  memo,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { useCountdownTimer } from '../hooks/useCountdownTimer';
import { useCubeTimer } from '../hooks/useCubeTimer';

const ScreenButton = (props: ComponentProps<typeof VStack>) => (
  <VStack h="full" align="center" justify="center" {...props} />
);

export const Timer: FC<{
  usesInspection: boolean;
  onStart: () => void;
  onStop: (record: number, inspectionTime: number | null) => void;
}> = memo(function Timer({ usesInspection, onStart, onStop }) {
  const timer = useCubeTimer({ onStop, usesInspection });

  const isSpaceKeyPressed = useRef(false);
  const { hasFinished: isReadyToStart, on, off } = useCountdownTimer(300); // ボタンを 300ms 押し続けて離すとタイマーがスタートする
  const onReleaseStartButton = useCallback(() => {
    if (timer.state !== 'before start' && timer.state !== 'inspecting') {
      return;
    }
    if (isReadyToStart) {
      timer.start();
    }
    off();
  }, [isReadyToStart, timer, off]);

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
            onReleaseStartButton();
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
          onReleaseStartButton();
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
  }, [on, timer, usesInspection, onReleaseStartButton]);

  {
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
  }

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
        onPointerUp={onReleaseStartButton}
      >
        <Button
          onPointerDown={on}
          onPointerUp={onReleaseStartButton}
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
        {timer.state === 'inspecting' && (
          <Button
            onPointerDown={(event) => {
              event.stopPropagation();
              off();
              timer.cancel();
            }}
            colorScheme="red"
          >
            cancel
          </Button>
        )}
      </ScreenButton>
    );
  }
  return timer.state === 'before inspection' ? (
    <ScreenButton key={timer.state} onClick={timer.startInspection}>
      <Button onClick={timer.startInspection}>inspection start</Button>
    </ScreenButton>
  ) : timer.state === 'recording' ? (
    <ScreenButton key={timer.state} onPointerDown={timer.stop}>
      <Button onPointerDown={timer.stop}>stop</Button>
      <Text>
        {typeof timer.elapsedTime === 'number' &&
          `${Math.trunc(timer.elapsedTime) / 1000}sec`}
      </Text>
    </ScreenButton>
  ) : (
    (timer satisfies never, null)
  );
});

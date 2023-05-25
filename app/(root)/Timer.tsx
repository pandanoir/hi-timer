import { Text, Button, VStack } from '@chakra-ui/react';
import {
  ComponentProps,
  FC,
  memo,
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { useCountdownTimer } from './useCountdownTimer';
import { useCubeTimer } from './useCubeTimer';

export const usePreventDefault = <T extends HTMLElement>(
  eventName: string,
  enable = true
) => {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!enable) {
      return;
    }
    const current = ref.current;
    if (!current) {
      return;
    }
    const handler = (event: Event) => {
      event.preventDefault();
    };
    current.addEventListener(eventName, handler);
    return () => {
      current.removeEventListener(eventName, handler);
    };
  }, [enable, eventName]);

  return ref;
};

const ScreenButton = (props: ComponentProps<typeof VStack>) => (
  <VStack
    h="full"
    align="center"
    justify="center"
    {...props}
    style={{ touchAction: 'none' }}
  />
);

export const Timer: FC<
  PropsWithChildren<{
    usesInspection: boolean;
    onStart: () => void;
    onStop: (record: number, inspectionTime: number | null) => void;
    onCancel: () => void;
  }>
> = memo(function Timer({
  children,
  usesInspection,
  onStart,
  onStop,
  onCancel,
}) {
  const timer = useCubeTimer({ onStop, usesInspection });

  const isSpaceKeyPressed = useRef(false);
  const { hasFinished: isReadyToStart, on, off } = useCountdownTimer(300); // ボタンを 300ms 押し続けて離すとタイマーがスタートする
  const isInspectionStartButtonPressed = useRef(false);
  const onInspectionStartButtonPress = () => {
    isInspectionStartButtonPressed.current = true;
  };
  const onInspectionStartButtonRelease = () => {
    isInspectionStartButtonPressed.current = false;
  };
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

    // 押してる秒数に応じて色が変わる
    const colorScheme =
      isReadyToStart !== null ? (isReadyToStart ? 'pink' : 'teal') : undefined;

    return (
      <ScreenButton
        key={timer.state}
        onPointerDown={on}
        onPointerUp={onReleaseStartButton}
      >
        {timer.state === 'before start' && children}
        <Button
          onPointerDown={on}
          onPointerUp={onReleaseStartButton}
          colorScheme={colorScheme}
        >
          {buttonText}
        </Button>
        {timer.state === 'inspecting' && (
          <Button
            onPointerDown={(event) => {
              event.stopPropagation();
            }}
            onClick={() => {
              onCancel();
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
    <ScreenButton
      key={timer.state}
      onPointerDown={onInspectionStartButtonPress}
      onClick={() => {
        if (isInspectionStartButtonPressed.current) {
          timer.startInspection();
        }
        onInspectionStartButtonRelease();
      }}
    >
      {children}
      <Button
        onPointerDown={(event) => {
          event.stopPropagation();
          onInspectionStartButtonPress();
        }}
        onClick={(event) => {
          event.stopPropagation();
          if (isInspectionStartButtonPressed.current) {
            timer.startInspection();
          }
          onInspectionStartButtonRelease();
        }}
      >
        inspection start
      </Button>
    </ScreenButton>
  ) : timer.state === 'recording' ? (
    <ScreenButton key={timer.state} onPointerDown={timer.stop}>
      <Text
        fontSize={['5xl', '8xl']}
        fontWeight="bold"
        fontFamily="ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace"
      >
        {typeof timer.elapsedTime === 'number' &&
          `${Math.trunc(timer.elapsedTime / 1000)}.${`${
            timer.elapsedTime % 1000
          }`.padStart(3, '0')}sec`}
      </Text>
      <Button onPointerDown={timer.stop}>stop</Button>
    </ScreenButton>
  ) : (
    (timer satisfies never, null)
  );
});

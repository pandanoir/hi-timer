import {
  Text,
  Button,
  VStack,
  Modal,
  ModalContent,
  ModalOverlay,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  ComponentProps,
  FC,
  memo,
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { useCountdownTimer } from '../_hooks/useCountdownTimer';
import { useCubeTimer } from '../_hooks/useCubeTimer';
import { useEffectEvent } from '../../_hooks/useEffectEvent';
import { noop } from '../../_utils/noop';

// 画面全体がクリックできるボタン
const ScreenButton = (props: ComponentProps<typeof VStack>) => (
  <VStack
    h="full"
    align="center"
    justify="center"
    {...props}
    style={{ touchAction: 'none' }}
  />
);
const OverlaidScreenButton = ({
  onPointerDown,
  onPointerUp,
  children,
}: PropsWithChildren<{
  onPointerDown?: () => void;
  onPointerUp?: () => void;
}>) => (
  <Modal isOpen onClose={noop} size="full">
    <ModalOverlay bg={useColorModeValue('whiteAlpha.700', 'blackAlpha.600')} />
    <ModalContent bg="transparent" boxShadow="none" m="0">
      <ScreenButton
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        h="100dvh"
      >
        {children}
      </ScreenButton>
    </ModalContent>
  </Modal>
);

const stop =
  <T extends { stopPropagation: () => void }>(f: (event: T) => void) =>
  (event: T) => {
    event.stopPropagation();
    f(event);
  };
export const Timer: FC<
  PropsWithChildren<{
    usesInspection: boolean;
    onStart?: () => void;
    onStop: (record: number, inspectionTime: number | null) => void;
    onCancel?: () => void;
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

  {
    const keydownListener = useEffectEvent(({ key }: KeyboardEvent) => {
      if (key !== ' ') {
        return;
      }
      if (usesInspection) {
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
      } else {
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
      }
      isSpaceKeyPressed.current = true;
    });
    const keyupListener = useEffectEvent(({ key }: KeyboardEvent) => {
      if (key !== ' ') {
        return;
      }
      if (usesInspection) {
        switch (timer.state) {
          case 'before inspection':
            break;
          case 'inspecting':
            onReleaseStartButton();
            break;
          case 'recording':
            break;
        }
      } else {
        switch (timer.state) {
          case 'before start':
            onReleaseStartButton();
            break;
          case 'recording':
            break;
        }
      }
      isSpaceKeyPressed.current = false;
    });
    useEffect(() => {
      document.addEventListener('keydown', keydownListener);
      document.addEventListener('keyup', keyupListener);
      return () => {
        document.removeEventListener('keydown', keydownListener);
        document.removeEventListener('keyup', keyupListener);
      };
    }, [keydownListener, keyupListener]);
  }
  {
    const prevTimerState = useRef<typeof timer.state>(timer.state);
    useEffect(() => {
      if (prevTimerState.current === timer.state) {
        return;
      }
      if (timer.state === 'inspecting' || timer.state === 'recording') {
        onStart?.();
      }
      prevTimerState.current = timer.state;
    }, [onStart, timer.state]);
  }

  if (timer.state === 'before start') {
    // 押してる秒数に応じて色が変わる
    const colorScheme =
      isReadyToStart !== null ?
        isReadyToStart ? 'pink'
        : 'teal'
      : undefined;

    return (
      <ScreenButton
        key={timer.state}
        onPointerDown={on}
        onPointerUp={onReleaseStartButton}
      >
        {children}
        <Button
          onPointerDown={on}
          onPointerUp={onReleaseStartButton}
          colorScheme={colorScheme}
        >
          start
        </Button>
      </ScreenButton>
    );
  }
  if (timer.state === 'inspecting') {
    // 押してる秒数に応じて色が変わる
    const colorScheme =
      isReadyToStart !== null ?
        isReadyToStart ? 'pink'
        : 'teal'
      : undefined;

    return (
      <OverlaidScreenButton
        onPointerDown={on}
        onPointerUp={onReleaseStartButton}
      >
        <Button colorScheme={colorScheme}>
          {timer.elapsedInspectionTime < 15000 ?
            `${15 - Math.trunc(timer.elapsedInspectionTime / 1000)}sec`
          : timer.elapsedInspectionTime < 17000 ?
            '+2'
          : 'DNF'}
        </Button>
        <Button
          onPointerDown={stop(noop)}
          onClick={() => {
            onCancel?.();
            off();
            timer.cancel();
          }}
          colorScheme="red"
        >
          cancel
        </Button>
      </OverlaidScreenButton>
    );
  }
  if (timer.state === 'before inspection') {
    return (
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
          onPointerDown={stop(onInspectionStartButtonPress)}
          onClick={stop(() => {
            if (isInspectionStartButtonPressed.current) {
              timer.startInspection();
            }
            onInspectionStartButtonRelease();
          })}
        >
          inspection start
        </Button>
      </ScreenButton>
    );
  }
  if (timer.state === 'recording') {
    return (
      <OverlaidScreenButton onPointerDown={timer.stop}>
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
      </OverlaidScreenButton>
    );
  }
  timer satisfies never;
  throw new Error(); // 型検査用。これがないと Timer の返り値に undefined が含まれてしまう
});

'use client';
import { UserProfile, withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import {
  Box,
  Button,
  FormLabel,
  HStack,
  Icon,
  IconButton,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Switch,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { FC, memo, useCallback, useContext, useEffect, useState } from 'react';
import { Scrambow } from 'scrambow';
import useSWR, { useSWRConfig } from 'swr';
import { Timer } from './components/Timer';
import 'pure-react-carousel/dist/react-carousel.es.css';
import {
  ButtonBack,
  ButtonNext,
  CarouselContext,
  CarouselProvider,
  Slide,
  Slider,
} from 'pure-react-carousel';
import { ArrowLeftIcon, ArrowRightIcon } from '@chakra-ui/icons';
import { AiFillDatabase } from 'react-icons/ai';
import { css } from '@emotion/react';

type TimerRecord = {
  time: number;
  penalty: boolean;
  dnf: boolean;
  createdAt: number;
  scramble: string;
  id: string;
};
const useTimerRecords = () => {
  const { mutate } = useSWRConfig();
  const { data: records, error } = useSWR<TimerRecord[]>(
    '/api/record/read',
    async (url) => (await fetch(url)).json()
  );

  if (!records) {
    return { records } as const;
  }

  const update = (id: string, change: Partial<TimerRecord>) => {
    const index = records.findIndex((x) => x.id === id);
    mutate(
      '/api/record/read',
      fetch('/api/record/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...change, id }),
      }).then(async (res) => [
        ...records.slice(0, index),
        await res.json(),
        ...records.slice(index + 1),
      ]),
      {
        optimisticData: [
          ...records.slice(0, index),
          { ...records[index], ...change },
          ...records.slice(index + 1),
        ],
        rollbackOnError: true,
      }
    );
  };
  return {
    records,
    error,
    createNewRecord: (record: Omit<TimerRecord, 'id'>) => {
      mutate(
        '/api/record/read',
        fetch('/api/record/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        }).then(async (res) => [await res.json(), ...records]),
        {
          optimisticData: [
            { ...record, id: 'temp' },
            ...records,
          ] satisfies TimerRecord[],
          rollbackOnError: true,
        }
      );
    },
    imposePenalty: (id: string) => {
      update(id, { penalty: true });
    },
    toDNF: (id: string) => {
      update(id, { dnf: true });
    },
    undoPenalty: (id: string) => {
      update(id, { penalty: false });
    },
    undoDNF: (id: string) => {
      update(id, { dnf: false });
    },
    deleteRecord: (id: string) => {
      const index = records.findIndex((x) => x.id === id);
      mutate(
        '/api/record/read',
        fetch('/api/record/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        }).then(() => [
          ...records.slice(0, index),
          ...records.slice(index + 1),
        ]),
        {
          optimisticData: [
            ...records.slice(0, index),
            ...records.slice(index + 1),
          ],
          rollbackOnError: true,
        }
      );
    },
  } as const;
};

const CarouselIndex = ({
  carouselIndex,
  onCarouselIndexChange,
}: {
  carouselIndex: number;
  onCarouselIndexChange: (carouselIndex: number) => void;
}) => {
  const carouselContext = useContext(CarouselContext);

  useEffect(() => {
    const listener = () => {
      onCarouselIndexChange(carouselContext.state.currentSlide);
    };
    carouselContext.subscribe(listener);
    return () => carouselContext.unsubscribe(listener);
  }, [carouselContext, onCarouselIndexChange]);

  useEffect(() => {
    carouselContext.setStoreState({ currentSlide: carouselIndex });
  }, [carouselIndex, carouselContext]);
  return null;
};

const Carousel = memo(function Carousel({
  scrambleHistory,
  animationDisabled, // HACK: totalSlides が変化したときに不要なアニメーションが走るので、そのときにアニメーションを無効化する
  carouselIndex,
  onTransitionEnd,
  onCarouselIndexChange,
}: {
  scrambleHistory: string[];
  animationDisabled: boolean;
  carouselIndex: number;
  onTransitionEnd?: () => void;
  onCarouselIndexChange: (carouselIndex: number) => void;
}) {
  return (
    <Box h={8} textAlign="center">
      <CarouselProvider
        naturalSlideWidth={50}
        naturalSlideHeight={24}
        isIntrinsicHeight
        totalSlides={scrambleHistory.length}
      >
        <CarouselIndex
          carouselIndex={carouselIndex}
          onCarouselIndexChange={onCarouselIndexChange}
        />
        <HStack w="full">
          <ButtonBack disabled={animationDisabled ? true : undefined}>
            <ArrowLeftIcon
              css={css`
                button:disabled & {
                  opacity: 0.4;
                }
              `}
            />
          </ButtonBack>
          <Slider
            classNameAnimation={animationDisabled ? 'disabled' : undefined}
            style={{ flex: '1' }}
            onTransitionEnd={onTransitionEnd}
          >
            {scrambleHistory.map((scramble, index) => (
              <Slide key={index} index={index} style={{ margin: '0 8px' }}>
                <Text fontSize="xl">{scramble}</Text>
              </Slide>
            ))}
          </Slider>
          <ButtonNext disabled={animationDisabled ? true : undefined}>
            <ArrowRightIcon
              css={css`
                button:disabled & {
                  opacity: 0.4;
                }
              `}
            />
          </ButtonNext>
        </HStack>
      </CarouselProvider>
    </Box>
  );
});
const scrambler = new Scrambow();
const TimerPage: FC<{ user: UserProfile }> = () => {
  const [usesInspection, setUsesInspection] = useState(true);
  const {
    records,
    createNewRecord,
    imposePenalty,
    toDNF,
    undoPenalty,
    undoDNF,
    deleteRecord,
  } = useTimerRecords();

  const [isTimerRecording, setIsTimerRecording] = useState(false);
  const [scrambleHistory, setScrambleHistory] = useState(() =>
    scrambler.get(50).map((x) => x.scramble_string)
  );
  const [onCarouselTransitionEnd, setOnCarouselTransitionEnd] = useState<
    (() => void) | undefined
  >(undefined);
  const [carouselAnimationDisabled, setCarouselAnimationDisabled] =
    useState(false);
  const [currentScramble, setCurrentScramble] = useState(0);
  const onCarouselIndexChange = useCallback(
    (nextCarouselIndex: number) => {
      setCurrentScramble(nextCarouselIndex);
      if (scrambleHistory.length - nextCarouselIndex >= 10) {
        return;
      }
      // pure-react-carousel は要素を増やすと不要なアニメーションが走る(https://github.com/express-labs/pure-react-carousel/issues/371)
      // この問題へのワークアラウンドとして、要素を追加したときはアニメーションを一時的に無効化している
      setOnCarouselTransitionEnd(() => () => {
        setScrambleHistory((list) => [
          ...list,
          ...scrambler.get(50).map((x) => x.scramble_string),
        ]);
        setCarouselAnimationDisabled(true);
        setTimeout(() => {
          setCarouselAnimationDisabled(false);
          setOnCarouselTransitionEnd(undefined);
        }, 100);
      });
    },
    [scrambleHistory]
  );

  const {
    isOpen: isRecordModalOpen,
    onOpen: onRecordModalOpen,
    onClose: onRecordModalClose,
  } = useDisclosure();

  return (
    <>
      <VStack flex="1" align="left" as="main">
        <HStack>
          <FormLabel userSelect="none" htmlFor="use inspection">
            use inspection:
          </FormLabel>
          <Switch
            id="use inspection"
            isChecked={usesInspection}
            onChange={({ target: { checked } }) => setUsesInspection(checked)}
            disabled={isTimerRecording}
          />
        </HStack>
        {records ? (
          <>
            <Box h={8} textAlign="center">
              <Carousel
                carouselIndex={currentScramble}
                onCarouselIndexChange={onCarouselIndexChange}
                onTransitionEnd={onCarouselTransitionEnd}
                scrambleHistory={scrambleHistory}
                animationDisabled={carouselAnimationDisabled}
              />
            </Box>
            <Box flex="1">
              <Timer
                usesInspection={usesInspection}
                onStart={() => {
                  setIsTimerRecording(true);
                }}
                onStop={(record, inspectionTime) => {
                  createNewRecord({
                    time: record,
                    penalty: inspectionTime !== null && inspectionTime >= 15000,
                    dnf: inspectionTime !== null && inspectionTime >= 17000,
                    scramble: scrambleHistory[currentScramble],
                    createdAt: Date.now(),
                  });
                  setCurrentScramble((n) => n + 1);
                  setIsTimerRecording(false);
                }}
                onCancel={() => {
                  setIsTimerRecording(false);
                }}
              />
            </Box>
            {records[0] ? (
              <HStack justify="space-between">
                <HStack spacing={2}>
                  {!records[0].dnf && (
                    <Button
                      key="+2"
                      onClick={() => {
                        if (records[0].penalty) {
                          undoPenalty(records[0].id);
                        } else {
                          imposePenalty(records[0].id);
                        }
                      }}
                      variant="outline"
                      colorScheme="blue"
                    >
                      {records[0].penalty ? 'undo +2' : '+2'}
                    </Button>
                  )}
                  <Button
                    key="DNF"
                    onClick={() => {
                      if (records[0].dnf) {
                        undoDNF(records[0].id);
                      } else {
                        toDNF(records[0].id);
                      }
                    }}
                    variant="outline"
                    colorScheme="blue"
                  >
                    {records[0].dnf ? 'undo DNF' : 'DNF'}
                  </Button>
                  <Button
                    key="delete"
                    onClick={() => deleteRecord(records[0].id)}
                    variant="outline"
                    colorScheme="red"
                  >
                    delete
                  </Button>
                </HStack>
                <IconButton
                  onClick={onRecordModalOpen}
                  icon={<Icon as={AiFillDatabase} />}
                  aria-label="open record list"
                />
              </HStack>
            ) : (
              <HStack justify="end">
                <IconButton
                  onClick={onRecordModalOpen}
                  icon={<Icon as={AiFillDatabase} />}
                  aria-label="open record list"
                />
              </HStack>
            )}
          </>
        ) : (
          <VStack flex="1" align="center" justify="center">
            <Spinner size="xl" />
          </VStack>
        )}
      </VStack>
      <Modal isOpen={isRecordModalOpen} onClose={onRecordModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Time records</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {records && records.length > 0 ? (
              <List>
                {records.map(({ time, penalty, dnf, createdAt }) => {
                  const timeStr = `${Math.trunc(time) / 1000}sec${
                    penalty ? ' + 2' : ''
                  }`;
                  return (
                    <ListItem key={createdAt}>
                      {dnf ? `DNF(${timeStr})` : timeStr}
                    </ListItem>
                  );
                })}
              </List>
            ) : (
              <Box>No record exists.</Box>
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onRecordModalClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
export default withPageAuthRequired(TimerPage);

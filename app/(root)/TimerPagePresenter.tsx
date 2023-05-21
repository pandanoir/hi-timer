import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  CloseButton,
  Flex,
  FormLabel,
  Grid,
  GridItem,
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
  Select,
  Switch,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { Dispatch, FC, SetStateAction, useMemo, useState } from 'react';
import { AiFillDatabase } from 'react-icons/ai';
import { TimerRecord } from '../_types/TimerRecord';
import { calcAo } from '../_utils/calcAo';
import { calcBestAo } from '../_utils/calcBestAo';
import 'pure-react-carousel/dist/react-carousel.es.css';
import { Timer } from './Timer';
import { ScrambleCarousel } from './ScrambleCarousel';
import { recordToMilliSeconds } from '../_utils/recordToMilliSeconds';
import { useLocalStorageState } from './useLocalStorageState';
import { useScrambleHistory } from './useScrambleHistory';

export const TimerPagePresenter: FC<
  (
    | {
        records: TimerRecord[];
        createNewRecord: (
          record: Omit<TimerRecord, 'id' | 'createdAt'> & { createdAt: number }
        ) => void;
        imposePenalty: (id: string) => void;
        toDNF: (id: string) => void;
        undoPenalty: (id: string) => void;
        undoDNF: (id: string) => void;
        deleteRecord: (id: string) => void;
        restoreDeletedRecord: (record: Omit<TimerRecord, 'id'>) => void;
      }
    | {
        records: undefined;
        createNewRecord: undefined;
        imposePenalty: undefined;
        toDNF: undefined;
        undoPenalty: undefined;
        undoDNF: undefined;
        deleteRecord: undefined;
        restoreDeletedRecord: undefined;
      }
  ) & {
    isAnonymousMode: boolean;
    currentEvent: string;
    setCurrentEvent: Dispatch<SetStateAction<string>>;
  } & ReturnType<typeof useScrambleHistory>
> = ({
  isAnonymousMode,
  records,
  createNewRecord,
  imposePenalty,
  toDNF,
  undoPenalty,
  undoDNF,
  deleteRecord,
  restoreDeletedRecord,
  currentEvent,
  setCurrentEvent,
  scrambleHistory,
  currentScramble,
  nextScramble,
  onCarouselIndexChange,
  workaround_for_pure_react_carousel,
}) => {
  const [usesInspection, setUsesInspection] = useLocalStorageState(
    true,
    'usesInspection'
  );
  const [isTimerRecording, setIsTimerRecording] = useState(false);
  const {
    isOpen: isRecordModalOpen,
    onOpen: onRecordModalOpen,
    onClose: onRecordModalClose,
  } = useDisclosure();
  const toast = useToast();

  return (
    <VStack flex="1" align="left" as="main">
      <HStack>
        <Select
          w="max-content"
          variant="filled"
          id="event"
          value={currentEvent}
          onChange={(e) => setCurrentEvent(e.target.value)}
        >
          <option value="3x3x3">3x3x3</option>
          <option value="2x2x2">2x2x2</option>
          <option value="4x4x4">4x4x4</option>
          <option value="5x5x5">5x5x5</option>
          <option value="6x6x6">6x6x6</option>
          <option value="7x7x7">7x7x7</option>
        </Select>
        <FormLabel userSelect="none" htmlFor="use inspection">
          use inspection:
        </FormLabel>
        <Switch
          id="use inspection"
          isChecked={usesInspection}
          onChange={({ target: { checked } }) => setUsesInspection(checked)}
          disabled={isTimerRecording}
        />
        {isAnonymousMode && (
          <Alert status="error" w="max-content">
            <AlertIcon />
            <Tooltip label="Please login. Data will be deleted on leaving or reloading this page">
              anonymous mode
            </Tooltip>
          </Alert>
        )}
      </HStack>
      <ScrambleCarousel
        carouselIndex={currentScramble}
        scrambleHistory={scrambleHistory}
        onCarouselIndexChange={onCarouselIndexChange}
        onTransitionEnd={
          workaround_for_pure_react_carousel.onCarouselTransitionEnd
        }
        animationDisabled={
          workaround_for_pure_react_carousel.carouselAnimationDisabled
        }
      />
      <Box flex="1">
        <Timer
          usesInspection={usesInspection}
          onStart={() => {
            setIsTimerRecording(true);
          }}
          onStop={(record, inspectionTime) => {
            createNewRecord?.({
              time: record,
              penalty: inspectionTime !== null && inspectionTime >= 15000,
              dnf: inspectionTime !== null && inspectionTime >= 17000,
              scramble: scrambleHistory[currentScramble],
              event: currentEvent,
              createdAt: Date.now(),
            });
            nextScramble();
            setIsTimerRecording(false);
          }}
          onCancel={() => {
            setIsTimerRecording(false);
          }}
        >
          {records && (
            <VStack align="center">
              {records[0] && (
                <Text
                  fontSize={['5xl', '8xl']}
                  fontWeight="bold"
                  fontFamily="ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace"
                >
                  {records[0].dnf
                    ? 'DNF'
                    : `${Math.trunc(records[0].time / 1000)}.${`${
                        records[0].time % 1000
                      }`.padStart(3, '0')}sec${
                        records[0].penalty ? ' + 2' : ''
                      }`}
                </Text>
              )}
              <Grid templateColumns="max-content 1fr" columnGap={1}>
                {records.length >= 5 && (
                  <>
                    <GridItem>ao5</GridItem>
                    <GridItem>
                      {(() => {
                        const ao5 = calcAo(records.slice(0, 5));
                        return Number.isFinite(ao5)
                          ? `${Math.trunc(ao5) / 1000}sec`
                          : 'DNF';
                      })()}
                    </GridItem>
                  </>
                )}
                {records.length >= 12 && (
                  <>
                    <GridItem>ao12</GridItem>
                    <GridItem>
                      {(() => {
                        const ao12 = calcAo(records.slice(0, 12));
                        return Number.isFinite(ao12)
                          ? `${Math.trunc(ao12) / 1000}sec`
                          : 'DNF';
                      })()}
                    </GridItem>
                  </>
                )}
              </Grid>
            </VStack>
          )}
        </Timer>
      </Box>
      {records?.[0] && (
        <HStack justify="space-between">
          <HStack spacing={2} flex="1">
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
                disabled={isTimerRecording}
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
              disabled={isTimerRecording}
              variant="outline"
              colorScheme="blue"
            >
              {records[0].dnf ? 'undo DNF' : 'DNF'}
            </Button>
            <Button
              key="delete"
              onClick={() => {
                const deletedRecord = records[0];
                deleteRecord(records[0].id);
                toast({
                  isClosable: true,
                  render: ({ status, variant, onClose, isClosable }) => (
                    <Alert
                      addRole={false}
                      status={status}
                      variant={variant}
                      alignItems="start"
                      borderRadius="md"
                      boxShadow="lg"
                      paddingEnd={8}
                      textAlign="start"
                      width="auto"
                    >
                      <AlertDescription
                        flex="1"
                        maxWidth="100%"
                        display="block"
                      >
                        <Flex align="center">
                          <Text flex="1">deleted</Text>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              restoreDeletedRecord(deletedRecord);
                              onClose();
                            }}
                          >
                            undo
                          </Button>
                        </Flex>
                      </AlertDescription>
                      {isClosable && (
                        <CloseButton
                          size="md"
                          onClick={onClose}
                          position="absolute"
                          insetEnd={1}
                          top={1}
                        />
                      )}
                    </Alert>
                  ),
                });
              }}
              disabled={isTimerRecording}
              variant="outline"
              colorScheme="red"
            >
              delete
            </Button>
          </HStack>
          <IconButton
            onClick={onRecordModalOpen}
            disabled={isTimerRecording}
            icon={<Icon as={AiFillDatabase} />}
            aria-label="open record list"
          />
        </HStack>
      )}
      <RecordModal
        isOpen={isRecordModalOpen}
        onClose={onRecordModalClose}
        records={records}
      />
    </VStack>
  );
};
const BestAverages: FC<{ records: TimerRecord[] }> = ({ records }) => {
  const bestRecords = useMemo<Record<string, number>>(() => {
    const bestAverages: Record<string, number> = {};
    const latestRecords = records.flat().slice(0, 100);
    if (latestRecords.length >= 1) {
      bestAverages.best = latestRecords
        .map(recordToMilliSeconds)
        .sort((a, b) => a - b)[0];
    }
    if (latestRecords.length >= 5) {
      bestAverages.ao5 = calcBestAo(latestRecords, 5);
    }
    if (latestRecords.length >= 12) {
      bestAverages.ao12 = calcBestAo(latestRecords, 12);
    }
    if (latestRecords.length >= 100) {
      bestAverages.ao100 = calcAo(latestRecords);
    }
    return bestAverages;
  }, [records]);
  return (
    <List>
      {Object.entries(bestRecords).map(([ao, val]) => (
        <ListItem key={ao}>
          {ao === 'best' ? 'best: ' : `best ${ao}: `}
          {Number.isFinite(val)
            ? `${Math.trunc(val / 1000)}.${`${Math.trunc(val % 1000)}`.padStart(
                3,
                '0'
              )}`
            : 'DNF'}
        </ListItem>
      ))}
    </List>
  );
};
const RecordModal: FC<{
  isOpen: boolean;
  onClose: () => void;
  records: TimerRecord[] | undefined;
}> = ({ records, isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose} size="3xl">
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>100 most recent time records</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        {records && records.length > 0 ? (
          <VStack spacing={2} align="left">
            <Button as="a" href="/records" w="max-content">
              See more records
            </Button>
            <BestAverages records={records} />
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
          </VStack>
        ) : (
          'No record exists.'
        )}
      </ModalBody>
      <ModalFooter>
        <Button colorScheme="blue" mr={3} onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);

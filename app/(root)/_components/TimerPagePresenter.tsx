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
  Select,
  Switch,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { ComponentProps, Dispatch, FC, lazy, SetStateAction } from 'react';
import { AiFillDatabase } from 'react-icons/ai';
import { TimerRecord } from '../../_types/TimerRecord';
import { calcAo } from '../../_utils/calcAo';
import 'pure-react-carousel/dist/react-carousel.es.css';
import { Timer } from './Timer';
import { ScrambleCarousel } from './ScrambleCarousel';
import { useLocalStorageState } from '../_hooks/useLocalStorageState';
import { useScrambleHistory } from '../_hooks/useScrambleHistory';
import { useLatestRecord } from './LatestRecordContext';

const RecordModal = lazy(() => import('./RecordModal'));

const RecordText = ({
  record,
  ...props
}: ComponentProps<typeof Text> & { record: TimerRecord }) => (
  <Text
    fontSize={['5xl', '8xl']}
    fontWeight="bold"
    fontFamily="ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace"
    {...props}
  >
    {record.dnf ?
      'DNF'
    : `${Math.trunc(record.time / 1000)}.${`${record.time % 1000}`.padStart(
        3,
        '0',
      )}sec${record.penalty ? ' + 2' : ''}`
    }
  </Text>
);
const SecondaryButton = (props: ComponentProps<typeof Button>) => (
  <Button variant="outline" colorScheme="blue" {...props} />
);
const DeleteButton = ({
  deleteRecord,
  restoreDeletedRecord,
}: {
  deleteRecord: () => TimerRecord;
  restoreDeletedRecord: (record: Omit<TimerRecord, 'id'>) => void;
}) => {
  const toast = useToast();
  return (
    <Button
      onClick={() => {
        const deletedRecord = deleteRecord();
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
              <AlertDescription flex="1" maxWidth="100%" display="block">
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
      variant="outline"
      colorScheme="red"
    >
      delete
    </Button>
  );
};
export const TimerPagePresenter: FC<
  (
    | {
        records: TimerRecord[];
        createNewRecord: (
          record: Omit<TimerRecord, 'id' | 'createdAt'> & { createdAt: number },
        ) => void;
        imposePenalty: (record: TimerRecord) => void;
        toDNF: (record: TimerRecord) => void;
        undoPenalty: (record: TimerRecord) => void;
        undoDNF: (record: TimerRecord) => void;
        deleteRecord: (record: TimerRecord) => void;
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
    'usesInspection',
  );
  const {
    isOpen: isRecordModalOpen,
    onOpen: onRecordModalOpen,
    onClose: onRecordModalClose,
  } = useDisclosure();
  const latestRecord = useLatestRecord();

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
        <FormLabel userSelect="none">
          use inspection:{' '}
          <Switch
            isChecked={usesInspection}
            onChange={({ target: { checked } }) => setUsesInspection(checked)}
          />
        </FormLabel>
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
          }}
        >
          <VStack align="center">
            {records ?
              <>
                {records[0] && <RecordText record={records[0]} />}
                <Grid templateColumns="max-content 1fr" columnGap={1}>
                  {records.length >= 5 && (
                    <>
                      <GridItem>ao5</GridItem>
                      <GridItem>
                        {(() => {
                          const ao5 = calcAo(records.slice(0, 5));
                          return Number.isFinite(ao5) ?
                              `${Math.trunc(ao5) / 1000}sec`
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
                          return Number.isFinite(ao12) ?
                              `${Math.trunc(ao12) / 1000}sec`
                            : 'DNF';
                        })()}
                      </GridItem>
                    </>
                  )}
                </Grid>
              </>
            : latestRecord && <RecordText record={latestRecord} />}
          </VStack>
        </Timer>
      </Box>

      {records?.[0] && (
        <HStack justify="space-between">
          <HStack spacing={2} flex="1">
            {!records[0].dnf &&
              (records[0].penalty ?
                <SecondaryButton onClick={() => undoPenalty(records[0])}>
                  undo +2
                </SecondaryButton>
              : <SecondaryButton onClick={() => imposePenalty(records[0])}>
                  +2
                </SecondaryButton>)}
            {records[0].dnf ?
              <SecondaryButton onClick={() => undoDNF(records[0])}>
                undo DNF
              </SecondaryButton>
            : <SecondaryButton onClick={() => toDNF(records[0])}>
                DNF
              </SecondaryButton>
            }
            <DeleteButton
              deleteRecord={() => {
                deleteRecord(records[0]);
                return records[0];
              }}
              restoreDeletedRecord={restoreDeletedRecord}
            />
          </HStack>
          <IconButton
            onClick={onRecordModalOpen}
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

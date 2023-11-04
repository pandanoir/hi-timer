import {
  Button,
  HStack,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
} from '@chakra-ui/react';
import { FC, useMemo } from 'react';
import { TimerRecord } from '../_types/TimerRecord';
import { calcAo } from '../_utils/calcAo';
import { calcBestAo } from '../_utils/calcBestAo';
import { recordToMilliSeconds } from '../_utils/recordToMilliSeconds';
import RecordGraph from '../records/[[...type]]/RecordGraph';

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
                '0',
              )}`
            : 'DNF'}
        </ListItem>
      ))}
    </List>
  );
};
export const RecordModal: FC<{
  isOpen: boolean;
  onClose: () => void;
  records: TimerRecord[] | undefined;
}> = ({ records, isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose} size="3xl" isCentered>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>
        <HStack gap="2">
          <Text>100 most recent time records</Text>
          <Button as="a" href="/records" w="max-content">
            See more records
          </Button>
        </HStack>
      </ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        {records && records.length > 0 ? (
          <Tabs isLazy w="full">
            <TabList>
              <Tab>graph</Tab>
              <Tab>table</Tab>
            </TabList>
            <TabPanels h="full">
              <TabPanel h={96}>
                <RecordGraph usesPoint={false} records={records} />
              </TabPanel>
              <TabPanel h={96} overflowY="scroll">
                <VStack spacing={2} align="left">
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
              </TabPanel>
            </TabPanels>
          </Tabs>
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

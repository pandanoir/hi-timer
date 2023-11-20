import {
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Table,
  Tbody,
  Td,
  Text,
  Tr,
  VStack,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { FC, useMemo } from 'react';
import { TimerRecord } from '../../_types/TimerRecord';
import { calcAo } from '../../_utils/calcAo';
import { calcBestAo } from '../../_utils/calcBestAo';
import { recordToMilliSeconds } from '../../_utils/recordToMilliSeconds';
import RecordGraph from '../../records/[[...type]]/_components/RecordGraph';

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
    <Table size="sm" w="max">
      <Tbody>
        {Object.entries(bestRecords).map(([ao, val]) => (
          <Tr key={ao}>
            <Td>{ao === 'best' ? 'best' : `best ${ao}`}</Td>
            <Td>
              {Number.isFinite(val) ?
                `${Math.trunc(val / 1000)}.${`${Math.trunc(
                  val % 1000,
                )}`.padStart(3, '0')}`
              : 'DNF'}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};
const RecordModal: FC<{
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
          <Button as={NextLink} href="/records" w="max-content">
            See more records
          </Button>
        </HStack>
      </ModalHeader>
      <ModalCloseButton />

      <ModalBody>
        {records && records.length > 0 ?
          <VStack w="full" h="lg" align="left">
            <BestAverages records={records} />
            <RecordGraph usesPoint={false} records={records} />
          </VStack>
        : 'No record exists.'}
      </ModalBody>
      <ModalFooter>
        <Button colorScheme="blue" mr={3} onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);

export default RecordModal;

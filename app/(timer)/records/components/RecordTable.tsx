import { FC, useMemo } from 'react';
import {
  Button,
  List,
  ListItem,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from '@chakra-ui/react';
import { TimerRecord } from '../../types/TimerRecord';
import { calcAo } from '../../utils/calcAo';
import { recordToMilliSeconds } from '../../utils/recordToMilliSeconds';

const calcBestAo = (records: TimerRecord[], size: number) => {
  let ao = Infinity;
  for (let i = 0; i + size <= records.length; i++) {
    ao = Math.min(ao, calcAo(records.slice(i, i + size)));
  }
  return ao;
};

export const RecordTable: FC<{
  records: TimerRecord[][];
  pageSize: number;
  onLoadMoreClick: () => void;
}> = ({ records, pageSize, onLoadMoreClick }) => {
  const bestRecords = useMemo<Record<string, number>>(() => {
    const bestAverages: Record<string, number> = {};
    const latestRecords = records.flat().slice(0, 100);
    if (latestRecords.length >= 1) {
      bestAverages.best = latestRecords
        .map(recordToMilliSeconds)
        .sort((a, b) => a - b)[0];
    }
    if (latestRecords.length >= 100) {
      bestAverages.ao100 = calcAo(latestRecords);
    }
    if (latestRecords.length >= 12) {
      bestAverages.ao12 = calcBestAo(latestRecords, 12);
    }
    if (latestRecords.length >= 5) {
      bestAverages.ao5 = calcBestAo(latestRecords, 5);
    }
    return bestAverages;
  }, [records]);

  return (
    <VStack align="left" spacing={2}>
      {records.length > 0 && (
        <>
          <Text>among last 100 records:</Text>
          <List>
            {Object.entries(bestRecords).map(([ao, val]) => (
              <ListItem key={ao}>
                {ao === 'best' ? 'best: ' : `best ${ao}: `}
                {Number.isFinite(val)
                  ? `${Math.trunc(val / 1000)}.${`${Math.trunc(
                      val % 1000
                    )}`.padStart(3, '0')}`
                  : 'DNF'}
              </ListItem>
            ))}
          </List>
        </>
      )}
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>time</Th>
              <Th>recorded at</Th>
              <Th>scramble</Th>
            </Tr>
          </Thead>
          <Tbody>
            {records
              .flat()
              .map(({ time, penalty, dnf, scramble, createdAt, id }) => {
                const timeStr = `${Math.trunc(time / 1000)}.${`${
                  time % 1000
                }`.padStart(3, '0')}${penalty ? ' + 2' : ''}`;

                return (
                  <Tr key={id}>
                    <Td>{dnf ? `DNF(${timeStr})` : timeStr}</Td>
                    <Td>{new Date(createdAt).toLocaleString()}</Td>
                    <Td>{scramble}</Td>
                  </Tr>
                );
              })}
          </Tbody>
        </Table>
      </TableContainer>
      {records.length > 0 &&
        records[records.length - 1].length === pageSize && (
          <Button onClick={onLoadMoreClick}>load more</Button>
        )}
    </VStack>
  );
};

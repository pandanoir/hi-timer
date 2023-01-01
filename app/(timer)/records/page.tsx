'use client';
import { UserProfile, withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import {
  List,
  ListItem,
  Spinner,
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
import { FC, useMemo } from 'react';
import useSWR from 'swr';
import { TimerRecord } from '../types/TimerRecord';
import { calcAo } from '../utils/calcAo';
import { recordToMilliSeconds } from '../utils/recordToMilliSeconds';

const useTimerRecords = () => {
  const { data: records, error } = useSWR<TimerRecord[]>(
    '/api/record/read',
    async (url) => (await fetch(url)).json()
  );

  if (!records) {
    return { records } as const;
  }

  return {
    records,
    error,
  } as const;
};

const calcBestAo = (records: TimerRecord[], size: number) => {
  let ao = Infinity;
  for (let i = 0; i + size <= records.length; i++) {
    ao = Math.min(ao, calcAo(records.slice(i, i + size)));
  }
  return ao;
};
const TimerPage: FC<{ user: UserProfile }> = () => {
  const { records, error } = useTimerRecords();

  const bestRecords = useMemo<Record<string, number>>(() => {
    const bestAverages: Record<string, number> = {};
    if (!records) {
      return bestAverages;
    }
    if (records.length >= 1) {
      bestAverages.best = records
        .slice(0, 100)
        .map(recordToMilliSeconds)
        .sort((a, b) => a - b)[0];
    }
    if (records.length >= 100) {
      bestAverages.ao100 = calcAo(records.slice(0, 100));
    }
    if (records.length >= 12) {
      bestAverages.ao12 = calcBestAo(records.slice(0, 100), 12);
    }
    if (records.length >= 5) {
      bestAverages.ao5 = calcBestAo(records.slice(0, 100), 5);
    }
    return bestAverages;
  }, [records]);

  if (error) {
    return <div>error caused</div>;
  }
  if (!records) {
    return <Spinner />;
  }
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
            {records.map(({ time, penalty, dnf, scramble, createdAt, id }) => {
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
    </VStack>
  );
};
export default withPageAuthRequired(TimerPage);

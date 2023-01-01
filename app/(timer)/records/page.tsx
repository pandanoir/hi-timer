'use client';
import { UserProfile, withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import {
  Button,
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
import useSWRInfinite from 'swr/infinite';
import { TimerRecord } from '../types/TimerRecord';
import { calcAo } from '../utils/calcAo';
import { recordToMilliSeconds } from '../utils/recordToMilliSeconds';

const pageSize = 50;
const useTimerRecords = () => {
  const {
    data: records,
    error,
    size,
    setSize,
  } = useSWRInfinite<TimerRecord[]>(
    (_pageIndex, previousPageData) => {
      if (previousPageData && previousPageData.length < pageSize) {
        return null;
      }
      const url = new URL('/api/record/read', location.origin);
      url.searchParams.append('limit', `${pageSize}`);
      if (previousPageData) {
        url.searchParams.append(
          'cursor',
          previousPageData[previousPageData.length - 1].id
        );
      }
      return url.toString();
    },
    async (url) => (await fetch(url)).json()
  );

  if (!records) {
    return { records } as const;
  }

  return {
    records,
    error,
    size,
    setSize,
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
  const { records, error, setSize } = useTimerRecords();

  const bestRecords = useMemo<Record<string, number>>(() => {
    const bestAverages: Record<string, number> = {};
    if (!records) {
      return bestAverages;
    }
    const latestRecords = records.flat().slice(0, 100);
    if (records.length >= 1) {
      bestAverages.best = latestRecords
        .map(recordToMilliSeconds)
        .sort((a, b) => a - b)[0];
    }
    if (records.length >= 100) {
      bestAverages.ao100 = calcAo(latestRecords);
    }
    if (records.length >= 12) {
      bestAverages.ao12 = calcBestAo(latestRecords, 12);
    }
    if (records.length >= 5) {
      bestAverages.ao5 = calcBestAo(latestRecords, 5);
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
      {records[records.length - 1].length === pageSize && (
        <Button onClick={() => setSize((n) => n + 1)}>load more</Button>
      )}
    </VStack>
  );
};
export default withPageAuthRequired(TimerPage);

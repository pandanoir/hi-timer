'use client';
import { UserProfile, withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import {
  Box,
  Button,
  FormLabel,
  HStack,
  List,
  ListItem,
  Spinner,
  Switch,
  VStack,
} from '@chakra-ui/react';
import { FC, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { Timer } from './components/Timer';

type TimerRecord = {
  time: number;
  penalty: boolean;
  dnf: boolean;
  createdAt: number;
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

  return (
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
                  createdAt: Date.now(),
                });
                setIsTimerRecording(false);
              }}
            />
          </Box>
          {records[0] && (
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
          )}
          <List overflowY="scroll" h={[100, 300]}>
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
        </>
      ) : (
        <VStack flex="1" align="center" justify="center">
          <Spinner size="xl" />
        </VStack>
      )}
    </VStack>
  );
};
export default withPageAuthRequired(TimerPage);

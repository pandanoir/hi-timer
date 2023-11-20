'use client';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Dispatch, FC, SetStateAction } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { TimerRecord } from '../_types/TimerRecord';
import { useLocalStorageState } from './_hooks/useLocalStorageState';
import { useScrambleHistory } from './_hooks/useScrambleHistory';
import { TimerPagePresenter } from './_components/TimerPagePresenter';
import { redirect } from 'next/navigation';
import { RequestBody as CreateRequestBody } from '../api/record/create/route';
import { RequestBody as DeleteRequestBody } from '../api/record/delete/route';
import { RequestBody as UpdateRequestBody } from '../api/record/update/route';
import { RecordPage, fetchRecordPage } from '../_utils/fetchRecordPage';

const tempId = 'temp';

const useTimerRecords = (event: string) => {
  const { mutate } = useSWRConfig();
  const { data, error } = useSWR(
    { url: '/api/record/read', query: { event, limit: '100' } },
    fetchRecordPage,
  );

  if (!data) {
    return { records: undefined } as const;
  }
  const records = data.data;

  const update = ({
    change,
    ...args
  }: ({ id: string } | { compositeKey: { time: number; scramble: string } }) & {
    change: Partial<Omit<UpdateRequestBody, 'id'>>;
  }) => {
    const index = records.findIndex((x) => {
      if ('id' in args) {
        return x.id === args.id;
      }
      return (
        x.time === args.compositeKey.time &&
        x.scramble === args.compositeKey.scramble
      );
    });
    mutate(
      { url: '/api/record/read', query: { event, limit: '100' } },
      fetch('/api/record/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...change, ...args }),
      }).then(
        async (res) =>
          ({
            data: [
              ...records.slice(0, index),
              await res.json(),
              ...records.slice(index + 1),
            ],
          }) satisfies Omit<RecordPage, 'hasNextPage'>,
      ),
      {
        optimisticData: {
          data: [
            ...records.slice(0, index),
            { ...records[index], ...change },
            ...records.slice(index + 1),
          ],
        } satisfies Omit<RecordPage, 'hasNextPage'>,
        rollbackOnError: true,
      },
    );
  };
  return {
    records,
    error,
    createNewRecord: (record: CreateRequestBody) => {
      mutate(
        { url: '/api/record/read', query: { event, limit: '100' } },
        fetch('/api/record/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record satisfies CreateRequestBody),
        }).then(
          async (res) =>
            ({ data: [await res.json(), ...records] }) satisfies Omit<
              RecordPage,
              'hasNextPage'
            >,
        ),
        {
          optimisticData: {
            data: [
              {
                ...record,
                id: tempId,
                createdAt: new Date(record.createdAt).toISOString(),
              },
              ...records,
            ],
          } satisfies Omit<RecordPage, 'hasNextPage'>,
          rollbackOnError: true,
        },
      );
    },
    imposePenalty: ({ id, time, scramble }: TimerRecord) => {
      update({
        ...(id !== tempId ? { id } : { compositeKey: { time, scramble } }),
        change: { penalty: true },
      });
    },
    toDNF: ({ id, time, scramble }: TimerRecord) => {
      update({
        ...(id !== tempId ? { id } : { compositeKey: { time, scramble } }),
        change: { dnf: true },
      });
    },
    undoPenalty: ({ id, time, scramble }: TimerRecord) => {
      update({
        ...(id !== tempId ? { id } : { compositeKey: { time, scramble } }),
        change: { penalty: false },
      });
    },
    undoDNF: ({ id, time, scramble }: TimerRecord) => {
      update({
        ...(id !== tempId ? { id } : { compositeKey: { time, scramble } }),
        change: { dnf: false },
      });
    },
    deleteRecord: ({ id, time, scramble }: TimerRecord) => {
      const index = records.findIndex((x) => {
        if (id !== tempId) {
          return x.id === id;
        }
        return x.time === time && x.scramble === scramble;
      });
      mutate(
        { url: '/api/record/read', query: { event, limit: '100' } },
        fetch('/api/record/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            (id !== tempId ?
              { id }
            : {
                compositeKey: { time, scramble },
              }) satisfies DeleteRequestBody,
          ),
        }).then(
          () =>
            ({
              data: [...records.slice(0, index), ...records.slice(index + 1)],
            }) satisfies Omit<RecordPage, 'hasNextPage'>,
        ),
        {
          optimisticData: {
            data: [...records.slice(0, index), ...records.slice(index + 1)],
          } satisfies Omit<RecordPage, 'hasNextPage'>,
          rollbackOnError: true,
        },
      );
    },

    restoreDeletedRecord: (record: Omit<TimerRecord, 'id' | 'userId'>) => {
      mutate(
        { url: '/api/record/read', query: { event, limit: '100' } },
        fetch('/api/record/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...record,
            createdAt: new Date(record.createdAt).getTime(),
          } satisfies CreateRequestBody),
        }).then(
          async (res) =>
            ({ data: [await res.json(), ...records] }) satisfies Omit<
              RecordPage,
              'hasNextPage'
            >,
        ),
        {
          optimisticData: {
            data: [{ ...record, id: tempId }, ...records],
          } satisfies Omit<RecordPage, 'hasNextPage'>,
          rollbackOnError: true,
        },
      );
    },
  } as const;
};

const TimerPageWithSWR: FC<
  {
    setCurrentEvent: Dispatch<SetStateAction<string>>;
    currentEvent: string;
  } & ReturnType<typeof useScrambleHistory>
> = (props) => (
  <TimerPagePresenter
    isAnonymousMode={false}
    {...useTimerRecords(props.currentEvent)}
    {...props}
  />
);
const TimerPage: FC = () => {
  const { isLoading, user } = useUser();
  const [currentEvent, setCurrentEvent] = useLocalStorageState(
    '3x3x3',
    'currentEvent',
  );
  const scrambleHistory = useScrambleHistory(currentEvent);

  if (!isLoading && !user) {
    return redirect('/anonymous');
  }
  return (
    <TimerPageWithSWR
      {...scrambleHistory}
      {...{ currentEvent, setCurrentEvent }}
    />
  );
};

export default TimerPage;

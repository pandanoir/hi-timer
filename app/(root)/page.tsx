'use client';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Dispatch, FC, SetStateAction } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import 'pure-react-carousel/dist/react-carousel.es.css';
import { TimerRecord } from '../_types/TimerRecord';
import { useLocalStorageState } from './useLocalStorageState';
import { useScrambleHistory } from './useScrambleHistory';
import { TimerPagePresenter } from './TimerPagePresenter';
import { redirect } from 'next/navigation';
import { RequestBody as CreateRequestBody } from '../api/record/create/route';
import { RequestBody as DeleteRequestBody } from '../api/record/delete/route';
import { RequestBody as UpdateRequestBody } from '../api/record/update/route';
import { appendSearchParamsByEntries } from '../_utils/appendSearchParamsByEntries';

type RecordReadApiResponse = {
  data: TimerRecord[];
};

const useTimerRecords = (event: string) => {
  const { mutate } = useSWRConfig();

  const { data, error } = useSWR(
    { url: '/api/record/read', query: { event, limit: '100' } },
    async (key): Promise<RecordReadApiResponse> => {
      const url = new URL(key.url, location.origin);
      appendSearchParamsByEntries(url, Object.entries(key.query));
      url.searchParams.sort();
      return (await fetch(url.toString())).json();
    }
  );

  if (!data) {
    return { records: undefined } as const;
  }
  const records = data.data;

  const update = (
    id: string,
    change: Partial<Omit<UpdateRequestBody, 'id'>>
  ) => {
    const index = records.findIndex((x) => x.id === id);
    mutate(
      { url: '/api/record/read', query: { event, limit: '100' } },
      fetch('/api/record/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...change, id }),
      }).then(
        async (res) =>
          ({
            data: [
              ...records.slice(0, index),
              await res.json(),
              ...records.slice(index + 1),
            ],
          } satisfies RecordReadApiResponse)
      ),
      {
        optimisticData: {
          data: [
            ...records.slice(0, index),
            { ...records[index], ...change },
            ...records.slice(index + 1),
          ],
        } satisfies RecordReadApiResponse,
        rollbackOnError: true,
      }
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
            ({
              data: [await res.json(), ...records],
            } satisfies RecordReadApiResponse)
        ),
        {
          optimisticData: {
            data: [
              {
                ...record,
                id: 'temp',
                createdAt: new Date(record.createdAt).toISOString(),
              },
              ...records,
            ],
          } satisfies RecordReadApiResponse,
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
        { url: '/api/record/read', query: { event, limit: '100' } },
        fetch('/api/record/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id } satisfies DeleteRequestBody),
        }).then(
          () =>
            ({
              data: [...records.slice(0, index), ...records.slice(index + 1)],
            } satisfies RecordReadApiResponse)
        ),
        {
          optimisticData: {
            data: [...records.slice(0, index), ...records.slice(index + 1)],
          } satisfies RecordReadApiResponse,
          rollbackOnError: true,
        }
      );
    },
    restoreDeletedRecord: (record: Omit<TimerRecord, 'id'>) => {
      mutate(
        { url: '/api/record/read', query: { event, limit: '100' } },
        fetch('/api/record/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        }).then(
          async (res) =>
            ({
              data: [await res.json(), ...records],
            } satisfies RecordReadApiResponse)
        ),
        {
          optimisticData: {
            data: [{ ...record, id: 'temp' }, ...records],
          } satisfies RecordReadApiResponse,
          rollbackOnError: true,
        }
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
    'currentEvent'
  );
  const scrambleHistory = useScrambleHistory(currentEvent);

  if (!isLoading && !user) {
    redirect('/anonymous');
    return null;
  }
  return (
    <TimerPageWithSWR
      {...scrambleHistory}
      {...{ currentEvent, setCurrentEvent }}
    />
  );
};

export default TimerPage;

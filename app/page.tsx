'use client';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Dispatch, FC, SetStateAction } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import 'pure-react-carousel/dist/react-carousel.es.css';
import { TimerRecord } from './types/TimerRecord';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import { useScrambleHistory } from './hooks/useScrambleHistory';
import { TimerPagePresenter } from './components/TimerPagePresenter';
import { redirect } from 'next/navigation';

type RecordReadApiResponse = {
  data: TimerRecord[];
};

const useTimerRecords = (event: string) => {
  const { mutate } = useSWRConfig();
  const { data, error } = useSWR<RecordReadApiResponse>(
    `/api/record/read?event=${event}`,
    async (key) => {
      const url = new URL(key, location.origin);
      url.searchParams.append('limit', '100');
      return (await fetch(url.toString())).json();
    }
  );

  if (!data) {
    return { records: undefined } as const;
  }
  const records = data.data;

  const update = (id: string, change: Partial<TimerRecord>) => {
    const index = records.findIndex((x) => x.id === id);
    mutate(
      `/api/record/read?event=${event}`,
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
    createNewRecord: (
      record: Omit<TimerRecord, 'id' | 'createdAt'> & { createdAt: number }
    ) => {
      mutate(
        `/api/record/read?event=${event}`,
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
        `/api/record/read?event=${event}`,
        fetch('/api/record/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
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
        `/api/record/read?event=${event}`,
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

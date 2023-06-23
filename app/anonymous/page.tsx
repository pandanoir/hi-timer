'use client';
import { FC, useState } from 'react';
import 'pure-react-carousel/dist/react-carousel.es.css';
import { TimerRecord } from '../_types/TimerRecord';
import { useLocalStorageState } from '../(root)/useLocalStorageState';
import { useScrambleHistory } from '../(root)/useScrambleHistory';
import { TimerPagePresenter } from '../(root)/TimerPagePresenter';

const useTimerRecords = (event: string) => {
  const [allRecords, setAllRecords] = useState<Record<string, TimerRecord[]>>({
    [event]: [],
  });
  if (typeof allRecords[event] === 'undefined') {
    allRecords[event] = [];
  }
  const records = allRecords[event];

  const update = (id: string, change: Partial<TimerRecord>) => {
    const index = records.findIndex((x) => x.id === id);
    setAllRecords((allRecords) => {
      const records = allRecords[event];
      return {
        ...allRecords,
        [event]: [
          ...records.slice(0, index),
          { ...records[index], ...change },
          ...records.slice(index + 1),
        ],
      };
    });
  };
  return {
    records,
    error: undefined,
    createNewRecord: (
      record: Omit<TimerRecord, 'id' | 'createdAt'> & { createdAt: number }
    ) => {
      setAllRecords((allRecords) => {
        const records = allRecords[event];
        return {
          ...allRecords,
          [event]: [
            {
              ...record,
              id:
                records.length === 0
                  ? '0'
                  : `${Number(records[records.length - 1].id) + 1}`,
              createdAt: new Date(record.createdAt).toISOString(),
            },
            ...records,
          ],
        };
      });
    },
    imposePenalty: ({ id }: TimerRecord) => {
      update(id, { penalty: true });
    },
    toDNF: ({ id }: TimerRecord) => {
      update(id, { dnf: true });
    },
    undoPenalty: ({ id }: TimerRecord) => {
      update(id, { penalty: false });
    },
    undoDNF: ({ id }: TimerRecord) => {
      update(id, { dnf: false });
    },
    deleteRecord: ({ id }: TimerRecord) => {
      const index = records.findIndex((x) => x.id === id);
      setAllRecords((allRecords) => {
        const records = allRecords[event];
        return {
          ...allRecords,
          [event]: [...records.slice(0, index), ...records.slice(index + 1)],
        };
      });
    },
    restoreDeletedRecord: (record: Omit<TimerRecord, 'id'>) => {
      setAllRecords((allRecords) => {
        const records = allRecords[event];
        return {
          ...allRecords,
          [event]: [
            {
              ...record,
              id:
                records.length === 0
                  ? '0'
                  : `${Number(records[records.length - 1].id) + 1}`,
            },
            ...records,
          ],
        };
      });
    },
  } as const;
};
const TimerPage: FC = () => {
  const [currentEvent, setCurrentEvent] = useLocalStorageState(
    '3x3x3',
    'currentEvent'
  );

  return (
    <TimerPagePresenter
      isAnonymousMode
      {...useTimerRecords(currentEvent)}
      {...useScrambleHistory(currentEvent)}
      currentEvent={currentEvent}
      setCurrentEvent={setCurrentEvent}
    />
  );
};

export default TimerPage;
